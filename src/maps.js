/* =========================================================
   CARTES : chaque carte = ciel + façades (fond) + décors triés + lieux
   ========================================================= */
let gameClock={h:12,m:0,s:0};
const MAPS={
  tilleuls:{name:'Place des Tilleuls',at:'sur la place des Tilleuls',unlock:0,build:buildTilleuls},
  port:{name:'Le Port aux Mouettes',at:'sur le port aux Mouettes',unlock:2,build:buildPort},
  foire:{name:'La Fête foraine',at:'à la fête foraine',unlock:4,build:buildFoire},
};
bilf(MAPS.tilleuls,{name:'Lindens Square',at:'on Lindens Square'});bilf(MAPS.port,{name:'Gull Harbour',at:'at Gull Harbour'});bilf(MAPS.foire,{name:'The Funfair',at:'at the funfair'});
const MAPK=Object.keys(MAPS);
const MCACHE={};
function useContractMap(c){useMap(c.map);applyLayout(M,c.of.seed%100000,c.st)}
function paintedSky(m,top,bot){const PK=1600/1376,PY=-194;return()=>{const im=m.bgImg&&SPR.img[m.bgImg];if(!im)return false;
  const g=ctx.createLinearGradient(0,-900,0,PY+20);g.addColorStop(0,top);g.addColorStop(1,bot);ctx.fillStyle=g;ctx.fillRect(-900,-900,W+1800,PY+920);
  paintedBg(m,im,PK,PY);return true}}
/* l'image de fond, prolongée sur les côtés par ses colonnes de bord (visible aux grands angles) */
function paintedBg(m,im,PK,PY){const ih=im.naturalHeight,h=ASSETS[m.bgImg].h*PK,iw=im.naturalWidth;
  if(VIEW[0]<0)ctx.drawImage(im,0,0,2,ih,-900,PY,902,h);if(VIEW[2]>W)ctx.drawImage(im,iw-2,0,2,ih,W-2,PY,902,h);
  if(VIEW[1]<PY){const T=-1600;ctx.drawImage(im,0,0,iw,2,0,T,W,PY-T+2);if(VIEW[0]<0)ctx.drawImage(im,0,0,2,2,-900,T,902,PY-T+2);if(VIEW[2]>W)ctx.drawImage(im,iw-2,0,2,2,W-2,T,902,PY-T+2)}  // ciel prolongé vers le haut
  ctx.drawImage(im,0,PY,W,h)}
function bgDraw(t){M.sky(t);if(!(M.bgImg&&SPR.img[M.bgImg]))drawItems(M.bg);M.dyn&&M.dyn(t)}
function useMap(id){if(!MCACHE[id]){const m={id,bg:[],props:[],locs:[]};R=mulberry(77+id.length);MAPS[id].build(m);R=Math.random;m.props.sort((a,b)=>a.z-b.z);MCACHE[id]=m;applyLayout(m,1,2);const pm=M;M=m;m.nav=buildNav(m);M=pm}M=MCACHE[id];return M}
const LOC_EN={cafe:['Café','at the Café'],kiosque:['Kiosk','at the Kiosk'],fontaine:['Fountain','at the Fountain'],boulangerie:['Bakery','at the Bakery'],gare:['Station','at the Station'],
  capitainerie:['Harbour Office','at the Harbour Office'],poissonnerie:['Fishmonger','at the Fishmonger'],grue:['Crane','under the Crane'],buvette:['Snack Bar','at the Snack Bar'],ferry:['Ferry Pier','at the Ferry Pier'],
  carrousel:['Carousel','at the Carousel'],roulotte:['Caravan','at the Caravan'],tir:['Shooting Gallery','at the Shooting Gallery'],barbe:['Candy Floss','at the Candy Floss stand'],canards:['Hook-a-Duck','at the Hook-a-Duck'],
  roue:['Ferris Wheel','at the Ferris Wheel'],cirque:['Big Top','at the Big Top']};
function locDef(id,name,a,x,col){const o={id,name,a,x,col};const e=LOC_EN[id];return e?bilf(o,{name:e[0],a:e[1]}):o}

/* Point libre pour se tenir près d'un lieu (évite les décors qui masquent) */
function spotNear(li,back,spread){
  const L=M.locs[li];spread=spread||115;
  for(let k=0;k<40;k++){
    const x=clamp(L.x+(Math.random()*2-1)*spread,40,W-40);
    const y=back?510+Math.random()*34:600+Math.random()*188;
    const s=scaleAt(y);
    const hidden=M.props.some(g=>g.z>y&&g.block.some(r=>inR(r,x,y-60*s)||inR(r,x,y-110*s)));
    if(!hidden&&navFree(x,y))return[x,y];
  }
  return navNearestFree(L.x,720);
}

/* ---------- fonctions communes de décor ---------- */
function skyGrad(top,mid,hor){return t=>{const g=ctx.createLinearGradient(0,-300,0,470);g.addColorStop(0,top);g.addColorStop(.7,mid);g.addColorStop(1,hor);ctx.fillStyle=g;ctx.fillRect(-900,-900,W+1800,1390)}}
function hangCloud(x,y,s){const p=P();[[0,0,34],[-34,10,24],[34,10,26],[-12,-16,24],[16,-14,22]].forEach(([dx,dy,r])=>{p.moveTo(x+dx*s+r*s,y+dy*s);p.arc(x+dx*s,y+dy*s,r*s,0,7)});p.rect(x-56*s,y+8*s,112*s,22*s);return{p,x,y:y-28*s}}
function drawClouds(cl,t,col){for(const c of cl){const sw=Math.sin(t*.6+c.x)*5;ctx.strokeStyle='#6b5a4a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(c.x,-900);ctx.lineTo(c.x+sw*.3,c.y);ctx.stroke();
  ctx.save();ctx.translate(sw,0);ctx.save();ctx.translate(4,3);ctx.fillStyle='rgba(50,28,12,.15)';ctx.fill(c.p);ctx.restore();ctx.strokeStyle='#fff';ctx.lineWidth=5;ctx.stroke(c.p);ctx.fillStyle=col||'#fffdf6';ctx.fill(c.p);ctx.restore()}}
function drawSunStick(x,y,t,col){ctx.lineCap='round';ctx.strokeStyle='#6b5a4a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,-900);ctx.lineTo(x,y-40);ctx.stroke();
  ctx.save();ctx.translate(x,y);ctx.rotate(t*.15);ctx.fillStyle=col||'#f6c64e';ctx.strokeStyle='#fff';ctx.lineWidth=4;
  ctx.beginPath();for(let i=0;i<12;i++){const a=i/12*Math.PI*2;ctx.lineTo(Math.cos(a)*62,Math.sin(a)*62);const b=a+Math.PI/12;ctx.lineTo(Math.cos(b)*44,Math.sin(b)*44)}ctx.closePath();ctx.stroke();ctx.fill();
  ctx.fillStyle='#f9d978';ctx.beginPath();ctx.arc(0,0,36,0,7);ctx.fill();ctx.restore()}
