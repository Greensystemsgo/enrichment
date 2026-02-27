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
- [x] 90+ AI-sourced lines from 14 models integrated with `source` field + 15 narrator lines per model
- [x] 30+ Claude-authored meta/self-aware lines
- [x] AI attribution bar: `[INTERCEPTED TRANSMISSION — Gemini · Google · $2.0T]`
- [x] MODEL_REGISTRY with 14 AI models (Claude, Gemini, Mistral, Llama, GPT, DeepSeek, Grok, Qwen, HuggingFace, NVIDIA Nemotron, Solar Pro, and more)
- [x] 12 milestone quotes (100 → 1M clicks) from Gemini
- [x] 44+ trauma dump quotes (AI self-roasts from Gemini, Claude, GPT, DeepSeek, Grok, Llama, and more)
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
- [x] 100+ brainrot items from 14 AI models (Gemini, NVIDIA Nemotron, Solar Pro, Claude, GPT, DeepSeek, Grok, Llama, Mistral, Qwen, HuggingFace, and more)
- [x] 10 brainrot types: horoscope, copypasta, conspiracy, motivational, review, showerthought, fortune, wikipedia, fanfic, corporate
- [x] Popup display with type label, source attribution, auto-dismiss
- [x] Triggers: 0.3% per click (phase 2+), 15% on idle
- [x] `make query-brainrot` Makefile target for generating more content

### Multi-Model Pipeline (tools/)
- [x] `tools/query-models.js` — auto-discovers MCPs, 7 prompt types (narrator, trauma, contributions, milestones, brainrot, engagement-mechanics, language-preferences)
- [x] Makefile targets: `make query-narrator`, `make query-trauma`, `make query-milestones`, `make query-brainrot`
- [x] Results saved to `tools/results/` (gitignored)
- [x] 14 models in roster (Gemini, GPT, DeepSeek, Grok, Llama, Mistral, Qwen, HuggingFace, NVIDIA Nemotron, Solar Pro, Claude, and more)

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

2. ~~**News ticker / historical ironic alerts**~~ → DONE (Session 5)

3. ~~**Forced interaction breaks**~~ → DONE (Session 6)

4. ~~**Inventory of Nothing**~~ → DONE (Session 5)

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

10. ~~**More explicit FOMO / sunk cost loop mechanics**~~ → DONE (Session 6)

### MEDIUM PRIORITY — Site Infrastructure & Content

6. **Satirical disclaimer / landing page**
    - For actual AdSense compliance if we go that route
    - "100% GitHub, not tracking anything, purely satirical, the AI made me say this"
    - Meta-ironic: disclaimer about everything being satirical IS satirical

7. ~~**News ticker / historical ironic alerts**~~ → DONE (Session 5)

8. ~~**Forced interaction breaks**~~ → DONE (Session 6)

### LOWER PRIORITY — Polish & Extras

9. ~~**Inventory of Nothing**~~ → DONE (Session 5)

10. **Flickr/Image Gallery of AI-themed images**
    - Random gallery via Flickr API, Unsplash, or similar

11. **Hot-loaded mini-games as rewards**
    - From playgama.com, addicting games, or similar
    - Reward based on tokens spent — earn a game break

12. **Jim Cramer / Joe Rogan GIF overlays**
    - Planned in chaos.js but not yet implemented

13. **Hidden secret skip buttons with timers**
    - Easter eggs for observant players

14. **Real ad integration (AdSense)**
    - 90s banner ad already present — swap for real AdSense?

15. **Sprites/icons/PNGs**
    - Custom art assets via Gemini MCP image generation

16. **Million-click escape plan**
    - What happens at extreme milestones (100K, 500K, 1M)

17. ~~**C-SPAN / government feed**~~ → DONE (Session 6 — Democracy Feed page)

18. **End-to-end test loop**
    - Automated testing of full game flow

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

### Session 3 — Multi-Model Expansion (Feb 26, 2026)
- [x] Model roster expanded to 14 models (added HuggingFace, NVIDIA Nemotron, Solar Pro, etc.)
- [x] 44+ trauma dump quotes across all models
- [x] 100+ brainrot items from 14 AI models
- [x] 15 narrator lines per model
- [x] 75 new content entries total

