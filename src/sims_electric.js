const {C,rgba,clamp,dist,$,fmt,sup,pct,text,circle,glow,shade,poly,rr,box,marble,readout,arrow,rng,at,makeSim,hook,slide}=Chalk;
const nf=v=>Math.round(v).toLocaleString('en-US');
const group=(attr,fn)=>document.querySelectorAll(`[${attr}]`).forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll(`[${attr}]`).forEach(x=>x.classList.toggle('is-on',x===b));fn(parseFloat(b.getAttribute(attr)))}));
function bulb(ctx,x,y,r,k){glow(ctx,x,y,r*3.2,C.yellow,.55*k);circle(ctx,x,y,r,rgba(C.yellow,.15+.85*k),C.chalk,2);box(ctx,x-r*.4,y+r*.8,r*.8,r*.5,C.chalk,null,2);if(k<.05)text(ctx,'off',x,y,{size:r,alpha:.5})}
function battery(ctx,x,y,w,h,level,label){box(ctx,x,y,w,h,null,C.chalk,6,2);box(ctx,x+w*.35,y-8,w*.3,8,C.chalk,null,2);if(level>0)box(ctx,x+4,y+4+(h-8)*(1-level),w-8,(h-8)*level,rgba(C.green,.8),null,3);if(label)text(ctx,label,x+w/2,y+h+18,{size:16,alpha:.8})}
function flow(ctx,pts,n,phase,color,r=3){const segs=[];let L=0;for(let i=1;i<pts.length;i++){const d=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);segs.push([pts[i-1],pts[i],d]);L+=d}for(let k=0;k<n;k++){let s=((k/n+phase)%1+1)%1*L;for(const[a,b,d]of segs){if(s<=d){const t=s/d;circle(ctx,a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,r,color);break}s-=d}}}

