/* ---------- Images intégrées (décor peint, éléments de décor) ---------- */
const SPR={img:{}};
Object.keys(ASSETS).forEach(k=>{const im=new Image();im.onload=()=>{SPR.img[k]=im};im.src=ASSETS[k].src});
/* =========================================================
   PANTINS EN PAPIER (v2)
   Chaque pièce = une forme fermée : liseré blanc découpé (toute la silhouette),
   remplissage, puis trait d'encre. Profil tourné vers la droite.
   Repères conservés pour les tics : épaule (8,-82), cou (0,-88), centre de tête (0,-104), main (15,-48).
   ========================================================= */
const INK='#2b2233';
const COIFF_H=['court','raie','chauve','moustache','barbe'],COIFF_F=['carre','chignon','boucles','ondules','queue'];
const NEUTRAL={bob:0,lean:0,sq:1,arm:0,head:0,hat:0,stride:0,tap:0,swing:0};
const CIG=rr(13,-53,10,2.6,1);
function coiffOf(L){if(!L.coiff){const h=(L.hair+L.skin+L.manteau+L.chapeau).split('').reduce((a,c)=>a*31+c.charCodeAt(0)>>>0,7);L.coiff=(L.genre==='femme'?COIFF_F:COIFF_H)[h%5]}return L.coiff}

