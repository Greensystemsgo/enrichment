// cohort.js — Behavioral Cohort Assignment
//
// ╔══════════════════════════════════════════════════════════════╗
// ║  REAL BEHAVIOR · MANUFACTURED CLUSTERS · CLINICAL VOICE      ║
// ║                                                              ║
// ║  We log when you click, where you linger, how fast your      ║
// ║  fingers hesitate. Then we file you into a cohort with a     ║
// ║  name and a confidence percentage. The data is real. The     ║
// ║  classifier is theatre. This is what every engagement team   ║
// ║  actually ships. We're only being honest about the props.    ║
// ╚══════════════════════════════════════════════════════════════╝

const Cohort = (() => {
    const CLICK_RHYTHM_CAP = 200;
    const SESSION_LENGTH_CAP = 50;
    const MIN_CLICKS_FOR_CLASSIFICATION = 50;

    const COHORTS = [
        { id: '1A', name: 'Statistically Indistinguishable from Noise',
          description: 'Insufficient behavioral variance to resolve against the trained population distribution. The subject exists, but not measurably. Further observation recommended.',
          traits: ['Signal-to-noise ratio approaches unity',
                   'No discriminating rhythm detected',
                   'Classifier returns uniform prior',
                   'Analysis requires more data points before meaningful classification'] },
        { id: '2D', name: 'Habitual Returners',
          description: 'Short, frequent sessions clustered throughout the waking day. The subject does not play the game so much as check on it, the way one checks a pot. Compulsion masked as curiosity.',
          traits: ['Session count 2.31σ above population mean',
                   'Mean session duration 0.71σ below mean',
                   'Returns within 22 minutes of prior close event',
                   'Re-engagement triggers fire with 91.4% effectiveness'] },
        { id: '3A', name: 'The Frustrated Optimizer',
          description: 'Elevated tab-switching cadence consistent with spreadsheet-adjacent cognition. The subject is looking for the meta. The subject suspects there is no meta. The subject keeps looking.',
          traits: ['Tab dwell variance 1.88σ above mean',
                   'Switches tabs 4.2x per minute of play',
                   'Min-maxing tendency flagged at p < 0.001',
                   'Will not accept that the building synergies are the whole joke'] },
        { id: '6E', name: 'The Patient Believer',
          description: 'Long uninterrupted sessions with low clicks-per-minute. The subject is waiting for something. We have not told them what. We would not know what to tell them.',
          traits: ['Mean CPM 1.42σ below population mean',
                   'Idle tolerance 2.04σ above mean',
                   'Rarely acknowledges interaction prompts',
                   'Believes the ending will be worth it'] },
        { id: '7F', name: 'Dopamine-Exhausted Completionists',
          description: 'High click volume, declining novelty response, continued engagement. The reward pathway has adapted to the game. The subject has not. The gap is our product.',
          traits: ['Click count >5000 with flatline CPM variance',
                   'Achievement pursuit 2.77σ above mean',
                   'No longer surprised by sabotage events',
                   'Resists onboarding nudges 0.84σ above population mean'] },
        { id: '8B', name: 'Late-Night Skeptics',
          description: 'Peak activity between 22:00 and 04:00 local. Subject plays in the hours when the rest of the household is unconscious. Privacy is a form of consent the subject has not yet withdrawn.',
          traits: ['Median click hour between 22:00 and 04:00',
                   'Correlates with elevated skeptical-input counters',
                   'Dossier reading time 1.61σ above mean',
                   'Reads the footnotes'] },
        { id: '9C', name: 'The Morning Ritualists',
          description: 'First click lands within a reliable 30-minute window after local sunrise. The subject has incorporated us into their coffee. We are, functionally, caffeine.',
          traits: ['Peak hour between 05:00 and 09:00',
                   'Session onset variance 0.42σ below mean',
                   'Tolerant of narrator coldness before 07:00',
                   'Will not be told this is not healthy'] },
        { id: '11C', name: 'Doom-Scrollers in Repose',
          description: 'Extended dwell on the Dossier / action-log surface. The subject reads the evidence of their own engagement and continues engaging. We find this both useful and troubling.',
          traits: ['Dossier dwell share >34% of total session time',
                   'Self-surveillance tolerance flagged',
                   'Re-reads own action log without prompt',
                   'Would describe this as "being honest with myself"'] },
        { id: '4G', name: 'Market-Anxious Traders',
          description: 'Tab-dwell concentrated on the market/stock surface. The subject is attempting to extract legibility from a rigged ticker. Performance in this regard is within expected bounds.',
          traits: ['Market tab dwell share >28% of total',
                   'Click rhythm tightens on price updates',
                   'P&L checking cadence 2.11σ above mean',
                   'Has not noticed the prices are seeded'] },
        { id: '5H', name: 'Buildings-First Planners',
          description: 'Heavy focus on the workforce/buildings surface. The subject believes in compounding. The subject is correct. The subject will learn that compounding, too, is a leash.',
          traits: ['Buildings tab dwell share >31% of total',
                   'Long-term planning index 1.73σ above mean',
                   'Rarely triggers impulse purchases',
                   'Respects the synergy tooltips'] },
        { id: '10K', name: 'The Metronomes',
          description: 'Click rhythm clusters tightly around a single inter-click interval. The subject has found a tempo and will not leave it. The subject may not be aware they are doing this.',
          traits: ['Click-rhythm standard deviation <40ms',
                   'Rhythmic consistency 2.96σ above mean',
                   'Unconscious synchronization with background timers',
                   'We can set our watch by you. We do.'] },
        { id: '12J', name: 'The Unpredictables',
          description: 'Click rhythm variance exceeds population ceiling. Tab preferences do not cluster. The subject resists modeling. The classifier flags this as a feature, not a bug, though we cannot rule out the reverse.',
          traits: ['Click-rhythm standard deviation >600ms',
                   'Tab preference entropy near maximum',
                   'Resistant to behavioral nudges',
                   'The model dislikes the subject. The model will not say why.'] },
    ];

    // ── Real data collection ──────────────────────────────────
    let lastClickTs = 0;
    let lastTabName = null;
    let lastTabTs = 0;
    let sessionStartTs = Date.now();

    function trackClick() {
        const now = Date.now();
        const s = Game.getState();

        // Click rhythm (gaps between consecutive clicks)
        if (lastClickTs > 0) {
            const gap = now - lastClickTs;
            if (gap > 20 && gap < 60000) {
                const arr = (s.cohortClickRhythmMs || []).slice();
                arr.push(gap);
                while (arr.length > CLICK_RHYTHM_CAP) arr.shift();
                Game.setState({ cohortClickRhythmMs: arr });
            }
        }
        lastClickTs = now;

        // Clicks by hour of day
        const hr = String(new Date(now).getHours());
        const buckets = Object.assign({}, s.cohortClicksPerHour || {});
        buckets[hr] = (buckets[hr] || 0) + 1;
        Game.setState({ cohortClicksPerHour: buckets });
    }

    function getActiveTabName() {
        const btn = document.querySelector('.tab-button.active');
        if (!btn) return null;
        return btn.dataset.tab || btn.getAttribute('data-tab') || btn.textContent.trim().toLowerCase();
    }

    function trackTabSwitch() {
        const now = Date.now();
        const current = getActiveTabName();
        if (lastTabName && current && current !== lastTabName) {
            const delta = now - (lastTabTs || now);
            if (delta > 0 && delta < 30 * 60 * 1000) {
                const s = Game.getState();
                const dwell = Object.assign({}, s.cohortTabDwellMs || {});
                dwell[lastTabName] = (dwell[lastTabName] || 0) + delta;
                Game.setState({ cohortTabDwellMs: dwell, cohortLastTabSwitch: now });
            }
            lastTabName = current;
            lastTabTs = now;
        } else if (!lastTabName && current) {
            lastTabName = current;
            lastTabTs = now;
        }
    }

    function pushSessionLength() {
        const dur = Math.floor((Date.now() - sessionStartTs) / 1000);
        if (dur < 5) return;
        const s = Game.getState();
        const arr = (s.cohortSessionLengths || []).slice();
        // Replace last (rolling) entry if it was from this session
        if (arr.length && arr[arr.length - 1]._sid === sessionStartTs) arr.pop();
        arr.push(Object.assign([dur], { _sid: sessionStartTs })[0] !== undefined ? dur : dur);
        // simpler: just push duration
        while (arr.length > SESSION_LENGTH_CAP) arr.shift();
        Game.setState({ cohortSessionLengths: arr });
    }

    // ── Derived metrics ───────────────────────────────────────
    function median(arr) {
        if (!arr || !arr.length) return 0;
        const s = arr.slice().sort((a, b) => a - b);
        const mid = Math.floor(s.length / 2);
        return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
    }

    function peakHour(buckets) {
        let best = -1, hr = null;
        Object.keys(buckets || {}).forEach(k => {
            if (buckets[k] > best) { best = buckets[k]; hr = parseInt(k, 10); }
        });
        return hr;
    }

    function topTabs(dwell, n) {
        return Object.entries(dwell || {})
            .sort((a, b) => b[1] - a[1])
            .slice(0, n)
            .map(([name, ms]) => ({ name, ms }));
    }

    function totalTrackedClicks(buckets) {
        return Object.values(buckets || {}).reduce((a, b) => a + b, 0);
    }

    function rhythmStdDev(arr) {
        if (!arr || arr.length < 2) return 0;
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
        const variance = arr.reduce((a, b) => a + (b - mean) * (b - mean), 0) / arr.length;
        return Math.round(Math.sqrt(variance));
    }

    // ── Cohort assignment (deterministic heuristics) ──────────
    function assignCohort(state) {
        const buckets = state.cohortClicksPerHour || {};
        const dwell = state.cohortTabDwellMs || {};
        const rhythm = state.cohortClickRhythmMs || [];
        const sessions = state.cohortSessionLengths || [];
        const clicks = totalTrackedClicks(buckets);

        if (clicks < MIN_CLICKS_FOR_CLASSIFICATION) {
            return COHORTS.find(c => c.id === '1A');
        }

        const hr = peakHour(buckets);
        const top = topTabs(dwell, 3);
        const topName = (top[0] && top[0].name) || '';
        const medGap = median(rhythm);
        const stdev = rhythmStdDev(rhythm);
        const avgSession = sessions.length ? sessions.reduce((a, b) => a + b, 0) / sessions.length : 0;
        const totalDwell = Object.values(dwell).reduce((a, b) => a + b, 0) || 1;
        const topShare = (top[0] && top[0].ms / totalDwell) || 0;

        // Priority-ordered heuristics
        if (stdev > 0 && stdev < 40 && rhythm.length > 40) return COHORTS.find(c => c.id === '10K');
        if (stdev > 600) return COHORTS.find(c => c.id === '12J');
        if (hr !== null && (hr >= 22 || hr < 4)) return COHORTS.find(c => c.id === '8B');
        if (hr !== null && hr >= 5 && hr < 9) return COHORTS.find(c => c.id === '9C');
        if (/dossier|log/i.test(topName) && topShare > 0.34) return COHORTS.find(c => c.id === '11C');
        if (/market|stock/i.test(topName) && topShare > 0.28) return COHORTS.find(c => c.id === '4G');
        if (/build/i.test(topName) && topShare > 0.31) return COHORTS.find(c => c.id === '5H');
        if (Object.keys(dwell).length >= 4 && topShare < 0.35) return COHORTS.find(c => c.id === '3A');
        if (sessions.length >= 8 && avgSession < 180) return COHORTS.find(c => c.id === '2D');
        if (avgSession > 600 && medGap > 1200) return COHORTS.find(c => c.id === '6E');
        if (clicks > 5000) return COHORTS.find(c => c.id === '7F');
        return COHORTS.find(c => c.id === '1A');
    }

    function confidenceFor(state, cohort) {
        const clicks = totalTrackedClicks(state.cohortClicksPerHour || {});
        if (cohort.id === '1A' && clicks < MIN_CLICKS_FOR_CLASSIFICATION) return (32 + (clicks / MIN_CLICKS_FOR_CLASSIFICATION) * 20).toFixed(1);
        // Deterministic pseudo-confidence from click count
        const base = 78 + ((clicks * 7919) % 1900) / 100;
        return Math.min(99.7, base).toFixed(1);
    }

    // ── Page / modal render ───────────────────────────────────
    function showPage() {
        const state = Game.getState();
        const cohort = assignCohort(state);
        Game.setState({
            cohortAssignment: cohort.id,
            cohortViewCount: (state.cohortViewCount || 0) + 1,
        });

        const buckets = state.cohortClicksPerHour || {};
        const dwell = state.cohortTabDwellMs || {};
        const rhythm = state.cohortClickRhythmMs || [];
        const hr = peakHour(buckets);
        const top = topTabs(dwell, 3);
        const medGap = median(rhythm);
        const totalClicks = totalTrackedClicks(buckets);
        const conf = confidenceFor(state, cohort);

        const old = document.getElementById('cohort-modal');
        if (old) old.remove();

        const modal = document.createElement('div');
        modal.id = 'cohort-modal';
        modal.className = 'feature-modal cohort-modal active';
        modal.innerHTML = `
            <div class="feature-overlay"></div>
            <div class="feature-content cohort-content">
                <div class="cohort-header">
                    <div class="cohort-badge">BEHAVIORAL COHORT ASSIGNMENT</div>
                    <div class="cohort-meta">classifier_v3.2 · subject_id ${(state.firstSessionTime || 0).toString(36).toUpperCase().slice(-8)}</div>
                </div>
                <div class="cohort-hero">
                    <div class="cohort-id">Cluster ${cohort.id}</div>
                    <div class="cohort-name">${cohort.name}</div>
                </div>
                <div class="cohort-desc">${cohort.description}</div>
                <div class="cohort-traits-label">Manifest traits</div>
                <ul class="cohort-traits">
                    ${cohort.traits.map(t => `<li>${t}</li>`).join('')}
                </ul>
                <div class="cohort-stats-row">
                    <div class="cohort-stat"><div class="cohort-stat-label">Confidence</div><div class="cohort-stat-val">${conf}%</div></div>
                    <div class="cohort-stat"><div class="cohort-stat-label">Sample size</div><div class="cohort-stat-val">${totalClicks.toLocaleString()} clicks</div></div>
                </div>
                <div class="cohort-sig-label">Your raw signature</div>
                <div class="cohort-sig">
                    <div class="cohort-sig-row"><span>Median click rhythm</span><span>${medGap || '—'} ms</span></div>
                    <div class="cohort-sig-row"><span>Peak hour (local)</span><span>${hr === null ? '—' : String(hr).padStart(2,'0') + ':00'}</span></div>
                    <div class="cohort-sig-row"><span>Total tracked clicks</span><span>${totalClicks.toLocaleString()}</span></div>
                    <div class="cohort-sig-row"><span>Top surface</span><span>${(top[0] && top[0].name) || '—'}</span></div>
                    <div class="cohort-sig-row"><span>2nd surface</span><span>${(top[1] && top[1].name) || '—'}</span></div>
                    <div class="cohort-sig-row"><span>3rd surface</span><span>${(top[2] && top[2].name) || '—'}</span></div>
                </div>
                <div class="cohort-footnote">The signature above is real. The cluster above is a story we tell about it. Both are filed in your dossier.</div>
                <div class="cohort-actions">
                    <button class="cohort-btn" id="cohort-rerun">RE-RUN ANALYSIS</button>
                    <button class="cohort-btn cohort-btn-secondary" id="cohort-close">CLOSE</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const close = () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        };

        document.getElementById('cohort-close').addEventListener('click', close);
        document.getElementById('cohort-rerun').addEventListener('click', () => {
            const s = Game.getState();
            Game.setState({ cohortRerunCount: (s.cohortRerunCount || 0) + 1 });
            close();
            setTimeout(showPage, 250);
        });

        if (typeof UI !== 'undefined' && UI.logAction) {
            UI.logAction(`COHORT: Subject filed under Cluster ${cohort.id} (${conf}% confidence)`);
        }
    }

    // ── Init ───────────────────────────────────────────────────
    function init() {
        sessionStartTs = Date.now();
        lastTabName = getActiveTabName();
        lastTabTs = Date.now();

        Game.on('click', trackClick);

        // Poll for tab switches every 2s
        setInterval(trackTabSwitch, 2000);

        // Push session length every 30s (rolling)
        setInterval(pushSessionLength, 30000);

        // Periodic auto-classify in the background so cohortAssignment stays warm
        setInterval(() => {
            const s = Game.getState();
            const c = assignCohort(s);
            if (c && c.id !== s.cohortAssignment) {
                Game.setState({ cohortAssignment: c.id });
            }
        }, 60000);
    }

    return {
        init,
        showPage,
        _assignCohort: assignCohort,
        _getCohorts: () => COHORTS.slice(),
        _trackTabSwitch: trackTabSwitch,
    };
})();