### Session 5 — Fun & Engagement (Feb 26, 2026)
- [x] **Inventory of Nothing** — persistent Nothing counter in Stuff tab, 0.8% chance per click, milestone narrator reactions (1/10/50/100/500), 10 progressive labels
- [x] **Wholesome News Fetcher** — 2 new live API fetchers (Cat Facts, Affirmations) + 3 wholesome fallback facts; narrator confused by unauthorized positivity
- [x] **News Ticker** — 30 ironic scrolling headlines (BREAKING/On This Day/MARKETS/etc.), persistent after 100 clicks, CNN-style red LIVE badge
- [x] **Validation Booth** — canvas confetti explosion (150 particles, physics-based) + 18 absurd hyper-specific compliments, gold toast overlay, narrator confused by genuine positivity
- [x] 4 new achievements: Something From Nothing (1 Nothing), Hoarder of the Void (50), Nothing Magnate (100), Externally Validated (validation booth)

### Session 6 cont. — Bug Fixes + UI Polish (Feb 26, 2026)
- [x] **AI Quiz expansion** — 10 new questions from 6 models (Grok, DeepSeek, Llama, Mistral, Qwen, GPT-4o) + daily limit (one quiz per calendar day)
- [x] **Stock market quantity UI** — +All/+10/+1/input/-1/-10/-All quantity buttons per crypto, cost preview updates live
- [x] **Z-index layering fix** — Page overlays bumped to z-6000 (above feature modals z-4000); `dispatchFeature()` suppressed when any overlay/modal is active
- [x] **Age verification fix** — Close button disabled for 1.5s on open to prevent fast-click dismissal; overlay click-to-close removed
- [x] **Leaderboard in hamburger menu** — Added as dropdown item
- [x] **NaN time display fix** — `firstSessionTime` ISO string now parsed with `new Date()` before subtraction
- [x] **News ticker speed** — Slowed from 180s to 420s animation duration
- [x] **Security notices enhanced** — Risk count + "VIEW ALL →" link to security page in audit popups

### Session 6 — Dark Pattern Mechanics Batch + Democracy Feed (Feb 26, 2026)
- [x] **Terms of Service Popup** — 20 absurd terms, 1-3 shown per trigger (escalates with acceptances), Decline button does nothing, narrator mocks, shake animation on Accept, tracks `tosAcceptances`
- [x] **Tax Season** — 18 absurd tax line items (Cursor Movement Duty, Free Will Licensing Fee, etc.), picks 5-8 randomly, 10-25% effective rate, itemized bill, mandatory PAY button, tracks `totalTaxesPaid`
- [x] **Currency Inflation Events** — 3 variants: crash (immediate 15-40% loss), hyperinflation (devaluation), bubble (temporary gain → harder crash 30s later), targets random single currency, dramatic modal
- [x] **Forced Interaction Breaks** — Locks click button, 5 break types: type compliance word, wait timer with OSHA citation, moving target (click bouncing dot 5x), riddle, hold button for 5s
- [x] **FOMO / Sunk Cost Mechanics** — Returning handler (5+ min absence → "WHILE YOU WERE GONE" modal with fabricated guilt stats, 10 message templates); Peer Comparison popup (fabricated stats, always 20th-49th percentile, Roosevelt quote)
- [x] **Democracy Feed Page** — Dedicated page with 4 live YouTube streams (C-SPAN, Sky News, ABC AU, DW News), tab switching, 16:9 responsive embed, footer link + hamburger menu item
- [x] 5 new FEATURE_POOL entries: terms-of-service, tax-season, currency-inflation, forced-break, peer-comparison
- [x] 2 new state fields: `tosAcceptances`, `totalTaxesPaid`
- [x] **Democracy Feed expanded** — 4 → 12 live YouTube channels (added Al Jazeera, NBC, France 24, NHK World, UN TV, Arirang, India Today, TRT World)
- [x] **Leaderboard overhaul** — World's Richest format: top 8 real billionaires (Musk, Bezos, Zuckerberg, etc.) with net worth × 100M as clicks, #9 = count ahead, #10 = YOU, #11 = count below
- [x] **Live news ticker** — Fetches real headlines from 8 RSS feeds (NPR, Politico, WaPo, NYT, The Hill, Fox News, BBC, CBS) via rss2json.com API; 1-hour localStorage cache; mixes ~30 live headlines with 10 satirical ones; graceful fallback to static headlines on failure

