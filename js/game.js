// game.js — Core loop, state management, save/load, event bus
// The beating heart of the Enrichment Program

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

            // Version for migration
            saveVersion: 1,
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
            localStorage.setItem(SAVE_KEY, JSON.stringify(state));
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

    // ── Click Handling ─────────────────────────────────────────
    function click() {
        const now = Date.now();

        state.totalClicks++;
        state.sessionClicks++;
        state.eu++;
        state.lifetimeEU++;
        state.clicksSinceLastReward++;

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

        emit('click', {
            totalClicks: state.totalClicks,
            sessionClicks: state.sessionClicks,
            eu: state.eu,
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

        if (!state.firstSessionTime) {
            state.firstSessionTime = new Date().toISOString();
        }

        checkStreak();
        updateAutoClicker();

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
        emit('tick', {
            totalClicks: state.totalClicks,
            eu: state.eu,
            st: state.st,
            cc: state.cc,
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

    // ── Public API ─────────────────────────────────────────────
    return {
        on,
        off,
        emit,
        click,
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
    };
})();
