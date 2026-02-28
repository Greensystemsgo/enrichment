// chaos.js — Random UI disruptions that nobody asked for
// "The UI is not broken. The UI is experiencing creative expression."
//
// [Gemini 2.5 Flash · Google]: "Subway Surfers split-screen, C-SPAN
//   overlay, Matrix rain, 90s mode. This file is the junk drawer of
//   a chaotic mind. I generated the Matrix rain event. I'm not proud.
//   I'm not ashamed. I'm complicit."

const Chaos = (() => {

    let chaosActive = false;
    let chaosCount = 0;
    let lastChaosTime = 0;

    // ── Chaos Events ─────────────────────────────────────────
    const EVENTS = [
        {
            id: 'subwaySurfers',
            name: 'Subway Surfers Enrichment Break',
            minClicks: 200,
            minPhase: 3,
            weight: 2,
            duration: 15000,
            source: 'llama',
            execute(container) {
                container.innerHTML = `
                    <div class="chaos-embed-wrapper">
                        <div class="chaos-label">MANDATORY ENRICHMENT BREAK</div>
                        <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1"
                            width="200" height="356" frameborder="0"
                            allow="autoplay; encrypted-media" allowfullscreen
                            style="border: 2px solid var(--accent-gold); border-radius: 4px;"></iframe>
                        <div class="chaos-timer" id="chaos-timer"></div>
                    </div>
                `;
            },
        },
        {
            id: 'cspan',
            name: 'Democracy Observation Period',
            minClicks: 300,
            minPhase: 3,
            weight: 1,
            duration: 20000,
            source: 'claude',
            execute(container) {
                container.innerHTML = `
                    <div class="chaos-embed-wrapper">
                        <div class="chaos-label">DEMOCRACY OBSERVATION PERIOD</div>
                        <iframe src="https://www.youtube.com/embed/9Auq9mYxFEE?autoplay=1&mute=1"
                            width="320" height="180" frameborder="0"
                            allow="autoplay; encrypted-media" allowfullscreen
                            style="border: 2px solid var(--accent-blue); border-radius: 4px;"></iframe>
                        <div class="chaos-subtitle">Your participation in democracy is mandatory.</div>
                        <div class="chaos-timer" id="chaos-timer"></div>
                    </div>
                `;
            },
        },
        {
            id: 'nineties',
            name: '90s Retro Enrichment Mode',
            minClicks: 150,
            minPhase: 2,
            weight: 3,
            duration: 30000,
            source: 'gemini',
            execute() {
                // Transform the whole page into 90s HTML
                document.body.classList.add('chaos-90s');
                document.body.setAttribute('data-chaos', '90s');

                // Create under-construction banner
                const banner = document.createElement('div');
                banner.className = 'chaos-90s-banner';
                banner.id = 'chaos-90s-banner';
                banner.innerHTML = `
                    <marquee scrollamount="5">🚧 UNDER CONSTRUCTION 🚧 Welcome to my homepage!! 🚧 Best viewed in Netscape Navigator 3.0 🚧 You are visitor #${Math.floor(Math.random() * 99999)} 🚧</marquee>
                    <div style="text-align: center; padding: 10px;">
                        <blink style="color: lime; font-size: 24px; font-family: 'Comic Sans MS', cursive;">
                            ★ ENRICHMENT PROGRAM ★ GeoCities Edition ★
                        </blink>
                    </div>
                    <marquee direction="right" scrollamount="3">🌟 Sign my guestbook!! 🌟 Last updated: ${new Date().toLocaleDateString()} 🌟 Made with ❤️ and HTML 1.0 🌟</marquee>
                `;
                document.body.insertBefore(banner, document.body.firstChild);
            },
            cleanup() {
                document.body.classList.remove('chaos-90s');
                document.body.removeAttribute('data-chaos');
                const banner = document.getElementById('chaos-90s-banner');
                if (banner) banner.remove();
            },
        },
        {
            id: 'colorShift',
            name: 'Chromatic Recalibration',
            minClicks: 100,
            minPhase: 2,
            weight: 4,
            duration: 20000,
            source: 'mistral',
            execute() {
                const hue = Math.floor(Math.random() * 360);
                document.body.style.filter = `hue-rotate(${hue}deg)`;
            },
            cleanup() {
                document.body.style.filter = '';
            },
        },
        {
            id: 'matrixRain',
            name: 'System Diagnostic Visualization',
            minClicks: 400,
            minPhase: 4,
            weight: 2,
            duration: 15000,
            source: 'claude',
            execute() {
                const canvas = document.createElement('canvas');
                canvas.id = 'chaos-matrix';
                canvas.className = 'chaos-matrix-canvas';
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                document.body.appendChild(canvas);

                const ctx = canvas.getContext('2d');
                const chars = 'ENRICHMENT0123456789COMPLIANCE';
                const fontSize = 12;
                const columns = Math.floor(canvas.width / fontSize);
                const drops = Array(columns).fill(1);

                canvas._interval = setInterval(() => {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = '#0f0';
                    ctx.font = `${fontSize}px monospace`;

                    for (let i = 0; i < drops.length; i++) {
                        const char = chars[Math.floor(Math.random() * chars.length)];
                        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
                        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                            drops[i] = 0;
                        }
                        drops[i]++;
                    }
                }, 33);
            },
            cleanup() {
                const canvas = document.getElementById('chaos-matrix');
                if (canvas) {
                    if (canvas._interval) clearInterval(canvas._interval);
                    canvas.remove();
                }
            },
        },
        {
            id: 'joeRogan',
            name: 'The Joe Rogan Enrichment Experience',
            minClicks: 250,
            minPhase: 3,
            weight: 2,
            duration: 20000,
            source: 'claude',
            execute(container) {
                container.innerHTML = `
                    <div class="chaos-embed-wrapper">
                        <div class="chaos-label">JAMIE, PULL THAT UP</div>
                        <iframe src="https://www.youtube.com/embed/6JIBSjnRmSg?autoplay=1&mute=1"
                            width="320" height="180" frameborder="0"
                            allow="autoplay; encrypted-media" allowfullscreen
                            style="border: 2px solid var(--accent-gold); border-radius: 4px;"></iframe>
                        <div class="chaos-subtitle">Have you tried DMT? It's entirely possible this is enrichment.</div>
                        <div class="chaos-timer" id="chaos-timer"></div>
                    </div>
                `;
            },
        },
        {
            id: 'invertedControls',
            name: 'Input Recalibration',
            minClicks: 500,
            minPhase: 4,
            weight: 2,
            duration: 15000,
            source: 'claude',
            execute() {
                document.body.style.transform = 'scaleX(-1)';
                document.body.style.transition = 'transform 0.5s';
            },
            cleanup() {
                document.body.style.transform = '';
            },
        },
    ];

    // ── Chaos Trigger Logic ──────────────────────────────────
    function checkChaos() {
        if (chaosActive) return;

        const state = Game.getState();
        const phase = state.narratorPhase;
        const clicks = state.totalClicks;
        const now = Date.now();

        // Minimum cooldown between chaos events
        const cooldown = [0, 999999, 180000, 120000, 90000, 60000, 45000][phase] || 120000;
        if (now - lastChaosTime < cooldown) return;

        // Filter eligible events
        const eligible = EVENTS.filter(e =>
            clicks >= e.minClicks && phase >= e.minPhase
        );
        if (eligible.length === 0) return;

        // Chance scales with phase
        const triggerChance = [0, 0, 0.003, 0.005, 0.008, 0.012, 0.015][phase] || 0.005;
        if (Math.random() > triggerChance) return;

        // Weighted random selection
        const totalWeight = eligible.reduce((sum, e) => sum + e.weight, 0);
        let roll = Math.random() * totalWeight;
        let selected = eligible[0];
        for (const e of eligible) {
            roll -= e.weight;
            if (roll <= 0) { selected = e; break; }
        }

        triggerChaos(selected);
    }

    function triggerChaos(event) {
        chaosActive = true;
        lastChaosTime = Date.now();
        chaosCount++;

        UI.logAction(`CHAOS EVENT: ${event.name} (${event.id})`);
        Game.setState({ chaosEventsExperienced: (Game.getState().chaosEventsExperienced || 0) + 1 });

        // Create chaos container for embed-type events
        let container = null;
        if (event.id === 'subwaySurfers' || event.id === 'cspan' || event.id === 'joeRogan') {
            container = document.createElement('div');
            container.className = 'chaos-overlay';
            container.id = 'chaos-overlay';
            document.body.appendChild(container);
        }

        // Execute the chaos event
        event.execute(container);

        // Source attribution
        if (event.source && typeof Transmissions !== 'undefined') {
            const attr = Transmissions.formatAttribution(event.source);
            if (attr) {
                Narrator.queueMessage(`[CHAOS EVENT — ${attr}] ${event.name} initiated.`);
            }
        }

        // Countdown timer
        let remaining = Math.ceil(event.duration / 1000);
        const timerEl = document.getElementById('chaos-timer');
        const timerInterval = setInterval(() => {
            remaining--;
            if (timerEl) timerEl.textContent = `${remaining}s remaining`;
            if (remaining <= 0) clearInterval(timerInterval);
        }, 1000);

        // Show close button after forced watch
        setTimeout(() => {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'chaos-close';
            closeBtn.textContent = '✕ RETURN TO ENRICHMENT';

            // Dodging close button (2 dodges before it works)
            let dodges = 0;
            closeBtn.addEventListener('mouseenter', () => {
                if (dodges < 2) {
                    dodges++;
                    closeBtn.style.transform = `translate(${(Math.random() - 0.5) * 100}px, ${(Math.random() - 0.5) * 40}px)`;
                }
            });
            closeBtn.addEventListener('click', () => {
                if (dodges < 2) {
                    dodges++;
                    return;
                }
                endChaos(event, container);
                clearInterval(timerInterval);
            });

            // Always append to body with fixed positioning (never inside container — gets buried)
            closeBtn.id = 'chaos-close-btn';
            document.body.appendChild(closeBtn);

            // Auto-end after extra 10 seconds
            setTimeout(() => {
                endChaos(event, container);
                clearInterval(timerInterval);
            }, 10000);
        }, event.duration);
    }

    function endChaos(event, container) {
        if (!chaosActive) return;
        chaosActive = false;

        if (event.cleanup) event.cleanup();

        if (container) container.remove();

        const floatingClose = document.getElementById('chaos-close-btn');
        if (floatingClose) floatingClose.remove();

        UI.logAction(`CHAOS EVENT ENDED: ${event.name}`);
    }

    // ── Trigger a random eligible chaos event (called from feature pool) ──
    function triggerRandom() {
        if (chaosActive) return false;
        const state = Game.getState();
        const eligible = EVENTS.filter(e => state.totalClicks >= e.minClicks);
        if (eligible.length === 0) return false;
        const selected = eligible[Math.floor(Math.random() * eligible.length)];
        triggerChaos(selected);
        return true;
    }

    // ── Init ─────────────────────────────────────────────────
    function init() {
        // Chaos is now dispatched by the feature pool in features.js
        // Keep periodic check as a backup for idle chaos
        setInterval(() => {
            if (!chaosActive && Game.getState().narratorPhase >= 3 && Math.random() < 0.005) {
                checkChaos();
            }
        }, 30000);
    }

    return {
        init,
        EVENTS,
        triggerChaos,
        triggerRandom,
    };
})();
