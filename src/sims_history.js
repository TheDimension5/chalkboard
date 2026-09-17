const {C,rgba,clamp,dist,$,fmt,sup,pct,text,circle,glow,shade,poly,rr,box,marble,readout,arrow,rng,at,makeSim,hook,slide}=Chalk;
const ORIG='in the year the river froze the king gave seven cows to the temple and the priests sang all night';

/* ---------- CH1: the copying game ---------- */
function copyOnce(words,r){const out=[];const sim={a:'o',o:'a',e:'c',c:'e',n:'u',u:'n',i:'l',l:'i',h:'b',v:'y'};for(let i=0;i<words.length;i++){let w=words[i];const u=r();
    if(u<.05)continue;                                   // drop a word
    if(u<.08){out.push(w);out.push(w);continue}           // write it twice
    if(u<.11&&i+3<words.length){const j=words.indexOf(w,i+1);if(j>i&&j-i<5){out.push(w);i=j;continue}} // eye-skip
    if(u<.22){const k=Math.floor(r()*w.length);const ch=w[k];if(sim[ch])w=w.slice(0,k)+sim[ch]+w.slice(k+1)}
    out.push(w)}return out}
function diffWords(a,b){const n=a.length,m=b.length;const d=Array.from({length:n+1},()=>new Array(m+1).fill(0));for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)d[i][j]=a[i]===b[j]?d[i+1][j+1]+1:Math.max(d[i+1][j],d[i][j+1]);const mark=new Array(m).fill(true);let i=0,j=0;while(i<n&&j<m){if(a[i]===b[j]){mark[j]=false;i++;j++}else if(d[i+1][j]>=d[i][j+1])i++;else j++}return mark}
const copy=makeSim('cv-copy',{
  init(s){s.reset(s)},
  reset(s){s.r=rng(Date.now()&0xffff);s.gens=[ORIG.split(' ')];s.two=false;s.A=null;s.B=null},
  again(s){if(s.two){s.A.push(copyOnce(s.A[s.A.length-1],s.r));s.B.push(copyOnce(s.B[s.B.length-1],s.r))}else s.gens.push(copyOnce(s.gens[s.gens.length-1],s.r))},
  twoScribes(s,on){s.two=on;if(on){const base=s.gens[Math.min(3,s.gens.length-1)];s.A=[base];s.B=[base];for(let k=0;k<4;k++)s.again(s)}},
  wrap(ctx,words,x,y,maxw,size,marks,marks2){ctx.font=`700 ${size}px Nunito, system-ui, sans-serif`;let cx=x,cy=y;const lh=size*1.5;words.forEach((w,i)=>{const ww=ctx.measureText(w+' ').width;if(cx+ww>x+maxw){cx=x;cy+=lh}const bad=marks&&marks[i];const shared=marks2&&marks2[i];if(shared){ctx.fillStyle=rgba(C.green,.35);ctx.fillRect(cx-2,cy-size*.9,ww,size*1.25)}else if(bad){ctx.fillStyle=rgba(C.pink,.3);ctx.fillRect(cx-2,cy-size*.9,ww,size*1.25)}ctx.fillStyle=shared?C.green:bad?C.pink:C.chalk;ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillText(w,cx,cy);cx+=ww});return cy+lh},
  shared(s){const a=s.A[s.A.length-1],b=s.B[s.B.length-1];const o=s.gens[0];const ma=diffWords(o,a),mb=diffWords(o,b);const sh=new Array(a.length).fill(false);let n=0;a.forEach((w,i)=>{if(ma[i]&&b.includes(w)&&!o.includes(w)){sh[i]=true;n++}});const shb=b.map((w,j)=>mb[j]&&a.includes(w)&&!o.includes(w));return{sh,shb,n}},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const size=Math.max(13,Math.min(17,w/38));const o=s.gens[0];ctx.save();
    text(ctx,'the original',26,26,{size:18,align:'left',color:C.yellow});let y=s.wrap(ctx,o,26,52,w-52,size);
    if(!s.two){const g=s.gens.length-1;const last=s.gens[g];text(ctx,g?`copy number ${g}`:'no copies yet',26,y+14,{size:18,align:'left',color:C.pink});y=s.wrap(ctx,last,26,y+40,w-52,size,diffWords(o,last));
      const changed=diffWords(o,last).filter(Boolean).length;const lines=[`${g} generation${g===1?'':'s'} of copying: ${changed} changed word${changed===1?'':'s'}`];if(at('hs'))lines.push(`expected drift ≈ 1 − (1 − p)^g with p ≈ 0.2 per word`);if(at('col'))lines.push('errors are inherited: each copy = parent’s errors + its own');readout(ctx,lines,26,y+8,{size:12})}
    else{const A=s.A[s.A.length-1],B=s.B[s.B.length-1];const sh=s.shared(s);text(ctx,`scribe A, ${s.A.length-1} copies after the split`,26,y+14,{size:17,align:'left',color:C.pink});y=s.wrap(ctx,A,26,y+38,w-52,size,diffWords(o,A),sh.sh);
      text(ctx,`scribe B, ${s.B.length-1} copies after the split`,26,y+10,{size:17,align:'left',color:C.blue});y=s.wrap(ctx,B,26,y+34,w-52,size,diffWords(o,B),sh.shb);
      readout(ctx,[sh.n?`green: ${sh.n} shared mistake${sh.n>1?'s':''}, already in the parent they split from`:'no shared mistakes yet: copy again',at('hs')?'shared errors date from before the split; the rest came after':'pink: each scribe’s own mistakes'],26,Math.min(y+6,h-44),{size:12})}
    ctx.restore()}
});
hook('copy-again',()=>copy&&copy.again(copy));hook('copy-reset',()=>{if(copy){copy.reset(copy);const b=$('copy-two');b.classList.remove('is-on');b.setAttribute('aria-pressed','false')}});
hook('copy-two',()=>{if(!copy)return;const on=!copy.two;copy.twoScribes(copy,on);const b=$('copy-two');b.classList.toggle('is-on',on);b.setAttribute('aria-pressed',String(on))});

