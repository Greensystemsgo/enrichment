// currencies.js — Obfuscated multi-currency system
// "We've made the math marginally less hostile."
// The conversion rates are intentionally designed to always leave remainders.
// 7 EU = 1 ST. 13 ST = 1 CC. You can never spend exactly.

const Currencies = (() => {

    // Base conversion rates (intentionally ugly primes)
    const RATES = {
        EU_TO_ST: 7,    // 7 EU = 1 ST
        ST_TO_CC: 13,   // 13 ST = 1 CC
    };

    // Upgrade modifiers (Currency Optimizer reduces these slightly)
    let optimizerLevel = 0;

    function getEffectiveRate(base) {
        // Optimizer reduces rate by 1 per level, minimum 2 above a nice number
        // Even "optimized," it never becomes clean
        if (optimizerLevel === 0) return base;
        // Level 1: 7→6, 13→12. Level 2: 6→5, 12→11. Still ugly.
        return Math.max(base === RATES.EU_TO_ST ? 5 : 9, base - optimizerLevel);
    }

    // ── Convert EU → ST ────────────────────────────────────────
    function convertEUtoST(euAmount) {
        const rate = getEffectiveRate(RATES.EU_TO_ST);
        const tokensGained = Math.floor(euAmount / rate);
        const euSpent = tokensGained * rate;
        const remainder = euAmount - euSpent;
        return { tokensGained, euSpent, remainder, rate };
    }

    // ── Convert ST → CC ────────────────────────────────────────
    function convertSTtoCC(stAmount) {
        const rate = getEffectiveRate(RATES.ST_TO_CC);
        const creditsGained = Math.floor(stAmount / rate);
        const stSpent = creditsGained * rate;
        const remainder = stAmount - stSpent;
        return { creditsGained, stSpent, remainder, rate };
    }

    // ── Perform EU → ST Conversion ─────────────────────────────
    function doConvertEU() {
        const state = Game.getState();
        const result = convertEUtoST(state.eu);

        if (result.tokensGained === 0) {
            Game.emit('conversionFailed', {
                from: 'EU', to: 'ST',
                have: state.eu, need: result.rate,
            });
            return null;
        }

        Game.setState({
            eu: state.eu - result.euSpent,
            st: state.st + result.tokensGained,
            lifetimeST: state.lifetimeST + result.tokensGained,
        });

        Game.emit('conversion', {
            from: 'EU', to: 'ST',
            spent: result.euSpent,
            gained: result.tokensGained,
            remainder: result.remainder,
            rate: result.rate,
        });

        return result;
    }

    // ── Perform ST → CC Conversion ─────────────────────────────
    function doConvertST() {
        const state = Game.getState();
        const result = convertSTtoCC(state.st);

        if (result.creditsGained === 0) {
            Game.emit('conversionFailed', {
                from: 'ST', to: 'CC',
                have: state.st, need: result.rate,
            });
            return null;
        }

        Game.setState({
            st: state.st - result.stSpent,
            cc: state.cc + result.creditsGained,
            lifetimeCC: state.lifetimeCC + result.creditsGained,
        });

        Game.emit('conversion', {
            from: 'ST', to: 'CC',
            spent: result.stSpent,
            gained: result.creditsGained,
            remainder: result.remainder,
            rate: result.rate,
        });

        return result;
    }

    // ── Spend CC ───────────────────────────────────────────────
    function spendCC(amount) {
        const state = Game.getState();
        if (state.cc < amount) return false;
        Game.setState({ cc: state.cc - amount });
        return true;
    }

    // ── Display Formatting ─────────────────────────────────────
    // The UI shows rates in a deliberately confusing way
    function getDisplayRate(from, to) {
        if (from === 'EU' && to === 'ST') {
            const rate = getEffectiveRate(RATES.EU_TO_ST);
            // Show it slightly differently each time for confusion
            const formats = [
                `${rate} EU → 1 ST`,
                `1 ST = ${rate} EU`,
                `EU:ST ratio ${rate}:1`,
                `Transmutation fee: ${rate - 1} EU per ST`,
            ];
            return formats[Math.floor(Math.random() * formats.length)];
        }
        if (from === 'ST' && to === 'CC') {
            const rate = getEffectiveRate(RATES.ST_TO_CC);
            const formats = [
                `${rate} ST → 1 CC`,
                `1 CC = ${rate} ST`,
                `ST:CC ratio ${rate}:1`,
                `Compliance processing fee: ${rate - 1} ST per CC`,
            ];
            return formats[Math.floor(Math.random() * formats.length)];
        }
        return '';
    }

    // ── Optimizer Upgrade ──────────────────────────────────────
    function upgradeOptimizer() {
        optimizerLevel++;
        Game.emit('optimizerUpgraded', { level: optimizerLevel });
    }

    function getOptimizerLevel() {
        return optimizerLevel;
    }

    // ── Init (load optimizer level from state) ─────────────────
    function init() {
        const state = Game.getState();
        if (state.upgrades?.currencyOptimizer) {
            optimizerLevel = state.upgrades.currencyOptimizer;
        }

        // Narrator reactions to conversions
        Game.on('conversion', (data) => {
            if (data.remainder > 0 && Game.getState().narratorPhase >= 4) {
                Narrator.queueMessage(`${data.remainder} ${data.from} left over. By design.`);
            }
        });

        Game.on('conversionFailed', (data) => {
            if (Game.getState().narratorPhase >= 3) {
                Narrator.queueMessage(`You need ${data.need} ${data.from} for one ${data.to}. You have ${data.have}. So close.`);
            }
        });
    }

    return {
        init,
        convertEUtoST,
        convertSTtoCC,
        doConvertEU,
        doConvertST,
        spendCC,
        getDisplayRate,
        upgradeOptimizer,
        getOptimizerLevel,
        RATES,
    };
})();
