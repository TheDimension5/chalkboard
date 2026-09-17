const {C,rgba,clamp,dist,$,fmt,sup,pct,text,circle,glow,shade,poly,rr,box,marble,readout,arrow,rng,at,makeSim,hook,slide}=Chalk;

/* ---------- CH1: pairing ---------- */
const match=makeSim('cv-match',{
  init(s){s.reset(s)},
  counts(){return at('g8')?[6,5]:[5,5]},
  reset(s){const[na,nb]=s.counts();s.na=na;s.nb=nb;s.pairs={};s.drag=null},
  posA(s,i){return{x:s.w*.2,y:s.h*(.14+i*.72/Math.max(s.na-1,1))}},
  posB(s,j){return{x:s.w*.8,y:s.h*(.14+j*.72/Math.max(s.nb-1,1))}},
  down(p,s){for(let i=0;i<s.na;i++)if(dist(p,s.posA(s,i))<26){s.drag=i;delete s.pairs[i]}},
  up(p,s){if(s.drag==null)return;for(let j=0;j<s.nb;j++)if(dist(p,s.posB(s,j))<30){for(const k in s.pairs)if(s.pairs[k]===j)delete s.pairs[k];s.pairs[s.drag]=j}s.drag=null},
  paired(s){return Object.keys(s.pairs).length},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);if(s.counts()[0]!==s.na)s.reset(s);
    for(const k in s.pairs){const a=s.posA(s,+k),b=s.posB(s,s.pairs[k]);poly(ctx,[[a.x+16,a.y],[b.x-22,b.y]],C.yellow,2.5,.9)}
    if(s.drag!=null&&s.pointer){const a=s.posA(s,s.drag);ctx.save();ctx.setLineDash([5,6]);poly(ctx,[[a.x+16,a.y],[s.pointer.x,s.pointer.y]],C.chalk,1.5,.7);ctx.restore()}
    for(let i=0;i<s.na;i++){const a=s.posA(s,i);glow(ctx,a.x,a.y,26,C.pink,.3);circle(ctx,a.x,a.y,13,C.pink);poly(ctx,[[a.x,a.y-13],[a.x+3,a.y-20]],C.chalk,2.5)}
    for(let j=0;j<s.nb;j++){const b=s.posB(s,j);box(ctx,b.x-16,b.y-12,32,24,rgba(C.blue,.9),null,[3,3,9,9]);ctx.strokeStyle=C.blue;ctx.lineWidth=3;ctx.beginPath();ctx.arc(b.x+18,b.y,7,-Math.PI/2,Math.PI/2);ctx.stroke()}
    text(ctx,'apples',w*.2,h*.95,{size:20,alpha:.7});text(ctx,'cups',w*.8,h*.95,{size:20,alpha:.7});
    const n=s.paired(s);let msg='drag an apple to a cup';
    if(s.na===s.nb&&n===s.na)msg='same size, and you never counted!';else if(s.na>s.nb&&n===s.nb)msg='one apple left over: not the same size';else if(n>0)msg=`${n} paired`;
    text(ctx,msg,w/2,h*.08,{size:24,color:n>=s.nb?C.yellow:C.chalk});
    if(at('hs'))readout(ctx,[s.na===s.nb?'a bijection: one-to-one and onto':'an injection from cups into apples, no bijection','|A| = |B| means: a bijection exists'],w/2,h*.84,{align:'center',size:12})}
});
hook('match-reset',()=>match&&match.reset(match));