function rig(L){
  if(L._rig)return L._rig;
  const fem=L.genre==='femme',coat=COATS[L.manteau],trench=L.manteau==='trench';
  const lit=shade(coat,.14),dim=shade(coat,-.16),deep=shade(coat,-.32);
  // q : forme ; o : liseré blanc ; k : trait d'encre
  const Q=(arr,p,f,o=1,k=1)=>arr.push({p,f,o,k});
  const body=[],arm=[],back=[],head=[],hair=[],hat=[],accB=[],accF=[];

  /* ---- corps ---- */
  const b=P();
  if(fem){b.moveTo(-8,-89);b.quadraticCurveTo(-16,-89,-16.5,-80);b.lineTo(-14.5,-63);b.quadraticCurveTo(-22,-46,-25.5,-31);b.quadraticCurveTo(-26,-27,-21.5,-27);b.lineTo(23,-27);b.quadraticCurveTo(27,-27,26,-31);b.quadraticCurveTo(22,-46,15,-63);b.lineTo(16,-80);b.quadraticCurveTo(15.5,-89,8,-89)}
  else{b.moveTo(-9,-89);b.quadraticCurveTo(-18,-89,-19,-80);b.quadraticCurveTo(-21,-56,-21.5,-34);b.quadraticCurveTo(-21.5,-29.5,-17,-29.5);b.lineTo(18,-29.5);b.quadraticCurveTo(22,-29.5,21.5,-34);b.quadraticCurveTo(21,-58,18,-80);b.quadraticCurveTo(17,-89,8,-89)}
  b.closePath();Q(body,b,coat);
  // volume : côté arrière dans l'ombre, liseré de lumière devant
  const sh=P();
  if(fem){sh.moveTo(-8,-89);sh.quadraticCurveTo(-16,-89,-16.5,-80);sh.lineTo(-14.5,-63);sh.quadraticCurveTo(-22,-46,-25.5,-31);sh.quadraticCurveTo(-26,-27,-21.5,-27);sh.lineTo(-11,-27);sh.quadraticCurveTo(-7,-48,-6,-63);sh.lineTo(-5,-88)}
  else{sh.moveTo(-9,-89);sh.quadraticCurveTo(-18,-89,-19,-80);sh.quadraticCurveTo(-21,-56,-21.5,-34);sh.quadraticCurveTo(-21.5,-29.5,-17,-29.5);sh.lineTo(-9,-29.5);sh.quadraticCurveTo(-7,-60,-5,-88)}
  sh.closePath();Q(body,sh,dim,0,0);
  const hl=P();if(fem){hl.moveTo(13.5,-80);hl.lineTo(12.8,-64);hl.quadraticCurveTo(19,-47,22.5,-31);hl.lineTo(25,-31);hl.quadraticCurveTo(21.5,-46,15,-63);hl.lineTo(16,-80);hl.closePath()}
  else{hl.moveTo(15.5,-80);hl.quadraticCurveTo(18.5,-58,19,-34);hl.lineTo(21,-34);hl.quadraticCurveTo(21,-58,18,-80);hl.closePath()}
  Q(body,hl,lit,0,0);
  // col, chemise, cravate / col rond
  if(fem){const nk=P();nk.moveTo(-6,-89);nk.quadraticCurveTo(0,-81,7,-89);nk.closePath();Q(body,nk,L.skin,0,0);
    const cl=P();cl.moveTo(-8,-89);cl.quadraticCurveTo(0,-78,9,-89);cl.quadraticCurveTo(10,-85,7,-83.5);cl.quadraticCurveTo(0,-79.5,-6,-84);cl.closePath();Q(body,cl,'#fbf6ea',0,1);
    const bl=P();bl.moveTo(-14.3,-65);bl.lineTo(14.8,-65);bl.lineTo(15,-60.5);bl.lineTo(-14.6,-60.5);bl.closePath();Q(body,bl,deep,0,1)}
  else{const sht=P();sht.moveTo(-1,-89);sht.lineTo(4,-75);sht.lineTo(8,-89);sht.closePath();Q(body,sht,'#fbf6ea',0,0);
    const tie=P();tie.moveTo(2.4,-88);tie.lineTo(5.6,-88);tie.lineTo(5,-78.5);tie.lineTo(4,-76.5);tie.lineTo(3,-78.5);tie.closePath();Q(body,tie,L.hatc==='#e8dcc2'?'#7a2f3a':L.hatc,0,0);
    const lp=P();lp.moveTo(-3,-89);lp.lineTo(4,-72);lp.lineTo(1,-79);lp.lineTo(-4,-82);lp.closePath();Q(body,lp,trench?'#e2cfa6':lit,0,1);
    const lp2=P();lp2.moveTo(9,-89);lp2.lineTo(4,-72);lp2.lineTo(8.5,-78);lp2.lineTo(12.5,-81);lp2.closePath();Q(body,lp2,trench?'#e2cfa6':lit,0,1)}
  const bt=P();for(const y of fem?[-72,-55]:[-64,-51,-38]){bt.moveTo(9.8,y);bt.arc(8,y,1.8,0,7)}Q(body,bt,deep,0,0);
  if(!fem){const pk=P();pk.moveTo(10,-44);pk.lineTo(18.5,-44);pk.lineTo(18.6,-41.5);pk.lineTo(10,-41.5);pk.closePath();Q(body,pk,dim,0,1)}
  if(trench){const bl=P();bl.moveTo(-20.4,-58);bl.lineTo(19.8,-58);bl.lineTo(19.9,-53.5);bl.lineTo(-20.7,-53.5);bl.closePath();Q(body,bl,'#8a6f45',0,1)}

  /* ---- bras arrière (derrière le corps) ---- */
  const ab=P();ab.moveTo(-15,-86);ab.quadraticCurveTo(-9,-90,-4,-85);ab.lineTo(-7.5,-54);ab.lineTo(-16.5,-55.5);ab.closePath();Q(back,ab,deep);
  const hb=P();hb.ellipse(-11.5,-50,4.2,4.8,.15,0,7);Q(back,hb,shade(L.skin,-.14));

  /* ---- bras avant + objets tenus ---- */
  if(L.acc==='parapluie'){const u=P();u.moveTo(15.5,-50);u.quadraticCurveTo(26.5,-28,25.5,-4);u.lineTo(21,-4);u.quadraticCurveTo(14,-28,15.5,-50);u.closePath();Q(accB,u,'#2b2233');const h2=P();h2.moveTo(14.4,-61);h2.quadraticCurveTo(14,-67,18,-66.5);h2.lineTo(17.8,-64.5);h2.quadraticCurveTo(16.2,-64.5,16.6,-61);h2.lineTo(16.6,-50);h2.lineTo(14.4,-50);h2.closePath();Q(accB,h2,'#6b4a2e');const tp=P();tp.moveTo(22.4,-4);tp.lineTo(24,-4);tp.lineTo(23.5,1);tp.lineTo(22.8,1);tp.closePath();Q(accB,tp,'#c9a24a',1,0)}
  if(L.acc==='canne'){const c=P();c.moveTo(14.5,-50);c.lineTo(18.2,0);c.lineTo(21,0);c.lineTo(17.4,-50);c.closePath();Q(accB,c,'#6b4a2e');const k=P();k.moveTo(11.2,-50.5);k.quadraticCurveTo(11,-57.5,16.5,-57.5);k.quadraticCurveTo(20.5,-57,20,-51.5);k.lineTo(17.5,-51.5);k.quadraticCurveTo(17.8,-54.8,16.2,-54.8);k.quadraticCurveTo(13.8,-54.8,14,-50.5);k.closePath();Q(accB,k,'#6b4a2e')}
  if(L.acc==='valise'){const h2=P();h2.moveTo(12,-45);h2.lineTo(12,-48.5);h2.quadraticCurveTo(12,-50.5,14.5,-50.5);h2.lineTo(19.5,-50.5);h2.quadraticCurveTo(22,-50.5,22,-48.5);h2.lineTo(22,-45);h2.lineTo(20,-45);h2.lineTo(20,-48.3);h2.lineTo(14,-48.3);h2.lineTo(14,-45);h2.closePath();Q(accB,h2,'#4a3020');Q(accB,rr(4,-45,27,20,3),'#8a5a3c');const st=P();st.rect(9,-45,2.4,20);st.rect(24,-45,2.4,20);Q(accB,st,'#6b4428',0,0);const lk=P();lk.rect(16,-41.5,3,2.6);Q(accB,lk,'#e3b44a',0,0)}
  const ar=P();ar.moveTo(2.5,-86);ar.quadraticCurveTo(9,-91,14.5,-85);ar.quadraticCurveTo(18.5,-70,20,-55);ar.lineTo(10.5,-53);ar.quadraticCurveTo(8,-70,2.5,-86);ar.closePath();Q(arm,ar,coat);
  const asd=P();asd.moveTo(2.5,-86);asd.quadraticCurveTo(8,-70,10.5,-53);asd.lineTo(13.5,-53.6);asd.quadraticCurveTo(11.5,-70,6.5,-87.5);asd.closePath();Q(arm,asd,dim,0,0);
  const cf=P();cf.moveTo(10.2,-56.5);cf.lineTo(19.7,-58.3);cf.lineTo(20,-55);cf.lineTo(10.5,-53);cf.closePath();Q(arm,cf,deep,0,1);
  const th=P();th.ellipse(19.5,-49.5,2.3,3.1,-.5,0,7);Q(arm,th,L.skin);
  const hd=P();hd.ellipse(15.2,-48,4.6,5.2,.1,0,7);Q(arm,hd,L.skin);
  if(L.acc==='journal'){Q(accF,rr(9,-78,24,31,2),'#f4efe2');const ln=P();ln.rect(12,-74,18,2.4);for(let i=0;i<4;i++)ln.rect(12,-69+i*5,i%2?10:15,1.4);Q(accF,ln,'#9a92a0',0,0);const ph=P();ph.rect(24,-68,6,8);Q(accF,ph,'#c9c2cf',0,0);accF.push({p:hd,f:L.skin,o:0,k:1})}
  if(L.acc==='bouquet'){const s=P();s.moveTo(12,-50);s.lineTo(18,-64);s.lineTo(24,-50);s.closePath();Q(accF,s,'#9cc58e');const lv=P();lv.ellipse(13,-60,2,4,-.6,0,7);lv.ellipse(23,-60,2,4,.6,0,7);Q(accF,lv,'#6fa05f',0,1);
    [[14,-66,'#e08aa0'],[21,-68,'#f3c34a'],[18,-61.5,'#d4483b'],[25,-62,'#fbf6ea'],[17,-71,'#8b5aa8']].forEach(([x,y,c])=>{const f=P();f.arc(x,y,4.4,0,7);Q(accF,f,c);const d=P();d.arc(x,y,1.3,0,7);Q(accF,d,'#f3c34a',0,0)});accF.push({p:hd,f:L.skin,o:0,k:1})}

  /* ---- tête : une seule forme, nez compris ---- */
  const R0=17.5,cy=-104;
  const h=P();h.moveTo(R0*Math.cos(.30),cy+R0*Math.sin(.30));h.arc(0,cy,R0,.30,Math.PI*2-.12);
  h.bezierCurveTo(21.5,cy-3.2,22.5,cy+4,R0*Math.cos(.30),cy+R0*Math.sin(.30));h.closePath();Q(head,h,L.skin);
  const jaw=P();jaw.moveTo(-14,cy+9);jaw.quadraticCurveTo(-4,cy+19,9,cy+15.5);jaw.quadraticCurveTo(0,cy+20.5,-9,cy+15);jaw.closePath();Q(head,jaw,shade(L.skin,-.07),0,0);
  const ck=P();ck.ellipse(11,-97.5,3.2,2.4,0,0,7);Q(head,ck,'rgba(220,100,100,.35)',0,0);
  const ey=P();ey.ellipse(7,-106,1.9,3.3,0,0,7);ey.ellipse(12.6,-106,1.9,3.3,0,0,7);Q(head,ey,INK,0,0);
  const sp=P();sp.arc(7.6,-107.4,.75,0,7);sp.arc(13.2,-107.4,.75,0,7);Q(head,sp,'#fff',0,0);
  head.push({line:1,p:(()=>{const m=P();m.moveTo(10,-96.2);m.quadraticCurveTo(12,-95,14,-96.6);return m})(),f:INK,w:1.1});
  // oreille (visible si les cheveux la dégagent)
  const ear=P();ear.ellipse(-3.5,-102,3.2,4.2,0,0,7);
  /* ---- coiffures ---- */
  const co=coiffOf(L),hc=L.hair;
  const hr=P();
  if(co==='court'||co==='moustache'){hr.moveTo(11,-115);hr.quadraticCurveTo(13,-119.5,7,-121.2);hr.quadraticCurveTo(-6,-124.5,-14.5,-115.5);hr.quadraticCurveTo(-19,-107,-16.5,-96.5);hr.quadraticCurveTo(-13,-94.5,-10.5,-96);hr.quadraticCurveTo(-11,-104,-6.5,-109);hr.quadraticCurveTo(1,-113.5,11,-115);hr.closePath()}
  if(co==='degarni'){hr.moveTo(-4,-110.5);hr.quadraticCurveTo(-13,-113,-16.8,-106);hr.quadraticCurveTo(-18.5,-100,-16,-95.5);hr.quadraticCurveTo(-12.5,-94,-10.5,-96);hr.quadraticCurveTo(-11,-104,-4,-110.5);hr.closePath()}
  if(co==='carre'){hr.moveTo(12.5,-114);hr.quadraticCurveTo(13,-121,4,-122.2);hr.quadraticCurveTo(-11,-124,-17.5,-112);hr.quadraticCurveTo(-21,-101,-18.5,-89.5);hr.quadraticCurveTo(-12,-87,-6.5,-90);hr.quadraticCurveTo(-8,-100,-4.5,-108);hr.quadraticCurveTo(3,-111.5,12.5,-114);hr.closePath()}
  if(co==='chignon'){hr.moveTo(12,-114.5);hr.quadraticCurveTo(12.5,-121,3,-122.2);hr.quadraticCurveTo(-11,-123.5,-16.5,-112);hr.quadraticCurveTo(-18.5,-104,-15.5,-97.5);hr.quadraticCurveTo(-12,-97,-10.5,-99);hr.quadraticCurveTo(-10,-106,-4,-110);hr.quadraticCurveTo(3,-112.5,12,-114.5);hr.closePath();
    const bun=P();bun.arc(-17,-113.5,6.6,0,7);Q(hair,bun,hc)}
  if(co==='boucles'){hr.moveTo(12.5,-114);hr.quadraticCurveTo(13,-121,4,-122.5);hr.quadraticCurveTo(-11,-124.5,-17,-113);
    for(let i=0;i<4;i++){const y=-110+i*6;hr.quadraticCurveTo(-23.5,y+1,-19,y+4.5)}hr.quadraticCurveTo(-13,-88.5,-8,-91.5);hr.quadraticCurveTo(-9,-101,-4.5,-108);hr.quadraticCurveTo(3,-111.5,12.5,-114);hr.closePath()}
  Q(hair,hr,hc);
  const shn=P();shn.moveTo(-2,-120.5);shn.quadraticCurveTo(4,-121.5,8,-119.5);shn.quadraticCurveTo(3,-119.2,-2,-118.5);shn.closePath();Q(hair,shn,shade(hc,.22),0,0);
  if(!fem&&co!=='carre'){Q(hair,ear,shade(L.skin,-.06));hair[hair.length-1].ear=1}
  if(co==='moustache'){const mu=P();mu.moveTo(13.5,-99);mu.quadraticCurveTo(19.5,-100.5,21,-97.5);mu.quadraticCurveTo(18,-96,14.5,-96.8);mu.quadraticCurveTo(12.5,-97,13.5,-99);mu.closePath();Q(hair,mu,hc);hair[hair.length-1].mu=1}
  const br=P();br.moveTo(5,-111.2);br.quadraticCurveTo(7,-112.6,9.2,-111.8);br.moveTo(11,-111.8);br.quadraticCurveTo(13,-112.6,15,-111.2);hair.push({line:1,brow:1,p:br,f:shade(hc,-.2),w:1.3});

  /* ---- chapeaux : pièces séparées, chacune avec son trait ---- */
  const c0=L.hatc,c1=shade(c0,-.18);
  if(L.chapeau==='melon'){const cr=P();cr.moveTo(-15,-118);cr.quadraticCurveTo(-15,-135,0,-135.5);cr.quadraticCurveTo(15,-135,15,-118);cr.closePath();Q(hat,cr,c0);
    Q(hat,rr(-15,-123,30,4.2,1),shade(c0,.32),0,1);const br2=P();br2.ellipse(0,-117.5,23.5,4.4,0,0,7);Q(hat,br2,c1)}
  if(L.chapeau==='beret'){const p=P();p.ellipse(-3,-120.5,20.5,8.5,-.13,0,7);Q(hat,p,c0);const n=P();n.moveTo(-1,-128);n.quadraticCurveTo(0,-133,3,-131.5);n.quadraticCurveTo(2,-129.5,1.5,-127.5);n.closePath();Q(hat,n,c0);const f=P();f.ellipse(1,-121.5,12,4,-.1,0,7);Q(hat,f,shade(c0,.15),0,0)}
  if(L.chapeau==='casquette'){const p=P();p.moveTo(-17,-114);p.quadraticCurveTo(-16,-131,1,-130.5);p.quadraticCurveTo(17,-129.5,17,-116);p.closePath();Q(hat,p,c0);
    const v=P();v.moveTo(9,-117);v.quadraticCurveTo(24,-118.5,31.5,-115.5);v.quadraticCurveTo(29,-112,9,-112.5);v.closePath();Q(hat,v,c1);const bt2=P();bt2.arc(0,-130,1.8,0,7);Q(hat,bt2,c1,0,0)}
  if(L.chapeau==='haut'){Q(hat,rr(-13,-154,26,37,2),c0);Q(hat,rr(-13,-126.5,26,6,0),'#d4483b',0,1);const br2=P();br2.ellipse(0,-117,22.5,4.4,0,0,7);Q(hat,br2,c1);Q(hat,rr(-11,-152,4,30,1),shade(c0,.18),0,0)}
  if(L.chapeau==='cloche'){const p=P();p.moveTo(-19.5,-108);p.quadraticCurveTo(-21,-134,0,-135);p.quadraticCurveTo(21,-134,19.5,-108);p.quadraticCurveTo(25,-106.5,24,-102.5);p.lineTo(-24,-102.5);p.quadraticCurveTo(-25,-106.5,-19.5,-108);p.closePath();Q(hat,p,c0);
    Q(hat,rr(-20.5,-115,41,5,1.5),'#e08aa0',0,1);const fl=P();fl.arc(15,-112.5,3.4,0,7);Q(hat,fl,'#fbf6ea');const fc=P();fc.arc(15,-112.5,1.2,0,7);Q(hat,fc,'#f3c34a',0,0)}

  /* ---- jambes (origine à la hanche) ---- */
  const leg=P(),shoe=P();
  if(fem){leg.moveTo(-3,0);leg.lineTo(3,0);leg.lineTo(2.6,25);leg.lineTo(-2.6,25);leg.closePath();
    shoe.moveTo(-3.4,24.5);shoe.lineTo(3.2,24.5);shoe.quadraticCurveTo(8.5,25.5,9,28.6);shoe.lineTo(9,29.5);shoe.lineTo(-1,29.5);shoe.lineTo(-1.5,27.6);shoe.lineTo(-3.4,29.5);shoe.lineTo(-4,29.5);shoe.closePath()}
  else{leg.moveTo(-4.2,0);leg.lineTo(4.2,0);leg.lineTo(3.8,26.5);leg.lineTo(-3.8,26.5);leg.closePath();
    shoe.moveTo(-4.5,25.5);shoe.lineTo(3.5,25.5);shoe.quadraticCurveTo(10.5,25.8,10.8,29.4);shoe.lineTo(10.8,31);shoe.lineTo(-4.5,31);shoe.closePath()}
  const legCol=fem?shade(L.skin,-.08):L.pants;
  L._rig={body,back,arm:accB.concat(arm,accF),accB,accF,armOnly:arm,head,hair,hat,fem,leg,shoe,legCol,hipY:fem?-29.5:-31,lh:fem?29.5:31};
  return L._rig;
}


