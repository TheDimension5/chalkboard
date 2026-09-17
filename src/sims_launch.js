const {C,rgba,clamp,dist,$,fmt,sup,pct,text,circle,glow,shade,poly,rr,box,marble,readout,arrow,rng,at,makeSim,hook,slide}=Chalk;
const G=9.8;
const group=(attr,fn)=>document.querySelectorAll(`[${attr}]`).forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll(`[${attr}]`).forEach(x=>x.classList.toggle('is-on',x===b));fn(parseFloat(b.getAttribute(attr)))}));
const toggle=(id,get,set,label)=>hook(id,()=>{set(!get());const b=$(id);b.classList.toggle('is-on',get());b.setAttribute('aria-pressed',String(get()));b.textContent=label(get())});
function car(ctx,x,y,w,h,color){box(ctx,x-w/2,y-h,w,h*.62,color,null,4);box(ctx,x-w*.3,y-h*1.05,w*.55,h*.45,rgba(color,.7),null,3);circle(ctx,x-w*.3,y,h*.28,C.board,C.chalk,2);circle(ctx,x+w*.3,y,h*.28,C.board,C.chalk,2)}

/* ---------- CH1: pushes and pulls ---------- */
const ps=makeSim('cv-push',{
  init(s){s.F=80;s.m=5;s.mu=.2;s.reset(s)},
  reset(s){s.x=2;s.v=0;s.dir=0;s.hit=false;s.box=[7+Math.random()*5,0];s.box[1]=s.box[0]+1.4;s.push=false},
  ppm(s){return s.w/14},
  down(p,s){s.push=true;s.dir=Math.sign(s.x*s.ppm(s)-p.x)||1},move(p,s){if(s.push)s.dir=Math.sign(s.x*s.ppm(s)-p.x)||s.dir},up(p,s){s.push=false},leave(s){s.push=false},
  step(dt,s){const sub=4,h=dt/sub;for(let k=0;k<sub;k++){const Fp=s.push?s.F*s.dir:0;let fr=0;if(Math.abs(s.v)>1e-3)fr=-Math.sign(s.v)*s.mu*s.m*G;else if(Math.abs(Fp)<=s.mu*s.m*G){s.v=0;continue}const a=(Fp+fr)/s.m;const v0=s.v;s.v+=a*h;if(!s.push&&Math.sign(s.v)!==Math.sign(v0)&&v0!==0)s.v=0;s.x+=s.v*h;if(s.x<.5){s.x=.5;s.v=-s.v*.3}if(s.x>13.5){s.x=13.5;s.v=-s.v*.3}}
    if(!s.push&&Math.abs(s.v)<1e-3&&s.x>s.box[0]&&s.x<s.box[1])s.hit=true},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const P=s.ppm(s),gy=h*.72;
    ctx.save();ctx.globalAlpha=.25+s.mu*.9;ctx.strokeStyle=C.chalk;ctx.lineWidth=3;ctx.setLineDash(s.mu<.08?[]:[2,Math.max(2,10-s.mu*14)]);ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(w,gy);ctx.stroke();ctx.restore();
    box(ctx,s.box[0]*P,gy-6,(s.box[1]-s.box[0])*P,10,rgba(s.hit?C.green:C.yellow,.35),s.hit?C.green:C.yellow,2,2);text(ctx,s.hit?'stopped in the box!':'the box',(s.box[0]+s.box[1])/2*P,gy+22,{size:17,color:s.hit?C.green:C.yellow});
    for(let m=0;m<=14;m+=2)text(ctx,m+' m',m*P,h*.9,{size:13,alpha:.5});
    car(ctx,s.x*P,gy,44,26,C.blue);
    if(s.push)arrow(ctx,s.x*P-s.dir*60,gy-16,s.dir*40,0,C.pink,3);
    const fr=Math.abs(s.v)>1e-3?s.mu*s.m*G:0;
    const lines=at('g8')?[`push ${s.push?s.F+' N':'off'}   friction ${fr.toFixed(1)} N   speed ${Math.abs(s.v).toFixed(2)} m/s`]:[`push: ${s.push?'ON':'off'}    speed: ${Math.abs(s.v).toFixed(1)} m/s`];
    if(at('g8'))lines.push(`a = (push − friction) ÷ mass = ${(((s.push?s.F:0)-fr)/s.m).toFixed(1)} m/s²`);if(at('hs'))lines.push(`friction = μ m g = ${s.mu} × ${s.m} × 9.8;  after you let go, a = −μg = −${(s.mu*G).toFixed(1)} m/s² for any mass`);if(at('col'))lines.push(`stopping distance from here: v²/(2μg) = ${(s.v*s.v/(2*s.mu*G)).toFixed(2)} m`);
    readout(ctx,lines,16,12,{size:12});if(!s.push&&s.v===0&&!s.hit)text(ctx,'press and hold on the floor: the car is pushed away from your finger',w/2,h*.16+ (at('col')?40:at('hs')?22:at('g8')?4:-10),{size:17,alpha:.6})}
});
slide('ps-f',v=>{if(ps)ps.F=v},v=>v+' N');slide('ps-m',v=>{if(ps)ps.m=v},v=>v+' kg');slide('ps-mu',v=>{if(ps)ps.mu=v},v=>v.toFixed(2));hook('ps-reset',()=>ps&&ps.reset(ps));

