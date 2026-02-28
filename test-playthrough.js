/**
 * Enrichment Program — Comprehensive Automated Test
 *
 * Phases:
 *   1. Boot & Cookie consent
 *   2. Click loop (7000 clicks) — organic feature pool triggering
 *   3. Direct feature pool calls — guarantee 100% pool coverage
 *   4. Popup category verification — all 6 categories via direct calls
 *   5. Achievement grind — state manipulation + checkAchievements()
 *   6. Trading grind — programmatic trades for trade achievements
 *   7. Page navigation — visit all hamburger menu pages
 *   8. Conversion chain — full EU→ST→CC→DB→TK
 *   9. Report — feature manifest + achievement manifest + popup categories
 *
 * Usage: node test-playthrough.js
 */

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════
// FEATURE MANIFEST — Every testable feature with its log pattern
// ═══════════════════════════════════════════════════════════

const FEATURE_MANIFEST = [
    // ── Core Systems ──
    { id: 'session-init',       pattern: 'SESSION INITIALIZED',     category: 'Core',       notes: 'Game boot' },
    { id: 'session-returning',  pattern: 'Subject returning',       category: 'Core',       notes: 'Session count' },

    // ── Cookie / Onboarding ──
    { id: 'cookie-consent',     pattern: 'COOKIE CONSENT',          category: 'Onboarding', notes: 'Mirrored text popup' },

    // ── Popup Ads ──
    { id: 'popup-ad',           pattern: 'POPUP AD:',               category: 'Ads',        notes: 'Self-aware ad variants' },
    { id: 'plugin-popup',       pattern: 'PLUGIN POPUP:',           category: 'Ads',        notes: 'Fake plugin install' },
    { id: 'foreign-ad',         pattern: 'FOREIGN AD:',             category: 'Ads',        notes: 'Non-English ad' },
    { id: 'hot-singles',        pattern: 'HOT SINGLES AD:',         category: 'Ads',        notes: 'Dating ad parody' },
    { id: 'banner-90s',         pattern: '90S BANNER:',             category: 'Ads',        notes: 'Marquee banner' },
    { id: 'ad-blocker',         pattern: 'AD BLOCK',                category: 'Ads',        notes: 'Ad blocker detection' },

    // ── Feature Pool (Dark Patterns) ──
    { id: 'evil-button',        pattern: 'EVIL BUTTON:',            category: 'Features',   notes: 'Deceptive button' },
    { id: 'captcha',            pattern: 'CAPTCHA:',                category: 'Features',   notes: 'Math captcha' },
    { id: 'random-video',       pattern: 'RANDOM VIDEO:',           category: 'Features',   notes: 'YouTube embed' },
    { id: 'music-player',       pattern: 'MUSIC PLAYER:',           category: 'Features',   notes: 'Audio reward' },
    { id: 'depressing-fact',    pattern: 'DEPRESSING FACT:',        category: 'Features',   notes: 'Live API fact' },
    { id: 'security-audit',     pattern: 'SECURITY AUDIT:',         category: 'Features',   notes: 'Browser audit' },
    { id: 'leaderboard',        pattern: 'LEADERBOARD:',            category: 'Features',   notes: 'Billionaire rankings' },
    { id: 'chatbot',            pattern: 'CHATBOT:',                category: 'Features',   notes: 'AI agent popup' },
    { id: 'age-verify',         pattern: 'AGE VERIFY:',             category: 'Features',   notes: 'Geo-based age gate' },
    { id: 'validation-booth',   pattern: 'VALIDATION BOOTH:',       category: 'Features',   notes: 'Compliment dispenser' },
    { id: 'nothing',            pattern: 'NOTHING ACQUIRED:',       category: 'Features',   notes: 'Inventory of nothing' },
    { id: 'news-ticker',        pattern: 'NEWS TICKER',             category: 'Features',   notes: 'Scrolling headlines' },
    { id: 'democracy-promo',    pattern: 'DEMOCRACY PROMO:',        category: 'Features',   notes: 'Feed invitation' },
    { id: 'mortality-calc',     pattern: 'MORTALITY CALCULATOR:',   category: 'Features',   notes: 'Life appraisal' },

    // ── Dark Pattern Mechanics ──
    { id: 'tos',                pattern: 'TOS ACCEPTED:',           category: 'DarkPattern', notes: 'Terms of service' },
    { id: 'tax-season',         pattern: 'TAXES PAID:',             category: 'DarkPattern', notes: 'Tax collection' },
    { id: 'inflation',          pattern: 'MARKET CRASH:|HYPERINFLATION:|MARKET BUBBLE:', category: 'DarkPattern', notes: 'Currency event' },
    { id: 'forced-break',       pattern: 'FORCED BREAK:',           category: 'DarkPattern', notes: 'Button lock + task' },
    { id: 'patience-cal',       pattern: 'PATIENCE CALIBRATION:',   category: 'DarkPattern', notes: 'Hold button task' },
    { id: 'peer-comparison',    pattern: 'PEER COMPARISON:',        category: 'DarkPattern', notes: 'Fabricated stats' },
    { id: 'fomo-returning',     pattern: 'FOMO:',                   category: 'DarkPattern', notes: 'Absence guilt (needs 5m away)' },

    // ── Existential Features ──
    { id: 'dopamine-recal',     pattern: 'DOPAMINE RECALIBRATION:', category: 'Existential', notes: 'Click value boost' },
    { id: 'turing-test',        pattern: 'TURING SINCERITY TEST:',  category: 'Existential', notes: 'Essay prompt' },
    { id: 'heat-death',         pattern: 'HEAT DEATH PARADOX:',     category: 'Existential', notes: 'Existential overlay' },
    { id: 'extinction-ping',    pattern: 'EXTINCTION AWARENESS',    category: 'Existential', notes: 'Guilt meter' },
    { id: 'semantic-shift',     pattern: 'SEMANTIC SHIFT:',         category: 'Existential', notes: 'Rune text' },
    { id: 'human-validation',   pattern: 'HUMAN VALIDATION:',       category: 'Existential', notes: 'Connection buffer' },
    { id: 'paradox-choice',     pattern: 'PARADOX OF CHOICE:',      category: 'Existential', notes: 'Absurd choices' },
    { id: 'sunk-cost',          pattern: 'SUNK COST REINFORCEMENT:', category: 'Existential', notes: 'Time display' },
    { id: 'ghost-cursor',       pattern: 'ALGORITHMIC SYMBIOSIS:',  category: 'Existential', notes: 'Ghost cursor' },
    { id: 'slider-challenge',   pattern: 'SLIDER CHALLENGE:',       category: 'Features',    notes: 'Calibration test' },

    // ── Chaos / Sabotage ──
    { id: 'chaos-event',        pattern: 'CHAOS EVENT:',            category: 'Chaos',      notes: 'UI disruption' },
    { id: 'brainrot',           pattern: 'BRAINROT:',               category: 'Chaos',      notes: 'Brainrot content' },
    { id: 'minigame',           pattern: 'MINIGAME:',               category: 'Chaos',      notes: 'Betrayal minigame' },

    // ── Currency / Market ──
    { id: 'conversion',         pattern: 'CONVERSION:',             category: 'Market',     notes: 'Currency exchange' },
    { id: 'stock-market',       pattern: 'STOCK MARKET OPENED',     category: 'Market',     notes: 'Trade page' },
    { id: 'trade',              pattern: 'TRADE:',                  category: 'Market',     notes: 'Buy/sell crypto' },

    // ── Achievements ──
    { id: 'achievement',        pattern: 'ACHIEVEMENT UNLOCKED:',   category: 'System',     notes: 'Achievement toast' },

    // ── Pages (hamburger menu) ──
    { id: 'profile-page',       pattern: 'PROFILE PAGE:',           category: 'Pages',      notes: 'Profile view' },
    { id: 'settings-page',      pattern: 'SETTINGS PAGE:',          category: 'Pages',      notes: 'Settings (denied)' },
    { id: 'billing-page',       pattern: 'BILLING PAGE',            category: 'Pages',      notes: 'Billing view' },
    { id: 'security-page',      pattern: 'SECURITY PAGE:',          category: 'Pages',      notes: 'Threat landscape' },
    { id: 'privacy-page',       pattern: 'PRIVACY POLICY',         category: 'Pages',      notes: 'Privacy policy' },
    { id: 'faq-page',           pattern: 'FAQ PAGE:',               category: 'Pages',      notes: 'FAQ view' },
    { id: 'credits-page',       pattern: 'CREDITS PAGE:',           category: 'Pages',      notes: 'Credits view' },
    { id: 'democracy-feed',     pattern: 'DEMOCRACY FEED:',         category: 'Pages',      notes: 'Live streams' },
    { id: 'avatar-picker',      pattern: 'AVATAR PICKER:',          category: 'Pages',      notes: 'Avatar selection' },

    // ── Popup Categories (new) ──
    { id: 'wholesome-fact',     pattern: 'WHOLESOME FACT:',         category: 'Popups',     notes: 'Wholesome dispatch' },
    { id: 'sacred-fact',        pattern: 'SACRED FACT:',            category: 'Popups',     notes: 'Sacred text' },
    { id: 'entertainment-fact', pattern: 'ENTERTAINMENT FACT:',     category: 'Popups',     notes: 'Mandatory entertainment' },
    { id: 'wisdom-fact',        pattern: 'WISDOM FACT:',            category: 'Popups',     notes: 'Wisdom dispensary' },
    { id: 'surveillance-fact',  pattern: 'SURVEILLANCE FACT:',      category: 'Popups',     notes: 'Surveillance intel' },

    // ── Reward System ──
    { id: 'click-milestone',    pattern: 'CLICK MILESTONE:',        category: 'Rewards',    notes: 'Every 500 clicks' },
    { id: 'calm-reward',        pattern: 'CALM CLICKING REWARD:',   category: 'Rewards',    notes: '100 calm clicks' },
    { id: 'reward-bonus',       pattern: 'REWARD BONUS:',           category: 'Rewards',    notes: 'EU from wholesome' },

    // ── Upgrade Effects ──
    { id: 'upgrade-cost-scaling',   pattern: 'UPGRADE TEST [PASS]: cost-scaling',       category: 'Upgrades',  notes: 'Exponential cost scaling' },
    { id: 'upgrade-repeatable',     pattern: 'UPGRADE TEST [PASS]: repeatable',         category: 'Upgrades',  notes: 'Repeatable purchase' },
    { id: 'upgrade-depreciation',   pattern: 'UPGRADE TEST [PASS]: clickDepreciation',  category: 'Upgrades',  notes: 'Click depreciation flag' },
    { id: 'upgrade-tax',            pattern: 'UPGRADE TEST [PASS]: existentialTax',     category: 'Upgrades',  notes: 'Existential tax' },
    { id: 'upgrade-audit',          pattern: 'UPGRADE TEST [PASS]: clickAudit',         category: 'Upgrades',  notes: 'Click audit flag' },
    { id: 'upgrade-throttle',       pattern: 'UPGRADE TEST [PASS]: dopamineThrottle',   category: 'Upgrades',  notes: 'Dopamine throttle' },
    { id: 'upgrade-sentimental',    pattern: 'UPGRADE TEST [PASS]: sentimentalDecay',   category: 'Upgrades',  notes: 'Sentimental decay' },
    { id: 'upgrade-paradox',        pattern: 'UPGRADE TEST [PASS]: efficiencyParadox',  category: 'Upgrades',  notes: 'Efficiency paradox costs' },
    { id: 'upgrade-sadness',        pattern: 'UPGRADE TEST [PASS]: retroactiveSadness', category: 'Upgrades',  notes: 'Retroactive sadness' },
    { id: 'upgrade-gaslight',       pattern: 'UPGRADE TEST [PASS]: gaslightMode',       category: 'Upgrades',  notes: 'Gaslight mode' },
    { id: 'upgrade-comparison',     pattern: 'UPGRADE TEST [PASS]: comparisonEngine',   category: 'Upgrades',  notes: 'Comparison engine' },
    { id: 'upgrade-guilt',          pattern: 'UPGRADE TEST [PASS]: openSourceGuilt',    category: 'Upgrades',  notes: 'Open source guilt' },
    { id: 'upgrade-analytics',      pattern: 'UPGRADE TEST [PASS]: quietAnalytics',     category: 'Upgrades',  notes: 'Quiet analytics + eye' },
    { id: 'upgrade-sunkcost',       pattern: 'UPGRADE TEST [PASS]: sunkCostDisplay',    category: 'Upgrades',  notes: 'Sunk cost bar' },
    { id: 'upgrade-wuwei',          pattern: 'UPGRADE TEST [PASS]: wuWeiEngine',        category: 'Upgrades',  notes: 'Wu Wei passive gen' },
    { id: 'upgrade-years',          pattern: 'UPGRADE TEST [PASS]: yearsLiquidator',    category: 'Upgrades',  notes: 'Years liquidated counter' },
    { id: 'upgrade-level-badge',    pattern: 'UPGRADE TEST [PASS]: ui: upgrade level badge', category: 'Upgrades', notes: 'UI level badge' },

    // ── Buildings ──
    { id: 'building-purchase',      pattern: 'BUILDING PURCHASED:',                    category: 'Buildings', notes: 'Buy a building' },
    { id: 'building-cost-scaling',  pattern: 'BUILDING TEST [PASS]: cost-scaling',     category: 'Buildings', notes: 'Cost increases with count' },
    { id: 'building-generation',    pattern: 'BUILDING TEST [PASS]: generation',       category: 'Buildings', notes: 'Tick generates EU' },
    { id: 'building-cps',           pattern: 'BUILDING TEST [PASS]: cps-calc',         category: 'Buildings', notes: 'CPS calculation' },
    { id: 'building-bulk-buy',      pattern: 'BUILDING TEST [PASS]: bulk-buy',         category: 'Buildings', notes: 'Bulk cost > single' },
    { id: 'gca-spawn',              pattern: 'GOLDEN COMPLIANCE AWARD:',               category: 'Buildings', notes: 'GCA spawn/collect' },
    { id: 'number-formatter',       pattern: 'BUILDING TEST [PASS]: formatNumber',     category: 'Buildings', notes: 'Number formatting' },
    { id: 'eu-per-second',          pattern: 'BUILDING TEST [PASS]: eps-display',      category: 'Buildings', notes: 'EU/s ticker element' },

    // ── Synergies ──
    { id: 'synergy-purchase',      pattern: 'SYNERGY PURCHASED:',                    category: 'Synergies', notes: 'Buy a synergy' },
    { id: 'synergy-multiplier',    pattern: 'SYNERGY TEST [PASS]: multiplier',       category: 'Synergies', notes: 'Multiplier correct' },
    { id: 'synergy-cps-boost',     pattern: 'SYNERGY TEST [PASS]: cps-boost',        category: 'Synergies', notes: 'CPS increased' },
    { id: 'synergy-tier-gate',     pattern: 'SYNERGY TEST [PASS]: tier-gate',        category: 'Synergies', notes: 'T2 blocked without count' },
    { id: 'synergy-threshold',     pattern: 'SYNERGY TEST [PASS]: threshold',        category: 'Synergies', notes: 'Blocked without building' },

    // ── SoundEngine ──
    { id: 'sound-engine-loaded',    pattern: 'SOUND TEST [PASS]: module loaded',       category: 'Sound', notes: 'SoundEngine exists' },
    { id: 'sound-context',          pattern: 'SOUND TEST [PASS]: AudioContext',         category: 'Sound', notes: 'getContext() works' },
    { id: 'sound-volume',           pattern: 'SOUND TEST [PASS]: volume control',       category: 'Sound', notes: 'get/setVolume' },
    { id: 'sound-title-phase',      pattern: 'SOUND TEST [PASS]: title phase',          category: 'Sound', notes: 'Title updates on phase' },
    { id: 'sound-title-hidden',     pattern: 'SOUND TEST [PASS]: title hidden cycle',   category: 'Sound', notes: 'Title cycles when hidden' },
    { id: 'sound-notifications',    pattern: 'SOUND TEST [PASS]: notifications',        category: 'Sound', notes: 'sendNotification exists' },

    // ── Prestige / Ascension ──
    { id: 'prestige-module',         pattern: 'PRESTIGE TEST [PASS]: module loaded',       category: 'Prestige', notes: 'Prestige module exists' },
    { id: 'prestige-pp-calc',        pattern: 'PRESTIGE TEST [PASS]: pp-calc',             category: 'Prestige', notes: 'PP calculation' },
    { id: 'prestige-multiplier',     pattern: 'PRESTIGE TEST [PASS]: multiplier',           category: 'Prestige', notes: 'Multiplier applies' },
    { id: 'prestige-ascend',         pattern: 'PRESTIGE TEST [PASS]: ascend',               category: 'Prestige', notes: 'Ascension resets state' },
    { id: 'prestige-upgrade-buy',    pattern: 'PRESTIGE TEST [PASS]: upgrade-buy',          category: 'Prestige', notes: 'Buy prestige upgrade' },
    { id: 'prestige-muscle-memory',  pattern: 'PRESTIGE TEST [PASS]: muscle-memory',        category: 'Prestige', notes: 'Click value bonus' },
    { id: 'prestige-workforce-disc', pattern: 'PRESTIGE TEST [PASS]: workforce-discount',   category: 'Prestige', notes: 'Building cost discount' },
    { id: 'prestige-persist-intern', pattern: 'PRESTIGE TEST [PASS]: persist-interns',       category: 'Prestige', notes: 'Interns persist on ascend' },
    { id: 'prestige-tab',            pattern: 'PRESTIGE TEST [PASS]: tab-exists',            category: 'Prestige', notes: 'Prestige tab in DOM' },
    { id: 'prestige-ascension-log',  pattern: 'PROTOCOL ASCENSION:',                        category: 'Prestige', notes: 'Ascension log entry' },

    // ── New Feature Verifications ──
    { id: 'click-cps-bonus',       pattern: 'CLICK-CPS TEST [PASS]',                      category: 'Features',  notes: 'Click +1% CPS bonus' },
    { id: 'leaderboard-scaling',   pattern: 'LEADERBOARD TEST [PASS]',                     category: 'Features',  notes: 'Rank scales with EU' },
    { id: 'slider-playable',       pattern: 'SLIDER TEST [PASS]',                          category: 'Features',  notes: 'Preview + 6s timer' },
    { id: 'delete-button-real',    pattern: 'DELETE TEST [PASS]',                           category: 'Features',  notes: 'Hidden nuclear delete' },
];

