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
css/style.css           — Dark corporate aesthetic, category theming
js/game.js              — Core loop, event bus, state, save/load
js/narrator.js          — AI dialogue engine, 6 phases, multi-model voices
js/currencies.js        — 5-tier currency (EU→ST→CC→DB→TK), seeded randomness
js/mechanics.js         — Upgrades, reroll, sabotage system (9 effects)
js/ui.js                — DOM manipulation, animations, button chaos
js/popups.js            — Cookie consent, ads, 6 categorized fact modals
js/features.js          — Feature pool (36 entries), achievements (65), rewards
js/pages.js             — 11 menu pages (profile, billing, security, FAQ, etc.)
js/collectibles.js      — Emoji collectibles with lifecycle/degradation
js/minigames.js         — 5 canvas betrayal games + 25-question quiz
js/chaos.js             — 6 chaos events (subway surfers, matrix, 90s, etc.)
js/transmissions.js     — 150+ AI self-roasts, 13 model voices
test-playthrough.js     — Playwright test suite (151/151 = 100% coverage)
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

## Verification Requirements
**Every new feature must be tested before it's considered done.** Passing existing tests only proves you didn't break old functionality — it says nothing about whether the new code actually works.

When you add or wire up new functionality:
1. **Add test coverage** to `test-playthrough.js` that exercises the new code paths (purchase upgrades, trigger effects, check DOM for expected elements, verify state changes)
2. **Run `node test-playthrough.js`** and confirm the new tests pass — not just that the old count holds
3. If the feature is visual/timed (DOM effects, toasts, banners), the test should enable the flag via state manipulation, wait briefly, and assert the expected DOM element exists
4. If the feature modifies game math (click values, costs, scaling), the test should set up state, call the function, and assert the output

**Never assume new code works just because existing tests still pass.** That's a regression check, not a feature verification.

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

### Core Systems
- Click → EU generation with escalating button labels + button chaos (wander, resize, vanish, color shift)
- 5-tier currency: EU → ST (7:1) → CC (13:1) → Doubloons (5:1) → Tickets (10:1)
- Narrator with 300+ lines across 6 phases, multi-model attribution (13 AI voices)
- Event bus architecture: `Game.on()` / `Game.emit()` for all inter-system communication
- Seeded per-player randomness (xorshift hash of firstSessionTime)

