'use strict';
/* =========================================================
   COUPE-PAPIER — Keismey Studio
   Moteur : utilitaires, sauvegarde, sons, pantins en papier, tics
   ========================================================= */
const TEST=true; // mode test (panneau dans la planque) — à passer à false pour la version publique
const $=id=>document.getElementById(id);
const cv=$('cv');let ctx=cv.getContext('2d');
const UI=$('ui');
let DPR=1,SW=360,SH=640;
function resize(){const r=$('app').getBoundingClientRect();SW=r.width;SH=r.height;DPR=Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(SW*DPR);cv.height=Math.round(SH*DPR)}
addEventListener('resize',resize);resize();

/* ---------- Hasard & maths ---------- */
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let R=Math.random;
const ri=(a,b)=>a+Math.floor(R()*(b-a+1));
const pick=a=>a[Math.floor(R()*a.length)];
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>1-Math.pow(1-clamp(t,0,1),3);
const env=a=>a<0?0:Math.sin(clamp(a,0,1)*Math.PI); // enveloppe d'une animation de tic
const P=()=>new Path2D();
function rr(x,y,w,h,r){const p=P();if(r&&p.roundRect)p.roundRect(x,y,w,h,r);else p.rect(x,y,w,h);return p}
function shade(hex,k){const n=parseInt(hex.slice(1),16);const f=v=>clamp(Math.round(k<0?v*(1+k):v+(255-v)*k),0,255);return'#'+((1<<24)+(f(n>>16)<<16)+(f(n>>8&255)<<8)+f(n&255)).toString(16).slice(1)}
const inR=(r,x,y)=>x>=r[0]&&x<=r[2]&&y>=r[1]&&y<=r[3];

/* ---------- Sauvegarde ---------- */
const SKEY='coupe-papier.v2';
let SAVE={francs:150,rep:0,contrats:0,reussis:0,upg:{},seed:1,offers:null,tutoP:0,tutoS:0,seeTarget:0};
try{const s=JSON.parse(localStorage.getItem(SKEY)||'null');if(s)SAVE=Object.assign(SAVE,s)}catch(e){}
function persist(){try{localStorage.setItem(SKEY,JSON.stringify(SAVE))}catch(e){}}
const upg=id=>SAVE.upg[id]||0;
/* ---------- Langue : français ou anglais (détectée au premier lancement, réglable) ---------- */
if(SAVE.lang!=='fr'&&SAVE.lang!=='en')SAVE.lang=/^fr/i.test(navigator.language||'fr')?'fr':'en';
try{const ql=new URLSearchParams(location.search).get('lang');if(ql==='fr'||ql==='en')SAVE.lang=ql}catch(e){}  // le hub choisit la langue par ?lang=
document.documentElement.lang=SAVE.lang;
const tr=(fr,en)=>SAVE.lang==='en'?en:fr;
/* objet dont les valeurs suivent la langue */
function bil(fr,en){const o={};for(const k in fr)Object.defineProperty(o,k,{get:()=>SAVE.lang==='en'&&en[k]!==undefined?en[k]:fr[k],enumerable:true});return o}
/* ajoute des champs traduits (getters) à une fiche de données */
function bilf(o,en){for(const k in en){const fr=o[k];Object.defineProperty(o,k,{get:()=>SAVE.lang==='en'?en[k]:fr,enumerable:true})}return o}

/* ---------- Audio (synthé, démarre au premier toucher) ---------- */
let AC=null,NB_=null;
function ac(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){return null}}if(AC.state!=='running'&&AUD_OK)AC.resume().catch(()=>{});return AC}
/* Déverrouillage du son : les navigateurs mobiles (et les vues intégrées) n'autorisent l'audio qu'après un vrai geste.
   On crée et on relance le contexte au premier toucher, n'importe où, avec un échantillon muet. */
let AUD_OK=false;
function unlockAudio(){let a=AC;if(!a){try{a=AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){return}}
  if(a.state!=='running')a.resume().catch(()=>{});
  if(!AUD_OK){try{const b=a.createBuffer(1,1,22050),s=a.createBufferSource();s.buffer=b;s.connect(a.destination);s.start(0)}catch(e){}AUD_OK=true;
    if(typeof MUS!=='undefined'&&MUS.want&&!MUS.cur&&SAVE.music)MUS.play(MUS.want)}}