/* ---------- CH2: stemma ---------- */
const stemma=makeSim('cv-stemma',{
  init(s){s.nodes={O:{lbl:'original (lost)',txt:'the king gave seven cows to the temple',lost:true},B:{lbl:'B (lost)',txt:'the king gave seven crows to the temple',lost:true},C:{lbl:'C',txt:'the king gave seven cows to the tempel'},D:{lbl:'D',txt:'the kin gave seven crows to the temple'},E:{lbl:'E',txt:'the king gave sven crows to the temple'},F:{lbl:'F',txt:'the king gav seven cows to the tempel'},G:{lbl:'G',txt:'the king gave seven cows too the tempel'}};
    s.pos={O:[.5,.14],B:[.28,.42],C:[.72,.42],D:[.14,.72],E:[.4,.72],F:[.6,.72],G:[.86,.72]};s.edges=[['O','B'],['O','C'],['B','D'],['B','E'],['C','F'],['C','G']];s.open=null;s.ans={};s.correct=0},
  down(p,s){s.open=null;for(const k in s.pos){const[x,y]=s.pos[k];if(!s.nodes[k].lost&&dist(p,{x:x*s.w,y:y*s.h})<26)s.open=k}},
  answer(s,q,a){s.ans[q]=a;s.correct=(s.ans.q1==='cows'?1:0)+(s.ans.q2==='temple'?1:0)},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const P=k=>({x:s.pos[k][0]*w,y:s.pos[k][1]*h});
    for(const[a,b]of s.edges){const A=P(a),B=P(b);ctx.save();if(s.nodes[a].lost)ctx.setLineDash([4,6]);poly(ctx,[[A.x,A.y+22],[B.x,B.y-22]],C.chalk,1.5,.6);ctx.restore()}
    for(const k in s.nodes){const n=s.nodes[k],p=P(k);ctx.save();if(n.lost)ctx.setLineDash([4,5]);box(ctx,p.x-22,p.y-22,44,44,n.lost?null:rgba(C.chalk,.08),s.open===k?C.yellow:C.chalk,8,s.open===k?2.5:1.5);ctx.restore();text(ctx,k,p.x,p.y+1,{size:26,color:n.lost?C.chalk:C.yellow,alpha:n.lost?.5:1});if(n.lost)text(ctx,'lost',p.x,p.y+34,{size:14,alpha:.5})}
    const lines=[];if(s.open){const t=s.nodes[s.open].txt;lines.push(`${s.open}:  “${t}”`)}else lines.push('tap C, D, E, F or G to read it');
    if(s.ans.q1)lines.push(`cows / crows → you chose “${s.ans.q1}”: ${s.ans.q1==='cows'?'right. D and E share it from B, one branch. C, F, G are the other branch.':'D and E both say crows, but they got it from one parent, B.'}`);
    if(s.ans.q2)lines.push(`temple / tempel → you chose “${s.ans.q2}”: ${s.ans.q2==='temple'?'right. Three copies say tempel, but all three come from C. One vote.':'three manuscripts agree, but they are all copies of C. Count branches.'}`);
    if(at('hs'))lines.push('archetype = reading supported by independent branches; lectio difficilior breaks ties');
    readout(ctx,lines,16,h*.86-(lines.length-1)*18,{size:12});
    if(s.correct===2)text(ctx,'original: “the king gave seven cows to the temple”',w/2,h*.06,{size:20,color:C.yellow})}
});
document.querySelectorAll('[data-st]').forEach(b=>b.addEventListener('click',()=>{if(!stemma)return;stemma.answer(stemma,b.dataset.st,b.dataset.ans);document.querySelectorAll(`[data-st="${b.dataset.st}"]`).forEach(x=>x.classList.toggle('is-on',x===b))}));