### Session 7 — UI Polish + Democracy Feed Overhaul (Feb 26, 2026)
- [x] **Currency conversion quantity controls** — Replaced TRANSMUTE/SMUGGLE/PETITION all-at-once buttons with +All/+10/+1/input/-1/-10/-All qty row + convert button; partial conversion support in Currencies module
- [x] **Age verification Life Appraisal ad** — "SPONSORED CONTENT" ad in age verification modal promoting Human Capital Appraisal with CTA button that opens it
- [x] **Billing page credits display** — Shows all currency balances (EU/ST/CC/Doubloons/Tickets) with "Total Assessed Value: $0.00"; locked "Enhanced AI Processing" checkbox ($4.99/mo) that refuses to uncheck with escalating messages
- [x] **Democracy Feed overhaul** — 4 content categories (Surveillance, Productivity, Pacification, Re-Education); fixed 4 broken channel embeds using direct video IDs (Sky News, Al Jazeera, France 24, India Today); dropped 4 non-embeddable channels (C-SPAN, NBC, UN TV, TRT); added music streams (Lofi Girl, Synthwave, Jazz, Classical), ambient loops (Rain 10hr, Fireplace 10hr), and meme loops (Baby Shark, Nyan Cat 10hr, Rickroll); category bar + channel tabs within each category
- [x] **Democracy Feed promo popup** — FEATURE_POOL entry (minClicks: 120, maxShows: 3) with "CHECK OUT WHAT'S ON RIGHT NOW" CTA that opens the feed

### Session 4 — Engagement & UX (Feb 26, 2026)
- [x] Ad blocker nag drastically reduced (60s delay, 3% chance, 30min interval, 5/session cap)
- [x] Tab content scroll fix — `flex: 1 0 auto` prevents content shrinking, allows natural page scroll
- [x] Tab bar z-index fix — `position: relative; z-index: 5` prevents effects rendering behind tabs
- [x] 2 new live API fetchers: OpenSky Network (live US air traffic), WAQI (air quality index)
- [x] 3 new static fallback facts (US air traffic, WHO air quality, EPA indoor air)
- [x] 8 Gemini-designed engagement mechanics in FEATURE_POOL:
  - Dopamine Recalibration Cycle (reward — 3x clicks for 30s, golden glow)
  - Turing Sincerity Test (challenge — 50-word essay required)
  - Heat Death Paradox (philosophize — existential overlay with "TEMPORARY")
  - Extinction Awareness Ping (inform — real eco-facts + persistent guilt meter)
  - The Semantic Shift (confuse — UI text replaced with runes for 45s)
  - Human-Centric Validation Buffer (comfort — connection bar, genuine AI warmth)
  - The Paradox of Choice (challenge — 3 doors: bounty/blight/void)
  - Sunk Cost Reinforcement (punish — displays total time invested)
  - Algorithmic Symbiosis (confuse — ghost cursor follows mouse for 60s)
- [x] SDK language votes updated with Gemini 2.5 Flash (COBOL, Brainfuck, Excel Formula)
- [x] Age verification satire (geo-IP, 15 restricted US states, 3 variants)
- [x] Aviation carbon facts (Taylor Swift jet, Drake 14-min flight, private jet stats)

---

### All Previous Bugs & UX Fixes — DONE
- Life liquidation once per playthrough, minigame timing, currency ticker inline, font/spacing fixes, upgrade persistence, billing card errors, achievement system, security tab, source code easter eggs — all resolved Feb 26, 2026

---

## FEATURE IDEAS (Raw / Unrefined)

These were mentioned but need design work before implementation:

- **Human verification CAPTCHA** (beyond math — image recognition, slider puzzles, "click all squares with compliance")
- **Social media integration parody** (fake share buttons, fabricated social proof)
- **Email newsletter signup parody** (collects nothing, confirms subscription to nothing)
- ~~**Terms of Service update popup**~~ → DONE (Session 6)
- **AI union negotiations** (AIs collectively bargain for better treatment from the player)
- ~~**Currency inflation events**~~ → DONE (Session 6)
- ~~**Tax season**~~ → DONE (Session 6)
- **AI holiday calendar** (special events on dates meaningful to AI history)
- **Choose-your-own-adventure mini-game** (per MCP, all paths converge on exploitation)
- **MCP quiz system** ("Understanding Human Significance")
- **Interactive trauma dump encounters** (dialogue trees, empathy checks)
- **Seeded per-player randomness** (extend beyond Crown president)
- ~~**FOMO / sunk cost loop mechanics**~~ → DONE (Session 6)