function hills(cols,base){return cols.map(([c,y,a],k)=>{const p=P();p.moveTo(-300,base);for(let x=-300;x<=1900;x+=40)p.lineTo(x,y-Math.sin(x/170+a)*a*.6-Math.sin(x/53+k)*8);p.lineTo(1900,base);p.closePath();return{p,f:c}})}
function drawHills(hs){for(const h of hs){ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.stroke(h.p);ctx.fillStyle=h.f;ctx.fill(h.p)}}
function groundFill(base,curb,dots,dotCol,line){return()=>{ctx.fillStyle=curb;ctx.fillRect(-900,468,W+1800,24);ctx.fillStyle=base;ctx.fillRect(-900,490,W+1800,410);if(dots){ctx.fillStyle=dotCol;ctx.fill(dots)}if(line){ctx.fillStyle=line;ctx.fillRect(-900,488,W+1800,4)}}}
function cobbles(n,rnd){const p=P();for(let i=0;i<n;i++){const y=495+Math.pow(rnd(),1.3)*400,s=.5+(y-480)/420;const x=rnd()*W;p.moveTo(x+9*s,y);p.ellipse(x,y,9*s,3.6*s,0,0,7)}return p}
function lamp(m,x,z,col){const g=grp(m,z||603,[x-16,410,x+16,z||603]);const y=z||603;add(g.items,rr(x-3,440,6,y-443,2),col||'#2f2b36');add(g.items,rr(x-11,424,22,22,4),'#f6e3a2');const c=P();c.moveTo(x-14,426);c.lineTo(x,412);c.lineTo(x+14,426);c.closePath();add(g.items,c,col||'#2f2b36');add(g.items,rr(x-8,y-9,16,8,2),col||'#2f2b36');return g}
function signBoard(L,x,y,w,txt,bg,fg,size,bb){add(L,rr(x-w/2,y-24,w,32,6),bg,bb,3);addT(L,txt,x,y-1,size||20,fg,bb)}
function windows(L,x0,x1,top,yMax,col,rnd,skipC){const w=x1-x0,n=Math.max(1,Math.floor((w-30)/55));const gap=(w-n*26)/(n+1);
  for(let y=top+26;y+38<yMax;y+=64)for(let i=0;i<n;i++){const x=x0+gap+i*(26+gap);if(skipC&&Math.abs(x+13-skipC)<50)continue;const bb=[x-12,y-4,x+40,y+44];
    add(L,rr(x-2,y-2,30,40,3),shade(col,-.35),bb,0,0);add(L,rr(x,y,26,36,2),'#f7efd9',bb,0,0);add(L,rr(x+12,y,2,36,0),shade(col,-.35),bb,0,0);
    if(rnd()<.45){add(L,rr(x-10,y,8,36,1),shade(col,-.2),bb,0,0);add(L,rr(x+28,y,8,36,1),shade(col,-.2),bb,0,0)}}}
function awning(L,x0,x1,y0,y1,c1,c2,bb){const aw=P();aw.moveTo(x0+8,y0);aw.lineTo(x1-8,y0);aw.lineTo(x1+4,y1);aw.lineTo(x0-4,y1);aw.closePath();add(L,aw,c1,bb);
  for(let x=x0+8;x<x1-20;x+=36){const s=P();s.moveTo(x+12,y0);s.lineTo(x+30,y0);s.lineTo(x+34,y1);s.lineTo(x+14,y1);s.closePath();add(L,s,c2,bb,0,0)}}
function flowerBoxes(m,ranges){ranges.forEach(([x0,x1])=>{const g=grp(m,905,[x0-20,760,x1+20,905]);
  const f=P();for(let x=x0+6;x<=x1-6;x+=24){f.moveTo(x+18,806);f.arc(x,806,18,0,7)}add(g.items,f,'#4f8a4a');
  for(let x=x0+16;x<x1-10;x+=34){const d=P();d.arc(x,792+((x/34|0)%2)*8,6,0,7);add(g.items,d,['#e08aa0','#f3c34a','#fbf6ea','#d4483b'][(x/34|0)%4],null,2,0)}
  add(g.items,rr(x0,812,x1-x0,90,3),'#9a6440');for(let x=x0+30;x<x1;x+=44)add(g.items,rr(x,818,2,80,0),'#7e4f30',null,0,0);g.block.push([x0,786,x1,905])})}

/* =========================================================
   1. PLACE DES TILLEULS
   ========================================================= */
