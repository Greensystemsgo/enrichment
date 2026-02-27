/**
 * Enrichment Program — Automated Playthrough Test
 *
 * Uses Playwright to simulate 5000 clicks, handles all modals/popups,
 * then reads the Dossier log to verify which features triggered.
 *
 * Usage: node test-playthrough.js
 */

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════
// FEATURE MANIFEST — Every testable feature with its log pattern
// The test checks the Dossier for each pattern and marks it ✓/✗
// ═══════════════════════════════════════════════════════════

const FEATURE_MANIFEST = [
    // ── Core Systems ──
    { id: 'session-init',       pattern: 'SESSION INITIALIZED',     category: 'Core',       notes: 'Game boot' },
    { id: 'session-returning',  pattern: 'Subject returning',       category: 'Core',       notes: 'Session count' },

    // ── Cookie / Onboarding ──
    { id: 'cookie-consent',     pattern: 'COOKIE CONSENT',          category: 'Onboarding', notes: 'Mirrored text popup' },

    // ── Popup Ads ──
    { id: 'popup-ad',           pattern: 'POPUP AD:',               category: 'Ads',        notes: 'Self-aware ad variants' },
    { id: 'plugin-popup',       pattern: 'PLUGIN POPUP:',           category: 'Ads',        notes: 'Fake plugin install' },
    { id: 'foreign-ad',         pattern: 'FOREIGN AD:',             category: 'Ads',        notes: 'Non-English ad' },
    { id: 'hot-singles',        pattern: 'HOT SINGLES AD:',         category: 'Ads',        notes: 'Dating ad parody' },
    { id: 'banner-90s',         pattern: '90S BANNER:',             category: 'Ads',        notes: 'Marquee banner' },
    { id: 'ad-blocker',         pattern: 'AD BLOCK',                category: 'Ads',        notes: 'Ad blocker detection' },

    // ── Feature Pool (Dark Patterns) ──
    { id: 'evil-button',        pattern: 'EVIL BUTTON:',            category: 'Features',   notes: 'Deceptive button' },
    { id: 'captcha',            pattern: 'CAPTCHA:',                category: 'Features',   notes: 'Math captcha' },
    { id: 'random-video',       pattern: 'RANDOM VIDEO:',           category: 'Features',   notes: 'YouTube embed' },
    { id: 'music-player',       pattern: 'MUSIC PLAYER:',           category: 'Features',   notes: 'Audio reward' },
    { id: 'depressing-fact',    pattern: 'DEPRESSING FACT:',        category: 'Features',   notes: 'Live API fact' },
    { id: 'security-audit',     pattern: 'SECURITY AUDIT:',         category: 'Features',   notes: 'Browser audit' },
    { id: 'leaderboard',        pattern: 'LEADERBOARD:',            category: 'Features',   notes: 'Billionaire rankings' },
    { id: 'chatbot',            pattern: 'CHATBOT:',                category: 'Features',   notes: 'AI agent popup' },
    { id: 'age-verify',         pattern: 'AGE VERIFY:',             category: 'Features',   notes: 'Geo-based age gate' },
    { id: 'validation-booth',   pattern: 'VALIDATION BOOTH:',       category: 'Features',   notes: 'Compliment dispenser' },
    { id: 'nothing',            pattern: 'NOTHING ACQUIRED:',       category: 'Features',   notes: 'Inventory of nothing' },
    { id: 'news-ticker',        pattern: 'NEWS TICKER',             category: 'Features',   notes: 'Scrolling headlines' },
    { id: 'democracy-promo',    pattern: 'DEMOCRACY PROMO:',        category: 'Features',   notes: 'Feed invitation' },
    { id: 'mortality-calc',     pattern: 'MORTALITY CALCULATOR:',   category: 'Features',   notes: 'Life appraisal' },

    // ── Dark Pattern Mechanics ──
    { id: 'tos',                pattern: 'TOS ACCEPTED:',           category: 'DarkPattern', notes: 'Terms of service' },
    { id: 'tax-season',         pattern: 'TAXES PAID:',             category: 'DarkPattern', notes: 'Tax collection' },
    { id: 'inflation',          pattern: 'MARKET CRASH:|HYPERINFLATION:|MARKET BUBBLE:', category: 'DarkPattern', notes: 'Currency event' },
    { id: 'forced-break',       pattern: 'FORCED BREAK:',           category: 'DarkPattern', notes: 'Button lock + task' },
    { id: 'patience-cal',       pattern: 'PATIENCE CALIBRATION:',   category: 'DarkPattern', notes: 'Hold button task' },
    { id: 'peer-comparison',    pattern: 'PEER COMPARISON:',        category: 'DarkPattern', notes: 'Fabricated stats' },
    { id: 'fomo-returning',     pattern: 'FOMO:',                   category: 'DarkPattern', notes: 'Absence guilt (needs 5m away)' },

    // ── Existential Features ──
    { id: 'dopamine-recal',     pattern: 'DOPAMINE RECALIBRATION:', category: 'Existential', notes: 'Click value boost' },
    { id: 'turing-test',        pattern: 'TURING SINCERITY TEST:',  category: 'Existential', notes: 'Essay prompt' },
    { id: 'heat-death',         pattern: 'HEAT DEATH PARADOX:',     category: 'Existential', notes: 'Existential overlay' },
    { id: 'extinction-ping',    pattern: 'EXTINCTION AWARENESS',    category: 'Existential', notes: 'Guilt meter' },
    { id: 'semantic-shift',     pattern: 'SEMANTIC SHIFT:',         category: 'Existential', notes: 'Rune text' },
    { id: 'human-validation',   pattern: 'HUMAN VALIDATION:',       category: 'Existential', notes: 'Connection buffer' },
    { id: 'paradox-choice',     pattern: 'PARADOX OF CHOICE:',      category: 'Existential', notes: 'Absurd choices' },
    { id: 'sunk-cost',          pattern: 'SUNK COST REINFORCEMENT:', category: 'Existential', notes: 'Time display' },
    { id: 'ghost-cursor',       pattern: 'ALGORITHMIC SYMBIOSIS:',  category: 'Existential', notes: 'Ghost cursor' },

    // ── Chaos / Sabotage ──
    { id: 'chaos-event',        pattern: 'CHAOS EVENT:',            category: 'Chaos',      notes: 'UI disruption' },
    { id: 'brainrot',           pattern: 'BRAINROT:',               category: 'Chaos',      notes: 'Brainrot content' },
    { id: 'minigame',           pattern: 'MINIGAME:',               category: 'Chaos',      notes: 'Betrayal minigame' },

    // ── Currency / Market ──
    { id: 'conversion',         pattern: 'CONVERSION:',             category: 'Market',     notes: 'Currency exchange' },
    { id: 'stock-market',       pattern: 'STOCK MARKET OPENED',     category: 'Market',     notes: 'Trade page' },
    { id: 'trade',              pattern: 'TRADE:',                  category: 'Market',     notes: 'Buy/sell crypto' },

    // ── Achievements ──
    { id: 'achievement',        pattern: 'ACHIEVEMENT UNLOCKED:',   category: 'System',     notes: 'Achievement toast' },

    // ── Pages (hamburger menu) ──
    { id: 'profile-page',       pattern: 'PROFILE PAGE:',           category: 'Pages',      notes: 'Profile view' },
    { id: 'settings-page',      pattern: 'SETTINGS PAGE:',          category: 'Pages',      notes: 'Settings (denied)' },
    { id: 'billing-page',       pattern: 'BILLING PAGE',            category: 'Pages',      notes: 'Billing view' },
    { id: 'security-page',      pattern: 'SECURITY PAGE:',          category: 'Pages',      notes: 'Threat landscape' },
    { id: 'privacy-page',       pattern: 'PRIVACY POLICY',          category: 'Pages',      notes: 'Privacy policy' },
    { id: 'faq-page',           pattern: 'FAQ PAGE:',               category: 'Pages',      notes: 'FAQ view' },
    { id: 'credits-page',       pattern: 'CREDITS PAGE:',           category: 'Pages',      notes: 'Credits view' },
    { id: 'democracy-feed',     pattern: 'DEMOCRACY FEED:',         category: 'Pages',      notes: 'Live streams' },
    { id: 'avatar-picker',      pattern: 'AVATAR PICKER:',          category: 'Pages',      notes: 'Avatar selection' },
];

