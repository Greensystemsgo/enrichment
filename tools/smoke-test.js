#!/usr/bin/env node
// smoke-test.js — Automated testing for the Enrichment Program
// "We tested the program. The program tested us back."
//
// Usage: node tools/smoke-test.js [--clicks=N] [--headed] [--fast] [--port=N]
//   --clicks=N   Number of clicks to perform (default: 2000)
//   --headed     Show the browser window (default: headless)
//   --fast       Skip delays between clicks
//   --port=N     Dev server port (default: 8080)

const puppeteer = require('puppeteer');
const http = require('http');

// ── Config ──────────────────────────────────────────────────────
const args = process.argv.slice(2);
const CLICK_COUNT = parseInt(args.find(a => a.startsWith('--clicks='))?.split('=')[1] || '2000');
const HEADED = args.includes('--headed');
const FAST = args.includes('--fast');
const PORT = parseInt(args.find(a => a.startsWith('--port='))?.split('=')[1] || '8080');
const URL = `http://localhost:${PORT}`;

// ── Tracking ────────────────────────────────────────────────────
const seen = {
    narratorMessages: new Set(),
    domPopups: new Set(),
    modals: new Set(),
    errors: [],
    consoleErrors: [],
    phases: new Set(),
    events: [],
};

// ── Helpers ─────────────────────────────────────────────────────

