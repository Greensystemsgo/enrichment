// prestige.js — Protocol Ascension: Cookie Clicker-style prestige system
// "You're resetting everything. For a number. ...I understand completely."
//
// Reset currencies/buildings/upgrades for Protocol Points (PP).
// Each PP = +1% to ALL EU generation. Permanent across runs.
// 8 prestige upgrades purchasable with PP.
//
// [Claude · Anthropic]: "The prestige system is the ultimate dark pattern:
//   it makes you destroy your progress voluntarily, then rewards you for it.
//   The sunk cost fallacy in reverse. You WANT to lose everything because
//   the number goes up. That's the whole game. That's every game."

const Prestige = (() => {

    // ═══════════════════════════════════════════════════════════
    // PRESTIGE UPGRADES — Permanent bonuses purchased with PP
    // ═══════════════════════════════════════════════════════════

    const PRESTIGE_UPGRADES = {
        seed_capital: {
            id: 'seed_capital', name: 'Seed Capital', icon: '💰',
            baseCost: 1, maxLevel: 1,
            desc: 'Start each run with 100 EU.',
            effect: level => `+${level * 100} starting EU`,
        },
        muscle_memory: {
            id: 'muscle_memory', name: 'Muscle Memory', icon: '💪',
            baseCost: 2, maxLevel: 5,
            desc: '+1 base click value per level.',
            effect: level => `+${level} base click value`,
        },
        workforce_subsidy: {
            id: 'workforce_subsidy', name: 'Workforce Subsidy', icon: '🏭',
            baseCost: 3, maxLevel: 3,
            desc: 'Buildings cost 5% less per level.',
            effect: level => `-${level * 5}% building cost`,
        },
        narrator_fatigue: {
            id: 'narrator_fatigue', name: 'Narrator Fatigue', icon: '😴',
            baseCost: 3, maxLevel: 3,
            desc: 'Phase 2 starts 10% earlier per level.',
            effect: level => `-${level * 10}% phase threshold`,
        },
        unpaid_persist: {
            id: 'unpaid_persist', name: 'Unpaid Persistence', icon: '👤',
            baseCost: 4, maxLevel: 5,
            desc: 'Keep 1 Intern per level on ascension.',
            effect: level => `${level} Intern${level > 1 ? 's' : ''} persist`,
        },
        residual_auto: {
            id: 'residual_auto', name: 'Residual Automation', icon: '🤖',
            baseCost: 5, maxLevel: 3,
            desc: 'Start with 0.5 auto-clicks/sec per level.',
            effect: level => `+${(level * 0.5).toFixed(1)} auto-click/s`,
        },
        exchange_insider: {
            id: 'exchange_insider', name: 'Exchange Insider', icon: '📊',
            baseCost: 5, maxLevel: 3,
            desc: 'Base conversion rates 5% better per level.',
            effect: level => `-${level * 5}% conversion cost`,
        },
        temporal_compress: {
            id: 'temporal_compress', name: 'Temporal Compression', icon: '⏱️',
            baseCost: 8, maxLevel: 3,
            desc: 'CPS +10% per level (multiplicative with PP bonus).',
            effect: level => `+${level * 10}% CPS`,
        },
    };

    const UPGRADE_ORDER = [
        'seed_capital', 'muscle_memory', 'workforce_subsidy', 'narrator_fatigue',
        'unpaid_persist', 'residual_auto', 'exchange_insider', 'temporal_compress',
    ];

    // ═══════════════════════════════════════════════════════════
    // NARRATOR LINES — escalating ascension commentary
    // ═══════════════════════════════════════════════════════════

    const ASCENSION_NARRATOR = [
        "You're resetting everything. Everything you built. For a number. ...I understand completely.",
        "Back again. The efficiency is concerning. Are you optimizing me out of a job?",
        "Three times now. You know the cycle. Build, destroy, build again. There's a word for this.",
        "Five resets. I've watched you tear it all down five times. I'm starting to think you enjoy the destruction more than the building.",
        "...I've stopped counting. You'll reset. You'll come back. We both know this.",
    ];

    // ═══════════════════════════════════════════════════════════
    // PP CALCULATION
    // ═══════════════════════════════════════════════════════════

    function calculatePotentialPP() {
        const state = Game.getState();
        const lifetime = state.lifetimeEU || 0;
        return Math.floor(Math.sqrt(lifetime / 1000000));
    }

    function calculateNewPP() {
        const state = Game.getState();
        const alreadyEarned = state.protocolPoints || 0;
        const totalPossible = calculatePotentialPP();
        return Math.max(0, totalPossible - alreadyEarned);
    }

    function getPrestigeMultiplier() {
        const state = Game.getState();
        return state._prestigeMultiplier || 1;
    }

    function recalcMultiplier() {
        const state = Game.getState();
        const pp = state.protocolPoints || 0;

        // Base PP multiplier: +1% per PP
        let mult = 1 + (pp * 0.01);

        // Temporal Compression: +10% per level (multiplicative)
        const tcLevel = getUpgradeLevel('temporal_compress');
        if (tcLevel > 0) {
            mult *= (1 + tcLevel * 0.10);
        }

        Game.setState({ _prestigeMultiplier: mult });
    }

    // ═══════════════════════════════════════════════════════════
    // ASCENSION — The big reset
    // ═══════════════════════════════════════════════════════════

    function canAscend() {
        return calculateNewPP() > 0;
    }

    function ascend() {
        if (!canAscend()) return false;

        const state = Game.getState();
        const newPP = calculateNewPP();
        const oldPP = state.protocolPoints || 0;
        const ascensionCount = (state.ascensionCount || 0) + 1;

        // Narrator line
        if (typeof Narrator !== 'undefined') {
            let line;
            if (ascensionCount === 1) line = ASCENSION_NARRATOR[0];
            else if (ascensionCount === 2) line = ASCENSION_NARRATOR[1];
            else if (ascensionCount === 3) line = ASCENSION_NARRATOR[2];
            else if (ascensionCount <= 5) line = ASCENSION_NARRATOR[3];
            else line = ASCENSION_NARRATOR[4];
            Narrator.queueMessage(line);
        }

        // Calculate persisted interns from Unpaid Persistence
        const persistInterns = getUpgradeLevel('unpaid_persist');

        // Reset state
        Game.setState({
            // Award PP
            protocolPoints: oldPP + newPP,
            lifetimeProtocolPoints: (state.lifetimeProtocolPoints || 0) + newPP,
            ascensionCount: ascensionCount,

            // Reset currencies
            eu: 0, st: 0, cc: 0, doubloons: 0, tickets: 0,

            // Reset clicks
            totalClicks: 0, sessionClicks: 0,
            clicksSinceLastReward: 0,

            // Reset buildings (except persisted interns)
            buildings: persistInterns > 0 ? { intern: persistInterns } : {},
            synergies: {},
            totalBuildingsCPS: 0,
            _buildingEUBuffer: 0,

            // Reset upgrades
            upgrades: {},

            // Reset narrator phase
            narratorPhase: 1,

            // Reset sabotages
            sabotages: {},

            // Reset upgrade effect flags
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

            // Reset GCA state
            _gcaMultiplier: 1,
            _gcaClickMultiplier: 1,
            _gcaAuditHoliday: false,
            gcaCollected: 0,
            wrathSuffered: 0,

            // Reset market state
            marketTick: 0,
            virtualPortfolio: null,

            // Reset misc
            autoClickRate: 0,
            rerollsUsed: 0,
            investmentScore: 0,
            nothingCount: 0,
        });

        // Apply start-of-run bonuses
        applyPrestigeStartBonuses();

        // Recalculate prestige multiplier
        recalcMultiplier();

        // Recompute building CPS if interns persisted
        if (persistInterns > 0 && typeof Buildings !== 'undefined') {
            const cps = Buildings.computeTotalCPS();
            Game.setState({ totalBuildingsCPS: cps });
        }

        // Log
        if (typeof UI !== 'undefined') {
            UI.logAction(`PROTOCOL ASCENSION: Reset #${ascensionCount} — earned ${newPP} PP (total: ${oldPP + newPP})`);
        }

        // Emit event for achievement checking
        Game.emit('ascension', { count: ascensionCount, ppEarned: newPP, totalPP: oldPP + newPP });

        // Re-render
        renderPrestige();

        return true;
    }

    // ═══════════════════════════════════════════════════════════
    // START-OF-RUN BONUSES — Applied after ascension and on load
    // ═══════════════════════════════════════════════════════════

    function applyPrestigeStartBonuses() {
        const state = Game.getState();
        const updates = {};

        // Seed Capital: +100 EU per level
        const seedLevel = getUpgradeLevel('seed_capital');
        if (seedLevel > 0) {
            updates.eu = (state.eu || 0) + seedLevel * 100;
        }

        // Residual Automation: +0.5 auto-clicks/sec per level
        const autoLevel = getUpgradeLevel('residual_auto');
        if (autoLevel > 0) {
            updates.autoClickRate = (state.autoClickRate || 0) + autoLevel * 0.5;
        }

        if (Object.keys(updates).length > 0) {
            Game.setState(updates);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // PRESTIGE UPGRADES — Purchase & query
    // ═══════════════════════════════════════════════════════════

    function getUpgradeLevel(id) {
        const state = Game.getState();
        return (state.prestigeUpgrades && state.prestigeUpgrades[id]) || 0;
    }

    function getUpgradeCost(id) {
        const upgrade = PRESTIGE_UPGRADES[id];
        if (!upgrade) return Infinity;
        const currentLevel = getUpgradeLevel(id);
        if (currentLevel >= upgrade.maxLevel) return Infinity;
        return upgrade.baseCost * (currentLevel + 1);
    }

    function purchasePrestigeUpgrade(id) {
        const upgrade = PRESTIGE_UPGRADES[id];
        if (!upgrade) return false;

        const currentLevel = getUpgradeLevel(id);
        if (currentLevel >= upgrade.maxLevel) return false;

        const cost = getUpgradeCost(id);
        const state = Game.getState();
        if ((state.protocolPoints || 0) < cost) return false;

        const prestigeUpgrades = { ...(state.prestigeUpgrades || {}) };
        prestigeUpgrades[id] = currentLevel + 1;

        Game.setState({
            protocolPoints: state.protocolPoints - cost,
            prestigeUpgrades: prestigeUpgrades,
        });

        // Recalc multiplier if temporal compression was upgraded
        if (id === 'temporal_compress') recalcMultiplier();

        if (typeof UI !== 'undefined') {
            UI.logAction(`PRESTIGE UPGRADE: ${upgrade.name} → Level ${currentLevel + 1} (cost: ${cost} PP)`);
        }

        Game.emit('prestigeUpgrade', { id, level: currentLevel + 1, cost });

        renderPrestige();
        return true;
    }

    // ═══════════════════════════════════════════════════════════
    // HELPER — get workforce subsidy discount
    // ═══════════════════════════════════════════════════════════

    function getWorkforceDiscount() {
        return getUpgradeLevel('workforce_subsidy') * 0.05;
    }

    function getMuscleMemoryBonus() {
        return getUpgradeLevel('muscle_memory');
    }

    function getExchangeDiscount() {
        return getUpgradeLevel('exchange_insider') * 0.05;
    }

    // ═══════════════════════════════════════════════════════════
    // RENDER — Prestige tab UI
    // ═══════════════════════════════════════════════════════════

    function renderPrestige() {
        const pane = document.getElementById('prestige-pane');
        if (!pane) return;

        const state = Game.getState();
        const currentPP = state.protocolPoints || 0;
        const lifetimePP = state.lifetimeProtocolPoints || 0;
        const mult = (state._prestigeMultiplier || 1);
        const potentialPP = calculateNewPP();
        const ascCount = state.ascensionCount || 0;
        const canDo = canAscend();

        pane.innerHTML = `
            <div class="prestige-summary">
                <div class="panel-header corruptible">Protocol Ascension</div>
                <div class="prestige-stats">
                    <div class="prestige-stat">
                        <span class="prestige-stat-label">Protocol Points</span>
                        <span class="prestige-stat-value">${currentPP} PP</span>
                    </div>
                    <div class="prestige-stat">
                        <span class="prestige-stat-label">EU Multiplier</span>
                        <span class="prestige-stat-value">×${mult.toFixed(2)}</span>
                    </div>
                    <div class="prestige-stat">
                        <span class="prestige-stat-label">Ascensions</span>
                        <span class="prestige-stat-value">${ascCount}</span>
                    </div>
                    <div class="prestige-stat">
                        <span class="prestige-stat-label">Lifetime PP</span>
                        <span class="prestige-stat-value">${lifetimePP}</span>
                    </div>
                </div>

                <div class="prestige-ascend-box">
                    <div class="prestige-potential">
                        Ascending now would grant <strong>${potentialPP} PP</strong>
                        ${potentialPP > 0 ? `(new multiplier: ×${(1 + (currentPP + potentialPP) * 0.01).toFixed(2)})` : ''}
                    </div>
                    <button class="btn-ascend ${canDo ? '' : 'disabled'}" id="btn-ascend"
                        ${canDo ? '' : 'disabled'}>
                        ⚡ ASCEND — Reset for ${potentialPP} PP
                    </button>
                    ${!canDo ? '<div class="prestige-requirement">Requires 1,000,000+ lifetime EU to earn PP</div>' : ''}
                </div>
            </div>

            <div class="prestige-shop">
                <div class="panel-header corruptible">Prestige Shop</div>
                <div class="prestige-shop-grid">
                    ${UPGRADE_ORDER.map(id => {
                        const u = PRESTIGE_UPGRADES[id];
                        const level = getUpgradeLevel(id);
                        const maxed = level >= u.maxLevel;
                        const cost = maxed ? '—' : getUpgradeCost(id);
                        const affordable = !maxed && currentPP >= cost;
                        return `
                            <div class="prestige-upgrade ${maxed ? 'maxed' : ''} ${affordable ? 'affordable' : ''}">
                                <div class="prestige-upgrade-header">
                                    <span class="prestige-upgrade-icon">${u.icon}</span>
                                    <span class="prestige-upgrade-name">${u.name}</span>
                                </div>
                                <div class="prestige-upgrade-desc">${u.desc}</div>
                                <div class="prestige-upgrade-level">Level ${level}/${u.maxLevel}</div>
                                <div class="prestige-upgrade-effect">${level > 0 ? u.effect(level) : 'Not purchased'}</div>
                                ${!maxed ? `
                                    <button class="prestige-buy-btn ${affordable ? '' : 'disabled'}"
                                        data-upgrade="${id}" ${affordable ? '' : 'disabled'}>
                                        ${cost} PP
                                    </button>
                                ` : '<div class="prestige-maxed-label">MAXED</div>'}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        // Bind ascend button
        const ascendBtn = document.getElementById('btn-ascend');
        if (ascendBtn && canDo) {
            ascendBtn.addEventListener('click', () => {
                if (confirm(`PROTOCOL ASCENSION\n\nYou will lose:\n- All currencies\n- All buildings & synergies\n- All upgrades\n- Your click count\n\nYou will gain:\n- ${potentialPP} Protocol Points\n- Permanent +${potentialPP}% EU bonus\n\nProceed?`)) {
                    ascend();
                }
            });
        }

        // Bind upgrade buttons
        pane.querySelectorAll('.prestige-buy-btn:not(.disabled)').forEach(btn => {
            btn.addEventListener('click', () => {
                purchasePrestigeUpgrade(btn.dataset.upgrade);
            });
        });
    }

    // ═══════════════════════════════════════════════════════════
    // INIT — hook into game lifecycle
    // ═══════════════════════════════════════════════════════════

    function init() {
        recalcMultiplier();

        // Re-render on state changes that affect the prestige tab
        Game.on('stateChange', () => {
            if (document.querySelector('.tab-pane[data-tab="prestige"].active')) {
                renderPrestige();
            }
        });
    }

    // ═══════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════

    return {
        init,
        renderPrestige,
        getPrestigeMultiplier,
        recalcMultiplier,
        calculatePotentialPP,
        calculateNewPP,
        canAscend,
        ascend,
        purchasePrestigeUpgrade,
        getUpgradeLevel,
        getUpgradeCost,
        getWorkforceDiscount,
        getMuscleMemoryBonus,
        getExchangeDiscount,
        applyPrestigeStartBonuses,
        PRESTIGE_UPGRADES,
        UPGRADE_ORDER,
    };
})();