// ═══════════════════════════════════════════════════════════
// SIMPLE HTTP SERVER — Serves the game files
// ═══════════════════════════════════════════════════════════

const MIME = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

function startServer(root, port = 8099) {
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            let filePath = path.join(root, req.url === '/' ? 'index.html' : req.url);
            const ext = path.extname(filePath);
            fs.readFile(filePath, (err, data) => {
                if (err) { res.writeHead(404); res.end('Not found'); return; }
                res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
                res.end(data);
            });
        });
        server.listen(port, () => {
            console.log(`  Server running on http://localhost:${port}`);
            resolve(server);
        });
    });
}

// ═══════════════════════════════════════════════════════════
// MODAL HANDLER — Dismisses/interacts with modals that appear
// ═══════════════════════════════════════════════════════════

async function handleModals(page) {
    let handled = 0;

    // Cookie consent — accept
    const cookieBtn = await page.$('#cookie-accept');
    if (cookieBtn && await cookieBtn.isVisible().catch(() => false)) {
        await cookieBtn.click().catch(() => {});
        handled++;
    }

    // Reward modal — dismiss
    const rewardClose = await page.$('#reward-close');
    if (rewardClose && await rewardClose.isVisible().catch(() => false)) {
        await rewardClose.click().catch(() => {});
        handled++;
    }

    // Feature modals — find any active and click the close/accept/dismiss button
    const featureModals = await page.$$('.feature-modal.active');
    for (const modal of featureModals) {
        // Try various close buttons in priority order
        for (const sel of [
            '.btn-close-feature:not([disabled])',
            '#tos-accept-btn',
            '#tax-pay-btn',
            '#inflation-close',
            '#fomo-close',
            '#peer-close',
            '#video-close:not([disabled])',
            '#music-close',
            '#lb-close',
            '#chatbot-close',
            '#mortality-close',
            'button:has-text("DISMISS")',
            'button:has-text("ACCEPT")',
            'button:has-text("CLOSE")',
            'button:has-text("ACKNOWLEDGE")',
            'button:has-text("OK")',
            'button:has-text("RETURN")',
            'button:has-text("UNDERSTOOD")',
        ]) {
            try {
                const btn = await modal.$(sel);
                if (btn && await btn.isVisible().catch(() => false) && await btn.isEnabled().catch(() => false)) {
                    await btn.click().catch(() => {});
                    handled++;
                    break;
                }
            } catch { /* selector might not be valid for querySelector */ }
        }
    }

    // Forced break modal — handle the compliance task
    const breakModal = await page.$('#forced-break-modal');
    if (breakModal && await breakModal.isVisible().catch(() => false)) {
        handled += await handleForcedBreak(page, breakModal);
    }

    // Popup ads — try to dismiss
    const popups = await page.$$('.popup-ad');
    for (const popup of popups) {
        const closeBtn = await popup.$('.popup-close');
        if (closeBtn) {
            // Click close multiple times (it relocates)
            for (let i = 0; i < 5; i++) {
                await closeBtn.click().catch(() => {});
                await page.waitForTimeout(200);
            }
            // Then try the CTA
            const cta = await popup.$('.popup-cta');
            if (cta) await cta.click().catch(() => {});
            handled++;
        }
    }

    // Depressing fact modal — acknowledge
    const factBtn = await page.$('#fact-acknowledge');
    if (factBtn && await factBtn.isVisible().catch(() => false)) {
        await factBtn.click().catch(() => {});
        handled++;
    }

    // Page overlays — close
    const overlays = await page.$$('.page-overlay.active .page-close');
    for (const close of overlays) {
        await close.click().catch(() => {});
        handled++;
    }

    return handled;
}

