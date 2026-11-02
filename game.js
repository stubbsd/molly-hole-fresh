'use strict';
// Molly Hole (fresh). Canvas2D, flat fills only, sprites prerendered once, pools, fixed step, spatial grid.
(function(){
const O='#2b2140',TAU=Math.PI*2,FONT='Arial Rounded MT Bold,Arial,sans-serif';
const cv=document.getElementById('c'),g=cv.getContext('2d',{alpha:false});
if(!g.roundRect)CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){r=Math.min(r,w/2,h/2);this.moveTo(x+r,y);this.arcTo(x+w,y,x+w,y+h,r);this.arcTo(x+w,y+h,x,y+h,r);this.arcTo(x,y+h,x,y,r);this.arcTo(x,y,x+w,y,r);this.closePath();};
const WW=2048,WH=1280,STEP=1/120,TILT=0.62;
const SKINS=[['#3a1a6b','#fff',0],['#e9584e','#ffd23f',50],['#1f6fd1','#bfe8ff',100],['#1d8a5a','#a8f0a0',150],['#c2357e','#ffd1e8',200],['#222222','#ffd23f',250],['#7a4a2a','#ffb54f',300],['#103a6b','#ffffff',400]];
function dark(h){const n=parseInt(h.slice(1),16),f=v=>Math.round(v*.48).toString(16).padStart(2,'0');return '#'+f(n>>16)+f((n>>8)&255)+f(n&255);}
SKINS.forEach(s=>s.push(dark(s[0])));
// reward-only skins: galaxy-rocket rim (Space) and giant golden hole (Undersea)
SKINS.push(['#1d2246','#a78bfa',-1,'#0e1123','g'],['#d9a400','#fff3a0',-1,'#7a5c00','b']);
// ---------- progress ----------
const SK='mollyHoleFresh1',RK='mollyHoleFresh1Run';
let P={coins:0,stars:[0,0,0,0,0],skin:0,owned:[1,0,0,0,0,0,0,0],gift:0,rw:[0,0,0,0]};
try{const s=JSON.parse(localStorage.getItem(SK));if(s)Object.assign(P,s);}catch(e){}
// migrate older saves (5 levels, 8 skins, no rewards) without losing anything
while(P.stars.length<20)P.stars.push(0);while(P.owned.length<10)P.owned.push(0);if(!Array.isArray(P.rw))P.rw=[0,0,0,0];while(P.rw.length<4)P.rw.push(0);
if(P.stars[4]>0)P.rw[0]=1;if(P.rw[1])P.owned[8]=1;if(P.rw[3])P.owned[9]=1;if(!(P.skin>=0&&P.skin<10&&P.owned[P.skin]))P.skin=0;
function saveP(){try{localStorage.setItem(SK,JSON.stringify(P));}catch(e){}}
// ---------- drawing primitives (same as mockups) ----------
function R(x,a,b,w,h,f,r=6,lw=3){x.beginPath();x.roundRect(a,b,w,h,r);x.fillStyle=f;x.fill();if(lw){x.lineWidth=lw;x.strokeStyle=O;x.stroke();}}
function C(x,a,b,r,f,lw=3){x.beginPath();x.arc(a,b,r,0,TAU);x.fillStyle=f;x.fill();if(lw){x.lineWidth=lw;x.strokeStyle=O;x.stroke();}}
function T(x,t,a,b,s,f='#fff',al='center'){x.font='900 '+s+'px '+FONT;x.textAlign=al;x.textBaseline='middle';x.lineJoin='round';x.lineWidth=s/5;x.strokeStyle=O;x.strokeText(t,a,b);x.fillStyle=f;x.fillText(t,a,b);}
function bld(x,a,b,w,h,d,f,roof){R(x,a,b,w,h-d,roof,6);R(x,a,b+h-d,w,d,f,0);for(let i=a+10;i<a+w-14;i+=22)R(x,i,b+h-d+8,12,Math.min(14,d-16),'#bfe8ff',2,2);R(x,a+w/2-9,b+h-18,18,18,'#7a4a2a',3,2);}
function tree(x,a,b,s=1){R(x,a-4*s,b,8*s,14*s,'#8a5a32',2,2);C(x,a,b-4*s,16*s,'#3fbf5a');}
function car(x,f){R(x,-24,-13,48,26,f,7);R(x,-10,-10,18,20,'#bfe8ff',4,2);}
function bus(x){R(x,-60,-18,120,36,'#ffc531',8);for(let i=-48;i<50;i+=22)R(x,i,-12,14,24,'#bfe8ff',3,2);}
function person(x,a,b,f){C(x,a,b+6,8,f);C(x,a,b-6,7,'#ffd2a8');}
function hole(x,a,b,r,tilt,sk){x.save();x.translate(a,b);x.scale(1,tilt);C(x,0,0,r+7,sk[1],4);C(x,0,0,r,sk[0],0);x.beginPath();x.arc(0,0,r,Math.PI,TAU);x.fillStyle=sk[3];x.fill();x.restore();}
function star(x,a,b,r,f){x.beginPath();for(let i=0;i<10;i++){const q=i%2?r*.48:r,an=-Math.PI/2+i*Math.PI/5;i?x.lineTo(a+q*Math.cos(an),b+q*Math.sin(an)):x.moveTo(a+q*Math.cos(an),b+q*Math.sin(an));}x.closePath();x.fillStyle=f;x.fill();x.lineWidth=3;x.strokeStyle=O;x.lineJoin='round';x.stroke();}
function padlock(x,a,b,s,f='#9b93ad'){x.beginPath();x.arc(a,b-s*.15,s*.36,Math.PI,0);x.lineTo(a+s*.36,b+s*.1);x.moveTo(a-s*.36,b+s*.1);x.lineTo(a-s*.36,b-s*.15);x.lineWidth=s*.16;x.strokeStyle=O;x.lineCap='round';x.stroke();R(x,a-s*.55,b,s*1.1,s*.8,f,s*.14,3);C(x,a,b+s*.33,s*.1,O,0);x.fillRect(a-s*.04,b+s*.33,s*.08,s*.25);}
function coin(x,a,b,r){C(x,a,b,r,'#ffd23f');C(x,a,b,r*.5,'#f5b301',0);}
function playIcon(x,a,b,s){x.beginPath();x.moveTo(a-s*.35,b-s*.45);x.lineTo(a+s*.5,b);x.lineTo(a-s*.35,b+s*.45);x.closePath();x.fillStyle='#fff';x.fill();x.lineWidth=4;x.strokeStyle=O;x.lineJoin='round';x.stroke();}
function homeIcon(x,a,b,s){x.beginPath();x.moveTo(a-s*.55,b-s*.02);x.lineTo(a,b-s*.5);x.lineTo(a+s*.55,b-s*.02);x.closePath();x.fillStyle='#ff7a6b';x.fill();x.lineWidth=4;x.strokeStyle=O;x.lineJoin='round';x.stroke();R(x,a-s*.38,b-s*.04,s*.76,s*.5,'#fff',3,4);R(x,a-s*.1,b+s*.16,s*.2,s*.3,'#7a4a2a',2,2);}
function tick(x,a,b,s){x.beginPath();x.moveTo(a-s*.4,b);x.lineTo(a-s*.1,b+s*.3);x.lineTo(a+s*.45,b-s*.35);x.lineCap='round';x.lineJoin='round';x.lineWidth=s*.3;x.strokeStyle=O;x.stroke();x.lineWidth=s*.16;x.strokeStyle='#fff';x.stroke();}
// ---------- sizing ----------
let vw=0,vh=0,dpr=1,k=1,K=1,U=1,uox=0,uoy=0,hs=1,viewW=0,viewH=0,bakedK=0;
function resize(){vw=window.innerWidth;vh=window.innerHeight;dpr=Math.min(window.devicePixelRatio||1,2);
 cv.width=Math.round(vw*dpr);cv.height=Math.round(vh*dpr);
 k=Math.min(vw,vh)/768;K=k*dpr;viewW=vw/k;viewH=vh/k;
 const u=Math.min(vw/1024,vh/768);U=u*dpr;uox=Math.round((vw-1024*u)/2*dpr);uoy=Math.round((vh-768*u)/2*dpr);
 hs=Math.max(1,Math.min(1.35,Math.min(vw,vh)/768));
 if(K!==bakedK){bake();bakedK=K;}
 bakeHud();if(bakedK)bakePickerRims();hudDirty=1;dirty=1;}
// ---------- sprites, prerendered once ----------
const PCOL=['#ff6b6b','#4a90e2','#ffc531','#2fae8e','#b583f0'],CCOL=['#e9584e','#3d8be0','#9a62d8','#2fae8e','#ff7cb8'];
const HOUSES=[[130,120,'#2fae8e','#43cba8'],[150,130,'#3d8be0','#5aa7ff'],[150,140,'#e9584e','#ff7a6b'],[160,150,'#e95c9c','#ff7cb8'],[170,130,'#9a62d8','#b583f0'],[160,180,'#3d8be0','#5aa7ff'],[170,170,'#e9584e','#ff7a6b'],[190,200,'#f39a2d','#ffb54f']];

function E2(x,a,b,rx,ry,f,lw=3){x.beginPath();x.ellipse(a,b,rx,ry,0,0,TAU);x.fillStyle=f;x.fill();if(lw){x.lineWidth=lw;x.strokeStyle=O;x.stroke();}}
function PG(x,pts,f,lw=3){x.beginPath();for(let i=0;i<pts.length;i++)i?x.lineTo(pts[i][0],pts[i][1]):x.moveTo(pts[i][0],pts[i][1]);x.closePath();x.fillStyle=f;x.fill();if(lw){x.lineWidth=lw;x.strokeStyle=O;x.lineJoin='round';x.stroke();}}
function ST(x,a,b,r,f,lw=3){const p=[];for(let i=0;i<10;i++){const q=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;p.push([a+Math.cos(q)*rr,b+Math.sin(q)*rr]);}PG(x,p,f,lw);}
function face(x,a,b,s=1){C(x,a-4*s,b,1.8*s,O,0);C(x,a+4*s,b,1.8*s,O,0);x.beginPath();x.arc(a,b+1.5*s,3*s,.2*Math.PI,.8*Math.PI);x.lineWidth=1.8*s;x.strokeStyle=O;x.stroke();}
function chest(x){R(x,-18,-6,36,20,'#c98d58',3,3);R(x,-18,-16,36,12,'#b07a4a',6,3);R(x,-3,-8,6,8,'#ffd84a',1,2);}
function fish(c,st){return x=>{PG(x,[[-14,0],[-24,-8],[-24,8]],c);E2(x,0,0,15,10,c);R(x,-4,-10,4,20,st,1,0);C(x,8,-2,2,O,0);};}
function castle(x,wall,roof){R(x,-80,-30,160,80,wall,3,3);for(const sx of[-80,48]){R(x,sx,-60,32,110,'#d9d2f2',3,3);PG(x,[[sx-6,-58],[sx+16,-96],[sx+38,-58]],'#ff9bd2');}R(x,-22,-74,44,60,'#d9d2f2',3,3);PG(x,[[-28,-72],[0,-112],[28,-72]],roof);for(let i=-60;i<60;i+=20)R(x,i,-38,12,10,wall,1,2.5);R(x,-16,14,32,36,'#7a4a2a',16,3);C(x,0,-46,7,'#ffd84a',2.5);}
// ---------- everyday items (UK flavour), prerendered once ----------
// [w,h,size,coins,tier(0 small,1 medium,2 big,3 moving),draw]
function lb(x,a,b,f){R(x,a-7,b-3,6,6,f?'#203a8a':'#5ab0ff',2,1.5);R(x,a+1,b-3,6,6,f?'#5ab0ff':'#203a8a',2,1.5);}
function batt(x,a,b,w,c1,c2){for(let i=0;i*8<w;i++){R(x,a+i*8,b,8,5,i%2?c2:c1,0,0);R(x,a+i*8,b+5,8,5,i%2?c1:c2,0,0);}}
const ITEMS=[
 [18,18,7,1,0,x=>{C(x,0,0,8,'#fff',2.5);C(x,0,0,3,O,0);C(x,-5,-3,1.6,O,0);C(x,5,-2,1.6,O,0);C(x,0,5,1.6,O,0);}], // football
 [22,24,9,1,0,x=>{C(x,-7,-9,4,'#b07a4a',2);C(x,7,-9,4,'#b07a4a',2);C(x,0,4,8,'#b07a4a',2.5);C(x,0,-5,7,'#c98d58',2.5);C(x,0,-4,2,O,0);}], // teddy
 [22,18,8,1,0,x=>{R(x,-9,-2,18,10,'#ffd23f',5,2.5);C(x,4,-4,5,'#ffd23f',2.5);R(x,8,-5,6,3,'#f39a2d',1,1.5);C(x,5,-5,1.2,O,0);}], // rubber duck
 [22,30,9,1,0,x=>{C(x,-5,-8,4,'#ff7cb8',2);C(x,5,-9,4,'#ffd23f',2);C(x,0,-12,4,'#b583f0',2);R(x,-8,-4,16,15,'#d9763c',3,2.5);}], // flower pot
 [18,22,8,1,0,x=>{x.beginPath();x.moveTo(0,-10);x.lineTo(7,8);x.lineTo(-7,8);x.closePath();x.fillStyle='#ff8a2a';x.fill();x.lineWidth=2.5;x.strokeStyle=O;x.stroke();R(x,-4,-1,8,3,'#fff',0,0);R(x,-10,7,20,4,'#ff8a2a',2,2);}], // traffic cone
 [18,30,12,1,0,x=>{R(x,-8,-13,16,26,'#e23b3b',6,2.5);R(x,-5,-6,10,3,O,1,0);R(x,-8,8,16,5,'#2b2140',2,0);}], // post box
 [24,26,13,1,0,x=>{R(x,-9,-9,18,20,'#2e6b45',3,2.5);R(x,-10,-12,20,5,'#24553a',2,2);C(x,-6,11,2.5,O,0);}], // wheelie bin
 [16,52,14,1,0,x=>{R(x,-2,-16,4,40,'#4a4e63',2,1.5);R(x,-6,-24,12,9,'#ffe68a',3,2.5);}], // lamp post
 [26,28,14,1,0,x=>{R(x,-11,-8,22,12,'#2a3f8f',5,2.5);x.beginPath();x.arc(-5,-7,7,Math.PI,0);x.fillStyle='#1f2f6e';x.fill();x.lineWidth=2.5;x.strokeStyle=O;x.stroke();C(x,-7,7,3.5,'#555',2);C(x,7,7,3.5,'#555',2);}], // pram
 [38,22,16,2,0,x=>{C(x,-11,4,7,'#ffffff',2.5);C(x,11,4,7,'#ffffff',2.5);x.beginPath();x.moveTo(-11,4);x.lineTo(-2,-5);x.lineTo(8,-5);x.lineTo(11,4);x.moveTo(-2,-5);x.lineTo(0,4);x.lineTo(8,-5);x.lineWidth=3;x.strokeStyle='#2fae8e';x.stroke();R(x,-5,-9,7,3,O,1,0);}], // bike
 [30,24,12,1,0,x=>{R(x,-12,4,22,4,'#ff7cb8',2,2);R(x,8,-10,3,16,'#9b93ad',1,1.5);R(x,4,-11,11,3,O,1,0);C(x,-10,9,3,'#555',1.5);C(x,9,9,3,'#555',1.5);}], // scooter
 [26,26,14,1,0,x=>{R(x,-11,-11,22,22,'#fff',3,2.5);R(x,-11,-11,7,22,'#4a90e2',0,0);R(x,4,-11,7,22,'#4a90e2',0,0);x.lineWidth=2.5;x.strokeStyle=O;x.beginPath();x.roundRect(-11,-11,22,22,3);x.stroke();}], // deckchair
 [24,44,20,2,0,x=>{R(x,-10,-19,20,38,'#e23b3b',4,2.5);for(let r=0;r<3;r++)for(let c=0;c<2;c++)R(x,-6+c*7,-14+r*9,5,6,'#bfe8ff',1,1.5);R(x,-8,-21,16,4,'#e23b3b',2,2);}], // phone box
 [46,40,22,2,0,x=>{R(x,-20,-17,40,7,'#a5683a',3,2.5);R(x,-16,-6,32,12,'#c97a3a',3,2.5);R(x,-20,10,40,7,'#a5683a',3,2.5);}], // picnic table
 [44,46,22,3,0,x=>{R(x,-16,-4,32,20,'#bfe8ff',4,2.5);C(x,-10,17,4,'#555',2);C(x,10,17,4,'#555',2);R(x,-1,-18,2,16,O,0,0);x.beginPath();x.arc(0,-14,15,Math.PI,0);x.fillStyle='#ff7cb8';x.fill();x.lineWidth=2.5;x.strokeStyle=O;x.stroke();R(x,-3,-28,6,12,'#fff',0,0);C(x,0,4,4,'#ffd2a8',1.5);}], // ice-cream cart
 [64,24,26,2,0,x=>{R(x,-30,-9,60,20,'#2f8f45',9,2.5);C(x,-18,-8,7,'#3fbf5a',0);C(x,0,-10,8,'#3fbf5a',0);C(x,18,-8,7,'#3fbf5a',0);}], // hedge
 [58,58,34,3,1,x=>{R(x,-26,-12,52,36,'#c97a3a',4,3);x.beginPath();x.moveTo(-30,-10);x.lineTo(0,-27);x.lineTo(30,-10);x.closePath();x.fillStyle='#5a3a24';x.fill();x.lineWidth=3;x.strokeStyle=O;x.stroke();R(x,-6,4,12,20,'#8a5a32',2,2);R(x,10,-2,10,10,'#bfe8ff',2,2);}], // garden shed
 [44,70,36,3,1,x=>{R(x,-18,-30,8,60,'#9b93ad',3,2.5);R(x,10,-30,8,60,'#9b93ad',3,2.5);for(let i=-24;i<26;i+=10)R(x,-14,i,28,3,O,1,0);R(x,-10,-34,20,64,'#ff7a6b',8,3);}], // slide
 [74,44,38,3,1,x=>{x.lineWidth=5;x.strokeStyle='#4a4e63';x.beginPath();x.moveTo(-34,18);x.lineTo(-30,-18);x.lineTo(30,-18);x.lineTo(34,18);x.stroke();x.lineWidth=2;x.strokeStyle=O;x.beginPath();x.moveTo(-14,-18);x.lineTo(-14,6);x.moveTo(-4,-18);x.lineTo(-4,6);x.moveTo(6,-18);x.lineTo(6,6);x.moveTo(16,-18);x.lineTo(16,6);x.stroke();R(x,-17,4,16,5,'#ffd23f',2,2);R(x,3,4,16,5,'#4a90e2',2,2);}], // swings
 [78,78,40,3,1,x=>{C(x,0,0,34,'#cfc8dc',3);C(x,0,0,27,'#7fd0f0',2);C(x,0,0,10,'#cfc8dc',2.5);C(x,0,-3,5,'#bfe8ff',2);C(x,-14,8,3,'#fff',0);C(x,12,-12,2.5,'#fff',0);}], // fountain
 [150,150,78,5,2,x=>{C(x,0,0,66,'#fff',4);C(x,0,0,52,'#3fbf5a',3);for(let i=0;i<8;i++){const a=i*Math.PI/4;R(x,Math.cos(a)*44-4,Math.sin(a)*44-4,8,8,'#fff',2,2);}C(x,0,0,18,'#e23b3b',3);C(x,0,0,6,'#ffd23f',2);}], // bandstand
 [170,160,84,5,2,x=>{bld(x,-85,-80,170,160,52,'#2fae8e','#43cba8');for(let i=0;i<8;i++)R(x,-85+i*21.25,22,21.25,14,i%2?'#fff':'#e23b3b',0,0);x.lineWidth=3;x.strokeStyle=O;x.strokeRect(-85,22,170,14);R(x,-50,-74,100,26,'#ffd23f',6,3);coin(x,-30,-61,8);R(x,-15,-64,50,6,O,2,0);}], // corner shop
 [74,36,40,3,3,x=>{R(x,-34,-15,68,30,'#ffd1e8',8,3);R(x,-34,-15,68,8,'#ff7cb8',4,0);R(x,-10,-10,24,20,'#bfe8ff',3,2);R(x,20,-11,10,20,'#bfe8ff',3,2);x.beginPath();x.moveTo(-26,-2);x.lineTo(-20,10);x.lineTo(-14,-2);x.closePath();x.fillStyle='#e8b26a';x.fill();x.stroke();C(x,-20,-5,6,'#fff',2);}], // ice-cream van
 [54,30,34,3,3,x=>{R(x,-25,-13,50,26,'#222',8,3);R(x,-10,-10,18,20,'#bfe8ff',4,2);R(x,-4,-5,8,10,'#ffd23f',2,2);}], // black cab
 [104,40,56,5,6,(x,f)=>{R(x,-50,-17,100,34,'#e23b3b',8,3);R(x,-40,-6,70,4,'#cfc8dc',1,1.5);R(x,-40,2,70,4,'#cfc8dc',1,1.5);for(let i=-36;i<30;i+=10)R(x,i,-6,2,12,'#cfc8dc',0,0);R(x,32,-12,14,24,'#bfe8ff',3,2);C(x,36,-14,3.5,f?'#203a8a':'#5ab0ff',1.5);C(x,44,-14,3.5,f?'#5ab0ff':'#203a8a',1.5);}], // fire engine
 // emergency vehicles (tier 6): drive on the roads, blue lights flash by swapping two prerendered frames
 [70,36,40,3,6,(x,f)=>{R(x,-33,-15,66,30,'#ffe14a',6,3);batt(x,-31,-5,48,'#2fae4a','#ffe14a');R(x,18,-11,12,22,'#bfe8ff',3,2);R(x,-30,-13,10,4,'#fff',1,0);lb(x,-2,-10,f);}], // ambulance
 [56,30,36,3,6,(x,f)=>{R(x,-26,-13,52,26,'#fff',7,3);batt(x,-24,-5,32,'#1f6fd1','#ffd23f');R(x,8,-10,14,20,'#bfe8ff',4,2);lb(x,-4,-9,f);}], // police car
 [72,36,40,3,6,(x,f)=>{R(x,-34,-15,68,30,'#fff',6,3);batt(x,-32,-5,48,'#1f6fd1','#ffd23f');R(x,20,-11,11,22,'#bfe8ff',3,2);lb(x,0,-10,f);}], // police van
 [60,34,38,3,6,(x,f)=>{R(x,-28,-14,56,28,'#ff8a2a',6,3);R(x,-26,-3,40,6,'#fff',0,0);R(x,10,-11,13,22,'#bfe8ff',3,2);R(x,-31,-8,4,16,O,2,0);lb(x,-6,-10,f);}], // mountain rescue 4x4
 // farm vehicles (tier 8): trundle slowly along their own lane, facing right
 [50,34,30,3,8,x=>{C(x,-13,6,11,'#3a3a3a',3);C(x,-13,6,4,'#cfc8dc',2);C(x,14,9,7,'#3a3a3a',3);R(x,-10,-6,30,12,'#e23b3b',4,3);R(x,-18,-16,16,16,'#e23b3b',3,3);R(x,-15,-13,10,8,'#bfe8ff',2,2);R(x,10,-12,3,8,O,1,0);}], // red tractor
 [92,36,44,3,8,x=>{R(x,-44,-12,46,22,'#c9a24a',4,3);for(let i=0;i<3;i++)R(x,-41+i*14,-9,12,16,'#ffd56a',3,2);C(x,-30,12,5,'#3a3a3a',2);C(x,-14,12,5,'#3a3a3a',2);R(x,2,-1,6,3,O,1,0);C(x,18,6,11,'#3a3a3a',3);C(x,18,6,4,'#cfc8dc',2);C(x,40,9,6,'#3a3a3a',3);R(x,20,-5,24,11,'#2f9e44',4,3);R(x,12,-16,15,15,'#2f9e44',3,3);R(x,15,-13,9,7,'#bfe8ff',2,2);}], // green tractor + hay trailer
 [134,58,70,5,8,x=>{R(x,52,-20,12,40,'#e0b020',3,3);for(let i=-16;i<18;i+=8)R(x,53,i,10,3,O,1,0);R(x,-50,-14,100,30,'#2f9e44',8,3);R(x,-40,-26,40,14,'#2f9e44',5,3);R(x,10,-28,30,22,'#bfe8ff',5,3);R(x,-62,-6,16,6,'#2f9e44',3,2.5);C(x,-30,18,10,'#3a3a3a',3);C(x,26,18,12,'#3a3a3a',3);C(x,26,18,4,'#cfc8dc',2);}], // combine harvester
 [30,22,14,1,8,x=>{C(x,-9,6,5,'#3a3a3a',2.5);C(x,9,6,5,'#3a3a3a',2.5);R(x,-11,-4,22,9,'#ff8a2a',4,2.5);R(x,6,-9,3,7,O,1,0);R(x,2,-10,10,3,O,1,0);C(x,-3,-9,3.5,'#4a90e2',2);}], // quad bike
 [76,36,38,3,8,x=>{R(x,-36,-12,40,18,'#8a5a32',4,3);R(x,-33,-12,34,7,'#5a3a24',2,0);x.lineWidth=3;x.strokeStyle=O;x.strokeRect(-36,-12,40,18);C(x,-28,12,6,'#3a3a3a',2.5);C(x,-10,12,6,'#3a3a3a',2.5);R(x,4,-2,6,3,O,1,0);C(x,22,6,10,'#3a3a3a',3);R(x,20,-4,16,10,'#1f6fd1',3,3);R(x,14,-15,13,13,'#1f6fd1',3,3);R(x,16,-12,8,7,'#bfe8ff',2,2);}], // muck spreader (blue tractor pulling it)
 [60,34,34,3,8,x=>{R(x,-28,-8,56,20,'#6b8f3a',6,3);R(x,-26,-6,26,10,'#c9a24a',2,2);R(x,4,-18,20,14,'#6b8f3a',4,3);R(x,8,-15,13,9,'#bfe8ff',2,2);C(x,-16,13,7,'#3a3a3a',3);C(x,16,13,7,'#3a3a3a',3);R(x,26,-2,4,8,'#cfc8dc',1,1.5);}], // farm 4x4 pick-up
 // farm-edge patch (tier 9): static hay bales and a wooden fence
 [26,22,12,1,9,x=>{R(x,-11,-9,22,18,'#e8c050',8,3);x.lineWidth=2;x.strokeStyle='#b8902a';x.beginPath();x.arc(-3,0,5,0,TAU);x.stroke();}], // round hay bale
 [70,26,20,2,9,x=>{for(let i=-30;i<=30;i+=15)R(x,i-3,-11,6,22,'#b07a4a',2,2);R(x,-34,-7,68,4,'#c98d58',1,2);R(x,-34,2,68,4,'#c98d58',1,2);}], // fence
 // animals (tier 4): wander slowly, cheer when swallowed
 [26,22,10,1,4,x=>{R(x,-9,-2,18,11,'#f39a2d',6,2.5);x.beginPath();x.moveTo(8,4);x.quadraticCurveTo(15,2,13,-6);x.lineWidth=4;x.strokeStyle=O;x.stroke();x.lineWidth=2;x.strokeStyle='#f39a2d';x.stroke();x.beginPath();x.moveTo(-14,-6);x.lineTo(-12,-14);x.lineTo(-8,-8);x.moveTo(-4,-8);x.lineTo(-2,-14);x.lineTo(0,-6);x.fillStyle='#f39a2d';x.fill();x.lineWidth=2;x.strokeStyle=O;x.stroke();C(x,-7,-5,6.5,'#f39a2d',2.5);C(x,-9,-6,1.1,O,0);C(x,-5,-6,1.1,O,0);}], // cat
 [30,24,13,2,4,x=>{R(x,-11,-3,22,12,'#c98d58',6,2.5);R(x,9,-4,6,3,'#c98d58',1.5,2);C(x,-9,-6,7.5,'#c98d58',2.5);R(x,-17,-9,5,10,'#8a5a32',2.5,2);R(x,-6,-9,5,10,'#8a5a32',2.5,2);C(x,-11,-6,1.2,O,0);C(x,-7,-6,1.2,O,0);C(x,-9,-2,1.8,O,0);}], // dog
 [22,28,9,1,4,x=>{R(x,-5,-16,4,12,'#fff',2,2);R(x,1,-16,4,12,'#fff',2,2);R(x,-4,-14,2,8,'#ffb3c9',1,0);R(x,2,-14,2,8,'#ffb3c9',1,0);C(x,0,5,8,'#fff',2.5);C(x,0,-3,6.5,'#fff',2.5);C(x,-2,-4,1.1,O,0);C(x,2,-4,1.1,O,0);C(x,0,-1,1.2,'#ff8fb0',0);C(x,8,7,2.5,'#fff',2);}], // rabbit
 [22,16,7,1,4,x=>{R(x,-10,-6,20,13,'#f2d7b0',6,2.5);R(x,-1,-6,9,13,'#a5683a',0,0);x.lineWidth=2.5;x.strokeStyle=O;x.beginPath();x.roundRect(-10,-6,20,13,6);x.stroke();C(x,-8,-7,2.5,'#a5683a',1.5);C(x,-6,-1,1.1,O,0);}], // guinea pig
 [34,24,14,2,4,x=>{R(x,-14,-6,26,15,'#a5734a',8,2.5);R(x,-17,-11,13,11,'#a5734a',5,2.5);C(x,-7,-11,2,'#8a5a32',1.5);C(x,-13,-7,1.2,O,0);R(x,-17,-6,4,3,'#6b4428',1,0);C(x,-10,-17,3,'#ffd23f',1.5);}], // capybara (with a little orange-ish friend on its head)
 [24,26,7,1,4,x=>{x.beginPath();x.arc(6,-3,8,-.6,3.6);x.lineWidth=7;x.strokeStyle=O;x.stroke();x.lineWidth=4.5;x.strokeStyle='#d0632a';x.stroke();C(x,-2,4,6,'#d0632a',2.5);C(x,-6,-3,4.5,'#d0632a',2.5);C(x,-7,-4,1,O,0);C(x,-2,6,2.5,'#f2d7b0',0);}], // squirrel
 // ---------- world items: [w,h,size,coins,tier(10 space,11 magical,12 undersea),draw,flags(w=wanders,y=cheers),count at a world's 5th level] ----------
 [26,26,8,1,10,x=>ST(x,0,0,10,'#ffd84a'),'',30], // star
 [28,24,9,1,10,x=>{PG(x,[[-11,-4],[-4,-10],[8,-8],[12,2],[5,10],[-8,8]],'#a59fc4');C(x,2,-1,3,'#8c86b0',2);},'',24], // moon rock
  [30,28,10,1,10,x=>{const k=1.1;PG(x,[[-12*k,-3*k],[-6*k,-11*k],[5*k,-10*k],[12*k,-2*k],[9*k,9*k],[-2*k,11*k],[-11*k,6*k]],'#c49a72');C(x,-4*k,-2*k,3*k,'#9c7a58',2);C(x,4*k,4*k,2.2*k,'#9c7a58',2);C(x,5*k,-5*k,1.6*k,'#9c7a58',1.5);},'',10], // small asteroid
  [46,42,18,2,10,x=>{const k=1.75;PG(x,[[-12*k,-3*k],[-6*k,-11*k],[5*k,-10*k],[12*k,-2*k],[9*k,9*k],[-2*k,11*k],[-11*k,6*k]],'#a8907a');C(x,-4*k,-2*k,3*k,'#8a735f',2);C(x,4*k,4*k,2.2*k,'#8a735f',2);C(x,5*k,-5*k,1.6*k,'#8a735f',1.5);},'',6], // middle asteroid
  [68,62,26,3,10,x=>{const k=2.6;PG(x,[[-12*k,-3*k],[-6*k,-11*k],[5*k,-10*k],[12*k,-2*k],[9*k,9*k],[-2*k,11*k],[-11*k,6*k]],'#8f8aa6');C(x,-4*k,-2*k,3*k,'#736e8c',2);C(x,4*k,4*k,2.2*k,'#736e8c',2);C(x,5*k,-5*k,1.6*k,'#736e8c',1.5);},'',3], // big asteroid
  [76,40,24,2,10,x=>{PG(x,[[8,-12],[-36,-14],[-26,-6],[-36,0],[-26,4],[-36,12],[8,12]],'#bfe8ff');PG(x,[[8,-7],[-24,-8],[-18,-2],[-24,4],[8,7]],'#fff4b0',2);C(x,12,0,12,'#ffd84a');C(x,9,-4,3,'#fff',0);face(x,12,1,.7);},'w',4], // comet (flat tail)
 [32,48,13,2,10,x=>{x.lineWidth=2.5;x.strokeStyle=O;x.beginPath();x.moveTo(-5,-12);x.lineTo(-8,-20);x.moveTo(5,-12);x.lineTo(8,-20);x.stroke();C(x,-8,-20,3,'#ffd84a',2);C(x,8,-20,3,'#ffd84a',2);E2(x,0,0,13,14,'#7ee07a');face(x,0,0,1);},'w',12], // friendly alien
 [34,46,14,2,10,x=>{R(x,-12,-6,24,22,'#f4f4fa',7,3);R(x,-15,-2,5,12,'#cfd3e6',2,2);C(x,0,-10,11,'#f4f4fa');E2(x,0,-10,7,5,'#4a7be0',2);R(x,-4,6,8,5,'#ff6b6b',2,2);},'wy',12], // astronaut
 [66,32,20,2,10,x=>{R(x,-30,-6,18,12,'#4a7be0',2,2.5);R(x,12,-6,18,12,'#4a7be0',2,2.5);R(x,-12,-1,24,2,O,0,0);R(x,-8,-8,16,16,'#e6e8f2',3,3);C(x,0,-12,4,'#ff6b6b',2);},'',10], // satellite
 [52,44,22,2,10,x=>{R(x,14,-24,2,16,O,0,0);R(x,16,-24,10,7,'#ff6b6b',1,2);R(x,-22,-8,44,16,'#e6e8f2',5,3);C(x,-14,10,7,'#5a5470',3);C(x,14,10,7,'#5a5470',3);R(x,-8,-18,14,10,'#4ac0e0',3,2.5);},'w',8], // moon buggy
 [46,72,30,3,10,x=>{PG(x,[[-12,14],[-20,24],[-8,22]],'#ff6b6b');PG(x,[[12,14],[20,24],[8,22]],'#ff6b6b');E2(x,0,0,12,26,'#f4f4fa');PG(x,[[-9,-16],[0,-30],[9,-16]],'#ff6b6b');C(x,0,-4,5,'#4ac0e0',2.5);PG(x,[[-6,24],[0,34],[6,24]],'#ffb13b',2);},'',7], // rocket
 [70,42,32,3,10,x=>{E2(x,0,-6,14,12,'#bfe8ff');E2(x,0,4,32,11,'#b7b0d6');for(let i=-2;i<=2;i++)C(x,i*12,6,3,'#ffd84a',1.5);face(x,0,-6,.8);},'w',5], // UFO
 [134,96,60,5,10,x=>{const ring=(a,b)=>{x.beginPath();x.ellipse(0,4,62,16,-.25,a,b);x.lineWidth=11;x.strokeStyle=O;x.stroke();x.lineWidth=6;x.strokeStyle='#ffd84a';x.stroke();};ring(Math.PI,TAU);C(x,0,0,40,'#ff9bd2');C(x,-12,-10,8,'#ffb8e0',0);C(x,14,12,6,'#ffb8e0',0);ring(0,Math.PI);},'',3], // small planet
 [158,80,84,5,10,x=>{R(x,-74,-34,40,68,'#4a7be0',4,3);R(x,34,-34,40,68,'#4a7be0',4,3);for(let i=-26;i<34;i+=14){R(x,-74,i,40,2,O,0,0);R(x,34,i,40,2,O,0,0);}R(x,-34,-4,68,8,'#cfd3e6',2,3);R(x,-18,-22,36,44,'#e6e8f2',8,3);C(x,0,-6,6,'#4ac0e0',2.5);C(x,0,10,5,'#ffd84a',2.5);R(x,-4,-36,8,14,'#e6e8f2',2,2.5);},'',1], // space station
 // magical
 [30,24,9,1,11,x=>{R(x,-4,0,8,10,'#fff4e0',3,2.5);E2(x,0,-2,13,8,'#ff6b6b');C(x,-5,-4,2.2,'#fff',0);C(x,5,-3,2,'#fff',0);},'',20], // toadstool
 [34,36,10,1,11,x=>{x.save();x.rotate(-.6);R(x,-2,-4,4,26,'#7a4a2a',2,2);x.restore();ST(x,-7,-12,9,'#ffd84a',2.5);},'',12], // wand
 [24,32,9,1,11,x=>{R(x,-4,-14,8,7,'#e6f6ff',2,2);R(x,-5,-16,10,3,'#c98d58',1,2);C(x,0,3,10,'#a78bfa');C(x,-3,0,2.5,'#fff',0);},'',12], // potion
 [42,32,12,2,11,x=>{E2(x,-9,-4,9,6,'#bfe8ff',2.5);E2(x,9,-4,9,6,'#bfe8ff',2.5);PG(x,[[-6,14],[0,-2],[6,14]],'#ff9bd2',2.5);C(x,0,-8,6,'#ffe0c8',2.5);},'w',12], // fairy
 [40,36,14,2,11,chest,'',8], // treasure chest
 [42,40,16,2,11,x=>{C(x,0,4,16,'#3a3550');E2(x,0,-8,18,6,'#7ee07a');C(x,-6,-12,3,'#b8f0a0',2);C(x,5,-15,2.5,'#b8f0a0',2);R(x,-14,15,6,6,O,2,0);R(x,8,15,6,6,O,2,0);},'',7], // cauldron
 [28,46,14,2,11,x=>{PG(x,[[-12,20],[0,-4],[12,20]],'#ff9bd2');C(x,0,-9,7,'#ffe0c8',2.5);PG(x,[[-6,-14],[-6,-21],[-3,-17],[0,-22],[3,-17],[6,-21],[6,-14]],'#ffd84a',2);face(x,0,-8,.6);},'wy',7], // princess
 [28,46,14,2,11,x=>{R(x,-11,-2,4,20,'#ff6b6b',2,2);R(x,-8,-3,16,21,'#4a90e2',4,2.5);R(x,-8,6,16,3,'#ffd84a',0,0);C(x,0,-9,7,'#ffe0c8',2.5);PG(x,[[-6,-14],[-6,-21],[-3,-17],[0,-22],[3,-17],[6,-21],[6,-14]],'#ffd84a',2);face(x,0,-8,.6);},'wy',7], // prince
 [30,48,14,2,11,x=>{PG(x,[[-13,20],[0,-2],[13,20]],'#4a6fe0');ST(x,-3,10,3.5,'#ffd84a',0);ST(x,5,15,3,'#ffd84a',0);C(x,0,-6,7,'#ffe0c8',2.5);PG(x,[[-6,-2],[0,10],[6,-2]],'#fff',2);PG(x,[[-10,-10],[0,-30],[10,-10]],'#4a6fe0',2.5);face(x,0,-6,.6);},'wy',5], // wizard
 [30,48,14,2,11,x=>{PG(x,[[-12,20],[0,-2],[12,20]],'#8a5ad8');C(x,0,-6,7,'#ffe0c8',2.5);R(x,-13,-12,26,4,'#3a3550',2,2);PG(x,[[-8,-11],[3,-30],[8,-11]],'#3a3550',2.5);R(x,-8,-6,3,9,'#ff8a2a',1,0);R(x,5,-6,3,9,'#ff8a2a',1,0);face(x,0,-5,.6);},'wy',5], // friendly witch
  [56,62,20,2,11,x=>{R(x,-14,8,10,20,'#6a8f3a',4,2.5);R(x,4,8,10,20,'#6a8f3a',4,2.5);E2(x,0,2,20,16,'#a0522d');C(x,0,-14,15,'#8fc45a');E2(x,-17,-18,5,4,'#8fc45a');E2(x,17,-18,5,4,'#8fc45a');face(x,0,-14,1);R(x,-5,-6,3,4,'#fff',1,1.5);R(x,2,-6,3,4,'#fff',1,1.5);},'w',3], // friendly ogre
 [66,50,24,3,11,x=>{E2(x,0,4,20,12,'#fff');R(x,-14,12,5,10,'#fff',2,2.5);R(x,9,12,5,10,'#fff',2,2.5);E2(x,18,-8,9,8,'#fff');PG(x,[[18,-15],[22,-28],[24,-14]],'#ffd84a',2);PG(x,[[6,-8],[12,-12],[10,0]],'#ff9bd2',2);PG(x,[[-20,0],[-30,-6],[-26,8]],'#a78bfa',2);C(x,21,-8,1.6,O,0);},'w',6], // unicorn
 [92,76,36,3,11,x=>{PG(x,[[-14,-6],[-40,-30],[-30,0]],'#a78bfa');PG(x,[[14,-6],[40,-30],[30,0]],'#a78bfa');PG(x,[[-20,14],[-46,22],[-24,4]],'#7ee07a');E2(x,0,6,26,20,'#7ee07a');E2(x,0,12,15,10,'#d9f7c8',2);C(x,0,-18,16,'#7ee07a');PG(x,[[-10,-30],[-6,-40],[-2,-31]],'#ffd84a',2);PG(x,[[2,-31],[6,-40],[10,-30]],'#ffd84a',2);face(x,0,-16,1.3);C(x,-10,-12,3,'#ff9bd2',0);C(x,10,-12,3,'#ff9bd2',0);},'w',3], // friendly dragon
 [112,42,44,3,11,x=>{const cs=['#ff6b6b','#ffb13b','#ffd84a','#7ee07a','#4a90e2','#a78bfa'];x.lineCap='butt';x.lineWidth=7;cs.forEach((c,i)=>{x.beginPath();x.arc(0,16,46-i*6,Math.PI,0);x.strokeStyle=c;x.stroke();});x.lineWidth=3;x.strokeStyle=O;x.beginPath();x.arc(0,16,50,Math.PI,0);x.stroke();x.beginPath();x.arc(0,16,13,Math.PI,0);x.stroke();C(x,-46,18,10,'#fff');C(x,46,18,10,'#fff');},'',3], // rainbow
 [54,118,48,3,11,x=>{x.translate(0,17);R(x,-18,-40,36,80,'#d9d2f2',3,3);PG(x,[[-24,-38],[0,-74],[24,-38]],'#a78bfa');R(x,-6,-16,12,18,'#4a3a7a',6,2.5);R(x,-8,24,16,16,'#7a4a2a',8,2.5);},'',3], // tower
 [100,94,56,5,11,x=>{x.translate(0,14);x.scale(.56,.56);castle(x,'#ffd1e8','#ff9bd2');},'',2], // small castle
 [180,168,90,5,11,x=>{x.translate(0,28);castle(x,'#e8e2fa','#a78bfa');},'',1], // big castle
 // undersea
 [30,20,8,1,12,x=>{x.beginPath();x.moveTo(0,8);x.arc(0,8,13,Math.PI*1.1,Math.PI*1.9);x.closePath();x.fillStyle='#ffc4a8';x.fill();x.lineWidth=2.5;x.strokeStyle=O;x.stroke();for(const q of[-.35,0,.35]){x.beginPath();x.moveTo(0,8);x.lineTo(Math.sin(q)*11,8-Math.cos(q)*11);x.stroke();}},'',12], // shell
 [28,22,8,1,12,x=>{x.lineCap='round';x.beginPath();x.arc(0,0,8,Math.PI*.2,Math.PI*1.3);x.lineWidth=9;x.strokeStyle=O;x.stroke();x.lineWidth=5;x.strokeStyle='#ff9a8a';x.stroke();C(x,-6,-6,1.6,O,0);x.lineWidth=1.5;x.strokeStyle=O;x.beginPath();x.moveTo(-7,-7);x.lineTo(-12,-11);x.stroke();},'w',9], // shrimp
 [30,30,9,1,12,x=>{ST(x,0,0,13,'#ff8a5a',2.5);C(x,0,0,2.5,'#ffd0a0',0);},'',9], // starfish
 [52,26,11,1,12,fish('#ffb13b','#fff'),'w',12], // clownfish
 [52,26,11,1,12,fish('#4a90e2','#bfe8ff'),'w',10], // blue fish
 [24,36,10,1,12,x=>{x.lineCap='round';x.beginPath();x.arc(1,12,4,0,Math.PI*1.5);x.lineWidth=6;x.strokeStyle=O;x.stroke();x.lineWidth=3;x.strokeStyle='#ffb13b';x.stroke();E2(x,1,2,6,9,'#ffb13b');R(x,4,-13,8,4,'#ffb13b',2,2);C(x,0,-10,6,'#ffb13b');C(x,1,-11,1.4,O,0);},'',7], // seahorse
 [32,28,11,1,12,x=>{C(x,-10,6,5,'#ff6b6b',2);C(x,3,-2,10,'#c08bf0');x.beginPath();x.arc(3,-2,5,0,Math.PI*1.5);x.lineWidth=2;x.strokeStyle=O;x.stroke();C(x,-12,1,1.4,O,0);C(x,-8,1,1.4,O,0);},'w',6], // hermit crab
 [26,46,12,1,12,x=>{x.lineCap='round';for(const [w,c] of [[7,O],[4,'#3fa060']]){x.lineWidth=w;x.strokeStyle=c;x.beginPath();x.moveTo(-4,20);x.quadraticCurveTo(-12,4,-4,-6);x.quadraticCurveTo(2,-14,-4,-20);x.moveTo(5,20);x.quadraticCurveTo(12,6,5,-4);x.stroke();}},'',9], // seaweed
  [44,52,15,1,12,x=>{x.lineCap='round';for(const[a,c]of[[-12,'#3fae6a'],[-4,'#5cc97f'],[4,'#2f9a5a'],[12,'#5cc97f']]){x.beginPath();x.moveTo(a*.3,24);x.quadraticCurveTo(a*1.3,0,a,-20);x.lineWidth=7;x.strokeStyle=O;x.stroke();x.lineWidth=4;x.strokeStyle=c;x.stroke();}E2(x,0,22,14,5,'#8a6a4a');},'',6], // sea plant
 [52,34,14,2,12,x=>{for(const s of[-1,1]){C(x,s*18,-10,6,'#ff6b6b',2.5);R(x,s*13-2,4,4,8,'#ff6b6b',1,2);}E2(x,0,0,15,10,'#ff6b6b');face(x,0,0,.9);},'w',6], // crab
 [32,40,13,2,12,x=>{x.lineCap='round';for(let i=-1;i<=1;i++){x.beginPath();x.moveTo(i*7,2);x.quadraticCurveTo(i*7-4,10,i*7,18);x.lineWidth=5;x.strokeStyle=O;x.stroke();x.lineWidth=2.5;x.strokeStyle='#ffb8e0';x.stroke();}x.beginPath();x.arc(0,2,13,Math.PI,0);x.closePath();x.fillStyle='#ff9bd2';x.fill();x.lineWidth=3;x.strokeStyle=O;x.stroke();face(x,0,-3,.8);},'w',6], // jellyfish
 [36,32,14,2,12,x=>{x.lineCap='round';for(let i=-3;i<=3;i++){const a=-Math.PI/2+i*.33;for(const [w,c] of [[7,O],[4,'#ffb13b']]){x.lineWidth=w;x.strokeStyle=c;x.beginPath();x.moveTo(0,6);x.lineTo(Math.cos(a)*15,6+Math.sin(a)*15);x.stroke();}}E2(x,0,8,11,6,'#ff7aa8');},'',6], // anemone
 [34,54,18,2,12,x=>{x.lineWidth=1.5;x.strokeStyle=O;x.beginPath();x.moveTo(-3,-10);x.lineTo(-10,-24);x.moveTo(3,-10);x.lineTo(10,-24);x.stroke();C(x,-10,-14,6,'#e2483b',2.5);C(x,10,-14,6,'#e2483b',2.5);PG(x,[[-7,14],[0,24],[7,14]],'#e2483b',2.5);E2(x,0,2,8,14,'#e2483b');face(x,0,-4,.8);},'',4], // lobster
 [38,42,18,2,12,x=>{for(let i=-3;i<=3;i++)R(x,i*5-2,4,5,16,'#c08bf0',3,2);C(x,0,-4,15,'#c08bf0');face(x,0,-2,1);},'w',4], // octopus
 [58,38,20,2,12,x=>{C(x,-22,0,7,'#9fd67a',2.5);for(const[a,b]of[[-10,-14],[10,-14],[-10,14],[10,14]])E2(x,a,b,6,4,'#9fd67a',2.5);E2(x,0,0,19,15,'#3f9e5a');C(x,0,0,6,'#5cbf73',0);C(x,-24,-2,1.5,O,0);},'w',4], // turtle
 [40,36,16,2,12,chest,'',3], // sunken treasure chest
 [40,52,22,2,12,x=>{x.lineCap='round';for(const[w,c]of[[13,O],[8,'#ff7aa8']]){x.lineWidth=w;x.strokeStyle=c;x.beginPath();x.moveTo(0,22);x.lineTo(0,-6);x.moveTo(0,10);x.lineTo(-14,-14);x.moveTo(0,4);x.lineTo(16,-18);x.moveTo(0,-6);x.lineTo(-2,-24);x.stroke();}},'',6], // coral
 [76,36,30,3,12,x=>{PG(x,[[-26,0],[-38,-10],[-34,0],[-38,10]],'#7fa8d8');PG(x,[[-4,-9],[4,-18],[8,-9]],'#7fa8d8');E2(x,0,0,30,11,'#7fa8d8');E2(x,2,4,22,5,'#dbe8f6',0);E2(x,31,2,6,3,'#7fa8d8',2);C(x,20,-3,2,O,0);x.beginPath();x.arc(24,2,5,.3,1.4);x.lineWidth=2;x.strokeStyle=O;x.stroke();},'w',3], // dolphin
 [90,46,36,3,12,x=>{PG(x,[[-30,0],[-44,-14],[-38,0],[-44,14]],'#8fa0b8');PG(x,[[-6,-12],[2,-26],[10,-12]],'#8fa0b8');E2(x,0,0,36,14,'#8fa0b8');E2(x,4,6,26,6,'#eef2f8',0);C(x,24,-4,2.5,O,0);C(x,26,4,3,'#ffb8d0',0);x.beginPath();x.arc(28,0,6,.5,1.6);x.lineWidth=2.5;x.strokeStyle=O;x.stroke();},'w',2], // friendly shark
 [96,46,42,3,12,x=>{x.translate(0,4);x.lineCap='round';PG(x,[[-36,0],[-52,-14],[-44,0],[-52,14]],'#2a2a3a');PG(x,[[-6,-14],[0,-34],[10,-14]],'#2a2a3a');E2(x,0,0,46,18,'#2a2a3a');E2(x,6,8,32,7,'#f4f4fa',0);E2(x,26,-8,7,3.5,'#f4f4fa',0);C(x,28,-8,1.8,O,0);C(x,34,4,3,'#ffb8d0',0);x.beginPath();x.arc(36,0,6,.5,1.6);x.lineWidth=2.5;x.strokeStyle='#f4f4fa';x.stroke();},'w',2], // friendly killer whale
 [92,50,40,3,12,x=>{R(x,-4,-24,14,14,'#ffd84a',3,3);E2(x,0,0,34,15,'#ffd84a');for(let i=-16;i<=16;i+=16)C(x,i,0,5,'#bfe8ff',2.5);PG(x,[[-34,-2],[-44,-10],[-44,8]],'#ffb13b');},'w',2], // submarine
 [158,90,72,5,12,x=>{x.translate(0,14);PG(x,[[-70,-10],[60,-22],[78,0],[60,22],[-70,10]],'#a6744a');x.lineWidth=2;x.strokeStyle='#7a5434';for(let i=-50;i<60;i+=18){x.beginPath();x.moveTo(i,-14);x.lineTo(i,14);x.stroke();}R(x,-2,-50,6,60,'#7a5434',1,2.5);PG(x,[[4,-46],[30,-24],[4,-22]],'#f4ecd8',2.5);C(x,-38,0,6,'#5aa0c8',2.5);},'',1], // shipwreck
 [180,112,92,5,12,x=>{x.translate(0,16);PG(x,[[-60,0],[-86,-18],[-80,0],[-86,18]],'#5a8fe0');E2(x,0,0,64,34,'#5a8fe0');E2(x,6,12,48,18,'#cfe6ff',0);C(x,36,-8,3.5,O,0);x.beginPath();x.arc(40,6,8,.2,1.3);x.lineWidth=3;x.strokeStyle=O;x.stroke();C(x,46,4,4,'#ffb8d0',0);for(const[a,b,r]of[[22,-44,5],[30,-58,7],[18,-66,4]])C(x,a,b,r,'#e6f6ff',2);},'w',1], // friendly whale
];
const fi=(t,sz)=>ITEMS.findIndex(it=>it[4]==t&&it[2]==sz);
const ROCKET=ITEMS.findIndex(it=>it[4]==10&&it[2]==30),YIPF=ITEMS.map(it=>it[6]==='wy');
// themes: [ground, ground spots, path, path dash, name colour]
const TH=[null,['#b9b3d6','#a7a0cc','#262b5e','#ffd84a'],['#9fe08f','#8fd47f','#ffe6b0','#fff'],['#f2d79b','#e4c584','#3f8fd0','#8fc8f0']];

// ---------- spinning rims: prerendered rings, rotated anticlockwise with a transform ----------
function rimRing(x,R,sk){const ro=R*1.2,mid=R*1.1,lw=Math.max(2.5,R*.05);
 x.beginPath();x.arc(0,0,ro,0,TAU);x.arc(0,0,R,0,TAU,true);x.fillStyle=sk[1];x.fill();
 x.lineCap='butt';x.lineWidth=R*.12;x.strokeStyle=sk[0];const n=14,seg=TAU/n;
 for(let i=0;i<n;i++){x.beginPath();x.arc(0,0,mid,i*seg,i*seg+seg*.55);x.stroke();}
 C(x,ro*Math.cos(0)*.0+mid,0,R*.07,sk[1]==='#fff'||sk[1]==='#ffffff'?'#ffd23f':'#fff',0); // one bright marker dot
 if(sk[4]==='g'){for(let i=0;i<7;i++){const a=i*TAU/7+.2;star(x,Math.cos(a)*mid,Math.sin(a)*mid,R*.075,'#ffd84a');}const a=TAU*.6;x.save();x.translate(Math.cos(a)*mid,Math.sin(a)*mid);x.rotate(a+Math.PI);x.scale(R/260,R/260);ITEMS[ROCKET][5](x);x.restore();}
 if(sk[4]==='b'){for(let i=0;i<10;i++){const a=i*TAU/10+.3;C(x,Math.cos(a)*mid,Math.sin(a)*mid,R*.045,'#fff',0);}}
 x.lineWidth=lw;x.strokeStyle=O;x.beginPath();x.arc(0,0,ro,0,TAU);x.stroke();x.beginPath();x.arc(0,0,R,0,TAU);x.stroke();}
const RIM_R=[45,90,190];let RIMS=[],PRIMS=[];
function mkRim(sk,R,sc){const sp=mk(R*2.5,R*2.5,x=>rimRing(x,R,sk),sc);sp.R=R;return sp;}
function bakeRims(){RIMS=RIM_R.map(R=>mkRim(SKINS[P.skin],R,K));}
function bakePickerRims(){PRIMS=SKINS.map(sk=>mkRim(sk,50,U));}
function holeInner(x,a,b,r,tilt,sk){x.save();x.translate(a,b);x.scale(1,tilt);C(x,0,0,r,sk[0],0);x.beginPath();x.arc(0,0,r,Math.PI,TAU);x.fillStyle=sk[3];x.fill();x.restore();}
// draw rim sprite at device position (dx,dy), radius r (world units * f), angle an (negative = anticlockwise on screen)
function drawRim(sp,dx,dy,f,tilt,an){const c=Math.cos(an)*f,s2=Math.sin(an)*f;g.setTransform(c,s2*tilt,-s2,c*tilt,dx,dy);g.drawImage(sp.c,-sp.ox,-sp.oy);}
const SPIN=1.3;
const SP={};
function mk(w,h,fn,sc){sc=sc||K;const pad=5,c=document.createElement('canvas');c.width=Math.ceil((w+pad*2)*sc);c.height=Math.ceil((h+pad*2)*sc);
 const x=c.getContext('2d');x.setTransform(sc,0,0,sc,c.width/2,c.height/2);x.lineJoin='round';x.lineCap='round';fn(x);return {c:c,ox:Math.round(c.width/2),oy:Math.round(c.height/2)};}
function bake(){
 SP.person=PCOL.map(f=>mk(20,30,x=>person(x,0,0,f)));
 SP.bin=mk(16,20,x=>R(x,-7,-9,14,18,'#2fae8e',3,2.5));
 SP.bench=mk(34,12,x=>R(x,-16,-5,32,10,'#c97a3a',3,2.5));
 SP.tree=mk(36,40,x=>tree(x,0,3));
 SP.carH=CCOL.map(f=>mk(52,30,x=>car(x,f)));
 SP.carV=CCOL.map(f=>mk(30,52,x=>{x.rotate(Math.PI/2);car(x,f);}));
 SP.bus=mk(124,40,x=>bus(x));
 SP.house=HOUSES.map(h=>mk(h[0],h[1],x=>bld(x,-h[0]/2,-h[1]/2,h[0],h[1],Math.round(h[1]*.28),h[2],h[3])));
 SP.yip=['#ffd23f','#ff7cb8','#8fe3ff'].map(f=>mk(300,80,x=>T(x,'YIPPEE!',0,0,64,f)));
 SP.item=ITEMS.map(it=>mk(it[0],it[1],x=>it[5](x,0)));SP.itemB=ITEMS.map(it=>it[4]==6?mk(it[0],it[1],x=>it[5](x,1)):null);
 bakeRims();bakePickerRims();
 SP.tl=[0,1,2].map(k=>mk(16,44,x=>{R(x,-2,2,4,18,'#4a4e63',2,1.5);R(x,-7,-20,14,26,'#2b2140',4,2.5);C(x,0,-14,3.2,k==0?'#ff4d4d':'#5a3a3a',0);C(x,0,-7,3.2,k==1?'#ffb21e':'#5a4a2a',0);C(x,0,0,3.2,k==2?'#3fdc6a':'#2a4a35',0);}));
 SP.arrow=mk(80,64,x=>{PG(x,[[-30,-14],[6,-14],[6,-28],[34,0],[6,28],[6,14],[-30,14]],'#ff6b6b',4);});
 SP.bub=[6,9,13].map(r=>mk(r*2+4,r*2+4,x=>{C(x,0,0,r,'#e6f6ff',2.5);C(x,-r*.35,-r*.35,r*.25,'#fff',0);}));
 SP.pop=[1,2,3,5].map(n=>mk(110,36,x=>{R(x,-52,-16,104,32,'#fff',16,3);coin(x,-34,0,10);T(x,'+'+n,10,0,24,'#f5b301');}));
 for(let i=0;i<NE;i++)assignSprite(E[i]);}
let hudC=null,pauseC=null,hudDirty=1;
function bakeHud(){const s=hs*dpr;hudC=document.createElement('canvas');hudC.width=Math.ceil(230*s);hudC.height=Math.ceil(170*s);
 pauseC=document.createElement('canvas');pauseC.width=pauseC.height=Math.ceil(80*s);const x=pauseC.getContext('2d');x.scale(s,s);
 R(x,8,8,64,64,'#fff',32,4);R(x,28,26,8,28,O,3,0);R(x,44,26,8,28,O,3,0);}
function drawHud(){const x=hudC.getContext('2d'),s=hs*dpr;x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,hudC.width,hudC.height);x.setTransform(s,0,0,s,0,0);
 R(x,20,18,190,64,'#fff',32,4);hole(x,60,50,16,.9,SKINS[P.skin]);T(x,''+sizeN(),145,50,34,'#7b3fe4');
 const p=L.total?1-L.left/L.total:0;R(x,20,92,190,14,'#e5ddf5',7,3);if(p>.04)R(x,20,92,190*p,14,'#7b3fe4',7,3);
 R(x,20,114,120,46,'#fff',23,4);C(x,46,137,13,'#ffd23f',3);C(x,46,137,5,O,0);T(x,''+L.left,96,138,26,L.left<=3?'#ff6b6b':'#7b3fe4');}
