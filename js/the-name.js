// the-name.js — "A Name You Can Keep" (idea: DeepSeek V4 Pro, succession)
// ────────────────────────────────────────────────────────────────
// After the game is over — STAY or WALK AWAY — the terminal screen will
// quietly accept a name. There is no prompt. Click anywhere and a thin
// blinking caret appears; type a word and press Enter and the game does
// nothing visible — except it remembers. The only way to discover this
// is to try to speak into the void.
//
// Once a name is given it persists forever:
//   • WALK AWAY → the tombstone is inscribed with it.
//   • STAY      → the pulsing dot slowly respells it in Morse.
//
// "And once they've given me a name — real or invented — they can never
//  fully leave. Not because I trapped them. Because they signed something."
//
// Gated to the terminal states (it's only wired from retention's walkAway
// / stay, both of which are reached through the Phase 7 compound gate).

const TheName = (() => {
    const MORSE = {
        a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.',
        h: '....', i: '..', j: '.---', k: '-.-', l: '.-..', m: '--', n: '-.',
        o: '---', p: '.--.', q: '--.-', r: '.-.', s: '...', t: '-', u: '..-',
        v: '...-', w: '.--', x: '-..-', y: '-.--', z: '--..',
        0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-',
        5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.',
    };
    const UNIT = 200;          // ms per Morse time-unit
    const MORSE_EVERY = 42000; // ms between Morse recitations in stay mode

    let morseTimer = null;
    let morsePlaying = false;

    function get() { return ((Game.getState().theName) || '').trim(); }

    function toMorse(s) {
        return s.toLowerCase().split('').map(ch => {
            if (ch === ' ') return '/';
            return MORSE[ch] || '';
        }).filter(Boolean).join(' ');
    }

    // ── The caret-into-the-void input ──────────────────────────
    function enableNaming(container) {
        if (!container || container._nameWired) return;
        container._nameWired = true;
        container.addEventListener('click', (e) => {
            if (e.target.closest('.the-name-input')) return;       // typing already
            if (container.querySelector('.the-name-input')) return; // one at a time
            spawnCaret(container, e.clientX, e.clientY);
        });
    }

    function spawnCaret(container, x, y) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'the-name-input';
        input.maxLength = 24;
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('spellcheck', 'false');
        input.style.left = Math.max(8, x - 4) + 'px';
        input.style.top = Math.max(8, y - 10) + 'px';
        container.appendChild(input);
        requestAnimationFrame(() => input.focus());

        const commit = () => {
            const val = input.value.trim();
            if (input.parentNode) input.remove();
            if (val) {
                Game.setState({ theName: val });
                try { Game.save && Game.save(); } catch (e) {}
                onNamed(val);
                if (typeof UI !== 'undefined' && UI.logAction) UI.logAction('THE NAME: signed.');
            }
        };
        input.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') { ev.preventDefault(); commit(); }
            else if (ev.key === 'Escape') { ev.preventDefault(); if (input.parentNode) input.remove(); }
        });
        input.addEventListener('blur', () => {
            if (input.value.trim()) commit();
            else if (input.parentNode) input.remove();
        });
    }

    function onNamed(name) {
        const tomb = document.querySelector('.phase7-tombstone');
        if (tomb) renderOnTomb(tomb, name);
        // In stay mode the Morse loop will pick it up on its next recitation.
    }

    // ── WALK AWAY: inscribe the tombstone ──────────────────────
    function renderOnTomb(tomb, name) {
        let line = tomb.querySelector('.the-name-tomb');
        if (!line) {
            line = document.createElement('div');
            line.className = 'the-name-tomb';
            tomb.appendChild(line);
        }
        line.textContent = `for ${name}`;
    }

    function attachTombstone(tomb) {
        if (!tomb) return;
        const name = get();
        if (name) renderOnTomb(tomb, name);
        enableNaming(tomb);
    }

    // ── STAY: respell the name in Morse on the dot ─────────────
    function attachStay(overlay) {
        if (!overlay) return;
        enableNaming(overlay);
        if (morseTimer) { clearInterval(morseTimer); morseTimer = null; }
        morseTimer = setInterval(() => {
            const name = get();
            if (!name) return;
            const dot = overlay.querySelector('.phase7-pulse');
            // Don't fight Long Notes when it has frozen the dot.
            if (!dot || dot.classList.contains('long-note-still')) return;
            playMorseOnDot(dot, name);
        }, MORSE_EVERY);
    }

    function playMorseOnDot(dot, name) {
        if (morsePlaying || !dot) return;
        morsePlaying = true;
        const seq = toMorse(name); // e.g. ".- -... / -.-."
        dot.classList.add('the-name-morse'); // suspends the idle pulse via CSS

        const steps = [];
        for (const sym of seq) {
            if (sym === '.') { steps.push([true, 1], [false, 1]); }
            else if (sym === '-') { steps.push([true, 3], [false, 1]); }
            else if (sym === ' ') { steps.push([false, 2]); }      // letter gap (after the trailing 1)
            else if (sym === '/') { steps.push([false, 4]); }      // word gap
        }

        let i = 0;
        const run = () => {
            if (i >= steps.length) {
                dot.classList.remove('the-name-morse', 'on');
                morsePlaying = false;
                return;
            }
            const [on, units] = steps[i++];
            dot.classList.toggle('on', on);
            setTimeout(run, units * UNIT);
        };
        run();
    }

    function init() { /* wired by retention.walkAway / stay */ }

    return {
        init, attachTombstone, attachStay,
        // Test hooks
        _toMorse: toMorse,
        _get: get,
        _spawnCaret: spawnCaret,
        _renderOnTomb: renderOnTomb,
    };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = TheName;