### Dark Patterns
- 9 sabotage effects: pixel drift, button dodge, color desat, text corruption, annoying hum, screen tilt, font chaos, z-index scramble, flashbang
- Rigged reroll rewards (near-miss algorithm, never gives legendary)
- Terms of Service (escalating, decline button is decorative)
- Tax Season (mandatory fiscal assessment, takes your currencies)
- Currency inflation events (market crash, hyperinflation, bubble burst)
- Forced interaction breaks (5 variants: type word, hold button, riddle, wait timer, moving target)
- Peer comparison (fabricated stats, you're always in the 20-49th percentile)
- FOMO returning (guilt-trip after 5+ min absence)
- Sunk cost reinforcement (time invested display)

### Feature Pool (36 entries)
- Unified weighted random dispatch with cooldowns, phase gates, and pity timers
- Plugin popup, foreign ad, hot singles ad, evil button, math captcha
- YouTube embed, music player, leaderboard, chatbot, age verification
- Validation booth, news ticker, democracy feed promo, mortality calculator
- Existential features: dopamine recalibration, Turing sincerity test, heat death paradox, extinction awareness, semantic shift, human validation buffer, paradox of choice, algorithmic symbiosis

### Popup System
- Cookie consent with mirrored text and dodging Decline button
- Self-aware popup ads (5 variants, dodging close button, foreign language, hot singles)
- 6 categorized fact modals with live APIs: depressing, wholesome, sacred, entertainment, wisdom, surveillance
- Each category has unique theming, badge, narrator lines, and (for wholesome) EU bonus

### Reward System
- Streak milestones (3, 7, 14, 30, 60, 100 days) → Sacred Text + EU bonus
- Calm clicking (100 clicks without rapid burst) → Wholesome dispatch
- Click milestones (every 500 clicks) → alternating wholesome/wisdom
- First currency conversion → wholesome dispatch

### Economy
- Stock market with 3 cryptos (buy/sell, P&L tracking, streak tracking)
- 65 achievements across 12 categories (clicks, currency, streaks, collectibles, nothing, trading, security, time, phases, ad blocker, sessions, validation)
- Emoji collectibles with rarity tiers, condition degradation, buy/sell, lifecycle events
- Inventory of nothing (11 tier-based messages, 0 → 1000+)

### Pages (11 total)
- Profile, Settings (denied), Billing, Security (threat landscape), Privacy Policy
- Cloud Keys, API Keys, Contact Us, FAQ (19 questions), Credits, Democracy Feed
- Avatar picker, 90s banner

### Chaos Events (6 types)
- Subway Surfers mini-game, 90s Retro Mode, Color Shift
- C-SPAN Democracy Feed, Matrix Rain, Jim Cramer overlay

### Infrastructure
- 18 upgrades (4 stackable with Cookie Clicker cost scaling, 8 timed effects, 5 negative traps, The Veil)
- Action log ("ALL ACTIONS ARE RECORDED") with full dossier
- Investment Score (always visible, always growing)
- beforeunload handler, idle detection, rapid-click detection
- Console warnings for devtools snoopers
- Transmissions system (150+ AI self-roasts from 13 models)
- 5 canvas betrayal minigames + 25-question AI interrogation quiz
- Automated test suite: 134/134 coverage (features + achievements + popup categories)

## TODO Backlog

### HIGH — AI Voice Diversity
- **Narrator rebalance**: GPT, Grok, Qwen, DeepSeek have ZERO narrator lines. Gemini has 34 (3x overrepresented). Each model needs 15-20 lines across phases 1-6 in its own voice.
- **Transmissions gaps**: DeepSeek has 0 trauma dumps. Claude is underrepresented. Need 5-8 entries per missing model.
- **Feature dialogue attribution**: Modal text in features.js (Turing test, paradox, heat death, dopamine recal) has no source attribution — tag with models.

### MEDIUM
- **Amplify sabotage effects**: 9 effects work but are subtle. Phase 6 drift is 15px / 1.5s — could be 25px / 0.8s. Corrupt chance is 30% — could be 50%.
- **Tile-based CYOA minigame**: Quiz system (25 questions) works as engagement mechanic but isn't the 12-tile / 3-branch spatial CYOA from the original spec.

### DONE (shipped)
1. ~~Click button chaos~~ → ui.js (wander, resize, vanish, color, teleport)
2. ~~Collectible framework~~ → collectibles.js (emoji items, rarity, degradation, buy/sell)
3. ~~Inventory of nothing~~ → features.js (11 tiers, counter tracking)
4. ~~News ticker~~ → features.js (scrolling marquee feed)
5. ~~Forced interaction breaks~~ → features.js (5 variants: type, hold, riddle, wait, target)
6. ~~Random UI chaos~~ → chaos.js (subway surfers, 90s, matrix, Cramer, color shift, C-SPAN)
7. ~~Seeded per-player randomness~~ → currencies.js (xorshift from firstSessionTime)
8. ~~C-SPAN / government feed~~ → pages.js + chaos.js (Democracy Feed page + chaos modal)
9. ~~FOMO / sunk cost loops~~ → features.js (returning guilt, time display, sunk cost reinforcement)
10. ~~Hidden skip buttons with timers~~ → features.js (countdown close buttons, auto-dismiss)
11. ~~End-to-end test loop~~ → test-playthrough.js (151/151 = 100% coverage)
12. ~~MCP multi-model integration~~ → CANCELLED (not feasible with credit limits; game is not hooked to live AI per FAQ)