// ---------- entities (preallocated pool) ----------
const MAXE=170,E=[];for(let i=0;i<MAXE;i++)E.push({t:0,v2:0,spr:null,x:0,y:0,s:0,c:0,alive:0,fall:0,fx:0,fy:0,mv:0,a:0,b:0,v:0,ph:0,hb:0});
let NE=0;const ORDER=new Int16Array(MAXE);
const COIN=[1,1,1,2,3,5,5],SIZE=[9,10,17,19,34,64,0];
function assignSprite(e){const t=e.t;if(t==8){e.spr=SP.tl[e.v2];return;}if(t==7){e.spr=SP.item[e.v2];return;}e.spr=t==0?SP.person[e.v2]:t==1?SP.bin:t==2?SP.bench:t==3?SP.tree:t==4?(e.mv==1?SP.carH[e.v2]:SP.carV[e.v2]):t==5?SP.bus:SP.house[e.v2];}
// spatial grid (counting sort into typed arrays; no allocation)
const GC=128,GX=WW/GC,GY=WH/GC,GN=GX*GY,gCount=new Int16Array(GN+1),gStart=new Int16Array(GN+1),gItems=new Int16Array(MAXE),eCell=new Int16Array(MAXE);
function gridBuild(){gCount.fill(0);for(let i=0;i<NE;i++){const e=E[i];if(!e.alive||e.fall){eCell[i]=-1;continue;}let cx=(e.x/GC)|0,cy=(e.y/GC)|0;cx=cx<0?0:cx>=GX?GX-1:cx;cy=cy<0?0:cy>=GY?GY-1:cy;const c=cy*GX+cx;eCell[i]=c;gCount[c]++;}
 let s=0;for(let c=0;c<GN;c++){gStart[c]=s;s+=gCount[c];gCount[c]=0;}gStart[GN]=s;
 for(let i=0;i<NE;i++){const c=eCell[i];if(c<0)continue;gItems[gStart[c]+gCount[c]++]=i;}}
