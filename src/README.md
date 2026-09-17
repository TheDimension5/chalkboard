# The Chalkboard sources

Builder and content for https://thedimension5.github.io/chalkboard/ . The built site is the rest of this repository.

- `site2.py` builds everything into `site/` (run it from this folder: `python3 site2.py`).
- `graph.py` is the site graph: boards, chapter titles, lesson cards, cross-board prerequisites, units.
- `page_*.py` hold each board's text at five reading levels, teach-back questions, figures and missions; `sims_*.js` hold the matching canvas simulations.
- `engine.js` is the shared engine (drawing helpers, levels, missions, teach-backs, receipts, certificates).
- `kits.py` lists the hands-on activities, `choice.py` the multiple-choice teach-backs, `icons.json` and `hero_art.json` the board art.
- `push.py "message" --changed` deploys changed built files through the GitHub Contents API.
