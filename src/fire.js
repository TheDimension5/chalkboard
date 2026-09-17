/* ---------- fire renderer ---------- */
function makeFire(){return{p:[],e:[],s:[]}}
function fireStep(f,dt,x,y,w,k){k=clamp(k,0,1);const spawn=k*(Chalk.lowPower?70:170)*dt;const n=Math.floor(spawn)+(Math.random()<spawn%1?1:0);
  for(let i=0;i<n;i++)f.p.push({x:x+(Math.random()-.5)*w,y:y+(Math.random()-.5)*4,vx:(Math.random()-.5)*18,vy:-(45+Math.random()*70)*(.5+k),sz:(6+Math.random()*9)*(.6+.8*k)*(w/60+.4),age:0,dur:.45+Math.random()*.5,ph:Math.random()*6.3});
  if(Math.random()<k*dt*12)f.e.push({x:x+(Math.random()-.5)*w*.8,y:y-10,vx:(Math.random()-.5)*30,vy:-(60+Math.random()*90),age:0,dur:1+Math.random()*1.5});
  if(Math.random()<k*dt*5)f.s.push({x:x+(Math.random()-.5)*w*.6,y:y-w*(.6+.6*k),vx:(Math.random()-.5)*8,vy:-(15+Math.random()*15),age:0,dur:1.5+Math.random()*1.5,sz:8+Math.random()*10});
  for(const P of f.p){P.age+=dt;P.x+=(P.vx+Math.sin(P.age*9+P.ph)*22)*dt;P.y+=P.vy*dt;P.vy-=20*dt}
  for(const E of f.e){E.age+=dt;E.x+=(E.vx+Math.sin(E.age*5)*20)*dt;E.y+=E.vy*dt;E.vy+=10*dt}
  for(const S of f.s){S.age+=dt;S.x+=(S.vx+Math.sin(S.age*2)*6)*dt;S.y+=S.vy*dt;S.sz+=12*dt}
  f.p=f.p.filter(P=>P.age<P.dur);f.e=f.e.filter(E=>E.age<E.dur);f.s=f.s.filter(S=>S.age<S.dur)}
