window.Chalk=(function(){
'use strict';
const C={chalk:'#F1ECDF',yellow:'#F6D46B',blue:'#8CC4EE',pink:'#F596A8',green:'#9DDBA3',board:'#1B2923'};
const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
let LOWPOW=false;try{LOWPOW=localStorage.getItem('chalk:lowpow')==='1'}catch(e){}
function setLowPow(v){LOWPOW=!!v;try{localStorage.setItem('chalk:lowpow',LOWPOW?'1':'0')}catch(e){}const b=$('lowpow');if(b){b.classList.toggle('is-on',LOWPOW);b.setAttribute('aria-pressed',String(LOWPOW))}document.querySelectorAll('canvas').forEach(c=>c.dispatchEvent(new Event('chalk-resize')))}
const rgba=(hex,a)=>{const n=parseInt(hex.slice(1),16);return `rgba(${n>>16},${(n>>8)&255},${n&255},${a})`};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const $=id=>document.getElementById(id);
const fmt=(v,d=0)=>Number(v).toFixed(d);
const SUP='⁰¹²³⁴⁵⁶⁷⁸⁹';const sup=n=>String(n).split('').map(c=>c==='-'?'⁻':(SUP[+c]||c)).join('');
const pct=v=>Math.round(v*100)+'%';
function text(ctx,str,x,y,o={}){const{size=20,color=C.chalk,align='center',fam='display',alpha=1,base='middle'}=o;ctx.save();ctx.globalAlpha=alpha;ctx.font=fam==='display'?`700 ${size}px Caveat, "Segoe Print", cursive`:fam==='mono'?`700 ${size}px "JetBrains Mono", Menlo, Consolas, monospace`:`900 ${size}px Nunito, system-ui, sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline=base;ctx.fillText(str,x,y);ctx.restore()}
function circle(ctx,x,y,r,fill,stroke,lw=2){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function glow(ctx,x,y,r,color,a=.55){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba(color,a));g.addColorStop(1,rgba(color,0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
function shade(ctx,x,y,r,a=.38){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(0,0,0,${a})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
function poly(ctx,pts,color,lw=1.2,alpha=1,close=false){if(pts.length<2)return;ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);if(close)ctx.closePath();ctx.stroke();ctx.restore()}
function rr(ctx,x,y,w,h,r){ctx.beginPath();if(ctx.roundRect){ctx.roundRect(x,y,w,h,r)}else{ctx.rect(x,y,w,h)}}
function box(ctx,x,y,w,h,fill,stroke,r=6,lw=2){rr(ctx,x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function marble(ctx,x,y,r,color){glow(ctx,x,y,r*2.6,color,.4);circle(ctx,x,y,r,color);circle(ctx,x-r*.3,y-r*.3,r*.3,'rgba(255,255,255,.55)')}
function readout(ctx,lines,x,y,o={}){const{align='left',size=13,color=C.chalk,alpha=.94}=o;ctx.save();ctx.font=`700 ${size}px Nunito, system-ui, sans-serif`;const cw=ctx.canvas.clientWidth||ctx.canvas.width,chh=ctx.canvas.clientHeight||ctx.canvas.height;const maxW=Math.max(100,(align==='right'?x:align==='center'?Math.min(x,cw-x)*2:cw-x)-14);
  const out=[];for(const t of lines){const words=String(t).split(' ');let cur='';for(const wd of words){const test=cur?cur+' '+wd:wd;if(ctx.measureText(test).width>maxW&&cur){out.push(cur);cur=wd}else cur=test}if(cur)out.push(cur)}
  const total=out.length*(size+5)+6;if(y+total>chh-4)y=Math.max(4,chh-4-total);let mw=0;for(const t of out)mw=Math.max(mw,ctx.measureText(t).width);const bx=align==='right'?x-mw-8:align==='center'?x-mw/2-8:x-8;ctx.globalAlpha=.6;ctx.fillStyle=C.board;ctx.fillRect(bx,y-5,mw+16,total);ctx.globalAlpha=alpha;ctx.textAlign=align;ctx.textBaseline='top';ctx.fillStyle=color;out.forEach((t,i)=>ctx.fillText(t,x,y+i*(size+5)));ctx.restore()}
function arrow(ctx,x,y,dx,dy,color,lw=2.2){const L=Math.hypot(dx,dy);if(L<3)return;ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=lw;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+dx,y+dy);ctx.stroke();ctx.translate(x+dx,y+dy);ctx.rotate(Math.atan2(dy,dx));ctx.beginPath();ctx.moveTo(1,0);ctx.lineTo(-8,-4.5);ctx.lineTo(-8,4.5);ctx.closePath();ctx.fill();ctx.restore()}
function rng(seed){let t=seed>>>0;return()=>{t+=0x6D2B79F5;let r=Math.imul(t^(t>>>15),1|t);r^=r+Math.imul(r^(r>>>7),61|r);return((r^(r>>>14))>>>0)/4294967296}}

/* ---------- level ---------- */
const LV=['k5','g8','hs','col','max'];const LR={k5:0,g8:1,hs:2,col:3,max:4};let LEVEL='k5';
const at=l=>LR[LEVEL]>=LR[l];
function keepPlace(fn){const secs=[...document.querySelectorAll('.hero,.chapter')];let ref=null;for(const s of secs){if(s.getBoundingClientRect().top<=90)ref=s}const before=ref?ref.getBoundingClientRect().top:0;fn();if(ref){const after=ref.getBoundingClientRect().top;window.scrollBy({top:after-before,left:0,behavior:'instant'})}}
function setLevel(l,fromClick){if(!LV.includes(l))l='k5';LEVEL=l;keepPlace(()=>{document.documentElement.setAttribute('data-level',l);document.querySelectorAll('[data-lv]').forEach(el=>{el.hidden=!el.dataset.lv.split(' ').includes(l)})});
  document.querySelectorAll('.levels-btns button').forEach(b=>b.setAttribute('aria-selected',b.dataset.level===l?'true':'false'));
  try{localStorage.setItem('one-rule-level',l)}catch(e){}
  if(fromClick){try{const u=new URL(location.href);u.searchParams.set('level',l);history.replaceState(null,'',u)}catch(e){}}
  stopSpeak();renderMissions()}

/* ---------- sims ---------- */
const sims=[];
function makeSim(id,def){const cv=$(id);if(!cv)return null;const ctx=cv.getContext('2d');const s=Object.assign({cv,ctx,w:0,h:0,visible:false,t:0,dt:0,pointer:null},def);
  function resize(){const r=cv.getBoundingClientRect();if(r.width<2)return;const dpr=LOWPOW?1:Math.min(window.devicePixelRatio||1,2);const first=s.w===0;s.w=r.width;s.h=r.height;cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);if(first){s.init&&s.init(s)}else{s.onResize&&s.onResize(s)}s.draw(s)}
  new ResizeObserver(resize).observe(cv);resize();cv.addEventListener('chalk-resize',resize);
  new IntersectionObserver(e=>{s.visible=e[0].isIntersecting},{rootMargin:'120px'}).observe(cv);
  const pos=e=>{const r=cv.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
  cv.addEventListener('pointerdown',e=>{e.preventDefault();cv.setPointerCapture(e.pointerId);s.pointer=pos(e);s.down&&s.down(s.pointer,s,e)});
  cv.addEventListener('pointermove',e=>{s.pointer=pos(e);s.move&&s.move(s.pointer,s,e)});
  const up=e=>{s.up&&s.up(pos(e),s,e)};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  cv.addEventListener('pointerleave',()=>{s.leave&&s.leave(s)});
  sims.push(s);return s}
let last=performance.now();
let skip=false;function loop(now){const dt=Math.min(.05,(now-last)/1000);if(LOWPOW){skip=!skip;if(skip){requestAnimationFrame(loop);return}}last=now;for(const s of sims){if(!s.visible||!s.w)continue;s.dt=dt;s.t+=dt;s.step&&s.step(dt,s);s.draw(s)}requestAnimationFrame(loop)}
requestAnimationFrame(loop);
function tick(dt){for(const s of sims){if(!s.w)continue;s.dt=dt;s.t+=dt;s.step&&s.step(dt,s);s.draw(s)}}
const hook=(id,fn)=>{const el=$(id);if(el)el.addEventListener('click',fn)};
const slide=(id,fn,f)=>{const el=$(id),out=$(id+'-val');if(!el)return;const go=()=>{const v=parseFloat(el.value);if(out)out.textContent=f?f(v):v;fn(v)};el.addEventListener('input',go);go()};

/* ---------- missions ---------- */
let DEFS=[],CHECKS={},KEY='chalk',mdone=new Set();
const mApplies=m=>m.lv.includes(LEVEL);
function mcount(){const all=DEFS.filter(mApplies);const n=all.filter(m=>mdone.has(m.id)).length;const mc=$('mcount');if(mc)mc.textContent=all.length?`✓ ${n} of ${all.length}`:'';updateCert(all)}
function updateCert(all){const box=$('cert');if(!box)return;const must=all.filter(m=>!m.try);const ok=must.length>0&&must.every(m=>mdone.has(m.id));box.hidden=!ok;if(ok){const left=all.filter(m=>m.try&&!mdone.has(m.id)).length;box.querySelector('.cert-note').textContent=left?`Every must-do mission at this level is done. ${left} try-your-best mission${left>1?'s':''} still open.`:'Every mission at this level is done.'}}
function makeCert(){const box=$('cert');let name='';try{name=localStorage.getItem('chalk:name')||''}catch(e){}name=name||prompt('Name for the certificate?')||'';const all=DEFS.filter(mApplies);const n=all.filter(m=>mdone.has(m.id)).length;const lines=['THE CHALKBOARD',box.dataset.board,`${LVNAME[LEVEL]} level`,name||'(no name)',`${n} of ${all.length} missions`,new Date().toISOString().slice(0,10)];const code=fnv(lines.join('\n'));const out=box.querySelector('.certout');out.innerHTML=`<p class="c-eyebrow">The Chalkboard certifies that</p><p class="c-name">${name.replace(/</g,'&lt;')||'&nbsp;'}</p><p class="c-what">completed <b>${box.dataset.board}</b> at the ${LVNAME[LEVEL]} level</p><p class="c-meta">${n} of ${all.length} missions · ${lines[5]} · code ${code}</p>`;out.hidden=false;document.querySelectorAll('.receipt.printing').forEach(x=>x.classList.remove('printing'));out.classList.add('printing');document.body.classList.add('print-receipt');const done=()=>{document.body.classList.remove('print-receipt');out.classList.remove('printing');removeEventListener('afterprint',done)};addEventListener('afterprint',done);setTimeout(()=>{try{window.print()}catch(e){done()}},80)}
function renderMissions(){document.querySelectorAll('.missions').forEach(ul=>{const ms=DEFS.filter(m=>m.ch===ul.dataset.ch&&mApplies(m));ul.hidden=!ms.length;ul.innerHTML='<li class="mh">Mission'+(ms.length>1?'s':'')+'</li>'+ms.map(m=>`<li class="m${mdone.has(m.id)?' done':''}" data-m="${m.id}"><span class="box">✓</span><span>${m.text}</span></li>`).join('')});mcount()}
function checkMissions(){let changed=false;for(const m of DEFS){if(mdone.has(m.id)||!mApplies(m))continue;let ok=false;try{ok=!!(CHECKS[m.id]&&CHECKS[m.id]())}catch(e){ok=false}
    if(ok){mdone.add(m.id);changed=true;const li=document.querySelector(`.missions li[data-m="${m.id}"]`);if(li)li.classList.add('done','just')}}
  if(changed){try{localStorage.setItem('chalk:'+KEY+':missions',JSON.stringify([...mdone]))}catch(e){}mcount()}}

/* ---------- read aloud ---------- */
const canSpeak='speechSynthesis' in window&&'SpeechSynthesisUtterance' in window;
let speaking=null;
function stopSpeak(){if(!canSpeak)return;const was=speaking;speaking=null;try{speechSynthesis.cancel()}catch(e){}if(was){was.btn.classList.remove('is-on');was.btn.querySelector('span').textContent='Read to me';was.block.classList.remove('reading')}}
function pickVoice(){const vs=speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang));return vs.find(v=>/Samantha|Google US English|Karen|Daniel|Natural|Premium/i.test(v.name))||vs[0]||null}
function wireRead(){if(!canSpeak){document.querySelectorAll('.read').forEach(b=>b.remove());return}
  document.querySelectorAll('.read').forEach(btn=>btn.addEventListener('click',()=>{const sec=btn.closest('.text');const block=[...sec.querySelectorAll('.lv')].find(b=>b.offsetParent!==null);if(!block)return;
    if(speaking&&speaking.btn===btn){stopSpeak();return}stopSpeak();
    const parts=[];const h1=sec.querySelector('h1');if(h1)parts.push(h1.textContent.trim());[...block.querySelectorAll('h2,p')].forEach(e=>{const t=e.textContent.trim();if(t)parts.push(t)});
    const cap=sec.parentElement.querySelector('figcaption');if(cap)parts.push(cap.textContent.replace(/\s+/g,' ').trim());
    const voice=pickVoice();speaking={btn,block};btn.classList.add('is-on');btn.querySelector('span').textContent='Stop';block.classList.add('reading');
    parts.forEach((t,i)=>{const u=new SpeechSynthesisUtterance(t);u.rate=.95;u.pitch=1.05;if(voice)u.voice=voice;if(i===parts.length-1)u.onend=()=>{if(speaking&&speaking.btn===btn)stopSpeak()};speechSynthesis.speak(u)})}));
  try{speechSynthesis.getVoices()}catch(e){}window.addEventListener('pagehide',()=>stopSpeak())}


/* ---------- teach-back checks ---------- */
let passed=new Set(),UNITWHY={};
const uname=u=>{const o=document.querySelector(`form.cf select option[value="${u}"]`);return o?o.textContent:u};
function checkPassed(ch){return passed.has(ch+':'+LEVEL)}
function wireChecks(){document.querySelectorAll('form.cf').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();const box=f.closest('.check');const fb=box.querySelector('.fb');
    if(f.dataset.type==='choice'){const c=f.querySelector('input[type=radio]:checked');if(!c){fb.textContent='Pick one.';fb.className='fb bad';return}if(c.value!==f.dataset.a){fb.textContent='Not that one. Hint: '+f.dataset.hint;fb.className='fb bad';return}fb.textContent=f.dataset.ok;fb.className='fb ok';passed.add(box.dataset.ch+':'+LEVEL);try{localStorage.setItem('chalk:'+KEY+':checks',JSON.stringify([...passed]))}catch(e){}return}
    const v=parseFloat(String(f.querySelector('input').value).replace(/,/g,''));const u=f.querySelector('select').value;const a=parseFloat(f.dataset.a),want=f.dataset.u,tol=parseFloat(f.dataset.tol||'.02');
    if(isNaN(v)){fb.textContent='Type a number first.';fb.className='fb bad';return}
    if(!u){fb.textContent='Pick a unit. A number without a unit is not an answer.';fb.className='fb bad';return}
    if(u!==want){fb.textContent=`Units first. You answered in ${uname(u)}, but this question wants ${uname(want)}: ${UNITWHY[want]||''}. Try again in ${want}.`;fb.className='fb bad';return}
    const err=a===0?Math.abs(v):Math.abs(v-a)/Math.abs(a);
    if(err>tol){fb.textContent='Right unit, wrong number. Hint: '+f.dataset.hint;fb.className='fb bad';return}
    fb.textContent=f.dataset.ok;fb.className='fb ok';passed.add(box.dataset.ch+':'+LEVEL);try{localStorage.setItem('chalk:'+KEY+':checks',JSON.stringify([...passed]))}catch(e){}}))}


/* ---------- hand it in: receipts ---------- */
const LVNAME={k5:'Kids (K to 5th)',g8:'8th grade',hs:'High school',col:'College',max:'Max'};
function fnv(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36).toUpperCase().padStart(7,'0').slice(-6)}
function receiptFor(box){const ch=box.dataset.ch;const ms=DEFS.filter(m=>m.ch===ch&&mApplies(m));const done=ms.filter(m=>mdone.has(m.id));const name=(box.querySelector('.hi-name').value||'').trim()||'(no name)';const exit=(box.querySelector('.hi-exit').value||'').trim().replace(/\s+/g,' ')||'(blank)';
  const lines=['THE CHALKBOARD RECEIPT',`Board: ${box.dataset.board}`,`Chapter: ${ch.replace('ch','')} · ${box.dataset.title}`,`Level: ${LVNAME[LEVEL]}`,`Name: ${name}`,`Date: ${new Date().toISOString().slice(0,10)}`,`Missions: ${done.length}/${ms.length}${done.length?' ('+done.map(m=>m.id).join(', ')+')':''}`,`Teach it back: ${passed.has(ch+':'+LEVEL)?'passed':'not yet'}`,`Exit ticket: ${exit}`];
  return lines.join('\n')+'\nCode: '+fnv(lines.join('\n'))}
function wireHandin(){let savedName='';try{savedName=localStorage.getItem('chalk:name')||''}catch(e){}
  document.querySelectorAll('.handin').forEach(box=>{const nm=box.querySelector('.hi-name');if(savedName)nm.value=savedName;nm.addEventListener('change',()=>{try{localStorage.setItem('chalk:name',nm.value)}catch(e){}});
    const out=box.querySelector('.receipt');box.querySelector('.hi-make').addEventListener('click',()=>{out.textContent=receiptFor(box);out.hidden=false;box.querySelector('.hi-tools').hidden=false});
    box.querySelector('.hi-copy').addEventListener('click',async()=>{const t=out.textContent;try{await navigator.clipboard.writeText(t);box.querySelector('.hi-copy').textContent='Copied'}catch(e){const r=document.createRange();r.selectNodeContents(out);const sel=getSelection();sel.removeAllRanges();sel.addRange(r);box.querySelector('.hi-copy').textContent='Selected: press copy'}setTimeout(()=>box.querySelector('.hi-copy').textContent='Copy',1800)});
    box.querySelector('.hi-print').addEventListener('click',()=>{document.querySelectorAll('.receipt.printing').forEach(x=>x.classList.remove('printing'));out.classList.add('printing');document.body.classList.add('print-receipt');const done=()=>{document.body.classList.remove('print-receipt');out.classList.remove('printing');removeEventListener('afterprint',done)};addEventListener('afterprint',done);setTimeout(()=>{try{window.print()}catch(e){done()}},50)})})}

/* ---------- start ---------- */
function start(o){KEY=o.key||'chalk';DEFS=o.missions||[];CHECKS=o.checks||{};UNITWHY=o.unitWhy||{};
  try{passed=new Set(JSON.parse(localStorage.getItem('chalk:'+KEY+':checks')||'[]'))}catch(e){}wireChecks();wireHandin();
  try{mdone=new Set(JSON.parse(localStorage.getItem('chalk:'+KEY+':missions')||'[]'))}catch(e){}
  document.querySelectorAll('.levels-btns button').forEach(b=>b.addEventListener('click',()=>setLevel(b.dataset.level,true)));
  wireRead();const cb=$('cert-go');if(cb)cb.addEventListener('click',makeCert);const lp=$('lowpow');if(lp){lp.addEventListener('click',()=>setLowPow(!LOWPOW));setLowPow(LOWPOW)}
  let lv0=null;try{lv0=new URL(location.href).searchParams.get('level')}catch(e){}if(!lv0){try{lv0=localStorage.getItem('one-rule-level')}catch(e){}}
  setLevel(lv0||'k5',false);setInterval(checkMissions,300);
  const links=[...document.querySelectorAll('.trail a')];if(links.length){const io=new IntersectionObserver(es=>{for(const e of es){if(e.isIntersecting)links.forEach(l=>l.classList.toggle('is-active',l.dataset.for===e.target.id))}},{rootMargin:'-45% 0px -50% 0px'});document.querySelectorAll('#top, .chapter').forEach(el=>io.observe(el))}}
return{C,REDUCE,get lowPower(){return LOWPOW},rgba,clamp,dist,$,fmt,sup,pct,text,circle,glow,shade,poly,rr,box,marble,readout,arrow,rng,at,level:()=>LEVEL,makeSim,hook,slide,start,checkPassed,tick,checkNow:()=>checkMissions(),fnv};
})();