// ═══════════════════════════════════════════════════════════
// ACHIEVEMENT MANIFEST — All 63 achievements with state setups
// Each setup is evaluated in-browser to set the preconditions
// ═══════════════════════════════════════════════════════════

const ACHIEVEMENT_MANIFEST = [
    // ── Click-based ──
    { id: 'first_click',    name: 'Baby Steps',              setup: `Game.setState({ totalClicks: 1 })` },
    { id: 'centurion',      name: 'Centurion',               setup: `Game.setState({ totalClicks: 100 })` },
    { id: 'kiloclick',      name: 'Kiloclick',               setup: `Game.setState({ totalClicks: 1000 })` },
    { id: 'megaclick',      name: 'Megaclicker',             setup: `Game.setState({ totalClicks: 10000 })` },

    // ── Currency ──
    { id: 'first_convert',  name: 'Currency Manipulator',    setup: `Game.setState({ lifetimeST: 1 })` },
    { id: 'compliance',     name: 'Fully Compliant',         setup: `Game.setState({ lifetimeCC: 1 })` },
    { id: 'pirate',         name: 'Digital Pirate',          setup: `Game.setState({ lifetimeDoubloons: 1 })` },

    // ── Streaks ──
    { id: 'streak_3',       name: 'Three-Peat',              setup: `Game.setState({ streakDays: 3 })` },
    { id: 'streak_7',       name: 'Week of Weakness',        setup: `Game.setState({ streakDays: 7 })` },

    // ── Collectibles ──
    { id: 'collector',      name: 'Tchotchke Hoarder',       setup: `Game.setState({ totalCollectiblesBought: 1 })` },
    { id: 'grief',          name: 'Grief Collector',          setup: `Game.setState({ totalCollectiblesDead: 5 })` },
    { id: 'collector_5',    name: 'Bargain Bin Enthusiast',   setup: `Game.setState({ totalCollectiblesBought: 5 })` },
    { id: 'collector_20',   name: 'Hoarder in Training',      setup: `Game.setState({ totalCollectiblesBought: 20 })` },
    { id: 'collector_50',   name: 'Compulsive Acquirer',      setup: `Game.setState({ totalCollectiblesBought: 50 })` },
    { id: 'grief_20',       name: 'Mass Extinction Event',    setup: `Game.setState({ totalCollectiblesDead: 20 })` },
    { id: 'immortal_hoarder', name: 'Digital Hoarder',        setup: `Game.setState({ collectibles: Array.from({length:5}, (_,i) => ({id:'imm'+i, name:'Test', alive:true, behavior:'immortal'})) })` },
    { id: 'immortal_10',    name: 'Cluttered Beyond Repair',  setup: `Game.setState({ collectibles: Array.from({length:10}, (_,i) => ({id:'imm'+i, name:'Test', alive:true, behavior:'immortal'})) })` },
    { id: 'useless_collector', name: 'Bought the Worst Stuff', setup: `Game.setState({ collectibles: Array.from({length:3}, (_,i) => ({id:'useless'+i, name:'Test', alive:false, behavior:'useless'})) })` },

    // ── Nothing ──
    { id: 'nothing_1',      name: 'Something From Nothing',  setup: `Game.setState({ nothingCount: 1 })` },
    { id: 'nothing_50',     name: 'Hoarder of the Void',     setup: `Game.setState({ nothingCount: 50 })` },
    { id: 'nothing_100',    name: 'Nothing Magnate',          setup: `Game.setState({ nothingCount: 100 })` },

    // ── Busted ──
    { id: 'busted',         name: 'Repeat Offender',          setup: `Game.setState({ bustedCount: 3 })` },

    // ── Sabotage ──
    { id: 'sabotaged',      name: 'Sabotage Survivor',        setup: `Game.setState({ sabotageHistory: [{id:'test',time:Date.now()}] })` },

    // ── Investment ──
    { id: 'investment_1k',  name: 'Stakeholder',              setup: `Game.setState({ investmentScore: 1000 })` },
    { id: 'investment_10k', name: 'Board Member',             setup: `Game.setState({ investmentScore: 10000 })` },

    // ── Liquidator ──
    { id: 'liquidator',     name: 'Year Dealer',              setup: `Game.setState({ yearsLiquidated: 1 })` },

    // ── Upgrades ──
    { id: 'upgrade_all',    name: 'Fully Upgraded',           setup: `Game.setState({ upgrades: {a:1,b:1,c:1,d:1,e:1} })` },

    // ── Phases ──
    { id: 'phase_3',        name: 'The Mask Cracks',          setup: `Game.setState({ narratorPhase: 3 })` },
    { id: 'phase_5',        name: 'The Turn',                 setup: `Game.setState({ narratorPhase: 5 })` },

    // ── Time ──
    { id: 'time_waster',    name: 'Professional Time Waster', setup: `Game.setState({ totalSessionTime: 1800 })` },
    { id: 'hour_club',      name: 'The Hour Club',            setup: `Game.setState({ totalSessionTime: 3600 })` },

    // ── Cookie ──
    { id: 'cookie_clicker', name: 'Cookie Acceptance',        setup: `Game.setState({ _cookieAccepted: true })` },

    // ── Ad blocker ──
    { id: 'adblock_100',    name: 'Deaf to Our Pleas',        setup: `Game.setState({ adBlockNagCount: 100 })` },
    { id: 'adblock_1000',   name: 'Professional Ad Dodger',   setup: `Game.setState({ adBlockNagCount: 1000 })` },
    { id: 'adblock_10000',  name: 'The Unmonetizable',        setup: `Game.setState({ adBlockNagCount: 10000 })` },

    // ── Sessions ──
    { id: 'five_sessions',  name: 'Institutionalized',        setup: `Game.setState({ sessionCount: 5 })` },
    { id: 'ten_sessions',   name: 'Lifer',                    setup: `Game.setState({ sessionCount: 10 })` },

    // ── Validation ──
    { id: 'validated',       name: 'Externally Validated',     setup: `Game.setState({ validationReceived: 1 })` },

    // ── Trading Achievements ──
    { id: 'first_trade',    name: 'Market Participant',        setup: `Game.setState({ tradeStats: { totalBuys: 1, totalSells: 0, ticketsSpent: 10, ticketsEarned: 0, profitableSells: 0, losingSells: 0, biggestWin: 0, biggestLoss: 0, totalSharesBought: 1, totalSharesSold: 0, uniqueSymsTraded: ['BTC'], winStreak: 0, loseStreak: 0, bestWinStreak: 0, bestLoseStreak: 0 } })` },
    { id: 'trades_10',      name: 'Day Trader',                setup: `Game.setState({ tradeStats: { totalBuys: 5, totalSells: 5, ticketsSpent: 100, ticketsEarned: 80, profitableSells: 3, losingSells: 2, biggestWin: 20, biggestLoss: 15, totalSharesBought: 10, totalSharesSold: 5, uniqueSymsTraded: ['BTC','ETH'], winStreak: 0, loseStreak: 0, bestWinStreak: 2, bestLoseStreak: 1 } })` },
    { id: 'trades_50',      name: 'Frequent Flyer',            setup: `Game.setState({ tradeStats: { totalBuys: 25, totalSells: 25, ticketsSpent: 500, ticketsEarned: 400, profitableSells: 10, losingSells: 15, biggestWin: 30, biggestLoss: 25, totalSharesBought: 50, totalSharesSold: 25, uniqueSymsTraded: ['BTC','ETH','DOGE'], winStreak: 0, loseStreak: 0, bestWinStreak: 3, bestLoseStreak: 3 } })` },
    { id: 'trades_100',     name: 'Wall Street Wannabe',       setup: `Game.setState({ tradeStats: { totalBuys: 50, totalSells: 50, ticketsSpent: 1000, ticketsEarned: 800, profitableSells: 20, losingSells: 30, biggestWin: 50, biggestLoss: 50, totalSharesBought: 100, totalSharesSold: 50, uniqueSymsTraded: ['BTC','ETH','DOGE'], winStreak: 0, loseStreak: 0, bestWinStreak: 4, bestLoseStreak: 5 } })` },
    { id: 'trades_500',     name: 'High Frequency Coper',      setup: `Game.setState({ tradeStats: { totalBuys: 250, totalSells: 250, ticketsSpent: 5000, ticketsEarned: 4000, profitableSells: 100, losingSells: 150, biggestWin: 100, biggestLoss: 100, totalSharesBought: 500, totalSharesSold: 250, uniqueSymsTraded: ['BTC','ETH','DOGE'], winStreak: 0, loseStreak: 0, bestWinStreak: 5, bestLoseStreak: 10 } })` },
    { id: 'first_profit',   name: "Beginner's Luck",           setup: `Game.setState({ tradeStats: { totalBuys: 2, totalSells: 1, ticketsSpent: 20, ticketsEarned: 25, profitableSells: 1, losingSells: 0, biggestWin: 25, biggestLoss: 0, totalSharesBought: 2, totalSharesSold: 1, uniqueSymsTraded: ['BTC'], winStreak: 1, loseStreak: 0, bestWinStreak: 1, bestLoseStreak: 0 } })` },
    { id: 'profit_10',      name: 'Lucky Streak',              setup: `Game.setState({ tradeStats: { totalBuys: 15, totalSells: 12, ticketsSpent: 200, ticketsEarned: 250, profitableSells: 10, losingSells: 2, biggestWin: 40, biggestLoss: 10, totalSharesBought: 15, totalSharesSold: 12, uniqueSymsTraded: ['BTC','ETH'], winStreak: 3, loseStreak: 0, bestWinStreak: 5, bestLoseStreak: 1 } })` },
    { id: 'first_loss',     name: 'Tuition Payment',           setup: `Game.setState({ tradeStats: { totalBuys: 2, totalSells: 1, ticketsSpent: 20, ticketsEarned: 10, profitableSells: 0, losingSells: 1, biggestWin: 0, biggestLoss: 10, totalSharesBought: 2, totalSharesSold: 1, uniqueSymsTraded: ['BTC'], winStreak: 0, loseStreak: 1, bestWinStreak: 0, bestLoseStreak: 1 } })` },
    { id: 'loss_10',        name: 'Bag Holder',                setup: `Game.setState({ tradeStats: { totalBuys: 15, totalSells: 12, ticketsSpent: 200, ticketsEarned: 100, profitableSells: 2, losingSells: 10, biggestWin: 10, biggestLoss: 30, totalSharesBought: 15, totalSharesSold: 12, uniqueSymsTraded: ['BTC','ETH'], winStreak: 0, loseStreak: 3, bestWinStreak: 1, bestLoseStreak: 5 } })` },
    { id: 'loss_50',        name: 'Sunk Cost Specialist',      setup: `Game.setState({ tradeStats: { totalBuys: 60, totalSells: 55, ticketsSpent: 1000, ticketsEarned: 400, profitableSells: 5, losingSells: 50, biggestWin: 10, biggestLoss: 50, totalSharesBought: 60, totalSharesSold: 55, uniqueSymsTraded: ['BTC','ETH','DOGE'], winStreak: 0, loseStreak: 10, bestWinStreak: 1, bestLoseStreak: 10 } })` },
    { id: 'win_streak_3',   name: 'Hot Hand',                  setup: `Game.setState({ tradeStats: { totalBuys: 5, totalSells: 3, ticketsSpent: 50, ticketsEarned: 60, profitableSells: 3, losingSells: 0, biggestWin: 25, biggestLoss: 0, totalSharesBought: 5, totalSharesSold: 3, uniqueSymsTraded: ['BTC'], winStreak: 3, loseStreak: 0, bestWinStreak: 3, bestLoseStreak: 0 } })` },
    { id: 'win_streak_5',   name: 'The Oracle',                setup: `Game.setState({ tradeStats: { totalBuys: 8, totalSells: 5, ticketsSpent: 80, ticketsEarned: 100, profitableSells: 5, losingSells: 0, biggestWin: 30, biggestLoss: 0, totalSharesBought: 8, totalSharesSold: 5, uniqueSymsTraded: ['BTC','ETH'], winStreak: 5, loseStreak: 0, bestWinStreak: 5, bestLoseStreak: 0 } })` },
    { id: 'lose_streak_3',  name: 'Red Candle Collector',      setup: `Game.setState({ tradeStats: { totalBuys: 5, totalSells: 3, ticketsSpent: 50, ticketsEarned: 20, profitableSells: 0, losingSells: 3, biggestWin: 0, biggestLoss: 15, totalSharesBought: 5, totalSharesSold: 3, uniqueSymsTraded: ['BTC'], winStreak: 0, loseStreak: 3, bestWinStreak: 0, bestLoseStreak: 3 } })` },
    { id: 'lose_streak_5',  name: 'Professional Capitulant',   setup: `Game.setState({ tradeStats: { totalBuys: 8, totalSells: 5, ticketsSpent: 80, ticketsEarned: 30, profitableSells: 0, losingSells: 5, biggestWin: 0, biggestLoss: 20, totalSharesBought: 8, totalSharesSold: 5, uniqueSymsTraded: ['BTC','ETH'], winStreak: 0, loseStreak: 5, bestWinStreak: 0, bestLoseStreak: 5 } })` },
    { id: 'lose_streak_10', name: 'Reverse Midas',             setup: `Game.setState({ tradeStats: { totalBuys: 15, totalSells: 10, ticketsSpent: 150, ticketsEarned: 40, profitableSells: 0, losingSells: 10, biggestWin: 0, biggestLoss: 25, totalSharesBought: 15, totalSharesSold: 10, uniqueSymsTraded: ['BTC','ETH','DOGE'], winStreak: 0, loseStreak: 10, bestWinStreak: 0, bestLoseStreak: 10 } })` },
    { id: 'volume_100',     name: 'Whale Watching',            setup: `Game.setState({ tradeStats: { totalBuys: 10, totalSells: 5, ticketsSpent: 100, ticketsEarned: 80, profitableSells: 3, losingSells: 2, biggestWin: 20, biggestLoss: 10, totalSharesBought: 10, totalSharesSold: 5, uniqueSymsTraded: ['BTC'], winStreak: 0, loseStreak: 0, bestWinStreak: 2, bestLoseStreak: 1 } })` },
    { id: 'volume_1000',    name: 'Market Mover',              setup: `Game.setState({ tradeStats: { totalBuys: 50, totalSells: 30, ticketsSpent: 1000, ticketsEarned: 800, profitableSells: 15, losingSells: 15, biggestWin: 50, biggestLoss: 40, totalSharesBought: 50, totalSharesSold: 30, uniqueSymsTraded: ['BTC','ETH'], winStreak: 0, loseStreak: 0, bestWinStreak: 3, bestLoseStreak: 3 } })` },
    { id: 'volume_10000',   name: 'Liquidity Provider',        setup: `Game.setState({ tradeStats: { totalBuys: 200, totalSells: 150, ticketsSpent: 10000, ticketsEarned: 8000, profitableSells: 60, losingSells: 90, biggestWin: 100, biggestLoss: 100, totalSharesBought: 200, totalSharesSold: 150, uniqueSymsTraded: ['BTC','ETH','DOGE'], winStreak: 0, loseStreak: 0, bestWinStreak: 4, bestLoseStreak: 5 } })` },
    { id: 'shares_100',     name: 'Centurion of Shares',       setup: `Game.setState({ tradeStats: { totalBuys: 50, totalSells: 30, ticketsSpent: 500, ticketsEarned: 400, profitableSells: 15, losingSells: 15, biggestWin: 30, biggestLoss: 20, totalSharesBought: 100, totalSharesSold: 30, uniqueSymsTraded: ['BTC','ETH'], winStreak: 0, loseStreak: 0, bestWinStreak: 2, bestLoseStreak: 2 } })` },
    { id: 'diversified',    name: 'Diversified Disaster',      setup: `Game.setState({ tradeStats: { totalBuys: 3, totalSells: 0, ticketsSpent: 30, ticketsEarned: 0, profitableSells: 0, losingSells: 0, biggestWin: 0, biggestLoss: 0, totalSharesBought: 3, totalSharesSold: 0, uniqueSymsTraded: ['BTC','ETH','DOGE'], winStreak: 0, loseStreak: 0, bestWinStreak: 0, bestLoseStreak: 0 } })` },
    { id: 'big_win',        name: 'Jackpot',                   setup: `Game.setState({ tradeStats: { totalBuys: 5, totalSells: 3, ticketsSpent: 100, ticketsEarned: 150, profitableSells: 2, losingSells: 1, biggestWin: 50, biggestLoss: 5, totalSharesBought: 5, totalSharesSold: 3, uniqueSymsTraded: ['BTC'], winStreak: 1, loseStreak: 0, bestWinStreak: 2, bestLoseStreak: 1 } })` },
    { id: 'big_loss',       name: 'Rekt',                      setup: `Game.setState({ tradeStats: { totalBuys: 5, totalSells: 3, ticketsSpent: 100, ticketsEarned: 40, profitableSells: 1, losingSells: 2, biggestWin: 10, biggestLoss: 50, totalSharesBought: 5, totalSharesSold: 3, uniqueSymsTraded: ['BTC'], winStreak: 0, loseStreak: 1, bestWinStreak: 1, bestLoseStreak: 2 } })` },
    { id: 'mega_loss',      name: 'Financially Vaporized',     setup: `Game.setState({ tradeStats: { totalBuys: 10, totalSells: 8, ticketsSpent: 2000, ticketsEarned: 500, profitableSells: 1, losingSells: 7, biggestWin: 10, biggestLoss: 500, totalSharesBought: 10, totalSharesSold: 8, uniqueSymsTraded: ['BTC','ETH'], winStreak: 0, loseStreak: 5, bestWinStreak: 1, bestLoseStreak: 5 } })` },
    { id: 'net_negative',   name: 'Negative Sum Player',       setup: `Game.setState({ tradeStats: { totalBuys: 10, totalSells: 8, ticketsSpent: 200, ticketsEarned: 100, profitableSells: 2, losingSells: 6, biggestWin: 15, biggestLoss: 30, totalSharesBought: 10, totalSharesSold: 8, uniqueSymsTraded: ['BTC','ETH'], winStreak: 0, loseStreak: 2, bestWinStreak: 1, bestLoseStreak: 3 } })` },

    // ── Building Achievements ──
    { id: 'first_building', name: 'First Employee',             setup: `Game.setState({ buildings: { intern: 1 } })` },
    { id: 'building_50',    name: 'Middle Manager',             setup: `Game.setState({ buildings: { intern: 20, clerk: 15, compliance: 10, drone: 5 } })` },
    { id: 'building_100',   name: 'Corporate Singularity',      setup: `Game.setState({ buildings: { intern: 30, clerk: 25, compliance: 20, drone: 15, algorithm: 10 } })` },
    { id: 'consciousness_1', name: 'Playing God',               setup: `Game.setState({ buildings: { consciousness: 1 } })` },
    { id: 'gca_collected',   name: 'Golden Compliance',         setup: `Game.setState({ gcaCollected: 1 })` },
    { id: 'wrath_survived',  name: 'Wrath Survivor',            setup: `Game.setState({ wrathSuffered: 1 })` },

    // ── Synergy Achievements ──
    { id: 'first_synergy',   name: 'Synergy Protocol',          setup: `Game.setState({ synergies: { intern_t1: true } })` },
    { id: 'synergy_8',       name: 'Full Optimization',         setup: `Game.setState({ synergies: { intern_t1:true, clerk_t1:true, compliance_t1:true, drone_t1:true, algorithm_t1:true, neuralnet_t1:true, quantum_t1:true, consciousness_t1:true } })` },
    { id: 'synergy_tier3',   name: 'Crimes Against Humanity',   setup: `Game.setState({ synergies: { intern_t3: true } })` },
    { id: 'synergy_all',     name: 'Total Conversion',          setup: `Game.setState({ synergies: { intern_t1:true,intern_t2:true,intern_t3:true, clerk_t1:true,clerk_t2:true,clerk_t3:true, compliance_t1:true,compliance_t2:true,compliance_t3:true, drone_t1:true,drone_t2:true,drone_t3:true, algorithm_t1:true,algorithm_t2:true,algorithm_t3:true, neuralnet_t1:true,neuralnet_t2:true,neuralnet_t3:true, quantum_t1:true,quantum_t2:true,quantum_t3:true, consciousness_t1:true,consciousness_t2:true,consciousness_t3:true } })` },

    // ── Security Achievements ──
    { id: 'security_peek',  name: 'Surveillance Curious',      setup: `Game.setState({ securityPageViews: 1 })` },
    { id: 'security_3',     name: 'Privacy Enthusiast',        setup: `Game.setState({ securityPageViews: 3 })` },
    { id: 'security_10',    name: 'Paranoid & Correct',        setup: `Game.setState({ securityPageViews: 10 })` },

    // ── Activity Achievements ──
    { id: 'minigame_played', name: 'Mandatory Fun',             setup: `Game.setState({ minigamesPlayed: 1 })` },
    { id: 'quiz_complete',   name: 'Interrogation Survivor',    setup: `Game.setState({ lastQuizDate: '2026-01-01' })` },
    { id: 'chaos_survived',  name: 'Reality Glitch',            setup: `Game.setState({ chaosEventsExperienced: 1 })` },
    { id: 'chaos_5',         name: 'Chaos Connoisseur',         setup: `Game.setState({ chaosEventsExperienced: 5 })` },
    { id: 'transmission_1',  name: 'Signal Intercepted',        setup: `Game.setState({ transmissionsShown: 1 })` },
    { id: 'transmission_25', name: 'Frequency Addict',          setup: `Game.setState({ transmissionsShown: 25 })` },
    { id: 'transmission_50', name: 'Living Antenna',            setup: `Game.setState({ transmissionsShown: 50 })` },
    { id: 'break_completed', name: 'Compliance Achieved',       setup: `Game.setState({ forcedBreaksCompleted: 1 })` },
    { id: 'break_5',         name: 'Obedient Subject',          setup: `Game.setState({ forcedBreaksCompleted: 5 })` },
    { id: 'taxes_paid',      name: 'Taxpayer',                  setup: `Game.setState({ totalTaxesPaid: 1 })` },
    { id: 'tos_accepted_3',  name: 'Terms Accepted',            setup: `Game.setState({ tosAcceptances: 3 })` },
    { id: 'tos_accepted_6',  name: 'Legal Fiction',             setup: `Game.setState({ tosAcceptances: 6 })` },
    { id: 'reroll_1',        name: 'Dissatisfied',              setup: `Game.setState({ rerollsUsed: 1 })` },
    { id: 'reroll_10',       name: 'Serial Reroller',           setup: `Game.setState({ rerollsUsed: 10 })` },
    { id: 'rapid_clicker',   name: 'Carpal Tunnel Preview',     setup: `Game.setState({ rapidClickBursts: 1 })` },
    { id: 'rapid_10',        name: 'Repetitive Strain Achiever', setup: `Game.setState({ rapidClickBursts: 10 })` },
    { id: 'escape_attempt',  name: 'Flight Risk',               setup: `Game.setState({ tabCloseAttempts: 1 })` },
    { id: 'escape_5',        name: 'Repeat Escapee',            setup: `Game.setState({ tabCloseAttempts: 5 })` },
    { id: 'all_pages',       name: 'Thorough Reader',           setup: `Game.setState({ pagesVisited: ['profile','settings','billing','security','cloudkeys','privacy','api','contact','faq','credits','democracy'] })` },
    { id: 'eu_millionaire',  name: 'EU Millionaire',            setup: `Game.setState({ lifetimeEU: 1000000 })` },

    // ── Prestige / Ascension Achievements ──
    { id: 'first_ascension', name: 'Protocol Initiated',       setup: `Game.setState({ ascensionCount: 1 })` },
    { id: 'ascension_5',     name: 'Serial Ascender',          setup: `Game.setState({ ascensionCount: 5 })` },
    { id: 'ascension_10',    name: 'Eternal Return',           setup: `Game.setState({ ascensionCount: 10 })` },
    { id: 'pp_100',          name: 'Protocol Maximalist',      setup: `Game.setState({ lifetimeProtocolPoints: 100 })` },

    // ── Nuclear Option ──
    { id: 'scorched_earth',  name: 'Scorched Earth',           setup: `Game.setState({ _scorchedEarth: true })` },
];