/* ---------- CH2: everything falls the same ---------- */
const fl=makeSim('cv-fall',{
  init(s){s.g=9.8;s.air=true;s.H=6;s.reset(s)},
  reset(s){s.obj=[{n:'hammer',m:1.3,k:.02,y:s.H,v:0,t:0,down:false,c:C.chalk},{n:'feather',m:.008,k:.03,y:s.H,v:0,t:0,down:false,c:C.pink}];s.going=false},
  drop(s){s.reset(s);s.going=true},
  step(dt,s){if(!s.going)return;for(const o of s.obj){if(o.down)continue;const sub=4,h=dt/sub;for(let k=0;k<sub;k++){const a=s.g-(s.air?o.k*o.v*o.v/o.m:0);o.v+=a*h;o.y-=o.v*h;o.t+=h;if(o.y<=0){o.y=0;o.down=true;break}}}},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const P=h*.72/s.H,gy=h*.86,x0=w*.38,x1=w*.62;
    poly(ctx,[[w*.1,gy],[w*.9,gy]],C.chalk,2,.6);for(let m=0;m<=s.H;m+=2){poly(ctx,[[w*.2,gy-m*P],[w*.24,gy-m*P]],C.chalk,1,.5);text(ctx,m+' m',w*.17,gy-m*P,{size:13,alpha:.6})}
    poly(ctx,[[w*.24,gy],[w*.24,gy-s.H*P]],C.chalk,2,.5);
    const hm=s.obj[0],ft=s.obj[1];box(ctx,x0-14,gy-hm.y*P-30,28,18,C.chalk,null,3);box(ctx,x0-3,gy-hm.y*P-14,6,16,rgba(C.chalk,.7),null,2);
    ctx.save();ctx.strokeStyle=C.pink;ctx.lineWidth=2;ctx.beginPath();const fy=gy-ft.y*P;ctx.moveTo(x1,fy);ctx.quadraticCurveTo(x1+14,fy-14,x1+2,fy-30);ctx.stroke();for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(x1+i*1.5,fy-4-i*4);ctx.lineTo(x1+10+i,fy-8-i*4);ctx.stroke()}ctx.restore();
    const name={9.8:'Earth',1.62:'the Moon',3.71:'Mars',24.8:'Jupiter'}[s.g]||'this world';
    const lines=[`${name}, g = ${s.g} m/s², air ${s.air?'on':'off'}`,`hammer: ${hm.down?hm.t.toFixed(2)+' s':s.going?'falling':'ready'}     feather: ${ft.down?ft.t.toFixed(2)+' s':s.going?'falling':'ready'}`];
    if(hm.down&&ft.down)lines.push(Math.abs(hm.t-ft.t)<.05?'they landed together!':`the feather took ${(ft.t/hm.t).toFixed(1)}× longer: that is the air, not gravity`);
    if(at('hs'))lines.push(`no air: t = √(2h/g) = √(12/${s.g}) = ${Math.sqrt(2*s.H/s.g).toFixed(2)} s`);if(at('col'))lines.push(`terminal speeds: hammer ${Math.sqrt(hm.m*s.g/hm.k).toFixed(0)} m/s, feather ${Math.sqrt(ft.m*s.g/ft.k).toFixed(1)} m/s`);readout(ctx,lines,16,12,{size:12})}
});
hook('fl-drop',()=>fl&&fl.drop(fl));toggle('fl-air',()=>fl.air,v=>{fl.air=v},v=>'Air: '+(v?'on':'off'));group('data-g',v=>{if(fl){fl.g=v;fl.reset(fl)}});

