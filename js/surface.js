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
//   • exclusivity (opt-in: one window per layer at a time)
//   • id replacement (re-opening 'fomo' closes the old 'fomo')
//   • clearExcept() / closeAll() for clean state transitions
//   • self-pruning: nodes removed via plain .remove() are reaped from
//     the registry automatically, so callers only have to route the
//     MOUNT through Surface — removals can stay as they are.
//
// Migration is therefore mechanical: replace
//     document.body.appendChild(node)
// with
//     Surface.mount(node, { id, layer })
// and (optionally) node.remove() with Surface.unmount(node).

const Surface = (() => {
    // Logical layers. Order is documentation; Surface does NOT set z-index
    // (CSS still owns visual stacking). Layers drive suppression + exclusivity.
    const LAYERS = ['base', 'popup', 'chaos', 'phase7', 'system'];

    // node -> { id, layer, exclusive }
    const registry = new Map();

    // A predicate (meta) -> bool. If it returns true, the mount is denied.
    let suppressor = defaultSuppressor;

    function defaultSuppressor(meta) {
        // Once the player has chosen WALK AWAY or STAY, the game is over.
        // Deny every surface except the Phase 7 / system layers that own
        // the terminal screen. This is the one rule that used to be a dozen
        // scattered guards.
        if (typeof Game !== 'undefined' && Game.isTerminalPhase7 && Game.isTerminalPhase7()) {
            return meta.layer !== 'phase7' && meta.layer !== 'system';
        }
        return false;
    }

    // Drop registry entries whose nodes have left the DOM (removed via plain
    // .remove(), innerHTML wipes, etc). Keeps exclusivity/clearExcept honest
    // even when callers don't route their removals through Surface.
    function prune() {
        for (const node of [...registry.keys()]) {
            if (!node || !node.isConnected) registry.delete(node);
        }
    }

    function byId(id) {
        if (!id) return null;
        for (const [node, meta] of registry) if (meta.id === id) return node;
        return null;
    }

    function closeExclusiveIn(layer) {
        for (const [node, meta] of [...registry]) {
            if (meta.layer === layer && meta.exclusive) unmount(node);
        }
    }

    // Mount a window node. Returns the node, or null if suppressed.
    // opts: { id?, layer='popup', exclusive=false, onSuppressed? }
    function mount(node, opts) {
        if (!node) return null;
        opts = opts || {};
        const layer = LAYERS.indexOf(opts.layer) >= 0 ? opts.layer : 'popup';
        const meta = { id: opts.id || null, layer, exclusive: !!opts.exclusive };

        prune();

        if (suppressor && suppressor(meta)) {
            try { if (typeof opts.onSuppressed === 'function') opts.onSuppressed(); } catch (e) {}
            return null;
        }

        // Re-opening an id replaces the old instance.
        if (meta.id) { const existing = byId(meta.id); if (existing) unmount(existing); }
        // Exclusive layers hold one window at a time.
        if (meta.exclusive) closeExclusiveIn(layer);

        node.setAttribute('data-surface-layer', layer);
        if (meta.id) node.setAttribute('data-surface-id', meta.id);
        registry.set(node, meta);
        document.body.appendChild(node);
        return node;
    }

    function unmount(node) {
        if (!node) return;
        registry.delete(node);
        if (node.parentNode) node.parentNode.removeChild(node);
    }

    // Tear down every surface NOT in the kept layer(s). Used on state
    // transitions — e.g. entering Phase 7 clears popups/chaos but keeps
    // the phase7 layer.
    function clearExcept(keepLayers) {
        const keep = Array.isArray(keepLayers) ? keepLayers : [keepLayers];
        prune();
        for (const [node, meta] of [...registry]) {
            if (!keep.includes(meta.layer)) unmount(node);
        }
    }

    function closeAll() {
        for (const node of [...registry.keys()]) unmount(node);
    }

    function count() { prune(); return registry.size; }

    // Override the suppression predicate (mainly for tests).
    function setSuppressor(fn) { suppressor = (typeof fn === 'function') ? fn : defaultSuppressor; }
    function resetSuppressor() { suppressor = defaultSuppressor; }

    function init() { /* suppressor is wired at definition; nothing to do on boot */ }

    return {
        init, mount, unmount, byId, clearExcept, closeAll, count,
        setSuppressor, resetSuppressor,
        LAYERS,
        _registry: registry,
        _prune: prune,
    };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = Surface;
