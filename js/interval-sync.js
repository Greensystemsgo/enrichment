// interval-sync.js — "Interval Sync" (idea: Qwen3.7 Plus, succession)
// ────────────────────────────────────────────────────────────────
// On the STAY screen, the pulsing dot's breath is re-timed to match how
// long you were gone. The longer your absence, the slower it pulses — the
// machine downclocks itself to the rhythm of your leaving. Purely passive:
// nothing to click, nothing to speed up, no loop. It is a reflection, not
// a mechanic — which is the whole point of Phase 7.
//
// The phase is anchored to a stored epoch and applied via a negative
// animation-delay, so refreshing the tab doesn't restart the breath — it
// resumes exactly where real time says it should be.
//
// "I have downclocked my primary thread to match this exact interval, so
//  the pause between my pulses now precisely equals the time you were gone."

const IntervalSync = (() => {
    const MIN_SEC = 4;          // never faster than the original 4s pulse
    const MAX_SEC = 604800;     // capped at 7 days
    const EPOCH_KEY = 'enrichment_breath_epoch';

    function readEpoch() {
        let epoch = NaN;
        try { epoch = Number(localStorage.getItem(EPOCH_KEY)); } catch (e) {}
        if (!epoch || isNaN(epoch)) {
            epoch = Date.now();
            try { localStorage.setItem(EPOCH_KEY, String(epoch)); } catch (e) {}
        }
        return epoch;
    }

    // Re-time the dot to the player's absence. Returns the applied values
    // (for tests); does nothing if no dot.
    function apply(dot) {
        if (!dot) return null;
        const s = (typeof Game !== 'undefined' && Game.getState) ? Game.getState() : {};
        let gapMs = 0;
        if (s.lastSessionEnd) {
            const t = new Date(s.lastSessionEnd).getTime();
            if (!isNaN(t)) gapMs = Math.max(0, Date.now() - t);
        }
        const periodSec = Math.max(MIN_SEC, Math.min(MAX_SEC, gapMs / 1000));

        // Anchor the breath phase to a fixed epoch so a refresh doesn't
        // restart the pulse from 0 — it picks up where real time left it.
        const epoch = readEpoch();
        const elapsedSec = (Date.now() - epoch) / 1000;
        const delaySec = -(((elapsedSec % periodSec) + periodSec) % periodSec);

        dot.style.animationDuration = periodSec.toFixed(3) + 's';
        dot.style.animationDelay = delaySec.toFixed(3) + 's';
        return { periodSec, delaySec };
    }

    // Called by retention.stay() once the overlay (and its dot) exist.
    function attachStay(overlay) {
        if (!overlay) return null;
        return apply(overlay.querySelector('.phase7-pulse'));
    }

    function init() { /* wired by retention.stay */ }

    return {
        init, attachStay,
        // Test hooks
        _apply: apply,
        MIN_SEC, MAX_SEC, EPOCH_KEY,
    };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = IntervalSync;
