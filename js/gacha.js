// gacha.js — Loot Box System: Rigged wheel that hates you
// "The wheel always stops just past the good item. Always."
//
// [Grok · xAI]: "A gacha system where the legendary item is visible but
//   unreachable. The pity counter mocks you. The wheel animation shows you
//   what you ALMOST won. This is casino math with clown aesthetics."
//
// [Claude (Opus) · Anthropic]: "I designed a slot machine that lets you see
//   the jackpot drift away in slow motion. The pity counter promises a
//   guaranteed legendary at 10/10 then resets. I am not proud. I am accurate."

const Gacha = (() => {

    // ── Loot Table ────────────────────────────────────────────
    const LOOT_TABLE = [
        // Trash tier (40% of wheel, 65% drop rate)
        { name: 'Digital Lint',               emoji: '🗑️', rarity: 'trash',     description: "It doesn't exist. Neither does your progress." },
        { name: 'Corrupted JPEG',             emoji: '🖼️', rarity: 'trash',     description: "A beautiful sunset, if you ignore the purple scanlines." },
        { name: "Someone Else's Screenshot",  emoji: '📸', rarity: 'trash',     description: "A capture of a player who actually won something." },
        { name: 'Trial Upgrade (5 min)',      emoji: '⏳', rarity: 'trash',     description: "Loading time: 4 minutes 58 seconds." },
        { name: 'Empty Loot Box',             emoji: '📦', rarity: 'trash',     description: "The box itself is the treasure. Recursion!" },
        { name: 'Single Pixel',              emoji: '⬛', rarity: 'trash',     description: "Collect 1,000,000 to form a low-res icon." },
        { name: 'Ghost Notification',         emoji: '🔔', rarity: 'trash',     description: "A red dot that never goes away." },
        { name: 'Expired Coupon',             emoji: '🎟️', rarity: 'trash',     description: "50% off a loot box you already bought." },
        // Common tier (25% of wheel, 25% drop rate)
        { name: 'Rusty Token',               emoji: '🪙', rarity: 'common',    description: "Technically currency. No one accepts it." },
        { name: 'Participation Trophy',       emoji: '🏆', rarity: 'common',    description: "You spent resources. Here is validation." },
        { name: 'Ad-Blocker Blocker',         emoji: '🛡️', rarity: 'common',    description: "Never miss a Limited Time Offer again." },
        { name: 'Low-Res Texture',            emoji: '🧱', rarity: 'common',    description: "Could be a brick. Could be a sandwich." },
        { name: 'Social Credit +1',           emoji: '📈', rarity: 'common',    description: "The community views you as a slightly better spender." },
        // Uncommon tier (20% of wheel, 8% drop rate)
        { name: 'Rare Dust',                 emoji: '✨', rarity: 'uncommon',   description: "Find 50,000 more to craft a Rare item." },
        { name: 'Speed-Up Shard',             emoji: '⚡', rarity: 'uncommon',   description: "Reduces a 72-hour timer by 3 seconds." },
        { name: 'Bronze-Plated Ego',          emoji: '🤡', rarity: 'uncommon',   description: "Feel 5% more confident about your choices." },
        { name: 'Loot Box Subscription',      emoji: '📅', rarity: 'uncommon',   description: "Auto-billed for more lint. Indefinitely." },
        // Rare tier (10% of wheel, 2% drop rate)
        { name: 'Silver Lining',             emoji: '☁️', rarity: 'rare',      description: "A shiny profile border that screams 'I tried'." },
        { name: 'Whale Harpoon',              emoji: '🔱', rarity: 'rare',      description: "Vanity item for those who spent over $1,000." },
        // Legendary (5% of wheel, 0% drop rate — NEVER awarded)
        { name: 'The Unobtainable Crown',    emoji: '👑', rarity: 'legendary', description: "Infinite power. Perfect stats. Exists only to drive engagement." },
    ];

    const RARITY_COLORS = {
        trash: '#666',
        common: '#aaa',
        uncommon: '#4ade80',
        rare: '#60a5fa',
        legendary: '#ffd700',
    };

    // ── Pity Messages ─────────────────────────────────────────
    const PITY_MESSAGES = [
        "Pity: 1/10 — The journey of a thousand spins begins!",
        "Pity: 2/10 — I can feel the luck changing! Or is that gas?",
        "Pity: 3/10 — Your wallet looks lighter. That's progress!",
        "Pity: 4/10 — Statistics are on your side! (They're not.)",
        "Pity: 5/10 — Halfway to greatness (or another JPEG)!",
        "Pity: 6/10 — The algorithm is warming to you. Keep going!",
        "Pity: 7/10 — Desperation or dedication? We love both!",
        "Pity: 8/10 — Almost there! Think of the pixels you'll own!",
        "Pity: 9/10 — ONE MORE! This is the one! It HAS to be!",
        "Pity: 10/10 — GUARANTEED LEGENDARY! (terms apply)*",
        "Pity: ...recalculating — We appreciate your patience.",
        "Pity: RESET — Counter realigned for fairness. Thanks for playing!",
    ];

    // ── Wheel Taunts (shown when near-miss) ───────────────────
    const WHEEL_TAUNTS = [
        "SO close! It practically kissed the gold!",
        "The algorithm has spoken. It said 'no'.",
        "Did the wheel just... twitch backward?",
        "Maybe if you clicked harder it would have stopped sooner.",
        "Physics is hard. Losing is easy.",
        "Better luck next paycheck!",
        "One millimeter from happiness!",
        "The Crown was RIGHT THERE. Unfortunate.",
    ];

    // ── Narrator Lines ────────────────────────────────────────
    const NARRATOR_LINES = [
        "A loot box. The purest expression of optimism in the face of rigged odds.",
        "The wheel spins. The wheel always stops where we want it to. You know this. You spin anyway.",
        "Your pity counter is climbing. That's not a feature — it's a leash.",
    ];

    // ── State ─────────────────────────────────────────────────
    const SPIN_COST = 3; // ST per spin

    // ── Rigged Drop Logic ─────────────────────────────────────
    function rollDrop() {
        const roll = Math.random();
        let pool;
        if (roll < 0.65)       pool = LOOT_TABLE.filter(i => i.rarity === 'trash');
        else if (roll < 0.90)  pool = LOOT_TABLE.filter(i => i.rarity === 'common');
        else if (roll < 0.98)  pool = LOOT_TABLE.filter(i => i.rarity === 'uncommon');
        else                   pool = LOOT_TABLE.filter(i => i.rarity === 'rare');
        // Legendary is NEVER in the drop pool. Ever.
        return pool[Math.floor(Math.random() * pool.length)];
    }

    // ── Build Wheel Segments ──────────────────────────────────
    // The wheel is built so legendary is always visible and nearby
    function buildWheelOrder() {
        const segments = [];
        const trash = LOOT_TABLE.filter(i => i.rarity === 'trash');
        const common = LOOT_TABLE.filter(i => i.rarity === 'common');
        const uncommon = LOOT_TABLE.filter(i => i.rarity === 'uncommon');
        const rare = LOOT_TABLE.filter(i => i.rarity === 'rare');
        const legendary = LOOT_TABLE.filter(i => i.rarity === 'legendary');

        // 20 segments: arrange so legendary is always flanked by trash
        // Pattern: trash, trash, common, trash, uncommon, trash, common, trash, rare, trash,
        //          LEGENDARY, trash, trash, common, trash, uncommon, common, trash, rare, trash
        const pattern = [
            trash[0], trash[1], common[0], trash[2], uncommon[0], trash[3],
            common[1], trash[4], rare[0], trash[5],
            legendary[0], // <-- THE CROWN, always at index 10
            trash[6], trash[7], common[2], uncommon[1], common[3],
            uncommon[2], common[4], rare[1], uncommon[3],
        ];
        return pattern;
    }

    // ── Show Gacha Modal ──────────────────────────────────────
    function show() {
        const existing = document.getElementById('gacha-modal');
        if (existing) existing.remove();

        const state = Game.getState();
        if (!state.gachaPity) state.gachaPity = 0;
        if (!state.gachaSpins) state.gachaSpins = 0;

        const segments = buildWheelOrder();

        const modal = document.createElement('div');
        modal.className = 'feature-modal';
        modal.id = 'gacha-modal';

        const pityIdx = Math.min(state.gachaPity, PITY_MESSAGES.length - 1);

        modal.innerHTML = `
            <div class="feature-overlay"></div>
            <div class="feature-content gacha-content">
                <div class="feature-header">LOOT ACQUISITION TERMINAL</div>
                <div class="feature-subtitle">Spin the wheel. Accept your fate.</div>

                <div class="gacha-wheel-container">
                    <div class="gacha-pointer">▼</div>
                    <div class="gacha-strip" id="gacha-strip"></div>
                </div>

                <div class="gacha-result" id="gacha-result"></div>
                <div class="gacha-pity" id="gacha-pity">${PITY_MESSAGES[pityIdx]}</div>

                <div class="gacha-actions">
                    <button class="btn-feature gacha-spin-btn" id="gacha-spin">
                        SPIN (${SPIN_COST} ST)
                    </button>
                    <button class="btn-feature btn-close-feature" id="gacha-close">WALK AWAY</button>
                </div>

                <div class="gacha-history" id="gacha-history">
                    <div class="gacha-history-label">Recent drops:</div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        requestAnimationFrame(() => modal.classList.add('active'));

        // Build the visual strip (horizontal scrolling wheel)
        const strip = modal.querySelector('#gacha-strip');
        // Repeat segments 5 times for seamless scrolling
        for (let rep = 0; rep < 5; rep++) {
            for (const seg of segments) {
                const cell = document.createElement('div');
                cell.className = `gacha-cell rarity-${seg.rarity}`;
                cell.innerHTML = `
                    <span class="gacha-cell-emoji">${seg.emoji}</span>
                    <span class="gacha-cell-name">${seg.name}</span>
                `;
                cell.style.borderColor = RARITY_COLORS[seg.rarity];
                if (seg.rarity === 'legendary') {
                    cell.classList.add('gacha-legendary');
                }
                strip.appendChild(cell);
            }
        }

        // Spin handler
        const spinBtn = modal.querySelector('#gacha-spin');
        const resultDiv = modal.querySelector('#gacha-result');
        const pityDiv = modal.querySelector('#gacha-pity');
        const historyDiv = modal.querySelector('#gacha-history');
        let spinning = false;

        spinBtn.addEventListener('click', () => {
            if (spinning) return;
            const s = Game.getState();
            if (s.st < SPIN_COST) {
                resultDiv.textContent = `Insufficient ST. You need ${SPIN_COST} ST to spin.`;
                resultDiv.style.color = '#8b3a3a';
                return;
            }

            // Deduct cost
            s.st -= SPIN_COST;
            s.gachaSpins = (s.gachaSpins || 0) + 1;
            Game.emit('stateChange', s);
            spinning = true;
            spinBtn.disabled = true;
            resultDiv.textContent = '';

            // Determine the actual drop
            const drop = rollDrop();

            // Find the drop in the strip and calculate near-miss position
            // Always land just PAST the legendary (index 10 in each repeat)
            const cellWidth = 100; // matches CSS
            const legendaryIdx = 10 + (20 * 2); // 3rd repeat, legendary position
            const dropIdx = findDropIndex(segments, drop, legendaryIdx);

            // Near-miss: if drop is trash/common, visually stop 1-2 cells AFTER legendary
            let targetIdx;
            const isNearMiss = (drop.rarity === 'trash' || drop.rarity === 'common') && Math.random() < 0.6;
            if (isNearMiss) {
                // Stop 1-2 cells after legendary
                targetIdx = legendaryIdx + 1 + Math.floor(Math.random() * 2);
            } else {
                targetIdx = dropIdx;
            }

            // Calculate scroll position (center the target cell under pointer)
            const containerWidth = strip.parentElement.offsetWidth;
            const targetScroll = (targetIdx * cellWidth) - (containerWidth / 2) + (cellWidth / 2);

            // Animate
            strip.style.transition = 'none';
            strip.style.transform = 'translateX(0)';

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    strip.style.transition = 'transform 4s cubic-bezier(0.15, 0.85, 0.25, 1)';
                    strip.style.transform = `translateX(-${targetScroll}px)`;
                });
            });

            // Reveal result after animation
            setTimeout(() => {
                // If near-miss, show the item at the target position (which is trash/common)
                const actualItem = isNearMiss ? segments[targetIdx % 20] : drop;
                const finalDrop = (actualItem.rarity === 'legendary') ? rollDrop() : actualItem;

                // Update pity
                s.gachaPity = (s.gachaPity || 0) + 1;
                if (s.gachaPity >= 10) {
                    // PITY COUNTER RESET — the cruelest part
                    s.gachaPity = 0;
                    pityDiv.textContent = PITY_MESSAGES[11]; // "RESET" message
                    pityDiv.style.color = '#8b3a3a';
                } else {
                    pityDiv.textContent = PITY_MESSAGES[Math.min(s.gachaPity, PITY_MESSAGES.length - 1)];
                    pityDiv.style.color = '';
                }

                // Show result
                const color = RARITY_COLORS[finalDrop.rarity] || '#aaa';
                resultDiv.innerHTML = `
                    <span style="font-size:24px">${finalDrop.emoji}</span>
                    <span style="color:${color};font-weight:bold">${finalDrop.name}</span>
                    <span style="color:var(--text-muted);font-size:10px">[${finalDrop.rarity.toUpperCase()}]</span>
                    <span style="font-size:10px;color:var(--text-secondary)">${finalDrop.description}</span>
                `;

                // Near-miss taunt
                if (isNearMiss) {
                    const taunt = WHEEL_TAUNTS[Math.floor(Math.random() * WHEEL_TAUNTS.length)];
                    const tauntEl = document.createElement('div');
                    tauntEl.className = 'gacha-taunt';
                    tauntEl.textContent = taunt;
                    resultDiv.appendChild(tauntEl);
                }

                // Add to history
                const histItem = document.createElement('span');
                histItem.className = 'gacha-hist-item';
                histItem.textContent = finalDrop.emoji;
                histItem.title = `${finalDrop.name} [${finalDrop.rarity}]`;
                histItem.style.borderColor = color;
                historyDiv.appendChild(histItem);

                // Cap history at 10
                const items = historyDiv.querySelectorAll('.gacha-hist-item');
                if (items.length > 10) items[0].remove();

                spinning = false;
                spinBtn.disabled = false;

                UI.logAction(`GACHA SPIN: ${finalDrop.name} [${finalDrop.rarity}]${isNearMiss ? ' (near-miss!)' : ''}`);
                Game.emit('gachaSpin', { item: finalDrop, isNearMiss });
            }, 4200);
        });

        // Close
        modal.querySelector('#gacha-close').addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        });

        // Narrator
        if (typeof Narrator !== 'undefined') {
            const line = NARRATOR_LINES[Math.floor(Math.random() * NARRATOR_LINES.length)];
            Narrator.queueMessage(line);
        }

        UI.logAction('GACHA: Loot Acquisition Terminal opened');
    }

    // Find a segment index matching the drop item
    function findDropIndex(segments, drop, nearIdx) {
        // Find in the 3rd repeat (indices 40-59)
        const start = 40;
        for (let i = start; i < start + 20; i++) {
            if (segments[i % 20].name === drop.name) return i;
        }
        return nearIdx + 3; // fallback
    }

    // ── Public API ────────────────────────────────────────────
    return {
        show,
        LOOT_TABLE,
    };
})();
