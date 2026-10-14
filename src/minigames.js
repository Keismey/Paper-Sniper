/* =========================================================
   ENQUÊTE : 3 mini-jeux (tenue, tic, lieu) puis marché aux indics
   ========================================================= */
let MG=null;
const MG_ORDER=['tenue','tic','lieu'];
const MG_INFO={
  tenue:{n:'Identification',k:'Signalement',d:'Un guetteur a photographié la cible à 9 h. Le cliché sera détruit au bout de quelques secondes. Mémorisez sa tenue, puis établissez le portrait-robot.'},
  tic:{n:'Surveillance',k:'Habitude',d:'Vous observez la cible au téléobjectif depuis l\'immeuble d\'en face. Déclenchez à l\'instant précis où elle trahit une habitude. Les gestes ordinaires ne comptent pas. Vous disposez de trois pellicules.'},
  lieu:{n:'Interception',k:'Rendez-vous',d:'Un coursier transporte le lieu du rendez-vous de midi. Il va se mêler à ses collègues, en uniforme identique. Ne le quittez pas des yeux, puis désignez-le.'},
};
bilf(MG_INFO.tenue,{n:'Identification',k:'Description',d:'A spotter photographed the target at 9 a.m. The print will be destroyed after a few seconds. Memorise the outfit, then build the identikit.'});
bilf(MG_INFO.tic,{n:'Surveillance',k:'Habit',d:'You watch the target through a telephoto lens from the building opposite. Shoot at the exact moment they give away a habit. Ordinary gestures do not count. You have three rolls of film.'});
bilf(MG_INFO.lieu,{n:'Interception',k:'Meeting place',d:'A courier carries the place of the noon meeting. He is about to mingle with his colleagues, all in identical uniforms. Keep your eyes on him, then point him out.'});
const ACCL=bil({parapluie:'Parapluie',journal:'Journal',valise:'Valise',bouquet:'Bouquet',canne:'Canne',rien:'Mains vides'},{parapluie:'Umbrella',journal:'Newspaper',valise:'Suitcase',bouquet:'Bouquet',canne:'Walking stick',rien:'Empty-handed'});
const CHAPL=bil({aucun:'Tête nue',melon:'Melon',beret:'Béret',casquette:'Casquette',haut:'Haut-de-forme',cloche:'Cloche',canotier:'Canotier'},{aucun:'No hat',melon:'Bowler',beret:'Beret',casquette:'Flat cap',haut:'Top hat',cloche:'Cloche',canotier:'Boater'});
/* équilibrage : les indics coûtent cher, et chaque achat d'un même contrat coûte plus que le précédent */
const INFO_PRICE={tenue:.5,tic:.6,lieu:.4},INFO_STEP=[1,1.4,1.8];
const EXTRAS={cafe:bilf({n:'Café noir',d:'Votre souffle tient 50 % plus longtemps pendant ce contrat.',p:60},{n:'Black coffee',d:'Your breath lasts 50% longer during this contract.'}),pot:bilf({n:'Figurant soudoyé',d:'Un sosie de moins sur le terrain.',p:[0,200,260]},{n:'Bribed extra',d:'One fewer double in the field.'})};
const maskFrac=()=>{const m=C.mask;if(!m)return 0;const n=['coat','hat','acc'].filter(k=>m[k]).length+(m.hatc&&!m.hat?1:0);return Math.max(.34,n/3)};
const nBought=()=>['tenue','tic','lieu'].filter(k=>C.bought[k]).length;
const priceOf=id=>Math.round(C.of.prime*INFO_PRICE[id]*INFO_STEP[nBought()]*(id==='tenue'?maskFrac():1)*(1-.25*upg('carnet'))/10)*10;

function startInvestigation(){C.res={};C.step=0;MUS.play('enquete');nextMG()}
function nextMG(){
  closeModals();MG=null;
  if(C.step>=3){showDebrief();return}
  const id=MG_ORDER[C.step],I=MG_INFO[id];
  MODE='mgintro';ui('');
  modal(`${dh(fileNo(C.of),tr(`Enquête, phase ${C.step+1} sur 3`,`Investigation, phase ${C.step+1} of 3`))}<span class="tag">${tr('Objectif : ','Objective: ')}${I.k.toLowerCase()}</span><h2>${I.n}</h2><p>${I.d}</p><div class="btns"><button class="pb red big wide" id="bGo">${tr('Commencer','Begin')}</button></div>`);
  $('bGo').onclick=()=>{SFX.page();closeModals();({tenue:mgTenue,tic:mgTic,lieu:mgLieu})[id]()};
}
function mgDone(id,ok,msg){
  C.res[id]=ok;(ok?SFX.good:SFX.bad)();
  const v=modal(`<span class="stamp ${ok?'ok':''}">${ok?tr('Acquis','Secured'):tr('Perdu','Lost')}</span>${dh(fileNo(C.of),tr(`Phase ${C.step+1} sur 3`,`Phase ${C.step+1} of 3`))}<span class="tag">${MG_INFO[id].n}</span><h2>${ok?tr('Information acquise','Intel secured'):tr('Information perdue','Intel lost')}</h2><p>${msg}</p>
    <div class="btns"><button class="pb red big wide" id="bNx">${C.step<2?tr('Phase suivante','Next phase'):tr('Synthèse','Summary')}</button></div>`);
  $('bNx').onclick=()=>{SFX.page();C.step++;nextMG()};
}

