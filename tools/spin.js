const p=require('/tmp/pt/node_modules/puppeteer-core');const fs=require('fs');const {execSync}=require('child_process');const sleep=ms=>new Promise(r=>setTimeout(r,ms));const OUT=__dirname+'/../proof/';
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox']});const pg=await b.newPage();pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.setViewport({width:1024,height:768,deviceScaleFactor:2});await pg.goto(process.env.URL);await pg.evaluate(()=>{localStorage.clear();localStorage.setItem('mollyHoleFresh1',JSON.stringify({coins:2000,stars:[0,0,0,0,0],skin:0,owned:[1,1,1,1,1,1,1,1],gift:0}));});await pg.reload();await sleep(400);
await pg.mouse.click(930,690);await sleep(500);await pg.screenshot({path:OUT+'spin-skins-picker.png'});
// direction check: track the bright marker dot on skin 0's rim in the picker
const ring=async()=>pg.evaluate(()=>{const c=document.getElementById('c'),x=c.getContext('2d'),cx=626*2,cy=250*2,out=[];
 for(let d=0;d<360;d++){const th=d*Math.PI/180,px=Math.round(cx+Math.cos(th)*55*2),py=Math.round(cy+Math.sin(th)*55*2*.75),p=x.getImageData(px,py,1,1).data;out.push(p[2]>150&&p[0]<80?1:0);}return out;});
const f1=await ring();await sleep(100);const f2=await ring();let best=0,bs=1e9;
for(let d=-12;d<=12;d++){let s=0;for(let th=0;th<360;th++)s+=Math.abs(f2[((th-d)%360+360)%360]-f1[th]);if(s<bs){bs=s;best=d;}}
console.log('dash pattern moved',best,'deg in 100ms (positive = anticlockwise on screen):',best>0?'ANTICLOCKWISE':'CLOCKWISE','mismatch',bs,'dashes seen',f1.reduce((a,b)=>a+b,0));
await pg.mouse.click(170,250);await pg.mouse.click(976,50);await sleep(300);await pg.mouse.click(150,560);await sleep(300);
await pg.evaluate(()=>{__mh.hole.r=__mh.hole.rt=70;});
const c=await pg.target().createCDPSession();let n=0;fs.rmSync('/tmp/sf',{recursive:true,force:true});fs.mkdirSync('/tmp/sf');
c.on('Page.screencastFrame',f=>{fs.writeFileSync(`/tmp/sf/${String(n++).padStart(5,'0')}.jpg`,Buffer.from(f.data,'base64'));c.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{});});
await c.send('Page.startScreencast',{format:'jpeg',quality:85,maxWidth:1024,maxHeight:768});await sleep(1500);
await pg.screenshot({path:OUT+'spin-gameplay-a.png'});await sleep(300);await pg.screenshot({path:OUT+'spin-gameplay-b.png'});
await pg.mouse.move(600,400);await pg.mouse.down();await pg.mouse.move(660,380,{steps:4});await sleep(3000);await pg.mouse.up();await sleep(1500);
await c.send('Page.stopScreencast');await b.close();console.log('frames',n);
execSync(`ffmpeg -y -loglevel error -framerate ${Math.round(n/6.5)} -i /tmp/sf/%05d.jpg -c:v libx264 -pix_fmt yuv420p -vf scale=1024:768 -r 30 ${OUT}spin-clip.mp4`);})();