/* =========================================================
   PANTINS EN IMAGES (pièces Gemini), recolorés et animés
   ========================================================= */
const CHARK=['h_head','h_neck','h_body','h_arm','h_leg','f_head','f_neck','f_body','f_arm','f_leg'];
const charReady=()=>typeof CHARGEO!=='undefined'&&CHARK.every(k=>SPR.img['c_'+k]&&SPR.img['k_'+k]);
const TINTC=new Map(),SILC=new Map();
const hexRGB=h=>{const n=parseInt(h.slice(1),16);return[n>>16,n>>8&255,n&255]};
function tintPiece(key,cloth,skin,shoe){
  const id=key+'|'+cloth+'|'+skin+'|'+(shoe||'');let cv=TINTC.get(id);if(cv)return cv;
  const im=SPR.img['c_'+key],mk=SPR.img['k_'+key];cv=document.createElement('canvas');cv.width=im.naturalWidth;cv.height=im.naturalHeight;const x=cv.getContext('2d');
  x.imageSmoothingEnabled=false;x.drawImage(mk,0,0,cv.width,cv.height);x.imageSmoothingEnabled=true;const M=x.getImageData(0,0,cv.width,cv.height).data;x.clearRect(0,0,cv.width,cv.height);x.drawImage(im,0,0);
  const d=x.getImageData(0,0,cv.width,cv.height),q=d.data,C=hexRGB(cloth),K=hexRGB(skin),S=hexRGB(shoe||'#2a2028');
  for(let i=0;i<q.length;i+=4){if(!q[i+3])continue;const cl=Math.round(M[i]/60);if(cl===3||cl===0)continue;
    const L=(q[i]+q[i+1]+q[i+2])/3;
    if(cl===4){const o=(L-172)*.85;q[i]=clamp(S[0]+o,0,255);q[i+1]=clamp(S[1]+o,0,255);q[i+2]=clamp(S[2]+o,0,255);continue}  // chaussures : décalage, garde lacets et coutures
    const T=cl===2?K:C;let f=L/(cl===2?218:184);const hi=f>1?(f-1)*110:0;
    q[i]=Math.min(255,T[0]*f+hi);q[i+1]=Math.min(255,T[1]*f+hi);q[i+2]=Math.min(255,T[2]*f+hi)}
  x.putImageData(d,0,0);TINTC.set(id,cv);return cv}