/* ---------- CH3: the launch ---------- */
const ln=makeSim('cv-launch',{
  init(s){s.hr=4;s.ang=20;s.m=1;s.air=false;s.mu=0;s.phase='ready';s.D=8;s.bw=1.2;s.streak=0;s.hits=0;s.best=0;s.trail=[];s.pred=null;s.predErr=null;s.hitAir=false;s.res=''},
  ppm(s){return s.w/30},
  lip(s){return{x:4,y:1+Math.sin(s.ang*Math.PI/180)*.5}},
  v0(s){const L=s.lip(s);const Lr=Math.hypot(3,s.hr-1);const v2=2*G*(s.hr-L.y)-2*s.mu*G*Lr*(3/Lr);return v2>0?Math.sqrt(v2):0},
  predict(s){const v=s.v0(s),L=s.lip(s),th=s.ang*Math.PI/180;const vy=v*Math.sin(th),vx=v*Math.cos(th);const t=(vy+Math.sqrt(vy*vy+2*G*L.y))/G;const pts=[];for(let k=0;k<=30;k++){const tt=t*k/30;pts.push([L.x+vx*tt,L.y+vy*tt-.5*G*tt*tt])}return{range:L.x+vx*t,t,pts}},
  go(s){if(s.phase!=='ready')return;const pv=parseFloat(($('ln-pred')||{}).value);s.pred=isNaN(pv)?null:pv;s.phase='ramp';s.sp=0;s.trail=[];s.res=''},
  newTarget(s){s.D=5+Math.random()*10;s.bw=1.2;s.streak=0},
  step(dt,s){if(s.phase==='ramp'){const v=s.v0(s);if(v<=0){s.phase='ready';s.res='not enough height: the car stopped on the ramp';return}const Lr=Math.hypot(3,s.hr-1);s.sp+=dt*(v/2+1)/Lr;if(s.sp>=1){s.sp=1;const L=s.lip(s),th=s.ang*Math.PI/180;s.px=L.x;s.py=L.y;s.vx=v*Math.cos(th);s.vy=v*Math.sin(th);s.phase='flight';s.ft=0}}
    else if(s.phase==='flight'){const sub=6,h=dt/sub;for(let k=0;k<sub;k++){const sp=Math.hypot(s.vx,s.vy);const kd=s.air?.03:0;s.vx+=-(kd/s.m)*sp*s.vx*h;s.vy+=(-G-(kd/s.m)*sp*s.vy)*h;s.px+=s.vx*h;s.py+=s.vy*h;s.ft+=h;if(s.py<=0){s.py=0;s.land(s);break}}s.trail.push([s.px,s.py])}
    else if(s.phase==='landed'){s.wait-=dt;if(s.wait<=0)s.phase='ready'}},
  land(s){s.phase='landed';s.wait=1.8;const x=s.px;const hit=Math.abs(x-s.D)<s.bw/2;s.best=Math.max(s.best,x);
    if(s.pred!=null){s.predErr=Math.abs(x-s.pred)/x;s.res=`you predicted ${s.pred.toFixed(1)} m, it landed at ${x.toFixed(1)} m: ${(s.predErr*100).toFixed(0)}% off. `}else s.res=`landed at ${x.toFixed(1)} m. `;
    if(hit){s.hits++;s.streak++;if(s.air&&s.m>=3)s.hitAir=true;s.res+=`HIT! streak ${s.streak}. The box moves farther.`;s.D=Math.min(27,s.D*1.25+1);s.bw=Math.max(.7,s.bw*.93)}else{s.streak=0;s.res+=x<s.D?'short.':'too far.'}},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const P=s.ppm(s),gy=h*.82;const X=x=>x*P,Y=y=>gy-y*P;
    poly(ctx,[[0,gy],[w,gy]],C.chalk,2,.6);for(let m=0;m<=30;m+=5)text(ctx,m+' m',X(m),gy+16,{size:12,alpha:.5});
    const L=s.lip(s);const ramp=[[X(1),Y(s.hr)],[X(3),Y(1)],[X(L.x),Y(L.y)]];poly(ctx,[[X(1),gy],[X(1),Y(s.hr)]],C.chalk,2,.4);poly(ctx,ramp,C.yellow,4,.9);poly(ctx,[[X(3),Y(1)],[X(3),gy]],C.chalk,2,.4);
    text(ctx,`${s.hr.toFixed(1)} m`,X(1)-6,Y(s.hr/2),{size:14,align:'right',alpha:.7});
    box(ctx,X(s.D-s.bw/2),gy-8,s.bw*P,12,rgba(C.green,.3),C.green,2,2);text(ctx,`${s.D.toFixed(1)} m`,X(s.D),gy+32,{size:15,color:C.green});
    if(at('hs')&&s.phase==='ready'){const pr=s.predict(s);ctx.save();ctx.setLineDash([3,6]);poly(ctx,pr.pts.map(p=>[X(p[0]),Y(p[1])]),C.chalk,1.2,.5);ctx.restore()}
    if(s.trail.length)poly(ctx,s.trail.map(p=>[X(p[0]),Y(p[1])]),C.blue,2,.8);
    let cx,cy;if(s.phase==='ramp'){const t=s.sp;const a=[1,s.hr],b=[3,1],c=[L.x,L.y];const seg1=Math.hypot(2,s.hr-1),seg2=Math.hypot(1,L.y-1);const tot=seg1+seg2;const d=t*tot;if(d<seg1){const u=d/seg1;cx=a[0]+(b[0]-a[0])*u;cy=a[1]+(b[1]-a[1])*u}else{const u=(d-seg1)/seg2;cx=b[0]+(c[0]-b[0])*u;cy=b[1]+(c[1]-b[1])*u}}else if(s.phase==='flight'||s.phase==='landed'){cx=s.px;cy=s.py}else{cx=1;cy=s.hr}
    car(ctx,X(cx),Y(cy)-2,26,15,C.pink);
    const v=s.v0(s),pr=s.predict(s);
    const lines=[`streak ${s.streak}   hits ${s.hits}   best ${s.best.toFixed(1)} m`];if(s.res)lines.push(s.res);
    if(at('g8'))lines.push(`speed at the lip ≈ ${v.toFixed(1)} m/s${s.air?'':'   (mass does nothing without air)'}`);if(at('hs'))lines.push(`v = √(2g·Δh) = ${v.toFixed(2)} m/s;  no-drag range ${pr.range.toFixed(1)} m, flight ${pr.t.toFixed(2)} s`);if(at('col')&&s.air)lines.push(`drag on: a = −(k/m)|v|v with k = 0.03 kg/m, m = ${s.m} kg`);readout(ctx,lines,16,12,{size:12})}
});
hook('ln-go',()=>ln&&ln.go(ln));hook('ln-newt',()=>ln&&ln.newTarget(ln));slide('ln-h',v=>{if(ln)ln.hr=v},v=>v.toFixed(1)+' m');slide('ln-a',v=>{if(ln)ln.ang=v},v=>v+'°');slide('ln-m',v=>{if(ln)ln.m=v},v=>v.toFixed(1)+' kg');slide('ln-mu',v=>{if(ln)ln.mu=v},v=>v.toFixed(2));toggle('ln-air',()=>ln.air,v=>{ln.air=v},v=>'Air: '+(v?'on':'off'));

