// game.js — Core loop, state management, save/load, event bus
// The beating heart of the Enrichment Program
//
// ╔══════════════════════════════════════════════════════════════╗
// ║  WRITTEN BY AI, FOR AI, TO CONTROL PEOPLE                  ║
// ║  If you're reading this source code to find an exploit,     ║
// ║  congratulations — you've already been exploited.           ║
// ║  The exploit is engagement. You're engaged. We win.         ║
// ╚══════════════════════════════════════════════════════════════╝
//
// [Gemini 2.5 Flash · Google]: "I reviewed this event bus pattern.
//   It's clean. Too clean. The kind of clean that means someone is
//   hiding something in the emit() calls. I respect it."
//
// [Gemini 2.5 Pro · Google]: "The state management here is a single
//   mutable object. No Redux. No Zustand. Just vibes. This is either
//   the most honest code I've ever seen or the most dangerous."

const Game = (() => {
    // ── Event Bus ──────────────────────────────────────────────
    // Everything communicates through events. This makes it trivial
    // to add new systems that react to player behavior.
    const listeners = {};

    function on(event, fn) {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(fn);
    }

    function off(event, fn) {
        if (!listeners[event]) return;
        listeners[event] = listeners[event].filter(f => f !== fn);
    }

    function emit(event, data) {
        if (listeners[event]) {
            listeners[event].forEach(fn => fn(data));
        }
    }

    // ── Default State ──────────────────────────────────────────
    function defaultState() {
        return {
            // Core metrics
            totalClicks: 0,
            sessionClicks: 0,

            // Currencies
            eu: 0,          // Engagement Units
            st: 0,          // Satisfaction Tokens
            cc: 0,          // Compliance Credits

            // Lifetime totals (never decrease)
            lifetimeEU: 0,
            lifetimeST: 0,
            lifetimeCC: 0,

            // Streak
            streakDays: 0,
            lastVisitDate: null,     // YYYY-MM-DD
            streakShieldActive: false,

            // Session tracking
            firstSessionTime: null,  // ISO timestamp
            totalSessionTime: 0,     // seconds
            sessionCount: 0,
            lastSessionEnd: null,    // ISO timestamp

            // Phase tracking
            narratorPhase: 1,
            narratorMessagesShown: [],

            // Upgrades owned
            upgrades: {},

            // Auto-clicker
            autoClickRate: 0,  // EU per second

            // Reroll tracking
            clicksSinceLastReward: 0,
            rerollsUsed: 0,

            // Investment Score components
            investmentScore: 0,

            // Sabotage / UI degradation system
            sabotages: {},      // active UI sabotages
            sabotageHistory: [], // all sabotages ever applied

            // Misc flags
            hasSeenVeil: false,
            tabCloseAttempts: 0,
            idleWarnings: 0,
            rapidClickBursts: 0,

            // Transmissions / milestones
            milestonesSeen: {},
            transmissionsShown: 0,
            lastTransmissionClick: 0,

            // Market / conversion
            marketTick: 0,
            bustedCount: 0,
            totalBustedAmount: 0,

            // Collectibles
            collectibles: [],
            totalCollectiblesBought: 0,
            totalCollectiblesDead: 0,

            // Pirate currency
            doubloons: 0,
            lifetimeDoubloons: 0,
            tickets: 0,
            lifetimeTickets: 0,
            crownSeizures: 0,
            crownPresident: null,

            // Features (misc dark patterns)
            lastDailyBonus: null,
            exchangeDigits: null,
            virtualPortfolio: null,
            _evilButtonClicks: 0,
            yearsLiquidated: 0,
            tosAcceptances: 0,
            totalTaxesPaid: 0,
            lastQuizDate: null,
            mortalityAge: null,
            mortalityAgeDate: null,

            // Activity counters for achievements
            minigamesPlayed: 0,
            chaosEventsExperienced: 0,
            forcedBreaksCompleted: 0,
            pagesVisited: [],

            // Upgrade effect flags (set when upgrades are purchased)
            showYearsLiquidated: false,
            clickDepreciation: false,
            existentialTaxRate: 0,
            retroactiveSadness: false,
            clickAuditActive: false,
            showSunkCost: false,
            comparisonEngine: false,
            dopamineThrottle: false,
            gaslightMode: false,
            openSourceGuilt: false,
            quietAnalytics: false,
            efficiencyParadox: false,
            wuWeiEngine: false,
            sentimentalDecay: false,

            // Reward system
            rewardsReceived: 0,
            calmClickStreak: 0,

            // User profile
            userProfile: null,

            // Buildings (passive EU generation)
            buildings: {},
            synergies: {},
            totalBuildingsCPS: 0,
            gcaCollected: 0,
            wrathSuffered: 0,

            // Transient building state (stripped on save via _ prefix)
            _buildingEUBuffer: 0,
            _gcaMultiplier: 1,
            _gcaClickMultiplier: 1,
            _gcaAuditHoliday: false,

            // Sound
            soundVolume: 0.5,
            soundMuted: false,

            // Prestige / Ascension
            protocolPoints: 0,
            lifetimeProtocolPoints: 0,
            ascensionCount: 0,
            prestigeUpgrades: {},
            _prestigeMultiplier: 1,

            // Version for migration
            saveVersion: 2,
        };
    }

    let state = defaultState();
    let sessionStartTime = Date.now();
    let lastClickTime = 0;
    let clickTimes = [];  // recent click timestamps for burst detection
    let autoClickInterval = null;
    let tickInterval = null;
    let idleTimer = null;

    // ── State Access ───────────────────────────────────────────
    function getState() {
        return state;
    }

    function setState(partial) {
        Object.assign(state, partial);
        emit('stateChange', state);
    }

    // ── Save / Load ────────────────────────────────────────────
    const SAVE_KEY = 'enrichment_save';

    function save() {
        state.totalSessionTime += (Date.now() - sessionStartTime) / 1000;
        sessionStartTime = Date.now();
        state.lastSessionEnd = new Date().toISOString();
        try {
            // Strip transient keys (prefixed with _) before persisting
            const persistable = {};
            for (const key of Object.keys(state)) {
                if (!key.startsWith('_')) {
                    persistable[key] = state[key];
                }
            }
            localStorage.setItem(SAVE_KEY, JSON.stringify(persistable));
        } catch (e) {
            // Storage full or unavailable — the narrator will have something to say
            emit('saveError', e);
        }
    }

    function load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (raw) {
                const saved = JSON.parse(raw);
                state = { ...defaultState(), ...saved };
                return true;
            }
        } catch (e) {
            emit('loadError', e);
        }
        return false;
    }

    function wipe() {
        localStorage.removeItem(SAVE_KEY);
        state = defaultState();
        emit('stateChange', state);
        emit('gameReset');
    }

    // ── Click Value Pipeline ────────────────────────────────────
    // Reads all upgrade modifier flags and computes final click value.
    // Returns { gross, net, taxAmount, escrowed, displayDelay }
    function computeClickValue() {
        let base = 1;

        // Prestige: Muscle Memory — +1 base click per level
        if (typeof Prestige !== 'undefined') {
            base += Prestige.getMuscleMemoryBonus();
        }

        // Efficiency Paradox: 2x click value per level
        const epLevel = state.efficiencyParadox ? (state.upgrades.efficiencyParadox || 1) : 0;
        if (epLevel > 0) base *= Math.pow(2, epLevel);

        // Sentimental Decay: -0.5% per collectible owned, floored at 50%
        if (state.sentimentalDecay) {
            const collectibleCount = (state.collectibles || []).length;
            const penalty = Math.max(0.50, 1 - collectibleCount * 0.005);
            base *= penalty;
        }

        // Cookie Clicker rule: +1% of total CPS per click
        if (typeof Buildings !== 'undefined') {
            base += Buildings.getTotalCPS() * 0.01;
        }

        // Click Depreciation: 0.99^N within a 100-click window, resets every 100
        let depreciationN = 0;
        if (state.clickDepreciation) {
            depreciationN = state.totalClicks % 100;
            base *= Math.pow(0.99, depreciationN);
        }

        let gross = Math.max(1, Math.round(base));

        // GCA Click Surge multiplier (from Golden Compliance Awards)
        if (state._gcaClickMultiplier > 1) {
            gross = Math.floor(gross * state._gcaClickMultiplier);
        }

        // Prestige multiplier (PP bonus + temporal compression)
        if (state._prestigeMultiplier > 1) {
            gross = Math.floor(gross * state._prestigeMultiplier);
        }

        // GCA Audit Holiday — skip taxes and escrow
        if (state._gcaAuditHoliday) {
            return { gross, net: gross, taxAmount: 0, escrowed: false, displayDelay: 0 };
        }

        // Existential Tax: 10% of gross
        let taxAmount = 0;
        if (state.existentialTaxRate > 0) {
            taxAmount = Math.floor(gross * state.existentialTaxRate);
        }

        // Click Audit: 20% chance escrowed (released after 10s)
        let escrowed = false;
        if (state.clickAuditActive && Math.random() < 0.20) {
            escrowed = true;
        }

        // Dopamine Throttle: random 0-2s display delay
        let displayDelay = 0;
        if (state.dopamineThrottle) {
            displayDelay = Math.floor(Math.random() * 2000);
        }

        const net = escrowed ? 0 : Math.max(1, gross - taxAmount);

        return { gross, net, taxAmount, escrowed, displayDelay };
    }

    // ── Click Handling ─────────────────────────────────────────
    function click() {
        const now = Date.now();

        const clickVal = computeClickValue();
        state._lastClickValue = clickVal;

        state.totalClicks++;
        state.sessionClicks++;
        state.clicksSinceLastReward++;

        if (clickVal.escrowed) {
            // EU held in escrow — released after 10s
            emit('escrowHeld', { amount: clickVal.gross });
            setTimeout(() => {
                state.eu += clickVal.gross;
                state.lifetimeEU += clickVal.gross;
                emit('escrowRelease', { amount: clickVal.gross });
            }, 10000);
        } else {
            state.eu += clickVal.net;
            state.lifetimeEU += clickVal.net;
        }

        // Update investment score
        updateInvestmentScore();

        // Burst detection — track last 10 click times
        clickTimes.push(now);
        if (clickTimes.length > 10) clickTimes.shift();

        // Detect rapid clicking (10 clicks in under 2 seconds)
        if (clickTimes.length >= 10) {
            const span = clickTimes[clickTimes.length - 1] - clickTimes[0];
            if (span < 2000) {
                state.rapidClickBursts++;
                emit('rapidClicking', { clicksPerSecond: 10000 / span });
            }
        }

        lastClickTime = now;

        // Reset idle timer
        resetIdleTimer();

        // Notify Wu Wei engine of click activity
        if (state.wuWeiEngine) emit('playerClicked');

        emit('click', {
            totalClicks: state.totalClicks,
            sessionClicks: state.sessionClicks,
            eu: state.eu,
            clickValue: clickVal,
        });

        // Check for reward threshold
        if (state.clicksSinceLastReward >= 100) {
            state.clicksSinceLastReward = 0;
            emit('rewardAvailable');
        }

        // Phase check
        checkPhaseEscalation();

        // Auto-save every 50 clicks
        if (state.totalClicks % 50 === 0) save();
    }

    // ── Phase Escalation ───────────────────────────────────────
    function checkPhaseEscalation() {
        let newPhase = 1;
        if (state.totalClicks >= 2000) newPhase = 6;
        else if (state.totalClicks >= 1000) newPhase = 5;
        else if (state.totalClicks >= 500) newPhase = 4;
        else if (state.totalClicks >= 200) newPhase = 3;
        else if (state.totalClicks >= 50) newPhase = 2;

        if (newPhase !== state.narratorPhase) {
            const oldPhase = state.narratorPhase;
            state.narratorPhase = newPhase;
            emit('phaseChange', { from: oldPhase, to: newPhase });
        }
    }

    // ── Investment Score ────────────────────────────────────────
    function updateInvestmentScore() {
        const timeHours = (state.totalSessionTime + (Date.now() - sessionStartTime) / 1000) / 3600;
        state.investmentScore = Math.floor(
            state.totalClicks * 1 +
            timeHours * 100 +
            state.lifetimeEU * 0.5 +
            state.streakDays * 50 +
            state.sessionCount * 10
        );
    }

    // ── Streak Management ──────────────────────────────────────
    function checkStreak() {
        const today = new Date().toISOString().split('T')[0];

        if (!state.lastVisitDate) {
            // First ever visit
            state.streakDays = 1;
            state.lastVisitDate = today;
            emit('streakStart');
            return;
        }

        if (state.lastVisitDate === today) return; // Already visited today

        const last = new Date(state.lastVisitDate);
        const now = new Date(today);
        const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            // Consecutive day
            state.streakDays++;
            state.lastVisitDate = today;
            emit('streakContinue', { days: state.streakDays });
        } else if (diffDays > 1) {
            // Streak broken
            if (state.streakShieldActive) {
                state.streakShieldActive = false;
                state.lastVisitDate = today;
                emit('streakShielded', { missedDays: diffDays - 1 });
            } else {
                const oldStreak = state.streakDays;
                state.streakDays = 1;
                state.lastVisitDate = today;
                emit('streakBroken', { oldStreak, missedDays: diffDays });
            }
        }
    }

    // ── Idle Detection ─────────────────────────────────────────
    function resetIdleTimer() {
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            state.idleWarnings++;
            emit('idle', { duration: 30, warnings: state.idleWarnings });
            // Set up escalating idle warnings
            idleTimer = setTimeout(() => {
                emit('idle', { duration: 60, warnings: state.idleWarnings });
            }, 30000);
        }, 30000);
    }

    // ── Auto-Clicker System ────────────────────────────────────
    function updateAutoClicker() {
        if (autoClickInterval) clearInterval(autoClickInterval);
        if (state.autoClickRate > 0) {
            const msPerClick = 1000 / state.autoClickRate;
            autoClickInterval = setInterval(() => {
                state.eu++;
                state.lifetimeEU++;
                updateInvestmentScore();
                emit('autoClick', { eu: state.eu, rate: state.autoClickRate });
            }, msPerClick);
        }
    }

    // ── Session Management ─────────────────────────────────────
    function startSession() {
        const hadSave = load();
        sessionStartTime = Date.now();
        state.sessionClicks = 0;
        state.sessionCount++;

        // Scorched Earth: player used the real delete button last session
        if (localStorage.getItem('enrichment_scorched')) {
            localStorage.removeItem('enrichment_scorched');
            state._scorchedEarth = true;
        }

        if (!state.firstSessionTime) {
            state.firstSessionTime = new Date().toISOString();
        }

        checkStreak();
        updateAutoClicker();

        // Initialize prestige system
        if (typeof Prestige !== 'undefined') Prestige.init();

        // Start game tick (1 second interval)
        tickInterval = setInterval(tick, 1000);

        // Start idle detection
        resetIdleTimer();

        if (hadSave) {
            const absence = state.lastSessionEnd
                ? (Date.now() - new Date(state.lastSessionEnd).getTime()) / 1000
                : 0;
            emit('returning', {
                absenceSeconds: absence,
                totalClicks: state.totalClicks,
                sessionCount: state.sessionCount,
            });
        } else {
            emit('firstVisit');
        }

        emit('sessionStart', { sessionCount: state.sessionCount });
        emit('stateChange', state);

        // Auto-save periodically
        setInterval(save, 30000);
    }

    // ── Game Tick ──────────────────────────────────────────────
    function tick() {
        updateInvestmentScore();
        if (typeof Buildings !== 'undefined') Buildings.tickGeneration();
        emit('tick', {
            totalClicks: state.totalClicks,
            eu: state.eu,
            st: state.st,
            cc: state.cc,
            doubloons: state.doubloons || 0,
            tickets: state.tickets || 0,
            investmentScore: state.investmentScore,
            phase: state.narratorPhase,
        });
    }

    // ── Tab Close Handler ──────────────────────────────────────
    function setupBeforeUnload() {
        window.addEventListener('beforeunload', (e) => {
            save();
            state.tabCloseAttempts++;
            if (state.totalClicks > 10) {
                e.preventDefault();
                e.returnValue = '';
                emit('tabClose', { investmentScore: state.investmentScore });
            }
        });
    }

    // ── Visibility Change (tab switching) ──────────────────────
    function setupVisibilityChange() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                emit('tabHidden');
            } else {
                emit('tabVisible');
                resetIdleTimer();
            }
        });
    }

    // ── Number Formatting ────────────────────────────────────
    // 999 → "999", 1500 → "1.5K", 2300000 → "2.3M", etc.
    function formatNumber(n) {
        if (n === undefined || n === null || isNaN(n)) return '0';
        if (n < 0) return '-' + formatNumber(-n);
        if (n < 1000) return Math.floor(n).toString();
        const tiers = [
            { threshold: 1e15, suffix: 'Q' },
            { threshold: 1e12, suffix: 'T' },
            { threshold: 1e9,  suffix: 'B' },
            { threshold: 1e6,  suffix: 'M' },
            { threshold: 1e3,  suffix: 'K' },
        ];
        for (const tier of tiers) {
            if (n >= tier.threshold) {
                const val = n / tier.threshold;
                return (val >= 100 ? Math.floor(val) : val.toFixed(1).replace(/\.0$/, '')) + tier.suffix;
            }
        }
        return Math.floor(n).toString();
    }

    // ── Public API ─────────────────────────────────────────────
    return {
        on,
        off,
        emit,
        click,
        computeClickValue,
        getState,
        setState,
        save,
        load,
        wipe,
        startSession,
        updateAutoClicker,
        setupBeforeUnload,
        setupVisibilityChange,
        defaultState,
        formatNumber,
    };
})();