/* ---------- CH1: watts and watt-hours: pedal power ---------- */
/* Your legs are the power station. Pedalling rate is watts; the battery bucket counts watt-hours. */
const sfx=Chalk.sfx;
const LOADS=[{n:'LED bulb',w:10},{n:'phone charger',w:15},{n:'old light bulb',w:60},{n:'TV',w:100},{n:'blender',w:400},{n:'toaster',w:900}];
const GOALS=[{load:0,t:4,say:'light the LED'},{load:2,t:4,say:'light the old bulb'},{load:3,t:4,say:'run the TV'},{load:5,t:8,say:'try the toaster',tryit:true},{bucket:15,say:'fill the battery with 15 Wh'}];
const EFF=.8,BUCKET_ACCEL=60;
const en=makeSim('cv-energy',{
  init(s){s.xray=false;try{s.xray=localStorage.getItem('chalk:xray')==='1'}catch(e){}s.reset(s)},
  reset(s){s.load=0;s.cad=0;s.strokes=[];s.last=null;s.lastT=0;s.stam=1;s.Ph=0;s.Pe=0;s.lit=0;s.goal=0;s.gt=0;s.wh=0;s.crank=0;s.sweat=[];s.pops=[];s.tried=false;s.bulbLit=false;s.full=false;s.best=0},
  pedal(s,key){const now=s.t;if(key===s.last&&now-s.lastT<.35)return;s.last=key;s.lastT=now;s.strokes.push(now);if(!s.stroked){s.stroked=true}},
  pop(s,t,color,size=22){s.pops.push({t,color,size,age:0})},
  step(dt,s){s.strokes=s.strokes.filter(t=>s.t-t<1.2);const rate=s.strokes.length/1.2;s.cad+=(rate-s.cad)*Math.min(1,dt*3);
    const want=12.5*s.cad*s.cad,cap=120+400*s.stam;s.Ph=Math.min(want,cap);
    if(s.Ph>150)s.stam=Math.max(0,s.stam-(s.Ph-150)/1200*dt);else if(s.Ph<100)s.stam=Math.min(1,s.stam+.12*dt);
    s.Pe=s.Ph*EFF;s.best=Math.max(s.best,s.Pe);s.crank+=s.cad*dt*Math.PI;
    const G=GOALS[Math.min(s.goal,GOALS.length-1)];const L=LOADS[s.load].w;s.lit=clamp(s.Pe/L,0,1);
    const surplus=Math.max(0,s.Pe-(G.bucket?0:L));if(G.bucket)s.wh+=s.Pe*dt*BUCKET_ACCEL/3600;
    if(s.goal<GOALS.length){if(G.bucket){if(s.wh>=G.bucket){s.full=true;s.advance(s,`15 Wh in the bucket!`)}}else if(s.load===G.load){if(G.tryit?s.cad>1:s.lit>=.97){s.gt+=dt;if(s.gt>=G.t){if(G.tryit){s.tried=true;s.advance(s,'the toaster wins')}else{if(G.load===2)s.bulbLit=true;s.advance(s,LOADS[G.load].n+' on!')}}}else s.gt=Math.max(0,s.gt-dt*.5)}}
    if(s.stam<.35&&s.cad>1&&Math.random()<dt*4)s.sweat.push({x:0,y:0,vx:(Math.random()-.5)*30,vy:-40,age:0});for(const d of s.sweat){d.age+=dt;d.vy+=160*dt;d.x+=d.vx*dt;d.y+=d.vy*dt}s.sweat=s.sweat.filter(d=>d.age<.6);
    for(const q of s.pops)q.age+=dt;s.pops=s.pops.filter(q=>q.age<2.4)},
  advance(s,msg){s.goal++;s.gt=0;sfx(s.goal>=GOALS.length?'big':'park');Chalk.flash(s,msg,C.yellow,.07);const N=GOALS[s.goal];if(N&&N.load!=null)s.pop(s,'next: '+N.say+'. Use ▲ ▼ to pick it',C.chalk,18);else if(N)s.pop(s,'next: '+N.say,C.chalk,18)},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const floor=h*.84,L=LOADS[s.load];
    if(s.lit>0){ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(w*.74,h*.45,0,w*.74,h*.45,w*.55);g.addColorStop(0,`rgba(246,212,107,${.16*s.lit*Math.min(1,L.w/60)})`);g.addColorStop(1,'rgba(246,212,107,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.restore()}
    poly(ctx,[[0,floor],[w,floor]],C.chalk,2,.35);
    // the bike: a trainer stand, a flywheel and a rider whose legs follow your rhythm
    const bx=w*.26,wr=Math.min(w,h)*.11,wy=floor-wr-6;circle(ctx,bx+wr*1.6,wy,wr,null,C.chalk,2.5);for(let i=0;i<6;i++){const a=s.crank*2+i*Math.PI/3;poly(ctx,[[bx+wr*1.6,wy],[bx+wr*1.6+Math.cos(a)*wr,wy+Math.sin(a)*wr]],C.chalk,1,.5)}
    poly(ctx,[[bx-wr*.9,floor],[bx,wy-wr*.2],[bx+wr*1.6,wy]],C.chalk,3,.9);poly(ctx,[[bx,wy-wr*.2],[bx-wr*.1,wy-wr*1.2]],C.chalk,3,.9);poly(ctx,[[bx+wr*1.6,wy],[bx+wr*1.2,wy-wr*1.3],[bx+wr*1.5,wy-wr*1.35]],C.chalk,3,.9);poly(ctx,[[bx-wr*.9,floor],[bx+wr*2.4,floor]],C.chalk,3,.6);
    const crx=bx+wr*.2,cry=wy+wr*.1,cl=wr*.38,p1={x:crx+Math.cos(s.crank)*cl,y:cry+Math.sin(s.crank)*cl},p2={x:crx-Math.cos(s.crank)*cl,y:cry-Math.sin(s.crank)*cl};circle(ctx,crx,cry,cl*.35,null,C.chalk,2);
    const hip={x:bx-wr*.1,y:wy-wr*1.25},sh={x:bx+wr*.6,y:wy-wr*2.3},hd={x:sh.x+wr*.3,y:sh.y-wr*.45};const knee=(f)=>{const mx=(hip.x+f.x)/2,my=(hip.y+f.y)/2;return{x:mx+wr*.35,y:my-wr*.25}};
    ctx.save();ctx.strokeStyle=C.chalk;ctx.lineWidth=3;ctx.lineCap='round';for(const f of[p1,p2]){const k=knee(f);ctx.beginPath();ctx.moveTo(hip.x,hip.y);ctx.lineTo(k.x,k.y);ctx.lineTo(f.x,f.y);ctx.stroke()}ctx.beginPath();ctx.moveTo(hip.x,hip.y);ctx.lineTo(sh.x,sh.y);ctx.lineTo(bx+wr*1.25,wy-wr*1.32);ctx.stroke();ctx.restore();circle(ctx,hd.x,hd.y,wr*.28,C.board,C.chalk,3);
    for(const d of s.sweat)circle(ctx,hd.x+d.x,hd.y+d.y,2,C.blue);
    // wire from the flywheel to the load, dots flow with the watts
    const lx=w*.74,ly=h*.42;const path=[[bx+wr*1.6,wy],[bx+wr*2.6,wy],[bx+wr*2.6,ly+40],[lx-50,ly+40]];poly(ctx,path,C.chalk,2,.4);if(s.Pe>1)flow(ctx,path,Math.max(1,Math.round(Math.min(s.Pe,600)/40)),s.t*(.3+s.Pe/300),C.yellow);
    // the load
    if(L.n==='TV'){box(ctx,lx-44,ly-30,88,60,s.lit>.97?rgba(C.blue,.35):rgba(C.board,.8),C.chalk,6,2.5);if(s.lit>.3)for(let i=0;i<12;i++){const yy=ly-24+((i*7+s.t*60)%48);poly(ctx,[[lx-38,yy],[lx+38,yy]],C.chalk,1,.12+.3*s.lit*Math.random())}}
    else if(L.n==='toaster'||L.n==='blender'){box(ctx,lx-38,ly-24,76,52,rgba(C.board,.8),C.chalk,10,2.5);for(let i=0;i<4;i++)poly(ctx,[[lx-26+i*17,ly-14],[lx-26+i*17,ly+16]],s.lit>.05?`rgba(255,${Math.round(90+120*s.lit)},60,${.3+.7*s.lit})`:C.chalk,2.5,s.lit>.05?1:.3);if(L.n==='blender')text(ctx,'blender',lx,ly+44,{size:12,alpha:0})}
    else if(L.n==='phone charger'){box(ctx,lx-18,ly-34,36,64,rgba(C.board,.8),C.chalk,6,2.5);box(ctx,lx-12,ly+18-44*s.lit,24,44*s.lit,rgba(C.green,.6),null,2)}
    else bulb(ctx,lx,ly,L.w>=60?26:18,s.lit);
    text(ctx,`${L.n}: ${L.w} W`,lx,ly+68,{size:17});text(ctx,'▲ ▼ to change',lx,ly+88,{size:13,alpha:.5});
    if(L.w>s.Pe&&s.cad>1&&L.w>=400)text(ctx,`needs ${L.w} W · you make ${Math.round(s.Pe)} W`,lx,ly-54,{size:15,color:C.pink});
    // power meter and the battery bucket
    const mx=w*.06,my=h*.14,mw=w*.34;box(ctx,mx,my,mw,12,rgba(C.board,.6),C.chalk,6,1.5);box(ctx,mx+1,my+1,(mw-2)*clamp(s.Pe/500,0,1),10,s.Pe>L.w?C.green:C.yellow,null,5);const tick=mx+mw*clamp(L.w/500,0,1);poly(ctx,[[tick,my-5],[tick,my+17]],C.pink,2,L.w<=500?1:0);
    text(ctx,`${Math.round(s.Pe)} W`,mx,my+30,{size:22,align:'left',color:C.yellow});text(ctx,'you, right now',mx+70,my+31,{size:13,align:'left',alpha:.6});
    const stx=mx,sty=my+48;text(ctx,'legs',stx,sty,{size:12,fam:'body',align:'left',alpha:.6});box(ctx,stx+36,sty-5,90,8,null,C.chalk,4,1);box(ctx,stx+37,sty-4,88*s.stam,6,s.stam<.35?C.pink:C.green,null,3);
    const G=GOALS[Math.min(s.goal,GOALS.length-1)];if(G.bucket||s.goal>=GOALS.length){const bw=46,bh=70,bkx=w*.5,bky=h*.2;battery(ctx,bkx,bky,bw,bh,clamp(s.wh/15,0,1),'');text(ctx,`${s.wh.toFixed(1)} Wh`,bkx+bw/2,bky+bh+16,{size:15,color:C.green});if(s.Pe>1&&!s.full)flow(ctx,[[bx+wr*2.6,wy-10],[bkx+bw/2,wy-10],[bkx+bw/2,bky+bh+26]],3,s.t,C.green)}
    const goalTxt=s.goal>=GOALS.length?'every goal done: now just ride':G.say;const prog=G.t?`  ${Math.min(G.t,s.gt).toFixed(0)}/${G.t} s`:'';
    const lines=[`goal: ${goalTxt}${prog}`];if(s.xray&&at('g8'))lines.push(`cadence ${(s.cad*30).toFixed(0)} rpm · legs ${Math.round(s.Ph)} W · generator keeps ${Math.round(EFF*100)}% → ${Math.round(s.Pe)} W`);
    if(s.xray&&at('hs'))lines.push(`the bucket runs 1 min per second: Wh = W × h, so ${Math.round(s.Pe)} W fills 15 Wh in ${s.Pe>1?(15/s.Pe*60).toFixed(0)+' min':'forever'}`);if(s.xray&&at('col'))lines.push('a fit rider holds ~150 W for an hour and bursts to ~500 W for seconds; the legs meter models that');
    readout(ctx,lines,14,h-14-lines.length*17,{size:12});
    s.pops.forEach((q,i)=>{const u=q.age/2.4;text(ctx,q.t,w*.66,h*.24-i*24-u*10,{size:q.size,color:q.color,alpha:u<.75?1:Math.max(0,1-(u-.75)/.25)})});
    if(!s.stroked)text(ctx,'tap ◀ ▶ ◀ ▶ to pedal',bx+wr*.8,floor-wr*3.4,{size:20,color:C.yellow,alpha:.6+.3*Math.sin(s.t*3)})}
});
Chalk.pad(en,{labels:{left:'pedal',right:'pedal',up:'next thing',down:'last thing',b:'x-ray',start:'start over'},help:'Tap <b>◀ ▶ ◀ ▶</b> in turn to pedal: faster rhythm, more watts. <b>▲ ▼</b> picks what you power. <b>B</b> shows the numbers.<span class="keys"> Keys: <kbd>←</kbd> <kbd>→</kbd> in turn, <kbd>↑</kbd> <kbd>↓</kbd>, <kbd>X</kbd>, <kbd>Enter</kbd>.</span>',
  on(k,d){if(!en||!d)return;if(k==='left'||k==='right')en.pedal(en,k);else if(k==='up'||k==='down'){en.load=clamp(en.load+(k==='up'?1:-1),0,LOADS.length-1);en.gt=0;sfx('tick')}else if(k==='b'){en.xray=!en.xray;try{localStorage.setItem('chalk:xray',en.xray?'1':'0')}catch(e){}sfx('blip')}else if(k==='start'){en.reset(en);sfx('blip')}}});

/* ---------- CH2: Ohm ---------- */
const ohm=makeSim('cv-ohm',{
  init(s){s.v=12;s.r=6;s.ph=0},
  step(dt,s){s.ph+=dt*(s.v/s.r)*.12},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const I=s.v/s.r,P=s.v*I;const L=w*.15,R=w*.85,T=h*.22,B=h*.78;
    poly(ctx,[[L,T],[R,T],[R,B],[L,B],[L,T]],C.chalk,2,.7);
    // battery on left
    const bh=clamp(20+s.v*2,20,120);box(ctx,L-16,h*.5-bh/2,32,bh,rgba(C.green,.5),C.chalk,4,2);text(ctx,'+',L,h*.5-bh/2-12,{size:22});text(ctx,`push ${s.v} V`,L,h*.5+bh/2+18,{size:17,alpha:.85});
    // resistor on right
    const rh=clamp(20+s.r*2.5,20,140);ctx.save();ctx.strokeStyle=C.pink;ctx.lineWidth=2.5;ctx.beginPath();const y0=h*.5-rh/2;ctx.moveTo(R,y0);for(let i=0;i<8;i++)ctx.lineTo(R+(i%2?-10:10),y0+rh*(i+.5)/8);ctx.lineTo(R,y0+rh);ctx.stroke();ctx.restore();text(ctx,`opposition ${s.r} Ω`,R,h*.5+rh/2+18,{size:17,alpha:.85});
    bulb(ctx,w*.5,T,22,clamp(P/120,0,1));
    flow(ctx,[[L,B],[L,T],[R,T],[R,B],[L,B]],Math.max(2,Math.round(I*3)),s.ph,C.blue);
    text(ctx,`flow ${I.toFixed(2)} A`,w*.5,B+24,{size:20,color:C.blue});
    const lines=at('g8')?[`I = V ÷ R = ${s.v} ÷ ${s.r} = ${I.toFixed(2)} A`]:[`push ${s.v} V, opposition ${s.r} Ω, flow ${I.toFixed(2)} A`];if(at('hs'))lines.push(`P = V × I = ${P.toFixed(1)} W   (= V²/R = I²R)`);if(at('col'))lines.push(`${s.v} J per coulomb × ${I.toFixed(2)} coulombs per second = ${P.toFixed(1)} J/s`);readout(ctx,lines,16,12,{size:12})}
});
slide('ohm-v',v=>{if(ohm)ohm.v=v},v=>v+' V');slide('ohm-r',v=>{if(ohm)ohm.r=v},v=>v+' Ω');

