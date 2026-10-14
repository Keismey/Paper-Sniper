/* =========================================================
   CARRIÈRE (v1.1) : grades, dossiers rouges, fin, notes de mise à jour
   ---------------------------------------------------------
   - Chaque contrat réussi rapporte 1 point de réputation (SAVE.rep).
   - À certains seuils, un dossier rouge apparaît au Bureau. Le réussir fait monter
     d'un grade (SAVE.grade = nombre de dossiers rouges réussis) et ouvre de nouvelles cartes.
   - Le cinquième dossier rouge clôt l'histoire (SAVE.fin) ; les contrats continuent ensuite.
   - Le grade règle aussi la difficulté des contrats ordinaires (voir careerLv et ses usages).
   ========================================================= */
const VERSION='1.1';

const GRADES=[
  {fr:'Recrue',en:'Recruit'},
  {fr:'Agent',en:'Agent'},
  {fr:'Agent confirmé',en:'Senior agent'},
  {fr:'Spécialiste',en:'Specialist'},
  {fr:'As du Bureau',en:'Bureau ace'},
  {fr:'Le Fantôme',en:'The Ghost'},
];
const gradeName=g=>tr(GRADES[g].fr,GRADES[g].en);

/* Les cinq dossiers rouges : la Volière, un réseau dont les membres portent des noms d'oiseaux.
   rep : contrats réussis nécessaires pour que le dossier apparaisse.
   look : traits imposés à la cible. tw : complication (noInfo : indicateurs muets ;
   short : rendez-vous éclair ; extra : un sosie de plus). */
