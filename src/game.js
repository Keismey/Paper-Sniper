/* =========================================================
   BOUCLE DE JEU : planque → contrat → indics → planche → tir → rapport
   ========================================================= */
let MODE='splash';
let T=0,last=performance.now();
let C=null;   // contrat en cours
let S=null;   // phase de tir
let attract={map:'tilleuls',x:300};

function ui(html){UI.innerHTML=html}
function modal(html,cls){const v=document.createElement('div');v.className='veil';v.innerHTML=`<div class="sheet ${cls||''} ${html.includes('class="stamp')?'stamped':''}">${html}</div>`;UI.appendChild(v);return v}
function closeModals(){UI.querySelectorAll('.veil').forEach(v=>v.remove())}
const lb=l=>`<span class="lb" style="background:${l.col}">${l.name}</span>`;
const risk=n=>`<span class="risk" aria-label="${tr('Risque','Risk')} ${n}/3">${[1,2,3].map(i=>`<i class="${i<=n?'on':''}"></i>`).join('')}</span>`;
const dossNo=of=>String(1000+of.seed%9000);
const fileNo=of=>tr('Dossier n° ','File no. ')+dossNo(of);
const q=x=>tr(`« ${x} »`,`“${x}”`);
/* en-tête dactylographié des documents */
const dh=(left,right)=>`<div class="dh"><span>${left}</span><span class="cf">${right||tr('Confidentiel','Confidential')}</span></div>`;
const plural=(n,a,b)=>n>1?b:a;
const accord=(L,m,f)=>L.genre==='femme'?f:m;

/* polices intégrées : on les charge tout de suite pour le canevas (points d'interrogation, messages) */
if(document.fonts)['700 20px "Stardos Stencil"','400 14px "Courier Prime"','700 14px "Courier Prime"','600 13px "IBM Plex Sans Condensed"'].forEach(f=>document.fonts.load(f).catch(()=>{}));
/* ---------- Splash Keismey Studio ---------- */
(function(){const sp=$('splash');let done=false;const go=()=>{if(done)return;done=true;sp.style.opacity=0;setTimeout(()=>sp.remove(),600);showTitle()};setTimeout(go,2300);sp.addEventListener('pointerdown',go)})();

function showTitle(){
  MODE='title';MUS.play('planque');useMap('tilleuls');attract.map='tilleuls';closeModals();
  ui(`<div id="title"><div class="logo"><span class="cls">${tr('Très secret','Top secret')}</span><h1>Paper<br>Sniper</h1><p>${tr('Identifier. Confirmer. Un seul tir.','Identify. Confirm. One shot.')}</p>
    <div class="tgo"><button class="pb red big" id="bPlay">${tr('Prendre le service','Report for duty')}</button>
    <div class="tstats">${SAVE.contrats?tr(`${gradeName(SAVE.grade)}. ${SAVE.reussis} ${plural(SAVE.reussis,'contrat exécuté','contrats exécutés')} sur ${SAVE.contrats}. Fonds : ${SAVE.francs} F.`,`${gradeName(SAVE.grade)}. ${SAVE.reussis} of ${SAVE.contrats} contracts completed. Funds: ${SAVE.francs} F.`):tr('Le Bureau recrute. Discrétion exigée.','The Bureau is hiring. Discretion required.')}</div>${SAVE.contrats?`<button class="lnk light treset" id="bReset">${tr('Recommencer à zéro','Start over')}</button>`:''}</div></div>
    <div class="tfoot"><div class="trow"><button class="pb sm ghost light" id="bLang">${tr('English','Français')}</button><button class="pb sm ghost light" id="bMus">${tr('Son','Sound')} : ${SAVE.music?tr('oui','on'):tr('non','off')}</button></div>
    <div class="studio"><button class="lnk light" id="bVer">v${VERSION}</button> · Keismey Studio</div></div></div>`);
  $('bVer').onclick=()=>{SFX.page();showNotes()};
  $('bPlay').onclick=()=>{ac();SFX.page();showHQ()};
  $('bLang').onclick=()=>{SAVE.lang=SAVE.lang==='en'?'fr':'en';persist();SFX.tap();document.documentElement.lang=SAVE.lang;showTitle()};
  $('bMus').onclick=()=>{ac();MUS.toggle();showTitle()};
  if($('bReset'))$('bReset').onclick=()=>{SFX.tap();confirmReset()};
}

/* ---------- Recommencer à zéro (garde la langue et le son) ---------- */
function confirmReset(){
  const v=modal(`${dh(tr('Effacer la carrière','Erase career'))}<h2>${tr('Tout recommencer ?','Start over?')}</h2>
    <p>${tr('Grade, fonds, équipement, cartes ouvertes et dossiers rouges seront effacés. Impossible de revenir en arrière.','Rank, funds, equipment, open maps and red files will be erased. This cannot be undone.')}</p>
    <div class="btns"><button class="pb big wide" id="rNo">${tr('Annuler','Cancel')}</button><button class="pb red big wide" id="rYes">${tr('Tout effacer','Erase everything')}</button></div>`);
  $('rNo').onclick=()=>{SFX.tap();v.remove()};
  $('rYes').onclick=()=>{SFX.page();SAVE={francs:150,rep:0,contrats:0,reussis:0,upg:{},seed:1,offers:null,tutoP:0,tutoS:0,seeTarget:0,lang:SAVE.lang,music:SAVE.music,seenV:VERSION};careerInit();persist();showTitle()};
}

/* =========================================================
   LA PLANQUE : contrats + armurerie
   ========================================================= */
