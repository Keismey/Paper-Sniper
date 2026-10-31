// Paper Sniper — service worker (généré par src/build.py, ne pas modifier sw.js à la main).
// Met le jeu en cache pour jouer hors ligne ; une nouvelle version propose « Mettre à jour ».
const VERSION = 'paper-sniper-%VERSION%';
const CORE = %CORE%;
// Musiques (5,4 Mo) : hors du pré-cache, gardées à la première écoute dans un cache à part qui survit
// aux mises à jour. Son nom vient du contenu des MP3 : une musique changée change de cache.
const MEDIA = 'paper-sniper-media-%MEDIA%';
const MP3 = %MP3%;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => {
        const old = keys.filter(k => k.startsWith('paper-sniper-') && k !== VERSION && k !== MEDIA);
        // les anciennes versions pré-cachaient les musiques : on les recopie dans MEDIA avant le nettoyage
        // (pas depuis un ancien cache de musiques, qui peut contenir un morceau remplacé depuis)
        const from = old.filter(k => !k.startsWith('paper-sniper-media-'));
        const keep = MP3.map(f => new URL(f, location).pathname);
        return caches.open(MEDIA).then(media =>
          Promise.all(keep.map(p => media.match(p).then(have => have || Promise.all(from.map(k => caches.open(k).then(c => c.match(p))))
            .then(hits => { const hit = Array.isArray(hits) ? hits.find(Boolean) : null; if (hit) return media.put(p, hit); }))))
            .then(() => media.keys())
            .then(ks => Promise.all(ks.filter(r => !keep.includes(new URL(r.url).pathname)).map(r => media.delete(r))))
        ).then(() => Promise.all(old.map(k => caches.delete(k))));
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => { if (e.data === 'skip') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  // le manifest passe par le réseau d'abord, pour que l'installation voie la dernière version
  if (url.pathname.endsWith('.webmanifest')) {
    e.respondWith(fetch(req).then(r => { if (r.ok) { const c = r.clone(); caches.open(VERSION).then(x => x.put(req, c)); } return r; }).catch(() => caches.match(req)));
    return;
  }
  if (url.pathname.endsWith('.mp3')) { e.respondWith(music(e, url)); return; }
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => hit ||
      fetch(req).then(r => {
        if (r.ok && r.status === 200) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
        return r;
      }).catch(() => req.mode === 'navigate' ? caches.match('./index.html') : undefined)
    )
  );
});

// Musique : lue en entier (WebAudio) ou par plages (en-tête Range, lecteur <audio>). Le fichier entier est gardé
// dans MEDIA ; on y découpe la plage demandée (réponse 206, exigée par Safari pour un son servi par le service worker).
const loading = {};
function music(e, url) {
  const range = e.request.headers.get('range'), p = url.pathname;
  return caches.match(p, { cacheName: MEDIA }).then(hit => {
    if (!hit) {
      // un seul téléchargement complet par fichier, même si le navigateur envoie plusieurs demandes
      if (!loading[p]) loading[p] = fetch(p).then(full => { if (full.status === 200) return caches.open(MEDIA).then(c => c.put(p, full)); })
        .catch(() => {}).then(() => { delete loading[p]; });
      e.waitUntil(loading[p]);
      return fetch(e.request);
    }
    if (!range) return hit;
    return hit.blob().then(buf => {
      const m = /bytes=(\d*)-(\d*)/.exec(range) || [], size = buf.size;
      const start = m[1] ? +m[1] : m[2] ? Math.max(0, size - +m[2]) : 0;
      const end = m[1] && m[2] ? Math.min(+m[2], size - 1) : size - 1;
      if (start >= size || start > end) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
      return new Response(buf.slice(start, end + 1), { status: 206, headers: {
        'Content-Type': 'audio/mpeg', 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(end - start + 1), 'Accept-Ranges': 'bytes' } });
    });
  });
}