const RED=[
  {rep:2,map:'tilleuls',stars:1,prime:420,n:'La Pie',en:'The Magpie',look:{genre:'femme'},tw:{},
   brief:["Trois de nos agents sont tombés ce mois-ci. Chaque fois, l'adversaire savait où les attendre. Quelqu'un vend nos dossiers.","Nous soupçonnons un réseau : la Volière. Ses membres portent des noms d'oiseaux. La Pie relève leur courrier. Elle passe ce matin sur la place des Tilleuls. — A."],
   briefEn:["Three of our agents fell this month. Each time, the enemy knew where to wait for them. Someone is selling our files.","We suspect a network: the Aviary. Its members go by the names of birds. The Magpie collects their mail. She crosses Lindens Square this morning. — A."],
   win:"Dans la doublure du manteau de la Pie : une plume de geai, et un reçu de consigne du port aux Mouettes. Quelqu'un y a déposé un paquet pour la Volière.",
   winEn:"In the lining of the Magpie's coat: a jay's feather, and a left-luggage ticket from Gull Harbour. Someone has dropped off a parcel there for the Aviary."},
  {rep:5,map:'port',stars:2,prime:560,n:'Le Hibou',en:'The Owl',look:{genre:'homme'},tw:{noInfo:1},
   brief:["Le paquet de la consigne contenait des photographies : nos propres planques, prises de l'intérieur. Le Hibou est le photographe de la Volière.","Il travaille la nuit et traîne le jour sur le port. Les indicateurs du quai ont été payés avant nous : cette fois, personne ne vous vendra rien. — A."],
   briefEn:["The parcel at the left-luggage office held photographs: our own safe houses, taken from the inside. The Owl is the Aviary's photographer.","He works at night and idles on the harbour by day. The dockside informants were paid before we got to them: this time, nobody will sell you anything. — A."],
   win:"Le Hibou portait un appareil chargé. Sur la dernière photo : un couloir du Bureau, et une porte que seuls les cadres peuvent ouvrir. La taupe est chez nous.",
   winEn:"The Owl carried a loaded camera. On the last frame: a corridor inside the Bureau, and a door only senior staff can open. The mole is one of us."},
  {rep:9,map:'foire',stars:3,prime:700,n:'La Mouette',en:'The Gull',look:{genre:'femme'},tw:{short:1},
   brief:["La Volière se retrouve à la fête foraine, entre les manèges. La Mouette porte les messages d'un oiseau à l'autre.","Elle ne s'attarde jamais : à son rendez-vous de midi, vous n'aurez que quelques secondes. — A."],
   briefEn:["The Aviary meets at the funfair, between the rides. The Gull carries messages from one bird to the next.","She never lingers: at her noon meeting, you will have only a few seconds. — A."],
   win:"Le message de la Mouette n'avait qu'un destinataire : « Au Coucou ». Le coucou pond ses œufs dans le nid des autres. Notre taupe a un nom.",
   winEn:"The Gull's message had a single addressee: “To the Cuckoo”. The cuckoo lays its eggs in other birds' nests. Our mole has a name."},
  {rep:13,map:'port',stars:3,prime:850,n:'Le Corbeau',en:'The Raven',look:{genre:'homme'},tw:{extra:1},
   brief:["Le Corbeau dirige la Volière. Il sait que nous approchons : il a fait habiller un figurant de plus à son image.","Abattez-le, et la Volière n'a plus de tête. Le Coucou, lui, devra sortir du nid. — A."],
   briefEn:["The Raven runs the Aviary. He knows we are closing in: he has had one more extra dressed in his likeness.","Take him down, and the Aviary loses its head. The Cuckoo will have to leave the nest. — A."],
   win:"Dans la poche du Corbeau, une seule clé, en laiton, numérotée. C'est une clé des archives du Bureau. Le Chef vous félicite par écrit, et signe comme toujours d'une seule lettre : « A. »",
   winEn:"In the Raven's pocket, a single numbered brass key. It opens the Bureau's archives. The Chief congratulates you in writing, and signs, as always, with a single letter: “A.”"},
  {rep:17,map:'tilleuls',stars:3,prime:1000,n:'Le Coucou',en:'The Cuckoo',look:{genre:'homme',chapeau:'haut',acc:'canne'},tw:{extra:1},from:'odette',
   brief:["Ce dossier ne vient pas du Bureau. Je suis l'archiviste. La clé du Corbeau ouvre mon armoire, et une seule autre personne en possède le double : le Chef.","Il ne démantelait pas la Volière. Il effaçait, par votre main, les seuls témoins qui connaissaient son visage. À midi, place des Tilleuls, il rencontre son acheteur. Là où tout a commencé. — Odette"],
   briefEn:["This file does not come from the Bureau. I am the archivist. The Raven's key opens my cabinet, and only one other person holds a copy: the Chief.","He was not dismantling the Aviary. Through your hand, he was erasing the only witnesses who knew his face. At noon, on Lindens Square, he meets his buyer. Where it all began. — Odette"],
   win:"Le Coucou est tombé au pied de la fontaine. Son acheteur s'est fondu dans la foule, sa mallette à la main, vide.",
   winEn:"The Cuckoo fell at the foot of the fountain. His buyer slipped into the crowd, briefcase in hand, empty."},
];
const redName=i=>tr(RED[i].n,RED[i].en);
/* oiseaux de la Volière : jamais utilisés comme alias de contrats ordinaires */
const BIRD_ALIASES=['Le Corbeau','La Pie','Le Hibou','La Mouette'];

/* cartes ouvertes à chaque grade */
const MAP_GRADE={tilleuls:0,port:1,foire:2};

/* ---------- sauvegarde : champs de carrière, reprise des anciennes parties ---------- */
function careerInit(){
  if(SAVE.grade===undefined){
    SAVE.grade=0;SAVE.dr=0;SAVE.fin=0;
    // une partie d'avant la v1.1 garde les cartes qu'elle avait déjà (ouvertes à 2 et 4 contrats)
    SAVE.maps=['tilleuls'];if(SAVE.rep>=2)SAVE.maps.push('port');if(SAVE.rep>=4)SAVE.maps.push('foire');
    if(SAVE.contrats)SAVE.oldPlayer=1;
  }
  if(!Array.isArray(SAVE.maps))SAVE.maps=['tilleuls'];
  for(const k in MAP_GRADE)if(SAVE.grade>=MAP_GRADE[k]&&!SAVE.maps.includes(k))SAVE.maps.push(k);
  SAVE.redOffer=SAVE.redOffer||null;
  persist();
}
careerInit();

