const {C,rgba,clamp,dist,$,fmt,sup,pct,text,circle,glow,shade,poly,rr,box,marble,readout,arrow,rng,at,makeSim,hook,slide}=Chalk;
const toggle=(id,get,set,label)=>hook(id,()=>{set(!get());const b=$(id);b.classList.toggle('is-on',get());b.setAttribute('aria-pressed',String(get()));b.textContent=label(get())});
const group=(attr,fn)=>document.querySelectorAll(`[${attr}]`).forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll(`[${attr}]`).forEach(x=>x.classList.toggle('is-on',x===b));fn(parseFloat(b.getAttribute(attr)))}));
const tcol=T=>{const k=clamp((T-20)/180,0,1);return `rgb(${Math.round(120+135*k)},${Math.round(160-80*k)},${Math.round(220-180*k)})`};
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

function flame(ctx,x,y,s,t){for(let i=0;i<3;i++){const ph=t*6+i*2;ctx.beginPath();ctx.fillStyle=rgba(i?C.yellow:C.pink,.7);ctx.ellipse(x+(i-1)*s*.35+Math.sin(ph)*s*.1,y-s*.6,s*.28,s*(.7+.15*Math.sin(ph*1.3)),0,0,Math.PI*2);ctx.fill()}}
const MOD={S:.04,r:2.5,Rm:1.5,Tmax:170};
const modP=dT=>dT>0?(MOD.S*dT)**2/(4*MOD.r):0;

/* ---------- CH1: heat flows downhill ---------- */
const fw=makeSim('cv-flow',{
  init(s){s.k=400;s.src=false;s.sink=false;s.reset(s)},
  reset(s){s.Th=100;s.Tc=20;s.hold=0;s.met=false},
  step(dt,s){const A=.0004,L=.1,Cb=2000;const sub=4,h=dt*8/sub;for(let i=0;i<sub;i++){const Q=s.k*A*(s.Th-s.Tc)/L;s.Th-=Q/Cb*h;s.Tc+=Q/Cb*h;if(s.src)s.Th+=(100-s.Th)*.5*h;if(s.sink)s.Tc+=(20-s.Tc)*.8*h}
    if(Math.abs(s.Th-s.Tc)<2)s.met=true;if(s.src&&s.sink&&s.Th-s.Tc>=50)s.hold+=dt;else s.hold=0},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const bx=w*.18,cx=w*.82,y=h*.5,bw=w*.18,bh=h*.34;
    box(ctx,bx-bw/2,y-bh/2,bw,bh,tcol(s.Th),C.chalk,8,2);box(ctx,cx-bw/2,y-bh/2,bw,bh,tcol(s.Tc),C.chalk,8,2);
    const th=s.k>100?14:s.k>1?9:6;poly(ctx,[[bx+bw/2,y],[cx-bw/2,y]],s.k>100?'#d9a066':s.k>1?'#9aa0a6':'#a0733a',th,.95);
    const Q=s.k*.0004*(s.Th-s.Tc)/.1;const n=clamp(Math.round(Q/8),0,20);for(let i=0;i<n;i++){const u=((s.t*.25*(1+s.k/400))+i/n)%1;circle(ctx,bx+bw/2+(cx-bw/2-bx-bw/2)*u,y-th/2-6,3,C.pink)}
    text(ctx,`${s.Th.toFixed(0)} °C`,bx,y,{size:28,color:C.board});text(ctx,`${s.Tc.toFixed(0)} °C`,cx,y,{size:28,color:C.board});text(ctx,'hot block',bx,y+bh/2+22,{size:16,alpha:.8});text(ctx,'cold block',cx,y+bh/2+22,{size:16,alpha:.8});
    if(s.src)flame(ctx,bx,y+bh/2+40,26,s.t);if(s.sink){ctx.save();ctx.strokeStyle=C.blue;ctx.lineWidth=2.5;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(cx-30,y+bh/2+18+i*9);for(let x=-30;x<=30;x+=6)ctx.lineTo(cx+x,y+bh/2+18+i*9+Math.sin(x/5+s.t*4)*3);ctx.stroke()}ctx.restore()}
    const lines=[`difference ${(s.Th-s.Tc).toFixed(0)} K   heat flow ${Q.toFixed(0)} W`];if(s.met&&!s.src)lines.push('they met: no difference, no flow');if(s.src&&s.sink)lines.push(`difference held for ${s.hold.toFixed(0)} s`);
    if(at('hs'))lines.push(`Q̇ = kA ΔT / L = ${s.k} × 0.0004 × ${(s.Th-s.Tc).toFixed(0)} ÷ 0.1`);if(at('col'))lines.push(`bar resistance L/(kA) = ${(0.1/(s.k*.0004)).toFixed(2)} K/W`);readout(ctx,lines,16,12,{size:12})}
});
group('data-mat',v=>{if(fw)fw.k=v});toggle('fw-src',()=>fw.src,v=>{fw.src=v},v=>'Heater under hot block: '+(v?'on':'off'));toggle('fw-sink',()=>fw.sink,v=>{fw.sink=v},v=>'Water on cold block: '+(v?'on':'off'));hook('fw-reset',()=>fw&&fw.reset(fw));

