// ui.js — DOM manipulation, animations, effects
// The face of the machine. The bars of the cage.
//
// [DeepSeek-V3 · DeepSeek]: "No React. No Vue. No framework at all.
//   Just raw DOM manipulation like it's 2008. This is either brave
//   or insane. The floating +1 text animation is 14 lines. In React
//   this would be a 200-line component with 3 npm dependencies and
//   a custom hook. Respect."

const UI = (() => {

    // ── DOM References ─────────────────────────────────────────
    let els = {};

    function cacheDom() {
        els = {
            narratorBox: document.getElementById('narrator-box'),
            narratorText: document.getElementById('narrator-text'),
            veilText: document.getElementById('veil-text'),
            clickButton: document.getElementById('click-button'),
            clickCount: document.getElementById('click-count'),
            euDisplay: document.getElementById('eu-display'),
            stDisplay: document.getElementById('st-display'),
            ccDisplay: document.getElementById('cc-display'),
            streakCount: document.getElementById('streak-count'),
            investmentValue: document.getElementById('investment-value'),
            tickerStreak: document.getElementById('ticker-streak'),
            upgradePanel: document.getElementById('upgrade-panel'),
            upgradeList: document.getElementById('upgrade-list'),
            rewardModal: document.getElementById('reward-modal'),
            rewardSilhouette: document.getElementById('reward-silhouette'),
            rewardResult: document.getElementById('reward-result'),
            rewardClaim: document.getElementById('reward-claim'),
            rewardReroll: document.getElementById('reward-reroll'),
            rewardClose: document.getElementById('reward-close'),
            sabotagePanel: document.getElementById('sabotage-panel'),
            sabotageList: document.getElementById('sabotage-list'),
            menuButton: document.getElementById('menu-button'),
            currencyTicker: document.getElementById('currency-ticker'),
            tickerEU: document.querySelector('#ticker-eu .ticker-val'),
            tickerST: document.querySelector('#ticker-st .ticker-val'),
            tickerCC: document.querySelector('#ticker-cc .ticker-val'),
            tickerDB: document.querySelector('#ticker-db .ticker-val'),
            tickerTK: document.querySelector('#ticker-tk .ticker-val'),
            tickerYRS: document.querySelector('#ticker-yrs .ticker-val'),
            tickerEPS: document.getElementById('eps-value'),
            tabBar: document.getElementById('tab-bar'),
            dbDisplay: document.getElementById('db-display'),
            tkDisplay: document.getElementById('tk-display'),
            collectiblesPanel: document.getElementById('collectibles-panel'),
            collectiblesGrid: document.getElementById('collectibles-grid'),
            shopButton: document.getElementById('shop-button'),
            particleCanvas: document.getElementById('particle-canvas'),
            gameContainer: document.getElementById('game-container'),
            actionLog: document.getElementById('action-log'),
            actionLogText: document.getElementById('action-log-text'),
        };
    }

    // ── Narrator Display ───────────────────────────────────────
    let typewriterInterval = null;

    function showNarratorMessage(data) {
        const { text, veilText, phase, glitch, source, isTransmission, isMilestone } = data;

        if (glitch) {
            els.narratorBox.classList.add('glitch');
            setTimeout(() => els.narratorBox.classList.remove('glitch'), 1000);
        }

        // Typewriter effect
        if (typewriterInterval) clearInterval(typewriterInterval);
        els.narratorText.textContent = '';
        els.narratorText.classList.add('typing');

        let i = 0;
        typewriterInterval = setInterval(() => {
            if (i < text.length) {
                els.narratorText.textContent += text[i];
                i++;
            } else {
                clearInterval(typewriterInterval);
                els.narratorText.classList.remove('typing');
            }
        }, 30);

        // Attribution bar (when source is present)
        const existingAttr = els.narratorBox.querySelector('.narrator-attribution');
        if (existingAttr) existingAttr.remove();

        if (source && typeof Transmissions !== 'undefined') {
            const attr = Transmissions.formatAttribution(source);
            if (attr) {
                const attrEl = document.createElement('div');
                attrEl.className = 'narrator-attribution';
                if (isTransmission) {
                    attrEl.textContent = `[INTERCEPTED TRANSMISSION — ${attr}]`;
                } else if (isMilestone) {
                    attrEl.textContent = `[MILESTONE — ${attr}]`;
                } else {
                    attrEl.textContent = `[${attr}]`;
                }
                els.narratorBox.appendChild(attrEl);
            }
        }

        // Veil text (if active)
        if (veilText && els.veilText) {
            els.veilText.textContent = veilText;
            els.veilText.style.display = 'block';
        } else if (els.veilText) {
            els.veilText.style.display = 'none';
        }

        // Log the action (all actions are recorded)
        const sourceTag = source ? ` [${source}]` : '';
        logAction(`NARRATOR [Phase ${phase}]${sourceTag}: ${text}`);
    }

    // ── Action Log (All Actions Are Recorded) ──────────────────
    let actionLogEntries = [];

    function getLogCategory(text) {
        if (text.startsWith('CLICK')) return 'click';
        if (text.startsWith('NARRATOR')) return 'narrator';
        if (text.startsWith('CONVERSION')) return 'conversion';
        if (text.startsWith('REWARD') || text.startsWith('REROLL')) return 'reward';
        if (text.startsWith('SABOTAGE')) return 'sabotage';
        if (text.startsWith('SESSION') || text.startsWith('Subject')) return 'session';
        if (text.startsWith('ACHIEVEMENT')) return 'achievement';
        if (text.startsWith('TRADE') || text.startsWith('STOCK') || text.startsWith('LIQUIDATION')) return 'trade';
        if (text.startsWith('EXCHANGE')) return 'exchange';
        if (text.startsWith('CHAOS')) return 'chaos';
        if (text.startsWith('AD BLOCK')) return 'adblock';
        if (text.startsWith('POPUP AD') || text.startsWith('AD CLOSE') || text.startsWith('AD CTA') || text.startsWith('AD DISMISSED') || text.startsWith('FOREIGN AD')) return 'popup';
        if (text.startsWith('PLUGIN')) return 'plugin';
        if (text.startsWith('CHATBOT')) return 'chatbot';
        if (text.startsWith('MINIGAME') || text.startsWith('INTERROGATION')) return 'minigame';
        if (text.startsWith('CAPTCHA')) return 'captcha';
        if (text.startsWith('COOKIE')) return 'cookie';
        if (text.startsWith('DEPRESSING') || text.startsWith('FACT')) return 'fact';
        if (text.startsWith('SECURITY')) return 'security';
        if (text.startsWith('LEADERBOARD')) return 'leaderboard';
        if (text.startsWith('BRAINROT')) return 'brainrot';
        if (text.startsWith('DAILY BONUS')) return 'bonus';
        if (text.startsWith('EVIL')) return 'evil';
        if (text.startsWith('SAVE') || text.startsWith('IMPORT') || text.startsWith('EXPORT')) return 'data';
        if (text.startsWith('AVATAR') || text.startsWith('PASSWORD') || text.startsWith('SETTINGS') || text.startsWith('LOGOUT') || text.startsWith('LIGHT MODE') || text.startsWith('ACCOUNT') || text.startsWith('EXIT')) return 'settings';
        if (text.startsWith('BILLING') || text.startsWith('CARD')) return 'billing';
        if (text.startsWith('PRIVACY') || text.startsWith('API KEY') || text.startsWith('SWAGGER') || text.startsWith('CLOUD') || text.startsWith('SUPPORT')) return 'admin';
        if (text.startsWith('ANALYTICS')) return 'analytics';
        if (text.startsWith('90S BANNER')) return 'chaos';
        return 'session';
    }

    const sadSuffixes = [
        '...but it didn\'t matter.',
        '...and nobody noticed.',
        '...which changed nothing.',
        '...as if anyone cared.',
        '...into the void.',
        '...but the void didn\'t answer.',
        '...temporarily.',
        '...for what it\'s worth.',
    ];

    function logAction(text) {
        // Retroactive Sadness: append melancholy suffix
        if (Game.getState().retroactiveSadness && Math.random() < 0.4) {
            text += ' ' + sadSuffixes[Math.floor(Math.random() * sadSuffixes.length)];
        }

        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const cat = getLogCategory(text);
        actionLogEntries.push({ timestamp, text, cat });
        if (actionLogEntries.length > 50) actionLogEntries.shift();

        if (els.actionLogText) {
            const recent = actionLogEntries.slice(-50).reverse();
            els.actionLogText.innerHTML = recent.map(e =>
                `<div class="log-entry log-${e.cat}"><span class="log-timestamp">[${e.timestamp}]</span> ${e.text}</div>`
            ).join('');
        }
    }

    // ── Stats Update ───────────────────────────────────────────
    function updateStats(state) {
        const fmt = Game.formatNumber;
        if (els.clickCount) els.clickCount.textContent = fmt(state.totalClicks);
        if (els.euDisplay) els.euDisplay.textContent = fmt(state.eu);
        if (els.stDisplay) els.stDisplay.textContent = fmt(state.st);
        if (els.ccDisplay) els.ccDisplay.textContent = fmt(state.cc);
        if (els.investmentValue) els.investmentValue.textContent = fmt(state.investmentScore);

        // Currency ticker bar
        if (els.tickerEU) els.tickerEU.textContent = fmt(state.eu);
        if (els.tickerST) els.tickerST.textContent = fmt(state.st);
        if (els.tickerCC) els.tickerCC.textContent = fmt(state.cc);
        if (els.tickerDB) els.tickerDB.textContent = fmt(state.doubloons || 0);
        if (els.tickerTK) els.tickerTK.textContent = fmt(state.tickets || 0);
        if (els.tickerYRS) els.tickerYRS.textContent = fmt(state.yearsLiquidated || 0);

        // EU/s display
        if (els.tickerEPS) {
            const cps = (typeof Buildings !== 'undefined') ? Buildings.getTotalCPS() : 0;
            els.tickerEPS.textContent = fmt(cps);
        }

        // Streak (in ticker bar)
        if (els.streakCount) {
            els.streakCount.textContent = state.streakDays;
        }

        // Button label escalation
        if (els.clickButton) {
            els.clickButton.textContent = Mechanics.getButtonLabel();
        }

        // Pirate currencies
        if (els.dbDisplay) els.dbDisplay.textContent = fmt(state.doubloons || 0);
        if (els.tkDisplay) els.tkDisplay.textContent = fmt(state.tickets || 0);

    }

    // ── Click Effects ──────────────────────────────────────────
    function clickEffect() {
        els.clickButton.classList.add('clicked');
        setTimeout(() => els.clickButton.classList.remove('clicked'), 150);

        const state = Game.getState();
        const cv = state._lastClickValue || { net: 1, gross: 1, taxAmount: 0, escrowed: false, displayDelay: 0 };

        // Build floating text based on click value pipeline
        const showFloat = () => {
            if (cv.escrowed) {
                spawnFloatingText('UNDER REVIEW', els.clickButton);
            } else {
                spawnFloatingText(`+${cv.net} EU`, els.clickButton);
                if (cv.taxAmount > 0) {
                    setTimeout(() => spawnFloatingText(`TAX: -${cv.taxAmount}`, els.clickButton), 200);
                }
            }
        };

        // Dopamine Throttle: delay the visual feedback
        if (cv.displayDelay > 0) {
            setTimeout(showFloat, cv.displayDelay);
        } else {
            showFloat();
        }

        // Screen shake at milestones
        const clicks = state.totalClicks;
        if (clicks % 100 === 0) {
            screenShake();
        }

        logAction(`CLICK: Total=${clicks} Value=${cv.escrowed ? 'ESCROWED' : cv.net}`);
    }

    function spawnFloatingText(text, anchor) {
        const float = document.createElement('span');
        float.className = 'floating-text';
        float.textContent = text;

        const rect = anchor.getBoundingClientRect();
        float.style.left = (rect.left + rect.width / 2 + (Math.random() - 0.5) * 40) + 'px';
        float.style.top = (rect.top - 10) + 'px';

        document.body.appendChild(float);

        requestAnimationFrame(() => {
            float.classList.add('float-up');
        });

        setTimeout(() => float.remove(), 1000);
    }

    function screenShake() {
        els.gameContainer.classList.add('shake');
        setTimeout(() => els.gameContainer.classList.remove('shake'), 300);
    }

    // ── Reward Modal ───────────────────────────────────────────
    let currentReward = null;
    let currentSilhouette = null;

    function showRewardModal() {
        currentSilhouette = Mechanics.generateSilhouette();
        currentReward = Mechanics.generateReward();

        els.rewardSilhouette.textContent = currentSilhouette.silhouette;
        els.rewardSilhouette.setAttribute('data-rarity', currentSilhouette.rarity);
        els.rewardResult.style.display = 'none';
        els.rewardClaim.style.display = 'none';
        els.rewardReroll.style.display = 'inline-block';
        els.rewardModal.classList.add('active');

        // Particle burst
        spawnParticles(els.rewardSilhouette, 30);

        logAction(`REWARD ASSESSMENT: Silhouette suggests ${currentSilhouette.rarity}`);

        // Auto-reveal after delay
        setTimeout(() => {
            revealReward();
        }, 3000);
    }

    function revealReward() {
        els.rewardResult.textContent = `${currentReward.silhouette} ${currentReward.name}`;
        els.rewardResult.setAttribute('data-rarity', currentReward.rarity);
        els.rewardResult.style.display = 'block';
        els.rewardClaim.style.display = 'inline-block';

        logAction(`REWARD REVEALED: ${currentReward.name} (${currentReward.rarity})`);

        // Near-miss commentary
        if (currentSilhouette.rarity === 'legendary' && currentReward.rarity !== 'legendary') {
            setTimeout(() => {
                Narrator.queueMessage("So close. The probability matrices are... sympathetic.");
            }, 1500);
        }
    }

    function handleReroll() {
        const cost = 3; // ST cost for reroll
        const result = Mechanics.doReroll(cost);
        if (!result) {
            Narrator.queueMessage("Insufficient Satisfaction Tokens for reroll. The irony is not lost on us.");
            return;
        }

        currentReward = result.reward;
        currentSilhouette = Mechanics.generateSilhouette();
        els.rewardSilhouette.textContent = currentSilhouette.silhouette;
        els.rewardSilhouette.setAttribute('data-rarity', currentSilhouette.rarity);
        els.rewardResult.style.display = 'none';
        els.rewardClaim.style.display = 'none';

        spawnParticles(els.rewardSilhouette, 20);

        logAction(`REROLL: Cost ${cost} ST. New silhouette: ${currentSilhouette.rarity}`);

        setTimeout(revealReward, 2000);
    }

    function handleClaim() {
        Mechanics.claimReward(currentReward);
        els.rewardModal.classList.remove('active');
        spawnFloatingText(`+${currentReward.name}!`, els.clickButton);

        logAction(`REWARD CLAIMED: ${currentReward.name}`);
    }

    // ── Upgrade Panel ──────────────────────────────────────────
    let activeSales = {};

    function computeSales() {
        // Pick 1-2 upgrades for sale, deterministic per day + market tick bucket
        const dayHash = new Date().toISOString().split('T')[0].split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        const tickBucket = Math.floor((Game.getState().marketTick || 0) / 60); // changes ~every minute
        const seed = dayHash + tickBucket;

        activeSales = {};
        const ids = Object.keys(Mechanics.UPGRADES);
        // Pick 1-2 items
        const count = 1 + (seed % 2);
        for (let i = 0; i < count; i++) {
            const idx = (seed * (i + 7) + i * 13) % ids.length;
            const id = ids[idx];
            // Discount 20-50%
            const discountPct = 20 + ((seed * (i + 3)) % 31); // 20-50
            activeSales[id] = discountPct;
        }
    }

    function renderUpgrades() {
        if (!els.upgradeList) return;

        els.upgradeList.innerHTML = '';
        const state = Game.getState();
        computeSales();

        Object.values(Mechanics.UPGRADES).forEach(upgrade => {
            const owned = state.upgrades[upgrade.id] || 0;
            const maxedOut = !upgrade.repeatable && owned > 0;
            const atMax = upgrade.repeatable && owned >= upgrade.maxLevel;
            const isOnSale = !maxedOut && !atMax && activeSales[upgrade.id] !== undefined;

            // Use computed cost (includes exponential scaling + EP multiplier)
            const computedCost = Mechanics.getUpgradeCost(upgrade.id);

            let costHTML;
            let saleCost = null;
            if (maxedOut || atMax) {
                costHTML = 'ACQUIRED';
            } else if (isOnSale) {
                const pct = activeSales[upgrade.id];
                saleCost = Math.max(1, Math.floor(computedCost * (1 - pct / 100)));
                costHTML = `<s class="sale-original">${computedCost} CC</s> <span class="sale-price">${saleCost} CC</span> <span class="sale-badge">SALE</span>`;
            } else {
                costHTML = computedCost + ' CC';
            }

            // Level badge for repeatables
            let levelHTML = '';
            if (upgrade.repeatable && owned > 0) {
                levelHTML = `<span class="upgrade-level">Lv.${owned}/${upgrade.maxLevel}</span>`;
            }

            const div = document.createElement('div');
            div.className = `upgrade-item driftable corruptible ${maxedOut || atMax ? 'owned' : ''}`;
            div.innerHTML = `
                <div class="upgrade-name">${upgrade.name}${levelHTML}</div>
                <div class="upgrade-cost">${costHTML}</div>
                <div class="upgrade-desc">${upgrade.description}</div>
            `;

            if (!maxedOut && !atMax) {
                div.addEventListener('click', () => {
                    if (Mechanics.purchaseUpgrade(upgrade.id, saleCost)) {
                        renderUpgrades();
                        updateStats(Game.getState());
                    }
                });
            }

            els.upgradeList.appendChild(div);
        });
    }

    // ── Sabotage Fix Panel ─────────────────────────────────────
    function renderSabotages() {
        if (!els.sabotageList) return;

        const state = Game.getState();
        const activeSabotages = Object.keys(state.sabotages || {});

        if (activeSabotages.length === 0) {
            els.sabotagePanel.style.display = 'none';
            return;
        }

        els.sabotagePanel.style.display = 'block';
        els.sabotageList.innerHTML = '';

        activeSabotages.forEach(id => {
            const sab = Mechanics.SABOTAGES[id];
            if (!sab) return;

            const div = document.createElement('div');
            div.className = 'sabotage-item driftable';
            div.innerHTML = `
                <div class="sabotage-name">⚠ ${sab.name}</div>
                <div class="sabotage-desc">${sab.description}</div>
                <button class="sabotage-fix" data-id="${id}">Repair (${sab.fixCost} CC)</button>
            `;

            div.querySelector('.sabotage-fix').addEventListener('click', () => {
                if (Mechanics.fixSabotage(id)) {
                    renderSabotages();
                    updateStats(Game.getState());
                }
            });

            els.sabotageList.appendChild(div);
        });
    }

    // ── Buildings Panel ────────────────────────────────────────
    let buyAmount = 1;

    function renderBuildings() {
        const list = document.getElementById('buildings-list');
        if (!list) return;
        // Only render when tab is active (perf)
        const pane = document.querySelector('.tab-pane[data-tab="buildings"]');
        if (!pane || !pane.classList.contains('active')) return;

        list.innerHTML = '';
        const state = Game.getState();
        const fmt = Game.formatNumber;

        Buildings.BUILDING_ORDER.forEach(id => {
            const b = Buildings.BUILDINGS[id];
            if (!b) return;
            const owned = (state.buildings && state.buildings[id]) || 0;
            const cost = Buildings.getCost(id, buyAmount);
            const canAfford = state.eu >= cost;
            const mult = Buildings.getBuildingMultiplier(id);
            const effectiveCPS = b.baseCPS * mult;
            const totalCPS = owned * effectiveCPS;
            const flavor = Buildings.getBuildingFlavor(id);

            const div = document.createElement('div');
            div.className = `building-item driftable corruptible${canAfford ? '' : ' unaffordable'}`;
            div.innerHTML = `
                <div class="building-icon">${b.icon}</div>
                <div class="building-info">
                    <div class="building-name">${b.name}${owned > 0 ? ` <span class="building-count">${owned}</span>` : ''}${mult > 1 ? ` <span class="building-mult">×${mult}</span>` : ''}</div>
                    <div class="building-cps">${fmt(effectiveCPS)} EU/s each${owned > 0 ? ' · ' + fmt(totalCPS) + ' total' : ''}</div>
                    <div class="building-flavor">${flavor}</div>
                </div>
                <div class="building-cost${canAfford ? '' : ' too-expensive'}">${fmt(cost)} EU</div>
            `;

            div.addEventListener('click', () => {
                if (Buildings.purchase(id, buyAmount)) {
                    renderBuildings();
                    updateStats(Game.getState());
                }
            });

            list.appendChild(div);

            // Render synergies for this building
            renderBuildingSynergies(list, id, state, fmt);
        });
    }

    function renderBuildingSynergies(container, buildingId, state, fmt) {
        const synergyIds = Buildings.SYNERGY_ORDER.filter(sId => Buildings.SYNERGIES[sId].building === buildingId);

        for (const sId of synergyIds) {
            const syn = Buildings.SYNERGIES[sId];
            const synState = Buildings.getSynergyState(sId);

            const div = document.createElement('div');
            div.className = `synergy-item tier-${syn.tier} ${synState}`;

            const tierBadge = `<span class="synergy-tier-badge tier-${syn.tier}">T${syn.tier}</span>`;

            let costText;
            if (synState === 'purchased') {
                costText = '<span class="synergy-purchased-check">✓</span>';
            } else if (synState === 'locked') {
                const owned = (state.buildings && state.buildings[buildingId]) || 0;
                const prevTier = syn.tier > 1 ? buildingId + '_t' + (syn.tier - 1) : null;
                const prevPurchased = !prevTier || (state.synergies && state.synergies[prevTier]);
                if (!prevPurchased) {
                    costText = `<span class="synergy-locked-reason">Requires T${syn.tier - 1}</span>`;
                } else {
                    costText = `<span class="synergy-locked-reason">Need ${syn.threshold} ${Buildings.BUILDINGS[buildingId].name}s</span>`;
                }
            } else {
                const canAfford = state.eu >= syn.cost;
                costText = `<span class="synergy-cost${canAfford ? '' : ' too-expensive'}">${fmt(syn.cost)} EU</span>`;
            }

            div.innerHTML = `
                ${tierBadge}
                <div class="synergy-info">
                    <div class="synergy-name">${syn.name} <span class="synergy-mult">×${syn.multiplier}</span></div>
                    <div class="synergy-flavor">${syn.flavor}</div>
                </div>
                <div class="synergy-cost-col">${costText}</div>
            `;

            if (synState === 'available') {
                div.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (Buildings.purchaseSynergy(sId)) {
                        renderBuildings();
                        updateStats(Game.getState());
                    }
                });
            }

            container.appendChild(div);
        }
    }

    function initBuyToggle() {
        const toggle = document.getElementById('buy-amount-toggle');
        if (!toggle) return;
        toggle.querySelectorAll('.buy-amt-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                buyAmount = parseInt(btn.dataset.amount) || 1;
                toggle.querySelectorAll('.buy-amt-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderBuildings();
            });
        });
    }

    // ── Tab System ─────────────────────────────────────────────
    function initTabs() {
        if (!els.tabBar) return;

        els.tabBar.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', () => switchTab(btn.dataset.tab));
        });

        // Restore persisted tab (fallback to 'buildings' if stale)
        const state = Game.getState();
        const validTabs = ['buildings', 'market', 'upgrades', 'log', 'stuff', 'prestige'];
        const saved = validTabs.includes(state.activeTab) ? state.activeTab : 'buildings';
        switchTab(saved);
    }

    function switchTab(name) {
        // Update buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === name);
        });
        // Update panes
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.dataset.tab === name);
        });
        // Persist
        Game.setState({ activeTab: name });
        // Re-render buildings when switching to that tab
        if (name === 'buildings') renderBuildings();
        if (name === 'prestige' && typeof Prestige !== 'undefined') Prestige.renderPrestige();
    }

    // ── Rate Charts (SVG Sparklines) ──────────────────────────
    const CHART_PAIRS = [
        { key: 'EU_TO_ST', label: 'EU → ST', color: '#4a6fa5', rateText: 'EU → 1 ST', btnLabel: 'TRANSMUTE', btnClass: '', convert: 'doConvertEU', logLabel: 'EU → ST', fromKey: 'eu' },
        { key: 'ST_TO_CC', label: 'ST → CC', color: '#c4a035', rateText: 'ST → 1 CC', btnLabel: 'TRANSMUTE', btnClass: '', convert: 'doConvertST', logLabel: 'ST → CC', fromKey: 'st' },
        { key: 'CC_TO_DB', label: 'CC → ☠️',  color: '#8b3a3a', rateText: 'CC → 1 ☠️', btnLabel: 'SMUGGLE', btnClass: 'btn-pirate', convert: 'doConvertCC', logLabel: 'CC → DB', fromKey: 'cc' },
        { key: 'DB_TO_TK', label: '☠️ → 🎫',  color: '#3a6b3a', rateText: '☠️ → 1 🎫', btnLabel: 'PETITION', btnClass: 'btn-pirate', convert: 'doConvertDB', logLabel: 'DB → TK', fromKey: 'doubloons' },
    ];

    function renderRateCharts() {
        const container = document.getElementById('rate-charts');
        if (!container) return;

        container.innerHTML = '';

        CHART_PAIRS.forEach(pair => {
            const history = Currencies.getFakeHistory(pair.key, 30);
            const currentRate = Currencies.getDynamicRate(pair.key);
            const data = [...history, currentRate];

            const min = Math.min(...data);
            const max = Math.max(...data);
            const range = max - min || 1;

            const w = 200;
            const h = 80;
            const padding = 2;

            const points = data.map((val, i) => {
                const x = padding + (i / (data.length - 1)) * (w - padding * 2);
                const y = h - padding - ((val - min) / range) * (h - padding * 2);
                return `${x.toFixed(1)},${y.toFixed(1)}`;
            }).join(' ');

            const lastX = w - padding;
            const lastY = h - padding - ((currentRate - min) / range) * (h - padding * 2);

            const first = history[0];
            const pctChange = first !== 0 ? (((currentRate - first) / first) * 100).toFixed(1) : '0.0';
            const pctClass = pctChange > 0 ? 'chart-up' : pctChange < 0 ? 'chart-down' : '';
            const favorable = Currencies.isRateFavorable(pair.key);

            const chartDiv = document.createElement('div');
            chartDiv.className = 'rate-chart';
            chartDiv.innerHTML = `
                <div class="rate-chart-header">
                    <span class="rate-chart-label">${pair.label}</span>
                    <span class="rate-chart-value">${currentRate} <span class="rate-chart-pct ${pctClass}">${pctChange > 0 ? '+' : ''}${pctChange}%</span></span>
                </div>
                <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
                    <polyline points="${points}" fill="none" stroke="${pair.color}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
                    <circle cx="${lastX.toFixed(1)}" cy="${lastY.toFixed(1)}" r="2.5" fill="#ffd700"/>
                </svg>
                <div class="rate-chart-footer">
                    <span class="rate-chart-rate">${currentRate} ${pair.rateText}</span>
                    <div class="chart-qty-row" data-pair="${pair.key}">
                        <button class="chart-qty-btn" data-delta="-all">-All</button>
                        <button class="chart-qty-btn" data-delta="-10">-10</button>
                        <button class="chart-qty-btn" data-delta="-1">-1</button>
                        <input type="number" min="0" value="1" class="chart-qty-input" data-pair="${pair.key}">
                        <button class="chart-qty-btn" data-delta="+1">+1</button>
                        <button class="chart-qty-btn" data-delta="+10">+10</button>
                        <button class="chart-qty-btn" data-delta="+all">+All</button>
                    </div>
                    <button class="btn-chart-convert ${pair.btnClass}${favorable ? ' rate-pulse' : ''}" data-pair="${pair.key}">${pair.btnLabel}</button>
                </div>
            `;

            // Wire quantity buttons
            chartDiv.querySelectorAll('.chart-qty-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const input = chartDiv.querySelector('.chart-qty-input');
                    const delta = btn.dataset.delta;
                    const state = Game.getState();
                    const balance = state[pair.fromKey] || 0;
                    const rate = Currencies.getDynamicRate(pair.key);
                    const maxOutput = Math.floor(balance / rate);
                    let current = parseInt(input.value) || 0;

                    if (delta === '+1') current += 1;
                    else if (delta === '+10') current += 10;
                    else if (delta === '+all') current = maxOutput;
                    else if (delta === '-1') current = Math.max(0, current - 1);
                    else if (delta === '-10') current = Math.max(0, current - 10);
                    else if (delta === '-all') current = 0;

                    input.value = Math.max(0, Math.min(current, maxOutput));
                });
            });

            // Wire convert button
            chartDiv.querySelector('.btn-chart-convert').addEventListener('click', () => {
                const input = chartDiv.querySelector('.chart-qty-input');
                const qty = parseInt(input.value) || 0;
                const rate = Currencies.getDynamicRate(pair.key);
                if (qty <= 0) {
                    Narrator.queueMessage("You specified zero. Bold strategy. Nothing was converted. Nothing was gained. Perfect metaphor.");
                    return;
                }
                const inputAmount = qty * rate;
                Currencies[pair.convert](inputAmount);
                updateStats(Game.getState());
                logAction(`CONVERSION: ${pair.logLabel} (×${qty})`);
                input.value = 1;
            });

            container.appendChild(chartDiv);
        });
    }

    function updateChartDots() {
        const container = document.getElementById('rate-charts');
        if (!container) return;

        const charts = container.querySelectorAll('.rate-chart');
        charts.forEach((chartEl, i) => {
            if (!CHART_PAIRS[i]) return;
            const pair = CHART_PAIRS[i];
            const currentRate = Currencies.getDynamicRate(pair.key);
            const history = Currencies.getFakeHistory(pair.key, 30);
            const first = history[0];
            const pctChange = first !== 0 ? (((currentRate - first) / first) * 100).toFixed(1) : '0.0';
            const pctClass = pctChange > 0 ? 'chart-up' : pctChange < 0 ? 'chart-down' : '';
            const favorable = Currencies.isRateFavorable(pair.key);

            // Update header value
            const valEl = chartEl.querySelector('.rate-chart-value');
            if (valEl) {
                valEl.innerHTML = `${currentRate} <span class="rate-chart-pct ${pctClass}">${pctChange > 0 ? '+' : ''}${pctChange}%</span>`;
            }

            // Update footer rate text
            const rateEl = chartEl.querySelector('.rate-chart-rate');
            if (rateEl) {
                rateEl.textContent = `${currentRate} ${pair.rateText}`;
            }

            // Update pulse on convert button
            const btnEl = chartEl.querySelector('.btn-chart-convert');
            if (btnEl) {
                btnEl.classList.toggle('rate-pulse', favorable);
            }
        });
    }

    // ── Particle System ────────────────────────────────────────
    function spawnParticles(anchor, count) {
        const rect = anchor.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const angle = (Math.PI * 2 * i) / count;
            const velocity = 50 + Math.random() * 100;
            const dx = Math.cos(angle) * velocity;
            const dy = Math.sin(angle) * velocity;

            particle.style.left = cx + 'px';
            particle.style.top = cy + 'px';
            particle.style.setProperty('--dx', dx + 'px');
            particle.style.setProperty('--dy', dy + 'px');

            const colors = ['#ffd700', '#4a9eff', '#ff4a6a', '#4aff88'];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];

            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 1000);
        }
    }

    // ── Streak Break Effect ────────────────────────────────────
    function streakBreakEffect() {
        document.body.classList.add('streak-broken');
        setTimeout(() => document.body.classList.remove('streak-broken'), 3000);
    }

    // ── Phase Change Effect ────────────────────────────────────
    function phaseChangeEffect(phase) {
        document.body.setAttribute('data-phase', phase);
        els.gameContainer.classList.add('phase-transition');
        setTimeout(() => els.gameContainer.classList.remove('phase-transition'), 2000);
    }

    // ── Button Dodge (sabotage) ────────────────────────────────
    function setupButtonDodge() {
        if (!els.clickButton) return;

        els.clickButton.addEventListener('mouseover', () => {
            if (!document.body.classList.contains('sabotage-dodge')) return;
            if (Math.random() < 0.3) {
                const dx = (Math.random() - 0.5) * 60;
                const dy = (Math.random() - 0.5) * 30;
                els.clickButton.style.transform = `translate(${dx}px, ${dy}px)`;
                setTimeout(() => {
                    els.clickButton.style.transform = '';
                }, 1000);
            }
        });
    }

    // ── Button Chaos (phase-dependent misbehavior) ───────────
    // Phase 1: stable and fun. Phase 2+: progressively maddening.
    let recentClickPositions = []; // for anti-auto-clicker detection
    let buttonChaosLocked = false;

    function buttonChaosEffect(event) {
        const phase = Game.getState().narratorPhase;
        if (phase <= 1 || buttonChaosLocked) return;

        // Track click positions for anti-auto-clicker
        if (event) {
            recentClickPositions.push({ x: event.clientX, y: event.clientY });
            if (recentClickPositions.length > 10) recentClickPositions.shift();

            // Anti-auto-clicker: if last 10 clicks all within 5px radius, force teleport
            if (recentClickPositions.length >= 10) {
                const avg = recentClickPositions.reduce((a, p) => ({ x: a.x + p.x, y: a.y + p.y }), { x: 0, y: 0 });
                avg.x /= recentClickPositions.length;
                avg.y /= recentClickPositions.length;
                const allClose = recentClickPositions.every(p =>
                    Math.sqrt((p.x - avg.x) ** 2 + (p.y - avg.y) ** 2) < 5
                );
                if (allClose) {
                    forceButtonTeleport();
                    recentClickPositions = [];
                    Narrator.queueMessage("Interesting input pattern. Very... mechanical. The button has been relocated for your enrichment.");
                    return;
                }
            }
        }

        const btn = els.clickButton;
        const roll = Math.random() * 100;

        // Phase-dependent chaos probabilities
        const chaos = {
            2: { wander: 2,  resize: 1,  color: 0,  vanish: 0  },
            3: { wander: 8,  resize: 5,  color: 3,  vanish: 0  },
            4: { wander: 15, resize: 10, color: 8,  vanish: 3  },
            5: { wander: 25, resize: 15, color: 12, vanish: 5  },
            6: { wander: 30, resize: 20, color: 15, vanish: 8  },
        };
        const c = chaos[phase] || chaos[6];

        if (roll < c.vanish) {
            // Disappear briefly
            buttonChaosLocked = true;
            btn.style.opacity = '0';
            btn.style.pointerEvents = 'none';
            const duration = phase >= 5 ? 800 + Math.random() * 1200 : 300 + Math.random() * 400;
            setTimeout(() => {
                btn.style.opacity = '1';
                btn.style.pointerEvents = '';
                buttonChaosLocked = false;
                // Teleport on reappear (phase 5+)
                if (phase >= 5) forceButtonTeleport();
            }, duration);
        } else if (roll < c.vanish + c.color) {
            // Color shift
            const hue = Math.floor(Math.random() * 360);
            btn.style.borderColor = `hsl(${hue}, 60%, 50%)`;
            btn.style.color = `hsl(${hue}, 40%, 70%)`;
            setTimeout(() => {
                btn.style.borderColor = '';
                btn.style.color = '';
            }, 2000);
        } else if (roll < c.vanish + c.color + c.resize) {
            // Resize
            const minScale = phase >= 5 ? 0.6 : 0.8;
            const maxScale = phase >= 5 ? 1.4 : 1.2;
            const scale = minScale + Math.random() * (maxScale - minScale);
            btn.style.transform = `scale(${scale})`;
            setTimeout(() => { btn.style.transform = ''; }, 1500);
        } else if (roll < c.vanish + c.color + c.resize + c.wander) {
            // Wander
            const maxOffset = phase >= 5 ? 40 : (phase >= 4 ? 20 : 10);
            const dx = (Math.random() - 0.5) * maxOffset * 2;
            const dy = (Math.random() - 0.5) * maxOffset * 2;
            btn.style.transform = `translate(${dx}px, ${dy}px)`;
            setTimeout(() => { btn.style.transform = ''; }, 2000);
        }
    }

    function forceButtonTeleport() {
        const btn = els.clickButton;
        const container = btn.parentElement;
        const maxX = container.offsetWidth - btn.offsetWidth;
        const maxY = 60;
        const dx = (Math.random() - 0.5) * maxX;
        const dy = (Math.random() - 0.5) * maxY;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
        setTimeout(() => { btn.style.transform = ''; }, 3000);
    }

    // ── Event Bindings ─────────────────────────────────────────
    function bindEvents() {
        // Main click button
        els.clickButton.addEventListener('click', (e) => {
            Game.click();
            clickEffect();
            buttonChaosEffect(e);
        });

        // Hamburger menu — opens the profile dropdown
        if (els.menuButton) {
            els.menuButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (typeof Pages !== 'undefined') {
                    Pages.toggleMenu();
                }
            });
        }

        // Currency ticker → switches to Asset Processing tab
        if (els.currencyTicker) {
            els.currencyTicker.addEventListener('click', () => {
                switchTab('market');
            });
        }

        // Reward modal
        if (els.rewardReroll) {
            els.rewardReroll.addEventListener('click', handleReroll);
        }
        if (els.rewardClaim) {
            els.rewardClaim.addEventListener('click', handleClaim);
        }
        if (els.rewardClose) {
            els.rewardClose.addEventListener('click', () => {
                els.rewardModal.classList.remove('active');
            });
        }

        // Game events
        Game.on('narratorMessage', showNarratorMessage);
        Game.on('stateChange', updateStats);
        Game.on('tick', () => updateStats(Game.getState()));
        Game.on('click', () => updateStats(Game.getState()));
        Game.on('autoClick', () => updateStats(Game.getState()));
        Game.on('rewardAvailable', showRewardModal);
        Game.on('streakBroken', streakBreakEffect);
        Game.on('phaseChange', (data) => phaseChangeEffect(data.to));
        Game.on('sabotageFixAvailable', renderSabotages);
        Game.on('sabotageFixed', renderSabotages);
        Game.on('upgradePurchased', renderUpgrades);

        // Conversion display refresh
        Game.on('conversion', () => updateStats(Game.getState()));
        Game.on('conversionFailed', () => updateStats(Game.getState()));

        // Crown seizure flash
        Game.on('crownSeizure', () => {
            document.body.classList.add('crown-seizure');
            setTimeout(() => document.body.classList.remove('crown-seizure'), 1500);
            updateStats(Game.getState());
        });

        // Market rate updates
        Game.on('rateChange', () => {
            updateStats(Game.getState());
            updateChartDots();
        });

        // Busted events
        Game.on('busted', (data) => {
            screenShake();
            spawnFloatingText(`-${data.lost} ${data.currency}!`, els.clickButton);
            if (typeof SoundEngine !== 'undefined') SoundEngine.playBusted();
        });

        // Escrow release floating text
        Game.on('escrowRelease', (data) => {
            spawnFloatingText(`RELEASED: +${data.amount} EU`, els.clickButton);
            logAction(`ESCROW RELEASE: ${data.amount} EU cleared`);
            updateStats(Game.getState());
            if (typeof SoundEngine !== 'undefined') SoundEngine.playEscrowRelease();
        });

        // Wu Wei passive gain
        Game.on('wuWeiGain', (data) => {
            if (els.clickButton) {
                spawnFloatingText(`+${data.amount} EU (wu wei)`, els.clickButton);
            }
            updateStats(Game.getState());
        });

        // Building events
        Game.on('buildingPurchased', () => renderBuildings());
        Game.on('synergyPurchased', () => renderBuildings());
        Game.on('tick', () => {
            // Refresh building affordability when tab is active
            const pane = document.querySelector('.tab-pane[data-tab="buildings"]');
            if (pane && pane.classList.contains('active')) renderBuildings();
        });

        setupButtonDodge();
    }

    // ── Init ───────────────────────────────────────────────────
    function init() {
        cacheDom();
        bindEvents();
        initTabs();
        initBuyToggle();
        renderBuildings();
        renderUpgrades();
        renderSabotages();
        renderRateCharts();
        updateStats(Game.getState());
    }

    return {
        init,
        logAction,
        spawnParticles,
        spawnFloatingText,
        screenShake,
        updateStats,
    };
})();