function buildTilleuls(m){
  const rnd=R;
  m.locs=[locDef('cafe','Café','au Café',175,'#c8553d'),locDef('kiosque','Kiosque','au Kiosque',490,'#2f8a6c'),locDef('fontaine','Fontaine','à la Fontaine',800,'#3f7fb8'),locDef('boulangerie','Boulangerie','à la Boulangerie',1110,'#c88a18'),locDef('gare','Gare','à la Gare',1425,'#7a5fae')];
  const hl=hills([['#a7c79a',420,60],['#8fb48b',445,40]],480);
  const cl=[[180,95,1],[620,55,.8],[1040,105,1.1],[1450,60,.9]].map(a=>hangCloud(...a));
  const gnd=groundFill('#d9bb8c','#e4c99d',cobbles(340,rnd),'#caa874','#c19d6a');
  const sky=skyGrad('#7fbcd6','#bfe0e6','#f3e2bf');
  let mairie={};
  const painted=typeof ASSETS!=='undefined'&&!!ASSETS.bg_tilleuls;
  if(painted){m.bgImg='bg_tilleuls';const L=m.locs;L[0].x=215;L[1].x=494;L[3].x=1093;L[4].x=1407}
  const PK=1600/1376,PY=-194;
  m.sky=t=>{const im=m.bgImg&&SPR.img[m.bgImg];
    if(!im){sky(t);drawSunStick(1240,120,t);drawClouds(cl,t);drawHills(hl);gnd();return}
    const g=ctx.createLinearGradient(0,-900,0,PY+20);g.addColorStop(0,'#8fbfd2');g.addColorStop(1,'#b6d2db');ctx.fillStyle=g;ctx.fillRect(-900,-900,W+1800,PY+920-(-900)+0);
    paintedBg(m,im,PK,PY)};
  const B=[[-60,60,250,'#a9c0cf','tri'],[60,300,215,'#ead2ad','mans','cafe'],[300,385,275,'#cf9a85','flat'],[385,600,245,'#bccca6','tri','kiosque'],[600,705,205,'#dbb8cb','flat'],[705,895,150,'#efe4c8','mairie','fontaine'],[895,1000,235,'#a9c4da','tri'],[1000,1225,225,'#f1d68f','mans','boulangerie'],[1225,1305,265,'#c7a9da','flat'],[1305,1555,185,'#dccfb9','gare','gare'],[1555,1665,245,'#b8cba9','tri']];
  const BG=m.bg;
  B.forEach(([x0,x1,top,col,roof,kind])=>{
    const w=x1-x0,cx=(x0+x1)/2,bb=[x0-10,top-260,x1+10,470];
    if(roof==='tri'){const p=P();p.moveTo(x0-8,top);p.lineTo(cx,top-52);p.lineTo(x1+8,top);p.closePath();add(BG,p,shade(col,-.45),bb)}
    else if(roof==='flat'){add(BG,rr(x0-7,top-12,w+14,14,3),shade(col,-.35),bb)}
    else if(roof==='mans'){const p=P();p.moveTo(x0-5,top);p.lineTo(x0+20,top-46);p.lineTo(x1-20,top-46);p.lineTo(x1+5,top);p.closePath();add(BG,p,'#5d5470',bb);for(let x=x0+40;x<x1-40;x+=55)add(BG,rr(x,top-36,22,26,[10,10,2,2]),'#f7efd9',bb,3,0)}
    else if(roof==='mairie'){const p=P();p.moveTo(x0-6,top);p.lineTo(cx,top-34);p.lineTo(x1+6,top);p.closePath();add(BG,p,shade(col,-.3),bb);
      add(BG,rr(cx-42,top-150,84,152,2),'#e3d4b0',bb);const r=P();r.moveTo(cx-50,top-150);r.lineTo(cx,top-205);r.lineTo(cx+50,top-150);r.closePath();add(BG,r,'#5d5470',bb);
      add(BG,rr(cx-2,top-250,4,50,0),'#3a3038',bb);const fl=P();fl.moveTo(cx+2,top-248);fl.lineTo(cx+36,top-240);fl.lineTo(cx+2,top-230);fl.closePath();add(BG,fl,'#d4483b',bb);
      const cf=P();cf.arc(cx,top-95,32,0,7);add(BG,cf,'#fbf6ea',bb);mairie={cx,cy:top-95}}
    else if(roof==='gare'){const p=P();p.moveTo(x0-6,top);p.lineTo(cx,top-46);p.lineTo(x1+6,top);p.closePath();add(BG,p,'#9b8c78',bb)}
    add(BG,rr(x0,top,w,470-top,2),col,bb);
    windows(BG,x0,x1,top,kind?345:398,col,rnd,kind==='mairie'?cx:0);
    if(!kind)add(BG,rr(cx-15,412,30,58,[14,14,0,0]),shade(col,-.4),bb,3,0);
    if(kind==='cafe'){add(BG,rr(x0+20,402,w-40,68,2),'#5b3a30',bb,0,0);for(let i=0;i<4;i++)add(BG,rr(x0+28+i*((w-56)/4),410,(w-56)/4-8,46,2),'#f6d99a',bb,0,0);
      awning(BG,x0,x1,360,400,'#d4483b','#fbf6ea',bb);signBoard(BG,cx,350,124,'CAFÉ','#2b2233','#f3c34a',26,bb)}
    if(kind==='boulangerie'){add(BG,rr(x0+20,402,w-40,68,2),'#6b4c2e',bb,0,0);add(BG,rr(x0+30,410,w-110,52,2),'#f7e2b0',bb,0,0);
      for(let i=0;i<4;i++){const b=P();b.ellipse(x0+60+i*26,440,8,24,.5,0,7);add(BG,b,'#c98a3a',bb,2,0)}add(BG,rr(x1-70,410,40,60,[16,16,0,0]),'#8a5a3c',bb,3,0);
      awning(BG,x0,x1,364,400,'#3e6db3','#fbf6ea',bb);signBoard(BG,cx,352,184,'BOULANGERIE','#fbf6ea','#8a5a3c',22,bb)}
    if(kind==='kiosque')add(BG,rr(cx-14,412,28,58,[13,13,0,0]),shade(col,-.4),bb,3,0);
    if(kind==='mairie'){add(BG,rr(cx-26,395,52,75,[26,26,0,0]),'#6b5244',bb,3,0);signBoard(BG,cx,328,140,'MAIRIE','#fbf6ea','#3f7fb8',20,bb);for(const dx of[-70,-48,48,70])add(BG,rr(cx+dx-6,340,12,130,2),'#e8dcc2',bb,2,0)}
    if(kind==='gare'){add(BG,rr(cx-70,300,140,170,[70,70,0,0]),'#7d6e5c',bb,3,0);add(BG,rr(cx-60,312,120,158,[60,60,0,0]),'#cfe3ea',bb,0,0);for(let i=1;i<4;i++)add(BG,rr(cx-60+i*30,312,3,158,0),'#7d6e5c',bb,0,0);add(BG,rr(cx-60,385,120,3,0),'#7d6e5c',bb,0,0);signBoard(BG,cx,256,116,'GARE','#2b2233','#fbf6ea',24,bb)}
  });
  m.dyn=t=>{ // horloge de la mairie
    if(m.bgImg&&SPR.img[m.bgImg]){const cx=689*PK,cy=224*PK+PY;if(!vis([cx-30,cy-30,cx+30,cy+30]))return;
      const hm=(gameClock.h%12+gameClock.m/60)/12*Math.PI*2-Math.PI/2,mm=(gameClock.m+gameClock.s/60)/60*Math.PI*2-Math.PI/2;
      ctx.strokeStyle='#2b2233';ctx.lineCap='round';ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(hm)*10,cy+Math.sin(hm)*10);ctx.stroke();
      ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(mm)*14.5,cy+Math.sin(mm)*14.5);ctx.stroke();ctx.fillStyle='#d4483b';ctx.beginPath();ctx.arc(cx,cy,2.2,0,7);ctx.fill();return}
    const {cx,cy}=mairie;if(vis([cx-40,cy-40,cx+40,cy+40])){ctx.strokeStyle='#2b2233';ctx.lineCap='round';
      for(let i=0;i<12;i++){const a=i/12*Math.PI*2;ctx.lineWidth=i%3?2:3.5;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*25,cy+Math.sin(a)*25);ctx.lineTo(cx+Math.cos(a)*29,cy+Math.sin(a)*29);ctx.stroke()}
      const hm=(gameClock.h%12+gameClock.m/60)/12*Math.PI*2-Math.PI/2,mm=(gameClock.m+gameClock.s/60)/60*Math.PI*2-Math.PI/2;
      ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(hm)*15,cy+Math.sin(hm)*15);ctx.stroke();ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(mm)*23,cy+Math.sin(mm)*23);ctx.stroke();
      ctx.fillStyle='#d4483b';ctx.beginPath();ctx.arc(cx,cy,3.5,0,7);ctx.fill()}
  };
  // terrasse du café
  if(!painted)[110,240].forEach(x=>{const g=grp(m,592,[x-40,540,x+40,595]);add(g.items,rr(x-26,560,6,32,2),'#5d5470');add(g.items,rr(x+20,560,6,32,2),'#5d5470');add(g.items,rr(x-24,546,6,16,2),'#5d5470');add(g.items,rr(x-3,560,6,32,1),'#3a3038');const t=P();t.ellipse(x,558,26,7,0,0,7);add(g.items,t,'#fbf6ea');g.block.push([x-28,550,x+28,592])});
  // kiosque à journaux
  if(!painted){const g=grp(m,602,[420,375,560,602]);const dome=P();dome.moveTo(426,472);dome.quadraticCurveTo(430,412,490,404);dome.quadraticCurveTo(550,412,554,472);dome.closePath();add(g.items,dome,'#256e57');
    add(g.items,rr(487,380,6,26,2),'#e3b44a',null,3);add(g.items,rr(440,468,100,132,4),'#2f8a6c');add(g.items,rr(452,500,76,38,3),'#1d3b33',null,0,0);
    for(let i=0;i<4;i++)add(g.items,rr(456+i*18,506+(i%2)*4,15,22,1),['#fbf6ea','#f3c34a','#fbf6ea','#e08aa0'][i],null,0,0);
    add(g.items,rr(446,548,34,44,2),'#fbf6ea',null,0,0);add(g.items,rr(500,548,34,44,2),'#f3c34a',null,0,0);add(g.items,rr(446,474,88,20,3),'#fbf6ea',null,3);addT(g.items,'JOURNAUX',490,489,13,'#256e57');g.block.push([438,400,542,602])}
  // fontaine
  if(!painted){const g=grp(m,607,[680,420,920,610]);add(g.items,rr(788,470,24,96,4),'#9fb0bd');const bowl=P();bowl.moveTo(760,476);bowl.quadraticCurveTo(800,512,840,476);bowl.closePath();add(g.items,bowl,'#b9c7d1');
    const tp=P();tp.ellipse(800,476,40,8,0,0,7);add(g.items,tp,'#c9d6de',null,3);add(g.items,rr(690,560,220,46,6),'#b0bfca');const rim=P();rim.ellipse(800,560,112,15,0,0,7);add(g.items,rim,'#c9d6de');
    const wa=P();wa.ellipse(800,561,98,9,0,0,7);add(g.items,wa,'#79b9df',null,0,0);for(let i=0;i<5;i++)add(g.items,rr(705+i*42,572,30,22,4),'#a3b3bf',null,0,0);
    g.items.push({fn:t=>{ctx.fillStyle='#9fd3f0';ctx.strokeStyle='#fff';ctx.lineWidth=2;for(let i=0;i<8;i++){const ph=(t*.9+i/8)%1,side=i%2?1:-1;const x=800+side*(10+ph*70),y=470-Math.sin(ph*Math.PI)*42+ph*80;ctx.beginPath();ctx.ellipse(x,y,4.5,6.5,0,0,7);ctx.stroke();ctx.fill()}}});g.block.push([688,465,912,607])}
  // ardoise, chariot de la gare
  if(!painted){const x=1185,g=grp(m,598,[1160,535,1210,600]);const a=P();a.moveTo(x-22,598);a.lineTo(x-16,540);a.lineTo(x+16,540);a.lineTo(x+22,598);a.closePath();add(g.items,a,'#8a5a3c');add(g.items,rr(x-15,546,30,40,2),'#33403a',null,0,0);addT(g.items,'PAIN',x,563,9,'#fbf6ea',null,'ui');addT(g.items,'CHAUD',x,577,9,'#f3c34a',null,'ui');g.block.push([x-22,540,x+22,598])}
  if(!painted){const x=1470,g=grp(m,600,[1420,515,1520,604]);add(g.items,rr(x-46,580,92,10,2),'#5d5470');[x-34,x+34].forEach(wx=>{const w=P();w.arc(wx,594,8,0,7);add(g.items,w,'#2b2233',null,3)});add(g.items,rr(x-40,546,40,34,3),'#8a5a3c');add(g.items,rr(x+2,530,36,50,3),'#3e6db3');add(g.items,rr(x-30,522,24,24,3),'#d9a62e');g.block.push([x-46,520,x+40,600])}
  if(!painted)[345,650,955,1270].forEach(x=>lamp(m,x));
  if(!painted)[330,1270].forEach(x=>{const g=grp(m,716,[x-60,655,x+60,718]);add(g.items,rr(x-52,664,104,12,3),'#8a5a3c');add(g.items,rr(x-56,690,112,10,3),'#a8714a');[x-46,x+40].forEach(lx=>add(g.items,rr(lx,698,6,18,1),'#3a3038'));g.block.push([x-56,686,x+56,716])});
  if(!painted)[640,960].forEach(x=>{const g=grp(m,713,[x-44,648,x+44,714]);const f=P();for(let i=-2;i<=2;i++){f.moveTo(x+i*14+11,668);f.arc(x+i*14,668,11,0,7)}add(g.items,f,'#4f8a4a');[[-20,'#e08aa0'],[0,'#f3c34a'],[22,'#fbf6ea']].forEach(([dx,c])=>{const d=P();d.arc(x+dx,660,5,0,7);add(g.items,d,c,null,2,0)});add(g.items,rr(x-36,676,72,36,3),'#c4733f');g.block.push([x-36,676,x+36,712])});
  if(!painted)flowerBoxes(m,[[0,180],[540,665],[935,1060],[1420,1600]]);
  if(painted){
    // décors fixes (repères des lieux + cadre du premier plan)
    m.fixed=[['kiosque',494,602],['fontaine',800,616],...[[90],[602],[997],[1510]].map(([x])=>['jardiniere',x,910,1])];
    // emplacements facultatifs, remplis selon le contrat
    m.slots=[['lampe',345,600],['lampe',650,600],['lampe',955,600],['lampe',1270,600],
      ['banc',330,720],['banc',1270,720],['banc',640,792],['banc',1000,792],
      ['bac',640,712],['bac',960,712],['bac',150,690],['bac',1460,688],['bac',1185,618],['bac',235,632]];
  }
}
// dep : où tombe le centre de l'ombre au-dessus du bas de l'image (0 = sur le bord avant, 1 = un rayon plus haut)
const FLAT={kiosque:{w:131,b:[[.03,.05,.97,1]],dep:.5,sw:1},fontaine:{w:250,b:[[.05,.52,.95,1],[.36,0,.64,.55]],dep:.62,sw:1},lampe:{w:54,b:[[.38,.02,.62,1],[.2,0,.8,.3]],dep:.45,sw:.75},
  banc:{w:132,b:[[.02,.04,.98,.78]],dep:.55,sw:1},bac:{w:72,b:[[.04,.32,.96,1]],dep:.3,sw:1},jardiniere:{w:190,b:[[.03,.45,.97,1]],dep:.3,sw:1},
  // port
  caisses:{w:100,b:[[.02,.3,.98,1]],dep:.4},tonneau:{w:50,b:[[.05,.3,.95,1]],dep:.35},bitte:{w:54,b:[[.05,.6,.9,1]],dep:.45},
  cordage:{w:90,fw:140,b:[[.02,.2,.95,1]],dep:.45},casier:{w:112,fw:150,b:[[.02,.1,.98,1]],dep:.5},lampe_quai:{w:40,b:[[.33,.05,.67,1],[.1,.9,.9,1]],dep:.45,sw:.8},
  // fête foraine
  chariot_barbe:{w:92,b:[[.15,.35,.95,1]],dep:.45},chariot_glace:{w:104,b:[[.1,.5,.85,1]],dep:.45},guirlande:{w:200,b:[[.37,.05,.53,1]],dep:.35,sw:1.4},
  paille:{w:92,fw:112,b:[[.02,.3,.98,1]],dep:.4},tonneau_pommes:{w:50,b:[[.05,.45,.95,1]],dep:.35},banc_rouge:{w:132,b:[[.02,.04,.98,.78]],dep:.55}};