/* ---------- CH2: boiling water ---------- */
const bl=makeSim('cv-boil',{
  init(s){s.P=800;s.m=1;s.fire=makeFire();s.vapor={};s.reset(s)},
  reset(s){s.T=20;s.steam=0;s.t=0;s.on=false;s.boiledAt=null;s.pred=null;s.err=null},
  go(s){s.reset(s);s.on=true;const pv=parseFloat(($('bl-pred')||{}).value);s.pred=isNaN(pv)?null:pv},
  step(dt,s){if(!s.on)return;const h=dt*10;s.t+=h;const loss=1.5*(s.T-20);const P=Math.max(0,s.P-loss);if(s.T<100){s.T+=P*h/(s.m*4186);if(s.T>=100){s.T=100;s.boiledAt=s.t;if(s.pred!=null)s.err=Math.abs(s.t-s.pred)/s.t}}else{s.steam+=P*h/2.26e6;if(s.steam>=s.m)s.on=false}},
  draw(s){const{ctx,w,h,dt}=s;ctx.clearRect(0,0,w,h);const px=w*.5,py=h*.58,pw=w*.28,ph=h*.28;const k=s.on?clamp(s.P/2500,.15,1):0;
    for(let i=0;i<7;i++)circle(ctx,px-pw*.72+i*pw*.24,h*.9,9,'#3a3f45','rgba(241,236,223,.4)',1.2);
    fireGlow(ctx,px,h*.8,w*.35,k);fireStep(s.fire,dt,px,h*.87,pw*.8,k);fireDraw(ctx,s.fire,true);
    drawPot(ctx,px,py,pw,ph,s.T,clamp((s.m-s.steam)/3,0,1),s.T>=100&&s.on);
    steamStep(s.vapor,dt,px,py-ph/2-14,pw*.6,(s.T>=95&&s.on)?clamp((s.T-95)/5,0,1):0);steamDraw(ctx,s.vapor);
    const tx=w*.12,t0=h*.2,t1=h*.8;box(ctx,tx-6,t0,12,t1-t0,rgba(C.chalk,.08),C.chalk,6,1.5);const fr=clamp(s.T/110,0,1);box(ctx,tx-4,t1-2-(t1-t0-4)*fr,8,(t1-t0-4)*fr,s.T>=100?C.pink:tcol(s.T),null,4);text(ctx,`${s.T.toFixed(0)} °C`,tx,t1+22,{size:20,color:s.T>=100?C.pink:C.chalk});poly(ctx,[[tx-10,t1-(t1-t0)*(100/110)],[tx+10,t1-(t1-t0)*(100/110)]],C.pink,1.5,.8);text(ctx,'boil',tx-16,t1-(t1-t0)*(100/110),{size:12,align:'right',alpha:.6});
    const Qh=s.m*4186*80,tIdeal=Qh/s.P;const lines=[`${s.m} L, ${s.P} W into the pot, clock ${s.t.toFixed(0)} s (10× speed)`];
    if(s.boiledAt)lines.push(`boiled at ${s.boiledAt.toFixed(0)} s${s.err!=null?`, you predicted ${s.pred} s: ${(s.err*100).toFixed(0)}% off`:''}`);if(s.steam>0)lines.push(`${(s.steam*1000).toFixed(0)} mL boiled away`);
    if(at('g8'))lines.push(`to 100 °C needs ${s.m} × 4,186 × 80 = ${(Qh/1000).toFixed(0)} kJ`);if(at('hs'))lines.push(`t = Q/P = ${tIdeal.toFixed(0)} s with no losses; the pot loses heat as it warms`);if(at('col'))lines.push('then 2.26 MJ per kg to boil it away, at a fixed 100 °C');readout(ctx,lines,16,12,{size:12})}
});
hook('bl-go',()=>bl&&bl.go(bl));slide('bl-p',v=>{if(bl)bl.P=v},v=>v+' W');slide('bl-m',v=>{if(bl)bl.m=v},v=>v+' L');

/* ---------- CH3: the wood fire ---------- */
const st=makeSim('cv-stove',{
  init(s){s.air=.6;s.fire=makeFire();s.reset(s)},
  reset(s){s.T=20;s.fuel=0;s.hold=0;s.over=false;s.log=0},
  addLog(s){s.fuel+=1;s.log++},
  step(dt,s){const h=dt*30;const burn=s.fuel>0?Math.min(s.fuel,s.air/3600*h):0;s.fuel-=burn;const P=burn*16e6/h;const loss=15*(s.T-20);s.T+=(P*.5-loss)*h/12000;s.T=Math.max(20,s.T);
    if(s.T>=150&&s.T<=170)s.hold+=dt;else s.hold=0;if(s.T>170)s.over=true;s.P=P},
  draw(s){const{ctx,w,h,dt}=s;ctx.clearRect(0,0,w,h);const k=s.fuel>0?clamp(s.air/1.5,.25,1)*clamp(s.fuel,.3,1):0;
    poly(ctx,[[0,h*.86],[w,h*.86]],C.chalk,2,.35);drawStove(ctx,s,w*.36,h*.86,w*.3,h*.42,s.T,s.fuel,k,s.fire,dt);
    for(let i=0;i<Math.min(6,Math.ceil(s.fuel));i++)void 0;
    const gx=w*.8,gy=h*.5,gr=Math.min(w,h)*.18;circle(ctx,gx,gy,gr,rgba(C.board,.6),C.chalk,2);const a0=Math.PI*.8,a1=Math.PI*2.2;const ang=T=>a0+(a1-a0)*clamp(T/300,0,1);
    ctx.save();ctx.lineWidth=8;ctx.strokeStyle=rgba(C.green,.7);ctx.beginPath();ctx.arc(gx,gy,gr-8,ang(150),ang(170));ctx.stroke();ctx.strokeStyle=rgba(C.pink,.7);ctx.beginPath();ctx.arc(gx,gy,gr-8,ang(170),ang(300));ctx.stroke();ctx.restore();
    const a=ang(s.T);poly(ctx,[[gx,gy],[gx+Math.cos(a)*(gr-14),gy+Math.sin(a)*(gr-14)]],C.chalk,3);circle(ctx,gx,gy,4,C.chalk);text(ctx,`${s.T.toFixed(0)} °C`,gx,gy+gr+22,{size:22,color:s.T>170?C.pink:s.T>=150?C.green:C.chalk});text(ctx,'top plate',gx,gy+gr+42,{size:14,alpha:.7});
    const lines=[`fuel in the box ${s.fuel.toFixed(2)} kg   burning ${s.air} kg/h   fire ${((s.P||0)/1000).toFixed(1)} kW`,s.T>170?'TOO HOT: over 170 °C, a module up here is being damaged':s.T>=150?`in the band: ${s.hold.toFixed(0)} s`:'below the band: add a log or more air'];
    if(at('g8'))lines.push(`16 MJ per kg: ${s.air} kg/h is ${(s.air*16e6/3600/1000).toFixed(1)} kW of heat`);if(at('hs'))lines.push('plate settles where heat in = heat out; about half of the fire reaches the plate here');readout(ctx,lines,16,12,{size:12})}
});
hook('st-log',()=>st&&st.addLog(st));hook('st-reset',()=>st&&st.reset(st));slide('st-air',v=>{if(st)st.air=v},v=>v.toFixed(1)+' kg/h');

