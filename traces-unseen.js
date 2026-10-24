/* Traces of the Unseen — homepage-only, keeps original links, translations, and CMS. */
(()=>{
 const nav=document.querySelector('.az-art-nav'),smoke=document.getElementById('az-water-canvas');
 if(!nav||!smoke||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const sections=[...nav.querySelectorAll('.az-art-item')],ctx=smoke.getContext('2d');
 const rnd=n=>{let x=Math.sin(n*127.1+31.7)*43758.5453;return x-Math.floor(x)};
 const noise=(x,y)=>{let a=Math.floor(x),b=Math.floor(y),u=x-a,v=y-b;u=u*u*(3-2*u);v=v*v*(3-2*v);return (rnd(a*29+b*13)*(1-u)+rnd((a+1)*29+b*13)*u)*(1-v)+(rnd(a*29+(b+1)*13)*(1-u)+rnd((a+1)*29+(b+1)*13)*u)*v};
 const sprite=document.createElement('canvas');sprite.width=sprite.height=160;
 const sc=sprite.getContext('2d'),px=sc.createImageData(160,160);
 for(let y=0;y<160;y++)for(let x=0;x<160;x++){
  const nx=(x-80)/80,ny=(y-80)/80,wx=nx+.22*(noise(x*.035,y*.035)-.5),wy=ny+.24*(noise(x*.029+7,y*.029)-.5);
  const d=Math.hypot(wx,wy*.91),n=.48*noise(x*.044,y*.044)+.29*noise(x*.096+19,y*.096)+.23*noise(x*.19,y*.19+31);
  const alpha=Math.max(0,Math.min(1,(1.1-d)*1.4))*Math.max(0,Math.min(1,(n-.27)*2));
  const p=(y*160+x)*4;px.data[p]=px.data[p+1]=px.data[p+2]=238;px.data[p+3]=Math.round(alpha*155);
 }
 sc.putImageData(px,0,0);
 const layers=sections.map((el,k)=>{
  const out=document.createElement('canvas');out.className='az-universe-layer';el.insertBefore(out,el.querySelector('.az-art-title'));
  const art=document.createElement('canvas'),trace=document.createElement('canvas'),mask=document.createElement('canvas');
  return {el,k,out,art,trace,mask,o:out.getContext('2d'),a:art.getContext('2d'),t:trace.getContext('2d'),m:mask.getContext('2d'),w:0,h:0,energy:0,last:null};
 });
 let w=0,h=0,dpr=1,hover=false,lastX=0,lastY=0;
 const trail=[],mouse={x:0,y:0,tx:0,ty:0};
 function resize(){
  w=nav.clientWidth;h=nav.clientHeight;dpr=Math.min(devicePixelRatio||1,2);
  smoke.width=Math.round(w*dpr);smoke.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  layers.forEach(L=>{L.w=Math.round(L.el.clientWidth);L.h=Math.round(L.el.clientHeight);for(const c of [L.out,L.art,L.trace,L.mask]){c.width=L.w;c.height=L.h}});
  if(!mouse.x){mouse.x=mouse.tx=w/2;mouse.y=mouse.ty=h/2}
 }
 resize();addEventListener('resize',resize);
 const move=(x,y)=>{const r=nav.getBoundingClientRect();mouse.tx=x-r.left;mouse.ty=y-r.top;hover=true};
 nav.addEventListener('pointermove',e=>move(e.clientX,e.clientY));
 nav.addEventListener('pointerleave',()=>hover=false);
 nav.addEventListener('touchstart',e=>{if(e.touches.length){move(e.touches[0].clientX,e.touches[0].clientY);mouse.x=mouse.tx;mouse.y=mouse.ty}},{passive:true});
 nav.addEventListener('touchmove',e=>{if(e.touches.length)move(e.touches[0].clientX,e.touches[0].clientY)},{passive:true});
 nav.addEventListener('touchend',()=>hover=false);
 function line(c,points,alpha,width=1){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle='rgba(244,246,255,'+alpha+')';c.lineWidth=width;c.stroke()}
 function universe(L){
  const {a:c,w,h,k}=L;if(!w||!h)return;
  c.clearRect(0,0,w,h);c.fillStyle='#000';c.fillRect(0,0,w,h);
  const cx=w/2,cy=h/2,R=Math.min(w*.36,h*.57);
  L.energy*=.92;c.save();c.translate(cx,cy);c.scale(1+L.energy*.18,1+L.energy*.18);c.translate(-cx,-cy);
  for(let i=0;i<210;i++){const x=cx+(rnd(i*13+k*111)-.5)*w*.96,y=cy+(rnd(i*17+k*79)-.5)*h*.96,z=rnd(i*19+k*31);
   c.fillStyle='rgba(255,255,255,'+(.09+z*.51)+')';c.beginPath();c.arc(x,y,.3+rnd(i*23+k*51)*1.25,0,7);c.fill()}
  if(k===0){
   const halo=c.createRadialGradient(cx,cy,R*.45,cx,cy,R*1.65);
   halo.addColorStop(0,'transparent');halo.addColorStop(.47,'rgba(255,255,255,.13)');halo.addColorStop(.62,'rgba(255,255,255,.025)');halo.addColorStop(1,'transparent');
   c.fillStyle=halo;c.beginPath();c.arc(cx,cy,R*1.65,0,7);c.fill();
   for(let j=0;j<38;j++){const a=j/38*Math.PI*2,r=R*(1.15+rnd(j*29)*.48),x=cx+Math.cos(a)*r*1.5,y=cy+Math.sin(a)*r*.68,len=15+rnd(j*17)*85;line(c,[[x,y],[x+Math.cos(a+.9)*len,y+Math.sin(a+.9)*len]],.13+rnd(j*5)*.52)}
   c.save();c.translate(cx,cy);c.rotate(-.21);
   const g=c.createLinearGradient(-R,0,R,0);g.addColorStop(0,'#020202');g.addColorStop(.37,'#111');g.addColorStop(.5,'#050505');g.addColorStop(.64,'#282828');g.addColorStop(.69,'#030303');g.addColorStop(1,'#000');
   c.fillStyle=g;c.beginPath();c.moveTo(-R*.5,-R*1.08);c.lineTo(R*.56,-R*.75);c.lineTo(R*.75,R*.9);c.lineTo(-R*.63,R*.7);c.closePath();c.fill();
   line(c,[[-R*.5,-R*1.08],[R*.56,-R*.75],[R*.75,R*.9]],.55,1.4);c.restore();
  }else if(k===1){
   const haze=c.createRadialGradient(cx-R*.1,cy,0,cx,cy,R*1.25);haze.addColorStop(0,'rgba(230,235,255,.14)');haze.addColorStop(.36,'rgba(190,195,215,.055)');haze.addColorStop(1,'transparent');
   c.fillStyle=haze;c.fillRect(0,0,w,h);
   for(let j=0;j<35;j++){const pts=[];for(let i=0;i<=90;i++){const t=i/90,a=t*Math.PI*2.2+j*.11,r=R*(.28+j*.019)*(1+.18*Math.sin(a*3+j*.23));pts.push([cx+Math.cos(a)*r*.98+Math.sin(t*8+j)*13,cy+Math.sin(a)*r*.6])}line(c,pts,.06+(.5+.5*Math.sin(j*.41))*.34,j%7===0?1.5:.65)}
  }else{
   for(let j=23;j>=0;j--){const q=j/23,r=R*(.1+q*1.25);c.save();c.translate(cx,cy);c.rotate(q*3.8);c.beginPath();c.ellipse(0,0,r*1.22,r*.55,0,0,7);c.strokeStyle='rgba(255,255,255,'+(.04+(1-q)*.44)+')';c.lineWidth=q>.7?.7:1.2;c.stroke();c.restore()}
   for(let j=0;j<26;j++){const a=j/26*Math.PI*2,r=R*(.18+rnd(j*23)*1.4),x=cx+Math.cos(a)*r*1.3,y=cy+Math.sin(a)*r*.65;line(c,[[cx+Math.cos(a)*R*.13,cy+Math.sin(a)*R*.09],[x,y]],.06+rnd(j*8)*.24);c.fillStyle='rgba(255,255,255,.65)';c.beginPath();c.arc(x,y,rnd(j*41)*1.8+.6,0,7);c.fill()}
  }
  c.restore();
 }
 function render(){
  ctx.clearRect(0,0,w,h);mouse.x+=(mouse.tx-mouse.x)*.16;mouse.y+=(mouse.ty-mouse.y)*.16;
  const vx=mouse.x-lastX,vy=mouse.y-lastY,speed=Math.hypot(vx,vy);
  if((hover&&speed>.7)||speed>1.2){const n=1+Math.min(2,Math.floor(speed/9));for(let j=0;j<n;j++)trail.unshift({x:mouse.x+(Math.random()-.5)*62,y:mouse.y+(Math.random()-.5)*22,life:.75+Math.random()*.25,rad:25+Math.random()*31+Math.min(speed*.6,10),seed:Math.random(),vx,vy,spin:(Math.random()-.5)*1.4})}
  for(let i=trail.length-1;i>=0;i--){const p=trail[i];p.life-=.031;if(p.life<=0){trail.splice(i,1);continue}
   const age=1-p.life,curl=Math.sin(p.seed*5+age*7)*age*30,x=p.x+curl+p.vx*age*.65,y=p.y-age*(17+13*p.seed)+p.vy*age*.25,r=p.rad*(1.08+age*.34);
   ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(p.vy,p.vx)+Math.PI/2+p.spin*.32+age*p.spin*.25);
   ctx.globalAlpha=Math.pow(p.life,1.3)*(.17+p.seed*.13);ctx.drawImage(sprite,-r*.75,-r*1.9,r*1.5,r*3.8);
   ctx.globalAlpha=Math.pow(p.life,1.7)*.095;ctx.drawImage(sprite,-r*.55+9,-r*1.3-12,r*1.1,r*2.6);ctx.restore();
  }
  if(trail.length>90)trail.length=90;ctx.globalAlpha=1;lastX=mouse.x;lastY=mouse.y;
  const navRect=nav.getBoundingClientRect(),scale=smoke.width/Math.max(1,w);
  for(const L of layers){if(!L.w||!L.h)continue;universe(L);
   const r=L.el.getBoundingClientRect(),sx=Math.max(0,Math.round((r.left-navRect.left)*scale)),sy=Math.max(0,Math.round((r.top-navRect.top)*scale)),sw=Math.min(smoke.width-sx,Math.round(L.w*scale)),sh=Math.min(smoke.height-sy,Math.round(L.h*scale));
   if(sw<=0||sh<=0)continue;
   L.m.clearRect(0,0,L.w,L.h);for(let j=0;j<13;j++)L.m.drawImage(smoke,sx,sy,sw,sh,0,0,L.w,L.h);
   L.t.globalCompositeOperation='destination-out';L.t.fillStyle='rgba(0,0,0,.018)';L.t.fillRect(0,0,L.w,L.h);L.t.globalCompositeOperation='source-over';L.t.drawImage(L.mask,0,0);
   L.o.clearRect(0,0,L.w,L.h);L.o.drawImage(L.art,0,0);L.o.globalCompositeOperation='destination-in';L.o.drawImage(L.trace,0,0);L.o.globalCompositeOperation='source-over';
  }
  requestAnimationFrame(render);
 }
 render();
})();