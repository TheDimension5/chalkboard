const {C,rgba,clamp,dist,$,fmt,sup,pct,text,circle,glow,shade,poly,rr,box,marble,readout,arrow,rng,at,makeSim,hook,slide}=Chalk;
const G=9.8;
const group=(attr,fn)=>document.querySelectorAll(`[${attr}]`).forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll(`[${attr}]`).forEach(x=>x.classList.toggle('is-on',x===b));fn(parseFloat(b.getAttribute(attr)))}));
const toggle=(id,get,set,label)=>hook(id,()=>{set(!get());const b=$(id);b.classList.toggle('is-on',get());b.setAttribute('aria-pressed',String(get()));b.textContent=label(get())});
function car(ctx,x,y,w,h,color){box(ctx,x-w/2,y-h,w,h*.62,color,null,4);box(ctx,x-w*.3,y-h*1.05,w*.55,h*.45,rgba(color,.7),null,3);circle(ctx,x-w*.3,y,h*.28,C.board,C.chalk,2);circle(ctx,x+w*.3,y,h*.28,C.board,C.chalk,2)}

/* ---------- CH1: pushes and pulls: the delivery run ---------- */
/* An endless street. Friction is the ground you are on, mass is the crates you load, and the push comes from a kid who has to run to keep up. */
const sfx=Chalk.sfx;
const SURF={road:{mu:.2,name:'pavement'},grass:{mu:.4,name:'grass'},sand:{mu:.6,name:'sand'},ice:{mu:.04,name:'ice'}};
const RUN=6,KIDGAP=1.05,WALK=2.2;
const hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const ps=makeSim('cv-push',{
  init(s){s.view=clamp(s.w/42,8,14);s.F=50;s.xray=false;try{s.xray=localStorage.getItem('chalk:xray')==='1'}catch(e){}s.hold={left:false,right:false};s.touch=0;s.newRun(s)},
  newRun(s){s.r=rng((Math.random()*1e9)|0);s.segs=[{x0:-60,x1:7,k:'road'}];s.x=2;s.v=0;s.fr=0;s.pushing=0;s.crates=0;s.kid={x:2-KIDGAP,dir:1,ph:0};s.cam=0;s.delivered=0;s.streak=0;s.best=0;s.over=false;s.pops=[];s.parts=[];s.iceParked=false;s.lastK='road';s.birds=null;s.birdT=5;s.parkT=0;s.nextBay(s)},
  genTo(s,x){while(s.segs[s.segs.length-1].x1<x){const last=s.segs[s.segs.length-1];const ks=['road','grass','sand','ice','road','grass'];let k=ks[Math.floor(s.r()*ks.length)];if(k===last.k)k=k==='road'?'ice':'road';s.segs.push({x0:last.x1,x1:last.x1+4+s.r()*8,k})}},
  surf(s,x){for(let i=s.segs.length-1;i>=0;i--){const g=s.segs[i];if(x>=g.x0&&x<g.x1)return g.k}return 'road'},
  nextBay(s){const x=s.x+7+s.r()*10;s.genTo(s,x+40);s.bay={x0:x,x1:x+1.8};s.over=false},
  mass(s){return 5+10*s.crates},
  pop(s,t,x,y,color,size=24){s.pops.push({t,x,y,color,size,age:0})},
  dirWant(s){const d=(s.hold.right?1:0)-(s.hold.left?1:0);return d||s.touch},
  down(p,s){const cx=(s.x-s.cam)*s.w/s.view;s.touch=p.x<cx?1:-1},move(p,s){if(s.touch){const cx=(s.x-s.cam)*s.w/s.view;s.touch=p.x<cx?1:-1}},up(p,s){s.touch=0},leave(s){s.touch=0},
  step(dt,s){s.view=clamp(s.w/42,8,14);const VIEW=s.view;const m=s.mass(s),dir=s.dirWant(s),K=s.kid;
    if(dir)K.dir=dir;const side=s.x-K.dir*KIDGAP;let touching=dir!==0&&Math.abs(K.x-side)<.2;
    if(dir&&!touching){const d=side-K.x;K.x+=Math.sign(d)*Math.min(Math.abs(d),RUN*dt);K.ph+=dt*14}
    else if(!dir){const d=side-K.x;if(Math.abs(d)>.25){K.x+=Math.sign(d)*Math.min(Math.abs(d)-.2,WALK*dt);K.ph+=dt*8}}
    const sub=6,h=dt/sub;
    for(let i=0;i<sub;i++){const mu=SURF[s.surf(s,s.x)].mu;const Fp=touching?s.F*dir:0;
      if(Math.abs(s.v)<1e-3&&Math.abs(Fp)<=mu*m*G){s.v=0;s.fr=-Fp;continue}
      s.fr=Math.abs(s.v)>1e-3?-Math.sign(s.v)*mu*m*G:-Math.sign(Fp)*mu*m*G;
      const v0=s.v;s.v+=(Fp+s.fr)/m*h;if(!Fp&&v0!==0&&Math.sign(s.v)!==Math.sign(v0)){s.v=0;s.fr=0}s.x+=s.v*h}
    if(touching){if(Math.abs(s.v)<=RUN||Math.sign(s.v)!==K.dir){K.x=s.x-K.dir*KIDGAP;K.ph+=dt*(2+Math.abs(s.v)*3)}else{K.x+=K.dir*RUN*dt;K.ph+=dt*16;if(!s.tooFast){s.tooFast=true;s.pop(s,'too fast to keep up!',K.x,2.6,C.pink,20)}}}else s.tooFast=false;
    s.pushing=touching&&Math.abs(K.x-(s.x-K.dir*KIDGAP))<.2?dir:0;
    // the world
    const k=s.surf(s,s.x);if(k!==s.lastK){s.lastK=k;s.pop(s,SURF[k].name+(k==='ice'?'!':''),s.x,2.2,k==='ice'?C.blue:k==='sand'?C.yellow:k==='grass'?C.green:C.chalk,20);sfx('tick')}
    if(Math.abs(s.v)>1.5&&(k==='sand'||k==='grass')&&Math.random()<dt*Math.abs(s.v)*3)s.parts.push({x:s.x-Math.sign(s.v)*.5,y:.05,vx:-s.v*.3+(Math.random()-.5),vy:1+Math.random()*1.5,age:0,life:.6,color:k==='sand'?C.yellow:C.green,r:2});
    if(k==='ice'&&Math.abs(s.v)>1&&Math.random()<dt*6)s.parts.push({x:s.x+(Math.random()-.5),y:.02,vx:0,vy:.4,age:0,life:.5,color:C.chalk,r:1.4,spark:true});
    for(const q of s.parts){q.age+=dt;q.vy-=G*.5*dt;q.x+=q.vx*dt;q.y=Math.max(0,q.y+q.vy*dt)}s.parts=s.parts.filter(q=>q.age<q.life);
    for(const q of s.pops)q.age+=dt;s.pops=s.pops.filter(q=>q.age<1.6);
    if(s.x>s.bay.x1+.6)s.over=true;
    if(!dir&&s.v===0&&s.x>=s.bay.x0&&s.x<=s.bay.x1){s.delivered++;s.streak=s.over?1:s.streak+1;s.best=Math.max(s.best,s.streak);if(k==='ice')s.iceParked=true;
      const big=s.streak>=3;s.pop(s,big?s.streak+' in a row!':'parked!',s.x,2.8,big?C.yellow:C.green,big?40:32);sfx(big?'big':'park');s.parkT=.6;
      for(let i=0;i<(big?40:18);i++){const a=Math.PI*(.15+.7*Math.random());s.parts.push({x:s.x,y:.3,vx:Math.cos(a)*4*(Math.random()<.5?-1:1),vy:Math.sin(a)*6,age:0,life:1+Math.random()*.6,color:[C.yellow,C.pink,C.blue,C.green][i%4],r:2.5})}
      s.nextBay(s)}
    s.parkT=Math.max(0,s.parkT-dt);
    const target=s.x-VIEW*.32+clamp(s.v*.35,-2,3);s.cam+=(target-s.cam)*Math.min(1,dt*3);s.genTo(s,s.cam+VIEW+30);
    if(!Chalk.REDUCE){s.birdT-=dt;if(s.birdT<=0&&!s.birds){s.birds={x:1.1,y:.16+Math.random()*.12,sp:.12+Math.random()*.06};s.birdT=10+Math.random()*10}if(s.birds){s.birds.x-=s.birds.sp*dt;if(s.birds.x<-.2)s.birds=null}}},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const VIEW=s.view||14,P=w/VIEW,gy=h*.72,X=x=>(x-s.cam)*P,Y=y=>gy-y*P,t=Chalk.REDUCE?0:s.t;
    // sky: clouds drift on their own, hills and houses slide by at their own depths
    for(let i=-2;i<8;i++){const par=.15,span=w*.45,base=((i*span-(s.cam*P*par)-t*8)%(span*8)+span*8)%(span*8)-span;const cy=h*(.1+.06*hash(i));ctx.save();ctx.globalAlpha=.14;ctx.strokeStyle=C.chalk;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(base,cy,34,10,0,0,Math.PI*2);ctx.ellipse(base+24,cy-6,24,9,0,0,Math.PI*2);ctx.stroke();ctx.restore()}
    ctx.save();ctx.globalAlpha=.16;ctx.strokeStyle=C.green;ctx.lineWidth=2;ctx.beginPath();for(let px=0;px<=w;px+=8){const wx=px/P+s.cam*.4;const y=gy-h*.13-Math.sin(wx*.35)*h*.04-Math.sin(wx*.13+1)*h*.05;px?ctx.lineTo(px,y):ctx.moveTo(px,y)}ctx.stroke();ctx.restore();
    const par2=.7;for(let n=Math.floor((s.cam*par2)/5)-1;n<Math.floor((s.cam*par2+VIEW)/5)+2;n++){if(hash(n)<.45)continue;const px=(n*5-s.cam*par2)*P;const tall=hash(n+7)>.5;ctx.save();ctx.globalAlpha=.22;if(tall){poly(ctx,[[px,gy],[px,gy-44],[px+30,gy-44],[px+30,gy]],C.chalk,1.5,1);poly(ctx,[[px-4,gy-44],[px+15,gy-62],[px+34,gy-44]],C.chalk,1.5,1);box(ctx,px+10,gy-20,10,20,null,C.chalk,1,1.2)}else{poly(ctx,[[px+10,gy],[px+10,gy-26]],C.chalk,2,1);circle(ctx,px+10,gy-36,14,null,C.green,1.5)}ctx.restore()}
    if(s.birds){const bx=s.birds.x*w,by=s.birds.y*h;for(let i=0;i<3;i++){const ox=bx+i*18,oy=by+(i%2)*8,f=Math.sin(s.t*9+i)*4;poly(ctx,[[ox-7,oy-f],[ox,oy],[ox+7,oy-f]],C.chalk,1.5,.5)}}
    // ground: each stretch of street is its own surface
    for(const g of s.segs){const a=X(g.x0),b=X(g.x1);if(b<0||a>w)continue;const L=Math.max(0,a),R=Math.min(w,b);ctx.save();
      if(g.k==='ice'){ctx.fillStyle=rgba(C.blue,.28);ctx.fillRect(L,gy,R-L,14);ctx.strokeStyle=rgba(C.chalk,.6);ctx.lineWidth=1.2;for(let x=Math.ceil((g.x0)*2)/2;x<g.x1;x+=1.3){const px=X(x);if(px<L||px>R-10)continue;ctx.beginPath();ctx.moveTo(px,gy+10);ctx.lineTo(px+9,gy+3);ctx.stroke()}}
      else if(g.k==='grass'){ctx.fillStyle=rgba(C.green,.14);ctx.fillRect(L,gy,R-L,14);ctx.strokeStyle=rgba(C.green,.8);ctx.lineWidth=1.5;for(let x=Math.ceil(g.x0*4)/4;x<g.x1;x+=.25){const px=X(x);if(px<L||px>R)continue;const hh=4+hash(x*4)*5;ctx.beginPath();ctx.moveTo(px,gy);ctx.lineTo(px-2,gy-hh);ctx.stroke()}}
      else if(g.k==='sand'){ctx.fillStyle=rgba(C.yellow,.18);ctx.fillRect(L,gy,R-L,14);ctx.fillStyle=rgba(C.yellow,.8);for(let x=Math.ceil(g.x0*6)/6;x<g.x1;x+=1/6){const px=X(x);if(px<L||px>R)continue;ctx.fillRect(px,gy+3+hash(x*6)*8,1.6,1.6)}}
      else{ctx.fillStyle=rgba(C.chalk,.07);ctx.fillRect(L,gy,R-L,14);ctx.strokeStyle=rgba(C.chalk,.35);ctx.lineWidth=2;for(let x=Math.ceil(g.x0);x<g.x1;x+=1){const px=X(x);if(px<L||px>R-12)continue;ctx.beginPath();ctx.moveTo(px,gy+7);ctx.lineTo(px+12,gy+7);ctx.stroke()}}
      ctx.restore();poly(ctx,[[L,gy],[R,gy]],C.chalk,2,.6);const mid=(Math.max(g.x0,s.cam)+Math.min(g.x1,s.cam+VIEW))/2;if(R-L>60)text(ctx,SURF[g.k].name,X(mid),gy+28,{size:14,alpha:.5})}
    for(let m=Math.ceil(s.cam/2)*2;m<s.cam+VIEW;m+=2){const px=X(m);poly(ctx,[[px,gy+14],[px,gy+19]],C.chalk,1,.3);text(ctx,m+' m',px,gy+46,{size:11,alpha:.3})}
    // the box to park in
    const bx0=X(s.bay.x0),bx1=X(s.bay.x1);if(bx1>0&&bx0<w){ctx.save();ctx.setLineDash([6,5]);box(ctx,bx0,gy-64,bx1-bx0,64,rgba(C.yellow,.07),C.yellow,4,2);ctx.restore();text(ctx,'park here',clamp((bx0+bx1)/2,44,w-44),gy-76,{size:17,color:C.yellow})}
    else if(bx0>=w){const d=s.bay.x0-s.x;text(ctx,`box ${d.toFixed(0)} m →`,w-14,gy-90,{size:17,color:C.yellow,align:'right'})}
    else{text(ctx,'← box behind you',14,gy-90,{size:17,color:C.yellow,align:'left'})}
    // speed lines
    if(Math.abs(s.v)>3){const n=Math.min(6,Math.floor(Math.abs(s.v)));for(let i=0;i<n;i++){const y=gy-8-i*5,x0=X(s.x)-Math.sign(s.v)*(30+i*6);poly(ctx,[[x0,y],[x0-Math.sign(s.v)*(10+Math.abs(s.v)*3),y]],C.chalk,1.5,.4)}}
    // car, crates, kid
    const cx=X(s.x),sq=s.parkT>0?1+Math.sin(s.parkT*20)*.05:1;ctx.save();ctx.translate(cx,gy);ctx.scale(1/sq,sq);const ks=P/40;ctx.scale(ks,ks);car(ctx,0,0,48,28,C.blue);for(let i=0;i<s.crates;i++){box(ctx,-16+i*17,-28-17,15,15,rgba(C.yellow,.3),C.yellow,2,2);poly(ctx,[[-16+i*17,-45],[-1+i*17,-30]],C.yellow,1,.6)}ctx.restore();
    const K=s.kid,kx=X(K.x),push=s.pushing!==0,lean=push?K.dir*.35:0,run=Math.sin(K.ph);ctx.save();ctx.translate(kx,gy);ctx.scale(P/40,P/40);ctx.strokeStyle=C.chalk;ctx.lineWidth=2.5;ctx.lineCap='round';
      const hipX=Math.sin(lean)*0,hipY=-22,shX=Math.sin(lean)*20,shY=-22-Math.cos(lean)*20;ctx.beginPath();ctx.moveTo(-run*7,0);ctx.lineTo(0,hipY);ctx.lineTo(run*7,0);ctx.moveTo(0,hipY);ctx.lineTo(shX,shY);ctx.stroke();circle(ctx,shX+Math.sin(lean)*7,shY-7,6.5,C.board,C.chalk,2.5);
      ctx.beginPath();ctx.moveTo(shX,shY+3);if(push){ctx.lineTo(K.dir*(KIDGAP*40-26),-18);ctx.moveTo(shX,shY+6);ctx.lineTo(K.dir*(KIDGAP*40-26),-12)}else{ctx.lineTo(shX-6,shY+18);ctx.moveTo(shX,shY+3);ctx.lineTo(shX+6,shY+18)}ctx.stroke();ctx.restore();
    for(const q of s.parts){ctx.save();ctx.globalAlpha=Math.max(0,1-q.age/q.life);ctx.fillStyle=q.color;if(q.spark){ctx.fillRect(X(q.x)-3,Y(q.y)-.5,6,1);ctx.fillRect(X(q.x)-.5,Y(q.y)-3,1,6)}else{ctx.beginPath();ctx.arc(X(q.x),Y(q.y),q.r,0,Math.PI*2);ctx.fill()}ctx.restore()}
    for(const q of s.pops){const u=q.age/1.6,sc=u<.12?.6+u/.12*.5:1.1-Math.min(.1,u-.12);text(ctx,q.t,clamp(X(q.x),80,w-80),Y(q.y)-u*26,{size:q.size*sc,color:q.color,alpha:u<.7?1:Math.max(0,1-(u-.7)/.3)})}
    // x-ray: the forces, drawn on the car
    const m=s.mass(s),mu=SURF[s.surf(s,s.x)].mu,Fp=s.pushing?s.F*s.pushing:0;
    if(s.xray){const sc=clamp(90/Math.max(s.F,mu*m*G,1),.3,1.6);if(Fp)arrow(ctx,cx-Math.sign(Fp)*30,gy-40,Fp*sc,0,C.pink,3.5);if(Math.abs(s.fr)>.01)arrow(ctx,cx,gy+4,s.fr*sc,0,C.blue,3.5);
      const lab=v=>at('g8')?` ${Math.abs(v).toFixed(0)} N`:'';if(Fp)text(ctx,'push'+lab(Fp),cx+Fp*sc*.5-Math.sign(Fp)*30,gy-54,{size:15,color:C.pink});if(Math.abs(s.fr)>.01)text(ctx,'friction'+lab(s.fr),cx+s.fr*sc*.5,gy+64,{size:15,color:C.blue})}
    const lines=[];if(!at('g8'))lines.push(`parked ${s.delivered}${s.streak>1?'   in a row '+s.streak:''}`);else lines.push(`parked ${s.delivered}${s.streak>1?' · in a row '+s.streak:''} · speed ${Math.abs(s.v).toFixed(1)} m/s · mass ${m} kg`);
    if(s.xray&&at('hs'))lines.push(`${SURF[s.surf(s,s.x)].name}: μ = ${mu}; friction = μmg = ${(mu*m*G).toFixed(1)} N; a = (F + f) ÷ m = ${((Fp+s.fr)/m).toFixed(1)} m/s²`);
    if(s.xray&&at('col'))lines.push(`stopping distance from here: v²/(2μg) = ${(s.v*s.v/(2*mu*G)).toFixed(1)} m, whatever the mass`);
    if(s.xray&&at('max'))lines.push(`the kid tops out at ${RUN} m/s: past that your push does no work, since power = F·v needs contact`);
    readout(ctx,lines,14,10,{size:12});
    if(s.delivered===0&&s.v===0&&!s.dirWant(s))text(ctx,'hold ▶ to push',X(s.x)+P*1.4,gy-P*3,{size:20,color:C.yellow,align:'left',alpha:.6+.3*Math.sin(s.t*3)})}
});
const psPad=Chalk.pad(ps,{labels:{left:'push left',right:'push right',a:'crate',b:'x-ray',start:'new street'},help:'Hold <b>◀ ▶</b> to push, let go to coast. <b>A</b> loads a crate (stopped only). <b>B</b> shows the forces.<span class="keys"> Keys: <kbd>←</kbd> <kbd>→</kbd>, <kbd>Z</kbd> for A, <kbd>X</kbd> for B, <kbd>Enter</kbd> for START.</span>',
  on(k,d){if(!ps)return;if(k==='left'||k==='right'){ps.hold[k]=d;if(d)sfx('push')}
    else if(k==='a'&&d){if(Math.abs(ps.v)>.05){ps.pop(ps,'stop first',ps.x,2.4,C.pink,20);sfx('no')}else{ps.crates=(ps.crates+1)%3;ps.pop(ps,ps.crates?`+10 kg (${ps.mass(ps)} kg)`:'unloaded (5 kg)',ps.x,2.4,C.yellow,20);sfx('thud')}}
    else if(k==='b'&&d){ps.xray=!ps.xray;try{localStorage.setItem('chalk:xray',ps.xray?'1':'0')}catch(e){}sfx('blip')}
    else if(k==='start'&&d){ps.newRun(ps);sfx('blip')}}});
