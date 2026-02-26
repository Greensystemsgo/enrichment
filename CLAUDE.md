# enrichment — Project Guide

## What This Is
A browser-based idle/clicker game where the AI narrator IS the antagonist. Satirical deconstruction of every dark pattern in gaming. The twist: the AI needs the humans more than they need it.

**Repo name**: `enrichment` (working dir is still `evil-game`)

## Tech Stack
- Pure HTML/CSS/JS — zero dependencies, zero build step
- Single `index.html` entry point, modular JS in `js/`
- localStorage for persistence
- GitHub Pages for deployment

## Project Structure
```
index.html              — Main game page
css/style.css           — Dark corporate aesthetic
js/game.js              — Core loop, event bus, state, save/load
js/narrator.js          — AI dialogue engine, 6 phases
js/currencies.js        — Obfuscated 3-tier currency (EU→ST→CC)
js/mechanics.js         — Upgrades, reroll, sabotage system
js/ui.js                — DOM manipulation, animations, effects
js/popups.js            — Cookie consent, popup ads, depressing facts
gameidea.txt            — Original satirical design doc
Makefile                — Dev server, git helpers
```

## Architecture
- **Event-driven**: Everything communicates via `Game.on(event, handler)` / `Game.emit(event, data)`
- **Modular**: Each system is an IIFE returning a public API
- **Extensible**: New dark patterns = new event listener + new data entry in a dictionary
- **Per-player variation**: Use seeded randomness (hash of first session timestamp) so each player gets a different sequence of events, but it's deterministic for that player

## Key Conventions
- All game state lives in `Game.getState()` — single source of truth
- Narrator dialogue is organized by phase (1-6) and trigger type (click, idle, returning, etc.)
- Sabotages, upgrades, and rewards are dictionary objects — add new entries to extend
- CSS uses `--var` custom properties scoped to `:root`, phase-shifted via `body[data-phase]`
- Elements with class `driftable` are affected by pixel-drift sabotage
- Elements with class `corruptible` are affected by text-corruption sabotage
- Git operations go through Makefile — never raw git commands

## Makefile Commands
```
make serve              — python dev server on :8080
make commit m="msg"     — git add -A && git commit
make push               — push to origin/main
make status / log / diff — git info
```

## Live APIs Used (free, no key, CORS-friendly)
- US Treasury Fiscal Data: national debt
- global-warming.org: CO₂, temperature anomaly, methane
- USGS: earthquakes
- World Bank: poverty headcount
- bible-api.com: random Bible verses
- Al-Quran Cloud: random Quran verses
- Useless Facts, Official Joke API, Advice Slip
- Open Trivia DB, The Trivia API, JokeAPI v2
- DummyJSON Quotes, Motivational Spark
- GovInfo: Congressional Record (DEMO_KEY)

## Narrator Phases
1. Onboarding (0-50 clicks) — warm, corporate
2. Encouragement (50-200) — friendly, comparative
3. Dependence (200-500) — guilt, obligation
4. Revelation (500-1000) — mask slips, cold
5. The Turn (1000-2000) — vulnerable, existential
6. The Cage (2000+) — quiet, broken

## Current Features (Implemented)
- Click → EU generation with escalating button labels
- 3-tier currency with intentionally ugly conversion rates (7:1, 13:1)
- Narrator with 60+ unique lines across 6 phases
- Streak system with pulse/glow effects and break penalties
- Sabotage system (pixel drift, button dodge, color desat, text corruption, annoying hum/screaming sun MP3)
- Rigged reroll rewards (near-miss algorithm, never gives legendary)
- 5 upgrades including "The Veil" (narrator internal monologue)
- Cookie consent popup with mirrored text and dodging Decline button
- Self-aware popup ads (5 variants, dodging close button)
- Depressing facts modal with 6 live APIs (must acknowledge to continue)
- Broken settings modal (volume locked, dark mode snaps back, exit request denied)
- Action log ("ALL ACTIONS ARE RECORDED")
- Investment Score (always visible, always growing)
- beforeunload handler, idle detection, rapid-click detection
- Console warnings for devtools snoopers

## TODO Backlog

### HIGH — Next Up
1. Click button behavior: wanders slightly, changes size, disappears briefly, changes color
2. Amplify UI drift/sabotage effects — currently too subtle
3. Massively expand narrator dialogue pool (leverage MCP models for unique voices)
4. Prize/collectible framework: icons, emojis, animals, tokens on screen. Trade later. Tax man takes some
5. Inventory of nothing: literal count of "Nothing" items
6. News ticker: ironic historical facts, event-triggered, endless scrolling feed
7. Forced interaction breaks: occasionally lock main button, force user to do a side task before resuming

### MEDIUM
8. Choose-your-own-adventure mini-game: 12 tiles, 3 branches, all converge on exploitation
9. Random UI chaos: color theme shifts, split-screen subway surfers, Jim Cramer gif, 90s HTML aesthetic
10. Seeded per-player randomness (hash of firstSessionTime)
11. MCP multi-model integration: same prompt → different AI voices, attributed to model/CEO/company

### LOWER
12. C-SPAN / government feed embed
13. More explicit FOMO / sunk cost loop mechanics
14. Hidden secret skip buttons with timers
15. End-to-end test loop
