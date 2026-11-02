const O='#2b2340',TAU=Math.PI*2;let x;
function seed(s){return()=>(s=(s*16807)%2147483647)/2147483647}
function R(a,b,w,h,f,r=4,lw=3){x.beginPath();x.roundRect(a,b,w,h,r);x.fillStyle=f;x.fill();if(lw){x.lineWidth=lw;x.strokeStyle=O;x.stroke();}}
function C(a,b,r,f,lw=3){x.beginPath();x.arc(a,b,r,0,TAU);x.fillStyle=f;x.fill();if(lw){x.lineWidth=lw;x.strokeStyle=O;x.stroke();}}
function E(a,b,rx,ry,f,lw=3){x.beginPath();x.ellipse(a,b,rx,ry,0,0,TAU);x.fillStyle=f;x.fill();if(lw){x.lineWidth=lw;x.strokeStyle=O;x.stroke();}}
function P(pts,f,lw=3){x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath();x.fillStyle=f;x.fill();if(lw){x.lineWidth=lw;x.strokeStyle=O;x.lineJoin='round';x.stroke();}}
function ST(a,b,r,f,lw=3,n=5){const p=[];for(let i=0;i<n*2;i++){const q=-Math.PI/2+i*Math.PI/n,rr=i%2?r*.45:r;p.push([a+Math.cos(q)*rr,b+Math.sin(q)*rr]);}P(p,f,lw);}
function face(a,b,s=1){C(a-4*s,b,1.8*s,O,0);C(a+4*s,b,1.8*s,O,0);x.beginPath();x.arc(a,b+1.5*s,3*s,.2*Math.PI,.8*Math.PI);x.lineWidth=1.8*s;x.strokeStyle=O;x.stroke();}
function T(t,a,b,sz,f='#fff',al='center',st=O){x.font=`800 ${sz}px "Trebuchet MS",Verdana,sans-serif`;x.textAlign=al;x.textBaseline='middle';x.lineJoin='round';if(st){x.lineWidth=sz/4;x.strokeStyle=st;x.strokeText(t,a,b);}x.fillStyle=f;x.fillText(t,a,b);}
function at(a,b,s,fn,rot=0){x.save();x.translate(a,b);x.rotate(rot);x.scale(s,s);fn();x.restore();}
function hole(a,b,r,c1,c2){C(a,b,r+12,c1,3);x.save();x.beginPath();x.arc(a,b,r+6,0,TAU);x.setLineDash([14,10]);x.lineDashOffset=0;x.lineWidth=7;x.strokeStyle=c2;x.stroke();x.restore();C(a,b,r,'#1b1430',3);E(a,b+r*.25,r*.75,r*.55,'#120c22',0);
 // anticlockwise spin cue
 x.beginPath();x.arc(a,b,r+26,-0.35*Math.PI,-0.75*Math.PI,true);x.lineWidth=4;x.strokeStyle='#fff';x.stroke();const q=-0.75*Math.PI,ex=a+Math.cos(q)*(r+26),ey=b+Math.sin(q)*(r+26);P([[ex-9,ey-2],[ex+3,ey-10],[ex+2,ey+6]],'#fff',0);}
function hud(n,tot,lbl,col){R(18,16,192,64,'#fff',32,4);C(52,48,22,'#1b1430',3);x.save();x.beginPath();x.arc(52,48,17,0,TAU);x.setLineDash([6,5]);x.lineWidth=4;x.strokeStyle=col;x.stroke();x.restore();T(String(n),140,49,30,'#6a3fc8','center',null);R(18,90,192,14,'#fff',7,3);R(21,93,186*tot,8,col,4,0);R(942,16,64,64,'#fff',32,4);R(962,34,8,28,O,2,0);R(978,34,8,28,O,2,0);R(380,18,264,40,'#fff',20,4);T(lbl,512,39,20,O,'center',null);}
function ladder(items,title){const W=1000,H=96,y0=768-H-6;R(12,y0,W,H,'rgba(255,255,255,.93)',18,3);T(title,24,y0+14,14,O,'left',null);const n=items.length,step=(W-40)/n;items.forEach((it,i)=>{const cx=32+step*i+step/2;at(cx,y0+52,it[1],it[0]);T(it[2],cx,y0+86,11,O,'center',null);if(i<n-1)T('›',32+step*(i+1),y0+52,18,'#9a8fb8','center',null);});}
function island(a,b,w,h,f,lip){R(a,b+14,w,h,lip,46,4);R(a,b,w,h,f,46,4);}
function scatter(rand,list,avoid,box){const placed=[];for(const [fn,s,cnt,r] of list){let k=0,tries=0;while(k<cnt&&tries++<4000){const px=box[0]+r+rand()*(box[2]-2*r),py=box[1]+r+rand()*(box[3]-2*r);if(avoid.concat(placed).some(o=>Math.hypot(o[0]-px,o[1]-py)<o[2]+r+4))continue;placed.push([px,py,r]);at(px,py,s,fn,(rand()-.5)*.3);k++;}}return placed.length;}
module.exports={};
