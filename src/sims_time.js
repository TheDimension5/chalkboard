const {C,rgba,clamp,dist,$,fmt,sup,pct,text,circle,glow,shade,poly,rr,box,marble,readout,arrow,rng,at,makeSim,hook,slide}=Chalk;
const sfx=Chalk.sfx;
const EMIN=-43.4,EMAX=108;
const YR=3.15576e7;
/* events: [name, seconds, kind, colour, what is happening] */
const RAW=[
['The Planck time',5.39e-44,'foam',C.yellow,'The shortest time physics can talk about. Below it, before and after may stop making sense. Nobody knows.'],
['Inflation ends',1e-32,'inflate',C.pink,'If the leading theory is right, the baby universe doubled in size about ninety times in a row, and it was all over by here.'],
['A top quark lives',5e-25,'decay',C.pink,'The heaviest particle we know falls apart this fast, too quick to join with anything.'],
['Light crosses a proton',5.6e-24,'light',C.yellow,'Light, the fastest thing there is, gets across one proton.'],
['A Higgs boson lives',1.6e-22,'decay',C.blue,'The particle behind mass lasts this long before it breaks into others.'],
['Light crosses a molecule',2.47e-19,'light',C.green,'247 zeptoseconds: light crossing one hydrogen molecule, the shortest time ever measured (2020).'],
['The shortest flash',4.3e-17,'flash',C.yellow,'43 attoseconds: the quickest flash of light anyone has made (2017).'],
['An electron goes round',1.5e-16,'orbit',C.blue,'In the old picture of the atom, hydrogen’s electron circles its proton once in about 150 attoseconds.'],
['One wave of green light',1.8e-15,'wave',C.green,'Light is a wave. One wiggle of green light takes 1.8 femtoseconds.'],
['A molecule vibrates',1.1e-14,'bond',C.pink,'A chemical bond stretches and squeezes once. Molecules vibrate on this scale.'],
['Water swaps partners',1e-12,'water',C.blue,'In a glass of water, the bonds between molecules break and remake about once every picosecond.'],
['A computer ticks',3.3e-10,'beat',C.green,'A 3 GHz processor takes one step. Three billion of them every second.'],
['Light goes a foot',1e-9,'light',C.yellow,'One nanosecond: light travels about 30 cm, the length of a ruler.'],
['A muon lives',2.2e-6,'decay',C.pink,'Muons made by cosmic rays live this long. They reach the ground only because time runs slow for them.'],
['Sound wiggles once',2.27e-3,'wave',C.chalk,'The note A that orchestras tune to: 440 wiggles of air every second.'],
['A fly beats its wings',5e-3,'wing',C.chalk,'A housefly flaps about 200 times a second.'],
['A hummingbird beats its wings',2e-2,'wing',C.green,'About 50 flaps a second: fast enough to hover like a helicopter.'],
['You blink',.15,'eye',C.blue,'A blink takes a tenth of a second or so. You do it about 15,000 times a day.'],
['Your heart beats',.83,'heart',C.pink,'About 72 beats a minute when you rest.'],
['Light from the Moon',1.28,'light',C.chalk,'Moonlight left the Moon 1.3 seconds before it reached your eye.'],
['Light from the Sun',499,'light',C.yellow,'Sunlight is 8 minutes and 19 seconds old when it lands on you.'],
['The Earth spins once',86400,'spin',C.blue,'One day: the Earth turns and the Sun comes round again.'],
['The Moon goes round',2.36e6,'orbit',C.chalk,'27.3 days for the Moon to circle the Earth once.'],
['The Earth goes round the Sun',YR,'orbit',C.blue,'One year: 365 and a quarter spins per trip.'],
['A human life',2.5e9,'grow',C.yellow,'About 80 years, 2.5 billion seconds, three billion heartbeats.'],
['All of written history',1.58e11,'grow',C.chalk,'About 5,000 years since the first writing.'],
['Half the carbon-14 is gone',1.81e11,'half',C.green,'5,730 years: the clock scientists use to date old bones and wood.'],
['People like us',9.5e12,'grow',C.pink,'Homo sapiens has been around for about 300,000 years.'],
['Since the dinosaurs',2.1e15,'grow',C.green,'66 million years since an asteroid ended the age of dinosaurs.'],
['The Sun goes round the galaxy',7.3e15,'orbit',C.yellow,'About 230 million years for one trip around the Milky Way.'],
['The age of the Earth',1.43e17,'grow',C.blue,'4.5 billion years.'],
['The age of the universe',4.35e17,'grow',C.yellow,'13.8 billion years since the Big Bang. As far back as time goes, as far as we know.'],
['The Sun’s whole life',3.2e17,'star',C.yellow,'About 10 billion years of shining before it swells into a red giant. It is halfway through.'],
['The smallest stars burn out',3.2e20,'star',C.pink,'Red dwarfs sip their fuel for up to about ten trillion years.'],
['The last stars go out',3.2e21,'fade',C.chalk,'About a hundred trillion years from now, star-making stops and the last stars fade.'],
['A black hole like the Sun evaporates',3e74,'bh',C.blue,'Black holes leak away very, very slowly. One with the Sun’s mass takes about 10⁶⁷ years.'],
['The biggest black holes evaporate',3e107,'bh',C.pink,'The largest ones take around 10¹⁰⁰ years. After that, almost nothing is left to happen.'],
];
const EV=RAW.map(([name,T,kind,col,fact],i)=>{const a=i*2.399963,r=.2+.5*((i*7)%5)/4;return{name,T,kind,col,fact,E:Math.log10(T),u:Math.cos(a)*r,v:Math.sin(a)*r}});
const NOTES=[{a:-43,b:-32.6,t:['No clock can reach here.','Only the first instants of the universe','happened this fast, if anything did.']},{a:-31.2,b:-25.4,t:['Nothing we know of','takes this long.']},{a:22.4,b:74,t:['The dark era: dead stars cool','and almost nothing happens','for a very, very long time.']},{a:75.2,b:106.8,t:['Only black holes are left,','leaking away one particle','at a time.']}];
const GROUPS=[['yr',YR],['d',86400],['h',3600],['min',60],['s',1],['ms',1e-3],['µs',1e-6],['ns',1e-9],['ps',1e-12],['fs',1e-15],['as',1e-18],['zs',1e-21],['ys',1e-24]];
const UNITNAME={yr:'Years',d:'Days',h:'Hours',min:'Minutes',s:'Seconds',ms:'Milliseconds',µs:'Microseconds',ns:'Nanoseconds',ps:'Picoseconds',fs:'Femtoseconds',as:'Attoseconds',zs:'Zeptoseconds',ys:'Yoctoseconds'};
const nice=v=>v>=100?Math.round(v).toLocaleString('en-US'):v>=10?v.toFixed(0):v.toFixed(v%1?1:0);
function plural(t){return t.replace(/^1 (\w+)s$/,'1 $1')}
function friendly(S){return (f=>f&&plural(f))(friendly0(S))}
function friendly0(S){if(S>=YR*1e9)return nice(S/YR/1e9)+' billion years';if(S>=YR*1e6)return nice(S/YR/1e6)+' million years';if(S>=YR*1e3&&S<YR*1e6)return nice(S/YR)+' years';if(S>=YR)return nice(S/YR)+' years';if(S>=86400)return nice(S/86400)+' days';if(S>=3600)return nice(S/3600)+' hours';if(S>=60)return nice(S/60)+' minutes';if(S>=1)return nice(S)+' seconds';for(const [u,v] of GROUPS.slice(5))if(S>=v)return nice(S/v)+' '+UNITNAME[u].toLowerCase();return null}
function sci(S){const e=Math.floor(Math.log10(S)),m=S/Math.pow(10,e);return `${m.toFixed(m<9.95?1:0)} × 10${sup(e)} s`}
function label(S){const f=friendly(S);if(S>=YR*1e12)return sci(S/YR).replace(' s',' years');if(!at('g8'))return f||sci(S);if(!at('hs'))return (f?f+' = ':'')+'10'+sup(Math.round(Math.log10(S)))+' s';return sci(S)+(f?' = '+f:'')}
/* glyphs: (ctx,x,y,R,col,p,t) with p the phase in cycles */
const G={};
const fr=p=>p-Math.floor(p);
G.foam=(c,x,y,R,col,p,t)=>{const g=rng(Math.floor(t*14));c.save();c.strokeStyle=col;c.lineWidth=1.5;c.globalAlpha=.7;c.beginPath();for(let i=0;i<=40;i++){const a=i/40*6.283,rr=R*(.7+g()*.5);i?c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr):c.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}c.closePath();c.stroke();for(let i=0;i<14;i++){circle(c,x+(g()-.5)*R*1.4,y+(g()-.5)*R*1.4,1+g()*3,rgba(col,.8))}c.restore()};
G.inflate=(c,x,y,R,col,p)=>{const k=fr(p);const r=R*.08*Math.pow(12,k);circle(c,x,y,Math.min(r,R*1.1),rgba(col,.12),col,2);text(c,'×2 ×2 ×2 …',x,y,{size:Math.max(10,R*.22),color:col,alpha:.7})};
G.decay=(c,x,y,R,col,p)=>{const k=fr(p/1.4)*1.4;if(k<1){glow(c,x,y,R*.6,col,.3+.2*Math.sin(k*20));circle(c,x,y,R*.28,col)}else{const u=(k-1)/.4;for(let i=0;i<3;i++){const a=i*2.09+.4;circle(c,x+Math.cos(a)*R*.8*u,y+Math.sin(a)*R*.8*u,R*.14,rgba(col,1-u*.7))}}};
G.light=(c,x,y,R,col,p)=>{poly(c,[[x-R,y+R*.35],[x+R,y+R*.35]],C.chalk,1.5,.5);poly(c,[[x-R,y+R*.25],[x-R,y+R*.45]],C.chalk,1.5,.5);poly(c,[[x+R,y+R*.25],[x+R,y+R*.45]],C.chalk,1.5,.5);const k=fr(p);const px=x-R+2*R*k;glow(c,px,y,R*.35,col,.7);circle(c,px,y,R*.1,C.chalk);poly(c,[[px-R*.5,y],[px,y]],col,2,.5)};
G.flash=(c,x,y,R,col,p)=>{const k=fr(p);const b=Math.max(0,1-Math.abs(k-.5)*6);glow(c,x,y,R*1.2,col,.9*b);circle(c,x,y,R*.3,rgba(col,.2+.8*b),col,2)};
G.orbit=(c,x,y,R,col,p)=>{circle(c,x,y,R*.85,null,rgba(col,.4),1.5);circle(c,x,y,R*.22,rgba(col,.4),col,2);const a=fr(p)*6.283;circle(c,x+Math.cos(a)*R*.85,y+Math.sin(a)*R*.85,R*.12,C.chalk)};
G.wave=(c,x,y,R,col,p)=>{const pts=[];for(let i=0;i<=40;i++){const u=i/40;pts.push([x-R+2*R*u,y+Math.sin((u*2-p)*6.283)*R*.4])}poly(c,pts,col,2.5,.95)};
G.bond=(c,x,y,R,col,p)=>{const s=R*(.55+.2*Math.sin(p*6.283));const pts=[];for(let i=0;i<=16;i++){pts.push([x-s+2*s*i/16,y+(i%2?1:-1)*R*.12*(i>0&&i<16?1:0)])}poly(c,pts,C.chalk,1.5,.8);circle(c,x-s,y,R*.3,rgba(col,.6),col,2);circle(c,x+s,y,R*.22,rgba(C.chalk,.5),C.chalk,2)};
G.water=(c,x,y,R,col,p)=>{const k=fr(p);for(let i=0;i<3;i++){const a=i*2.09+k*2.09;const mx=x+Math.cos(a)*R*.55,my=y+Math.sin(a)*R*.55;circle(c,mx,my,R*.2,rgba(col,.5),col,2);circle(c,mx+R*.18,my-R*.12,R*.08,C.chalk);circle(c,mx-R*.18,my-R*.12,R*.08,C.chalk)}c.save();c.setLineDash([2,4]);const a1=k*2.09,a2=a1+2.09;poly(c,[[x+Math.cos(a1)*R*.55,y+Math.sin(a1)*R*.55],[x+Math.cos(a2)*R*.55,y+Math.sin(a2)*R*.55]],C.chalk,1.2,.6*Math.abs(Math.sin(k*3.14)));c.restore()};
G.beat=(c,x,y,R,col,p)=>{const k=fr(p);const b=k<.2?1-k/.2:0;box(c,x-R*.5,y-R*.5,R,R,rgba(col,.1+.5*b),col,4,2);for(let i=0;i<4;i++){poly(c,[[x-R*.5+R*(i+.5)/4,y-R*.5],[x-R*.5+R*(i+.5)/4,y-R*.7]],col,1.5,.7);poly(c,[[x-R*.5+R*(i+.5)/4,y+R*.5],[x-R*.5+R*(i+.5)/4,y+R*.7]],col,1.5,.7)}};
G.wing=(c,x,y,R,col,p)=>{const a=Math.sin(p*6.283)*.9;c.save();c.translate(x,y);c.strokeStyle=col;c.lineWidth=2;c.fillStyle=rgba(col,.15);for(const sgn of[-1,1]){c.save();c.rotate(sgn*a);c.beginPath();c.ellipse(sgn*R*.45,-R*.1,R*.45,R*.18,sgn*-.3,0,Math.PI*2);c.fill();c.stroke();c.restore()}c.restore();c.save();c.fillStyle=rgba(C.chalk,.8);c.beginPath();c.ellipse(x,y,R*.12,R*.3,0,0,Math.PI*2);c.fill();c.restore()};
G.eye=(c,x,y,R,col,p)=>{const k=fr(p);const o=k<.5?1-k*2:(k-.5)*2;c.save();c.strokeStyle=C.chalk;c.lineWidth=2;c.beginPath();c.ellipse(x,y,R*.8,R*.45*o+1,0,0,Math.PI*2);c.stroke();c.restore();if(o>.2)circle(c,x,y,R*.25*Math.min(1,o*1.5),col)};
G.heart=(c,x,y,R,col,p)=>{const k=fr(p);const s=1+(k<.15?Math.sin(k/.15*3.14)*.25:0);c.save();c.translate(x,y);c.scale(s,s);c.fillStyle=rgba(col,.35);c.strokeStyle=col;c.lineWidth=2;c.beginPath();c.moveTo(0,R*.5);c.bezierCurveTo(-R*.9,-R*.1,-R*.5,-R*.75,0,-R*.3);c.bezierCurveTo(R*.5,-R*.75,R*.9,-R*.1,0,R*.5);c.fill();c.stroke();c.restore()};
G.spin=(c,x,y,R,col,p)=>{circle(c,x,y,R*.7,rgba(col,.2),col,2);c.save();c.beginPath();c.arc(x,y,R*.7,0,Math.PI*2);c.clip();const k=fr(p);for(let i=0;i<3;i++){const px=x-R*.7+((k+i/3)%1)*R*2.2-R*.4;c.fillStyle=rgba(C.green,.5);c.beginPath();c.ellipse(px,y-R*.1+i*R*.15,R*.22,R*.14,0,0,Math.PI*2);c.fill()}c.fillStyle='rgba(0,0,0,.35)';c.fillRect(x,y-R,R,R*2);c.restore()};
G.grow=(c,x,y,R,col,p)=>{const k=fr(p);box(c,x-R,y-R*.12,R*2,R*.24,null,col,R*.12,2);box(c,x-R+2,y-R*.12+2,(R*2-4)*k,R*.24-4,rgba(col,.6),null,R*.1)};
G.half=(c,x,y,R,col,p)=>{const k=fr(p);const g=rng(7);for(let i=0;i<24;i++){const dead=g()<1-Math.pow(.5,k*1);circle(c,x+(i%6-2.5)*R*.3,y+(Math.floor(i/6)-1.5)*R*.3,R*.09,dead?rgba(C.chalk,.25):col)}};
G.star=(c,x,y,R,col,p)=>{const k=fr(p);const r=R*(.35+.1*Math.sin(k*40))*(k>.9?1+(k-.9)*8:1);glow(c,x,y,r*2.2,col,.4*(1-k*.5));circle(c,x,y,r,rgba(col,.6+.4*(1-k)))};
G.fade=(c,x,y,R,col,p)=>{const k=fr(p);const g=rng(3);for(let i=0;i<20;i++){const b=Math.max(0,1-k*1.3-g()*.3);circle(c,x+(g()-.5)*R*1.8,y+(g()-.5)*R*1.8,1.5+2*b,rgba(C.yellow,b))}};
G.bh=(c,x,y,R,col,p)=>{const k=fr(p);const r=R*.5*Math.cbrt(Math.max(0,1-k));circle(c,x,y,r+6,null,rgba(col,.5),2);circle(c,x,y,r,'#000',null);if(k>.97)glow(c,x,y,R,C.chalk,.8)};
function makeLens(id,px,E0,stops){
  const s=makeSim(id,{
    init(s){s.E=E0;s.target=E0;s.simT=0;s.frozen=false;s.maxE=E0;s.minE=E0;s.xray=false;try{s.xray=localStorage.getItem('chalk:xray')==='1'}catch(e){}s.poked=0;s.pokeT=0;s.drag=null;s.tour=null;s.pops=[];s.sync(s)},
    setE(s,e,jump){s.target=clamp(e,EMIN,EMAX);if(jump)s.E=s.target;s.sync(s)},
    fly(s,list,cb){s.tour={list,i:0,t:.4,cb,done:false,flash:0}},
    sync(s){const sl=$(px+'-e');if(sl&&Math.abs(parseFloat(sl.value)-s.target)>.001)sl.value=s.target.toFixed(2)},
    say(s,t,col,size){s.pops.push({t,col:col||C.chalk,size:size||22,age:0})},
    down(p,s){if(s.tour&&!s.tour.done)return;s.drag={y:p.y,E:s.target}},move(p,s){if(s.drag)s.setE(s,s.drag.E-(p.y-s.drag.y)/40)},up(p,s){s.drag=null},leave(s){s.drag=null},
    step(dt,s){if(s.tour&&!s.tour.done){const T=s.tour;T.flash=Math.max(0,T.flash-dt);T.t-=dt;if(T.t<=0){if(T.i<T.list.length){s.setE(s,T.list[T.i]);T.i++;T.flash=.3;T.t=T.i<3?.6:.24}else if(Math.abs(s.E-s.target)<.05){T.done=true;T.cb&&T.cb()}}}
      const k=1-Math.exp(-dt*6);s.E+=(s.target-s.E)*k;if(Math.abs(s.target-s.E)<.002)s.E=s.target;s.maxE=Math.max(s.maxE,s.E);s.minE=Math.min(s.minE,s.E);
      const D=Math.pow(10,s.E);if(!s.frozen&&!Chalk.REDUCE)s.simT+=D*dt/3;else if(!s.frozen)s.simT+=D*dt/12;if(s.simT>D*1e4)s.simT=s.simT%(D*1000);
      s.pokeT=Math.max(0,s.pokeT-dt);for(const q of s.pops)q.age+=dt;s.pops=s.pops.filter(q=>q.age<2.4);const o=$(px+'-e-val');if(o)o.textContent='10'+sup(Math.round(s.E))+' s'},
    draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const D=Math.pow(10,s.E);const top=86,cx=w/2,cy=top+(h-top)*.46,Rv=Math.min(w*.46,(h-top)*.44);
      // the stopwatch strip: one group per unit, the one matching the window lights up
      const gi=GROUPS.findIndex(g=>g[1]<=D*1.0001);const act=gi<0?GROUPS.length-1:gi;const first=clamp(act-2,0,GROUPS.length-6),n=Math.min(6,GROUPS.length-first);const cw=Math.min(88,(w-24)/n);const x0=(w-cw*n)/2;
      for(let i=0;i<n;i++){const [u,val]=GROUPS[first+i];const gx=x0+cw*i+cw/2;let v;const fast=val<D/2000;
        if(u==='yr'){const yv=s.simT/YR;v=yv>=1e6?sci(yv).replace(' s',''):String(Math.floor(yv))}else if(u==='d')v=String(Math.floor(s.simT/86400)%365).padStart(3,'0');else if(u==='h')v=String(Math.floor(s.simT/3600)%24).padStart(2,'0');else if(u==='min'||u==='s')v=String(Math.floor(s.simT/val)%60).padStart(2,'0');else v=fast?String(Math.floor(Math.random()*1000)).padStart(3,'0'):String(Math.floor(s.simT/val)%1000).padStart(3,'0');
        const on=first+i===act;text(ctx,v,gx,30,{size:on?30:22,fam:'mono',color:on?C.yellow:fast?rgba(C.chalk,.3):C.chalk,alpha:on?1:.75});text(ctx,u,gx,56,{size:12,fam:'body',alpha:on?.95:.5,color:on?C.yellow:C.chalk})}
      text(ctx,`the window is ${label(D)} long`+(D<1e-24?`, ${Math.round(-24-s.E)} powers of ten below the smallest named unit`:''),w/2,72,{size:12,fam:'body',alpha:.7});
      // the lens
      circle(ctx,cx,cy,Rv+7,null,rgba(C.chalk,.18),10);circle(ctx,cx,cy,Rv,'rgba(0,0,0,.18)',C.chalk,2);
      for(let i=0;i<60;i++){const a=i/60*6.283,L=i%5?4:9;poly(ctx,[[cx+Math.cos(a)*(Rv-2),cy+Math.sin(a)*(Rv-2)],[cx+Math.cos(a)*(Rv-2-L),cy+Math.sin(a)*(Rv-2-L)]],C.chalk,1,.35)}
      const sweep=fr(s.simT/D)*6.283-Math.PI/2;poly(ctx,[[cx,cy],[cx+Math.cos(sweep)*(Rv-12),cy+Math.sin(sweep)*(Rv-12)]],C.yellow,1.5,.35);
      ctx.save();ctx.beginPath();ctx.arc(cx,cy,Rv,0,Math.PI*2);ctx.clip();let focus=null,fq=1e9;
      for(const o of EV){const q=o.T/D;if(q<.01||q>100)continue;const lq=Math.abs(Math.log10(q));const a=clamp(1-lq/2,0,1);const R=Rv*(.12+.22*a);const m=Rv-R-8;const x=cx+o.u*m,y=cy+o.v*m;
        const p=s.simT/o.T;ctx.save();ctx.globalAlpha=.25+.75*a;if(q<.08&&'filter' in ctx)ctx.filter='blur(1.5px)';G[o.kind](ctx,x,y,R,o.col,q<.08?p+Math.random():p,s.t);ctx.restore();
        if(a>(Rv<150?.55:.3))text(ctx,o.name,clamp(x,cx-Rv+60,cx+Rv-60),y+R+14,{size:Math.max(12,Math.min(17,R*.4)),color:o.col,alpha:.35+.65*a});if(lq<fq){fq=lq;focus=o}}
      for(const nt of NOTES)if(s.E>=nt.a&&s.E<=nt.b)nt.t.forEach((ln,i)=>text(ctx,ln,cx,cy-((nt.t.length-1)/2-i)*22,{size:17,alpha:.75}));
      if(s.pokeT>0){const u=1-s.pokeT/1.2;circle(ctx,cx,cy,Rv*u,null,rgba(C.yellow,1-u),3)}
      ctx.restore();
      // readouts
      if(focus&&fq<1.2)readout(ctx,[focus.fact],cx,cy+Rv+14,{align:'center',size:12});
      if(s.frozen)text(ctx,'time frozen',cx,cy-Rv+26,{size:18,color:C.blue});
      if(s.xray&&at('g8')){const lines=[`window 10^${s.E.toFixed(1)} s`,`${sci(1/D).replace(' s','')} of these fit in one second`];if(at('hs')&&focus)lines.push(`${focus.name}: ${sci(focus.T)}`);if(at('col'))lines.push(`one human life holds 10^${(Math.log10(2.5e9)-s.E).toFixed(1)} windows`);readout(ctx,lines,14,top+8,{size:12})}
      if(s.tour&&s.tour.i>0){const T=s.tour;text(ctx,(T.label||'')+T.i,cx,cy-Rv+34,{size:26+T.flash*24,color:C.yellow,alpha:T.done?.7:1})}
      s.pops.forEach((q,i)=>{const u=q.age/2.4;text(ctx,q.t,cx,cy-Rv*.45+i*26-u*10,{size:q.size,color:q.col,alpha:u<.75?1:Math.max(0,1-(u-.75)/.25)})});
      if(s.t<6&&s.E===E0&&!s.tour)text(ctx,'drag, roll the wheel, or use ▲ ▼',cx,cy-Rv*.72,{size:15,alpha:.6})}
  });
  if(!s)return null;const cv=s.cv;
  cv.addEventListener('wheel',e=>{e.preventDefault();s.setE(s,s.target+e.deltaY*.004)},{passive:false});
  slide(px+'-e',v=>{if(Math.abs(v-s.target)>.001)s.setE(s,v)},v=>'10'+sup(Math.round(v))+' s');
  document.querySelectorAll(`[data-${px}stop]`).forEach(b=>b.addEventListener('click',()=>s.setE(s,parseFloat(b.getAttribute(`data-${px}stop`)))));
  const E_STOPS=stops;
  Chalk.pad(s,{labels:{up:'longer ×10',down:'shorter ÷10',left:'last stop',right:'next stop',a:'freeze or poke',b:'x-ray',start:'one second'},help:'<b>▲ ▼</b> make the window ten times longer or shorter. <b>◀ ▶</b> jump between events. <b>A</b> freezes time, or pokes it if you are down at the Planck time. <b>B</b> shows the numbers.<span class="keys"> Keys: arrows, <kbd>Z</kbd>, <kbd>X</kbd>, <kbd>Enter</kbd>.</span>',
    on(k,d){if(!d||(s.tour&&!s.tour.done))return;if(k==='up'||k==='down'){s.setE(s,Math.round(s.target)+(k==='up'?1:-1));sfx('tick')}
      else if(k==='left'||k==='right'){const list=E_STOPS.slice().sort((a,b)=>a-b);const cur=s.target;const nx=k==='right'?list.find(e=>e>cur+.05):list.slice().reverse().find(e=>e<cur-.05);if(nx!=null){s.setE(s,nx);sfx('tick')}else sfx('no')}
      else if(k==='a'){if(s.E<-40){s.poked++;s.pokeT=1.2;sfx('big');s.say(s,s.poked===1?'you poked the Planck time. Nobody knows what is down here.':['space and time may come in grains here','gravity and quantum physics collide here','no experiment has ever reached this'][s.poked%3],C.yellow,18)}else{s.frozen=!s.frozen;sfx('blip')}}
      else if(k==='b'){s.xray=!s.xray;try{localStorage.setItem('chalk:xray',s.xray?'1':'0')}catch(e){}sfx('blip')}
      else if(k==='start'){s.setE(s,0);s.frozen=false;sfx('blip')}}});
  return s}