['pointerdown','pointerup','touchstart','touchend','mousedown','click','keydown'].forEach(ev=>document.addEventListener(ev,unlockAudio,{capture:true,passive:true}));
document.addEventListener('visibilitychange',()=>{if(!AC)return;if(document.hidden)AC.suspend().catch(()=>{});else if(AUD_OK)AC.resume().catch(()=>{})});
function tone(f1,f2,dur,type,vol,delay){if(SAVE.music===0||!AUD_OK)return;const a=ac();if(!a)return;const t=a.currentTime+(delay||0);const o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+dur);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||.12,t+.01);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g).connect(a.destination);o.start(t);o.stop(t+dur+.05)}
function noise(dur,vol,ft,freq,delay){if(SAVE.music===0||!AUD_OK)return;const a=ac();if(!a)return;const t=a.currentTime+(delay||0);if(!NB_){NB_=a.createBuffer(1,a.sampleRate,a.sampleRate);const d=NB_.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}const s=a.createBufferSource();s.buffer=NB_;const f=a.createBiquadFilter();f.type=ft||'lowpass';f.frequency.value=freq||1000;const g=a.createGain();g.gain.setValueAtTime(vol||.1,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(f).connect(g).connect(a.destination);s.start(t);s.stop(t+dur+.05)}
/* ---------- Détonation : claquement + souffle + coup sourd saturé + écho des façades ---------- */
let BUS=null,VERB=null;
function sfxBus(){const a=ac();if(!a)return null;if(BUS)return BUS;
  const comp=a.createDynamicsCompressor();comp.threshold.value=-10;comp.knee.value=8;comp.ratio.value=6;comp.attack.value=.002;comp.release.value=.25;comp.connect(a.destination);
  // réverbération : réponse impulsionnelle générée (rue étroite, ~2,4 s)
  const len=Math.floor(a.sampleRate*2.4),ir=a.createBuffer(2,len,a.sampleRate);
  for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<len;i++){const t=i/a.sampleRate;d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3.2)*(t<.012?t/.012:1)}}
  VERB=a.createConvolver();VERB.buffer=ir;const vg=a.createGain();vg.gain.value=.55;const vl=a.createBiquadFilter();vl.type='lowpass';vl.frequency.value=2400;VERB.connect(vl).connect(vg).connect(comp);
  BUS=comp;return BUS}
function boom(silenced){if(SAVE.music===0||!AUD_OK)return;const a=ac();if(!a)return;const bus=sfxBus(),t=a.currentTime+.005;
  if(!NB_){NB_=a.createBuffer(1,a.sampleRate,a.sampleRate);const d=NB_.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
  const out=a.createGain();out.gain.value=silenced?.3:.85;out.connect(bus);out.connect(VERB);
  const nz=(dur,vol,type,f0,f1,q)=>{const s=a.createBufferSource();s.buffer=NB_;s.playbackRate.value=.7+Math.random()*.3;const f=a.createBiquadFilter();f.type=type;f.Q.value=q||.7;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(f1,t+dur);
    const g=a.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f).connect(g).connect(out);s.start(t);s.stop(t+dur+.05)};
  if(silenced){nz(.09,.9,'bandpass',1400,500,1.2);nz(.25,.4,'lowpass',900,200);return}
  nz(.035,1.6,'highpass',3000,1800);            // claquement supersonique
  nz(.45,1.3,'lowpass',2600,180);               // souffle de la bouche
  nz(1.1,.45,'lowpass',700,90);                 // grondement qui roule
  // coup sourd saturé
  const o=a.createOscillator(),g=a.createGain(),ws=a.createWaveShaper(),cv=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/512-1;cv[i]=Math.tanh(x*4)}ws.curve=cv;
  o.type='sine';o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(32,t+.5);g.gain.setValueAtTime(1.4,t);g.gain.exponentialRampToValueAtTime(.0001,t+.6);o.connect(ws).connect(g).connect(out);o.start(t);o.stop(t+.65);
  // écho sur les façades d'en face
  [[.21,.32],[.47,.16]].forEach(([d,v])=>{const dl=a.createDelay(1);dl.delayTime.value=d;const eg=a.createGain();eg.gain.value=v;const lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1400;out.connect(dl).connect(lp).connect(eg).connect(bus)})}