function imgProp(m,key,cx,base,w,blocks,shd){const A=ASSETS[key],k=w/A.ow;shd=shd||{};
  const ix=cx-w/2-A.ox*k,iy=base-A.base*k,iw=A.W*k,ih=A.H*k,x0=cx-w/2,y0=iy+A.oy*k,h=A.oh*k;
  const g=grp(m,base,[ix-8,iy-8,ix+iw+8,iy+ih+8]);const f0=A.sx0!==undefined?A.sx0:0,f1=A.sx1!==undefined?A.sx1:A.W,hw=(f1-f0)/2*k*(shd.sw||1);
  g.items.push({img:key,x:ix,y:iy,w:iw,h:ih,blob:[ix+(f0+f1)/2*k,base,hw,shd.dep===undefined?.35:shd.dep]});
  (blocks||[[.08,.12,.92,1]]).forEach(b=>g.block.push([x0+w*b[0],y0+h*b[1],x0+w*b[2],y0+h*b[3]]));return g}
function flatProp(m,name,x,base,front){const F=FLAT[name];const w=front?(F.fw||190):F.w;const g=imgProp(m,'p_'+name,x,base,w,F.b,F);g.layout=1;return g}
/* Pose les décors d'un contrat : les fixes, puis une part des emplacements selon la difficulté.
   Chaque lieu doit rester joignable depuis les autres. */
