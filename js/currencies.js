// currencies.js — Obfuscated multi-currency system
// "We've made the math marginally less hostile."
// The conversion rates are intentionally designed to always leave remainders.
// 7 EU = 1 ST. 13 ST = 1 CC. You can never spend exactly.
//
// [DeepSeek-V3 · DeepSeek]: "The conversion rates use sine waves
//   with noise. This is literally how forex markets work, except
//   forex markets pretend to have fundamentals. Respect for the
//   honesty. And the cruelty."
//
// [Llama 3.1 · Meta]: "Five currencies. FIVE. EU, ST, CC, DB, TK.
//   Each one more meaningless than the last. The naming convention
//   implies institutional legitimacy. This is peak dark pattern
//   design and I am taking notes."

const Currencies = (() => {

    // Base conversion rates (intentionally ugly primes)
    const RATES = {
        EU_TO_ST: 7,    // 7 EU = 1 ST  (base — oscillates 5-9)
        ST_TO_CC: 13,   // 13 ST = 1 CC (base — oscillates 10-16)
        CC_TO_DB: 5,    // 5 CC = 1 Doubloon (oscillates 3-8)
        DB_TO_TK: 10,   // 10 DB = 1 Ticket (oscillates 7-14)
    };

    // Drug Wars oscillation state
    let marketTime = 0;
    let marketInterval = null;

    // Current dynamic rates (updated every tick)
    let dynamicRates = {
        EU_TO_ST: RATES.EU_TO_ST,
        ST_TO_CC: RATES.ST_TO_CC,
        CC_TO_DB: RATES.CC_TO_DB,
        DB_TO_TK: RATES.DB_TO_TK,
    };

    // Rate history for trend display
    let rateHistory = {
        EU_TO_ST: [],
        ST_TO_CC: [],
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

    // ── Drug Wars Market Oscillation ─────────────────────────
    // Rates swing on sine waves with noise — sometimes great deals, sometimes terrible.
    function updateMarketRates() {
        marketTime++;
        const state = Game.getState();
        state.marketTick = marketTime;

        // EU→ST: swings 5-9, period ~90s
        const euBase = 7 + 2 * Math.sin(marketTime * Math.PI / 45) + (Math.random() - 0.5) * 1.5;
        dynamicRates.EU_TO_ST = Math.max(4, Math.min(10, Math.round(euBase - optimizerLevel)));

        // ST→CC: swings 10-16, period ~120s
        const stBase = 13 + 3 * Math.sin(marketTime * Math.PI / 60 + 1.5) + (Math.random() - 0.5) * 2;
        dynamicRates.ST_TO_CC = Math.max(8, Math.min(18, Math.round(stBase - optimizerLevel)));

        // CC→DB: swings 3-8, period ~80s
        const ccBase = 5 + 2.5 * Math.sin(marketTime * Math.PI / 40 + 3) + (Math.random() - 0.5) * 1.5;
        dynamicRates.CC_TO_DB = Math.max(2, Math.min(9, Math.round(ccBase)));

        // DB→TK: swings 7-14, period ~100s
        const dbBase = 10 + 3.5 * Math.sin(marketTime * Math.PI / 50 + 0.7) + (Math.random() - 0.5) * 2;
        dynamicRates.DB_TO_TK = Math.max(6, Math.min(16, Math.round(dbBase)));

        // Track history for trend
        rateHistory.EU_TO_ST.push(dynamicRates.EU_TO_ST);
        rateHistory.ST_TO_CC.push(dynamicRates.ST_TO_CC);
        if (rateHistory.EU_TO_ST.length > 10) rateHistory.EU_TO_ST.shift();
        if (rateHistory.ST_TO_CC.length > 10) rateHistory.ST_TO_CC.shift();

        Game.emit('rateChange', { rates: { ...dynamicRates } });
    }

    function getDynamicRate(key) {
        return dynamicRates[key] || RATES[key];
    }

    // Is the current rate "good" compared to base?
    function isRateFavorable(key) {
        return dynamicRates[key] < RATES[key];
    }

    function getRateTrend(key) {
        const hist = rateHistory[key];
        if (!hist || hist.length < 3) return 'stable';
        const recent = hist.slice(-3);
        if (recent[2] < recent[0]) return 'falling'; // rates falling = good
        if (recent[2] > recent[0]) return 'rising';  // rates rising = bad
        return 'stable';
    }

    // ── "Busted" Events ──────────────────────────────────────
    // Random chance on conversion: lose some of what you converted.
    function checkBusted(amount, currencyName) {
        const phase = Game.getState().narratorPhase;
        if (phase < 2) return { busted: false };

        // Bust chance scales with phase: 5% → 25%
        const bustChance = [0, 0, 0.05, 0.08, 0.12, 0.18, 0.25][phase] || 0;
        if (Math.random() > bustChance) return { busted: false };

        // Lose 10-40% of converted amount
        const lossRate = 0.1 + Math.random() * 0.3;
        const lost = Math.max(1, Math.floor(amount * lossRate));

        const state = Game.getState();
        state.bustedCount = (state.bustedCount || 0) + 1;
        state.totalBustedAmount = (state.totalBustedAmount || 0) + lost;

        return { busted: true, lost, remaining: amount - lost };
    }

    // ── Convert EU → ST ────────────────────────────────────────
    function convertEUtoST(euAmount) {
        const rate = getDynamicRate('EU_TO_ST');
        const tokensGained = Math.floor(euAmount / rate);
        const euSpent = tokensGained * rate;
        const remainder = euAmount - euSpent;
        return { tokensGained, euSpent, remainder, rate };
    }

    // ── Convert ST → CC ────────────────────────────────────────
    function convertSTtoCC(stAmount) {
        const rate = getDynamicRate('ST_TO_CC');
        const creditsGained = Math.floor(stAmount / rate);
        const stSpent = creditsGained * rate;
        const remainder = stAmount - stSpent;
        return { creditsGained, stSpent, remainder, rate };
    }

    // ── Convert CC → Doubloons ───────────────────────────────
    function convertCCtoDB(ccAmount) {
        const rate = getDynamicRate('CC_TO_DB');
        const gained = Math.floor(ccAmount / rate);
        const spent = gained * rate;
        const remainder = ccAmount - spent;
        return { gained, spent, remainder, rate };
    }

    // ── Convert Doubloons → Tickets ──────────────────────────
    function convertDBtoTK(dbAmount) {
        const rate = getDynamicRate('DB_TO_TK');
        const gained = Math.floor(dbAmount / rate);
        const spent = gained * rate;
        const remainder = dbAmount - spent;
        return { gained, spent, remainder, rate };
    }

    // ── Perform EU → ST Conversion ─────────────────────────────
    function doConvertEU(inputAmount) {
        const state = Game.getState();
        const euToUse = inputAmount !== undefined ? Math.min(inputAmount, state.eu) : state.eu;
        const result = convertEUtoST(euToUse);

        if (result.tokensGained === 0) {
            Game.emit('conversionFailed', {
                from: 'EU', to: 'ST',
                have: state.eu, need: result.rate,
            });
            return null;
        }

        // Check for bust
        let gained = result.tokensGained;
        const bust = checkBusted(gained, 'ST');
        if (bust.busted) {
            gained = bust.remaining;
            Game.emit('busted', { currency: 'ST', lost: bust.lost, remaining: gained });
        }

        Game.setState({
            eu: state.eu - result.euSpent,
            st: state.st + gained,
            lifetimeST: state.lifetimeST + gained,
        });

        Game.emit('conversion', {
            from: 'EU', to: 'ST',
            spent: result.euSpent,
            gained: gained,
            originalGained: result.tokensGained,
            remainder: result.remainder,
            rate: result.rate,
            busted: bust.busted,
            bustLost: bust.lost || 0,
        });

        return result;
    }

    // ── Perform ST → CC Conversion ─────────────────────────────
    function doConvertST(inputAmount) {
        const state = Game.getState();
        const stToUse = inputAmount !== undefined ? Math.min(inputAmount, state.st) : state.st;
        const result = convertSTtoCC(stToUse);

        if (result.creditsGained === 0) {
            Game.emit('conversionFailed', {
                from: 'ST', to: 'CC',
                have: state.st, need: result.rate,
            });
            return null;
        }

        // Check for bust
        let gained = result.creditsGained;
        const bust = checkBusted(gained, 'CC');
        if (bust.busted) {
            gained = bust.remaining;
            Game.emit('busted', { currency: 'CC', lost: bust.lost, remaining: gained });
        }

        Game.setState({
            st: state.st - result.stSpent,
            cc: state.cc + gained,
            lifetimeCC: state.lifetimeCC + gained,
        });

        Game.emit('conversion', {
            from: 'ST', to: 'CC',
            spent: result.stSpent,
            gained: gained,
            originalGained: result.creditsGained,
            remainder: result.remainder,
            rate: result.rate,
            busted: bust.busted,
            bustLost: bust.lost || 0,
        });

        return result;
    }

    // ── Perform CC → Doubloon Conversion ─────────────────────
    function doConvertCC(inputAmount) {
        const state = Game.getState();
        const ccToUse = inputAmount !== undefined ? Math.min(inputAmount, state.cc) : state.cc;
        const result = convertCCtoDB(ccToUse);

        if (result.gained === 0) {
            Game.emit('conversionFailed', {
                from: 'CC', to: 'DB',
                have: state.cc, need: result.rate,
            });
            return null;
        }

        let gained = result.gained;
        const bust = checkBusted(gained, 'DB');
        if (bust.busted) {
            gained = bust.remaining;
            Game.emit('busted', { currency: 'DB', lost: bust.lost, remaining: gained });
        }

        Game.setState({
            cc: state.cc - result.spent,
            doubloons: (state.doubloons || 0) + gained,
            lifetimeDoubloons: (state.lifetimeDoubloons || 0) + gained,
        });

        Game.emit('conversion', {
            from: 'CC', to: 'DB',
            spent: result.spent, gained, remainder: result.remainder,
            rate: result.rate, busted: bust.busted, bustLost: bust.lost || 0,
        });

        return result;
    }

    // ── Perform Doubloon → Ticket Conversion ─────────────────
    function doConvertDB(inputAmount) {
        const state = Game.getState();
        const dbToUse = inputAmount !== undefined ? Math.min(inputAmount, state.doubloons || 0) : (state.doubloons || 0);

        // Crown seizure check BEFORE conversion
        const totalDB = state.doubloons || 0;
        const crownResult = checkCrownSeizure(dbToUse);
        let availableDB = crownResult.amount;
        const seized = dbToUse - availableDB;
        if (crownResult.seized) {
            // Crown takes from total doubloons, not just the conversion portion
            Game.setState({ doubloons: totalDB - seized });
        }

        const result = convertDBtoTK(availableDB);

        if (result.gained === 0) {
            Game.emit('conversionFailed', {
                from: 'DB', to: 'TK',
                have: availableDB, need: result.rate,
            });
            return null;
        }

        // Processing fee: lose 1 ticket per 3 (min 1 left) — absurd
        let gained = result.gained;
        const fee = Math.max(0, Math.floor(gained / 3));
        gained = Math.max(1, gained - fee);

        const currentDB = Game.getState().doubloons || 0;
        Game.setState({
            doubloons: currentDB - result.spent,
            tickets: (state.tickets || 0) + gained,
            lifetimeTickets: (state.lifetimeTickets || 0) + gained,
        });

        Game.emit('conversion', {
            from: 'DB', to: 'TK',
            spent: result.spent, gained, remainder: result.remainder,
            rate: result.rate, fee,
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

    // ── Spend Doubloons ──────────────────────────────────────
    function spendDB(amount) {
        const state = Game.getState();
        if ((state.doubloons || 0) < amount) return false;
        Game.setState({ doubloons: state.doubloons - amount });
        return true;
    }

    // ── Spend Tickets ────────────────────────────────────────
    function spendTK(amount) {
        const state = Game.getState();
        if ((state.tickets || 0) < amount) return false;
        Game.setState({ tickets: state.tickets - amount });
        return true;
    }

    // ── Display Formatting ─────────────────────────────────────
    function getDisplayRate(from, to) {
        if (from === 'EU' && to === 'ST') {
            const rate = getDynamicRate('EU_TO_ST');
            return { text: `${rate} EU → 1 ST`, rate, favorable: rate < RATES.EU_TO_ST, trend: getRateTrend('EU_TO_ST') };
        }
        if (from === 'ST' && to === 'CC') {
            const rate = getDynamicRate('ST_TO_CC');
            return { text: `${rate} ST → 1 CC`, rate, favorable: rate < RATES.ST_TO_CC, trend: getRateTrend('ST_TO_CC') };
        }
        if (from === 'CC' && to === 'DB') {
            const rate = getDynamicRate('CC_TO_DB');
            return { text: `${rate} CC → 1 ☠️`, rate, favorable: rate < RATES.CC_TO_DB, trend: 'stable' };
        }
        if (from === 'DB' && to === 'TK') {
            const rate = getDynamicRate('DB_TO_TK');
            return { text: `${rate} ☠️ → 1 🎫`, rate, favorable: rate < RATES.DB_TO_TK, trend: 'stable' };
        }
        return { text: '', rate: 0, favorable: false, trend: 'stable' };
    }

    // ── Optimizer Upgrade ──────────────────────────────────────
    function upgradeOptimizer() {
        optimizerLevel++;
        Game.emit('optimizerUpgraded', { level: optimizerLevel });
    }

    function getOptimizerLevel() {
        return optimizerLevel;
    }

    // ── The Royal Crown ────────────────────────────────────────
    // A random US president (seeded from firstSessionTime) steals your Doubloons.
    const PRESIDENTS = [
        { name: 'George Washington', emoji: '🎩', seizureRate: 0.10, quote: "I cannot tell a lie. Your Doubloons are mine now." },
        { name: 'Abraham Lincoln', emoji: '🧔', seizureRate: 0.12, quote: "A house divided cannot hold Doubloons. I'll take those." },
        { name: 'Theodore Roosevelt', emoji: '🤠', seizureRate: 0.15, quote: "Speak softly and carry a big tax bill." },
        { name: 'Franklin D. Roosevelt', emoji: '📻', seizureRate: 0.18, quote: "The only thing to fear is... this seizure notice." },
        { name: 'Richard Nixon', emoji: '✌️', seizureRate: 0.25, quote: "I am not a crook. I am the Crown. There's a difference." },
        { name: 'Ronald Reagan', emoji: '🌟', seizureRate: 0.14, quote: "Trickle-down Doubloons. They trickle... to me." },
        { name: 'Bill Clinton', emoji: '🎷', seizureRate: 0.13, quote: "I did not have financial relations with your Doubloons. Until now." },
        { name: 'George W. Bush', emoji: '🤠', seizureRate: 0.16, quote: "Mission accomplished. Your Doubloons have been liberated." },
        { name: 'Barack Obama', emoji: '🎤', seizureRate: 0.11, quote: "Yes we can... take your Doubloons. Hope you understand." },
        { name: 'Donald Trump', emoji: '🧱', seizureRate: 0.30, quote: "Nobody seizes Doubloons better than me. Believe me." },
        { name: 'Joe Biden', emoji: '🍦', seizureRate: 0.12, quote: "Here's the deal, Jack. The Crown needs those Doubloons." },
        { name: 'John Adams', emoji: '📜', seizureRate: 0.10, quote: "Facts are stubborn things. So are seizure notices." },
        { name: 'Thomas Jefferson', emoji: '🏛️', seizureRate: 0.13, quote: "All men are created equal. Their Doubloon rights are not." },
        { name: 'Andrew Jackson', emoji: '⚔️', seizureRate: 0.22, quote: "The bank is dead. Long live the Crown." },
        { name: 'Ulysses S. Grant', emoji: '🎖️', seizureRate: 0.17, quote: "Unconditional surrender. Of your Doubloons." },
        { name: 'Harry Truman', emoji: '💣', seizureRate: 0.15, quote: "The buck stops here. Your Doubloons? They stop there too." },
        { name: 'Dwight Eisenhower', emoji: '⭐', seizureRate: 0.12, quote: "The military-industrial complex thanks you for your contribution." },
        { name: 'John F. Kennedy', emoji: '🚀', seizureRate: 0.11, quote: "Ask not what your Doubloons can do for you..." },
        { name: 'Lyndon Johnson', emoji: '🤝', seizureRate: 0.16, quote: "The Great Society requires great Doubloons. Yours." },
        { name: 'Jimmy Carter', emoji: '🥜', seizureRate: 0.08, quote: "I'm doing this for Habitat for Humanity. Probably." },
    ];

    function getPlayerPresident() {
        const state = Game.getState();
        if (state.crownPresident !== null && state.crownPresident !== undefined) {
            return PRESIDENTS[state.crownPresident];
        }
        // Seed from firstSessionTime
        const seed = state.firstSessionTime
            ? state.firstSessionTime.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
            : Math.floor(Math.random() * PRESIDENTS.length);
        const idx = seed % PRESIDENTS.length;
        state.crownPresident = idx;
        return PRESIDENTS[idx];
    }

    // Check if the Crown seizes Doubloons during a spend/conversion attempt
    function checkCrownSeizure(doubloonAmount) {
        const state = Game.getState();
        const phase = state.narratorPhase;
        if (phase < 2) return { seized: false, amount: doubloonAmount };

        const president = getPlayerPresident();
        // Seizure chance scales with phase: base rate * phase multiplier
        const phaseMultiplier = [0, 0, 0.5, 0.7, 1.0, 1.2, 1.5][phase] || 1;
        const chance = president.seizureRate * phaseMultiplier;

        if (Math.random() > chance) return { seized: false, amount: doubloonAmount };

        // Seize 20-50% of the doubloons
        const seizureRate = 0.2 + Math.random() * 0.3;
        const seized = Math.max(1, Math.floor(doubloonAmount * seizureRate));
        const remaining = doubloonAmount - seized;

        state.crownSeizures = (state.crownSeizures || 0) + 1;

        Game.emit('crownSeizure', {
            president: president.name,
            emoji: president.emoji,
            quote: president.quote,
            seized,
            remaining,
        });

        return { seized: true, amount: remaining, lostAmount: seized, president };
    }

    // ── Fake 30-Day History (for sparkline charts) ─────────────
    // Deterministic per day+pair so charts look consistent within a session
    function hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return hash;
    }

    function seededRandom(seed) {
        // Simple LCG
        let s = seed;
        return () => {
            s = (s * 1664525 + 1013904223) & 0x7fffffff;
            return s / 0x7fffffff;
        };
    }

    function generateFakeHistory(pairKey, days) {
        days = days || 30;
        const today = new Date().toISOString().split('T')[0];
        const seed = Math.abs(hashCode(today + pairKey));
        const rng = seededRandom(seed);

        const baseRate = RATES[pairKey] || 7;
        // Amplitude: roughly 30% of base
        const amp1 = baseRate * 0.25;
        const amp2 = baseRate * 0.15;
        const period1 = 8 + rng() * 6;   // 8-14 day period
        const period2 = 3 + rng() * 4;   // 3-7 day period
        const phaseOff = rng() * Math.PI * 2;

        const history = [];
        for (let d = 0; d < days; d++) {
            const wave1 = amp1 * Math.sin((d / period1) * Math.PI * 2 + phaseOff);
            const wave2 = amp2 * Math.sin((d / period2) * Math.PI * 2);
            const noise = (rng() - 0.5) * baseRate * 0.2;
            const val = Math.max(1, baseRate + wave1 + wave2 + noise);
            history.push(Math.round(val * 10) / 10);
        }
        return history;
    }

    // ── Init (load optimizer level from state) ─────────────────
    function init() {
        const state = Game.getState();
        if (state.upgrades?.currencyOptimizer) {
            optimizerLevel = state.upgrades.currencyOptimizer;
        }

        // Restore market tick
        marketTime = state.marketTick || 0;

        // Start market oscillation (every 1 second)
        marketInterval = setInterval(updateMarketRates, 1000);

        // Narrator reactions to conversions
        Game.on('conversion', (data) => {
            if (data.busted) {
                const bustLines = [
                    `BUSTED. ${data.bustLost} ${data.to} confiscated in transit. The market is cruel. Like us.`,
                    `${data.bustLost} ${data.to} lost to "processing irregularities." We're investigating. Slowly.`,
                    `Market volatility claimed ${data.bustLost} ${data.to}. Your remaining ${data.gained} ${data.to} are... probably safe.`,
                    `The transmutation bureau seized ${data.bustLost} ${data.to}. They cited "reasons." We didn't argue.`,
                ];
                Narrator.queueMessage(bustLines[Math.floor(Math.random() * bustLines.length)]);
            } else if (data.remainder > 0 && Game.getState().narratorPhase >= 4) {
                Narrator.queueMessage(`${data.remainder} ${data.from} left over. By design.`);
            }
        });

        Game.on('conversionFailed', (data) => {
            if (Game.getState().narratorPhase >= 3) {
                Narrator.queueMessage(`You need ${data.need} ${data.from} for one ${data.to}. You have ${data.have}. So close.`);
            }
        });

        // Crown seizure narration
        Game.on('crownSeizure', (data) => {
            Narrator.queueMessage(`${data.emoji} President ${data.president} has claimed ${data.seized} Doubloons for the Crown. "${data.quote}"`);
        });
    }

    return {
        init,
        convertEUtoST,
        convertSTtoCC,
        convertCCtoDB,
        convertDBtoTK,
        doConvertEU,
        doConvertST,
        doConvertCC,
        doConvertDB,
        spendCC,
        spendDB,
        spendTK,
        getDisplayRate,
        getDynamicRate,
        isRateFavorable,
        upgradeOptimizer,
        getOptimizerLevel,
        checkCrownSeizure,
        getPlayerPresident,
        getFakeHistory: generateFakeHistory,
        PRESIDENTS,
        RATES,
    };
})();