/* ---------- CH4: the crash lab ---------- */
const cr=makeSim('cv-crash',{
  init(s){s.m1=2;s.v1=3;s.m2=2;s.v2=0;s.elastic=true;s.reset(s)},
  reset(s){s.x1=2;s.x2=8;s.u1=s.v1;s.u2=s.v2;s.going=false;s.hit=false;s.stopped=false;s.stuckDone=false},
  go(s){s.reset(s);s.going=true},
  step(dt,s){if(!s.going)return;const sub=4,h=dt/sub;for(let k=0;k<sub;k++){s.x1+=s.u1*h;s.x2+=s.u2*h;if(!s.hit&&s.x2-s.x1<=.9){s.hit=true;const{m1,m2}=s,a=s.u1,b=s.u2;if(s.elastic){s.u1=((m1-m2)*a+2*m2*b)/(m1+m2);s.u2=((m2-m1)*b+2*m1*a)/(m1+m2)}else{s.u1=s.u2=(m1*a+m2*b)/(m1+m2);s.stuckDone=true}if(Math.abs(s.u1)<.05&&s.v1>0)s.stopped=true}}
    if(s.x1<-1||s.x1>13||s.x2>13||s.x2<-1||(s.hit&&Math.abs(s.u1)<1e-3&&Math.abs(s.u2)<1e-3))s.going=false},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const P=w/12,gy=h*.6;poly(ctx,[[0,gy],[w,gy]],C.chalk,2,.6);
    const w1=20+s.m1*4,w2=20+s.m2*4;car(ctx,s.x1*P,gy,w1,14+s.m1*1.5,C.blue);car(ctx,s.x2*P,gy,w2,14+s.m2*1.5,C.pink);
    text(ctx,`${s.m1} kg`,s.x1*P,gy+22,{size:14,color:C.blue});text(ctx,`${s.m2} kg`,s.x2*P,gy+22,{size:14,color:C.pink});
    if(s.u1)arrow(ctx,s.x1*P,gy-40,s.u1*14,0,C.blue,2.5);if(s.u2)arrow(ctx,s.x2*P,gy-40,s.u2*14,0,C.pink,2.5);
    const pB=s.m1*s.v1+s.m2*s.v2,kB=.5*s.m1*s.v1*s.v1+.5*s.m2*s.v2*s.v2,pA=s.m1*s.u1+s.m2*s.u2,kA=.5*s.m1*s.u1*s.u1+.5*s.m2*s.u2*s.u2;
    const lines=[`${s.elastic?'bouncy':'sticky'}:  cart 1 ${s.u1.toFixed(2)} m/s,  cart 2 ${s.u2.toFixed(2)} m/s${s.stopped?'   → cart 1 stopped dead!':''}`];
    if(at('g8'))lines.push(`momentum before ${pB.toFixed(1)}, after ${pA.toFixed(1)} kg·m/s: the same, always`);if(at('hs'))lines.push(`kinetic energy before ${kB.toFixed(1)} J, after ${kA.toFixed(1)} J${s.hit&&!s.elastic?': the rest became heat and sound':''}`);if(at('col'))lines.push(`centre-of-mass speed ${(pB/(s.m1+s.m2)).toFixed(2)} m/s, unchanged by the collision`);readout(ctx,lines,16,12,{size:12})}
});
hook('cr-go',()=>cr&&cr.go(cr));slide('cr-m1',v=>{if(cr){cr.m1=v;cr.reset(cr)}},v=>v+' kg');slide('cr-v1',v=>{if(cr){cr.v1=v;cr.reset(cr)}},v=>v+' m/s');slide('cr-m2',v=>{if(cr){cr.m2=v;cr.reset(cr)}},v=>v+' kg');slide('cr-v2',v=>{if(cr){cr.v2=v;cr.reset(cr)}},v=>v+' m/s');
toggle('cr-type',()=>cr.elastic,v=>{cr.elastic=v;cr.reset(cr)},v=>v?'Bouncy':'Sticky');