const SFX={
  tap:()=>tone(660,520,.06,'triangle',.06),
  page:()=>noise(.18,.08,'highpass',2500),
  coin:()=>{tone(988,988,.08,'square',.05);tone(1319,1319,.25,'square',.05,.08)},
  shutter:()=>{noise(.04,.2,'highpass',4000);noise(.06,.12,'bandpass',1200,.05)},
  mark:()=>{noise(.12,.06,'bandpass',3000);tone(500,700,.08,'triangle',.05)},
  stamp:()=>{noise(.12,.25,'lowpass',500);tone(120,60,.15,'sine',.2)},
  good:()=>[523,659,784].forEach((f,i)=>tone(f,f,.25,'sine',.07,i*.07)),
  bad:()=>{tone(220,180,.22,'sawtooth',.06);tone(233,190,.22,'sawtooth',.05,.02)},
  shot:()=>boom(false),
  shotS:()=>boom(true),
  bolt:()=>{noise(.05,.12,'bandpass',1500);noise(.06,.14,'bandpass',900,.18)},
  hit:()=>{noise(.25,.15,'bandpass',600,.05);tone(300,90,.3,'triangle',.12,.05)},
  pin:()=>tone(900,1200,.08,'triangle',.07),
  bell:()=>[0,1,2].forEach(i=>{tone(660,655,1.2,'sine',.09,i*.55);tone(1320,1310,.8,'sine',.03,i*.55)}),
  win:()=>[392,523,659,784,1046].forEach((f,i)=>tone(f,f,.4,'triangle',.08,i*.1)),
  fail:()=>[392,330,262,196].forEach((f,i)=>tone(f,f*.98,.45,'triangle',.08,i*.16)),
};
/* ---------- Musique : trois morceaux en boucle, fondu d'un écran à l'autre ----------
   WebAudio (boucle sans couture) ; à défaut, <audio>. Les fichiers sont à côté de la page. */
const MUS={cur:null,want:null,buf:{},src:null,gain:null,el:{},vol:.55,
  url:k=>'music/'+k+'.mp3',
  async load(k){if(this.buf[k]!==undefined)return this.buf[k];this.buf[k]=null;
    try{const r=await fetch(this.url(k));const ab=await r.arrayBuffer();this.buf[k]=await ac().decodeAudioData(ab)}catch(e){this.buf[k]=false}return this.buf[k]},
  async play(k){this.want=k;if(!SAVE.music||this.cur===k||!AUD_OK)return;const a=ac();if(!a)return;
    this.fadeOut();this.cur=k;const b=await this.load(k);if(this.want!==k||!SAVE.music||this.cur!==k)return;
    if(b){const s=a.createBufferSource(),g=a.createGain();s.buffer=b;s.loop=true;g.gain.setValueAtTime(0.0001,a.currentTime);g.gain.exponentialRampToValueAtTime(this.vol,a.currentTime+1.6);s.connect(g).connect(a.destination);s.start();this.src=s;this.gain=g}
    else{let el=this.el[k];if(!el){el=this.el[k]=new Audio(this.url(k));el.loop=true}el.volume=this.vol;el.currentTime=0;el.play().catch(()=>{});this.src={stop:()=>{}};this.gain={el}}},
  fadeOut(){const a=AC,s=this.src,g=this.gain;this.src=this.gain=null;this.cur=null;if(!s)return;
    if(g.el){const el=g.el;let v=el.volume;const iv=setInterval(()=>{v-=.05;if(v<=0){el.pause();clearInterval(iv)}else el.volume=v},50);return}
    g.gain.cancelScheduledValues(a.currentTime);g.gain.setValueAtTime(Math.max(.0001,g.gain.value),a.currentTime);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+1);s.stop(a.currentTime+1.1)},
  toggle(){SAVE.music=SAVE.music?0:1;persist();if(SAVE.music){const k=this.want;this.cur=null;if(k)this.play(k)}else this.fadeOut()}};
if(SAVE.music===undefined)SAVE.music=1;
let toastT=0;
function toast(msg,bad){const t=$('toast');t.innerHTML=msg;t.classList.toggle('bad',!!bad);t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),2600)}

/* =========================================================
   DONNÉES : tenues, tics, armurerie, indics
   ========================================================= */
