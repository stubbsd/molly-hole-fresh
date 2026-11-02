const p=require('/tmp/pt/node_modules/puppeteer-core');const fs=require('fs');
const URL=process.env.URL||'http://localhost:8765/';const OUT=__dirname+'/../proof/';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function bot(pg,ox,oy,maxMs){ // continuous drag: mouse held down the whole level
 await pg.mouse.move(ox,oy);await pg.mouse.down();const t0=Date.now();
 while(Date.now()-t0<maxMs){const s=await pg.evaluate(()=>{const m=__mh;if(m.state!=='play')return null;const h=m.hole;let best=null,bd=1e9;
   for(let i=0;i<m.NE;i++){const e=m.E[i];if(!e.alive||e.fall||e.s>=h.r*.95)continue;const d=Math.hypot(e.x-h.x,e.y-h.y)-(e.s>=m.L.maxS-1?5000:0);if(d<bd){bd=d;best=e;}}
   return best?{dx:best.x-h.x,dy:best.y-h.y}:{dx:0,dy:0};});
  if(!s)break;const d=Math.hypot(s.dx,s.dy)||1,m=Math.min(80,20+d);await pg.mouse.move(ox+s.dx/d*m,oy+s.dy/d*m,{steps:2});await sleep(60);}
 await pg.mouse.up();}