/* ---------- cadre photo pour les mini-jeux sur le canevas ---------- */
function mgView(){const top=Math.max(84,SH*.13),bot=Math.max(150,SH*.24);return{x:14,y:top,w:SW-28,h:SH-top-bot}}
function mgCork(){const g=ctx.createRadialGradient(SW/2,SH*.22,10,SW/2,SH*.3,Math.max(SW,SH)*.8);g.addColorStop(0,'#3a3529');g.addColorStop(.55,'#1d1c22');g.addColorStop(1,'#121219');ctx.fillStyle=g;ctx.fillRect(0,0,SW,SH)}
function mgWorld(cam,npcs,t,after){
  const V=mgView(),k=V.w/cam.w;
  mgCork();
  ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(V.x-6,V.y-2,V.w+12,V.h+18);
  ctx.fillStyle='#f4f2ea';ctx.fillRect(V.x-8,V.y-8,V.w+16,V.h+16);
  ctx.save();ctx.beginPath();ctx.rect(V.x,V.y,V.w,V.h);ctx.clip();
  ctx.translate(V.x+V.w/2,V.y+V.h/2);ctx.scale(k,k);ctx.translate(-cam.x,-cam.y);
  VIEW=[cam.x-cam.w/2-60,cam.y-V.h/k/2-60,cam.x+cam.w/2+60,cam.y+V.h/k/2+60];
  TNOW=t;drawScene(t,npcs);if(after)after(k);
  ctx.restore();
  ctx.fillStyle=paperPattern();ctx.fillRect(V.x,V.y,V.w,V.h);
  return{V,k};
}
function mgScreenToWorld(cam,sx,sy){const V=mgView(),k=V.w/cam.w;return{x:cam.x+(sx-V.x-V.w/2)/k,y:cam.y+(sy-V.y-V.h/2)/k}}

/* =========================================================
   1. LE PORTRAIT-ROBOT (mémoire)
   ========================================================= */