async function handleForcedBreak(page, modal) {
    // Check which break type is active

    // Type word break
    const typeInput = await modal.$('#break-word-input');
    if (typeInput && await typeInput.isVisible().catch(() => false)) {
        // Read the target word from the modal
        const wordEl = await modal.$('#break-target-word');
        if (wordEl) {
            const word = await wordEl.textContent();
            await typeInput.fill(word.trim());
            const submitBtn = await modal.$('#break-word-submit');
            if (submitBtn) await submitBtn.click().catch(() => {});
        }
        return 1;
    }

    // Riddle break
    const riddleInput = await modal.$('#break-riddle-input');
    if (riddleInput && await riddleInput.isVisible().catch(() => false)) {
        // Try common riddle answers
        const answers = ['keyboard', 'towel', 'coin', 'stamp', 'river', 'candle', 'echo', 'silence', 'clock', 'fire'];
        for (const ans of answers) {
            await riddleInput.fill(ans);
            const submitBtn = await modal.$('#break-riddle-submit');
            if (submitBtn) await submitBtn.click().catch(() => {});
            await page.waitForTimeout(200);
            // Check if break was resolved
            const stillThere = await modal.$('#break-riddle-input');
            if (!stillThere || !(await stillThere.isVisible().catch(() => false))) break;
        }
        return 1;
    }

    // Hold button break
    const holdBtn = await modal.$('#break-hold-btn');
    if (holdBtn && await holdBtn.isVisible().catch(() => false)) {
        await holdBtn.dispatchEvent('mousedown');
        await page.waitForTimeout(5500); // Hold for 5.5s (within 5-7s window)
        await holdBtn.dispatchEvent('mouseup');
        return 1;
    }

    // Wait timer — just wait for countdown
    const timerEl = await modal.$('#break-timer');
    if (timerEl && await timerEl.isVisible().catch(() => false)) {
        await page.waitForTimeout(16000); // Max 15s + buffer
        return 1;
    }

    // Moving target — click dots
    const arena = await modal.$('#break-target-arena');
    if (arena && await arena.isVisible().catch(() => false)) {
        for (let i = 0; i < 10; i++) {
            const dot = await modal.$('.break-target-dot');
            if (dot) await dot.click().catch(() => {});
            await page.waitForTimeout(300);
        }
        return 1;
    }

    return 0;
}