/* ---------- CH4: hot side, cold side ---------- */
const SRC={stove:{T:170,Rh:.2,n:'stove top'},fire:{T:400,Rh:.3,n:'camp fire'},exhaust:{T:220,Rh:.3,n:'exhaust pipe'},coffee:{T:70,Rh:3,n:'cup of coffee'},rock:{T:45,Rh:2,n:'sun-warmed rock'},hand:{T:33,Rh:10,n:'your hand'},candle:{T:250,Rh:6,n:'candle'}};
const SNK={air:{T:20,Rc:6,n:'bare in still air'},fins:{T:20,Rc:2,n:'fins in still air'},fan:{T:20,Rc:.5,n:'fins and a fan'},water:{T:15,Rc:.15,n:'pumped water'},ice:{T:0,Rc:.05,n:'ice water'}};
function tegState(srcK,snkK,spacer){const S=SRC[srcK],K=SNK[snkK];const Rh=S.Rh+(spacer?1.2:0);const tot=Rh+MOD.Rm+K.Rc;const Q=(S.T-K.T)/tot;const Th=S.T-Q*Rh,Tc=K.T+Q*K.Rc;const dT=Th-Tc;return{Q,Th,Tc,dT,P:modP(dT),over:Th>MOD.Tmax}}
const tg=makeSim('cv-teg',{
  init(s){s.src='stove';s.snk='water';s.spacer=false;s.best=0;s.handTried=false},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const st=tegState(s.src,s.snk,s.spacer);if(s.src==='hand')s.handTried=true;s.P=st.P;s.over=st.over;if(!st.over)s.best=Math.max(s.best,st.P);
    const cx=w*.5,cy=h*.5,mw=w*.36;box(ctx,cx-mw/2,cy+18,mw,h*.22,tcol(SRC[s.src].T),C.chalk,6,2);text(ctx,SRC[s.src].n+` ${SRC[s.src].T} °C`,cx,cy+18+h*.11,{size:18,color:C.board});
    if(s.spacer)box(ctx,cx-mw/2,cy+4,mw,14,rgba(C.chalk,.3),C.chalk,2,1);
    box(ctx,cx-mw/2,cy-18,mw,22,st.over?C.pink:rgba(C.yellow,.85),C.chalk,3,2);text(ctx,'module',cx,cy-7,{size:16,color:C.board});
    box(ctx,cx-mw/2,cy-18-h*.22,mw,h*.22,tcol(st.Tc),C.chalk,6,2);text(ctx,SNK[s.snk].n+` ${SNK[s.snk].T} °C`,cx,cy-18-h*.11,{size:18,color:C.board});
    text(ctx,`hot face ${st.Th.toFixed(0)} °C`,cx+mw/2+12,cy+2,{size:15,align:'left',color:st.over?C.pink:C.chalk});text(ctx,`cold face ${st.Tc.toFixed(0)} °C`,cx+mw/2+12,cy-22,{size:15,align:'left'});text(ctx,`ΔT ${st.dT.toFixed(0)} K`,cx-mw/2-12,cy-10,{size:18,align:'right',color:C.yellow});
    glow(ctx,w*.12,h*.5,30+st.P*6,C.yellow,clamp(st.P/6,.1,.9));text(ctx,`${st.P.toFixed(st.P<1?2:1)} W`,w*.12,h*.5,{size:30,color:C.yellow});
    const lines=[st.over?`hot face over ${MOD.Tmax} °C: this module would be damaged. Add the spacer or use a cooler source`:`open-circuit ${(MOD.S*st.dT).toFixed(1)} V, matched load ${st.P.toFixed(2)} W, best so far ${s.best.toFixed(2)} W`];
    if(at('g8'))lines.push(`heat through the module ${st.Q.toFixed(0)} W; electricity is ${pct(st.P/Math.max(st.Q,1e-6))} of it`);if(at('hs'))lines.push(`P = (0.04 × ΔT)² / (4 × 2.5) = 1.6e-4 × ΔT²`);if(at('col'))lines.push(`ΔT = ${(SRC[s.src].T-SNK[s.snk].T)} × R_m/(R_h + R_m + R_c) = ${(SRC[s.src].T-SNK[s.snk].T)} × 1.5/(${(SRC[s.src].Rh+(s.spacer?1.2:0)).toFixed(1)} + 1.5 + ${SNK[s.snk].Rc})`);readout(ctx,lines,16,12,{size:12})}
});
['tg-src','tg-sink'].forEach(id=>{const el=$(id);if(el)el.addEventListener('change',()=>{if(tg){tg.src=$('tg-src').value;tg.snk=$('tg-sink').value}})});
toggle('tg-spacer',()=>tg.spacer,v=>{tg.spacer=v},v=>'Spacer: '+(v?'on':'off'));

