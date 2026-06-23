// surface.js — the single window/overlay arbiter
// ────────────────────────────────────────────────────────────────
// Every popup, modal, banner, and overlay in the game is a "surface."
// Historically each system drew its own straight onto document.body
// with its own lifecycle and z-index, so they stepped on each other —
// popups stacked, overlays leaked onto the Phase 7 tombstone, nobody
// owned the screen. Surface is the one place windows are mounted.
//
// It is deliberately THIN: it does not restyle your node or touch its
// z-index (existing CSS keeps deciding visual order). What it adds is
// arbitration:
//   • a registry of every live window
//   • central suppression (e.g. deny everything but Phase 7 surfaces
//     once the player has walked away / stayed)
//   • exclusivity (per-layer: one window per layer at a time)
//   • id replacement (re-opening 'fomo' closes the old 'fomo')
//   • clearExcept() / closeAll() for clean state transitions
//   • self-pruning: nodes removed via plain .remove() are reaped from
//     the registry automatically
//
// Two ways in:
//   • mount(node, opts)  — for DYNAMIC nodes you just created. Appends
//     to body (or prepends with opts.prepend) and registers it.
//   • show(node, opts)   — for STATIC nodes that already live in the
//     HTML and are revealed by toggling a class (reward/shop modals).
//     Adds the active class and registers it; hide() removes the class.
// Both participate equally in suppression, exclusivity, and clearExcept.
//
// LAYERS (visual order is documentation only; Surface does NOT set
// z-index). Exclusivity and suppression key off the layer:
//   base    — structural, rarely used
//   effect  — decorative, pointer-events:none (confetti, dim, matrix)
//   ambient — non-blocking notices that may coexist (banners, brainrot)
//   popup   — blocking/centered modals (the exclusive layer)
//   chaos   — chaos events (multi-node; not exclusive)
//   phase7  — the Phase 7 / endgame takeover
//   system  — always-on chrome (cookie gate, armory gear)

const Surface = (() => {
    const LAYERS = ['base', 'effect', 'ambient', 'popup', 'chaos', 'phase7', 'system'];

    // Layers in which only one window shows at a time. Configurable so the
    // policy can be tuned/tested without editing call sites. 'popup' (the
    // blocking centered modals) is exclusive — opening one closes any other.
    // effect/ambient/chaos/phase7/system intentionally coexist.
    let exclusiveLayers = new Set(['popup']);

    // node -> { id, layer, exclusive, mode: 'mount'|'toggle', activeClass }
    const registry = new Map();

    let suppressor = defaultSuppressor;

    function defaultSuppressor(meta) {
        // Once the player has chosen WALK AWAY or STAY, the game is over.
        // Deny every surface except the layers that own the terminal screen.
        if (typeof Game !== 'undefined' && Game.isTerminalPhase7 && Game.isTerminalPhase7()) {
            return meta.layer !== 'phase7' && meta.layer !== 'system';
        }
        return false;
    }

    function isExclusive(meta) {
        return meta.exclusive || exclusiveLayers.has(meta.layer);
    }

    // An entry is dead if its node left the DOM, or (toggle mode) lost its
    // active class. Keeps the registry honest even when callers tear their
    // windows down without going through Surface.
    function isDead(node, meta) {
        if (!node || !node.isConnected) return true;
        if (meta.mode === 'toggle') return !node.classList.contains(meta.activeClass);
        return false;
    }

    function prune() {
        for (const [node, meta] of [...registry]) {
            if (isDead(node, meta)) registry.delete(node);
        }
    }

    function byId(id) {
        if (!id) return null;
        for (const [node, meta] of registry) if (meta.id === id) return node;
        return null;
    }

    // Mode-aware teardown: detach a mounted node; un-toggle a static one.
    function close(node) {
        if (!node) return;
        const meta = registry.get(node);
        registry.delete(node);
        if (meta && meta.mode === 'toggle') {
            node.classList.remove(meta.activeClass);
        } else if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }

    function closeLayer(layer) {
        for (const [node, meta] of [...registry]) {
            if (meta.layer === layer) close(node);
        }
    }

    // Shared registration + arbitration. Returns the meta, or null if the
    // mount was suppressed.
    function register(node, opts, mode) {
        opts = opts || {};
        const layer = LAYERS.indexOf(opts.layer) >= 0 ? opts.layer : 'popup';
        const meta = {
            id: opts.id || null,
            layer,
            exclusive: !!opts.exclusive,
            mode,
            activeClass: opts.activeClass || 'active',
        };

        prune();

        if (suppressor && suppressor(meta)) {
            try { if (typeof opts.onSuppressed === 'function') opts.onSuppressed(); } catch (e) {}
            return null;
        }

        // Re-opening an id replaces the old instance.
        if (meta.id) { const existing = byId(meta.id); if (existing) close(existing); }
        // Exclusive layers hold one window at a time — clear the rest first.
        if (isExclusive(meta)) closeLayer(layer);

        node.setAttribute('data-surface-layer', layer);
        if (meta.id) node.setAttribute('data-surface-id', meta.id);
        registry.set(node, meta);
        return meta;
    }

    // Mount a freshly-created window node. opts: { id?, layer='popup',
    // exclusive?, prepend?, onSuppressed? }. Returns node, or null if denied.
    function mount(node, opts) {
        if (!node) return null;
        const meta = register(node, opts, 'mount');
        if (!meta) return null;
        if (opts && opts.prepend) document.body.insertBefore(node, document.body.firstChild);
        else document.body.appendChild(node);
        return node;
    }

    // Reveal a STATIC node (already in the DOM) by adding its active class.
    // opts: { id?, layer='popup', exclusive?, activeClass='active', onSuppressed? }.
    function show(node, opts) {
        if (!node) return null;
        const meta = register(node, opts, 'toggle');
        if (!meta) return null;
        node.classList.add(meta.activeClass);
        return node;
    }

    function hide(node) { close(node); }
    function unmount(node) { close(node); }

    // Tear down every surface NOT in the kept layer(s).
    function clearExcept(keepLayers) {
        const keep = Array.isArray(keepLayers) ? keepLayers : [keepLayers];
        prune();
        for (const [node, meta] of [...registry]) {
            if (!keep.includes(meta.layer)) close(node);
        }
    }

    function closeAll() {
        for (const node of [...registry.keys()]) close(node);
    }

    function count() { prune(); return registry.size; }
    function countLayer(layer) { prune(); let n = 0; for (const [, m] of registry) if (m.layer === layer) n++; return n; }

    function setExclusiveLayers(layers) { exclusiveLayers = new Set(layers || []); }
    function getExclusiveLayers() { return [...exclusiveLayers]; }
    function setSuppressor(fn) { suppressor = (typeof fn === 'function') ? fn : defaultSuppressor; }
    function resetSuppressor() { suppressor = defaultSuppressor; }

    function init() { /* suppressor + exclusivity are wired at definition */ }

    return {
        init, mount, show, hide, unmount, byId,
        clearExcept, closeAll, count, countLayer,
        setExclusiveLayers, getExclusiveLayers,
        setSuppressor, resetSuppressor,
        LAYERS,
        _registry: registry,
        _prune: prune,
    };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = Surface;
