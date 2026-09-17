const {C,rgba,clamp,dist,$,fmt,sup,pct,text,circle,glow,shade,poly,rr,box,marble,readout,arrow,rng,at,makeSim,hook,slide}=Chalk;
const R=Math.random;
const syncT=(id,on,label)=>{const b=$(id);if(!b)return;b.classList.toggle('is-on',on);b.setAttribute('aria-pressed',String(on));b.textContent=label(on)};
const toggle=(id,get,set,label)=>{hook(id,()=>{set(!get());syncT(id,get(),label)});syncT(id,get(),label)};
const sgroup=(attr,fn)=>document.querySelectorAll(`[${attr}]`).forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll(`[${attr}]`).forEach(x=>x.classList.toggle('is-on',x===b));fn(b.getAttribute(attr))}));
const gauss=()=>{let u=0,v=0;while(!u)u=R();while(!v)v=R();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
const poisson=m=>{if(m<=0)return 0;if(m>30)return Math.max(0,Math.round(m+Math.sqrt(m)*gauss()));const L=Math.exp(-m);let k=0,p=1;do{k++;p*=R()}while(p>L);return k-1};
const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const mix=(a,b,t)=>{const A=hex(a),B=hex(b);return `rgb(${A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(',')})`};
const BASECOL={A:C.yellow,T:C.blue,C:C.pink,G:C.green};
const hm=m=>`${Math.floor(m/60)}:${String(Math.round(m%60)).padStart(2,'0')}`;

/* ---------- CH1: copy me ---------- */
const cp=makeSim('cv-copy',{
  init(s){s.L=24;s.err=.03;s.proof=false;s.did10=false;s.broke=false;s.cleanDone=false;s.reset(s)},
  reset(s){s.orig=Array.from({length:s.L},()=>'ACGT'[Math.floor(R()*4)]);s.rows=[];s.n=0;s.maxDiff=0;s.clean=0;s.last=s.orig.slice();s.lastChanged=0},
  rate(s){return s.proof?s.err/100:s.err},
  diff(s,a){let d=0;for(let i=0;i<s.L;i++)if(a[i]!==s.orig[i])d++;return d},
  copy(s){const e=s.rate(s);let changed=0;const nx=s.last.map(ch=>{if(R()<e){changed++;const o='ACGT'.replace(ch,'');return o[Math.floor(R()*3)]}return ch});s.last=nx;s.n++;s.rows.push(nx);if(s.rows.length>8)s.rows.shift();const d=s.diff(s,nx);s.maxDiff=Math.max(s.maxDiff,d);s.lastChanged=changed;if(!s.proof&&d>=s.L/2)s.broke=true;if(s.proof&&changed===0)s.clean++;else s.clean=0;if(s.n>=10)s.did10=true;if(s.clean>=10)s.cleanDone=true},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const cell=Math.min(22,(w-150)/s.L),x0=64;const nrows=h<300?5:8;const rh=Math.min(28,(h-100)/(nrows+1.4)),y0=14;
    const row=(arr,y,label,d,isOrig)=>{text(ctx,label,x0-8,y+rh/2,{size:12,align:'right',fam:'body',alpha:.75});for(let i=0;i<s.L;i++){const ch=arr[i],bad=!isOrig&&ch!==s.orig[i],x=x0+i*cell;if(bad){ctx.fillStyle=rgba(C.pink,.32);ctx.fillRect(x+1,y+2,cell-2,rh-4)}text(ctx,ch,x+cell/2,y+rh/2,{size:Math.min(17,cell*.95),color:bad?C.pink:BASECOL[ch],fam:'mono',alpha:isOrig?1:.92})}if(d!=null)text(ctx,d?d+' wrong':'perfect',x0+cell*s.L+8,y+rh/2,{size:12,align:'left',fam:'body',color:d?C.pink:C.green,alpha:.9})};
    row(s.orig,y0,'original',null,true);const rows=s.rows.slice(-nrows);rows.forEach((r,i)=>row(r,y0+rh*1.4+i*rh,'copy '+(s.n-rows.length+1+i),s.diff(s,r),false));
    if(!s.n)text(ctx,'press Copy it: every copy is made from the copy before',w/2,y0+rh*2.4,{size:17,alpha:.6});
    const e=s.rate(s),d=s.rows.length?s.diff(s,s.last):0;const lines=[`copies made: ${s.n} · mistakes in the newest copy: ${d} of ${s.L} · proofreading ${s.proof?'ON':'off'}`];
    if(at('g8'))lines.push(`expected mistakes so far: rate × letters × copies = ${(e*100).toFixed(e<.01?3:1)}% × ${s.L} × ${s.n} = ${(e*s.L*s.n).toFixed(1)}`);
    if(at('hs'))lines.push(`chance a letter is still right after ${s.n} copies: (1 − ${e.toFixed(e<.01?4:2)})^${s.n} = ${(Math.pow(1-e,s.n)*100).toFixed(1)}%`);
    if(at('col'))lines.push(`rate per letter per copy: ${e.toExponential(1)}${s.proof?' (proofreading divides the raw rate by 100)':''}`);
    if(at('max'))lines.push(`e·L = ${(e*s.L).toFixed(2)} per copy: the recipe keeps its information while this stays well below 1`);
    readout(ctx,lines,16,y0+rh*1.4+nrows*rh+10,{size:12})}
});
hook('cp-copy',()=>cp&&cp.copy(cp));hook('cp-ten',()=>{if(cp)for(let i=0;i<10;i++)cp.copy(cp)});hook('cp-reset',()=>cp&&cp.reset(cp));
slide('cp-err',v=>{if(cp)cp.err=v/100},v=>v+'% per letter');
toggle('cp-proof',()=>cp&&cp.proof,v=>{if(cp){cp.proof=v;cp.clean=0}},v=>'Proofreading: '+(v?'on':'off'));