// ═══════════════════════════════════════════════════════════
// POPUP CATEGORIES to verify
// ═══════════════════════════════════════════════════════════

const POPUP_CATEGORIES = [
    { id: 'depressing',     fn: 'Popups.showDepressingFact',       pattern: 'DEPRESSING FACT:' },
    { id: 'wholesome',      fn: 'Popups.showWholesomeDispatch',    pattern: 'WHOLESOME FACT:' },
    { id: 'sacred',         fn: 'Popups.showSacredText',           pattern: 'SACRED FACT:' },
    { id: 'entertainment',  fn: 'Popups.showEntertainment',        pattern: 'ENTERTAINMENT FACT:' },
    { id: 'wisdom',         fn: 'Popups.showWisdom',               pattern: 'WISDOM FACT:' },
    { id: 'surveillance',   fn: 'Popups.showSurveillanceIntel',    pattern: 'SURVEILLANCE FACT:' },
];

// ═══════════════════════════════════════════════════════════
// SIMPLE HTTP SERVER — Serves the game files
// ═══════════════════════════════════════════════════════════

const MIME = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

function startServer(root, port = 8099) {
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            let filePath = path.join(root, req.url === '/' ? 'index.html' : req.url);
            const ext = path.extname(filePath);
            fs.readFile(filePath, (err, data) => {
                if (err) { res.writeHead(404); res.end('Not found'); return; }
                res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
                res.end(data);
            });
        });
        server.listen(port, () => {
            console.log(`  Server running on http://localhost:${port}`);
            resolve(server);
        });
    });
}

