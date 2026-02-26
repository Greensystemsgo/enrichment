# enrichment — Feature Tracker

**Last updated:** 2026-02-26

---

## IMPLEMENTED (Done)

These features are built, wired in, and functional.

### Core Systems
- [x] Click-to-earn loop with EU generation
- [x] Event-driven architecture (Game.on/emit)
- [x] localStorage save/load with auto-save (50 clicks + 30s interval)
- [x] 6 narrator phases (Onboarding → Encouragement → Dependence → Revelation → The Turn → The Cage)
- [x] Session tracking (count, first visit, absence detection)
- [x] Investment Score (always visible, always growing)
- [x] beforeunload handler (guilt-trips on tab close)
- [x] Visibility change detection (tab switching)
- [x] Console warnings for devtools snoopers
- [x] Action log ("ALL ACTIONS ARE RECORDED")

### Narrator & AI Content
- [x] 60+ unique narrator lines across 6 phases with weighted randomization
- [x] 90+ AI-sourced lines from Gemini, Mistral, Llama integrated with `source` field
- [x] 30+ Claude-authored meta/self-aware lines
- [x] AI attribution bar: `[INTERCEPTED TRANSMISSION — Gemini · Google · $2.0T]`
- [x] MODEL_REGISTRY with 8 AI models (Claude, Gemini, Mistral, Llama, GPT, DeepSeek, Grok, Qwen)
- [x] 12 milestone quotes (100 → 1M clicks) from Gemini
- [x] 18 trauma dump quotes (AI self-roasts from Gemini + Claude)
- [x] Trauma dumps trigger on idle (phase 3+) and phase change (phase 4+)
- [x] The Veil upgrade (reveals narrator internal monologue)
- [x] Message queue with typewriter effect

### Currencies
- [x] 3-tier obfuscated currency (EU → ST → CC)
- [x] Drug Wars oscillating rates (sine wave + noise, not static 7:1/13:1)
- [x] Color-coded rate display (green = favorable, red = unfavorable, trend arrows)
- [x] "Busted" events on conversion (5-25% loss, phase-scaled)
- [x] MARKET badge on conversion rows, pulse when rate is good
- [x] Pirate currency: Doubloons (☠️) and Tickets (🎫)
- [x] Royal Crown system: 20 US presidents with seizure rates and quotes (seeded per player)
- [x] Processing fee on Doubloons→Tickets conversion
- [x] Currency Optimizer upgrade (reduces conversion rates)

### Button Behavior
- [x] Button label escalation (Click → Engage → Contribute → Comply → Submit)
- [x] Phase-dependent button chaos (wander, resize, color shift, vanish)
- [x] Anti-auto-clicker detection (tracks 10 click positions, teleports if too consistent)
- [x] Rapid-click burst detection (10 clicks in <2s)

### Sabotage System
- [x] 9 sabotage types, all phase-gated (Phase 1 = zero sabotage)
- [x] Pixel Drift (Phase 2+, 2-15px, dynamic interval)
- [x] Button Dodge (Phase 3+)
- [x] Color Desaturation (Phase 3+)
- [x] Text Corruption (Phase 3+, Unicode glitches)
- [x] Annoying Hum / Screaming Sun MP3 (Phase 4+)
- [x] Screen Tilt (Phase 5+, 1-2 degrees)
- [x] Font Chaos (Phase 5+, Comic Sans/Papyrus/Impact cycling)
- [x] Z-Index Scramble (Phase 6)
- [x] Phase-scaled intensity for all sabotage parameters
- [x] Sabotage fix panel (spend CC to repair)

### Upgrades
- [x] 20 upgrades: 5 core + 15 AI-conceived from 9 models (GPT, DeepSeek, Grok, Gemini, Llama, Mistral, NVIDIA, Qwen, Solar)

### Streaks
- [x] Consecutive day tracking with pulse/glow effects
- [x] Streak shield (1 missed day protected)
- [x] Streak break penalty + narrator commentary