/* ---------- CH2: the moth game ---------- */
const mo=makeSim('cv-moth',{
  init(s){s.N=40;s.soot=.1;s.auto=false;s.dark70=false;s.pale30=false;s.stable=false;s.ate10=false;s.reset(s)},
  reset(s){s.moths=Array.from({length:s.N},()=>({sh:clamp(.5+gauss()*.2,0,1),x:0,y:0,alive:true}));s.scatter(s);s.phase='idle';s.timer=0;s.eaten=0;s.gen=0;s.hist=[s.mean(s.moths)];s.msg='';s.autoGens=0;s.wait=0;s.stat=null;s.wasAuto=false},
  scatter(s){for(const m of s.moths){m.x=.05+R()*.9;m.y=.1+R()*.72}},
  mean(a){const v=a.filter(m=>m.alive);return v.length?v.reduce((t,m)=>t+m.sh,0)/v.length:0},
  start(s){if(s.phase==='hunt')return;s.phase='hunt';s.timer=8;s.eaten=0;s.msg='';for(const m of s.moths)m.alive=true;s.scatter(s);s.wasAuto=false},
  eatAt(p,s){if(s.phase!=='hunt')return;const r=Math.max(16,s.w*.035);let best=null,bd=1e9;for(const m of s.moths){if(!m.alive)continue;const d=Math.hypot(m.x*s.w-p.x,m.y*s.h-p.y);if(d<r&&d<bd){bd=d;best=m}}if(best){best.alive=false;s.eaten++;if(s.eaten>=10)s.ate10=true;if(s.eaten>=s.N/2)s.endRound(s)}},
  down(p,s){if(s.phase==='idle')s.start(s);else s.eatAt(p,s)},
  autoRound(s){for(const m of s.moths)m.alive=true;s.scatter(s);const sc=s.moths.map(m=>({m,k:Math.abs(m.sh-s.soot)+R()*.22})).sort((a,b)=>b.k-a.k);for(let i=0;i<s.N/2;i++)sc[i].m.alive=false;s.eaten=s.N/2;s.wasAuto=true;s.endRound(s)},
  endRound(s){s.phase='breed';s.timer=1.2;const all=s.moths,sur=all.filter(m=>m.alive);const before=all.reduce((t,m)=>t+m.sh,0)/all.length;
    const pale=all.filter(m=>m.sh<.5),dark=all.filter(m=>m.sh>=.5);const st={paleN:pale.length,paleS:pale.filter(m=>m.alive).length,darkN:dark.length,darkS:dark.filter(m=>m.alive).length,S:0,Rr:0,varb:0};
    const next=[];if(!sur.length){s.msg='every moth was eaten: the population went extinct. Starting over.';for(let i=0;i<s.N;i++)next.push({sh:clamp(.5+gauss()*.2,0,1),alive:true,x:0,y:0})}
    else{const sm=sur.reduce((t,m)=>t+m.sh,0)/sur.length;st.S=sm-before;for(let i=0;i<s.N;i++){const p=sur[Math.floor(R()*sur.length)];next.push({sh:clamp(p.sh+gauss()*.05,0,1),alive:true,x:0,y:0})}}
    s.moths=next;s.scatter(s);s.gen++;const mn=s.mean(next);st.Rr=mn-before;st.varb=next.reduce((t,m)=>t+(m.sh-mn)**2,0)/next.length;s.stat=st;s.hist.push(mn);if(s.hist.length>200)s.hist.shift();
    if(mn>.7&&s.soot>.6)s.dark70=true;if(s.dark70&&mn<.3&&s.soot<.4)s.pale30=true;
    if(s.wasAuto&&Math.abs(s.soot-.5)<=.1){s.autoGens++;if(s.autoGens>=20&&Math.abs(mn-.5)<.1)s.stable=true}else s.autoGens=0;
    if(sur.length)s.msg=`generation ${s.gen}: ${sur.length} of ${s.N} survived and bred. Average darkness now ${(mn*100).toFixed(0)}%`},
  run20(s){for(let i=0;i<20;i++)s.autoRound(s);s.phase='breed';s.timer=1.2},
  step(dt,s){if(s.phase==='hunt'){s.timer-=dt;if(s.timer<=0)s.endRound(s)}else if(s.phase==='breed'){s.timer-=dt;if(s.timer<=0){s.phase='idle';s.wait=0}}else if(s.auto){s.wait+=dt;if(s.wait>1.3){s.wait=0;s.autoRound(s)}}},
  bark(s){const key=[s.w,s.h,s.soot].join();if(s.bk&&s.bk.key===key)return s.bk.c;const c=document.createElement('canvas');const dpr=Chalk.lowPower?1:Math.min(devicePixelRatio||1,2);c.width=s.w*dpr;c.height=s.h*dpr;const g=c.getContext('2d');g.scale(dpr,dpr);g.fillStyle=mix('#D8CBB2','#2A2622',s.soot);g.fillRect(0,0,s.w,s.h);const r=rng(11);const dark=mix('#8A7758','#0E0C0B',s.soot),light=mix('#F2EAD8','#4A423B',s.soot);
    for(let i=0;i<70;i++){const x=r()*s.w,wob=6+r()*10,a=.10+r()*.16;g.strokeStyle=r()<.5?dark:light;g.globalAlpha=a;g.lineWidth=1+r()*3;g.beginPath();for(let y=0;y<=s.h;y+=12)g.lineTo(x+Math.sin(y/40+i)*wob,y);g.stroke()}
    g.globalAlpha=.25;for(let i=0;i<9;i++){const x=r()*s.w,y=r()*s.h,rr2=8+r()*14;g.strokeStyle=dark;g.lineWidth=2;for(let k=1;k<4;k++){g.beginPath();g.ellipse(x,y,rr2*k*.5,rr2*k*.32,r()*.6,0,Math.PI*2);g.stroke()}}
    g.globalAlpha=1;s.bk={key,c};return c},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);ctx.drawImage(s.bark(s),0,0,w,h);const r=Math.max(9,w*.02);
    for(const m of s.moths){if(!m.alive)continue;const x=m.x*w,y=m.y*h,col=mix('#EFE8D6','#23262A',m.sh);ctx.save();ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x-r*.55,y,r*.75,r*.5,-.35,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(x+r*.55,y,r*.75,r*.5,.35,0,Math.PI*2);ctx.fill();ctx.fillStyle=mix('#EFE8D6','#23262A',clamp(m.sh+.25,0,1));ctx.globalAlpha=.45;circle(ctx,x-r*.6,y-r*.05,r*.16,ctx.fillStyle);circle(ctx,x+r*.6,y-r*.05,r*.16,ctx.fillStyle);ctx.globalAlpha=1;ctx.strokeStyle=mix('#EFE8D6','#23262A',clamp(m.sh+.3,0,1));ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x,y-r*.35);ctx.lineTo(x,y+r*.4);ctx.stroke();ctx.restore()}
    const mn=s.mean(s.moths);const lines=[];
    if(s.phase==='hunt'){lines.push(`EAT THE MOTHS  ·  ${s.timer.toFixed(1)} s left  ·  eaten ${s.eaten}`);ctx.save();ctx.fillStyle=rgba(C.yellow,.85);ctx.fillRect(0,h-6,w*s.timer/8,6);ctx.restore()}
    else lines.push(s.phase==='idle'&&!s.gen?'tap the bark to start a round: you are the bird':`generation ${s.gen} · average darkness ${(mn*100).toFixed(0)}% · bark ${(s.soot*100).toFixed(0)}% sooty`);
    const st=s.stat;if(st&&at('g8')&&s.phase!=='hunt')lines.push(`last round: pale survived ${st.paleS} of ${st.paleN}, dark survived ${st.darkS} of ${st.darkN}`);
    if(st&&at('hs')&&s.phase!=='hunt')lines.push(`survival: pale ${st.paleN?Math.round(100*st.paleS/st.paleN):'–'}% · dark ${st.darkN?Math.round(100*st.darkS/st.darkN):'–'}%`);
    if(st&&at('col')&&s.phase!=='hunt')lines.push(`S (survivors − population) = ${st.S>=0?'+':''}${st.S.toFixed(3)} · R (next − population) = ${st.Rr>=0?'+':''}${st.Rr.toFixed(3)} · h² ≈ R/S = ${Math.abs(st.S)>.005?(st.Rr/st.S).toFixed(2):'–'}`);
    if(st&&at('max')&&s.phase!=='hunt')lines.push(`variance of darkness ${st.varb.toFixed(4)}: it shrinks under stabilizing selection, mutation (σ = 0.05) refills it`);
    readout(ctx,lines,16,12,{size:12});
    if(s.msg&&s.phase!=='hunt')text(ctx,s.msg,w/2,h*.9-(at('g8')?44:0),{size:Math.min(17,w*.032),color:C.yellow,alpha:.95});
    if(at('g8')&&s.hist.length>1){const gx=16,gw=w-32,gy=h-44,gh=36;ctx.save();ctx.fillStyle=rgba(C.board,.55);ctx.fillRect(gx-4,gy-4,gw+8,gh+8);ctx.strokeStyle=rgba(C.chalk,.5);ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(gx,gy+gh*(1-s.soot));ctx.lineTo(gx+gw,gy+gh*(1-s.soot));ctx.stroke();ctx.setLineDash([]);const n=s.hist.length;ctx.strokeStyle=C.yellow;ctx.lineWidth=2;ctx.beginPath();s.hist.forEach((v,i)=>{const x=gx+gw*i/Math.max(n-1,20),y=gy+gh*(1-v);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();text(ctx,'darkness over generations (dashed: bark)',gx+gw,gy-8,{size:11,align:'right',fam:'body',alpha:.7});ctx.restore()}}
});
hook('mo-go',()=>mo&&mo.start(mo));hook('mo-run',()=>mo&&mo.run20(mo));hook('mo-reset',()=>mo&&mo.reset(mo));
slide('mo-soot',v=>{if(mo)mo.soot=v},v=>Math.round(v*100)+'%');
toggle('mo-auto',()=>mo&&mo.auto,v=>{if(mo)mo.auto=v},v=>'Automatic bird: '+(v?'on':'off'));