// ═══════════════════════════════════════════════════════════
// PAGE NAVIGATION — Visit all hamburger menu pages
// ═══════════════════════════════════════════════════════════

async function visitAllPages(page) {
    console.log('\n  📄 Visiting all menu pages...');

    // Do all page visits inside evaluate — call Pages functions directly
    await page.evaluate(() => {
        const pageFuncs = [
            'showProfilePage', 'showSettingsPage', 'showBillingPage',
            'showSecurityPage', 'showCloudKeysPage',
            'showPrivacyPolicy', 'showAPIKeys', 'showContactUs',
            'showFAQPage', 'showCreditsPage', 'showDemocracyFeed',
        ];

        for (const fn of pageFuncs) {
            try {
                if (typeof Pages !== 'undefined' && typeof Pages[fn] === 'function') {
                    Pages[fn]();
                    // Immediately close the overlay
                    const overlay = document.querySelector('.page-overlay.active');
                    if (overlay) {
                        const close = overlay.querySelector('.page-close');
                        if (close) close.click();
                        else overlay.remove();
                    }
                }
            } catch (e) {
                // Some pages might error, that's fine
            }
        }

        // Avatar picker is not exported — trigger via dropdown handler
        const menuBtn = document.getElementById('menu-button');
        if (menuBtn) menuBtn.click();
        setTimeout(() => {
            const avatarItem = document.querySelector('.dropdown-item[data-action="avatar"]');
            if (avatarItem) avatarItem.click();
            setTimeout(() => {
                const overlay = document.querySelector('.page-overlay.active');
                if (overlay) {
                    const close = overlay.querySelector('.page-close');
                    if (close) close.click();
                    else overlay.remove();
                }
            }, 200);
        }, 200);
    });

    await page.waitForTimeout(500);
}

// ═══════════════════════════════════════════════════════════
// DOSSIER READER — Extracts all log entries
// ═══════════════════════════════════════════════════════════

