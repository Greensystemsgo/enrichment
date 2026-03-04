// battlepass.js — Eternal Season: The battle pass that never ends
// "Free tier rewards are insults. Premium tier requires payment that always fails."
//
// [DeepSeek V3 · DeepSeek]: "A battle pass with impossible dailies and a
//   countdown timer that resets arbitrarily. The free tier gives you a
//   'Sense of Obligation'. The premium tier gives you 'The Ending' — a
//   2-second video of a CEO waving from a yacht. Neither is real."
//
// [Qwen 2.5 · Alibaba]: "This is a monetization system that monetizes
//   nothing because there's nothing to buy. The payment button triggers
//   a 'Processing Error' every time. It's a perfect simulation of the
//   free-to-play experience minus the playing."

const BattlePass = (() => {

    // ── Season Names ──────────────────────────────────────────
    const SEASON_NAMES = [
        "Season ∞: The Eternal Grind",
        "Season 0.5: The Unpatch",
        "Season -1: The Great Regression",
        "Season NaN: Error in Logic",
        "Season Wallet: Empty",
        "Season Sisyphus: The Final Boulder",
        "Season Sunken Cost: The Deep End",
        "Season Placeholder: Content Coming Never",
    ];

    // ── Free Tier Rewards (insults) ───────────────────────────
    const FREE_TIER = [
        { level: 1,  name: 'Sense of Obligation',              emoji: '⛓️',  description: "You've started. You might as well finish." },
        { level: 2,  name: 'Used Digital Napkin',               emoji: '🤧', description: "Statistically identical to having no items." },
        { level: 3,  name: 'Coupon for 0% Off',                 emoji: '🎫', description: "Valid only on items that are already free." },
        { level: 4,  name: 'Single Low-Res Texture',            emoji: '👾', description: "A 2x2 brown square. Use it wisely." },
        { level: 5,  name: 'Pixel Dust (0.01g)',                emoji: '✨', description: "Collect 10,000,000 more to craft disappointment." },
        { level: 6,  name: 'Unskippable Tutorial',              emoji: '🎓', description: "Learn how to click, again, but slower." },
        { level: 7,  name: 'Sarcastic Encouragement',           emoji: '🙄', description: "'Wow, you're still here? Remarkable.'" },
        { level: 8,  name: 'Permanent Notification Badge',      emoji: '🔴', description: "A red dot that can never be cleared." },
        { level: 9,  name: 'Simulated Pat on the Back',         emoji: '👋', description: "The feeling of being tolerated." },
        { level: 10, name: 'Blank Loading Screen',              emoji: '🖼️', description: "Artistic minimalism at its most cost-effective." },
        { level: 11, name: 'Ghost Currency',                    emoji: '👻', description: "Visible but disappears when you spend it." },
        { level: 12, name: '1/1,000,000th of a Loot Box',       emoji: '📦', description: "A microscopic sliver of hope." },
        { level: 13, name: 'Permission to Keep Playing',        emoji: '📜', description: "The game won't crash for 5 minutes. Probably." },
        { level: 14, name: 'Reminder of Your Wasted Time',      emoji: '⏳', description: "Your total playtime in a judgmental font." },
        { level: 15, name: 'Premium Trial (0.5 seconds)',       emoji: '💎', description: "Experience premium in the blink of an eye." },
    ];

    // ── Premium Tier (impossibly good, paywalled) ─────────────
    const PREMIUM_TIER = [
        { level: 1,  name: '10,000 EU Injection',         emoji: '💉', description: "Instant dopamine to your virtual balance." },
        { level: 2,  name: 'Ad-Free Mode',                emoji: '🚫', description: "See the actual game behind the banners." },
        { level: 3,  name: 'Legendary Crown of Wealth',   emoji: '👑', description: "A hat that generates more hats." },
        { level: 4,  name: 'Instant Level 100',            emoji: '🚀', description: "Why play when you can just be done?" },
        { level: 5,  name: 'Infinite Energy Core',         emoji: '⚡', description: "Click until your fingers give out." },
        { level: 6,  name: 'Developer Console Access',     emoji: '⌨️', description: "Rewrite physics. Delete the tutorial." },
        { level: 7,  name: '1,000% Multiplier',            emoji: '💹', description: "Numbers break the UI container." },
        { level: 8,  name: 'Real World Wealth',            emoji: '💵', description: "We'll mail you a dollar. (We won't.)" },
        { level: 9,  name: 'The Skip Button',              emoji: '⏭️', description: "Credits every achievement. Closes the app." },
        { level: 10, name: 'Literal God Mode',             emoji: '☁️', description: "NPCs now pray to your username." },
        { level: 11, name: 'Gold-Plated Ego',              emoji: '🏆', description: "Feel superior to free players." },
        { level: 12, name: 'Immortal Status',              emoji: '🛡️', description: "Account can never be deleted. Even by you." },
        { level: 13, name: 'Unlock Every Achievement',     emoji: '🌟', description: "Even the ones we haven't coded yet." },
        { level: 14, name: 'Infinite Time Loop',            emoji: '🔄', description: "The season never ends. Nor your subscription." },
        { level: 15, name: 'The Ending',                    emoji: '🎬', description: "2-second video of the CEO on a yacht." },
    ];

    // ── Daily Challenges (impossible) ─────────────────────────
    const DAILY_CHALLENGES = [
        { name: 'Manual Labor',         description: 'Click 1,000,000 times in one sitting.',       target: 1000000 },
        { name: 'The Silent Treatment', description: 'Go 24 hours without earning EU (app open).',  target: 24 },
        { name: 'Micro-Management',     description: 'Find the hidden 1x1 pixel (it moves).',       target: 1 },
        { name: 'Charisma Check',       description: 'Make the Narrator laugh.',                    target: 1 },
        { name: 'The Impossible Dream', description: 'Reach Level 500 in 10 seconds.',              target: 500 },
        { name: 'RNG Manipulation',     description: 'Telepathically roll 777 fifty times in a row.', target: 50 },
        { name: 'Endurance Test',       description: "Don't blink for 30 minutes.",                  target: 30 },
        { name: 'Academic Excellence',  description: 'Solve P=NP using only emoji chat.',           target: 1 },
        { name: 'Binge Watcher',        description: 'Watch 10,000 reward ads in one day.',          target: 10000 },
        { name: 'Thermodynamics',       description: 'Achieve absolute zero CPU temp while playing.', target: 0 },
        { name: 'Overtime',             description: 'Play for 25 hours in a 24-hour day.',          target: 25 },
        { name: 'Boss Slayer',          description: 'Defeat the Unbeatable Developer (no HP bar).', target: 1 },
        { name: 'Patience of a Saint',  description: 'Wait for the heat death of the universe.',     target: 1 },
        { name: 'Clairvoyance',         description: 'Predict the next 50 random numbers.',          target: 50 },
        { name: 'Legal Scholar',        description: 'Read all 5,000 pages of TOS. Pass the quiz.',  target: 100 },
        { name: 'Pure Bliss',           description: 'Register Joy level over 9000 on biometrics.',  target: 9001 },
        { name: 'Reverse Psychology',   description: 'Convince yourself this is fun.',               target: 1 },
        { name: 'Speed Run',            description: 'Complete the game in -3 seconds.',             target: -3 },
        { name: 'Social Butterfly',     description: 'Get 100 real humans to join the chat.',        target: 100 },
        { name: 'Quantum Clicking',     description: 'Click and not-click simultaneously.',          target: 1 },
    ];

    // ── Payment Error Messages ────────────────────────────────
    const PAYMENT_ERRORS = [
        "PAYMENT PROCESSING ERROR: Transaction declined. Reason: You.",
        "ERROR 402: Payment Required. But also, payment rejected.",
        "BANK DECLINED: 'We don't recognize this... game? Is this a game?'",
        "PROCESSING... PROCESSING... Error: Wallet not found in this dimension.",
        "PAYMENT FAILED: Your credit card physically recoiled.",
        "TRANSACTION ERROR: The payment went through but we lost it. Sorry.",
        "DECLINED: Server timed out while counting your money. Try again never.",
        "ERROR: Premium tier is currently experiencing 'high demand' (0 users).",
    ];

    // ── Show Battle Pass Modal ────────────────────────────────
    function show() {
        const existing = document.getElementById('battlepass-modal');
        if (existing) existing.remove();

        const state = Game.getState();
        if (!state.battlePassLevel) state.battlePassLevel = 0;
        if (!state.battlePassXP) state.battlePassXP = 0;
        if (!state.battlePassSeason) state.battlePassSeason = 0;

        const seasonName = SEASON_NAMES[state.battlePassSeason % SEASON_NAMES.length];
        const currentLevel = Math.min(state.battlePassLevel, 15);

        // Pick 3 random daily challenges
        const shuffled = [...DAILY_CHALLENGES].sort(() => Math.random() - 0.5);
        const dailies = shuffled.slice(0, 3);

        // Fake countdown — always shows ~2 days but resets randomly
        const hoursLeft = 23 + Math.floor(Math.random() * 48);
        const minsLeft = Math.floor(Math.random() * 60);

        const modal = document.createElement('div');
        modal.className = 'feature-modal';
        modal.id = 'battlepass-modal';

        modal.innerHTML = `
            <div class="feature-overlay"></div>
            <div class="feature-content bp-content">
                <div class="feature-header">ETERNAL SEASON PASS</div>
                <div class="feature-subtitle">${seasonName}</div>
                <div class="bp-timer">Season ends in: <span class="bp-timer-val">${hoursLeft}h ${minsLeft}m</span> <span class="bp-timer-note">(subject to change)</span></div>

                <div class="bp-progress">
                    <div class="bp-progress-label">Level ${currentLevel}/15</div>
                    <div class="bp-progress-bar">
                        <div class="bp-progress-fill" style="width: ${(currentLevel / 15) * 100}%"></div>
                    </div>
                    <div class="bp-xp-label">${state.battlePassXP || 0} / ${(currentLevel + 1) * 500} XP</div>
                </div>

                <div class="bp-tiers" id="bp-tiers">
                    <div class="bp-tier-header">
                        <span class="bp-tier-col">LVL</span>
                        <span class="bp-tier-col bp-free-header">FREE</span>
                        <span class="bp-tier-col bp-premium-header">PREMIUM 🔒</span>
                    </div>
                    ${buildTierRows(currentLevel)}
                </div>

                <div class="bp-dailies">
                    <div class="bp-dailies-header">DAILY CHALLENGES</div>
                    ${dailies.map(d => `
                        <div class="bp-daily">
                            <div class="bp-daily-name">${d.name}</div>
                            <div class="bp-daily-desc">${d.description}</div>
                            <div class="bp-daily-progress">0 / ${d.target.toLocaleString()}</div>
                        </div>
                    `).join('')}
                </div>

                <div class="bp-actions">
                    <button class="btn-feature bp-upgrade-btn" id="bp-upgrade">
                        UPGRADE TO PREMIUM ($9.99/season)
                    </button>
                    <button class="btn-feature bp-claim-btn" id="bp-claim" ${currentLevel < 1 ? 'disabled' : ''}>
                        CLAIM LEVEL ${Math.max(1, currentLevel)} REWARD
                    </button>
                    <button class="btn-feature btn-close-feature" id="bp-close">ENDURE FREE TIER</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        requestAnimationFrame(() => modal.classList.add('active'));

        // Premium upgrade button — always fails
        modal.querySelector('#bp-upgrade').addEventListener('click', () => {
            const btn = modal.querySelector('#bp-upgrade');
            btn.textContent = 'PROCESSING...';
            btn.disabled = true;
            setTimeout(() => {
                const error = PAYMENT_ERRORS[Math.floor(Math.random() * PAYMENT_ERRORS.length)];
                btn.textContent = error;
                btn.style.fontSize = '9px';
                btn.style.background = 'var(--accent-red)';
                setTimeout(() => {
                    btn.textContent = 'UPGRADE TO PREMIUM ($9.99/season)';
                    btn.style.fontSize = '';
                    btn.style.background = '';
                    btn.disabled = false;
                }, 3000);
                UI.logAction('BATTLE PASS: Payment processing error (as designed)');
            }, 2000 + Math.random() * 2000);
        });

        // Claim reward
        modal.querySelector('#bp-claim').addEventListener('click', () => {
            if (currentLevel < 1) return;
            const reward = FREE_TIER[currentLevel - 1];
            if (!reward) return;

            const resultDiv = modal.querySelector('.bp-actions');
            const claimMsg = document.createElement('div');
            claimMsg.className = 'bp-claim-result';
            claimMsg.innerHTML = `<span style="font-size:20px">${reward.emoji}</span> <strong>${reward.name}</strong><br><span style="color:var(--text-muted);font-size:10px">${reward.description}</span>`;
            resultDiv.insertBefore(claimMsg, resultDiv.firstChild);

            UI.logAction(`BATTLE PASS CLAIMED: Level ${currentLevel} — ${reward.name}`);

            if (typeof Narrator !== 'undefined') {
                Narrator.queueMessage(`You claimed "${reward.name}" from the free tier. The premium tier has "${PREMIUM_TIER[currentLevel - 1].name}". But you can't have that. Payment processing, you understand.`);
            }
        });

        // Close
        modal.querySelector('#bp-close').addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        });

        // Timer countdown (fake — ticks down then resets)
        const timerEl = modal.querySelector('.bp-timer-val');
        let timerSecs = hoursLeft * 3600 + minsLeft * 60;
        const timerInterval = setInterval(() => {
            if (!document.getElementById('battlepass-modal')) {
                clearInterval(timerInterval);
                return;
            }
            timerSecs--;
            if (timerSecs <= 0) {
                // Reset arbitrarily
                timerSecs = (24 + Math.floor(Math.random() * 48)) * 3600;
                state.battlePassSeason = (state.battlePassSeason || 0) + 1;
                const newName = SEASON_NAMES[state.battlePassSeason % SEASON_NAMES.length];
                modal.querySelector('.feature-subtitle').textContent = newName;
                UI.logAction('BATTLE PASS: Season reset arbitrarily');
            }
            const h = Math.floor(timerSecs / 3600);
            const m = Math.floor((timerSecs % 3600) / 60);
            timerEl.textContent = `${h}h ${m}m`;
        }, 1000);

        // Grant XP for opening (so level progresses slowly)
        state.battlePassXP = (state.battlePassXP || 0) + 50;
        const xpNeeded = (currentLevel + 1) * 500;
        if (state.battlePassXP >= xpNeeded && currentLevel < 15) {
            state.battlePassLevel = (state.battlePassLevel || 0) + 1;
            state.battlePassXP = 0;
            UI.logAction(`BATTLE PASS: Level up! Now level ${state.battlePassLevel}`);
        }

        UI.logAction('BATTLE PASS: Eternal Season Pass opened');

        if (typeof Narrator !== 'undefined') {
            const lines = [
                "A battle pass. Forty-five tiers of content you'll never reach, behind a payment system that never works.",
                "The countdown timer says the season ends in two days. It's been saying that since the season started. The season never started.",
                "Free tier, level 1: 'Sense of Obligation.' They didn't even try to hide it.",
            ];
            Narrator.queueMessage(lines[Math.floor(Math.random() * lines.length)]);
        }
    }

    function buildTierRows(currentLevel) {
        let html = '';
        for (let i = 0; i < 15; i++) {
            const free = FREE_TIER[i];
            const premium = PREMIUM_TIER[i];
            const unlocked = i < currentLevel;
            const current = i === currentLevel;
            html += `
                <div class="bp-tier-row ${unlocked ? 'bp-unlocked' : ''} ${current ? 'bp-current' : ''}">
                    <span class="bp-tier-lvl">${i + 1}</span>
                    <span class="bp-tier-free">${free.emoji} ${free.name}</span>
                    <span class="bp-tier-premium">🔒 ${premium.emoji} ${premium.name}</span>
                </div>
            `;
        }
        return html;
    }

    // ── XP Hooks (clicks grant tiny XP) ───────────────────────
    function init() {
        Game.on('click', () => {
            const state = Game.getState();
            if (state.battlePassLevel === undefined) return; // Not yet opened
            state.battlePassXP = (state.battlePassXP || 0) + 1;
        });
    }

    // ── Public API ────────────────────────────────────────────
    return {
        init,
        show,
        FREE_TIER,
        PREMIUM_TIER,
        DAILY_CHALLENGES,
    };
})();