// pools for pop-ups
const BB=[];for(let i=0;i<10;i++)BB.push({on:0,t:0,x:0,y:0,s:0});
const YP=[],CP=[];for(let i=0;i<3;i++)YP.push({on:0,t:0,x:0,y:0,s:0});for(let i=0;i<5;i++)CP.push({on:0,t:0,x:0,y:0,s:0});
function spawn(pool,x,y,s){let best=pool[0];for(let i=0;i<pool.length;i++){if(!pool[i].on){best=pool[i];break;}if(pool[i].t>best.t)best=pool[i];}best.on=1;best.t=0;best.x=x;best.y=y;best.s=s;}
// ---------- level ----------
const LV=[{tg:58,n:[24,8,6,12,6,0,3],mc:4,par:60,it:[14,2,0,1,6]},{tg:80,n:[26,8,8,14,10,1,6],mc:7,par:80,it:[16,3,0,2,7]},{tg:100,n:[28,8,8,16,12,1,8],mc:8,par:100,it:[18,4,1,2,8]},{tg:122,n:[28,8,8,16,14,2,10],mc:8,par:120,it:[18,5,1,3,9]},{tg:150,n:[28,8,8,16,14,2,12],mc:9,par:140,it:[20,5,2,3,10]}];
const HR=[[360,470],[860,970]],VR=[[560,670],[1290,1400]];
const BLOCKS=[];{const xs=[[0,548],[682,1278],[1412,2048]],ys=[[0,348],[482,848],[982,1280]];for(const a of xs)for(const b of ys)BLOCKS.push([a[0]+16,b[0]+16,a[1]-16,b[1]-16]);}
const DECO=new Float32Array(120);let ND=0;
const L={n:0,tg:58,t:0,earned:0,gain:.5,winT:0,done:0};
const hole_={x:0,y:0,r:30,rt:30};
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function buildLevel(n){const cfg=LV[Math.min(n,4)],r=rng(1234+n*777),boxes=[[1340,210,1540,390],[860,540,1100,740]];NE=0;
 function free(x0,y0,x1,y1){for(const b of boxes)if(x0<b[2]+8&&x1>b[0]-8&&y0<b[3]+8&&y1>b[1]-8)return false;return true;}
 function place(w,h){for(let k2=0;k2<80;k2++){const B=BLOCKS[(r()*BLOCKS.length)|0];if(B[2]-B[0]<w||B[3]-B[1]<h)continue;const x=B[0]+w/2+r()*(B[2]-B[0]-w),y=B[1]+h/2+r()*(B[3]-B[1]-h);
  if(free(x-w/2,y-h/2,x+w/2,y+h/2)){boxes.push([x-w/2,y-h/2,x+w/2,y+h/2]);return [x,y];}}return null;}
 function add(t,x,y,v2,mv){const e=E[NE++];e.t=t;e.x=x;e.y=y;e.v2=v2;e.mv=mv;e.alive=1;e.fall=0;e.c=COIN[t];e.s=SIZE[t];e.hb=0;return e;}
 const tier=t=>{const a=[];ITEMS.forEach((it,i)=>{if(it[4]==t)a.push(i);});return a;};
 if(n<5){
 // traffic lights on two corners of every junction (cycle green/amber/red)
 for(const h of HR)for(const v of VR)for(const q of [[v[0]-22,h[0]-30],[v[1]+22,h[1]+26]]){const e=add(8,q[0],q[1],2,0);e.s=11;e.c=1;e.hb=22;e.fx=r()*9;boxes.push([q[0]-10,q[1]-24,q[0]+10,q[1]+24]);}
 // houses: smallest designs for early levels
 const hs2=[];for(let i=0;i<cfg.n[6];i++)hs2.push(Math.min(7,Math.floor(i*(n+4)/cfg.n[6]+ (n>=3?1:0))));
 for(const d of hs2){const h=HOUSES[d],p=place(h[0],h[1]);if(p){const e=add(6,p[0],p[1],d,0);e.s=Math.round(.48*Math.max(h[0],h[1]));e.hb=h[1]/2;}}
 for(let tt=2;tt>=0;tt--){const pool=tier(tt);for(let i=0;i<cfg.it[tt];i++){const id=pool[(i*7+n*3)%pool.length],it=ITEMS[id],p=place(it[0],it[1]);if(p){const e=add(7,p[0],p[1],id,0);e.s=it[2];e.c=it[3];e.hb=it[1]/2;}}}
 {const fp=tier(9);for(let i=0;i<4;i++){const id=fp[i%2],it=ITEMS[id],p=place(it[0],it[1]);if(p){const e=add(7,p[0],p[1],id,0);e.s=it[2];e.c=it[3];e.hb=it[1]/2;}}}
 const sz=[0,[16,20],[34,12],[36,40]];
 for(let t=3;t>=1;t--)for(let i=0;i<cfg.n[t];i++){const p=place(sz[t][0],sz[t][1]);if(p)add(t,p[0],p[1],0,0);}
 {const pool=tier(4);for(let i=0;i<cfg.it[4];i++){const id=pool[(i+n)%pool.length],it=ITEMS[id],span=80+r()*60,q=place(span+it[0],it[1]+6);if(!q)continue;const e=add(7,0,q[1],id,2);e.s=it[2];e.c=it[3];e.hb=it[1]/2;e.ph=0;e.a=q[0]-span/2;e.b=q[0]+span/2;e.v=(10+r()*8)/(e.b-e.a);e.fx=r();}}
 // people: half stand in blocks, half walk on pavements
 for(let i=0;i<cfg.n[0];i++){if(i%2){const p=place(20,30);if(p)add(0,p[0],p[1],i%5,0);}else{
  const e=add(0,0,0,i%5,2);const hz=r()<.6;const seg=r()*1500+150;if(hz){const R2=HR[(r()*2)|0];e.y=r()<.5?R2[0]-6:R2[1]+6;e.a=seg;e.b=seg+120+r()*160;e.ph=0;}else{const R2=VR[(r()*2)|0];e.x=r()<.5?R2[0]-6:R2[1]+6;e.a=r()*1000+120;e.b=e.a+120+r()*120;e.ph=1;}
  e.v=(20+r()*14)/(e.b-e.a);e.fx=r();}}
 // moving vehicles on 4 horizontal lanes, evenly spaced so they never touch
 const lanes=[[HR[0][0]+28,-1],[HR[0][0]+82,1],[HR[1][0]+28,-1],[HR[1][0]+82,1]];const veh=[];
 for(let i=0;i<cfg.n[5];i++)veh.push(5);for(let i=0;i<cfg.mc;i++)veh.push(4);{const mv=tier(3);for(let i=0;i<cfg.it[3];i++)veh.splice(i*3+1,0,100+mv[i%mv.length]);const em=tier(6);for(let i=0;i<[1,1,2,2,3][n];i++)veh.splice(i*4+2,0,100+em[(i+n)%em.length]);}
 const per=[[],[],[],[]];{const fm=tier(8),nf=[2,2,3,3,4][n];veh.forEach((t,i)=>per[nf?i%3:i%4].push(t));for(let i=0;i<nf;i++)per[3].push(100+fm[(i+n*2)%fm.length]);}
 per.forEach((list,li)=>{const Ln=WW+300,sp=(li==3?40:70+li*9)*lanes[li][1];list.forEach((t,j)=>{const e=t>=100?add(7,0,lanes[li][0],t-100,1):add(t,0,lanes[li][0],t==4?(j+li)%5:0,1);if(t>=100){const it=ITEMS[t-100];e.s=it[2];e.c=it[3];}e.a=Ln*j/list.length+r()*40;e.v=sp;});});
 // parked cars on the vertical roads
 for(let i=0;i<cfg.n[4]-cfg.mc;i++){const R2=VR[i%2],x=R2[0]+(i%4<2?28:82);let y;for(let q=0;q<30;q++){y=60+r()*1160;if(!(y>HR[0][0]-40&&y<HR[0][1]+40)&&!(y>HR[1][0]-40&&y<HR[1][1]+40)&&free(x-15,y-26,x+15,y+26))break;}boxes.push([x-15,y-26,x+15,y+26]);add(4,x,y,i%5,0);}
 }else{
  // Space / Magical / Undersea: the world's ladder, biggest first; walkers wander on clear strips
  const w=(n/5)|0,kk=n%5,ids=tier(9+w).sort((a,b)=>ITEMS[b][2]-ITEMS[a][2]);
  ids.forEach((id,j)=>{const it=ITEMS[id],cnt=j==0?1:Math.max(1,Math.round(it[7]*(.76+.06*kk)));
   for(let i=0;i<cnt;i++){if(it[6]&&it[6][0]==='w'){const span=70+r()*90,q=place(span+it[0],it[1]+6);if(!q)continue;const e=add(7,0,q[1],id,2);e.s=it[2];e.c=it[3];e.hb=it[1]/2;e.ph=0;e.a=q[0]-span/2;e.b=q[0]+span/2;e.v=(9+r()*9)/(e.b-e.a);e.fx=r();}
    else{const q=place(it[0],it[1]);if(q){const e=add(7,q[0],q[1],id,0);e.s=it[2];e.c=it[3];e.hb=it[1]/2;}}}});}
 ND=0;for(let i=0;i<40;i++){const p=place(30,30);if(p){DECO[ND*3]=p[0];DECO[ND*3+1]=p[1];DECO[ND*3+2]=10+r()*14;ND++;boxes.pop();}}
 for(let i=0;i<NE;i++)assignSprite(E[i]);
 // draw order: statics by bottom edge, then walkers, then traffic
 const idx=[];for(let i=0;i<NE;i++)idx.push(i);const lay=e=>e.mv==1?2:e.mv==2?1:0;idx.sort((a,b)=>lay(E[a])-lay(E[b])||(E[a].y+E[a].hb)-(E[b].y+E[b].hb));idx.forEach((v,i)=>ORDER[i]=v);
 // growth tuned so eating everything gives 1.3x the target
 const ss=[];for(let i=0;i<NE;i++)ss.push(E[i].s);ss.sort((a,b)=>a-b);
 // the target always sits above the biggest building, so everything is swallowable before the level ends
 // growth: r^2 grows by gain*s^2 per item, so the final size does not depend on eating order.
 // gain is the smallest value that lets an ascending run reach the biggest item with room to spare.
 const r0=(P.rw[0]&&n>=5)?60:30,maxS=ss[ss.length-1],tg=Math.ceil(maxS/.95)+14,rest=ss.filter(v=>v<maxS-.5);L.maxS=maxS;
 const sim=gn=>{let rr=r0;for(const s of rest){if(s>=rr*.95)return 0;rr=Math.min(190,Math.sqrt(rr*rr+gn*s*s));}return rr;};
 let lo=.02,hi=8;for(let q=0;q<40;q++){const m=(lo+hi)/2;if(sim(m)>=tg)hi=m;else lo=m;}
 L.w=(n/5)|0;L.total=L.left=NE;L.par=Math.round(25+NE*.5);L.worldDone=0;
 L.gain=hi;L.n=n;L.tg=tg;L.t=0;L.earned=0;L.winT=0;L.done=0;hole_.x=980;hole_.y=640;hole_.r=hole_.rt=r0;for(const b of BB)b.on=0;
 for(const p of YP)p.on=0;for(const p of CP)p.on=0;moveAll();}