/* ---------- CH2: Hilbert's Hotel ---------- */
const hotel=makeSim('cv-hotel',{
  init(s){s.reset(s)},
  reset(s){s.g=[];for(let r=1;r<=14;r++)s.g.push({room:r,x:s.rx(s,r),y:s.h*.62,c:C.yellow});s.msg='every room is full';s.guestDone=false;s.busDone=false;s.busy=0},
  rx(s,r){return 34+(r-1)*(s.w-60)/12},
  newGuest(s){if(s.busy>0)return;for(const g of s.g)g.room+=1;s.g.push({room:1,x:-30,y:s.h*.2,c:C.pink});s.msg='everyone moves up one room. Room 1 is free!';s.guestDone=true;s.busy=1.4},
  bus(s){if(s.busy>0)return;for(const g of s.g)g.room*=2;for(let k=0;k<7;k++)s.g.push({room:2*k+1,x:s.w*.1+k*30,y:-30,c:C.blue});s.msg='everyone doubles their room number. All the odd rooms are free!';s.busDone=true;s.busy=1.6},
  step(dt,s){s.busy=Math.max(0,s.busy-dt);for(const g of s.g){const tx=s.rx(s,g.room),ty=s.h*.62;g.x+=(tx-g.x)*Math.min(1,dt*4);g.y+=(ty-g.y)*Math.min(1,dt*4)}s.g=s.g.filter(g=>g.room<=40)},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);
    for(let r=1;r<=13;r++){const x=s.rx(s,r);box(ctx,x-18,h*.44,36,h*.36,null,C.chalk,4,1.5);text(ctx,r<13?String(r):'…',x,h*.34,{size:22,alpha:.85});if(r<13)box(ctx,x-7,h*.62,14,h*.18,rgba(C.chalk,.12),null,2)}
    poly(ctx,[[10,h*.8],[w-10,h*.8]],C.chalk,2,.5);text(ctx,'HOTEL INFINITY',w/2,h*.14,{size:30,color:C.yellow});
    for(const g of s.g)marble(ctx,g.x,g.y,9,g.c);
    text(ctx,s.msg,w/2,h*.92,{size:20,alpha:.85});
    if(at('g8')){const lines=[];if(s.busDone)lines.push(at('hs')?'n ↦ 2n pairs all the rooms with the even rooms':'all the guests fit into just the even rooms');if(s.guestDone&&!s.busDone)lines.push(at('hs')?'n ↦ n + 1: the hotel matches a part of itself':'a full hotel matched with part of itself');if(at('col'))lines.push('countable union of countable sets: (n, m) ↦ 2ⁿ·3ᵐ');if(lines.length)readout(ctx,lines,w*.03,h*.03,{size:12})}}
});
hook('hotel-guest',()=>hotel&&hotel.newGuest(hotel));hook('hotel-bus',()=>hotel&&hotel.bus(hotel));hook('hotel-reset',()=>hotel&&hotel.reset(hotel));

/* ---------- CH3: zigzag through the fractions ---------- */
const gcd=(a,b)=>b?gcd(b,a%b):a;
const zig=makeSim('cv-zigzag',{
  init(s){s.N=7;s.path=[];for(let d=2;d<=s.N+1;d++){for(let p=d-1;p>=1;p--){const q=d-p;if(q<=s.N)s.path.push(d%2?[p,q]:[p,q])}}
    // alternate direction on each diagonal for a real zigzag
    s.path=[];for(let d=2;d<=2*s.N;d++){const cells=[];for(let p=1;p<d;p++){const q=d-p;if(p<=s.N&&q<=s.N)cells.push([p,q])}if(d%2===0)cells.reverse();s.path.push(...cells)}
    s.reset(s)},
  reset(s){s.i=0;s.num=0;s.labels={};s.auto=false;s.tick=0;s.skips=0},
  next(s){if(s.i>=s.path.length)return;const[p,q]=s.path[s.i];if(gcd(p,q)===1){s.num++;s.labels[p+'/'+q]=s.num}else s.skips++;s.i++},
  step(dt,s){if(s.auto){s.tick+=dt;if(s.tick>.28){s.tick=0;s.next(s)}}},
  cell(s,p,q){const m=44,cw=(s.w-m-16)/s.N,ch=(s.h-m-16)/s.N;return{x:m+(q-.5)*cw,y:m+(p-.5)*ch}},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);
    const pts=[];for(let k=0;k<s.i;k++){const[p,q]=s.path[k];const c=s.cell(s,p,q);pts.push([c.x,c.y])}poly(ctx,pts,C.yellow,2,.7);
    for(let p=1;p<=s.N;p++)for(let q=1;q<=s.N;q++){const c=s.cell(s,p,q);const rep=gcd(p,q)!==1;const lab=s.labels[p+'/'+q];const seen=s.path.findIndex(v=>v[0]===p&&v[1]===q)<s.i;
      text(ctx,`${p}/${q}`,c.x,c.y,{size:19,alpha:rep?.3:seen?1:.6,color:seen&&!rep?C.chalk:C.chalk});
      if(lab)text(ctx,String(lab),c.x+16,c.y-14,{size:15,color:C.yellow,fam:'body'});
      if(rep&&seen&&at('hs'))poly(ctx,[[c.x-14,c.y+8],[c.x+14,c.y-8]],C.pink,1.5,.8)}
    text(ctx,'q →',w-22,20,{size:18,alpha:.6});text(ctx,'p ↓',20,h-16,{size:18,alpha:.6});
    const lines=[`numbered: ${s.num}`];if(at('hs'))lines.push(`repeats skipped: ${s.skips}`);if(at('g8'))lines.push(s.num>=20?'every fraction gets a whole number: countable':'each fraction gets the next whole number');readout(ctx,lines,w-16,10,{align:'right',size:12})}
});
hook('zig-next',()=>zig&&zig.next(zig));hook('zig-reset',()=>zig&&zig.reset(zig));
hook('zig-auto',()=>{if(!zig)return;zig.auto=!zig.auto;const b=$('zig-auto');b.classList.toggle('is-on',zig.auto);b.setAttribute('aria-pressed',String(zig.auto))});

