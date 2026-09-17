(function(){
const $=id=>document.getElementById(id);
const C={chalk:'#F1ECDF',yellow:'#F6D46B',blue:'#8CC4EE',pink:'#F596A8',green:'#9DDBA3',board:'#1B2923'};
const SC={ideas:C.yellow,tools:C.blue,know:C.pink};
let level=null;try{level=localStorage.getItem('one-rule-level')}catch(e){}
function withLevel(u){if(!level)return u;try{const x=new URL(u);x.searchParams.set('level',level);return x.toString()}catch(e){return u}}
function relink(){document.querySelectorAll('a[href^="http"]').forEach(a=>{if(/one-rule-for-everything|chalkboard\//.test(a.href))a.href=withLevel(a.getAttribute('href').split('?')[0].replace(/#.*$/,''))+(a.getAttribute('href').match(/#.*$/)||[''])[0]});
  document.querySelectorAll('[data-glevel]').forEach(b=>b.classList.toggle('is-on',b.dataset.glevel===level));const names={k5:'Kids',g8:'8th grade',hs:'High school',col:'College',max:'Max'};const gn=$('gnote');if(gn)gn.textContent=level?`every link opens at the ${names[level]} level`:'pick a level and every link will open there'}
document.querySelectorAll('[data-glevel]').forEach(b=>b.addEventListener('click',()=>{level=b.dataset.glevel;try{localStorage.setItem('one-rule-level',level)}catch(e){}relink()}));
relink();
// progress
function done(bid){let s=new Set();try{const raw=localStorage.getItem('chalk:'+bid+':missions')||(bid==='einstein'?localStorage.getItem('one-rule-missions'):null);if(raw)s=new Set(JSON.parse(raw))}catch(e){}return s}
const prog={};for(const b of MAP.boards){const d=done(b.id);prog[b.id]=b.chapters.map(c=>c.missions.length?c.missions.filter(m=>d.has(m)).length/c.missions.length:0)}
// layout
const cv=$('cv-map');if(cv){const ctx=cv.getContext('2d'),tip=$('maptip');let W=0,H=0,nodes=[],unit='';
function layout(){const r=cv.parentElement.getBoundingClientRect();W=Math.max(320,r.width);const rowH=W<520?78:96;H=MAP.boards.length*rowH+40;const dpr=Math.min(devicePixelRatio||1,2);cv.width=W*dpr;cv.height=H*dpr;cv.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
  nodes=[];const left=W<520?24:150,right=W-24;MAP.boards.forEach((b,bi)=>{const y=40+bi*rowH+rowH*.45;const n=b.chapters.length;const gap=(right-left)/Math.max(n-1,1);b.chapters.forEach((c,ci)=>nodes.push({b:b.id,bi,n:c.n,title:c.title,warm:c.warm,x:n===1?(left+right)/2:left+ci*gap,y,p:prog[b.id][ci],url:b.url+'#ch'+c.n,strand:b.strand}))})}
const find=(bid,n)=>nodes.find(k=>k.b===bid&&k.n===n);
function draw(){ctx.clearRect(0,0,W,H);const R=W<520?11:14;const rowH=W<520?78:96;
  MAP.boards.forEach((b,bi)=>{const y=40+bi*rowH+rowH*.45;const row=nodes.filter(k=>k.b===b.id);ctx.save();ctx.strokeStyle='rgba(241,236,223,.25)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(row[0].x,y);ctx.lineTo(row[row.length-1].x,y);ctx.stroke();ctx.restore();
    ctx.save();ctx.font=`700 ${W<520?15:18}px Caveat, cursive`;ctx.fillStyle=SC[b.strand];ctx.textAlign='left';ctx.textBaseline='middle';if(W<520)ctx.fillText(b.title,24,y-rowH*.42);else{ctx.fillText(b.title,14,y-10);ctx.font='900 10px Nunito, sans-serif';ctx.fillStyle='rgba(241,236,223,.6)';ctx.fillText(b.subject.toUpperCase(),14,y+8)}ctx.restore()});
  const U=MAP.units.find(u=>u.id===unit);
  for(const[b1,n1,b2,n2]of MAP.edges){const a=find(b1,n1),c=find(b2,n2);if(!a||!c)continue;const inU=U&&U.steps.some(s=>s[0]===b1&&s[1]===n1)&&U.steps.some(s=>s[0]===b2&&s[1]===n2);ctx.save();ctx.strokeStyle=inU?C.green:'rgba(241,236,223,.4)';ctx.lineWidth=inU?3:1.5;ctx.setLineDash(inU?[]:[5,5]);const mx=(a.x+c.x)/2,my=(a.y+c.y)/2+(a.y===c.y?-40:0);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(mx,my,c.x,c.y);ctx.stroke();const t=.92,qx=(1-t)*(1-t)*a.x+2*(1-t)*t*mx+t*t*c.x,qy=(1-t)*(1-t)*a.y+2*(1-t)*t*my+t*t*c.y;const ang=Math.atan2(c.y-qy,c.x-qx);ctx.setLineDash([]);ctx.fillStyle=inU?C.green:'rgba(241,236,223,.6)';ctx.translate(c.x-Math.cos(ang)*(R+2),c.y-Math.sin(ang)*(R+2));ctx.rotate(ang);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-9,-5);ctx.lineTo(-9,5);ctx.closePath();ctx.fill();ctx.restore()}
  if(U){ctx.save();ctx.strokeStyle=C.green;ctx.lineWidth=4;ctx.globalAlpha=.9;ctx.lineJoin='round';ctx.beginPath();U.steps.forEach((s,i)=>{const k=find(s[0],s[1]);if(!k)return;i?ctx.lineTo(k.x,k.y):ctx.moveTo(k.x,k.y)});ctx.stroke();ctx.restore()}
  for(const k of nodes){const inU=U&&U.steps.some(s=>s[0]===k.b&&s[1]===k.n);const stepIdx=U?U.steps.findIndex(s=>s[0]===k.b&&s[1]===k.n):-1;ctx.save();if(k.p>0){const g=ctx.createRadialGradient(k.x,k.y,0,k.x,k.y,R*2.4);g.addColorStop(0,`rgba(246,212,107,${.35*k.p+.15})`);g.addColorStop(1,'rgba(246,212,107,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(k.x,k.y,R*2.4,0,Math.PI*2);ctx.fill()}
    ctx.beginPath();ctx.arc(k.x,k.y,R,0,Math.PI*2);ctx.fillStyle=k.p>=1?C.yellow:k.p>0?`rgba(246,212,107,${.25+.5*k.p})`:C.board;ctx.fill();ctx.lineWidth=inU?3:2;ctx.strokeStyle=inU?C.green:SC[k.strand];ctx.globalAlpha=U&&!inU?.35:1;ctx.stroke();
    ctx.font=`900 ${R*.85}px Nunito, sans-serif`;ctx.fillStyle=k.p>.5?C.board:C.chalk;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(inU?String(stepIdx+1):String(k.n),k.x,k.y+1);ctx.restore()}}
function hit(e){const r=cv.getBoundingClientRect();const x=e.clientX-r.left,y=e.clientY-r.top;return nodes.find(k=>Math.hypot(k.x-x,k.y-y)<18)}
cv.addEventListener('mousemove',e=>{const k=hit(e);if(!k){tip.style.display='none';return}const r=cv.getBoundingClientRect();tip.innerHTML=`<b>${k.title}</b>${k.warm}<br><small>${MAP.boards.find(b=>b.id===k.b).title}, chapter ${k.n} · ${Math.round(k.p*100)}% of missions done</small>`;tip.style.display='block';tip.style.left=Math.min(k.x+16,W-310)+'px';tip.style.top=(k.y+16)+'px'});
cv.addEventListener('mouseleave',()=>tip.style.display='none');
cv.addEventListener('click',e=>{const k=hit(e);if(k)location.href=withLevel(k.url.split('#')[0])+'#ch'+k.n});
document.querySelectorAll('[data-mapunit]').forEach(b=>b.addEventListener('click',()=>{unit=b.dataset.mapunit;document.querySelectorAll('[data-mapunit]').forEach(x=>x.classList.toggle('is-on',x===b));draw()}));
new ResizeObserver(()=>{layout();draw()}).observe(cv.parentElement);layout();draw();}
// question search
const qb=$('qbox');if(qb)qb.addEventListener('input',()=>{const q=qb.value.trim().toLowerCase();document.querySelectorAll('#qlist li').forEach(li=>{li.hidden=q&&!li.textContent.toLowerCase().includes(q)})});
})();