function mgTenue(){
  MODE='desk';
  const ph=C.photos[0];if(!ph.base)renderPhotoBase(ph);
  const T=C.T,st=C.st,showT=[4.2,3.2,2.4][st-1]*(1-.05*(C.lv||0));  // le cliché s'efface plus vite quand le grade monte
  const others=ph.people.filter(p=>!p.isT).map(p=>p.look);
  const opts=(val,pool,all,n)=>{const s=[val];for(const v of shuffle(pool.slice()))if(!s.includes(v)&&s.length<n)s.push(v);for(const v of shuffle(all.slice()))if(!s.includes(v)&&s.length<n)s.push(v);return shuffle(s)};
  const n=[4,5,5][st-1];
  const fields=[
    {id:'manteau',l:tr('Manteau','Coat'),o:opts(T.manteau,others.map(l=>l.manteau),COATK,n),sw:v=>COATS[v],lab:v=>COATN[v]},
    {id:'chapeau',l:tr('Chapeau','Hat'),o:opts(T.chapeau,others.map(l=>l.chapeau),CHAP.filter(c=>T.genre==='femme'||c!=='cloche'),n),lab:v=>CHAPL[v]},
    {id:'acc',l:tr('En main','Holding'),o:opts(T.acc,others.map(l=>l.acc),ACC,n),lab:v=>ACCL[v]},
  ];
  if(st===3&&T.chapeau!=='aucun')fields.push({id:'hatc',l:tr('Couleur du chapeau','Hat colour'),o:opts(T.hatc,others.map(l=>l.hatc),HATC,4),sw:v=>v,lab:v=>HATCN[v]});
  const pick_={};
  ui(`<div id="desk"><div class="note">${tr('<b>Mémorisez sa tenue.</b> La cible est entourée en rouge.','<b>Memorise the outfit.</b> The target is circled in red.')}</div>
    <div class="pola" id="pola"><canvas id="pc" width="${PW}" height="${PH}"></canvas><div class="cap"><span>${tr(['9h00','10h00','11h00'],['9:00 a.m.','10:00 a.m.','11:00 a.m.'])[ph.hour]} — ${M.locs[ph.li].name}</span><span id="pt"></span></div></div>
    <div class="tbar"><i id="tb"></i></div>
    <div id="form" hidden>${dh(tr('Portrait-robot','Identikit'),tr('Phase 1 sur 3','Phase 1 of 3'))}${fields.map(f=>`<div class="fld"><b>${f.l}</b><div class="chs">${f.o.map(v=>`<button class="chp" data-f="${f.id}" data-v="${v}">${f.sw?`<i style="background:${f.sw(v)}"></i>`:''}${f.lab(v)}</button>`).join('')}</div></div>`).join('')}
    <div class="btns"><button class="pb red big wide" id="bVal" disabled>${tr('Valider le portrait','Submit identikit')}</button></div></div></div>`);
  const pc=$('pc'),x=pc.getContext('2d');x.drawImage(ph.base,0,0);
  const p=ph.people.find(q=>q.isT),s=scaleAt(p.y),q=worldToPhoto(ph,p.x,p.y-72*s);
  x.strokeStyle='#d4483b';x.lineWidth=6;x.beginPath();x.ellipse(q.x,q.y,46*s*1.6,92*s*1.6,-.08,-.3,Math.PI*2.05);x.stroke();
  let t0=performance.now(),done=false;
  const tick=()=>{if(done||MODE!=='desk'||!$('tb'))return;const e=(performance.now()-t0)/1000;$('tb').style.width=Math.max(0,100-e/showT*100)+'%';$('pt').textContent=Math.max(0,showT-e).toFixed(1)+' s';
    if(e>=showT){done=true;SFX.shutter();x.fillStyle='#1f1e29';x.fillRect(0,0,PW,PH);x.save();x.translate(PW/2,PH/2);x.rotate(-.08);x.fillStyle='#b3261e';x.font="700 54px 'Stardos Stencil', serif";x.textAlign='center';const lbl=tr('CLICHÉ DÉTRUIT','PRINT DESTROYED'),tw=x.measureText(lbl).width;x.strokeStyle='#b3261e';x.lineWidth=7;x.strokeRect(-tw/2-28,-50,tw+56,100);x.fillText(lbl,0,19);x.restore();
      $('pt').textContent='';$('form').hidden=false;$('form').scrollIntoView({behavior:'smooth',block:'start'});return}
    requestAnimationFrame(tick)};
  requestAnimationFrame(tick);
  UI.querySelectorAll('.chp').forEach(b=>b.onclick=()=>{SFX.tap();pick_[b.dataset.f]=b.dataset.v;UI.querySelectorAll(`.chp[data-f="${b.dataset.f}"]`).forEach(o=>o.classList.toggle('on',o===b));$('bVal').disabled=fields.some(f=>!pick_[f.id])});
  $('bVal').onclick=()=>{
    const bad=fields.filter(f=>pick_[f.id]!==String(T[f.id])),isBad=id=>bad.some(f=>f.id===id);
    const hatAsked=fields.some(f=>f.id==='hatc');
    C.mask={coat:isBad('manteau')&&C.st>1,hat:isBad('chapeau'),hatc:isBad('chapeau')||(hatAsked&&isBad('hatc')),acc:isBad('acc')};
    if(!C.mask.coat&&!C.mask.hat&&!C.mask.hatc&&!C.mask.acc)C.mask=null;
    const nm=f=>f.l.toLowerCase(),known=fields.filter(f=>!isBad(f.id)).map(nm);
    // seul le choix du joueur est corrigé : la bonne réponse n'est jamais révélée
    UI.querySelectorAll('.chp.on').forEach(b=>b.classList.add(b.dataset.v===String(T[b.dataset.f])?'ok':'ko'));
    $('bVal').disabled=true;
    setTimeout(()=>mgDone('tenue',!bad.length,bad.length?tr(`${known.length?`Éléments établis : ${known.join(', ')}. `:''}Éléments incertains : ${bad.map(nm).join(', ')}. Ils resteront masqués sur votre fiche.`,`${known.length?`Confirmed: ${known.join(', ')}. `:''}Uncertain: ${bad.map(nm).join(', ')}. They will stay hidden on your sheet.`):tr(`Signalement confirmé : ${lookText(T)}.`,`Description confirmed: ${lookText(T)}.`)),900);
  };
}

/* =========================================================
   2. LE TÉLÉOBJECTIF (réflexe)
   ========================================================= */