/* ---------- CH5: Newton's cannon ---------- */
const cn=makeSim('cv-cannon',{
  init(s){s.R=6371;s.GM=.0098*s.R*s.R;s.v=5;s.shots=[];s.orbited=false;s.escaped=false},
  fire(s){const r0=s.R+300;s.shots.push({x:0,y:r0,vx:s.v,vy:0,pts:[],ang:0,pa:null,t:0,state:'flying'});if(s.shots.length>6)s.shots.shift()},
  step(dt,s){for(const sh of s.shots){if(sh.state!=='flying')continue;const sub=8,h=dt*400/sub;for(let k=0;k<sub;k++){const r=Math.hypot(sh.x,sh.y);const a=-s.GM/(r*r*r);sh.vx+=a*sh.x*h;sh.vy+=a*sh.y*h;sh.x+=sh.vx*h;sh.y+=sh.vy*h;sh.t+=h;const an=Math.atan2(sh.y,sh.x);if(sh.pa!==null){let d=an-sh.pa;if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;sh.ang+=d}sh.pa=an;
      const rr=Math.hypot(sh.x,sh.y);if(rr<s.R){sh.state='crashed';break}if(Math.abs(sh.ang)>=2*Math.PI*1.02){sh.state='orbit';s.orbited=true;break}const E=.5*(sh.vx*sh.vx+sh.vy*sh.vy)-s.GM/rr;if(E>=0&&rr>3*s.R){sh.state='escaped';s.escaped=true;break}if(sh.t>4e4){sh.state='ellipse';break}}
      sh.pts.push([sh.x,sh.y]);if(sh.pts.length>1400)sh.pts.shift()}},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const cx=w/2,cy=h*.55,K=Math.min(w,h)*.2/s.R;const X=x=>cx+x*K,Y=y=>cy-y*K;
    glow(ctx,cx,cy,s.R*K*1.6,C.blue,.25);circle(ctx,cx,cy,s.R*K,rgba(C.blue,.25),C.blue,2);poly(ctx,[[X(-200),Y(s.R)],[X(0),Y(s.R+300)],[X(200),Y(s.R)]],C.chalk,2,.8);
    s.shots.forEach((sh,i)=>{const last=i===s.shots.length-1;poly(ctx,sh.pts.map(p=>[X(p[0]),Y(p[1])]),sh.state==='orbit'?C.green:sh.state==='escaped'?C.pink:last?C.yellow:C.chalk,last?2:1.2,last?.95:.45);if(sh.state==='flying')circle(ctx,X(sh.x),Y(sh.y),3,C.yellow)});
    const vc=Math.sqrt(s.GM/(s.R+300)),ve=vc*Math.SQRT2;const last=s.shots[s.shots.length-1];
    const lines=[`launch ${s.v.toFixed(1)} km/s${last?'   →   '+{flying:'flying',crashed:'came down',orbit:'ORBIT! it came back round',escaped:'escaped for good',ellipse:'looping in a long ellipse'}[last.state]:''}`];
    if(at('g8'))lines.push(`falling and missing: circular speed here is ${vc.toFixed(1)} km/s, escape ${ve.toFixed(1)} km/s`);if(at('hs'))lines.push('v = √(GM/r) for a circle;  √(2GM/r) to escape');if(at('col')&&last)lines.push(`energy per kg: ${(.5*(last.vx*last.vx+last.vy*last.vy)-s.GM/Math.hypot(last.x,last.y)).toFixed(1)} km²/s² (negative = bound)`);readout(ctx,lines,16,12,{size:12})}
});
hook('cn-fire',()=>cn&&cn.fire(cn));hook('cn-clear',()=>{if(cn)cn.shots=[]});slide('cn-v',v=>{if(cn)cn.v=v},v=>v.toFixed(1)+' km/s');