/* ---------- CH3: decipherment ---------- */
const PLAIN='PTOLEMY GAVE THE TEMPLE A GOLD LAMP';
const decode=makeSim('cv-decode',{
  init(s){s.reset(s);const keys=$('dec-keys');if(keys&&!keys.children.length){for(const L of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'){const b=document.createElement('button');b.className='key';b.textContent=L;b.type='button';b.addEventListener('click',()=>s.assign(s,L));keys.appendChild(b)}}},
  reset(s){const r=rng(7);const letters=[...new Set(PLAIN.replace(/ /g,''))];s.glyph={};const pool=Array.from({length:26},(_,i)=>i).sort(()=>r()-.5);letters.forEach((L,i)=>s.glyph[L]=pool[i]);s.map={};s.sel=null;s.hints=0;s.usedName=false},
  solved(s){return [...PLAIN.replace(/ /g,'')].every(L=>s.map[L]===L)},
  useName(s){for(const L of 'PTOLEMY')s.map[L]=L;s.usedName=true},
  hint(s){const left=[...new Set(PLAIN.replace(/ /g,''))].filter(L=>s.map[L]!==L);if(left.length){s.map[left[0]]=left[0];s.hints++}},
  assign(s,L){if(s.sel==null)return;for(const k in s.map)if(s.map[k]===L&&k!==s.sel)delete s.map[k];s.map[s.sel]=L},
  drawGlyph(ctx,g,x,y,r){const shape=g%5,deco=Math.floor(g/5);ctx.save();ctx.strokeStyle=C.chalk;ctx.fillStyle=C.chalk;ctx.lineWidth=2;ctx.lineJoin='round';ctx.beginPath();
    if(shape===0)ctx.arc(x,y,r,0,Math.PI*2);else if(shape===1){ctx.moveTo(x,y-r);ctx.lineTo(x+r,y+r);ctx.lineTo(x-r,y+r);ctx.closePath()}else if(shape===2)ctx.rect(x-r,y-r,2*r,2*r);else if(shape===3){ctx.moveTo(x,y-r);ctx.lineTo(x+r,y);ctx.lineTo(x,y+r);ctx.lineTo(x-r,y);ctx.closePath()}else{ctx.moveTo(x-r,y+r);ctx.lineTo(x+r,y-r)}ctx.stroke();
    ctx.beginPath();if(deco===1)ctx.arc(x,y,2.5,0,Math.PI*2),ctx.fill();else if(deco===2){ctx.moveTo(x-r,y+r+5);ctx.lineTo(x+r,y+r+5);ctx.stroke()}else if(deco===3){ctx.moveTo(x-r-4,y-r);ctx.lineTo(x-r-4,y+r);ctx.moveTo(x+r+4,y-r);ctx.lineTo(x+r+4,y+r);ctx.stroke()}else if(deco===4){ctx.arc(x,y,r+5,0,Math.PI*2);ctx.stroke()}else if(deco===5){ctx.moveTo(x-4,y);ctx.lineTo(x+4,y);ctx.moveTo(x,y-4);ctx.lineTo(x,y+4);ctx.stroke()}ctx.restore()},
  layout(s){const cw=Math.min(30,(s.w-40)/19);const words=PLAIN.split(' ');const rows=[[0,1,2],[3,4,5,6]];const out=[];rows.forEach((ws,ri)=>{const total=ws.reduce((a,i)=>a+words[i].length,0)+(ws.length-1)*.8;let x=s.w/2-total*cw/2+cw/2;const y=s.h*.3+ri*s.h*.3;for(const wi of ws){for(const L of words[wi]){out.push({L,x,y,wi});x+=cw}x+=cw*.8}});return{out,cw}},
  down(p,s){const{out,cw}=s.layout(s);s.sel=null;for(const g of out)if(Math.abs(p.x-g.x)<cw/2&&Math.abs(p.y-g.y)<cw)s.sel=g.L},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const{out,cw}=s.layout(s);const r=cw*.32;
    const name=out.filter(g=>g.wi===0);box(ctx,name[0].x-cw*.6,name[0].y-cw*.9,name.length*cw+cw*.2,cw*1.8,null,C.yellow,12,2);text(ctx,"the king's name",name[0].x+name.length*cw/2-cw/2,name[0].y-cw*1.25,{size:15,color:C.yellow});
    for(const g of out){if(s.sel===g.L)box(ctx,g.x-cw/2+1,g.y-cw*.7,cw-2,cw*1.4,rgba(C.yellow,.2),null,6);s.drawGlyph(ctx,s.glyph[g.L],g.x,g.y-cw*.1,r);const m=s.map[g.L];if(m)text(ctx,m,g.x,g.y+cw*.85,{size:cw*.75,fam:'body',color:m===g.L?C.green:C.pink})}
    const solved=s.solved(s);text(ctx,solved?'“'+PLAIN+'”':s.sel?`symbol selected: now tap a letter below`:'tap a symbol in the inscription',w/2,h*.92,{size:solved?22:18,color:solved?C.yellow:C.chalk,alpha:.9});
    if(at('g8'))readout(ctx,[`letters known: ${Object.keys(s.map).filter(k=>s.map[k]===k).length} of ${[...new Set(PLAIN.replace(/ /g,''))].length}`,at('hs')?'a known-plaintext attack: the cartouche is the key':'green = right, pink = try another'],16,12,{size:12})}
});
hook('dec-name',()=>decode&&decode.useName(decode));hook('dec-hint',()=>decode&&decode.hint(decode));hook('dec-reset',()=>decode&&decode.reset(decode));

/* ---------- CH4: dating ---------- */
const dating=makeSim('cv-date',{
  init(s){s.pctLeft=50;s.rings=23;s.widths=[];const r=rng(11);for(let i=0;i<s.rings;i++)s.widths.push(3+r()*5);s.guess=null;s.ok=false},
  age(s){return 5730*Math.log2(100/s.pctLeft)},
  check(s,n){s.guess=n;s.ok=n===s.rings},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const two=at('g8');const gw=two?w*.55:w*.92,x0=44,y0=30,gh=h*.6;const X=t=>x0+t/30000*(gw-x0-10),Y=p=>y0+gh-(p/100)*gh;
    poly(ctx,[[x0,y0],[x0,y0+gh],[X(30000),y0+gh]],C.chalk,1.5,.7);for(let t=0;t<=30000;t+=5730){poly(ctx,[[X(t),y0+gh],[X(t),y0+gh+5]],C.chalk,1,.7);text(ctx,t?`${Math.round(t/1000)}k`:'0',X(t),y0+gh+16,{size:13,alpha:.8})}
    for(let p=0;p<=100;p+=25){text(ctx,p+'%',x0-8,Y(p),{size:12,align:'right',alpha:.8});poly(ctx,[[x0,Y(p)],[X(30000),Y(p)]],C.chalk,1,.12)}
    const pts=[];for(let t=0;t<=30000;t+=200)pts.push([X(t),Y(100*Math.pow(.5,t/5730))]);poly(ctx,pts,C.yellow,2.2,.95);
    const a=s.age(s);circle(ctx,X(Math.min(a,30000)),Y(s.pctLeft),6,C.pink);ctx.save();ctx.setLineDash([3,5]);poly(ctx,[[x0,Y(s.pctLeft)],[X(Math.min(a,30000)),Y(s.pctLeft)],[X(Math.min(a,30000)),y0+gh]],C.pink,1.2,.8);ctx.restore();
    text(ctx,'years since death',(x0+gw)/2,y0+gh+34,{size:15,alpha:.8});text(ctx,'carbon-14 left',x0+4,y0-14,{size:15,align:'left',alpha:.8});
    const lines=[`${s.pctLeft}% left  →  about ${Math.round(a).toLocaleString()} years old`];if(at('g8'))lines.push(`${(Math.log2(100/s.pctLeft)).toFixed(2)} half-lives of 5,730 years`);if(at('hs'))lines.push('t = 5730 · log₂(N₀/N), then calibrate with IntCal');if(at('col'))lines.push('radiocarbon years ≠ calendar years: calibration is Bayesian');readout(ctx,lines,x0,y0+gh+50,{size:12});
    if(two){const cx=w*.8,cy=h*.42;let R=0;for(let i=0;i<s.rings;i++){R+=s.widths[i];circle(ctx,cx,cy,R,null,rgba(C.chalk,i%2?.35:.75),i%2?1:1.6)}circle(ctx,cx,cy,R+2,rgba(C.chalk,.03),C.yellow,2);text(ctx,'count the rings',cx,cy+R+22,{size:17,alpha:.8});
      if(s.guess!=null)text(ctx,s.ok?`${s.rings} rings: right!`:`not ${s.guess}. look again`,cx,cy+R+44,{size:17,color:s.ok?C.green:C.pink})}}
});
slide('c14',v=>{if(dating)dating.pctLeft=v},v=>Math.round(v)+'%');
hook('rings-check',()=>{if(!dating)return;const n=parseInt($('rings').value,10);if(!isNaN(n))dating.check(dating,n)});

/* ---------- CH5: bits rot ---------- */
const PIC=['................................','...........########.............','..........##......##............','.........##..####..##...........','........##..#....#..##..........','.......##...#....#...##.........','......##....######....##........','.....########################...','.....#..........................','.....#..##..##..##..##..##..#...','.....#..##..##..##..##..##..#...','.....#..##..##..##..##..##..#...','.....#..##..##..##..##..##..#...','.....#..##..##..##..##..##..#...','.....########################...','....##########################..','...############################.','................................','..##....##....##....##....##....','................................'];
const bits=makeSim('cv-bits',{
  init(s){s.W=PIC[0].length;s.H=PIC.length;s.N=s.W*s.H;s.orig=[];for(const row of PIC)for(const ch of row)s.orig.push(ch==='#'?1:0);s.years=0;s.copies=false;s.ecc=false;s.migrated=false;s.dead=false;s.reseed(s)},
  reseed(s){const r=rng(Date.now()&0xffff);const p=.0002;s.flipAt=[];for(let c=0;c<3;c++){const arr=new Float32Array(s.N*2);for(let i=0;i<s.N*2;i++)arr[i]=-Math.log(1-r())/p;s.flipAt.push(arr)}},
  // Hamming(7,4) over groups of 4 data bits; check bits stored after the data bits (indices N..2N region, 3 per group)
  readCopy(s,c){const fa=s.flipAt[c];const raw=i=>{return s.orig[i]^(fa[i]<=s.years?1:0)};
    if(!s.ecc)return Array.from({length:s.N},(_,i)=>raw(i));
    const out=new Array(s.N);for(let g=0;g<s.N;g+=4){const d=[raw(g),raw(g+1),raw(g+2),raw(g+3)];const od=[s.orig[g],s.orig[g+1],s.orig[g+2],s.orig[g+3]];const chk=k=>{const base=s.N+(g/4)*3+k;return fa[base]<=s.years?1:0};
      const p1=od[0]^od[1]^od[3],p2=od[0]^od[2]^od[3],p3=od[1]^od[2]^od[3];const r1=p1^chk(0),r2=p2^chk(1),r3=p3^chk(2);
      const s1=r1^d[0]^d[1]^d[3],s2=r2^d[0]^d[2]^d[3],s3=r3^d[1]^d[2]^d[3];const syn=s1+2*s2+4*s3;const posMap={3:0,5:1,6:2,7:3};if(syn in posMap)d[posMap[syn]]^=1;
      for(let k=0;k<4;k++)out[g+k]=d[k]}return out},
  read(s){if(!s.copies)return s.readCopy(s,0);const a=s.readCopy(s,0),b=s.readCopy(s,1),c=s.readCopy(s,2);return a.map((v,i)=>(v+b[i]+c[i])>=2?1:0)},
  bad(s){const r=s.read(s);let n=0;for(let i=0;i<s.N;i++)if(r[i]!==s.orig[i])n++;return n},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const cell=Math.min((w-40)/s.W,(h*.68)/s.H);const x0=(w-cell*s.W)/2,y0=24;s.dead=at('g8')&&s.years>=120&&!s.migrated;
    const img=s.read(s);const bad=s.bad(s);s.lastBad=bad;
    for(let i=0;i<s.N;i++){const x=x0+(i%s.W)*cell,y=y0+Math.floor(i/s.W)*cell;const on=img[i];const wrong=on!==s.orig[i];ctx.fillStyle=s.dead?rgba(C.chalk,.06):wrong?(on?C.pink:rgba(C.pink,.45)):on?C.chalk:rgba(C.chalk,.06);ctx.fillRect(x+.5,y+.5,cell-1,cell-1)}
    if(s.dead){text(ctx,'temple.bmx',w/2,y0+cell*s.H*.4,{size:30,color:C.pink});text(ctx,'no program can open this format any more',w/2,y0+cell*s.H*.6,{size:18,color:C.pink})}
    const lines=[`year ${s.years}: ${s.dead?'unreadable':bad+' bad pixel'+(bad===1?'':'s')}`];
    lines.push(s.copies?'three copies, majority vote: single flips are outvoted':'one copy: every flip shows');if(at('hs'))lines.push(s.ecc?'Hamming(7,4): one flipped bit per block of 7 is repaired':'no code: flips go uncorrected');if(at('g8'))lines.push(s.migrated?'format migrated: readable after year 120':'the .bmx format dies at year 120');if(at('col'))lines.push('detect with checksums, correct with codes, survive with copies');
    readout(ctx,lines,16,h*.97-lines.length*18,{size:12})}
});
slide('bits-years',v=>{if(bits)bits.years=Math.round(v)},v=>String(Math.round(v)));
hook('bits-copies',()=>{if(!bits)return;bits.copies=!bits.copies;const b=$('bits-copies');b.classList.toggle('is-on',bits.copies);b.setAttribute('aria-pressed',String(bits.copies));b.textContent='Three copies + voting: '+(bits.copies?'on':'off')});
hook('bits-ecc',()=>{if(!bits)return;bits.ecc=!bits.ecc;const b=$('bits-ecc');b.classList.toggle('is-on',bits.ecc);b.setAttribute('aria-pressed',String(bits.ecc));b.textContent='Error-correcting code: '+(bits.ecc?'on':'off')});
hook('bits-migrate',()=>{if(bits)bits.migrated=true});