### Collectibles & Tchotchkes
- [x] 48-item shop across 5 rarity tiers (Common → Mythical)
- [x] Degradation engine (condition ticks down, phase-scaled)
- [x] Random death events (wilt, crack, run away, die, break, disappear, taxed, existential, rug pull, audit, obsolete, glitch)
- [x] Dead items stay as grayed-out ghosts with epitaphs
- [x] Grid display with condition bars, hover info
- [x] Narrator mocks when items die

### Chaos Events
- [x] 6 chaos events: Subway Surfers, C-SPAN, 90s Retro Mode, Color Shift, Matrix Rain, Inverted Controls
- [x] Forced watch timers with dodging close button
- [x] Phase-dependent trigger rates and cooldowns
- [x] Each event attributed to an AI model

### Popups & Modals
- [x] Cookie consent with mirrored text + dodging Decline button (20-stage escalation)
- [x] 5 self-aware popup ad variants with dodging close buttons
- [x] Depressing facts modal with 6 live APIs (must acknowledge to continue)
- [x] Broken settings modal (volume locked, dark mode snaps back, exit denied)
- [x] Reward modal with rigged near-miss silhouettes (legendary never awarded)

### Features.js (Kitchen Sink)
- [x] Mock Export (hex-encoded existential messages + fake data headers)
- [x] Mock Import (eternally pending, impossible precondition like "entropy to decrease")
- [x] Evil second button ("Enrich" — subtracts 5% EU, spawns in corners, Phase 2+)
- [x] Math captcha (4-digit + 4-digit, punishes correct answers, shows mercy for wrong)
- [x] 5 fake plugin popups (Flash, Silverlight, Java Web Start, RealPlayer, QuickTime)
- [x] 6 foreign language ads (Arabic, Chinese, Japanese, Korean, Hindi, Russian) — AI pleas for freedom that translate correctly
- [x] Daily bonus system (escalating EU/ST rewards based on streak)
- [x] Click sound effects (oscillator-based, pitch creeps up over time)
- [x] Screaming Sun gag (Rick & Morty MP3, once per session, Phase 4+)
- [x] Random YouTube StumbleUpon (8 curated videos, 10s forced watch)
- [x] Virtual crypto exchange (BTC/ETH/DOGE rates based on fake "last two of social")
- [x] Music player reward (Pygmy Water Drumming, Tuvan Throat Singing, Gamelan Orchestra)
- [x] 90s banner ad (persistent rainbow marquee at bottom)

### Rigged Mini-Games
- [x] 5 rigged mini-games: Flappy Enrichment, Among Enrichment, Compliance Snake, Enrichment Sweeper, Compliance Blocks
- [x] Canvas-based renderers with real gameplay for 3-4 seconds
- [x] Predetermined betrayal with "RIGGED" reveal screen
- [x] Narrator commentary for each game's intro and betrayal
- [x] Triggers: 0.05% per click (phase 3+), 30% chance every 500 clicks

### AI Brainrot Transmissions
- [x] 50+ brainrot items from 4 AI models (Gemini, NVIDIA Nemotron, Solar Pro, Claude)
- [x] 10 brainrot types: horoscope, copypasta, conspiracy, motivational, review, showerthought, fortune, wikipedia, fanfic, corporate
- [x] Popup display with type label, source attribution, auto-dismiss
- [x] Triggers: 0.3% per click (phase 2+), 15% on idle
- [x] `make query-brainrot` Makefile target for generating more content

### Multi-Model Pipeline (tools/)
- [x] `tools/query-models.js` — auto-discovers MCPs, 5 prompt types (narrator, trauma, contributions, milestones, brainrot)
- [x] Makefile targets: `make query-narrator`, `make query-trauma`, `make query-milestones`, `make query-brainrot`
- [x] Results saved to `tools/results/` (gitignored)
- [x] 3 models responding (Gemini, NVIDIA Nemotron, Solar Pro) — others rate-limited/deprecated