/* ---------- CH4: the diagonal ---------- */
const diag=makeSim('cv-diag',{
  init(s){s.reset(s)},
  reset(s){s.n=6;const r=rng(Date.now()&0xffff);s.rows=[];for(let i=0;i<s.n;i++){const row=[];for(let j=0;j<s.n;j++)row.push(r()<.5?0:1);s.rows.push(row)}s.b=null;s.flips=0;s.adds=0},
  flip(s){s.b=s.rows.map((row,i)=>1-row[i]);s.flips++},
  add(s){if(!s.b)return;const r=rng(Date.now()&0xffff);for(const row of s.rows)row.push(r()<.5?0:1);const nb=s.b.slice();nb.push(r()<.5?0:1);s.rows.push(nb);s.n++;s.b=null;s.adds++;if(s.n>9){s.rows.shift();s.rows.forEach(r=>r.shift());s.n--}},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const cell=Math.min(34,(w-120)/(s.n+1),(h-110)/(s.n+2));const x0=70,y0=44;
    text(ctx,'the list',x0+cell*s.n/2,y0-24,{size:20,alpha:.8});
    for(let i=0;i<s.n;i++){text(ctx,`#${i+1}`,x0-30,y0+i*cell+cell/2,{size:16,alpha:.6,fam:'body'});text(ctx,'0.',x0-8,y0+i*cell+cell/2,{size:16,alpha:.6,fam:'mono'});
      for(let j=0;j<s.n;j++){const d=i===j;if(d)box(ctx,x0+j*cell+2,y0+i*cell+2,cell-4,cell-4,rgba(C.yellow,.25),C.yellow,4,1.5);text(ctx,String(s.rows[i][j]),x0+j*cell+cell/2,y0+i*cell+cell/2+1,{size:18,fam:'mono',color:d?C.yellow:C.chalk})}
      text(ctx,'…',x0+s.n*cell+12,y0+i*cell+cell/2,{size:18,alpha:.5})}
    const by=y0+s.n*cell+30;
    if(s.b){text(ctx,'new',x0-30,by+cell/2,{size:16,color:C.pink,fam:'body'});text(ctx,'0.',x0-8,by+cell/2,{size:16,color:C.pink,fam:'mono'});
      for(let j=0;j<s.n;j++){box(ctx,x0+j*cell+2,by+2,cell-4,cell-4,rgba(C.pink,.25),C.pink,4,1.5);text(ctx,String(s.b[j]),x0+j*cell+cell/2,by+cell/2+1,{size:18,fam:'mono',color:C.pink});poly(ctx,[[x0+j*cell+cell/2,y0+j*cell+cell-4],[x0+j*cell+cell/2,by+2]],C.pink,1,.35)}
      text(ctx,'…',x0+s.n*cell+12,by+cell/2,{size:18,alpha:.5});
      text(ctx,at('g8')?`differs from #${1} at digit 1, from #2 at digit 2, ... from #${s.n} at digit ${s.n}`:'different from every row on the list!',w/2,by+cell+26,{size:at('g8')?17:22,color:C.yellow})}
    else text(ctx,s.adds?'the list grew, but the diagonal grew with it. Flip again.':'flip the diagonal: change each yellow digit',w/2,by+cell/2,{size:20,alpha:.8});
    if(at('hs'))readout(ctx,['bₙ = 1 − aₙₙ  ⇒  b ≠ f(n) for every n',at('col')?'Cantor’s theorem: no surjection X → 𝒫(X)':'so {0,1}^ℕ is uncountable'],w-16,10,{align:'right',size:12})}
});
hook('diag-flip',()=>diag&&diag.flip(diag));hook('diag-add',()=>diag&&diag.add(diag));hook('diag-reset',()=>diag&&diag.reset(diag));