function silPiece(key,col,pw){ // silhouette élargie (liseré blanc / ombre)
  const id=key+'|'+col;let o=SILC.get(id);if(o)return o;
  const im=SPR.img['c_'+key],B=Math.max(2,Math.round(pw));const cv=document.createElement('canvas');cv.width=im.naturalWidth+2*B;cv.height=im.naturalHeight+2*B;const x=cv.getContext('2d');
  for(let a=0;a<24;a++){const t=a/24*Math.PI*2;x.drawImage(im,B+Math.cos(t)*B,B+Math.sin(t)*B)}x.drawImage(im,B,B);
  x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,cv.width,cv.height);o={cv,B};SILC.set(id,o);return o}


/* ---------- anti-pixellisation : versions réduites progressives (mipmaps) ---------- */
const MIPS=new WeakMap();
function mipDraw(c,src,x,y,w,h){
  const T=c.getTransform(),sc=Math.hypot(T.a,T.b)||1,tw=Math.abs(w*sc);
  let lv=MIPS.get(src);if(!lv){lv=[src];MIPS.set(src,lv)}
  let cur=src,i=0;const W0=src.naturalWidth||src.width;
  while((cur.naturalWidth||cur.width)>tw*1.6&&(cur.naturalWidth||cur.width)>8){i++;
    if(!lv[i]){const pw=cur.naturalWidth||cur.width,ph=cur.naturalHeight||cur.height,cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(pw/2));cv.height=Math.max(1,Math.round(ph/2));
      const x2=cv.getContext('2d');x2.imageSmoothingEnabled=true;x2.imageSmoothingQuality='high';x2.drawImage(cur,0,0,cv.width,cv.height);lv[i]=cv}
    cur=lv[i]}
  c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(cur,x,y,w,h)}
/* ---------- calques images : coiffures, chapeaux, objets ---------- */
const GREYC=new Map();
function tintGrey(key,col,ref){const id=key+'|'+col;let cv=GREYC.get(id);if(cv)return cv;const im=SPR.img[key];cv=document.createElement('canvas');cv.width=im.naturalWidth;cv.height=im.naturalHeight;
  const x=cv.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,cv.width,cv.height),q=d.data,C=hexRGB(col);
  for(let i=0;i<q.length;i+=4){if(!q[i+3])continue;const L=(q[i]+q[i+1]+q[i+2])/3;if(L<42)continue;const f=L/ref,hi=f>1?(f-1)*90:0,w=Math.min(1,(L-42)/48);  // fondu vers l'encre : pas de mouchetis sur les rubans sombres
    for(let k=0;k<3;k++)q[i+k]=q[i+k]*(1-w)+Math.min(255,C[k]*f+hi)*w}
  x.putImageData(d,0,0);GREYC.set(id,cv);return cv}
