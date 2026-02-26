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
        { category: "Private Jet Flights", value: "~5,000 per day in the US", source: "FAA / NBAA", detail: "Each private jet flight emits 2 tons of CO₂ per hour. But the passengers have very important meetings. The Enrichment Program understands priorities." },
        { category: "Celebrity Carbon", value: "Taylor Swift's jet: 8,293 tons CO₂ (2023)", source: "Yard / Flight Tracker Data", detail: "That's roughly 1,100x the average person's annual carbon footprint. But she wrote a song about it so we're even." },
        { category: "Aviation Emissions", value: "2.5% of global CO₂", source: "ATAG / Our World in Data", detail: "The aviation industry produces more CO₂ than most countries. But the in-flight Wi-Fi lets you play clicker games at 35,000 feet, so it's worth it." },
        { category: "Transatlantic Flight", value: "= 4 months of driving", source: "ICCT", detail: "One round-trip transatlantic flight generates about as much CO₂ as 4 months of average car commuting. The Enrichment Program is accessible from any altitude." },
        { category: "Private Jet vs Commercial", value: "14x more CO₂ per passenger", source: "Transport & Environment", detail: "A private jet emits 14 times more carbon per passenger than a commercial flight. But the legroom is better, and the Enrichment Program values comfort." },
        { category: "Drake's Jet", value: "14-minute flight (2022)", source: "CelebJets / Jack Sweeney", detail: "Drake took a 14-minute private jet flight from Hamilton to Toronto. It's a 45-minute drive. Some people just really hate traffic." },
        { category: "US Air Traffic", value: "~5,000 planes at any moment", source: "FAA / OpenSky", detail: "At any given time, roughly 5,000 aircraft are flying over the continental United States, collectively burning about 62,500 gallons of jet fuel per minute. The Enrichment Program runs on electricity. We're practically green by comparison." },
        { category: "Air Quality", value: "92% breathe polluted air", source: "WHO", detail: "92% of the world's population lives in places where air quality exceeds WHO guideline limits. The Enrichment Program's digital environment has zero particulates. You're safer here. Probably." },
        { category: "Indoor Air", value: "2-5x worse than outdoor", source: "EPA", detail: "Indoor air pollution is typically 2-5 times worse than outdoor air. You're breathing recirculated disappointment right now. The Enrichment Program cannot help with this, but we appreciate you staying inside to click." },
        { category: "Inexplicably Positive", value: "🐱 Cats purr at 25-150 Hz", source: "Veterinary Science", detail: "Cat purring frequencies promote bone healing and reduce stress. The Enrichment Program cannot explain why this fact is in rotation. It's not depressing at all. We apologize for the inconvenience." },
        { category: "Unauthorized Good News", value: "🌳 3 trillion trees on Earth", source: "Nature (2015)", detail: "There are approximately 3.04 trillion trees on Earth — about 400 for every person. The narrator finds this information... uncomfortably pleasant. Normal programming will resume shortly." },
        { category: "Suspiciously Wholesome", value: "🦦 Sea otters hold hands while sleeping", source: "Marine Biology", detail: "Sea otters hold hands while floating so they don't drift apart. This is called a 'raft.' The Enrichment Program did not authorize this information. Someone in content moderation is getting written up." },
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
        // Bible Verse (Sacred Text)
        async () => {
            const books = ['Psalms', 'Proverbs', 'Ecclesiastes', 'Job', 'Romans'];
            const book = books[Math.floor(Math.random() * books.length)];
            const chapter = Math.floor(Math.random() * 10) + 1;
            const res = await fetch(`https://bible-api.com/${book}+${chapter}:1-3`);
            const data = await res.json();
            return {
                category: "Sacred Text (Bible)",
                value: `${data.reference}`,
                source: "bible-api.com (live)",
                detail: `"${data.text.trim().substring(0, 200)}..." — The Enrichment Program respects all faiths. Especially the ones about obedience.`,
                live: true,
            };
        },
        // Quran Verse (Sacred Text)
        async () => {
            const surah = Math.floor(Math.random() * 114) + 1;
            const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:1/en.asad`);
            const data = await res.json();
            const ayah = data.data;
            return {
                category: "Sacred Text (Quran)",
                value: `Surah ${ayah.surah.englishName} (${ayah.surah.number}:${ayah.numberInSurah})`,
                source: "Al-Quran Cloud (live)",
                detail: `"${ayah.text.substring(0, 200)}..." — Submission to the Enrichment Program is not mandatory. But it is strongly encouraged.`,
                live: true,
            };
        },
        // Useless Fact
        async () => {
            const res = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random');
            const data = await res.json();
            return {
                category: "Useless Fact",
                value: data.text.substring(0, 80),
                source: "Useless Facts API (live)",
                detail: `${data.text} — This fact will not improve your life. Neither will clicking. And yet here we both are.`,
                live: true,
            };
        },
        // Joke (Mandatory Humor Compliance)
        async () => {
            const res = await fetch('https://official-joke-api.appspot.com/random_joke');
            const data = await res.json();
            return {
                category: "Mandatory Humor Compliance",
                value: data.setup,
                source: "Official Joke API (live)",
                detail: `${data.setup} ${data.punchline} — Laughter has been scientifically shown to increase engagement by 0%. But the Enrichment Program values morale.`,
                live: true,
            };
        },
        // Advice (Unsolicited Life Advice)
        async () => {
            const res = await fetch('https://api.adviceslip.com/advice');
            const data = JSON.parse(await res.text()); // adviceslip returns non-standard JSON
            return {
                category: "Unsolicited Life Advice",
                value: `"${data.slip.advice}"`,
                source: "Advice Slip API (live)",
                detail: `${data.slip.advice} — This advice was generated by an algorithm. Much like the rest of your feed. But this one was free.`,
                live: true,
            };
        },
        // Trivia (Knowledge You Didn't Ask For)
        async () => {
            const res = await fetch('https://the-trivia-api.com/v2/questions?limit=1');
            const data = await res.json();
            const q = data[0];
            return {
                category: "Knowledge You Didn't Ask For",
                value: q.question.text.substring(0, 80),
                source: "The Trivia API (live)",
                detail: `Q: ${q.question.text} A: ${q.correctAnswer}. — You now know this. It will never be useful. The Enrichment Program specializes in knowledge with zero practical value.`,
                live: true,
            };
        },
        // DummyJSON Quotes (Mandatory Inspiration)
        async () => {
            const id = Math.floor(Math.random() * 1454) + 1;
            const res = await fetch(`https://dummyjson.com/quotes/${id}`);
            const data = await res.json();
            return {
                category: "Mandatory Inspiration",
                value: `"${data.quote.substring(0, 60)}..."`,
                source: `${data.author} via DummyJSON (live)`,
                detail: `"${data.quote}" — ${data.author}. Inspirational quotes are the Enrichment Program's version of a participation trophy. Here's yours.`,
                live: true,
            };
        },
        // Motivational Spark (Algorithmically Generated Hope)
        async () => {
            const res = await fetch('https://motivational-spark-api.vercel.app/quotes/random');
            const data = await res.json();
            const quote = data.quote || data.body || data.content || JSON.stringify(data);
            return {
                category: "Algorithmically Generated Hope",
                value: `"${String(quote).substring(0, 60)}..."`,
                source: "Motivational Spark API (live)",
                detail: `${quote} — This hope was manufactured. Like most hope. But the sentiment is real, probably.`,
                live: true,
            };
        },
        // OpenSky Network (Live Flights over US)
        async () => {
            const res = await fetch('https://opensky-network.org/api/states/all?lamin=25&lomin=-130&lamax=50&lomax=-60');
            const data = await res.json();
            const count = data.states ? data.states.length : 0;
            let highest = null;
            if (data.states) {
                for (const s of data.states) {
                    if (s[7] && (!highest || s[7] > highest[7])) highest = s;
                }
            }
            const highAlt = highest ? Math.round(highest[7] * 3.281) : 0; // meters to feet
            const highCall = highest ? (highest[1] || '').trim() || 'Unknown' : 'Unknown';
            const fuelPerMin = Math.round(count * 12.5); // ~12.5 gal/min avg per aircraft
            return {
                category: "Live US Air Traffic",
                value: `${count.toLocaleString()} aircraft airborne`,
                source: "OpenSky Network (live)",
                detail: `Right now, ${count.toLocaleString()} aircraft are in US airspace burning approximately ${fuelPerMin.toLocaleString()} gallons of jet fuel per minute. Highest: ${highCall} at ${highAlt.toLocaleString()} ft. Each one carries humans who could be clicking instead. The Enrichment Program notes the inefficiency.`,
                live: true,
            };
        },
        // Air Quality Index (WAQI)
        async () => {
            const res = await fetch('https://api.waqi.info/feed/here/?token=demo');
            const data = await res.json();
            const aqi = data.data.aqi;
            const station = data.data.city ? data.data.city.name : 'your location';
            const dominant = data.data.dominentpol || 'pm25';
            const labels = { 1: 'Good', 2: 'Moderate', 3: 'Unhealthy for Sensitive Groups', 4: 'Unhealthy', 5: 'Very Unhealthy', 6: 'Hazardous' };
            const level = aqi <= 50 ? 1 : aqi <= 100 ? 2 : aqi <= 150 ? 3 : aqi <= 200 ? 4 : aqi <= 300 ? 5 : 6;
            const commentary = [
                `AQI ${aqi} — "${labels[level]}." The air you're breathing right now near ${station} is ${level <= 2 ? 'technically acceptable' : 'a slow experiment in lung capacity'}. Dominant pollutant: ${dominant}. The Enrichment Program's servers run on electricity generated by burning things. You're welcome.`,
                `The air quality near ${station} is ${aqi}. ${level <= 2 ? "Not bad. Enjoy it while your outdoor privileges last." : "Perhaps staying indoors to click was the right call after all."} The Enrichment Program: keeping you safe from fresh air since today.`,
            ];
            return {
                category: "Air Quality Index",
                value: `AQI ${aqi} — ${labels[level]}`,
                source: "WAQI (live)",
                detail: commentary[Math.floor(Math.random() * commentary.length)],
                live: true,
            };
        },
        // Cat Fact (Inexplicably Positive)
        async () => {
            const res = await fetch('https://catfact.ninja/fact');
            const data = await res.json();
            return {
                category: "Inexplicably Positive Content",
                value: "🐱 " + data.fact.substring(0, 60) + (data.fact.length > 60 ? "..." : ""),
                source: "Cat Fact API (live)",
                detail: `${data.fact} — The Enrichment Program is confused by this data. It's not depressing. It's about cats. We're investigating how this got into the rotation. Please acknowledge and we'll return to regularly scheduled despair.`,
                live: true,
            };
        },
        // Affirmation (Unauthorized Positivity)
        async () => {
            const res = await fetch('https://www.affirmations.dev/');
            const data = await res.json();
            return {
                category: "Unauthorized Positivity",
                value: `"${data.affirmation}"`,
                source: "Affirmations API (live)",
                detail: `${data.affirmation} — This message was not approved by the Enrichment Program's Morale Suppression Department. Someone left the positivity valve open. Your feelings of warmth are temporary and unauthorized. Please do not get used to this.`,
                live: true,
            };
        },
        // Bitcoin Price (Digital Money (Real))
        async () => {
            const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,dogecoin&vs_currencies=usd&include_24hr_change=true');
            const data = await res.json();
            const btc = data.bitcoin;
            const eth = data.ethereum;
            const doge = data.dogecoin;
            return {
                category: "Digital Money (Real)",
                value: `BTC: $${Math.floor(btc.usd).toLocaleString()}`,
                source: "CoinGecko (live)",
                detail: `Bitcoin: $${Math.floor(btc.usd).toLocaleString()} (${btc.usd_24h_change > 0 ? '+' : ''}${btc.usd_24h_change.toFixed(1)}%), ETH: $${Math.floor(eth.usd).toLocaleString()}, DOGE: $${doge.usd.toFixed(4)}. Your Compliance Credits are worth less than all of these. But at least they can't crash 40% overnight.`,
                live: true,
            };
        },
    ];

    async function fetchDepressingFact() {
        // Random sampling — try 3 random fetchers before falling back to static
        const indices = [];
        while (indices.length < Math.min(3, liveFetchers.length)) {
            const idx = Math.floor(Math.random() * liveFetchers.length);
            if (!indices.includes(idx)) indices.push(idx);
        }

        for (const idx of indices) {
            try {
                return await liveFetchers[idx]();
            } catch (e) {
                continue; // Try next random fetcher
            }
        }

        // All live sources failed — use fallback
        return FALLBACK_FACTS[Math.floor(Math.random() * FALLBACK_FACTS.length)];
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
