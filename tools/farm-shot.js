const p=require('/tmp/pt/node_modules/puppeteer-core');const sleep=ms=>new Promise(r=>setTimeout(r,ms));const OUT=__dirname+'/../proof/';
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox']});const pg=await b.newPage();pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.setViewport({width:1366,height:1024,deviceScaleFactor:2});await pg.goto(process.env.URL);
await pg.evaluate(()=>{localStorage.clear();localStorage.setItem('mollyHoleFresh1',JSON.stringify({coins:0,stars:[3,3,3,3,0],skin:3,owned:[1,0,0,1,0,0,0,0],gift:0}));});await pg.reload();await sleep(400);
const u=Math.min(1366/1024,1024/768);await pg.mouse.click(683+(520-512)*u,512+(330-384)*u);await sleep(300);
for(const [i,name] of [[0,'v4-farm-a'],[1,'v4-farm-b']]){
 const info=await pg.evaluate(k=>{const m=__mh,f=[];for(let j=0;j<m.NE;j++){const e=m.E[j];if(e.t===7&&e.mv===1&&Math.abs(e.y-942)<2)f.push(e);}f.sort((a,b)=>a.x-b.x);const e=f[Math.min(k*2,f.length-1)];m.hole.x=Math.max(400,Math.min(1650,e.x+120));m.hole.y=800;return f.length;},i);
 console.log('farm vehicles on lane',info);await sleep(200);await pg.screenshot({path:OUT+name+'.png'});}
await b.close();})();