function silImg(key,col,pw){const id='s|'+key+'|'+col;let o=SILC.get(id);if(o)return o;const im=SPR.img[key],B=Math.max(2,Math.round(pw));const cv=document.createElement('canvas');cv.width=im.naturalWidth+2*B;cv.height=im.naturalHeight+2*B;const x=cv.getContext('2d');
  for(let a=0;a<24;a++){const t=a/24*Math.PI*2;x.drawImage(im,B+Math.cos(t)*B,B+Math.sin(t)*B)}x.drawImage(im,B,B);x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,cv.width,cv.height);o={cv,B};SILC.set(id,o);return o}
/* dessine une image dans un rectangle monde, en mode ombre / liseré / remplissage */
function layImg(c,key,x,y,w,h,mode,fill){const im=SPR.img[key];if(!im)return;
  if(mode==='fill'){mipDraw(c,fill||im,x,y,w,h);return}
  const ppw=im.naturalWidth/w,s=silImg(key,mode==='ol'?'#fff':'rgba(40,22,10,.17)',2.3*ppw),pad=s.B/ppw;mipDraw(c,s.cv,x-pad,y-pad,w+2*pad,h+2*pad)}
/* cheveux sous un chapeau : on retire ce qui dépasse au-dessus du bord inférieur du chapeau
   (derrière le chapeau, la limite redescend doucement : les cheveux longs sortent de dessous),
   puis on encre la coupe pour qu'elle ait l'air d'un vrai bord. Calculé une fois par combinaison. */
function hairUnder(g,co,hat){const key='yu_'+g+'_'+co+'_'+hat;if(SPR.img[key])return key;
  const hk='y_'+g+'_'+co,HK='y_h_'+hat,A=ASSETS[hk],B=ASSETS[HK],im=SPR.img[hk];if(!A||!B||!B.bot||!im||!hasImg(HK))return null;
  const G=CHARGEO[g],H0=CHARGEO.h.head,kh=H0.rect[2]/HEADPX.h,sc=g==='f'?G.head.r/H0.r:1,k=G.head.rect[2]/HEADPX[g],R=G.head.rect;
  const nW=im.naturalWidth,nH=im.naturalHeight;
  // monde (repère tête) -> pixels du calque de cheveux
  const toPx=(x,y)=>[((x-R[0])/k-A.x0)/A.w*nW,((y-R[1])/k-A.y0)/A.h*nH];
  const hatW=(xf,yf)=>{let x=H0.rect[0]+(B.x0+xf*B.w)*kh,y=H0.rect[1]+(B.y0+yf*B.h)*kh;if(g==='f'){x=G.head.top[0]+(x-H0.top[0])*sc;y=G.head.top[1]+(y-H0.top[1])*sc}return[x,y]};
  const bot=B.bot.map(q=>hatW(q[0],q[1])),b0=bot[0],bn=bot[bot.length-1];
  const pts=[[b0[0]-80,b0[1]+80*HU_SLOPE],...bot.map(q=>[q[0],q[1]-1.5]),[bn[0]+80,bn[1]-.6]].map(q=>toPx(q[0],q[1]));
  const q=co==='queue',ex=q?Math.round(nH*.7):0,big=nH*4,cv=document.createElement('canvas');cv.width=nW;cv.height=nH+ex;const x=cv.getContext('2d');  // la queue descendue peut dépasser du calque d'origine
  if(q)lowTail(x,im,nW,nH,pts.slice(1),toPx(0,0)[1]-toPx(0,-1.2)[1],pts[1][0]);else x.drawImage(im,0,0);
  if(q)pts[0]=[pts[1][0],-nH*3],pts.unshift([-nW*2,-nH*3]);   // derrière le chapeau, la queue reste entière
  const path=new Path2D();path.moveTo(pts[0][0],big);for(const q of pts)path.lineTo(q[0],q[1]);path.lineTo(pts[pts.length-1][0],big);path.closePath();
  cutInk(x,nW,nH+ex,path,nW/(A.w*k));
  cv.naturalWidth=nW;cv.naturalHeight=nH+ex;SPR.img[key]=cv;ASSETS[key]={x0:A.x0,y0:A.y0,w:A.w,h:A.h*(nH+ex)/nH};return key}
const HU_SLOPE=.45;
/* préparation en tâche de fond de toutes les combinaisons (une par tick) : pas d'à-coup quand un PNJ apparaît */
(function warmHair(){const todo=[];for(const h of ['melon','beret','casquette','haut','cloche','canotier']){for(const co of COIFF_H)if(co!=='chauve')todo.push(['h',co,h]);for(const co of COIFF_F)todo.push(['f',co,h])}
  const step=()=>{if(!todo.length)return;if(typeof CHARGEO==='undefined'||!charReady()){setTimeout(step,200);return}const[g,co,h]=todo.shift();try{hairUnder(g,co,h)}catch(e){}setTimeout(step,todo.length?40:0)};setTimeout(step,600)})();
/* coupe propre : garde la zone 'path', arrondit les angles vifs créés par la coupe (ouverture morphologique
   limitée au voisinage de la coupe) et encre uniquement le bord coupé (pas le contour naturel des cheveux). */