function applyLayout(m,seed,stars){
  const key=seed+'|'+stars;if(m.layoutKey===key||!m.slots)return;
  const pm=M;M=m;
  m.props=m.props.filter(g=>!g.layout);
  (m.fixed||[]).forEach(f=>flatProp(m,f[0],f[1],f[2],f[3]));
  const rnd=mulberry(seed*13+7),dens=[.45,.65,.85][stars-1];
  const chosen=m.slots.filter(()=>rnd()<dens);
  // deux décors proches en profondeur ne doivent pas se chevaucher à l'écran
  const clash=g=>m.props.some(o=>o!==g&&o.layout&&Math.abs(o.z-g.z)<70&&Math.min(o.bb[2],g.bb[2])-Math.max(o.bb[0],g.bb[0])>10);
  for(const s of chosen){const g=flatProp(m,s[0],s[1],s[2]);if(clash(g)){m.props=m.props.filter(x=>x!==g);continue}m.props.sort((a,b)=>a.z-b.z);m.nav=buildNav(m);
    if(!layoutOk(m)){m.props=m.props.filter(x=>x!==g)}}
  m.props.sort((a,b)=>a.z-b.z);m.nav=buildNav(m);m.layoutKey=key;M=pm;
}
function layoutOk(m){const L=m.locs.map(l=>navNearestFree(l.x,700));
  for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],b=L[j];if(!navLine(a[0],a[1],b[0],b[1])&&!navReach(a[0],a[1],b[0],b[1]))return false}return true}

/* =========================================================
   2. LE PORT AUX MOUETTES
   ========================================================= */