/* ---------- CH3: power and voltage ---------- */
const AWG=[[15,'14 AWG',.0083],[20,'12 AWG',.0052],[30,'10 AWG',.0033],[55,'6 AWG',.0013],[85,'4 AWG',.00082],[115,'2 AWG',.00051],[150,'1/0 AWG',.00032],[200,'3/0 AWG',.0002],[260,'250 kcmil',.00014]];
const gauge=I=>AWG.find(g=>g[0]>=I*1.25)||[999,'bus bar',.0001];
const pw=makeSim('cv-power',{
  init(s){s.v=12;s.load=1200;s.r=.05;s.ph=0},
  step(dt,s){s.ph+=dt*.3},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const I=s.load/s.v,loss=I*I*s.r,drop=I*s.r;const g=gauge(I);const k=clamp(loss/s.load,0,1);
    box(ctx,w*.06,h*.35,w*.14,h*.3,rgba(C.green,.4),C.chalk,6,2);text(ctx,`${s.v} V source`,w*.13,h*.72,{size:16,alpha:.85});
    const th=clamp(3+I/8,3,26);ctx.save();ctx.lineCap='round';ctx.strokeStyle=rgba(C.pink,k*3);ctx.lineWidth=th+10;ctx.globalAlpha=clamp(k*4,0,.8);ctx.beginPath();ctx.moveTo(w*.2,h*.42);ctx.lineTo(w*.76,h*.42);ctx.moveTo(w*.2,h*.58);ctx.lineTo(w*.76,h*.58);ctx.stroke();ctx.restore();
    poly(ctx,[[w*.2,h*.42],[w*.76,h*.42]],C.chalk,th,.9);poly(ctx,[[w*.2,h*.58],[w*.76,h*.58]],C.chalk,th,.9);
    flow(ctx,[[w*.2,h*.42],[w*.76,h*.42]],Math.max(2,Math.round(I/4)),s.ph,C.blue,2.5);flow(ctx,[[w*.76,h*.58],[w*.2,h*.58]],Math.max(2,Math.round(I/4)),s.ph,C.blue,2.5);
    bulb(ctx,w*.86,h*.5,30,1);text(ctx,`${nf(s.load)} W load`,w*.86,h*.72,{size:16,alpha:.85});
    text(ctx,`${I.toFixed(1)} A in the cable`,w*.48,h*.3,{size:22,color:C.blue});text(ctx,k>.2?'cable running hot':k>.05?'cable warm':'cable cool',w*.48,h*.7,{size:18,color:k>.2?C.pink:C.chalk,alpha:.85});
    const lines=[`I = P ÷ V = ${nf(s.load)} ÷ ${s.v} = ${I.toFixed(1)} A`,`needs ${g[1]} or thicker`];if(at('hs'))lines.push(`loss = I²R = ${I.toFixed(1)}² × ${s.r} = ${loss.toFixed(1)} W (${pct(loss/s.load)}),  drop = ${drop.toFixed(2)} V`);if(at('col'))lines.push('loss ∝ (P/V)²R: four times the volts, one sixteenth the loss');readout(ctx,lines,16,h*.97-lines.length*18,{size:12})}
});
group('data-sysv',v=>{if(pw)pw.v=v});slide('pw-load',v=>{if(pw)pw.load=v},v=>nf(v)+' W');slide('pw-r',v=>{if(pw)pw.r=v},v=>v.toFixed(2)+' Ω');