const W=1600,H=900,Y0=505,Y1=798;
const scaleAt=y=>.58+(clamp(y,Y0-40,Y1+40)-Y0)/(Y1-Y0)*.42;
const COATS={rouge:'#d4483b',bleu:'#3e6db3',vert:'#4c9a5a',moutarde:'#d9a62e',gris:'#8c8892',violet:'#8b5aa8',brun:'#8a5a3c',rose:'#e08aa0',trench:'#c9ae7e'};
const COATK=['rouge','bleu','vert','moutarde','gris','violet','brun','rose'];
const SKINS=['#f2d0b0','#e6b48e','#c98d63','#a56a44','#7a4a2e'];
const HAIRS=['#2b2026','#5a3a22','#a8642c','#d9b45a','#bdb6ae'];
const PANTS=['#3b3442','#2f3a4a','#4a3b30'];
const HATC=['#2b2233','#5a3e2b','#3c4f6b','#7a2f3a','#e8dcc2','#3d5a3a'];
const HATCN=bil({'#2b2233':'noir','#5a3e2b':'brun','#3c4f6b':'bleu nuit','#7a2f3a':'bordeaux','#e8dcc2':'crème','#3d5a3a':'vert sapin'},{'#2b2233':'black','#5a3e2b':'brown','#3c4f6b':'navy','#7a2f3a':'burgundy','#e8dcc2':'cream','#3d5a3a':'pine green'});
const COATN=bil({rouge:'rouge',bleu:'bleu',vert:'vert',moutarde:'moutarde',gris:'gris',violet:'violet',brun:'brun',rose:'rose',trench:'beige'},{rouge:'red',bleu:'blue',vert:'green',moutarde:'mustard',gris:'grey',violet:'purple',brun:'brown',rose:'pink',trench:'beige'});
const CHAP=['aucun','melon','beret','casquette','haut','cloche','canotier'];
const CHAPN=bil({aucun:'tête nue',melon:'chapeau melon',beret:'béret',casquette:'casquette',haut:'haut-de-forme',cloche:'chapeau cloche',canotier:'canotier'},{aucun:'no hat',melon:'bowler hat',beret:'beret',casquette:'flat cap',haut:'top hat',cloche:'cloche hat',canotier:'boater'});
const ACC=['parapluie','journal','valise','bouquet','canne','rien'];
const ACCN=bil({parapluie:'un parapluie',journal:'un journal',valise:'une valise',bouquet:'un bouquet',canne:'une canne',rien:'les mains vides'},{parapluie:'an umbrella',journal:'a newspaper',valise:'a suitcase',bouquet:'a bouquet',canne:'a walking stick',rien:'empty-handed'});
const AGENT={genre:'homme',chapeau:'melon',manteau:'trench',acc:'rien',skin:'#e6b48e',hair:'#2b2026',pants:'#3b3442',hatc:'#3a3038'};

function genLook(genre){genre=genre||(R()<.5?'homme':'femme');return{genre,chapeau:pick(CHAP.filter(c=>genre==='femme'||c!=='cloche')),manteau:pick(COATK),acc:pick(ACC),skin:pick(SKINS),hair:pick(HAIRS),pants:pick(PANTS),hatc:pick(HATC)}}
const sig=l=>[l.genre,l.chapeau,l.manteau,l.acc,l.chapeau==='aucun'?'':l.hatc].join('|');
const cloneLook=l=>{const c=Object.assign({},l);delete c._rig;return c};
function lookTextMasked(l,mk){if(!mk)return lookText(l);
  if(SAVE.lang==='en'){const hat=mk.hat?'hat ?':l.chapeau==='aucun'?'no hat':`${mk.hatc?'(colour ?)':HATCN[l.hatc]} ${CHAPN[l.chapeau]}`;
    return `${l.genre==='femme'?'Woman':'Man'}, ${mk.coat?'?':COATN[l.manteau]} coat, ${hat}, ${mk.acc?'holding ?':ACCN[l.acc]}`}
  const fe=l.chapeau==='casquette',hc=HATCN[l.hatc]||'',hcA=fe&&(hc==='noir'||hc==='brun')?hc+'e':hc;
  const hat=mk.hat?'chapeau ?':l.chapeau==='aucun'?'tête nue':`${CHAPN[l.chapeau]} ${mk.hatc?'(couleur ?)':hcA}`.trim();
  return `${l.genre==='femme'?'Femme':'Homme'}, manteau ${mk.coat?'?':l.manteau}, ${hat}, ${mk.acc?'objet en main ?':ACCN[l.acc]}`}
function lookText(l){
  if(SAVE.lang==='en'){const hat=l.chapeau==='aucun'?'no hat':`${HATCN[l.hatc]} ${CHAPN[l.chapeau]}`;return `${l.genre==='femme'?'Woman':'Man'}, ${COATN[l.manteau]} coat, ${hat}, ${ACCN[l.acc]}`}
  const fe=l.chapeau==='casquette',hc=HATCN[l.hatc]||'',hcA=fe&&(hc==='noir'||hc==='brun')?hc+'e':hc;
  const hat=l.chapeau==='aucun'?'tête nue':`${CHAPN[l.chapeau]} ${hcA}`.trim();
  return `${l.genre==='femme'?'Femme':'Homme'}, manteau ${l.manteau}, ${hat}, ${ACCN[l.acc]}`;
}