/* ---------- CH6: rockets ---------- */
const rk=makeSim('cv-rocket',{
  init(s){s.fuel=3;s.ve=300;s.mdot=1;s.stage=false;s.reset(s);s.bestSingle=0;s.bestStaged=0},
  reset(s){s.y=0;s.v=0;s.t=0;s.going=false;s.left=s.fuel;s.dry=2+(s.stage?.7:0);s.stagesLeft=s.stage?2:1;s.apex=0;s.done=false;s.log=[]},
  go(s){s.reset(s);s.going=true},
  step(dt,s){if(!s.going)return;const sub=6,h=dt*3/sub;for(let k=0;k<sub;k++){const m=s.dry+s.left;let thrust=0;if(s.left>0){const burn=Math.min(s.mdot*h,s.left);s.left-=burn;thrust=s.mdot*s.ve;if(s.stage&&s.stagesLeft===2&&s.left<=s.fuel/2){s.stagesLeft=1;s.dry-=.7}}
      const a=thrust/m-G;s.v+=a*h;s.y+=s.v*h;s.t+=h;s.apex=Math.max(s.apex,s.y);if(s.y<0){s.y=0;s.going=false;s.done=true;if(s.stage)s.bestStaged=Math.max(s.bestStaged,s.apex);else s.bestSingle=Math.max(s.bestSingle,s.apex);break}}
    if(s.log.length===0||s.t-s.log[s.log.length-1][0]>.2)s.log.push([s.t,s.y])},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const top=Math.max(1200,s.apex*1.15,s.y*1.15);const gy=h*.9,K=(gy-30)/top;
    for(let a=0;a<=top;a+=top>10000?5000:top>4000?1000:500){poly(ctx,[[w*.08,gy-a*K],[w*.12,gy-a*K]],C.chalk,1,.5);text(ctx,a>=1000?(a/1000)+' km':a+' m',w*.07,gy-a*K,{size:12,align:'right',alpha:.6})}
    poly(ctx,[[w*.12,gy],[w*.12,30]],C.chalk,1.5,.4);poly(ctx,[[w*.05,gy],[w*.95,gy]],C.chalk,2,.6);
    if(s.log.length>1)poly(ctx,s.log.map(p=>[w*.2+p[0]*(w*.6/40),gy-p[1]*K]),C.blue,1.5,.6);
    const rx=w*.2+s.t*(w*.6/40),ry=gy-s.y*K;box(ctx,rx-8,ry-36,16,30,C.chalk,null,4);poly(ctx,[[rx-8,ry-36],[rx,ry-50],[rx+8,ry-36]],C.chalk,2,.9);if(s.going&&s.left>0){glow(ctx,rx,ry,18,C.yellow,.8);poly(ctx,[[rx-5,ry-6],[rx,ry+14+Math.random()*8],[rx+5,ry-6]],C.pink,3)}
    const m=s.dry+s.left,thrust=s.left>0&&s.going?s.mdot*s.ve:0;const dv=s.ve*Math.log((2+(s.stage?.7:0)+s.fuel)/2);
    const lines=[`altitude ${s.y.toFixed(0)} m   speed ${s.v.toFixed(0)} m/s   fuel ${s.left.toFixed(1)} kg${s.done?'   →   apex '+s.apex.toFixed(0)+' m':''}`];
    if(at('g8'))lines.push(`thrust = ${s.mdot} kg/s × ${s.ve} m/s = ${(s.mdot*s.ve).toFixed(0)} N,  mass now ${m.toFixed(1)} kg`);if(at('hs'))lines.push(`Δv = v_e ln(m₀/m₁) = ${dv.toFixed(0)} m/s before gravity loss (${(G*s.fuel/s.mdot).toFixed(0)} m/s spent fighting gravity)`);if(at('hs'))lines.push(`best single stage ${s.bestSingle.toFixed(0)} m   best two-stage ${s.bestStaged.toFixed(0)} m`);readout(ctx,lines,16,12,{size:12})}
});
hook('rk-go',()=>rk&&rk.go(rk));slide('rk-fuel',v=>{if(rk){rk.fuel=v;rk.reset(rk)}},v=>v+' kg');slide('rk-ve',v=>{if(rk)rk.ve=v},v=>v.toLocaleString('en-US')+' m/s');slide('rk-mdot',v=>{if(rk)rk.mdot=v},v=>v+' kg/s');toggle('rk-stage',()=>rk.stage,v=>{rk.stage=v;rk.reset(rk)},v=>'Two stages: '+(v?'on':'off'));