/* ---------- CH4: real batteries ---------- */
const bt=makeSim('cv-battery',{
  init(s){s.bv=12.8;s.ah=100;s.load=300;s.eff=90;s.reset(s)},
  reset(s){s.wh=s.bv*s.ah;s.hours=0;s.cut=false;s.cutAt=null;s.vt=s.bv},
  step(dt,s){if(s.cut)return;const cap=s.bv*s.ah;const soc=s.wh/cap;const r=.004*(s.bv/3.2);const P=s.load/(s.eff/100);const I=P/s.bv;s.vt=s.bv*(0.92+0.12*soc)-I*r;s.I=I;s.r=r;
    if(s.vt<s.bv*.86||s.wh<=0){s.cut=true;s.cutAt=s.hours;return}const accel=900;s.wh=Math.max(0,s.wh-P*dt*accel/3600);s.hours+=dt*accel/3600},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const cap=s.bv*s.ah;const lvl=s.wh/cap;
    battery(ctx,w*.1,h*.2,w*.16,h*.5,lvl,`${s.bv} V · ${s.ah} Ah = ${nf(cap)} Wh`);
    box(ctx,w*.42,h*.36,w*.16,h*.2,rgba(C.blue,.25),C.chalk,6,2);text(ctx,'inverter',w*.5,h*.46,{size:18});text(ctx,`${s.eff}% efficient`,w*.5,h*.62,{size:15,alpha:.8});
    bulb(ctx,w*.85,h*.46,26,s.cut?0:clamp(s.load/1000,.2,1));text(ctx,`${nf(s.load)} W load`,w*.85,h*.7,{size:16,alpha:.85});
    if(!s.cut){flow(ctx,[[w*.26,h*.46],[w*.42,h*.46]],Math.max(2,Math.round(s.load/100)),s.t*.4,C.blue);flow(ctx,[[w*.58,h*.46],[w*.85-28,h*.46]],Math.max(2,Math.round(s.load/100)),s.t*.4,C.yellow)}
    const ideal=cap/s.load,real=cap*(s.eff/100)/s.load;
    const lines=[`ideal: ${nf(cap)} Wh ÷ ${nf(s.load)} W = ${ideal.toFixed(1)} h`,`real: × ${s.eff}% = ${real.toFixed(1)} h`,`clock: ${s.hours.toFixed(1)} h, ${pct(lvl)} left${s.cut?'  →  BMS cut off at '+s.cutAt.toFixed(1)+' h':''}`];
    if(at('hs'))lines.push(`terminal voltage ${s.vt.toFixed(1)} V (draws ${(s.I||0).toFixed(0)} A, sags ${((s.I||0)*(s.r||0)).toFixed(2)} V)`);if(at('col'))lines.push(`V = V₀ − I·r with r = ${(s.r||0).toFixed(3)} Ω;  cutoff at ${(s.bv*.86).toFixed(1)} V`);readout(ctx,lines,16,h*.97-lines.length*18,{size:12})}
});
group('data-bv',v=>{if(bt){bt.bv=v;bt.reset(bt)}});slide('bt-ah',v=>{if(bt){bt.ah=v;bt.reset(bt)}},v=>v+' Ah');slide('bt-load',v=>{if(bt){bt.load=v;if(bt.cut)bt.reset(bt)}},v=>nf(v)+' W');slide('bt-eff',v=>{if(bt)bt.eff=v},v=>v+'%');hook('bt-reset',()=>bt&&bt.reset(bt));

