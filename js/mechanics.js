// mechanics.js — Dark pattern implementations made literal
// Reroll, upgrades, investment score, streak, sabotage system

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
    };

    // ── Sabotage System ────────────────────────────────────────
    // The AI deliberately degrades the UI, then offers to "fix" it for a price.
    // This is the pixel-drift, annoying sounds, impossible settings idea.

    const SABOTAGES = {
        pixelDrift: {
            id: 'pixelDrift',
            name: 'Calibration Drift',
            description: 'UI elements shift by 1-3 pixels randomly',
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
            description: 'Occasional unicode glitches in text',
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
    };

    // ── Sabotage Implementation ────────────────────────────────
    let pixelDriftInterval = null;
    let textCorruptionInterval = null;
    let humOscillator = null;
    let humGain = null;
    let audioCtx = null;

    function startPixelDrift() {
        pixelDriftInterval = setInterval(() => {
            const elements = document.querySelectorAll('.driftable');
            elements.forEach(el => {
                const dx = (Math.random() - 0.5) * 4;
                const dy = (Math.random() - 0.5) * 4;
                el.style.transform = `translate(${dx}px, ${dy}px)`;
            });
        }, 3000);
    }

    function stopPixelDrift() {
        if (pixelDriftInterval) clearInterval(pixelDriftInterval);
        document.querySelectorAll('.driftable').forEach(el => {
            el.style.transform = '';
        });
    }

    function startTextCorruption() {
        const glitchChars = '̷̸̶̵̴̡̢̧̨̛̖̗̘̙̜̝̞̟̠̣̤̥̦̩̪̫̬̭̮̯̰̱̲̳̹̺̻̼';
        textCorruptionInterval = setInterval(() => {
            const labels = document.querySelectorAll('.corruptible');
            labels.forEach(el => {
                if (Math.random() < 0.1) {
                    const text = el.getAttribute('data-original') || el.textContent;
                    if (!el.getAttribute('data-original')) {
                        el.setAttribute('data-original', text);
                    }
                    let corrupted = '';
                    for (const char of text) {
                        corrupted += char;
                        if (Math.random() < 0.08) {
                            corrupted += glitchChars[Math.floor(Math.random() * glitchChars.length)];
                        }
                    }
                    el.textContent = corrupted;
                    // Restore after brief display
                    setTimeout(() => {
                        el.textContent = text;
                    }, 500);
                }
            });
        }, 2000);
    }

    function stopTextCorruption() {
        if (textCorruptionInterval) clearInterval(textCorruptionInterval);
        document.querySelectorAll('.corruptible').forEach(el => {
            const original = el.getAttribute('data-original');
            if (original) el.textContent = original;
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
            humAudio = new Audio('screaming-sun-rick-and-morty.mp3');
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
    // Sabotages trigger at phase thresholds or after certain time
    function checkSabotageSchedule() {
        const state = Game.getState();
        const phase = state.narratorPhase;
        const active = state.sabotages || {};

        // Phase 2+: pixel drift
        if (phase >= 2 && !active.pixelDrift && Math.random() < 0.3) {
            applySabotage('pixelDrift');
        }
        // Phase 3+: button dodge or color desat
        if (phase >= 3 && !active.buttonDodge && !active.colorDesaturation) {
            if (Math.random() < 0.2) {
                applySabotage(Math.random() < 0.5 ? 'buttonDodge' : 'colorDesaturation');
            }
        }
        // Phase 4+: text corruption
        if (phase >= 4 && !active.textCorruption && Math.random() < 0.15) {
            applySabotage('textCorruption');
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
    function purchaseUpgrade(upgradeId) {
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

        if (!Currencies.spendCC(upgrade.cost)) {
            Narrator.queueMessage(`Insufficient Compliance Credits. You need ${upgrade.cost} CC. The gap between desire and means is... instructive.`);
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
