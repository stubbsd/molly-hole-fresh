// v5: scripted play-through of all 20 levels that swallows everything, plus rewards, globe, arrow, sizes, resume.
const p=require('/tmp/pt/node_modules/puppeteer-core'),fs=require('fs');
const URL=process.env.URL||'http://localhost:8931/',OUT=__dirname+'/../proof/v5/',SPEED=+(process.env.SPEED||3);fs.mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function stats(pg){return pg.evaluate(()=>{const P=__mh.PERF,n=Math.min(P.n,1200),dt=[],cpu=[];for(let i=0;i<n;i++){dt.push(P.dt[i]);cpu.push(P.cpu[i]);}
 dt.sort((a,b)=>a-b);cpu.sort((a,b)=>a-b);const q=(a,f)=>a[Math.min(a.length-1,Math.floor(a.length*f))];
 return {frames:n,dtP50:q(dt,.5),dtP99:q(dt,.99),dtMax:dt[n-1],over20ms:dt.filter(v=>v>20).length,cpuP99:+q(cpu,.99).toFixed(2),cpuMax:+cpu[n-1].toFixed(2)};});}
async function bot(pg,maxMs,onTick){await pg.mouse.move(512,400);await pg.mouse.down();const t0=Date.now();
 while(Date.now()-t0<maxMs){const s=await pg.evaluate(()=>{const m=__mh;if(m.state!=='play')return null;const h=m.hole;let best=null,bd=1e9;
   for(let i=0;i<m.NE;i++){const e=m.E[i];if(!e.alive||e.fall||e.s>=h.r*.95)continue;if(e.x<0||e.x>2048)continue;const d=Math.hypot(e.x-h.x,e.y-h.y);if(d<bd){bd=d;best=e;}}
   return best?{dx:best.x-h.x,dy:best.y-h.y,left:m.L.left}:{dx:0,dy:0,left:m.L.left};});
  if(!s)break;if(onTick)await onTick(s);const d=Math.hypot(s.dx,s.dy)||1,m=Math.min(90,10+d*.6);await pg.mouse.move(512+s.dx/d*m,400+s.dy/d*m,{steps:2});await sleep(50);}
 await pg.mouse.up();}
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--enable-gpu-rasterization','--ignore-gpu-blocklist']});
 const res={levels:[]};const pg=await b.newPage();pg.on('pageerror',e=>console.log('PAGEERR',e.message));
 await pg.setViewport({width:1024,height:768,deviceScaleFactor:2});await pg.goto(URL);await pg.evaluate(()=>localStorage.clear());await pg.reload();await sleep(500);
 await pg.screenshot({path:OUT+'map-start.png'});
 for(let lv=0;lv<20;lv++){
  const mp=await pg.evaluate(n=>__mh.MP[n],lv);if(await pg.evaluate(()=>__mh.state)==='map')await pg.mouse.click(mp[0],mp[1]);
  for(let i=0;i<40&&await pg.evaluate(()=>__mh.state)!=='play';i++)await sleep(100);
  await pg.evaluate(s=>{__mh.speed=s;__mh.PERF.n=0;__mh.PERF.i=0;},SPEED);
  const r0=await pg.evaluate(()=>__mh.hole.r);let mid=0,arrow=0,mag=null;const w=(lv/5)|0;
  await bot(pg,600000,async s=>{
   if(!mid&&lv%5==2&&s.left<await pg.evaluate(()=>__mh.L.total*.7)){mid=1;await pg.screenshot({path:OUT+`world${w+1}-level${lv+1}-mid.png`});}
   if(!arrow&&s.left<=3&&s.left>0&&(lv==7||lv==17)){arrow=1;await sleep(150);await pg.screenshot({path:OUT+`arrow-level${lv+1}.png`});res['arrowL'+(lv+1)]=await pg.evaluate(()=>__mh.L.arrow);}
   if(lv==15&&!mag){mag=await pg.evaluate(()=>{const m=__mh,h=m.hole;for(let i=0;i<m.NE;i++){const e=m.E[i];if(e.alive&&!e.fall&&!e.mv&&e.s<h.r*.6&&Math.hypot(e.x-h.x,e.y-h.y)<h.r*2.2&&Math.hypot(e.x-h.x,e.y-h.y)>h.r)return {i,x:e.x,y:e.y,d:Math.hypot(e.x-h.x,e.y-h.y)};}return null;});if(mag)mag.t=Date.now();}
   if(mag&&!res.magnet&&Date.now()-mag.t>150){res.magnet=await pg.evaluate(m=>{const e=__mh.E[m.i];return {movedPx:+Math.hypot(e.x-m.x,e.y-m.y).toFixed(1),eaten:!e.alive||!!e.fall};},mag);}
  });
  const st=await stats(pg);const info=await pg.evaluate(()=>{const m=__mh,L=m.L,es=m.E.slice(0,m.NE);return {state:m.state,objects:m.NE,left:L.left,allEaten:es.every(e=>!e.alive||e.fall),gameTime:+L.t.toFixed(1),maxS:L.maxS,biggestEaten:es.filter(e=>e.s>=L.maxS-.5).every(e=>!e.alive||e.fall),finalR:+m.hole.rt.toFixed(1),stars:L.stars};});
  const row={level:lv+1,world:['Town','Space','Magical','Undersea'][w],startR:r0,...info,...st};res.levels.push(row);console.log(JSON.stringify(row));
  await pg.evaluate(()=>{__mh.speed=1;});await sleep(1200);
  if(lv%5==4){await pg.mouse.click(lv<19?600:512,515);await sleep(900);res['globeAfterWorld'+(w+1)]=await pg.evaluate(()=>__mh.state);if(lv==4||lv==19)await pg.screenshot({path:OUT+`globe-after-world${w+1}.png`});
   await pg.mouse.click(512,384);await sleep(1300);res['rewardAfterWorld'+(w+1)]=await pg.evaluate(()=>__mh.state);await pg.screenshot({path:OUT+`reward-world${w+1}.png`});
   await pg.mouse.click(512,690);await sleep(lv<19?2200:600);}
  else{await pg.mouse.click(600,515);await sleep(300);}
 }
 res.rewards=await pg.evaluate(()=>({rw:__mh.P.rw,galaxySkinOwned:__mh.P.owned[8],goldSkinOwned:__mh.P.owned[9]}));
 await pg.screenshot({path:OUT+'map-all-done.png'});
 // gold skin + bubble cheer
 await pg.mouse.click(946,45);await sleep(300);await pg.screenshot({path:OUT+'skins-with-rewards.png'});await pg.mouse.click(900,520);await sleep(200);
 res.skinNow=await pg.evaluate(()=>__mh.P.skin);await pg.mouse.click(976,50);await sleep(300);
 await pg.mouse.click(...(await pg.evaluate(()=>__mh.MP[17])));await sleep(2500);
 let bub=0;await (async()=>{await pg.mouse.move(512,400);await pg.mouse.down();for(let i=0;i<60&&!bub;i++){await pg.mouse.move(512+60*Math.cos(i/5),400+60*Math.sin(i/5),{steps:2});await sleep(60);bub=await pg.evaluate(()=>__mh.bubbles);}if(bub)await pg.screenshot({path:OUT+'gold-hole-bubbles.png'});await pg.mouse.up();})();
 res.bubbleCheer=bub;
 // resume after reload
 await pg.reload();await sleep(700);res.resume={state:await pg.evaluate(()=>__mh.state),level:await pg.evaluate(()=>__mh.L.n+1)};
 await pg.mouse.click(512,330);await sleep(300);res.resume.after=await pg.evaluate(()=>__mh.state);
 // frame times at the 6 iPad sizes, real speed, on the busiest level (Undersea 20) and Town 5
 res.sizes=[];for(const [W,H] of [[1024,768],[768,1024],[1180,820],[820,1180],[1366,1024],[1024,1366]])for(const lv of [4,19]){
  await pg.setViewport({width:W,height:H,deviceScaleFactor:2});await pg.evaluate(n=>{localStorage.removeItem('mollyHoleFresh1Run');},lv);await pg.reload();await sleep(500);
  const u=Math.min(W/1024,H/768),mp=await pg.evaluate(n=>__mh.MP[n],lv);await pg.mouse.click(W/2+(mp[0]-512)*u,H/2+(mp[1]-384)*u);await sleep(lv%5==0?2400:500);
  await pg.evaluate(()=>{__mh.speed=1;__mh.PERF.n=0;__mh.PERF.i=0;});await pg.mouse.move(W/2,H/2);await pg.mouse.down();
  for(let i=0;i<70;i++){await pg.mouse.move(W/2+80*Math.cos(i/9),H/2+80*Math.sin(i/9),{steps:2});await sleep(100);}await pg.mouse.up();
  const s=await stats(pg);const row={size:W+'x'+H,level:lv+1,objects:await pg.evaluate(()=>__mh.NE),...s};res.sizes.push(row);console.log(JSON.stringify(row));
  if(lv==19)await pg.screenshot({path:OUT+`size-${W}x${H}-level20.png`});}
 fs.writeFileSync(OUT+'results.json',JSON.stringify(res,null,1));console.log(JSON.stringify({magnet:res.magnet,rewards:res.rewards,bubble:res.bubbleCheer,resume:res.resume,skin:res.skinNow}));await b.close();})();