/* ---------- CH5: Carnot and ZT ---------- */
const cn=makeSim('cv-carnot',{
  init(s){s.th=170;s.tc=0;s.zt=1},
  eff(s){const Th=s.th+273,Tc=s.tc+273;const c=Math.max(0,1-Tc/Th);const g=Math.sqrt(1+s.zt);const f=(g-1)/(g+Tc/Th);return{c,ideal:c*f,real:c*f*.7}},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const e=s.eff(s);s.carnot=e.c;s.real=e.real;const x0=w*.1,x1=w*.9,y=h*.5,bh=h*.22;
    box(ctx,x0,y-bh/2,(x1-x0),bh,rgba(C.pink,.25),C.chalk,6,2);box(ctx,x0,y-bh/2,(x1-x0)*e.c,bh,rgba(C.yellow,.35),null,6);box(ctx,x0,y-bh/2,(x1-x0)*e.real,bh,C.green,null,6);
    text(ctx,'heat in: 100%',x0,y-bh/2-14,{size:15,align:'left',alpha:.8});text(ctx,`Carnot limit ${pct(e.c)}`,x0+(x1-x0)*e.c,y+bh/2+18,{size:16,color:C.yellow,align:e.c>.5?'right':'left'});text(ctx,`electricity ${pct(e.real)}`,x0+2,y,{size:17,color:C.board,align:'left'});text(ctx,'heat through to the water',x1-6,y,{size:16,align:'right',alpha:.9});
    const lines=[`hot ${s.th} °C (${s.th+273} K), cold ${s.tc} °C (${s.tc+273} K): Carnot 1 − ${s.tc+273}/${s.th+273} = ${pct(e.c)}`];
    if(at('g8'))lines.push(`ZT ${s.zt.toFixed(1)}: ideal thermoelectric ${(e.ideal*100).toFixed(1)}%, a real module about ${(e.real*100).toFixed(1)}%`);if(at('hs'))lines.push('η = η_C · (√(1+ZT) − 1)/(√(1+ZT) + T_c/T_h)');if(at('col'))lines.push('ZT = S²σT/κ: only a better material moves the factor');readout(ctx,lines,16,12,{size:12})}
});
slide('cn-th',v=>{if(cn)cn.th=v},v=>v+' °C');slide('cn-tc',v=>{if(cn)cn.tc=v},v=>v+' °C');slide('cn-zt',v=>{if(cn)cn.zt=v},v=>v.toFixed(1));

/* ---------- CH6: match the load ---------- */
const ld=makeSim('cv-load',{
  init(s){s.R=6;s.dT=120;s.n=1;s.boost=false},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const V=s.n*MOD.S*s.dT,r=s.n*MOD.r;const P=R=>V*V*R/((R+r)*(R+r));const Pm=V*V/(4*r);const x0=50,x1=w*.62,y0=h*.15,y1=h*.78;const Rmax=Math.max(12,r*4);const X=R=>x0+R/Rmax*(x1-x0),Y=p=>y1-(p/Pm)*(y1-y0)*.9;
    poly(ctx,[[x0,y0],[x0,y1],[x1,y1]],C.chalk,1.5,.7);const pts=[];for(let R=.05;R<=Rmax;R+=Rmax/200)pts.push([X(R),Y(P(R))]);poly(ctx,pts,C.chalk,2,.9);
    ctx.save();ctx.setLineDash([3,6]);poly(ctx,[[X(r),y0],[X(r),y1]],C.green,1.5,.8);ctx.restore();text(ctx,`sweet spot ${r.toFixed(1)} Ω`,X(r)+6,y0+12,{size:14,align:'left',color:C.green});
    const p=P(s.R);circle(ctx,X(s.R),Y(p),7,C.yellow);text(ctx,`${p.toFixed(2)} W`,X(s.R),Y(p)-18,{size:17,color:C.yellow});text(ctx,'load resistance →',(x0+x1)/2,y1+22,{size:15,alpha:.8});text(ctx,'watts',x0-8,y0-10,{size:14,align:'right',alpha:.8});
    const term=V*s.R/(s.R+r),I=V/(s.R+r);s.P=p;s.usb=s.boost?p*.85:0;s.near=Math.abs(s.R-r)/r<.1;
    const bx=w*.8;box(ctx,bx-60,h*.3,120,h*.3,rgba(C.blue,.15),C.chalk,8,2);text(ctx,s.boost?'boost → 5 V':'plug',bx,h*.38,{size:18});text(ctx,s.boost?`${s.usb.toFixed(2)} W USB`:`${term.toFixed(2)} V   ${I.toFixed(2)} A`,bx,h*.5,{size:20,color:C.yellow});if(s.boost)text(ctx,'85% efficient',bx,h*.57,{size:13,alpha:.7});
    const lines=[`${s.n} module${s.n>1?'s':''} in series at ΔT ${s.dT} K: ${V.toFixed(1)} V open circuit, ${r.toFixed(1)} Ω inside`];if(at('g8'))lines.push(`load ${s.R.toFixed(1)} Ω → terminal ${term.toFixed(2)} V, ${I.toFixed(2)} A, ${p.toFixed(2)} W (max ${Pm.toFixed(2)} W at ${r.toFixed(1)} Ω)`);if(at('hs'))lines.push('P = V²R/(R + r)², maximum at R = r where terminal voltage = V/2');if(at('max'))lines.push(`max efficiency instead at R/r = √(1+ZT) = 1.41 → ${(r*1.41).toFixed(1)} Ω`);readout(ctx,lines,16,12,{size:12})}
});
slide('ld-r',v=>{if(ld)ld.R=v},v=>v.toFixed(1)+' Ω');slide('ld-dt',v=>{if(ld)ld.dT=v},v=>v+' K');slide('ld-n',v=>{if(ld)ld.n=v},v=>String(v));toggle('ld-boost',()=>ld.boost,v=>{ld.boost=v},v=>'Boost to 5 V USB: '+(v?'on':'off'));