const STOPS=EV.map(o=>+o.E.toFixed(2)).concat([0]);
const slow=makeLens('cv-slow','sl',0,STOPS.filter(e=>e>=-.1)),fast=makeLens('cv-fast','fa',0,STOPS.filter(e=>e<=.1));
const either=f=>(slow&&f(slow))||(fast&&f(fast));
Chalk.bet('sl-bet',{canvas:'cv-slow',placed:'Squeezing 4.5 billion years into a day.',
  pick(p,api){if(!slow)return;api.busy=true;slow.setE(slow,Math.log10(86400),true);const list=[];for(let e=5;e<=17;e++)list.push(e);list.push(Math.log10(1.43e17));slow.tour=null;slow.fly(slow,list,()=>{api.busy=false;slow.betDone=true;const lv=Chalk.level();
    const head=p==='seconds'?'You called it: about six seconds before midnight.':'About six seconds before midnight.';
    const body=lv==='k5'?'If the whole history of the Earth were squeezed into one day, the dinosaurs would vanish at about 11:40 at night, and people like us would show up in the last six seconds. All of written history fits in the last tenth of a second.':'Scale 4.5 billion years to 86,400 seconds: 300,000 years of Homo sapiens becomes 5.7 seconds, the 66 million years since the dinosaurs becomes 21 minutes, and 5,000 years of writing becomes 0.1 second. Deep time is mostly time without us.';
    api.say(`<b>${head}</b> ${body}`)})}});
