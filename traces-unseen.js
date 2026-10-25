// Initialize Preview 37 only when its navigation section approaches the viewport.
// This keeps the hero video free of canvas allocation and texture generation at startup.
(function(){
 const nav=document.querySelector('.az-art-nav');
 if(!nav)return;
 let initialized=false;
 const observer=new IntersectionObserver(entries=>{
  if(initialized||!entries.some(entry=>entry.isIntersecting))return;
  initialized=true;
  observer.disconnect();
  initializePreview37();
 },{rootMargin:'100px 0px',threshold:0});
 observer.observe(nav);
 function initializePreview37(){
(function(){
 const nav=document.querySelector('.az-art-nav'), canvas=document.getElementById('az-water-canvas'),ctx=canvas.getContext('2d');
 let w=0,h=0,dpr=1,hover=false,lastX=0,lastY=0;const trail=[];
 const mouse={x:0,y:0,targetX:0,targetY:0};
 // A cloud sprite with fractal turbulence and feathered edges, generated locally.
 const smokeSprite=document.createElement('canvas');smokeSprite.width=smokeSprite.height=160;
 const sc=smokeSprite.getContext('2d'),pixels=sc.createImageData(160,160);
 const hash=(x,y)=>{let n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n)};
 const noise=(x,y)=>{const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;
 const u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
 const a=hash(ix,iy),b=hash(ix+1,iy),c=hash(ix,iy+1),d=hash(ix+1,iy+1);
 return (a+(b-a)*u)*(1-v)+(c+(d-c)*u)*v};
 for(let y=0;y<160;y++)for(let x=0;x<160;x++){
 const nx=(x-80)/80,ny=(y-80)/80;
 const warpX=nx+.22*(noise(x*.035,y*.035)-.5),warpY=ny+.24*(noise(x*.029+7,y*.029)-.5);
 const distance=Math.hypot(warpX,warpY*.91);
 const n=.48*noise(x*.044,y*.044)+.29*noise(x*.096+19,y*.096)+.23*noise(x*.19,y*.19+31);
 const density=Math.max(0,Math.min(1,(1.1-distance)*1.4))*Math.max(0,Math.min(1,(n-.27)*2.0));
 const k=(y*160+x)*4;pixels.data[k]=238;pixels.data[k+1]=238;pixels.data[k+2]=238;pixels.data[k+3]=Math.round(density*155);
 }sc.putImageData(pixels,0,0);
 function resize(){w=nav.clientWidth;h=nav.clientHeight;dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);if(!mouse.x){mouse.x=mouse.targetX=w/2;mouse.y=mouse.targetY=h/2}}
 // Avoid rendering the large smoke canvas while the hero is on screen.
 let navVisible=false, pageVisible=!document.hidden;
 const smokeObserver=new IntersectionObserver(entries=>{
  navVisible=entries[0].isIntersecting;
  if(navVisible&&pageVisible)requestSmokeFrame();
 },{rootMargin:'100px 0px'});
 smokeObserver.observe(nav);
 document.addEventListener('visibilitychange',()=>{
  pageVisible=!document.hidden;
  if(pageVisible&&navVisible)requestSmokeFrame();
 });
 let smokeFramePending=false;
 function requestSmokeFrame(){
  if(smokeFramePending||!navVisible||!pageVisible)return;
  smokeFramePending=true;
  requestAnimationFrame(()=>{
   smokeFramePending=false;
   if(navVisible&&pageVisible)render();
  });
 }
 resize();window.addEventListener('resize',resize);
 function move(x,y){const r=nav.getBoundingClientRect();mouse.targetX=x-r.left;mouse.targetY=y-r.top;hover=true}
 nav.addEventListener('pointermove',e=>move(e.clientX,e.clientY));nav.addEventListener('pointerleave',()=>hover=false);
 nav.addEventListener('touchstart',e=>{if(e.touches.length){move(e.touches[0].clientX,e.touches[0].clientY);mouse.x=mouse.targetX;mouse.y=mouse.targetY}},{passive:true});
 nav.addEventListener('touchmove',e=>{if(e.touches.length)move(e.touches[0].clientX,e.touches[0].clientY)},{passive:true});nav.addEventListener('touchend',()=>hover=false);
 function render(){ctx.clearRect(0,0,w,h);mouse.x+=(mouse.targetX-mouse.x)*.16;mouse.y+=(mouse.targetY-mouse.y)*.16;
 const vx=mouse.x-lastX,vy=mouse.y-lastY,speed=Math.hypot(vx,vy);
 if((hover&&speed>.7)||speed>1.2){const n=1+Math.min(2,Math.floor(speed/9));for(let j=0;j<n;j++){
 const seed=Math.random();trail.unshift({x:mouse.x+(Math.random()-.5)*62,y:mouse.y+(Math.random()-.5)*22,life:.75+Math.random()*.25,rad:25+Math.random()*31+Math.min(speed*.6,10),seed,vx,vy,rotation:Math.random()*6.28,spin:(Math.random()-.5)*1.4});}}
 // Volumetric-looking smoke made from a reusable turbulence texture.
 // No solid stroke: wisps are irregular, layered, and softly dissipate.
 for(let i=trail.length-1;i>=0;i--){
  const p=trail[i];p.life-=.031;
  if(p.life<=0){trail.splice(i,1);continue}
  const age=1-p.life;
  const curl=Math.sin(p.seed*5+age*7)*age*30;
  const x=p.x+curl+p.vx*age*.65,y=p.y-age*(17+13*p.seed)+p.vy*age*.25;
  const r=p.rad*(1.08+age*.34);
  ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(p.vy,p.vx)+Math.PI/2+p.spin*.32+age*p.spin*.25);
  ctx.globalAlpha=Math.pow(p.life,1.3)*(.17+p.seed*.13);
  ctx.drawImage(smokeSprite,-r*.75,-r*1.9,r*1.5,r*3.8);
  ctx.globalAlpha=Math.pow(p.life,1.7)*.095;
  ctx.drawImage(smokeSprite,-r*.55+9,-r*1.3-12,r*1.1,r*2.6);
  ctx.restore();
 }
 if(trail.length>90)trail.length=90;ctx.globalAlpha=1;lastX=mouse.x;lastY=mouse.y;requestSmokeFrame()} 
})();
// DIAGNOSTIC ONLY: the universe rendering and reveal compositing are disabled.
 }
})();