/* ---------- CH7: build a heat-power system ---------- */
const SY_SRC={candle:{T:250,Rh:6,n:'candle',fireW:80},camp:{T:170,Rh:.4,n:'camp stove',fireW:1500},wood:{T:170,Rh:.2,n:'wood stove',fireW:5000},propane:{T:170,Rh:.25,n:'propane burner',fireW:3000}};
const SY_COOL={fins:{Rc:2,T:20,n:'fins, no fan',pump:0,tank:0},fan:{Rc:.5,T:20,n:'fins and fan',pump:2,tank:0},tank:{Rc:.15,T:15,n:'20 L tank',pump:2,tank:20},loop:{Rc:.15,T:20,n:'water loop to a radiator',pump:3,tank:1e9}};
const SY_LOAD={phone:{Wh:10,n:'phone',W:0},bank:{Wh:74,n:'power bank',W:0},led:{Wh:50,n:'5 W lamp, 10 h',W:5},fridge:{Wh:0,n:'fridge',W:60}};
const sy=makeSim('cv-sys',{
  init(s){s.rep=null},
  run(s){const S=SY_SRC[$('sy-src').value],Cc=SY_COOL[$('sy-cool').value],L=SY_LOAD[$('sy-load').value],N=parseInt($('sy-n').value,10);
    let Tw=Cc.T,tankJ=0,Wh=0,tOK=null,tankHot=false;const hist=[];const Rh=S.Rh/Math.min(N,4),Rc=Cc.Rc/Math.min(N,4);let over=false,warn=[];
    for(let t=0;t<180;t++){const tot=Rh+MOD.Rm/N+Rc;const Q=(S.T-Tw)/tot;const Th=S.T-Q*Rh,Tc=Tw+Q*Rc;const dT=Math.max(0,Th-Tc);if(Th>MOD.Tmax)over=true;const Pe=Math.min(N*modP(dT),S.fireW*.06);const usb=Math.max(0,Pe*.85-Cc.pump);
      if(Cc.tank&&Cc.tank<1e8){tankJ+=Q*60;Tw=Cc.T+tankJ/(Cc.tank*4186);if(Tw>60)tankHot=true}
      Wh+=usb/60;if(tOK==null&&L.Wh&&Wh>=L.Wh)tOK=t+1;if(t%10===0)hist.push({t,usb,Tw,dT})}
    const last=hist[hist.length-1];const Pmax=Math.max(...hist.map(x=>x.usb));
    if(over)warn.push(`hot face over ${MOD.Tmax} °C: throttle the fire or add a spacer`);if(tankHot)warn.push('tank passed 60 °C: the difference collapsed; use the loop');if(L.W&&Pmax<L.W)warn.push(`${L.n} needs ${L.W} W continuous; you have ${Pmax.toFixed(1)} W`);if(Pmax<.5)warn.push('under half a watt: this heat source is for light, not power');if(Pmax>0&&Pmax<2.5&&L.Wh)warn.push('under 2.5 W: a phone will charge, slowly');
    s.rep={S,Cc,L,N,hist,Wh,tOK,Pmax,warn,tankHot,candle:$('sy-src').value==='candle',hours:L.Wh?L.Wh/Math.max(Pmax,1e-6):null};if(L.n==='phone'&&tOK&&tOK<=240)s.phoneOK=true;if(Cc.tank===20&&!tankHot&&Pmax>=1)s.tankOK=true;if(s.rep.candle)s.candleTried=true},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);if(!s.rep){text(ctx,'choose a fire, modules, cooling and a load, then run',w/2,h/2,{size:22,alpha:.7});return}const R=s.rep;
    const x0=50,x1=w*.55,y0=30,y1=h*.7;const X=t=>x0+t/180*(x1-x0);poly(ctx,[[x0,y0],[x0,y1],[x1,y1]],C.chalk,1.5,.7);const Pm=Math.max(1,R.Pmax*1.15);
    poly(ctx,R.hist.map(p=>[X(p.t),y1-(p.usb/Pm)*(y1-y0)]),C.yellow,2.2,.95);poly(ctx,R.hist.map(p=>[X(p.t),y1-(clamp(p.Tw,0,100)/100)*(y1-y0)]),C.blue,1.6,.8);
    text(ctx,'usable watts',x0+6,y0-10,{size:14,align:'left',color:C.yellow});text(ctx,'water °C',x0+110,y0-10,{size:14,align:'left',color:C.blue});for(const t of [0,60,120,180])text(ctx,t+' min',X(t),y1+16,{size:12,alpha:.7});
    const lines=[`${R.S.n} · ${R.N} modules · ${R.Cc.n}`,`peak ${R.Pmax.toFixed(1)} W usable, ${R.Wh.toFixed(1)} Wh in 3 hours`,R.L.Wh?(R.tOK?`${R.L.n} charged in ${(R.tOK/60).toFixed(1)} h`:`${R.L.n} not charged in 3 h (needs ${R.hours>1e5?'forever':R.hours.toFixed(0)+' h'})`):(R.Pmax>=R.L.W?`${R.L.n} runs`:`${R.L.n} does not run`)];
    if(at('g8'))lines.push(`water ended at ${R.hist[R.hist.length-1].Tw.toFixed(0)} °C`);for(const wv of R.warn)lines.push('⚠ '+wv);readout(ctx,lines,w*.6,y0,{size:12})}
});
hook('sy-run',()=>sy&&sy.run(sy));slide('sy-n',v=>{},v=>String(v));