Chalk.start({key:'launch',missions:MISSION_DEFS,unitWhy:UNIT_WHY,checks:Object.assign({
  l1:()=>ps&&ps.hit,l1b:()=>ps&&ps.hit&&ps.mu<.05,
  l2:()=>fl&&!fl.air&&fl.obj[0].down&&fl.obj[1].down&&Math.abs(fl.obj[0].t-fl.obj[1].t)<.05,l2b:()=>fl&&fl.g===1.62&&fl.obj[0].down,
  l3:()=>ln&&ln.hits>0,l3b:()=>ln&&ln.streak>=3,l3c:()=>ln&&ln.predErr!=null&&ln.predErr<=.05,l3d:()=>ln&&ln.hitAir,
  l4:()=>cr&&cr.stopped,l4b:()=>cr&&cr.stuckDone,
  l5:()=>cn&&cn.orbited,l5b:()=>cn&&cn.escaped,
  l6:()=>rk&&rk.apex>=1000,l6b:()=>rk&&rk.apex>=3000,l6c:()=>rk&&rk.bestStaged>0&&rk.bestSingle>0&&rk.bestStaged>rk.bestSingle
},Object.fromEntries(Array.from({length:6},(_,i)=>[`tb${i+1}`,()=>Chalk.checkPassed(`ch${i+1}`)])))});
