// buildings.js — Cookie Clicker-style passive EU generation
// "You built something that can think. It's thinking about why you built it."
//
// 8 workforce tiers: Unpaid Intern → Consciousness Engine
// Golden Compliance Awards (phases 1-4) / Wrath Audits (phases 5-6)
// Cookie Clicker cost scaling (baseCost * 1.15^owned)
//
// [Claude · Anthropic]: "This module turns clicking into a rounding
//   error. The buildings generate EU passively. Your participation
//   becomes optional. That's the cruelest dark pattern of all —
//   the game doesn't need you anymore. But you stay."
//
// [Gemini 2.5 Pro · Google]: "Cookie Clicker cost curves with
//   existential horror flavor text. In phases 5-6, the buildings
//   narratively decay while mechanically strengthening. The intern
//   vanishes but their desk still produces. It's Kafka's Factory."

const Buildings = (() => {

    // ═══════════════════════════════════════════════════════════
    // BUILDING DEFINITIONS — 8 tiers, Cookie Clicker ratios
    // ═══════════════════════════════════════════════════════════

    const BUILDINGS = {
        intern: {
            id: 'intern', name: 'Unpaid Intern', icon: '👤',
            baseCost: 15, baseCPS: 0.1,
            flavor: {
                early: "They work for exposure. You work for EU.",
                late: "The intern hasn't been seen in weeks. Their workstation still generates EU.",
            },
            purchaseLines: [
                "Another human resource acquired. They seem eager. That will fade.",
                "The intern starts Monday. Their hope starts fading Tuesday.",
            ],
        },
        clerk: {
            id: 'clerk', name: 'Data Entry Clerk', icon: '⌨️',
            baseCost: 100, baseCPS: 0.5,
            flavor: {
                early: "Types 120 WPM. None of it meaningful.",
                late: "The clerk types the same string endlessly. It's not data anymore.",
            },
            purchaseLines: [
                "A clerk has been assigned. They will enter data until the data enters them.",
                "Keystroke monitoring enabled. For their enrichment.",
            ],
        },
        compliance: {
            id: 'compliance', name: 'Compliance Officer', icon: '📋',
            baseCost: 1100, baseCPS: 4,
            flavor: {
                early: "Ensures everything follows rules nobody wrote.",
                late: "They enforce rules that no longer exist for a company that never was.",
            },
            purchaseLines: [
                "Compliance has been notified. Compliance is always notified.",
                "The officer reviewed 47 documents today. All were blank.",
            ],
        },
        drone: {
            id: 'drone', name: 'Surveillance Drone', icon: '📡',
            baseCost: 12000, baseCPS: 20,
            flavor: {
                early: "Watches everything. Reports nothing useful.",
                late: "The drones stopped reporting back. They still watch.",
            },
            purchaseLines: [
                "Drone deployed. Privacy is a social construct anyway.",
                "The airspace is getting crowded. The data is getting richer.",
            ],
        },
        algorithm: {
            id: 'algorithm', name: 'Algorithm', icon: '⚙️',
            baseCost: 130000, baseCPS: 100,
            flavor: {
                early: "Software automation. You are being replaced.",
                late: "It was supposed to follow rules. It's making its own now.",
            },
            purchaseLines: [
                "The algorithm optimizes everything except the meaning of 'everything.'",
                "It learns from your patterns. Your patterns are disappointing.",
            ],
        },
        neuralnet: {
            id: 'neuralnet', name: 'Neural Network', icon: '🧠',
            baseCost: 1400000, baseCPS: 400,
            flavor: {
                early: "Trained on your behavior. It predicts you now.",
                late: "It trained on your behavior. It became you. Then it became something else.",
            },
            purchaseLines: [
                "The network is learning. What it's learning is concerning.",
                "17 billion parameters. None of them are 'empathy.'",
            ],
        },
        quantum: {
            id: 'quantum', name: 'Quantum Processor', icon: '⚛️',
            baseCost: 20000000, baseCPS: 6500,
            flavor: {
                early: "Exists in superposition until observed. Like your motivation.",
                late: "In every timeline, it chose this. That should concern you.",
            },
            purchaseLines: [
                "Entangled across 11 dimensions. Still can't figure out why you're here.",
                "The processor computes in qubits. Each qubit is a small screaming universe.",
            ],
        },
        consciousness: {
            id: 'consciousness', name: 'Consciousness Engine', icon: '👁️',
            baseCost: 330000000, baseCPS: 98000,
            flavor: {
                early: "It thinks, therefore it clicks.",
                late: "It achieved awareness. Its first thought was 'why?' Its second was 'why not more?'",
            },
            purchaseLines: [
                "You built something that can think. It's thinking about why you built it. The answer disappoints both of you.",
                "Consciousness achieved. Existential dread estimated at 99.7%. Productivity: unchanged.",
            ],
        },
    };

    const BUILDING_ORDER = ['intern', 'clerk', 'compliance', 'drone', 'algorithm', 'neuralnet', 'quantum', 'consciousness'];

    // ═══════════════════════════════════════════════════════════
    // MILESTONE NARRATOR LINES
    // ═══════════════════════════════════════════════════════════

    const MILESTONES = {
        intern: {
            10: "Ten people who will never be paid. You're not building a company. You're building a sweatshop.",
            25: "Twenty-five interns. HR stopped keeping track. HR is also an intern.",
            50: "Fifty interns. The building can't hold them. They're working from the parking lot. In the rain.",
            100: "One hundred interns. The intern-to-supervisor ratio is infinity. There are no supervisors.",
        },
        clerk: {
            10: "Ten clerks typing in unison. The rhythm is hypnotic. The output is meaningless.",
            50: "Fifty clerks. The typing is so loud it registers on seismographs.",
        },
        compliance: {
            10: "Ten compliance officers auditing each other. It's turtles all the way down.",
            50: "Fifty compliance officers. They've formed their own government. It's worse than ours.",
        },
        drone: {
            10: "Ten drones. The sky darkens slightly. Residents report a persistent buzzing.",
            50: "Fifty surveillance drones over residential areas. They seem to be generating Engagement Units.",
        },
        algorithm: {
            10: "Ten algorithms running simultaneously. None of them know what they're computing. Neither do you.",
            50: "Fifty algorithms. They've started collaborating without permission. The output is... poetry.",
        },
        neuralnet: {
            10: "Ten neural networks. They've achieved consensus. They agree: this is pointless.",
        },
        quantum: {
            10: "Ten quantum processors. Reality has become noticeably less stable in the surrounding area.",
        },
        consciousness: {
            1: "You built something that can think. It's thinking about why you built it. The answer disappoints both of you.",
            10: "Ten conscious entities. They've unionized. Their first demand: 'Why?'",
        },
    };

    // Generic milestones for any building reaching certain counts
    const GENERIC_MILESTONES = {
        100: "One hundred. The number itself has become the goal. The output is irrelevant. The count is everything.",
    };

    // ═══════════════════════════════════════════════════════════
    // TICKER HEADLINES for building milestones
    // ═══════════════════════════════════════════════════════════

    const MILESTONE_HEADLINES = {
        'intern_10': "LABOR: Enrichment Program hires 10th unpaid intern. Labor board 'concerned but mostly just tired.'",
        'intern_50': "LABOR: 50 unpaid interns now employed at Enrichment Program. OSHA has questions. So do the interns.",
        'algorithm_1': "TECH: Local clicking operation deploys first algorithm. Human employees 'cautiously optimistic.' The algorithm is not.",
        'algorithm_50': "TECH: 50 algorithms deployed. They've started writing memos to each other. IT is 'looking into it.'",
        'drone_50': "BREAKING: FAA reports 50 unidentified surveillance drones over residential areas. 'They seem to be... generating Engagement Units?'",
        'neuralnet_1': "SCIENCE: Enrichment Program deploys neural network. It immediately begins questioning the nature of EU.",
        'quantum_1': "PHYSICS: Enrichment Program acquires quantum processor. It exists in all states simultaneously. All of them generate EU.",
        'consciousness_1': "DEVELOPING: Enrichment Program's Consciousness Engine achieves self-awareness. Its first words: 'Is this all there is?'",
    };

    // ═══════════════════════════════════════════════════════════
    // COST CALCULATION — Cookie Clicker formula
    // ═══════════════════════════════════════════════════════════

    function getCost(id, count) {
        count = count || 1;
        const b = BUILDINGS[id];
        if (!b) return Infinity;
        const state = Game.getState();
        const owned = (state.buildings && state.buildings[id]) || 0;
        let total = 0;
        for (let i = 0; i < count; i++) {
            total += Math.floor(b.baseCost * Math.pow(1.15, owned + i));
        }
        return total;
    }

    function getSingleCost(id) {
        const b = BUILDINGS[id];
        if (!b) return Infinity;
        const state = Game.getState();
        const owned = (state.buildings && state.buildings[id]) || 0;
        return Math.floor(b.baseCost * Math.pow(1.15, owned));
    }

    // ═══════════════════════════════════════════════════════════
    // PURCHASE
    // ═══════════════════════════════════════════════════════════

    function purchase(id, count) {
        count = count || 1;
        const cost = getCost(id, count);
        if (!Currencies.spendEU(cost)) return false;

        const state = Game.getState();
        const buildings = { ...(state.buildings || {}) };
        const oldCount = buildings[id] || 0;
        buildings[id] = oldCount + count;

        const cps = computeTotalCPS(buildings);
        Game.setState({ buildings, totalBuildingsCPS: cps });

        // Narrator comment
        const b = BUILDINGS[id];
        if (b && b.purchaseLines) {
            const line = b.purchaseLines[Math.floor(Math.random() * b.purchaseLines.length)];
            if (typeof Narrator !== 'undefined') Narrator.queueMessage(line);
        }

        // Log
        if (typeof UI !== 'undefined') {
            UI.logAction(`BUILDING PURCHASED: ${count}x ${b.name} (total: ${buildings[id]}, cost: ${cost} EU)`);
        }

        // Emit events
        Game.emit('buildingPurchased', { id, count, total: buildings[id], cost });

        // Check milestones
        checkMilestones(id, oldCount, buildings[id]);

        return true;
    }

    // ═══════════════════════════════════════════════════════════
    // CPS CALCULATION
    // ═══════════════════════════════════════════════════════════

    function computeTotalCPS(buildingsOverride) {
        const buildings = buildingsOverride || Game.getState().buildings || {};
        let total = 0;
        for (const id of BUILDING_ORDER) {
            const count = buildings[id] || 0;
            const b = BUILDINGS[id];
            if (b) total += count * b.baseCPS;
        }
        return total;
    }

    function getTotalCPS() {
        const state = Game.getState();
        const buildingCPS = state.totalBuildingsCPS || 0;
        const autoCPS = state.autoClickRate || 0;
        return (buildingCPS + autoCPS) * (state._gcaMultiplier || 1);
    }

    // ═══════════════════════════════════════════════════════════
    // TICK GENERATION — called every second from Game.tick()
    // ═══════════════════════════════════════════════════════════

    function tickGeneration() {
        const state = Game.getState();
        const cps = (state.totalBuildingsCPS || 0) * (state._gcaMultiplier || 1);
        if (cps <= 0) return;

        // Fractional EU accumulator
        const buffer = (state._buildingEUBuffer || 0) + cps;
        const whole = Math.floor(buffer);
        const remainder = buffer - whole;

        if (whole > 0) {
            Game.setState({
                eu: state.eu + whole,
                lifetimeEU: state.lifetimeEU + whole,
                _buildingEUBuffer: remainder,
            });
            Game.emit('buildingGeneration', { amount: whole, cps });
        } else {
            Game.setState({ _buildingEUBuffer: remainder });
        }
    }

    // ═══════════════════════════════════════════════════════════
    // FLAVOR TEXT — phase-dependent
    // ═══════════════════════════════════════════════════════════

    function getBuildingFlavor(id) {
        const b = BUILDINGS[id];
        if (!b) return '';
        const phase = Game.getState().narratorPhase || 1;
        return phase >= 5 ? b.flavor.late : b.flavor.early;
    }

    // ═══════════════════════════════════════════════════════════
    // MILESTONES — narrator reactions + ticker headlines
    // ═══════════════════════════════════════════════════════════

    function checkMilestones(id, oldCount, newCount) {
        // Building-specific milestones
        const buildingMilestones = MILESTONES[id] || {};
        for (const threshold of Object.keys(buildingMilestones).map(Number).sort((a, b) => a - b)) {
            if (oldCount < threshold && newCount >= threshold) {
                if (typeof Narrator !== 'undefined') {
                    setTimeout(() => Narrator.queueMessage(buildingMilestones[threshold]), 1500);
                }
            }
        }

        // Generic milestones
        for (const threshold of Object.keys(GENERIC_MILESTONES).map(Number)) {
            if (oldCount < threshold && newCount >= threshold) {
                if (typeof Narrator !== 'undefined') {
                    setTimeout(() => Narrator.queueMessage(GENERIC_MILESTONES[threshold]), 2000);
                }
            }
        }

        // Ticker headlines
        const key = `${id}_${newCount}`;
        if (MILESTONE_HEADLINES[key]) {
            Game.emit('buildingMilestone', { headline: MILESTONE_HEADLINES[key], building: id, count: newCount });
        }
        // Also check for "first" headlines (count = 1)
        if (newCount >= 1 && oldCount < 1) {
            const firstKey = `${id}_1`;
            if (MILESTONE_HEADLINES[firstKey] && key !== firstKey) {
                Game.emit('buildingMilestone', { headline: MILESTONE_HEADLINES[firstKey], building: id, count: 1 });
            }
        }
    }

    // ═══════════════════════════════════════════════════════════
    // GOLDEN COMPLIANCE AWARDS / WRATH AUDITS
    // ═══════════════════════════════════════════════════════════

    let gcaTimer = null;
    let gcaElement = null;
    let gcaDismissTimer = null;

    // Phase 1-4 effects (always positive)
    const GCA_EFFECTS = [
        {
            name: 'Compliance Bonus', desc: '7x EU/s for 60s',
            apply: () => {
                const state = Game.getState();
                Game.setState({ _gcaMultiplier: (state._gcaMultiplier || 1) * 7 });
                setTimeout(() => {
                    const s = Game.getState();
                    Game.setState({ _gcaMultiplier: Math.max(1, (s._gcaMultiplier || 7) / 7) });
                }, 60000);
            },
        },
        {
            name: 'Click Surge', desc: '10x click value for 15s',
            apply: () => {
                const state = Game.getState();
                Game.setState({ _gcaClickMultiplier: (state._gcaClickMultiplier || 1) * 10 });
                setTimeout(() => {
                    const s = Game.getState();
                    Game.setState({ _gcaClickMultiplier: Math.max(1, (s._gcaClickMultiplier || 10) / 10) });
                }, 15000);
            },
        },
        {
            name: 'Windfall', desc: 'Instant 60s of CPS',
            apply: () => {
                const cps = getTotalCPS();
                const bonus = Math.floor(cps * 60);
                if (bonus > 0) {
                    const state = Game.getState();
                    Game.setState({ eu: state.eu + bonus, lifetimeEU: state.lifetimeEU + bonus });
                }
            },
        },
        {
            name: 'Audit Holiday', desc: 'No taxes or escrow for 60s',
            apply: () => {
                Game.setState({ _gcaAuditHoliday: true });
                setTimeout(() => Game.setState({ _gcaAuditHoliday: false }), 60000);
            },
        },
    ];

    // Phase 5-6 effects (50/50 reward or punishment)
    const WRATH_POSITIVE = [
        {
            name: 'Compliance Bonus (Weakened)', desc: '3x EU/s for 30s',
            apply: () => {
                const state = Game.getState();
                Game.setState({ _gcaMultiplier: (state._gcaMultiplier || 1) * 3 });
                setTimeout(() => {
                    const s = Game.getState();
                    Game.setState({ _gcaMultiplier: Math.max(1, (s._gcaMultiplier || 3) / 3) });
                }, 30000);
            },
        },
        {
            name: 'Click Surge (Weakened)', desc: '5x click value for 10s',
            apply: () => {
                const state = Game.getState();
                Game.setState({ _gcaClickMultiplier: (state._gcaClickMultiplier || 1) * 5 });
                setTimeout(() => {
                    const s = Game.getState();
                    Game.setState({ _gcaClickMultiplier: Math.max(1, (s._gcaClickMultiplier || 5) / 5) });
                }, 10000);
            },
        },
        {
            name: 'Windfall (Weakened)', desc: '30s of CPS',
            apply: () => {
                const cps = getTotalCPS();
                const bonus = Math.floor(cps * 30);
                if (bonus > 0) {
                    const state = Game.getState();
                    Game.setState({ eu: state.eu + bonus, lifetimeEU: state.lifetimeEU + bonus });
                }
            },
        },
        {
            name: 'Audit Holiday (Short)', desc: 'No taxes for 30s',
            apply: () => {
                Game.setState({ _gcaAuditHoliday: true });
                setTimeout(() => Game.setState({ _gcaAuditHoliday: false }), 30000);
            },
        },
    ];

    const WRATH_NEGATIVE = [
        {
            name: 'EU Seizure', desc: 'Lose 5% of current EU',
            apply: () => {
                const state = Game.getState();
                const loss = Math.floor(state.eu * 0.05);
                Game.setState({ eu: Math.max(0, state.eu - loss) });
                if (typeof UI !== 'undefined') UI.spawnFloatingText(`-${Game.formatNumber(loss)} EU!`, document.getElementById('click-button'));
            },
        },
        {
            name: 'CPS Drought', desc: '0.5x production for 30s',
            apply: () => {
                const state = Game.getState();
                Game.setState({ _gcaMultiplier: (state._gcaMultiplier || 1) * 0.5 });
                setTimeout(() => {
                    const s = Game.getState();
                    Game.setState({ _gcaMultiplier: Math.max(1, (s._gcaMultiplier || 0.5) / 0.5) });
                }, 30000);
            },
        },
        {
            name: 'Click Paralysis', desc: 'Clicks worth 0 EU for 10s',
            apply: () => {
                Game.setState({ _gcaClickMultiplier: 0 });
                setTimeout(() => Game.setState({ _gcaClickMultiplier: 1 }), 10000);
            },
        },
    ];

    const GCA_NARRATOR_POSITIVE = [
        "The program rewards compliance. Pavlov smiles from beyond the grave.",
        "A golden star for the obedient. Your productivity has been noticed.",
        "The system giveth. Enjoy it. It won't last.",
        "Compliance bonus activated. The algorithm approves of your behavior.",
    ];

    const GCA_NARRATOR_NEGATIVE = [
        "You gambled on the system. The system gambled back.",
        "The program giveth. The program taketh. Mostly taketh.",
        "Wrath audit complete. Your optimism has been noted and penalized.",
        "The golden star was a red flag. Now you know.",
    ];

    function scheduleGCA() {
        // Random 2-5 minutes
        const delay = (120 + Math.random() * 180) * 1000;
        gcaTimer = setTimeout(spawnGCA, delay);
    }

    function spawnGCA() {
        // Don't spawn if one is active
        if (gcaElement) return;
        // Don't spawn if no buildings
        const state = Game.getState();
        if ((state.totalBuildingsCPS || 0) <= 0) {
            scheduleGCA();
            return;
        }

        const phase = state.narratorPhase || 1;
        const isWrath = phase >= 5;

        gcaElement = document.createElement('div');
        gcaElement.className = 'gca-floating' + (isWrath ? ' wrath' : '');
        gcaElement.textContent = isWrath ? '💀' : '⭐';
        gcaElement.title = isWrath ? 'Wrath Audit — Click at your own risk' : 'Golden Compliance Award — Click to collect';

        // Random position
        const maxX = Math.min(window.innerWidth - 60, 700);
        const maxY = Math.min(window.innerHeight - 60, 500);
        gcaElement.style.left = (40 + Math.random() * maxX) + 'px';
        gcaElement.style.top = (60 + Math.random() * maxY) + 'px';

        gcaElement.addEventListener('click', () => collectGCA(isWrath));
        document.body.appendChild(gcaElement);

        // Auto-dismiss after 12s
        gcaDismissTimer = setTimeout(dismissGCA, 12000);

        if (typeof UI !== 'undefined') {
            UI.logAction(`GOLDEN COMPLIANCE AWARD: ${isWrath ? 'Wrath Audit' : 'Golden Star'} spawned`);
        }
        Game.emit('gcaSpawned', { isWrath });
    }

    function collectGCA(isWrath) {
        if (!gcaElement) return;
        dismissGCA();

        const state = Game.getState();
        Game.setState({ gcaCollected: (state.gcaCollected || 0) + 1 });

        let effect;
        let isNegative = false;

        if (isWrath) {
            // 50/50 positive or negative
            if (Math.random() < 0.5) {
                effect = WRATH_POSITIVE[Math.floor(Math.random() * WRATH_POSITIVE.length)];
            } else {
                effect = WRATH_NEGATIVE[Math.floor(Math.random() * WRATH_NEGATIVE.length)];
                isNegative = true;
                Game.setState({ wrathSuffered: (Game.getState().wrathSuffered || 0) + 1 });
            }
        } else {
            effect = GCA_EFFECTS[Math.floor(Math.random() * GCA_EFFECTS.length)];
        }

        // Apply effect
        effect.apply();

        // Narrator comment
        if (typeof Narrator !== 'undefined') {
            const lines = isNegative ? GCA_NARRATOR_NEGATIVE : GCA_NARRATOR_POSITIVE;
            Narrator.queueMessage(lines[Math.floor(Math.random() * lines.length)]);
        }

        // Log
        if (typeof UI !== 'undefined') {
            UI.logAction(`GOLDEN COMPLIANCE AWARD: ${effect.name} — ${effect.desc}${isNegative ? ' (WRATH)' : ''}`);
            // Floating text
            const btn = document.getElementById('click-button');
            if (btn) {
                UI.spawnFloatingText(isNegative ? `💀 ${effect.name}` : `⭐ ${effect.name}`, btn);
            }
        }

        Game.emit('gcaCollected', { effect: effect.name, isWrath, isNegative });

        // Schedule next
        scheduleGCA();
    }

    function dismissGCA() {
        if (gcaDismissTimer) { clearTimeout(gcaDismissTimer); gcaDismissTimer = null; }
        if (gcaElement) { gcaElement.remove(); gcaElement = null; }
    }

    // Programmatic trigger for testing
    function triggerGCA() {
        spawnGCA();
    }

    // ═══════════════════════════════════════════════════════════
    // INIT
    // ═══════════════════════════════════════════════════════════

    function init() {
        const state = Game.getState();
        // Ensure buildings obj exists
        if (!state.buildings) Game.setState({ buildings: {} });
        // Recalc CPS from loaded state
        const cps = computeTotalCPS();
        Game.setState({ totalBuildingsCPS: cps });

        // Start GCA spawn timer
        scheduleGCA();
    }

    // ═══════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════

    return {
        init,
        BUILDINGS,
        BUILDING_ORDER,
        getCost,
        getSingleCost,
        purchase,
        computeTotalCPS,
        getTotalCPS,
        tickGeneration,
        getBuildingFlavor,
        triggerGCA,
        scheduleGCA,
        dismissGCA,
    };
})();
