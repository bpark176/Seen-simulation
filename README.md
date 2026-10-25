# The Price of Staying Connected

Brennan Park · English 11 · B1
1984 Creative Summative Project

- **Website:** https://bpark176.github.io/seen-simulation/
- **Repository:** https://github.com/bpark176/seen-simulation
- **Optional literary comparison:** https://bpark176.github.io/seen-simulation/comparison.html

The main experience critiques how social media normalizes exchanging data for convenience, personalization, and social connection. The player enters a name or nickname, then plays a 16-year-old student making eight decisions in an educational Instagram simulation. The final **Your Digital Profile** separates explicit information, observed activity, uncertain interest inferences, partner events, recommendations/ads, posting decisions, and privacy boundaries. It uses no loyalty score. Privacy choices genuinely affect later simulated collection, and the no-account route remains playable through a friend's text relay.

The Instagram simulation uses invented characters, events, and simplified controls. Instagram and Facebook are researched examples; the game does not reproduce their actual algorithms or controls. The References section presents an alphabetized MLA 9 bibliography of the existing platform, government, literary, and design sources, plus peer-reviewed work on privacy decisions and self-censorship. All literary references are from Part One. The original nine-decision literary adaptation and its invented Party score remain optional.

Everything is simulated. There are no account logins, analytics, third-party game services, API keys, storage, or real device permission requests. The chosen name and choices live only in page memory; restart, replay, home, or refresh clears them. Name entry accepts up to 40 characters, supports Unicode, and is rendered as text.

## Files

- `docs/index.html` — contemporary main entry point.
- `docs/social-story.js` — contemporary narrative and deterministic consequence engine.
- `docs/social-app.js` — interactive app screens, profile reveal, References, and literary notes.
- `docs/social.css` — contemporary UI using the original dark layout and phone components.
- `docs/research.js` — verified claims, primary-source links, and literary comparison notes.
- `docs/comparison.html`, `docs/app.js`, `docs/story.js` — original optional literary adaptation.
- `docs/style.css`, `docs/icon.svg` — shared visual design, responsive hardware, and icon.
- `tests/social-story.test.js` — conditional contemporary consequences and reset checks.
- `tests/story.test.js` — original literary engine checks.
- `scripts/refresh-assets.js` — updates content hashes in both entry points.

## Preview and verification

No dependency installation or build is needed:

```sh
python3 -m http.server 4173 --directory docs
node tests/social-story.test.js
node tests/story.test.js
node scripts/refresh-assets.js
```

Open http://localhost:4173/. Browser QA should include consent-on and consent-off shopping, activity controls, restrictive settings before the later shop event, the no-account route, the profile, replay, keyboard navigation, mobile layout, and optional comparison.

## Future edits and deployment

Edit this repository through the connected GitHub integration. Website changes belong in `docs/`. Run relevant checks and refresh asset URLs before committing to `main`. GitHub Pages publishes automatically from **main /docs**, using its built-in Pages deployment. No custom workflow or hosting secret is needed. Tests are run before committing; they are not an automatic deployment gate.

The original https://telescreen-simulation-bp1021.izec.chatgpt.site/ deployment is an unchanged backup and does not receive these commits. GitHub Pages is the canonical website.

GitHub access remains controlled by the connected GitHub app and the account owner. No credentials are stored in the repository.