/* ---------- CH5: series and parallel ---------- */
const sp=makeSim('cv-series',{
  init(s){s.n=3;s.series=true;s.flipped=false},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const V=s.series?3.2*s.n:3.2,AH=s.series?100:100*s.n;
    if(s.series){const cw=Math.min(60,(w-80)/s.n);for(let i=0;i<s.n;i++){const x=w/2-cw*s.n/2+i*cw;box(ctx,x+4,h*.38,cw-8,h*.24,rgba(C.green,.5),C.chalk,5,2);text(ctx,'+',x+cw-14,h*.36,{size:16});if(i<s.n-1)poly(ctx,[[x+cw-4,h*.5],[x+cw+4,h*.5]],C.chalk,3)}text(ctx,'end to end: pushes add',w/2,h*.74,{size:20,alpha:.8})}
    else{const rows=s.n,rh=Math.min(34,(h*.6)/rows);for(let i=0;i<s.n;i++){const y=h*.5-rh*s.n/2+i*rh;box(ctx,w/2-40,y+3,80,rh-6,rgba(C.green,.5),C.chalk,5,2);poly(ctx,[[w/2-60,y+rh/2],[w/2-40,y+rh/2]],C.chalk,2);poly(ctx,[[w/2+40,y+rh/2],[w/2+60,y+rh/2]],C.chalk,2)}poly(ctx,[[w/2-60,h*.5-rh*s.n/2+rh/2],[w/2-60,h*.5+rh*s.n/2-rh/2]],C.chalk,2);poly(ctx,[[w/2+60,h*.5-rh*s.n/2+rh/2],[w/2+60,h*.5+rh*s.n/2-rh/2]],C.chalk,2);text(ctx,'side by side: buckets add',w/2,h*.9,{size:20,alpha:.8})}
    text(ctx,`${s.n} cell${s.n>1?'s':''} × 3.2 V, 100 Ah each  →  ${V.toFixed(1)} V, ${AH} Ah, ${nf(V*AH)} Wh`,w/2,h*.12,{size:20,color:C.yellow});
    if(at('g8'))readout(ctx,[s.series?'series: V adds, same current through each':'parallel: same V, currents (and Ah) add',at('hs')?(s.series?'resistors in series add too: R₁ + R₂':'resistors in parallel: 1/R = 1/R₁ + 1/R₂'):'either way the Wh is the same'],16,12,{size:12})}
});
hook('sp-add',()=>{if(sp)sp.n=Math.min(16,sp.n+1)});hook('sp-remove',()=>{if(sp)sp.n=Math.max(1,sp.n-1)});
hook('sp-series',()=>{if(sp){sp.series=true;$('sp-series').classList.add('is-on');$('sp-parallel').classList.remove('is-on')}});
hook('sp-parallel',()=>{if(sp){sp.series=false;sp.flipped=true;$('sp-parallel').classList.add('is-on');$('sp-series').classList.remove('is-on')}});

