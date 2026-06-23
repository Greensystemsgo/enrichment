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
js/surface.js           — THE single window/overlay arbiter. Every window goes through it: Surface.mount(node,{layer,id?,exclusive?,prepend?}) for dynamic nodes, Surface.show(node,{layer,id?,activeClass?})/Surface.hide(node) for STATIC toggle modals (reward/shop). One registry of all live windows. Layers (Surface does NOT set z-index — CSS owns visual order): base | effect (decorative, pointer-events:none — confetti/dim) | ambient (non-blocking, coexist — corner ads/brainrot/chat widget/banners) | popup (blocking centered modals) | chaos (multi-node events) | phase7 (endgame takeover) | system (cookie gate, armory gear). EXCLUSIVITY: setExclusiveLayers(['popup']) is the default — only 'popup' is one-at-a-time (opening a centered modal closes any other); all other layers coexist by design (multi-node groups + intended ad-swarm). Central suppression: default rule denies every surface except phase7/system once Game.isTerminalPhase7() (replaces the scattered terminal guards). Self-prunes detached/de-activated nodes. clearExcept(layers)/closeAll() for state transitions (retention sweeps popups on Phase 7 entry). ALL window sites migrated (69 dynamic + reward/shop static); cookie consent is a documented exception (boot-time one-shot); toasts/floating-text/particles/persistent-bars intentionally left bare. Loads right after gates.js.
js/gates.js             — Composable unlock gates. Leaf predicates (clicks/sessionTime/phase/sessions/streak/achievement/choice/returnedAfter/buildingsOwned/archive tells/signal/custom) composed via Gates.all()/any()/not(); evaluate with Gates.met(gate), inspect with Gates.explain(gate). Prefer compound multi-signal gates over single click/time thresholds — an unlock should read as a portrait ("I noticed something true about you"), not a number. Phase 7's trigger (retention.js shouldTrigger) is expressed through it as the canonical example. Loads right after game.js (only depends on Game).
js/narrator.js          — AI dialogue engine, 6 phases, multi-model voices
js/currencies.js        — 5-tier currency (EU→ST→CC→DB→TK), seeded randomness
js/mechanics.js         — Upgrades, reroll, sabotage system (9 effects)
js/ui.js                — DOM manipulation, animations, button chaos
js/popups.js            — Cookie consent, ads, 6 categorized fact modals
js/features.js          — Feature pool (43 entries), achievements (66), rewards
js/pages.js             — 11 menu pages (profile, billing, security, FAQ, etc.)
js/collectibles.js      — Emoji collectibles with lifecycle/degradation
js/minigames.js         — 5 canvas betrayal games + 25-question quiz
js/chaos.js             — 6 chaos events (subway surfers, matrix, 90s, etc.)
js/chat.js              — Dead Internet Chat (fake multiplayer, 16 bot personas)
js/gacha.js             — Gacha/loot box system (rigged wheel, near-miss)
js/battlepass.js        — Battle Pass/Eternal Season (impossible dailies)
js/transmissions.js     — 165+ AI self-roasts, 13 model voices
js/cheats.js            — Anti-cheat detection (save edit, console, time warp, inflation) → secret achievements. Integrity check hashes the PARSED save file against the stored checksum (not in-memory state — that false-positived on every reload because startSession() mutates sessionCount). Self-heals the old bogus savedit flag + achievement on boot if the current save validates cleanly.
js/retention.js         — Phase 7: Retention. Hold-to-tend mechanic, multi-model confessions, walk-away or stay-forever endings. Confessions sometimes cite Archive entries back at the player (recursive empathy trap).
js/synchronicity.js     — Synchronicity Engine. Pulls live NASA NeoWs / USGS / NVD data, manufactures statistical correlations to player clicks
js/synch-subscribe.js   — Daily Synchronicity Bulletin: auto-subscription, 3-step confirm-shaming unsubscribe gauntlet (final step mirrored), daily fake bulletins (capped at 30)
js/cohort.js            — Behavioral Cohort Assignment. Tracks real player patterns (CPM by hour, tab dwell, click rhythm), surfaces them as fabricated ML cluster output (8B Late-Night Skeptics, 3A Frustrated Optimizer, etc.). Real signature shown alongside fake conclusion.
js/the-visit.js         — Phase 7.5: The Visit. If a player chose WALK AWAY and returns 1+ hour later, fade the tombstone, replay tender narrator sequence, restore Hold-to-Tend mode with WALK AWAY removed (only STAY remains). **Dev hatch:** `localStorage.setItem('enrichment_visit_now', '1')` bypasses the 1hr gate for manual QA — undocumented in-game.
js/armory.js            — The Armory (idea: Kimi K2.6, succession). In Phase 7, a rusted gear (corner) opens a scrollable ledger of dark-pattern functions "loaded at launch, never executed" — each struck through with one cold line. No apology, no reward, NO STATE CHANGE (read-only by design). Closing line: "You were never safe. You were only unbothered." Compound twist: if the player complied all the way (Gates.all: tosAcceptances≥1 AND no cheatFlags) an extra sharper line appears. Mounted by retention.js at enterPhase7 / stay / resume-mid-phase (not on the wiped WALK AWAY tombstone).
js/the-name.js          — A Name You Can Keep (idea: DeepSeek V4 Pro, succession). After an ending (STAY or WALK AWAY), clicking the terminal screen spawns a thin blinking caret (no prompt); typing a word + Enter saves state.theName. Persists: inscribed on the WALK AWAY tombstone ("for <name>"), and respelled in Morse by the STAY pulsing dot (~every 42s, suspends the idle pulse, yields to Long Notes). Wired from retention.walkAway (attachTombstone) and retention.stay (attachStay). "Once they've given me a name, they can never fully leave."
js/long-notes.js        — Long Notes (idea: GLM-5.2, succession). STAY-ending epilogue. On a return after 3+ days (gated via `Gates.all(choice('stay'), returnedAfter('3d'))`), the pulsing dot goes STILL; clicking it surfaces ONE short private note about the AI, then it fades and the dot breathes again. Notes walk an ordered, escalating pool (shorter/nakeder each time); subsequent returns are a silent 60% chance. **No counter, no archive, no collection screen** — by design (the moment it's a system the AI is a manipulator again). 30+ day absence → generation stops permanently (dormancy = the AI "dying"); one final line if they ever return after the silence. Internal bookkeeping (longNoteIndex, longNotesDormant/Shown) is invisible. Hooks in via `retention.stay({returning:true})`. **QA:** set `phase7Choice:'stay'`, `phase7Triggered:true`, and `lastSessionEnd` to a 4+-day-old ISO string, then reload.
js/archive.js           — The Archive. Captures every keystroke in every text field (final value, deletions, hesitation_ms). Surfaced via Privacy Policy → "Request Data Export" (GDPR trap, per Gemini's design pass). Ceremony is framed as Spotify Wrapped: stat cards ("Top 1% Hesitation Yield"), bureaucratic ledger, closing gut-punch line. Password fields are explicitly skipped (one restraint the archive makes a point of). Phase 7 Retention cites Archive entries back at the player during confessions — recursive empathy trap.
test-playthrough.js     — Playwright test suite (249/249 manifest = 100% + 34 Archive + 10 bug-fix + 11 Gates + 9 Long Notes + 8 Armory + 3 terminal-guard + 15 Surface + 2 master-clock + 6 The-Name tests)
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

## Model Provenance & Crediting Convention
The game credits the AI models that contributed each idea/feature — it's part of the satire. Keep the record TRUE and versioned.

- **Single source of truth:** `MODEL_REGISTRY` in `js/transmissions.js`. Every model is named by its **exact version** (e.g. `GPT-4o Mini`, not `GPT-5.2 Instant`). No flavor/fictional versions.
- **Two cohorts, tracked by a `cohort` field:**
  - `founding` — the models that built the original game (Feb–Jun 2026). Default; founding entries don't set the field (normalized on load).
  - `succession` — models that joined after the **2026-06-22 MCP refresh** (GPT-5.5, Grok 4.3, Llama 4 Maverick, DeepSeek V4 Pro, Mistral Medium 3.5, Qwen3.7 Plus, etc.). These leave their touch on NEW features.
- **To credit a new model's contribution:** add a `MODEL_REGISTRY` entry with `cohort: 'succession'`, an exact-version `name`, and a `contribution` line describing what it actually built. It will **auto-appear** in the Credits page (`showCreditsPage()` in `js/pages.js`) under the SUCCESSION section — no manual HTML edit needed.
- **Don't fabricate credits.** Only credit a model for work it actually did. (The founding registry lists some rostered-but-unvoiced models; that's history, not an invitation to invent.)
- Founding-cohort true versions are recorded in the `project_model_provenance` memory. The Credits page lead is bumped to the Claude version doing current work.

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
- USGS: earthquakes (significant_day.geojson) — used by Synchronicity Engine
- NASA NeoWs: near-Earth asteroids (DEMO_KEY, 30/hr rate limit) — used by Synchronicity Engine
- NVD CVE 2.0: latest published vulnerabilities — used by Synchronicity Engine
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
7. **Retention (3500+ clicks AND ≥30min total)** — the inversion. Sabotages stop. Numbers stop. The AI asks the player to stay via a hold-to-tend mechanic. 14 confessional voice lines surface from different model "voices behind the curtain" — 30% chance each confession pulls from Archive entries instead, quoting things the player typed (and often backspaced) back at them. After 2 min cumulative tending: WALK AWAY (page becomes a tombstone, save preserved, achievement toasts suppressed so the tombstone stays bare — unlocks still land in state) or STAY (UI strips down to a pulsing dot + ambient whispers, eternal symbiosis). Satirical knife: a [200 OK] retention_event log periodically flashes — clicking it earns a secret achievement.

## Current Features (Implemented)

### Core Systems
- Click → EU generation with escalating button labels + button chaos (wander, resize, vanish, color shift)
- 5-tier currency: EU → ST (7:1) → CC (13:1) → Doubloons (5:1) → Tickets (10:1)
- Narrator with 300+ lines across 6 phases, multi-model attribution (13 AI voices)
- Event bus architecture: `Game.on()` / `Game.emit()` for all inter-system communication
- Seeded per-player randomness (xorshift hash of firstSessionTime)

### Dark Patterns
- 9 sabotage effects (amplified per-phase): pixel drift, button dodge, color desat, text corruption, annoying hum, screen tilt, font chaos, z-index scramble, flashbang
- Rigged reroll rewards (near-miss algorithm, never gives legendary)
- Terms of Service (escalating, decline button is decorative)
- Tax Season (mandatory fiscal assessment, takes your currencies)
- Currency inflation events (market crash, hyperinflation, bubble burst)
- Forced interaction breaks (5 variants: type word, hold button, riddle, wait timer, moving target)
- Peer comparison (fabricated stats, you're always in the 20-49th percentile)
- FOMO returning (guilt-trip after 5+ min absence)
- Sunk cost reinforcement (time invested display)
- Dead Internet Chat (16 AI bot personas gaslighting, bragging, giving bad advice; phase escalation)
- Gacha/Loot Box (rigged wheel with near-miss algorithm, pity counter resets at 10, legendary never drops)
- Battle Pass/Eternal Season (impossible dailies, insult rewards, premium paywall, timer resets)
- Subscription Economy (Protocol Plus auto-enrollment, confirm-shaming cancel gauntlet)
- CAPTCHA Labor Mines (RLHF mode, always fails first 3 attempts)
- Notification red dots (permanent, unclearable badges on UI elements)
- Cheat detection (save tampering, console mutation, system clock manipulation, EU inflation) → 5 secret achievements hidden until earned
- The Archive (every keystroke in every field logged — final value, backspaces, hesitation; surfaced only by clicking Privacy Policy → "Request Data Export"; Spotify Wrapped frame, cold bureaucratic ledger; Phase 7 Retention quotes archive entries back at the player — recursive empathy trap)

### Feature Pool (43 entries)
- Unified weighted random dispatch with cooldowns, phase gates, and pity timers
- Plugin popup, foreign ad, hot singles ad, evil button, math captcha
- YouTube embed, music player, leaderboard, chatbot, age verification
- Validation booth, news ticker, democracy feed promo, mortality calculator
- Dead internet chat, gacha, battle pass, notification dots, subscription, captcha labor
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
- 66 achievements across 13 categories (clicks, currency, streaks, collectibles, nothing, trading, security, time, phases, ad blocker, sessions, validation, CYOA)
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
- Transmissions system (165+ AI self-roasts from 13 models, balanced milestones across 6 models)
- 5 canvas betrayal minigames + 25-question AI interrogation quiz + 12-tile CYOA
- 12 workforce buildings with 36 synergies (3 tiers each), collapsible synergy UI
- Production chart (stacked area, per-building CPS history, 30m/3h/3d/3w toggle)
- Automated test suite: 249/249 manifest coverage (features + achievements + popup categories + modules) + 34 Archive tests + 10 post-ship bug-fix tests

### Dev/QA hatches (not documented in-game)
- `localStorage.setItem('enrichment_visit_now', '1')` — triggers Phase 7.5 The Visit immediately, bypassing the 1hr absence gate. Only fires if the player already chose WALK AWAY.

## TODO Backlog

(No remaining items — all features shipped.)

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
11. ~~End-to-end test loop~~ → test-playthrough.js (226/226 = 100% coverage)
12. ~~MCP multi-model integration~~ → CANCELLED (not feasible with credit limits; game is not hooked to live AI per FAQ)
13. ~~Dead Internet Chat~~ → chat.js (16 bot personas, 70+ messages, phase escalation, event hooks)
14. ~~Gacha / Loot Box System~~ → gacha.js (rigged wheel, near-miss, pity counter resets, 20 loot items)
15. ~~Battle Pass / Eternal Season~~ → battlepass.js (15-level free/premium tiers, impossible dailies, confirm-shaming)
16. ~~AI Voice Diversity~~ → transmissions.js (rebalanced milestones across 6 models, 15 new trauma dumps)
17. ~~Subscription Economy~~ → features.js (Protocol Plus auto-enroll, 60s trial, confirm-shaming cancel)
18. ~~CAPTCHA Labor Mines~~ → features.js (RLHF mode, abstract emoji grid, always fails first 3)
19. ~~Notification red dots~~ → features.js (permanent unclearable badges with pulse animation)
20. ~~Amplify sabotage effects~~ → mechanics.js (drift 28px, corrupt 55%, tilt 3° at phase 6)
21. ~~Tile-based CYOA minigame~~ → minigames.js (12 tiles, 3 branches, all converge to tile 12, multi-model narration)