function cutInk(x,W,H,path,ppu){
  const img=x.getImageData(0,0,W,H),q=img.data,N=W*H,a0=new Uint8Array(N);for(let i=0;i<N;i++)a0[i]=q[i*4+3];
  const mc=document.createElement('canvas');mc.width=W;mc.height=H;const m=mc.getContext('2d');m.fill(path);const K=m.getImageData(0,0,W,H).data;
  const keep=new Uint8Array(N),rem=new Uint8Array(N);for(let i=0;i<N;i++){const k=K[i*4+3]>127;keep[i]=a0[i]>90&&k;rem[i]=a0[i]>40&&!k}
  const r=Math.max(2,Math.round(1.3*ppu)),wi=Math.max(1.5,1.25*ppu),zr=r*2+2;
  const disk=R=>{const o=[];for(let j=-R;j<=R;j++)for(let i=-R;i<=R;i++)if(i*i+j*j<=R*R+R*.6)o.push([i,j]);return o};
  const D=disk(r),DZ=disk(zr),Dw=disk(Math.ceil(wi+1));
  const zone=new Uint8Array(N);
  for(let y=1;y<H-1;y++)for(let x0=1;x0<W-1;x0++){const p=y*W+x0;if(rem[p]&&(keep[p-1]||keep[p+1]||keep[p-W]||keep[p+W]))for(const[i,j]of DZ){const X=x0+i,Y=y+j;if(X>=0&&Y>=0&&X<W&&Y<H)zone[Y*W+X]=1}}
  // ouverture (érosion puis dilatation) dans la zone
  const er=new Uint8Array(N);
  for(let y=0;y<H;y++)for(let x0=0;x0<W;x0++){const p=y*W+x0;if(!zone[p]){er[p]=keep[p];continue}if(!keep[p])continue;let ok=1;
    for(const[i,j]of D){const X=x0+i,Y=y+j;if(X<0||Y<0||X>=W||Y>=H||!(keep[Y*W+X]||(!zone[Y*W+X]&&a0[Y*W+X]>90))){ok=0;break}}er[p]=ok}
  const op=new Uint8Array(N);
  for(let y=0;y<H;y++)for(let x0=0;x0<W;x0++){const p=y*W+x0;if(!zone[p]){op[p]=1;continue}if(!keep[p])continue;
    for(const[i,j]of D){const X=x0+i,Y=y+j;if(X>=0&&Y>=0&&X<W&&Y<H&&er[Y*W+X]){op[p]=1;break}}}
  // alpha final
  const fin=new Uint8Array(N);for(let i=0;i<N;i++)fin[i]=zone[i]?(keep[i]&&op[i]?a0[i]:0):(K[i*4+3]>127?a0[i]:Math.round(a0[i]*K[i*4+3]/255));
  // encre : pixels gardés proches d'un pixel de cheveu retiré
  for(let y=0;y<H;y++)for(let x0=0;x0<W;x0++){const p=y*W+x0;if(!fin[p]||!zone[p])continue;let dm=99;
    for(const[i,j]of Dw){const X=x0+i,Y=y+j;if(X>=0&&Y>=0&&X<W&&Y<H){const t=Y*W+X;if(a0[t]>40&&!fin[t]){const d=Math.hypot(i,j);if(d<dm)dm=d}}}
    if(dm<=wi+1){const w=dm<=wi?1:wi+1-dm;q[p*4]=q[p*4]*(1-w)+42*w;q[p*4+1]=q[p*4+1]*(1-w)+34*w;q[p*4+2]=q[p*4+2]*(1-w)+38*w}}
  for(let i=0;i<N;i++)q[i*4+3]=fin[i];x.putImageData(img,0,0)}
/* queue de cheval sous un chapeau : la queue (et son élastique) est tassée vers le bas
   juste assez pour sortir de sous le bord du chapeau, ancrée sur sa pointe. */
function lowTail(x,im,nW,nH,pts,mg,bx){
  const T=[[0,0],[.425,0],[.425,.22],[.325,.22],[.31,1],[0,1]].map(q=>[q[0]*nW,q[1]*nH]); // zone queue + élastique
  const tp=new Path2D();tp.moveTo(T[0][0],T[0][1]);for(const q of T.slice(1))tp.lineTo(q[0],q[1]);tp.closePath();
  const mk=f=>{const c=document.createElement('canvas');c.width=nW;c.height=nH;const y=c.getContext('2d');y.drawImage(im,0,0);y.globalCompositeOperation=f;y.fill(tp);return c};
  const tail=mk('destination-in'),rest=mk('destination-out');
  const cut=px=>{if(px<=pts[0][0])return pts[0][1];for(let i=1;i<pts.length;i++)if(px<=pts[i][0]){const a=pts[i-1],b=pts[i],t=(px-a[0])/((b[0]-a[0])||1);return a[1]+(b[1]-a[1])*t}return pts[pts.length-1][1]};
  // on descend la queue juste assez pour que tout ce qui est sous le chapeau (colonnes du chapeau) passe sous son bord
  // plus elle descend, plus elle se rapproche de la nuque (le crâne se creuse sous l'arrière de la tête)
  const d=tail.getContext('2d').getImageData(0,0,nW,nH).data;let dy=0,dx=0;
  for(let it=0;it<3;it++){let m=0;for(let i=0;i<nW;i++){const X=i+dx;if(X<bx)continue;for(let j=0;j<nH;j++)if(d[(j*nW+i)*4+3]>40){m=Math.max(m,cut(X)+mg-j);break}}dy=m;dx=dy*.32}
  // au-delà de ~36 unités (un demi-crâne), on tasse au lieu de descendre (sous une cloche, la queue ne doit pas tomber jusqu'aux reins)
  let top=nH,yb=0;for(let j=0;j<nH;j++)for(let i=0;i<nW;i++)if(d[(j*nW+i)*4+3]>40){top=Math.min(top,j);yb=Math.max(yb,j)}
  const dmax=mg/1.2*36;x.drawImage(rest,0,0);
  if(dy<=dmax)x.drawImage(tail,dx,dy);else{const f=(yb+dmax-top-dy)/(yb-top),a=top+dy-f*top;x.drawImage(tail,dx,a,nW,nH*f)}return dy}
/* objets tenus : point de prise (px de l'image d'origine), échelle monde/px, suspendu ou non */
const OBJ={parapluie:{gx:60,gy:105,s:.056,hang:1,back:1},canne:{gx:72,gy:24,s:.052,hang:1,back:1},valise:{gx:165,gy:18,s:.088,hang:1,back:1},
  journal:{gx:95,gy:240,s:.074,rot:-.15,back:1},bouquet:{gx:115,gy:250,s:.09,rot:-.2,back:1},cigarette:{gx:12,gy:17,s:.026},montre:{gx:140,gy:150,s:.036},pigeon:{gx:220,gy:318,s:.055}};
const hasImg=k=>!!SPR.img[k];
function drawObj(c,name,mode,armA){const O=OBJ[name],key='o_'+name,A=ASSETS[key];if(!A||!hasImg(key))return false;
  c.save();if(O.hang)c.rotate(-armA);if(O.rot)c.rotate(O.rot);c.scale(O.s,O.s);layImg(c,key,-O.gx,-O.gy,A.w,A.h,mode);c.restore();return true}
/* pastille noire « ? » (parties inconnues de la cible) */
const MASKC='#1b1820';
function qmark(c,x,y,r,mode,flip){if(mode==='sh'){c.fillStyle='rgba(40,22,10,.17)';c.beginPath();c.arc(x,y,r,0,7);c.fill();return}
  if(mode==='ol'){c.save();c.strokeStyle='#fff';c.lineWidth=4.6;c.beginPath();c.arc(x,y,r,0,7);c.stroke();c.restore();return}
  c.fillStyle=MASKC;c.beginPath();c.arc(x,y,r,0,7);c.fill();qtext(c,x,y,r,flip)}
