# RoboNeige 3D ❄️🤖

Jeu 3D ludo-éducatif (CP/CE1) : pilote ton robot, ramasse la neige, éclate les bonshommes et défends le château. Les améliorations se débloquent en lisant et en écrivant.

**Jouer :** https://briceb95.github.io/lance_neige/

## Développement

```bash
bun install
bun run dev     # http://localhost:3000
bun run build   # génère dist/
```

Chaque push sur `main` déploie automatiquement sur GitHub Pages (`.github/workflows/deploy.yml`).

## Fonctionnalités

- Niveaux : chasse aux bonshommes, défense du château, boss tous les 5 niveaux (bouclier brisé en lisant une phrase).
- 50 améliorations débloquées par des défis de lecture / écriture / lecture à voix haute (micro).
- Coffres magiques en jeu qui s'ouvrent en lisant un mot.
- Espace Parents : profils des enfants, mots de la semaine de l'école, mots à retravailler (révision espacée), limite de temps par jour, suivi Google Sheets.

## Suivi dans Google Sheets (gratuit)

1. Créer une feuille Google Sheets, puis **Extensions > Apps Script** et coller le contenu de [`apps-script/Code.gs`](apps-script/Code.gs).
2. **Paramètres du projet > Propriétés du script** : ajouter `TOKEN` = une clé secrète de votre choix.
3. **Déployer > Nouveau déploiement > Application Web** : *Exécuter en tant que : Moi*, *Accès : Tout le monde*.
4. Dans le jeu : **Espace Parents > Suivi dans Google Sheets**, coller l'URL `…/exec` et la clé, puis **Envoyer maintenant**.

La feuille reçoit chaque réponse (onglet *Réponses*) et un résumé par enfant et par jour (onglet *Résumé du jour*). Les envois se font toutes les 3 minutes et à chaque niveau gagné.