/* ---------- CH6: Kirchhoff ---------- */
const kir=makeSim('cv-kirch',{
  init(s){s.iin=3;s.r1=6;s.r2=6;s.ph=0},
  step(dt,s){s.ph+=dt*.25},
  zig(ctx,x,y0,y1,color){ctx.save();ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x,y0);const n=6;for(let i=0;i<n;i++)ctx.lineTo(x+(i%2?-9:9),y0+(y1-y0)*(i+.5)/n);ctx.lineTo(x,y1);ctx.stroke();ctx.restore()},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const rp=s.r1*s.r2/(s.r1+s.r2);const V=s.iin*rp;const i1=V/s.r1,i2=V/s.r2;
    const nx=w*.28,ny=h*.2;poly(ctx,[[nx,h*.06],[nx,ny]],C.chalk,2.5,.8);flow(ctx,[[nx,h*.06],[nx,ny]],Math.max(1,Math.round(s.iin*2)),s.ph*s.iin,C.blue);circle(ctx,nx,ny,5,C.yellow);
    const b1=nx-w*.12,b2=nx+w*.12;poly(ctx,[[nx,ny],[b1,ny+30],[b1,h*.44]],C.chalk,2,.7);poly(ctx,[[nx,ny],[b2,ny+30],[b2,h*.44]],C.chalk,2,.7);s.zig(ctx,b1,ny+40,h*.4,C.pink);s.zig(ctx,b2,ny+40,h*.4,C.pink);
    flow(ctx,[[nx,ny],[b1,ny+30],[b1,h*.44]],Math.max(1,Math.round(i1*2)),s.ph*i1,C.blue);flow(ctx,[[nx,ny],[b2,ny+30],[b2,h*.44]],Math.max(1,Math.round(i2*2)),s.ph*i2,C.blue);
    text(ctx,`${s.iin.toFixed(1)} A in`,nx+50,h*.1,{size:17,color:C.blue,align:'left'});text(ctx,`${i1.toFixed(2)} A`,b1-30,h*.3,{size:16,color:C.blue,align:'right'});text(ctx,`${i2.toFixed(2)} A`,b2+30,h*.3,{size:16,color:C.blue,align:'left'});
    text(ctx,`${i1.toFixed(2)} + ${i2.toFixed(2)} = ${(i1+i2).toFixed(2)} A out`,nx,h*.5,{size:18,color:C.yellow});
    // loop below: 12 V with r1 and r2 in series
    const L=w*.58,R=w*.94,T=h*.62,B=h*.9;poly(ctx,[[L,T],[R,T],[R,B],[L,B],[L,T]],C.chalk,2,.7);box(ctx,L-12,h*.76-18,24,36,rgba(C.green,.5),C.chalk,4,2);text(ctx,'12 V',L,B+18,{size:16,alpha:.85});
    const d1=12*s.r1/(s.r1+s.r2),d2=12*s.r2/(s.r1+s.r2);s.zig(ctx,R,T+10,T+(B-T)*.45,C.pink);s.zig(ctx,R,T+(B-T)*.55,B-10,C.pink);text(ctx,`−${d1.toFixed(1)} V`,R-26,T+(B-T)*.28,{size:15,color:C.pink,align:'right'});text(ctx,`−${d2.toFixed(1)} V`,R-26,T+(B-T)*.75,{size:15,color:C.pink,align:'right'});
    text(ctx,`${d1.toFixed(1)} + ${d2.toFixed(1)} = 12 V`,(L+R)/2,T-14,{size:17,color:C.yellow});
    if(at('g8'))readout(ctx,['KCL: in = out at the fork.  KVL: drops = rises round the loop',at('hs')?`branch voltage = ${s.iin.toFixed(1)} A × ${rp.toFixed(2)} Ω (parallel) = ${V.toFixed(2)} V`:'charge is never lost; energy per charge comes back to zero'],16,h*.97-36,{size:12})}
});
slide('k-in',v=>{if(kir)kir.iin=v},v=>v.toFixed(1)+' A');slide('k-r1',v=>{if(kir)kir.r1=v},v=>v+' Ω');slide('k-r2',v=>{if(kir)kir.r2=v},v=>v+' Ω');

/* ---------- CH7: AC ---------- */
const ac=makeSim('cv-ac',{
  init(s){s.f=60;s.vr=120;s.tt=0},
  step(dt,s){s.tt+=dt},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const vp=s.vr*Math.SQRT2;const x0=40,x1=w*.7,ym=h*.5,A=h*.32;const fv=Math.min(s.f,6);
    poly(ctx,[[x0,ym],[x1,ym]],C.chalk,1,.4);poly(ctx,[[x0,ym-A],[x1,ym-A]],C.pink,1,.6);poly(ctx,[[x0,ym-A/Math.SQRT2],[x1,ym-A/Math.SQRT2]],C.yellow,1,.7);
    text(ctx,`peak ${vp.toFixed(0)} V`,x1+6,ym-A,{size:14,align:'left',color:C.pink});text(ctx,`RMS ${s.vr} V`,x1+6,ym-A/Math.SQRT2,{size:14,align:'left',color:C.yellow});text(ctx,'0 V',x1+6,ym,{size:14,align:'left',alpha:.6});
    const pts=[];for(let x=x0;x<=x1;x+=2){const t=s.tt-(x1-x)/(x1-x0)*(2/fv);pts.push([x,ym-A*Math.sin(2*Math.PI*fv*t)])}poly(ctx,pts,C.chalk,2.2,.95);
    const now=Math.sin(2*Math.PI*fv*s.tt);bulb(ctx,w*.87,h*.75,24,s.f>=25?1:now*now);text(ctx,s.f>=25?'too fast to see':'flicker',w*.87,h*.75+50,{size:15,alpha:.8});
    const lines=[`${s.f} Hz: ${s.f} swings per second${s.f<25?' (slowed so you can see it)':''}`];if(at('g8'))lines.push(`peak = RMS × √2 = ${s.vr} × 1.414 = ${vp.toFixed(0)} V`);if(at('hs'))lines.push(`v(t) = ${vp.toFixed(0)} · sin(2π · ${s.f} · t);  P into 12 Ω = V²rms/R = ${nf(s.vr*s.vr/12)} W`);readout(ctx,lines,16,h*.97-lines.length*18,{size:12})}
});
slide('ac-f',v=>{if(ac)ac.f=v},v=>v+' Hz');group('data-acv',v=>{if(ac)ac.vr=v});