slide('ps-f',v=>{if(ps)ps.F=v},v=>v+' N');

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
/* Play: hit the box, it moves farther. Bet: a toy car and a truck race off the same ramp; without air they land together. */
const LN_CARS={one:{m:null,w:26,h:15,color:C.pink,label:''},toy:{m:.2,w:20,h:11,color:C.pink,label:'toy car 0.2 kg'},truck:{m:5,w:46,h:26,color:C.blue,label:'truck 5 kg'}};
const ln=makeSim('cv-launch',{
  init(s){s.hr=4;s.ang=20;s.m=1;s.air=false;s.mu=0;s.phase='ready';s.D=8;s.bw=1.2;s.boxFrom=null;s.streak=0;s.hits=0;s.best=0;s.shots=0;s.pred=null;s.predErr=null;s.hitAir=false;s.res='';
    s.cars=[];s.ghosts=[];s.marks=[];s.parts=[];s.pops=[];s.shake=0;s.race=null;s.raced=false;s.racedAir=false;s.view=16},
  ppm(s){return s.w/s.view},
  frame(s){const pr=s.predict(s);let apex=s.hr;for(const p of pr.pts)apex=Math.max(apex,p[1]);let far=s.race||!s.cars.length?pr.range+3:0;if(!s.race)far=Math.max(far,s.D+s.bw+3);for(const c of s.cars)far=Math.max(far,c.px+3);const room=Math.max(80,s.h*.82-56);return clamp(Math.max(14,far,s.w*(apex+.6)/room),14,34)},
  lip(s){return{x:4,y:1+Math.sin(s.ang*Math.PI/180)*.5}},
  v0(s){const L=s.lip(s);const Lr=Math.hypot(3,s.hr-1);const v2=2*G*(s.hr-L.y)-2*s.mu*G*Lr*(3/Lr);return v2>0?Math.sqrt(v2):0},
  predict(s){const v=s.v0(s),L=s.lip(s),th=s.ang*Math.PI/180;const vy=v*Math.sin(th),vx=v*Math.cos(th);const t=(vy+Math.sqrt(vy*vy+2*G*L.y))/G;const pts=[];for(let k=0;k<=30;k++){const tt=t*k/30;pts.push([L.x+vx*tt,L.y+vy*tt-.5*G*tt*tt])}return{range:L.x+vx*t,t,pts}},
  launch(s,kinds){if(s.phase!=='ready')return false;if(s.v0(s)<=0){s.res='not enough height: the car stops on the ramp';s.pop(s,'too low to roll!',2.5,s.hr+1,C.pink,22);return false}
    s.ghosts=s.cars.filter(c=>c.trail.length).map(c=>({trail:c.trail,color:c.color}));
    s.cars=kinds.map(k=>{const d=LN_CARS[k];return{kind:k,m:d.m==null?s.m:d.m,w:d.w,h:d.h,color:d.color,label:d.label,sp:0,px:1,py:s.hr,vx:0,vy:0,rot:0,trail:[],tt:0,landed:false}});
    s.phase='ramp';s.res='';return true},
  go(s){const pv=parseFloat(($('ln-pred')||{}).value);if(s.launch(s,['one'])){s.race=null;s.pred=isNaN(pv)?null:pv}},
  startRace(s,pick){s.phase=s.phase==='landed'?'ready':s.phase;if(s.launch(s,['truck','toy']))s.race={pick,air:s.air,done:false}},
  newTarget(s){s.boxFrom=null;s.D=5+Math.random()*10;s.bw=1.2;s.streak=0},
  pop(s,t,x,y,color,size=30){s.pops.push({t,x,y,color,size,age:0})},
  burst(s,x,n,colors,up=4){for(let i=0;i<n;i++){const a=Math.PI*(.1+.8*Math.random());const sp=up*(.4+Math.random());s.parts.push({x,y:.05,vx:Math.cos(a)*sp*(Math.random()<.5?-1:1),vy:Math.sin(a)*sp,life:.7+Math.random()*.6,age:0,color:colors[i%colors.length],r:1.5+Math.random()*2.5})}},
  down(p,s){if(s.phase==='ready'){s.race=null;s.go(s)}},
  step(dt,s){
    s.view+=(s.frame(s)-s.view)*Math.min(1,dt*2.5);
    s.shake=Math.max(0,s.shake-dt*30);
    for(const q of s.parts){q.age+=dt;q.vy-=G*.6*dt;q.x+=q.vx*dt;q.y=Math.max(0,q.y+q.vy*dt)}s.parts=s.parts.filter(q=>q.age<q.life);
    for(const q of s.pops)q.age+=dt;s.pops=s.pops.filter(q=>q.age<1.6);
    if(s.boxFrom){s.boxFrom.t+=dt*1.6;if(s.boxFrom.t>=1)s.boxFrom=null}
    if(s.phase==='ramp'){const v=s.v0(s);const Lr=Math.hypot(3,s.hr-1);let sp=0;for(const c of s.cars){c.sp+=dt*(v/2+1)/Lr;sp=c.sp}
      if(sp>=1){const L=s.lip(s),th=s.ang*Math.PI/180;for(const c of s.cars){c.px=L.x;c.py=L.y;c.vx=v*Math.cos(th);c.vy=v*Math.sin(th)}s.phase='flight'}}
    else if(s.phase==='flight'){const sub=6,h=dt/sub;
      for(const c of s.cars){if(c.landed)continue;for(let k=0;k<sub;k++){const sp=Math.hypot(c.vx,c.vy);const kd=s.air?.03:0;c.vx+=-(kd/c.m)*sp*c.vx*h;c.vy+=(-G-(kd/c.m)*sp*c.vy)*h;c.px+=c.vx*h;c.py+=c.vy*h;if(c.py<=0){c.py=0;s.touch(s,c);break}}
        c.rot=Math.atan2(c.vy,c.vx);c.tt+=dt;if(c.tt>.035){c.tt=0;c.trail.push([c.px,c.py])}}
      if(s.cars.every(c=>c.landed))s.land(s)}
    else if(s.phase==='landed'){s.wait-=dt;for(const c of s.cars)c.rot*=.8;if(s.wait<=0)s.phase='ready'}},
  touch(s,c){c.landed=true;c.trail.push([c.px,c.py]);const imp=Math.abs(c.vy);if(!Chalk.REDUCE)s.shake=Math.max(s.shake,Math.min(12,imp*.9*(c.m>=5?1.4:1)));s.burst(s,c.px,c.kind==='truck'?22:12,[C.chalk,rgba(C.chalk,.6)],Math.min(6,imp*.4))},
  land(s){s.phase='landed';s.wait=s.race?1.2:1.4;s.shots++;
    if(s.race){const tr=s.cars.find(c=>c.kind==='truck'),toy=s.cars.find(c=>c.kind==='toy');const gap=tr.px-toy.px;s.race.gap=gap;s.race.done=true;
      if(Math.abs(gap)<.05){s.pop(s,'SAME SPOT!',tr.px,5,C.yellow,44);s.burst(s,tr.px,40,[C.yellow,C.pink,C.blue,C.green],7);s.raced=true}
      else{s.pop(s,(gap>0?'truck':'toy car')+' wins by '+Math.abs(gap).toFixed(1)+' m',Math.max(tr.px,toy.px),4.5,C.blue,30);if(s.race.air)s.racedAir=true}
      lnReveal(s);return}
    const c=s.cars[0],x=c.px;const hit=Math.abs(x-s.D)<s.bw/2;s.best=Math.max(s.best,x);s.marks.push({x,hit});if(s.marks.length>8)s.marks.shift();
    if(s.pred!=null){s.predErr=Math.abs(x-s.pred)/x;s.res=`you predicted ${s.pred.toFixed(1)} m, it landed at ${x.toFixed(1)} m: ${(s.predErr*100).toFixed(0)}% off`}else s.res='';
    if(hit){s.hits++;s.streak++;if(s.air&&s.m>=3)s.hitAir=true;const words=['HIT!','AGAIN!','THREE!','FOUR!!','UNSTOPPABLE'];s.pop(s,s.streak>1?words[Math.min(s.streak,5)-1]:'HIT!',s.D,3.2,C.green,s.streak>=3?46:38);
      s.burst(s,s.D,s.streak>=3?46:24,s.streak>=3?[C.yellow,C.pink,C.blue,C.green]:[C.green,C.chalk],s.streak>=3?8:5);
      s.boxFrom={x:s.D,t:0};s.D=Math.min(27,s.D*1.25+1);s.bw=Math.max(.7,s.bw*.93)}
    else{s.streak=0;const off=x-s.D;s.pop(s,(off<0?'short by ':'over by ')+Math.abs(off).toFixed(1)+' m',x,2.4,C.chalk,22)}},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const P=s.ppm(s),gy=h*.82;const X=x=>x*P,Y=y=>gy-y*P;
    ctx.save();if(s.shake>0)ctx.translate((Math.random()-.5)*s.shake,(Math.random()-.5)*s.shake);
    poly(ctx,[[0,gy],[w,gy]],C.chalk,2,.6);const tk=s.view>22?5:2;for(let m=0;m<=s.view;m+=tk)text(ctx,m+' m',m?X(m):2,gy+16,{size:12,alpha:.45,align:m?'center':'left'});
    // landing marks: every experiment stays on the board
    for(const k of s.marks){const mx=X(k.x);ctx.save();ctx.globalAlpha=.55;ctx.strokeStyle=k.hit?C.green:C.chalk;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(mx-5,gy-5);ctx.lineTo(mx+5,gy+5);ctx.moveTo(mx+5,gy-5);ctx.lineTo(mx-5,gy+5);ctx.stroke();ctx.restore()}
    const L=s.lip(s);const ramp=[[X(1),Y(s.hr)],[X(3),Y(1)],[X(L.x),Y(L.y)]];poly(ctx,[[X(1),gy],[X(1),Y(s.hr)]],C.chalk,2,.4);poly(ctx,ramp,C.yellow,4,.9);poly(ctx,[[X(3),Y(1)],[X(3),gy]],C.chalk,2,.4);
    text(ctx,`${s.hr.toFixed(1)} m`,X(1)-6,Y(s.hr/2),{size:14,align:'right',alpha:.7});
    // target box (slides to its new spot after a hit)
    if(!s.race){let bx=s.D;if(s.boxFrom){const u=s.boxFrom.t,e=1-Math.pow(1-u,3);bx=s.boxFrom.x+(s.D-s.boxFrom.x)*e}const lift=s.boxFrom?Math.sin(s.boxFrom.t*Math.PI)*1.4:0;
      box(ctx,X(bx-s.bw/2),gy-8-lift*P,s.bw*P,12,rgba(C.green,.3),C.green,2,2);if(!s.boxFrom)text(ctx,`${s.D.toFixed(1)} m`,X(bx),gy+32,{size:15,color:C.green})}
    if(at('hs')&&s.phase==='ready'&&!s.race){const pr=s.predict(s);ctx.save();ctx.setLineDash([3,6]);poly(ctx,pr.pts.map(p=>[X(p[0]),Y(p[1])]),C.chalk,1.2,.5);ctx.restore()}
    // chalk-dot trails: the last shot fades, the current one is bright
    const dots=(tr,color,a)=>{ctx.save();ctx.fillStyle=color;ctx.globalAlpha=a;for(const p of tr){ctx.beginPath();ctx.arc(X(p[0]),Y(p[1]),2,0,Math.PI*2);ctx.fill()}ctx.restore()};
    for(const g of s.ghosts)dots(g.trail,g.color,.22);for(const c of s.cars)dots(c.trail,c.color,.85);
    // cars
    const k=clamp(P/20,1,2.4);const drawCar=(c,cx,cy,rot)=>{ctx.save();ctx.translate(X(cx),Y(cy)-2);ctx.rotate(-rot);car(ctx,0,0,c.w*k,c.h*k,c.color);ctx.restore();if(s.race&&c.label){const up=c.kind==='truck';text(ctx,c.label,X(cx),up?Y(cy)-c.h*k-16:gy+36,{size:14,color:c.color,alpha:.9})}};
    const rampAt=t=>{const a=[1,s.hr],b=[3,1],c=[L.x,L.y];const seg1=Math.hypot(2,s.hr-1),seg2=Math.hypot(1,L.y-1),d=Math.min(1,t)*(seg1+seg2);if(d<seg1){const u=d/seg1;return[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,Math.atan2(b[1]-a[1],b[0]-a[0])]}const u=(d-seg1)/seg2;return[b[0]+(c[0]-b[0])*u,b[1]+(c[1]-b[1])*u,Math.atan2(c[1]-b[1],c[0]-b[0])]};
    const order=s.phase==='ready'&&!s.race?[LN_CARS.one]:[...s.cars].sort((a,b)=>b.w-a.w);
    for(const c of order){if(s.phase==='ramp'){const r=rampAt(c.sp);drawCar(c,r[0],r[1],r[2])}else if(s.phase==='flight'||s.phase==='landed'||(s.race&&s.cars.length)){drawCar(c,c.px,c.py,c.landed?c.rot*.3:c.rot)}else drawCar(LN_CARS.one,1,s.hr,0)}
    if(s.phase==='ready'&&!s.race&&s.shots===0)text(ctx,'tap the car or press Launch',X(1)+20,Y(s.hr)-34,{size:17,color:C.yellow,align:'left',alpha:.6+.3*Math.sin(s.t*3)});
    // dust and confetti
    for(const q of s.parts){ctx.save();ctx.globalAlpha=Math.max(0,1-q.age/q.life);ctx.fillStyle=q.color;ctx.beginPath();ctx.arc(X(q.x),Y(q.y),q.r,0,Math.PI*2);ctx.fill();ctx.restore()}
    ctx.restore();
    for(const q of s.pops){const u=q.age/1.6,sc=u<.15?.6+u/.15*.55:1.15-Math.min(.15,(u-.15));text(ctx,q.t,clamp(X(q.x),90,w-90),Y(q.y)-u*30,{size:q.size*sc,color:q.color,alpha:u<.7?1:Math.max(0,1-(u-.7)/.3)})}
    const v=s.v0(s),pr=s.predict(s);const lines=[];
    if(s.shots&&!s.race)lines.push(`hits ${s.hits}${s.streak>1?'   streak '+s.streak:''}   best ${s.best.toFixed(1)} m`);if(s.res)lines.push(s.res);
    if(at('g8'))lines.push(`speed at the lip ≈ ${v.toFixed(1)} m/s`);if(at('hs'))lines.push(`v = √(2g·Δh) = ${v.toFixed(2)} m/s;  no-drag range ${pr.range.toFixed(1)} m, flight ${pr.t.toFixed(2)} s`);if(at('col')&&s.air)lines.push(`drag on: a = −(k/m)|v|v with k = 0.03 kg/m`);
    if(lines.length)readout(ctx,lines,16,12,{size:12})}
});
function lnReveal(s){const out=$('ln-reveal');if(!out||!s.race)return;const r=s.race,same=Math.abs(r.gap)<.05;const lv=Chalk.level();let head,body,next='';
  if(!r.air&&same){head=r.pick==='same'?'You called it. They land on the same spot.':r.pick==='truck'?'Same spot. Most people bet on the truck.':'Same spot. Being light does not help either.';
    body=lv==='k5'?'Gravity pulls the truck much harder. But the truck is also much harder to get moving. The two cancel out exactly, so the truck and the toy car fly together.':lv==='g8'?'Gravity pulls 25 times harder on the truck, but the truck has 25 times more mass to speed up. The two cancel exactly. Galileo figured this out rolling balls down ramps four hundred years ago.':'In mgh = ½mv² the mass is on both sides and cancels: v = √(2gh) for any mass. Same launch speed, same g, same path. The only term that would keep m is air drag.';
    next='Now turn the air on and race them again.'}
  else if(r.air){head=r.gap>0?`With air on, the truck wins by ${r.gap.toFixed(1)} m.`:'With air on, the toy car wins?';
    body=lv==='k5'?'Air pushes back on both cars. The toy car is so light that the push slows it way down. That is why a feather floats and a hammer drops. On the Moon there is no air, and when an astronaut dropped a hammer and a feather, they hit the ground together.':'Drag depends on size and speed, not mass, so the same push costs the 0.2 kg toy 25 times more slowing than the 5 kg truck. Turn the air off and the difference vanishes. In 1971 astronaut David Scott dropped a hammer and a feather on the Moon: they landed together.'}
  else{head='The truck and toy car split up.';body='Something on the ramp is not the same for both. Try again with the air off.'}
  out.innerHTML=`<b>${head}</b> ${body}${next?` <button class="btn" id="ln-airrace" type="button">Race with air on</button>`:''}`;out.hidden=false;
  const ar=$('ln-airrace');if(ar)ar.addEventListener('click',()=>{s.air=true;const b=$('ln-air');if(b){b.classList.add('is-on');b.setAttribute('aria-pressed','true');b.textContent='Air: on'}s.startRace(s,'air');lnShow()})}