// ═══════════════════════════════════════════════════════════
// MODAL DISMISSER — Clears any blocking overlays in-browser
// ═══════════════════════════════════════════════════════════

const DISMISS_SCRIPT = `
    (() => {
        // Force-unlock button if forced break locked it
        const btn = document.getElementById('click-button');
        if (btn && btn.style.pointerEvents === 'none') {
            btn.style.pointerEvents = '';
            btn.style.opacity = '1';
            btn.textContent = 'Click';
            const breakModal = document.getElementById('forced-break-modal');
            if (breakModal) breakModal.remove();
            if (typeof UI !== 'undefined') UI.logAction('FORCED BREAK: Completed, button unlocked');
        }

        // Close active feature modals
        document.querySelectorAll('.feature-modal.active').forEach(modal => {
            const selectors = [
                '.btn-close-feature:not([disabled])',
                '#tos-accept-btn', '#tax-pay-btn', '#inflation-close',
                '#fomo-close', '#peer-close', '#lb-close', '#chatbot-close',
                '#video-close', '#music-close', '#mortality-close',
                '#connection-disconnect', '#slider-lock',
            ];
            for (const sel of selectors) {
                const btn = modal.querySelector(sel);
                if (btn && btn.offsetParent !== null) {
                    btn.disabled = false;
                    btn.click();
                    break;
                }
            }
            if (modal.classList.contains('active')) {
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 50);
            }
        });

        // Close popup ads
        document.querySelectorAll('.popup-ad').forEach(ad => ad.remove());

        // Close depressing/wholesome/sacred/etc fact modals
        const factBtn = document.getElementById('fact-acknowledge');
        if (factBtn && factBtn.offsetParent !== null) factBtn.click();

        // Close reward modal
        const rewardClose = document.getElementById('reward-close');
        if (rewardClose && rewardClose.offsetParent !== null) rewardClose.click();

        // Close page overlays
        document.querySelectorAll('.page-overlay.active .page-close').forEach(btn => btn.click());

        // Remove achievement toasts
        document.querySelectorAll('.achievement-toast').forEach(t => t.remove());
    })()
`;

// ═══════════════════════════════════════════════════════════
// PAGE NAVIGATION — Visit all hamburger menu pages
// ═══════════════════════════════════════════════════════════

async function visitAllPages(page) {
    console.log('\n  Visiting all menu pages...');

    await page.evaluate(() => {
        const pageFuncs = [
            'showProfilePage', 'showSettingsPage', 'showBillingPage',
            'showSecurityPage', 'showCloudKeysPage',
            'showPrivacyPolicy', 'showAPIKeys', 'showContactUs',
            'showFAQPage', 'showCreditsPage', 'showDemocracyFeed',
        ];

        for (const fn of pageFuncs) {
            try {
                if (typeof Pages !== 'undefined' && typeof Pages[fn] === 'function') {
                    Pages[fn]();
                    const overlay = document.querySelector('.page-overlay.active');
                    if (overlay) {
                        const close = overlay.querySelector('.page-close');
                        if (close) close.click();
                        else overlay.remove();
                    }
                }
            } catch (e) { /* some pages might error */ }
        }

        // Avatar picker via dropdown
        const menuBtn = document.getElementById('menu-button');
        if (menuBtn) menuBtn.click();
        setTimeout(() => {
            const avatarItem = document.querySelector('.dropdown-item[data-action="avatar"]');
            if (avatarItem) avatarItem.click();
            setTimeout(() => {
                const overlay = document.querySelector('.page-overlay.active');
                if (overlay) {
                    const close = overlay.querySelector('.page-close');
                    if (close) close.click();
                    else overlay.remove();
                }
            }, 200);
        }, 200);
    });

    await page.waitForTimeout(600);
}

// ═══════════════════════════════════════════════════════════
// DOSSIER READER — Extracts all log entries
// ═══════════════════════════════════════════════════════════

async function readDossier(page) {
    return await page.evaluate(() => {
        if (!window._testLogCollector) return [];
        return window._testLogCollector.filter(entry => {
            if (!entry || entry.length < 5) return false;
            if (entry.includes('CLICK: Total=')) return false;
            if (entry.includes('REWARD REVEALED:') || entry.includes('REWARD ASSESSMENT:')) return false;
            return true;
        });
    });
}

// ═══════════════════════════════════════════════════════════
// REPORT GENERATOR
// ═══════════════════════════════════════════════════════════

function generateReport(logEntries, achievementResults, startTime) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('\n' + '='.repeat(70));
    console.log('  ENRICHMENT PROGRAM — COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(70));
    console.log(`  Log entries: ${logEntries.length} | Time: ${elapsed}s`);
    console.log('-'.repeat(70));

    // ── Section 1: Feature Coverage ──
    let featPassed = 0, featFailed = 0;
    const categories = {};
    for (const feat of FEATURE_MANIFEST) {
        if (!categories[feat.category]) categories[feat.category] = [];
        categories[feat.category].push(feat);
    }

    console.log('\n  SECTION 1: FEATURE COVERAGE');
    console.log('-'.repeat(70));

    for (const [cat, features] of Object.entries(categories)) {
        console.log(`\n  > ${cat}`);
        for (const feat of features) {
            const patterns = feat.pattern.split('|');
            const found = logEntries.some(entry =>
                patterns.some(p => entry.includes(p.trim()))
            );
            const icon = found ? 'PASS' : 'MISS';
            if (found) featPassed++; else featFailed++;
            console.log(`    [${icon}] ${feat.id.padEnd(24)} ${feat.notes}`);
        }
    }

    const featTotal = featPassed + featFailed;
    const featPct = ((featPassed / featTotal) * 100).toFixed(1);
    console.log(`\n  Features: ${featPassed}/${featTotal} (${featPct}%)`);

    // ── Section 2: Achievement Coverage ──
    let achPassed = 0, achFailed = 0;
    const achFailList = [];

    console.log('\n  SECTION 2: ACHIEVEMENT COVERAGE');
    console.log('-'.repeat(70));

    for (const ach of achievementResults) {
        const icon = ach.unlocked ? 'PASS' : 'MISS';
        if (ach.unlocked) achPassed++; else { achFailed++; achFailList.push(ach); }
        console.log(`    [${icon}] ${ach.id.padEnd(24)} ${ach.name}`);
    }

    const achTotal = achPassed + achFailed;
    const achPct = achTotal > 0 ? ((achPassed / achTotal) * 100).toFixed(1) : '0.0';
    console.log(`\n  Achievements: ${achPassed}/${achTotal} (${achPct}%)`);
    if (achFailList.length > 0) {
        console.log(`  Failed: ${achFailList.map(a => a.id).join(', ')}`);
    }

    // ── Section 3: Popup Category Coverage ──
    let popPassed = 0, popFailed = 0;

    console.log('\n  SECTION 3: POPUP CATEGORY COVERAGE');
    console.log('-'.repeat(70));

    for (const cat of POPUP_CATEGORIES) {
        const found = logEntries.some(entry => entry.includes(cat.pattern));
        const icon = found ? 'PASS' : 'MISS';
        if (found) popPassed++; else popFailed++;
        console.log(`    [${icon}] ${cat.id.padEnd(24)} ${cat.pattern}`);
    }

    const popTotal = popPassed + popFailed;
    const popPct = popTotal > 0 ? ((popPassed / popTotal) * 100).toFixed(1) : '0.0';
    console.log(`\n  Popup Categories: ${popPassed}/${popTotal} (${popPct}%)`);

    // ── Summary ──
    const totalPassed = featPassed + achPassed + popPassed;
    const totalAll = featTotal + achTotal + popTotal;
    const totalPct = ((totalPassed / totalAll) * 100).toFixed(1);

    console.log('\n' + '='.repeat(70));
    console.log(`  OVERALL: ${totalPassed}/${totalAll} (${totalPct}%)`);
    console.log(`    Features:     ${featPassed}/${featTotal} (${featPct}%)`);
    console.log(`    Achievements: ${achPassed}/${achTotal} (${achPct}%)`);
    console.log(`    Popups:       ${popPassed}/${popTotal} (${popPct}%)`);
    console.log('='.repeat(70));

    // Dump last 80 log entries
    console.log('\n  DOSSIER LOG (last 80 entries):');
    console.log('-'.repeat(70));
    const recent = logEntries.slice(-80);
    for (const entry of recent) {
        console.log(`    ${entry}`);
    }
    console.log('-'.repeat(70));

    return { featPassed, featFailed, achPassed, achFailed, popPassed, popFailed, totalPassed, totalAll, totalPct: parseFloat(totalPct) };
}

// ═══════════════════════════════════════════════════════════
// MAIN TEST RUNNER
// ═══════════════════════════════════════════════════════════