/* difficulté des contrats ordinaires : 0 (recrue) à 4 (as du Bureau et au-delà) */
const careerLv=()=>Math.min(4,SAVE.grade||0);
/* dossier rouge en attente (index), ou -1 */
function redAvailable(){const i=SAVE.dr||0;return i<RED.length&&SAVE.rep>=RED[i].rep?i:-1}
function redOffer(){
  const i=redAvailable();if(i<0)return null;
  if(!SAVE.redOffer||SAVE.redOffer.red!==i){SAVE.redOffer={id:Date.now(),red:i,seed:Math.floor(Math.random()*1e9),stars:RED[i].stars,map:RED[i].map,prime:RED[i].prime};persist()}
  return SAVE.redOffer;
}
/* contrats encore nécessaires avant le prochain dossier rouge (0 s'il est ouvert, -1 si l'histoire est finie) */
function contractsToRed(){const i=SAVE.dr||0;if(i>=RED.length)return-1;return Math.max(0,RED[i].rep-SAVE.rep)}

/* ---------- réussite d'un dossier rouge : promotion ---------- */
function redSucceeded(i){
  SAVE.dr=i+1;SAVE.grade=Math.max(SAVE.grade,i+1);SAVE.redOffer=null;
  SAVE.offers=null;   // nouvelles offres au niveau du nouveau grade (et sur les cartes qui viennent d'ouvrir)
  const opened=[];for(const k in MAP_GRADE)if(SAVE.grade>=MAP_GRADE[k]&&!SAVE.maps.includes(k)){SAVE.maps.push(k);opened.push(k)}
  if(i===RED.length-1)SAVE.fin=1;
  persist();return opened;
}

/* ---------- bloc carrière du Bureau ---------- */
function careerHTML(){
  const g=SAVE.grade||0,left=contractsToRed();
  const pips=RED.map((_,i)=>`<i class="${i<(SAVE.dr||0)?'on':''}" title="${redName(i)}"></i>`).join('');
  const line=SAVE.fin?tr('Dossier clos. Les contrats continuent d\'arriver.','Case closed. Contracts keep coming in.')
    :left===0?tr('Un dossier rouge vous attend.','A red file is waiting for you.')
    :tr(`Prochain dossier rouge dans ${left} ${plural(left,'contrat exécuté','contrats exécutés')}.`,`Next red file in ${left} completed ${plural(left,'contract','contracts')}.`);
  return`<div class="career"><div><small>${tr('Grade','Rank')}</small><b>${gradeName(g)}</b></div><div class="rpips" aria-label="${tr('Dossiers rouges','Red files')} ${SAVE.dr||0}/5">${pips}</div><p>${line}</p></div>`;
}
/* carte du dossier rouge au Bureau */
function redCardHTML(o){
  const R0=RED[o.red],tw=R0.tw;
  const twist=tw.noInfo?tr('Indicateurs muets.','Informants silenced.'):tw.short?tr('Rendez-vous éclair.','Brief meeting.'):tw.extra?tr('Un sosie de plus.','One extra double.'):tr('Première piste.','First lead.');
  return`<button class="ccard red" id="bRed" data-n="${tr('Dossier rouge','Red file')} ${o.red+1}/5"><span class="sil" aria-hidden="true">!</span><span>
    <span class="al">${q(redName(o.red))}</span><span class="mp">${MAPS[o.map].name}</span>
    <span class="ln"><span>${tr('Risque','Risk')} ${risk(o.stars)}</span><span class="pr">${o.prime} F</span></span>
    <span class="dt">${twist} ${tr('Promotion à la clé.','Promotion on success.')}</span></span></button>`;
}
/* texte de complication d'un dossier rouge (briefing) */
function redTwistText(tw){
  if(tw.noInfo)return tr('Les indicateurs ont été payés pour se taire : rien ne s\'achète pendant l\'enquête.','The informants were paid to keep quiet: nothing can be bought during the investigation.');
  if(tw.short)return tr('La cible ne reste que quelques secondes à son rendez-vous de midi.','The target stays only a few seconds at the noon meeting.');
  if(tw.extra)return tr('Un sosie de plus que d\'habitude sera sur le terrain.','One more double than usual will be in the field.');
  return null;
}

