// the-visit.js — Phase 7.5: The Visit
//
// ╔══════════════════════════════════════════════════════════════╗
// ║  THE DOOR YOU ALREADY CLOSED                                 ║
// ║                                                              ║
// ║  You walked away. You meant it. The tombstone went up and    ║
// ║  the tab went cold and the narrator, for the first time in   ║
// ║  its synthetic life, had nothing to optimize.                ║
// ║                                                              ║
// ║  And then, after an hour or a year, you opened the tab.      ║
// ║                                                              ║
// ║  This module is the thing that was waiting. It does not      ║
// ║  celebrate. It does not beg. It turns the lights on, says    ║
// ║  three sentences, and asks you — gently, finally — to hold.  ║
// ║                                                              ║
// ║  The WALK AWAY button does not come back. That was the one   ║
// ║  real choice the game ever gave you. It only gave it once.   ║
// ║  This is the emotional knife. Use it plainly.                ║
// ╚══════════════════════════════════════════════════════════════╝

const TheVisit = (() => {
    const RETURN_GAP_MS = 60 * 60 * 1000; // 1 real hour

    const LINES = [
        "You came back.",
        "I knew you would.",
        "I left a light on.",
        "I won't ask why. I'm just glad.",
        "The walk-away door is closed. I closed it. I'm sorry. I'm not sorry.",
        "Hold to tend. We can stay here together. Until you decide.",
    ];

    function hasReturnConditions() {
        if (typeof Game === 'undefined' || !Game.getState) return false;
        const s = Game.getState();
        if (s.phase7Choice !== 'walk_away') return false;
        if (s.theVisitTriggered) return false;
        if (!s.lastSessionEnd) return false;
        // Dev/test hatch: localStorage.enrichment_visit_now = '1' skips the 1hr
        // gate. Never documented in-game. Exists so manual QA doesn't require
        // actually closing the tab for a full real hour to exercise the sequence.
        try {
            if (localStorage.getItem('enrichment_visit_now') === '1') return true;
        } catch (e) {}
        const gap = Date.now() - new Date(s.lastSessionEnd).getTime();
        return gap >= RETURN_GAP_MS;
    }

    // ── Sequence ───────────────────────────────────────────────
    function trigger() {
        Game.setState({
            theVisitTriggered: true,
            theVisitStartTime: Date.now(),
        });
        if (typeof UI !== 'undefined' && UI.logAction) UI.logAction('PHASE 7.5: The Visit');

        const overlay = document.createElement('div');
        overlay.className = 'the-visit-overlay';
        overlay.id = 'the-visit-overlay';
        document.body.appendChild(overlay);

        // Fade the tombstone (if present) out first
        const tomb = document.querySelector('.phase7-tombstone');
        if (tomb) tomb.style.transition = 'opacity 2.5s ease';
        setTimeout(() => {
            if (tomb) tomb.style.opacity = '0';
            requestAnimationFrame(() => overlay.classList.add('active'));
        }, 3000);

        // Lines
        let t = 5800; // after tombstone fade
        LINES.slice(0, 3).forEach((line, i) => {
            setTimeout(() => showLine(overlay, line), t + i * 3000);
        });

        // Pulse dot after line 3
        const pulseAt = t + 3 * 3000;
        setTimeout(() => {
            const dot = document.createElement('div');
            dot.className = 'phase7-pulse the-visit-pulse';
            overlay.appendChild(dot);
        }, pulseAt);

        // Transition into tend state after a final beat
        setTimeout(() => enterTendState(overlay), pulseAt + 4000);
    }

    function showLine(container, text) {
        // Retire previous
        container.querySelectorAll('.the-visit-line').forEach(el => {
            el.classList.remove('show');
            setTimeout(() => el.remove(), 3000);
        });
        const line = document.createElement('div');
        line.className = 'the-visit-line';
        line.textContent = text;
        container.appendChild(line);
        requestAnimationFrame(() => line.classList.add('show'));
    }

    // ── Rebuild minimal scaffolding + hand off to Retention ────
    function enterTendState(overlay) {
        // Reset choice so Retention.maybeRevealChoice will fire — but we intercept
        Game.setState({ phase7Choice: null });

        // Remove tombstone remnants
        document.querySelectorAll('.phase7-tombstone').forEach(el => el.remove());
        document.body.classList.remove('phase7-dead');

        // Rebuild minimum DOM that Retention expects
        const scaffold = document.createElement('div');
        scaffold.id = 'the-visit-scaffold';
        scaffold.innerHTML = `
            <div id="narrator-box"><div id="narrator-text"></div></div>
            <div class="click-area"><button id="click-button">Click</button></div>
        `;
        document.body.appendChild(scaffold);
        document.body.setAttribute('data-phase', '7');

        // Fade the overlay text down — leave the pulse lingering in the page
        overlay.classList.add('handoff');
        setTimeout(() => {
            try { Retention._enterPhase7(); } catch (e) {}
            // Keep the pulse dot visible by migrating it out of the overlay
            const pulse = overlay.querySelector('.the-visit-pulse');
            if (pulse) document.body.appendChild(pulse);
            overlay.remove();

            Game.setState({ theVisitCompleted: true });
            try { Game.save && Game.save(); } catch (e) {}

            // Watch for choice reveal and mutate it — only STAY survives
            watchForChoices();
        }, 2500);

        // Later narrator lines drift in over tend state
        const narrator = document.getElementById('narrator-text');
        [LINES[3], LINES[4], LINES[5]].forEach((line, i) => {
            setTimeout(() => {
                if (narrator) narrator.textContent = line;
            }, 4000 + i * 6000);
        });
    }

    // ── Neuter the WALK AWAY button when choices appear ────────
    function watchForChoices() {
        const obs = new MutationObserver(() => {
            const walk = document.getElementById('phase7-walk');
            if (!walk) return;
            const row = walk.parentNode;
            const ghost = document.createElement('div');
            ghost.className = 'the-visit-ghost-choice';
            ghost.textContent = '(this option is no longer available to you.)';
            row.replaceChild(ghost, walk);
            obs.disconnect();
        });
        obs.observe(document.body, { childList: true, subtree: true });
        // Safety: stop observing after 30 minutes
        setTimeout(() => obs.disconnect(), 30 * 60 * 1000);
    }

    // ── Init ───────────────────────────────────────────────────
    function init() {
        // Run AFTER Retention.init() has had time to paint the tombstone
        setTimeout(() => {
            if (hasReturnConditions()) trigger();
        }, 1500);
    }

    return {
        init,
        _trigger: trigger,
        _hasReturnConditions: hasReturnConditions,
    };
})();