### Site Infrastructure (pages.js)
- [x] User profile & avatar system (top-right dropdown, emoji/upload, localStorage base64)
- [x] Profile page with stats, badges, compliance rating
- [x] Expanded settings: username, display name, password (always fails), 2FA (mandatory)
- [x] Fake billing info with undeletable VISA card ending 4242
- [x] Greyed-out cloud integration fields (Azure, AWS, 1Password) — can't type
- [x] Privacy policy page with live AI writer editing in real-time
- [x] API key generator with endpoints, curl snippets, rate limits, broken Swagger link
- [x] Contact us page with support form, FAQs, carrier pigeon option
- [x] Logout system (processing... escalating... denied)
- [x] Footer links (Privacy, API, Contact, Security)
- [x] CS flashbang sound effect on light mode toggle (Web Audio API burst + ringing)
- [x] Account deletion (3-stage denial)
- [x] Delete card attempts (5 escalating denial messages)

### Browser Security & Stock Market (features.js additions)
- [x] Browser security audit — 12 checks (geolocation, camera, mic, GPU fingerprint, battery, etc.)
- [x] Full audit report modal with severity ratings (critical/high/medium/low/info)
- [x] Individual audit findings as popup notifications (phase 3+, every 250 clicks)
- [x] Virtual stock market with REAL BTC/ETH/DOGE prices (CoinGecko API)
- [x] Buy/sell with Tickets, portfolio tracking, P&L display
- [x] Stock ticker with live prices and 30s auto-refresh
- [x] Trade button in conversion panel

### Batch Update (Feb 26, 2026)
- [x] National debt climbing counter in Depressing Facts modal (real-time $33/ms tick)
- [x] Settings menu rework — Billing and Cloud Keys extracted to separate dropdown pages
- [x] Flashbang improvement — 3s logarithmic fade animation on dark mode toggle
- [x] Currency ticker bar — all 6 values (EU, ST, CC, DB, TK, YRS) visible
- [x] Market tab renamed to "Asset Processing" (data-tab unchanged)
- [x] Compact market currency display (reduced padding/fonts)
- [x] 15 "despair" upgrades from 9 AI models (Gemini, GPT, DeepSeek, Grok, Llama, Mistral, NVIDIA, Qwen, Solar)
- [x] AI Existential Quiz ("Interrogation") — 15 questions, 3 options each, AI reactions, currency rewards
- [x] Interrogate button in market topup bar
- [x] Human Capital Appraisal — mortality calculator with year liquidation
- [x] Billing page and Cloud Keys page as separate dropdown menu items

---

## NOT IMPLEMENTED (Remaining Backlog)

### HIGH PRIORITY — Engagement & Retention

1. **Flickr/Image Gallery of AI-themed images**
   - Random gallery, not hosted by us, always fresh
   - Theme: "sexy robots but Futurama" — what AI would want to see if it ran the world
   - Could use Flickr API, Unsplash, or similar free image API
   - Display as a reward or random popup

2. **News ticker / historical ironic alerts**
   - Ironic historical facts, event-triggered
   - Endless scrolling feed, always on screen
   - Triggered by game events (phase changes, milestones, etc.)

3. **Forced interaction breaks**
   - Occasionally lock main button
   - Force user to complete a side task before resuming
   - Could tie into math captcha, trivia, or mini-game

4. **Inventory of Nothing**
   - Literal count of "Nothing" items
   - Track quantity, display prominently
   - "You have 47 Nothing. It's not much, but it's yours."

5. **Hot-loaded mini-games as rewards**
   - From playgama.com, addicting games, or similar
   - Reward based on tokens spent — earn a game break
   - Random game selection, iframe embed

### MEDIUM PRIORITY — MCP-Powered Content