function genOffers(){
  const maps=MAPK.filter(k=>SAVE.maps.includes(k));
  const al=shuffle(ALIASES.map((_,i)=>i).filter(i=>!BIRD_ALIASES.includes(ALIASES[i])));
  const g=careerLv(),st=g>=3?[2,3,3]:g>=2?[2,2,3]:g>=1?[1,2,3]:[1,2,SAVE.rep>=1?3:2];
  const bonus=1+.15*g;  // les primes montent avec le grade
  return st.map((s,i)=>({id:Date.now()+i,seed:Math.floor(Math.random()*1e9),stars:s,map:i===2&&maps.length>1?maps[maps.length-1]:pick(maps),ai:al[i],prime:Math.round(([220,330,480][s-1]+ri(0,6)*10)*bonus/10)*10}));
}
function showHQ(){
  MODE='hq';MUS.play('planque');closeModals();S=null;
  if(!SAVE.offers){SAVE.offers=genOffers();persist()}
  const red=redOffer();
  attract.map=red?red.map:SAVE.offers[0].map;
  const next=MAPK.find(k=>!SAVE.maps.includes(k));
  ui(`<div id="hq"><div class="hqtop"><h2>${tr('Le Bureau','The Bureau')}</h2><div class="purse"><small>${tr('Fonds','Funds')}</small><span class="money">${SAVE.francs} F</span></div></div>
    ${careerHTML()}
    <p class="hqsub">${red?tr('Un dossier rouge et trois dossiers ordinaires sont ouverts.','One red file and three ordinary files are open.'):tr('Trois dossiers sont ouverts. Choisissez votre cible.','Three files are open. Choose your target.')}${SAVE.rep?tr(` Contrats exécutés : ${SAVE.rep}.`,` Contracts completed: ${SAVE.rep}.`):''}</p>
    <div class="board">${red?redCardHTML(red):''}${SAVE.offers.map((o,i)=>`<button class="ccard" data-o="${i}" data-n="${fileNo(o)}"><span class="sil" aria-hidden="true">?</span><span>
      <span class="al">${q(aliasOf(o))}</span><span class="mp">${MAPS[o.map].name}</span>
      <span class="ln"><span>${tr('Risque','Risk')} ${risk(o.stars)}</span><span class="pr">${o.prime} F</span></span>
      <span class="dt">${tr(`${o.stars} ${plural(o.stars,'sosie','sosies')}. ${['4','5','6'][o.stars-1]} suspects par cliché.`,`${o.stars} ${plural(o.stars,'double','doubles')}. ${['4','5','6'][o.stars-1]} suspects per photo.`)}</span></span></button>`).join('')}</div>
    ${next?`<div class="locked">${tr(`${MAPS[next].name} : accès au grade ${gradeName(MAP_GRADE[next])}.`,`${MAPS[next].name}: opens at the rank of ${gradeName(MAP_GRADE[next])}.`)}</div>`:''}
    <div class="hqbtns"><button class="pb paper" id="bArm">${tr('Armurerie','Armoury')}</button><button class="pb sm ghost light" id="bNotesH">${tr('Nouveautés','What\'s new')}</button><button class="pb sm ghost light" id="bMus">${tr('Son','Sound')} : ${SAVE.music?tr('oui','on'):tr('non','off')}</button><button class="pb sm ghost light" id="bTitle">${tr('Quitter','Exit')}</button></div>
    ${TEST?`<div class="testp"><b>Mode test</b><button class="pb sm" id="tMoney">+1000 F</button><button class="pb sm" id="tMaps">Toutes les cartes</button><button class="pb sm" id="tSee">Voir la cible : ${SAVE.seeTarget?'oui':'non'}</button><button class="pb sm" id="tRed">Dossier rouge suivant</button><button class="pb sm" id="tReset">Remise à zéro</button></div>`:''}</div>`);
  UI.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{SFX.page();openContract(SAVE.offers[+b.dataset.o])});
  if(red)$('bRed').onclick=()=>{SFX.page();openContract(red)};
  $('bNotesH').onclick=()=>{SFX.page();showNotes()};
  // notes de mise à jour : une fois, pour les joueurs qui avaient déjà une partie
  if(SAVE.oldPlayer&&SAVE.seenV!==VERSION)showNotes();
  $('bArm').onclick=()=>{SFX.page();showArmory()};
  $('bMus').onclick=()=>{ac();MUS.toggle();$('bMus').textContent=tr('Son','Sound')+' : '+(SAVE.music?tr('oui','on'):tr('non','off'))};
  $('bTitle').onclick=()=>{SFX.page();showTitle()};
  if(TEST){
    $('tMoney').onclick=()=>{SAVE.francs+=1000;persist();showHQ()};
    $('tMaps').onclick=()=>{SAVE.maps=MAPK.slice();SAVE.offers=null;persist();showHQ()};
    $('tRed').onclick=()=>{const i=SAVE.dr||0;if(i<RED.length){SAVE.rep=Math.max(SAVE.rep,RED[i].rep);persist();showHQ()}};
    $('tSee').onclick=()=>{SAVE.seeTarget=SAVE.seeTarget?0:1;persist();showHQ()};
    $('tReset').onclick=()=>{SAVE={francs:150,rep:0,contrats:0,reussis:0,upg:{},seed:1,offers:null,tutoP:0,tutoS:0,seeTarget:0,lang:SAVE.lang,music:SAVE.music,seenV:VERSION};careerInit();showHQ()};
  }
}
function showArmory(){
  const draw=()=>{const v=UI.querySelector('.veil .sheet');v.innerHTML=`${dh(tr('Armurerie','Armoury'),tr('Fonds : ','Funds: ')+SAVE.francs+' F')}<h2>${tr("L'armurier",'The armourer')}</h2>
    <p>${tr('Le matériel se paie comptant. Il reste acquis pour tous les contrats.','Equipment is paid in cash. You keep it for every contract.')}</p>
    ${UPGS.map(u=>{const lv=upg(u.id),max=u.c.length,cost=u.c[lv];return`<div class="upg"><b>${u.n}</b><small>${u.d}</small><span class="pips">${u.c.map((_,i)=>`<i class="${i<lv?'on':''}"></i>`).join('')}</span>
      ${lv>=max?`<button class="pb sm" disabled>${tr('Complet','Maxed')}</button>`:`<button class="pb sm" data-u="${u.id}" ${SAVE.francs<cost?'disabled':''}>${cost} F</button>`}</div>`}).join('')}
    <div class="btns"><button class="pb ghost" id="bX">${tr('Fermer','Close')}</button></div>`;
    v.querySelectorAll('[data-u]').forEach(b=>b.onclick=()=>{const u=UPGS.find(x=>x.id===b.dataset.u),lv=upg(u.id);if(SAVE.francs<u.c[lv])return;SAVE.francs-=u.c[lv];SAVE.upg[u.id]=lv+1;persist();SFX.coin();draw()});
    $('bX').onclick=()=>{SFX.page();showHQ()}};
  modal('');draw();
}

/* =========================================================
   CONTRAT : génération
   ========================================================= */
function variantOf(T,st,taken){
  for(let k=0;k<80;k++){
    const L=cloneLook(T);
    if(st===1){L.manteau=pick(COATK.filter(c=>c!==T.manteau));if(R()<.5)L.chapeau=pick(CHAP.filter(c=>c!==T.chapeau&&(T.genre==='femme'||c!=='cloche')));else L.acc=pick(ACC.filter(a=>a!==T.acc))}
    else if(st===2){const f=pick(['manteau','chapeau','acc']);if(f==='manteau')L.manteau=pick(COATK.filter(c=>c!==T.manteau));if(f==='chapeau')L.chapeau=pick(CHAP.filter(c=>c!==T.chapeau&&(T.genre==='femme'||c!=='cloche')));if(f==='acc')L.acc=pick(ACC.filter(a=>a!==T.acc))}
    else{let f=pick(['hatc','chapeau','acc']);if(f==='hatc'&&T.chapeau==='aucun')f='acc';if(f==='hatc')L.hatc=pick(HATC.filter(c=>c!==T.hatc));if(f==='chapeau')L.chapeau=pick(CHAP.filter(c=>c!==T.chapeau&&c!=='aucun'&&(T.genre==='femme'||c!=='cloche')));if(f==='acc')L.acc=pick(ACC.filter(a=>a!==T.acc))}
    if(sig(L)!==sig(T)&&!taken.some(x=>sig(x)===sig(L)))return L;
  }
  const L=genLook(T.genre);return L;
}
function baseDesc(T,st){
  if(st===1)return tr(`${T.genre==='femme'?'Une femme':'Un homme'} en manteau ${T.manteau}.`,`A ${T.genre==='femme'?'woman':'man'} in a ${COATN[T.manteau]} coat.`);
  if(st===2)return tr(`${T.genre==='femme'?'Une femme':'Un homme'}. Rien de plus.`,`A ${T.genre==='femme'?'woman':'man'}. Nothing more.`);
  return tr('Inconnu. Aucun témoin fiable.','Unknown. No reliable witness.');
}
function makeContract(of){
  useMap(of.map);applyLayout(M,of.seed%100000,of.stars);R=mulberry(of.seed);
  const st=of.stars,rd=of.red!==undefined?RED[of.red]:null;
  const T=genLook(rd&&rd.look.genre);
  if(rd){Object.assign(T,rd.look);if(T.genre!=='femme'&&T.chapeau==='cloche')T.chapeau='melon'}
  const tic=pickTic([1,2,3][st-1],st===3?2:1,T);
  const morning=shuffle([0,1,2,3,4]).slice(0,3);
  const rdv=ri(0,4);
  const taken=[T];const X=variantOf(T,st,taken);taken.push(X);const Y=variantOf(T,st,taken);taken.push(Y);const Z=variantOf(T,st,taken);taken.push(Z);
  const sets=[[X,Y],[X,Z],[Y,Z]];const n=[4,5,6][st-1];
  const photos=morning.map((li,pi)=>{
    const looks=[{look:T,isT:1},{look:sets[pi][0]},{look:sets[pi][1]}];
    for(let k=0;k<n-3;k++){let L;do{L=genLook()}while(taken.some(x=>sig(x)===sig(L)));taken.push(L);looks.push({look:L})}
    shuffle(looks);
    const pos=[];
    looks.forEach(p=>{let best=null;for(let k=0;k<60;k++){const L=M.locs[li];const x=clamp(L.x+(R()*2-1)*175,40,W-40),y=612+R()*162;const s=scaleAt(y);
        const hidden=M.props.some(g=>g.z>y&&g.block.some(r=>inR(r,x,y-60*s)||inR(r,x,y-115*s)));
        const close=pos.some(q=>Math.abs(q[0]-x)<52*s&&Math.abs(q[1]-y)<55);if(!hidden&&!close){best=[x,y];break}}
      if(!best)best=[M.locs[li].x+(R()-.5)*300,620+R()*160];pos.push(best);p.x=best[0];p.y=best[1];p.flip=R()<.5?-1:1;p.state='dwell';p.po=Object.assign({},NEUTRAL,{head:(R()-.5)*.2,arm:R()<.3?-.4:0})});
    return{li,hour:pi,people:looks};
  });
  // la loupe écarte un faux suspect par photo
  photos.forEach(ph=>{const wrong=ph.people.filter(p=>!p.isT);ph.loupe=pick(wrong)});
  R=Math.random;
  // lv : difficulté selon le grade (dossier rouge : selon son rang) ; tw : complication du dossier rouge
  return{of,st,map:of.map,T,tic,rdv,morning,photos,base:st,bought:{},picks:[null,null,null],cur:0,clues:null,offerIds:null,
    red:rd?of.red:-1,lv:rd?Math.min(4,of.red):careerLv(),tw:rd?rd.tw:{}};
}