/* ---------- l'épilogue (après le cinquième dossier rouge) ---------- */
function showEnding(then){
  MODE='brief';closeModals();ui('');MUS.play('planque');
  const v=modal(`<span class="stamp">${tr('Classé','Closed')}</span>${dh(tr('Sans en-tête','No letterhead'),tr('Lendemain matin','The next morning'))}<span class="tag">${tr('Épilogue','Epilogue')}</span><h2>${tr('Le Fantôme','The Ghost')}</h2>
    <p>${tr('Le lendemain, une note tapée à la machine attend sur votre bureau. Pas de signature, pas de tampon.','The next morning, a typewritten note waits on your desk. No signature, no stamp.')}</p>
    <p class="quote">${tr('« Le Bureau n\'a jamais eu de chef nommé A. Il n\'a jamais employé d\'agent à votre nom. Odette a pris sa retraite hier soir. Continuez. »','“The Bureau never had a chief named A. It never employed an agent by your name. Odette retired last night. Carry on.”')}</p>
    <p>${tr('Vous n\'existez plus sur le papier. Pour le Bureau, vous êtes désormais le Fantôme.','You no longer exist on paper. To the Bureau, you are now the Ghost.')}</p>
    <div class="notice">${tr('Titre obtenu : <b>Le Fantôme</b>. Les contrats continuent, au niveau de risque le plus élevé.','Title earned: <b>The Ghost</b>. Contracts keep coming, at the highest risk level.')}</div>
    <div class="btns"><button class="pb red big wide" id="bEnd">${tr('Retour au Bureau','Back to the Bureau')}</button></div>`,'ending');
  $('bEnd').onclick=()=>{SFX.page();SAVE.grade=5;persist();then()};
}

/* ---------- notes de mise à jour ---------- */
const NOTES=[
  {v:'1.1',d:['14 octobre 2026','14 October 2026'],fr:[
    '<b>Carrière au Bureau.</b> Cinq grades, de Recrue à As du Bureau. Les cartes s\'ouvrent avec les promotions.',
    '<b>Dossiers rouges.</b> Cinq contrats scénarisés contre la Volière, chacun avec sa complication. Le dernier clôt l\'histoire.',
    '<b>Difficulté progressive.</b> Plus vous montez en grade, plus la foule est dense et le rendez-vous de midi court. Les primes suivent.',
    'Lunette ×1 et ×2 beaucoup plus fluides sur téléphone.',
    'Votre partie en cours est conservée, avec les cartes déjà ouvertes.'],
   en:[
    '<b>A career at the Bureau.</b> Five ranks, from Recruit to Bureau ace. Promotions open up new maps.',
    '<b>Red files.</b> Five story contracts against the Aviary, each with its own complication. The last one closes the story.',
    '<b>Rising difficulty.</b> The higher your rank, the denser the crowd and the shorter the noon meeting. Fees rise to match.',
    'Much smoother ×1 and ×2 scope on phones.',
    'Your current game is kept, along with the maps already open.']},
  {v:'1.0',d:['10 octobre 2026','10 October 2026'],fr:['Première version jouable : trois cartes, trois épreuves d\'enquête, l\'armurerie.'],en:['First playable version: three maps, three investigation trials, the armoury.']},
];
function showNotes(then){
  const v=modal(`${dh(tr('Notes de mise à jour','Release notes'),'v'+VERSION)}<h2>${tr('Quoi de neuf','What\'s new')}</h2>
    ${NOTES.map(n=>`<h3>${tr('Version','Version')} ${n.v} · ${tr(n.d[0],n.d[1])}</h3><ul class="notes">${tr(n.fr,n.en).map(l=>`<li>${l}</li>`).join('')}</ul>`).join('')}
    <div class="btns"><button class="pb red big wide" id="bNotes">${tr('Fermer','Close')}</button></div>`);
  $('bNotes').onclick=()=>{SFX.page();v.remove();SAVE.seenV=VERSION;persist();then&&then()};
}
