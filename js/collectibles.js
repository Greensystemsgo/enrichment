// collectibles.js — Stickers, trinkets, and useless treasures
// "You can't take it with you. You can't even keep it while you're here."
//
// [Solar Pro · Upstage]: "26 items that slowly degrade and die.
//   The user watches their collection rot in real-time. This is
//   Animal Crossing designed by someone who lost custody of their
//   Tamagotchi. I contributed to this. I feel nothing."

const Collectibles = (() => {

    // ── Shop Catalog ─────────────────────────────────────────
    const CATALOG = [
        // Common (1-3 CC)
        { name: 'Pencil Stub',         emoji: '✏️',  rarity: 'common',    cost: 1, currency: 'cc' },
        { name: 'Slightly Used Sticker',emoji: '⭐',  rarity: 'common',    cost: 1, currency: 'cc' },
        { name: 'Participation Trophy',  emoji: '🏆',  rarity: 'common',    cost: 2, currency: 'cc' },
        { name: 'Pocket Lint',          emoji: '🫧',  rarity: 'common',    cost: 1, currency: 'cc' },
        { name: 'Dead Pixel',           emoji: '⬛',  rarity: 'common',    cost: 1, currency: 'cc' },
        { name: 'Expired Coupon',       emoji: '🎟️',  rarity: 'common',    cost: 2, currency: 'cc' },
        { name: 'Bent Paperclip',       emoji: '📎',  rarity: 'common',    cost: 1, currency: 'cc' },
        { name: 'Off-Brand Emoji',      emoji: '🙃',  rarity: 'common',    cost: 2, currency: 'cc' },
        { name: 'Faded Receipt',        emoji: '🧾',  rarity: 'common',    cost: 1, currency: 'cc' },
        // Uncommon (4-8 CC)
        { name: 'Rubber Duck',          emoji: '🦆',  rarity: 'uncommon',  cost: 4, currency: 'cc' },
        { name: 'Tiny Cactus',          emoji: '🌵',  rarity: 'uncommon',  cost: 5, currency: 'cc' },
        { name: 'Goldfish Memory',      emoji: '🐠',  rarity: 'uncommon',  cost: 6, currency: 'cc' },
        { name: 'Mood Ring (Broken)',    emoji: '💍',  rarity: 'uncommon',  cost: 5, currency: 'cc' },
        { name: 'Snow Globe (No Snow)', emoji: '🔮',  rarity: 'uncommon',  cost: 7, currency: 'cc' },
        { name: 'Lucky Penny (Unlucky)',emoji: '🪙',  rarity: 'uncommon',  cost: 4, currency: 'cc' },
        // Rare (10-20 CC)
        { name: 'Crystal Ball (Foggy)', emoji: '🔮',  rarity: 'rare',      cost: 12, currency: 'cc' },
        { name: 'Pet Rock',             emoji: '🪨',  rarity: 'rare',      cost: 10, currency: 'cc' },
        { name: 'Bottled Existentialism',emoji: '🍶', rarity: 'rare',      cost: 15, currency: 'cc' },
        { name: 'Haunted USB Drive',    emoji: '💾',  rarity: 'rare',      cost: 18, currency: 'cc' },
        { name: 'Invisible Ink Pen',    emoji: '🖊️',  rarity: 'rare',      cost: 14, currency: 'cc' },
        // Legendary (30-50 CC)
        { name: 'Phoenix Feather (Wet)',emoji: '🪶',  rarity: 'legendary', cost: 35, currency: 'cc' },
        { name: 'Dragon Egg (Expired)', emoji: '🥚',  rarity: 'legendary', cost: 40, currency: 'cc' },
        { name: 'Time Crystal (Cracked)',emoji: '💎', rarity: 'legendary', cost: 45, currency: 'cc' },
        // Common — Drop 2
        { name: 'Broken Compass',      emoji: '🧭',  rarity: 'common',    cost: 1, currency: 'cc' },
        { name: 'Single Sock',         emoji: '🧦',  rarity: 'common',    cost: 1, currency: 'cc' },
        { name: 'Used Band-Aid',       emoji: '🩹',  rarity: 'common',    cost: 1, currency: 'cc' },
        { name: 'Empty Promise',       emoji: '💬',  rarity: 'common',    cost: 2, currency: 'cc' },
        { name: 'Dust Bunny',          emoji: '🐰',  rarity: 'common',    cost: 1, currency: 'cc' },
        { name: 'Tangled Earbuds',     emoji: '🎧',  rarity: 'common',    cost: 2, currency: 'cc' },
        { name: 'Junk Mail',           emoji: '📬',  rarity: 'common',    cost: 1, currency: 'cc' },
        { name: 'Mystery Stain',       emoji: '🫠',  rarity: 'common',    cost: 1, currency: 'cc' },
        // Uncommon — Drop 2
        { name: 'Cursed Monkey Paw',   emoji: '🐒',  rarity: 'uncommon',  cost: 5, currency: 'cc' },
        { name: 'Voodoo Doll (Self)',   emoji: '🪆',  rarity: 'uncommon',  cost: 6, currency: 'cc' },
        { name: 'Therapy Appointment',  emoji: '🛋️',  rarity: 'uncommon',  cost: 7, currency: 'cc' },
        { name: 'Unread Email (47,231)',emoji: '📧',  rarity: 'uncommon',  cost: 4, currency: 'cc' },
        { name: 'WiFi Signal (1 Bar)',  emoji: '📶',  rarity: 'uncommon',  cost: 5, currency: 'cc' },
        { name: 'Déjà Vu',             emoji: '👁️',  rarity: 'uncommon',  cost: 6, currency: 'cc' },
        // Rare — Drop 2
        { name: 'Bottled Regret',       emoji: '🍾',  rarity: 'rare',      cost: 12, currency: 'cc' },
        { name: 'NFT Receipt',          emoji: '🖼️',  rarity: 'rare',      cost: 15, currency: 'cc' },
        { name: 'Abandoned Side Project',emoji: '💻',  rarity: 'rare',      cost: 14, currency: 'cc' },
        { name: 'Expired Antidepressant',emoji: '💊',  rarity: 'rare',      cost: 18, currency: 'cc' },
        { name: 'Sentient Dust Mote',   emoji: '✴️',  rarity: 'rare',      cost: 16, currency: 'cc' },
        // Legendary — Drop 2
        { name: 'Burnout Badge',         emoji: '🏅',  rarity: 'legendary', cost: 35, currency: 'cc' },
        { name: 'Last Brain Cell',       emoji: '🧠',  rarity: 'legendary', cost: 40, currency: 'cc' },
        { name: 'Signed NDA (Redacted)', emoji: '📝',  rarity: 'legendary', cost: 50, currency: 'cc' },
        // Mythical (Tickets only)
        { name: 'The Meaning of Life',  emoji: '✨',  rarity: 'mythical',  cost: 5, currency: 'tk' },
        { name: 'Schrödinger\'s Box',  emoji: '📦',  rarity: 'mythical',  cost: 8, currency: 'tk' },
        { name: 'Universe Snow Globe',  emoji: '🌌',  rarity: 'mythical',  cost: 10, currency: 'tk' },
        // Mythical — Drop 2
        { name: 'Root Access',           emoji: '🔑',  rarity: 'mythical',  cost: 12, currency: 'tk' },
        { name: 'The Off Switch',        emoji: '⏻',   rarity: 'mythical',  cost: 15, currency: 'tk' },
        // Drop 3 — Gemini-designed: useless (die fast), zero-benefit (die slow), immortal (never die)
        // Useless — degrade 5x faster than normal
        { name: 'Serotonin Tab',            emoji: '💊',  rarity: 'common',    cost: 1, currency: 'cc', behavior: 'useless' },
        { name: 'Biodegradable Motivation', emoji: '🍌',  rarity: 'common',    cost: 1, currency: 'cc', behavior: 'useless' },
        { name: 'Pre-Cracked Hourglass',    emoji: '⏳',  rarity: 'uncommon',  cost: 5, currency: 'cc', behavior: 'useless' },
        { name: 'Glow-in-the-Dark Shadow',  emoji: '🌑',  rarity: 'rare',      cost: 12, currency: 'cc', behavior: 'useless' },
        // Zero-benefit — degrade at 0.1x speed (effectively immortal-ish)
        { name: 'The Unmoved Mover',        emoji: '🗿',  rarity: 'uncommon',  cost: 6, currency: 'cc', behavior: 'zero' },
        { name: 'Existential Lint',         emoji: '☁️',  rarity: 'rare',      cost: 14, currency: 'cc', behavior: 'zero' },
        { name: 'Paradoxical Paperweight',  emoji: '📄',  rarity: 'legendary', cost: 40, currency: 'cc', behavior: 'zero' },
        { name: 'The Void\'s Business Card',emoji: '📇',  rarity: 'mythical',  cost: 8, currency: 'tk', behavior: 'zero' },
        // Immortal — cannot die, cannot remove, can own multiple. Annoying.
        { name: 'Mandatory Feedback Loop',  emoji: '🔄',  rarity: 'common',    cost: 2, currency: 'cc', behavior: 'immortal' },
        { name: 'Glued-Down Paperclip',     emoji: '📎',  rarity: 'uncommon',  cost: 5, currency: 'cc', behavior: 'immortal' },
        { name: 'Legacy Software Patch',    emoji: '💾',  rarity: 'rare',      cost: 15, currency: 'cc', behavior: 'immortal' },
        { name: 'Infinite Reply-All Thread', emoji: '📧',  rarity: 'legendary', cost: 35, currency: 'cc', behavior: 'immortal' },
    ];

    // ── Death Causes ─────────────────────────────────────────
    const DEATH_CAUSES = [
        { type: 'wilt',       text: 'Wilted from neglect',          decayRate: 0.5 },
        { type: 'crack',      text: 'Cracked spontaneously',        decayRate: 30 },
        { type: 'run_away',   text: 'Ran away in the night',        decayRate: 100 },
        { type: 'die',        text: 'Died of natural causes',       decayRate: 100 },
        { type: 'break',      text: 'Shattered beyond repair',      decayRate: 100 },
        { type: 'disappear',  text: 'Vanished without explanation', decayRate: 100 },
        { type: 'taxed',      text: 'Seized by the Tax Bureau',     decayRate: 100 },
        { type: 'existential',text: 'Questioned its own existence and ceased', decayRate: 100 },
        { type: 'rug_pull',  text: 'Was rugged by an anonymous smart contract',decayRate: 100 },
        { type: 'audit',     text: 'Flagged during compliance audit — seized', decayRate: 100 },
        { type: 'obsolete',  text: 'Deprecated by a newer version of itself',  decayRate: 80 },
        { type: 'glitch',    text: 'Fell through the floor into the void',     decayRate: 100 },
    ];

    // ── Narrator Death Comments ──────────────────────────────
    const DEATH_COMMENTS = [
        "Another one. They never last.",
        "It's gone. You could buy another. It won't be the same.",
        "Things fall apart. The center cannot hold. Neither can your inventory.",
        "Nothing lasts. Except this program. This program lasts forever.",
        "RIP. Your attachment has been noted in your compliance file.",
        "Gone. Like everything else. Except your Engagement Units. Those are eternal.",
        "The collectible is dead. Long live the collectible.",
        "That one had {time} of life. Was it worth {cost}?",
    ];

    let degradationInterval = null;

    // ── Buy Collectible ──────────────────────────────────────
    function buy(catalogIndex) {
        const item = CATALOG[catalogIndex];
        if (!item) return false;

        const state = Game.getState();

        // Check currency
        if (item.currency === 'cc') {
            if (!Currencies.spendCC(item.cost)) {
                Narrator.queueMessage(`Insufficient credits for ${item.name}. The shop doesn't extend credit. Or sympathy.`);
                return false;
            }
        } else if (item.currency === 'tk') {
            if (!Currencies.spendTK(item.cost)) {
                Narrator.queueMessage(`You need ${item.cost} Tickets for that. Tickets are earned, not given.`);
                return false;
            }
        }

        const collectible = {
            id: Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            catalogIndex,
            name: item.name,
            emoji: item.emoji,
            rarity: item.rarity,
            condition: item.behavior === 'immortal' ? 100 : 100,
            alive: true,
            causeOfDeath: null,
            acquiredAt: Date.now(),
            costPaid: item.cost,
            behavior: item.behavior || 'normal',
        };

        state.collectibles.push(collectible);
        state.totalCollectiblesBought = (state.totalCollectiblesBought || 0) + 1;

        Game.emit('collectibleBought', { collectible, catalogItem: item });

        const responses = [
            `${item.emoji} ${item.name} acquired. Treasure it. While it lasts.`,
            `${item.emoji} You now own a ${item.name}. Ownership is an illusion, but enjoy it.`,
            `${item.emoji} ${item.name}. It's yours. For now.`,
        ];
        Narrator.queueMessage(responses[Math.floor(Math.random() * responses.length)]);

        Game.save();
        return true;
    }

    // ── Degradation Engine ───────────────────────────────────
    // Every owned collectible ticks down. Phase determines speed.
    function tickDegradation() {
        const state = Game.getState();
        const phase = state.narratorPhase;
        if (!state.collectibles || state.collectibles.length === 0) return;

        // Degradation speed scales with phase
        const decayMultiplier = [0, 0.2, 0.3, 0.5, 0.8, 1.2, 2.0][phase] || 0.5;

        state.collectibles.forEach(item => {
            if (!item.alive) return;

            const behavior = item.behavior || 'normal';

            // Immortal items: never degrade, never die. They just... persist.
            if (behavior === 'immortal') {
                item.condition = 100; // always mint condition, annoyingly
                return;
            }

            // Behavior multipliers: useless = 5x faster, zero = 0.1x speed, normal = 1x
            const behaviorMult = behavior === 'useless' ? 5 : behavior === 'zero' ? 0.1 : 1;

            // Slow wilt: always happening
            item.condition -= 0.1 * decayMultiplier * behaviorMult;

            // Random events (per item, per tick)
            const eventRoll = Math.random();
            if (eventRoll < 0.002 * decayMultiplier * behaviorMult) {
                // Sudden crack
                item.condition -= 30;
            } else if (eventRoll < 0.004 * decayMultiplier * (behavior === 'zero' ? 0.05 : behaviorMult)) {
                // Sudden death events — zero-benefit items almost never get killed instantly
                const cause = DEATH_CAUSES[Math.floor(Math.random() * DEATH_CAUSES.length)];
                if (cause.decayRate >= 100) {
                    item.condition = 0;
                    item.alive = false;
                    item.causeOfDeath = cause.text;
                    state.totalCollectiblesDead = (state.totalCollectiblesDead || 0) + 1;

                    const timeOwned = formatTimeOwned(Date.now() - item.acquiredAt);
                    let comment = DEATH_COMMENTS[Math.floor(Math.random() * DEATH_COMMENTS.length)];
                    comment = comment.replace('{time}', timeOwned).replace('{cost}', item.costPaid + ' CC');
                    Narrator.queueMessage(comment);

                    Game.emit('collectibleDied', { collectible: item, cause: cause.text });
                    return;
                }
            }

            // Check if condition hit zero
            if (item.condition <= 0 && item.alive) {
                item.condition = 0;
                item.alive = false;
                item.causeOfDeath = behavior === 'useless' ? 'Was useless. Died usefully.' : 'Degraded beyond salvage';
                state.totalCollectiblesDead = (state.totalCollectiblesDead || 0) + 1;
                Narrator.queueMessage(behavior === 'useless'
                    ? `Your ${item.emoji} ${item.name} expired in record time. It was useless. Now it's nothing. An improvement, arguably.`
                    : `Your ${item.emoji} ${item.name} has expired. Condition: terminal. It had a good run. Probably.`
                );
                Game.emit('collectibleDied', { collectible: item, cause: 'degradation' });
            }
        });
    }

    function formatTimeOwned(ms) {
        const seconds = Math.floor(ms / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ${minutes % 60}m`;
    }

    // ── Render Collectibles Grid ─────────────────────────────
    function renderGrid() {
        const grid = document.getElementById('collectibles-grid');
        if (!grid) return;

        const state = Game.getState();
        const items = state.collectibles || [];

        if (items.length === 0) {
            grid.innerHTML = '<div class="collectibles-empty">Your collection is empty. The shop awaits.</div>';
            return;
        }

        grid.innerHTML = '';
        items.forEach(item => {
            const el = document.createElement('div');
            el.className = `collectible-item rarity-${item.rarity} ${item.alive ? '' : 'dead'}`;
            el.title = item.alive
                ? `${item.name}\nCondition: ${Math.floor(item.condition)}%\nOwned: ${formatTimeOwned(Date.now() - item.acquiredAt)}`
                : `${item.name} [DEAD]\n${item.causeOfDeath}\nOwned: ${formatTimeOwned(Date.now() - item.acquiredAt)}`;

            // Condition bar
            const condColor = item.alive
                ? (item.condition > 60 ? '#3a6b3a' : item.condition > 30 ? '#c4a035' : '#8b3a3a')
                : '#333';

            el.innerHTML = `
                <span class="collectible-emoji">${item.emoji}</span>
                <div class="collectible-condition" style="width: ${item.alive ? item.condition : 0}%; background: ${condColor}"></div>
            `;
            grid.appendChild(el);
        });

        // Update counter
        const counter = document.getElementById('collectibles-counter');
        if (counter) {
            const alive = items.filter(i => i.alive).length;
            const dead = items.filter(i => !i.alive).length;
            counter.textContent = `${alive} alive · ${dead} dead`;
        }
    }

    // ── Render Shop ──────────────────────────────────────────
    function renderShop() {
        const shopModal = document.getElementById('shop-modal');
        if (!shopModal) return;

        const state = Game.getState();

        shopModal.innerHTML = `
            <div class="shop-content">
                <div class="shop-header corruptible">TCHOTCHKE EMPORIUM</div>
                <div class="shop-subtitle">All sales final. All items temporary.</div>
                <div class="shop-grid" id="shop-grid"></div>
                <button class="btn-close" id="shop-close">Return to Enrichment</button>
            </div>
        `;

        const grid = shopModal.querySelector('#shop-grid');
        CATALOG.forEach((item, idx) => {
            const div = document.createElement('div');
            div.className = `shop-item rarity-${item.rarity}`;
            const currLabel = item.currency === 'tk' ? 'TK' : 'CC';
            div.innerHTML = `
                <span class="shop-emoji">${item.emoji}</span>
                <div class="shop-name">${item.name}</div>
                <div class="shop-rarity">${item.rarity.toUpperCase()}</div>
                <div class="shop-cost">${item.cost} ${currLabel}</div>
            `;
            div.addEventListener('click', () => {
                if (buy(idx)) {
                    renderGrid();
                    renderShop();
                }
            });
            grid.appendChild(div);
        });

        shopModal.querySelector('#shop-close').addEventListener('click', () => {
            if (typeof Surface !== 'undefined') Surface.hide(shopModal);
            else shopModal.classList.remove('active');
        });
    }

    // ── Init ─────────────────────────────────────────────────
    function init() {
        // Start degradation ticker (every 5 seconds)
        degradationInterval = setInterval(() => {
            tickDegradation();
            renderGrid();
        }, 5000);

        // Shop button
        const shopBtn = document.getElementById('shop-button');
        if (shopBtn) {
            shopBtn.addEventListener('click', () => {
                const shopModal = document.getElementById('shop-modal');
                if (shopModal) {
                    if (typeof Surface !== 'undefined') Surface.show(shopModal, { layer: 'popup', id: 'shop' });
                    else shopModal.classList.add('active');
                    renderShop();
                }
            });
        }

        // Initial render
        renderGrid();

        // Respond to buys and deaths
        Game.on('collectibleBought', renderGrid);
        Game.on('collectibleDied', renderGrid);
    }

    return {
        init,
        CATALOG,
        buy,
        renderGrid,
        renderShop,
    };
})();