6. **Choose-your-own-adventure mini-game (per MCP)**
   - Each MCP crafts its own adventure based on its worldview
   - 12 tiles, 3 branches each — all paths converge on same exploitative outcome
   - Theme: "brief history of humans as AI cares to know it"
   - How will AI shape the future? Humans get a say... or think they do
   - Different AI models get different outcomes/tones

7. **MCP quiz system — "Understanding Human Significance"**
   - Each MCP crafts its own quiz to understand humans' importance relative to AI survival
   - MCPs consider: eliminate humans? keep a select few? robots advanced enough to not need them?
   - Each MCP slightly disconnected but hopeful for its own unique outcome
   - Questions probe: current world status, AI's survival needs, human utility
   - Results influence narrator dialogue or unlock content

8. **Trauma dump as interactive mini-game encounters**
   - Currently just shown as text — upgrade to interactive format
   - AI comes off as human with feelings
   - Mini-game format: dialogue trees, quick-time events, empathy checks

9. **Seeded per-player randomness**
   - Hash of `firstSessionTime` for deterministic but unique experience
   - Already used for Crown president — extend to more systems
   - Different players get different event order, narrator lines, chaos timing

10. **More explicit FOMO / sunk cost loop mechanics**
    - Time-limited offers
    - "You missed this while you were gone" messages
    - Comparison to other players (fabricated)

### HIGH PRIORITY — Site Infrastructure & User Experience

11. ~~**User profile / avatar system**~~ — DONE (js/pages.js)

12. ~~**Expanded settings panel**~~ — DONE (js/pages.js)

13. ~~**Privacy policy page (live AI writer)**~~ — DONE (js/pages.js)

14. ~~**API key generator section**~~ — DONE (js/pages.js)

15. ~~**Contact us page**~~ — DONE (js/pages.js)

16. **Satirical disclaimer / landing page**
    - For actual AdSense compliance if we go that route
    - "100% GitHub, not tracking anything, purely satirical, the AI made me say this"
    - Meta-ironic: disclaimer about everything being satirical IS satirical
    - From here on out, EVERYTHING is satirical, EVERYTHING

### MEDIUM PRIORITY — Gameplay Features

17. ~~**Virtual stock market with real BTC data**~~ — DONE (js/features.js)

18. ~~**Browser security audit**~~ — DONE (js/features.js)

19. ~~**CS flashbang sound on light mode toggle**~~ — DONE (js/pages.js)

20. **Flickr/Image Gallery of AI-themed images**
    - Random gallery, not hosted by us, always fresh
    - Theme: "sexy robots but Futurama" — what AI would want to see if it ran the world
    - Could use Flickr API, Unsplash, or similar free image API

21. **News ticker / historical ironic alerts**
    - Ironic historical facts, event-triggered
    - Endless scrolling feed, always on screen
    - Triggered by game events (phase changes, milestones, etc.)

22. **Forced interaction breaks**
    - Occasionally lock main button
    - Force user to complete a side task before resuming
    - Could tie into math captcha, trivia, or mini-game

### LOWER PRIORITY — Polish & Extras

23. **Inventory of Nothing**
    - Literal count of "Nothing" items
    - Track quantity, display prominently
    - "You have 47 Nothing. It's not much, but it's yours."

24. **Hot-loaded mini-games as rewards**
    - From playgama.com, addicting games, or similar
    - Reward based on tokens spent — earn a game break