const WALK_TICS=['boite','sautille','presse','arret','mefiant','centpas','facades'];
function mgTic(){
  MODE='mg';useContractMap(C);
  const li=C.photos[1].li,L=M.locs[li],st=C.st;
  const [x0,y0]=spotNear(li,false,60);
  const tg={id:900,look:C.T,mask:C.mask&&!C.bought.tenue?C.mask:null,tic:null,x:x0,y:clamp(y0,640,720),tx:0,ty:0,state:'dwell',flip:1,dir:1,ph:0,ticA:-1,po:NEUTRAL,birds:null,lookBack:0};
  const realTic=C.tic,walk=WALK_TICS.includes(realTic);
  const pass=[0,1,2].map(i=>({id:901+i,look:genLook(),tic:null,x:0,y:0,state:'walk',flip:1,dir:1,ph:Math.random()*6,sp:60+Math.random()*25,po:NEUTRAL,wait:1+i*2.2+Math.random()*2}));
  pass.forEach(p=>{p.state='gone'});
  // programme : événements réels et leurres
  const evs=[];let t=1.6;let reals=0;
  while(t<21){const real=reals<1&&t>8?true:Math.random()<.5;if(real)reals++;
    const dur=walk?[1.7,1.35,1.1][st-1]:Math.max([1.25,1.05,.9][st-1],(TICS[realTic].dur||1.2)*[1.15,.95,.8][st-1]);
    evs.push({t,real,dur:real?dur:[1.2,1,.9][st-1],kind:real?'tic':pick(walk?['marche','tourne','bras']:['tourne','bras','tete','marche'])});t+=dur+[2.2,1.9,1.6][st-1]+Math.random()*1.6}
  if(!evs.some(e=>e.real))evs[evs.length-1].real=true;
  const cam={x:clamp(tg.x,190,W-190),y:tg.y-62,w:[330,300,270][st-1]};
  MG={id:'tic',t:0,ei:0,baseY:tg.y,tg,pass,evs,ev:null,films:3,cam,fx:[],flash:0,over:false,msg:null,msgT:0,walk,timeLeft:22};
  ui(`<div class="top"><div class="clk" id="mgc">22</div><div id="films" class="films" aria-label="${tr('Pellicules','Film')}"></div><span class="mgt">${MG_INFO.tic.n}</span></div>
    <div class="hint2" id="mgh" style="bottom:calc(env(safe-area-inset-bottom,0px) + 136px)">${tr('Déclenchez quand la cible trahit une habitude.','Shoot when the target gives away a habit.')}</div>
    <div class="bot" style="justify-content:center"><button class="round" id="bShot" style="width:108px;height:108px;background:var(--stamp);color:#fff;font-weight:700;letter-spacing:.14em">${tr('Déclencher','Shoot')}</button></div>`);
  const films=()=>{$('films').innerHTML=[0,1,2].map(i=>`<i class="${i<MG.films?'':'off'}"></i>`).join('')};films();MG.films_=films;
  $('bShot').addEventListener('pointerdown',e=>{e.preventDefault();mgTicShot()});
}
function mgTicActive(){const e=MG.ev;return e&&e.real&&MG.t>=e.t&&MG.t<=e.t+e.dur+.15}
function mgOccluded(){const tg=MG.tg,s=scaleAt(tg.y);return MG.pass.some(p=>p.state!=='gone'&&p.y>tg.y&&Math.abs(p.x-tg.x)<30*s)}
function mgTicShot(){
  if(!MG||MG.over||MG.id!=='tic')return;
  SFX.shutter();MG.flash=1;
  const occ=mgOccluded();
  if(mgTicActive()&&!occ){MG.over=true;const T=TICS[C.tic];MG.msg=tr('Cliché pris.','Got it.');setTimeout(()=>mgDone('tic',true,tr(`Le cliché est formel : la cible ${T.d}.`,`The photo is clear: the target ${T.d}.`)),900);return}
  MG.films--;MG.films_();
  const e=MG.ev,decoy=e&&!e.real&&MG.t>=e.t&&MG.t<=e.t+e.dur+.15;
  MG.msg=occ?tr('Un passant masque la cible. Pellicule perdue.','A passer-by blocks the shot. Film wasted.'):decoy?tr('Geste ordinaire. Pellicule perdue.','Ordinary gesture. Film wasted.'):tr('Rien à signaler. Pellicule perdue.','Nothing to report. Film wasted.');MG.msgT=1.6;
  if(MG.films<=0){MG.over=true;setTimeout(()=>mgDone('tic',false,tr('Pellicule épuisée. L\'habitude de la cible reste inconnue. Sur le toit, vous devrez la repérer seul.','Out of film. The target\'s habit remains unknown. On the roof, you will have to spot it yourself.')),700)}
}
function mgTicUpdate(dt){
  const G=MG;
  G.t+=dt;G.flash=Math.max(0,G.flash-dt*4);if(G.msgT>0){G.msgT-=dt;if(G.msgT<=0)G.msg=null}
  if(!G.over){G.timeLeft-=dt;const c=$('mgc');if(c)c.textContent=Math.max(0,Math.ceil(G.timeLeft));if(G.timeLeft<=0){G.over=true;mgDone('tic',false,tr('La cible a quitté votre champ. Son habitude reste inconnue.','The target left your field of view. The habit remains unknown.'));return}}
  const tg=G.tg;
  // événement courant
  if(G.ev&&G.t>G.ev.t+G.ev.dur)endEv();
  if(!G.ev&&G.ei<G.evs.length&&G.t>=G.evs[G.ei].t){startEv(G.evs[G.ei]);G.ei++}
  if(!G.ev||G.ev.ty===undefined)tg.y+=(G.baseY-tg.y)*Math.min(1,dt*2);
  if(G.ev&&G.ev.cp&&tg.state==='dwell'){tg.tx=tg.x+(tg.dir>0?-50:50);tg.state='walk'}
  const e=G.ev;
  if(e){const a=(G.t-e.t)/e.dur;
    if(e.real&&!G.walk){tg.ticA=clamp(a,0,.999)}
    if(tg.state==='walk'){const d=tg.tx-tg.x,sp=e.sp;if(Math.abs(d)<=sp*dt){tg.x=tg.tx;tg.state='dwell'}else{tg.x+=Math.sign(d)*sp*dt;tg.dir=Math.sign(d)}
      if(tg.tic==='arret'&&a>.35&&a<.6)tg.state='halt';else if(tg.state==='halt')tg.state='walk';
      if(tg.tic==='mefiant')tg.lookBack=Math.sin(a*Math.PI*3)>.4?1:0;
      tg.y+= (e.ty!==undefined?(e.ty-tg.y)*Math.min(1,dt*4):0)}
    else if(tg.state==='halt'){if(!(a>.35&&a<.6))tg.state='walk'}
  }
  tg.ph+=dt*(tg.state==='walk'?(tg.tic==='presse'?13:tg.tic==='sautille'?11:9):2);
  const want=tg.lookBack>0?-tg.dir:tg.dir;tg.flip+=clamp(want-tg.flip,-dt*7,dt*7);
  tg.po=poseOf(tg,G.t);
  if(e&&!e.real&&G.t>=e.t){const a=clamp((G.t-e.t)/e.dur,0,1),en=env(a);
    if(e.kind==='bras')tg.po.arm=-.55*en;if(e.kind==='tete')tg.po.head=.22*en}
  if(tg.birds)for(const b of tg.birds)b.ph+=dt;
  // passants
  for(const p of G.pass){if(p.state==='gone'){p.wait-=dt;if(p.wait<=0){const l2r=Math.random()<.5;p.x=G.cam.x+(l2r?-1:1)*(G.cam.w/2+60);p.tx=G.cam.x-(l2r?-1:1)*(G.cam.w/2+60);p.y=tg.y+(Math.random()<.65?18+Math.random()*50:-30-Math.random()*40);p.state='walk';p.dir=l2r?1:-1;p.flip=p.dir}continue}
    const d=p.tx-p.x;if(Math.abs(d)<=p.sp*dt){p.state='gone';p.wait=1.5+Math.random()*3}else p.x+=Math.sign(d)*p.sp*dt;p.ph+=dt*9;p.po=poseOf(p,G.t)}
  for(const f of G.fx){f.life-=dt;f.r+=dt*6;f.x+=f.vx*dt;f.y+=f.vy*dt}G.fx=G.fx.filter(f=>f.life>0);
  if(e&&e.real&&!G.walk){const TI=TICS[C.tic];const a=(G.t-e.t)/e.dur,pa=(G.t-dt-e.t)/e.dur;
    if(C.tic==='eternue'&&pa<.45&&a>=.45)mgPuff(tg,'#fbf6ea',6,1);if(C.tic==='fume'&&pa<.75&&a>=.75)mgPuff(tg,'#e8e4ec',4,0)}
}
function mgPuff(n,col,count,big){const s=scaleAt(n.y),f=Math.sign(n.flip)||1;for(let i=0;i<count;i++)MG.fx.push({x:n.x+f*(big?24:18)*s,y:n.y-(big?102:100)*s,vx:f*(20+Math.random()*30)*s,vy:(-20-Math.random()*25)*s,r:(4+Math.random()*4)*s,c:col,life:1.1+Math.random()*.6})}
function startEv(e){
  const G=MG,tg=G.tg;G.ev=e;tg.ticA=-1;
  if(e.real){
    tg.tic=C.tic;
    if(G.walk){const dirn=tg.x>G.cam.x?-1:1;const dist=C.tic==='presse'?130:C.tic==='centpas'?60:95;tg.tx=clamp(tg.x+dirn*dist,G.cam.x-G.cam.w/2+40,G.cam.x+G.cam.w/2-40);tg.state='walk';
      e.sp=Math.abs(tg.tx-tg.x)/e.dur*(C.tic==='arret'?1.35:1);if(C.tic==='facades')e.ty=tg.y-35;if(C.tic==='centpas'){e.sp=150/e.dur;e.cp=1}}
    if(C.tic==='pigeons'){tg.state='dwell';tg.birds=[0,1,2].map(i=>({dx:(i-1)*30,dy:6+Math.random()*10,ph:Math.random()*6}))}
  }else{
    tg.tic=null;
    if(e.kind==='marche'){const dirn=tg.x>G.cam.x?-1:1;tg.tx=clamp(tg.x+dirn*80,G.cam.x-G.cam.w/2+40,G.cam.x+G.cam.w/2-40);tg.state='walk';e.sp=Math.abs(tg.tx-tg.x)/e.dur}
    if(e.kind==='tourne'){tg.dir*=-1}
  }
}
function endEv(){const G=MG,tg=G.tg;G.ev=null;tg.tic=null;tg.ticA=-1;tg.state='dwell';tg.birds=null;tg.lookBack=0}
function mgTicRender(){
  const G=MG;
  const {V}=mgWorld(G.cam,[G.tg,...G.pass],G.t,k=>{
    for(const f of G.fx){ctx.globalAlpha=clamp(f.life,0,1)*.85;ctx.fillStyle=f.c;ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,7);ctx.fill();ctx.globalAlpha=1}
    // repère discret au-dessus de la cible
    const tg=G.tg,s=scaleAt(tg.y);ctx.fillStyle='#d4483b';ctx.strokeStyle='#fff';ctx.lineWidth=2/k;const yy=tg.y-170*s+Math.sin(G.t*4)*3;ctx.beginPath();ctx.moveTo(tg.x-7/k*1.6,yy-10/k*1.6);ctx.lineTo(tg.x+7/k*1.6,yy-10/k*1.6);ctx.lineTo(tg.x,yy);ctx.closePath();ctx.stroke();ctx.fill()});
  // viseur photo
  ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=2;const cx=V.x+V.w/2,cy=V.y+V.h/2;
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{const x=cx+a*V.w*.42,y=cy+b*V.h*.42;ctx.beginPath();ctx.moveTo(x,y-b*-18);ctx.lineTo(x,y);ctx.lineTo(x-a*18,y);ctx.stroke()});
  if(G.flash>0){ctx.fillStyle=`rgba(255,255,255,${G.flash*.8})`;ctx.fillRect(V.x,V.y,V.w,V.h)}
  if(G.msg){ctx.font="700 14px 'Courier Prime', monospace";ctx.textAlign='center';const w=ctx.measureText(G.msg).width+24;ctx.fillStyle='#ebe6d6';ctx.fillRect(cx-w/2,V.y+V.h-46,w,30);ctx.fillStyle='#1f1e29';ctx.fillText(G.msg,cx,V.y+V.h-26)}
}

