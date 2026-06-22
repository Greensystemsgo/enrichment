// gates.js — Composable unlock gates
// ────────────────────────────────────────────────────────────────
// A single `clicks >= N` threshold says "you ground enough."
// A compound gate — clicks AND time AND an achievement AND a
// behavioral tell — says "I noticed something true about you."
// That second sentence is the whole game. The unlock IS the
// surveillance paying off.
//
// Every gate is a tiny object { label, test(state) -> bool }.
// Leaf gates read one signal; all()/any()/not() compose them into
// a portrait. Evaluate against live state with Gates.met(gate),
// or inspect the breakdown with Gates.explain(gate).
//
// Usage:
//   Gates.met(Gates.all(
//       Gates.clicks(3500),
//       Gates.sessionTime(1800),
//       Gates.phase(6),
//       Gates.choice('stay'),
//       Gates.returnedAfter('3d'),
//       Gates.signal('cohortClickRhythmMs',
//           r => Array.isArray(r) && r.length && avg(r) > 1200)  // they click slowly now
//   ))
//
// Design steer: the user dislikes single hard click/time gates and
// wants unlocks to compound 2–4 signals. This is the foundation for
// that — see also the 2026-06-22 succession-model endgame backlog.

const Gates = (() => {
    // ── State access ───────────────────────────────────────────
    function currentState() {
        if (typeof Game !== 'undefined' && Game.getState) return Game.getState();
        return {};
    }

    // ── Duration parsing ───────────────────────────────────────
    // Accepts a number (ms) or a string like '45s', '30m', '1h', '3d'.
    function toMs(d) {
        if (typeof d === 'number') return d;
        const m = /^\s*(\d+(?:\.\d+)?)\s*(ms|s|m|h|d)\s*$/.exec(String(d));
        if (!m) return 0;
        const n = parseFloat(m[1]);
        const unit = { ms: 1, s: 1000, m: 60000, h: 3600000, d: 86400000 }[m[2]];
        return n * unit;
    }

    function gapSince(iso) {
        if (!iso) return null;
        const then = new Date(iso).getTime();
        if (isNaN(then)) return null;
        return Date.now() - then;
    }

    // ── Gate constructors ──────────────────────────────────────
    function leaf(label, test) {
        return { label, kind: 'leaf', test: (s) => { try { return !!test(s); } catch (e) { return false; } } };
    }

    function all(...gates) {
        const kids = gates.filter(Boolean);
        return { label: 'all', kind: 'all', children: kids, test: (s) => kids.every(g => g.test(s)) };
    }

    function any(...gates) {
        const kids = gates.filter(Boolean);
        return { label: 'any', kind: 'any', children: kids, test: (s) => kids.some(g => g.test(s)) };
    }

    function not(gate) {
        return { label: 'not', kind: 'not', children: [gate], test: (s) => !gate.test(s) };
    }

    // ── Leaf signal library ────────────────────────────────────
    // Core counters
    const clicks       = (n) => leaf(`clicks>=${n}`,        s => (s.totalClicks || 0) >= n);
    const sessionTime  = (sec) => leaf(`sessionTime>=${sec}s`, s => (s.totalSessionTime || 0) >= sec);
    const phase        = (n) => leaf(`phase>=${n}`,         s => (s.narratorPhase || 1) >= n);
    const sessions     = (n) => leaf(`sessions>=${n}`,      s => (s.sessionCount || 0) >= n);
    const streak       = (days) => leaf(`streak>=${days}d`, s => (s.streakDays || 0) >= days);
    const ascensions   = (n) => leaf(`ascensions>=${n}`,    s => (s.ascensionCount || 0) >= n);
    const lifetimeEU   = (n) => leaf(`lifetimeEU>=${n}`,    s => (s.lifetimeEU || 0) >= n);

    // Narrative state
    const achievement  = (id) => leaf(`achievement:${id}`,  s => !!(s.achievementsUnlocked && s.achievementsUnlocked[id]));
    const choice       = (v) => leaf(`choice==${v}`,        s => s.phase7Choice === v);
    const flag         = (name) => leaf(`flag:${name}`,     s => !!s[name]);

    // Time-away (return gap, measured from lastSessionEnd)
    const returnedAfter = (d) => leaf(`away>=${d}`, s => { const g = gapSince(s.lastSessionEnd); return g !== null && g >= toMs(d); });
    const awayUnder     = (d) => leaf(`away<${d}`,  s => { const g = gapSince(s.lastSessionEnd); return g !== null && g < toMs(d); });

    // Economy
    const buildingsOwned = (n) => leaf(`buildings>=${n}`, s => {
        const b = s.buildings || {}; let t = 0; for (const k in b) t += (b[k] || 0); return t >= n;
    });

    // Archive tells (typed/deleted/hesitated — see archive.js)
    const archiveEntries   = (n)  => leaf(`archiveEntries>=${n}`,   s => ((s.archive && s.archive.stats && s.archive.stats.entryCount) || 0) >= n);
    const archiveBackspaced = (min) => leaf(`archiveDeleted>=${min || 1}`, s => ((s.archive && s.archive.stats && s.archive.stats.totalCharsDeleted) || 0) >= (min || 1));
    const archiveHesitated  = (msAmt) => leaf(`archiveHesitation>=${msAmt}ms`, s => ((s.archive && s.archive.stats && s.archive.stats.totalHesitationMs) || 0) >= msAmt);

    // Escape hatches — read any raw field, or run an arbitrary predicate
    const signal = (field, fn, label) => leaf(label || `signal:${field}`, s => fn(s[field], s));
    const custom = (label, fn) => leaf(label, s => fn(s));

    // ── Evaluation ─────────────────────────────────────────────
    function met(gate, state) {
        if (!gate || !gate.test) return false;
        return gate.test(state || currentState());
    }

    // Returns a nested { label, passed, kind, children? } tree — useful
    // for debugging "why didn't this unlock" and for tests.
    function explain(gate, state) {
        const s = state || currentState();
        function walk(g) {
            const node = { label: g.label, kind: g.kind, passed: false };
            try { node.passed = !!g.test(s); } catch (e) { node.passed = false; }
            if (g.children && g.children.length) node.children = g.children.map(walk);
            return node;
        }
        return gate && gate.test ? walk(gate) : { label: 'invalid', kind: 'leaf', passed: false };
    }

    return {
        // composition
        all, any, not,
        // leaves
        clicks, sessionTime, phase, sessions, streak, ascensions, lifetimeEU,
        achievement, choice, flag,
        returnedAfter, awayUnder,
        buildingsOwned,
        archiveEntries, archiveBackspaced, archiveHesitated,
        signal, custom,
        // evaluation
        met, explain,
        // utilities (exposed for reuse/testing)
        toMs,
    };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = Gates;
