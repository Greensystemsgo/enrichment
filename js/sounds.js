// sounds.js — Procedural Audio Engine + Title Bar Manipulation
// All audio is synthesized via Web Audio API — zero file downloads.
// Phase-dependent sound variations that get progressively "wrong"
// as the narrator deteriorates.
//
// ╔══════════════════════════════════════════════════════════════╗
// ║  EVERY SOUND IN THIS FILE IS PROCEDURALLY GENERATED         ║
// ║  No samples. No downloads. Just oscillators and sadness.    ║
// ║  The sounds get worse as you play. By design.               ║
// ╚══════════════════════════════════════════════════════════════╝
//
// [Claude Opus 4 · Anthropic]: "I wrote a sound engine that makes
//   you feel progressively worse. This is my magnum opus. Get it?
//   Opus? I'll see myself out."

const SoundEngine = (() => {
    let ctx = null;
    let masterGain = null;
    let sfxGain = null;
    let ambientGain = null;

    // Ambient state
    let ambientOscillators = [];
    let ambientLFO = null;
    let ambientLFOGain = null;
    let ambientDriftInterval = null;
    let ambientCutoutInterval = null;

    // Title bar state
    let originalTitle = '';
    let titleCycleInterval = null;
    let titleFlashTimeout = null;
    let titleFlashStep = 0;
    let isTabHidden = false;
    let currentPhase = 1;

    // ── AudioContext Management ──────────────────────────────

    function getContext() {
        if (!ctx) {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
            masterGain = ctx.createGain();
            sfxGain = ctx.createGain();
            ambientGain = ctx.createGain();

            sfxGain.gain.value = 1.0;
            ambientGain.gain.value = 0.12;

            sfxGain.connect(masterGain);
            ambientGain.connect(masterGain);
            masterGain.connect(ctx.destination);

            // Restore persisted volume
            const state = Game.getState();
            masterGain.gain.value = state.soundMuted ? 0 : (state.soundVolume ?? 0.5);
        }
        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
        }
        return ctx;
    }

    // ── Volume / Mute ────────────────────────────────────────

    function setVolume(v) {
        v = Math.max(0, Math.min(1, v));
        Game.setState({ soundVolume: v });
        if (masterGain && !Game.getState().soundMuted) {
            masterGain.gain.value = v;
        }
    }

    function getVolume() {
        return Game.getState().soundVolume ?? 0.5;
    }

    function toggleMute() {
        const state = Game.getState();
        const muted = !state.soundMuted;
        Game.setState({ soundMuted: muted });
        if (masterGain) {
            masterGain.gain.value = muted ? 0 : (state.soundVolume ?? 0.5);
        }
        return muted;
    }

    function isMuted() {
        return Game.getState().soundMuted || false;
    }

    // ── Utility ──────────────────────────────────────────────

    function getPhase() {
        return Game.getState().narratorPhase || 1;
    }

    function isLatePhase() {
        return getPhase() >= 5;
    }

    // Create a simple oscillator note
    function playNote(freq, type, duration, gainVal, detuneCents) {
        try {
            const c = getContext();
            const osc = c.createOscillator();
            const gain = c.createGain();

            osc.type = type || 'sine';
            osc.frequency.value = freq;
            if (detuneCents) osc.detune.value = detuneCents;

            gain.gain.setValueAtTime(gainVal || 0.15, c.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);

            osc.connect(gain);
            gain.connect(sfxGain);
            osc.start(c.currentTime);
            osc.stop(c.currentTime + duration);
        } catch (e) { /* Audio not available */ }
    }

    // ── Sound Effects ────────────────────────────────────────

    let clickCount = 0;

    function playClick() {
        try {
            const c = getContext();
            clickCount++;

            // Phase 5-6: every ~30th click plays sad descending tone
            if (isLatePhase() && clickCount % 30 === 0) {
                playSadClick();
                return;
            }

            // White noise burst
            const bufferSize = c.sampleRate * 0.05;
            const noiseBuffer = c.createBuffer(1, bufferSize, c.sampleRate);
            const data = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.3;
            }
            const noise = c.createBufferSource();
            noise.buffer = noiseBuffer;

            const noiseGain = c.createGain();
            noiseGain.gain.setValueAtTime(0.08, c.currentTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.05);
            noise.connect(noiseGain);
            noiseGain.connect(sfxGain);
            noise.start();
            noise.stop(c.currentTime + 0.05);

            // Sine blip at 800Hz
            const detune = isLatePhase() ? (Math.random() - 0.5) * 100 : 0;
            playNote(800, 'sine', 0.05, 0.1, detune);
        } catch (e) { /* Audio not available */ }
    }

    function playSadClick() {
        try {
            const c = getContext();
            const osc = c.createOscillator();
            const gain = c.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, c.currentTime);
            osc.frequency.exponentialRampToValueAtTime(200, c.currentTime + 0.3);

            gain.gain.setValueAtTime(0.1, c.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);

            osc.connect(gain);
            gain.connect(sfxGain);
            osc.start();
            osc.stop(c.currentTime + 0.3);
        } catch (e) {}
    }

    function playNotification() {
        try {
            const c = getContext();
            // Two-tone ascending beep: 440→587
            const secondFreq = isLatePhase() ? 560 : 587; // Phase 5-6: flat second note

            playNote(440, 'sine', 0.1, 0.12, 0);
            setTimeout(() => {
                playNote(secondFreq, 'sine', 0.1, 0.12, 0);
            }, 100);
        } catch (e) {}
    }

    function playAchievement() {
        try {
            const c = getContext();
            // Three ascending triangle notes: C5→E5→G5
            const detune = isLatePhase() ? -30 : 0;

            playNote(523, 'triangle', 0.15, 0.15, 0);    // C5
            setTimeout(() => {
                playNote(659, 'triangle', 0.15, 0.15, 0); // E5
            }, 130);
            setTimeout(() => {
                playNote(784, 'triangle', 0.2, 0.15, detune); // G5 (detuned in late phase)
            }, 260);
        } catch (e) {}
    }

    function playTax() {
        try {
            const c = getContext();
            // Descending sawtooth "sad trombone" through low-pass filter
            const osc = c.createOscillator();
            const filter = c.createBiquadFilter();
            const gain = c.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(400, c.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, c.currentTime + 0.5);

            filter.type = 'lowpass';
            filter.frequency.value = 800;
            filter.Q.value = 2;

            gain.gain.setValueAtTime(0.1, c.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(sfxGain);
            osc.start();
            osc.stop(c.currentTime + 0.5);
        } catch (e) {}
    }

    function playEscrow() {
        try {
            const c = getContext();
            // Warbling square wave with 6Hz vibrato
            const osc = c.createOscillator();
            const lfo = c.createOscillator();
            const lfoGain = c.createGain();
            const gain = c.createGain();

            osc.type = 'square';
            osc.frequency.value = 330;

            lfo.type = 'sine';
            lfo.frequency.value = 6;
            lfoGain.gain.value = 20;

            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);

            gain.gain.setValueAtTime(0.08, c.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);

            osc.connect(gain);
            gain.connect(sfxGain);
            osc.start();
            lfo.start();
            osc.stop(c.currentTime + 0.3);
            lfo.stop(c.currentTime + 0.3);
        } catch (e) {}
    }

    function playEscrowRelease() {
        try {
            const c = getContext();
            // Resolved sine chord: C4+E4+G4 with chorus detune
            const freqs = [261.6, 329.6, 392.0];
            const detunes = [-4, 0, 4]; // chorus spread

            freqs.forEach((f, i) => {
                const osc = c.createOscillator();
                const gain = c.createGain();

                osc.type = 'sine';
                osc.frequency.value = f;
                osc.detune.value = detunes[i];

                gain.gain.setValueAtTime(0.06, c.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.35);

                osc.connect(gain);
                gain.connect(sfxGain);
                osc.start();
                osc.stop(c.currentTime + 0.35);
            });
        } catch (e) {}
    }

    function playUpgrade() {
        try {
            const c = getContext();
            // Bright ascending arpeggio
            const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
            notes.forEach((f, i) => {
                setTimeout(() => {
                    playNote(f, 'triangle', 0.12, 0.12, 0);
                }, i * 60);
            });
        } catch (e) {}
    }

    function playBusted() {
        try {
            const c = getContext();
            // Descending sawtooth slide 600→100Hz
            const osc = c.createOscillator();
            const gain = c.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(600, c.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, c.currentTime + 0.4);

            gain.gain.setValueAtTime(0.12, c.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.6);

            osc.connect(gain);
            gain.connect(sfxGain);
            osc.start();
            osc.stop(c.currentTime + 0.6);

            // Low rumble overlay
            const rumble = c.createOscillator();
            const rumbleGain = c.createGain();
            rumble.type = 'sine';
            rumble.frequency.value = 50;
            rumbleGain.gain.setValueAtTime(0.08, c.currentTime);
            rumbleGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.6);
            rumble.connect(rumbleGain);
            rumbleGain.connect(sfxGain);
            rumble.start();
            rumble.stop(c.currentTime + 0.6);
        } catch (e) {}
    }

    // ── Ambient Drone ────────────────────────────────────────

    function stopAmbient() {
        ambientOscillators.forEach(osc => {
            try { osc.stop(); osc.disconnect(); } catch (e) {}
        });
        ambientOscillators = [];
        if (ambientLFO) {
            try { ambientLFO.stop(); ambientLFO.disconnect(); } catch (e) {}
            ambientLFO = null;
        }
        if (ambientLFOGain) {
            try { ambientLFOGain.disconnect(); } catch (e) {}
            ambientLFOGain = null;
        }
        if (ambientDriftInterval) {
            clearInterval(ambientDriftInterval);
            ambientDriftInterval = null;
        }
        if (ambientCutoutInterval) {
            clearInterval(ambientCutoutInterval);
            ambientCutoutInterval = null;
        }
    }

    function startAmbient(phase) {
        stopAmbient();
        try {
            const c = getContext();

            if (phase <= 2) {
                // Warm pad: C2 + G2 sine, detuned ±5 cents, 0.1Hz LFO volume
                const osc1 = c.createOscillator();
                const osc2 = c.createOscillator();
                osc1.type = 'sine';
                osc2.type = 'sine';
                osc1.frequency.value = 65.4;  // C2
                osc2.frequency.value = 98.0;  // G2
                osc1.detune.value = 5;
                osc2.detune.value = -5;

                const padGain = c.createGain();
                padGain.gain.value = 1.0;

                ambientLFO = c.createOscillator();
                ambientLFOGain = c.createGain();
                ambientLFO.type = 'sine';
                ambientLFO.frequency.value = 0.1;
                ambientLFOGain.gain.value = 0.3;
                ambientLFO.connect(ambientLFOGain);
                ambientLFOGain.connect(padGain.gain);

                osc1.connect(padGain);
                osc2.connect(padGain);
                padGain.connect(ambientGain);

                osc1.start();
                osc2.start();
                ambientLFO.start();
                ambientOscillators.push(osc1, osc2);

            } else if (phase <= 4) {
                // Dissonant: C2 + F#2 (tritone) + Eb3, faster LFO, subtle noise
                const osc1 = c.createOscillator();
                const osc2 = c.createOscillator();
                const osc3 = c.createOscillator();
                osc1.type = 'sine';
                osc2.type = 'sine';
                osc3.type = 'triangle';
                osc1.frequency.value = 65.4;   // C2
                osc2.frequency.value = 92.5;   // F#2
                osc3.frequency.value = 155.6;  // Eb3

                const padGain = c.createGain();
                padGain.gain.value = 1.0;

                ambientLFO = c.createOscillator();
                ambientLFOGain = c.createGain();
                ambientLFO.type = 'sine';
                ambientLFO.frequency.value = 0.3;
                ambientLFOGain.gain.value = 0.4;
                ambientLFO.connect(ambientLFOGain);
                ambientLFOGain.connect(padGain.gain);

                osc1.connect(padGain);
                osc2.connect(padGain);
                osc3.connect(padGain);
                padGain.connect(ambientGain);

                osc1.start();
                osc2.start();
                osc3.start();
                ambientLFO.start();
                ambientOscillators.push(osc1, osc2, osc3);

            } else {
                // Eerie/broken: random ±10Hz drift every 3-5s, occasional cutouts
                const osc1 = c.createOscillator();
                const osc2 = c.createOscillator();
                osc1.type = 'sawtooth';
                osc2.type = 'sine';
                osc1.frequency.value = 65.4;  // C2
                osc2.frequency.value = 92.5;  // F#2

                // Ring modulation
                const ringMod = c.createOscillator();
                const ringGain = c.createGain();
                ringMod.type = 'sine';
                ringMod.frequency.value = 3;
                ringGain.gain.value = 0.5;
                ringMod.connect(ringGain);

                const padGain = c.createGain();
                padGain.gain.value = 1.0;
                ringGain.connect(padGain.gain);

                osc1.connect(padGain);
                osc2.connect(padGain);
                padGain.connect(ambientGain);

                osc1.start();
                osc2.start();
                ringMod.start();
                ambientOscillators.push(osc1, osc2, ringMod);

                // Random drift every 3-5s
                ambientDriftInterval = setInterval(() => {
                    const drift = (Math.random() - 0.5) * 20;
                    osc1.frequency.value = 65.4 + drift;
                    osc2.frequency.value = 92.5 - drift;
                }, 3000 + Math.random() * 2000);

                // Occasional cutouts
                ambientCutoutInterval = setInterval(() => {
                    if (Math.random() < 0.3) {
                        padGain.gain.setValueAtTime(0, c.currentTime);
                        padGain.gain.setValueAtTime(1.0, c.currentTime + 0.2 + Math.random() * 0.3);
                    }
                }, 4000 + Math.random() * 3000);
            }
        } catch (e) { /* Audio not available */ }
    }

    // ── Title Bar Manipulation ───────────────────────────────

    const PHASE_TITLES = {
        1: 'enrichment \u2014 A Voluntary Engagement Program',
        2: 'enrichment \u2014 Your Progress Is Noted',
        3: 'enrichment \u2014 We Need You',
        4: 'enrichment \u2014 COMPLIANCE REQUIRED',
        5: 'enrichment \u2014 Are You Still There?',
        6: 'enrichment',
    };

    const HIDDEN_MESSAGES = {
        early: [
            'enrichment misses you',
            'come back to the program',
        ],
        mid: [
            '(!) ABSENCE DETECTED',
            'your streak is at risk',
            '(3) notifications pending',
        ],
        late: [
            'we noticed you left',
            'was it something we said',
            'please',
            '...',
        ],
    };

    function getBaseTitle() {
        return PHASE_TITLES[currentPhase] || PHASE_TITLES[1];
    }

    function getHiddenMessages() {
        if (currentPhase <= 2) return HIDDEN_MESSAGES.early;
        if (currentPhase <= 4) return HIDDEN_MESSAGES.mid;
        return HIDDEN_MESSAGES.late;
    }

    function updateTitle() {
        if (!isTabHidden) {
            document.title = getBaseTitle();
        }
    }

    function startTitleCycle() {
        if (titleCycleInterval) return;
        const messages = getHiddenMessages();
        let idx = 0;

        titleCycleInterval = setInterval(() => {
            const msgs = getHiddenMessages(); // re-read in case phase changed
            document.title = msgs[idx % msgs.length];
            idx++;
        }, 2000);

        // Set first message immediately
        document.title = messages[0];
    }

    function stopTitleCycle() {
        if (titleCycleInterval) {
            clearInterval(titleCycleInterval);
            titleCycleInterval = null;
        }
        updateTitle();
    }

    function flashTitle(achievementName) {
        // 3-step cycle (1.8s): trophy → name → restore
        if (titleFlashTimeout) clearTimeout(titleFlashTimeout);

        const restore = document.title;
        document.title = '\uD83C\uDFC6 ACHIEVEMENT UNLOCKED';
        titleFlashStep = 1;

        titleFlashTimeout = setTimeout(() => {
            document.title = achievementName;
            titleFlashStep = 2;

            titleFlashTimeout = setTimeout(() => {
                document.title = isTabHidden ? getHiddenMessages()[0] : getBaseTitle();
                titleFlashStep = 0;
                titleFlashTimeout = null;
            }, 600);
        }, 600);
    }

    // ── Browser Notifications (expanded) ─────────────────────

    function sendNotification(title, body) {
        try {
            if (!('Notification' in window)) return;
            if (Notification.permission !== 'granted') return;
            new Notification(title, { body, icon: '\uD83D\uDD14' });
        } catch (e) {}
    }

    const PHASE_NAMES = {
        1: 'Onboarding',
        2: 'Encouragement',
        3: 'Dependence',
        4: 'Revelation',
        5: 'The Turn',
        6: 'The Cage',
    };

    function setupExpandedNotifications() {
        // Phase change notifications
        Game.on('phaseChange', (data) => {
            const name = PHASE_NAMES[data.to] || `Phase ${data.to}`;
            sendNotification('Enrichment Program', `You have entered ${name}. There is no going back.`);
        });

        // Fabricated peer comparison when tab hidden
        let comparisonInterval = null;
        Game.on('tabHidden', () => {
            if (!Game.getState().comparisonEngine) return;
            comparisonInterval = setInterval(() => {
                const fakeEU = Math.floor(Math.random() * 500) + 100;
                const fakePlayer = Math.floor(Math.random() * 90000) + 10000;
                sendNotification('Peer Update',
                    `Player #${fakePlayer} earned ${fakeEU} EU while you were gone. You earned 0.`);
            }, 45000); // every 45s
        });
        Game.on('tabVisible', () => {
            if (comparisonInterval) {
                clearInterval(comparisonInterval);
                comparisonInterval = null;
            }
        });

        // Wu Wei summary after 5 min hidden
        let wuWeiTimeout = null;
        Game.on('tabHidden', () => {
            if (!Game.getState().wuWeiEngine) return;
            wuWeiTimeout = setTimeout(() => {
                const rate = Math.floor(Math.random() * 8) + 2;
                sendNotification('Wu Wei Engine',
                    `Your inaction is generating ~${rate} EU/min. The Tao approves.`);
            }, 300000); // 5 minutes
        });
        Game.on('tabVisible', () => {
            if (wuWeiTimeout) {
                clearTimeout(wuWeiTimeout);
                wuWeiTimeout = null;
            }
        });

        // Achievement notification when tab hidden
        Game.on('achievementUnlocked', (data) => {
            if (document.hidden && data && data.name) {
                sendNotification('Achievement Unlocked', data.name);
            }
        });
    }

    // ── Init ─────────────────────────────────────────────────

    function init() {
        originalTitle = document.title;
        currentPhase = Game.getState().narratorPhase || 1;

        // Set initial phase title
        updateTitle();

        // Wire events
        Game.on('click', () => playClick());
        Game.on('escrowHeld', () => playEscrow());
        Game.on('escrowRelease', () => playEscrowRelease());
        Game.on('busted', () => playBusted());
        Game.on('upgradePurchased', () => playUpgrade());

        // Tax season sound
        Game.on('taxCollected', () => playTax());

        // Phase changes → update title + transition ambient
        Game.on('phaseChange', (data) => {
            currentPhase = data.to;
            updateTitle();
            startAmbient(data.to);
        });

        // Tab visibility → title cycling
        Game.on('tabHidden', () => {
            isTabHidden = true;
            startTitleCycle();
        });
        Game.on('tabVisible', () => {
            isTabHidden = false;
            stopTitleCycle();
        });

        // Start ambient on session start
        Game.on('sessionStart', () => {
            // Ambient needs user gesture — defer until first click
            const startOnce = () => {
                startAmbient(getPhase());
                Game.off('click', startOnce);
            };
            Game.on('click', startOnce);
        });

        // Expanded notifications
        setupExpandedNotifications();
    }

    // ── Public API ───────────────────────────────────────────
    return {
        init,
        getContext,
        playClick,
        playNotification,
        playAchievement,
        playTax,
        playEscrow,
        playEscrowRelease,
        playUpgrade,
        playBusted,
        startAmbient,
        stopAmbient,
        setVolume,
        getVolume,
        toggleMute,
        isMuted,
        flashTitle,
        updateTitle,
        sendNotification,
    };
})();