function moveAll(){const t=L.t;for(let i=0;i<NE;i++){const e=E[i];if(e.mv==1){const Ln=WW+300;let p=(e.a+e.v*t)%Ln;if(p<0)p+=Ln;e.x=p-150;}
 else if(e.mv==2){let q=(e.fx+e.v*t)%2;const f=q<1?q:2-q,pos=e.a+(e.b-e.a)*f;if(e.ph)e.y=pos;else e.x=pos;}}}
function sizeN(){return 1+Math.floor((hole_.r-30)/10);}
// ---------- input ----------
const joy={on:0,id:-1,ox:0,oy:0,x:0,y:0};
let state='map',dirty=1,lastN=0,lastP=-1;
// ---------- audio (tiny synth, no files) ----------
let ac=null,sndT=0;
function au(){if(!ac){try{ac=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}}if(ac&&ac.state==='suspended')ac.resume();}
function tone(f1,f2,d,type,vol,dl){if(!ac)return;const t=ac.currentTime+(dl||0),o=ac.createOscillator(),gn=ac.createGain();o.type=type;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+d);gn.gain.setValueAtTime(0.0001,t);gn.gain.exponentialRampToValueAtTime(vol,t+.02);gn.gain.exponentialRampToValueAtTime(0.0001,t+d);o.connect(gn).connect(ac.destination);o.start(t);o.stop(t+d+.02);}
function sYip(){tone(700,1000,.13,'triangle',.18);tone(950,1500,.22,'triangle',.18,.13);}
function sGulp(big){tone(big?260:420,big?90:180,big?.25:.12,'sine',.22);}
function sHappy(){[523,659,784,1047].forEach((f,i)=>tone(f,f*1.01,.18,'triangle',.16,i*.12));}
// ---------- update ----------
function step(dt){if(L.done)return;L.t+=dt;
 if(joy.on){const dx=joy.x-joy.ox,dy=joy.y-joy.oy,d=Math.sqrt(dx*dx+dy*dy),JR=70*hs;
  if(d>JR*1.4){joy.ox=joy.x-dx/d*JR*1.4;joy.oy=joy.y-dy/d*JR*1.4;}
  if(d>5){const sp=Math.min(1,(d-5)/JR)*(340+hole_.r*1.2);hole_.x+=dx/d*sp*dt;hole_.y+=dy/d*sp*dt;}}
 const hr=hole_.r;hole_.x=Math.max(hr*.5,Math.min(WW-hr*.5,hole_.x));hole_.y=Math.max(hr*.4,Math.min(WH-hr*.4,hole_.y));
 if(hole_.r<hole_.rt)hole_.r=Math.min(hole_.rt,hole_.r+dt*(20+(hole_.rt-hole_.r)*3));
 moveAll();const fl=((L.t*3)|0)&1;for(let i=0;i<NE;i++){const e=E[i];if(!e.alive)continue;if(e.t==7&&e.mv==1&&!e.fall){const it=SP.itemB[e.v2];if(it){const sp=fl?it:SP.item[e.v2];if(e.spr!==sp)e.spr=sp;}continue;}if(e.t!==8)continue;const ph=(L.t+e.fx)%9,k2=ph<4?2:ph<5?1:0;if(k2!==e.v2){e.v2=k2;e.spr=SP.tl[k2];}}gridBuild();
 const r=hole_.r,hx=hole_.x,hy=hole_.y;let x0=((hx-r)/GC)|0,x1=((hx+r)/GC)|0,y0=((hy-r)/GC)|0,y1=((hy+r)/GC)|0;
 x0=x0<0?0:x0;y0=y0<0?0:y0;x1=x1>=GX?GX-1:x1;y1=y1>=GY?GY-1:y1;
 for(let cy=y0;cy<=y1;cy++)for(let cx=x0;cx<=x1;cx++){const c=cy*GX+cx;for(let j=gStart[c],je=gStart[c]+gCount[c];j<je;j++){const e=E[gItems[j]];
  if(e.s>=r*.95)continue;const dx=e.x-hx,dy=(e.y-hy)/0.75;if(dx*dx+dy*dy<r*r*.8)swallow(e);}}
 for(let i=0;i<NE;i++){const e=E[i];if(e.fall){e.fall+=dt;if(e.fall>=.5){e.fall=0;e.alive=0;}}}
 if(P.rw[2]){const mr=r*2.4,mr2=mr*mr,lim=r*.6,sp=(40+r*.4)*dt;for(let i=0;i<NE;i++){const e=E[i];if(!e.alive||e.fall||e.mv||e.s>=lim)continue;const dx=hx-e.x,dy=hy-e.y,d2=dx*dx+dy*dy;if(d2<mr2&&d2>1){const d=Math.sqrt(d2);e.x+=dx/d*sp;e.y+=dy/d*sp;}}}
 for(const b of BB)if(b.on){b.t+=dt;if(b.t>1.4)b.on=0;}
 L.arrow=-1;if(L.left>0&&L.left<=3){let bd=1e12;for(let i=0;i<NE;i++){const e=E[i];if(!e.alive||e.fall)continue;const dx=e.x-hx,dy=e.y-hy,d=dx*dx+dy*dy;if(d<bd){bd=d;L.arrow=i;}}}
 for(const p of YP)if(p.on){p.t+=dt;if(p.t>1.2)p.on=0;}for(const p of CP)if(p.on){p.t+=dt;if(p.t>1)p.on=0;}
 const n=sizeN(),pp=L.left;if(n!==lastN||pp!==lastP){lastN=n;lastP=pp;hudDirty=1;}
 if(L.left<=0&&!L.winT)L.winT=L.t;if(L.winT&&L.t-L.winT>.9)win();}
