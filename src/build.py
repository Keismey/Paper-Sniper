#!/usr/bin/env python3
"""Paper Sniper — assemble le jeu à partir des sources de src/.

  python3 src/build.py                    -> le site : index.html (page unique) et sw.js à la racine du dépôt
  python3 src/build.py --artifact F.html  -> une page autonome avec le mode test (panneau dans le Bureau)
"""
import hashlib, json, os, sys

SRC = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(SRC)
JS_FILES = ['ks-studio.js', 'ks-back.js', 'assets.js', 'engine.js', 'puppet.js', 'maps.js', 'nav.js', 'game.js', 'minigames.js', 'career.js']

# Suivi Cloudflare Web Analytics (version publiée uniquement, pas l'aperçu de test)
CF_ANALYTICS = """<!-- Cloudflare Web Analytics --><script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "cdb82226cd1b401d9e4f4e899f9b8425"}'></script><!-- End Cloudflare Web Analytics -->"""

def read(name): return open(os.path.join(SRC, name), encoding='utf-8').read()

PWA = """<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="Identifier. Confirmer. Un seul tir. Un jeu d'enquête et de tir de précision en papier, par Keismey Studio.">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Keismey Studio">
<meta property="og:title" content="Paper Sniper">
<meta property="og:description" content="Identifie ta cible dans une ville en papier, démasque ses sosies et n’aie droit qu’à un seul tir depuis les toits. Gratuit, sans pub, dans le navigateur.">
<meta property="og:url" content="https://keismey.github.io/Paper-Sniper/">
<meta property="og:image" content="https://keismey.github.io/Paper-Sniper/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Paper Sniper · Keismey Studio">
<meta property="og:locale" content="fr_FR">
<meta property="og:locale:alternate" content="en_GB">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Paper Sniper">
<meta name="twitter:description" content="Identifie ta cible dans une ville en papier, démasque ses sosies et n’aie droit qu’à un seul tir depuis les toits. Gratuit, sans pub, dans le navigateur.">
<meta name="twitter:image" content="https://keismey.github.io/Paper-Sniper/og.jpg">
<link rel="manifest" href="manifest.webmanifest">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Paper Sniper">"""

def page(test, site):
    js = ''.join(read(f) + '\n' for f in JS_FILES)
    if not test:
        js = js.replace('const TEST=true;', 'const TEST=false;')
    s = read('shell.html').replace('%%FONTS%%', read('fonts.css')).replace('%%JS%%', js)
    s = s.replace('__LOGO__', read('logo.b64').strip()).replace('__KEY__', read('key.b64').strip())
    if site:
        s = s.replace('%%PWA%%', PWA)
        s = s.replace('data:image/png;base64,__FAV__', 'icons/favicon.png').replace('data:image/png;base64,__TOUCH__', 'icons/apple-touch-icon.png')
    else:
        import base64
        b64 = lambda p: base64.b64encode(open(os.path.join(ROOT, p), 'rb').read()).decode()
        s = s.replace('%%PWA%%', '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">')
        s = s.replace('__FAV__', b64('icons/favicon.png')).replace('__TOUCH__', b64('icons/apple-touch-icon.png'))
    return '<!doctype html>\n<html lang="fr"><head><meta charset="utf-8">\n' + s.replace('<style>', '</head><body>\n<style>', 1) if False else s

def site():
    html = page(test=False, site=True)
    head, body = html.split('<style>', 1)
    out = '<!doctype html>\n<html lang="fr"><head><meta charset="utf-8">\n' + head + '<style>' + body.replace('</style>', '</style>\n</head><body>', 1) + '\n' + CF_ANALYTICS + '\n</body></html>\n'
    open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(out)
    h = hashlib.sha1(out.encode()).hexdigest()[:8]
    files = ['./', './index.html', './manifest.webmanifest']
    for d in ['icons', 'music']:
        files += ['./%s/%s' % (d, f) for f in sorted(os.listdir(os.path.join(ROOT, d)))]
    sw = read('sw.template.js').replace('%VERSION%', h).replace('%CORE%', json.dumps(files, indent=2))
    open(os.path.join(ROOT, 'sw.js'), 'w', encoding='utf-8').write(sw)
    print('site : index.html (%d Ko), sw.js version %s' % (len(out) // 1024, h))

def artifact(path):
    html = page(test=True, site=False)
    open(path, 'w', encoding='utf-8').write(html)
    print('page de test :', path, len(html) // 1024, 'Ko')

if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == '--artifact':
        artifact(sys.argv[2])
    else:
        site()
