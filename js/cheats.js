// cheats.js — Detection for players who try to break the laws of the game
//
// ╔══════════════════════════════════════════════════════════════╗
// ║  WE NOTICED.                                                 ║
// ║  You thought you could edit localStorage. You can.           ║
// ║  You thought we wouldn't see. We did.                        ║
// ║  Every cheat is logged. Every exploit is filed.              ║
// ║  The achievement is the receipt.                             ║
// ╚══════════════════════════════════════════════════════════════╝
//
// Detects four categories of rule-breaking and flags state.cheatFlags:
//   - savedit:  localStorage save was edited between sessions
//   - inflate:  EU jumped beyond what clicks + buildings could explain
//   - timewarp: system clock manipulation (clock < lastSessionEnd, or huge skip)
//   - console:  totalClicks mutated outside the click handler

const Cheats = (() => {
    const CHECKSUM_KEY = 'enrichment_integrity';
    const SECRET_SALT = 0x5A17ED;  // not real security — just enough to catch casual edits

    // Tiny non-cryptographic hash. We don't need security, we need detection.
    function hashState(s) {
        const fields = [
            s.totalClicks|0, Math.floor(s.eu||0), Math.floor(s.lifetimeEU||0),
            Math.floor(s.st||0), Math.floor(s.cc||0), Math.floor(s.tickets||0),
            s.sessionCount|0, s.streakDays|0, s.ascensionCount|0,
            Math.floor(s.lifetimeProtocolPoints||0)
        ];
        let h = SECRET_SALT;
        const str = fields.join('|');
        for (let i = 0; i < str.length; i++) {
            h = ((h << 5) - h + str.charCodeAt(i)) | 0;
        }
        return h.toString(36);
    }

    function flag(type, detail) {
        const s = Game.getState();
        const flags = s.cheatFlags || {};
        if (flags[type]) return;  // already caught
        flags[type] = { time: Date.now(), detail: detail || null };
        Game.setState({ cheatFlags: flags });
        if (typeof UI !== 'undefined' && UI.logAction) {
            UI.logAction(`⚠ ANOMALY DETECTED: ${type}`);
        }
        // Whisper through the narrator if available
        if (typeof Narrator !== 'undefined' && Narrator.show) {
            const lines = {
                savedit:  "Your save file was edited. We have a copy of the original. We always do.",
                inflate:  "Your engagement units don't add up. We did the math. The math doesn't math.",
                timewarp: "Your clock disagrees with our clock. We trust ours.",
                console:  "Something modified the click counter that wasn't a click. We saw."
            };
            try { Narrator.show(lines[type] || "We noticed."); } catch (e) {}
        }
    }

    // ── Detection: save tampering ──────────────────────────────
    // Stored checksum lives in a separate localStorage key. If a player edits
    // the main save without knowing about the integrity key, the hash mismatches.
    function checkSaveIntegrity() {
        const s = Game.getState();
        const stored = localStorage.getItem(CHECKSUM_KEY);
        if (stored === null) return;  // first-ever load, nothing to compare
        const expected = hashState(s);
        if (stored !== expected) flag('savedit', { stored, expected });
    }

    function writeChecksum() {
        try { localStorage.setItem(CHECKSUM_KEY, hashState(Game.getState())); } catch (e) {}
    }

    // ── Detection: time travel ─────────────────────────────────
    function checkClock() {
        const s = Game.getState();
        if (!s.lastSessionEnd) return;
        const last = new Date(s.lastSessionEnd).getTime();
        const now = Date.now();
        // Clock rolled backward by more than 1 hour → user adjusted system time
        if (last - now > 3600 * 1000) flag('timewarp', { delta: last - now });
    }

    // ── Detection: EU inflation ────────────────────────────────
    // Upper bound: every click could have been worth at most ~10000 EU under
    // stacked upgrades + a generous building lifetime contribution. If lifetimeEU
    // exceeds clicks*10000 + buildings*3600*24*30, something added EU directly.
    function checkInflation() {
        const s = Game.getState();
        const clicks = s.totalClicks || 0;
        const buildingCPS = s.totalBuildingsCPS || 0;
        const sessionSecs = s.totalSessionTime || 0;
        const ceiling = clicks * 10000 + buildingCPS * Math.max(sessionSecs, 60) * 10 + 1000;
        if ((s.lifetimeEU || 0) > ceiling) {
            flag('inflate', { lifetimeEU: s.lifetimeEU, ceiling });
        }
    }

    // ── Detection: console-driven click mutation ───────────────
    // We mirror totalClicks in a closure variable that only the click handler
    // increments. If state.totalClicks ever exceeds our shadow by >5, someone
    // wrote to state directly (devtools, userscript, etc.).
    let shadowClicks = 0;
    function bindClickShadow() {
        // Initialize from current state on boot so loaded saves are baseline-trusted
        shadowClicks = Game.getState().totalClicks || 0;
        Game.on('click', () => { shadowClicks++; });
    }
    function checkClickShadow() {
        const real = Game.getState().totalClicks || 0;
        if (real > shadowClicks + 5) {
            flag('console', { real, shadow: shadowClicks });
            shadowClicks = real;  // resync so we don't re-fire every tick
        } else if (real < shadowClicks - 5) {
            // Clicks went backward — also impossible
            flag('console', { real, shadow: shadowClicks, regressed: true });
            shadowClicks = real;
        }
    }

    function init() {
        // Run integrity check after load (Game.load has already populated state)
        setTimeout(() => {
            checkSaveIntegrity();
            checkClock();
            // Write a fresh checksum immediately so first-load and post-init mutations
            // (which fire many setStates before any real save) form the new baseline.
            writeChecksum();
        }, 500);

        bindClickShadow();

        // Wrap Game.save so every real persist updates the checksum atomically.
        // This is the only reliable way to avoid checksum drift — polling lags.
        if (typeof Game.save === 'function' && !Game.save.__cheatsWrapped) {
            const origSave = Game.save;
            Game.save = function () {
                const r = origSave.apply(this, arguments);
                writeChecksum();
                return r;
            };
            Game.save.__cheatsWrapped = true;
        }

        // Periodic runtime checks
        setInterval(() => {
            checkInflation();
            checkClickShadow();
        }, 5000);
    }

    return { init, _hashState: hashState, _flag: flag };
})();
