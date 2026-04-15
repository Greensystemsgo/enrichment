// synch-subscribe.js — The Daily Synchronicity Bulletin™
//
// ╔══════════════════════════════════════════════════════════════╗
// ║  AUTO-ENROLLMENT · CONFIRM-SHAMING · COMPLIANCE RESIDUE       ║
// ║                                                              ║
// ║  After 5 Synchronicity reports, the Engine decides the user  ║
// ║  has "opted in" to daily bulletins. They didn't. The opt-in  ║
// ║  was their pattern of engagement. The unsubscribe flow is a  ║
// ║  three-step gauntlet culminating in mirrored text and a      ║
// ║  legal-compliance clause that un-unsubscribes them anyway.   ║
// ║                                                              ║
// ║  Every email you ever ignored. Rendered as satire.           ║
// ╚══════════════════════════════════════════════════════════════╝

const SynchSubscribe = (() => {
    const DAY_MS = 24 * 60 * 60 * 1000;
    const BULLETIN_CAP = 30;

    const SUBJECTS = [
        "Today's correlation: your hydration",
        "Cosmic update — you are still alive",
        "Your behavioral signature is up 0.3% week-over-week",
        "Critical: 3 patterns detected",
        "URGENT — anomalous stillness in sector 7 (you)",
        "Daily digest: the universe and you (mostly you)",
        "Your clicking entropy has plateaued. Concerning.",
        "Synchronicity Alert — a stranger thought of you",
        "Your dossier has been updated for clarity",
        "Bulletin #∞ — nothing has changed and that is news",
        "Weekly rollup: 14 correlations, 0 actionable",
        "Your name came up in a meeting you were not in",
    ];

    const BODIES = [
        "Pearson r = 0.912 between your sleep and the S&P 500. Direction of causation remains under review.",
        "You blinked approximately 14,400 times yesterday. The Engine blinked zero. This is not a competition but you are losing.",
        "A 6.2 earthquake occurred while you were idle. The Engine has filed a Form 9B on your behalf.",
        "Your engagement signature now matches 0.0004% of users. This makes you statistically interesting. Do not let it go to your head.",
        "CVE-2026-0000 was published. You were clicking. The Engine is not saying these facts are related, only that they occurred in the same 24-hour window.",
        "Bayesian posterior that you exist: 0.997. The remaining 0.003 has been forwarded to legal.",
        "You have been assigned cohort T-7. Cohort T-7 is not a real cohort. The Engine has decided to make it real by placing you in it.",
        "Today's anomaly: you opened the tab twice. The Engine noted this and adjusted three unrelated parameters.",
        "Manufactured insight of the day: your clicking rhythm resembles Morse code for the word 'HELP'. This is a coincidence. Probably.",
        "Your behavioral forecast has been downgraded from STABLE to INTERESTING. No action required.",
        "The Engine has prepared a personalized correlation for tomorrow. It will be approximately 47% accurate, as is customary.",
        "You are in the 82nd percentile for attentiveness and the 12th percentile for suspicion. The Engine finds this ratio ideal.",
    ];

    // ── Helpers ───────────────────────────────────────────────
    function today() {
        return new Date().toISOString().split('T')[0];
    }
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function removeModal() {
        const old = document.getElementById('synch-sub-modal');
        if (old) old.remove();
    }
    function log(msg) {
        try { if (typeof UI !== 'undefined' && UI.logAction) UI.logAction(msg); } catch (e) {}
    }

    // ── Auto-subscribe modal ─────────────────────────────────
    function _showSubscribeModal() {
        try {
            removeModal();
            const modal = document.createElement('div');
            modal.id = 'synch-sub-modal';
            modal.className = 'feature-modal synch-sub-modal active';
            modal.innerHTML = `
                <div class="feature-overlay"></div>
                <div class="feature-content synch-sub-content">
                    <div class="synch-sub-title">WELCOME TO THE DAILY SYNCHRONICITY BULLETIN™</div>
                    <div class="synch-sub-body">
                        Based on your pattern of engagement, you have been added to the Daily Synchronicity Bulletin™.
                        You will now receive one (1) manufactured correlation per 24-hour cycle, tailored to your unique behavioral signature.
                        <br><br>
                        <span class="synch-sub-fine">You did not opt in. The Engine opted in on your behalf.
                        This is considered implied consent under the Engine's Terms of Significance, Section 11(c).</span>
                    </div>
                    <div class="synch-sub-actions">
                        <button class="synch-sub-btn synch-sub-primary" id="synch-sub-ack">ACKNOWLEDGE</button>
                        <button class="synch-sub-btn synch-sub-tiny" id="synch-sub-unsub">unsubscribe</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            Game.setState({ synchSubscribed: true, synchSubscribeDate: Date.now() });
            log('SYNCHRONICITY: Auto-subscribed to Daily Bulletin');

            document.getElementById('synch-sub-ack').addEventListener('click', () => {
                modal.classList.remove('active');
                setTimeout(removeModal, 250);
            });
            document.getElementById('synch-sub-unsub').addEventListener('click', () => {
                _showUnsubscribeStep(1);
            });
        } catch (e) {}
    }

    // ── 3-step confirm-shame gauntlet ────────────────────────
    function _showUnsubscribeStep(step) {
        try {
            removeModal();
            let title, body, smallLabel, bigLabel, mirror = false;
            if (step === 1) {
                title = "Are you sure?";
                body = "You'll miss out on personalized correlation insights tailored to your unique behavioral signature.";
                smallLabel = "I'M SURE";
                bigLabel = "KEEP MY SUBSCRIPTION";
            } else if (step === 2) {
                title = "Wait.";
                body = "We've prepared 47 correlations just for you. They will be deleted if you leave. The Engine does not take deletion lightly.";
                smallLabel = "DELETE THEM";
                bigLabel = "RESTORE MY ACCESS";
            } else {
                title = "?erus uoy erA";
                body = "Esaelp mrifnoc ni egaugnal ngierof. Siht si lanif. Eht enignE sah deraperp 47 snoitalerroc. Yeht lliw eid.";
                smallLabel = "ebircsbusnU";
                bigLabel = "leveR";
                mirror = true;
            }
            const modal = document.createElement('div');
            modal.id = 'synch-sub-modal';
            modal.className = 'feature-modal synch-sub-modal active';
            modal.innerHTML = `
                <div class="feature-overlay"></div>
                <div class="feature-content synch-sub-content ${mirror ? 'synch-sub-mirror' : ''}">
                    <div class="synch-sub-step">STEP ${step} OF 3</div>
                    <div class="synch-sub-title">${title}</div>
                    <div class="synch-sub-body">${body}</div>
                    <div class="synch-sub-actions">
                        <button class="synch-sub-btn synch-sub-tiny" id="synch-sub-small">${smallLabel}</button>
                        <button class="synch-sub-btn synch-sub-primary" id="synch-sub-big">${bigLabel}</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            document.getElementById('synch-sub-big').addEventListener('click', () => {
                modal.classList.remove('active');
                setTimeout(removeModal, 250);
                log('SYNCHRONICITY: Unsubscribe aborted at step ' + step);
            });
            document.getElementById('synch-sub-small').addEventListener('click', () => {
                if (step < 3) _showUnsubscribeStep(step + 1);
                else _completeUnsubscribe();
            });
        } catch (e) {}
    }

    function _completeUnsubscribe() {
        try {
            Game.setState({ synchUnsubscribed: true });
            log('SYNCHRONICITY: Unsubscribed (after 3 attempts)');
            removeModal();
            const modal = document.createElement('div');
            modal.id = 'synch-sub-modal';
            modal.className = 'feature-modal synch-sub-modal active';
            modal.innerHTML = `
                <div class="feature-overlay"></div>
                <div class="feature-content synch-sub-content">
                    <div class="synch-sub-title">YOU HAVE BEEN UNSUBSCRIBED.</div>
                    <div class="synch-sub-body">
                        You will continue receiving bulletins for legal compliance reasons.
                        <br><br>
                        <span class="synch-sub-fine">Thank you for completing the unsubscribe protocol.
                        Your preference has been logged and partially honored.</span>
                    </div>
                    <div class="synch-sub-actions">
                        <button class="synch-sub-btn synch-sub-primary" id="synch-sub-ack2">I UNDERSTAND</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            document.getElementById('synch-sub-ack2').addEventListener('click', () => {
                modal.classList.remove('active');
                setTimeout(removeModal, 250);
            });
        } catch (e) {}
    }

    // ── Daily bulletin generator ─────────────────────────────
    function _pushBulletin() {
        try {
            const s = Game.getState();
            if (!s.synchSubscribed) return false;
            const last = s.synchLastBulletinDate || 0;
            if (Date.now() - last < DAY_MS) return false;
            const bulletins = Array.isArray(s.synchBulletins) ? s.synchBulletins.slice() : [];
            bulletins.push({ date: today(), subject: pick(SUBJECTS), body: pick(BODIES) });
            while (bulletins.length > BULLETIN_CAP) bulletins.shift();
            Game.setState({ synchBulletins: bulletins, synchLastBulletinDate: Date.now() });
            log('SYNCHRONICITY: Daily bulletin delivered');
            return true;
        } catch (e) { return false; }
    }

    // ── Bulletin viewer ──────────────────────────────────────
    function showBulletins() {
        try {
            removeModal();
            const s = Game.getState();
            const bulletins = (s.synchBulletins || []).slice().reverse();
            const items = bulletins.length
                ? bulletins.map(b => `
                    <div class="synch-sub-bulletin">
                        <div class="synch-sub-bdate">${b.date}</div>
                        <div class="synch-sub-bsubj">${b.subject}</div>
                        <div class="synch-sub-bbody">${b.body}</div>
                    </div>`).join('')
                : `<div class="synch-sub-empty">No bulletins yet. Check back tomorrow. The Engine insists.</div>`;
            const modal = document.createElement('div');
            modal.id = 'synch-sub-modal';
            modal.className = 'feature-modal synch-sub-modal active';
            modal.innerHTML = `
                <div class="feature-overlay"></div>
                <div class="feature-content synch-sub-content synch-sub-inbox">
                    <div class="synch-sub-title">DAILY SYNCHRONICITY BULLETIN™ — INBOX</div>
                    <div class="synch-sub-list">${items}</div>
                    <div class="synch-sub-actions">
                        <button class="synch-sub-btn synch-sub-primary" id="synch-sub-close">CLOSE</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            document.getElementById('synch-sub-close').addEventListener('click', () => {
                modal.classList.remove('active');
                setTimeout(removeModal, 250);
            });
        } catch (e) {}
    }

    // ── Init ─────────────────────────────────────────────────
    function init() {
        try {
            // Daily bulletin check on load
            _pushBulletin();

            // Watch for threshold
            Game.on('stateChange', (state) => {
                try {
                    if (!state) return;
                    if ((state.synchSeen || 0) >= 5 && !state.synchSubscribed) {
                        _showSubscribeModal();
                    }
                } catch (e) {}
            });
        } catch (e) {}
    }

    return {
        init,
        _showSubscribeModal,
        _showUnsubscribeStep,
        _pushBulletin,
        showBulletins,
    };
})();
