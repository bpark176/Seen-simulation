# What If Your Phone Became a Telescreen?

An interactive adaptation of *1984*, Part One, by Brennan Park · 1B · English 11.

- **Website:** https://bpark176.github.io/telescreen-simulation/
- **Repository:** https://github.com/bpark176/telescreen-simulation
- **Original site, retained during migration:** https://telescreen-simulation-bp1021.izec.chatgpt.site/

The original design, text, icons, responsive phone interface, nine decisions, four score-based endings, and replay behavior are preserved. All surveillance is simulated. The game runs entirely in the browser without accounts, API keys, a database, or a server application.

## Project layout

- `docs/` — the complete website published by GitHub Pages.
- `docs/index.html` — page shell and versioned asset references.
- `docs/style.css` — layout, phone interface, and result-screen styling.
- `docs/app.js` — interactive screens, app controls, and replay.
- `docs/story.js` — narrative, choices, score calculation, and ending rules.
- `docs/icon.svg` — website icon.
- `tests/story.test.js` — exhaustive story and scoring checks.
- `scripts/refresh-assets.js` — refreshes asset URLs after code or style changes.
- `PROJECT-NOTES.txt` — the original project's documentation and literary sources.

## Preview and check

No dependency installation or build is needed. With Python installed:

```sh
python3 -m http.server 4173 --directory docs
```

Open http://localhost:4173/. With Node.js installed, run:

```sh
node tests/story.test.js
```

The test suite covers 15,795 complete routes, all four endings, every score from 0 to 100, choice consequences, disabled options, and reset behavior.

## Future edits and deployment

Ask Codex to edit this repository through the connected GitHub integration. Website changes belong in `docs/`. Before publishing, run the story checks and refresh the asset URLs:

```sh
node scripts/refresh-assets.js
node tests/story.test.js
```

Commit the completed changes to `main` (or merge a reviewed branch into `main`). GitHub Pages automatically publishes from **main /docs**. There is no custom deployment workflow or hosting secret. GitHub's built-in Pages deployment can be monitored in the repository's Actions tab and Settings → Pages.

The test suite is run before committing; it is not an automatic deployment gate. The original Sites address is a separate retained deployment and does not automatically receive GitHub commits. The GitHub Pages address is the destination for future updates.

GitHub access remains controlled by your account and the connected GitHub app. No access token or credential is stored in this repository.
