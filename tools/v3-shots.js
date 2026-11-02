const p=require('/tmp/pt/node_modules/puppeteer-core');const sleep=ms=>new Promise(r=>setTimeout(r,ms));const OUT=__dirname+'/../proof/';
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox']});const pg=await b.newPage();pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.setViewport({width:1024,height:768,deviceScaleFactor:2});await pg.goto(process.env.URL);
await pg.evaluate(()=>{localStorage.clear();localStorage.setItem('mollyHoleFresh1',JSON.stringify({coins:0,stars:[3,3,3,3,0],skin:2,owned:[1,0,1,0,0,0,0,0],gift:0}));});await pg.reload();await sleep(400);
await pg.mouse.click(520,330);await sleep(400);
// 1) animals: park the hole beside the densest cluster of animals
const where=await pg.evaluate(()=>{const m=__mh;let best=0,bi=0;for(let i=0;i<m.NE;i++){const a=m.E[i];if(a.t!==7||a.mv!==2)continue;let c=0;for(let j=0;j<m.NE;j++){const e=m.E[j];if(e.t===7&&e.mv===2&&Math.abs(e.x-a.x)<450&&Math.abs(e.y-a.y)<330)c++;}if(c>best){best=c;bi=i;}}const a=m.E[bi];m.hole.x=a.x+150;m.hole.y=a.y+120;m.hole.r=m.hole.rt=45;return best;});
console.log('animals in view',where);await sleep(300);await pg.screenshot({path:OUT+'v3-animals.png'});
// 2) emergency vehicles + traffic lights: follow the nearest emergency vehicle to a junction
await pg.evaluate(()=>{const m=__mh;for(let i=0;i<m.NE;i++){const e=m.E[i];if(e.t===7&&e.mv===1&&e.s>=36&&e.s<=40&&e.c===3&&e.x>500&&e.x<1500){m.hole.x=e.x-60;m.hole.y=e.y+180;return;}}});
await sleep(120);await pg.screenshot({path:OUT+'v3-emergency-a.png'});await sleep(350);await pg.screenshot({path:OUT+'v3-emergency-b.png'});
await b.close();})();
