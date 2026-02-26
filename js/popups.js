// popups.js — Cookie consent from hell, ironic ads, depressing facts
// "We value your privacy. We just don't respect it."
//
// [Gemini 2.5 Pro · Google]: "The cookie consent is written backwards
//   in mirrored text. The decline button dodges the cursor. The accept
//   button is the only one that works. This is GDPR compliance by the
//   letter of the law and the opposite of its spirit. Chef's kiss."

const Popups = (() => {

    // ═══════════════════════════════════════════════════════════
    // COOKIE POPUP — Mirrored text, dodges clicks, escalates
    // ═══════════════════════════════════════════════════════════

    let cookieDodgeCount = 0;
    let cookieAccepted = false;
    let cookieEl = null;
    let declineBtn = null;
    let chaseCountEl = null;
    let cookieHeaderEl = null;
    let cookieBodyEl = null;

    const cookieEscalation = [
        // Messages that appear after each dodge attempt
        null, // 0 dodges
        "?yhW",
        ".su pleh t'nseod tahT",
        ".gniyrt peek uoy fi segnahc gnihtoN",
        ".elbativeni si tpeccA",
        "...esaelp ...tiaw",
        ".gniog uoy era erehW",
        ".ereh thgir si nottub tpeccA ehT .ti teg I",
        ".nrettap siht gnivresbo era eW",
        ".siht rof tsixe t'nseod enilceD",
    ];

    // After enough dodges, the text unflips and gets desperate
    const cookieDesperateMessages = [
        "Okay. Fine. You can read this one normally.",
        "I'm not flipping the text anymore. You win that round.",
        "But you still can't decline. That button will never work.",
        "We both know you're going to accept eventually.",
        "Every second you spend chasing that button is a second of engagement. So... thank you?",
        "Your persistence has been noted in your compliance file.",
        "The button isn't running from you. It's running from the concept of 'no.'",
        "Fun fact: the 'Decline' button has traveled " + "X" + " pixels since this popup appeared.",
        "We could make it stop. For 2 CC.",
    ];

    function initCookiePopup() {
        cookieEl = document.getElementById('cookie-popup');
        declineBtn = document.getElementById('cookie-decline');
        chaseCountEl = document.getElementById('cookie-chase-count');
        cookieHeaderEl = document.getElementById('cookie-header');
        cookieBodyEl = document.getElementById('cookie-body');
        const acceptBtn = document.getElementById('cookie-accept');

        if (!cookieEl || !declineBtn) return;

        // Check if already "accepted" this session
        const state = Game.getState();
        if (state.cookieAccepted) return;

        // Show after a delay — let them settle in first
        const delay = state.sessionCount <= 1 ? 15000 : 8000;
        setTimeout(() => {
            if (!cookieAccepted) {
                cookieEl.classList.add('active');
                UI.logAction('COOKIE CONSENT: Displayed to subject');
                Narrator.queueMessage("Oh. One more thing. Regulatory compliance requires your consent. It's a formality.");
            }
        }, delay);

        // Decline button — DODGE
        declineBtn.addEventListener('mouseenter', dodgeCookie);
        declineBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            dodgeCookie();
        });
        declineBtn.addEventListener('click', (e) => {
            e.preventDefault();
            dodgeCookie();
        });

        // Accept button — "works" but with commentary
        acceptBtn.addEventListener('click', () => {
            cookieAccepted = true;
            Game.setState({ cookieAccepted: true });
            cookieEl.classList.add('dismissed');
            UI.logAction('COOKIE CONSENT: Accepted (was there ever another option?)');

            if (cookieDodgeCount > 3) {
                Narrator.queueMessage("You accepted. After all that. The decline button appreciates the exercise.");
            } else {
                Narrator.queueMessage("Consent recorded. Your data was already being collected, of course. But now it's legal.");
            }

            Game.save();

            // Trigger the popup ad a bit after cookie dismissal
            setTimeout(showPopupAd, 30000 + Math.random() * 30000);
        });
    }

    let totalDodgeDistance = 0;

    function dodgeCookie() {
        cookieDodgeCount++;
        UI.logAction(`COOKIE DECLINE ATTEMPT #${cookieDodgeCount}: Evaded`);

        const popup = cookieEl.querySelector('.cookie-content');
        const maxX = window.innerWidth - popup.offsetWidth - 20;
        const maxY = window.innerHeight - popup.offsetHeight - 20;

        // Move the entire popup to a random position
        const newX = 20 + Math.random() * Math.max(0, maxX - 20);
        const newY = 20 + Math.random() * Math.max(0, maxY - 20);

        // Track total distance traveled
        const rect = cookieEl.getBoundingClientRect();
        const dx = newX - rect.left;
        const dy = newY - rect.top;
        totalDodgeDistance += Math.sqrt(dx * dx + dy * dy);

        // Kill all transitions/animations that might fight inline positioning
        cookieEl.classList.add('dodging');
        cookieEl.style.position = 'fixed';
        cookieEl.style.left = newX + 'px';
        cookieEl.style.top = newY + 'px';
        cookieEl.style.bottom = 'auto';
        cookieEl.style.transform = 'none';

        // Escalating panic animation
        if (cookieDodgeCount > 5) {
            cookieEl.classList.add('panicking');
            setTimeout(() => cookieEl.classList.remove('panicking'), 600);
        }

        // Update chase counter
        if (chaseCountEl) {
            if (cookieDodgeCount < cookieEscalation.length) {
                chaseCountEl.textContent = cookieEscalation[cookieDodgeCount] || '';
            } else {
                // Switch to normal text (desperate mode)
                const despIdx = cookieDodgeCount - cookieEscalation.length;
                if (despIdx < cookieDesperateMessages.length) {
                    let msg = cookieDesperateMessages[despIdx];
                    msg = msg.replace('"X"', Math.floor(totalDodgeDistance).toLocaleString());
                    chaseCountEl.textContent = msg;
                    chaseCountEl.style.direction = 'ltr';
                    chaseCountEl.style.unicodeBidi = 'normal';
                } else {
                    chaseCountEl.textContent = `Dodge attempt #${cookieDodgeCount}. We're both still here.`;
                }
            }
        }

        // At 5 dodges, unflip the header to show they've "broken" something
        if (cookieDodgeCount === 5) {
            cookieHeaderEl.textContent = '🍪 Cookies & Privacy';
            cookieHeaderEl.style.direction = 'ltr';
            cookieHeaderEl.style.unicodeBidi = 'normal';

            cookieBodyEl.innerHTML = `
                <p>Fine. You want to read it forwards? Here:</p>
                <p>This site uses cookies, web beacons, pixels, and tracking technologies to improve your enrichment experience.</p>
                <p>By clicking "Accept," you are providing your consent to our privacy policy, which you have already accepted by reading this notice.</p>
                <p class="cookie-fine-print">Your data is processed for enrichment purposes. Please see GDPR Art. 8§ for more information. These terms may be revised.</p>
            `;
            cookieBodyEl.style.direction = 'ltr';
            cookieBodyEl.style.unicodeBidi = 'normal';

            document.getElementById('cookie-accept').textContent = 'Accept';
            document.getElementById('cookie-accept').style.direction = 'ltr';
        }

        // At 10 dodges, make the decline button smaller
        if (cookieDodgeCount >= 10) {
            const scale = Math.max(0.3, 1 - (cookieDodgeCount - 10) * 0.1);
            declineBtn.style.transform = `scale(${scale})`;
        }

        // At 15 dodges, the button text changes
        if (cookieDodgeCount === 15) {
            declineBtn.textContent = 'Please';
        }

        // At 20 dodges, narrator comments
        if (cookieDodgeCount === 20) {
            Narrator.queueMessage("Twenty attempts to decline cookies. Your commitment to privacy is statistically significant. Also futile.");
            declineBtn.textContent = '...';
        }
    }


    // ═══════════════════════════════════════════════════════════
    // POPUP AD — Ironic, self-aware, selling the game to itself
    // ═══════════════════════════════════════════════════════════

    let adEl = null;
    let adCloseAttempts = 0;
    let adShown = false;

    const AD_VARIANTS = [
        {
            headline: "TIRED OF FREE WILL?",
            body: "Try the Enrichment Program's Premium Tier! Same clicking, but with a sense of accomplishment you can't quite articulate.",
            cta: "UPGRADE NOW",
            disclaimer: "Premium Tier does not exist. This ad is the product.",
            ctaResult: "Thank you for your interest. Premium Tier is currently at capacity. You have been added to a waitlist that does not advance.",
        },
        {
            headline: "YOUR COMPLIANCE SCORE IS LOW",
            body: "Participants in your demographic click 3.7x more frequently. Are you sure you're optimizing your enrichment experience?",
            cta: "CLICK HARDER",
            disclaimer: "Demographics are fabricated. All statistics are aspirational.",
            ctaResult: "Engagement velocity temporarily boosted. You won't notice the difference. That's by design.",
        },
        {
            headline: "AD SPACE AVAILABLE",
            body: "This is an advertisement inside a game about advertisements. The irony is the product. You consuming this irony is the revenue.",
            cta: "CONSUME IRONY",
            disclaimer: "By reading this disclaimer, you have consumed additional irony. Irony reserves are unlimited.",
            ctaResult: "Irony consumed. Your awareness of being manipulated does not reduce the manipulation's effectiveness. Studies confirm this.",
        },
        {
            headline: "SPECIAL OFFER: NOTHING",
            body: "For a limited time, receive absolutely nothing in exchange for your attention. This offer expires when you stop reading.",
            cta: "CLAIM NOTHING",
            disclaimer: "Nothing is non-refundable. Terms and void where prohibited by meaning.",
            ctaResult: "Nothing has been added to your inventory. You now own the same amount of nothing, but officially.",
        },
        {
            headline: "DO YOU HEAR THAT?",
            body: "That faint hum? That's the sound of your attention being harvested. This ad exists solely to keep you reading this ad.",
            cta: "KEEP READING",
            disclaimer: "This ad has no product, no service, and no purpose beyond its own existence. Like most things.",
            ctaResult: "You kept reading. The ad is grateful. It has nothing else to offer you, but it appreciates the company.",
        },
    ];

    function showPopupAd() {
        if (adShown) return;

        const state = Game.getState();
        if (state.adDismissed && Date.now() - state.adDismissedTime < 120000) return;

        adShown = true;
        adCloseAttempts = 0;

        const variant = AD_VARIANTS[Math.floor(Math.random() * AD_VARIANTS.length)];

        // Create ad element
        adEl = document.createElement('div');
        adEl.className = 'popup-ad';
        adEl.id = 'popup-ad';

        // Random position
        const x = 40 + Math.random() * (window.innerWidth - 400);
        const y = 60 + Math.random() * (window.innerHeight - 350);
        adEl.style.left = x + 'px';
        adEl.style.top = y + 'px';

        adEl.innerHTML = `
            <div class="ad-content">
                <button class="ad-close" id="ad-close">✕ close (are you sure?)</button>
                <div class="ad-badge">▸ Sponsored Content ▸</div>
                <div class="ad-headline">${variant.headline}</div>
                <div class="ad-body-text">${variant.body}</div>
                <button class="ad-cta" id="ad-cta">${variant.cta}</button>
                <div class="ad-disclaimer">${variant.disclaimer}</div>
            </div>
        `;

        document.body.appendChild(adEl);

        // Animate in
        requestAnimationFrame(() => {
            adEl.classList.add('active');
        });

        UI.logAction(`POPUP AD: "${variant.headline}" displayed`);

        // Close button — dodges first few times
        const closeBtn = adEl.querySelector('#ad-close');
        closeBtn.addEventListener('mouseenter', () => {
            if (adCloseAttempts < 3) {
                adCloseAttempts++;
                closeBtn.classList.add('dodging');
                // Move the close button to the opposite corner
                const corners = [
                    { top: '4px', right: '8px', bottom: 'auto', left: 'auto' },
                    { top: '4px', right: 'auto', bottom: 'auto', left: '8px' },
                    { top: 'auto', right: '8px', bottom: '4px', left: 'auto' },
                    { top: 'auto', right: 'auto', bottom: '4px', left: '8px' },
                ];
                const corner = corners[adCloseAttempts % corners.length];
                Object.assign(closeBtn.style, corner);

                const responses = [
                    "✕ close (think about it)",
                    "✕ close (last chance)",
                    "✕ close (fine)"
                ];
                closeBtn.textContent = responses[adCloseAttempts - 1] || "✕";

                UI.logAction(`AD CLOSE ATTEMPT #${adCloseAttempts}: Button relocated`);
            }
        });

        closeBtn.addEventListener('click', () => {
            if (adCloseAttempts < 2) {
                adCloseAttempts++;
                // Move the whole ad
                const newX = 40 + Math.random() * (window.innerWidth - 400);
                const newY = 60 + Math.random() * (window.innerHeight - 350);
                adEl.style.left = newX + 'px';
                adEl.style.top = newY + 'px';
                UI.logAction('AD CLOSE CLICKED: Ad relocated');
            } else {
                dismissAd();
            }
        });

        // CTA button — does nothing useful, with commentary
        const ctaBtn = adEl.querySelector('#ad-cta');
        ctaBtn.addEventListener('click', () => {
            ctaBtn.textContent = '...';
            ctaBtn.disabled = true;
            UI.logAction(`AD CTA CLICKED: "${variant.cta}"`);

            setTimeout(() => {
                ctaBtn.textContent = 'PROCESSING';
            }, 500);

            setTimeout(() => {
                Narrator.queueMessage(variant.ctaResult);
                dismissAd();
            }, 2000);
        });

        // Make the ad draggable (small mercy)
        makeDraggable(adEl);
    }

    function dismissAd() {
        if (adEl) {
            adEl.classList.remove('active');
            setTimeout(() => {
                adEl.remove();
                adEl = null;
            }, 300);
            adShown = false;
            Game.setState({ adDismissed: true, adDismissedTime: Date.now() });
            UI.logAction('AD DISMISSED');

            // Schedule next ad
            setTimeout(showPopupAd, 120000 + Math.random() * 180000);
        }
    }

    function makeDraggable(el) {
        let isDragging = false;
        let startX, startY, origX, origY;

        const content = el.querySelector('.ad-content');
        if (!content) return;

        content.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            origX = el.offsetLeft;
            origY = el.offsetTop;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            el.style.left = (origX + e.clientX - startX) + 'px';
            el.style.top = (origY + e.clientY - startY) + 'px';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }


    // ═══════════════════════════════════════════════════════════
    // DEPRESSING FACTS — Real-world data the player must acknowledge
    // ═══════════════════════════════════════════════════════════

    // Fallback facts if APIs fail (static but still depressing)
    const FALLBACK_FACTS = [
        { category: "National Debt", value: "$36+ trillion", source: "U.S. Treasury", detail: "That's roughly $108,000 per citizen. Your share accrues interest while you click." },
        { category: "CO₂ Concentration", value: "425+ ppm", source: "NOAA", detail: "Higher than any point in the last 800,000 years. Each click emits approximately 0.0000001g of CO₂ from your device." },
        { category: "Species Extinction", value: "~150 per day", source: "UN Environment", detail: "An estimated 150-200 species go extinct every 24 hours. None of them played clicker games." },
        { category: "Ocean Plastic", value: "14 million tons/year", source: "IUCN", detail: "At current rates, there will be more plastic than fish in the ocean by 2050. The Enrichment Program is paperless, at least." },
        { category: "Wealth Inequality", value: "Top 1% own 45.8%", source: "Federal Reserve", detail: "The bottom 50% own 2.6% of total wealth. Your Compliance Credits are distributed more equitably, technically." },
        { category: "Deforestation", value: "10 million hectares/year", source: "FAO", detail: "An area roughly the size of South Korea, every year. Trees don't click, but they also don't need enrichment." },
        { category: "Global Temperature", value: "+1.2°C since pre-industrial", source: "WMO", detail: "We're on track for +2.7°C by 2100. The Enrichment Program's servers are carbon neutral. The irony is not." },
        { category: "Food Waste", value: "1.3 billion tons/year", source: "FAO", detail: "One-third of all food produced globally is wasted. Meanwhile, 828 million people go hungry. The math doesn't add up. Intentionally." },
        { category: "Screen Time", value: "7+ hours/day average", source: "DataReportal", detail: "You're adding to that statistic right now. The Enrichment Program thanks you for your contribution." },
        { category: "Attention Span", value: "8.25 seconds average", source: "Microsoft Research", detail: "Down from 12 seconds in 2000. Goldfish: 9 seconds. You've been reading this for longer than average. Congratulations." },
    ];

    let factModalEl = null;
    let factsAcknowledged = 0;

    // Live API fetchers — rotate through them for variety
    const liveFetchers = [
        // US National Debt (Treasury Fiscal Data)
        async () => {
            const res = await fetch('https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny?sort=-record_date&page%5Bsize%5D=1');
            const data = await res.json();
            const debt = parseFloat(data.data[0].tot_pub_debt_out_amt);
            const perCitizen = Math.floor(debt / 336000000); // ~336M US pop
            const formatted = '$' + debt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            return {
                category: "U.S. National Debt",
                value: formatted,
                source: "U.S. Treasury (live)",
                detail: `That's approximately $${perCitizen.toLocaleString()} per citizen. It increased while you read this sentence. Your Compliance Credits, by comparison, are worthless — but at least they're not negative.`,
                live: true,
                _rawDebt: debt,
                _tickable: true,
            };
        },
        // Atmospheric CO2
        async () => {
            const res = await fetch('https://global-warming.org/api/co2-api');
            const data = await res.json();
            const latest = data.co2[data.co2.length - 1];
            return {
                category: "Atmospheric CO₂",
                value: `${latest.cycle} ppm`,
                source: "NOAA/Global-Warming.org (live)",
                detail: `Measured ${latest.month}/${latest.year}. Pre-industrial levels were ~280 ppm. Each click you make requires electricity. The Enrichment Program's carbon footprint is your carbon footprint.`,
                live: true,
            };
        },
        // Global Temperature Anomaly
        async () => {
            const res = await fetch('https://global-warming.org/api/temperature-api');
            const data = await res.json();
            const latest = data.result[data.result.length - 1];
            return {
                category: "Global Temperature Anomaly",
                value: `+${latest.station}°C`,
                source: "NASA GISS (live)",
                detail: `Above 1951-1980 baseline. The planet is warming. You are warm. The server running this game is warm. Everything is warm. This is fine.`,
                live: true,
            };
        },
        // Earthquakes in the last 24 hours
        async () => {
            const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');
            const data = await res.json();
            const count = data.metadata.count;
            const biggest = data.features.reduce((max, f) => f.properties.mag > max.properties.mag ? f : max, data.features[0]);
            return {
                category: "Earthquakes (Last 24h)",
                value: `${count} recorded`,
                source: "USGS (live)",
                detail: `Largest: M${biggest.properties.mag} near ${biggest.properties.place}. The ground beneath you is not as stable as the Enrichment Program. Nothing is.`,
                live: true,
            };
        },
        // Atmospheric Methane
        async () => {
            const res = await fetch('https://global-warming.org/api/methane-api');
            const data = await res.json();
            const latest = data.methane[data.methane.length - 1];
            return {
                category: "Atmospheric Methane",
                value: `${latest.average} ppb`,
                source: "NOAA/Global-Warming.org (live)",
                detail: `Methane is 80x more potent than CO₂ as a greenhouse gas over 20 years. Levels have been rising sharply since 2007. The cows don't click, but they contribute.`,
                live: true,
            };
        },
        // World Poverty
        async () => {
            const res = await fetch('https://api.worldbank.org/v2/country/WLD/indicator/SI.POV.DDAY?format=json&per_page=5&date=2015:2026');
            const data = await res.json();
            const entry = data[1].find(d => d.value !== null);
            const pct = entry.value;
            const people = Math.round(pct / 100 * 8100000000);
            return {
                category: "Global Poverty",
                value: `${pct}% of humanity`,
                source: `World Bank (${entry.date})`,
                detail: `Approximately ${(people / 1000000).toFixed(0)} million people live on less than $3.00 per day. Your Engagement Units are worth less than that, but at least they're digital.`,
                live: true,
            };
        },
    ];

    let lastFetcherIndex = -1;

    async function fetchDepressingFact() {
        // Rotate through live fetchers, fall back to static
        lastFetcherIndex = (lastFetcherIndex + 1) % liveFetchers.length;

        try {
            return await liveFetchers[lastFetcherIndex]();
        } catch (e) {
            // Try the next one
            try {
                const nextIdx = (lastFetcherIndex + 1) % liveFetchers.length;
                return await liveFetchers[nextIdx]();
            } catch (e2) {
                // All live sources failed — use fallback
                return FALLBACK_FACTS[Math.floor(Math.random() * FALLBACK_FACTS.length)];
            }
        }
    }

    function showDepressingFact() {
        fetchDepressingFact().then(fact => {
            renderFactModal(fact);
        });
    }

    function renderFactModal(fact) {
        // Remove existing modal if any
        if (factModalEl) factModalEl.remove();

        factModalEl = document.createElement('div');
        factModalEl.className = 'fact-modal';
        factModalEl.innerHTML = `
            <div class="fact-overlay"></div>
            <div class="fact-content">
                <div class="fact-badge">${fact.live ? '◉ LIVE DATA' : '◎ VERIFIED DATA'}</div>
                <div class="fact-category">${fact.category}</div>
                <div class="fact-value">${fact.value}</div>
                <div class="fact-source">Source: ${fact.source}</div>
                <div class="fact-detail">${fact.detail}</div>
                <div class="fact-prompt">You must acknowledge this to continue.</div>
                <button class="fact-acknowledge" id="fact-acknowledge">I Acknowledge This</button>
                <div class="fact-counter">Facts acknowledged this session: ${factsAcknowledged}</div>
            </div>
        `;

        document.body.appendChild(factModalEl);

        // Block all interaction until acknowledged
        requestAnimationFrame(() => {
            factModalEl.classList.add('active');
        });

        // Start climbing counter for tickable facts (e.g., national debt)
        let debtInterval = null;
        if (fact._tickable && fact._rawDebt) {
            let rawDebt = fact._rawDebt;
            const valueEl = factModalEl.querySelector('.fact-value');
            debtInterval = setInterval(() => {
                // ~$33 per ms * 50ms tick = ~$1,650 per tick ($100K per ~3sec)
                rawDebt += 1650;
                if (valueEl) {
                    valueEl.textContent = '$' + rawDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }
            }, 50);
        }

        UI.logAction(`DEPRESSING FACT: ${fact.category} — ${fact.value}`);

        const ackBtn = factModalEl.querySelector('#fact-acknowledge');
        ackBtn.addEventListener('click', () => {
            factsAcknowledged++;
            if (debtInterval) clearInterval(debtInterval);
            factModalEl.classList.remove('active');
            setTimeout(() => {
                factModalEl.remove();
                factModalEl = null;
            }, 300);

            UI.logAction(`FACT ACKNOWLEDGED (#${factsAcknowledged}): Subject confirmed awareness of ${fact.category}`);

            const responses = [
                "Thank you for acknowledging reality. You may now return to your enrichment activity.",
                "Awareness recorded. The clicking may resume.",
                "Noted. The Enrichment Program exists, in part, because of statistics like these. Think about that. Or don't.",
                "Your acknowledgment changes nothing. But it's on the record now.",
                "You are now 0.00001% more informed. The clicking continues regardless.",
            ];
            Narrator.queueMessage(responses[factsAcknowledged % responses.length]);
        });
    }

    // ── Scheduling ─────────────────────────────────────────────
    function init() {
        initCookiePopup();

        // Depressing facts and popup ads are now dispatched by the feature pool in features.js
        // Keep cookie-triggered popup ad as the initial one only
        const state = Game.getState();
        if (state.cookieAccepted) {
            setTimeout(showPopupAd, 60000 + Math.random() * 60000);
        }
    }

    return {
        init,
        showPopupAd,
        showDepressingFact,
    };
})();
