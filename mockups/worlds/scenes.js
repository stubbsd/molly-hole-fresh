// ---------- SPACE objects (small -> big) ----------
const sp={
star:()=>ST(0,0,10,'#ffd84a'),
rock:()=>{P([[-11,-4],[-4,-10],[8,-8],[12,2],[5,10],[-8,8]],'#a59fc4');C(2,-1,3,'#8c86b0',2);},
sat:()=>{R(-30,-6,18,12,'#4a7be0',2,2.5);R(12,-6,18,12,'#4a7be0',2,2.5);R(-12,-1,24,2,O,0,0);R(-8,-8,16,16,'#e6e8f2',3,3);C(0,-12,4,'#ff6b6b',2);},
alien:()=>{x.lineWidth=2.5;x.strokeStyle=O;x.beginPath();x.moveTo(-5,-12);x.lineTo(-8,-20);x.moveTo(5,-12);x.lineTo(8,-20);x.stroke();C(-8,-20,3,'#ffd84a',2);C(8,-20,3,'#ffd84a',2);E(0,0,13,14,'#7ee07a');face(0,0,1);},
astro:()=>{R(-12,-6,24,22,'#f4f4fa',7,3);R(-15,-2,5,12,'#cfd3e6',2,2);C(0,-10,11,'#f4f4fa');E(0,-10,7,5,'#4a7be0',2);R(-4,6,8,5,'#ff6b6b',2,2);},
rocket:()=>{P([[-12,14],[-20,24],[-8,22]],'#ff6b6b');P([[12,14],[20,24],[8,22]],'#ff6b6b');E(0,0,12,26,'#f4f4fa');P([[-9,-16],[0,-30],[9,-16]],'#ff6b6b');C(0,-4,5,'#4ac0e0',2.5);P([[-6,24],[0,34],[6,24]],'#ffb13b',2);},
ufo:()=>{E(0,-6,14,12,'#bfe8ff');E(0,4,32,11,'#b7b0d6');for(let i=-2;i<=2;i++)C(i*12,6,3,'#ffd84a',1.5);face(0,-6,.8);},
planet:()=>{x.save();x.beginPath();x.ellipse(0,4,62,16,-.25,0,TAU);x.lineWidth=11;x.strokeStyle=O;x.stroke();x.lineWidth=6;x.strokeStyle='#ffd84a';x.stroke();x.restore();C(0,0,40,'#ff9bd2');C(-12,-10,8,'#ffb8e0',0);C(14,12,6,'#ffb8e0',0);x.save();x.beginPath();x.ellipse(0,4,62,16,-.25,0,Math.PI);x.lineWidth=11;x.strokeStyle=O;x.stroke();x.lineWidth=6;x.strokeStyle='#ffd84a';x.stroke();x.restore();},
station:()=>{R(-74,-34,40,68,'#4a7be0',4,3);R(34,-34,40,68,'#4a7be0',4,3);for(let i=-26;i<34;i+=14){R(-74,i,40,2,O,0,0);R(34,i,40,2,O,0,0);}R(-34,-4,68,8,'#cfd3e6',2,3);R(-18,-22,36,44,'#e6e8f2',8,3);C(0,-6,6,'#4ac0e0',2.5);C(0,10,5,'#ffd84a',2.5);R(-4,-36,8,14,'#e6e8f2',2,2.5);},
};
function space(){x.fillStyle='#1d2246';x.fillRect(0,0,1024,768);const r=seed(7);for(let i=0;i<90;i++){const s=r()<.2?3:1.6;x.fillStyle=r()<.3?'#ffd84a':'#cfd3ff';x.fillRect(r()*1024,r()*768,s,s);}C(930,640,60,'#4a90e2');C(905,620,18,'#6bd06b',0);C(950,660,14,'#6bd06b',0);C(930,640,60,'rgba(0,0,0,0)');
island(40,120,900,520,'#b9b3d6','#7f78a8');const rr=seed(3);for(let i=0;i<26;i++)C(80+rr()*820,160+rr()*440,6+rr()*14,'#a7a0cc',0);
// glowing walkway (flat)
R(40,350,900,58,'#8f88bc',0,0);for(let i=60;i<930;i+=60)R(i,377,30,5,'#ffd84a',2,0);R(560,120,58,520,'#8f88bc',0,0);
const hx=330,hy=440;const av=[[hx,hy,105],[110,160,0]];
const n=scatter(seed(11),[[sp.station,1,1,80],[sp.planet,1,1,68],[sp.ufo,1,2,34],[sp.rocket,1,3,30],[sp.astro,1,6,16],[sp.alien,1,6,16],[sp.sat,.9,4,28],[sp.rock,1,10,12],[sp.star,1,18,11]],av,[60,130,860,480]);
hole(hx,hy,72,'#2a2f6b','#ffd84a');at(hx+20,hy-30,.8,sp.astro,.6);T('YIPPEE!',hx+40,hy-118,26,'#ffd84a');
hud(57,.62,'Level 8 · Space','#ffd84a');
ladder([[sp.star,1.2,'star'],[sp.rock,1.2,'moon rock'],[sp.alien,1,'alien'],[sp.astro,1,'astronaut'],[sp.sat,.7,'satellite'],[sp.rocket,.7,'rocket'],[sp.ufo,.75,'UFO'],[sp.planet,.38,'planet'],[sp.station,.28,'space station']],'SIZE LADDER  →  hole grows to swallow the space station');return n;}
// ---------- MAGICAL ----------
const mg={
toad:()=>{R(-4,0,8,10,'#fff4e0',3,2.5);E(0,-2,13,8,'#ff6b6b');C(-5,-4,2.2,'#fff',0);C(5,-3,2,'#fff',0);},
wand:()=>{x.save();x.rotate(-.6);R(-2,-4,4,26,'#7a4a2a',2,2);x.restore();ST(-7,-12,9,'#ffd84a',2.5);},
fairy:()=>{E(-9,-4,9,6,'#bfe8ff',2.5);E(9,-4,9,6,'#bfe8ff',2.5);P([[-6,14],[0,-2],[6,14]],'#ff9bd2',2.5);C(0,-8,6,'#ffe0c8',2.5);},
chest:()=>{R(-18,-6,36,20,'#c98d58',3,3);R(-18,-16,36,12,'#b07a4a',6,3);R(-3,-8,6,8,'#ffd84a',1,2);},
unicorn:()=>{E(0,4,20,12,'#fff');R(-14,12,5,10,'#fff',2,2.5);R(9,12,5,10,'#fff',2,2.5);E(18,-8,9,8,'#fff');P([[18,-15],[22,-28],[24,-14]],'#ffd84a',2);P([[6,-8],[12,-12],[10,0]],'#ff9bd2',2);P([[-20,0],[-30,-6],[-26,8]],'#a78bfa',2);C(21,-8,1.6,O,0);},
rainbow:()=>{const cs=['#ff6b6b','#ffb13b','#ffd84a','#7ee07a','#4a90e2','#a78bfa'];x.lineWidth=7;cs.forEach((c,i)=>{x.beginPath();x.arc(0,16,46-i*6,Math.PI,0);x.strokeStyle=c;x.stroke();});x.lineWidth=3;x.strokeStyle=O;x.beginPath();x.arc(0,16,50,Math.PI,0);x.stroke();x.beginPath();x.arc(0,16,13,Math.PI,0);x.stroke();C(-48,18,10,'#fff');C(48,18,10,'#fff');},
dragon:()=>{P([[-14,-6],[-40,-30],[-30,0]],'#a78bfa');P([[14,-6],[40,-30],[30,0]],'#a78bfa');P([[-20,14],[-46,22],[-24,4]],'#7ee07a');E(0,6,26,20,'#7ee07a');E(0,12,15,10,'#d9f7c8',2);C(0,-18,16,'#7ee07a');P([[-10,-30],[-6,-40],[-2,-31]],'#ffd84a',2);P([[2,-31],[6,-40],[10,-30]],'#ffd84a',2);face(0,-16,1.3);C(-10,-12,3,'#ff9bd2',0);C(10,-12,3,'#ff9bd2',0);},
tower:()=>{R(-18,-40,36,80,'#d9d2f2',3,3);P([[-24,-38],[0,-74],[24,-38]],'#a78bfa');R(-6,-16,12,18,'#4a3a7a',6,2.5);R(-8,24,16,16,'#7a4a2a',8,2.5);},
castle:()=>{R(-80,-30,160,80,'#e8e2fa',3,3);for(const sx of[-80,48]){R(sx,-60,32,110,'#d9d2f2',3,3);P([[sx-6,-58],[sx+16,-96],[sx+38,-58]],'#ff9bd2');}R(-22,-74,44,60,'#d9d2f2',3,3);P([[-28,-72],[0,-112],[28,-72]],'#a78bfa');for(let i=-60;i<60;i+=20)R(i,-38,12,10,'#e8e2fa',1,2.5);R(-16,14,32,36,'#7a4a2a',16,3);C(0,-46,7,'#ffd84a',2.5);},
};
function magic(){x.fillStyle='#bfe3ff';x.fillRect(0,0,1024,768);const r=seed(5);for(let i=0;i<12;i++){const a=r()*1024,b=r()*768;C(a,b,26,'#fff',0);C(a+26,b+6,20,'#fff',0);C(a-24,b+8,18,'#fff',0);}
island(40,120,900,520,'#9fe08f','#6fae6a');const rr=seed(9);for(let i=0;i<30;i++)C(70+rr()*840,150+rr()*460,10+rr()*16,'#8fd47f',0);
x.lineWidth=52;x.strokeStyle='#ffe6b0';x.lineCap='round';x.beginPath();x.moveTo(60,560);x.bezierCurveTo(300,300,600,620,920,260);x.stroke();x.lineCap='butt';
const hx=470,hy=420,av=[[hx,hy,108]];
const n=scatter(seed(21),[[mg.castle,1,1,98],[mg.rainbow,1,1,58],[mg.dragon,1,1,44],[mg.tower,.8,2,42],[mg.unicorn,1,4,28],[mg.chest,1,5,20],[mg.fairy,1,7,15],[mg.wand,1,8,14],[mg.toad,1,14,13]],av,[60,130,860,480]);
hole(hx,hy,74,'#6a3fc8','#ff9bd2');at(hx-24,hy-22,.8,mg.unicorn,.8);
hud(84,.55,'Level 13 · Magical','#a78bfa');
ladder([[mg.toad,1.3,'toadstool'],[mg.wand,1.1,'wand'],[mg.fairy,1.2,'fairy'],[mg.chest,1,'treasure chest'],[mg.unicorn,.8,'unicorn'],[mg.dragon,.5,'friendly dragon'],[mg.rainbow,.4,'rainbow'],[mg.tower,.32,'tower'],[mg.castle,.24,'castle']],'SIZE LADDER  →  hole grows to swallow the castle');return n;}
// ---------- UNDERSEA ----------
const us={
shell:()=>{x.beginPath();x.moveTo(0,10);x.arc(0,10,13,Math.PI*1.1,Math.PI*1.9);x.closePath();x.fillStyle='#ffc4a8';x.fill();x.lineWidth=2.5;x.strokeStyle=O;x.stroke();for(const q of[-.35,0,.35]){x.beginPath();x.moveTo(0,10);x.lineTo(Math.sin(q)*11,10-Math.cos(q)*11);x.stroke();}},
starfish:()=>{ST(0,0,13,'#ff8a5a',2.5);C(0,0,2.5,'#ffd0a0',0);},
fish:()=>{P([[-14,0],[-24,-8],[-24,8]],'#ffb13b');E(0,0,15,10,'#ffb13b');R(-4,-10,4,20,'#fff',1,0);C(8,-2,2,O,0);},
crab:()=>{for(const s of[-1,1]){C(s*18,-10,6,'#ff6b6b',2.5);R(s*13-2,4,4,8,'#ff6b6b',1,2);}E(0,0,15,10,'#ff6b6b');face(0,0,.9);},
octo:()=>{for(let i=-3;i<=3;i++)R(i*5-2,4,5,16,'#c08bf0',3,2);C(0,-4,15,'#c08bf0');face(0,-2,1);},
turtle:()=>{C(-22,0,7,'#9fd67a',2.5);for(const[a,b]of[[-10,-14],[10,-14],[-10,14],[10,14]])E(a,b,6,4,'#9fd67a',2.5);E(0,0,19,15,'#3f9e5a');C(0,0,6,'#5cbf73',0);C(-24,-2,1.5,O,0);},
coral:()=>{x.lineCap='round';for(const[w,c]of[[13,O],[8,'#ff7aa8']]){x.lineWidth=w;x.strokeStyle=c;x.beginPath();x.moveTo(0,22);x.lineTo(0,-6);x.moveTo(0,10);x.lineTo(-14,-14);x.moveTo(0,4);x.lineTo(16,-18);x.moveTo(0,-6);x.lineTo(-2,-24);x.stroke();}x.lineCap='butt';},
sub:()=>{R(-4,-24,14,14,'#ffd84a',3,3);E(0,0,34,15,'#ffd84a');for(let i=-16;i<=16;i+=16)C(i,0,5,'#bfe8ff',2.5);P([[-34,-2],[-44,-10],[-44,8]],'#ffb13b');},
wreck:()=>{P([[-70,-10],[60,-22],[78,0],[60,22],[-70,10]],'#a6744a');x.lineWidth=2;x.strokeStyle='#7a5434';for(let i=-50;i<60;i+=18){x.beginPath();x.moveTo(i,-14);x.lineTo(i,14);x.stroke();}R(-2,-50,6,60,'#7a5434',1,2.5);P([[4,-46],[30,-24],[4,-22]],'#f4ecd8',2.5);C(-38,0,6,'#5aa0c8',2.5);},
whale:()=>{P([[-60,0],[-86,-18],[-80,0],[-86,18]],'#5a8fe0');E(0,0,64,34,'#5a8fe0');E(6,12,48,18,'#cfe6ff',0);C(36,-8,3.5,O,0);x.beginPath();x.arc(40,6,8,.2,1.3);x.lineWidth=3;x.strokeStyle=O;x.stroke();C(46,4,4,'#ffb8d0',0);for(const[a,b,r]of[[22,-44,5],[30,-58,7],[18,-66,4]])C(a,b,r,'#e6f6ff',2);},
};
function sea(){x.fillStyle='#1f6fb0';x.fillRect(0,0,1024,768);const r=seed(4);for(let i=0;i<40;i++){C(r()*1024,r()*768,2+r()*5,'#3f8fd0',0);}
island(40,120,900,520,'#f2d79b','#d4b479');x.lineWidth=4;x.strokeStyle='#e4c584';for(let j=0;j<10;j++){x.beginPath();for(let i=0;i<=16;i++){const a=70+i*52,b=160+j*44+Math.sin(i*.9+j)*6;i?x.lineTo(a,b):x.moveTo(a,b);}x.stroke();}
const rr=seed(13);for(let i=0;i<14;i++){const a=70+rr()*840,b=150+rr()*460;x.lineWidth=5;x.strokeStyle='#4fb06a';x.beginPath();x.moveTo(a,b+14);x.quadraticCurveTo(a+8,b,a,b-14);x.stroke();}
const hx=600,hy=400,av=[[hx,hy,110]];
const n=scatter(seed(31),[[us.whale,1,1,90],[us.wreck,1,1,80],[us.sub,1,2,42],[us.coral,1,4,24],[us.turtle,1,4,26],[us.octo,1,4,20],[us.crab,1,6,22],[us.fish,1,8,24],[us.starfish,1,9,14],[us.shell,1,12,13]],av,[60,130,860,480]);
hole(hx,hy,76,'#0f4a7a','#5ee0d0');at(hx-10,hy+16,.8,us.turtle,.9);
hud(132,.8,'Level 18 · Undersea','#5ee0d0');
ladder([[us.shell,1.2,'shell'],[us.starfish,1.2,'starfish'],[us.fish,1,'fish'],[us.crab,.9,'crab'],[us.octo,1,'octopus'],[us.turtle,.9,'turtle'],[us.coral,.9,'coral'],[us.sub,.6,'submarine'],[us.wreck,.3,'shipwreck'],[us.whale,.28,'friendly whale']],'SIZE LADDER  →  hole grows to swallow the friendly whale');return n;}