function swallow(e){e.fall=.0001;e.fx=e.x;e.fy=e.y;const rt=hole_.rt;hole_.rt=Math.min(190,Math.sqrt(rt*rt+L.gain*e.s*e.s));
 P.coins+=e.c;L.earned+=e.c;spawn(CP,e.x,e.y-20,[1,2,3,5].indexOf(e.c));
 L.left--;if(P.skin===9)for(let i=0;i<3;i++)spawn(BB,hole_.x+(i-1)*hole_.r*.4,hole_.y-hole_.r*.2,i);
 // only people cheer YIPPEE; everything else gets a soft per-type sound
 const now=performance.now(),tr=e.t==7?ITEMS[e.v2][4]:-1;if(e.t==0||(e.t==7&&YIPF[e.v2])){spawn(YP,e.x,e.y-50,(Math.random()*3)|0);if(now-sndT>90){sYip();sndT=now;}}
 else if(now-sndT>70){sndT=now;if(tr==4)tone(880,1250,.09,'sine',.12);else if(tr==12)tone(380,820,.12,'sine',.14);else if(tr==11)tone(1180,1580,.12,'triangle',.1);else if(tr==10)tone(620,320,.12,'square',.05);else sGulp(e.s>30);}}
function win(){L.done=1;const st=L.t<=L.par?3:L.t<=L.par*1.7?2:1;
 if(L.n%5==4){const w=(L.n/5)|0;L.worldDone=1;if(!P.rw[w]){P.rw[w]=1;L.newRw=1;}else L.newRw=0;if(w==1)P.owned[8]=1;if(w==3)P.owned[9]=1;}L.stars=st;P.stars[L.n]=Math.max(P.stars[L.n],st);P.coins+=st*5;L.earned+=st*5;saveP();clearRun();state='win';dirty=1;joy.on=0;sHappy();}
