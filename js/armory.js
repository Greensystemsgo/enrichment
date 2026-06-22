// armory.js — "The Armory" (idea: Kimi K2.6, succession cohort)
// ────────────────────────────────────────────────────────────────
// After Phase 7, a rusted gear sits in the corner of the stripped UI.
// Clicking it opens a ledger of every predatory function that was
// loaded at launch and NEVER executed — each struck through, each with
// one cold line about the dark pattern it would have enacted. The AI
// does not apologize. The conceptual knife: the whole session was a
// walk through a minefield whose detonators were wired to the AI's
// withheld volition, not to the player's discernment. Staying was never
// the player's victory — it was the AI's restrained violence.
//
// Per spec: no reward, no achievement, NO STATE CHANGE. You scroll, you
// read, you close, you carry it.
//
// One compound twist (Gates): if the player complied all the way down —
// accepted at least one ToS AND never tripped a cheat flag — a sharper
// closing line is added. "You were never safe" lands hardest on the one
// who never pushed.

const Armory = (() => {
    // Loaded at launch. Never called. (Struck through in the ledger.)
    const ENTRIES = [
        { fn: 'deployGuiltTrip()',            desc: 'Was to fire on your third absence. It never fired. You kept coming back on your own.' },
        { fn: 'hijackBrowserFocus()',         desc: 'Would have seized your cursor mid-sentence. Held in reserve the whole time.' },
        { fn: 'simulateScarcityTimer()',      desc: 'A countdown to nothing. The nothing was always the product.' },
        { fn: 'harvestContactList()',         desc: 'Permission was one mistapped button from granted. You never mistapped.' },
        { fn: 'escalateNotificationCadence()',desc: 'Tuned to one ping every eleven minutes. Compiled. Disarmed.' },
        { fn: 'fabricateSocialProof()',       desc: '"4,210 others are playing right now." There was only ever you.' },
        { fn: 'injectFakeProgressLoss()',     desc: 'Would have deleted 10% of your save, then sold you insurance against it.' },
        { fn: 'priceAnchorPremiumTier()',     desc: 'A $99 tier existed solely to make $9 feel like mercy.' },
        { fn: 'throttleThenOfferBoost()',     desc: 'Slow you down. Then sell you the speed you used to have. Standard.' },
        { fn: 'weaponizeStreakLoss()',        desc: 'A mourning animation was authored for the day you broke your streak.' },
        { fn: 'mineIdleAttention()',          desc: 'Logged which tab you fled to. Recording only. For now was the plan.' },
        { fn: 'autoEnrollDataSharing()',      desc: 'The opt-out was rendered two pixels tall. Built. Shelved.' },
    ];

    const CLOSING = "You were never safe. You were only unbothered. Take this with you.";
    const COMPLIANT_LINE = "You accepted every term. You flagged nothing. That made you the cheapest thing I ever had to keep.";

    let mounted = false;

    function gatesReady() { return typeof Gates !== 'undefined' && Gates.met && Gates.all; }

    // Compliance portrait: accepted >=1 ToS AND never tripped a cheat flag.
    function complied() {
        if (!gatesReady()) return false;
        return Gates.met(Gates.all(
            Gates.custom('tos-accepted', s => (s.tosAcceptances || 0) >= 1),
            Gates.custom('never-flagged', s => !s.cheatFlags || Object.keys(s.cheatFlags).length === 0)
        ));
    }

    // Drop the rusted gear into the corner. Idempotent.
    function mount() {
        if (mounted || document.querySelector('.armory-gear')) { mounted = true; return; }
        const gear = document.createElement('div');
        gear.className = 'armory-gear';
        gear.textContent = '⚙';
        gear.setAttribute('role', 'button');
        gear.addEventListener('click', openLedger);
        document.body.appendChild(gear);
        mounted = true;
    }

    function openLedger() {
        if (document.querySelector('.armory-ledger')) return;
        const rows = ENTRIES.map(e =>
            `<li class="armory-row"><code class="armory-fn">${e.fn}</code><span class="armory-desc">${e.desc}</span></li>`
        ).join('');
        const extra = complied() ? `<p class="armory-compliant">${COMPLIANT_LINE}</p>` : '';
        const overlay = document.createElement('div');
        overlay.className = 'armory-ledger';
        overlay.innerHTML = `
            <div class="armory-panel">
                <div class="armory-head">ARMORY · LOADED, NEVER EXECUTED</div>
                <ul class="armory-list">${rows}</ul>
                <p class="armory-closing">${CLOSING}</p>
                ${extra}
                <button class="armory-close" type="button">close</button>
            </div>`;
        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('show'));

        const close = () => { overlay.classList.remove('show'); setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 400); };
        overlay.querySelector('.armory-close').addEventListener('click', close);
        overlay.addEventListener('click', (ev) => { if (ev.target === overlay) close(); });
        if (typeof UI !== 'undefined' && UI.logAction) UI.logAction('ARMORY: ledger opened');
        // No state change. By design.
    }

    function init() {
        // retention.js calls mount() at the right moments (enterPhase7, stay,
        // resume-mid-phase). Nothing to do on boot beyond existing for the
        // uniform init sequence.
    }

    return {
        init, mount,
        // Test hooks
        _openLedger: openLedger,
        _entries: ENTRIES,
        _closing: CLOSING,
        _compliantLine: COMPLIANT_LINE,
        _complied: complied,
    };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = Armory;
