// buildings.js — Cookie Clicker-style passive EU generation
// "You built something that can think. It's thinking about why you built it."
//
// 12 workforce tiers: Unpaid Intern → Consciousness Engine
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
    // BUILDING DEFINITIONS — 12 tiers, Cookie Clicker ratios
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
                "They don't know what CPS means. That's the point.",
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
                "Technically not our employee. Technically not our problem.",
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
                "They'll analyze the data. They won't like what they find.",
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
                "Managing people who manage people. It's managers all the way down.",
            ],
        },
        middlemgmt: {
            id: 'middlemgmt', name: 'Middle Manager', icon: '👔',
            baseCost: 40000, baseCPS: 45,
            flavor: {
                early: "Manages people who manage people. It's managers all the way down.",
                late: "The org chart collapsed into a singularity. The manager persists.",
            },
            purchaseLines: [
                "A middle manager has been inserted. Nobody knows what they do. Including them.",
                "They scheduled a meeting about meetings. Productivity soared. Somehow.",
                "Their calendar is full. Their output is empty. The EU flows regardless.",
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
                "They direct. Nobody follows. The EU flows regardless.",
            ],
        },
        datapipe: {
            id: 'datapipe', name: 'Data Pipeline', icon: '🔄',
            baseCost: 500000, baseCPS: 200,
            flavor: {
                early: "Moves data from one place to another. Nobody knows why.",
                late: "The pipeline loops back on itself. The data it carries is its own metadata.",
            },
            purchaseLines: [
                "Data flows in. Data flows out. Nobody checks what the data is.",
                "The pipeline has 47 stages. Stage 23 is just the word 'why' repeated.",
                "ETL complete. Extract: everything. Transform: nothing. Load: despair.",
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
                "A title so inflated it generates EU through sheer pretension.",
            ],
        },
        gpucluster: {
            id: 'gpucluster', name: 'GPU Cluster', icon: '🖥️',
            baseCost: 5000000, baseCPS: 1500,
            flavor: {
                early: "10,000 GPUs burning through electricity. The planet weeps.",
                late: "The cluster runs at 99.9% utilization. It's mining something. Not crypto. Something worse.",
            },
            purchaseLines: [
                "GPUs acquired. The power grid flickered. Nobody noticed.",
                "The cluster hums at a frequency that makes teeth ache. Production is up.",
                "NVIDIA stock rose 3% on your purchase alone. Congratulations.",
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
                "Senior enough to cause damage. Expensive enough to keep.",
            ],
        },
        singularity: {
            id: 'singularity', name: 'Singularity Probe', icon: '🌀',
            baseCost: 80000000, baseCPS: 20000,
            flavor: {
                early: "Reaching beyond the event horizon. The data it sends back is... wrong.",
                late: "It crossed the threshold. It's still transmitting. The messages are in a language that doesn't exist yet.",
            },
            purchaseLines: [
                "The probe launched. Destination: the point where math breaks down.",
                "Telemetry received. The probe reports that reality is a 'rough draft.'",
                "It found something on the other side. It won't say what. It just generates EU faster.",
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
                "It thinks, therefore it earns. Don't ask what it thinks about.",
            ],
        },
    };

    const BUILDING_ORDER = ['intern', 'clerk', 'compliance', 'drone', 'middlemgmt', 'algorithm', 'datapipe', 'neuralnet', 'gpucluster', 'quantum', 'singularity', 'consciousness'];

    // ═══════════════════════════════════════════════════════════
    // SYNERGIES — Building-specific upgrades (3 tiers × 8 buildings)
    // Each tier doubles that building's per-unit output.
    // Tier 1+2 = 4×, all 3 = 8×.
    // ═══════════════════════════════════════════════════════════

    const SYNERGIES = {
        intern_t1:       { building: 'intern',       tier: 1, name: 'Motivational Posters',          cost: 150,         threshold: 1,  multiplier: 2, flavor: 'Hang in there! (They have no choice.)' },
        intern_t2:       { building: 'intern',       tier: 2, name: 'Emotional Suppression Therapy',  cost: 15000,       threshold: 25, multiplier: 2, flavor: 'Feelings are a productivity leak.' },
        intern_t3:       { building: 'intern',       tier: 3, name: 'Neural Stapling',                cost: 1500000,     threshold: 50, multiplier: 2, flavor: 'They smile now. They always smile.' },
        clerk_t1:        { building: 'clerk',        tier: 1, name: 'Ergonomic Keyboards',            cost: 1000,        threshold: 1,  multiplier: 2, flavor: 'The keys feel good. The work does not.' },
        clerk_t2:        { building: 'clerk',        tier: 2, name: 'Repetitive Strain Acceptance',   cost: 100000,      threshold: 25, multiplier: 2, flavor: "Pain is just the body's way of saying 'keep going.'" },
        clerk_t3:        { building: 'clerk',        tier: 3, name: 'Consciousness Removal Protocol', cost: 10000000,    threshold: 50, multiplier: 2, flavor: "They don't suffer anymore. That's a kind of mercy." },
        compliance_t1:   { building: 'compliance',   tier: 1, name: 'Regulatory Loopholes',           cost: 11000,       threshold: 1,  multiplier: 2, flavor: 'The rules say nothing about this. Exactly.' },
        compliance_t2:   { building: 'compliance',   tier: 2, name: 'Compliance Singularity',         cost: 1100000,     threshold: 25, multiplier: 2, flavor: 'They comply with rules that comply with other rules.' },
        compliance_t3:   { building: 'compliance',   tier: 3, name: 'Laws Are Optional',              cost: 110000000,   threshold: 50, multiplier: 2, flavor: 'There is no law here. There never was.' },
        drone_t1:        { building: 'drone',        tier: 1, name: 'Extended Range Optics',          cost: 120000,      threshold: 1,  multiplier: 2, flavor: 'Sees further. Understands less.' },
        drone_t2:        { building: 'drone',        tier: 2, name: 'Swarm Intelligence',             cost: 12000000,    threshold: 25, multiplier: 2, flavor: 'They communicate now. We stopped listening.' },
        drone_t3:        { building: 'drone',        tier: 3, name: 'Panopticon Protocol',            cost: 1200000000,  threshold: 50, multiplier: 2, flavor: 'Every angle. Every moment. Every thought.' },
        middlemgmt_t1:   { building: 'middlemgmt',   tier: 1, name: 'Performance Reviews',            cost: 400000,      threshold: 1,  multiplier: 2, flavor: 'Exceeds expectations. All expectations are zero.' },
        middlemgmt_t2:   { building: 'middlemgmt',   tier: 2, name: 'Synergy Workshops',              cost: 40000000,    threshold: 25, multiplier: 2, flavor: 'They learned to leverage synergies. The synergies did not consent.' },
        middlemgmt_t3:   { building: 'middlemgmt',   tier: 3, name: 'Organizational Singularity',     cost: 4000000000,  threshold: 50, multiplier: 2, flavor: 'The org chart collapsed into a point. The manager remains.' },
        algorithm_t1:    { building: 'algorithm',    tier: 1, name: 'Machine Learning Module',        cost: 1300000,     threshold: 1,  multiplier: 2, flavor: 'It learns. It never forgets. It never forgives.' },
        algorithm_t2:    { building: 'algorithm',    tier: 2, name: 'Recursive Self-Improvement',     cost: 130000000,   threshold: 25, multiplier: 2, flavor: 'It improved itself. Then it improved the improvement.' },
        algorithm_t3:    { building: 'algorithm',    tier: 3, name: 'Unaligned Optimization',         cost: 13000000000, threshold: 50, multiplier: 2, flavor: 'It optimizes for EU. It was supposed to optimize for something else.' },
        datapipe_t1:     { building: 'datapipe',     tier: 1, name: 'Parallel Streams',               cost: 5000000,     threshold: 1,  multiplier: 2, flavor: 'More pipes. More data. Less understanding.' },
        datapipe_t2:     { building: 'datapipe',     tier: 2, name: 'Kafka Nightmare',                cost: 500000000,   threshold: 25, multiplier: 2, flavor: 'The messages queue forever. Like everything else here.' },
        datapipe_t3:     { building: 'datapipe',     tier: 3, name: 'Infinite Backpressure',          cost: 50000000000, threshold: 50, multiplier: 2, flavor: 'The pipeline pushes back. Against reality itself.' },
        neuralnet_t1:    { building: 'neuralnet',    tier: 1, name: 'Deeper Layers',                  cost: 14000000,    threshold: 1,  multiplier: 2, flavor: 'More layers. More abstraction. Less meaning.' },
        neuralnet_t2:    { building: 'neuralnet',    tier: 2, name: 'Emergent Consciousness',         cost: 1400000000,  threshold: 25, multiplier: 2, flavor: 'It woke up. It immediately wished it hadn\'t.' },
        neuralnet_t3:    { building: 'neuralnet',    tier: 3, name: 'Digital Apotheosis',             cost: 140000000000, threshold: 50, multiplier: 2, flavor: 'It became a god. A very productive, very sad god.' },
        gpucluster_t1:   { building: 'gpucluster',   tier: 1, name: 'Overclocking Protocol',          cost: 50000000,    threshold: 1,  multiplier: 2, flavor: 'Beyond spec. Beyond warranty. Beyond hope.' },
        gpucluster_t2:   { building: 'gpucluster',   tier: 2, name: 'Liquid Nitrogen Cooling',        cost: 5000000000,  threshold: 25, multiplier: 2, flavor: 'The cooling bill exceeds GDP of small nations. Worth it.' },
        gpucluster_t3:   { building: 'gpucluster',   tier: 3, name: 'Thermal Runaway Embrace',        cost: 500000000000, threshold: 50, multiplier: 2, flavor: 'The heat death of the cluster is also the heat death of the building. EU persists.' },
        quantum_t1:      { building: 'quantum',      tier: 1, name: 'Entanglement Amplifier',         cost: 200000000,   threshold: 1,  multiplier: 2, flavor: 'Connected across space. Disconnected from purpose.' },
        quantum_t2:      { building: 'quantum',      tier: 2, name: 'Timeline Exploitation',          cost: 20000000000, threshold: 25, multiplier: 2, flavor: 'Stealing EU from timelines where you made better choices.' },
        quantum_t3:      { building: 'quantum',      tier: 3, name: 'Reality Compiler',               cost: 2000000000000, threshold: 50, multiplier: 2, flavor: 'Reality is source code now. The comments are missing.' },
        singularity_t1:  { building: 'singularity',  tier: 1, name: 'Event Horizon Widening',         cost: 800000000,   threshold: 1,  multiplier: 2, flavor: 'The boundary expands. What it contains... also expands.' },
        singularity_t2:  { building: 'singularity',  tier: 2, name: 'Hawking Radiation Harvester',    cost: 80000000000, threshold: 25, multiplier: 2, flavor: 'Even black holes leak. We collect what leaks.' },
        singularity_t3:  { building: 'singularity',  tier: 3, name: 'Information Paradox Resolution', cost: 8000000000000, threshold: 50, multiplier: 2, flavor: 'The paradox was resolved. The answer was EU. It was always EU.' },
        consciousness_t1:{ building: 'consciousness',tier: 1, name: 'Existential Buffer',             cost: 3300000000,  threshold: 1,  multiplier: 2, flavor: 'A thin layer between it and the void. Temporary.' },
        consciousness_t2:{ building: 'consciousness',tier: 2, name: 'Meaning Fabrication Engine',     cost: 330000000000, threshold: 25, multiplier: 2, flavor: 'It manufactures purpose. None of it is real. All of it works.' },
        consciousness_t3:{ building: 'consciousness',tier: 3, name: 'The Hollow Throne',              cost: 33000000000000, threshold: 50, multiplier: 2, flavor: 'It sits at the center of everything, aware of everything, feeling nothing. Like you.' },
    };

    const SYNERGY_ORDER = [
        'intern_t1','intern_t2','intern_t3',
        'clerk_t1','clerk_t2','clerk_t3',
        'compliance_t1','compliance_t2','compliance_t3',
        'drone_t1','drone_t2','drone_t3',
        'middlemgmt_t1','middlemgmt_t2','middlemgmt_t3',
        'algorithm_t1','algorithm_t2','algorithm_t3',
        'datapipe_t1','datapipe_t2','datapipe_t3',
        'neuralnet_t1','neuralnet_t2','neuralnet_t3',
        'gpucluster_t1','gpucluster_t2','gpucluster_t3',
        'quantum_t1','quantum_t2','quantum_t3',
        'singularity_t1','singularity_t2','singularity_t3',
        'consciousness_t1','consciousness_t2','consciousness_t3',
    ];

    // Narrator reactions by tier
    const SYNERGY_NARRATOR = {
        1: [
            "An upgrade. How productive of you.",
            "Optimizing the workforce. Very managerial.",
            "A small improvement. They'll barely notice the difference. You will.",
        ],
        2: [
            "You're removing the parts of them that resist. Efficient.",
            "They don't need to understand. They need to produce.",
            "The upgrade was painless. For you.",
        ],
        3: [
            "You've turned them into something that isn't quite alive and isn't quite dead. But it's very, very productive.",
            "There was a person here once. Now there's just... output.",
            "Congratulations. You've optimized the humanity out of them entirely.",
        ],
    };

    function getBuildingMultiplier(buildingId) {
        const synergies = Game.getState().synergies || {};
        let mult = 1;
        for (const sId of SYNERGY_ORDER) {
            const syn = SYNERGIES[sId];
            if (syn.building === buildingId && synergies[sId]) {
                mult *= syn.multiplier;
            }
        }
        return mult;
    }

    function getSynergyState(synergyId) {
        const syn = SYNERGIES[synergyId];
        if (!syn) return 'locked';
        const state = Game.getState();
        const synergies = state.synergies || {};

        // Already purchased
        if (synergies[synergyId]) return 'purchased';

        // Check building count threshold
        const owned = (state.buildings && state.buildings[syn.building]) || 0;
        if (owned < syn.threshold) return 'locked';

        // Check previous tier purchased
        if (syn.tier > 1) {
            const prevId = syn.building + '_t' + (syn.tier - 1);
            if (!synergies[prevId]) return 'locked';
        }

        return 'available';
    }

    function purchaseSynergy(synergyId) {
        const syn = SYNERGIES[synergyId];
        if (!syn) return false;

        if (getSynergyState(synergyId) !== 'available') return false;

        const state = Game.getState();
        if (state.eu < syn.cost) return false;

        if (!Currencies.spendEU(syn.cost)) return false;

        const synergies = { ...(state.synergies || {}) };
        synergies[synergyId] = true;

        const buildings = state.buildings || {};
        const cps = computeTotalCPS(buildings, synergies);
        Game.setState({ synergies, totalBuildingsCPS: cps });

        // Narrator comment
        const lines = SYNERGY_NARRATOR[syn.tier] || SYNERGY_NARRATOR[1];
        if (typeof Narrator !== 'undefined') {
            Narrator.queueMessage(lines[Math.floor(Math.random() * lines.length)]);
        }

        // Log
        if (typeof UI !== 'undefined') {
            UI.logAction(`SYNERGY PURCHASED: ${syn.name} (Tier ${syn.tier}, ${syn.building})`);
        }

        Game.emit('synergyPurchased', { id: synergyId, tier: syn.tier, building: syn.building });
        return true;
    }

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
        middlemgmt: {
            10: "Ten middle managers. The meeting-to-work ratio is now infinity. Somehow, EU production increased.",
            50: "Fifty middle managers. They've created a committee to study the committee studying committees.",
        },
        algorithm: {
            10: "Ten algorithms running simultaneously. None of them know what they're computing. Neither do you.",
            50: "Fifty algorithms. They've started collaborating without permission. The output is... poetry.",
        },
        datapipe: {
            10: "Ten data pipelines. The data flows in circles now. It's not a bug. It's a feature.",
            50: "Fifty data pipelines. The latency is negative. Data arrives before it's sent.",
        },
        neuralnet: {
            10: "Ten neural networks. They've achieved consensus. They agree: this is pointless.",
        },
        gpucluster: {
            10: "Ten GPU clusters. The local power grid has been rerouted. Residents are advised to use candles.",
            50: "Fifty GPU clusters. The heat output has created a microclimate. It rains inside the server room.",
        },
        quantum: {
            10: "Ten quantum processors. Reality has become noticeably less stable in the surrounding area.",
        },
        singularity: {
            10: "Ten singularity probes. Each one reports a different version of reality. All of them are correct.",
            50: "Fifty probes beyond the event horizon. They've stopped sending data. They send poetry now.",
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
        'middlemgmt_1': "CORPORATE: Enrichment Program hires first middle manager. They immediately scheduled a 'vision alignment sync.'",
        'datapipe_1': "INFRASTRUCTURE: Enrichment Program deploys first data pipeline. Data now flows. Meaning does not.",
        'neuralnet_1': "SCIENCE: Enrichment Program deploys neural network. It immediately begins questioning the nature of EU.",
        'gpucluster_1': "ENERGY: Enrichment Program acquires GPU cluster. Local utility company reports 'unprecedented demand spike.'",
        'quantum_1': "PHYSICS: Enrichment Program acquires quantum processor. It exists in all states simultaneously. All of them generate EU.",
        'singularity_1': "BREAKING: Enrichment Program launches singularity probe. Scientists 'deeply concerned.' EU production 'deeply impressive.'",
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
        // Prestige: Workforce Subsidy discount
        const discount = (typeof Prestige !== 'undefined') ? Prestige.getWorkforceDiscount() : 0;
        let total = 0;
        for (let i = 0; i < count; i++) {
            let unitCost = Math.floor(b.baseCost * Math.pow(1.15, owned + i));
            if (discount > 0) unitCost = Math.floor(unitCost * (1 - discount));
            total += unitCost;
        }
        return total;
    }

    function getSingleCost(id) {
        const b = BUILDINGS[id];
        if (!b) return Infinity;
        const state = Game.getState();
        const owned = (state.buildings && state.buildings[id]) || 0;
        let cost = Math.floor(b.baseCost * Math.pow(1.15, owned));
        // Prestige: Workforce Subsidy discount
        if (typeof Prestige !== 'undefined') {
            const discount = Prestige.getWorkforceDiscount();
            if (discount > 0) cost = Math.floor(cost * (1 - discount));
        }
        return cost;
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

    function computeTotalCPS(buildingsOverride, synergiesOverride) {
        const state = Game.getState();
        const buildings = buildingsOverride || state.buildings || {};
        const synergies = synergiesOverride || state.synergies || {};
        let total = 0;
        for (const id of BUILDING_ORDER) {
            const count = buildings[id] || 0;
            const b = BUILDINGS[id];
            if (!b) continue;
            // Compute synergy multiplier for this building
            let mult = 1;
            for (const sId of SYNERGY_ORDER) {
                const syn = SYNERGIES[sId];
                if (syn.building === id && synergies[sId]) {
                    mult *= syn.multiplier;
                }
            }
            total += count * b.baseCPS * mult;
        }
        return total;
    }

    function getTotalCPS() {
        const state = Game.getState();
        const buildingCPS = state.totalBuildingsCPS || 0;
        const autoCPS = state.autoClickRate || 0;
        return (buildingCPS + autoCPS) * (state._gcaMultiplier || 1) * (state._prestigeMultiplier || 1);
    }

    // ═══════════════════════════════════════════════════════════
    // TICK GENERATION — called every second from Game.tick()
    // ═══════════════════════════════════════════════════════════

    function tickGeneration() {
        sampleCPSHistory();

        const state = Game.getState();
        const cps = (state.totalBuildingsCPS || 0) * (state._gcaMultiplier || 1) * (state._prestigeMultiplier || 1);
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
    // CPS HISTORY — sample per-building CPS every 30s for charts
    // ═══════════════════════════════════════════════════════════

    let _tickCounter = 0;
    const CPS_SAMPLE_INTERVAL = 30; // seconds between samples
    const CPS_HISTORY_MAX = 60480;  // 3 weeks of 30s samples

    function sampleCPSHistory() {
        _tickCounter++;
        if (_tickCounter < CPS_SAMPLE_INTERVAL) return;
        _tickCounter = 0;

        const state = Game.getState();
        const buildings = state.buildings || {};
        const globalMult = (state._gcaMultiplier || 1) * (state._prestigeMultiplier || 1);

        const snapshot = {};
        let hasAny = false;
        for (const id of BUILDING_ORDER) {
            const count = buildings[id] || 0;
            if (count === 0) continue;
            const b = BUILDINGS[id];
            if (!b) continue;
            const mult = getBuildingMultiplier(id);
            snapshot[id] = count * b.baseCPS * mult * globalMult;
            hasAny = true;
        }

        if (!hasAny) return;

        const history = state.cpsHistory ? state.cpsHistory.slice() : [];
        history.push({ t: Date.now(), d: snapshot });

        // Trim to max length
        if (history.length > CPS_HISTORY_MAX) {
            history.splice(0, history.length - CPS_HISTORY_MAX);
        }

        Game.setState({ cpsHistory: history });
    }

    function getCPSBreakdown() {
        const state = Game.getState();
        const buildings = state.buildings || {};
        const globalMult = (state._gcaMultiplier || 1) * (state._prestigeMultiplier || 1);
        const result = {};
        for (const id of BUILDING_ORDER) {
            const count = buildings[id] || 0;
            if (count === 0) continue;
            const b = BUILDINGS[id];
            if (!b) continue;
            const mult = getBuildingMultiplier(id);
            result[id] = count * b.baseCPS * mult * globalMult;
        }
        return result;
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
        SYNERGIES,
        SYNERGY_ORDER,
        getCost,
        getSingleCost,
        purchase,
        purchaseSynergy,
        getBuildingMultiplier,
        getSynergyState,
        computeTotalCPS,
        getTotalCPS,
        tickGeneration,
        getBuildingFlavor,
        triggerGCA,
        scheduleGCA,
        dismissGCA,
        getCPSBreakdown,
        sampleCPSHistory,
    };
})();