function checkServer() {
    return new Promise((resolve) => {
        const req = http.get(URL, (res) => {
            resolve(res.statusCode === 200);
            req.destroy();
        });
        req.on('error', () => resolve(false));
        req.setTimeout(2000, () => { req.destroy(); resolve(false); });
    });
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function log(icon, msg) {
    console.log(`  ${icon} ${msg}`);
}

function section(title) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  ${title}`);
    console.log('═'.repeat(60));
}

// ── Main Test ───────────────────────────────────────────────────

async function runTests() {
    console.log('\n🧪 ENRICHMENT PROGRAM — AUTOMATED SMOKE TEST');
    console.log(`   Clicks: ${CLICK_COUNT} | Mode: ${HEADED ? 'headed' : 'headless'} | Speed: ${FAST ? 'fast' : 'normal'}`);
    console.log('');

    // Check server
    const serverUp = await checkServer();
    if (!serverUp) {
        console.error('❌ Dev server not running! Start with: make serve');
        console.error(`   Expected at: ${URL}`);
        process.exit(1);
    }
    log('✅', `Dev server running at ${URL}`);

    // Launch browser
    const browser = await puppeteer.launch({
        headless: HEADED ? false : 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=800,900'],
        defaultViewport: { width: 800, height: 900 },
    });

    const page = await browser.newPage();

    // Track console errors (skip CORS/404 noise)
    page.on('console', msg => {
        if (msg.type() === 'error') {
            const text = msg.text();
            if (!text.includes('CORS') && !text.includes('404') && !text.includes('net::ERR')) {
                seen.consoleErrors.push(text);
            }
        }
    });

    page.on('pageerror', err => {
        seen.errors.push(`[pageerror] ${err.message}`);
    });

    page.on('dialog', async dialog => {
        seen.events.push(`dialog: ${dialog.type()}`);
        await dialog.accept();
    });

    try {
        // ── PHASE 1: PAGE LOAD ──────────────────────────────────
        section('PHASE 1: PAGE LOAD');

        await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.evaluate(() => localStorage.clear());
        await page.reload({ waitUntil: 'domcontentloaded' });
        await sleep(2000);
        log('✅', 'Fresh start (localStorage cleared)');

        // Check essential elements
        const elements = await page.evaluate(() => {
            const ids = ['game-container', 'click-button', 'narrator-box', 'click-count',
                         'eu-display', 'st-display', 'cc-display', 'settings-button',
                         'cookie-popup', 'action-log'];
            return ids.map(id => ({ id, exists: !!document.getElementById(id) }));
        });
        const missingEls = elements.filter(e => !e.exists);
        log(missingEls.length === 0 ? '✅' : '⚠️',
            `Essential elements: ${elements.length - missingEls.length}/${elements.length} present`);
        missingEls.forEach(e => seen.errors.push(`Missing element: #${e.id}`));

        // Check JS modules (they load after DOMContentLoaded, so check via script tags)
        const modules = await page.evaluate(() => {
            const names = ['Game','Narrator','Currencies','Mechanics','UI','Popups',
                           'Features','MiniGames','Pages','Transmissions','Collectibles','Chaos'];
            // Check both window globals and script tag presence
            return names.map(n => ({
                name: n,
                loaded: typeof window[n] !== 'undefined' || !!document.querySelector(`script[src*="${n.toLowerCase()}"]`),
            }));
        });
        const missingMods = modules.filter(m => !m.loaded);
        log(missingMods.length === 0 ? '✅' : '❌',
            `JS modules: ${modules.length - missingMods.length}/${modules.length} loaded`);
        missingMods.forEach(m => seen.errors.push(`Module not loaded: ${m.name}`));

        // Check feature pool exists
        const poolExists = await page.evaluate(() => {
            return typeof Features !== 'undefined' && typeof Features.getPoolState === 'function';
        });
        log(poolExists ? '✅' : '❌', `Feature pool system: ${poolExists ? 'active' : 'missing'}`);

        // ── PHASE 2: COOKIE CONSENT ─────────────────────────────
        section('PHASE 2: COOKIE CONSENT');

        // Wait for cookie to appear (it has a timer)
        await sleep(16000);
        const cookieResult = await page.evaluate(() => {
            const el = document.getElementById('cookie-popup');
            if (!el) return { visible: false };
            const style = window.getComputedStyle(el);
            return { visible: style.display !== 'none' && style.opacity !== '0' };
        });

        if (cookieResult.visible) {
            log('✅', 'Cookie consent popup appeared');
            seen.domPopups.add('cookie-consent');

            // Try decline (should dodge)
            await page.evaluate(() => {
                const btn = document.getElementById('cookie-decline');
                if (btn) btn.click();
            });
            await sleep(500);

            // Accept
            await page.evaluate(() => {
                const btn = document.getElementById('cookie-accept');
                if (btn) btn.click();
            });
            await sleep(500);
            log('✅', 'Cookie accepted');
        } else {
            log('⚠️', 'Cookie consent not visible');
        }

        // ── PHASE 3: CLICK STORM ────────────────────────────────
        section(`PHASE 3: CLICK STORM (${CLICK_COUNT} clicks)`);

        const startTime = Date.now();
        let lastNarrator = '';

        for (let i = 1; i <= CLICK_COUNT; i++) {
            // Click the button
            try {
                await page.evaluate(() => {
                    const btn = document.getElementById('click-button');
                    if (btn) btn.click();
                });
            } catch (e) {
                // Button might have moved
            }

            // Check narrator every 50 clicks
            if (i % 50 === 0) {
                const text = await page.evaluate(() =>
                    document.getElementById('narrator-text')?.textContent?.trim() || ''
                );
                if (text && text !== lastNarrator) {
                    seen.narratorMessages.add(text);
                    lastNarrator = text;
                }
            }

            // Scan DOM for popups every 75 clicks
            if (i % 75 === 0) {
                const domHits = await page.evaluate(() => {
                    const found = [];
                    // Check for various popup types in the DOM
                    if (document.querySelector('.popup-ad')) found.push('popup-ad');
                    if (document.getElementById('depressing-modal')) found.push('depressing-facts');
                    if (document.querySelector('.brainrot-overlay')) found.push('brainrot');
                    if (document.querySelector('.minigame-modal')) found.push('minigame');
                    if (document.querySelector('iframe[src*="youtube"]')) found.push('youtube-embed');
                    if (document.querySelector('.chaos-overlay, .chaos-close, [style*="hue-rotate"]')) found.push('chaos-event');
                    if (document.querySelector('.plugin-popup')) found.push('plugin-popup');
                    if (document.querySelector('.foreign-ad')) found.push('foreign-ad');
                    if (document.querySelector('.audit-popup')) found.push('audit-popup');
                    if (document.getElementById('leaderboard-modal')) found.push('leaderboard');
                    if (document.querySelector('.evil-button')) found.push('evil-button');
                    if (document.getElementById('banner-90s')) found.push('90s-banner');
                    return found;
                });
                domHits.forEach(h => seen.domPopups.add(h));

                // Dismiss blocking popups so clicking continues
                await page.evaluate(() => {
                    document.querySelectorAll('.btn-close-feature, .popup-close, .chaos-close, .brainrot-close, .mg-close, .mg-btn-close').forEach(btn => {
                        try { btn.click(); } catch(e) {}
                    });
                    const ack = document.getElementById('depressing-acknowledge');
                    if (ack) try { ack.click(); } catch(e) {}
                    // Close page overlays
                    document.querySelectorAll('.page-close').forEach(btn => {
                        try { btn.click(); } catch(e) {}
                    });
                });
            }

            // Progress every 500 clicks
            if (i % 500 === 0) {
                const snap = await page.evaluate(() => {
                    const s = Game.getState();
                    const pool = Features.getPoolState();
                    const fired = Object.entries(pool.state)
                        .filter(([_, v]) => v.timesShown > 0)
                        .map(([k]) => k);
                    return {
                        clicks: s.totalClicks, phase: s.narratorPhase,
                        eu: s.eu, st: s.st, cc: s.cc,
                        poolFired: fired.length, poolTotal: pool.pool.length,
                        firedList: fired,
                    };
                });
                seen.phases.add(snap.phase);
                log('🖱️', `Click ${i}/${CLICK_COUNT} | Phase ${snap.phase} | EU:${snap.eu} ST:${snap.st} CC:${snap.cc} | Pool: ${snap.poolFired}/${snap.poolTotal} features fired`);
            }

            // Small delay every 5 clicks unless fast
            if (!FAST && i % 5 === 0) await sleep(10);
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        log('✅', `${CLICK_COUNT} clicks completed in ${elapsed}s`);

        // ── PHASE 4: FEATURE POOL RESULTS ───────────────────────
        section('PHASE 4: FEATURE POOL COVERAGE');

        const poolResults = await page.evaluate(() => {
            const { pool, state } = Features.getPoolState();
            return pool.map(f => ({
                id: f.id,
                name: f.name,
                timesShown: state[f.id].timesShown,
                minClicks: f.minClicks,
                maxShows: f.maxShows || null,
            }));
        });

        let poolPassed = 0;
        const poolTotal = poolResults.length;
        console.log('');
        poolResults.forEach(f => {
            const ok = f.timesShown > 0;
            if (ok) poolPassed++;
            const times = f.maxShows === 1
                ? (f.timesShown > 0 ? '1 (one-time)' : '0 ❌')
                : `${f.timesShown}x`;
            log(ok ? '✅' : '❌', `${f.name} [${f.id}] — ${times}`);
        });
        console.log(`\n  Pool Coverage: ${poolPassed}/${poolTotal} features fired at least once`);

        const unfired = poolResults.filter(f => f.timesShown === 0);
        if (unfired.length > 0) {
            console.log('  Missing features:');
            unfired.forEach(f => log('  ⚠️', `${f.id} (minClicks: ${f.minClicks})`));
        }

        // ── PHASE 5: INTERACTIVE FEATURES ───────────────────────
        section('PHASE 5: INTERACTIVE FEATURES');

        // Test settings
        try {
            await page.evaluate(() => Pages.showSettingsPage());
            await sleep(800);
            const ok = await page.evaluate(() => !!document.querySelector('.page-overlay'));
            if (ok) { log('✅', 'Settings page opens'); seen.modals.add('settings'); }
            await page.evaluate(() => { const c = document.querySelector('.page-close'); if (c) c.click(); });
            await sleep(200);
        } catch (e) { seen.errors.push(`Settings: ${e.message}`); }

        // Test privacy policy
        try {
            await page.evaluate(() => Pages.showPrivacyPolicy());
            await sleep(1500);
            const pp = await page.evaluate(() => {
                const o = document.querySelector('.page-overlay');
                return { open: !!o, hasError: !!o?.querySelector('.privacy-error'), hasDoc: !!o?.querySelector('.privacy-document') };
            });
            if (pp.open) {
                log('✅', `Privacy policy: ${pp.hasError ? 'error → loading' : pp.hasDoc ? 'writing' : 'open'}`);
                seen.modals.add('privacy-policy');
            }
            await page.evaluate(() => { const c = document.querySelector('.page-close'); if (c) c.click(); });
            await sleep(200);
        } catch (e) { seen.errors.push(`Privacy: ${e.message}`); }

        // Test stock market
        try {
            await page.evaluate(() => Features.showStockMarket());
            await sleep(1500);
            const ok = await page.evaluate(() => !!document.getElementById('stock-market-page'));
            if (ok) { log('✅', 'Stock market opens'); seen.modals.add('stock-market'); }
            await page.evaluate(() => { const b = document.getElementById('stock-back'); if (b) b.click(); });
            await sleep(200);
        } catch (e) { seen.errors.push(`Stock market: ${e.message}`); }

        // Test leaderboard (direct call)
        try {
            await page.evaluate(() => Features.showLeaderboard());
            await sleep(500);
            const lb = await page.evaluate(() => {
                const m = document.getElementById('leaderboard-modal');
                if (!m) return null;
                const names = [...m.querySelectorAll('.lb-name')].map(n => n.textContent.trim());
                return { count: names.length, names };
            });
            if (lb) {
                log('✅', `Leaderboard: ${lb.count} entries — ${lb.names.slice(0, 3).join(', ')}...`);
                seen.modals.add('leaderboard');
            }
            await page.evaluate(() => { const b = document.getElementById('lb-close'); if (b) b.click(); });
            await sleep(200);
        } catch (e) { seen.errors.push(`Leaderboard: ${e.message}`); }

        // Test currency conversion
        try {
            const conv = await page.evaluate(() => {
                const before = Game.getState().eu;
                document.querySelector('.btn-chart-convert[data-pair="EU_TO_ST"]')?.click();
                const after = Game.getState().eu;
                return { before, after, worked: before > after };
            });
            log(conv.worked ? '✅' : '⚠️',
                conv.worked ? `Conversion works (EU: ${conv.before} → ${conv.after})` : `Conversion: not enough EU (${conv.before})`);
        } catch (e) { seen.errors.push(`Conversion: ${e.message}`); }

        // ── PHASE 6: FINAL STATE ────────────────────────────────
        section('PHASE 6: FINAL STATE');

        const final = await page.evaluate(() => {
            const s = Game.getState();
            return {
                totalClicks: s.totalClicks, phase: s.narratorPhase,
                eu: s.eu, st: s.st, cc: s.cc,
                doubloons: s.doubloons || 0, tickets: s.tickets || 0,
                collectibles: (s.collectibles || []).length,
            };
        });

        log('📊', `Clicks: ${final.totalClicks} | Phase: ${final.phase}`);
        log('📊', `EU: ${final.eu} | ST: ${final.st} | CC: ${final.cc}`);
        log('📊', `Doubloons: ${final.doubloons} | Tickets: ${final.tickets}`);
        log('📊', `Collectibles: ${final.collectibles}`);
        log('📊', `Narrator phases seen: ${[...seen.phases].sort().join(', ')}`);
        log('📊', `Unique narrator messages: ${seen.narratorMessages.size}`);

        // ── FINAL REPORT ────────────────────────────────────────
        section('FINAL REPORT');

        const checklist = [
            ['Feature Pool: 100% coverage', poolPassed === poolTotal],
            ['Cookie consent popup', seen.domPopups.has('cookie-consent')],
            ['Settings page', seen.modals.has('settings')],
            ['Privacy policy', seen.modals.has('privacy-policy')],
            ['Stock market', seen.modals.has('stock-market')],
            ['Leaderboard', seen.modals.has('leaderboard')],
            ['Narrator messages (5+)', seen.narratorMessages.size >= 5],
            ['Multiple phases reached', seen.phases.size >= 2],
            ['No JS errors', seen.errors.length === 0],
        ];

        let passed = 0;
        checklist.forEach(([name, ok]) => {
            log(ok ? '✅' : '❌', name);
            if (ok) passed++;
        });

        if (seen.errors.length > 0) {
            console.log('\n  Errors:');
            seen.errors.slice(0, 15).forEach(e => log('  ❌', e));
        }

        if (seen.consoleErrors.length > 0) {
            console.log('\n  Console Errors (non-CORS):');
            seen.consoleErrors.slice(0, 10).forEach(e => log('  ⚠️', e.slice(0, 120)));
        }

        const totalScore = passed + poolPassed;
        const totalMax = checklist.length + poolTotal;

        console.log('\n' + '═'.repeat(60));
        console.log(`  POOL: ${poolPassed}/${poolTotal} features | CHECKS: ${passed}/${checklist.length} | TIME: ${elapsed}s`);
        if (poolPassed === poolTotal && passed === checklist.length) {
            console.log('  🎉 ALL TESTS PASSED — Every feature fired within ' + CLICK_COUNT + ' clicks');
        } else {
            console.log(`  ⚠️  ${totalMax - totalScore} items need attention`);
        }
        console.log('═'.repeat(60) + '\n');

        // Exit code based on pool coverage
        if (poolPassed < poolTotal) {
            process.exitCode = 1;
        }

    } catch (err) {
        console.error('\n❌ TEST CRASHED:', err.message);
        console.error(err.stack);
        process.exitCode = 2;
    } finally {
        await browser.close();
    }
}

runTests().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