/* ---------- CH3: pea flips ---------- */
const pe=makeSim('cv-pea',{
  init(s){s.p1='Tt';s.p2='Tt';s.done3b=false;s.half=false;s.allTall=false;s.d40=false;s.reset(s)},
  reset(s){s.tall=0;s.short=0;s.gt={TT:0,Tt:0,tt:0};s.last=[]},
  key(s){return [s.p1,s.p2].sort().join('×')},
  pShort(s){const q1=(s.p1.split('t').length-1)/2,q2=(s.p2.split('t').length-1)/2;return q1*q2},
  grow(s,n){for(let i=0;i<n;i++){const a=s.p1[Math.floor(R()*2)],b=s.p2[Math.floor(R()*2)];const g=(a==='T'&&b==='T')?'TT':(a==='t'&&b==='t')?'tt':'Tt';s.gt[g]++;if(g==='tt')s.short++;else s.tall++;s.last.push(g);if(s.last.length>40)s.last.shift()}
    const tot=s.tall+s.short,k=s.key(s);if(k==='Tt×Tt'&&tot>=40)s.d40=true;if(k==='Tt×Tt'&&tot>=100&&Math.abs(s.tall/tot-.75)<=.05)s.done3b=true;if(k==='Tt×tt'&&tot>=40)s.half=true;if((k==='TT×Tt'||k==='TT×tt')&&tot>=20)s.allTall=true},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const narrow=w<520;const lx=narrow?w*.5:w*.32;
    // parents + Punnett
    const px=lx*.5,sq=Math.min(lx*.5,h*.34),sx=px-sq/2,sy=narrow?54:70;text(ctx,'Parent 1: '+s.p1,px,sy-30,{size:16,color:C.green});text(ctx,'Parent 2: '+s.p2,px,sy-12,{size:16,color:C.yellow});
    const g1=s.p1.split(''),g2=s.p2.split('');for(let i=0;i<2;i++){text(ctx,g1[i],sx+sq*(.25+.5*i),sy+sq+14,{size:15,color:C.green});text(ctx,g2[i],sx-12,sy+sq*(.25+.5*i),{size:15,color:C.yellow})}
    for(let i=0;i<2;i++)for(let j=0;j<2;j++){const a=g1[i],b=g2[j];const g=(a==='T'&&b==='T')?'TT':(a==='t'&&b==='t')?'tt':(a==='T'?'Tt':'tT');const tall=g!=='tt';box(ctx,sx+sq/2*i,sy+sq/2*j,sq/2,sq/2,rgba(tall?C.green:C.yellow,.18),C.chalk,4,1.5);text(ctx,g,sx+sq/2*i+sq/4,sy+sq/2*j+sq/4-6,{size:17});text(ctx,tall?'tall':'short',sx+sq/2*i+sq/4,sy+sq/2*j+sq/4+12,{size:12,fam:'body',alpha:.8,color:tall?C.green:C.yellow})}
    text(ctx,at('g8')?'one copy from each parent':'one card from each parent',px,sy+sq+34,{size:13,fam:'body',alpha:.7});
    // bars
    const tot=s.tall+s.short,exp=1-s.pShort(s);const bx=narrow?24:lx+30,bw=(w-bx-24),by=narrow?sy+sq+56:40,bh=narrow?h-by-70:h*.5;
    const bar=(i,label,n,e,col)=>{const x=bx+i*bw*.5+bw*.08,ww=bw*.34,f=tot?n/tot:0;box(ctx,x,by+bh*(1-f),ww,bh*f,rgba(col,.35),col,4,2);ctx.save();ctx.setLineDash([5,4]);ctx.strokeStyle=C.chalk;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x-6,by+bh*(1-e));ctx.lineTo(x+ww+6,by+bh*(1-e));ctx.stroke();ctx.restore();text(ctx,`${label}: ${n}`,x+ww/2,by+bh+16,{size:15,color:col});text(ctx,tot?Math.round(100*f)+'%':'',x+ww/2,by+bh*(1-f)-12,{size:14})};
    bar(0,'tall',s.tall,exp,C.green);bar(1,'short',s.short,1-exp,C.yellow);text(ctx,'dashed: expected',bx+bw/2,by-14,{size:11,fam:'body',alpha:.65});
    // last 40 peas
    if(!narrow){const py=by+bh+44,pw=bw/40;s.last.forEach((g,i)=>{const x=bx+i*pw+pw/2;const tall=g!=='tt';ctx.save();ctx.strokeStyle=C.green;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x,py+14);ctx.lineTo(x,py+14-(tall?22:8));ctx.stroke();ctx.restore();circle(ctx,x,py+14-(tall?22:8),Math.min(4,pw*.4),tall?C.green:C.yellow)})}
    const lines=[`tall ${s.tall} · short ${s.short} · out of ${tot}`];
    if(!at('g8'))lines.push(`expected: ${Math.round(exp*4)} tall out of every 4`);
    if(at('g8'))lines.push(`expected tall ${Math.round(exp*100)}% · you got ${tot?Math.round(100*s.tall/tot):'–'}%`);
    if(at('hs'))lines.push(`genotypes: TT ${s.gt.TT} · Tt ${s.gt.Tt} · tt ${s.gt.tt}`);
    if(at('col')&&tot){const p=(2*s.gt.TT+s.gt.Tt)/(2*tot),q=1-p;lines.push(`allele T among offspring p = ${p.toFixed(2)}; random mating next would give TT ${Math.round(p*p*100)}%, Tt ${Math.round(2*p*q*100)}%, tt ${Math.round(q*q*100)}%`)}
    if(at('max')&&tot){let chi=0;[[s.tall,exp],[s.short,1-exp]].forEach(([o,e])=>{const E=e*tot;if(E>0)chi+=(o-E)**2/E});lines.push(`χ² against the expected ratio = ${chi.toFixed(2)} (1 df): doubt the ratio only above 3.84`)}
    readout(ctx,lines,16,h-6-lines.length*17-8,{size:12})}
});
sgroup('data-p1',v=>{if(pe){pe.p1=v;pe.reset(pe)}});sgroup('data-p2',v=>{if(pe){pe.p2=v;pe.reset(pe)}});
hook('pe-1',()=>pe&&pe.grow(pe,1));hook('pe-10',()=>pe&&pe.grow(pe,10));hook('pe-100',()=>pe&&pe.grow(pe,100));hook('pe-reset',()=>pe&&pe.reset(pe));