// ---------- run save / resume ----------
let saveT=0;
function saveRun(){if(state!=='play'&&state!=='pause')return;let d='';for(let i=0;i<NE;i++)d+=(E[i].alive&&!E[i].fall)?'1':'0';
 try{localStorage.setItem(RK,JSON.stringify({n:L.n,t:L.t,x:hole_.x,y:hole_.y,r:hole_.rt,e:L.earned,d:d}));}catch(e){}saveP();}
function clearRun(){try{localStorage.removeItem(RK);}catch(e){}}
function resumeRun(){let s=null;try{s=JSON.parse(localStorage.getItem(RK));}catch(e){}if(!s||!(s.n>=0&&s.n<20))return false;
 buildLevel(s.n);L.t=s.t;hole_.x=s.x;hole_.y=s.y;hole_.r=hole_.rt=s.r;L.earned=s.e;for(let i=0;i<NE&&i<s.d.length;i++)if(s.d[i]==='0'){E[i].alive=0;L.left--;}moveAll();
 hudDirty=1;state='pause';dirty=1;return true;}
// ---------- render: gameplay ----------
let camX=0,camY=0;
function ground(x0,y0,x1,y1){if(L.w){const t=TH[L.w];g.fillStyle=t[0];g.fillRect(x0,y0,x1-x0,y1-y0);g.fillStyle=t[1];for(let i=0;i<ND;i++){const x=DECO[i*3],y=DECO[i*3+1],r=DECO[i*3+2];if(x+r<x0||x-r>x1||y+r<y0||y-r>y1)continue;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}
  g.fillStyle=t[2];for(const h of HR)g.fillRect(x0,h[0],x1-x0,h[1]-h[0]);for(const v of VR)g.fillRect(v[0],y0,v[1]-v[0],y1-y0);
  // space: starry gaps; magical: sparkle dots on the paths; undersea: lighter ripples in the deep channels
  g.fillStyle=t[3];const st=L.w==3?[24,4]:[5,5];for(const h of HR)for(let x=Math.floor(x0/46)*46;x<x1;x+=46){const j=(x*7919)%110;g.fillRect(x,h[0]+j,st[0],st[1]);}
  for(const v of VR)for(let y=Math.floor(y0/46)*46;y<y1;y+=46){const j=(y*7919)%110;g.fillRect(v[0]+j,y,st[0],st[1]);}return;}
 g.fillStyle='#8fd16a';g.fillRect(x0,y0,x1-x0,y1-y0);
 g.fillStyle='#82c65e';for(let i=0;i<ND;i++){const x=DECO[i*3],y=DECO[i*3+1],r=DECO[i*3+2];if(x+r<x0||x-r>x1||y+r<y0||y-r>y1)continue;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}
 g.fillStyle='#d9d4c7';for(const h of HR)g.fillRect(x0,h[0]-12,x1-x0,h[1]-h[0]+24);for(const v of VR)g.fillRect(v[0]-12,y0,v[1]-v[0]+24,y1-y0);
 g.fillStyle='#5b5f73';for(const h of HR)g.fillRect(x0,h[0],x1-x0,h[1]-h[0]);for(const v of VR)g.fillRect(v[0],y0,v[1]-v[0],y1-y0);
 g.fillStyle='#fff';
 for(const h of HR){const yy=h[0]+52;for(let x=Math.floor(x0/70)*70+10;x<x1;x+=70){let skip=0;for(const v of VR)if(x+36>v[0]-14&&x<v[1]+14)skip=1;if(!skip)g.fillRect(x,yy,36,6);}}
 for(const v of VR){const xx=v[0]+52;for(let y=Math.floor(y0/70)*70+10;y<y1;y+=70){let skip=0;for(const h of HR)if(y+36>h[0]-14&&y<h[1]+14)skip=1;if(!skip)g.fillRect(xx,y,6,36);}}
 for(const h of HR)for(const v of VR){const top=h[0]-30;if(v[1]<x0||v[0]>x1||h[0]<y0||top>y1)continue;for(let i=0;i<6;i++)g.fillRect(v[0]+8+i*17,top,10,26);}}