function fireGlow(ctx,x,y,r,k){if(k<=0)return;ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(255,150,50,${.32*k})`);g.addColorStop(.5,`rgba(255,110,30,${.12*k})`);g.addColorStop(1,'rgba(255,100,20,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.restore()}
function fireDraw(ctx,f,smoke=true){ctx.save();if(smoke)for(const S of f.s){const t=S.age/S.dur;ctx.fillStyle=`rgba(140,140,140,${.16*(1-t)})`;ctx.beginPath();ctx.arc(S.x,S.y,S.sz,0,Math.PI*2);ctx.fill()}
  ctx.globalCompositeOperation='lighter';
  for(const P of f.p){const t=P.age/P.dur;const a=(1-t)*(1-t);const r=P.sz*(1-t*.6);const g=ctx.createRadialGradient(P.x,P.y,0,P.x,P.y,r);g.addColorStop(0,`rgba(255,${Math.round(235-130*t)},${Math.round(160-150*t)},${.9*a})`);g.addColorStop(.45,`rgba(255,${Math.round(140-90*t)},20,${.5*a})`);g.addColorStop(1,'rgba(180,30,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(P.x,P.y,r,0,Math.PI*2);ctx.fill()}
  for(const E of f.e){const t=E.age/E.dur;ctx.fillStyle=`rgba(255,${Math.round(200-150*t)},60,${1-t})`;ctx.beginPath();ctx.arc(E.x,E.y,1.7,0,Math.PI*2);ctx.fill()}ctx.restore()}
function steamStep(f,dt,x,y,w,k){if(!f.v)f.v=[];if(Math.random()<k*dt*8)f.v.push({x:x+(Math.random()-.5)*w,y,vx:(Math.random()-.5)*10,vy:-(20+Math.random()*25),age:0,dur:1.2+Math.random(),sz:5+Math.random()*6});for(const V of f.v){V.age+=dt;V.x+=(V.vx+Math.sin(V.age*3)*8)*dt;V.y+=V.vy*dt;V.sz+=10*dt}f.v=f.v.filter(V=>V.age<V.dur)}
function steamDraw(ctx,f){if(!f.v)return;ctx.save();for(const V of f.v){const t=V.age/V.dur;ctx.fillStyle=`rgba(235,235,240,${.22*(1-t)})`;ctx.beginPath();ctx.arc(V.x,V.y,V.sz,0,Math.PI*2);ctx.fill()}ctx.restore()}
function iron(ctx,x,y,w,h,r=8){const g=ctx.createLinearGradient(x,y,x+w,y);g.addColorStop(0,'#2a2d31');g.addColorStop(.5,'#4a4f55');g.addColorStop(1,'#25282c');rr(ctx,x,y,w,h,r);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='rgba(241,236,223,.55)';ctx.lineWidth=1.5;ctx.stroke()}
function drawStove(ctx,s,x,y,W,H,T,fuel,k,fire,dt){ // x,y = bottom-centre of stove
  const bx=x-W/2,by=y-H;fireGlow(ctx,x,by+H*.62,W*1.3,k);
  for(const lx of[bx+10,bx+W-14])iron(ctx,lx,y-8,6,8,2);
  iron(ctx,bx,by,W,H-8,10);
  const dx=bx+W*.16,dy=by+H*.3,dw=W*.68,dh=H*.46;ctx.save();rr(ctx,dx,dy,dw,dh,6);ctx.clip();ctx.fillStyle='#0d0f10';ctx.fillRect(dx,dy,dw,dh);
  for(let i=0;i<Math.min(Math.ceil(fuel),4);i++){ctx.fillStyle='#6b4a2b';rr(ctx,dx+8+i*(dw-16)/4,dy+dh-14,(dw-16)/4-4,9,3);ctx.fill()}
  fireStep(fire,dt,x,dy+dh-10,dw*.7,k);fireDraw(ctx,fire,false);ctx.restore();
  ctx.strokeStyle='rgba(241,236,223,.6)';ctx.lineWidth=2;rr(ctx,dx,dy,dw,dh,6);ctx.stroke();circle(ctx,dx+dw+8,dy+dh/2,3,'#c9c3b5');
  iron(ctx,x+W*.22,by-H*.5,W*.14,H*.5+4,3);
  const pc=tcol(T);rr(ctx,bx-6,by-10,W+12,12,3);ctx.fillStyle=pc;ctx.fill();ctx.strokeStyle='rgba(241,236,223,.7)';ctx.lineWidth=1.5;ctx.stroke();
  if(T>120){ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(x,by-4,0,x,by-4,W*.7);g.addColorStop(0,`rgba(255,120,40,${clamp((T-120)/150,0,.5)})`);g.addColorStop(1,'rgba(255,80,20,0)');ctx.fillStyle=g;ctx.fillRect(bx-W*.3,by-40,W*1.6,60);ctx.restore()}}
function drawPot(ctx,x,y,pw,ph,T,level,boiling){const g=ctx.createLinearGradient(x-pw/2,0,x+pw/2,0);g.addColorStop(0,'#3a3d42');g.addColorStop(.35,'#8a9098');g.addColorStop(.6,'#5b6168');g.addColorStop(1,'#2e3135');rr(ctx,x-pw/2,y-ph/2,pw,ph,[4,4,14,14]);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='rgba(241,236,223,.6)';ctx.lineWidth=1.5;ctx.stroke();
  const wl=clamp(level,0,1)*(ph-12);rr(ctx,x-pw/2+5,y+ph/2-5-wl,pw-10,wl,[0,0,10,10]);ctx.fillStyle=`rgba(${Math.round(120+100*clamp((T-20)/80,0,1))},${Math.round(190-40*clamp((T-20)/80,0,1))},240,.55)`;ctx.fill();
  if(boiling){for(let i=0;i<6;i++){const u=((performance.now()/900)+i/6)%1;circle(ctx,x-pw/3+i*pw/7.5,y+ph/2-8-u*wl,2+u*3,`rgba(255,255,255,${.5*(1-u)})`)}}
  rr(ctx,x-pw/2-4,y-ph/2-4,pw+8,8,3);ctx.fillStyle='#6b7178';ctx.fill();ctx.strokeStyle='rgba(241,236,223,.6)';ctx.stroke();ctx.strokeStyle='#8a9098';ctx.lineWidth=4;ctx.beginPath();ctx.arc(x,y-ph/2-8,pw*.3,Math.PI,0);ctx.stroke()}
