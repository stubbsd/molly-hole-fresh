const p=require('/tmp/pt/node_modules/puppeteer-core');const fs=require('fs');const {execSync}=require('child_process');
const URL=process.env.URL;const OUT=__dirname+'/../proof/';const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox']});const pg=await b.newPage();
await pg.setViewport({width:1024,height:768,deviceScaleFactor:2});await pg.goto(URL);await pg.evaluate(()=>localStorage.clear());await pg.reload();await sleep(500);
await pg.screenshot({path:OUT+'00-map-fresh-padlocks.png'});await pg.mouse.click(930,690);await sleep(300);await pg.screenshot({path:OUT+'00-skins-locked-padlocks.png'});await pg.mouse.click(976,50);await sleep(200);
await pg.setViewport({width:1024,height:768,deviceScaleFactor:1});await sleep(300);
const c=await pg.target().createCDPSession();let n=0;fs.rmSync('/tmp/frames',{recursive:true,force:true});fs.mkdirSync('/tmp/frames');const ts=[];
c.on('Page.screencastFrame',async f=>{fs.writeFileSync(`/tmp/frames/${String(n).padStart(5,'0')}.jpg`,Buffer.from(f.data,'base64'));ts.push(f.metadata.timestamp);n++;c.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{});});
await c.send('Page.startScreencast',{format:'jpeg',quality:85,everyNthFrame:1});
await sleep(800);await pg.mouse.click(150,560);await sleep(500);
await pg.mouse.move(700,450);await pg.mouse.down();const t0=Date.now();
while(Date.now()-t0<30000){const s=await pg.evaluate(()=>{const m=__mh;if(m.state!=='play')return null;const h=m.hole;let best=null,bd=1e9;for(let i=0;i<m.NE;i++){const e=m.E[i];if(!e.alive||e.fall||e.s>=h.r*.95)continue;const d=Math.hypot(e.x-h.x,e.y-h.y);if(d<bd){bd=d;best=e;}}return best?{dx:best.x-h.x,dy:best.y-h.y}:{dx:0,dy:0};});
 if(!s)break;const d=Math.hypot(s.dx,s.dy)||1,m=Math.min(80,20+d);await pg.mouse.move(700+s.dx/d*m,450+s.dy/d*m,{steps:2});await sleep(60);}
await pg.mouse.up();await sleep(2000);await c.send('Page.stopScreencast');await sleep(300);await b.close();
const dur=(ts[ts.length-1]-ts[0]);const fps=Math.round(n/dur);console.log('frames',n,'dur',dur.toFixed(1),'fps',fps);
execSync(`ffmpeg -y -loglevel error -framerate ${fps} -i /tmp/frames/%05d.jpg -c:v libx264 -pix_fmt yuv420p -vf "scale=1024:768" -r 30 ${OUT}gameplay-level1.mp4`);})();