/* Les tics : v = visibilité (1 = se voit de loin, 3 = il faut zoomer fort) */
const TICS={
  montre:{n:'Montre',d:'regarde sa montre toutes les quelques secondes',v:2,per:4.2,dur:1.4},
  gratte:{n:'Se gratte la tête',d:'se gratte la tête',v:2,per:5,dur:1.2},
  fume:{n:'Fume',d:'fume, et souffle sa fumée',v:2,per:4.6,dur:1.4},
  eternue:{n:'Éternue',d:'éternue sans arrêt',v:2,per:5.5,dur:.7},
  toits:{n:'Lève les yeux',d:'lève souvent les yeux vers les toits',v:2,per:5,dur:2},
  chapeau:{n:'Salue du chapeau',d:'soulève son chapeau quand quelqu\'un passe',v:3,hat:1},
  pied:{n:'Tapote du pied',d:'tapote du pied quand il attend',v:3},
  lacets:{n:'Refait ses lacets',d:'se baisse pour refaire ses lacets',v:1,per:6.5,dur:2,still:1},
  pigeons:{n:'Nourrit les pigeons',d:'nourrit les pigeons dès qu\'il s\'arrête',v:1},
  boite:{n:'Boite',d:'boite en marchant',v:1},
  sautille:{n:'Sautille',d:'sautille en marchant',v:1},
  presse:{n:'Pressé',d:'marche toujours très vite',v:1},
  arret:{n:'S\'arrête net',d:'s\'arrête net au milieu de son chemin',v:1},
  mefiant:{n:'Méfiant',d:'se retourne sans cesse, méfiant',v:1},
  centpas:{n:'Cent pas',d:'fait les cent pas au lieu de rester immobile',v:1},
  facades:{n:'Longe les façades',d:'longe toujours les façades, au fond de la place',v:2},
};
const TICS_EN={montre:['Checks watch','checks their watch every few seconds'],gratte:['Scratches head','scratches their head'],fume:['Smokes','smokes, blowing out clouds'],eternue:['Sneezes','sneezes non-stop'],
  toits:['Looks up','keeps glancing up at the rooftops'],chapeau:['Tips hat','tips their hat whenever someone walks by'],pied:['Taps foot','taps a foot while waiting'],lacets:['Ties laces','bends down to retie their shoelaces'],
  pigeons:['Feeds pigeons','feeds the pigeons whenever they stop'],boite:['Limps','limps when walking'],sautille:['Skips','skips along when walking'],presse:['In a hurry','always walks very fast'],
  arret:['Stops dead','stops dead in the middle of their path'],mefiant:['Wary','keeps looking over their shoulder'],centpas:['Paces','paces back and forth instead of standing still'],facades:['Hugs the walls','always keeps close to the buildings at the back']};
for(const k in TICS)bilf(TICS[k],{n:TICS_EN[k][0],d:TICS_EN[k][1]});
const TICK=Object.keys(TICS);
function pickTic(maxV,minV,look,not){const c=TICK.filter(k=>TICS[k].v<=maxV&&TICS[k].v>=(minV||1)&&!(TICS[k].hat&&look&&look.chapeau==='aucun')&&!(not||[]).includes(k));return pick(c)}

const UPGS=[
  {id:'stab',n:'Lunette stabilisée',d:'Le réticule tremble moins.',c:[300,600,1000]},
  {id:'souffle',n:'Entraînement respiratoire',d:'Vous retenez votre souffle plus longtemps.',c:[250,500,850]},
  {id:'culasse',n:'Culasse rectifiée',d:'Rechargement plus rapide entre deux tirs.',c:[350,750]},
  {id:'zoom6',n:'Lunette ×6',d:'Un grossissement supplémentaire, pour les habitudes discrètes.',c:[900]},
  {id:'silence',n:'Silencieux',d:'Un premier tir manqué ne provoque pas de panique.',c:[1200]},
  {id:'carnet',n:'Carnet d\'adresses',d:'Les indicateurs vous accordent 25 % de remise.',c:[600]},
];
bilf(UPGS[0],{n:'Stabilised scope',d:'The crosshair shakes less.'});bilf(UPGS[1],{n:'Breathing drills',d:'You hold your breath for longer.'});
bilf(UPGS[2],{n:'Trued bolt',d:'Faster reload between shots.'});bilf(UPGS[3],{n:'×6 scope',d:'An extra magnification step, for discreet habits.'});
bilf(UPGS[4],{n:'Suppressor',d:'A first missed shot does not cause panic.'});bilf(UPGS[5],{n:'Address book',d:'Informants give you a 25% discount.'});
const OFFERS={
  tic:{n:'Le tuyau du cireur',d:'Il a ciré les chaussures de la cible. Tu connais son tic, quoi qu\'il arrive.',p:[80,110,140]},
  rdv:{n:'Le registre de l\'hôtel',d:'Tu connais le lieu de son rendez-vous de midi.',p:[60,80,100]},
  sig:{n:'Le croquis du portier',d:'Tu connais sa tenue exacte, quoi qu\'il arrive.',p:[70,90,120]},
  loupe:{n:'La loupe du photographe',d:'Sur chaque photo, un faux suspect est écarté.',p:[40,60,80]},
  pot:{n:'Pot-de-vin aux figurants',d:'Un sosie de moins sur la place.',p:[100,130,160]},
  cafe:{n:'Un café bien serré',d:'Ton souffle dure 50 % plus longtemps pendant ce contrat.',p:[35,35,35]},
};
const ALIASES=['Le Corbeau','La Fouine','Monsieur Gris','La Pie','Le Renard','L\'Horloger','La Belette','Le Hibou','Le Chat Noir','La Mouette','Le Furet','La Vipère','Le Colporteur','La Marquise'];
const ALIASES_EN=['The Raven','The Stoat','Mister Grey','The Magpie','The Fox','The Watchmaker','The Weasel','The Owl','Black Cat','The Gull','The Ferret','The Viper','The Peddler','The Marquise'];
/* nom de code d'un contrat (stocké par index, pour suivre la langue) */
function aliasOf(o){let i=o.ai;if(i===undefined)i=ALIASES.indexOf(o.alias);return i>=0?tr(ALIASES[i],ALIASES_EN[i]):o.alias}