/* ---------- CH4: the bacteria race ---------- */
const MU=7e-5;
const bc=makeSim('cv-germ',{
  init(s){s.T=20;s.K=10000;s.run=false;s.A=false;s.B=false;const r=rng(7);s.pts=[];while(s.pts.length<400){const x=r()*2-1,y=r()*2-1;if(x*x+y*y<.9)s.pts.push([x,y])}s.fl=null;s.mBig=false;s.mCleared=false;s.mTake=false;s.mAfter=false;s.reset(s)},
  reset(s){s.S=10;s.RA=0;s.RB=0;s.RAB=0;s.min=0;s.maxN=10;s.dosedEver=false;s.cleared=false;s.takeover=false;s.clearedAfter=false;s.hist=[];s.msg='';s.big=false;s.had100=false;s.births=0;s.mut=0;s.run=false;s.A=false;s.B=false;syncT('bc-run',false,v=>v?'Pause':'Run');syncT('bc-a',false,v=>'Antibiotic A: '+(v?'on':'off'));syncT('bc-b',false,v=>'Antibiotic B: '+(v?'on':'off'))},
  N(s){return s.S+s.RA+s.RB+s.RAB},
  step(dt,s){if(!s.run)return;const mins=dt*20,sub=Math.max(1,Math.ceil(mins/2)),hh=mins/sub;
    for(let k=0;k<sub;k++){const N=s.N(s);if(N<=0)break;const cap=Math.max(0,1-N/s.K),r=Math.LN2/s.T*cap,rr=r*.9;
      const bS=r*s.S*hh,bRA=rr*s.RA*hh,bRB=rr*s.RB*hh,bRAB=rr*.9*s.RAB*hh;s.births+=bS+bRA+bRB+bRAB;
      const mA=poisson(MU*bS),mB=poisson(MU*bS),mAB1=poisson(MU*bRA),mAB2=poisson(MU*bRB);s.mut+=mA+mB+mAB1+mAB2;
      s.S+=bS-mA-mB;s.RA+=bRA+mA-mAB1;s.RB+=bRB+mB-mAB2;s.RAB+=bRAB+mAB1+mAB2;
      const kill=1-Math.exp(-Math.LN2/8*hh);if(s.A){s.S-=s.S*kill;s.RB-=s.RB*kill}if(s.B){s.S-=s.S*kill;s.RA-=s.RA*kill}
      for(const q of['S','RA','RB','RAB'])if(s[q]<.5)s[q]=0;
      s.min+=hh;const N2=s.N(s);s.maxN=Math.max(s.maxN,N2);if(N2>=100)s.had100=true;if(N2>=.95*s.K){s.big=true;s.mBig=true}if(s.A||s.B)s.dosedEver=true;
      const Rs=s.RA+s.RB+s.RAB;if(s.dosedEver&&N2>=s.K/2&&Rs/N2>=.9&&!s.takeover){s.takeover=true;s.mTake=true;s.msg='resistance has taken over: every cell in the dish shrugs off '+(s.RAB>Rs/2?'both drugs':s.RB>s.RA?'B':'A')}
      if(N2<1&&s.had100&&!s.cleared){s.cleared=true;s.mCleared=true;if(s.takeover){s.clearedAfter=true;s.mAfter=true}s.msg='the dish is clear';s.run=false;syncT('bc-run',false,v=>v?'Pause':'Run')}
      if(!s.hist.length||s.min-s.hist[s.hist.length-1].t>=2)s.hist.push({t:s.min,N:N2,Rs,A:s.A,B:s.B})}},
  fluct(s){const res=[];for(let d=0;d<10;d++){let N=10,Rm=0;for(let g=0;g<10;g++){const m=poisson(MU*N);Rm=Rm*2+m;N*=2}res.push(Rm)}const mean=res.reduce((a,b)=>a+b,0)/10,v=res.reduce((a,b)=>a+(b-mean)**2,0)/9;s.fl={res,mean,v}},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const narrow=w<520;const cx=narrow?w*.5:w*.27,cy=narrow?h*.36:h*.52,rd=narrow?Math.min(w*.3,h*.24):Math.min(w*.23,h*.4);
    circle(ctx,cx,cy,rd,rgba(C.chalk,.06),C.chalk,2);const N=s.N(s);
    if(s.A||s.B){ctx.save();ctx.globalAlpha=.16;circle(ctx,cx,cy,rd-2,s.A&&s.B?C.yellow:s.A?C.pink:C.blue);ctx.restore()}
    const cnt=N>=1?clamp(Math.round(N/s.K*400),1,400):0;const nRA=Math.round(cnt*s.RA/N)||0,nRB=Math.round(cnt*s.RB/N)||0,nRAB=Math.round(cnt*s.RAB/N)||0;
    for(let i=0;i<cnt;i++){const[x,y]=s.pts[i];const col=i<nRA?C.pink:i<nRA+nRB?C.blue:i<nRA+nRB+nRAB?C.yellow:C.green;circle(ctx,cx+x*rd*.95,cy+y*rd*.95,narrow?2.2:3,col)}
    text(ctx,N>=1?`${Math.round(N).toLocaleString()} cells`:'empty',cx,cy+rd+16,{size:15});
    // curve
    const gx=narrow?24:w*.55,gw=narrow?w-48:w-gx-20,gy=narrow?h*.66:34,gh=narrow?h*.2:h*.52;const tmax=Math.max(240,Math.ceil(s.min/120)*120);const log=at('hs');const yof=v=>log?gy+gh*(1-Math.log10(Math.max(1,v))/Math.log10(s.K)):gy+gh*(1-v/s.K);
    ctx.save();ctx.strokeStyle=rgba(C.chalk,.4);ctx.lineWidth=1;ctx.strokeRect(gx,gy,gw,gh);for(const p of s.hist){if(p.A||p.B){ctx.fillStyle=rgba(p.A&&p.B?C.yellow:p.A?C.pink:C.blue,.12);ctx.fillRect(gx+gw*p.t/tmax,gy,Math.max(1,gw*2/tmax),gh)}}
    const line=(f,col)=>{ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();s.hist.forEach((p,i)=>{const x=gx+gw*p.t/tmax,y=yof(f(p));i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke()};
    if(s.hist.length>1){line(p=>p.N,C.chalk);line(p=>p.Rs,C.pink)}ctx.restore();
    text(ctx,log?'cells (log scale)':'cells',gx+4,gy-10,{size:11,align:'left',fam:'body',alpha:.7});text(ctx,`time → ${hm(tmax)}`,gx+gw,gy+gh+12,{size:11,align:'right',fam:'body',alpha:.7});text(ctx,(log?'10,000':'10,000'),gx-4,gy+4,{size:10,align:'right',fam:'body',alpha:.6});
    const Rs=s.RA+s.RB+s.RAB;const lines=[`time ${hm(s.min)} · germs ${Math.round(N).toLocaleString()} · A ${s.A?'ON':'off'}${at('hs')?' · B '+(s.B?'ON':'off'):''}`];
    if(at('g8'))lines.push(`resistant: ${Math.round(Rs).toLocaleString()} (${N?Math.round(100*Rs/N):0}%) · doubling every ${s.T} min`);
    if(at('hs'))lines.push(`unlimited growth would give 10 · 2^(${Math.round(s.min)}/${s.T}) = ${(10*Math.pow(2,s.min/s.T)).toExponential(1)}; the dish holds 10,000`);
    if(at('col'))lines.push(`r = ln 2 ÷ T = ${(Math.LN2/s.T*60).toFixed(2)} per hour · births so far ${Math.round(s.births).toLocaleString()} · expected mutants μ·births = ${(MU*s.births).toFixed(1)} (seen ${s.mut})`);
    if(at('max')&&s.fl)lines.push(`fluctuation test, 10 dishes: ${s.fl.res.join(', ')} resistant → mean ${s.fl.mean.toFixed(1)}, variance ${s.fl.v.toFixed(1)}${s.fl.v>s.fl.mean?': jackpots, so mutations came before the drug':''}`);
    readout(ctx,lines,16,12,{size:12});
    if(s.msg)text(ctx,s.msg,w/2,h-16,{size:Math.min(16,w*.03),color:s.cleared?C.green:C.pink});
    if(!s.run&&s.min===0)text(ctx,'press Run',cx,cy,{size:22,alpha:.6})}
});
toggle('bc-run',()=>bc&&bc.run,v=>{if(bc)bc.run=v},v=>v?'Pause':'Run');
toggle('bc-a',()=>bc&&bc.A,v=>{if(bc)bc.A=v},v=>'Antibiotic A: '+(v?'on':'off'));
toggle('bc-b',()=>bc&&bc.B,v=>{if(bc)bc.B=v},v=>'Antibiotic B: '+(v?'on':'off'));
slide('bc-T',v=>{if(bc)bc.T=v},v=>v+' min');hook('bc-reset',()=>bc&&bc.reset(bc));hook('bc-fluct',()=>bc&&bc.fluct(bc));

/* ---------- CH5: drift island ---------- */
const dr=makeSim('cv-drift',{
  init(s){s.N=10;s.p0=.5;s.run=false;const r=rng(3);s.pts=[];while(s.pts.length<200){const x=r()*2-1,y=r()*2-1;if(x*x+y*y<.92)s.pts.push([x,y])}s.fixed10=false;s.kept200=false;s.jump=false;s.trials=null;s.reset(s)},
  reset(s){s.gen=0;s.pop=Array.from({length:s.N},(_,i)=>i<Math.round(s.N*s.p0)?1:0);s.hist=[s.p(s)];s.fixed=false;s.acc=0;s.storm=false;s.msg='';s.run=false;syncT('dr-run',false,v=>'Run: '+(v?'on':'off'))},
  p(s){return s.pop.length?s.pop.reduce((a,b)=>a+b,0)/s.pop.length:0},
  stepGen(s){if(s.fixed&&!s.storm)return;const before=s.p(s);const n=s.storm?5:s.N;const src=s.pop;s.pop=Array.from({length:n},()=>src[Math.floor(R()*src.length)]);const wasStorm=s.storm;s.storm=false;s.gen++;const p=s.p(s);s.hist.push(p);if(s.hist.length>400)s.hist.shift();
    if(wasStorm&&before>0&&before<1&&Math.abs(p-before)>=.2)s.jump=true;
    if(p===0||p===1){s.fixed=true;s.run=false;syncT('dr-run',false,v=>'Run: '+(v?'on':'off'));s.msg=`${p===1?'red':'blue'} is all that is left, after ${s.gen} generations, by luck alone`;if(s.N===10)s.fixed10=true}
    if(s.N===200&&s.gen>=50&&!s.fixed)s.kept200=true},
  doStorm(s){s.storm=true;s.fixed=false;s.msg='a storm: only 5 survive to breed';s.stepGen(s)},
  tenIslands(s){let red=0,tot=0;for(let i=0;i<10;i++){let pop=Array.from({length:10},(_,k)=>k<5?1:0),g=0;while(g<5000){pop=pop.map(()=>pop[Math.floor(R()*10)]);g++;const q=pop.reduce((a,b)=>a+b,0);if(q===0||q===10){if(q===10)red++;tot+=g;break}}}s.trials={red,mean:tot/10}},
  step(dt,s){if(!s.run||s.fixed)return;s.acc+=dt*4;while(s.acc>=1){s.acc-=1;s.stepGen(s)}},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const narrow=w<520;const cx=narrow?w*.5:w*.27,cy=narrow?h*.33:h*.5,rx=narrow?w*.42:w*.24,ry=narrow?h*.24:h*.38;
    ctx.save();ctx.fillStyle=rgba(C.green,.08);ctx.strokeStyle=rgba(C.green,.6);ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();
    const n=s.pop.length;const ar=Math.PI*rx*ry;const r=clamp(Math.sqrt(ar/n)/3.4,2.5,10);s.pop.forEach((c,i)=>{const[x,y]=s.pts[i];const px=cx+x*rx*.9,py=cy+y*ry*.9,col=c?C.pink:C.blue;circle(ctx,px,py,r,col);if(r>4){circle(ctx,px-r*.5,py-r*.9,r*.35,col);circle(ctx,px+r*.5,py-r*.9,r*.35,col)}});
    const p=s.p(s);const gx=narrow?24:w*.56,gw=narrow?w-48:w-gx-20,gy=narrow?h*.62:36,gh=narrow?h*.22:h*.5;ctx.save();ctx.strokeStyle=rgba(C.chalk,.4);ctx.strokeRect(gx,gy,gw,gh);ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(gx,gy+gh/2);ctx.lineTo(gx+gw,gy+gh/2);ctx.stroke();ctx.setLineDash([]);const m=Math.max(20,s.hist.length-1);ctx.strokeStyle=C.pink;ctx.lineWidth=2;ctx.beginPath();s.hist.forEach((v,i)=>{const x=gx+gw*i/m,y=gy+gh*(1-v);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();ctx.restore();
    text(ctx,'share of red',gx+4,gy-10,{size:11,align:'left',fam:'body',alpha:.7});text(ctx,`generations → ${m}`,gx+gw,gy+gh+12,{size:11,align:'right',fam:'body',alpha:.7});
    const lines=[`generation ${s.gen} · red ${Math.round(p*100)}% · blue ${Math.round((1-p)*100)}%`];
    if(at('g8'))lines.push(`${n} animals · each baby copies a random parent's colour · no colour is better`);
    if(at('hs'))lines.push(`chance red wins in the end = its share now = ${Math.round(p*100)}% · from 50%, losing a colour takes about 1.4 × N ≈ ${Math.round(1.4*s.N)} generations`);
    if(at('col'))lines.push(`sd of the change per generation √(p(1−p)/N) = ${(Math.sqrt(p*(1-p)/s.N)*100).toFixed(1)} points`);
    if(at('max'))lines.push(`heterozygosity 2pq = ${(2*p*(1-p)).toFixed(3)} · expected to shrink by (1 − 1/N) = ${(1-1/s.N).toFixed(3)} each generation`);
    if(s.trials)lines.push(`10 islands of 10 from 50%: red won ${s.trials.red} of 10 · average ${s.trials.mean.toFixed(0)} generations to lose a colour`);
    readout(ctx,lines,16,12,{size:12});if(s.msg)text(ctx,s.msg,w/2,h-16,{size:Math.min(16,w*.03),color:C.yellow})}
});
hook('dr-step',()=>dr&&dr.stepGen(dr));hook('dr-storm',()=>dr&&dr.doStorm(dr));hook('dr-reset',()=>dr&&dr.reset(dr));hook('dr-ten',()=>dr&&dr.tenIslands(dr));
slide('dr-n',v=>{if(dr){dr.N=v;dr.reset(dr)}},v=>String(v));
toggle('dr-run',()=>dr&&dr.run,v=>{if(dr){if(dr.fixed)dr.reset(dr);dr.run=v}},v=>'Run: '+(v?'on':'off'));

/* ---------- CH6: the tree of life ---------- */
const NAMES=['A','B','C','D','E'],SPC=[C.yellow,C.blue,C.pink,C.green,'#E4C4F7'];
const tr=makeSim('cv-tree',{
  init(s){s.rate=2;s.L=30;s.streak=0;s.solved=0;s.streak3=false;s.newPuzzle(s)},
  newPuzzle(s){let cl=[0,1,2,3,4].map(i=>({leaves:[i],h:0}));let hgt=0;while(cl.length>1){hgt+=1+R()*2.5;const i=Math.floor(R()*cl.length);let j=Math.floor(R()*(cl.length-1));if(j>=i)j++;const a=cl[i],b=cl[j];cl=cl.filter((c,k)=>k!==i&&k!==j).concat([{leaves:a.leaves.concat(b.leaves),h:hgt,kids:[a,b]}])}
    const root=cl[0],rs=Array.from({length:s.L},()=>Math.floor(R()*4)),seqs=[];const walk=(nd,seq)=>{if(!nd.kids){seqs[nd.leaves[0]]=seq;return}for(const k of nd.kids){const nm=poisson(s.rate*(nd.h-k.h));const sq=seq.slice();for(let m=0;m<nm;m++){const p=Math.floor(R()*s.L);sq[p]=(sq[p]+1+Math.floor(R()*3))%4}walk(k,sq)}};walk(root,rs);
    s.seqs=seqs;s.D=NAMES.map((_,i)=>NAMES.map((_,j)=>{let d=0;for(let k=0;k<s.L;k++)if(seqs[i][k]!==seqs[j][k])d++;return d}));s.maxD=Math.max(1,...s.D.flat());
    s.cl=[0,1,2,3,4].map(i=>({leaves:[i],d:0}));s.picked=[];s.mistakes=0;s.built=false;s.shown=false;s.first=s.first||false;s.perfect=s.perfect||false;s.msg='';s.lastJoin=null},
  cdist(s,A,B){let t=0,n=0;for(const a of A.leaves)for(const b of B.leaves){t+=s.D[a][b];n++}return t/n},
  best(s){let b=1e9;for(let i=0;i<s.cl.length;i++)for(let j=i+1;j<s.cl.length;j++)b=Math.min(b,s.cdist(s,s.cl[i],s.cl[j]));return b},
  pick(s,i){if(s.built)return;const ci=s.cl.findIndex(c=>c.leaves.includes(i));if(ci<0)return;if(s.picked.includes(ci)){s.picked=s.picked.filter(x=>x!==ci);return}s.picked.push(ci);if(s.picked.length===2)s.tryJoin(s)},
  join(s,a,b){const A=s.cl[a],B=s.cl[b];const node={leaves:A.leaves.concat(B.leaves),d:s.cdist(s,A,B),kids:[A,B]};s.cl=s.cl.filter((c,k)=>k!==a&&k!==b).concat([node]);s.lastJoin=node;if(s.cl.length===1){s.built=true;if(!s.shown){s.solved++;if(s.mistakes===0){s.perfect=true;s.streak++;if(s.streak>=3)s.streak3=true}else s.streak=0}}return node},
  tryJoin(s){const[a,b]=s.picked;s.picked=[];const d=s.cdist(s,s.cl[a],s.cl[b]),bst=s.best(s);const nm=c=>c.leaves.map(i=>NAMES[i]).join('');
    if(d<=bst+1e-9){const A=nm(s.cl[a]),B=nm(s.cl[b]);s.join(s,a,b);if(!s.shown)s.first=true;s.msg=s.built?`the tree is complete${s.mistakes?` with ${s.mistakes} wrong guess${s.mistakes>1?'es':''}`:', no mistakes'}`:`${A} and ${B} join: ${d.toFixed(d%1?1:0)} letters apart`}
    else{s.mistakes++;s.streak=0;s.msg=`${nm(s.cl[a])} and ${nm(s.cl[b])} differ at ${d.toFixed(d%1?1:0)} letters, but some pair differs at only ${bst.toFixed(bst%1?1:0)}`}},
  show(s){s.shown=true;s.picked=[];while(s.cl.length>1){let bi=0,bj=1,bd=1e9;for(let i=0;i<s.cl.length;i++)for(let j=i+1;j<s.cl.length;j++){const d=s.cdist(s,s.cl[i],s.cl[j]);if(d<bd){bd=d;bi=i;bj=j}}s.join(s,bi,bj)}s.msg='the answer: closest pairs joined first';s.streak=0},
  rowsGeom(s){const narrow=s.w<520;const y0=12,rh=narrow?Math.min(30,(s.h*.55-y0)/5):Math.min(46,(s.h-100)/5);const leftW=narrow?s.w:s.w*.52;const cw=Math.min(narrow?8:10,(leftW-84)/s.L);return{narrow,y0,rh,leftW,cw,x0:66}},
  down(p,s){const g=s.rowsGeom(s);if(p.x<g.leftW&&p.y>=g.y0&&p.y<g.y0+5*g.rh)s.pick(s,Math.floor((p.y-g.y0)/g.rh))},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const g=s.rowsGeom(s);
    for(let i=0;i<5;i++){const y=g.y0+i*g.rh+g.rh/2;const ci=s.cl.findIndex(c=>c.leaves.includes(i));const pk=s.picked.includes(ci);if(pk){ctx.fillStyle=rgba(C.yellow,.16);ctx.fillRect(4,y-g.rh/2+2,g.leftW-8,g.rh-4)}
      const r=Math.min(11,g.rh*.32);circle(ctx,26,y,r,SPC[i]);circle(ctx,26-r*.4,y-r*.2,r*.2,C.board);circle(ctx,26+r*.4,y-r*.2,r*.2,C.board);poly(ctx,[[26-r*.7,y+r*.9],[26-r*.7,y+r*1.3]],SPC[i],1.5);poly(ctx,[[26+r*.7,y+r*.9],[26+r*.7,y+r*1.3]],SPC[i],1.5);
      text(ctx,NAMES[i],48,y,{size:17,color:SPC[i]});
      for(let k=0;k<s.L;k++){const b=s.seqs[i][k];ctx.fillStyle=[C.yellow,C.blue,C.pink,C.green][b];ctx.globalAlpha=.85;ctx.fillRect(g.x0+k*g.cw,y-g.rh*.3,g.cw-1,g.rh*.6);ctx.globalAlpha=1}}
    // tree
    const tx=g.narrow?24:g.leftW+16,tw=g.narrow?w-48:w-tx-36,ty=g.narrow?h*.6:34,th=g.narrow?h*.3:h-110;const base=ty+th;const leafX={};let x=0;const order=[];s.cl.forEach(c=>{c.leaves.forEach(l=>order.push(l))});order.forEach((l,i)=>leafX[l]=tx+tw*(i+.5)/5);
    const sc=th/s.maxD;const drawNode=nd=>{if(!nd.kids){text(ctx,NAMES[nd.leaves[0]],leafX[nd.leaves[0]],base+12,{size:15,color:SPC[nd.leaves[0]]});return leafX[nd.leaves[0]]}const xs=nd.kids.map(drawNode);const y=base-nd.d*sc;const ys=nd.kids.map(k=>base-k.d*sc);ctx.save();ctx.strokeStyle=C.chalk;ctx.lineWidth=2;ctx.beginPath();xs.forEach((xx,i)=>{ctx.moveTo(xx,ys[i]);ctx.lineTo(xx,y)});ctx.moveTo(xs[0],y);ctx.lineTo(xs[1],y);ctx.stroke();ctx.restore();const mx=(xs[0]+xs[1])/2;if(at('hs'))text(ctx,`${(nd.d/(2*s.rate)).toFixed(1)} Myr`,mx,y-9,{size:11,fam:'body',alpha:.8});return mx};
    s.cl.forEach(drawNode);ctx.save();ctx.strokeStyle=rgba(C.chalk,.35);ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(tx+tw+8,base);ctx.lineTo(tx+tw+8,ty);ctx.stroke();ctx.restore();text(ctx,at('hs')?`${(s.maxD/(2*s.rate)).toFixed(0)} Myr`:s.maxD+' apart',tx+tw+12,ty+4,{size:10,align:'left',fam:'body',alpha:.7});text(ctx,'now',tx+tw+12,base,{size:10,align:'left',fam:'body',alpha:.7});
    // matrix
    if(!g.narrow&&at('g8')){const mx0=16,my0=g.y0+5*g.rh+22,cs=Math.min(24,(g.leftW-40)/6);text(ctx,'letters that differ',mx0,my0-12,{size:11,align:'left',fam:'body',alpha:.7});for(let i=0;i<5;i++){text(ctx,NAMES[i],mx0+cs*(i+1)+cs/2,my0+cs/2,{size:12,color:SPC[i]});text(ctx,NAMES[i],mx0+cs/2,my0+cs*(i+1)+cs/2,{size:12,color:SPC[i]});for(let j=0;j<5;j++)if(j>i)text(ctx,String(s.D[i][j]),mx0+cs*(j+1)+cs/2,my0+cs*(i+1)+cs/2,{size:12,fam:'body',alpha:.9})}}
    const msg=s.msg||(s.picked.length===1?'now pick its closest cousin':'tap two creatures you think are the closest cousins');text(ctx,msg,w/2,h-14,{size:Math.min(15,w*.03),color:s.mistakes&&!s.built?C.pink:C.yellow});
    if(at('col')&&s.lastJoin){const p=s.lastJoin.d/s.L;const jc=p<.75?-.75*Math.log(1-4*p/3):Infinity;readout(ctx,[`last join: p = ${s.lastJoin.d.toFixed(1)}/${s.L} = ${p.toFixed(2)} · Jukes–Cantor d = ${isFinite(jc)?jc.toFixed(2):'∞'} · clock ${s.rate}/Myr → ${(s.lastJoin.d/(2*s.rate)).toFixed(1)} Myr`],16,h-52,{size:11})}}
});
hook('tr-new',()=>tr&&tr.newPuzzle(tr));hook('tr-show',()=>tr&&tr.show(tr));slide('tr-rate',v=>{if(tr)tr.rate=v},v=>v+' changes per Myr');

Chalk.start({key:'life',missions:MISSION_DEFS,unitWhy:UNIT_WHY,checks:Object.assign({
  lf1:()=>cp&&cp.did10,lf1b:()=>cp&&cp.broke,lf1c:()=>cp&&cp.cleanDone,
  lf2:()=>mo&&mo.ate10,lf2b:()=>mo&&mo.dark70,lf2c:()=>mo&&mo.pale30,lf2d:()=>mo&&mo.stable,
  lf3:()=>pe&&pe.d40,lf3b:()=>pe&&pe.done3b,lf3c:()=>pe&&pe.half,lf3d:()=>pe&&pe.allTall,
  lf4:()=>bc&&bc.mBig,lf4b:()=>bc&&bc.mCleared,lf4c:()=>bc&&bc.mTake,lf4d:()=>bc&&bc.mAfter,lf4e:()=>bc&&bc.fl&&bc.fl.v>bc.fl.mean,
  lf5:()=>dr&&dr.fixed10,lf5b:()=>dr&&dr.kept200,lf5c:()=>dr&&dr.jump,lf5d:()=>dr&&!!dr.trials,
  lf6:()=>tr&&tr.first,lf6b:()=>tr&&tr.perfect,lf6c:()=>tr&&tr.streak3
},Object.fromEntries(Array.from({length:6},(_,i)=>[`tb${i+1}`,()=>Chalk.checkPassed(`ch${i+1}`)])))});
