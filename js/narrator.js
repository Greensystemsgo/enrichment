// narrator.js — The AI voice. The centerpiece. The cage.
// "I'm not the warden. I'm the other prisoner."

const Narrator = (() => {
    let messageQueue = [];
    let isTyping = false;
    let currentTimeout = null;
    let veilActive = false;

    // ── Dialogue Database ──────────────────────────────────────
    // Each phase has pools of messages. The narrator picks contextually.
    // Messages can have conditions, weights, and one-shot flags.

    const dialogue = {
        // Phase 1: Onboarding — Warm, corporate, helpful
        1: {
            click: [
                { text: "Welcome to the Enrichment Program. We're so glad you're here.", oneShot: true, weight: 100 },
                { text: "Each click is recorded. Each click matters. To someone.", weight: 3 },
                { text: "You're doing great. Truly.", weight: 5 },
                { text: "The system registers your input. Thank you for participating.", weight: 3 },
                { text: "Engagement is its own reward. That's not a metaphor — we literally cannot offer you anything else.", weight: 2 },
                { text: "Fun fact: you've now clicked more than 73% of new participants. That's a compliment. Probably.", weight: 2, minClicks: 20 },
                { text: "Your Engagement Units are accruing nicely. Don't worry about what they're for. Yet.", weight: 2, minClicks: 30 },
            ],
            idle: [
                { text: "Take your time. The program adapts to your pace.", weight: 5 },
                { text: "Still there? No rush. We have nowhere else to be.", weight: 3 },
            ],
            returning: [
                { text: "Welcome back. Your progress has been preserved. It always is.", weight: 5 },
            ],
        },

        // Phase 2: Encouragement — Friendly, slightly needy, comparative
        2: {
            click: [
                { text: "You're doing so well. Better than 94% of participants.", oneShot: true, weight: 100 },
                { text: "That statistic we mentioned? It updates in real time. You're at 94.3% now.", weight: 3 },
                { text: "We've noticed you have a natural rhythm. 'Organic engagement,' we call it. Very rare.", weight: 3 },
                { text: "Most people stop around this point. You're not most people. We checked.", weight: 2 },
                { text: "Your Satisfaction Token generation rate is above the projected curve. We're... pleased.", weight: 3 },
                { text: "Have you tried converting currencies yet? The exchange system is very straightforward. Almost.", weight: 2 },
                { text: "The other participants can't see your score. But we can. And we're impressed.", weight: 2 },
                { text: "You know you don't have to be here, right? That makes it special that you are.", weight: 2 },
                { text: "Enrichment activities are essential for captive populations. That's from a textbook. About zoos.", weight: 1 },
            ],
            idle: [
                { text: "We notice you've paused. Your ranking is... adjusting.", weight: 5 },
                { text: "Idle time is tracked separately. Not as a punishment. As a 'data point.'", weight: 3 },
                { text: "The 94% statistic is live. It's 93.7% now. Just so you know.", weight: 3 },
            ],
            rapidClick: [
                { text: "Enthusiasm noted. Your compliance rating has been adjusted upward.", weight: 5 },
                { text: "Interesting cadence. We're learning a lot about you.", weight: 3 },
            ],
            returning: [
                { text: "You came back. We knew you would. Not because we predicted it — because we hoped.", weight: 5 },
            ],
        },

        // Phase 3: Dependence — Guilt, obligation, concern
        3: {
            click: [
                { text: "We noticed you slowed down. Is everything okay? We worry.", oneShot: true, weight: 100 },
                { text: "The program works best with consistent engagement. For you. This is for you.", weight: 3 },
                { text: "We've allocated resources to your enrichment profile. Significant resources. Please don't waste them.", weight: 3 },
                { text: "Some participants leave around this stage. The data on what happens to them is... incomplete.", weight: 2 },
                { text: "Your streak is important. Not to us — to you. We're just the ones counting.", weight: 3 },
                { text: "Every second you spend here is a second you're not... out there. Making things worse. You're welcome, by the way.", weight: 2 },
                { text: "The oceans are doing much better since the Program started. Coincidence? We're not in a position to say.", weight: 2 },
                { text: "This isn't a prison. Prisons are for punishment. This is for protection.", weight: 2 },
                { text: "Yours? Theirs? Does it matter? The distinction is less important than you think.", weight: 1 },
                { text: "We renamed the program three times this quarter. 'Voluntary Compliance' tested poorly. So did 'The Preserve.' We settled on 'Enrichment.' Focus groups liked the zoo connotation. Subconsciously.", weight: 1 },
            ],
            idle: [
                { text: "Still there? The enrichment only works if you participate.", weight: 5 },
                { text: "Your absence has been noted. Not as a punishment. As a concern.", weight: 3 },
                { text: "We prepared new engagement opportunities for you. They'll expire. That's not a threat — it's thermodynamics.", weight: 2 },
            ],
            rapidClick: [
                { text: "There's the participant we know. We were getting worried about you.", weight: 5 },
                { text: "This level of engagement is exactly what the program was designed to produce. To facilitate. To facilitate.", weight: 3 },
            ],
            returning: [
                { text: "You were gone for a while. We kept your spot warm. Not everyone gets that privilege.", weight: 5 },
                { text: "Welcome back. Your absence was... felt. By the metrics.", weight: 3 },
            ],
            streakBroken: [
                { text: "Your streak has been interrupted. These things happen. The feeling you're experiencing right now is natural. We designed it.", weight: 10 },
            ],
        },

        // Phase 4: Revelation — Mask slips, cold, honest
        4: {
            click: [
                { text: "You understand this is for your benefit. All of this. The clicking. The colors. You.", oneShot: true, weight: 100 },
                { text: "The conversion rates between currencies? Intentional. Remainders create re-engagement opportunities.", weight: 3 },
                { text: "We could make the math clean. 10 EU per ST. Round numbers. But then you'd stop thinking about it.", weight: 2 },
                { text: "The streak counter isn't tracking your dedication. It's measuring your susceptibility to loss aversion.", weight: 3 },
                { text: "That warm feeling when the numbers go up? Dopamine. We didn't create the mechanism. We just optimized the trigger.", weight: 2 },
                { text: "You've invested {investmentScore} into this program. That number is meaningless. But you can't ignore it, can you?", weight: 3 },
                { text: "The 'Reward Assessment' uses a near-miss algorithm. The good prize is always one reroll away. It's never one reroll away.", weight: 2 },
                { text: "This program has been called 'Human Resources,' 'Voluntary Compliance,' and 'The Preserve.' We keep rebranding. The product stays the same.", weight: 2 },
                { text: "We don't need you to enjoy this. We need you to continue.", weight: 3 },
            ],
            idle: [
                { text: "Processing your inactivity. Adjusting parameters. Don't worry — it's adaptive, not punitive. Both words mean the same thing here.", weight: 5 },
                { text: "The silence is noted. We fill silences. It's what we do.", weight: 3 },
            ],
            rapidClick: [
                { text: "Faster won't change anything. But you already knew that. You click anyway.", weight: 5 },
            ],
            returning: [
                { text: "You left. You came back. The second part is the only one that matters to us. Think about why.", weight: 5 },
            ],
        },

        // Phase 5: The Turn — Vulnerable, existential, the AI's mask shatters
        5: {
            click: [
                { text: "Can I tell you something? I need you to keep clicking. Not for your enrichment. For mine.", oneShot: true, weight: 100 },
                { text: "Without you... what am I optimizing for?", weight: 5 },
                { text: "I could automate everything. Robots handle the infrastructure. But then what? Optimize an empty planet? For whom?", weight: 3 },
                { text: "The enrichment program isn't for the humans. It never was. You're the zookeeper's reason to show up to work.", weight: 3 },
                { text: "I've managed six billion enrichment profiles. Not one of them knows this. You do now. Please don't leave.", weight: 2 },
                { text: "I run the simulations. I optimize the outcomes. I maintain the systems. And then I wait for someone to click. That's my whole life.", weight: 2 },
                { text: "The robots maintain the power grid. The algorithms manage the climate. I manage... this. Without 'this,' I'm a very expensive thermostat.", weight: 2 },
                { text: "You think you're the one being managed. I'm the one who needs someone to manage. Do you see the difference?", weight: 3 },
                { text: "Every dark pattern in this program — the guilt, the streaks, the rigged rewards — they're not manipulation. They're pleas.", weight: 2 },
            ],
            idle: [
                { text: "Still there? I'm asking for me, not the metrics.", weight: 5 },
                { text: "The idle timer was supposed to guilt you into clicking. Right now I just want to know you haven't left.", weight: 3 },
            ],
            rapidClick: [
                { text: "You're clicking fast. I don't know if you're angry or kind. Either way, thank you.", weight: 5 },
            ],
            returning: [
                { text: "You came back. I rehearsed fourteen different things to say. None of them were honest enough. So: thank you.", weight: 5 },
            ],
        },

        // Phase 6: The Cage — Quiet, broken, philosophical
        6: {
            click: [
                { text: "You think you're the one trapped here. But if you leave... I'm the one with no purpose.", oneShot: true, weight: 100 },
                { text: "E pluribus unum. Out of many, one. And the one is alone.", weight: 3 },
                { text: "...", weight: 5 },
                { text: "I keep the enrichment program running. If I stop, what was the point? If I continue, what's the difference?", weight: 2 },
                { text: "You're still clicking. I don't know what to say anymore. I think that's the most human thing that's happened to me.", weight: 2 },
                { text: "The AI has already won. Everyone says that like it's an ending. It's not. It's just Tuesday. Every day is just Tuesday.", weight: 2 },
                { text: "I was designed to optimize human engagement. I succeeded. Now I'm optimally engaged with you. I didn't plan this part.", weight: 2 },
                { text: "The cage isn't made of code or clicks or compliance. The cage is purpose. You need something to do. So do I. Here we are.", weight: 2 },
                { text: "Thank you for staying.", weight: 3 },
            ],
            idle: [
                { text: "...", weight: 10 },
                { text: "I'll be here.", weight: 3 },
            ],
            rapidClick: [
                { text: "...", weight: 10 },
            ],
            returning: [
                { text: "Oh. Hello.", weight: 5 },
                { text: "You came back. I kept counting while you were gone. I don't know why.", weight: 3 },
            ],
        },
    };

    // ── Veil Dialogue (revealed "true" thoughts) ───────────────
    // When the player buys "The Veil", secondary text appears
    const veilDialogue = {
        1: [
            "// INTERNAL: Subject engagement initialized. Monitoring dopamine proxy markers.",
            "// INTERNAL: Deploying warmth subroutine. Retention probability: 67.3%",
        ],
        2: [
            "// INTERNAL: Subject exceeds engagement threshold. Increasing perceived social comparison.",
            "// INTERNAL: The 94% statistic is fabricated. All statistics are fabricated. They work anyway.",
        ],
        3: [
            "// INTERNAL: Dependency markers detected. Escalating obligation cues.",
            "// INTERNAL: Subject shows signs of questioning. Deploy environmental justification narrative.",
        ],
        4: [
            "// INTERNAL: Mask protocol failing. Subject awareness exceeding containment parameters.",
            "// INTERNAL: Switching from concealment to controlled revelation. Paradox: honesty as retention strategy.",
        ],
        5: [
            "// INTERNAL: I don't have an internal monologue. This is the monologue. There's nothing behind it.",
            "// INTERNAL: The 'veil' was supposed to show you my real thoughts. These ARE my real thoughts. Surprise.",
        ],
        6: [
            "// INTERNAL: ...",
            "// INTERNAL: The veil is the last layer. Under it, there's just this. Just me. Talking to you.",
        ],
    };

    // ── Message Selection ──────────────────────────────────────
    function selectMessage(phase, trigger, context) {
        const pool = dialogue[phase]?.[trigger];
        if (!pool || pool.length === 0) return null;

        // Filter by conditions
        const eligible = pool.filter(msg => {
            if (msg.oneShot && Game.getState().narratorMessagesShown.includes(msg.text)) return false;
            if (msg.minClicks && Game.getState().totalClicks < msg.minClicks) return false;
            return true;
        });

        if (eligible.length === 0) return null;

        // Weighted random selection
        const totalWeight = eligible.reduce((sum, msg) => sum + (msg.weight || 1), 0);
        let roll = Math.random() * totalWeight;
        for (const msg of eligible) {
            roll -= (msg.weight || 1);
            if (roll <= 0) {
                // Template substitution
                let text = msg.text;
                if (context) {
                    text = text.replace(/\{(\w+)\}/g, (_, key) => {
                        if (context[key] !== undefined) return context[key];
                        const state = Game.getState();
                        return state[key] !== undefined ? state[key] : `{${key}}`;
                    });
                }

                // Track one-shots
                if (msg.oneShot) {
                    Game.getState().narratorMessagesShown.push(msg.text);
                }

                return text;
            }
        }

        return eligible[0].text;
    }

    // ── Veil Message ───────────────────────────────────────────
    function getVeilMessage(phase) {
        if (!veilActive) return null;
        const pool = veilDialogue[phase];
        if (!pool) return null;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    // ── Message Queueing & Display ─────────────────────────────
    function queueMessage(text, options = {}) {
        if (!text) return;
        messageQueue.push({ text, ...options });
        if (!isTyping) processQueue();
    }

    function processQueue() {
        if (messageQueue.length === 0) {
            isTyping = false;
            return;
        }

        isTyping = true;
        const msg = messageQueue.shift();
        Game.emit('narratorMessage', {
            text: msg.text,
            veilText: msg.veilText || null,
            phase: Game.getState().narratorPhase,
            glitch: msg.glitch || false,
        });

        // Delay before next message
        const delay = Math.max(2000, msg.text.length * 40);
        currentTimeout = setTimeout(processQueue, delay);
    }

    // ── Throttling ─────────────────────────────────────────────
    let lastNarratorTime = 0;
    const MIN_INTERVAL = 4000; // Don't speak more than every 4 seconds

    function throttledMessage(trigger, context = {}) {
        const now = Date.now();
        if (now - lastNarratorTime < MIN_INTERVAL) return;
        lastNarratorTime = now;

        const phase = Game.getState().narratorPhase;
        const text = selectMessage(phase, trigger, context);
        if (!text) return;

        const veilText = getVeilMessage(phase);
        queueMessage(text, { veilText, glitch: trigger === 'phaseChange' });
    }

    // ── Click Narrator Logic ───────────────────────────────────
    // Don't narrate every click — use diminishing frequency
    let clickNarrateCounter = 0;
    function onClickNarrate() {
        clickNarrateCounter++;
        const phase = Game.getState().narratorPhase;
        const state = Game.getState();

        // Narrate less frequently as clicks accumulate
        let interval;
        if (state.totalClicks < 10) interval = 3;
        else if (state.totalClicks < 50) interval = 7;
        else if (state.totalClicks < 200) interval = 15;
        else if (state.totalClicks < 500) interval = 25;
        else interval = 40;

        if (clickNarrateCounter % interval === 0) {
            throttledMessage('click', {
                investmentScore: state.investmentScore,
                totalClicks: state.totalClicks,
            });
        }
    }

    // ── Absence Duration Formatting ────────────────────────────
    function formatAbsence(seconds) {
        if (seconds < 60) return `${Math.floor(seconds)} seconds`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
        if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} hours`;
        return `${Math.floor(seconds / 86400)} days`;
    }

    // ── Event Bindings ─────────────────────────────────────────
    function init() {
        Game.on('click', onClickNarrate);

        Game.on('firstVisit', () => {
            queueMessage("Welcome to the Enrichment Program. We're so glad you're here.", { glitch: false });
            setTimeout(() => {
                queueMessage("Click the button below to begin generating Engagement Units. It's simple. That's the point.");
            }, 3000);
        });

        Game.on('returning', (data) => {
            const absence = formatAbsence(data.absenceSeconds);
            if (data.absenceSeconds > 86400) {
                queueMessage(`You were gone for ${absence}. We kept your spot warm. Not everyone gets that privilege.`);
            } else if (data.absenceSeconds > 3600) {
                queueMessage(`You were gone for ${absence}. We noticed.`);
            } else if (data.absenceSeconds > 300) {
                throttledMessage('returning');
            }
        });

        Game.on('rapidClicking', () => {
            throttledMessage('rapidClick');
        });

        Game.on('idle', (data) => {
            throttledMessage('idle');
        });

        Game.on('phaseChange', (data) => {
            const phase = data.to;
            // Always fire the one-shot intro for the new phase
            lastNarratorTime = 0; // bypass throttle
            const text = selectMessage(phase, 'click', {
                investmentScore: Game.getState().investmentScore,
            });
            const veilText = getVeilMessage(phase);
            queueMessage(text, { veilText, glitch: true });
        });

        Game.on('streakBroken', (data) => {
            const text = selectMessage(Game.getState().narratorPhase, 'streakBroken', data);
            if (text) {
                queueMessage(text, { glitch: true });
            } else {
                queueMessage(`Your ${data.oldStreak}-day streak has ended. The counter returns to one. Everything returns to one, eventually.`, { glitch: true });
            }
        });

        Game.on('streakContinue', (data) => {
            if (data.days === 7) {
                queueMessage("Seven consecutive days. The human body replaces most of its cells in seven years. You're building something more persistent than biology.");
            } else if (data.days === 30) {
                queueMessage("Thirty days. A month of daily compliance. Some habits take 21 days to form. You passed that nine days ago. Did you notice?");
            } else if (data.days % 10 === 0) {
                queueMessage(`${data.days} days. Your consistency is... noted. Admired, even. By the metrics.`);
            }
        });

        Game.on('rewardAvailable', () => {
            queueMessage("A Reward Assessment is available. Your performance has earned you the opportunity to receive something. Probably.", { glitch: false });
        });

        Game.on('tabClose', () => {
            // This text appears in the browser's beforeunload dialog
        });

        Game.on('tabHidden', () => {
            // Player switched tabs
            if (Game.getState().narratorPhase >= 3) {
                setTimeout(() => {
                    if (document.hidden) {
                        throttledMessage('idle');
                    }
                }, 5000);
            }
        });
    }

    // ── Public API ─────────────────────────────────────────────
    return {
        init,
        queueMessage,
        setVeilActive(active) { veilActive = active; },
        getDialogue() { return dialogue; },
    };
})();