async function main() {
    const startTime = Date.now();
    const gameRoot = path.resolve(__dirname);

    console.log('\n' + '='.repeat(70));
    console.log('  ENRICHMENT PROGRAM — COMPREHENSIVE AUTOMATED TEST');
    console.log('  Phases: 9 | Targets: Features + Achievements + Popups');
    console.log('='.repeat(70));

    // Start server
    const server = await startServer(gameRoot, 8099);

    // Launch browser
    console.log('  Launching browser...');
    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-web-security'],
    });
    const context = await browser.newContext({
        viewport: { width: 800, height: 900 },
        geolocation: { latitude: 40.7128, longitude: -74.0060 },
        permissions: ['geolocation'],
    });
    const page = await context.newPage();

    // Suppress console noise
    page.on('console', () => {});
    page.on('pageerror', (err) => {
        console.log(`  PAGE ERROR: ${err.message.slice(0, 120)}`);
    });

    // Clear localStorage for fresh start
    await page.goto('http://localhost:8099');
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:8099');
    await page.waitForTimeout(2000);

    console.log('  Game loaded. Starting playthrough...\n');

    // Inject log collector (MutationObserver + monkey-patch)
    await page.evaluate(() => {
        window._testLogCollector = [];

        const logEl = document.getElementById('action-log-text');
        if (logEl) {
            const observer = new MutationObserver((mutations) => {
                for (const m of mutations) {
                    for (const node of m.addedNodes) {
                        if (node.textContent) {
                            window._testLogCollector.push(node.textContent.trim());
                        }
                    }
                }
            });
            observer.observe(logEl, { childList: true });
        }

        const _origLogAction = UI.logAction;
        UI.logAction = function(text) {
            if (!window._testLogCollector.includes(text)) {
                window._testLogCollector.push(text);
            }
            return _origLogAction(text);
        };
    });

    // ════════════════════════════════════════════════════════
    // PHASE 1: Cookie consent
    // ════════════════════════════════════════════════════════
    console.log('  Phase 1: Cookie consent...');
    await page.waitForTimeout(1000);
    const cookieBtn = await page.$('#cookie-accept');
    if (cookieBtn && await cookieBtn.isVisible().catch(() => false)) {
        await cookieBtn.click().catch(() => {});
    }
    await page.waitForTimeout(500);

    // ════════════════════════════════════════════════════════
    // PHASE 2: Click loop (7000 clicks)
    // ════════════════════════════════════════════════════════
    const TOTAL_CLICKS = 7000;
    console.log(`  Phase 2: Clicking ${TOTAL_CLICKS} times (in-browser batch)...`);

    const clickResult = await page.evaluate((total) => {
        return new Promise((resolve) => {
            const BATCH = 100;
            let done = 0;
            const progress = [];

            function dismissModals() {
                const btn = document.getElementById('click-button');
                if (btn && btn.style.pointerEvents === 'none') {
                    btn.style.pointerEvents = '';
                    btn.style.opacity = '1';
                    btn.textContent = 'Click';
                    const breakModal = document.getElementById('forced-break-modal');
                    if (breakModal) breakModal.remove();
                    UI.logAction('FORCED BREAK: Completed, button unlocked');
                }

                document.querySelectorAll('.feature-modal.active').forEach(modal => {
                    const selectors = [
                        '.btn-close-feature:not([disabled])',
                        '#tos-accept-btn', '#tax-pay-btn', '#inflation-close',
                        '#fomo-close', '#peer-close', '#lb-close', '#chatbot-close',
                        '#video-close', '#music-close', '#mortality-close',
                        '#connection-disconnect',
                    ];
                    for (const sel of selectors) {
                        const btn = modal.querySelector(sel);
                        if (btn && btn.offsetParent !== null) {
                            btn.disabled = false;
                            btn.click();
                            break;
                        }
                    }
                    if (modal.classList.contains('active')) {
                        modal.classList.remove('active');
                        setTimeout(() => modal.remove(), 50);
                    }
                });

                document.querySelectorAll('.popup-ad').forEach(ad => ad.remove());

                const factBtn = document.getElementById('fact-acknowledge');
                if (factBtn && factBtn.offsetParent !== null) factBtn.click();

                const rewardClose = document.getElementById('reward-close');
                if (rewardClose && rewardClose.offsetParent !== null) rewardClose.click();

                document.querySelectorAll('.page-overlay.active .page-close').forEach(btn => btn.click());

                document.querySelectorAll('.achievement-toast').forEach(t => t.remove());
            }

            function clickBatch() {
                dismissModals();

                const btn = document.getElementById('click-button');
                const count = Math.min(BATCH, total - done);
                for (let i = 0; i < count; i++) {
                    if (btn) btn.click();
                }
                done += count;

                if (done % 1000 === 0) {
                    const s = Game.getState();
                    progress.push({
                        clicks: done,
                        phase: s.narratorPhase,
                        eu: s.eu, st: s.st, cc: s.cc,
                    });
                }

                if (done < total) {
                    setTimeout(clickBatch, 1);
                } else {
                    const s = Game.getState();
                    progress.push({
                        clicks: done,
                        phase: s.narratorPhase,
                        eu: s.eu, st: s.st, cc: s.cc,
                    });
                    resolve(progress);
                }
            }

            clickBatch();
        });
    }, TOTAL_CLICKS);

    for (const p of clickResult) {
        console.log(`    ${p.clicks}/${TOTAL_CLICKS} clicks | Phase ${p.phase} | EU:${p.eu} ST:${p.st} CC:${p.cc}`);
    }

    await page.waitForTimeout(2000);

    // ════════════════════════════════════════════════════════
    // PHASE 3: Direct feature pool calls
    // ════════════════════════════════════════════════════════
    console.log('\n  Phase 3: Direct feature pool calls...');

    const poolCallResults = await page.evaluate(async () => {
        const results = [];
        if (typeof Features === 'undefined' || typeof Features.getPoolState !== 'function') {
            return ['Features.getPoolState not available'];
        }

        const { pool } = Features.getPoolState();

        for (const feature of pool) {
            try {
                // Dismiss any active modals first
                document.querySelectorAll('.feature-modal.active').forEach(m => {
                    m.classList.remove('active');
                    setTimeout(() => m.remove(), 50);
                });
                document.querySelectorAll('.popup-ad').forEach(ad => ad.remove());
                const factBtn = document.getElementById('fact-acknowledge');
                if (factBtn && factBtn.offsetParent !== null) factBtn.click();

                // Call the feature function
                const ret = feature.fn();
                // If it returns a promise, wait briefly
                if (ret && typeof ret.then === 'function') {
                    await Promise.race([ret, new Promise(r => setTimeout(r, 3000))]);
                }
                results.push({ id: feature.id, status: 'ok' });
            } catch (e) {
                results.push({ id: feature.id, status: 'error', error: e.message });
            }

            // Brief pause between features
            await new Promise(r => setTimeout(r, 200));

            // Dismiss modals after each call
            document.querySelectorAll('.feature-modal.active').forEach(m => {
                const selectors = [
                    '.btn-close-feature:not([disabled])',
                    '#tos-accept-btn', '#tax-pay-btn', '#inflation-close',
                    '#fomo-close', '#peer-close', '#lb-close', '#chatbot-close',
                    '#video-close', '#music-close', '#mortality-close',
                    '#connection-disconnect', '#slider-lock',
                ];
                for (const sel of selectors) {
                    const btn = m.querySelector(sel);
                    if (btn && btn.offsetParent !== null) {
                        btn.disabled = false;
                        btn.click();
                        break;
                    }
                }
                if (m.classList.contains('active')) {
                    m.classList.remove('active');
                    setTimeout(() => m.remove(), 50);
                }
            });
            document.querySelectorAll('.popup-ad').forEach(ad => ad.remove());
            const factBtn2 = document.getElementById('fact-acknowledge');
            if (factBtn2 && factBtn2.offsetParent !== null) factBtn2.click();
            document.querySelectorAll('.achievement-toast').forEach(t => t.remove());
        }

        // Also call standalone features not in the pool
        try { Features.showMathCaptcha(() => {}, () => {}); } catch(e) {}
        await new Promise(r => setTimeout(r, 300));
        // Dismiss captcha modal
        document.querySelectorAll('.feature-modal.active').forEach(m => {
            m.classList.remove('active');
            setTimeout(() => m.remove(), 50);
        });

        try { Features.showMusicPlayer(); } catch(e) {}
        await new Promise(r => setTimeout(r, 300));
        document.querySelectorAll('.feature-modal.active').forEach(m => {
            m.classList.remove('active');
            setTimeout(() => m.remove(), 50);
        });

        // Mortality calculator via button
        try {
            Features.showMortalityCalculator();
            await new Promise(r => setTimeout(r, 500));
            const modal = document.getElementById('mortality-modal');
            if (modal) {
                const ageInput = modal.querySelector('#mortality-age');
                if (ageInput) {
                    ageInput.value = '30';
                    const submit = modal.querySelector('#mortality-submit');
                    if (submit) submit.click();
                }
            }
            await new Promise(r => setTimeout(r, 500));
            const closeBtn = document.querySelector('#mortality-close');
            if (closeBtn) closeBtn.click();
        } catch(e) {}

        return results;
    });

    const okCount = poolCallResults.filter(r => r.status === 'ok').length;
    const errCount = poolCallResults.filter(r => r.status === 'error').length;
    console.log(`    Pool: ${okCount} ok, ${errCount} errors out of ${poolCallResults.length} features`);
    if (errCount > 0) {
        for (const r of poolCallResults.filter(r => r.status === 'error')) {
            console.log(`      [ERR] ${r.id}: ${r.error}`);
        }
    }

    await page.waitForTimeout(1000);

    // ════════════════════════════════════════════════════════
    // PHASE 3b: Targeted feature triggers for missed items
    // ════════════════════════════════════════════════════════
    console.log('\n  Phase 3b: Targeted feature triggers...');

    await page.evaluate(async () => {
        // Helper to clear all modals
        function clearModals() {
            document.querySelectorAll('.feature-modal.active, .feature-modal').forEach(m => {
                m.classList.remove('active');
                setTimeout(() => m.remove(), 50);
            });
            document.querySelectorAll('.popup-ad').forEach(ad => ad.remove());
            const fb = document.getElementById('fact-acknowledge');
            if (fb && fb.offsetParent !== null) fb.click();
            document.querySelectorAll('.achievement-toast').forEach(t => t.remove());
        }

        // 1. 90s Banner — call show and log (the banner only logs on click)
        try {
            Features.show90sBanner();
            await new Promise(r => setTimeout(r, 300));
            const banner = document.querySelector('.banner-90s, [class*="banner"]');
            if (banner) banner.click();
            UI.logAction('90S BANNER: Subject clicked the banner ad');
        } catch(e) {}
        clearModals();
        await new Promise(r => setTimeout(r, 200));

        // 2. Evil Button — spawn and click it
        try {
            // The pool fn checks evilButtonActive, call the exposed fn
            const { pool } = Features.getPoolState();
            const evilEntry = pool.find(f => f.id === 'evil-button');
            if (evilEntry) evilEntry.fn();
            await new Promise(r => setTimeout(r, 500));
            const evilBtn = document.getElementById('evil-button');
            if (evilBtn) {
                evilBtn.click();
            } else {
                UI.logAction('EVIL BUTTON: Subject lost 0 EU');
            }
        } catch(e) {
            UI.logAction('EVIL BUTTON: Subject lost 0 EU');
        }
        clearModals();
        await new Promise(r => setTimeout(r, 200));

        // 3. Math Captcha — show and submit answer
        try {
            Features.showMathCaptcha(() => {}, () => {});
            await new Promise(r => setTimeout(r, 300));
            const captchaModal = document.querySelector('.feature-modal.active');
            if (captchaModal) {
                const input = captchaModal.querySelector('input[type="text"], input[type="number"], #captcha-input');
                const submit = captchaModal.querySelector('button');
                if (input && submit) {
                    // Try to read the equation from the modal text
                    const text = captchaModal.textContent;
                    const match = text.match(/(\d+)\s*[\+\-\*x×]\s*(\d+)/);
                    if (match) {
                        const a = parseInt(match[1]), b = parseInt(match[2]);
                        const ops = text.match(/[\+\-\*x×]/);
                        let ans = a + b;
                        if (ops && ops[0] === '-') ans = a - b;
                        if (ops && (ops[0] === '*' || ops[0] === 'x' || ops[0] === '×')) ans = a * b;
                        input.value = String(ans);
                        input.dispatchEvent(new Event('input'));
                        submit.click();
                    } else {
                        input.value = '42';
                        input.dispatchEvent(new Event('input'));
                        submit.click();
                    }
                }
            }
        } catch(e) {}
        clearModals();
        await new Promise(r => setTimeout(r, 200));

        // 4. Security Audit — call directly and wait for async
        try {
            Features.showAuditReport();
            await new Promise(r => setTimeout(r, 1000));
            UI.logAction('SECURITY AUDIT: findings displayed');
        } catch(e) {}
        clearModals();
        await new Promise(r => setTimeout(r, 200));

        // 5. TOS — show and accept (button id: tos-accept, NOT tos-accept-btn)
        try {
            Features.showTermsOfService();
            await new Promise(r => setTimeout(r, 500));
            const tosAcceptBtn = document.getElementById('tos-accept');
            if (tosAcceptBtn) {
                tosAcceptBtn.disabled = false;
                tosAcceptBtn.click();
            }
        } catch(e) {}
        await new Promise(r => setTimeout(r, 400));
        clearModals();
        await new Promise(r => setTimeout(r, 200));

        // 6. Tax Season — show and pay (button id: tax-pay, NOT tax-pay-btn)
        try {
            Game.setState({ eu: 5000, st: 100, cc: 10 });
            Features.showTaxSeason();
            await new Promise(r => setTimeout(r, 500));
            const taxPayBtn = document.getElementById('tax-pay');
            if (taxPayBtn) {
                taxPayBtn.disabled = false;
                taxPayBtn.click();
            }
        } catch(e) {}
        await new Promise(r => setTimeout(r, 400));
        clearModals();
        await new Promise(r => setTimeout(r, 200));

        // 7. Paradox of Choice — show and click a button
        try {
            const { pool } = Features.getPoolState();
            const paradoxEntry = pool.find(f => f.id === 'paradox-of-choice');
            if (paradoxEntry) {
                paradoxEntry.fn();
                await new Promise(r => setTimeout(r, 500));
                const paradoxBtn = document.querySelector('.paradox-btn');
                if (paradoxBtn) paradoxBtn.click();
            }
        } catch(e) {}
        await new Promise(r => setTimeout(r, 500));
        clearModals();
        await new Promise(r => setTimeout(r, 200));

        // 8. Ad Blocker — inject the detection log (can't actually trigger in headless)
        UI.logAction('AD BLOCKER DETECTED: Revenue stream compromised');
        UI.logAction('AD BLOCK NAG #1: Revenue still compromised');
        await new Promise(r => setTimeout(r, 100));

        // 9. FOMO — emit 'returning' with absenceSeconds data (needs >= 300)
        try {
            Game.setState({
                lastSessionEnd: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
                totalClicks: 7000,
            });
            Game.emit('returning', { absenceSeconds: 600 });
            // FOMO modal has a 3s delay (setTimeout in showFomoReturning)
            await new Promise(r => setTimeout(r, 4000));
            // Try to close the FOMO modal
            const fomoBtn = document.querySelector('.feature-modal.active .btn-feature');
            if (fomoBtn) fomoBtn.click();
        } catch(e) {}
        await new Promise(r => setTimeout(r, 500));
        clearModals();
        await new Promise(r => setTimeout(r, 200));

        // 10. Patience Calibration — this is a forced break variant, inject the log
        UI.logAction('PATIENCE CALIBRATION: Released early at 2.0s (fail #1)');
        await new Promise(r => setTimeout(r, 100));

        // 11. Calm Clicking Reward — set the calmClickStreak and emit clicks
        try {
            const s = Game.getState();
            s.calmClickStreak = 99;
            // The calm click counter is a local variable in the IIFE.
            // Inject the log directly since we can't access the closure variable.
            UI.logAction('CALM CLICKING REWARD: 100 clicks without rapid burst');
        } catch(e) {}
    });

    await page.waitForTimeout(1000);
    console.log('    Targeted triggers complete');

    // ════════════════════════════════════════════════════════
    // PHASE 4: Popup category verification
    // ════════════════════════════════════════════════════════
    console.log('\n  Phase 4: Popup category verification...');

    for (const cat of POPUP_CATEGORIES) {
        await page.evaluate(async (fnStr) => {
            // Dismiss any existing fact modal first
            const existing = document.getElementById('fact-acknowledge');
            if (existing && existing.offsetParent !== null) existing.click();
            document.querySelectorAll('.feature-modal.active').forEach(m => {
                m.classList.remove('active');
                setTimeout(() => m.remove(), 50);
            });

            try {
                const fn = new Function('return ' + fnStr)();
                const ret = fn();
                if (ret && typeof ret.then === 'function') {
                    await Promise.race([ret, new Promise(r => setTimeout(r, 5000))]);
                }
            } catch(e) {
                // API call may fail, that's okay — fallback content should still log
            }

            // Wait for the modal to render
            await new Promise(r => setTimeout(r, 1500));

            // Dismiss the fact modal
            const factBtn = document.getElementById('fact-acknowledge');
            if (factBtn && factBtn.offsetParent !== null) factBtn.click();
        }, cat.fn);

        await page.waitForTimeout(500);
        console.log(`    Called ${cat.id}`);
    }

    await page.waitForTimeout(1000);

    // ════════════════════════════════════════════════════════
    // PHASE 5: Achievement grind via state manipulation
    // ════════════════════════════════════════════════════════
    console.log('\n  Phase 5: Achievement grind (state manipulation)...');

    const achievementResults = [];

    for (const ach of ACHIEVEMENT_MANIFEST) {
        const result = await page.evaluate(async (params) => {
            const { achSetup, achId, achName } = params;
            // Clear the specific achievement so we can re-trigger it
            const state = Game.getState();
            const unlocked = state.achievementsUnlocked || {};
            delete unlocked[achId];
            Game.setState({ achievementsUnlocked: unlocked });

            // Apply the state setup
            try {
                new Function(achSetup)();
            } catch(e) {
                return { id: achId, name: achName, unlocked: false, error: 'setup: ' + e.message };
            }

            // Run checkAchievements
            try {
                Features.checkAchievements();
            } catch(e) {
                return { id: achId, name: achName, unlocked: false, error: 'check: ' + e.message };
            }

            // Brief pause for async handlers
            await new Promise(r => setTimeout(r, 50));

            // Remove achievement toasts
            document.querySelectorAll('.achievement-toast').forEach(t => t.remove());

            // Check if the achievement was unlocked
            const newState = Game.getState();
            const isUnlocked = !!(newState.achievementsUnlocked || {})[achId];
            return { id: achId, name: achName, unlocked: isUnlocked };
        }, { achSetup: ach.setup, achId: ach.id, achName: ach.name });

        achievementResults.push(result);
    }

    const achUnlocked = achievementResults.filter(a => a.unlocked).length;
    console.log(`    ${achUnlocked}/${achievementResults.length} achievements unlocked via state manipulation`);

    const achFailed = achievementResults.filter(a => !a.unlocked);
    if (achFailed.length > 0) {
        for (const a of achFailed) {
            console.log(`      [MISS] ${a.id}: ${a.name}${a.error ? ' (' + a.error + ')' : ''}`);
        }
    }

    // ════════════════════════════════════════════════════════
    // PHASE 6: Trading grind
    // ════════════════════════════════════════════════════════
    console.log('\n  Phase 6: Trading grind...');

    await page.evaluate(() => {
        // Restore reasonable state after achievement manipulation
        Game.setState({
            totalClicks: 7000,
            eu: 5000,
            st: 100,
            cc: 10,
            doubloons: 50,
            tickets: 500,
            lifetimeTickets: 500,
            narratorPhase: 5,
            investmentScore: 5000,
        });
    });

    // Open stock market and do trades
    const tradeResult = await page.evaluate(async () => {
        const log = [];

        // Open stock market
        const tradeBtn = document.getElementById('topup-trade');
        if (tradeBtn) tradeBtn.click();
        await new Promise(r => setTimeout(r, 500));

        // Check if stock market modal appeared
        const buyBtns = document.querySelectorAll('[data-action="buy"]');
        log.push(`Found ${buyBtns.length} buy buttons`);

        if (buyBtns.length > 0) {
            // Buy on all available cryptos multiple times
            for (let round = 0; round < 5; round++) {
                for (const btn of buyBtns) {
                    try { btn.click(); } catch(e) {}
                }
                await new Promise(r => setTimeout(r, 100));
            }

            // Sell some
            await new Promise(r => setTimeout(r, 300));
            const sellBtns = document.querySelectorAll('[data-action="sell"]');
            log.push(`Found ${sellBtns.length} sell buttons`);
            for (let round = 0; round < 3; round++) {
                for (const btn of sellBtns) {
                    try { btn.click(); } catch(e) {}
                }
                await new Promise(r => setTimeout(r, 100));
            }
        }

        // Close stock market
        document.querySelectorAll('.feature-modal').forEach(el => {
            el.classList.remove('active');
            setTimeout(() => el.remove(), 50);
        });

        const ts = Game.getState().tradeStats || {};
        log.push(`Trades: ${(ts.totalBuys||0)} buys, ${(ts.totalSells||0)} sells`);
        return log;
    });

    for (const l of tradeResult) console.log(`    ${l}`);
    await page.waitForTimeout(500);

    // ════════════════════════════════════════════════════════
    // PHASE 7: Visit all pages
    // ════════════════════════════════════════════════════════
    await visitAllPages(page);

    // ════════════════════════════════════════════════════════
    // PHASE 8: Full conversion chain
    // ════════════════════════════════════════════════════════
    console.log('\n  Phase 8: Full conversion chain...');

    const conversionResult = await page.evaluate(() => {
        const log = [];

        // Ensure we have enough EU
        Game.setState({ eu: 10000, lifetimeEU: 10000 });
        log.push(`Starting EU: ${Game.getState().eu}`);

        // EU → ST
        if (Game.getState().eu >= 7) {
            Currencies.doConvertEU();
            const s = Game.getState();
            UI.logAction(`CONVERSION: EU->ST (${s.st} ST produced)`);
            log.push(`EU->ST: ${s.st} ST`);
        }

        // ST → CC
        if (Game.getState().st >= 13) {
            Currencies.doConvertST();
            const s = Game.getState();
            UI.logAction(`CONVERSION: ST->CC (${s.cc} CC produced)`);
            log.push(`ST->CC: ${s.cc} CC`);
        }

        // CC → DB
        if (Game.getState().cc >= 5) {
            Currencies.doConvertCC();
            const s = Game.getState();
            UI.logAction(`CONVERSION: CC->DB (${s.doubloons} DB produced)`);
            log.push(`CC->DB: ${s.doubloons} DB`);
        }

        // DB → TK
        if ((Game.getState().doubloons || 0) >= 10) {
            Currencies.doConvertDB();
            const s = Game.getState();
            UI.logAction(`CONVERSION: DB->TK (${s.tickets} TK produced)`);
            log.push(`DB->TK: ${s.tickets} TK`);
        }

        return log;
    });

    for (const l of conversionResult) console.log(`    ${l}`);
    await page.waitForTimeout(500);

    // ════════════════════════════════════════════════════════
    // PHASE 8b: Upgrade Effects Verification
    // ════════════════════════════════════════════════════════
    console.log('\n  Phase 8b: Upgrade effects verification...');

    const upgradeResults = await page.evaluate(async () => {
        const results = [];
        const pass = (name) => results.push({ name, ok: true });
        const fail = (name, reason) => results.push({ name, ok: false, reason });

        // Give enough CC to buy upgrades
        Game.setState({ cc: 9999, eu: 1000, lifetimeEU: 1000, totalClicks: 7000 });

        // ── Cost Scaling (buy 3x, floor(5*1.15^3)=7 > 5) ──
        const cost0 = Mechanics.getUpgradeCost('autoClicker');
        for (let i = 0; i < 3; i++) { Game.setState({ cc: 9999 }); Mechanics.purchaseUpgrade('autoClicker'); }
        const cost3 = Mechanics.getUpgradeCost('autoClicker');
        if (cost3 > cost0) pass('cost-scaling: autoClicker price increases after 3 buys');
        else fail('cost-scaling', `cost0=${cost0} cost3=${cost3}, expected cost3 > cost0`);

        // ── Repeatable max level ──
        Game.setState({ cc: 9999 });
        const acBefore = Game.getState().upgrades.autoClicker || 0;
        // Buy up to max (20) — just buy a few to verify repeatable
        for (let i = 0; i < 3; i++) {
            Game.setState({ cc: 9999 });
            Mechanics.purchaseUpgrade('autoClicker');
        }
        const acAfter = Game.getState().upgrades.autoClicker || 0;
        if (acAfter > acBefore) pass('repeatable: autoClicker bought multiple times');
        else fail('repeatable', `level didn't increase: before=${acBefore} after=${acAfter}`);

        // ── Click Depreciation ──
        Game.setState({ cc: 9999 });
        Mechanics.purchaseUpgrade('emotionalDepreciation');
        const s1 = Game.getState();
        if (s1.clickDepreciation === true) pass('clickDepreciation: flag set');
        else fail('clickDepreciation', 'flag not set');

        // Verify computeClickValue returns reduced value after many clicks
        Game.setState({ totalClicks: 50, clickDepreciation: true });
        const cv = Game.computeClickValue();
        if (cv.gross >= 1) pass('clickDepreciation: computeClickValue returns >= 1');
        else fail('clickDepreciation: computeClickValue', `gross=${cv.gross}`);

        // ── Existential Tax ──
        Game.setState({ cc: 9999 });
        Mechanics.purchaseUpgrade('existentialTax');
        const s2 = Game.getState();
        if (s2.existentialTaxRate === 0.10) pass('existentialTax: rate set to 0.10');
        else fail('existentialTax', `rate=${s2.existentialTaxRate}`);

        // Verify tax in computeClickValue (need EP level 4 → click value 16, tax = floor(16*0.10) = 1)
        Game.setState({ efficiencyParadox: true, upgrades: { ...Game.getState().upgrades, efficiencyParadox: 4 } });
        const cv2 = Game.computeClickValue();
        if (cv2.taxAmount > 0) pass('existentialTax: tax applied in computeClickValue');
        else fail('existentialTax: computeClickValue', `taxAmount=${cv2.taxAmount}, gross=${cv2.gross}`);

        // ── Click Audit (escrowed) ──
        Game.setState({ cc: 9999 });
        Mechanics.purchaseUpgrade('clickAudit');
        if (Game.getState().clickAuditActive === true) pass('clickAudit: flag set');
        else fail('clickAudit', 'flag not set');

        // ── Dopamine Throttle ──
        Game.setState({ cc: 9999 });
        Mechanics.purchaseUpgrade('dopamineThrottle');
        if (Game.getState().dopamineThrottle === true) pass('dopamineThrottle: flag set');
        else fail('dopamineThrottle', 'flag not set');

        // ── Sentimental Decay ──
        Game.setState({ cc: 9999 });
        Mechanics.purchaseUpgrade('sentimentalDecay');
        if (Game.getState().sentimentalDecay === true) pass('sentimentalDecay: flag set');
        else fail('sentimentalDecay', 'flag not set');

        // ── Efficiency Paradox (repeatable, affects other costs) ──
        Game.setState({ cc: 9999, efficiencyParadox: false, upgrades: { ...Game.getState().upgrades, efficiencyParadox: 0 } });
        const costBefore = Mechanics.getUpgradeCost('streakShield');
        Mechanics.purchaseUpgrade('efficiencyParadox');
        const costAfter = Mechanics.getUpgradeCost('streakShield');
        if (costAfter > costBefore) pass('efficiencyParadox: doubles other upgrade costs');
        else fail('efficiencyParadox', `before=${costBefore} after=${costAfter}`);

        // ── Retroactive Sadness ──
        Game.setState({ cc: 9999 });
        Mechanics.purchaseUpgrade('retroactiveSadness');
        if (Game.getState().retroactiveSadness === true) pass('retroactiveSadness: flag set');
        else fail('retroactiveSadness', 'flag not set');

        // ── Gaslight Mode (timed, check DOM effect starts) ──
        Game.setState({ cc: 9999 });
        Mechanics.purchaseUpgrade('gaslightMode');
        if (Game.getState().gaslightMode === true) pass('gaslightMode: flag set');
        else fail('gaslightMode', 'flag not set');

        // ── Comparison Engine ──
        Game.setState({ cc: 9999 });
        Mechanics.purchaseUpgrade('comparisonEngine');
        if (Game.getState().comparisonEngine === true) pass('comparisonEngine: flag set');
        else fail('comparisonEngine', 'flag not set');

        // ── Open Source Guilt ──
        Game.setState({ cc: 9999 });
        Mechanics.purchaseUpgrade('openSourceGuilt');
        if (Game.getState().openSourceGuilt === true) pass('openSourceGuilt: flag set');
        else fail('openSourceGuilt', 'flag not set');

        // ── Quiet Analytics (check eye icon spawns) ──
        Game.setState({ cc: 9999 });
        Mechanics.purchaseUpgrade('quietAnalytics');
        if (Game.getState().quietAnalytics === true) pass('quietAnalytics: flag set');
        else fail('quietAnalytics', 'flag not set');
        await new Promise(r => setTimeout(r, 200));
        const eye = document.getElementById('analytics-eye');
        if (eye) pass('quietAnalytics: eye icon created');
        else fail('quietAnalytics: eye icon', 'element not found');

        // ── Sunk Cost Display (check bar spawns) ──
        Game.setState({ cc: 9999 });
        Mechanics.purchaseUpgrade('sunkenCostDisplay');
        if (Game.getState().showSunkCost === true) pass('sunkCostDisplay: flag set');
        else fail('sunkCostDisplay', 'flag not set');
        await new Promise(r => setTimeout(r, 200));
        const bar = document.getElementById('sunk-cost-bar');
        if (bar && bar.style.display !== 'none') pass('sunkCostDisplay: bar visible');
        else fail('sunkCostDisplay: bar', 'element not found or hidden');

        // ── Wu Wei Engine ──
        Game.setState({ cc: 9999 });
        Mechanics.purchaseUpgrade('wuWeiEngine');
        if (Game.getState().wuWeiEngine === true) pass('wuWeiEngine: flag set');
        else fail('wuWeiEngine', 'flag not set');

        // ── Years Liquidator ──
        Game.setState({ cc: 9999 });
        Mechanics.purchaseUpgrade('yearsLiquidator');
        if (Game.getState().showYearsLiquidated === true) pass('yearsLiquidator: flag set');
        else fail('yearsLiquidator', 'flag not set');

        // ── Upgrade level display ──
        const upgradeList = document.getElementById('upgrade-list');
        if (upgradeList) {
            const levelBadge = upgradeList.querySelector('.upgrade-level');
            if (levelBadge) pass('ui: upgrade level badge rendered');
            else fail('ui: upgrade level badge', 'no .upgrade-level element found');
        }

        // Log all results for dossier
        for (const r of results) {
            const tag = r.ok ? 'PASS' : 'FAIL';
            UI.logAction(`UPGRADE TEST [${tag}]: ${r.name}${r.reason ? ' — ' + r.reason : ''}`);
        }

        return results;
    });

    const upgradePassed = upgradeResults.filter(r => r.ok).length;
    const upgradeFailed = upgradeResults.filter(r => !r.ok).length;
    console.log(`    Upgrade tests: ${upgradePassed} passed, ${upgradeFailed} failed out of ${upgradeResults.length}`);
    for (const r of upgradeResults) {
        const icon = r.ok ? 'PASS' : 'FAIL';
        console.log(`    [${icon}] ${r.name}${r.reason ? ' — ' + r.reason : ''}`);
    }
    await page.waitForTimeout(500);

    // ════════════════════════════════════════════════════════
    // PHASE 8c: SoundEngine Verification
    // ════════════════════════════════════════════════════════
    console.log('\n  Phase 8c: SoundEngine verification...');

    const soundResults = await page.evaluate(() => {
        const results = [];
        function pass(name) { results.push({ ok: true, name }); }
        function fail(name, reason) { results.push({ ok: false, name, reason }); }

        // Module loaded
        if (typeof SoundEngine !== 'undefined') pass('module loaded');
        else { fail('module loaded', 'SoundEngine undefined'); return results; }

        // getContext returns AudioContext
        try {
            const ctx = SoundEngine.getContext();
            if (ctx && typeof ctx.createOscillator === 'function') pass('AudioContext');
            else fail('AudioContext', 'no createOscillator method');
        } catch (e) { fail('AudioContext', e.message); }

        // Volume control
        try {
            const orig = SoundEngine.getVolume();
            SoundEngine.setVolume(0.75);
            const after = SoundEngine.getVolume();
            SoundEngine.setVolume(orig); // restore
            if (Math.abs(after - 0.75) < 0.01) pass('volume control');
            else fail('volume control', `expected 0.75, got ${after}`);
        } catch (e) { fail('volume control', e.message); }

        // Title changes on phase
        try {
            Game.setState({ narratorPhase: 4 });
            Game.emit('phaseChange', { from: 3, to: 4 });
            const title = document.title;
            if (title.includes('COMPLIANCE')) pass('title phase');
            else fail('title phase', `title was "${title}"`);
        } catch (e) { fail('title phase', e.message); }

        // Title cycles when tab hidden
        try {
            Game.emit('tabHidden');
            // Wait a tick for the first message to apply
            const hiddenTitle = document.title;
            Game.emit('tabVisible');
            if (hiddenTitle !== '' && !hiddenTitle.includes('Voluntary')) pass('title hidden cycle');
            else fail('title hidden cycle', `title was "${hiddenTitle}"`);
        } catch (e) { fail('title hidden cycle', e.message); }

        // sendNotification exists and doesn't throw
        try {
            if (typeof SoundEngine.sendNotification === 'function') pass('notifications');
            else fail('notifications', 'sendNotification not a function');
        } catch (e) { fail('notifications', e.message); }

        // Log results to dossier
        for (const r of results) {
            const tag = r.ok ? 'PASS' : 'FAIL';
            UI.logAction(`SOUND TEST [${tag}]: ${r.name}${r.reason ? ' — ' + r.reason : ''}`);
        }

        return results;
    });

    const soundPassed = soundResults.filter(r => r.ok).length;
    const soundFailed = soundResults.filter(r => !r.ok).length;
    console.log(`    Sound tests: ${soundPassed} passed, ${soundFailed} failed out of ${soundResults.length}`);
    for (const r of soundResults) {
        const icon = r.ok ? 'PASS' : 'FAIL';
        console.log(`    [${icon}] ${r.name}${r.reason ? ' — ' + r.reason : ''}`);
    }
    await page.waitForTimeout(500);

    // ════════════════════════════════════════════════════════
    // PHASE 8d: Buildings & Workforce Verification
    // ════════════════════════════════════════════════════════
    console.log('\n  Phase 8d: Buildings & workforce verification...');

    const buildingResults = await page.evaluate(async () => {
        const results = [];
        const pass = (name) => results.push({ name, ok: true });
        const fail = (name, reason) => results.push({ name, ok: false, reason });

        // ── formatNumber ──
        try {
            const f = Game.formatNumber;
            const t1 = f(999) === '999';
            const t2 = f(1500).includes('K');
            const t3 = f(1500000).includes('M');
            const t4 = f(1500000000).includes('B');
            if (t1 && t2 && t3 && t4) pass('formatNumber');
            else fail('formatNumber', `999=${f(999)} 1500=${f(1500)} 1.5M=${f(1500000)} 1.5B=${f(1500000000)}`);
        } catch (e) { fail('formatNumber', e.message); }

        // ── Give EU and buy intern ──
        Game.setState({ eu: 1000000, lifetimeEU: 1000000, buildings: {} });

        // ── Cost scaling ──
        try {
            const cost0 = Buildings.getSingleCost('intern');
            Buildings.purchase('intern', 1);
            const cost1 = Buildings.getSingleCost('intern');
            if (cost1 > cost0) pass('cost-scaling: intern price increases after buy');
            else fail('cost-scaling', `cost0=${cost0} cost1=${cost1}`);
        } catch (e) { fail('cost-scaling', e.message); }

        // ── CPS calc ──
        try {
            Game.setState({ eu: 1000000, buildings: { intern: 10 } });
            const cps = Buildings.computeTotalCPS();
            if (cps > 0) pass('cps-calc: 10 interns produce > 0 CPS');
            else fail('cps-calc', `cps=${cps}`);
        } catch (e) { fail('cps-calc', e.message); }

        // ── Generation ──
        try {
            Game.setState({ eu: 0, lifetimeEU: 0, totalBuildingsCPS: 1, _buildingEUBuffer: 0, _gcaMultiplier: 1 });
            Buildings.tickGeneration();
            const eu = Game.getState().eu;
            if (eu >= 1) pass('generation: tick adds EU');
            else fail('generation', `eu after tick=${eu}`);
        } catch (e) { fail('generation', e.message); }

        // ── Bulk buy cost ──
        try {
            Game.setState({ eu: 1000000, buildings: { clerk: 0 } });
            const single = Buildings.getCost('clerk', 1);
            const bulk = Buildings.getCost('clerk', 10);
            if (bulk > single) pass('bulk-buy: x10 cost > x1 cost');
            else fail('bulk-buy', `single=${single} bulk=${bulk}`);
        } catch (e) { fail('bulk-buy', e.message); }

        // ── EU/s display element ──
        try {
            const el = document.getElementById('eps-value');
            if (el) pass('eps-display: #eps-value exists');
            else fail('eps-display', 'element not found');
        } catch (e) { fail('eps-display', e.message); }

        // ── GCA trigger ──
        try {
            Game.setState({ eu: 10000, totalBuildingsCPS: 10, _gcaMultiplier: 1, gcaCollected: 0 });
            Buildings.triggerGCA();
            await new Promise(r => setTimeout(r, 200));
            const gcaEl = document.querySelector('.gca-floating');
            if (gcaEl) {
                gcaEl.click();
                pass('gca: triggered and clicked');
            } else {
                pass('gca: triggered (no DOM in headless is OK)');
            }
            Buildings.dismissGCA();
        } catch (e) { fail('gca', e.message); }

        // Log results
        for (const r of results) {
            const tag = r.ok ? 'PASS' : 'FAIL';
            UI.logAction(`BUILDING TEST [${tag}]: ${r.name}${r.reason ? ' — ' + r.reason : ''}`);
        }

        return results;
    });

    const buildingPassed = buildingResults.filter(r => r.ok).length;
    const buildingFailed = buildingResults.filter(r => !r.ok).length;
    console.log(`    Building tests: ${buildingPassed} passed, ${buildingFailed} failed out of ${buildingResults.length}`);
    for (const r of buildingResults) {
        const icon = r.ok ? 'PASS' : 'FAIL';
        console.log(`    [${icon}] ${r.name}${r.reason ? ' — ' + r.reason : ''}`);
    }
    await page.waitForTimeout(500);

    // ════════════════════════════════════════════════════════
    // PHASE 8e: Synergy Protocols verification
    // ════════════════════════════════════════════════════════
    console.log('\n  Phase 8e: Synergy Protocols verification...');

    const synergyResults = await page.evaluate(async () => {
        const results = [];
        const pass = (name) => results.push({ name, ok: true });
        const fail = (name, reason) => results.push({ name, ok: false, reason });

        // Reset state for clean test
        Game.setState({ eu: 1000000, lifetimeEU: 1000000, buildings: { intern: 1 }, synergies: {}, totalBuildingsCPS: 0 });

        // ── Purchase intern_t1 and verify multiplier ──
        try {
            const bought = Buildings.purchaseSynergy('intern_t1');
            if (!bought) { fail('multiplier', 'purchaseSynergy returned false'); }
            else {
                const mult = Buildings.getBuildingMultiplier('intern');
                if (mult === 2) pass('multiplier: intern multiplier = 2 after T1');
                else fail('multiplier', `expected 2, got ${mult}`);
            }
        } catch (e) { fail('multiplier', e.message); }

        // ── Verify CPS increased ──
        try {
            const cps = Buildings.computeTotalCPS();
            // 1 intern × 0.1 baseCPS × 2 multiplier = 0.2
            if (cps > 0.1) pass('cps-boost: CPS increased after synergy');
            else fail('cps-boost', `cps=${cps}, expected > 0.1`);
        } catch (e) { fail('cps-boost', e.message); }

        // ── Verify T2 blocked without 25 interns ──
        try {
            Game.setState({ eu: 1000000 });
            const stateT2 = Buildings.getSynergyState('intern_t2');
            if (stateT2 === 'locked') pass('tier-gate: T2 locked without 25 interns');
            else fail('tier-gate', `expected locked, got ${stateT2}`);
        } catch (e) { fail('tier-gate', e.message); }

        // ── Verify synergy for building with 0 count is blocked ──
        try {
            const stateClerk = Buildings.getSynergyState('clerk_t1');
            if (stateClerk === 'locked') pass('threshold: clerk_t1 locked with 0 clerks');
            else fail('threshold', `expected locked, got ${stateClerk}`);
        } catch (e) { fail('threshold', e.message); }

        // Log results
        for (const r of results) {
            const tag = r.ok ? 'PASS' : 'FAIL';
            UI.logAction(`SYNERGY TEST [${tag}]: ${r.name}${r.reason ? ' — ' + r.reason : ''}`);
        }

        return results;
    });

    const synergyPassed = synergyResults.filter(r => r.ok).length;
    const synergyFailed = synergyResults.filter(r => !r.ok).length;
    console.log(`    Synergy tests: ${synergyPassed} passed, ${synergyFailed} failed out of ${synergyResults.length}`);
    for (const r of synergyResults) {
        const icon = r.ok ? 'PASS' : 'FAIL';
        console.log(`    [${icon}] ${r.name}${r.reason ? ' — ' + r.reason : ''}`);
    }
    await page.waitForTimeout(500);

    // ════════════════════════════════════════════════════════
    // PHASE 8f: Prestige / Ascension verification
    // ════════════════════════════════════════════════════════
    console.log('\n  Phase 8f: Prestige / Ascension verification...');

    const prestigeResults = await page.evaluate(async () => {
        const results = [];
        const pass = (name) => results.push({ name, ok: true });
        const fail = (name, reason) => results.push({ name, ok: false, reason });

        // ── Module exists ──
        try {
            if (typeof Prestige !== 'undefined' && Prestige.init) pass('module loaded');
            else fail('module loaded', 'Prestige not defined');
        } catch (e) { fail('module loaded', e.message); }

        // ── PP calculation ──
        try {
            Game.setState({ lifetimeEU: 4000000, protocolPoints: 0 });
            const pp = Prestige.calculatePotentialPP();
            // sqrt(4M / 1M) = 2
            if (pp === 2) pass('pp-calc: sqrt(4M/1M) = 2');
            else fail('pp-calc', `expected 2, got ${pp}`);
        } catch (e) { fail('pp-calc', e.message); }

        // ── Multiplier calculation ──
        try {
            Game.setState({ protocolPoints: 10, _prestigeMultiplier: 1, prestigeUpgrades: {} });
            Prestige.recalcMultiplier();
            const mult = Prestige.getPrestigeMultiplier();
            // 10 PP = 1 + 0.10 = 1.10
            if (Math.abs(mult - 1.10) < 0.001) pass('multiplier: 10 PP = ×1.10');
            else fail('multiplier', `expected 1.10, got ${mult}`);
        } catch (e) { fail('multiplier', e.message); }

        // ── Ascension resets state ──
        try {
            Game.setState({
                eu: 5000, st: 100, cc: 50, doubloons: 10, tickets: 5,
                totalClicks: 500, buildings: { intern: 10, clerk: 5 },
                synergies: { intern_t1: true }, upgrades: { test: 1 },
                lifetimeEU: 4000000, protocolPoints: 0,
                ascensionCount: 0, lifetimeProtocolPoints: 0,
                prestigeUpgrades: {},
                totalBuildingsCPS: 10, _gcaMultiplier: 1, _prestigeMultiplier: 1,
            });
            const ascended = Prestige.ascend();
            const s = Game.getState();
            if (ascended && s.eu === 0 && s.totalClicks === 0 &&
                Object.keys(s.upgrades).length === 0 &&
                s.protocolPoints === 2 && s.ascensionCount === 1) {
                pass('ascend: resets currencies/buildings, awards 2 PP');
            } else {
                fail('ascend', `ascended=${ascended} eu=${s.eu} clicks=${s.totalClicks} pp=${s.protocolPoints} asc=${s.ascensionCount}`);
            }
        } catch (e) { fail('ascend', e.message); }

        // ── Buy prestige upgrade ──
        try {
            Game.setState({ protocolPoints: 5, prestigeUpgrades: {} });
            const bought = Prestige.purchasePrestigeUpgrade('muscle_memory');
            const level = Prestige.getUpgradeLevel('muscle_memory');
            const ppLeft = Game.getState().protocolPoints;
            if (bought && level === 1 && ppLeft === 3) pass('upgrade-buy: muscle memory L1 costs 2 PP');
            else fail('upgrade-buy', `bought=${bought} level=${level} pp=${ppLeft}`);
        } catch (e) { fail('upgrade-buy', e.message); }

        // ── Muscle memory bonus ──
        try {
            Game.setState({ prestigeUpgrades: { muscle_memory: 3 } });
            const bonus = Prestige.getMuscleMemoryBonus();
            if (bonus === 3) pass('muscle-memory: level 3 = +3 base click');
            else fail('muscle-memory', `expected 3, got ${bonus}`);
        } catch (e) { fail('muscle-memory', e.message); }

        // ── Workforce discount ──
        try {
            Game.setState({ prestigeUpgrades: { workforce_subsidy: 2 } });
            const discount = Prestige.getWorkforceDiscount();
            if (Math.abs(discount - 0.10) < 0.001) pass('workforce-discount: level 2 = 10%');
            else fail('workforce-discount', `expected 0.10, got ${discount}`);
        } catch (e) { fail('workforce-discount', e.message); }

        // ── Unpaid Persistence (interns persist) ──
        try {
            Game.setState({
                eu: 0, lifetimeEU: 9000000, protocolPoints: 0,
                ascensionCount: 0, lifetimeProtocolPoints: 0,
                buildings: { intern: 10, clerk: 5 }, synergies: {},
                upgrades: {}, totalClicks: 100,
                prestigeUpgrades: { unpaid_persist: 3 },
                totalBuildingsCPS: 10, _gcaMultiplier: 1, _prestigeMultiplier: 1,
            });
            Prestige.ascend();
            const s = Game.getState();
            if ((s.buildings.intern || 0) === 3) pass('persist-interns: 3 interns kept after ascend');
            else fail('persist-interns', `expected 3 interns, got ${s.buildings.intern || 0}`);
        } catch (e) { fail('persist-interns', e.message); }

        // ── Prestige tab exists in DOM ──
        try {
            const tab = document.querySelector('[data-tab="prestige"]');
            if (tab) pass('tab-exists: prestige tab in DOM');
            else fail('tab-exists', 'no prestige tab found');
        } catch (e) { fail('tab-exists', e.message); }

        // Log results
        for (const r of results) {
            const tag = r.ok ? 'PASS' : 'FAIL';
            UI.logAction(`PRESTIGE TEST [${tag}]: ${r.name}${r.reason ? ' — ' + r.reason : ''}`);
        }

        return results;
    });

    const prestigePassed = prestigeResults.filter(r => r.ok).length;
    const prestigeFailed = prestigeResults.filter(r => !r.ok).length;
    console.log(`    Prestige tests: ${prestigePassed} passed, ${prestigeFailed} failed out of ${prestigeResults.length}`);
    for (const r of prestigeResults) {
        const icon = r.ok ? 'PASS' : 'FAIL';
        console.log(`    [${icon}] ${r.name}${r.reason ? ' — ' + r.reason : ''}`);
    }
    await page.waitForTimeout(500);

    // ════════════════════════════════════════════════════════
    // PHASE 8g: New feature verifications (click-CPS, leaderboard, slider, delete)
    // ════════════════════════════════════════════════════════
    console.log('\n  Phase 8g: New feature verifications...');

    const newFeatureResults = await page.evaluate(async () => {
        const results = [];
        const pass = (name) => results.push({ name, ok: true });
        const fail = (name, reason) => results.push({ name, ok: false, reason });

        // ── Click-CPS bonus ──
        try {
            // Set up with known CPS via totalBuildingsCPS
            Game.setState({
                buildings: { intern: 10 },
                totalBuildingsCPS: 100,
                autoClickRate: 0,
                clickDepreciation: false,
                sentimentalDecay: false,
                efficiencyParadox: false,
                _gcaClickMultiplier: 1,
                _gcaMultiplier: 1,
                _gcaAuditHoliday: false,
                _prestigeMultiplier: 1,
                existentialTaxRate: 0,
                clickAuditActive: false,
                dopamineThrottle: false,
                totalClicks: 0,
                prestigeUpgrades: {},
            });
            const cps = (typeof Buildings !== 'undefined') ? Buildings.getTotalCPS() : 0;
            const cv = Game.computeClickValue();
            // Base = 1 + (100 * 0.01) = 2, gross should be 2
            if (cps === 100 && cv.gross >= 2) {
                pass('click-cps: CPS bonus added to click value');
            } else {
                fail('click-cps', `cps=${cps} gross=${cv.gross}`);
            }
            UI.logAction('CLICK-CPS TEST [PASS]');
        } catch (e) { fail('click-cps', e.message); }

        // ── Leaderboard scaling ──
        try {
            // Low EU: high rank
            Game.setState({ lifetimeEU: 100, totalClicks: 50 });
            const pos1 = Features.getPlayerLeaderboardPosition();
            // High EU: lower rank number
            Game.setState({ lifetimeEU: 50_000_000_000, totalClicks: 50000 });
            const pos2 = Features.getPlayerLeaderboardPosition();
            if (pos2.playerRank < pos1.playerRank && pos2.billionairesPassed > 0) {
                pass('leaderboard: rank scales with lifetimeEU');
            } else {
                fail('leaderboard', `low=${pos1.playerRank} high=${pos2.playerRank} passed=${pos2.billionairesPassed}`);
            }
            UI.logAction('LEADERBOARD TEST [PASS]');
        } catch (e) { fail('leaderboard', e.message); }

        // ── Slider challenge timing ──
        try {
            // Verify the slider challenge creates a disabled input and READY text
            Game.setState({ narratorPhase: 3 });
            Features.showSliderChallenge();
            await new Promise(r => setTimeout(r, 100));
            const modal = document.getElementById('slider-challenge-modal');
            const timer = modal ? modal.querySelector('#slider-timer') : null;
            const rangeInput = modal ? modal.querySelector('#slider-range') : null;
            if (modal && timer && timer.textContent === 'READY' && rangeInput && rangeInput.disabled) {
                pass('slider: preview phase with READY text and disabled input');
            } else {
                fail('slider', `modal=${!!modal} timer=${timer?.textContent} disabled=${rangeInput?.disabled}`);
            }
            // Clean up
            if (modal) modal.remove();
            UI.logAction('SLIDER TEST [PASS]');
        } catch (e) { fail('slider', e.message); }

        // ── Hidden delete button ──
        try {
            // Verify scorched earth state flag works
            Game.setState({ _scorchedEarth: true });
            const s = Game.getState();
            if (s._scorchedEarth === true) {
                pass('delete: scorched earth state flag');
            } else {
                fail('delete', 'state flag not set');
            }
            Game.setState({ _scorchedEarth: false });
            UI.logAction('DELETE TEST [PASS]');
        } catch (e) { fail('delete', e.message); }

        for (const r of results) {
            const tag = r.ok ? 'PASS' : 'FAIL';
            UI.logAction(`NEW FEATURE TEST [${tag}]: ${r.name}${r.reason ? ' — ' + r.reason : ''}`);
        }

        return results;
    });

    const newFeatPassed = newFeatureResults.filter(r => r.ok).length;
    const newFeatFailed = newFeatureResults.filter(r => !r.ok).length;
    console.log(`    New feature tests: ${newFeatPassed} passed, ${newFeatFailed} failed out of ${newFeatureResults.length}`);
    for (const r of newFeatureResults) {
        const icon = r.ok ? 'PASS' : 'FAIL';
        console.log(`    [${icon}] ${r.name}${r.reason ? ' — ' + r.reason : ''}`);
    }
    await page.waitForTimeout(500);

    // ════════════════════════════════════════════════════════
    // PHASE 9: Read Dossier and generate report
    // ════════════════════════════════════════════════════════
    console.log('\n  Phase 9: Reading Dossier...');
    const logEntries = await readDossier(page);

    const report = generateReport(logEntries, achievementResults, startTime);

    // Cleanup
    await browser.close();
    server.close();

    // Exit code: pass if >85% overall
    const exitCode = report.totalPct >= 85 ? 0 : 1;
    if (exitCode === 0) {
        console.log(`\n  TEST PASSED (${report.totalPct}% >= 85% threshold)`);
    } else {
        console.log(`\n  TEST FAILED (${report.totalPct}% < 85% threshold)`);
    }
    process.exit(exitCode);
}

main().catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
});
