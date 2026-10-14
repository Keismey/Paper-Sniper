# Paper Sniper

**Identifier. Confirmer. Un seul tir.** Un jeu d'enquête et de tir de précision de Keismey Studio, jouable dans le navigateur et installable sur téléphone.

Le Bureau vous confie une cible : un agent double perdu dans la foule d'une ville en papier. Établissez son signalement en trois épreuves (sa tenue, son habitude, le lieu de son rendez-vous), achetez ce qui vous manque aux indicateurs, puis montez sur les toits. À midi, elle a des sosies. Vous n'avez droit qu'à un tir propre.

Jouer : https://keismey.github.io/Paper-Sniper/ (aussi dans le hub : https://keismey.github.io/)

Le jeu est en français et en anglais (détection automatique, bouton sur l'écran titre, ou `?lang=fr` / `?lang=en` dans l'adresse).

## Fichiers

- `index.html`, `sw.js` — **générés** par `src/build.py`, ne pas les modifier à la main
- `manifest.webmanifest` — installation sur téléphone
- `music/` — les trois musiques (Bureau, enquête, toit), en boucle
- `icons/` — icônes de l'appli ; `a/cover.webp` — image de couverture pour le hub
- `fonts/` — licences des polices intégrées (Stardos Stencil, Courier Prime, IBM Plex Sans Condensed, licence SIL OFL)
- `src/` — les sources :
  - `assets.js` images intégrées (décors, pantins, coiffures, chapeaux, objets) et géométrie des pantins
  - `engine.js` données, langue, sauvegarde, sons et musique, outils de dessin
  - `puppet.js` pantins en papier (pièces, recoloration, animation, coiffures sous les chapeaux)
  - `maps.js` les trois cartes, leurs décors et leur placement
  - `career.js` carrière (v1.1) : grades, dossiers rouges de la Volière, épilogue, notes de mise à jour
  - `nav.js` déplacements des passants autour des décors
  - `game.js` Bureau, briefing, tir, rapport
  - `minigames.js` les trois épreuves d'enquête et la synthèse
  - `shell.html`, `fonts.css` structure, styles et polices
  - `sw.template.js` modèle du service worker

## Mettre à jour le jeu

1. Modifier les fichiers de `src/`.
2. Lancer `python3 src/build.py` à la racine du dépôt : ça régénère `index.html` et `sw.js`
   (le nom du cache change à chaque build, donc les joueurs voient « Nouvelle version disponible »).
3. Pousser sur `main`. GitHub Pages publie depuis la racine de `main`.

`python3 src/build.py --artifact test.html` produit une page autonome avec le mode test dans le Bureau
(argent, toutes les cartes, cible visible). La version en ligne n'a pas de mode test.

La sauvegarde est dans le `localStorage` du navigateur (clé `coupe-papier.v2`).