/* =========================================================
   PANTINS EN PAPIER : pièces séparées (corps, bras, tête, chapeau)
   ========================================================= */
function portrait(L,w,h,unknown){const c=document.createElement('canvas');c.width=w*2;c.height=h*2;const x=c.getContext('2d');x.scale(2,2);
  const s=h/138,mask=unknown&&typeof unknown==='object'?unknown:null;if(mask)unknown=false;drawPerson(x,L,w/2-4*s,h+12*s,s,NEUTRAL,1,{noShadow:1,mask});
  if(unknown){x.globalCompositeOperation='source-atop';x.fillStyle='#6e6476';x.fillRect(0,0,w,h);x.globalCompositeOperation='source-over'}
  if(unknown){x.fillStyle='#fbf6ea';x.font=`700 ${Math.round(h*.42)}px 'Stardos Stencil', serif`;x.textAlign='center';x.fillText('?',w/2,h*.62)}
  return c}

/* ---------- Pose d'un PNJ selon son état et son tic ---------- */
function poseOf(n,t){
  const p={bob:0,lean:0,sq:1,arm:0,head:0,hat:0,stride:0,tap:0,swing:0,prop:null};
  const st=n.state,mv=st==='walk'||st==='leave'||st==='flee'||st==='pace';
  const tic=n.tic,ph=n.ph;
  if(mv){
    const s=Math.sin(ph);p.bob=Math.abs(Math.cos(ph))*3.2;p.lean=.03;p.stride=s;p.swing=s*.24;
    if(tic==='boite'){const big=(Math.floor(ph/Math.PI)%2)===0;p.bob=big?1:Math.abs(s)*6;p.lean=big?.02:.1*Math.abs(s);p.sq=big?1:1-.07*Math.abs(s);p.stride=s*(big?1:.45)}
    if(tic==='sautille'){p.bob=Math.abs(Math.cos(ph))*12;p.stride=s*.6}
    if(tic==='presse')p.lean+=.13;
    if(st==='flee')p.lean+=.15;
  }else{
    p.bob=Math.max(0,Math.sin(ph*.5))*1;p.lean=Math.sin(ph*.35)*.015;
    if(tic==='pied'&&st==='dwell'){p.tap=-Math.abs(Math.sin(t*12+n.id))*.22}
    if(tic==='pigeons'&&st==='dwell'){p.arm=-.55+Math.sin(t*5+n.id)*.3;p.sq=.95;p.lean=.06}
  }
  const e=env(n.ticA);
  if(e>0){
    if(tic==='montre'){p.arm=-1.35*e;p.head=.3*e;p.prop='watch'}
    if(tic==='gratte'){p.arm=-2.75*Math.min(1,e*1.6)+Math.sin(t*26)*.14*e;p.head=-.08*e}
    if(tic==='fume'){p.arm=-2.35*Math.min(1,e*1.5);p.prop='cig';p.head=-.1*e}
    if(tic==='eternue'){const a=n.ticA;p.head=a<.45?-.3*(a/.45):.5*Math.sin((a-.45)/.55*Math.PI);p.lean+=a<.45?-.06:.12*Math.sin((a-.45)/.55*Math.PI)}
    if(tic==='toits'){p.head=-.55*Math.min(1,e*1.4)}
    if(tic==='lacets'){p.sq=1-.28*e;p.lean+=.14*e;p.arm=.7*e;p.head=.25*e}
    if(tic==='chapeau'){p.hat=13*e;p.arm=-2.3*e}
  }
  return p;
}