/* =========================================================
   3. LE BONNETEAU (suivi)
   ========================================================= */
function mgLieu(){
  MODE='mg';useContractMap(C);
  const li=C.photos[2].li,L=M.locs[li],st=C.st,n=[3,4,5][st-1];
  const look={genre:'homme',chapeau:'casquette',manteau:'gris',acc:'rien',skin:'#e6b48e',hair:'#5a3a22',pants:'#2f3a4a',hatc:'#3c4f6b'};
  const cx=clamp(L.x,220,W-220),gap=[96,84,72][st-1],y=750;
  const cs=[];for(let i=0;i<n;i++)cs.push({id:950+i,look,tic:null,x:cx+(i-(n-1)/2)*gap,y,state:'dwell',flip:1,dir:1,ph:Math.random()*6,po:NEUTRAL,slot:i});
  const real=ri(0,n-1);
  const swaps=[];let t=2.6;const nsw=[5,7,9][st-1],d=[.95,.75,.58][st-1];
  for(let k=0;k<nsw;k++){let a=ri(0,n-1),b;do{b=ri(0,n-1)}while(b===a);swaps.push({t,a,b,d});
    if(st===3&&k%3===2&&n>=4){let c,e;do{c=ri(0,n-1)}while(c===a||c===b);do{e=ri(0,n-1)}while(e===a||e===b||e===c);swaps.push({t,a:c,b:e,d})}
    t+=d+.08}
  MG={id:'lieu',t:0,cs,real,swaps,slots:cs.map(c=>c.x),cam:{x:cx,y:665,w:Math.max(380,gap*(n+1.2))},end:t+.3,phase:'show',over:false,pickT:0,picked:null};
  ui(`<div class="top"><span class="mgt" style="margin:auto">${MG_INFO.lieu.n}</span></div><div class="hint2" id="mgh" style="bottom:calc(env(safe-area-inset-bottom,0px) + 70px)">${tr("Repérez le coursier qui porte l'enveloppe.",'Spot the courier carrying the envelope.')}</div>`);
  SFX.page();
}
function mgLieuUpdate(dt){
  const G=MG;G.t+=dt;
  for(const c of G.cs){c.state='dwell';c.flip+=clamp(1-c.flip,-dt*6,dt*6)}
  // application incrémentale des échanges (une seule fois chacun)
  for(const s of G.swaps){if(s.done)continue;if(G.t>=s.t+s.d){const A=G.cs.find(c=>c.slot===s.a),B=G.cs.find(c=>c.slot===s.b);A.slot=s.b;B.slot=s.a;s.done=true;SFX.tap()}}
  for(const c of G.cs){c.x=G.slots[c.slot];c.y=750}
  for(const s of G.swaps){if(s.done||G.t<s.t)continue;const a=clamp((G.t-s.t)/s.d,0,1),e=a<.5?2*a*a:1-Math.pow(-2*a+2,2)/2;
    const A=G.cs.find(c=>c.slot===s.a),B=G.cs.find(c=>c.slot===s.b);const xa=G.slots[s.a],xb=G.slots[s.b];
    A.x=lerp(xa,xb,e);A.y=750+Math.sin(a*Math.PI)*32;B.x=lerp(xb,xa,e);B.y=750-Math.sin(a*Math.PI)*22;
    A.state=B.state='walk';A.flip=Math.sign(xb-xa);B.flip=-A.flip;A.ph+=dt*10;B.ph+=dt*10}
  for(const c of G.cs){if(c.state==='dwell')c.ph+=dt*2;c.po=poseOf(c,G.t)}
  if(G.phase==='show'&&G.t>2.2){G.phase='swap';const h=$('mgh');if(h)h.textContent=tr('Suivez-le.','Follow him.')}
  if(G.phase==='swap'&&G.t>G.end){G.phase='pick';const h=$('mgh');if(h)h.textContent=tr('Désignez le coursier.','Point out the courier.')}
}
function mgLieuRender(){
  const G=MG,real=G.cs[G.real];
  mgWorld(G.cam,G.cs,G.t,k=>{
    const showEnv=G.phase==='show'||G.picked!==null;
    if(showEnv){const s=scaleAt(real.y),bob=Math.sin(G.t*5)*3;drawEnvelope(real.x,real.y-178*s+bob,1.4,G.picked===G.real?M.locs[C.rdv].name:null)}
    if(G.picked!==null&&G.picked!==G.real){const p=G.cs[G.picked],s=scaleAt(p.y);ctx.strokeStyle='#d4483b';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(p.x-16,p.y-170*s-16);ctx.lineTo(p.x+16,p.y-170*s+16);ctx.moveTo(p.x+16,p.y-170*s-16);ctx.lineTo(p.x-16,p.y-170*s+16);ctx.stroke()}
  });
}
function drawEnvelope(x,y,s,label){
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  const e=rr(-17,-12,34,23,2);ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.stroke(e);ctx.fillStyle='#f3e2bf';ctx.fill(e);
  ctx.strokeStyle='#b89668';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-17,-12);ctx.lineTo(0,2);ctx.lineTo(17,-12);ctx.stroke();
  ctx.fillStyle='#d4483b';ctx.beginPath();ctx.arc(0,2,4,0,7);ctx.fill();
  if(label){ctx.font="700 11px 'Courier Prime', monospace";ctx.textAlign='center';const w=ctx.measureText(label).width+14;ctx.fillStyle='#2b2233';ctx.fillRect(-w/2,-38,w,18);ctx.fillStyle='#fbf6ea';ctx.fillText(label,0,-25)}
  ctx.restore();
}
function mgLieuTap(sx,sy){
  const G=MG;if(!G||G.id!=='lieu'||G.phase!=='pick'||G.picked!==null)return;
  const w=mgScreenToWorld(G.cam,sx,sy);
  let best=null,bd=1e9;for(let i=0;i<G.cs.length;i++){const c=G.cs[i],s=scaleAt(c.y);if(w.y<c.y+10&&w.y>c.y-160*s){const d=Math.abs(w.x-c.x);if(d<34*s&&d<bd){bd=d;best=i}}}
  if(best===null)return;
  G.picked=best;const ok=best===G.real;SFX.mark();
  const loc=M.locs[C.rdv];
  setTimeout(()=>mgDone('lieu',ok,ok?tr(`L'enveloppe indique : « Midi, ${loc.a}. »`,`The envelope reads: “Noon, ${loc.a}.”`):tr('Mauvais coursier. Le lieu du rendez-vous reste inconnu.','Wrong courier. The meeting place remains unknown.')),1300);
}

