function arrow(a,b,ang){at(a,b,1,()=>{C(0,0,34,'#fff',4);P([[-14,-12],[16,0],[-14,12],[-6,0]],'#ff6b6b',3);},ang);}
function endgame(){space.bg();island(40,120,900,520,'#b9b3d6','#7f78a8');R(40,350,900,58,'#8f88bc',0,0);
 hole(460,380,150,'#2a2f6b','#ffd84a');at(150,200,1,sp.star);at(860,560,1,sp.rock);
 // leftover off-screen to the right: arrow at right edge, bobbing
 arrow(960,300,-0.25);for(const d of[0,1,2])C(905-d*18,314-d*4,3,'#fff',0);
 hud(186,.97,'Level 8 · Space','#ffd84a');R(380,64,264,40,'#fff',20,4);for(let i=0;i<3;i++)at(470+i*40,84,1,sp.star);
 T('Only 3 left → soft bouncing arrow points to the nearest one (no words)',512,720,18);}
function worldmap(){x.fillStyle='#8fd0f0';x.fillRect(0,0,1024,768);
 const Z=[[40,400,440,330,'#9fe08f','#6fae6a','Town'],[40,40,440,330,'#2a2f6b','#151a40','Space'],[544,40,440,330,'#d9c8ff','#a78bfa','Magical'],[544,400,440,330,'#1f6fb0','#124a7a','Undersea']];
 Z.forEach(z=>island(z[0],z[1],z[2],z[3]-14,z[4],z[5]));
 // decorations
 R(90,560,40,40,'#ff9bd2',3,3);R(150,590,46,36,'#4a90e2',3,3);C(120,660,14,'#4fb06a');
 const r=seed(2);for(let i=0;i<40;i++){x.fillStyle='#ffd84a';x.fillRect(60+r()*400,60+r()*280,2,2);}C(300,90,26,'#ff9bd2');at(110,110,.6,sp.station);
 at(910,150,.35,mg.castle);at(620,100,.5,mg.rainbow);at(900,560,.35,us.whale);at(620,690,.8,us.coral);
 // path through 20 stops
 const pts=[[110,690],[200,650],[290,690],[380,640],[430,560],/*space*/[400,320],[300,280],[200,310],[110,250],[160,160],/*magic*/[620,180],[710,230],[800,180],[880,260],[820,330],/*sea*/[820,460],[720,500],[640,580],[740,650],[880,640]];
 x.setLineDash([10,9]);x.lineWidth=6;x.strokeStyle='#fff';x.beginPath();pts.forEach((p,i)=>i?x.lineTo(...p):x.moveTo(...p));x.stroke();x.setLineDash([]);
 pts.forEach((p,i)=>{const done=i<5;C(p[0],p[1],19,done?'#ffd84a':i==5?'#fff':'#e6e8f2',3);T(String(i+1),p[0],p[1]+1,16,O,'center',null);});
 // transitions
 at(470,400,1,sp.rocket,.5);T('blast off',470,450,14);
 x.lineWidth=8;['#ff6b6b','#ffd84a','#7ee07a','#4a90e2'].forEach((c,i)=>{x.strokeStyle=c;x.beginPath();x.arc(512,240,70-i*8,Math.PI*1.15,Math.PI*1.85);x.stroke();});T('rainbow bridge',512,280,14);
 at(820,400,1,us.sub,1.57);for(const[a,b]of[[800,372],[792,356]])C(a,b,4,'#e6f6ff',2);T('dive!',880,400,14);
 // Molly at next stop
 hole(400,320,13,'#2a2f6b','#ffd84a');T('Molly',400,284,14,'#ffd84a');
 Z.forEach(z=>T(z[6],z[0]+z[2]-70,z[1]+30,22));T("Molly's 4 worlds · 20 stops",512,748,20);}