/* =========================================================
   DÉCOR : éléments, groupes triés en profondeur
   ========================================================= */
let M=null;           // carte courante
let TNOW=0;           // horloge d'animation
let VIEW=[0,0,W,H];   // zone visible (culling)
function vis(bb){return!(bb[2]<VIEW[0]||bb[0]>VIEW[2]||bb[3]<VIEW[1]||bb[1]>VIEW[3])}
function add(L,p,f,bb,ol,sh){L.push({p,f,bb,ol:ol===undefined?4:ol,sh:sh===undefined?1:sh})}
function addT(L,text,x,y,size,col,bb,font){L.push({t:text,x,y,size,f:col,bb,font:font||'disp'})}
function drawItems(L,noCull){
  for(const it of L){
    if(!noCull&&it.bb&&!vis(it.bb))continue;
    if(it.fn){it.fn(TNOW);continue}
    if(it.img){const im=SPR.img[it.img];if(!im)continue;if(it.blob){  // ombre au sol : ellipse fondue sous l'emprise réelle, centrée un peu en arrière du bord avant, même lumière que les pantins
        const[bx,by,hw,dep]=it.blob,rx=hw*1.1+4,ry=clamp(rx*.22,4.5,13);ctx.save();ctx.translate(bx-3,by-ry*dep*.55);ctx.scale(1,ry/rx);
        const gr=ctx.createRadialGradient(rx*.06,0,1,0,0,rx);gr.addColorStop(0,'rgba(45,28,12,.40)');gr.addColorStop(.6,'rgba(45,28,12,.27)');gr.addColorStop(1,'rgba(45,28,12,0)');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(0,0,rx,0,7);ctx.fill();ctx.restore()}
      if(typeof mipDraw==='function')mipDraw(ctx,im,it.x,it.y,it.w,it.h);else ctx.drawImage(im,it.x,it.y,it.w,it.h);continue}
    if(it.stroke){ctx.lineWidth=it.stroke;ctx.strokeStyle=it.f;ctx.stroke(it.p);continue}
    if(it.t){ctx.fillStyle=it.f;ctx.font=it.font==='ui'?`600 ${it.size}px 'IBM Plex Sans Condensed', sans-serif`:`700 ${it.size}px 'Stardos Stencil', serif`;ctx.textAlign='center';ctx.fillText(it.t,it.x,it.y);continue}
    if(it.sh){ctx.save();ctx.translate(4,3);ctx.fillStyle='rgba(50,28,12,.22)';ctx.fill(it.p);ctx.restore()}
    if(it.ol){ctx.lineWidth=it.ol;ctx.strokeStyle='#fff';ctx.lineJoin='round';ctx.stroke(it.p)}
    ctx.fillStyle=it.f;ctx.fill(it.p);
  }
}
function grp(m,z,bb){const g={z,items:[],block:[],bb};m.props.push(g);return g}