/* sosies sur le terrain (avant achat du figurant soudoyé) */
const nSosies=()=>C.st+(C.tw&&C.tw.extra?1:0);

/* ---------- Briefing ---------- */
function openContract(of){
  if(!SAVE.tutoP){showProcedure(()=>openContract(of));return}
  C=makeContract(of);attract.map=of.map;
  MODE='brief';closeModals();ui('');
  const mp=MAPS[of.map],rd=C.red>=0?RED[C.red]:null,nS=nSosies(),twx=rd&&redTwistText(rd.tw);
  modal(`${dh(rd?`${tr('Dossier rouge','Red file')} ${C.red+1}/5`:fileNo(of),rd&&rd.from?tr('Hors procédure','Off the record'):tr('Confidentiel','Confidential'))}<span class="tag">${rd?tr('La Volière','The Aviary'):tr('Contrat de neutralisation','Neutralisation contract')}</span>
    <h2>${q(aliasOf(of))}</h2>
    ${rd?tr(rd.brief,rd.briefEn).map(t=>`<p>${t}</p>`).join(''):`<p>${tr(`La cible est un agent double. Nos guetteurs l'ont photographiée ce matin ${mp.at}. À midi, elle retrouve son contact. Ensuite, nous perdons sa trace.`,`The target is a double agent. Our spotters photographed them this morning ${mp.at}. At noon, they meet their contact. After that, we lose them.`)}</p>`}
    <div class="clue"><b class="k">${tr('Signalement','Description')}</b><span>${baseDesc(C.T,C.st)}</span></div>
    <div class="clue"><b class="k">${tr('Complication','Complication')}</b><span>${tr(`${['Un figurant porte','Deux figurants portent','Trois figurants portent','Quatre figurants portent'][nS-1]} exactement la même tenue. Seule son habitude la trahira.`,`${['One extra wears','Two extras wear','Three extras wear','Four extras wear'][nS-1]} the exact same outfit. Only the target's habit will give them away.`)}</span></div>
    ${twx?`<div class="clue"><b class="k">${tr('Attention','Warning')}</b><span>${twx}</span></div>`:''}
    <div class="clue"><b class="k">${tr('Risque','Risk')}</b><span>${risk(of.stars)}</span></div>
    <div class="clue"><b class="k">${tr('Rémunération','Fee')}</b><span class="money">${of.prime} F</span></div>
    <div class="btns col"><button class="pb red big" id="bMk">${tr('Accepter le contrat','Accept the contract')}</button><button class="lnk" id="bX">${rd?tr('Revenir au Bureau','Back to the Bureau'):tr('Refuser et revenir au Bureau','Decline and return to the Bureau')}</button></div>`,rd?'redbrief':'');
  $('bX').onclick=()=>{SFX.page();showHQ()};
  $('bMk').onclick=()=>{SFX.page();startInvestigation()};
}
/* note de service : la procédure, une seule fois */
function showProcedure(then){
  MODE='brief';closeModals();ui('');
  modal(`${dh(tr('Note de service','Memo'),tr('Diffusion restreinte','Restricted'))}<h2>${tr('Bienvenue au Bureau','Welcome to the Bureau')}</h2>
    <p>${tr('Agent, voici la procédure. Elle ne change jamais.','Agent, here is the procedure. It never changes.')}</p>
    <ol class="proc">
      <li><span>${tr("<b>L'enquête.</b> Trois épreuves courtes pour établir le signalement de la cible : sa tenue, son habitude, le lieu de son rendez-vous.","<b>The investigation.</b> Three short trials to build the target's profile: outfit, habit, and meeting place.")}</span></li>
      <li><span>${tr("<b>Les indicateurs.</b> Ce que vous n'avez pas obtenu s'achète. C'est cher, et chaque achat coûte plus que le précédent.","<b>Informants.</b> Whatever you missed can be bought. It is expensive, and each purchase costs more than the last.")}</span></li>
      <li><span>${tr('<b>Le tir.</b> À midi, depuis les toits. La cible a des sosies. Un seul tir propre.','<b>The shot.</b> At noon, from the rooftops. The target has doubles. One clean shot.')}</span></li>
    </ol>
    <p class="notice">${tr('Abattre un civil annule le contrat.','Shooting a civilian voids the contract.')}</p>
    <div class="btns"><button class="pb red big wide" id="bOk">${tr('Compris','Understood')}</button></div>`);
  $('bOk').onclick=()=>{SFX.page();SAVE.tutoP=1;persist();then()};
}

/* ---------- Photos de surveillance (rendu) ---------- */
const PW=720,PH=620,PVW=470; // taille d'une photo, largeur de monde cadrée
function photoCam(ph){const L=M.locs[ph.li];return{cx:clamp(L.x,PVW/2,W-PVW/2),cy:598,k:PW/PVW}}
function renderPhotoBase(ph){
  const c=document.createElement('canvas');c.width=PW;c.height=PH;const x=c.getContext('2d');
  const old=ctx;ctx=x;const cam=photoCam(ph);
  ctx.save();ctx.scale(cam.k,cam.k);ctx.translate(-cam.cx+PVW/2,-cam.cy+PH/cam.k/2);
  VIEW=[cam.cx-PVW/2-40,cam.cy-PH/cam.k/2-40,cam.cx+PVW/2+40,cam.cy+PH/cam.k/2+40];
  TNOW=3.7;drawScene(3.7,ph.people);ctx.restore();
  // grain et teinte d'époque
  ctx.fillStyle='rgba(255,214,150,.13)';ctx.fillRect(0,0,PW,PH);
  const vg=ctx.createRadialGradient(PW/2,PH/2,PH*.35,PW/2,PH/2,PW*.65);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(40,20,0,.38)');ctx.fillStyle=vg;ctx.fillRect(0,0,PW,PH);
  ctx.fillStyle=paperPattern();ctx.fillRect(0,0,PW,PH);
  ctx=old;ph.base=c;return c;
}
function photoToWorld(ph,px,py){const cam=photoCam(ph);return{x:cam.cx-PVW/2+px/cam.k,y:cam.cy-PH/cam.k/2+py/cam.k}}
function worldToPhoto(ph,x,y){const cam=photoCam(ph);return{x:(x-cam.cx+PVW/2)*cam.k,y:(y-cam.cy+PH/cam.k/2)*cam.k}}
/* ---------- Fiche cible ---------- */
function ficheHTML(){
  const T=C.T,cl=C.clues,tic=TICS[C.tic],rdv=M.locs[C.rdv];
  const n=Math.max(0,nSosies()-(C.bought.pot?1:0));
  return`<div class="fiche"><span id="fp"></span><div style="min-width:0">
      <div class="clue"><b class="k">${tr('Signalement','Description')}</b><span>${cl.sig?lookText(T):lookTextMasked(T,C.mask)}</span></div>
      <div class="clue"><b class="k">${tr('Habitude','Habit')}</b><span>${cl.tic?`<b>${tic.n}.</b> ${tr('La cible','The target')} ${tic.d}.`:`<span class="no">${tr('Inconnue.','Unknown.')}</span>`}</span></div>
      <div class="clue"><b class="k">${tr('À midi','At noon')}</b><span>${cl.rdv?tr(`Rendez-vous ${rdv.a}.`,`Meeting ${rdv.a}.`):`<span class="no">${tr('Lieu inconnu.','Place unknown.')}</span>`}</span></div>
    </div></div>
    <p class="small">${n?tr(`${n===1?'Un sosie sera':`${n} sosies seront`} présent${n>1?'s':''} ${MAPS[C.map].at}, en tenue identique.`,`${n===1?'One double':`${n} doubles`} will be ${MAPS[C.map].at}, in an identical outfit.`):tr('Le figurant soudoyé ne viendra pas : aucun sosie aujourd\'hui.','The bribed extra will stay home: no double today.')} ${tr('Si la cible quitte la zone, le contrat est perdu.','If the target leaves the area, the contract is lost.')}</p>`;
}
function showFiche(first){
  const v=modal(`${dh(fileNo(C.of),tr('Fiche de tir','Target sheet'))}<h2>${q(aliasOf(C.of))}</h2>${ficheHTML()}
    ${first?`<div class="btns"><button class="pb red big wide" id="bRoof">${tr('Prendre position','Take position')}</button></div>`:`<div class="btns col"><button class="pb big" id="bX">${tr('Reprendre la visée','Back to the scope')}</button><button class="lnk" id="bAb">${tr('Abandonner le contrat','Abandon the contract')}</button></div>`}`);
  const fp=v.querySelector('#fp');fp.replaceWith(portrait(C.T,70,90,C.mask||false));
  if(first)$('bRoof').onclick=()=>{SFX.bolt();closeModals();startSniper()};
  else{$('bX').onclick=()=>{SFX.page();v.remove();if(S)S.paused=false};$('bAb').onclick=()=>{SFX.page();v.remove();S.paused=false;S.end='abandon';S.endT=0}}
}

/* =========================================================
   PHASE 2 : LE TIR
   ========================================================= */
function zooms(){const z=[{w:1100,l:'×1',eye:1},{w:700,l:'×2'},{w:350,l:'×4'}];if(upg('zoom6'))z.push({w:233,l:'×6'});return z}
let nid=0;
function mkNpc(look,tic,o){return Object.assign({id:nid++,look,tic,x:0,y:0,tx:0,ty:0,state:'dwell',timer:.5+Math.random()*4,dir:Math.random()<.5?-1:1,flip:1,ph:Math.random()*6,sp:56+Math.random()*16,
  plan:null,planI:-1,after:'wander',kind:'foule',ticT:Math.random()*4,ticA:-1,haltT:2.5+Math.random()*2,lookT:2+Math.random()*2,lookBack:0,hatCd:1,birds:null,turnT:2,li:0,po:NEUTRAL,curDwell:7},o||{})}
function placeAt(n,li){const back=n.tic==='facades';const[x,y]=spotNear(li,back);n.x=x;n.y=y;n.li=li;n.state='dwell';n.flip=n.dir}
function setDest(n,x,y,exitX){if(exitX!==undefined){const e=navNearestFree(clamp(x,8,W-8),y);n.path=navPath(n.x,n.y,e[0],e[1]).concat([e]);n.tx=exitX;n.ty=e[1]}else{n.path=navPath(n.x,n.y,x,y);n.tx=x;n.ty=y}}
function goLoc(n,li,dwell){const back=n.tic==='facades';const[x,y]=spotNear(li,back);setDest(n,x,y);n.li=li;n.state='walk';n.curDwell=dwell||(5+Math.random()*7);if(n.birds){flyBirds(n)}}
function flyBirds(n){const s=scaleAt(n.y);for(const b of n.birds)S.fx.push({k:'bird',x:n.x+b.dx*s,y:n.y+b.dy*s,vx:(Math.random()-.5)*160,vy:-120-Math.random()*80,s:s*.9,life:1.6,ph:b.ph});n.birds=null}
function nextStep(n){
  if(n.plan){n.planI++;if(n.planI<n.plan.length){const p=n.plan[n.planI];goLoc(n,p.li,p.d);return}
    if(n.after==='leave'){n.state='leave';setDest(n,n.x<W/2?8:W-8,n.y,n.x<W/2?-130:W+130);if(n.birds)flyBirds(n);return}}
  let li;do{li=ri(0,4)}while(li===n.li);goLoc(n,li);
}
function startSniper(){
  MODE='sniper';MUS.play('tir');useContractMap(C);nid=0;sprClear();
  const st=C.st,T=C.T;
  const crowd=[];
  const others=[0,1,2,3,4].filter(l=>l!==C.rdv);shuffle(others);
  // le rendez-vous de midi raccourcit avec le grade ; « rendez-vous éclair » : encore plus court
  const rdvD=Math.max(9,(22-1.5*C.lv)*(C.tw.short?.55:1));
  const tg=mkNpc(T,C.tic,{kind:'target',isTarget:true,after:'leave',plan:[{li:others[0],d:7},{li:others[1],d:7},{li:C.rdv,d:rdvD}]});
  placeAt(tg,others[2]);tg.timer=2.5;crowd.push(tg);
  const nS=Math.max(0,nSosies()-(C.bought.pot?1:0));const used=[C.tic];
  for(let i=0;i<nS;i++){const tic=pickTic(3,1,T,used);used.push(tic);const so=mkNpc(T,tic,{kind:'sosie'});
    if(i===0)so.plan=[{li:others[1],d:6},{li:C.rdv,d:16}];
    placeAt(so,ri(0,4));crowd.push(so)}
  // gens qui collent à la description de base
  const nb=[3,3,4][st-1];
  for(let i=0;i<nb;i++){const L=genLook(T.genre);L.manteau=T.manteau;if(st===1)L.chapeau=T.chapeau;if(sig(L)===sig(T))L.acc=pick(ACC.filter(a=>a!==T.acc));crowd.push(mkNpc(L,Math.random()<.55?pickTic(3,1,L):null))}
  const total=[13,16,19][st-1]+C.lv;  // la foule s'épaissit avec le grade
  while(crowd.length<total){let L;do{L=genLook()}while(sig(L)===sig(T));crowd.push(mkNpc(L,Math.random()<.55?pickTic(3,1,L):null))}
  crowd.forEach(n=>{if(n.kind!=='target'&&!(n.kind==='sosie'&&n.plan))placeAt(n,ri(0,4));else if(n.kind==='sosie'&&n.plan&&!n.x)placeAt(n,ri(0,4))});
  const Z=zooms();
  S={t:0,cam:{x:800,y:640},z:0,Z,breath:1,hold:false,winded:0,cool:0,recoil:0,flash:0,crowd,panic:false,shots:0,misses:0,end:null,endT:0,slow:1,holes:[],fx:[],pins:new Map(),head:false,drag:null,hintT:7,paused:false,silent:upg('silence')>0,
    stab:1-.2*upg('stab'),breathDur:3.4*(1+.3*upg('souffle'))*(C.bought.cafe?1.5:1),coolDur:1.3*(1-.25*upg('culasse'))};
  gameClock={h:11,m:59,s:0};clampCam();
  buildHud2();
}
const PINC=['#d4483b','#3e6db3','#e3b44a'];
function buildHud2(){
  const cl=C.clues,tic=TICS[C.tic];
  ui(`<div id="hud2"><div class="top"><span id="tm"></span><div class="clk" id="clk2">11:59:00</div><div id="chips">
      <span class="${cl.tic?'':'no'}">${cl.tic?tic.n:tr('Habitude inconnue','Habit unknown')}</span><span class="${cl.rdv?'':'no'}">${cl.rdv?tr('Midi : ','Noon: ')+M.locs[C.rdv].name:tr('Lieu inconnu','Place unknown')}</span></div></div>
    <div id="zoom">${S.Z.map((z,i)=>`<button data-z="${i}" class="${i===S.z?'on':''}">${z.l}</button>`).join('')}</div>
    <div class="hint2" id="hint2"></div>
    <div class="bot"><button class="round" id="breath"><svg viewBox="0 0 92 92"><circle cx="46" cy="46" r="44" fill="none" stroke="#2b3570" stroke-width="5" stroke-dasharray="276.5" stroke-dashoffset="0" id="brc"/></svg>${tr('Souffle','Breath')}</button>
    <button class="round" id="pinb">${tr('Marquer','Mark')}</button><button class="round" id="fire">${tr('Tirer','Fire')}</button></div></div>`);
  const mini=portrait(C.T,40,52,C.mask||false);mini.id='tgtmini';$('tm').replaceWith(mini);
  mini.onclick=()=>{if(!S||S.end)return;SFX.page();S.paused=true;S.hold=false;showFiche(false)};
  document.querySelectorAll('#zoom [data-z]').forEach(b=>b.onclick=()=>{SFX.tap();setZoom(+b.dataset.z)});
  const br=$('breath');
  const on=e=>{e.preventDefault();if(S.winded>0||eyeMode())return;S.hold=true;br.classList.add('hold')},off=()=>{if(S)S.hold=false;br.classList.remove('hold')};
  br.addEventListener('pointerdown',on);['pointerup','pointercancel','pointerleave'].forEach(ev=>br.addEventListener(ev,off));
  $('fire').addEventListener('pointerdown',e=>{e.preventDefault();fire()});
  $('pinb').addEventListener('pointerdown',e=>{e.preventDefault();pinAt()});
  hudMode();
  if(!SAVE.tutoS){S.paused=true;
    const v=modal(`${dh(tr('Consignes de tir','Firing orders'),tr('À lire une fois','Read once'))}<h2>${tr('Sur le toit','On the roof')}</h2>
      <ol class="proc">
        <li><span>${tr("<b>Observer.</b> À l'œil nu (×1), vous voyez toute la zone. Glissez pour regarder ailleurs. Touchez un passant pour épauler et le viser à la lunette.","<b>Observe.</b> With the naked eye (×1) you see the whole area. Drag to look around. Tap a passer-by to raise the rifle and scope in on them.")}</span></li>
        <li><span>${tr('<b>Viser.</b> Dans la lunette, glissez pour déplacer le réticule. ×2 et ×4 règlent le grossissement.','<b>Aim.</b> In the scope, drag to move the crosshair. ×2 and ×4 set the magnification.')}</span></li>
        <li><span>${tr('<b>Stabiliser.</b> Maintenez Souffle : le réticule cesse de trembler, tant que votre souffle tient.','<b>Steady.</b> Hold Breath: the crosshair stops shaking for as long as your breath lasts.')}</span></li>
        <li><span>${tr('<b>Marquer.</b> Posez une épingle sur un suspect pour ne pas le perdre. Votre fiche, en haut à gauche, rappelle le signalement.','<b>Mark.</b> Pin a suspect so you do not lose them. Your sheet, top left, recalls the description.')}</span></li>
      </ol>
      <p class="notice">${tr('Après son rendez-vous de midi, la cible quitte la zone. Un tir manqué disperse la foule.','After the noon meeting, the target leaves the area. A missed shot scatters the crowd.')}</p>
      <div class="btns"><button class="pb red big wide" id="bPos">${tr('En position','In position')}</button></div>`);
    v.querySelector('#bPos').onclick=()=>{SFX.bolt();v.remove();SAVE.tutoS=1;persist();S.paused=false;S.hintT=5}}
}
const eyeMode=()=>S&&S.Z[S.z].eye;
/* boutons et consigne selon qu'on regarde à l'œil nu ou à la lunette */
function hudMode(){const e=eyeMode(),f=$('fire'),pb=$('pinb'),br=$('breath'),h=$('hint2');if(!f)return;
  f.textContent=e?tr('Épauler','Raise'):tr('Tirer','Fire');f.classList.toggle('eye',!!e);pb.disabled=!!e;br.classList.toggle('off',!!e);
  if(h){h.innerHTML='<span>'+(e?tr('Touchez un passant pour le viser.','Tap a passer-by to scope in.'):tr('Glissez pour viser.','Drag to aim.'))+'</span>';h.style.opacity=1;S.hintT=Math.max(S.hintT,3.5)}}
function setZoom(z){const was=S.z;S.z=z;document.querySelectorAll('#zoom [data-z]').forEach(b=>b.classList.toggle('on',+b.dataset.z===z));if(was!==z&&(!S.Z[was].eye)!==(!S.Z[z].eye)){SFX.bolt();S.hold=false}clampCam();hudMode()}
/* vue à l'œil nu : toute la largeur de l'écran, le sol calé au-dessus des boutons */
function eyeGeo(){const k=SW/1100,bot=SH-118;return{k,w:SW/k,bot,yb:955}}
function eyeToWorld(sx,sy){const g=eyeGeo();return{x:S.cam.x+(sx-SW/2)/g.k,y:g.yb+(sy-g.bot)/g.k}}
function scopeGeo(){const top=64,bot=130;const avH=SH-top-bot;const r=Math.min(SW*.49,avH*.5);return{cx:SW/2,cy:top+avH/2+4,r}}
function clampCam(){if(eyeMode()){S.cam.x=clamp(S.cam.x,eyeGeo().w/2-150,W-eyeGeo().w/2+150);return}const v=S.Z[S.z].w/2,lo=Math.min(v*.8,W/2);S.cam.x=clamp(S.cam.x,lo,W-lo);const yMax=Math.min(850,930-v*.85);S.cam.y=clamp(S.cam.y,Math.min(330,yMax),yMax)}  // aux grands angles, on ne regarde pas la scène vide sous la place
function sway(){const Z=S.Z[S.z].w,t=S.t;const amp=Z*.024*S.stab*(S.hold?.12:1)*(S.winded>0?1.9:1);
  return{x:(Math.sin(t*1.25)*.6+Math.sin(t*2.9+1.3)*.4)*amp,y:(Math.cos(t*1.05)*.55+Math.sin(t*2.3+.7)*.45)*amp}}
function aimPoint(){const sw=sway();return{x:S.cam.x+sw.x,y:S.cam.y+sw.y-S.recoil}}
function fire(){
  if(!S||S.end||S.paused)return;
  if(eyeMode()){S.cam.y=Math.min(S.cam.y,700);setZoom(1);return}
  if(S.cool>0)return;
  S.cool=S.coolDur;S.shots++;S.flash=1;S.shake=S.silent?.4:1;if(navigator.vibrate)try{navigator.vibrate(S.silent?30:70)}catch(e){}(S.silent?SFX.shotS:SFX.shot)();setTimeout(()=>S&&!S.end&&SFX.bolt(),S.coolDur*450);
  const a=aimPoint();S.recoil=S.Z[S.z].w*.1;
  const h=hitTest(S.crowd,a.x,a.y);
  if(h&&h.n){SFX.hit();const n=h.n;n.dead=0.001;S.head=h.part==='head';confetti(n);if(n.birds)flyBirds(n);
    if(n.isTarget){S.end='win';S.slow=.25}else{S.end='innocent';S.victim=n}S.endT=0;return}
  S.misses++;S.holes.push({x:a.x,y:a.y,r:4+Math.random()*2});
  if(S.silent&&S.misses===1){toast(tr('Tir manqué. Le silencieux a tenu : personne n\'a rien entendu.','Missed. The suppressor held: nobody heard a thing.'));return}
  toast(h&&h.block?tr('Balle perdue dans le décor. La foule se disperse.','The bullet hit the scenery. The crowd scatters.'):tr('Tir manqué. La foule se disperse.','Missed. The crowd scatters.'),true);
  panic();
}
function confetti(n){const s=scaleAt(n.y);for(let i=0;i<26;i++)S.fx.push({k:'conf',x:n.x,y:n.y-70*s,vx:(Math.random()-.5)*220*s,vy:-Math.random()*200*s-40,r:Math.random()*6,va:(Math.random()-.5)*12,c:pick([COATS[n.look.manteau],'#fff','#fbf6ea',n.look.hatc]),s:(4+Math.random()*5)*s,life:1.6})}
function panic(){if(S.panic)return;S.panic=true;S.crowd.forEach(n=>{if(n.state==='gone'||n.dead)return;if(n.birds)flyBirds(n);n.state='flee';const fy=clamp(n.y+(Math.random()-.5)*60,Y0+5,Y1);setDest(n,n.x<W/2?8:W-8,fy,n.x<W/2?-130:W+130);n.fleeSp=n.isTarget?115:150+Math.random()*60;n.bang=1.5})}
function pinAt(){
  if(!S||S.end||S.paused||eyeMode())return;const a=aimPoint();const h=hitTest(S.crowd,a.x,a.y,true);
  if(!h||!h.n){toast(tr('Personne dans le réticule.','Nobody in the crosshair.'));return}
  SFX.pin();const n=h.n;
  if(S.pins.has(n.id)){S.pins.delete(n.id);toast(tr('Marque retirée.','Mark removed.'))}
  else{const used=[...S.pins.values()];let c=[0,1,2].find(i=>!used.includes(i));if(c===undefined){const first=S.pins.keys().next().value;c=S.pins.get(first);S.pins.delete(first)}S.pins.set(n.id,c);toast(tr('Suspect marqué.','Suspect marked.'))}
}
/* ---------- comportement d'un PNJ (déplacements + tics) ---------- */
function upNpc(n,dt,t){
  if(n.dead){n.dead+=dt;return}
  if(n.state==='gone')return;
  const tic=n.tic,TI=tic&&TICS[tic];
  const mv=n.state==='walk'||n.state==='leave'||n.state==='flee'||n.state==='pace';
  n.ph+=dt*(mv?(n.state==='flee'?14:tic==='sautille'?11:tic==='presse'?13:9):2);
  if(n.bang)n.bang=Math.max(0,n.bang-dt);
  // tics périodiques
  if(TI&&TI.per&&n.state!=='flee'){
    if(n.ticA>=0){const prev=n.ticA;n.ticA+=dt/TI.dur;
      if(tic==='eternue'&&prev<.45&&n.ticA>=.45)puff(n,'#fbf6ea',6,1);
      if(tic==='fume'&&prev<.75&&n.ticA>=.75)puff(n,'#e8e4ec',4,0);
      if(n.ticA>=1){n.ticA=-1;n.ticT=TI.per*(.8+Math.random()*.4)}}
    else{n.ticT-=dt;if(n.ticT<=0&&(!TI.still||n.state==='dwell'))n.ticA=0}
  }
  if(tic==='chapeau'&&n.state!=='flee'){n.hatCd-=dt;if(n.ticA>=0){n.ticA+=dt/.9;if(n.ticA>=1){n.ticA=-1}}else if(n.hatCd<=0&&S.crowd.some(o=>o!==n&&!o.dead&&o.state!=='gone'&&Math.abs(o.x-n.x)<75&&Math.abs(o.y-n.y)<50&&(o.state==='walk'||n.state==='walk'))){n.ticA=0;n.hatCd=2.6}}
  if(n.lookBack>0)n.lookBack-=dt;
  switch(n.state){
    case'walk':case'leave':case'flee':{
      if(n.state==='walk'&&tic==='arret'){n.haltT-=dt;if(n.haltT<=0){n.state='halt';n.timer=.9;n.haltT=2.6+Math.random()*1.8;break}}
      if(tic==='mefiant'&&n.state==='walk'){n.lookT-=dt;if(n.lookT<=0){n.lookBack=.55;n.lookT=2+Math.random()*1.6}}
      const sp=n.state==='flee'?n.fleeSp:n.sp*(tic==='presse'?1.65:tic==='boite'?.82:1);
      if(n.path&&n.path.length){const w=n.path[0],wx=w[0]-n.x,wy=w[1]-n.y,wd=Math.hypot(wx,wy);if(wd<=sp*dt){n.x=w[0];n.y=w[1];n.path.shift()}else{n.x+=wx/wd*sp*dt;n.y+=wy/wd*sp*dt;if(Math.abs(wx)>1)n.dir=Math.sign(wx)}break}
      const dx=n.tx-n.x,dy=n.ty-n.y,d=Math.hypot(dx,dy);
      if(d<=sp*dt){n.x=n.tx;n.y=n.ty;
        if(n.state==='walk'){if(tic==='centpas'){n.state='pace';n.px=n.x;n.tx=n.x+50;n.ty=n.y;n.timer=n.curDwell}else{n.state='dwell';n.timer=n.curDwell;n.turnT=1+Math.random()*2.5;if(tic==='pigeons')n.birds=[0,1,2].map(i=>({dx:(i-1)*30+(Math.random()-.5)*12,dy:4+Math.random()*12,ph:Math.random()*6}))}}
        else{n.state='gone';if(n.isTarget&&!S.end){S.end='escape';S.endT=0}}}
      else{n.x+=dx/d*sp*dt;n.y+=dy/d*sp*dt;if(Math.abs(dx)>1)n.dir=Math.sign(dx)}
      break}
    case'halt':n.timer-=dt;if(n.timer<=0)n.state='walk';break;
    case'pace':{n.timer-=dt;const sp=n.sp*.7,dx=n.tx-n.x;if(Math.abs(dx)<=sp*dt||!navFree(n.x+Math.sign(dx)*14,n.y)){n.tx=n.tx>n.px?n.px-50:n.px+50;if(!navFree(n.tx,n.y))n.tx=n.x}else{n.x+=Math.sign(dx)*sp*dt;n.dir=Math.sign(dx)}if(n.timer<=0)nextStep(n);break}
    case'dwell':{n.timer-=dt;n.turnT-=dt;if(n.turnT<=0){n.dir*=-1;n.turnT=tic==='mefiant'?.7+Math.random()*.5:2+Math.random()*3.5}if(n.timer<=0)nextStep(n);break}
  }
  const want=n.lookBack>0?-n.dir:n.dir;n.flip+=clamp(want-n.flip,-dt*6,dt*6);
  n.po=poseOf(n,t);
}
function puff(n,col,count,big){const s=scaleAt(n.y);const f=Math.sign(n.flip)||1;for(let i=0;i<count;i++)S.fx.push({k:'puff',x:n.x+f*(big?24:18)*s,y:n.y-(big?102:100)*s,vx:f*(20+Math.random()*30)*s,vy:(-20-Math.random()*25)*s,r:(4+Math.random()*4)*s,c:col,life:1.1+Math.random()*.6})}
function upSniper(rdt){
  if(S.paused)return;
  const dt=rdt*S.slow;S.t+=dt;
  if(S.end&&S.hold){S.hold=false;const b=$('breath');b&&b.classList.remove('hold')}
  if(!S.end){gameClock.s+=dt;while(gameClock.s>=60){gameClock.s-=60;gameClock.m++;if(gameClock.m>=60){gameClock.m=0;gameClock.h++;SFX.bell()}}}
  for(const n of S.crowd)upNpc(n,dt,S.t);
  if(S.hold&&S.winded<=0){S.breath-=rdt/S.breathDur;if(S.breath<=0){S.breath=0;S.hold=false;S.winded=1.6;const b=$('breath');b&&b.classList.remove('hold');toast(tr('Souffle épuisé.','Out of breath.'),true)}}
  else S.breath=Math.min(1,S.breath+rdt/4.5);
  if(S.winded>0)S.winded-=rdt;
  S.cool=Math.max(0,S.cool-rdt);S.shake=Math.max(0,(S.shake||0)-rdt*3.2);S.recoil*=Math.pow(.004,rdt);S.flash=Math.max(0,S.flash-rdt*4);
  for(const f of S.fx){f.life-=dt;if(f.k==='conf'){f.vy+=420*dt;f.vx*=Math.pow(.6,dt);f.r+=f.va*dt}else if(f.k==='puff'){f.r+=dt*6;f.vy*=Math.pow(.5,dt)}else if(f.k==='bird'){f.vy-=40*dt}f.x+=f.vx*dt;f.y+=f.vy*dt}
  S.fx=S.fx.filter(f=>f.life>0);
  const brc=$('brc');if(brc)brc.setAttribute('stroke-dashoffset',276.5*(1-S.breath));
  const fb=$('fire');if(fb)fb.classList.toggle('cool',S.cool>0);
  const ck=$('clk2');if(ck)ck.textContent=`${gameClock.h}:${String(gameClock.m).padStart(2,'0')}:${String(Math.floor(gameClock.s)).padStart(2,'0')}`;
  if(S.hintT>0){S.hintT-=rdt;if(S.hintT<=0&&$('hint2'))$('hint2').style.opacity=0}
  if(S.end){S.endT+=rdt;if(S.end==='win'&&S.endT>1.2)S.slow=lerp(S.slow,1,rdt*3);if(S.endT>(S.end==='escape'||S.end==='abandon'?.6:1.9)&&!S.shown){S.shown=1;showResult()}}
}

/* ---------- Rapport ---------- */
function showResult(){
  const win=S.end==='win';
  const st=[[C.good===3,tr('Renseignement complet','Full intelligence')],[win,tr('Cible neutralisée','Target neutralised')],[win&&S.misses===0,tr('Aucun tir manqué','No missed shot')],[win&&S.head,tr('Tir à la tête','Head shot')]];
  const n=st.filter(s=>s[0]).length;const prime=win?C.of.prime+(n-1)*40:0;
  const rd=C.red>=0?RED[C.red]:null;
  SAVE.contrats++;if(win){SAVE.reussis++;SAVE.rep++}SAVE.francs+=prime;
  if(rd){if(!win)SAVE.redOffer=null}   // dossier rouge raté : il reste ouvert, avec une nouvelle situation
  else SAVE.offers=null;
  const gradeBefore=SAVE.grade,opened=rd&&win?redSucceeded(C.red):[];
  persist();
  MUS.fadeOut();win?SFX.win():SFX.fail();
  let why='';
  if(S.end==='innocent'){const v=S.victim;why=v.kind==='sosie'?tr('Vous avez abattu un sosie. La cible a profité de la confusion pour disparaître.','You shot a double. The target used the confusion to vanish.'):tr('Vous avez abattu un civil. Le contrat est annulé.','You shot a civilian. The contract is void.')}
  if(S.end==='escape')why=tr('La cible a quitté la zone. Le contrat est perdu.','The target left the area. The contract is lost.');
  if(S.end==='abandon')why=tr('Vous avez quitté votre position. Le contrat est annulé.','You left your position. The contract is void.');
  const hm=`${gameClock.h}:${String(gameClock.m).padStart(2,'0')}`;
  if(win)why=tr(`${q(aliasOf(C.of))} a été neutralisé${C.T.genre==='femme'?'e':''} à ${gameClock.h}\u00a0h\u00a0${String(gameClock.m).padStart(2,'0')}. Le Bureau prend acte.`,`${q(aliasOf(C.of))} was neutralised at ${hm}. The Bureau takes note.`);
  if(rd&&win)why+=' '+tr(rd.win,rd.winEn);
  if(rd&&!win)why+=' '+tr('Le dossier rouge reste ouvert : vous pourrez le reprendre depuis le Bureau.','The red file stays open: you can take it up again from the Bureau.');
  const promo=rd&&win&&C.red<RED.length-1?SAVE.grade:0;
  modal(`<span class="stamp ${win?'ok':''}">${win?tr('Exécuté','Done'):tr('Échec','Failed')}</span>${dh(fileNo(C.of),tr('Rapport de mission','Mission report'))}<h2>${win?tr('Contrat exécuté','Contract completed'):tr('Contrat perdu','Contract lost')}</h2>
    <p>${why}</p>${win?'':`<p class="small">${tr('Pour mémoire, la cible','For the record, the target')} ${TICS[C.tic].d}.</p>`}
    <h3>${tr('Évaluation','Assessment')}</h3>
    <div class="eval">${st.map(s=>`<div class="${s[0]?'ok':''}"><i></i>${s[1]}</div>`).join('')}</div>
    <div class="total"><span>${tr('Prime versée','Fee paid')}</span><span class="money">${prime} F</span></div>
    ${promo&&promo>gradeBefore?`<p class="notice">${tr('Promotion : vous passez au grade ','Promotion: you are now ')}<b>${gradeName(promo)}</b>.${opened.length?tr(' Nouveau secteur accessible : ',' New sector available: ')+`<b>${opened.map(k=>MAPS[k].name).join(', ')}</b>.`:''}</p>`:''}
    <div class="btns"><button class="pb red big wide" id="bHQ">${rd&&win&&SAVE.fin&&C.red===RED.length-1?tr('Lire la suite','Read on'):tr('Retour au Bureau','Back to the Bureau')}</button></div>`,rd?'redbrief':'');
  const ending=rd&&win&&C.red===RED.length-1;
  $('bHQ').onclick=()=>{SFX.page();S=null;C=null;sprClear();if(ending)showEnding(showHQ);else showHQ()};
}

/* =========================================================
   ENTRÉES TACTILES
   ========================================================= */
cv.addEventListener('pointerdown',e=>{ac();if(MODE==='mg'&&MG&&MG.id==='lieu'){const r=cv.getBoundingClientRect();mgLieuTap(e.clientX-r.left,e.clientY-r.top);return}if(MODE==='sniper'&&S&&!S.end&&!S.paused){S.drag={id:e.pointerId,x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY,t0:performance.now()};cv.setPointerCapture(e.pointerId)}});
cv.addEventListener('pointermove',e=>{
  if(!S||!S.drag||S.drag.id!==e.pointerId)return;
  const dx=e.clientX-S.drag.x,dy=e.clientY-S.drag.y;S.drag.x=e.clientX;S.drag.y=e.clientY;
  if(eyeMode()){S.cam.x-=dx/eyeGeo().k;clampCam();return}
  const g=scopeGeo(),k=g.r*2/S.Z[S.z].w;S.cam.x+=dx/k*.9;S.cam.y+=dy/k*.9;clampCam();
});
['pointerup','pointercancel'].forEach(ev=>cv.addEventListener(ev,e=>{if(!S||!S.drag||S.drag.id!==e.pointerId)return;const d=S.drag;S.drag=null;
  // un simple toucher à l'œil nu : on épaule et on vise ce point
  if(ev==='pointerup'&&eyeMode()&&!S.end&&!S.paused&&Math.hypot(e.clientX-d.x0,e.clientY-d.y0)<12&&performance.now()-d.t0<450){
    const r=cv.getBoundingClientRect(),w=eyeToWorld(e.clientX-r.left,e.clientY-r.top);if(w.y<Y0-260||w.y>Y1+40)return;
    let best=null,bd=60;for(const n of S.crowd){if(n.state==='gone'||n.dead)continue;const sc=scaleAt(n.y),d=Math.hypot(n.x-w.x,(n.y-60*sc)-w.y);if(d<bd){bd=d;best=n}}
    let tx=w.x,ty=w.y;if(best){tx=best.x;ty=best.y-70*scaleAt(best.y)}
    S.cam.x=tx;S.cam.y=ty;setZoom(1)}}));

/* =========================================================
   RENDU
   ========================================================= */
function drawFx(){
  for(const f of S.fx){
    if(f.k==='conf'){ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.r);ctx.fillStyle=f.c;ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.globalAlpha=clamp(f.life,0,1);ctx.beginPath();ctx.moveTo(-f.s,-f.s*.6);ctx.lineTo(f.s,-f.s*.3);ctx.lineTo(-f.s*.2,f.s*.7);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
    else if(f.k==='puff'){ctx.globalAlpha=clamp(f.life,0,1)*.85;ctx.fillStyle=f.c;ctx.strokeStyle='rgba(120,110,130,.5)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,7);ctx.fill();ctx.stroke();ctx.globalAlpha=1}
    else if(f.k==='bird'){ctx.globalAlpha=clamp(f.life,0,1);drawBird(f.x,f.y,f.s,TNOW*20,Math.sign(f.vx)||1);ctx.globalAlpha=1}
  }
}
/* à l'œil nu : la zone entière, sans lunette ni réticule */
function renderEyes(){
  const g=eyeGeo(),k=g.k,cx=S.cam.x,top=g.yb-g.bot/k;
  ctx.fillStyle='#0d0b12';ctx.fillRect(0,0,SW,SH);
  ctx.save();ctx.translate(SW/2,g.bot);ctx.scale(k,k);ctx.translate(-cx,-g.yb);
  VIEW=[cx-g.w/2-60,top-60,cx+g.w/2+60,g.yb+200];
  drawSceneWithHoles();ctx.restore();
  for(const n of S.crowd){if(n.state==='gone'||n.dead)continue;const sc=scaleAt(n.y);const sx=SW/2+(n.x-cx)*k,sy=g.bot+(n.y-160*sc-g.yb)*k;
    if(S.pins.has(n.id)){const c=PINC[S.pins.get(n.id)];ctx.save();ctx.translate(sx,sy);ctx.fillStyle='#2b2233';ctx.fillRect(-1,-2,2,9);ctx.beginPath();ctx.arc(0,-5,5.5,0,7);ctx.fillStyle=c;ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.fill();ctx.stroke();ctx.restore()}}
  ctx.drawImage(ovCanvas('eyes',SW,SH,()=>{ctx.fillStyle=paperPattern();ctx.fillRect(0,0,SW,SH);
    const vg=ctx.createRadialGradient(SW/2,SH*.55,SH*.3,SW/2,SH*.55,SH*.8);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.45)');ctx.fillStyle=vg;ctx.fillRect(0,0,SW,SH)}),0,0,SW,SH);
  if(S.flash>0){ctx.fillStyle=`rgba(255,250,230,${S.flash*.5})`;ctx.fillRect(0,0,SW,SH)}
}
/* ---------- calques fixes (grain de papier, vignettage, réticule) : préparés une fois, recollés à chaque image ---------- */
const OVC={};
function ovCanvas(key,w,h,draw){const id=key+'|'+w+'|'+h+'|'+DPR;const o=OVC[key];if(o&&o.id===id)return o.cv;
  const c2=document.createElement('canvas');c2.width=Math.ceil(w*DPR);c2.height=Math.ceil(h*DPR);const x=c2.getContext('2d');x.scale(DPR,DPR);
  const old=ctx;ctx=x;try{draw()}finally{ctx=old}OVC[key]={id,cv:c2};return c2}
function renderSniper(){
  const sk=S.shake||0;if(sk>0){ctx.fillStyle='#0d0b12';ctx.fillRect(0,0,SW,SH);ctx.save();ctx.translate((Math.random()-.5)*18*sk,(Math.random()-.5)*14*sk-6*sk)}
  renderSniper2();if(sk>0)ctx.restore()}
function renderSniper2(){
  if(eyeMode()){renderEyes();return}
  const g=scopeGeo();const Z=S.Z[S.z].w;const k=g.r*2/Z;const a=aimPoint();
  ctx.fillStyle='#0d0b12';ctx.fillRect(0,0,SW,SH);
  ctx.save();ctx.beginPath();ctx.arc(g.cx,g.cy,g.r,0,7);ctx.clip();
  ctx.translate(g.cx,g.cy);ctx.scale(k,k);ctx.translate(-a.x,-a.y);
  VIEW=[a.x-Z/2-60,a.y-Z/2-60,a.x+Z/2+60,a.y+Z/2+60];
  drawSceneWithHoles();
  ctx.restore();
  // épingles, points d'exclamation (taille écran)
  ctx.save();ctx.beginPath();ctx.arc(g.cx,g.cy,g.r,0,7);ctx.clip();
  for(const n of S.crowd){if(n.state==='gone'||n.dead)continue;const s=scaleAt(n.y);const sx=g.cx+(n.x-a.x)*k,sy=g.cy+(n.y-160*s-a.y)*k;
    if(S.pins.has(n.id)){const c=PINC[S.pins.get(n.id)];ctx.save();ctx.translate(sx,sy-4);ctx.fillStyle='#2b2233';ctx.fillRect(-1.5,-2,3,14);ctx.beginPath();ctx.arc(0,-6,8,0,7);ctx.fillStyle=c;ctx.strokeStyle='#fff';ctx.lineWidth=2.5;ctx.fill();ctx.stroke();ctx.restore()}
    if(n.bang>0){ctx.save();ctx.translate(sx+14,sy-12);ctx.rotate(.15);ctx.fillStyle='#fbf6ea';ctx.strokeStyle='#2b2233';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,10,13,0,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#d4483b';ctx.font="700 17px 'Stardos Stencil', serif";ctx.textAlign='center';ctx.fillText('!',0,6);ctx.restore()}}
  const D=g.r*2;
  ctx.drawImage(ovCanvas('scope',D,D,()=>{ctx.fillStyle=paperPattern();ctx.fillRect(0,0,D,D);
    const vg=ctx.createRadialGradient(g.r,g.r,g.r*.62,g.r,g.r,g.r);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.55)');ctx.fillStyle=vg;ctx.fillRect(0,0,D,D)}),g.cx-g.r,g.cy-g.r,D,D);
  if(S.flash>0){ctx.fillStyle=`rgba(255,250,230,${S.flash*.7})`;ctx.fillRect(g.cx-g.r,g.cy-g.r,g.r*2,g.r*2)}
  ctx.restore();
  // réticule
  const RB=g.r+12;
  ctx.drawImage(ovCanvas('reticle',RB*2,RB*2,()=>{ctx.translate(RB,RB);
  const line=(x1,y1,x2,y2,w)=>{ctx.lineWidth=w+2.5;ctx.strokeStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.lineWidth=w;ctx.strokeStyle='#1a1620';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()};
  const gap=g.r*.08;line(-g.r,0,-gap,0,1.5);line(gap,0,g.r,0,1.5);line(0,-g.r,0,-gap,1.5);line(0,gap,0,g.r,1.5);
  line(-g.r,0,-g.r*.55,0,4);line(g.r*.55,0,g.r,0,4);line(0,g.r*.55,0,g.r,4);
  for(let i=1;i<=4;i++){const d=gap+i*g.r*.09;[[d,0],[-d,0],[0,d]].forEach(([x,y])=>{ctx.fillStyle='#1a1620';ctx.beginPath();ctx.arc(x,y,2,0,7);ctx.fill()})}
  ctx.fillStyle='#d4483b';ctx.beginPath();ctx.arc(0,0,2.6,0,7);ctx.fill();
  ctx.lineWidth=10;ctx.strokeStyle='#1a1620';ctx.beginPath();ctx.arc(0,0,g.r+3,0,7);ctx.stroke();ctx.lineWidth=2;ctx.strokeStyle='#5d5470';ctx.beginPath();ctx.arc(0,0,g.r+8,0,7);ctx.stroke()}),g.cx-RB,g.cy-RB,RB*2,RB*2);
  ctx.save();ctx.translate(g.cx,g.cy);
  if(S.winded>0){ctx.fillStyle='#fbf6ea';ctx.font="600 13px 'IBM Plex Sans Condensed', sans-serif";ctx.textAlign='center';ctx.fillText(tr('Souffle court','Short of breath'),0,g.r-18)}
  ctx.restore();
}
function drawSceneWithHoles(){
  const opts=TEST&&SAVE.seeTarget?{mark:n=>n.isTarget}:{};
  SPR_ON=S.Z[S.z].w>=700?'all':'still';SPR_LEFT=2;   // pantins mis en cache (voir sprDraw et drawNpc)
  bgDraw(S.t);
  for(const h of S.holes){ctx.fillStyle='#2b2233';ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.beginPath();for(let i=0;i<9;i++){const an=i/9*Math.PI*2,r2=h.r*(i%2?.6:1.2);ctx.lineTo(h.x+Math.cos(an)*r2,h.y+Math.sin(an)*r2)}ctx.closePath();ctx.stroke();ctx.fill()}
  const list=S.crowd.filter(n=>n.state!=='gone').sort((a,b)=>a.y-b.y);let i=0;
  for(const g of M.props){while(i<list.length&&list[i].y<=g.z){drawNpc(list[i],S.t,opts);i++}if(vis(g.bb))drawItems(g.items,true)}
  while(i<list.length){drawNpc(list[i],S.t,opts);i++}
  SPR_ON=false;
  drawFx();drawStage(S.t);
}
function renderAttract(dt){
  if(M.id!==attract.map)useMap(attract.map);
  attract.x+=dt*22;const span=W-500;const x=250+((Math.sin(attract.x/span*Math.PI)+1)/2)*span;
  const k=Math.max(SH/1080,SW/680);ctx.fillStyle='#000';ctx.fillRect(0,0,SW,SH);
  ctx.save();ctx.translate(SW/2,SH/2);ctx.scale(k,k);ctx.translate(-x,-430);
  VIEW=[x-SW/2/k-60,430-SH/2/k-60,x+SW/2/k+60,430+SH/2/k+60];
  drawScene(T,null);ctx.restore();
  ctx.fillStyle=paperPattern();ctx.fillRect(0,0,SW,SH);
  ctx.fillStyle=MODE==='title'?'rgba(15,10,20,.2)':'rgba(15,10,20,.45)';ctx.fillRect(0,0,SW,SH);
}
function frame(now){
  const raw=Math.min(1,(now-last)/1000),rdt=Math.min(.05,raw);last=now;T+=rdt;TNOW=T;
  const w0=performance.now();
  perfTick(raw,(MODE==='sniper'&&S&&!S.paused)||MODE==='mg'?MODE+(S?S.z:''):'');   // un changement de zoom compte comme une nouvelle scène
  ctx.setTransform(DPR,0,0,DPR,0,0);
  try{
    if(MODE==='sniper'&&S){upSniper(rdt);TNOW=S.t;renderSniper()}
    else if(MODE==='mg'&&MG){if(MG.id==='tic'){mgTicUpdate(rdt);if(MG)mgTicRender()}else{mgLieuUpdate(rdt);mgLieuRender()}}
    else if(MODE!=='desk')renderAttract(rdt);
  }catch(err){console.error(err)}
  PERF.work+=((performance.now()-w0)-PERF.work)*.2;   // temps de calcul d'une image (hors attente de l'écran)
  requestAnimationFrame(frame);
}
useMap('tilleuls');
requestAnimationFrame(frame);
/* ---------- Version en ligne : jeu installable, hors ligne, « Nouvelle version disponible » ---------- */
(function(){if(TEST||!('serviceWorker' in navigator)||!/^https?:$/.test(location.protocol)||location.hostname.endsWith('claude.ai')||!document.querySelector('link[rel=manifest]'))return;
  const ban=w=>{if($('upd'))return;const d=document.createElement('div');d.id='upd';d.innerHTML=`<span>${tr('Nouvelle version disponible','New version available')}</span><button class="pb sm red">${tr('Mettre à jour','Update')}</button><button class="x" aria-label="${tr('Plus tard','Later')}">×</button>`;
    d.querySelector('.x').onclick=()=>d.remove();d.querySelector('.pb').onclick=()=>{persist();let done=false;const go=()=>{if(!done){done=true;location.reload()}};navigator.serviceWorker.addEventListener('controllerchange',go);w.postMessage('skip');setTimeout(go,3000)};$('app').appendChild(d)};
  try{navigator.serviceWorker.register('sw.js').then(r=>{if(r.waiting&&navigator.serviceWorker.controller)ban(r.waiting);r.addEventListener('updatefound',()=>{const w=r.installing;w&&w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)ban(w)})});setInterval(()=>r.update().catch(()=>{}),36e5)}).catch(()=>{})}catch(e){}
})();