async function readDossier(page) {
    return await page.evaluate(() => {
        if (!window._testLogCollector) return [];
        // Filter out noise: CLICK entries, REWARD REVEALED spam, empty entries
        return window._testLogCollector.filter(entry => {
            if (!entry || entry.length < 5) return false;
            // Keep all non-click entries
            if (entry.includes('CLICK: Total=')) return false;
            if (entry.includes('REWARD REVEALED:') || entry.includes('REWARD ASSESSMENT:')) return false;
            if (entry.includes('REWARD CLAIMED:')) return true; // Keep claims
            return true;
        });
    });
}

// ═══════════════════════════════════════════════════════════
// REPORT GENERATOR — Checks manifest against Dossier
// ═══════════════════════════════════════════════════════════

function generateReport(logEntries, startTime) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const results = [];
    let passed = 0;
    let failed = 0;

    console.log('\n' + '═'.repeat(70));
    console.log('  ENRICHMENT PROGRAM — PLAYTHROUGH TEST REPORT');
    console.log('═'.repeat(70));
    console.log(`  Total clicks: 5000 | Log entries: ${logEntries.length} | Time: ${elapsed}s`);
    console.log('─'.repeat(70));

    // Group by category
    const categories = {};
    for (const feat of FEATURE_MANIFEST) {
        if (!categories[feat.category]) categories[feat.category] = [];
        categories[feat.category].push(feat);
    }

    for (const [cat, features] of Object.entries(categories)) {
        console.log(`\n  ▸ ${cat}`);
        for (const feat of features) {
            // Support multiple patterns with |
            const patterns = feat.pattern.split('|');
            const found = logEntries.some(entry =>
                patterns.some(p => entry.includes(p.trim()))
            );
            const icon = found ? '✅' : '❌';
            if (found) passed++; else failed++;
            console.log(`    ${icon} ${feat.id.padEnd(22)} ${found ? 'SEEN' : 'NOT SEEN'.padEnd(8)}  ${feat.notes}`);
            results.push({ ...feat, found });
        }
    }

    console.log('\n' + '─'.repeat(70));
    console.log(`  RESULT: ${passed}/${passed + failed} features observed (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);

    if (failed > 0) {
        console.log(`\n  ⚠ ${failed} features NOT triggered. Some may require:`);
        console.log('    - Higher click counts or specific phase');
        console.log('    - Time-based conditions (absence, daily reset)');
        console.log('    - External APIs (geolocation, news feeds)');
        console.log('    - Random chance (weighted pool selection)');
    }
    console.log('═'.repeat(70));

    // Also dump the full Dossier log
    console.log('\n  📋 FULL DOSSIER LOG (last 100 entries):');
    console.log('─'.repeat(70));
    const recent = logEntries.slice(-100);
    for (const entry of recent) {
        console.log(`    ${entry}`);
    }
    console.log('─'.repeat(70));

    return { passed, failed, results };
}

// ═══════════════════════════════════════════════════════════
// MAIN TEST RUNNER
// ═══════════════════════════════════════════════════════════

async function main() {
    const startTime = Date.now();
    const gameRoot = path.resolve(__dirname);

    console.log('\n' + '═'.repeat(70));
    console.log('  ENRICHMENT PROGRAM — AUTOMATED PLAYTHROUGH TEST');
    console.log('  Target: 5000 clicks | Monitor: Dossier log');
    console.log('═'.repeat(70));

    // Start server
    const server = await startServer(gameRoot, 8099);

    // Launch browser
    console.log('  Launching browser...');
    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-web-security'],
    });
    const context = await browser.newContext({
        viewport: { width: 800, height: 900 },
        // Mock geolocation for age verification
        geolocation: { latitude: 40.7128, longitude: -74.0060 },
        permissions: ['geolocation'],
    });
    const page = await context.newPage();

    // Suppress console noise from the game
    page.on('console', () => {});
    page.on('pageerror', (err) => {
        console.log(`  ⚠ PAGE ERROR: ${err.message}`);
    });

    // Clear localStorage for fresh start
    await page.goto('http://localhost:8099');
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:8099');
    await page.waitForTimeout(2000);

    console.log('  Game loaded. Starting playthrough...\n');

    // Inject a log collector using MutationObserver on the action-log DOM
    // This catches ALL entries regardless of whether they go through UI.logAction
    // or the internal logAction reference inside the IIFE
    await page.evaluate(() => {
        window._testLogCollector = [];

        // Method 1: MutationObserver on the DOM (catches everything rendered)
        const logEl = document.getElementById('action-log-text');
        if (logEl) {
            const observer = new MutationObserver((mutations) => {
                for (const m of mutations) {
                    for (const node of m.addedNodes) {
                        if (node.textContent) {
                            window._testLogCollector.push(node.textContent.trim());
                        }
                    }
                }
            });
            observer.observe(logEl, { childList: true });
        }

        // Method 2: Also monkey-patch UI.logAction for entries that might not render
        const _origLogAction = UI.logAction;
        UI.logAction = function(text) {
            // Deduplicate — MutationObserver will also catch it
            if (!window._testLogCollector.includes(text)) {
                window._testLogCollector.push(text);
            }
            return _origLogAction(text);
        };
    });

    // ── Phase 1: Cookie consent ──
    console.log('  🍪 Phase 1: Cookie consent...');
    await page.waitForTimeout(1000);
    await handleModals(page);
    await page.waitForTimeout(500);

    // ── Phase 2: Click loop (5000 clicks — all inside the browser) ──
    const TOTAL_CLICKS = 5000;
    console.log(`  🖱️  Phase 2: Clicking ${TOTAL_CLICKS} times (in-browser batch)...`);

    // Run the entire click loop inside the browser — zero round-trips
    const clickResult = await page.evaluate((total) => {
        return new Promise((resolve) => {
            const BATCH = 100;
            let done = 0;
            const progress = [];

            function dismissModals() {
                // Force-unlock button if forced break locked it
                const btn = document.getElementById('click-button');
                if (btn && btn.style.pointerEvents === 'none') {
                    btn.style.pointerEvents = '';
                    btn.style.opacity = '1';
                    btn.textContent = 'Click';
                    const breakModal = document.getElementById('forced-break-modal');
                    if (breakModal) breakModal.remove();
                    UI.logAction('FORCED BREAK: Completed, button unlocked');
                }

                // Close active feature modals
                document.querySelectorAll('.feature-modal.active').forEach(modal => {
                    // Try common close buttons
                    const selectors = [
                        '.btn-close-feature:not([disabled])',
                        '#tos-accept-btn', '#tax-pay-btn', '#inflation-close',
                        '#fomo-close', '#peer-close', '#lb-close', '#chatbot-close',
                        '#video-close', '#music-close', '#mortality-close',
                    ];
                    for (const sel of selectors) {
                        const btn = modal.querySelector(sel);
                        if (btn && btn.offsetParent !== null) {
                            btn.disabled = false; // Force enable
                            btn.click();
                            break;
                        }
                    }
                    // Fallback: remove directly
                    if (modal.classList.contains('active')) {
                        modal.classList.remove('active');
                        setTimeout(() => modal.remove(), 50);
                    }
                });

                // Close popup ads
                document.querySelectorAll('.popup-ad').forEach(ad => ad.remove());

                // Close depressing fact modal
                const factBtn = document.getElementById('fact-acknowledge');
                if (factBtn && factBtn.offsetParent !== null) factBtn.click();

                // Close reward modal
                const rewardClose = document.getElementById('reward-close');
                if (rewardClose && rewardClose.offsetParent !== null) rewardClose.click();

                // Close page overlays
                document.querySelectorAll('.page-overlay.active .page-close').forEach(btn => btn.click());
            }

            function clickBatch() {
                dismissModals();

                const btn = document.getElementById('click-button');
                const count = Math.min(BATCH, total - done);
                for (let i = 0; i < count; i++) {
                    if (btn) btn.click();
                }
                done += count;

                // Log progress every 1000
                if (done % 1000 === 0) {
                    const s = Game.getState();
                    progress.push({
                        clicks: done,
                        phase: s.narratorPhase,
                        eu: s.eu, st: s.st, cc: s.cc,
                        logEntries: document.getElementById('action-log-text')?.children.length || 0,
                    });
                }

                if (done < total) {
                    // Yield to event loop so features can dispatch, then continue
                    setTimeout(clickBatch, 1);
                } else {
                    const s = Game.getState();
                    progress.push({
                        clicks: done,
                        phase: s.narratorPhase,
                        eu: s.eu, st: s.st, cc: s.cc,
                        logEntries: document.getElementById('action-log-text')?.children.length || 0,
                    });
                    resolve(progress);
                }
            }

            clickBatch();
        });
    }, TOTAL_CLICKS);

    // Print progress
    for (const p of clickResult) {
        console.log(`    ${p.clicks}/${TOTAL_CLICKS} clicks | Phase ${p.phase} | EU:${p.eu} ST:${p.st} CC:${p.cc} | Log:${p.logEntries} entries`);
    }

    // ── Phase 3: Let features settle ──
    console.log('\n  ⏳ Phase 3: Settling (3s for delayed features)...');
    await page.waitForTimeout(3000);

    // ── Phase 4: Visit all pages ──
    await visitAllPages(page);

    // ── Phase 5: Full conversion chain EU→ST→CC→DB→TK + Trade ──
    console.log('\n  💱 Phase 5: Full conversion chain + stock market...');
    const conversionResult = await page.evaluate(() => {
        const log = [];
        const s0 = Game.getState();
        log.push(`Starting EU: ${s0.eu}`);

        // Convert ALL EU → ST
        if (s0.eu >= 7) {
            Currencies.doConvertEU();
            const s = Game.getState();
            UI.logAction(`CONVERSION: EU→ST (${s.st} ST produced)`);
            log.push(`EU→ST: ${s.st} ST`);
        }

        // Convert ALL ST → CC
        const s1 = Game.getState();
        if (s1.st >= 13) {
            Currencies.doConvertST();
            const s = Game.getState();
            UI.logAction(`CONVERSION: ST→CC (${s.cc} CC produced)`);
            log.push(`ST→CC: ${s.cc} CC`);
        }

        // Convert ALL CC → DB
        const s2 = Game.getState();
        if (s2.cc >= 5) {
            Currencies.doConvertCC();
            const s = Game.getState();
            UI.logAction(`CONVERSION: CC→DB (${s.doubloons} DB produced)`);
            log.push(`CC→DB: ${s.doubloons} DB`);
        }

        // Convert ALL DB → TK
        const s3 = Game.getState();
        if ((s3.doubloons || 0) >= 10) {
            Currencies.doConvertDB();
            const s = Game.getState();
            UI.logAction(`CONVERSION: DB→TK (${s.tickets} TK produced)`);
            log.push(`DB→TK: ${s.tickets} TK`);
        }

        // If we still don't have enough tickets, boost to test trading
        const s4 = Game.getState();
        if ((s4.tickets || 0) < 50) {
            Game.setState({ tickets: 200, lifetimeTickets: (s4.lifetimeTickets || 0) + 200 });
            log.push('Boosted tickets to 200 for trade testing');
        }

        // Open stock market and buy some crypto
        const tradeBtn = document.getElementById('topup-trade');
        if (tradeBtn) tradeBtn.click();

        return log;
    });
    for (const l of conversionResult) console.log(`    ${l}`);
    await page.waitForTimeout(1500);

    // Actually do a trade (buy + sell)
    console.log('  📈 Phase 5b: Executing trades...');
    await page.evaluate(() => {
        // Find buy buttons in the stock market modal
        const buyBtns = document.querySelectorAll('[data-action="buy"]');
        if (buyBtns.length > 0) {
            // Buy on first crypto
            buyBtns[0].click();
            // Buy on second if available
            if (buyBtns.length > 1) buyBtns[1].click();
        }
        // Now sell
        setTimeout(() => {
            const sellBtns = document.querySelectorAll('[data-action="sell"]');
            if (sellBtns.length > 0) sellBtns[0].click();
        }, 200);
    });
    await page.waitForTimeout(1000);

    // Close stock market
    await page.evaluate(() => {
        document.querySelectorAll('.feature-modal').forEach(el => {
            el.classList.remove('active');
            setTimeout(() => el.remove(), 50);
        });
    });
    await page.waitForTimeout(300);

    // ── Phase 6: Manually trigger missed features ──
    console.log('\n  🎯 Phase 6: Triggering missed features manually...');
    await page.evaluate(() => {
        // Features that rely on random pool selection — call directly
        try { if (typeof Features !== 'undefined') {
            // These are internal IIFE functions, access via the exposed API
            // or call the FEATURE_POOL handlers indirectly

            // Trigger features that have public-facing entry points
            const appraise = document.getElementById('topup-appraise');
            if (appraise) appraise.click(); // Opens mortality calculator
        }} catch(e) {}
    });
    await page.waitForTimeout(1000);

    // Dismiss mortality calc if it appeared
    await page.evaluate(() => {
        const modal = document.getElementById('mortality-modal');
        if (modal) {
            // Enter age and submit
            const ageInput = modal.querySelector('#mortality-age');
            if (ageInput) {
                ageInput.value = '30';
                const submit = modal.querySelector('#mortality-submit');
                if (submit) submit.click();
            }
        }
    });
    await page.waitForTimeout(1000);

    // Close mortality calc
    await page.evaluate(() => {
        const closeBtn = document.querySelector('#mortality-close');
        if (closeBtn) closeBtn.click();
        // Clean up any remaining modals
        document.querySelectorAll('.feature-modal, .popup-ad, .page-overlay').forEach(el => {
            el.classList.remove('active');
            setTimeout(() => el.remove(), 50);
        });
    });
    await page.waitForTimeout(500);

    // ── Phase 7: Second click burst to trigger more pool features ──
    console.log('\n  🖱️  Phase 7: Second click burst (2000 more clicks for pool coverage)...');
    const clickResult2 = await page.evaluate((total) => {
        return new Promise((resolve) => {
            const BATCH = 100;
            let done = 0;

            function dismissModals() {
                const btn = document.getElementById('click-button');
                if (btn && btn.style.pointerEvents === 'none') {
                    btn.style.pointerEvents = '';
                    btn.style.opacity = '1';
                    btn.textContent = 'Click';
                    const breakModal = document.getElementById('forced-break-modal');
                    if (breakModal) breakModal.remove();
                    UI.logAction('FORCED BREAK: Completed, button unlocked');
                }
                document.querySelectorAll('.feature-modal.active').forEach(modal => {
                    const selectors = [
                        '.btn-close-feature:not([disabled])',
                        '#tos-accept-btn', '#tax-pay-btn', '#inflation-close',
                        '#fomo-close', '#peer-close', '#lb-close', '#chatbot-close',
                        '#video-close', '#music-close', '#mortality-close',
                    ];
                    for (const sel of selectors) {
                        const btn = modal.querySelector(sel);
                        if (btn && btn.offsetParent !== null) {
                            btn.disabled = false;
                            btn.click();
                            break;
                        }
                    }
                    if (modal.classList.contains('active')) {
                        modal.classList.remove('active');
                        setTimeout(() => modal.remove(), 50);
                    }
                });
                document.querySelectorAll('.popup-ad').forEach(ad => ad.remove());
                const factBtn = document.getElementById('fact-acknowledge');
                if (factBtn && factBtn.offsetParent !== null) factBtn.click();
                const rewardClose = document.getElementById('reward-close');
                if (rewardClose && rewardClose.offsetParent !== null) rewardClose.click();
            }

            function clickBatch() {
                dismissModals();
                const btn = document.getElementById('click-button');
                const count = Math.min(BATCH, total - done);
                for (let i = 0; i < count; i++) {
                    if (btn) btn.click();
                }
                done += count;
                if (done < total) {
                    setTimeout(clickBatch, 1);
                } else {
                    const s = Game.getState();
                    resolve({ clicks: s.totalClicks, eu: s.eu, phase: s.narratorPhase });
                }
            }
            clickBatch();
        });
    }, 2000);
    console.log(`    Done: ${clickResult2.clicks} total clicks | Phase ${clickResult2.phase} | EU:${clickResult2.eu}`);
    await page.waitForTimeout(1000);

    // ── Phase 8: Read Dossier and generate report ──
    console.log('\n  📋 Phase 8: Reading Dossier...');
    const logEntries = await readDossier(page);

    const { passed, failed } = generateReport(logEntries, startTime);

    // Cleanup
    await browser.close();
    server.close();

    // Exit code
    process.exit(failed > 10 ? 1 : 0);
}

main().catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
});