/* ---------- CH5: the ladder ---------- */
const ladder=makeSim('cv-ladder',{
  init(s){s.n=3;s.ch=true;s.chSeen={true:true,false:false}},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const n=s.n,total=1<<n;const cols=Math.min(total,n<=3?4:8),rows=Math.ceil(total/cols);const gw=w*.55,cw=gw/cols,chh=Math.min(40,(h*.62)/rows);const x0=16,y0=h*.2;
    text(ctx,`${n} thing${n>1?'s':''}  →  ${total} subsets`,x0+gw/2,h*.1,{size:26,color:C.yellow});
    for(let k=0;k<total;k++){const cx=x0+(k%cols)*cw,cy=y0+Math.floor(k/cols)*chh;box(ctx,cx+3,cy+3,cw-6,chh-6,rgba(C.chalk,.06),C.chalk,5,1);
      for(let i=0;i<n;i++){const inn=(k>>i)&1;const px=cx+8+i*((cw-16)/Math.max(n-1,1)),py=cy+chh/2;circle(ctx,px,py,Math.min(5,cw/12),inn?[C.pink,C.blue,C.green,C.yellow,C.chalk][i]:null,inn?null:rgba(C.chalk,.35),1.2)}}
    const lx=w*.8;const rungs=at('hs')?['ℵ₀','2^ℵ₀','2^(2^ℵ₀)','…']:['counting numbers','the number line','all its subsets','…'];
    poly(ctx,[[lx-40,h*.9],[lx-40,h*.14]],C.chalk,2,.6);poly(ctx,[[lx+40,h*.9],[lx+40,h*.14]],C.chalk,2,.6);
    rungs.forEach((r,i)=>{const y=h*.82-i*h*.2;poly(ctx,[[lx-40,y],[lx+40,y]],C.chalk,2,.6);text(ctx,r,lx,y-16,{size:at('hs')?20:14,color:i===0?C.chalk:C.yellow,fam:at('hs')?'display':'body'})});
    text(ctx,'bigger every rung',lx,h*.96,{size:16,alpha:.7});
    if(at('hs')){const y=h*.82-h*.1;text(ctx,s.ch?'ℵ₁ = 2^ℵ₀?  CH: yes':'ℵ₁ < 2^ℵ₀?  ¬CH: also fine',lx,y,{size:15,color:C.pink,fam:'body'});
      readout(ctx,[s.ch?'Gödel 1940: CH cannot be disproved in ZFC':'Cohen 1963: CH cannot be proved in ZFC',s.chSeen.true&&s.chSeen.false?'both ways consistent: independent of ZFC':'flip it and see'],x0,h*.88,{size:12})}}
});
slide('ladder-n',v=>{if(ladder)ladder.n=Math.round(v)},v=>String(Math.round(v)));
hook('ladder-ch',()=>{if(!ladder)return;ladder.ch=!ladder.ch;ladder.chSeen[ladder.ch]=true;const b=$('ladder-ch');b.textContent='Continuum hypothesis: '+(ladder.ch?'true':'false');b.setAttribute('aria-pressed',String(ladder.ch))});

Chalk.start({key:'infinity',missions:MISSION_DEFS,checks:{
  inf1:()=>match&&match.na===match.nb&&match.paired(match)===match.na,
  inf1b:()=>match&&match.na>match.nb&&match.paired(match)===match.nb,
  inf2:()=>hotel&&hotel.guestDone,inf2b:()=>hotel&&hotel.busDone,
  inf3:()=>zig&&zig.num>=20,inf3b:()=>zig&&zig.num>=30,
  inf4:()=>diag&&diag.flips>0,inf4b:()=>diag&&diag.adds>0&&diag.flips>diag.adds,
  inf5:()=>ladder&&ladder.n===4,inf5b:()=>ladder&&ladder.chSeen.true&&ladder.chSeen.false
}});