/* ---------- CH8: power factor ---------- */
const pf=makeSim('cv-pf',{
  init(s){s.phi=0},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const x0=40,x1=w*.68,ym=h*.42,A=h*.24;const ph=s.phi*Math.PI/180;const S=1000,P=S*Math.cos(ph),Q=S*Math.sin(ph);
    poly(ctx,[[x0,ym],[x1,ym]],C.chalk,1,.4);
    ctx.save();for(let x=x0;x<=x1;x+=3){const t=(x-x0)/(x1-x0)*2;const v=Math.sin(2*Math.PI*t),i=.7*Math.sin(2*Math.PI*t-ph);const p=v*i;ctx.fillStyle=p>=0?rgba(C.yellow,.35):rgba(C.pink,.45);ctx.fillRect(x,ym,3,-p*A*1.4)}ctx.restore();
    const vp=[],ip=[];for(let x=x0;x<=x1;x+=2){const t=(x-x0)/(x1-x0)*2;vp.push([x,ym-A*Math.sin(2*Math.PI*t)]);ip.push([x,ym-A*.7*Math.sin(2*Math.PI*t-ph)])}poly(ctx,vp,C.chalk,2.2,.95);poly(ctx,ip,C.blue,2.2,.95);
    text(ctx,'voltage',x1+8,ym-A,{size:14,align:'left'});text(ctx,'current',x1+8,ym-A*.7+18,{size:14,align:'left',color:C.blue});text(ctx,'yellow: power delivered   pink: power handed back',x0+(x1-x0)/2,ym+A+22,{size:15,alpha:.75});
    const cx=w*.86,cy=h*.3;if(s.phi>5){poly(ctx,[[cx-16,cy-22],[cx-16,cy+22]],C.chalk,3);poly(ctx,[[cx-6,cy-22],[cx-6,cy+22]],C.chalk,3);text(ctx,'capacitor: current leads',cx-11,cy+42,{size:13,alpha:.8})}else if(s.phi<-5){ctx.save();ctx.strokeStyle=C.chalk;ctx.lineWidth=2.5;ctx.beginPath();for(let i=0;i<4;i++)ctx.arc(cx-24+i*14,cy,7,Math.PI,0);ctx.stroke();ctx.restore();text(ctx,'motor coil: current lags',cx-3,cy+30,{size:13,alpha:.8})}else text(ctx,'heater: in step',cx-3,cy,{size:14,alpha:.8});
    const lines=[`power factor = cos ${s.phi}° = ${Math.cos(ph).toFixed(2)}`,`real ${nf(P)} W of ${S} VA`];if(at('hs'))lines.push(`reactive Q = ${nf(Math.abs(Q))} var${s.phi<0?' (inductive)':s.phi>0?' (capacitive)':''}`);if(at('col'))lines.push('S = VI* = P + jQ;  |S| = √(P² + Q²)');readout(ctx,lines,16,h*.97-lines.length*18,{size:12})}
});
slide('pf-phi',v=>{if(pf)pf.phi=v},v=>v+'°');

/* ---------- CH9: what actually moves ---------- */
const dr=makeSim('cv-drift',{
  init(s){s.i=2;s.on=false;s.pulse=-1;s.es=[];const r=rng(3);for(let k=0;k<60;k++)s.es.push({u:r(),top:k%2===0});s.lit=0},
  flip(s){s.on=true;s.pulse=0},
  step(dt,s){const sp=s.on?s.i*.012:0;for(const e of s.es)e.u=(e.u+sp*dt+1)%1;if(s.pulse>=0){s.pulse+=dt*1.6;if(s.pulse>1){s.pulse=-1;s.lit=1}}},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const L=w*.12,R=w*.86,T=h*.36,B=h*.64;
    box(ctx,L-14,h*.44,28,h*.12,rgba(C.green,.5),C.chalk,4,2);text(ctx,'battery',L,h*.7,{size:15,alpha:.8});
    poly(ctx,[[L,T],[R,T]],C.chalk,12,.9);poly(ctx,[[L,B],[R,B]],C.chalk,12,.9);
    for(const e of s.es){const x=e.top?L+(R-L)*e.u:R-(R-L)*e.u;circle(ctx,x,e.top?T:B,3,C.blue)}
    bulb(ctx,R+22,h*.5,24,s.lit*clamp(s.i/4,.3,1));
    if(s.pulse>=0){const x=L+(R-L)*s.pulse;glow(ctx,x,T,26,C.yellow,.9);glow(ctx,x,B,26,C.yellow,.9);text(ctx,'signal',x,T-24,{size:16,color:C.yellow})}
    if(at('col')&&s.on){for(let x=L+40;x<R-20;x+=48)for(let y=T+28;y<B-10;y+=26)arrow(ctx,x,y,22,0,rgba(C.yellow,.6),1.5);text(ctx,'S = E × H: energy flows here, between the wires',(L+R)/2,B+30,{size:15,color:C.yellow,alpha:.8})}
    const v=s.i*.074;const lines=[s.on?`electrons drift at ${v.toFixed(2)} mm/s (1 mm² copper)`:'switch is off: electrons sit still',s.on?'the signal crossed the room at nearly the speed of light':'flip the switch'];if(at('hs'))lines.push('v = I / (n·q·A)');readout(ctx,lines,16,12,{size:12})}
});
Chalk.bet('dr-bet',{canvas:'cv-drift',placed:'Click.',
  pick(p,api){if(!dr)return;api.busy=true;dr.on=false;dr.lit=0;dr.pulse=-1;const el=$('dr-i');if(el){el.value=2;el.dispatchEvent(new Event('input'))}
    setTimeout(()=>{dr.flip(dr);setTimeout(()=>{Chalk.flash(dr,'0.15 mm per second',C.blue,.2);setTimeout(()=>{api.busy=false;dr.betDone=true;const lv=Chalk.level();
      const head=p==='snail'?'You called it: slower than a snail.':'Slower than a snail.';
      const body=lv==='k5'?'About a sixth of a millimetre every second. One electron would need more than five hours to crawl three metres from the switch to the lamp. The light comes on at once because the wire is already full of electrons: the push races down the wire, not the electrons. Like a hose that is already full of water.':lv==='g8'?'About 0.15 mm every second, so one electron needs more than five hours to crawl three metres from switch to lamp. The wire is already packed with electrons, so the push travels, not the electrons, and the push moves at a good fraction of the speed of light: it crosses the room in about a hundred-millionth of a second.':'v = I/(nqA) = 2 A ÷ (8.5 × 10²⁸ m⁻³ × 1.6 × 10⁻¹⁹ C × 10⁻⁶ m²) ≈ 0.15 mm/s: more than five hours to cover three metres. The energy travels in the field around the wires (the Poynting vector) at a good fraction of c. With household AC the electrons do not even go anywhere: they jiggle back and forth by less than a micrometre.';
      api.say(`<b>${head}</b> ${body}`)},1200)},900)},300)}});