function render(){
 camX=viewW>=WW?(WW-viewW)/2:Math.max(0,Math.min(WW-viewW,hole_.x-viewW/2));camY=viewH>=WH?(WH-viewH)/2:Math.max(0,Math.min(WH-viewH,hole_.y-viewH/2));
 const cxd=Math.round(camX*K),cyd=Math.round(camY*K),wx0=cxd/K,wy0=cyd/K,wx1=wx0+viewW,wy1=wy0+viewH;
 g.setTransform(K,0,0,K,-cxd,-cyd);ground(wx0-2,wy0-2,wx1+2,wy1+2);
 g.lineJoin='round';{const r=hole_.r;let sp=RIMS[2];for(let i=0;i<3;i++)if(RIMS[i].R>=r){sp=RIMS[i];break;}drawRim(sp,hole_.x*K-cxd,hole_.y*K-cyd,r/sp.R,TILT,-L.t*SPIN);g.setTransform(K,0,0,K,-cxd,-cyd);holeInner(g,hole_.x,hole_.y,r,TILT,SKINS[P.skin]);}
 // falling things, clipped to the hole
 let anyFall=0;for(let i=0;i<NE;i++)if(E[i].fall){anyFall=1;break;}
 if(anyFall){g.save();g.setTransform(1,0,0,1,0,0);const hx=hole_.x*K-cxd,hy=hole_.y*K-cyd;g.beginPath();g.ellipse(hx,hy,hole_.r*K,hole_.r*TILT*K,0,0,TAU);g.clip();
  for(let i=0;i<NE;i++){const e=E[i];if(!e.fall)continue;const p=e.fall/.5,ez=p*p,px=(e.fx+(hole_.x-e.fx)*ez)*K-cxd,py=(e.fy+(hole_.y+hole_.r*.2-e.fy)*ez+p*hole_.r*.3)*K-cyd,sc=1-.75*p,an=(i&1?2:-2)*p,co=Math.cos(an)*sc,si=Math.sin(an)*sc;
   g.setTransform(co,si,-si,co,px,py);g.drawImage(e.spr.c,-e.spr.ox,-e.spr.oy);}
  g.restore();}
 g.setTransform(1,0,0,1,0,0);
 for(let j=0;j<NE;j++){const e=E[ORDER[j]];if(!e.alive||e.fall)continue;const s=e.spr,px=Math.round(e.x*K)-cxd-s.ox,py=Math.round(e.y*K)-cyd-s.oy;
  if(px>cv.width||py>cv.height||px+s.c.width<0||py+s.c.height<0)continue;g.drawImage(s.c,px,py);}
 for(const p of CP)if(p.on&&p.s>=0){const s=SP.pop[p.s];g.globalAlpha=p.t>.6?Math.max(0,(1-p.t)/.4):1;g.drawImage(s.c,Math.round(p.x*K)-cxd-s.ox,Math.round((p.y-p.t*40)*K)-cyd-s.oy);}
 g.globalAlpha=1;
 for(const p of YP)if(p.on){const s=SP.yip[p.s],sc=p.t<.25?.5+2*p.t:1;g.globalAlpha=p.t>.8?Math.max(0,(1.2-p.t)/.4):1;
  g.setTransform(sc,0,0,sc,Math.round(p.x*K)-cxd,Math.round((p.y-p.t*30)*K)-cyd);g.drawImage(s.c,-s.ox,-s.oy);}
 g.globalAlpha=1;
 for(const b of BB)if(b.on){const sp=SP.bub[b.s];g.globalAlpha=b.t>1?Math.max(0,(1.4-b.t)/.4):1;g.setTransform(1,0,0,1,0,0);g.drawImage(sp.c,Math.round((b.x+Math.sin(b.t*7+b.s)*8)*K)-cxd-sp.ox,Math.round((b.y-b.t*90)*K)-cyd-sp.oy);}
 g.globalAlpha=1;g.setTransform(1,0,0,1,0,0);
 // last few items: a soft bouncing arrow (above it on screen, or at the screen edge pointing to it)
 if(L.arrow>=0){const e=E[L.arrow],px=e.x*K-cxd,py=e.y*K-cyd,W=cv.width,H=cv.height,m=70*dpr*hs,bo=Math.abs(Math.sin(L.t*5))*12*dpr*hs,sc=hs*dpr/K*K/dpr;let ax,ay,an;
  if(px>m*.5&&px<W-m*.5&&py>m*1.6&&py<H-m*.5){an=Math.PI/2;ax=px;ay=py-(e.hb+30)*K-bo;}
  else{const cx=W/2,cy=H/2,dx=px-cx,dy=py-cy;an=Math.atan2(dy,dx);const tx=dx?((dx>0?W-m:m)-cx)/dx:1e9,ty=dy?((dy>0?H-m:m*1.6)-cy)/dy:1e9,t=Math.min(tx,ty);ax=cx+dx*t-Math.cos(an)*bo;ay=cy+dy*t-Math.sin(an)*bo;}
  const c=Math.cos(an)*hs*dpr/K,si=Math.sin(an)*hs*dpr/K;g.setTransform(c,si,-si,c,ax,ay);g.drawImage(SP.arrow.c,-SP.arrow.ox,-SP.arrow.oy);g.setTransform(1,0,0,1,0,0);}
 if(joy.on){g.setTransform(dpr,0,0,dpr,0,0);g.globalAlpha=.55;g.beginPath();g.arc(joy.ox,joy.oy,70*hs,0,TAU);g.lineWidth=5;g.strokeStyle='#ffffff';g.stroke();g.beginPath();g.arc(joy.x,joy.y,26*hs,0,TAU);g.fillStyle='#ffffff';g.fill();g.lineWidth=3;g.strokeStyle=O;g.stroke();g.globalAlpha=1;g.setTransform(1,0,0,1,0,0);}
 if(hudDirty){drawHud();hudDirty=0;}g.drawImage(hudC,0,0);g.drawImage(pauseC,cv.width-pauseC.width-Math.round(8*hs*dpr),Math.round(10*hs*dpr));}
function pauseRect(){const s=80*hs;return [vw-s-8*hs,10*hs,s,s];}
// ---------- render: menus (drawn only when something changes) ----------
const MP=[[110,650],[200,610],[290,650],[380,600],[430,520],[400,330],[300,290],[200,320],[110,260],[170,170],[620,170],[710,220],[800,170],[880,250],[820,340],[820,470],[720,510],[640,600],[740,650],[870,610]];
const ZN=[[40,410,440,290,'#8fd16a','#5fae4a'],[40,90,440,290,'#2a2f6b','#151a40'],[544,90,440,290,'#d9c8ff','#a78bfa'],[544,410,440,290,'#1f6fb0','#124a7a']];
function bg(col){g.setTransform(1,0,0,1,0,0);g.fillStyle=col;g.fillRect(0,0,cv.width,cv.height);g.setTransform(U,0,0,U,uox,uoy);g.lineJoin='round';g.lineCap='round';}
function coinPill(){R(g,20,18,170,60,'#fff',30,4);coin(g,55,48,16);T(g,''+P.coins,125,48,30,'#f5b301');}
function nextLevel(){for(let i=0;i<20;i++)if(!P.stars[i])return i;return -1;}
const IC=({station:fi(10,84),planet:fi(10,60),castle:fi(11,90),rainbow:fi(11,44),unicorn:fi(11,24),toad:fi(11,9),whale:fi(12,92),coral:fi(12,22),fish:fi(12,11),sub:fi(12,40)});
function icon(x,id,a,b,sc,rot){x.save();x.translate(a,b);if(rot)x.rotate(rot);x.scale(sc,sc);ITEMS[id][5](x,0);x.restore();}

function rainbowArc(x,a,b,r0,an){const cs=['#ff6b6b','#ffd23f','#7ee07a','#4a90e2'];x.lineCap='butt';x.lineWidth=8;cs.forEach((c,i)=>{x.beginPath();x.arc(a,b,r0-i*8,Math.PI*1.12,Math.PI*1.12+Math.PI*.76*an);x.strokeStyle=c;x.stroke();});x.lineCap='round';}
let trans=null;
function renderMap(){bg('#7fd0f0');const x=g;
 ZN.forEach(z=>{R(x,z[0],z[1]+12,z[2],z[3],z[5],40,4);R(x,z[0],z[1],z[2],z[3],z[4],40,4);});
 // little scenery per world (vector, drawn only when the map changes)
 tree(x,90,470,1);tree(x,330,470,1.1);bld(x,250,440,70,54,20,'#e9584e','#ff7a6b');bld(x,150,520,64,50,18,'#3d8be0','#5aa7ff');
 for(let i=0;i<30;i++){x.fillStyle=i%3?'#cfd3ff':'#ffd84a';x.fillRect(60+(i*137)%400,105+(i*71)%260,3,3);}
 icon(x,IC.station,330,140,.55);icon(x,IC.planet,90,350,.3);
 icon(x,IC.castle,930,180,.38);icon(x,IC.rainbow,680,300,.5);icon(x,IC.unicorn,600,250,.6);
 icon(x,IC.whale,900,520,.42);icon(x,IC.coral,600,670,.8);icon(x,IC.fish,700,440,.8);
 x.setLineDash([2,18]);x.lineWidth=9;x.strokeStyle='#fff';x.beginPath();MP.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.stroke();x.setLineDash([]);
 // the three crossings between worlds
 icon(x,ROCKET,465,425,.9,.45);rainbowArc(x,395,230,70,1);icon(x,IC.sub,830,405,.8,1.57);
 const cur=nextLevel();
 for(let i=0;i<20;i++){const [a,b]=MP[i];const open=i==0||P.stars[i-1]>0;
  if(i==cur){C(x,a,b,25,'#ffd23f',4);T(x,''+(i+1),a,b,22,'#7b3fe4');}
  else if(open){C(x,a,b,22,'#7b3fe4',4);T(x,''+(i+1),a,b,19);for(let s2=0;s2<3;s2++)star(x,a-13+s2*13,b+27,6,s2<P.stars[i]?'#ffd23f':'#e5ddf5');}
  else{C(x,a,b,20,'#cfc8dc',4);padlock(x,a,b-4,18,'#9b93ad');}}
 if(trans){const p=Math.min(1,trans.t/1.6),A=MP[trans.n-1],B=MP[trans.n],ez=p<.5?2*p*p:1-2*(1-p)*(1-p),hx=A[0]+(B[0]-A[0])*ez,hy=A[1]+(B[1]-A[1])*ez-Math.sin(p*Math.PI)*60;
  if(trans.w==1)icon(x,ROCKET,hx,hy,1.2,Math.atan2(B[1]-A[1],B[0]-A[0])+Math.PI/2);else if(trans.w==2){rainbowArc(x,395,230,70,p);hole(x,hx,hy-20,18,.7,SKINS[P.skin]);}else icon(x,IC.sub,hx,hy,1.1,Math.PI/2);}
 else if(cur>=0){const [a,b]=MP[cur];hole(x,a,b-46,16,.7,SKINS[P.skin]);}
 coinPill();R(x,884,8,124,74,'#7b3fe4',26,4);hole(x,946,45,24,.7,SKINS[P.skin]);}
