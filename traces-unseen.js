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
// New secondary layer: independent of the original liquid canvas.
const sections=[...document.querySelectorAll('.az-art-item')];
sections.forEach(el=>{
  el.addEventListener('pointermove',e=>{
    const r=el.getBoundingClientRect();const x=e.clientX-r.left,y=e.clientY-r.top;
    el.classList.add('active');const d=el.querySelector('.dimension');
    d.style.setProperty('--x',x+'px');d.style.setProperty('--y',y+'px');
    const world=el.querySelector('.world');world.style.setProperty('--dx',((x/r.width)-.5)*-36+'px');world.style.setProperty('--dy',((y/r.height)-.5)*-26+'px');
  });
  el.addEventListener('pointerleave',()=>el.classList.remove('active'));
});

// Three original procedural universes, revealed only by the existing smoke interaction.
// Their depth changes gently when the visitor moves; they settle when movement stops.
(function(){
 const items=[...document.querySelectorAll('.az-art-item')];
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const random=(seed)=>{let x=Math.sin(seed*127.1+31.7)*43758.5453;return x-Math.floor(x)};
 const states=items.map((el,k)=>{
  const canvas=el.querySelector('.cosmos'),ctx=canvas.getContext('2d');
  const stars=Array.from({length:210},(_,i)=>({x:random(i*13+k*111),y:random(i*17+k*79),z:.2+random(i*19+k*31)*.8,r:.3+random(i*23+k*51)*1.25}));
  const st={el,canvas,ctx,k,stars,w:0,h:0,zoom:0,energy:0,aimX:.5,aimY:.5,last:null,visible:false};
  function resize(){const r=el.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);st.w=r.width;st.h=r.height;canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
  resize();window.addEventListener('resize',resize);
  function moveUniverse(clientX,clientY){
   const r=el.getBoundingClientRect(),x=clientX-r.left,y=clientY-r.top;
   if(st.last){const d=Math.hypot(x-st.last.x,y-st.last.y);st.energy=clamp(st.energy+d*.004,0,1)}
   st.last={x,y};st.aimX=x/r.width;st.aimY=y/r.height;st.visible=true;
  }
  // Desktop pointer behavior stays unchanged. Mobile touch movement also
  // drives universe depth, just as it already drives the smoke trail.
  el.addEventListener('pointermove',e=>{if(e.pointerType!=='touch')moveUniverse(e.clientX,e.clientY)});
  el.addEventListener('pointerleave',()=>{st.visible=false;st.last=null});
  el.addEventListener('touchstart',e=>{
   if(e.touches.length){st.last=null;moveUniverse(e.touches[0].clientX,e.touches[0].clientY)}
  },{passive:true});
  el.addEventListener('touchmove',e=>{
   if(e.touches.length)moveUniverse(e.touches[0].clientX,e.touches[0].clientY);
  },{passive:true});
  el.addEventListener('touchend',()=>{st.visible=false;st.last=null},{passive:true});
  el.addEventListener('touchcancel',()=>{st.visible=false;st.last=null},{passive:true});
  return st;
 });
 function line(ctx,pts,alpha,width=1){
  ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
  ctx.strokeStyle=`rgba(244,246,255,${alpha})`;ctx.lineWidth=width;ctx.stroke();
 }
 function draw(st){
  const {ctx,w,h,k}=st;if(!w||!h)return;
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#000';ctx.fillRect(0,0,w,h);
  st.energy*=.91;st.zoom+=(st.energy-st.zoom)*.07;
  const cx=w*.5,cy=h*.5,depth=1+st.zoom*.23;
  ctx.save();ctx.translate(cx,cy);ctx.scale(depth,depth);ctx.translate(-cx,-cy);
  // Deep star field: close specks drift farther than distant ones.
  for(const p of st.stars){
   const x=cx+(p.x-.5)*w*(.7+p.z*.48),y=cy+(p.y-.5)*h*(.7+p.z*.48);
   const a=(.10+p.z*.5)*(st.visible?1:.8);
   ctx.fillStyle=`rgba(255,255,255,${a})`;ctx.beginPath();ctx.arc(x,y,p.r,0,Math.PI*2);ctx.fill();
  }
  if(k===0){
   // WORK: impossible celestial architecture; a deep dark monolith with a fragmented halo.
   const R=Math.min(w*.26,h*.43);
   const halo=ctx.createRadialGradient(cx,cy,R*.45,cx,cy,R*1.65);
   halo.addColorStop(0,'rgba(0,0,0,0)');halo.addColorStop(.47,'rgba(255,255,255,.13)');halo.addColorStop(.62,'rgba(255,255,255,.025)');halo.addColorStop(1,'rgba(0,0,0,0)');
   ctx.fillStyle=halo;ctx.beginPath();ctx.arc(cx,cy,R*1.65,0,7);ctx.fill();
   for(let j=0;j<38;j++){
    const a=j/38*Math.PI*2,offset=R*(1.15+random(j*29)*.48);
    const x=cx+Math.cos(a)*offset*1.5,y=cy+Math.sin(a)*offset*.68;
    const len=15+random(j*17)*85;
    line(ctx,[[x,y],[x+Math.cos(a+.9)*len,y+Math.sin(a+.9)*len]],.13+random(j*5)*.52,random(j*11)>.82?2:.7);
   }
   ctx.save();ctx.translate(cx,cy);ctx.rotate(-.21);
   const g=ctx.createLinearGradient(-R,0,R,0);g.addColorStop(0,'#020202');g.addColorStop(.37,'#111');g.addColorStop(.5,'#050505');g.addColorStop(.64,'#282828');g.addColorStop(.69,'#030303');g.addColorStop(1,'#000');
   ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-R*.5,-R*1.08);ctx.lineTo(R*.56,-R*.75);ctx.lineTo(R*.75,R*.9);ctx.lineTo(-R*.63,R*.7);ctx.closePath();ctx.fill();
   line(ctx,[[-R*.5,-R*1.08],[R*.56,-R*.75],[R*.75,R*.9]],.55,1.4);
   ctx.restore();
  }else if(k===1){
   // ABOUT: ethereal memory nebula and fine, floating silk membranes.
   const R=Math.min(w*.38,h*.62);
   const haze=ctx.createRadialGradient(cx-R*.1,cy,0,cx,cy,R*1.25);
   haze.addColorStop(0,'rgba(230,235,255,.14)');haze.addColorStop(.36,'rgba(190,195,215,.055)');haze.addColorStop(1,'rgba(0,0,0,0)');
   ctx.fillStyle=haze;ctx.fillRect(0,0,w,h);
   for(let j=0;j<35;j++){
    const pts=[];
    for(let i=0;i<=90;i++){
     const t=i/90,ang=t*Math.PI*2.2+j*.11;
     const r=R*(.28+j*.019)*(1+.18*Math.sin(ang*3+j*.23));
     pts.push([cx+Math.cos(ang)*r*.98+Math.sin(t*8+j)*13,cy+Math.sin(ang)*r*.6]);
    }
    line(ctx,pts,.06+(.5+.5*Math.sin(j*.41))*.34,j%7===0?1.5:.65);
   }
   for(let j=0;j<8;j++){
    const a=j/8*Math.PI*2;
    const x=cx+Math.cos(a)*R*.75,y=cy+Math.sin(a)*R*.47;
    const gr=ctx.createRadialGradient(x,y,0,x,y,R*.18);gr.addColorStop(0,'rgba(255,255,255,.22)');gr.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=gr;ctx.beginPath();ctx.arc(x,y,R*.18,0,7);ctx.fill();
   }
  }else{
   // CONTACT: a distant wormhole / constellation of connections.
   const R=Math.min(w*.38,h*.61);
   for(let j=23;j>=0;j--){
    const q=j/23,r=R*(.1+q*1.25),a=q*3.8;
    ctx.save();ctx.translate(cx,cy);ctx.rotate(a);
    ctx.beginPath();ctx.ellipse(0,0,r*1.22,r*.55,0,0,Math.PI*2);
    ctx.strokeStyle=`rgba(255,255,255,${.04+(1-q)*.44})`;ctx.lineWidth=q>.7?.7:1.2;ctx.stroke();ctx.restore();
   }
   for(let j=0;j<26;j++){
    const a=j/26*Math.PI*2,r=R*(.18+random(j*23)*1.4);
    const x=cx+Math.cos(a)*r*1.3,y=cy+Math.sin(a)*r*.65;
    line(ctx,[[cx+Math.cos(a)*R*.13,cy+Math.sin(a)*R*.09],[x,y]],.06+random(j*8)*.24);
    ctx.fillStyle='rgba(255,255,255,.65)';ctx.beginPath();ctx.arc(x,y,random(j*41)*1.8+.6,0,7);ctx.fill();
   }
   const voidGlow=ctx.createRadialGradient(cx,cy,0,cx,cy,R*.6);
   voidGlow.addColorStop(0,'rgba(0,0,0,1)');voidGlow.addColorStop(.5,'rgba(0,0,0,.7)');voidGlow.addColorStop(1,'rgba(0,0,0,0)');
   ctx.fillStyle=voidGlow;ctx.beginPath();ctx.arc(cx,cy,R*.6,0,7);ctx.fill();
  }
  ctx.restore();
 }

 const smoke=document.getElementById('az-water-canvas');
 const nav=document.querySelector('.az-art-nav');
 const layers=states.map(st=>{
   const c=document.createElement('canvas');c.className='smoke-universe-reveal';
   st.el.insertBefore(c,st.el.querySelector('.az-art-title'));
   const mask=document.createElement('canvas');
   const trace=document.createElement('canvas');
   return {st,c,ctx:c.getContext('2d'),mask,mctx:mask.getContext('2d'),trace,tctx:trace.getContext('2d'),w:0,h:0};
 });
 function reveal(){
   const navRect=nav.getBoundingClientRect();
   const sourceScale=smoke.width/Math.max(1,nav.clientWidth);
   for(const L of layers){
    // Only composite the section currently visible on screen.
    const bounds=L.st.el.getBoundingClientRect();
    if(bounds.bottom<0||bounds.top>window.innerHeight)continue;
     const {st,c,ctx,mask,mctx,trace,tctx}=L;
     const w=Math.round(st.w),h=Math.round(st.h);
     if(w<1||h<1)continue;
     if(L.w!==w||L.h!==h){L.w=w;L.h=h;c.width=mask.width=trace.width=w;c.height=mask.height=trace.height=h;}
     const rect=st.el.getBoundingClientRect();
     const sx=Math.max(0,Math.round((rect.left-navRect.left)*sourceScale));
     const sy=Math.max(0,Math.round((rect.top-navRect.top)*sourceScale));
     const sw=Math.min(smoke.width-sx,Math.round(st.w*sourceScale));
     const sh=Math.min(smoke.height-sy,Math.round(st.h*sourceScale));
     if(sw<=0||sh<=0)continue;
     mctx.clearRect(0,0,w,h);
     // Accumulate smoke alpha to show details, preserving its irregular contours.
     for(let j=0;j<13;j++)mctx.drawImage(smoke,sx,sy,sw,sh,0,0,w,h);
     // Keep the smoke's exact contours as a lingering powder imprint.
     // Old traces evaporate softly over roughly two seconds; fresh smoke replenishes them.
     tctx.globalCompositeOperation='destination-out';
     tctx.fillStyle='rgba(0,0,0,.018)';
     tctx.fillRect(0,0,w,h);
     tctx.globalCompositeOperation='source-over';
     tctx.drawImage(mask,0,0);
     ctx.clearRect(0,0,w,h);
     ctx.drawImage(st.canvas,0,0,w,h);
     ctx.globalCompositeOperation='destination-in';
     ctx.drawImage(trace,0,0);
     ctx.globalCompositeOperation='source-over';
   }
 }
 // The three universe canvases are expensive; only render when this
 // section is near the viewport. Resume normally when scrolling to it.
 let universeVisible=false,universeFramePending=false;
 const universeObserver=new IntersectionObserver(entries=>{
  universeVisible=entries[0].isIntersecting;
  if(universeVisible&&!document.hidden)requestUniverseFrame();
 },{rootMargin:'100px 0px'});
 universeObserver.observe(nav);
 document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&universeVisible)requestUniverseFrame();
 });
 // Limit expensive reveal compositing to ~20 frames per second.
 let lastRevealTime=0;
 function requestUniverseFrame(){
  if(universeFramePending||!universeVisible||document.hidden)return;
  universeFramePending=true;
  requestAnimationFrame(()=>{
   universeFramePending=false;
   if(!universeVisible||document.hidden)return;
   const now=performance.now();
   if(now-lastRevealTime>=50){
    states.forEach(draw);reveal();lastRevealTime=now;
   }
   requestUniverseFrame();
  });
 }
})();

 }
})();