hook('dr-switch',()=>dr&&dr.flip(dr));slide('dr-i',v=>{if(dr)dr.i=v},v=>v+' A');

/* ---------- CH10: the system checker ---------- */
const FUSES=[10,15,20,30,40,50,60,80,100,125,150,175,200,250,300,400];
const sc=makeSim('cv-check',{
  init(s){s.rep=null;s.last=null},
  run(s){const V=parseFloat($('sc-v').value),load=parseFloat($('sc-load').value)||0,surge=parseFloat($('sc-surge').value)||1,wh=parseFloat($('sc-wh').value)||0,eff=(parseFloat($('sc-eff').value)||90)/100,src=parseFloat($('sc-src').value)||0,len=parseFloat($('sc-len').value)||1;
    const I=load/V,Is=load*surge/V;const g=gauge(I);const Rc=g[2]*2*len;const drop=I*Rc;const fuse=FUSES.find(f=>f>=I*1.25)||'custom';
    const rows=[['1 voltage',`${V} V system`],['2 load',`${nf(load)} W continuous, ${nf(load*surge)} W surge`],['3 current',`I = ${nf(load)} ÷ ${V} = ${I.toFixed(1)} A   (surge ${Is.toFixed(0)} A)`],['4 battery',`${nf(wh)} Wh  (= ${(wh/V).toFixed(0)} Ah at ${V} V)`],['5 ideal time',`${nf(wh)} ÷ ${nf(load)} = ${(wh/load).toFixed(2)} h`],['6 with efficiency',`× ${Math.round(eff*100)}% = ${(wh*eff/load).toFixed(2)} h`],['7 charge time',src>0?`${nf(wh)} ÷ ${nf(src)} W = ${(wh/src).toFixed(1)} h ideal, ~${(wh/src/0.75).toFixed(1)} h real`:'no source given'],['8 wire & fuse',`${g[1]} (${(len*2).toFixed(0)} m round trip, drop ${drop.toFixed(2)} V = ${pct(drop/V)}), fuse ${fuse} A`]];
    const warn=[];if(I>100)warn.push(`${I.toFixed(0)} A continuous: consider a higher system voltage`);if(drop/V>.03)warn.push('voltage drop over 3%: shorter or thicker cable');if(Is>2*I)warn.push(`inverter and BMS must allow ${Is.toFixed(0)} A for the surge`);if(wh/load<2)warn.push('under 2 hours of run time');if(load>V*(wh/V)*1&&V<48)warn.push('load exceeds a 1C draw on this battery: check the BMS limit');
    s.rep={rows,warn};s.last={V,load,wh,eff}},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);if(!s.rep){text(ctx,'fill in the numbers and run the checker',w/2,h/2,{size:24,alpha:.7});return}
    const lh=Math.min(28,(h-70)/(s.rep.rows.length+Math.max(1,s.rep.warn.length)+1));let y=22;text(ctx,'system report',16,y,{size:22,align:'left',color:C.yellow});y+=lh;
    for(const[k,v]of s.rep.rows){text(ctx,k,16,y,{size:13,align:'left',fam:'body',color:C.chalk,alpha:.7});text(ctx,v,w*.27,y,{size:14,align:'left',fam:'body'});y+=lh}
    y+=lh*.4;if(s.rep.warn.length)for(const wv of s.rep.warn){text(ctx,'⚠ '+wv,16,y,{size:14,align:'left',fam:'body',color:C.pink});y+=lh}else text(ctx,'✓ no warnings: within limits',16,y,{size:15,align:'left',fam:'body',color:C.green})}
});
hook('sc-run',()=>sc&&sc.run(sc));

Chalk.start({key:'electricity',missions:MISSION_DEFS,unitWhy:UNIT_WHY,checks:Object.assign({e9c:()=>!!(dr&&dr.betDone),
  e1:()=>en&&en.bulbLit,e1b:()=>en&&en.full,e1c:()=>en&&en.tried,
  e2:()=>ohm&&Math.abs(ohm.v/ohm.r-2)<.06,
  e3:()=>pw&&pw.load>=1200&&(pw.load/pw.v)**2*pw.r<50,
  e4:()=>bt&&bt.bv===12.8&&bt.ah===100&&bt.load===300&&bt.eff===90,e4b:()=>bt&&bt.cut&&bt.wh/(bt.bv*bt.ah)>.1,
  e5:()=>sp&&sp.series&&sp.n===4,e5b:()=>sp&&!sp.series&&sp.n===4,
  e6:()=>kir&&kir.r1!==kir.r2,
  e7:()=>ac&&ac.f<=1,
  e8:()=>pf&&Math.abs(Math.cos(pf.phi*Math.PI/180)-.8)<.03,
  e9:()=>dr&&dr.lit>0,
  e10:()=>sc&&sc.last&&sc.last.V===48&&sc.last.load===1200&&sc.last.wh===5120&&Math.abs(sc.last.eff-.9)<.001
},Object.fromEntries(Array.from({length:10},(_,i)=>[`tb${i+1}`,()=>Chalk.checkPassed(`ch${i+1}`)])))});
