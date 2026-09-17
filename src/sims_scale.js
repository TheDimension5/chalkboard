const {C,rgba,clamp,dist,$,fmt,sup,pct,text,circle,glow,shade,poly,rr,box,marble,readout,arrow,rng,at,makeSim,hook,slide}=Chalk;
const EMIN=-34.5,EMAX=27.3;
const RAW=[
['The observable universe',8.8e26,'web',C.chalk,'Everything whose light has had time to reach us. Beyond it we cannot say.'],
['The Laniakea supercluster',5.2e24,'web',C.blue,'Our home supercluster: a hundred thousand galaxies flowing toward one point.'],
['The Local Group',9.5e22,'group',C.blue,'Our small cluster of galaxies. Andromeda is the other big one.'],
['The Andromeda galaxy',2.1e21,'galaxy',C.pink,'A trillion stars, on its way to merge with us in about four billion years.'],
['The Milky Way',9.5e20,'galaxy',C.yellow,'Our galaxy: a few hundred billion stars. The Sun sits two-thirds of the way out.'],
['The Orion Nebula',2.3e17,'cloud',C.pink,'A cloud where stars are being born right now, 24 light-years across.'],
['The gap to the nearest star',4.0e16,'gap',C.chalk,'From the Sun to Proxima Centauri: 4.2 light-years of almost nothing.'],
['The Oort cloud',1.5e16,'ring',C.chalk,'A shell of frozen comets marking the edge of the Sun’s grip.'],
['Voyager 1’s distance',2.4e13,'dot',C.yellow,'The farthest human-made thing: 24 billion km out, still calling home.'],
['The solar system',9.0e12,'orbits',C.yellow,'Out to Neptune. Light takes four hours to cross it.'],
['Earth’s orbit',3.0e11,'ring',C.blue,'Our year, drawn as a circle. Light crosses it in 17 minutes.'],
['The Sun',1.39e9,'sun',C.yellow,'109 Earths wide, and 99.8% of everything in the solar system.'],
['Jupiter',1.4e8,'planet',C.pink,'Eleven Earths across; its Great Red Spot alone would swallow Earth.'],
['The Earth',1.27e7,'earth',C.blue,'Home. 12,742 km across. Everything smaller than this is on it.'],
['The Moon',3.5e6,'planet',C.chalk,'A quarter of Earth’s width, thirty Earths away.'],
['Great Britain',1.0e6,'land',C.green,'About a thousand kilometres, top to bottom.'],
['The Grand Canyon',4.5e5,'land',C.pink,'446 km long, and up to 29 km wide.'],
['A neutron star',2.0e4,'sun',C.blue,'The mass of the Sun packed into a ball 20 km across.'],
['Mount Everest',8.8e3,'mountain',C.chalk,'8,849 m: the top is above most of the air.'],
['The Burj Khalifa',8.3e2,'building',C.chalk,'The tallest building: 828 m.'],
['A football field',1.0e2,'field',C.green,'100 m: the length most people can picture.'],
['A blue whale',3.0e1,'whale',C.blue,'The biggest animal that has ever lived: 30 m.'],
['An elephant',6.0e0,'animal',C.chalk,'About 6 m, trunk to tail.'],
['You',1.7e0,'person',C.yellow,'A person: 1.7 m. Near the middle of everything we can see.'],
['A cat',4.6e-1,'cat',C.pink,'Half a metre of cat.'],
['A hand',1.8e-1,'hand',C.yellow,'18 cm: the ruler you always have.'],
['A golf ball',4.3e-2,'ball',C.chalk,'4.3 cm.'],
['A pea',7.0e-3,'ball',C.green,'7 mm.'],
['An ant',4.0e-3,'ant',C.chalk,'4 mm, and it lifts fifty times its own weight.'],
['A grain of sand',5.0e-4,'sand',C.yellow,'Half a millimetre.'],
['A dust mite',3.0e-4,'mite',C.chalk,'0.3 mm: too small to see, and there are thousands in your bed.'],
['A paramecium',2.0e-4,'para',C.green,'One cell that swims: 0.2 mm, just visible as a speck.'],
['A human egg cell',1.2e-4,'cell',C.pink,'The biggest cell in the body, barely visible to the eye.'],
['A human hair',8.0e-5,'hair',C.chalk,'80 micrometres wide.'],
['A red blood cell',8.0e-6,'rbc',C.pink,'8 micrometres. Your body makes 25 million of them every second.'],
['A bacterium (E. coli)',2.0e-6,'rod',C.green,'2 micrometres long: a thousand in a row would span a sand grain.'],
['A mitochondrion',1.0e-6,'rod',C.yellow,'A micrometre: the power plant inside your cells.'],
['A wavelength of visible light',5.0e-7,'wave',C.yellow,'500 nanometres. Nothing much smaller than this can be seen with light.'],
['A coronavirus',1.2e-7,'virus',C.pink,'120 nanometres.'],
['A ribosome',2.5e-8,'blob',C.blue,'25 nanometres: the machine that reads the recipe and builds proteins.'],
['An antibody',1.0e-8,'y',C.chalk,'10 nanometres, shaped like a Y.'],
['The width of DNA',2.0e-9,'helix',C.green,'2 nanometres wide, and two metres long per cell if you unrolled it.'],
['A glucose molecule',9.0e-10,'molecule',C.yellow,'Just under a nanometre: 24 atoms of sugar.'],
['A water molecule',2.8e-10,'water',C.blue,'0.28 nanometres. Three atoms.'],
['A hydrogen atom',1.1e-10,'atom',C.chalk,'A tenth of a nanometre: one proton, one electron, and mostly nothing.'],
['A gamma-ray wavelength',1.0e-12,'wave',C.pink,'A picometre: the light that can see inside atoms.'],
['A gold nucleus',1.5e-14,'nucleus',C.yellow,'15 femtometres: 20,000 times smaller than its atom.'],
['A proton',1.7e-15,'proton',C.pink,'1.7 femtometres: three quarks and a great deal of energy.'],
['A quark',1.0e-18,'question',C.chalk,'Smaller than a thousandth of a proton. No size has ever been measured.'],
['The LHC’s reach',1.0e-19,'question',C.blue,'The smallest scale any experiment has probed: about 10⁻¹⁹ m.'],
['The Planck length',1.6e-35,'planck',C.yellow,'1.6 × 10⁻³⁵ m: where our ideas of distance stop working.'],
];
const CONTAIN=new Set(['web','group','galaxy','cloud','orbits','sun','planet','earth','land','cell','rbc','rod','para','atom','nucleus','proton']);
const OBJ=RAW.map(([name,size,kind,col,fact],i)=>{const a=i*2.399963,r=.28+.5*((i*7)%5)/4;return{name,size,kind,col,fact,E:Math.log10(size),u:Math.cos(a)*r,v:Math.sin(a)*r}});
const NOTES=[{a:-34.6,b:-19.6,t:['Nothing has ever been seen here.','Fifteen powers of ten','with no known structure.']},{a:26.95,b:28,t:['Beyond this, light has not','had time to reach us.']}];
const nice=v=>v>=100?Math.round(v).toLocaleString():v>=10?v.toFixed(0):v.toFixed(v%1?1:0);
function friendly(S){if(S>=4.7e15)return nice(S/9.46e15)+' light-years';if(S>=1e3)return nice(S/1e3)+' km';if(S>=1)return nice(S)+' m';if(S>=1e-2)return nice(S*100)+' cm';if(S>=1e-3)return nice(S*1e3)+' mm';if(S>=1e-6)return nice(S*1e6)+' micrometres';if(S>=1e-9)return nice(S*1e9)+' nanometres';if(S>=1e-12)return nice(S*1e12)+' picometres';if(S>=1e-15)return nice(S*1e15)+' femtometres';return null}
function sci(S){const e=Math.floor(Math.log10(S)),m=S/Math.pow(10,e);return `${m.toFixed(m<9.95?1:0)} × 10${sup(e)} m`}
function sizeLabel(S){const f=friendly(S);if(!at('g8'))return f||sci(S);if(!at('hs'))return (f?f+' = ':'')+'10'+sup(Math.round(Math.log10(S)))+' m';return sci(S)+(f?' = '+f:'')}
/* glyphs: (ctx,x,y,d,col,t) */
const GL={};
GL.dot=(c,x,y,d,col)=>circle(c,x,y,Math.max(1.5,d/2),col);
GL.ball=(c,x,y,d,col)=>{const r=d/2;circle(c,x,y,r,rgba(col,.18),col,2);circle(c,x-r*.35,y-r*.35,Math.max(1,r*.12),rgba(C.chalk,.5))};
GL.planet=GL.ball;
GL.sun=(c,x,y,d,col)=>{const r=d/2;glow(c,x,y,r*1.6,col,.25);circle(c,x,y,r,rgba(col,.35),col,2);c.save();c.strokeStyle=col;c.globalAlpha=.6;c.lineWidth=1.5;for(let k=0;k<12;k++){const a=k*Math.PI/6;c.beginPath();c.moveTo(x+Math.cos(a)*r*1.12,y+Math.sin(a)*r*1.12);c.lineTo(x+Math.cos(a)*r*1.3,y+Math.sin(a)*r*1.3);c.stroke()}c.restore()};
GL.earth=(c,x,y,d,col)=>{const r=d/2;circle(c,x,y,r,rgba(col,.2),col,2);c.save();c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.clip();c.fillStyle=rgba(C.green,.55);[[-.3,-.2,.45,.3,.4],[.25,.1,.3,.5,-.5],[-.1,.5,.35,.2,.2],[.4,-.5,.2,.15,.9]].forEach(([u,v,a,b,rot])=>{c.beginPath();c.ellipse(x+u*r,y+v*r,a*r,b*r,rot,0,Math.PI*2);c.fill()});c.restore()};
GL.galaxy=(c,x,y,d,col)=>{const r=d/2;glow(c,x,y,r*.9,col,.14);circle(c,x,y,Math.max(1.5,r*.1),rgba(col,.9));for(let k=0;k<2;k++){const pts=[];for(let i=0;i<=40;i++){const th=i/40*2.3*Math.PI;const rr=r*.1+r*.9*(th/(2.3*Math.PI));pts.push([x+rr*Math.cos(th+k*Math.PI),y+rr*Math.sin(th+k*Math.PI)*.75])}poly(c,pts,col,Math.max(1,r*.05),.8)}};
GL.group=(c,x,y,d,col)=>{const r=d/2,g=rng(21);for(let i=0;i<8;i++){const a=g()*6.28,rr=g()*r*.85,s=i<2?r*.18:r*.07;GL.galaxy(c,x+Math.cos(a)*rr,y+Math.sin(a)*rr,s*2,i<2?col:C.chalk)}};
GL.web=(c,x,y,d,col)=>{const r=d/2,g=rng(33);const P=[];for(let i=0;i<26;i++){const a=g()*6.28,rr=Math.sqrt(g())*r;P.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr])}c.save();c.strokeStyle=col;c.globalAlpha=.3;c.lineWidth=1;for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){if(Math.hypot(P[i][0]-P[j][0],P[i][1]-P[j][1])<r*.5){c.beginPath();c.moveTo(P[i][0],P[i][1]);c.lineTo(P[j][0],P[j][1]);c.stroke()}}c.restore();P.forEach(p=>circle(c,p[0],p[1],Math.max(1,r*.02),rgba(col,.8)));c.save();c.setLineDash([4,6]);circle(c,x,y,r,null,rgba(col,.4),1.5);c.restore()};
GL.cloud=(c,x,y,d,col)=>{const r=d/2,g=rng(8);glow(c,x,y,r,col,.35);glow(c,x-r*.3,y+r*.2,r*.6,C.blue,.25);for(let i=0;i<9;i++)circle(c,x+(g()*2-1)*r*.7,y+(g()*2-1)*r*.7,Math.max(1,r*.03),C.chalk)};
GL.gap=(c,x,y,d,col)=>{const r=d/2;c.save();c.setLineDash([3,9]);poly(c,[[x-r,y],[x+r,y]],col,1,.35);c.restore();circle(c,x-r,y,Math.max(1.5,r*.01),C.yellow);circle(c,x+r,y,Math.max(1.5,r*.01),C.pink);text(c,'Sun',x-r,y+14,{size:11,fam:'body',alpha:.6});text(c,'Proxima',x+r,y+14,{size:11,fam:'body',alpha:.6})};
GL.ring=(c,x,y,d,col)=>{const r=d/2;c.save();c.setLineDash([6,6]);circle(c,x,y,r,null,col,1.5);c.restore();circle(c,x,y,Math.max(1.5,r*.02),C.yellow)};
GL.orbits=(c,x,y,d,col)=>{const r=d/2;c.save();c.setLineDash([4,5]);[.06,.1,.14,.2,.34,.5,.7,1].forEach((f,i)=>{circle(c,x,y,r*f,null,rgba(col,.55),1);const a=i*1.3;circle(c,x+Math.cos(a)*r*f,y+Math.sin(a)*r*f,Math.max(1.2,r*.012),i===2?C.blue:C.chalk)});c.restore();circle(c,x,y,Math.max(2,r*.02),col)};
GL.blob=(c,x,y,d,col,t)=>{const r=d/2,pts=[];for(let i=0;i<=28;i++){const th=i/28*6.283;const rr=r*(1+.1*Math.sin(3*th+t*1.5)+.05*Math.sin(5*th));pts.push([x+rr*Math.cos(th),y+rr*Math.sin(th)])}c.save();c.fillStyle=rgba(col,.15);c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fill();c.restore();poly(c,pts,col,2,.9)};
GL.para=(c,x,y,d,col,t)=>{const r=d/2;c.save();c.translate(x,y);c.rotate(-.4);c.fillStyle=rgba(col,.15);c.strokeStyle=col;c.lineWidth=2;c.beginPath();c.ellipse(0,0,r,r*.42,0,0,Math.PI*2);c.fill();c.stroke();c.globalAlpha=.6;c.lineWidth=1;for(let i=0;i<30;i++){const th=i/30*6.283;const px=Math.cos(th)*r,py=Math.sin(th)*r*.42;c.beginPath();c.moveTo(px,py);c.lineTo(px*1.1+Math.sin(t*6+i)*2,py*1.15);c.stroke()}c.restore();circle(c,x-r*.2,y,Math.max(1.5,r*.12),rgba(col,.5))};
GL.cell=(c,x,y,d,col)=>{const r=d/2;circle(c,x,y,r,rgba(col,.12),col,2);circle(c,x,y,r*.3,rgba(col,.4),col,1.2);c.save();c.setLineDash([2,4]);circle(c,x,y,r*.85,null,rgba(col,.4),1);c.restore()};
GL.rbc=(c,x,y,d,col)=>{const r=d/2;circle(c,x,y,r,rgba(col,.25),col,2);circle(c,x,y,r*.45,'rgba(0,0,0,.25)',rgba(col,.6),1)};
GL.rod=(c,x,y,d,col,t)=>{const r=d/2,h=d*.42;c.save();c.translate(x,y);c.rotate(.3);box(c,-r,-h/2,d,h,rgba(col,.15),col,h/2,2);c.strokeStyle=col;c.globalAlpha=.6;c.lineWidth=1.2;for(let k=0;k<3;k++){c.beginPath();c.moveTo(r,(k-1)*h*.25);for(let i=1;i<=12;i++)c.lineTo(r+i*d*.06,(k-1)*h*.25+Math.sin(i*.9+t*4+k)*h*.18);c.stroke()}c.restore()};
GL.virus=(c,x,y,d,col)=>{const r=d/2*.78;circle(c,x,y,r,rgba(col,.2),col,2);c.save();c.strokeStyle=col;c.lineWidth=Math.max(1,r*.06);for(let k=0;k<18;k++){const a=k*Math.PI/9;c.beginPath();c.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);c.lineTo(x+Math.cos(a)*r*1.22,y+Math.sin(a)*r*1.22);c.stroke();circle(c,x+Math.cos(a)*r*1.27,y+Math.sin(a)*r*1.27,Math.max(1,r*.07),col)}c.restore()};
GL.wave=(c,x,y,d,col)=>{const r=d/2,A=Math.max(3,r*.35);for(const[k,al]of[[-1,.3],[0,.95],[1,.3]]){const pts=[];for(let i=0;i<=40;i++){const px=x+(k*d)-r+d*i/40;pts.push([px,y-Math.sin(i/40*6.283)*A])}poly(c,pts,col,2,al)}arrow(c,x-r,y+A+12,d,0,rgba(col,.7),1.5);arrow(c,x+r,y+A+12,-d,0,rgba(col,.7),1.5);text(c,'one wavelength',x,y+A+26,{size:11,fam:'body',alpha:.7})};
GL.y=(c,x,y,d,col)=>{const r=d/2;poly(c,[[x,y+r],[x,y]],col,Math.max(2,r*.12));poly(c,[[x,y],[x-r*.6,y-r*.9]],col,Math.max(2,r*.12));poly(c,[[x,y],[x+r*.6,y-r*.9]],col,Math.max(2,r*.12))};
GL.helix=(c,x,y,d,col)=>{const r=d/2,H=d*6;const a=[],b=[];for(let i=0;i<=120;i++){const yy=y-H/2+H*i/120,ph=i/120*6.283*3;a.push([x+Math.sin(ph)*r,yy]);b.push([x-Math.sin(ph)*r,yy]);if(i%6===0)poly(c,[[x+Math.sin(ph)*r,yy],[x-Math.sin(ph)*r,yy]],rgba(col,.5),1.2)}poly(c,a,col,2.2);poly(c,b,C.blue,2.2)};
GL.molecule=(c,x,y,d,col)=>{const r=d/2*.75;const P=[];for(let k=0;k<6;k++){const a=k*Math.PI/3;P.push([x+Math.cos(a)*r,y+Math.sin(a)*r])}for(let k=0;k<6;k++)poly(c,[P[k],P[(k+1)%6]],col,2,.8);P.forEach((p,k)=>circle(c,p[0],p[1],Math.max(2,r*.22),k%2?C.chalk:col));circle(c,x+r*1.3,y,Math.max(2,r*.22),C.pink);poly(c,[P[0],[x+r*1.3,y]],col,2,.8)};
GL.water=(c,x,y,d,col)=>{const r=d/2;const h=[[x-r*.62,y+r*.35],[x+r*.62,y+r*.35]];h.forEach(p=>{poly(c,[[x,y-r*.1],p],col,2,.7);circle(c,p[0],p[1],r*.3,C.chalk)});circle(c,x,y-r*.1,r*.48,col)};
GL.atom=(c,x,y,d,col)=>{const r=d/2;c.save();c.setLineDash([3,5]);circle(c,x,y,r,rgba(col,.07),rgba(col,.7),1.5);c.restore();glow(c,x,y,r*.9,col,.12);circle(c,x,y,Math.max(1.5,r*.004),C.pink);text(c,'nucleus (too small to draw)',x,y+16,{size:10,fam:'body',alpha:.55})};
GL.nucleus=(c,x,y,d,col)=>{const r=d/2,g=rng(4);for(let i=0;i<20;i++){const a=g()*6.28,rr=Math.sqrt(g())*r*.72;circle(c,x+Math.cos(a)*rr,y+Math.sin(a)*rr,r*.26,i%2?rgba(col,.8):rgba(C.pink,.8),C.board,1)}};
GL.proton=(c,x,y,d,col)=>{const r=d/2;c.save();c.setLineDash([4,5]);circle(c,x,y,r,rgba(col,.06),rgba(col,.7),1.5);c.restore();const Q=[0,1,2].map(k=>[x+Math.cos(k*2.094-1.57)*r*.42,y+Math.sin(k*2.094-1.57)*r*.42]);for(let k=0;k<3;k++){const A=Q[k],B=Q[(k+1)%3],pts=[];for(let i=0;i<=16;i++){const t=i/16;pts.push([A[0]+(B[0]-A[0])*t+Math.sin(i*1.2)*r*.05,A[1]+(B[1]-A[1])*t+Math.cos(i*1.2)*r*.05])}poly(c,pts,C.blue,1.5,.7)}Q.forEach((p,k)=>{circle(c,p[0],p[1],r*.12,k?C.yellow:C.pink);text(c,k?'u':'d',p[0],p[1],{size:r*.16,color:C.board,fam:'body'})})};
GL.question=(c,x,y,d,col)=>{const r=d/2;c.save();c.setLineDash([3,6]);circle(c,x,y,r,null,rgba(col,.6),1.5);c.restore();text(c,'?',x,y,{size:Math.max(14,r*.9),color:col,alpha:.7})};
GL.planck=(c,x,y,d,col,t)=>{const r=d/2;c.save();c.setLineDash([2,4]);c.lineDashOffset=-t*20;circle(c,x,y,r,rgba(col,.08),col,2);c.restore();for(let k=0;k<4;k++){const a=t*.8+k*1.571;poly(c,[[x+Math.cos(a)*r*.3,y+Math.sin(a)*r*.3],[x+Math.cos(a)*r*.7,y+Math.sin(a)*r*.7]],rgba(col,.5),1.2)}};
GL.mountain=(c,x,y,d,col)=>{const r=d/2;c.save();c.fillStyle=rgba(col,.12);c.beginPath();c.moveTo(x-r*1.1,y+r*.6);c.lineTo(x-r*.2,y-r*.6);c.lineTo(x+r*.1,y-r*.3);c.lineTo(x+r*.3,y-r*.55);c.lineTo(x+r*1.1,y+r*.6);c.closePath();c.fill();c.strokeStyle=col;c.lineWidth=2;c.stroke();c.fillStyle=rgba(C.chalk,.7);c.beginPath();c.moveTo(x-r*.2,y-r*.6);c.lineTo(x-r*.05,y-r*.4);c.lineTo(x+r*.1,y-r*.3);c.lineTo(x+r*.3,y-r*.55);c.lineTo(x+r*.2,y-r*.35);c.closePath();c.fill();c.restore()};
GL.building=(c,x,y,d,col)=>{const r=d/2;[[1,.16],[.7,.11],[.4,.07]].forEach(([f,wf])=>box(c,x-r*wf,y+r-2*r*f,2*r*wf,2*r*f,rgba(col,.12),col,2,1.5));poly(c,[[x,y-r],[x,y-r*1.15]],col,1.5)};
GL.field=(c,x,y,d,col)=>{const r=d/2,h=d*.53;box(c,x-r,y-h/2,d,h,rgba(col,.12),col,2,2);poly(c,[[x,y-h/2],[x,y+h/2]],col,1,.6);for(let k=1;k<10;k++)poly(c,[[x-r+d*k/10,y-h/2],[x-r+d*k/10,y+h/2]],col,1,.25)};
GL.whale=(c,x,y,d,col)=>{const r=d/2;c.save();c.fillStyle=rgba(col,.2);c.strokeStyle=col;c.lineWidth=2;c.beginPath();c.ellipse(x,y,r*.85,r*.22,0,0,Math.PI*2);c.fill();c.stroke();c.beginPath();c.moveTo(x+r*.8,y);c.lineTo(x+r*1.05,y-r*.22);c.lineTo(x+r*.95,y);c.lineTo(x+r*1.05,y+r*.22);c.closePath();c.fill();c.stroke();c.restore();circle(c,x-r*.55,y-r*.05,Math.max(1,r*.03),C.board)};
GL.animal=(c,x,y,d,col)=>{const r=d/2;c.save();c.strokeStyle=col;c.fillStyle=rgba(col,.15);c.lineWidth=2;c.beginPath();c.ellipse(x,y-r*.1,r*.55,r*.35,0,0,Math.PI*2);c.fill();c.stroke();circle(c,x-r*.7,y-r*.3,r*.22,rgba(col,.15),col,2);c.beginPath();c.moveTo(x-r*.85,y-r*.2);c.quadraticCurveTo(x-r*1.05,y+r*.2,x-r*.9,y+r*.5);c.stroke();[-.35,-.15,.15,.35].forEach(f=>{c.beginPath();c.moveTo(x+f*r,y+r*.2);c.lineTo(x+f*r,y+r*.6);c.stroke()});c.restore()};
GL.person=(c,x,y,d,col)=>{const r=d/2,hr=Math.max(2,r*.12);circle(c,x,y-r+hr,hr,null,col,2);poly(c,[[x,y-r+hr*2],[x,y+r*.15]],col,2.2);poly(c,[[x-r*.3,y-r*.25],[x,y-r+hr*2.6],[x+r*.3,y-r*.25]],col,2.2);poly(c,[[x-r*.28,y+r],[x,y+r*.15],[x+r*.28,y+r]],col,2.2)};
GL.cat=(c,x,y,d,col)=>{const r=d/2;c.save();c.strokeStyle=col;c.fillStyle=rgba(col,.15);c.lineWidth=2;c.beginPath();c.ellipse(x+r*.1,y+r*.05,r*.55,r*.28,0,0,Math.PI*2);c.fill();c.stroke();circle(c,x-r*.55,y-r*.15,r*.2,rgba(col,.15),col,2);c.beginPath();c.moveTo(x-r*.7,y-r*.3);c.lineTo(x-r*.72,y-r*.5);c.lineTo(x-r*.58,y-r*.36);c.moveTo(x-r*.4,y-r*.3);c.lineTo(x-r*.38,y-r*.5);c.lineTo(x-r*.52,y-r*.36);c.stroke();c.beginPath();c.moveTo(x+r*.62,y);c.quadraticCurveTo(x+r*.95,y-r*.1,x+r*.85,y-r*.45);c.stroke();[-.15,.05,.3,.45].forEach(f=>{c.beginPath();c.moveTo(x+f*r,y+r*.25);c.lineTo(x+f*r,y+r*.5);c.stroke()});c.restore()};
GL.hand=(c,x,y,d,col)=>{const r=d/2;c.save();c.strokeStyle=col;c.fillStyle=rgba(col,.15);c.lineWidth=2;c.beginPath();c.ellipse(x,y+r*.3,r*.42,r*.5,0,0,Math.PI*2);c.fill();c.stroke();[[-.38,-.35,.55],[-.16,-.2,.95],[.05,-.2,1],[.25,-.25,.9],[.52,.05,.35]].forEach(([fx,fy,L])=>{c.beginPath();c.moveTo(x+fx*r,y+fy*r);c.lineTo(x+fx*r*1.15,y+fy*r-L*r);c.stroke()});c.restore()};
GL.ant=(c,x,y,d,col)=>{const r=d/2;c.save();c.strokeStyle=col;c.lineWidth=1.5;[[-.65,.18],[-.15,.2],[.5,.32]].forEach(([fx,f])=>circle(c,x+fx*r,y,r*f,rgba(col,.35),col,1.5));for(let k=-1;k<=1;k++){c.beginPath();c.moveTo(x-r*.15+k*r*.15,y);c.lineTo(x-r*.15+k*r*.35,y+r*.45);c.moveTo(x-r*.15+k*r*.15,y);c.lineTo(x-r*.15+k*r*.35,y-r*.45);c.stroke()}c.beginPath();c.moveTo(x-r*.8,y-r*.1);c.lineTo(x-r*1.05,y-r*.4);c.moveTo(x-r*.8,y-r*.1);c.lineTo(x-r*1,y-r*.05);c.stroke();c.restore()};
GL.sand=(c,x,y,d,col)=>{const r=d/2,g=rng(9),pts=[];for(let i=0;i<8;i++){const th=i/8*6.283,rr=r*(.7+g()*.3);pts.push([x+Math.cos(th)*rr,y+Math.sin(th)*rr])}c.save();c.fillStyle=rgba(col,.25);c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fill();c.restore();poly(c,pts,col,1.5,1,true)};
GL.mite=(c,x,y,d,col)=>{const r=d/2;c.save();c.strokeStyle=col;c.fillStyle=rgba(col,.15);c.lineWidth=1.5;c.beginPath();c.ellipse(x,y,r*.6,r*.45,0,0,Math.PI*2);c.fill();c.stroke();circle(c,x-r*.7,y,r*.18,rgba(col,.15),col,1.5);for(let k=0;k<4;k++){const yy=y-r*.3+k*r*.2;c.beginPath();c.moveTo(x-r*.3+k*r*.15,yy);c.lineTo(x-r*.5+k*r*.15,yy+r*.5);c.moveTo(x-r*.3+k*r*.15,yy);c.lineTo(x-r*.5+k*r*.15,yy-r*.5);c.stroke()}c.restore()};
GL.hair=(c,x,y,d,col)=>{const H=d*8;c.save();c.strokeStyle=rgba(col,.35);c.lineWidth=d;c.lineCap='round';c.beginPath();c.moveTo(x,y-H/2);c.quadraticCurveTo(x+d*.6,y,x,y+H/2);c.stroke();c.strokeStyle=rgba(col,.8);c.lineWidth=1.5;c.beginPath();c.moveTo(x-d/2,y-H/2);c.quadraticCurveTo(x+d*.1,y,x-d/2,y+H/2);c.moveTo(x+d/2,y-H/2);c.quadraticCurveTo(x+d*1.1,y,x+d/2,y+H/2);c.stroke();c.restore()};
GL.land=(c,x,y,d,col)=>{const r=d/2,g=rng(13),pts=[];for(let i=0;i<14;i++){const th=i/14*6.283,rr=r*(.55+g()*.45)*(i%2?1:.7);pts.push([x+Math.cos(th)*rr*.8,y+Math.sin(th)*rr])}c.save();c.fillStyle=rgba(col,.18);c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fill();c.restore();poly(c,pts,col,2,1,true)};
/* viewer */
function makeViewer(id,px,E0){
  const s=makeSim(id,{
    init(s){s.E=E0;s.target=E0;s.maxE=E0;s.minE=E0;s.gapSeen=false;s.lightSeen=false;s.fromUni=false;s.pu=true;s.fromYou=false;s.py=true;s.homeFine=false;s.atomFine=false;s.drag=null;s.pinch=null;s.sync(s)},
    setE(s,e,jump){s.target=clamp(e,EMIN,EMAX);if(jump)s.E=s.target;s.sync(s)},
    preset(s,e){s.pu=true;s.py=true;s.setE(s,e,false)},
    sync(s){const sl=$(px+'-e');if(sl&&Math.abs(parseFloat(sl.value)-s.target)>.001)sl.value=s.target.toFixed(2);const o=$(px+'-e-val');if(o)o.textContent='10'+sup(Math.round(s.E))+' m across'},
    down(p,s){if(s.pinch)return;s.drag={y:p.y,E:s.target}},move(p,s){if(s.drag&&!s.pinch)s.setE(s,s.drag.E-(p.y-s.drag.y)/45)},up(p,s){s.drag=null},leave(s){s.drag=null},
    step(dt,s){const k=1-Math.exp(-dt*6);s.E+=(s.target-s.E)*k;if(Math.abs(s.target-s.E)<.002)s.E=s.target;s.maxE=Math.max(s.maxE,s.E);s.minE=Math.min(s.minE,s.E);
      if(s.E>=27&&s.target>=27){s.fromUni=true;s.pu=false}if(s.E>=0&&s.E<=1&&s.target>=0&&s.target<=1){s.fromYou=true;s.py=false}
      if(s.fromUni&&!s.pu&&s.E>=7&&s.E<=7.6)s.homeFine=true;if(s.fromYou&&!s.py&&s.E<=-9.9)s.atomFine=true;
      if(s.E>=16.2&&s.E<=17.2)s.gapSeen=true;if(s.E>=-6.5&&s.E<=-5.8)s.lightSeen=true;s.sync(s)},
    draw(s){const{ctx,w,h}=s;ctx.clearRect(0,0,w,h);const wide=w>=520;const cx=w/2,cy=h*.47,Rv=Math.min(w*.5,h*.47)*(wide?.82:.86);const W=Math.pow(10,s.E);
      circle(ctx,cx,cy,Rv+7,null,rgba(C.chalk,.18),10);circle(ctx,cx,cy,Rv,'rgba(0,0,0,.18)',C.chalk,2);
      ctx.save();ctx.beginPath();ctx.arc(cx,cy,Rv,0,Math.PI*2);ctx.clip();poly(ctx,[[cx-Rv,cy],[cx+Rv,cy]],C.chalk,1,.1);poly(ctx,[[cx,cy-Rv],[cx,cy+Rv]],C.chalk,1,.1);
      let focus=null,fq=0,bg=null,bq=1e9;const labels=[];
      for(const o of OBJ){const q=o.size/W;if(q>1.5&&q<400&&CONTAIN.has(o.kind)&&q<bq){bq=q;bg=o}if(q<.004||q>4)continue;const d=q*2*Rv;let a=1,b=0;if(q<.02){a=(q-.004)/.016;b=3.5*(1-a)}else if(q>1.5){a=1-(q-1.5)/2.5;b=3.5*(1-a)}a=clamp(a,0,1);
        const m=Math.max(0,Rv-d/2);const x=cx+o.u*m*.95,y=cy+o.v*m*.95;ctx.save();ctx.globalAlpha=a;if(b>.4&&'filter' in ctx)ctx.filter=`blur(${b.toFixed(1)}px)`;GL[o.kind](ctx,x,y,d,o.col,s.t);ctx.restore();
        if(q>=.02&&q<=1.5){labels.push({o,x,y:d>=Rv*1.5?cy+Rv-30:y+d/2+13,a});if(q>fq){fq=q;focus=o}}}
      for(const L of labels){text(ctx,L.o.name,clamp(L.x,cx-Rv+40,cx+Rv-40),L.y,{size:Math.min(16,Rv*.1),color:L.o.col,alpha:L.a});text(ctx,sizeLabel(L.o.size),clamp(L.x,cx-Rv+40,cx+Rv-40),L.y+14,{size:11,fam:'body',alpha:.8*L.a})}
      for(const n of NOTES)if(s.E>=n.a&&s.E<=n.b)n.t.forEach((ln,i)=>text(ctx,ln,cx,cy-((n.t.length-1)/2-i)*20,{size:16,alpha:.75}));
      ctx.restore();
      if(bg)text(ctx,'inside: '+bg.name,cx+Rv-6,cy-Rv+10,{size:11,fam:'body',align:'right',color:bg.col,alpha:.75});
      // rail
      if(wide){const rx=Math.max(40,cx-Rv-30),top=cy-Rv,bot=cy+Rv;poly(ctx,[[rx,top],[rx,bot]],C.chalk,1.5,.5);for(let e=Math.ceil(EMIN);e<=EMAX;e++){const y=bot-(e-EMIN)/(EMAX-EMIN)*(bot-top);const big=e%10===0;poly(ctx,[[rx-(big?8:4),y],[rx,y]],C.chalk,1,big?.7:.35);if(big)text(ctx,'10'+sup(e),rx-11,y,{size:11,align:'right',fam:'body',alpha:.7})}
        const y=bot-(s.E-EMIN)/(EMAX-EMIN)*(bot-top);ctx.save();ctx.fillStyle=C.yellow;ctx.beginPath();ctx.moveTo(rx+3,y);ctx.lineTo(rx+11,y-5);ctx.lineTo(rx+11,y+5);ctx.closePath();ctx.fill();ctx.restore();text(ctx,'focus',rx,top-12,{size:11,fam:'body',alpha:.6});
        const RX=cx+Rv+22;text(ctx,'out',RX,top+6,{size:11,fam:'body',alpha:.6});text(ctx,'in',RX,bot-6,{size:11,fam:'body',alpha:.6});arrow(ctx,RX,bot-18,0,-(bot-top-40),rgba(C.chalk,.35),1.2)}
      // readouts
      const f=friendly(W);text(ctx,!at('g8')?`the view is ${f||sci(W)} wide`:!at('hs')?`field of view ${f||''}${f?' = ':''}10${sup(Math.round(s.E))} m`:`field of view ${sci(W)}${f?' = '+f:''}`,8,12,{size:12,align:'left',fam:'body',alpha:.85});
      if(at('hs'))text(ctx,`log₁₀ = ${s.E.toFixed(2)}`,w-8,h-10,{size:11,align:'right',fam:'body',alpha:.6});
      const nin=OBJ.filter(o=>o.size/W<.02).sort((a,b)=>b.size-a.size)[0],nout=OBJ.filter(o=>o.size/W>1.5).sort((a,b)=>a.size-b.size)[0];
      text(ctx,nin?'↓ '+nin.name:'',8,h-10,{size:11,align:'left',fam:'body',alpha:.6});if(!at('hs'))text(ctx,nout?'↑ '+nout.name:'',w-8,h-10,{size:11,align:'right',fam:'body',alpha:.6});
      if(focus)readout(ctx,[focus.fact],cx,cy+Rv+12,{align:'center',size:12});
      if(s.t<6&&s.E===E0)text(ctx,'drag up and down, or roll the wheel',cx,cy+Rv*.75,{size:15,alpha:.6})}
  });
  if(!s)return null;const cv=s.cv;
  cv.addEventListener('wheel',e=>{e.preventDefault();s.setE(s,s.target+e.deltaY*.004)},{passive:false});
  cv.addEventListener('touchmove',e=>{if(e.touches.length===2){e.preventDefault();const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(s.pinch)s.setE(s,s.target-Math.log10(d/s.pinch)*1.6);s.pinch=d;s.drag=null}},{passive:false});
  cv.addEventListener('touchend',()=>{s.pinch=null});
  hook(px+'-in',()=>s.setE(s,s.target-1));hook(px+'-out',()=>s.setE(s,s.target+1));
  slide(px+'-e',v=>{if(Math.abs(v-s.target)>.001)s.setE(s,v)},v=>'10'+sup(Math.round(v))+' m across');
  document.querySelectorAll(`[data-${px}obj]`).forEach(b=>b.addEventListener('click',()=>s.preset(s,parseFloat(b.getAttribute(`data-${px}obj`)))));
  return s}
const te=makeViewer('cv-tele','te',0.7),mi=makeViewer('cv-micro','mi',0.3);
const both=f=>(te&&f(te))||(mi&&f(mi));
Chalk.start({key:'scale',missions:MISSION_DEFS,unitWhy:UNIT_WHY,checks:Object.assign({
  sc1:()=>both(s=>s.maxE>=7.3),sc1b:()=>both(s=>s.maxE>=13),sc1c:()=>both(s=>s.gapSeen),sc1d:()=>both(s=>s.maxE>=27),sc1e:()=>both(s=>s.homeFine),
  sc2:()=>both(s=>s.minE<=-5),sc2b:()=>both(s=>s.minE<=-6.9),sc2c:()=>both(s=>s.lightSeen),sc2d:()=>both(s=>s.minE<=-9.9),sc2e:()=>both(s=>s.minE<=-14.8),sc2f:()=>both(s=>s.minE<=-34.3),sc2g:()=>both(s=>s.atomFine)
},Object.fromEntries(Array.from({length:2},(_,i)=>[`tb${i+1}`,()=>Chalk.checkPassed(`ch${i+1}`)])))});