function globe(){x.fillStyle='#2a2f6b';x.fillRect(0,0,1024,768);const r=seed(8);for(let i=0;i<80;i++){x.fillStyle='#cfd3ff';x.fillRect(r()*1024,r()*768,2,2);}
 x.save();x.beginPath();x.arc(512,370,230,0,TAU);x.clip();x.fillStyle='#4a90e2';x.fillRect(0,0,1024,768);
 // 4 regions as wedges: town & space lit, magical + undersea dimmed
 const reg=[['#9fe08f',1],['#3a3f8b',1],['#9a90b8',0],['#5f7a96',0]];reg.forEach((g,i)=>{x.beginPath();x.moveTo(512,370);x.arc(512,370,230,i*TAU/4-Math.PI/2,(i+1)*TAU/4-Math.PI/2);x.closePath();x.fillStyle=g[0];x.fill();x.lineWidth=4;x.strokeStyle=O;x.stroke();});
 x.lineWidth=3;x.strokeStyle='rgba(43,35,64,.35)';for(const k of[.4,.75])x.beginPath(),x.ellipse(512,370,230*k,230,0,0,TAU),x.stroke();x.restore();C(512,370,230,'rgba(0,0,0,0)',5);
 // spin cue
 x.beginPath();x.arc(512,370,262,-.3*Math.PI,-.7*Math.PI,true);x.lineWidth=6;x.strokeStyle='#fff';x.stroke();
 const B=[[620,270,'#9fe08f',()=>{R(-16,-10,32,26,'#ff9bd2',3,3);P([[-20,-8],[0,-26],[20,-8]],'#ff6b6b');},1],[620,470,'#3a3f8b',sp.rocket,1],[400,470,'#9a90b8',mg.unicorn,0],[400,270,'#5f7a96',us.whale,0]];
 B.forEach(b=>{C(b[0],b[1],52,b[4]?'#fff':'#b8b4c8',4);x.globalAlpha=b[4]?1:.4;at(b[0],b[1],b[3]==us.whale?.45:b[3]==sp.rocket?1:1.1,b[3]);x.globalAlpha=1;if(b[4]){C(b[0]+38,b[1]-38,20,'#4fd06a',3);x.lineWidth=5;x.strokeStyle='#fff';x.beginPath();x.moveTo(b[0]+28,b[1]-38);x.lineTo(b[0]+36,b[1]-30);x.lineTo(b[0]+48,b[1]-46);x.stroke();}else{R(b[0]-12,b[1]-8,24,20,'#8a849c',4,3);x.lineWidth=4;x.beginPath();x.arc(b[0],b[1]-8,8,Math.PI,0);x.stroke();}});
 for(let i=0;i<5;i++)ST(352+i*75,680,26,'#ffd84a',4);T('World complete!',512,60,40,'#ffd84a');}
const RW=[['Town','#9fe08f',()=>{C(-68,0,18,'#1b1430',4);P([[-44,-10],[-24,0],[-44,10]],'#ffd84a',3);C(30,0,46,'#1b1430',4);x.save();x.beginPath();x.arc(30,0,54,0,TAU);x.setLineDash([12,9]);x.lineWidth=8;x.strokeStyle='#ffd84a';x.stroke();x.restore();}],
['Space','#3a3f8b',()=>{C(0,0,70,'#1b1430',4);x.save();x.beginPath();x.arc(0,0,80,0,TAU);x.setLineDash([16,10]);x.lineWidth=12;x.strokeStyle='#a78bfa';x.stroke();x.restore();for(let i=0;i<6;i++)ST(Math.cos(i)*80,Math.sin(i)*80,10,'#ffd84a',2.5);at(0,0,1.3,sp.rocket,.6);}],
['Magical','#d9c8ff',()=>{C(-50,0,30,'#1b1430',4);R(10,-30,26,60,'#ff6b6b',6,4);R(10,-30,26,18,'#e6e8f2',3,4);R(46,-30,26,60,'#ff6b6b',6,4);R(46,-30,26,18,'#e6e8f2',3,4);R(10,22,62,16,'#ff6b6b',8,4);for(const[a,b]of[[88,-46],[96,4],[84,52]])at(a,b,.9,mg.toad);x.lineWidth=5;x.strokeStyle='#fff';for(const a of[-1,1]){x.beginPath();x.arc(-40,0,60+a*0,Math.PI*.9,Math.PI*1.1);x.stroke();}}],
['Undersea','#1f6fb0',()=>{C(0,0,70,'#1b1430',4);x.save();x.beginPath();x.arc(0,0,82,0,TAU);x.setLineDash([16,8]);x.lineWidth=14;x.strokeStyle='#ffd84a';x.stroke();x.restore();for(const[a,b,r]of[[90,-60,12],[110,-90,8],[70,-100,6],[-100,-70,10]])C(a,b,r,'#e6f6ff',3);}]];
function rewards(){x.fillStyle='#ffe9a8';x.fillRect(0,0,1024,768);for(let i=0;i<16;i++){x.beginPath();x.moveTo(512,384);x.arc(512,384,900,i*TAU/16,(i+.5)*TAU/16);x.fillStyle='#fff3c8';x.fill();}
 RW.forEach((w,i)=>{const cx=140+i*248,cy=384;R(cx-110,cy-170,220,340,w[1],26,5);R(cx-96,cy-110,192,220,'#fff',18,4);at(cx,cy,.9,w[2]);C(cx,cy-170,30,'#fff',4);ST(cx,cy-170,18,'#ffd84a');i==0&&ST(cx+86,cy-140,16,'#ffd84a');});
 T('One reward card per world (shown one at a time, flips in)',512,60,24);T('Town: ×2 start size · Space: galaxy-rocket rim · Magical: magnet · Undersea: golden hole + bubble cheer',512,710,16);}