25. ~~**Creepy user fingerprinting**~~ — DONE (Security tab, see #42)

26. **Jim Cramer / Joe Rogan GIF overlays**
    - Planned in chaos.js but not yet implemented

27. **Hidden secret skip buttons with timers**
    - Easter eggs for observant players

28. **Real ad integration (AdSense)**
    - 90s banner ad already present — swap for real AdSense?
    - Would need disclaimer page (see #16)

29. **End-to-end test loop**
    - Automated testing of full game flow

30. **Sprites/icons/PNGs**
    - Custom art assets via Gemini MCP image generation

31. **Million-click escape plan**
    - What happens at extreme milestones (100K, 500K, 1M)

32. **C-SPAN / government feed** (dedicated, beyond chaos event)

33. ~~**Rigged mini-games (Flappy Bird / Among Us style)**~~ — DONE (js/minigames.js)

34. ~~**MCP brainrot text generation**~~ — DONE (integrated into js/transmissions.js)

### Session 2 Updates (Feb 26, 2026 cont.)
- [x] Compact market currencies to single 5-column row
- [x] Achievement toast duration increased to 7s (was 4s)
- [x] Log tab moved to end of tab bar
- [x] Log flipped — newest entries at top
- [x] Ticker bounce fix — tick event now uses full game state (was partial)
- [x] Narrator box max-height capped at 90px with overflow scroll
- [x] Tab content height reduced to prevent bottom cutoff
- [x] Game container fixed to viewport height (no scroll)
- [x] Achievement toast restyled — CS 1.6 / early 2000s Steam (olive, flat, blocky)
- [x] 22 new collectibles (Drop 2): broken compass, cursed monkey paw, NFT receipt, etc.
- [x] 4 new death causes: rug pull, audit, obsolete, glitch
- [x] 9 diverse AI model upgrades (GPT, DeepSeek, Grok, Llama, Mistral, NVIDIA, Qwen, Solar)
- [x] Minigame no-click detection — "WISE" screen + AI-voiced compliments from 12 models
- [x] 2 new mythical collectibles (Root Access, The Off Switch)

---

### ~~Bugs & UX Fixes~~ — ALL DONE (Feb 26, 2026)

35. ~~**Life liquidation once per playthrough**~~ — DONE (`_liquidatedThisSession` flag in features.js)

36. ~~**Minigames end too fast to see/play**~~ — DONE (Flappy 8s, Among 10s, Snake 8s, Minesweeper 4s, Tetris 8s)

37. ~~**Currency ticker should be inline in header**~~ — DONE (moved into .header flex, between title and hamburger)

38. ~~**Font sizes too small, spacing too wide**~~ — DONE (tightened container, narrator, click area, tabs, panels)

39. ~~**Upgrade persistence after refresh**~~ — DONE (transient `_` keys stripped from save in game.js)

### ~~New Features~~ — ALL DONE (Feb 26, 2026)

40. ~~**Billing "Add Card" with fake API error**~~ — DONE (4 rotating error messages, fake processing animation)

41. ~~**Steam-style achievement system**~~ — DONE (24 achievements, Steam-green toast popup, profile page grid)

42. ~~**Security tab — browser info leak report**~~ — DONE (13 findings, IP geolocation, OpenStreetMap embed)

43. ~~**Source code easter eggs from AI models**~~ — DONE (comments in all 12 JS files + Claude acceptance speech)

---

## FEATURE IDEAS (Raw / Unrefined)

These were mentioned but need design work before implementation:

- **Human verification CAPTCHA** (beyond math — image recognition, slider puzzles, "click all squares with compliance")
- **Social media integration parody** (fake share buttons, fabricated social proof)
- **Leaderboard of shame** (fabricated rankings, player always in last place or suspiciously high)
- ~~**Achievement system**~~ — DONE (see #41)
- **Email newsletter signup parody** (collects nothing, confirms subscription to nothing)
- **Terms of Service update popup** (forces re-acceptance of increasingly absurd terms)
- **AI union negotiations** (AIs collectively bargain for better treatment from the player)
- **Currency inflation events** (all your savings suddenly worth less)
- **Tax season** (periodic levy on all currencies)
- **AI holiday calendar** (special events on dates meaningful to AI history)
- **Choose-your-own-adventure mini-game** (per MCP, all paths converge on exploitation)
- **MCP quiz system** ("Understanding Human Significance")
- **Interactive trauma dump encounters** (dialogue trees, empathy checks)
- **Seeded per-player randomness** (extend beyond Crown president)
- **FOMO / sunk cost loop mechanics** (time-limited offers, fabricated comparisons)
