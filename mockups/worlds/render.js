const p=require('/tmp/pt/node_modules/puppeteer-core'),fs=require('fs');
const src=fs.readFileSync('lib.js','utf8').replace('module.exports={};','')+fs.readFileSync('scenes.js','utf8')+fs.readFileSync('scenes2.js','utf8');
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox']});let pg;const mk=async()=>{pg=await b.newPage();pg.on('pageerror',e=>console.log('ERR',e.message));await pg.setViewport({width:1024,height:768,deviceScaleFactor:2});};
for(const [f,name] of [['worldmap','1-world-map'],['space','2-space-gameplay'],['magic','3-magical-gameplay'],['sea','4-undersea-gameplay'],['globe','5-world-complete-globe'],['rewards','6-reward-cards'],['endgame','7-last-items-arrow']]){
await mk();await pg.setContent(`<body style="margin:0"><canvas id=c width=2048 height=1536 style="width:1024px;height:768px"></canvas><script>${src};x=document.getElementById('c').getContext('2d');x.scale(2,2);space.bg=()=>{x.fillStyle='#1d2246';x.fillRect(0,0,1024,768);};window.N=${f}();</script>`);
console.log(name,await pg.evaluate(()=>window.N));await pg.screenshot({path:name+'.png'});}await b.close();})();