function qtext(c,x,y,r,flip){c.save();c.translate(x,y);c.scale(flip<0?-1:1,1);c.fillStyle='#fff';c.font=`700 ${(r*1.35).toFixed(1)}px 'Stardos Stencil', serif`;c.textAlign='center';c.textBaseline='middle';c.fillText('?',0,r*.08);c.restore()}
let CURFLIP=1;
function drawPersonSprite(c,L,po,Rg,MK){
  MK=MK||{};const fem=L.genre==='femme',g=fem?'f':'h',G=CHARGEO[g],coat=MK.coat?MASKC:COATS[L.manteau];
  const st=po.stride||0,sw=po.swing||0,armFront=(po.arm||0)<-1.5;
  const rot=(P,a)=>{c.translate(P[0],P[1]);c.rotate(a);c.translate(-P[0],-P[1])};
  const piece=(part,rect,mode,cols,dx)=>{const key=g+'_'+part,im=SPR.img['c_'+key];const ppw=im.naturalWidth/rect[2];const x0=rect[0]+(dx||0);
    if(mode==='fill'){mipDraw(c,tintPiece(key,cols[0],cols[1],cols[2]),x0,rect[1],rect[2],rect[3]);return}
    const s=silPiece(key,mode==='ol'?'#fff':'rgba(40,22,10,.17)',2.3*ppw);const pad=s.B/ppw;mipDraw(c,s.cv,x0-pad,rect[1]-pad,rect[2]+2*pad,rect[3]+2*pad)};
  const legCols=front=>[front?L.pants:shade(L.pants,-.25),front?L.skin:shade(L.skin,-.15),front?'#4b3b3d':'#2f2528'];
  const leg=(mode,front)=>{const dx=front?0:-4.2,P=[G.leg.pivot[0]+dx,G.leg.pivot[1]];c.save();rot(P,-(front?1:-1)*st*.42+(front?(po.tap||0):0));piece('leg',G.leg.rect,mode,legCols(front),dx);c.restore()};
  const accS=(L.acc==='canne'||L.acc==='parapluie')?.5:.66;
  const accT=()=>{c.translate(G.arm.hand[0]+1,G.arm.hand[1]+1);c.scale(accS,accS);c.translate(-15.2,48)};
  const arm=(mode,back)=>{const dx=back?.4:0,P=[G.arm.pivot[0]+dx,G.arm.pivot[1]];c.save();rot(P,back?-sw*.75-.02:(po.arm||0)+sw);
    const armA=back?-sw*.75-.02:(po.arm||0)+sw,acc=!MK.acc&&L.acc!=='rien'&&OBJ[L.acc]&&hasImg('o_'+L.acc);
    const busy=(po.arm||0)<-.45,mine=back?(acc&&busy):(acc&&!busy);  // bras levé pour un tic : l'objet passe dans l'autre main
    const atHand=f=>{c.save();c.translate(G.arm.hand[0]+.5,G.arm.hand[1]+1.5);f();c.restore()};
    if(back&&mine)atHand(()=>drawObj(c,L.acc,mode,armA));
    if(!back&&!MK.acc){if(mine&&OBJ[L.acc].back)atHand(()=>drawObj(c,L.acc,mode,armA));else if(!acc){c.save();accT();vecParts(c,Rg.accB,mode);c.restore()}}
    piece('arm',G.arm.rect,mode,back?[shade(coat,-.25),shade(L.skin,-.12)]:[coat,L.skin],dx);
    if(!back){if(MK.acc){if((po.arm||0)>-.45)atHand(()=>qmark(c,2,6,7.5,mode,CURFLIP))}else if(mine&&!OBJ[L.acc].back)atHand(()=>drawObj(c,L.acc,mode,armA));else if(!acc){c.save();accT();vecParts(c,Rg.accF,mode);c.restore()}
      if(po.prop==='watch')atHand(()=>{if(!drawObj(c,'montre',mode,0)&&mode==='fill'){c.fillStyle='#e3b44a';c.beginPath();c.arc(0,-2,3.4,0,7);c.fill()}});
      if(po.prop==='cig')atHand(()=>{c.translate(1,-1);if(!drawObj(c,'cigarette',mode,0)&&mode==='fill'){c.fillStyle='#fbf6ea';c.fillRect(0,-1,8,2)}})}
    c.restore()};
  const headT=()=>rot(G.head.pivot,po.head||0);
  const vecHead=()=>{const r=G.head.r*.8,k=r/17.5;c.translate(G.head.c[0]-G.head.r*.17,G.head.top[1]+r+1);c.scale(k,k);c.translate(0,104)};
  const head=mode=>{c.save();headT();piece('head',G.head.rect,mode,['#bbbbbb',L.skin]);
    const k=G.head.rect[2]/HEADPX[g],co=coiffOf(L);
    const lay=(key,col,ref,hatT)=>{const A=ASSETS[key];if(!A||!hasImg(key))return false;c.save();
      if(hatT&&fem){const H=CHARGEO.h.head;c.translate(G.head.top[0],G.head.top[1]);c.scale(G.head.r/H.r,G.head.r/H.r);c.translate(-H.top[0],-H.top[1])}
      const kk=hatT&&fem?CHARGEO.h.head.rect[2]/HEADPX.h:k,R0=hatT&&fem?CHARGEO.h.head.rect:G.head.rect;
      layImg(c,key,R0[0]+A.x0*kk,R0[1]+A.y0*kk,A.w*kk,A.h*kk,mode,mode==='fill'?tintGrey(key,col,ref):null);c.restore();return true};
    // sous un chapeau : calque de cheveux pré-découpé (bord du chapeau + trait d'encre sur la coupe)
    const HK='y_h_'+L.chapeau,hatOn=L.chapeau!=='aucun'&&!MK.hat&&(po.hat||0)<1;
    if(co!=='chauve'){const hk='y_'+g+'_'+co,uk=hatOn?hairUnder(g,co,L.chapeau):null;
      if(!lay(uk||hk,L.hair,188)){vecHead();vecParts(c,Rg.hair.filter(q=>!q.ear&&!q.brow&&!q.mu),mode)}}
    if(MK.hat){qmark(c,G.head.top[0]-1,G.head.top[1]+G.head.r*.3,G.head.r*.56,mode,CURFLIP)}
    else if(L.chapeau!=='aucun'){c.save();c.translate(0,-(po.hat||0)*.9);c.rotate(-(po.hat||0)*.02);
      if(!lay(HK,MK.hatc?MASKC:L.hatc,170,true)){vecHead();vecParts(c,Rg.hat,mode)}
      if(MK.hatc&&mode==='fill'){const A=ASSETS[HK],kh=CHARGEO.h.head.rect[2]/HEADPX.h,H0=CHARGEO.h.head;let hx=H0.rect[0]+(A.x0+A.w*.45)*kh,hy=H0.rect[1]+(A.y0+A.h*.5)*kh;
        if(fem){const sc=G.head.r/H0.r;hx=G.head.top[0]+(hx-H0.top[0])*sc;hy=G.head.top[1]+(hy-H0.top[1])*sc}qtext(c,hx,hy,G.head.r*.42,CURFLIP)}
      c.restore()}
    c.restore()};
  const neck=mode=>{c.save();headT();piece('neck',G.head.rect,mode,['#bbbbbb',L.skin]);c.restore()};
  const order=mode=>{leg(mode,false);arm(mode,true);leg(mode,true);neck(mode);piece('body',G.body.rect,mode,[coat,L.skin]);if(MK.coat&&mode==='fill'){const B=G.body.rect;qtext(c,B[0]+B[2]*.58,B[1]+B[3]*.5,B[2]*.42,CURFLIP)}if(!armFront)arm(mode,false);head(mode);if(armFront)arm(mode,false)};
  c.lineJoin='round';
  c.save();c.translate(2.6,2.2);c.fillStyle='rgba(40,22,10,.17)';order('sh');c.restore();
  c.strokeStyle='#fff';c.lineWidth=4.6;order('ol');
  order('fill');
}
function vecParts(c,list,mode){for(const q of list){
  if(q.line){if(mode==='fill'){c.strokeStyle=q.f;c.lineWidth=q.w;c.lineCap='round';c.stroke(q.p)}continue}
  if(mode==='sh'){if(q.o){c.save();c.fillStyle='rgba(40,22,10,.17)';c.fill(q.p);c.restore()}}else if(mode==='ol'){if(q.o){c.save();c.strokeStyle='#fff';c.lineWidth=4.6;c.stroke(q.p);c.restore()}}
  else{c.fillStyle=q.f;c.fill(q.p);if(q.k){c.strokeStyle=INK;c.lineWidth=1.35;c.stroke(q.p)}}}}