async function stats(pg){return pg.evaluate(()=>{const P=__mh.PERF,n=Math.min(P.n,1200),dt=[],cpu=[];for(let i=0;i<n;i++){dt.push(P.dt[i]);cpu.push(P.cpu[i]);}
 dt.sort((a,b)=>a-b);cpu.sort((a,b)=>a-b);const q=(a,f)=>a[Math.min(a.length-1,Math.floor(a.length*f))];
 return {frames:n,dtMean:dt.reduce((a,b)=>a+b,0)/n,dtP50:q(dt,.5),dtP99:q(dt,.99),dtMax:dt[n-1],over20ms:dt.filter(v=>v>20).length,cpuMean:cpu.reduce((a,b)=>a+b,0)/n,cpuP99:q(cpu,.99),cpuMax:cpu[n-1]};});}
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--enable-gpu-rasterization','--ignore-gpu-blocklist','--js-flags=--expose-gc']});
 const res={};const pg=await b.newPage();pg.on('pageerror',e=>{if(!global.__pe){global.__pe=1;console.log('PAGEERR',e.stack)}});pg.on('console',m=>console.log('CONSOLE',m.text()));
 await pg.setViewport({width:1024,height:768,deviceScaleFactor:2,hasTouch:false});await pg.goto(URL);await pg.evaluate(()=>localStorage.clear());await pg.reload();await sleep(500);
 await pg.screenshot({path:OUT+'01-map-1024x768.png'});
 const lvXY=[[150,560],[280,470],[230,330],[380,250],[520,330]];
 const client=await pg.target().createCDPSession();
 for(let lv=0;lv<5;lv++){
  await pg.mouse.click(lvXY[lv][0],lvXY[lv][1]);await sleep(300);
  if(lv==0){await pg.screenshot({path:OUT+'02-level1-start.png'});}
  await pg.evaluate(()=>{__mh.PERF.n=0;__mh.PERF.i=0;});
  if(lv==4)await pg.tracing.start({path:'/tmp/trace.json',categories:['v8','disabled-by-default-devtools.timeline','devtools.timeline']});
  const heap0=(await client.send('Runtime.getHeapUsage')).usedSize;
  let shot=0;const bp=bot(pg,700,450,240000);
  // mid-level screenshot with yippee
  if(lv==0||lv==4){for(let i=0;i<200;i++){await sleep(150);const y=await pg.evaluate(()=>__mh.state==='play'&&__mh.hole.r>(__mh.L.tg*.6));if(y)break;}await pg.screenshot({path:OUT+`0${lv==0?3:5}-level${lv+1}-mid.png`});}
  await bp;
  if(lv==4)await pg.tracing.stop();
  const heap1=(await client.send('Runtime.getHeapUsage')).usedSize;
  const st=await stats(pg);const info=await pg.evaluate(()=>({state:__mh.state,t:__mh.L.t,r:__mh.hole.r,tg:__mh.L.tg,stars:__mh.L.stars,coins:__mh.P.coins,maxS:__mh.L.maxS,bigEaten:__mh.E.slice(0,__mh.NE).filter(e=>e.s>=__mh.L.maxS-1&&!e.alive).length,bigTotal:__mh.E.slice(0,__mh.NE).filter(e=>e.s>=__mh.L.maxS-1).length,eaten:__mh.E.slice(0,__mh.NE).filter(e=>!e.alive).length,gain:__mh.L.gain,NE:__mh.NE}));
  res['level'+(lv+1)]={...info,...st,heapDeltaKB:Math.round((heap1-heap0)/1024)};console.log(lv+1,JSON.stringify(res['level'+(lv+1)]));
  await sleep(400);await pg.screenshot({path:OUT+`0${6+lv}-level${lv+1}-complete.png`.replace('010','10')});
  if(lv<4)await pg.mouse.click(430,515);else await pg.mouse.click(512,515);await sleep(400);
 }
 await pg.screenshot({path:OUT+'11-map-all-done.png'});
 await pg.mouse.click(680,250);await sleep(300);await pg.screenshot({path:OUT+'12-gift-opened.png'});
 await pg.mouse.click(930,690);await sleep(300);await pg.screenshot({path:OUT+'13-skins.png'});
 await pg.mouse.click(398,265);await sleep(300);await pg.screenshot({path:OUT+'14-skin-bought.png'});
 await pg.mouse.click(976,50);await sleep(300);
 // GC events from trace
 const tr=JSON.parse(fs.readFileSync('/tmp/trace.json'));const ev=(tr.traceEvents||tr).filter(e=>/GC|Scavenge|MarkCompact/.test(e.name)&&e.dur);
 res.gcLevel5={events:ev.length,maxMs:Math.max(0,...ev.map(e=>e.dur/1000)),totalMs:ev.reduce((a,e)=>a+e.dur/1000,0),names:[...new Set(ev.map(e=>e.name))]};console.log('gc',JSON.stringify(res.gcLevel5));
 // resume-after-reload test
 await pg.mouse.click(520,330);await sleep(300);await pg.mouse.move(700,450);await pg.mouse.down();await pg.mouse.move(780,450,{steps:5});await sleep(2500);await pg.mouse.up();
 await pg.reload();await sleep(600);res.resume={state:await pg.evaluate(()=>__mh.state),level:await pg.evaluate(()=>__mh.L.n+1)};await pg.screenshot({path:OUT+'15-reload-resumes-paused.png'});
 await pg.mouse.click(512,330);await sleep(300);res.resume.after=await pg.evaluate(()=>__mh.state);console.log('resume',JSON.stringify(res.resume));
 // sizes / orientations
 for(const [w,h] of [[1024,768],[768,1024],[1180,820],[820,1180],[1366,1024],[1024,1366]]){await pg.setViewport({width:w,height:h,deviceScaleFactor:2});await sleep(400);
  await pg.screenshot({path:OUT+`size-${w}x${h}-game.png`});
  await pg.evaluate(()=>{__mh.PERF.n=0;__mh.PERF.i=0;});const s=await pg.evaluate(()=>__mh.state);
  if(s==='pause'){const u=Math.min(w/1024,h/768);await pg.mouse.click(w/2+(512-512)*u,h/2+(330-384)*u);}
  await bot(pg,w*.6,h*.6,4000);res['size'+w+'x'+h]=await stats(pg);console.log(w,h,JSON.stringify(res['size'+w+'x'+h]));
  await pg.screenshot({path:OUT+`size-${w}x${h}-play.png`});}
 fs.writeFileSync(OUT+'results.json',JSON.stringify(res,null,1));await b.close();})();