/* =========================================================
   BILAN + MARCHÉ AUX INDICS (seulement ce qui manque)
   ========================================================= */
function showDebrief(){
  MODE='brief';ui('');
  C.good=MG_ORDER.filter(id=>C.res[id]).length;
  const draw=()=>{
    const v=UI.querySelector('.veil .sheet');
    const mute=!!(C.tw&&C.tw.noInfo);
    const T=C.T,has={tenue:!C.mask||C.bought.tenue,tic:C.res.tic||C.bought.tic,lieu:C.res.lieu||C.bought.lieu};
    const val={tenue:lookText(T),tic:TICS[C.tic].n,lieu:tr('Rendez-vous ','Meeting ')+M.locs[C.rdv].a};
    v.innerHTML=`${dh(fileNo(C.of),tr('Fonds : ','Funds: ')+SAVE.francs+' F')}<span class="tag">${tr(`Synthèse : ${C.good} ${plural(C.good,'information acquise','informations acquises')} sur 3`,`Summary: ${C.good} of 3 intel secured`)}</span><h2>${tr('Ce que nous savons','What we know')}</h2>
      ${MG_ORDER.map(id=>`<div class="offer ${has[id]?'':'miss'}"><b>${MG_INFO[id].k}</b><small>${has[id]?val[id]+'.':id==='tenue'?lookTextMasked(T,C.mask)+(mute?'.':tr('. Un indicateur peut compléter.','. An informant can fill in the gaps.')):mute?tr('Inconnu.','Unknown.'):tr('Inconnu. Un indicateur peut vous le vendre.','Unknown. An informant can sell it to you.')}</small>${has[id]?`<span class="ok">${C.bought[id]?tr('Acheté','Bought'):tr('Acquis','Secured')}</span>`:mute?`<span class="ok mute">${tr('Muet','Silent')}</span>`:`<button class="pb sm" data-b="${id}" ${SAVE.francs<priceOf(id)?'disabled':''}>${priceOf(id)} F</button>`}</div>`).join('')}
      ${mute?`<p class="notice">${tr('Les indicateurs ont été payés par la Volière : aucun ne vous vendra quoi que ce soit.','The Aviary has paid off the informants: none of them will sell you anything.')}</p>`:''}
      ${!mute&&nBought()&&nBought()<3?`<p class="small">${tr('Les indicateurs ont senti votre intérêt : leurs prix montent.','The informants sense your interest: their prices are going up.')}</p>`:''}
      <h3>${tr('Services','Services')}</h3>
      ${['cafe','pot'].filter(id=>id!=='pot'||(C.st>1&&!mute)).map(id=>{const o=EXTRAS[id],p=Array.isArray(o.p)?o.p[C.st-1]:o.p,b=C.bought[id];return`<div class="offer"><b>${o.n}</b><small>${o.d}</small>${b?`<span class="ok">${tr('Acheté','Bought')}</span>`:`<button class="pb sm" data-x="${id}" ${SAVE.francs<p?'disabled':''}>${p} F</button>`}</div>`}).join('')}
      <div class="btns"><button class="pb red big wide" id="bFi">${tr('Établir la fiche de tir','Prepare the target sheet')}</button></div>`;
    v.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>{const id=b.dataset.b,p=priceOf(id);if(SAVE.francs<p)return;SAVE.francs-=p;C.bought[id]=1;persist();SFX.coin();draw()});
    v.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{const id=b.dataset.x,o=EXTRAS[id],p=Array.isArray(o.p)?o.p[C.st-1]:o.p;if(SAVE.francs<p)return;SAVE.francs-=p;C.bought[id]=1;persist();SFX.coin();draw()});
    $('bFi').onclick=()=>{SFX.page();closeModals();
      if(C.bought.tenue)C.mask=null;
      C.clues={sig:!C.mask,tic:!!(C.res.tic||C.bought.tic),rdv:!!(C.res.lieu||C.bought.lieu)};showFiche(true)};
  };
  modal('');draw();
}