function drawPerson(c,L,x,y,s,po,flip,ex){
  ex=ex||{};po=po||NEUTRAL;const Rg=rig(L);
  c.save();c.translate(x,y);
  if(!ex.noShadow){c.save();c.translate(-9*s,0);c.scale(1,.24);const g=c.createRadialGradient(4*s,0,1,0,0,30*s);g.addColorStop(0,'rgba(45,28,12,.34)');g.addColorStop(1,'rgba(45,28,12,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,30*s,0,7);c.fill();c.restore()}
  c.scale(s,s*(po.sq||1)*(ex.pop===undefined?1:ex.pop));
  if(ex.rot)c.rotate(ex.rot);
  c.translate(0,-(po.bob||0));c.rotate(po.lean||0);
  let fx=flip===undefined?1:flip;if(Math.abs(fx)<.07)fx=fx<0?-.07:.07;c.scale(fx,1);
  if(charReady()&&!ex.vector){CURFLIP=fx;drawPersonSprite(c,L,po,Rg,ex.mask);c.restore();return}
  const st=po.stride||0,sw=po.swing||0;
  // jambe : rotation à la hanche, le pied se relève un peu quand elle passe derrière
  const legT=(front)=>{const a=(front?1:-1)*st*.42;c.translate(front?4:-4.5,Rg.hipY);c.rotate(-a+(front?(po.tap||0):0))};
  const tBack=()=>{c.translate(-9,-85);c.rotate(-sw);c.translate(9,85)};
  const tArm=()=>{c.translate(8,-82);c.rotate((po.arm||0)+sw);c.translate(-8,82)};
  const tHead=()=>{c.translate(0,-88);c.rotate(po.head||0);c.translate(0,88)};
  const tHat=()=>{tHead();c.translate(0,-(po.hat||0));c.rotate(-(po.hat||0)*.02)};
  const armFront=(po.arm||0)<-1.5;
  const parts=(list,mode)=>{for(const q of list){
    if(q.line){if(mode==='fill'){c.strokeStyle=q.f;c.lineWidth=q.w;c.lineCap='round';c.stroke(q.p)}continue}
    if(mode==='sh'){if(q.o)c.fill(q.p)}else if(mode==='ol'){if(q.o)c.stroke(q.p)}
    else{c.fillStyle=q.f;c.fill(q.p);if(q.k){c.strokeStyle=INK;c.lineWidth=1.35;c.stroke(q.p)}}}};
  const legs=(mode,front)=>{c.save();legT(front);
    if(mode==='sh'){c.fill(Rg.leg);c.fill(Rg.shoe)}else if(mode==='ol'){c.stroke(Rg.leg);c.stroke(Rg.shoe)}
    else{c.fillStyle=front?Rg.legCol:shade(Rg.legCol,-.22);c.fill(Rg.leg);c.strokeStyle=INK;c.lineWidth=1.35;c.stroke(Rg.leg);c.fillStyle=front?'#2a2028':'#1d161c';c.fill(Rg.shoe);c.stroke(Rg.shoe)}
    c.restore()};
  const g=(list,tf,mode)=>{c.save();if(tf)tf();parts(list,mode);
    if(mode==='fill'&&list===Rg.armOnly){if(po.prop==='cig'){c.fillStyle='#fbf6ea';c.fill(CIG);c.fillStyle='#e8743a';c.fillRect(22,-53,2.5,2.6)}
      if(po.prop==='watch'){c.fillStyle='#e3b44a';c.strokeStyle=INK;c.lineWidth=1;c.beginPath();c.arc(13,-56,3.4,0,7);c.fill();c.stroke()}}
    c.restore()};
  const order=mode=>{
    legs(mode,false);g(Rg.back,tBack,mode);legs(mode,true);g(Rg.body,null,mode);
    const armG=()=>{g(Rg.accB,tArm,mode);g(Rg.armOnly,tArm,mode);g(Rg.accF,tArm,mode)};
    if(!armFront)armG();g(Rg.head,tHead,mode);g(Rg.hair,tHead,mode);g(Rg.hat,tHat,mode);if(armFront)armG()};
  c.lineJoin='round';
  c.save();c.translate(2.6,2.2);c.fillStyle='rgba(40,22,10,.16)';order('sh');c.restore();
  c.strokeStyle='#fff';c.lineWidth=4.6;order('ol');
  order('fill');
  c.restore();
}