/* Dessine la scène complète : fond, puis décors et personnages triés par profondeur */
function drawScene(t,npcs,opts){
  opts=opts||{};
  bgDraw(t);
  const list=npcs?npcs.filter(n=>n.state!=='gone').sort((a,b)=>a.y-b.y):[];
  let i=0;
  for(const g of M.props){
    while(i<list.length&&list[i].y<=g.z){drawNpc(list[i],t,opts);i++}
    if(vis(g.bb))drawItems(g.items,true);
  }
  while(i<list.length){drawNpc(list[i],t,opts);i++}
  M.front&&M.front(t);
  drawStage(t);
}
function drawNpc(n,t,opts){
  if(!vis([n.x-40,n.y-170,n.x+40,n.y+10]))return;
  const s=scaleAt(n.y);
  let rot=0,pop=1;if(n.dead){const k=ease(n.dead/.55);rot=-k*1.45*Math.sign(n.flip||1);pop=1-k*.15}
  if(opts.mark&&opts.mark(n)){ctx.save();ctx.fillStyle='rgba(227,180,74,.55)';ctx.beginPath();ctx.ellipse(n.x,n.y,34*s,9*s,0,0,7);ctx.fill();ctx.restore()}
  drawPerson(ctx,n.look,n.x,n.y,s,n.dead?NEUTRAL:(n.po||NEUTRAL),n.flip,{rot,pop,mask:n.mask});
  if(n.birds)for(const b of n.birds)drawBird(n.x+b.dx*s,n.y+b.dy*s,s*.9,t*7+b.ph,b.fl);
}
function drawBird(x,y,s,ph,fl){
  if(typeof hasImg==='function'&&hasImg('o_pigeon')){const O=OBJ.pigeon,A=ASSETS.o_pigeon,peck=Math.max(0,Math.sin(ph))*.35;ctx.save();ctx.translate(x,y);ctx.scale(s*(fl||1),s);ctx.rotate(peck);ctx.fillStyle='rgba(40,25,10,.2)';ctx.beginPath();ctx.ellipse(0,0,9,2.5,0,0,7);ctx.fill();for(const m of['ol','fill'])layImg(ctx,'o_pigeon',-O.gx*O.s,-O.gy*O.s,A.w*O.s,A.h*O.s,m);ctx.restore();return}
  ctx.save();ctx.translate(x,y);ctx.scale(s*(fl||1),s);
  const peck=Math.max(0,Math.sin(ph))*.5;
  ctx.fillStyle='rgba(40,25,10,.2)';ctx.beginPath();ctx.ellipse(0,0,9,2.5,0,0,7);ctx.fill();
  ctx.strokeStyle='#fff';ctx.lineWidth=2.5;
  const b=P();b.ellipse(0,-7,9,6,0,0,7);const h=P();h.arc(7+peck*3,-12+peck*6,4,0,7);
  ctx.stroke(b);ctx.stroke(h);ctx.fillStyle='#8f97a6';ctx.fill(b);ctx.fillStyle='#6c7586';ctx.fill(h);
  ctx.fillStyle='#e3b44a';ctx.fillRect(10+peck*3,-12.5+peck*6,3.5,2);ctx.fillStyle='#d4483b';ctx.fillRect(-1,-1,1.5,3);ctx.fillRect(2,-1,1.5,3);
  ctx.restore();
}
function drawStage(t){
  if(!vis([0,890,W,1300]))return;
  ctx.fillStyle='#3d2a20';ctx.fillRect(-900,900,W+1800,700);
  ctx.fillStyle='#6a4a35';ctx.fillRect(-900,900,W+1800,9);
  for(let x=40;x<W;x+=160){const g=ctx.createRadialGradient(x,906,2,x,906,40);g.addColorStop(0,'rgba(255,220,140,.75)');g.addColorStop(1,'rgba(255,220,140,0)');ctx.fillStyle=g;ctx.fillRect(x-40,866,80,80);ctx.fillStyle='#f6e3a2';ctx.beginPath();ctx.ellipse(x,910,10,5,0,0,7);ctx.fill()}
}
/* Ce qui est touché au point (x,y) : du plus proche au plus lointain */
function npcHit(n,px,py){
  if(n.state==='gone'||n.dead)return null;const s=scaleAt(n.y),po=n.po||NEUTRAL,sq=po.sq||1,f=Math.sign(n.flip)||1;
  if(typeof charReady==='function'&&charReady()){const G=CHARGEO[n.look.genre==='femme'?'f':'h'];
    const hx=n.x+G.head.c[0]*f*s,hy=n.y+(G.head.c[1]*sq-(po.bob||0))*s,hr=G.head.r*.92*s;const ddx=px-hx,ddy=py-hy;
    if(ddx*ddx+ddy*ddy<hr*hr)return'head';
    const top=n.y+(G.body.rect[1]+4)*sq*s;if(Math.abs(px-n.x)<G.body.rect[2]*.5*s&&py>top&&py<n.y)return'body';return null}
  const hy=n.y-(104*sq+(po.bob||0))*s;const dx=px-n.x,dy=py-hy;
  if(dx*dx+dy*dy<(19*s)*(19*s))return'head';
  if(Math.abs(dx)<24*s&&py>n.y-88*sq*s&&py<n.y)return'body';return null}
function hitTest(npcs,x,y,ignoreBlock){
  const list=npcs.filter(n=>n.state!=='gone'&&!n.dead).sort((a,b)=>b.y-a.y);
  const props=M.props.slice().reverse();
  let i=0;
  for(const g of props){
    while(i<list.length&&list[i].y>g.z){const h=npcHit(list[i],x,y);if(h)return{n:list[i],part:h};i++}
    if(!ignoreBlock&&g.block.some(r=>inR(r,x,y)))return{block:1};
  }
  while(i<list.length){const h=npcHit(list[i],x,y);if(h)return{n:list[i],part:h};i++}
  return null;
}
let PAPER=null;
function paperPattern(){if(PAPER)return PAPER;const c=document.createElement('canvas');c.width=c.height=160;const x=c.getContext('2d');const id=x.createImageData(160,160);for(let i=0;i<id.data.length;i+=4){const k=Math.random()<.5?0:255;id.data[i]=id.data[i+1]=id.data[i+2]=k;id.data[i+3]=Math.random()<.5?Math.random()*14:0}x.putImageData(id,0,0);PAPER=cv.getContext('2d').createPattern(c,'repeat');return PAPER}