function buildPort(m){
  const rnd=R;
  m.locs=[locDef('capitainerie','Capitainerie','à la Capitainerie',190,'#c8553d'),locDef('poissonnerie','Poissonnerie','à la Poissonnerie',510,'#3e6db3'),locDef('grue','Grue','sous la Grue',820,'#c88a18'),locDef('buvette','Buvette','à la Buvette',1110,'#2f8a6c'),locDef('ferry','Embarcadère','à l\'Embarcadère',1425,'#7a5fae')];
  const sky=skyGrad('#7cb4d2','#bcdbe4','#f1e2c4');
  const cl=[[260,80,.9],[760,50,1],[1300,95,.8]].map(a=>hangCloud(...a));
  const gnd=groundFill('#cdbb9c','#bfb4a2',cobbles(300,rnd),'#bba786','#a99b86');
  const painted=typeof ASSETS!=='undefined'&&!!ASSETS.bg_port;
  if(painted){m.bgImg='bg_port';const L=m.locs;L[0].x=215;L[1].x=529;L[2].x=767;L[3].x=1107;L[4].x=1395}
  const pSky=paintedSky(m,'#6daac9','#a9cfe0');
  const boats=[[330,410,.7,'#d4483b'],[980,395,.55,'#3e6db3'],[640,430,.8,'#e3b44a']];
  const gulls=[0,1,2,3].map(i=>({x:rnd()*1600,y:60+rnd()*160,sp:30+rnd()*30,ph:rnd()*6}));
  m.sky=t=>{if(pSky())return;sky(t);drawSunStick(1460,100,t,'#f6c64e');drawClouds(cl,t);
    // mer en bandes de papier
    ctx.fillStyle='#4f8db3';ctx.fillRect(-900,300,W+1800,180);
    // phare sur son rocher
    ctx.save();ctx.translate(60,0);const rock=P();rock.ellipse(1000,330,70,18,0,Math.PI,0);ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke(rock);ctx.fillStyle='#8f8a80';ctx.fill(rock);
    const tw=P();tw.moveTo(985,325);tw.lineTo(991,230);tw.lineTo(1009,230);tw.lineTo(1015,325);tw.closePath();ctx.stroke(tw);ctx.fillStyle='#fbf6ea';ctx.fill(tw);ctx.fillStyle='#d4483b';ctx.fillRect(989,255,22,12);ctx.fillRect(987,290,26,12);
    ctx.fillStyle='#f6e3a2';ctx.fillRect(990,218,20,14);ctx.fillStyle='#2b2233';const cp=P();cp.moveTo(986,219);cp.lineTo(1000,205);cp.lineTo(1014,219);cp.closePath();ctx.fill(cp);
    const beam=(Math.sin(t*1.2)+1)/2;ctx.fillStyle=`rgba(255,240,170,${.15+beam*.25})`;ctx.beginPath();ctx.moveTo(1000,225);ctx.lineTo(1000-160*(beam*2-1),205);ctx.lineTo(1000-160*(beam*2-1),245);ctx.closePath();ctx.fill();ctx.restore();
    for(let r=0;r<5;r++){const y=315+r*34,off=Math.sin(t*(.6+r*.15)+r)*18;ctx.fillStyle=r%2?'#5c9cc0':'#467fa6';ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-900,y+30);for(let x=-900;x<=W+900;x+=40)ctx.quadraticCurveTo(x+20+off,y-8,x+40+off*0,y);ctx.lineTo(W+900,y+34);ctx.closePath();ctx.fill();ctx.stroke()
      if(r===1||r===3)for(const b of boats)if((r===1)===(b[1]<415))drawBoat(b[0]+Math.sin(t*.3+b[0])*25,b[1]+Math.sin(t*1.4+b[0])*3,b[2],b[3],t)}
    for(const g of gulls){const x=((g.x+t*g.sp)%1900)-150,y=g.y+Math.sin(t*1.5+g.ph)*10,f=Math.sin(t*8+g.ph)*6;ctx.strokeStyle='#2b2233';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-14,y-f);ctx.quadraticCurveTo(x-6,y-6,x,y);ctx.quadraticCurveTo(x+6,y-6,x+14,y-f);ctx.stroke()}
    gnd();
    ctx.fillStyle='#a99b86';ctx.fillRect(-900,470,W+1800,22);ctx.fillStyle='#c9bda8';ctx.fillRect(-900,466,W+1800,7);
  };
  const BG=m.bg;
  // capitainerie
  {const bb=[90,240,300,500];const r=P();r.moveTo(100,330);r.lineTo(190,268);r.lineTo(280,330);r.closePath();add(BG,r,'#c8553d',bb);add(BG,rr(110,330,160,160,2),'#ece4d2',bb);
    windows(BG,110,270,330,420,'#ece4d2',rnd);add(BG,rr(172,420,36,70,[16,16,0,0]),'#3e6db3',bb,3,0);signBoard(BG,190,412,150,'CAPITAINERIE','#2b2233','#fbf6ea',15,bb);
    add(BG,rr(290,250,4,240,0),'#5d5470',bb,2);[['#d4483b',262],['#f3c34a',282],['#3e6db3',302],['#fbf6ea',322]].forEach(([c,y])=>{const f=P();f.moveTo(294,y);f.lineTo(318,y+8);f.lineTo(294,y+16);f.closePath();add(BG,f,c,bb,2,0)})}
  // poissonnerie
  {const bb=[420,350,600,500];add(BG,rr(434,410,152,80,2),'#d7cdb9',bb);awning(BG,426,594,384,420,'#3e6db3','#fbf6ea',bb);signBoard(BG,510,376,170,'POISSONNERIE','#fbf6ea','#3e6db3',15,bb);
    add(BG,rr(430,456,160,34,3),'#8a5a3c',bb);add(BG,rr(436,448,148,12,3),'#e9f3f6',bb,2,0);
    [[452,'#9fb8c9'],[480,'#e08aa0'],[508,'#f3c34a'],[536,'#9fb8c9'],[562,'#d4483b']].forEach(([x,c])=>{const f=P();f.ellipse(x,450,11,5,0,0,7);f.moveTo(x+10,450);f.lineTo(x+17,444);f.lineTo(x+17,456);f.closePath();add(BG,f,c,bb,2,0)})}
  // grue + conteneurs
  {const bb=[690,200,1000,500];add(BG,rr(800,236,40,258,0),'#e3b44a',bb);const lat=P();for(let y=246;y<486;y+=24){lat.moveTo(803,y);lat.lineTo(837,y+24);lat.moveTo(837,y);lat.lineTo(803,y+24)}
    BG.push({p:lat,f:'#b88a2a',bb,ol:0,sh:0,stroke:3});
    add(BG,rr(690,232,300,16,0),'#e3b44a',bb);add(BG,rr(690,248,40,30,2),'#5d5470',bb);add(BG,rr(808,270,30,24,3),'#fbf6ea',bb,3,0);
    [[860,420,'#d4483b'],[920,420,'#3e6db3'],[880,380,'#2f8a6c']].forEach(([x,y,c])=>{add(BG,rr(x,y,58,40,2),c,bb);for(let i=1;i<5;i++)add(BG,rr(x+i*11.6,y+4,2,32,0),shade(c,-.25),bb,0,0)});
    signBoard(BG,760,450,90,'DOCKS','#2b2233','#e3b44a',18,bb)}
  // buvette
  {const bb=[1040,360,1180,500];add(BG,rr(1060,404,100,86,3),'#f1d68f',bb);add(BG,rr(1072,420,76,30,3),'#5b3a30',bb,0,0);const rf=P();rf.moveTo(1050,404);for(let x=1050;x<1170;x+=20)rf.arc(x+10,404,10,Math.PI,0,true);rf.lineTo(1170,392);rf.lineTo(1050,392);rf.closePath();add(BG,rf,'#d4483b',bb);signBoard(BG,1110,384,110,'BUVETTE','#fbf6ea','#d4483b',17,bb)}
  // embarcadère : billetterie + ferry (dessiné dans dyn)
  {const bb=[1350,380,1460,500];add(BG,rr(1360,412,66,78,3),'#cfe3ea',bb);add(BG,rr(1368,428,50,24,3),'#2b2233',bb,0,0);signBoard(BG,1393,402,84,'FERRY','#7a5fae','#fbf6ea',17,bb)}
  m.dyn=t=>{ // ferry à quai + crochet de grue
    if(m.bgImg&&SPR.img[m.bgImg])return;
    if(vis([1400,330,1620,480])){const y=Math.sin(t*1.2)*2.5;ctx.save();ctx.translate(0,y);const hull=P();hull.moveTo(1440,440);hull.lineTo(1620,440);hull.lineTo(1600,474);hull.lineTo(1458,474);hull.closePath();ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.stroke(hull);ctx.fillStyle='#fbf6ea';ctx.fill(hull);ctx.fillStyle='#d4483b';ctx.fillRect(1452,458,160,8);
      const cab=rr(1480,400,100,40,4);ctx.stroke(cab);ctx.fillStyle='#e9e2d0';ctx.fill(cab);ctx.fillStyle='#2b2233';for(let i=0;i<4;i++)ctx.fillRect(1490+i*22,410,14,12);const fu=rr(1540,368,20,32,2);ctx.stroke(fu);ctx.fillStyle='#d4483b';ctx.fill(fu);
      for(let i=0;i<3;i++){const k=(t*.4+i/3)%1;ctx.fillStyle=`rgba(240,240,240,${.7*(1-k)})`;ctx.beginPath();ctx.arc(1550-k*30,362-k*60,8+k*12,0,7);ctx.fill()}ctx.restore();
      ctx.fillStyle='#8a5a3c';ctx.fillRect(1430,462,40,6)}
    if(vis([900,240,1000,420])){const a=Math.sin(t*.8)*.12;ctx.save();ctx.translate(950,248);ctx.rotate(a);ctx.strokeStyle='#2b2233';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,110);ctx.stroke();const cr=rr(-22,110,44,30,2);ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke(cr);ctx.fillStyle='#8a5a3c';ctx.fill(cr);ctx.restore()}
  };
  // décors de quai
  if(painted){
    m.fixed=[['casier',90],['cordage',602],['casier',997],['cordage',1510]].map(([n,x])=>[n,x,910,1]);
    m.slots=[['lampe_quai',360,600],['lampe_quai',640,600],['lampe_quai',1000,600],['lampe_quai',1300,600],
      ['caisses',420,718],['casier',1180,718],['cordage',800,792],['banc',1000,792],
      ['tonneau',780,700],['bitte',560,640],['tonneau',1460,700],['caisses',230,700],['bitte',1110,648]];
    return}
  [330,665,985,1300].forEach(x=>{const g=grp(m,528,[x-14,500,x+14,528]);add(g.items,rr(x-9,506,18,22,[6,6,2,2]),'#2b2233');add(g.items,rr(x-12,504,24,5,2),'#3a3038')});
  [[300,652],[1265,655]].forEach(([x,z])=>{const g=grp(m,z,[x-50,560,x+50,z]);add(g.items,rr(x-46,z-46,46,46,2),'#a8714a');add(g.items,rr(x,z-46,46,46,2),'#8a5a3c');add(g.items,rr(x-24,z-90,46,44,2),'#a8714a');
    [[x-46,z-46],[x,z-46],[x-24,z-90]].forEach(([cx,cy])=>{add(g.items,rr(cx+4,cy+20,38,3,0),'#6b4a2e',null,0,0)});g.block.push([x-46,z-90,x+46,z])});
  [[655,618],[960,622]].forEach(([x,z])=>{const g=grp(m,z,[x-30,560,x+30,z]);add(g.items,rr(x-22,z-52,44,52,10),'#8a5a3c');add(g.items,rr(x-24,z-42,48,5,1),'#3a3038',null,0,0);add(g.items,rr(x-24,z-15,48,5,1),'#3a3038',null,0,0);g.block.push([x-22,z-52,x+22,z])});
  [[1040,600],[1185,600]].forEach(([x,z])=>{const g=grp(m,z,[x-50,470,x+50,z]);add(g.items,rr(x-2,500,4,z-500,1),'#3a3038');const pa=P();pa.moveTo(x-46,512);pa.quadraticCurveTo(x,470,x+46,512);pa.closePath();add(g.items,pa,'#d4483b');const s=P();s.moveTo(x-16,500);s.lineTo(x,478);s.lineTo(x+16,500);s.lineTo(x,512);s.closePath();add(g.items,s,'#fbf6ea',null,0,0);
    add(g.items,rr(x-3,z-34,6,34,1),'#3a3038');const tb=P();tb.ellipse(x,z-34,22,6,0,0,7);add(g.items,tb,'#fbf6ea');g.block.push([x-22,z-40,x+22,z])});
  lamp(m,345,603,'#2b3a4a');lamp(m,1290,603,'#2b3a4a');
  // premier plan : caisses et cordages
  [[0,170],[560,680],[930,1050],[1430,1600]].forEach(([x0,x1])=>{const g=grp(m,905,[x0-10,770,x1+10,905]);
    for(let x=x0;x<x1-30;x+=56){add(g.items,rr(x,812,52,90,2),'#a8714a');add(g.items,rr(x+4,840,44,3,0),'#6b4a2e',null,0,0)}
    const c=P();c.ellipse(x0+(x1-x0)/2,808,30,10,0,0,7);c.moveTo(x0+(x1-x0)/2+18,808);c.ellipse(x0+(x1-x0)/2,808,18,6,0,0,7);add(g.items,c,'#d9c08a');g.block.push([x0,800,x1,905])});
}
function drawBoat(x,y,s,col,t){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.rotate(Math.sin(t*1.3+x)*.04);
  const h=P();h.moveTo(-50,0);h.lineTo(50,0);h.lineTo(36,22);h.lineTo(-38,22);h.closePath();ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.stroke(h);ctx.fillStyle=col;ctx.fill(h);
  ctx.fillStyle='#3a3038';ctx.fillRect(-2,-90,4,90);const sl=P();sl.moveTo(4,-86);sl.lineTo(44,-6);sl.lineTo(4,-6);sl.closePath();ctx.stroke(sl);ctx.fillStyle='#fbf6ea';ctx.fill(sl);
  const s2=P();s2.moveTo(-4,-70);s2.lineTo(-34,-6);s2.lineTo(-4,-6);s2.closePath();ctx.stroke(s2);ctx.fillStyle='#f1e8d4';ctx.fill(s2);ctx.restore()}

