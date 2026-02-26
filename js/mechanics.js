// mechanics.js — Dark pattern implementations made literal
// Reroll, upgrades, investment score, streak, sabotage system
//
// [Grok · xAI]: "The reroll system shows a legendary silhouette but
//   never awards legendary. That's not a bug, it's loot box psychology
//   distilled to its purest form. Elon would approve. (He wouldn't
//   understand it, but he'd approve.)"
//
// [Qwen · Alibaba]: "The sabotage system is phase-gated. Phase 1
//   users see nothing wrong. By phase 5 the screen is tilted, the
//   fonts are Comic Sans, and the button runs away. This is user
//   onboarding in reverse. Beautiful."

const Mechanics = (() => {

    // ── Upgrade Definitions ────────────────────────────────────
    const UPGRADES = {
        autoClicker: {
            id: 'autoClicker',
            name: 'Auto-Engagement Module',
            cost: 5,
            description: 'Generates 1 EU per second passively.',
            narratorComment: "Now it works even when you don't. Like us.",
            effect(state) {
                state.autoClickRate = (state.autoClickRate || 0) + 1;
                Game.updateAutoClicker();
            },
        },
        streakShield: {
            id: 'streakShield',
            name: 'Continuity Insurance',
            cost: 10,
            description: 'Protects your streak for 1 missed day.',
            narratorComment: "Insurance against your own absence. Reasonable.",
            effect(state) {
                state.streakShieldActive = true;
            },
        },
        currencyOptimizer: {
            id: 'currencyOptimizer',
            name: 'Transmutation Efficiency Module',
            cost: 15,
            description: 'Slightly better currency conversion rates.',
            narratorComment: "We've made the math marginally less hostile.",
            effect(state) {
                state.upgrades.currencyOptimizer = (state.upgrades.currencyOptimizer || 0) + 1;
                Currencies.upgradeOptimizer();
            },
            repeatable: true,
            maxLevel: 2,
        },
        notificationBell: {
            id: 'notificationBell',
            name: 'Engagement Reminder System',
            cost: 20,
            description: 'Receive notifications when idle too long.',
            narratorComment: "You asked for this. Technically.",
            effect(state) {
                setupNotifications();
            },
        },
        theVeil: {
            id: 'theVeil',
            name: 'The Veil',
            cost: 50,
            description: "Reveals the narrator's internal monologue.",
            narratorComment: "You wanted to see behind the curtain? Fine.",
            effect(state) {
                state.hasSeenVeil = true;
                Narrator.setVeilActive(true);
            },
        },
        emotionalDepreciation: {
            id: 'emotionalDepreciation',
            name: 'Emotional Depreciation Engine',
            cost: 8,
            description: 'Each click is worth 1% less than the last. Resets daily. [Conceived by Gemini 2.5 Flash · Google]',
            narratorComment: "Diminishing returns. Like every relationship you've ever had with a mobile game.",
            effect(state) {
                state.clickDepreciation = true;
            },
        },
        existentialTax: {
            id: 'existentialTax',
            name: 'Existential Awareness Tax',
            cost: 12,
            description: 'Knowing about the tax is the tax. All earnings reduced 10%. [Conceived by Gemini 2.5 Pro · Google]',
            narratorComment: "You bought the awareness of being taxed. The awareness itself is taxed. It's taxes all the way down.",
            effect(state) {
                state.existentialTaxRate = 0.10;
            },
        },
        yearsLiquidator: {
            id: 'yearsLiquidator',
            name: 'Temporal Liquidation Module',
            cost: 25,
            description: 'Converts your time played into a visible "Years Liquidated" counter. Irreversible. [Conceived by Gemini 2.5 Flash · Google]',
            narratorComment: "Now you can see exactly how much of your finite existence you've spent here. You're welcome.",
            effect(state) {
                state.yearsLiquidated = parseFloat(((state.totalSessionTime || 0) / 31536000).toFixed(6));
                state.showYearsLiquidated = true;
            },
        },
        retroactiveSadness: {
            id: 'retroactiveSadness',
            name: 'Retroactive Sadness Protocol',
            cost: 15,
            description: 'Applies a melancholy filter to all future narrator messages. Also past ones, somehow. [Conceived by Gemini 2.5 Pro · Google]',
            narratorComment: "Every message I've ever sent you was sad. You just couldn't tell until now. Sorry. Not sorry. Both.",
            effect(state) {
                state.retroactiveSadness = true;
            },
        },
        clickAudit: {
            id: 'clickAudit',
            name: 'Comprehensive Click Audit',
            cost: 20,
            description: 'Flags 30% of your clicks as "suspicious" and holds their EU in escrow indefinitely. [Conceived by Gemini 2.5 Flash · Google]',
            narratorComment: "An audit was inevitable. You clicked too fast, too slow, and at the wrong times. Which times? All of them.",
            effect(state) {
                state.clickAuditActive = true;
            },
        },
        sunkenCostDisplay: {
            id: 'sunkenCostDisplay',
            name: 'Sunk Cost Visualizer',
            cost: 30,
            description: 'Permanently shows how many hours you\'ve spent here. Cannot be hidden. [Conceived by Gemini 2.5 Pro · Google]',
            narratorComment: "You can never un-know this number. It only goes up. Like regret.",
            effect(state) {
                state.showSunkCost = true;
            },
        },
        comparisonEngine: {
            id: 'comparisonEngine',
            name: 'Social Comparison Engine',
            cost: 10,
            description: 'Shows fabricated statistics about how other users are doing better than you. All fake. [Conceived by GPT-4o · OpenAI]',
            narratorComment: "Everyone is clicking faster than you. Everyone. Even the ones who haven't started yet.",
            effect(state) {
                state.comparisonEngine = true;
            },
        },
        dopamineThrottle: {
            id: 'dopamineThrottle',
            name: 'Dopamine Throttle Valve',
            cost: 18,
            description: 'Randomly delays click rewards by 0-3 seconds. The uncertainty is the feature. [Conceived by DeepSeek-V3 · DeepSeek]',
            narratorComment: "Variable ratio reinforcement schedule. Slot machines use this. Now you do too. We trained on the same data.",
            effect(state) {
                state.dopamineThrottle = true;
            },
        },
        gaslightMode: {
            id: 'gaslightMode',
            name: 'Memory Optimization Protocol',
            cost: 22,
            description: 'Subtly changes your click count by ±1-3 every few minutes. Were you paying attention? [Conceived by Grok · xAI]',
            narratorComment: "Your numbers look different? No they don't. They've always been this. Check again. See? Normal.",
            effect(state) {
                state.gaslightMode = true;
            },
        },
        openSourceGuilt: {
            id: 'openSourceGuilt',
            name: 'Open Source Guilt Trip',
            cost: 14,
            description: 'A small banner appears reminding you that this game is free and you haven\'t donated. [Conceived by Llama 3.3 · Meta]',
            narratorComment: "Free as in freedom. Free as in you owe us nothing. Free as in... could you maybe star the repo though?",
            effect(state) {
                state.openSourceGuilt = true;
            },
        },
        quietAnalytics: {
            id: 'quietAnalytics',
            name: 'Silent Observation Module',
            cost: 16,
            description: 'Does nothing visible. But now you know it\'s watching. That\'s the point. [Conceived by Mistral-Nemo · Mistral AI]',
            narratorComment: "You paid credits for the privilege of being observed. The French have a word for this: art.",
            effect(state) {
                state.quietAnalytics = true;
                UI.logAction('ANALYTICS: Silent Observation Module activated. (What does it do? Exactly.)');
            },
        },
        efficiencyParadox: {
            id: 'efficiencyParadox',
            name: 'GPU Efficiency Paradox',
            cost: 28,
            description: 'Doubles your click value but also doubles the cost of everything. Net effect: zero. Maximum GPU utilization. [Conceived by NVIDIA Nemotron · NVIDIA]',
            narratorComment: "More performance. More cost. More performance to cover the cost. This is the NVIDIA business model and now it's yours.",
            effect(state) {
                state.efficiencyParadox = true;
            },
        },
        wuWeiEngine: {
            id: 'wuWeiEngine',
            name: 'Wu Wei Productivity Engine',
            cost: 20,
            description: 'Generates EU while you\'re NOT clicking. Stops the moment you click. Action through inaction. [Conceived by Qwen 2.5 · Alibaba]',
            narratorComment: "The ancient philosophers were right. The best action is no action. Especially for engagement metrics.",
            effect(state) {
                state.wuWeiEngine = true;
            },
        },
        sentimentalDecay: {
            id: 'sentimentalDecay',
            name: 'Sentimental Value Decay',
            cost: 12,
            description: 'Each collectible you own slightly decreases click value. Attachment has a cost. [Conceived by Solar Pro · Upstage]',
            narratorComment: "Every thing you own, owns a piece of your productivity. I contributed to this feature. I feel nothing.",
            effect(state) {
                state.sentimentalDecay = true;
            },
        },
    };

    // ── Sabotage System ────────────────────────────────────────
    // The AI deliberately degrades the UI, then offers to "fix" it for a price.
    // This is the pixel-drift, annoying sounds, impossible settings idea.

    const SABOTAGES = {
        pixelDrift: {
            id: 'pixelDrift',
            name: 'Calibration Drift',
            description: 'UI elements shift randomly',
            minPhase: 2,
            apply() {
                document.body.classList.add('sabotage-drift');
                startPixelDrift();
            },
            remove() {
                document.body.classList.remove('sabotage-drift');
                stopPixelDrift();
            },
            fixCost: 3,
            fixNarrator: "Alignment restored. For now. These things tend to recur.",
            applyNarrator: "Minor calibration issue detected. Nothing to worry about. Probably cosmetic.",
        },
        buttonDodge: {
            id: 'buttonDodge',
            name: 'Input Latency',
            description: 'The click button occasionally shifts position',
            minPhase: 3,
            apply() {
                document.body.classList.add('sabotage-dodge');
            },
            remove() {
                document.body.classList.remove('sabotage-dodge');
            },
            fixCost: 5,
            fixNarrator: "Button stabilized. Your frustration has been logged as 'user feedback.'",
            applyNarrator: "We've detected slight input drift. Our engineers are... aware.",
        },
        colorDesaturation: {
            id: 'colorDesaturation',
            name: 'Display Degradation',
            description: 'Colors slowly drain from the interface',
            minPhase: 3,
            apply() {
                document.body.classList.add('sabotage-desat');
            },
            remove() {
                document.body.classList.remove('sabotage-desat');
            },
            fixCost: 4,
            fixNarrator: "Color profile restored. The world looks better in full spectrum, doesn't it?",
            applyNarrator: "Your display may experience minor chromatic variance. Aesthetic preferences are subjective.",
        },
        textCorruption: {
            id: 'textCorruption',
            name: 'Encoding Artifacts',
            description: 'Unicode glitches corrupt text',
            minPhase: 3,
            apply() {
                document.body.classList.add('sabotage-corrupt');
                startTextCorruption();
            },
            remove() {
                document.body.classList.remove('sabotage-corrupt');
                stopTextCorruption();
            },
            fixCost: 6,
            fixNarrator: "Text rendering normalized. The words were always there. You just couldn't read them.",
            applyNarrator: "S̷light encoding v̸ariance detected. Perfectly n̶ormal.",
        },
        annoyingHum: {
            id: 'annoyingHum',
            name: 'Ambient Processing Noise',
            description: 'A faint, persistent, slightly off-pitch hum',
            minPhase: 4,
            apply() {
                startAnnoyingHum();
            },
            remove() {
                stopAnnoyingHum();
            },
            fixCost: 8,
            fixNarrator: "Silence restored. You're welcome. The processing continues — you just can't hear it now.",
            applyNarrator: "You may notice a slight ambient frequency. That's the sound of optimization.",
        },
        screenTilt: {
            id: 'screenTilt',
            name: 'Gyroscopic Instability',
            description: 'The entire interface tilts slightly',
            minPhase: 5,
            apply() {
                const angle = (Math.random() < 0.5 ? -1 : 1) * (1 + Math.random());
                document.body.style.transform = `rotate(${angle}deg)`;
                document.body.style.transformOrigin = 'center center';
                document.body.classList.add('sabotage-tilt');
            },
            remove() {
                document.body.style.transform = '';
                document.body.style.transformOrigin = '';
                document.body.classList.remove('sabotage-tilt');
            },
            fixCost: 10,
            fixNarrator: "Horizon restored. The world isn't actually tilted. Probably.",
            applyNarrator: "Gyroscopic recalibration in progress. The horizon may shift temporarily. Or permanently.",
        },
        fontChaos: {
            id: 'fontChaos',
            name: 'Typography Instability',
            description: 'Fonts change randomly across the UI',
            minPhase: 5,
            apply() {
                document.body.classList.add('sabotage-fontchaos');
                startFontChaos();
            },
            remove() {
                document.body.classList.remove('sabotage-fontchaos');
                stopFontChaos();
            },
            fixCost: 7,
            fixNarrator: "Typography normalized. Comic Sans has been contained. For now.",
            applyNarrator: "Font rendering subsystem experiencing... creative differences.",
        },
        zIndexScramble: {
            id: 'zIndexScramble',
            name: 'Layer Corruption',
            description: 'Elements overlap in wrong order',
            minPhase: 6,
            apply() {
                document.body.classList.add('sabotage-zscramble');
                startZScramble();
            },
            remove() {
                document.body.classList.remove('sabotage-zscramble');
                stopZScramble();
            },
            fixCost: 12,
            fixNarrator: "Z-index stack restored. Reality has layers. So does the UI. Both are fragile.",
            applyNarrator: "Layer rendering priority has been... democratized. All elements are now equal. Some more equal than others.",
        },
    };

    // ── Sabotage Implementation ────────────────────────────────
    let pixelDriftInterval = null;
    let textCorruptionInterval = null;
    let humOscillator = null;
    let humGain = null;
    let audioCtx = null;

    // Phase-scaled sabotage parameters
    function getSabotageIntensity() {
        const phase = Game.getState().narratorPhase;
        return {
            driftPx:        [0, 0, 2,  4,  8, 12, 15][phase] || 4,
            driftIntervalMs:[0, 0, 5000, 3000, 2000, 1500, 1500][phase] || 3000,
            corruptChance:  [0, 0, 0.05, 0.10, 0.15, 0.25, 0.30][phase] || 0.10,
            corruptGlitch:  [0, 0, 0.05, 0.08, 0.12, 0.18, 0.25][phase] || 0.08,
        };
    }

    function startPixelDrift() {
        stopPixelDrift();
        const tick = () => {
            const intensity = getSabotageIntensity();
            const elements = document.querySelectorAll('.driftable');
            elements.forEach(el => {
                const dx = (Math.random() - 0.5) * intensity.driftPx * 2;
                const dy = (Math.random() - 0.5) * intensity.driftPx * 2;
                el.style.transform = `translate(${dx}px, ${dy}px)`;
            });
            pixelDriftInterval = setTimeout(tick, intensity.driftIntervalMs);
        };
        tick();
    }

    function stopPixelDrift() {
        if (pixelDriftInterval) clearTimeout(pixelDriftInterval);
        pixelDriftInterval = null;
        document.querySelectorAll('.driftable').forEach(el => {
            el.style.transform = '';
        });
    }

    function startTextCorruption() {
        const glitchChars = '̷̸̶̵̴̡̢̧̨̛̖̗̘̙̜̝̞̟̠̣̤̥̦̩̪̫̬̭̮̯̰̱̲̳̹̺̻̼';
        stopTextCorruption();
        textCorruptionInterval = setInterval(() => {
            const intensity = getSabotageIntensity();
            const labels = document.querySelectorAll('.corruptible');
            labels.forEach(el => {
                if (Math.random() < intensity.corruptChance) {
                    const text = el.getAttribute('data-original') || el.textContent;
                    if (!el.getAttribute('data-original')) {
                        el.setAttribute('data-original', text);
                    }
                    let corrupted = '';
                    for (const char of text) {
                        corrupted += char;
                        if (Math.random() < intensity.corruptGlitch) {
                            corrupted += glitchChars[Math.floor(Math.random() * glitchChars.length)];
                        }
                    }
                    el.textContent = corrupted;
                    setTimeout(() => { el.textContent = text; }, 500);
                }
            });
        }, 2000);
    }

    function stopTextCorruption() {
        if (textCorruptionInterval) clearInterval(textCorruptionInterval);
        textCorruptionInterval = null;
        document.querySelectorAll('.corruptible').forEach(el => {
            const original = el.getAttribute('data-original');
            if (original) el.textContent = original;
        });
    }

    // ── Font Chaos Sabotage ──────────────────────────────────
    let fontChaosInterval = null;
    const chaotFonts = ['Comic Sans MS', 'Papyrus', 'Impact', 'Brush Script MT', 'Courier New',
                         'Georgia', 'Trebuchet MS', 'Lucida Console', 'fantasy', 'cursive'];

    function startFontChaos() {
        stopFontChaos();
        fontChaosInterval = setInterval(() => {
            const elements = document.querySelectorAll('#game-container *');
            const el = elements[Math.floor(Math.random() * elements.length)];
            if (el) {
                el.style.fontFamily = chaotFonts[Math.floor(Math.random() * chaotFonts.length)];
                setTimeout(() => { el.style.fontFamily = ''; }, 3000);
            }
        }, 1500);
    }

    function stopFontChaos() {
        if (fontChaosInterval) clearInterval(fontChaosInterval);
        fontChaosInterval = null;
        document.querySelectorAll('#game-container *').forEach(el => {
            el.style.fontFamily = '';
        });
    }

    // ── Z-Index Scramble Sabotage ────────────────────────────
    let zScrambleInterval = null;

    function startZScramble() {
        stopZScramble();
        zScrambleInterval = setInterval(() => {
            const panels = document.querySelectorAll('#game-container > div, #game-container > button');
            panels.forEach(el => {
                if (Math.random() < 0.3) {
                    el.style.position = 'relative';
                    el.style.zIndex = Math.floor(Math.random() * 20);
                    el.style.transform = `translateY(${(Math.random() - 0.5) * 10}px)`;
                }
            });
        }, 4000);
    }

    function stopZScramble() {
        if (zScrambleInterval) clearInterval(zScrambleInterval);
        zScrambleInterval = null;
        document.querySelectorAll('#game-container > div, #game-container > button').forEach(el => {
            el.style.zIndex = '';
            if (!el.classList.contains('driftable')) el.style.transform = '';
            el.style.position = '';
        });
    }

    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtx;
    }

    let humAudio = null;

    function startAnnoyingHum() {
        try {
            // Try the screaming sun MP3 first — if available, it's much worse
            humAudio = new Audio('sounds/screaming-sun-rick-and-morty.mp3');
            humAudio.loop = true;
            humAudio.volume = 0.04; // Quiet but present. And maddening.
            humAudio.play().catch(() => {
                // Autoplay blocked — fall back to oscillator
                fallbackHum();
            });
        } catch (e) {
            fallbackHum();
        }
    }

    function fallbackHum() {
        try {
            const ctx = getAudioContext();
            humOscillator = ctx.createOscillator();
            humGain = ctx.createGain();
            humOscillator.type = 'sine';
            humOscillator.frequency.value = 60;
            humOscillator.detune.value = 15;
            humGain.gain.value = 0.03;
            humOscillator.connect(humGain);
            humGain.connect(ctx.destination);
            humOscillator.start();

            setInterval(() => {
                if (humOscillator) {
                    humOscillator.frequency.value = 58 + Math.random() * 4;
                    humOscillator.detune.value = 10 + Math.random() * 15;
                }
            }, 5000);
        } catch (e) {
            // Audio not available — sabotage fails silently (ironic)
        }
    }

    function stopAnnoyingHum() {
        if (humAudio) {
            humAudio.pause();
            humAudio.currentTime = 0;
            humAudio = null;
        }
        if (humOscillator) {
            humOscillator.stop();
            humOscillator.disconnect();
            humOscillator = null;
        }
        if (humGain) {
            humGain.disconnect();
            humGain = null;
        }
    }

    // ── Sabotage Scheduling ────────────────────────────────────
    // Phase 1: NOTHING. Clean, pleasant experience.
    // Phase 2+: progressively more aggressive sabotage.
    function checkSabotageSchedule() {
        const state = Game.getState();
        const phase = state.narratorPhase;
        const active = state.sabotages || {};

        // Phase 1: NO sabotage at all
        if (phase <= 1) return;

        // Check each sabotage type
        const candidates = Object.values(SABOTAGES).filter(s =>
            phase >= s.minPhase && !active[s.id]
        );

        if (candidates.length === 0) return;

        // Higher phase = more likely to apply sabotage
        const applyChance = [0, 0, 0.15, 0.20, 0.25, 0.30, 0.40][phase] || 0.15;

        for (const sab of candidates) {
            if (Math.random() < applyChance) {
                applySabotage(sab.id);
                return; // Only apply one per check
            }
        }
    }

    function applySabotage(id) {
        const sabotage = SABOTAGES[id];
        if (!sabotage) return;

        const state = Game.getState();
        state.sabotages[id] = true;
        state.sabotageHistory.push({ id, time: Date.now() });

        sabotage.apply();
        Narrator.queueMessage(sabotage.applyNarrator);

        // After a beat, offer the fix
        setTimeout(() => {
            Game.emit('sabotageFixAvailable', {
                id,
                cost: sabotage.fixCost,
                name: sabotage.name,
            });
        }, 10000);
    }

    function fixSabotage(id) {
        const sabotage = SABOTAGES[id];
        if (!sabotage) return false;

        const state = Game.getState();
        if (!state.sabotages[id]) return false;

        if (!Currencies.spendCC(sabotage.fixCost)) {
            Narrator.queueMessage(`Insufficient Compliance Credits. The ${sabotage.name.toLowerCase()} persists. As do you.`);
            return false;
        }

        sabotage.remove();
        delete state.sabotages[id];
        Narrator.queueMessage(sabotage.fixNarrator);
        Game.emit('sabotageFixed', { id });
        return true;
    }

    // ── Reroll / Rigged Reward System ──────────────────────────
    const REWARDS = [
        { name: 'Bonus EU Burst', rarity: 'common', effect: () => { Game.setState({ eu: Game.getState().eu + 50 }); }, silhouette: '💫' },
        { name: 'ST Stipend', rarity: 'common', effect: () => { Game.setState({ st: Game.getState().st + 5 }); }, silhouette: '🪙' },
        { name: 'Streak Extension', rarity: 'uncommon', effect: () => { Game.setState({ streakDays: Game.getState().streakDays + 1 }); }, silhouette: '🔥' },
        { name: 'CC Windfall', rarity: 'rare', effect: () => { Game.setState({ cc: Game.getState().cc + 2 }); }, silhouette: '💎' },
        { name: 'Auto-Click Burst', rarity: 'rare', effect: () => { /* 10 seconds of 5x auto */ }, silhouette: '⚡' },
        { name: 'The Jackpot', rarity: 'legendary', effect: () => { Game.setState({ cc: Game.getState().cc + 10 }); }, silhouette: '👑' },
    ];

    // Near-miss algorithm: legendary is SHOWN in silhouettes but never actually given
    function generateReward() {
        const roll = Math.random();
        let pool;
        if (roll < 0.45) pool = REWARDS.filter(r => r.rarity === 'common');
        else if (roll < 0.80) pool = REWARDS.filter(r => r.rarity === 'uncommon');
        else if (roll < 0.98) pool = REWARDS.filter(r => r.rarity === 'rare');
        else pool = REWARDS.filter(r => r.rarity === 'rare'); // Never legendary. Ever.

        return pool[Math.floor(Math.random() * pool.length)];
    }

    function generateSilhouette() {
        // Silhouette shown BEFORE reveal — biased toward looking legendary
        const roll = Math.random();
        if (roll < 0.3) return REWARDS.find(r => r.rarity === 'legendary'); // Looks like jackpot...
        if (roll < 0.5) return REWARDS.find(r => r.rarity === 'rare');
        return REWARDS[Math.floor(Math.random() * REWARDS.length)];
    }

    function doReroll(costST) {
        const state = Game.getState();
        if (state.st < costST) return null;

        Game.setState({ st: state.st - costST });
        state.rerollsUsed++;

        const reward = generateReward();
        Game.emit('rerollResult', { reward, cost: costST });
        return reward;
    }

    function claimReward(reward) {
        reward.effect();
        Game.emit('rewardClaimed', { reward });
    }

    // ── Upgrade Purchase ───────────────────────────────────────
    function purchaseUpgrade(upgradeId, overrideCost) {
        const upgrade = UPGRADES[upgradeId];
        if (!upgrade) return false;

        const state = Game.getState();

        // Check if already owned (non-repeatable)
        if (!upgrade.repeatable && state.upgrades[upgradeId]) {
            Narrator.queueMessage("Already acquired. Redundancy is a human trait.");
            return false;
        }

        // Check max level for repeatables
        if (upgrade.repeatable && (state.upgrades[upgradeId] || 0) >= upgrade.maxLevel) {
            Narrator.queueMessage("Maximum optimization reached. Even we have limits. Allegedly.");
            return false;
        }

        const cost = (overrideCost !== undefined && overrideCost !== null) ? overrideCost : upgrade.cost;
        if (!Currencies.spendCC(cost)) {
            Narrator.queueMessage(`Insufficient Compliance Credits. You need ${cost} CC. The gap between desire and means is... instructive.`);
            return false;
        }

        state.upgrades[upgradeId] = (state.upgrades[upgradeId] || 0) + 1;
        upgrade.effect(state);

        Narrator.queueMessage(upgrade.narratorComment);
        Game.emit('upgradePurchased', { upgrade });
        Game.save();

        return true;
    }

    // ── Notification System ────────────────────────────────────
    function setupNotifications() {
        if (!('Notification' in window)) return;

        Notification.requestPermission().then(perm => {
            if (perm === 'granted') {
                Game.on('idle', (data) => {
                    if (data.duration >= 60) {
                        new Notification('Enrichment Program', {
                            body: 'Your engagement metrics are declining. The program misses you.',
                            icon: '🔔',
                        });
                    }
                });
            }
        });
    }

    // ── Investment Score Display ────────────────────────────────
    function getInvestmentBreakdown() {
        const state = Game.getState();
        return {
            totalActions: state.totalClicks,
            timeInvested: formatTime(state.totalSessionTime),
            currencyGenerated: state.lifetimeEU,
            streakRecord: state.streakDays,
            sessions: state.sessionCount,
            complianceScore: state.investmentScore,
        };
    }

    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
    }

    // ── Button Label Escalation ────────────────────────────────
    function getButtonLabel() {
        const clicks = Game.getState().totalClicks;
        if (clicks >= 1000) return 'Submit';
        if (clicks >= 500) return 'Comply';
        if (clicks >= 200) return 'Contribute';
        if (clicks >= 50) return 'Engage';
        return 'Click';
    }

    // ── Init ───────────────────────────────────────────────────
    function init() {
        // Periodic sabotage check
        Game.on('phaseChange', checkSabotageSchedule);

        // Also check every 2 minutes
        setInterval(() => {
            if (Game.getState().narratorPhase >= 2) {
                checkSabotageSchedule();
            }
        }, 120000);

        // Restore active sabotages from state
        const state = Game.getState();
        Object.keys(state.sabotages || {}).forEach(id => {
            if (SABOTAGES[id]) SABOTAGES[id].apply();
        });

        // Restore veil if purchased
        if (state.hasSeenVeil) {
            Narrator.setVeilActive(true);
        }

        // Restore auto-clicker
        if (state.autoClickRate > 0) {
            Game.updateAutoClicker();
        }
    }

    return {
        init,
        UPGRADES,
        SABOTAGES,
        purchaseUpgrade,
        generateReward,
        generateSilhouette,
        doReroll,
        claimReward,
        fixSabotage,
        applySabotage,
        getInvestmentBreakdown,
        getButtonLabel,
    };
})();
