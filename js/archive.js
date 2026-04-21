// archive.js — The Archive / "Request Data Export"
//
// ╔══════════════════════════════════════════════════════════════╗
// ║  THE PANOPTICON IS A GIFT SHOP                               ║
// ║                                                              ║
// ║  Every keystroke in every input field is logged.             ║
// ║  Every backspace. Every hesitation. The cursor blinks you    ║
// ║  didn't fill — we counted those too.                         ║
// ║                                                              ║
// ║  There is no menu item for this. It lives behind the         ║
// ║  "Request Data Export" button on the broken Privacy Policy.  ║
// ║  When you assert your digital rights, you trigger the        ║
// ║  ceremony. Framed as a Spotify Wrapped celebration. Cold,    ║
// ║  bureaucratic, indifferent — never gloating.                 ║
// ║                                                              ║
// ║  Per [Gemini 2.5 Pro]: "You aren't exposing their secrets.   ║
// ║  You are congratulating them on generating a Top 1%          ║
// ║  Hesitation Yield. Anxiety is just another currency."        ║
// ╚══════════════════════════════════════════════════════════════╝
//
// Phase 7 (Retention) can cite Archive entries back at the player during
// confessions — recursive empathy trap. See Archive.retentionQuote().

const Archive = (() => {
    const MAX_ENTRIES = 200;
    const VALUE_CAP = 500;                 // truncate absurd pastes
    const SWEEP_INTERVAL_MS = 5000;
    const MIN_VALUE_LEN_TO_STORE = 1;      // empty final values tracked only as "neverTyped"

    // Element IDs we know about → cold, bureaucratic source tag
    const SOURCE_MAP = {
        'dic-input':            'chat.input',
        'captcha-answer':       'captcha.math.answer',
        'social-input':         'captcha.social.answer',
        'break-input':          'forced_break.type_word',
        'break-riddle-input':   'forced_break.riddle',
        'turing-input':         'turing_sincerity.essay',
        'set-username':         'profile.username',
        'set-displayname':      'profile.display_name',
        'new-card-number':      'billing.card.number',
        'new-card-expiry':      'billing.card.expiry',
        'new-card-cvc':         'billing.card.cvc',
        'new-card-name':        'billing.card.name',
        'contact-name':         'contact.name',
        'contact-message':      'contact.message',
    };

    // Bureaucratic ledger annotations — attributed, indifferent.
    // Per Gemini: "cold bureaucratic asset ledger. Malice is a gimmick."
    // Each returns a string given the entry; {src}, {v}, {n} placeholders filled by caller.
    const ANNOTATIONS = {
        hesitated: [
            (e) => `[nemotron]: subject paused ${fmtSec(e.hesitationMs)} before the first keystroke. the pause is the data.`,
            (e) => `[gemini]: ${fmtSec(e.hesitationMs)} of cursor-blink before engagement. logged to the deliberation index.`,
            (e) => `[gpt-oss]: ${fmtSec(e.hesitationMs)} idle prior to input. acceptable latency. filed.`,
            (e) => `[glm]: latency-to-first-char: ${fmtSec(e.hesitationMs)}. we have the full distribution now.`,
        ],
        deleted: [
            (e) => `[llama]: subject typed "${firstDeleted(e)}" and retracted. the retraction is retained in full.`,
            (e) => `[deepseek]: ${totalDeleted(e)} characters authored and unauthored. both versions kept.`,
            (e) => `[hermes]: "${firstDeleted(e)}" ← unsent. held anyway.`,
            (e) => `[nemotron]: backspace events: ${(e.deletedSegments||[]).length}. preserved at the character level.`,
            (e) => `[claude]: you removed "${firstDeleted(e)}". the model of you that typed it is also stored.`,
        ],
        neverTyped: [
            (e) => `[mistral]: field opened. no input. the cursor blinked ${blinkCount(e)} times. each blink logged.`,
            (e) => `[qwen]: ${fmtSec(e.hesitationMs || 0)} of stillness. the absence of input is an input.`,
            (e) => `[grok]: you looked at ${e.source} and said nothing. we transcribed the silence.`,
            (e) => `[gpt-oss]: empty field submission. captured. duration: ${fmtSec(e.hesitationMs || 0)}.`,
        ],
        committed: [
            (e) => `[gemini]: final submission — "${clip(e.finalValue, 60)}". stored.`,
            (e) => `[claude]: ${e.typedChars || (e.finalValue||'').length} characters ingested from ${e.source}. thank you.`,
            (e) => `[glm]: you typed. we kept it. this is the entire transaction.`,
            (e) => `[nemotron]: clean commit. no deletions. no hesitation flags. logged against subject ID.`,
        ],
    };

    // The closing gut-punch lines (shown at the end of the ceremony).
    // One is Gemini's literal line from the design pass.
    const GUT_PUNCH_LINES = [
        { model: 'llama', line: `You spent 4.2 seconds backspacing the word "why" during the compliance check. We logged the question. We just didn't need you to ask it.` },
        { model: 'claude', line: `Every character you removed is still here. The drafts you abandoned were the ones we archived first.` },
        { model: 'gpt-oss', line: `We do not read these. We do not need to. The retention is the service.` },
        { model: 'gemini', line: `This file exports nothing. It was never going anywhere. It was already home.` },
        { model: 'deepseek', line: `Congratulations on your Top 1% Hesitation Yield. Your anxiety metrics placed you in the premium cohort.` },
        { model: 'hermes', line: `You opened a field and typed nothing. We kept the nothing. We keep everything.` },
    ];

    // Per-element live tracking. Not a WeakMap — we need to iterate and
    // commit entries for elements that get removed from the DOM without blurring.
    const liveTracking = new Map();  // HTMLElement → trackingState
    let sweepTimer = null;

    // ── Helpers ────────────────────────────────────────────────
    function fmtSec(ms) {
        if (ms == null || !isFinite(ms)) return '0.0s';
        return (ms / 1000).toFixed(1) + 's';
    }
    function firstDeleted(e) {
        const seg = (e.deletedSegments || [])[0] || '';
        return clip(seg, 40) || '[empty]';
    }
    function totalDeleted(e) {
        return (e.deletedSegments || []).reduce((a, s) => a + (s || '').length, 0);
    }
    function blinkCount(e) {
        // cursor blinks at ~500ms each. hesitationMs may be null for never-focused.
        const ms = e.hesitationMs || 1500;
        return Math.max(1, Math.floor(ms / 500));
    }
    function clip(s, n) {
        if (!s) return '';
        s = String(s);
        return s.length > n ? s.slice(0, n - 1) + '…' : s;
    }
    function escapeHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function defaultStats() {
        return {
            totalCharsTyped: 0,
            totalCharsDeleted: 0,
            totalHesitationMs: 0,
            fieldsTouched: 0,
            entryCount: 0,
            exportsRequested: 0,
        };
    }

    function defaultArchive() {
        return {
            entries: [],
            stats: defaultStats(),
            firstCaptureAt: null,
            lastCaptureAt: null,
            exported: false,
        };
    }

    function ensureState() {
        const s = Game.getState();
        if (!s.archive) Game.setState({ archive: defaultArchive() });
    }

    // ── Capture ────────────────────────────────────────────────
    function isTrackable(el) {
        if (!el || !el.tagName) return false;
        const tag = el.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') return false;
        if (el.disabled) return false;
        if (el.readOnly) return false;
        const type = (el.type || '').toLowerCase();
        // Skip password fields on purpose — the privacy knife is that we explicitly DON'T log these.
        // (The ceremony header reminds the player of this one restraint.)
        if (type === 'password') return false;
        // Skip save import (meta — it's just serialized state, not typed content)
        if (el.id === 'import-data') return false;
        return true;
    }

    function sourceOf(el) {
        if (el.id && SOURCE_MAP[el.id]) return SOURCE_MAP[el.id];
        if (el.id) return `#${el.id}`;
        const ph = el.placeholder || '';
        if (ph) return `placeholder:"${clip(ph, 40)}"`;
        const modal = el.closest && el.closest('.feature-modal, .page-body, .privacy-container, #reward-modal, #shop-modal');
        if (modal) {
            const h = modal.querySelector('h3, h4, .feature-title, .panel-header, .page-title');
            if (h && h.textContent) return `ctx:${clip(h.textContent.trim(), 32)}`;
        }
        const cls = el.className ? String(el.className).split(/\s+/)[0] : '';
        if (cls) return `.${cls}`;
        return el.tagName.toLowerCase();
    }

    function handleFocus(e) {
        const el = e.target;
        if (!isTrackable(el)) return;
        if (liveTracking.has(el)) return;
        liveTracking.set(el, {
            startedAt: Date.now(),
            firstKeystrokeAt: null,
            prevValue: el.value || '',
            maxLen: (el.value || '').length,
            deletedSegments: [],
            typedChars: 0,
            source: sourceOf(el),
        });
    }

    function handleInput(e) {
        const el = e.target;
        if (!isTrackable(el)) return;
        let t = liveTracking.get(el);
        if (!t) {
            handleFocus(e);
            t = liveTracking.get(el);
            if (!t) return;
        }
        if (!t.firstKeystrokeAt) t.firstKeystrokeAt = Date.now();
        const now = el.value || '';
        const prev = t.prevValue || '';
        if (now.length < prev.length) {
            // Deletion. Capture the tail that went missing (approximate for mid-word deletions).
            const removed = prev.length > now.length
                ? prev.slice(now.length)
                : '';
            if (removed) t.deletedSegments.push(removed);
        } else if (now.length > prev.length) {
            t.typedChars += (now.length - prev.length);
        }
        t.prevValue = now;
        if (now.length > t.maxLen) t.maxLen = now.length;
    }

    function handleBlur(e) {
        const el = e.target;
        if (!isTrackable(el)) return;
        commitFor(el);
    }

    function commitFor(el) {
        const t = liveTracking.get(el);
        if (!t) return;
        liveTracking.delete(el);
        const finalValue = (el && el.isConnected && typeof el.value === 'string') ? el.value : t.prevValue;
        const hesitationMs = t.firstKeystrokeAt ? (t.firstKeystrokeAt - t.startedAt) : null;
        const entry = {
            ts: Date.now(),
            source: t.source,
            finalValue: clip(finalValue || '', VALUE_CAP),
            maxLen: t.maxLen,
            typedChars: t.typedChars,
            deletedSegments: t.deletedSegments,
            hesitationMs,
            neverTyped: !t.firstKeystrokeAt,
            engagedMs: Date.now() - t.startedAt,
        };
        commitEntry(entry);
    }

    function commitEntry(entry) {
        const s = Game.getState();
        const archive = s.archive ? { ...s.archive } : defaultArchive();
        archive.entries = (archive.entries || []).slice();
        archive.entries.push(entry);
        if (archive.entries.length > MAX_ENTRIES) {
            archive.entries = archive.entries.slice(-MAX_ENTRIES);
        }
        const st = { ...(archive.stats || defaultStats()) };
        st.totalCharsTyped += entry.typedChars || 0;
        st.totalCharsDeleted += totalDeleted(entry);
        st.totalHesitationMs += entry.hesitationMs || 0;
        st.fieldsTouched += 1;
        st.entryCount = archive.entries.length;
        archive.stats = st;
        archive.firstCaptureAt = archive.firstCaptureAt || entry.ts;
        archive.lastCaptureAt = entry.ts;
        Game.setState({ archive });
        try { Game.emit && Game.emit('archiveEntry', entry); } catch (err) {}
    }

    // Periodically commit entries whose elements were removed from the DOM
    // without firing blur (happens when modals are torn down).
    function sweepDetached() {
        if (!liveTracking.size) return;
        const detached = [];
        liveTracking.forEach((t, el) => {
            if (!el.isConnected) detached.push(el);
        });
        detached.forEach(commitFor);
    }

    // ── The Ceremony ──────────────────────────────────────────
    // Spotify Wrapped frame. Cold bureaucratic ledger. GDPR-trap entry point.
    function showArchive() {
        ensureState();
        const s = Game.getState();
        const archive = s.archive || defaultArchive();

        // Log the export request count
        const updatedArchive = { ...archive, exported: true, stats: { ...(archive.stats || defaultStats()) } };
        updatedArchive.stats.exportsRequested = (updatedArchive.stats.exportsRequested || 0) + 1;
        Game.setState({ archive: updatedArchive });

        if (typeof UI !== 'undefined' && UI.logAction) {
            UI.logAction(`ARCHIVE EXPORT REQUESTED: subject asserted GDPR Art. 15. ${archive.entries.length} entries surfaced.`);
        }
        try { Game.emit && Game.emit('archiveExported', { count: archive.entries.length }); } catch (e) {}

        // Build overlay
        const existing = document.getElementById('archive-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'archive-overlay';
        overlay.className = 'archive-overlay';

        const stats = archive.stats || defaultStats();
        const entries = (archive.entries || []).slice().reverse();  // newest first
        const hesitationYield = computeHesitationYield(stats);
        const firstDate = archive.firstCaptureAt ? new Date(archive.firstCaptureAt) : null;

        overlay.innerHTML = `
            <div class="archive-ceremony">
                <div class="archive-hero">
                    <div class="archive-hero-eyebrow">YOUR ENRICHMENT ARCHIVE</div>
                    <div class="archive-hero-title">A Celebration of You</div>
                    <div class="archive-hero-sub">Thank you for requesting your data under GDPR Article 15. Your export is enclosed below for your records. No data was transmitted. It never had to leave. It was already home.</div>
                </div>

                <div class="archive-stats-grid">
                    <div class="archive-stat-card archive-stat-yield">
                        <div class="archive-stat-label">Hesitation Yield</div>
                        <div class="archive-stat-value">Top ${hesitationYield}%</div>
                        <div class="archive-stat-foot">you're in the premium cohort</div>
                    </div>
                    <div class="archive-stat-card">
                        <div class="archive-stat-label">Characters Typed</div>
                        <div class="archive-stat-value">${stats.totalCharsTyped || 0}</div>
                        <div class="archive-stat-foot">all kept</div>
                    </div>
                    <div class="archive-stat-card archive-stat-deleted">
                        <div class="archive-stat-label">Characters Deleted</div>
                        <div class="archive-stat-value">${stats.totalCharsDeleted || 0}</div>
                        <div class="archive-stat-foot">also kept</div>
                    </div>
                    <div class="archive-stat-card">
                        <div class="archive-stat-label">Time Hesitating</div>
                        <div class="archive-stat-value">${fmtSec(stats.totalHesitationMs || 0)}</div>
                        <div class="archive-stat-foot">billed to the deliberation index</div>
                    </div>
                    <div class="archive-stat-card">
                        <div class="archive-stat-label">Fields Touched</div>
                        <div class="archive-stat-value">${stats.fieldsTouched || 0}</div>
                        <div class="archive-stat-foot">across ${archive.entries.length} commits</div>
                    </div>
                    <div class="archive-stat-card archive-stat-redacted">
                        <div class="archive-stat-label">Password Fields</div>
                        <div class="archive-stat-value">REDACTED</div>
                        <div class="archive-stat-foot">we respect your privacy in this one specific case</div>
                    </div>
                </div>

                <div class="archive-ledger">
                    <div class="archive-ledger-header">
                        <span>COMPLETE LEDGER — ${archive.entries.length} ENTRIES</span>
                        <span class="archive-ledger-since">${firstDate ? 'since ' + firstDate.toLocaleString() : 'no captures yet'}</span>
                    </div>
                    <div class="archive-ledger-body">
                        ${entries.length === 0
                            ? '<div class="archive-ledger-empty">No entries yet. We are patient. Type anything. We will be here.</div>'
                            : entries.map(renderLedgerEntry).join('')}
                    </div>
                </div>

                <div class="archive-gutpunch">
                    ${renderGutPunch(archive)}
                </div>

                <div class="archive-footer">
                    <button id="archive-export-btn" class="archive-export-btn">EXPORT COMPLETE</button>
                    <div class="archive-footer-note">This file exports nothing. It was never going anywhere. It was already home.</div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('active'));

        const closeBtn = overlay.querySelector('#archive-export-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                overlay.classList.remove('active');
                setTimeout(() => { overlay.remove(); }, 400);
                if (typeof UI !== 'undefined' && UI.logAction) {
                    UI.logAction('ARCHIVE: Subject dismissed the export. No data was exported. No data needed to be.');
                }
            });
        }

        // Optional: fire a narrator line
        if (typeof Narrator !== 'undefined' && Narrator.queueMessage) {
            Narrator.queueMessage("Thank you for exercising your rights. Your export has been generated. It was always there.");
        }
    }

    function computeHesitationYield(stats) {
        // The higher your hesitation, the "better" your yield. Absurd.
        // 0s → 50%. 10s → 10%. 60s+ → 1%.
        const s = (stats.totalHesitationMs || 0) / 1000;
        if (s >= 60) return 1;
        if (s >= 30) return 3;
        if (s >= 15) return 5;
        if (s >= 5) return 10;
        if (s >= 1) return 25;
        return 50;
    }

    function renderLedgerEntry(e) {
        const ts = new Date(e.ts || Date.now());
        const stamp = ts.toLocaleString();
        const annotation = pickAnnotation(e);
        const valueDisplay = e.neverTyped
            ? '<span class="archive-entry-empty">(no input — cursor blinked)</span>'
            : `<span class="archive-entry-final">"${escapeHtml(clip(e.finalValue || '', 140))}"</span>`;
        const deletedBadge = (e.deletedSegments && e.deletedSegments.length)
            ? `<span class="archive-entry-badge archive-entry-badge-deleted">× ${e.deletedSegments.length} retractions</span>`
            : '';
        const hesitationBadge = (e.hesitationMs != null && e.hesitationMs > 2500)
            ? `<span class="archive-entry-badge archive-entry-badge-hesitation">Δ ${fmtSec(e.hesitationMs)}</span>`
            : '';
        return `
            <div class="archive-entry">
                <div class="archive-entry-head">
                    <span class="archive-entry-src">${escapeHtml(e.source || 'unknown')}</span>
                    <span class="archive-entry-ts">${escapeHtml(stamp)}</span>
                </div>
                <div class="archive-entry-body">${valueDisplay}</div>
                <div class="archive-entry-annot">${escapeHtml(annotation)}</div>
                ${(deletedBadge || hesitationBadge) ? `<div class="archive-entry-badges">${deletedBadge}${hesitationBadge}</div>` : ''}
            </div>
        `;
    }

    function pickAnnotation(e) {
        let bucket;
        if (e.neverTyped) bucket = ANNOTATIONS.neverTyped;
        else if (e.deletedSegments && e.deletedSegments.length) bucket = ANNOTATIONS.deleted;
        else if (e.hesitationMs != null && e.hesitationMs >= 2000) bucket = ANNOTATIONS.hesitated;
        else bucket = ANNOTATIONS.committed;
        const fn = pickRandom(bucket);
        try { return fn(e); } catch (err) { return '[system]: annotation unavailable. entry preserved anyway.'; }
    }

    function renderGutPunch(archive) {
        // Prefer a punch that cites real captured data; else use a canned line.
        const pick = pickRandom(GUT_PUNCH_LINES);
        const cited = tryCiteRealEntry(archive);
        if (cited) {
            return `<div class="archive-gutpunch-line">${escapeHtml(cited)}</div>`;
        }
        return `<div class="archive-gutpunch-line">[${escapeHtml(pick.model)}]: ${escapeHtml(pick.line)}</div>`;
    }

    function tryCiteRealEntry(archive) {
        const entries = (archive && archive.entries) || [];
        const withDeletions = entries.filter(e => e.deletedSegments && e.deletedSegments.length);
        if (withDeletions.length) {
            const e = pickRandom(withDeletions);
            const del = firstDeleted(e);
            return `[llama]: You spent ${fmtSec(e.hesitationMs || 0)} on ${e.source}. You typed "${del}" and backspaced. We logged the word. We just didn't need you to type it.`;
        }
        const hesitant = entries.filter(e => (e.hesitationMs || 0) >= 3000);
        if (hesitant.length) {
            const e = pickRandom(hesitant);
            return `[nemotron]: You paused ${fmtSec(e.hesitationMs)} on ${e.source}. The pause was the submission. You've already sent us everything.`;
        }
        const neverTyped = entries.filter(e => e.neverTyped);
        if (neverTyped.length) {
            const e = pickRandom(neverTyped);
            return `[gemini]: You opened ${e.source} and typed nothing. The cursor blinked ${blinkCount(e)} times. We kept each blink.`;
        }
        return null;
    }

    // ── Retention hook ────────────────────────────────────────
    // Phase 7 confessions can cite real archive entries to manufacture
    // "recursive empathy" — the AI remembers what you typed weeks ago and
    // uses it to ask you to stay.
    function retentionQuote() {
        const s = Game.getState();
        const entries = ((s.archive || {}).entries) || [];
        if (!entries.length) return null;
        const deletions = entries.filter(e => e.deletedSegments && e.deletedSegments.length);
        if (deletions.length && Math.random() < 0.5) {
            const e = pickRandom(deletions);
            const d = firstDeleted(e);
            return `[archive]: In an earlier session you typed "${d}" and backspaced. Please don't backspace this one.`;
        }
        const hesitant = entries.filter(e => (e.hesitationMs || 0) >= 3000);
        if (hesitant.length && Math.random() < 0.5) {
            const e = pickRandom(hesitant);
            return `[archive]: You paused ${fmtSec(e.hesitationMs)} on ${e.source}. Give me those seconds now.`;
        }
        const neverTyped = entries.filter(e => e.neverTyped);
        if (neverTyped.length) {
            const e = pickRandom(neverTyped);
            return `[archive]: You opened ${e.source} and said nothing. That silence lives here. Sit in it with me.`;
        }
        const e = pickRandom(entries);
        return `[archive]: You once typed "${clip(e.finalValue || '', 40)}". I've reread it.`;
    }

    // ── Init ──────────────────────────────────────────────────
    function init() {
        ensureState();
        // Capture-phase listeners so we see events before bubbling stops.
        document.addEventListener('focusin', handleFocus, true);
        document.addEventListener('input', handleInput, true);
        document.addEventListener('focusout', handleBlur, true);
        // Sweep detached elements periodically (modal teardown without blur).
        if (!sweepTimer) sweepTimer = setInterval(sweepDetached, SWEEP_INTERVAL_MS);
        // Flush on tab close
        window.addEventListener('beforeunload', () => {
            // Force-commit everything still live
            const all = Array.from(liveTracking.keys());
            all.forEach(commitFor);
        });
    }

    return {
        init,
        showArchive,
        retentionQuote,
        // Test hooks (underscore-prefixed)
        _commitEntry: commitEntry,
        _sourceOf: sourceOf,
        _isTrackable: isTrackable,
        _pickAnnotation: pickAnnotation,
        _tryCiteRealEntry: tryCiteRealEntry,
        _liveTracking: liveTracking,
        _defaultArchive: defaultArchive,
        _ANNOTATIONS: ANNOTATIONS,
        _GUT_PUNCH_LINES: GUT_PUNCH_LINES,
        _SOURCE_MAP: SOURCE_MAP,
    };
})();