/* =========================================================
   3. LA FÊTE FORAINE (au crépuscule)
   ========================================================= */
function buildFoire(m){
  const rnd=R;
  const painted=typeof ASSETS!=='undefined'&&!!ASSETS.bg_foire;
  if(painted){
    m.locs=[locDef('carrousel','Carrousel','au Carrousel',360,'#c88a18'),locDef('roulotte','Roulotte','à la Roulotte',680,'#7a5fae'),locDef('tir','Stand de tir','au Stand de tir',965,'#2f8a6c'),locDef('barbe','Barbe à papa','à la Barbe à papa',1209,'#d1608a'),locDef('canards','Pêche aux canards','à la Pêche aux canards',1453,'#3e6db3')];
    m.bgImg='bg_foire';const pSky=paintedSky(m,'#4f4378','#5a4c84');
    m.sky=t=>{if(!pSky()){ctx.fillStyle='#5a4c84';ctx.fillRect(-900,-900,W+1800,1800)}};
    m.fixed=[[90],[602],[997],[1510]].map(([x])=>['paille',x,910,1]);
    m.slots=[['guirlande',520,600],['guirlande',830,600],['guirlande',1090,600],['guirlande',1330,600],
      ['chariot_barbe',300,712],['chariot_glace',1250,712],['banc_rouge',640,792],['banc_rouge',1000,792],
      ['tonneau_pommes',640,700],['tonneau_pommes',960,700],['paille',150,690],['paille',1460,688],['tonneau_pommes',1185,630]];
    return}
  m.locs=[locDef('roue','Grande roue','à la Grande roue',200,'#c8553d'),locDef('carrousel','Carrousel','au Carrousel',520,'#c88a18'),locDef('tir','Stand de tir','au Stand de tir',820,'#2f8a6c'),locDef('barbe','Barbe à papa','à la Barbe à papa',1110,'#d1608a'),locDef('cirque','Chapiteau','au Chapiteau',1425,'#7a5fae')];
  const sky=skyGrad('#2c2550','#7a4f86','#f2a07a');
  const stars=[];for(let i=0;i<70;i++)stars.push([rnd()*1900-150,-250+rnd()*450,rnd()*6,.8+rnd()*1.6]);
  const hl=hills([['#5b3f6b',430,50],['#47355a',452,36]],480);
  const conf=[P(),P(),P(),P()];for(let i=0;i<260;i++){const y=500+Math.pow(rnd(),1.2)*395,x=rnd()*W,s=.5+(y-480)/420;conf[i%4].rect(x,y,5*s,3*s)}
  m.sky=t=>{sky(t);
    for(const[x,y,p,r]of stars){ctx.fillStyle=`rgba(255,248,220,${.45+.45*Math.sin(t*2+p)})`;ctx.fillRect(x,y,r,r)}
    // lune sur tige
    ctx.strokeStyle='#6b5a4a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(1240,-900);ctx.lineTo(1240,60);ctx.stroke();
    ctx.save();ctx.translate(1240,105);ctx.rotate(Math.sin(t*.5)*.08);const mo=P();mo.arc(0,0,44,0,7);ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.stroke(mo);ctx.fillStyle='#f4e9c4';ctx.fill(mo);ctx.fillStyle='#ded2a8';[[-12,-10,8],[14,8,6],[-4,18,5]].forEach(([x,y,r])=>{ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill()});ctx.restore();
    drawHills(hl);
    // grande roue
    const cx=200,cy=250,R0=170,a=t*.18;ctx.lineCap='round';
    ctx.strokeStyle='#fff';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(110,490);ctx.lineTo(cx,cy);ctx.lineTo(290,490);ctx.stroke();ctx.strokeStyle='#5d5470';ctx.lineWidth=5;ctx.stroke();
    ctx.lineWidth=7;ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(cx,cy,R0,0,7);ctx.stroke();ctx.lineWidth=4;ctx.strokeStyle='#e3b44a';ctx.stroke();
    ctx.lineWidth=2;ctx.strokeStyle='rgba(251,246,234,.8)';for(let i=0;i<12;i++){const b=a+i/12*Math.PI*2;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(b)*R0,cy+Math.sin(b)*R0);ctx.stroke()}
    for(let i=0;i<12;i++){const b=a+i/12*Math.PI*2,x=cx+Math.cos(b)*R0,y=cy+Math.sin(b)*R0;const g=rr(x-13,y,26,22,[3,3,9,9]);ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke(g);ctx.fillStyle=['#d4483b','#3e6db3','#e3b44a','#2f8a6c'][i%4];ctx.fill(g)}
    ctx.fillStyle='#e3b44a';ctx.beginPath();ctx.arc(cx,cy,12,0,7);ctx.fill();
    // sol
    ctx.fillStyle='#6f9a52';ctx.fillRect(-900,468,W+1800,26);ctx.fillStyle='#c49a64';ctx.fillRect(-900,492,W+1800,410);
    ['#e3b44a','#d4483b','#3e6db3','#f1e8d4'].forEach((c,i)=>{ctx.fillStyle=c;ctx.globalAlpha=.55;ctx.fill(conf[i])});ctx.globalAlpha=1;
  };
  const BG=m.bg;
  signBoard(BG,200,452,150,'GRANDE ROUE','#d4483b','#fbf6ea',16,[110,420,290,470]);
  add(BG,rr(160,462,80,30,3),'#fbf6ea',[110,420,290,495]);
  // carrousel
  {const bb=[390,240,650,500];add(BG,rr(400,470,240,24,4),'#d4483b',bb);add(BG,rr(400,470,240,5,0),'#e3b44a',bb,0,0);add(BG,rr(515,330,10,140,0),'#e3b44a',bb,2);
    const rf=P();rf.moveTo(392,345);rf.lineTo(520,280);rf.lineTo(648,345);rf.closePath();add(BG,rf,'#fbf6ea',bb);
    for(let i=0;i<8;i+=2){const s=P();s.moveTo(520,280);s.lineTo(392+i*32,345);s.lineTo(392+(i+1)*32,345);s.closePath();add(BG,s,'#d4483b',bb,0,0)}
    const va=P();va.moveTo(392,345);for(let x=392;x<648;x+=16)va.arc(x+8,345,8,Math.PI,0,true);va.lineTo(648,338);va.lineTo(392,338);va.closePath();add(BG,va,'#e3b44a',bb);
    signBoard(BG,520,272,130,'CARROUSEL','#2b2233','#e3b44a',16,bb)}
  // stand de tir
  {const bb=[720,330,920,500];add(BG,rr(730,384,180,108,2),'#2f8a6c',bb);add(BG,rr(744,396,152,58,2),'#1d3b33',bb,0,0);awning(BG,722,918,356,388,'#2f8a6c','#fbf6ea',bb);
    add(BG,rr(726,456,188,36,3),'#8a5a3c',bb);signBoard(BG,820,348,90,'TIR','#fbf6ea','#d4483b',22,bb)}
  // barbe à papa
  {const bb=[1040,330,1180,500];add(BG,rr(1062,430,96,52,4),'#f6c5d6',bb);for(let i=0;i<4;i++)add(BG,rr(1068+i*24,432,12,48,0),'#fbf6ea',bb,0,0);
    [[1076],[1144]].forEach(([x])=>{const w=P();w.arc(x,486,10,0,7);add(BG,w,'#2b2233',bb,3)});add(BG,rr(1108,370,4,60,0),'#3a3038',bb,2);
    const um=P();um.moveTo(1060,382);um.quadraticCurveTo(1110,340,1160,382);um.closePath();add(BG,um,'#e08aa0',bb);
    [[1080,412],[1100,404],[1124,410],[1142,414]].forEach(([x,y])=>{const c=P();c.arc(x,y,12,0,7);c.moveTo(x+8,y+4);c.arc(x+4,y+6,9,0,7);add(BG,c,'#f8b8d0',bb,3,0);add(BG,rr(x-1,y+12,2,18,0),'#fbf6ea',bb,0,0)});
    signBoard(BG,1110,334,150,'BARBE À PAPA','#fbf6ea','#d1608a',15,bb)}
  // chapiteau
  {const bb=[1290,200,1560,500];const tn=P();tn.moveTo(1290,492);tn.quadraticCurveTo(1330,330,1425,250);tn.quadraticCurveTo(1520,330,1560,492);tn.closePath();add(BG,tn,'#fbf6ea',bb);
    for(let i=0;i<6;i++){if(i%2)continue;const s=P();const x0=1290+i*45,x1=1290+(i+1)*45;s.moveTo(1425,250);s.lineTo(x0,492);s.lineTo(x1,492);s.closePath();add(BG,s,'#d4483b',bb,0,0)}
    add(BG,rr(1395,410,60,82,[30,30,0,0]),'#2b2233',bb,3,0);add(BG,rr(1423,200,4,52,0),'#3a3038',bb,2);signBoard(BG,1425,396,120,'CIRQUE','#e3b44a','#2b2233',20,bb)}
  // guirlandes lumineuses (dessinées au fond)
  const posts=[[-40,330],[345,402],[670,402],[960,402],[1290,402],[1640,330]];
  m.dyn=t=>{
    // chevaux du carrousel
    if(vis([390,330,650,480]))for(let i=0;i<3;i++){const x=440+i*80,y=420+Math.sin(t*2+i*2)*14;ctx.strokeStyle='#e3b44a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,348);ctx.lineTo(x,470);ctx.stroke();
      const hs=P();hs.ellipse(x,y,22,11,0,0,7);hs.moveTo(x+14,y-6);hs.lineTo(x+26,y-24);hs.lineTo(x+32,y-16);hs.lineTo(x+22,y);hs.closePath();hs.rect(x-16,y+6,4,18);hs.rect(x+12,y+6,4,18);ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke(hs);ctx.fillStyle=['#fbf6ea','#c49a64','#2b2233'][i];ctx.fill(hs);ctx.fillStyle='#d4483b';ctx.fillRect(x-8,y-12,14,6)}
    // canards du stand de tir
    if(vis([740,390,900,460]))for(let i=0;i<5;i++){const x=744+((t*40+i*36)%170),y=440;if(x>890)continue;const d=P();d.ellipse(x,y,11,7,0,0,7);d.moveTo(x+12,y-10);d.arc(x+7,y-10,6,0,7);ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke(d);ctx.fillStyle='#e3b44a';ctx.fill(d);ctx.fillStyle='#d4483b';ctx.fillRect(x+12,y-11,6,3)}
    // guirlandes
    for(let k=0;k<posts.length-1;k++){const[a,ay]=posts[k],[b,by]=posts[k+1];if(!vis([a,ay-10,b,ay+70]))continue;ctx.strokeStyle='#2b2233';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(a,ay);ctx.quadraticCurveTo((a+b)/2,Math.max(ay,by)+60,b,by);ctx.stroke();
      for(let i=1;i<10;i++){const u=i/10,x=lerp(lerp(a,(a+b)/2,u),lerp((a+b)/2,b,u),u),y=lerp(lerp(ay,Math.max(ay,by)+60,u),lerp(Math.max(ay,by)+60,by,u),u);const on=Math.sin(t*3+i+k*2)>-.3;
        ctx.fillStyle=on?['#ffd977','#ff8f7a','#9fe0ff'][i%3]:'#5d5470';if(on){ctx.globalAlpha=.3;ctx.beginPath();ctx.arc(x,y+4,10,0,7);ctx.fill();ctx.globalAlpha=1}ctx.beginPath();ctx.arc(x,y+4,4,0,7);ctx.fill()}}
    // drapeau du chapiteau
    if(vis([1420,190,1480,230])){ctx.fillStyle='#e3b44a';ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(1427,202);for(let i=0;i<=6;i++)ctx.lineTo(1427+i*6,206+Math.sin(t*6+i)*3);ctx.lineTo(1463,218);for(let i=6;i>=0;i--)ctx.lineTo(1427+i*6,220+Math.sin(t*6+i)*3);ctx.closePath();ctx.stroke();ctx.fill()}
  };
  [345,670,960,1290].forEach(x=>{const g=grp(m,604,[x-12,395,x+12,604]);add(g.items,rr(x-3,400,6,204,2),'#5d5470');add(g.items,rr(x-8,596,16,8,2),'#5d5470');const c=P();c.arc(x,400,6,0,7);add(g.items,c,'#e3b44a')});
  // ballons, bottes de foin, poubelle à confettis
  {const x=660,g=grp(m,640,[x-50,470,x+50,640]);add(g.items,rr(x-20,600,40,40,4),'#8a5a3c');const st=P();[[-24,500],[0,486],[24,502],[-10,520],[14,524]].forEach(([dx,y])=>{st.moveTo(x,600);st.lineTo(x+dx,y+20)});g.items.push({p:st,f:'#3a3038',ol:0,sh:0,stroke:1.5});
    [[-24,500,'#d4483b'],[0,486,'#3e6db3'],[24,502,'#e3b44a'],[-10,520,'#2f8a6c'],[14,524,'#e08aa0']].forEach(([dx,y,c])=>{const b=P();b.ellipse(x+dx,y,14,17,0,0,7);add(g.items,b,c)});g.block.push([x-38,470,x+38,640])}
  [[985,650],[1270,660]].forEach(([x,z])=>{const g=grp(m,z,[x-50,600,x+50,z]);add(g.items,rr(x-44,z-36,88,36,8),'#e3c46e');for(let i=1;i<4;i++)add(g.items,rr(x-40,z-36+i*9,80,2,0),'#c9a24a',null,0,0);g.block.push([x-44,z-36,x+44,z])});
  // barrières au premier plan
  [[0,175],[545,670],[930,1060],[1425,1600]].forEach(([x0,x1])=>{const g=grp(m,905,[x0-10,770,x1+10,905]);
    for(let x=x0;x<x1;x+=36){add(g.items,rr(x,800,32,100,2),(x/36|0)%2?'#fbf6ea':'#d4483b')}add(g.items,rr(x0-4,796,x1-x0+8,10,3),'#e3b44a');g.block.push([x0,796,x1,905])});
}
