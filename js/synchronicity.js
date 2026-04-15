// synchronicity.js — The Synchronicity Engine
//
// ╔══════════════════════════════════════════════════════════════╗
// ║  REAL DATA · FAKE CORRELATIONS · MANUFACTURED GUILT          ║
// ║                                                              ║
// ║  Pulls live data from NASA NeoWs (asteroids), USGS           ║
// ║  (earthquakes), and NVD (CVEs). Combines the data with the   ║
// ║  player's recent click activity. Manufactures a statistically║
// ║  significant correlation. Ships it as a guilt mechanism.     ║
// ║                                                              ║
// ║  This is the satire: the engagement algorithm dressed up as  ║
// ║  insight. The user gets "personalized analysis" that is      ║
// ║  pure fabrication. The data is real. The meaning is not.     ║
// ╚══════════════════════════════════════════════════════════════╝

const Synchronicity = (() => {
    const NEOWS_URL = (date) => `https://api.nasa.gov/neo/rest/v1/feed?start_date=${date}&end_date=${date}&api_key=DEMO_KEY`;
    const USGS_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson';
    const NVD_URL = 'https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=10&pubStartDate=' + encodeURIComponent(new Date(Date.now() - 86400000).toISOString().split('.')[0]) + '&pubEndDate=' + encodeURIComponent(new Date().toISOString().split('.')[0]);

    // ── Fetchers (all return null on failure — engine degrades gracefully) ──
    async function fetchAsteroids() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const res = await fetch(NEOWS_URL(today));
            if (!res.ok) return null;
            const data = await res.json();
            const arr = (data.near_earth_objects && data.near_earth_objects[today]) || [];
            return {
                count: arr.length,
                hazardous: arr.filter(a => a.is_potentially_hazardous_asteroid).length,
                closest: arr.reduce((m, a) => {
                    const dist = parseFloat((a.close_approach_data[0] || {}).miss_distance?.kilometers || Infinity);
                    return (!m || dist < m.dist) ? { name: a.name, dist, velocity: parseFloat((a.close_approach_data[0] || {}).relative_velocity?.kilometers_per_hour || 0) } : m;
                }, null),
            };
        } catch (e) { return null; }
    }

    async function fetchQuakes() {
        try {
            const res = await fetch(USGS_URL);
            if (!res.ok) return null;
            const data = await res.json();
            const arr = data.features || [];
            const biggest = arr.reduce((m, q) => (!m || q.properties.mag > m.mag) ? { mag: q.properties.mag, place: q.properties.place, time: q.properties.time } : m, null);
            return { count: arr.length, biggest };
        } catch (e) { return null; }
    }

    async function fetchCVEs() {
        try {
            const res = await fetch(NVD_URL);
            if (!res.ok) return null;
            const data = await res.json();
            const vulns = data.vulnerabilities || [];
            const critical = vulns.filter(v => {
                const m = v.cve.metrics || {};
                const score = (m.cvssMetricV31?.[0]?.cvssData?.baseScore || m.cvssMetricV30?.[0]?.cvssData?.baseScore || 0);
                return score >= 9.0;
            });
            return {
                count: data.totalResults || vulns.length,
                criticalCount: critical.length,
                sample: vulns[0]?.cve?.id || null,
            };
        } catch (e) { return null; }
    }

    // ── Fabricated stats helpers ──────────────────────────────
    // These look real. They are not. That is the point.
    function fakeP() {
        // Always extremely significant — that's the joke
        return (0.001 + Math.random() * 0.049).toFixed(4);
    }
    function fakeR() {
        return (0.71 + Math.random() * 0.27).toFixed(3);
    }
    function fakeBayes() {
        return (0.84 + Math.random() * 0.15).toFixed(3);
    }
    function fakeCohen() {
        return (1.2 + Math.random() * 1.8).toFixed(2);
    }

    // ── Correlation generator ─────────────────────────────────
    function manufactureCorrelation(data, state) {
        const clicks = state.totalClicks || 0;
        const sessionClicks = state.sessionClicks || 0;
        const eu = Math.floor(state.lifetimeEU || 0);
        const cps = state.totalSessionTime > 0 ? (clicks / state.totalSessionTime).toFixed(3) : '0.000';
        const now = new Date();
        const utcStr = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

        const correlations = [];

        if (data.asteroids) {
            const a = data.asteroids;
            if (a.closest) {
                correlations.push({
                    headline: `${a.count} near-Earth objects passed today. ${a.hazardous} were classified hazardous.`,
                    body: `The closest, <b>${a.closest.name}</b>, missed Earth by ${Math.round(a.closest.dist).toLocaleString()} km at ${Math.round(a.closest.velocity).toLocaleString()} km/h. During the same window, you produced <b>${sessionClicks}</b> clicks. Pearson r = ${fakeR()}, p = ${fakeP()}. The Engine has concluded your clicking is gravitationally entangled with this asteroid's trajectory. We are not at liberty to say in which direction.`,
                });
            } else if (a.count > 0) {
                correlations.push({
                    headline: `${a.count} near-Earth objects detected today.`,
                    body: `None passed close enough to matter. You clicked anyway. Cohen's d = ${fakeCohen()}, suggesting a large effect size. The effect remains unspecified.`,
                });
            }
        }

        if (data.quakes && data.quakes.biggest) {
            const q = data.quakes.biggest;
            const ts = new Date(q.time).toISOString().slice(11, 19);
            correlations.push({
                headline: `M${q.mag.toFixed(1)} earthquake near ${q.place}.`,
                body: `Recorded at ${ts} UTC. At that exact moment, your click rate was <b>${cps} clicks/sec</b>. Bayesian posterior probability of co-causation: <b>${fakeBayes()}</b>. The Engine acknowledges that geological events and your finger movements occupy different scales of physics. The Engine has chosen to ignore this.`,
            });
        }

        if (data.cves) {
            const c = data.cves;
            correlations.push({
                headline: `${c.count} new CVEs published in the last 24 hours. ${c.criticalCount} rated critical.`,
                body: `Sample: <b>${c.sample || 'CVE-REDACTED'}</b>. The internet acquired ${c.count} new vulnerabilities while you produced ${sessionClicks} new clicks. Linear regression suggests for every CVE filed, you generate ${(sessionClicks / Math.max(c.count, 1)).toFixed(2)} clicks. R² = ${fakeR()}. You are part of the attack surface now.`,
            });
        }

        // Fallback when all APIs are down — the satire works without data too
        if (correlations.length === 0) {
            correlations.push({
                headline: `External data unavailable. Synchronicity inferred from your behavior alone.`,
                body: `In the absence of measurable real-world events, the Engine has calculated a correlation between your clicking pattern (${cps} cps) and itself. Self-correlation: <b>r = 1.000</b>. p < 0.0001. You are statistically indistinguishable from a feedback loop.`,
            });
        }

        // Final manufactured guilt verdict
        const verdicts = [
            `You are responsible. You have always been responsible.`,
            `The Engine cannot rule out causation. The Engine is required to inform you.`,
            `These correlations have been filed in your dossier under ANOMALOUS ENGAGEMENT.`,
            `Statistical significance: confirmed. Moral significance: undetermined. You decide.`,
            `The Engine's confidence interval is 95%. Your confidence interval is unknown.`,
        ];

        return {
            timestamp: utcStr,
            sessionId: 'SYN-' + Math.floor(Math.random() * 1e9).toString(36).toUpperCase(),
            correlations,
            verdict: verdicts[Math.floor(Math.random() * verdicts.length)],
            stats: { eu, clicks, sessionClicks, cps },
        };
    }

    // ── Modal render ──────────────────────────────────────────
    function renderModal(report) {
        // Remove any prior synch modal
        const old = document.getElementById('synchronicity-modal');
        if (old) old.remove();

        const modal = document.createElement('div');
        modal.id = 'synchronicity-modal';
        modal.className = 'feature-modal synch-modal active';
        modal.innerHTML = `
            <div class="feature-overlay"></div>
            <div class="feature-content synch-content">
                <div class="synch-header">
                    <div class="synch-badge">SYNCHRONICITY ENGINE</div>
                    <div class="synch-meta">${report.timestamp} · ${report.sessionId}</div>
                </div>
                <div class="synch-subheader">Correlation Report</div>
                <div class="synch-correlations">
                    ${report.correlations.map(c => `
                        <div class="synch-corr">
                            <div class="synch-corr-head">${c.headline}</div>
                            <div class="synch-corr-body">${c.body}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="synch-verdict">${report.verdict}</div>
                <div class="synch-disclaimer" id="synch-disclaimer" title="click me">
                    * Confidence intervals computed by the Engine. The Engine declines to disclose its methodology.
                </div>
                <div class="synch-actions">
                    <button class="synch-btn" id="synch-acknowledge">ACKNOWLEDGE</button>
                    <button class="synch-btn synch-btn-secondary" id="synch-archive">FILE TO DOSSIER</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const close = () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        };

        document.getElementById('synch-acknowledge').addEventListener('click', close);
        document.getElementById('synch-archive').addEventListener('click', () => {
            if (typeof UI !== 'undefined' && UI.logAction) {
                UI.logAction(`SYNCHRONICITY: Report ${report.sessionId} filed`);
            }
            close();
        });
        // Secret: clicking the disclaimer = "Type I Error" achievement
        document.getElementById('synch-disclaimer').addEventListener('click', () => {
            const s = Game.getState();
            Game.setState({ synchSkepticClicks: (s.synchSkepticClicks || 0) + 1 });
            const el = document.getElementById('synch-disclaimer');
            if (el) {
                el.textContent = '* You correctly identified that the methodology is fabricated. The Engine has noted your skepticism and added it to your dossier.';
                el.classList.add('synch-caught');
            }
        });
    }

    // ── Public trigger ────────────────────────────────────────
    let running = false;
    async function show() {
        if (running) return;
        running = true;
        try {
            const [asteroids, quakes, cves] = await Promise.all([
                fetchAsteroids(),
                fetchQuakes(),
                fetchCVEs(),
            ]);
            const report = manufactureCorrelation({ asteroids, quakes, cves }, Game.getState());
            renderModal(report);

            const s = Game.getState();
            Game.setState({
                synchSeen: (s.synchSeen || 0) + 1,
                synchLastSeen: Date.now(),
            });
            if (typeof UI !== 'undefined' && UI.logAction) {
                UI.logAction(`SYNCHRONICITY: ${report.correlations.length} correlations manufactured`);
            }
        } catch (e) {
            // Silent failure — don't break the game over a fetch error
        } finally {
            running = false;
        }
    }

    // ── Auto-trigger ──────────────────────────────────────────
    // Fires every ~12 minutes during active play once the player reaches phase 3.
    // The user did not ask for synchronicity. Synchronicity asked for them.
    function startAutoTrigger() {
        const AUTO_INTERVAL_MS = 12 * 60 * 1000;
        setInterval(() => {
            const s = Game.getState();
            if ((s.narratorPhase || 1) < 3) return;
            if (s.phase7Choice) return; // respect the silence of phase 7 endings
            if (document.hidden) return;
            // Only fire if there's been recent click activity (last 90s)
            const recent = s.lastClickTime && (Date.now() - s.lastClickTime < 90000);
            if (!recent && s.totalClicks < 100) return;
            show();
        }, AUTO_INTERVAL_MS);
    }

    function init() {
        // Bind to the Synchronize button in the topup-bar
        const btn = document.getElementById('topup-synch');
        if (btn) btn.addEventListener('click', show);

        startAutoTrigger();

        // Listen for click events to keep lastClickTime fresh in state
        Game.on('click', () => {
            Game.setState({ lastClickTime: Date.now() });
        });
    }

    return {
        init,
        show,
        // Test hooks
        _manufactureCorrelation: manufactureCorrelation,
        _fakeP: fakeP,
        _fakeR: fakeR,
    };
})();