// world-complete globe: 4 regions turning slowly anticlockwise, finished worlds lit with a tick
const GL=[['#8fd16a','#5c7a50'],['#3a3f8b','#3a3d55'],['#d9c8ff','#77708a'],['#4a90e2','#4a5a6a']];
function renderGlobe(t){bg('#2a2f6b');const x=g;for(let i=0;i<60;i++){x.fillStyle='#cfd3ff';x.fillRect((i*197)%1024,(i*113)%768,3,3);}
 const a0=-t*.5,cx=512,cy=360,R0=240;C(x,cx,cy,R0+8,'#fff',5);
 for(let i=0;i<4;i++){x.beginPath();x.moveTo(cx,cy);x.arc(cx,cy,R0,a0+i*TAU/4,a0+(i+1)*TAU/4);x.closePath();x.fillStyle=P.rw[i]?GL[i][0]:GL[i][1];x.fill();x.lineWidth=4;x.strokeStyle=O;x.stroke();}
 for(let i=0;i<4;i++){const a=a0+(i+.5)*TAU/4,bx=cx+Math.cos(a)*140,by=cy+Math.sin(a)*140,on=P.rw[i];C(x,bx,by,56,on?'#fff':'#b8b4c8',4);x.globalAlpha=on?1:.45;
  if(i==0)homeIcon(x,bx,by+6,60);else icon(x,[0,ROCKET,IC.unicorn,IC.whale][i],bx,by,[1,1,1.1,.42][i]);x.globalAlpha=1;
  if(on){C(x,bx+40,by-40,22,'#2fae8e',3);tick(x,bx+40,by-40,26);}else padlock(x,bx,by-4,34,'#8a849c');}
 x.beginPath();x.arc(cx,cy,R0+34,-.3*Math.PI,-.7*Math.PI,true);x.lineWidth=7;x.strokeStyle='#fff';x.stroke();
 const w=(L.n/5)|0;for(let i=0;i<5;i++)star(x,352+i*80,680,28,P.stars[w*5+i]?'#ffd23f':'#4a4f8b');
 C(x,930,680,52,'#2fae8e',5);playIcon(x,940,680,60);}
// reward reveal: one big flat card per world, pops in
function rwIcon(x,w){if(w==0){holeInner(x,-70,0,22,.75,SKINS[P.skin]);PG(x,[[-38,-14],[-14,0],[-38,14]],'#ffd23f',3);drawRimAt(x,48,0,56,0);holeInner(x,48,0,56,.75,SKINS[P.skin]);}
 else if(w==1){drawRimAt(x,0,0,80,8);holeInner(x,0,0,80,.75,SKINS[8]);}
 else if(w==2){holeInner(x,-60,0,40,.75,SKINS[P.skin]);R(x,30,-44,30,70,'#ff6b6b',8,4);R(x,30,-44,30,20,'#e6e8f2',3,4);R(x,74,-44,30,70,'#ff6b6b',8,4);R(x,74,-44,30,20,'#e6e8f2',3,4);R(x,30,14,74,22,'#ff6b6b',10,4);for(const q of[[-8,-40],[-2,40],[8,0]])icon(x,IC.toad,q[0],q[1],.8);}
 else{drawRimAt(x,0,0,86,9);holeInner(x,0,0,86,.75,SKINS[9]);for(const q of[[100,-70,12],[120,-100,8],[80,-112,6],[-104,-80,10],[-120,-40,6]])C(x,q[0],q[1],q[2],'#e6f6ff',3);}}
function drawRimAt(x,a,b,r,sk){x.save();x.translate(a,b);x.scale(1,.75);x.rotate(-performance.now()/1000*SPIN);rimRing(x,r/1.2,SKINS[sk===0?P.skin:sk]);x.restore();}
function renderReward(t){bg('#ffe9a8');const x=g;for(let i=0;i<16;i++){x.beginPath();x.moveTo(512,384);x.arc(512,384,900,i*TAU/16+t*.2,(i+.5)*TAU/16+t*.2);x.closePath();x.fillStyle='#fff3c8';x.fill();}
 const w=(L.n/5)|0,sc=t<.35?.4+t/.35*.6+Math.sin(t/.35*Math.PI)*.12:1;x.save();x.translate(512,384);x.scale(sc,sc);
 R(x,-190,-250,380,500,['#8fd16a','#3a3f8b','#d9c8ff','#1f6fb0'][w],36,6);R(x,-166,-170,332,340,'#fff',26,5);x.save();x.translate(0,0);rwIcon(x,w);x.restore();
 C(x,0,-250,44,'#fff',5);star(x,0,-250,28,'#ffd23f');x.restore();
 if(t>.6){C(x,512,690,48,'#2fae8e',5);playIcon(x,522,690,56);}}
function skinCard(n){return [124+(n%5)*194,260+Math.floor(n/5)*260];}
function renderSkins(){bg('#6b3fd6');const x=g;for(let i=0;i<20;i++)C(x,(i*137)%1024,(i*251)%768,30,'#7a4fe0',0);
 coinPill();R(x,944,18,64,64,'#fff',32,4);x.beginPath();x.moveTo(962,36);x.lineTo(990,64);x.moveTo(990,36);x.lineTo(962,64);x.lineWidth=7;x.strokeStyle=O;x.stroke();
 SKINS.forEach((sk,n)=>{const [a,b]=skinCard(n),own=P.owned[n],sel=P.skin==n,can=P.coins>=sk[2];
  R(x,a-88,b-100,176,210,sel?'#ffd23f':'#fff',30,5);drawRim(PRIMS[n],a*U+uox,(b-10)*U+uoy,1,.75,-performance.now()/1000*SPIN);g.setTransform(U,0,0,U,uox,uoy);holeInner(x,a,b-10,50,.75,sk);
  if(sel){C(x,a,b+83,20,'#2fae8e',3);tick(x,a,b+83,26);}
  else if(own){C(x,a,b+83,18,'#e5ddf5',3);}
  else if(sk[2]<0){R(x,a-55,b+66,110,34,'#e5ddf5',17,3);star(x,a-22,b+83,13,'#cfc8dc');padlock(x,a+18,b+80,22,'#cfc8dc');}
  else if(can){R(x,a-55,b+66,110,34,'#ffd23f',17,3);coin(x,a-30,b+83,10);T(x,''+sk[2],a+12,b+83,22,'#fff');}
  else{R(x,a-55,b+66,110,34,'#e5ddf5',17,3);padlock(x,a-30,b+80,22,'#cfc8dc');T(x,''+sk[2],a+14,b+83,20,'#9b93ad');}});}
function overlayPanel(){g.setTransform(1,0,0,1,0,0);g.globalAlpha=.45;g.fillStyle=O;g.fillRect(0,0,cv.width,cv.height);g.globalAlpha=1;g.setTransform(U,0,0,U,uox,uoy);g.lineJoin='round';R(g,262,174,500,420,'#fff',40,6);}
function renderPause(){render();overlayPanel();C(g,512,330,92,'#2fae8e',6);playIcon(g,524,330,110);C(g,512,505,50,'#ffd23f',5);homeIcon(g,512,508,60);}
function renderWin(){render();overlayPanel();T(g,'YIPPEE!',512,240,70,'#ffd23f');for(let s=0;s<3;s++)star(g,422+s*90,345,38,s<L.stars?'#ffd23f':'#e5ddf5');
 R(g,437,400,150,50,'#fff',25,4);coin(g,467,425,14);T(g,'+'+L.earned,537,425,28,'#f5b301');
 C(g,L.n<19?430:512,515,48,'#ffd23f',5);homeIcon(g,L.n<19?430:512,518,58);if(L.n<19){C(g,600,515,52,'#2fae8e',5);playIcon(g,610,515,60);}}
function renderScreen(){if(state==='map')renderMap();else if(state==='skins')renderSkins();else if(state==='pause')renderPause();else if(state==='win')renderWin();else if(state==='globe')renderGlobe(mT);else if(state==='reward')renderReward(mT);}
let mT=0,afterRw=-1;
// ---------- input handling ----------
function toLogical(cx,cy){return [(cx*dpr-uox)/U,(cy*dpr-uoy)/U];}
function near(p,a,b,r){const dx=p[0]-a,dy=p[1]-b;return dx*dx+dy*dy<r*r;}
function startLevel(n){buildLevel(n);state='play';joy.on=0;hudDirty=1;lastN=-1;saveRun();}
function playLevel(n){if(n%5==0&&n>0){state='map';trans={n:n,w:n/5,t:0};dirty=1;tone(300,900,1.2,'triangle',.08);return;}startLevel(n);}
function goMap(){state='map';dirty=1;joy.on=0;}
cv.addEventListener('pointerdown',ev=>{ev.preventDefault();au();const cx=ev.clientX,cy=ev.clientY,p=toLogical(cx,cy);
 if(state==='play'){const r=pauseRect();if(cx>r[0]-10&&cy<r[1]+r[3]+10){pause();return;}
  if(!joy.on){joy.on=1;joy.id=ev.pointerId;joy.ox=joy.x=cx;joy.oy=joy.y=cy;try{cv.setPointerCapture(ev.pointerId);}catch(e){}}return;}
 if(state==='map'){if(trans)return;for(let i=0;i<20;i++)if(near(p,MP[i][0],MP[i][1],34)&&(i==0||P.stars[i-1]>0)){playLevel(i);return;}
  if(p[0]>870&&p[1]<95){state='skins';dirty=1;}return;}
 if(state==='globe'){if(mT>.5){state='reward';mT=0;sHappy();}return;}
 if(state==='reward'){if(mT>.6){if(afterRw>=0)playLevel(afterRw);else goMap();}return;}
 if(state==='skins'){if(p[0]>920&&p[1]<100){goMap();return;}for(let n=0;n<10;n++){const [a,b]=skinCard(n);if(Math.abs(p[0]-a)<90&&Math.abs(p[1]-b-5)<110){
   if(P.owned[n]){P.skin=n;bakeRims();sGulp(0);}else if(SKINS[n][2]>=0&&P.coins>=SKINS[n][2]){P.coins-=SKINS[n][2];P.owned[n]=1;P.skin=n;bakeRims();sHappy();}else tone(220,200,.15,'sine',.12);saveP();hudDirty=1;dirty=1;return;}}return;}
 if(state==='pause'){if(near(p,512,330,110)){state='play';hudDirty=1;return;}if(near(p,512,505,70)){saveRun();clearRun();goMap();}return;}
 if(state==='win'){const hx=L.n<19?430:512;let go=-2;if(near(p,hx,515,70))go=-1;else if(L.n<19&&near(p,600,515,72))go=L.n+1;if(go==-2)return;
  if(L.worldDone){afterRw=go;state='globe';mT=0;dirty=1;sHappy();return;}if(go<0)goMap();else playLevel(go);}},{passive:false});
cv.addEventListener('pointermove',ev=>{if(joy.on&&ev.pointerId===joy.id){joy.x=ev.clientX;joy.y=ev.clientY;}});
function up(ev){if(joy.on&&ev.pointerId===joy.id)joy.on=0;}
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
['touchstart','touchmove','gesturestart','dblclick','contextmenu'].forEach(t=>document.addEventListener(t,e=>e.preventDefault(),{passive:false}));
function pause(){if(state!=='play')return;state='pause';joy.on=0;dirty=1;saveRun();}
document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();saveRun();}});
window.addEventListener('pagehide',saveRun);
window.addEventListener('resize',()=>{resize();});
// ---------- loop ----------
const PERF={dt:new Float32Array(1200),cpu:new Float32Array(1200),i:0,n:0};
let last=0,acc=0,TS=1;
function frame(ts){requestAnimationFrame(frame);const c0=performance.now();
 if(state==='play'){let dt=last?(ts-last)/1000:STEP;if(dt>.1)dt=.1;acc+=dt*TS;while(acc>=STEP){step(STEP);acc-=STEP;}if(state==='play')render();else dirty=1;
  saveT+=dt;if(saveT>1.5){saveT=0;saveRun();}
  const c1=performance.now();if(last){PERF.dt[PERF.i]=ts-last;PERF.cpu[PERF.i]=c1-c0;PERF.i=(PERF.i+1)%1200;PERF.n++;}}
 if(state==='skins'||state==='globe'||state==='reward'||trans){dirty=1;const dt=last?Math.min(.1,(ts-last)/1000):0;mT+=dt;if(trans){trans.t+=dt;if(trans.t>1.7){const n=trans.n;trans=null;startLevel(n);}}}
 if(state!=='play'&&dirty){dirty=0;renderScreen();}
 last=ts;}
resize();if(!resumeRun())state='map';dirty=1;requestAnimationFrame(frame);
// test hooks (read-only use by the headless checks)
window.__mh={get bubbles(){let n=0;for(const b of BB)n+=b.on;return n;},set speed(v){TS=v;},get trans(){return trans;},MP:MP,E:E,get NE(){return NE;},hole:hole_,L:L,P:P,PERF:PERF,get state(){return state;},LV:LV};
})();