Chalk.bet('fa-bet',{canvas:'cv-fast',placed:'Counting down.',
  pick(p,api){if(!fast)return;api.busy=true;fast.setE(fast,0,true);const list=[];for(let e=-1;e>=-18;e--)list.push(e);fast.fly(fast,list,()=>{api.busy=false;fast.betDone=true;const lv=Chalk.level();
    const head=p==='as'?'You called it: the attoseconds win.':'The attoseconds win.';
    const body=lv==='k5'?'There are a billion billion attoseconds in one second. Since the Big Bang there have been fewer seconds than that: about half as many. A single second holds more attoseconds than the universe has had seconds.':'1 s = 10¹⁸ as, while the universe is 4.4 × 10¹⁷ s old. So a single second holds more than twice as many attoseconds as there have been seconds since the Big Bang. On a log scale, you sit between them.';
    api.say(`<b>${head}</b> ${body}`)})}});
Chalk.start({key:'time',missions:MISSION_DEFS,unitWhy:UNIT_WHY,checks:Object.assign({
  t1:()=>either(s=>s.maxE>=4.9),t1b:()=>either(s=>s.maxE>=7.4),t1c:()=>either(s=>s.maxE>=17.6),t1d:()=>either(s=>s.maxE>=21.6),t1e:()=>!!(slow&&slow.betDone),
  t2:()=>either(s=>s.minE<=-2.3),t2b:()=>either(s=>s.minE<=-13.9),t2c:()=>either(s=>s.minE<=-18.6),t2d:()=>either(s=>s.minE<=-43),t2e:()=>either(s=>s.poked>0),t2f:()=>!!(fast&&fast.betDone)
},Object.fromEntries(Array.from({length:2},(_,i)=>[`tb${i+1}`,()=>Chalk.checkPassed(`ch${i+1}`)])))});
