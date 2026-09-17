/* ---------- CH8: Blackout ---------- */
const bo=makeSim('cv-blackout',{
  init(s){s.air=.8;s.fire=makeFire();s.steam={};s.reset(s)},
  reset(s){s.min=0;s.out=false;s.logs=12;s.fuel=0;s.Tp=20;s.Tw=15;s.Tr=18;s.bat=120;s.phoneWh=0;s.phoneDone=false;s.phoneAt=null;s.lamp=true;s.phone=true;s.radio=false;s.fridge=false;s.fridgeTried=false;s.pump=true;s.loop=false;s.over=0;s.dmg=1;s.lampMin=0;s.ended=false;s.dead=false;s.Pe=0;s.usable=0;s.L=0;s.msg='the grid is on. Stock the stove, then cut it.';s.Pf=0},
  cut(s){if(!s.out){s.out=true;s.phoneWh=0;s.phoneDone=false;s.phoneAt=null;s.lampMin=0;s.msg='10 p.m. Grid is out. Outside: −5 °C.'}},
  addLog(s){if(s.logs>0&&s.fuel<4){s.logs--;s.fuel+=1}},
  step(dt,s){if(s.ended)return;const m=dt*10/3;if(s.out){s.min+=m;if(s.min>=480){s.min=480;s.ended=true;s.msg='6 a.m. Dawn.'}}
    const burn=s.fuel>0?Math.min(s.fuel,s.air/60*m):0;s.fuel-=burn;const Pf=burn*16e6/(m*60+1e-9);s.Pf=Pf;
    const Rc=s.pump?.04:.5;const tot=.05+.19+Rc;const Q=Math.max(0,(s.Tp-s.Tw)/tot);const dTm=Q*.19;s.Pe=8*1.6e-4*dTm*dTm*s.dmg;s.usable=Math.max(0,s.Pe*.85-(s.pump?2:0));
    s.Tp+=(0.45*Pf-12*(s.Tp-s.Tr)-Q)*m*60/12000;s.Tp=Math.max(s.Tr,s.Tp);
    if(s.pump){s.Tw+=Q*m*60/(20*4186);if(s.loop){s.Tw+=(35-s.Tw)*(1-Math.exp(-m/15))}}else{s.Tw+=(Q*m*60/(1*4186))-(s.Tw-s.Tr)*.05*m}
    if(s.Tp>170)s.over+=m;if(s.over>5)s.dmg=.5;
    const roomGain=0.45*Pf+(s.loop&&s.pump?Q:0)+(s.out?0:2500);const roomLoss=100*(s.Tr+5);s.Tr+=(roomGain-roomLoss)*m*60/1.5e6;
    const phoneOn=s.phone&&!s.phoneDone;const L=(s.lamp?5:0)+(phoneOn?5:0)+(s.radio?3:0)+(s.fridge?60:0);s.L=L;
    const src=s.out?s.usable:100+s.usable;s.bat=clamp(s.bat+(src-L)*m/60,0,200);
    if(s.bat<=0&&s.out){s.dead=true;if(s.lamp)s.msg='battery empty: the shelf went dark'}else{s.dead=false;if(s.out&&s.lamp)s.lampMin+=m;if(phoneOn){s.phoneWh+=5*m/60;if(s.phoneWh>=10){s.phoneDone=true;s.phoneAt=s.min;s.msg='phone charged'}}}
    if(s.fridge&&s.out)s.fridgeTried=true;if(s.out&&s.Tp>170)s.msg='PLATE OVER 170 °C: modules being damaged';else if(s.out&&s.Tw>60&&s.pump)s.msg='water over 60 °C: the difference is collapsing. Open the loop';else if(s.out&&s.fuel<=0&&!s.ended)s.msg='the fire is out. Add a log'},
  clock(s){const mins=22*60+s.min;const hh=Math.floor(mins/60)%24,mm=Math.floor(mins%60);return `${hh}:${mm<10?'0':''}${mm}`},
  draw(s){const{ctx,w,h,dt}=s;ctx.clearRect(0,0,w,h);const k=clamp(s.Pf/4000,0,1);
    // room darkness and light sources
    ctx.fillStyle=s.out?'rgba(5,8,12,.55)':'rgba(30,36,44,.25)';ctx.fillRect(0,0,w,h);
    // window
    box(ctx,w*.06,h*.08,w*.2,h*.22,'#0a1020','rgba(241,236,223,.6)',4,2);for(let i=0;i<14;i++)circle(ctx,w*.07+((i*37)%(w*.18)),h*.09+((i*53)%(h*.2)),1,`rgba(255,255,255,${.4+.5*Math.sin(s.t/7+i)})`);circle(ctx,w*.21,h*.14,9,'#e8e4d0');poly(ctx,[[w*.16,h*.08],[w*.16,h*.3]],'rgba(241,236,223,.5)',2);poly(ctx,[[w*.06,h*.19],[w*.26,h*.19]],'rgba(241,236,223,.5)',2);
    // floor
    poly(ctx,[[0,h*.86],[w,h*.86]],C.chalk,2,.35);
    // stove
    const sx=w*.3,sy=h*.86;drawStove(ctx,s,sx,sy,w*.2,h*.3,s.Tp,s.fuel,k,s.fire,dt);
    // module + water block on plate
    box(ctx,sx-26,sy-h*.3-22,52,10,rgba(C.yellow,.9),C.chalk,2,1);box(ctx,sx-30,sy-h*.3-40,60,18,rgba(C.blue,.75),C.chalk,3,1);
    // hoses to tank
    const tx=w*.56,ty=h*.6;ctx.save();ctx.strokeStyle=rgba(C.blue,.8);ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(sx+30,sy-h*.3-32);ctx.bezierCurveTo(sx+80,sy-h*.3-40,tx-40,ty-20,tx-22,ty);ctx.moveTo(sx+30,sy-h*.3-28);ctx.bezierCurveTo(sx+90,sy-h*.3-10,tx-40,ty+10,tx-22,ty+18);ctx.stroke();ctx.restore();
    if(s.pump){for(let i=0;i<5;i++){const u=((s.t/2)+i/5)%1;const px=sx+30+(tx-22-sx-30)*u,py=(sy-h*.3-32)*(1-u)+ty*u-Math.sin(u*Math.PI)*25;circle(ctx,px,py,2.5,C.blue)}}
    box(ctx,tx-22,ty-30,44,70,rgba(C.chalk,.06),C.chalk,6,1.5);box(ctx,tx-18,ty+36-60*clamp((s.Tw+10)/110,0,1),36,60*clamp((s.Tw+10)/110,0,1),tcol(s.Tw),null,3);text(ctx,`${s.Tw.toFixed(0)} °C`,tx,ty+56,{size:15});text(ctx,'tank',tx,ty-40,{size:14,alpha:.7});if(s.Tw>60)steamStep(s.steam,dt,tx,ty-30,30,1);steamDraw(ctx,s.steam);
    if(s.loop){box(ctx,tx+40,ty-20,14,50,null,C.chalk,2,1.5);for(let i=0;i<4;i++)poly(ctx,[[tx+40,ty-12+i*12],[tx+54,ty-12+i*12]],C.chalk,1,.6);text(ctx,'radiator',tx+47,ty+44,{size:12,alpha:.7})}
    // battery
    const bxx=w*.8,byy=h*.62;box(ctx,bxx-40,byy-22,80,44,rgba(C.chalk,.06),C.chalk,6,1.5);box(ctx,bxx+40,byy-8,6,16,C.chalk,null,2);box(ctx,bxx-36,byy-18,72*(s.bat/200),36,s.bat<20?C.pink:C.green,null,4);text(ctx,`${s.bat.toFixed(0)} Wh`,bxx,byy+1,{size:16,color:C.board});text(ctx,'battery',bxx,byy+38,{size:14,alpha:.7});
    poly(ctx,[[bxx-40,byy],[tx+22,ty-10]],C.yellow,1.5,s.usable>0?.6:.2);if(s.usable>0){for(let i=0;i<3;i++){const u=((s.t/1.5)+i/3)%1;circle(ctx,tx+22+(bxx-40-tx-22)*(1-u),ty-10+(byy-ty+10)*(1-u),2.5,C.yellow)}}
    // shelf and devices
    const shy=h*.32;poly(ctx,[[w*.58,shy+26],[w*.96,shy+26]],C.chalk,3,.6);
    const dev=[{n:'lamp',on:s.lamp&&!s.dead&&(s.out||true),x:w*.64},{n:'phone',on:s.phone&&!s.phoneDone&&!s.dead,x:w*.73},{n:'radio',on:s.radio&&!s.dead,x:w*.82},{n:'fridge',on:s.fridge&&!s.dead,x:w*.91}];
    for(const d of dev){const x=d.x;if(d.n==='lamp'){if(d.on){ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(x,shy+2,0,x,shy+2,h*.3);g.addColorStop(0,'rgba(255,230,150,.45)');g.addColorStop(1,'rgba(255,220,120,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,shy+2,h*.3,0,Math.PI*2);ctx.fill();ctx.restore()}poly(ctx,[[x-12,shy+20],[x+12,shy+20],[x+5,shy-4],[x-5,shy-4]],C.chalk,1.5,.9);circle(ctx,x,shy+2,6,d.on?C.yellow:rgba(C.chalk,.15))}
      else if(d.n==='phone'){box(ctx,x-9,shy-8,18,32,rgba(C.chalk,.08),C.chalk,4,1.5);box(ctx,x-6,shy-4,12*Math.min(1,s.phoneWh/10),4,s.phoneDone?C.green:C.yellow,null,1);text(ctx,s.phoneDone?'100%':`${Math.round(s.phoneWh*10)}%`,x,shy+12,{size:11,fam:'body'})}
      else if(d.n==='radio'){box(ctx,x-16,shy,32,22,rgba(C.chalk,.08),C.chalk,4,1.5);poly(ctx,[[x+10,shy],[x+18,shy-16]],C.chalk,1.5);if(d.on)for(let i=1;i<=3;i++)circle(ctx,x+18,shy-16,i*6,null,rgba(C.blue,.5-i*.12),1)}
      else{box(ctx,x-14,shy-18,28,42,rgba(C.chalk,.08),C.chalk,4,1.5);poly(ctx,[[x-14,shy-2],[x+14,shy-2]],C.chalk,1);if(d.on)circle(ctx,x+9,shy-10,2.5,C.green)}
      text(ctx,d.n,x,shy+42,{size:13,alpha:.75,color:d.on?C.chalk:rgba(C.chalk,.5)})}
    // wood pile
    for(let i=0;i<s.logs;i++){const r=i%4,c=Math.floor(i/4);box(ctx,w*.06+r*22,h*.84-c*11,20,9,'#6b4a2b','rgba(241,236,223,.5)',3,1)}text(ctx,`${s.logs} logs`,w*.11,h*.94,{size:15,alpha:.8});
    // grid lamp on wall
    circle(ctx,w*.5,h*.1,7,s.out?rgba(C.chalk,.12):C.yellow);text(ctx,s.out?'grid: OUT':'grid: on',w*.5,h*.16,{size:15,color:s.out?C.pink:C.green});
    // HUD
    const lines=[`${s.clock(s)}   outside −5 °C   room ${s.Tr.toFixed(1)} °C   plate ${s.Tp.toFixed(0)} °C   water ${s.Tw.toFixed(0)} °C`,`making ${s.usable.toFixed(1)} W${s.dmg<1?' (modules damaged)':''}   using ${s.L} W   fire ${(s.Pf/1000).toFixed(1)} kW   fuel ${s.fuel.toFixed(1)} kg`,s.msg];
    if(s.ended)lines.push(`DAWN: lamp on ${(s.lampMin/60).toFixed(1)} h of 8 · phone ${s.phoneDone?'charged':'not charged'} · room ${s.Tr.toFixed(0)} °C · logs left ${s.logs} · plate over limit ${s.over.toFixed(0)} min`);
    if(at('hs')&&!s.ended)lines.push(`ΔT across modules ${(Math.max(0,(s.Tp-s.Tw)/(.05+.19+(s.pump?.04:.5))*.19)).toFixed(0)} K → ${s.Pe.toFixed(1)} W raw`);
    readout(ctx,lines,16,12,{size:12})}
});
window.__bo=bo;
hook('bo-cut',()=>{if(bo){bo.cut(bo);$('bo-cut').textContent='Grid is out'}});hook('bo-log',()=>bo&&bo.addLog(bo));slide('bo-air',v=>{if(bo)bo.air=v},v=>v.toFixed(1)+' kg/h');
toggle('bo-pump',()=>bo.pump,v=>{bo.pump=v},v=>'Pump: '+(v?'on':'off'));toggle('bo-loop',()=>bo.loop,v=>{bo.loop=v},v=>'Loop to radiator: '+(v?'on':'off'));
toggle('bo-lamp',()=>bo.lamp,v=>{bo.lamp=v},v=>'Lamp: '+(v?'on':'off'));toggle('bo-phone',()=>bo.phone,v=>{bo.phone=v},v=>'Phone: '+(v?'charging':'unplugged'));toggle('bo-radio',()=>bo.radio,v=>{bo.radio=v},v=>'Radio: '+(v?'on':'off'));toggle('bo-fridge',()=>bo.fridge,v=>{bo.fridge=v},v=>'Fridge: '+(v?'on':'off'));
hook('bo-reset',()=>{if(bo){bo.reset(bo);$('bo-cut').textContent='Cut the grid';for(const[id,v,l]of[['bo-pump',true,'Pump: on'],['bo-loop',false,'Loop to radiator: off'],['bo-lamp',true,'Lamp: on'],['bo-phone',true,'Phone: charging'],['bo-radio',false,'Radio: off'],['bo-fridge',false,'Fridge: off']]){const b=$(id);b.classList.toggle('is-on',v);b.setAttribute('aria-pressed',String(v));b.textContent=l}}});