/* ---------- CH6: what survives ---------- */
const TYPES=[{k:'laws',c:'#F6D46B',n:40,p:.93},{k:'holy texts',c:'#9DDBA3',n:40,p:.96},{k:'letters',c:'#8CC4EE',n:60,p:.55},{k:'jokes & stories',c:'#F596A8',n:30,p:.7},{k:'science',c:'#F1ECDF',n:30,p:.8}];
const surv=makeSim('cv-survive',{
  init(s){s.reset(s)},
  reset(s){const r=rng(Date.now()&0xffff);s.docs=[];TYPES.forEach((t,ti)=>{for(let i=0;i<t.n;i++){let dies=99;for(let c=1;c<=20;c++){if(r()>t.p){dies=c;break}}s.docs.push({t:ti,dies,dug:false})}});s.c=0;s.dug=false},
  dig(s){if(s.dug)return;s.dug=true;let n=0;for(const d of s.docs){if((d.t===2||d.t===3)&&d.dies<=s.c&&n<15){d.dug=true;n++}}},
  draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const cols=25,cell=Math.min((w-200)/cols,(h*.8)/8);const x0=16,y0=24;
    s.docs.forEach((d,i)=>{const x=x0+(i%cols)*cell,y=y0+Math.floor(i/cols)*cell;const alive=d.dies>s.c||d.dug;const col=TYPES[d.t].c;if(alive){circle(ctx,x+cell/2,y+cell/2,cell*.32,d.dug?null:col,d.dug?col:null,2);if(d.dug)text(ctx,'!',x+cell/2,y+cell/2+1,{size:cell*.5,color:col,fam:'body'})}else circle(ctx,x+cell/2,y+cell/2,cell*.12,rgba(C.chalk,.15))});
    const lx=x0+cols*cell+24;text(ctx,`century ${s.c}`,lx,y0+8,{size:22,align:'left',color:C.yellow});
    TYPES.forEach((t,ti)=>{const alive=s.docs.filter(d=>d.t===ti&&(d.dies>s.c||d.dug)).length;const y=y0+44+ti*26;circle(ctx,lx+6,y,5,t.c);text(ctx,`${t.k}: ${alive}/${t.n}`,lx+18,y,{size:15,align:'left',fam:'body',alpha:.9})});
    const lines=[];if(s.c>=20)lines.push('after 20 centuries: mostly laws and holy texts. Ordinary life is gone.');else if(s.c>0)lines.push('the more a text was copied, the better its odds each century');else lines.push('200 documents, five kinds. Run the centuries.');
    if(s.dug)lines.push('the rubbish dump gave back 15 everyday texts (Oxyrhynchus, 1896)');if(at('hs'))lines.push('survival per century rises with copying demand; the record is a biased sample');if(at('col'))lines.push('unseen-species estimates: ~9% of manuscripts, ~32% of works (Kestemont 2022)');
    readout(ctx,lines,16,h*.97-lines.length*18,{size:12})}
});
slide('surv-c',v=>{if(surv)surv.c=Math.round(v)},v=>String(Math.round(v)));
hook('surv-dig',()=>surv&&surv.dig(surv));hook('surv-reset',()=>{if(surv)surv.reset(surv)});

Chalk.start({key:'history',missions:MISSION_DEFS,checks:{
  h1:()=>copy&&!copy.two&&copy.gens.length>=11,
  h1b:()=>copy&&copy.two&&copy.shared(copy).n>0,
  h2:()=>stemma&&stemma.correct===2,
  h3:()=>decode&&decode.solved(decode),
  h3b:()=>decode&&decode.solved(decode)&&decode.hints===0,
  h4:()=>dating&&Math.abs(dating.pctLeft-25)<=1,
  h4b:()=>dating&&dating.ok,
  h5:()=>bits&&bits.years>=200&&!bits.dead&&bits.lastBad<3,
  h5b:()=>bits&&bits.years>=200&&bits.ecc&&!bits.copies,
  h5c:()=>bits&&bits.migrated&&bits.years>=120,
  h6:()=>surv&&surv.c>=20,h6b:()=>surv&&surv.dug
}});