document.querySelectorAll('[data-bet]').forEach(b=>b.addEventListener('click',()=>{if(!ln)return;document.querySelectorAll('[data-bet]').forEach(x=>x.classList.toggle('is-on',x===b));const out=$('ln-reveal');if(out){out.hidden=false;out.innerHTML='<b>Bet placed.</b> Watch them go.'}ln.startRace(ln,b.dataset.bet);lnShow()}));
function lnShow(){const cv=$('cv-launch');if(!cv)return;const r=cv.getBoundingClientRect();if(r.top<0||r.bottom>innerHeight)cv.scrollIntoView({behavior:Chalk.REDUCE?'auto':'smooth',block:'end'})}
hook('ln-go',()=>{if(!ln||ln.phase!=='ready')return;ln.race=null;ln.go(ln)});hook('ln-newt',()=>{if(!ln)return;ln.race=null;ln.newTarget(ln)});slide('ln-h',v=>{if(ln)ln.hr=v},v=>v.toFixed(1)+' m');slide('ln-a',v=>{if(ln)ln.ang=v},v=>v+'°');slide('ln-m',v=>{if(ln)ln.m=v},v=>v.toFixed(1)+' kg');slide('ln-mu',v=>{if(ln)ln.mu=v},v=>v.toFixed(2));toggle('ln-air',()=>ln.air,v=>{ln.air=v},v=>'Air: '+(v?'on':'off'));

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
  l1:()=>ps&&ps.delivered>0,l1b:()=>ps&&ps.iceParked,l1c:()=>ps&&ps.best>=3,
  l2:()=>fl&&!fl.air&&fl.obj[0].down&&fl.obj[1].down&&Math.abs(fl.obj[0].t-fl.obj[1].t)<.05,l2b:()=>fl&&fl.g===1.62&&fl.obj[0].down,
  l3:()=>ln&&ln.hits>0,l3b:()=>ln&&ln.streak>=3,l3c:()=>ln&&ln.predErr!=null&&ln.predErr<=.05,l3d:()=>ln&&ln.hitAir,l3r:()=>ln&&ln.raced,l3s:()=>ln&&ln.racedAir,
  l4:()=>cr&&cr.stopped,l4b:()=>cr&&cr.stuckDone,
  l5:()=>cn&&cn.orbited,l5b:()=>cn&&cn.escaped,
  l6:()=>rk&&rk.apex>=1000,l6b:()=>rk&&rk.apex>=3000,l6c:()=>rk&&rk.bestStaged>0&&rk.bestSingle>0&&rk.bestStaged>rk.bestSingle
},Object.fromEntries(Array.from({length:6},(_,i)=>[`tb${i+1}`,()=>Chalk.checkPassed(`ch${i+1}`)])))});
