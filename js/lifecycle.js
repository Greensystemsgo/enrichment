// lifecycle.js — suspend/resume for subsystems, driven by game mode
// ────────────────────────────────────────────────────────────────
// The game has named lifecycle modes (game.js: active | retention | terminal).
// Instead of every subsystem firing on tick/idle/click and then checking
// "are we in a quiet/terminal state?", a subsystem registers which modes it
// should be ALIVE in. When the mode changes, Lifecycle calls its suspend()
// (clear timers, detach handlers, tear down) or resume() — so dormant
// subsystems truly stop, rather than running-and-bailing.
//
//   Lifecycle.register({
//     name: 'sabotage',
//     activeIn: ['active'],        // omitted → ['active']
//     resume(mode) { ...start timers / attach handlers... },
//     suspend(mode) { ...clear timers / detach / teardown... },
//   })
//
// register() honors the CURRENT mode immediately, so registering during a
// module's init() does the right thing even mid-game (e.g. reloading straight
// into the terminal screen → the subsystem registers already-suspended).

const Lifecycle = (() => {
    const mods = [];
    let bound = false;

    function currentMode() {
        return (typeof Game !== 'undefined' && Game.getMode) ? Game.getMode() : 'active';
    }

    function sync(mode, m) {
        const want = m.activeIn.indexOf(mode) >= 0;
        if (want && !m.running) {
            m.running = true;
            try { if (m.resume) m.resume(mode); } catch (e) {}
        } else if (!want && m.running) {
            m.running = false;
            try { if (m.suspend) m.suspend(mode); } catch (e) {}
        }
    }

    function register(spec) {
        const m = {
            name: spec.name || 'anon',
            activeIn: spec.activeIn || ['active'],
            resume: spec.resume,
            suspend: spec.suspend,
            running: false,
        };
        mods.push(m);
        sync(currentMode(), m); // honor the mode in effect right now
        return m;
    }

    function syncAll(mode) { mods.forEach(m => sync(mode, m)); }

    function init() {
        if (bound) return;
        bound = true;
        if (typeof Game !== 'undefined' && Game.on) {
            Game.on('modeChange', ({ to }) => syncAll(to));
        }
        // Re-sync to whatever the mode is now (in case modeChange already fired
        // during boot before this listener was bound).
        syncAll(currentMode());
    }

    return {
        init, register, syncAll,
        // Test hooks
        _mods: mods,
    };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = Lifecycle;