/* ---------- CH8: Blackout ---------- */
const bo=makeSim('cv-blackout',{
  init(s){s.air=.8;s.fire=makeFire();s.steam={};s.reset(s)},
  reset(s){s.min=0;s.out=false;s.logs=12;s.fuel=0;s.Tp=20;s.Tw=15;s.Tr=18;s.bat=120;s.phoneWh=0;s.phoneDone=false;s.phoneAt=null;s.lamp=true;s.phone=true;s.radio=false;s.fridge=false;s.fridgeTried=false;s.pump=true;s.loop=false;s.over=0;s.dmg=1;s.lampMin=0;s.ended=false;s.dead=false;s.Pe=0;s.usable=0;s.L=0;s.msg='the grid is on. Stock the stove, then cut it.';s.Pf=0},
  cut(s){if(!s.out){s.out=true;s.phoneWh=0;s.phoneDone=false;s.phoneAt=null;s.lampMin=0;s.msg='10 p.m. Grid is out. Outside: −5 °C.'}},
  addLog(s){if(s.logs>0&&s.fuel<4){s.logs--;s.fuel+=1}},
  step(dt,s){if(s.ended)return;const m=dt*10/3;if(s.out){s.min+=m;if(s.min>=480){s.min=480;s.ended=true;s.msg='6 a.m. Dawn.'}}
    const burn=s.fuel>0?Math.min(s.fuel,s.air/60*m):0;s.fuel-=burn;const Pf=burn*16e6/(m*60+1e-9);s.Pf=Pf;
    const Rc=s.pump?.04:.5;const tot=.05+.19+Rc;const Q=Math.max(0,(s.Tp-s.Tw)/tot);const dTm=Q*.19;s.Pe=8*1.6e-4*dTm*dTm*s.dmg;s.usable=Math.max(0,s.Pe*.85-(s.pump?2:0));
    s.Tp+=(0.45*Pf-12*(s.Tp-s.Tr)-Q)*m*60/12000;s.Tp=Math.max(s.Tr,s.Tp);
    if(s.pump){s.Tw+=Q*m*60/(20*4186);if(s.loop){s.Tw+=(35-s.Tw)*(1-Math.exp(-m/15))}}else{s.Tw+=(Q*m*60/(1*4186))-(s.Tw-s.Tr)*.05*m}
    if(s.Tp>170)s.over+=m;if(s.over>5)s.dmg=.5;
    const roomGain=0.45*Pf+(s.loop&&s.pump?Q:0)+(s.out?0:2500);const roomLoss=100*(s.Tr+5);s.Tr+=(roomGain-roomLoss)*m*60/1.5e6;
    const phoneOn=s.phone&&!s.phoneDone;const L=(s.lamp?5:0)+(phoneOn?5:0)+(s.radio?3:0)+(s.fridge?60:0);s.L=L;
    const src=s.out?s.usable:100+s.usable;s.bat=clamp(s.bat+(src-L)*m/60,0,200);
    if(s.bat<=0&&s.out){s.dead=true;if(s.lamp)s.msg='battery empty: the shelf went dark'}else{s.dead=false;if(s.out&&s.lamp)s.lampMin+=m;if(phoneOn){s.phoneWh+=5*m/60;if(s.phoneWh>=10){s.phoneDone=true;s.phoneAt=s.min;s.msg='phone charged'}}}
    if(s.fridge&&s.out)s.fridgeTried=true;if(s.out&&s.Tp>170)s.msg='PLATE OVER 170 °C: modules being damaged';else if(s.out&&s.Tw>60&&s.pump)s.msg='water over 60 °C: the difference is collapsing. Open the loop';else if(s.out&&s.fuel<=0&&!s.ended)s.msg='the fire is out. Add a log'},
  clock(s){const mins=22*60+s.min;const hh=Math.floor(mins/60)%24,mm=Math.floor(mins%60);return `${hh}:${mm<10?'0':''}${mm}`},
  draw(s){const{ctx,w,h,dt}=s;ctx.clearRect(0,0,w,h);const k=clamp(s.Pf/4000,0,1);
    // room darkness and light sources
    ctx.fillStyle=s.out?'rgba(5,8,12,.55)':'rgba(30,36,44,.25)';ctx.fillRect(0,0,w,h);
    // window
    box(ctx,w*.06,h*.08,w*.2,h*.22,'#0a1020','rgba(241,236,223,.6)',4,2);for(let i=0;i<14;i++)circle(ctx,w*.07+((i*37)%(w*.18)),h*.09+((i*53)%(h*.2)),1,`rgba(255,255,255,${.4+.5*Math.sin(s.t/7+i)})`);circle(ctx,w*.21,h*.14,9,'#e8e4d0');poly(ctx,[[w*.16,h*.08],[w*.16,h*.3]],'rgba(241,236,223,.5)',2);poly(ctx,[[w*.06,h*.19],[w*.26,h*.19]],'rgba(241,236,223,.5)',2);
    // floor
    poly(ctx,[[0,h*.86],[w,h*.86]],C.chalk,2,.35);
    // stove
    const sx=w*.3,sy=h*.86;drawStove(ctx,s,sx,sy,w*.2,h*.3,s.Tp,s.fuel,k,s.fire,dt);
    // module + water block on plate
    box(ctx,sx-26,sy-h*.3-22,52,10,rgba(C.yellow,.9),C.chalk,2,1);box(ctx,sx-30,sy-h*.3-40,60,18,rgba(C.blue,.75),C.chalk,3,1);
    // hoses to tank
    const tx=w*.56,ty=h*.6;ctx.save();ctx.strokeStyle=rgba(C.blue,.8);ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(sx+30,sy-h*.3-32);ctx.bezierCurveTo(sx+80,sy-h*.3-40,tx-40,ty-20,tx-22,ty);ctx.moveTo(sx+30,sy-h*.3-28);ctx.bezierCurveTo(sx+90,sy-h*.3-10,tx-40,ty+10,tx-22,ty+18);ctx.stroke();ctx.restore();
    if(s.pump){for(let i=0;i<5;i++){const u=((s.t/2)+i/5)%1;const px=sx+30+(tx-22-sx-30)*u,py=(sy-h*.3-32)*(1-u)+ty*u-Math.sin(u*Math.PI)*25;circle(ctx,px,py,2.5,C.blue)}}
    box(ctx,tx-22,ty-30,44,70,rgba(C.chalk,.06),C.chalk,6,1.5);box(ctx,tx-18,ty+36-60*clamp((s.Tw+10)/110,0,1),36,60*clamp((s.Tw+10)/110,0,1),tcol(s.Tw),null,3);text(ctx,`${s.Tw.toFixed(0)} °C`,tx,ty+56,{size:15});text(ctx,'tank',tx,ty-40,{size:14,alpha:.7});if(s.Tw>60)steamStep(s.steam,dt,tx,ty-30,30,1);steamDraw(ctx,s.steam);
    if(s.loop){box(ctx,tx+40,ty-20,14,50,null,C.chalk,2,1.5);for(let i=0;i<4;i++)poly(ctx,[[tx+40,ty-12+i*12],[tx+54,ty-12+i*12]],C.chalk,1,.6);text(ctx,'radiator',tx+47,ty+44,{size:12,alpha:.7})}
    // battery
    const bxx=w*.8,byy=h*.62;box(ctx,bxx-40,byy-22,80,44,rgba(C.chalk,.06),C.chalk,6,1.5);box(ctx,bxx+40,byy-8,6,16,C.chalk,null,2);box(ctx,bxx-36,byy-18,72*(s.bat/200),36,s.bat<20?C.pink:C.green,null,4);text(ctx,`${s.bat.toFixed(0)} Wh`,bxx,byy+1,{size:16,color:C.board});text(ctx,'battery',bxx,byy+38,{size:14,alpha:.7});
    poly(ctx,[[bxx-40,byy],[tx+22,ty-10]],C.yellow,1.5,s.usable>0?.6:.2);if(s.usable>0){for(let i=0;i<3;i++){const u=((s.t/1.5)+i/3)%1;circle(ctx,tx+22+(bxx-40-tx-22)*(1-u),ty-10+(byy-ty+10)*(1-u),2.5,C.yellow)}}
    // shelf and devices
    const shy=h*.32;poly(ctx,[[w*.58,shy+26],[w*.96,shy+26]],C.chalk,3,.6);
    const dev=[{n:'lamp',on:s.lamp&&!s.dead&&(s.out||true),x:w*.64},{n:'phone',on:s.phone&&!s.phoneDone&&!s.dead,x:w*.73},{n:'radio',on:s.radio&&!s.dead,x:w*.82},{n:'fridge',on:s.fridge&&!s.dead,x:w*.91}];
    for(const d of dev){const x=d.x;if(d.n==='lamp'){if(d.on){ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(x,shy+2,0,x,shy+2,h*.3);g.addColorStop(0,'rgba(255,230,150,.45)');g.addColorStop(1,'rgba(255,220,120,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,shy+2,h*.3,0,Math.PI*2);ctx.fill();ctx.restore()}poly(ctx,[[x-12,shy+20],[x+12,shy+20],[x+5,shy-4],[x-5,shy-4]],C.chalk,1.5,.9);circle(ctx,x,shy+2,6,d.on?C.yellow:rgba(C.chalk,.15))}
      else if(d.n==='phone'){box(ctx,x-9,shy-8,18,32,rgba(C.chalk,.08),C.chalk,4,1.5);box(ctx,x-6,shy-4,12*Math.min(1,s.phoneWh/10),4,s.phoneDone?C.green:C.yellow,null,1);text(ctx,s.phoneDone?'100%':`${Math.round(s.phoneWh*10)}%`,x,shy+12,{size:11,fam:'body'})}
      else if(d.n==='radio'){box(ctx,x-16,shy,32,22,rgba(C.chalk,.08),C.chalk,4,1.5);poly(ctx,[[x+10,shy],[x+18,shy-16]],C.chalk,1.5);if(d.on)for(let i=1;i<=3;i++)circle(ctx,x+18,shy-16,i*6,null,rgba(C.blue,.5-i*.12),1)}
      else{box(ctx,x-14,shy-18,28,42,rgba(C.chalk,.08),C.chalk,4,1.5);poly(ctx,[[x-14,shy-2],[x+14,shy-2]],C.chalk,1);if(d.on)circle(ctx,x+9,shy-10,2.5,C.green)}
      text(ctx,d.n,x,shy+42,{size:13,alpha:.75,color:d.on?C.chalk:rgba(C.chalk,.5)})}
    // wood pile
    for(let i=0;i<s.logs;i++){const r=i%4,c=Math.floor(i/4);box(ctx,w*.06+r*22,h*.84-c*11,20,9,'#6b4a2b','rgba(241,236,223,.5)',3,1)}text(ctx,`${s.logs} logs`,w*.11,h*.94,{size:15,alpha:.8});
    // grid lamp on wall
    circle(ctx,w*.5,h*.1,7,s.out?rgba(C.chalk,.12):C.yellow);text(ctx,s.out?'grid: OUT':'grid: on',w*.5,h*.16,{size:15,color:s.out?C.pink:C.green});
    // HUD
    const lines=[`${s.clock(s)}   outside −5 °C   room ${s.Tr.toFixed(1)} °C   plate ${s.Tp.toFixed(0)} °C   water ${s.Tw.toFixed(0)} °C`,`making ${s.usable.toFixed(1)} W${s.dmg<1?' (modules damaged)':''}   using ${s.L} W   fire ${(s.Pf/1000).toFixed(1)} kW   fuel ${s.fuel.toFixed(1)} kg`,s.msg];
    if(s.ended)lines.push(`DAWN: lamp on ${(s.lampMin/60).toFixed(1)} h of 8 · phone ${s.phoneDone?'charged':'not charged'} · room ${s.Tr.toFixed(0)} °C · logs left ${s.logs} · plate over limit ${s.over.toFixed(0)} min`);
    if(at('hs')&&!s.ended)lines.push(`ΔT across modules ${(Math.max(0,(s.Tp-s.Tw)/(.05+.19+(s.pump?.04:.5))*.19)).toFixed(0)} K → ${s.Pe.toFixed(1)} W raw`);
    readout(ctx,lines,16,12,{size:12})}
});
window.__bo=bo;
hook('bo-cut',()=>{if(bo){bo.cut(bo);$('bo-cut').textContent='Grid is out'}});hook('bo-log',()=>bo&&bo.addLog(bo));slide('bo-air',v=>{if(bo)bo.air=v},v=>v.toFixed(1)+' kg/h');
toggle('bo-pump',()=>bo.pump,v=>{bo.pump=v},v=>'Pump: '+(v?'on':'off'));toggle('bo-loop',()=>bo.loop,v=>{bo.loop=v},v=>'Loop to radiator: '+(v?'on':'off'));
toggle('bo-lamp',()=>bo.lamp,v=>{bo.lamp=v},v=>'Lamp: '+(v?'on':'off'));toggle('bo-phone',()=>bo.phone,v=>{bo.phone=v},v=>'Phone: '+(v?'charging':'unplugged'));toggle('bo-radio',()=>bo.radio,v=>{bo.radio=v},v=>'Radio: '+(v?'on':'off'));toggle('bo-fridge',()=>bo.fridge,v=>{bo.fridge=v},v=>'Fridge: '+(v?'on':'off'));
hook('bo-reset',()=>{if(bo){bo.reset(bo);$('bo-cut').textContent='Cut the grid';for(const[id,v,l]of[['bo-pump',true,'Pump: on'],['bo-loop',false,'Loop to radiator: off'],['bo-lamp',true,'Lamp: on'],['bo-phone',true,'Phone: charging'],['bo-radio',false,'Radio: off'],['bo-fridge',false,'Fridge: off']]){const b=$(id);b.classList.toggle('is-on',v);b.setAttribute('aria-pressed',String(v));b.textContent=l}}});

Chalk.start({key:'heat',missions:MISSION_DEFS,unitWhy:UNIT_WHY,checks:Object.assign({
  ht1:()=>fw&&fw.met,ht1b:()=>fw&&fw.hold>=30,
  ht2:()=>bl&&bl.boiledAt!=null&&bl.m===1,ht2b:()=>bl&&bl.err!=null&&bl.err<=.1,
  ht3:()=>st&&st.hold>=30,ht3b:()=>st&&st.over,
  ht4:()=>tg&&tg.best>=1,ht4b:()=>tg&&tg.best>=3,ht4c:()=>tg&&tg.handTried,
  ht5:()=>cn&&cn.th===170&&cn.tc===0,ht5b:()=>cn&&cn.real>=.10,
  ht6:()=>ld&&ld.near,ht6b:()=>ld&&ld.boost&&ld.usb>=2,
  ht7:()=>sy&&sy.phoneOK,ht7b:()=>sy&&sy.candleTried,ht7c:()=>sy&&sy.tankOK,
  bo1:()=>bo&&bo.ended&&bo.lampMin>=470,bo2:()=>bo&&bo.out&&bo.phoneDone&&bo.phoneAt!=null&&bo.phoneAt<=120,bo3:()=>bo&&bo.ended&&bo.Tr>10,bo4:()=>bo&&bo.ended&&bo.over===0,bo5:()=>bo&&bo.ended&&bo.logs>=2,bo6:()=>bo&&bo.fridgeTried
},Object.fromEntries(Array.from({length:8},(_,i)=>[`tb${i+1}`,()=>Chalk.checkPassed(`ch${i+1}`)])))});
