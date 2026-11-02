const p=require('/tmp/pt/node_modules/puppeteer-core');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox']});const pg=await b.newPage();await pg.setViewport({width:1024,height:768,deviceScaleFactor:2});
await pg.goto(process.env.URL);await pg.evaluate(()=>{localStorage.clear();localStorage.setItem('mollyHoleFresh1',JSON.stringify({coins:0,stars:[3,3,3,3,0],skin:0,owned:[1,0,0,0,0,0,0,0],gift:0}));});await pg.reload();await sleep(400);
for(const [lv,xy,name] of [[2,[380,250],'new-items-level4'],[1,[280,470],'new-items-level2']]){await pg.mouse.click(...xy);await sleep(300);
 // put the hole next to the busiest cluster of new items so the camera shows them
 await pg.evaluate(()=>{const m=__mh;let best=0,bx=0,by=0;for(let i=0;i<m.NE;i++){const a=m.E[i];if(a.t!==7)continue;let c=0;for(let j=0;j<m.NE;j++){const e=m.E[j];if(e.t===7&&Math.abs(e.x-a.x)<400&&Math.abs(e.y-a.y)<300)c++;}if(c>best){best=c;bx=a.x;by=a.y;}}m.hole.x=bx+60;m.hole.y=by+60;});
 await pg.mouse.move(600,400);await pg.mouse.down();await pg.mouse.move(640,400,{steps:4});await sleep(2500);await pg.mouse.up();await sleep(150);
 await pg.screenshot({path:__dirname+'/../proof/'+name+'.png'});await pg.mouse.click(976,50);await sleep(300);await pg.mouse.click(512,505);await sleep(300);}
await b.close();})();
