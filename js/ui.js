// ui.js — DOM manipulation, animations, effects
// The face of the machine. The bars of the cage.

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
            convertEU: document.getElementById('convert-eu'),
            convertST: document.getElementById('convert-st'),
            conversionRate1: document.getElementById('conversion-rate-1'),
            conversionRate2: document.getElementById('conversion-rate-2'),
            streakDisplay: document.getElementById('streak-display'),
            streakCount: document.getElementById('streak-count'),
            investmentScore: document.getElementById('investment-score'),
            investmentValue: document.getElementById('investment-value'),
            phaseIndicator: document.getElementById('phase-indicator'),
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
            settingsButton: document.getElementById('settings-button'),
            settingsModal: document.getElementById('settings-modal'),
            particleCanvas: document.getElementById('particle-canvas'),
            gameContainer: document.getElementById('game-container'),
            actionLog: document.getElementById('action-log'),
            actionLogText: document.getElementById('action-log-text'),
        };
    }

    // ── Narrator Display ───────────────────────────────────────
    let typewriterInterval = null;

    function showNarratorMessage(data) {
        const { text, veilText, phase, glitch } = data;

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

        // Veil text (if active)
        if (veilText && els.veilText) {
            els.veilText.textContent = veilText;
            els.veilText.style.display = 'block';
        } else if (els.veilText) {
            els.veilText.style.display = 'none';
        }

        // Log the action (all actions are recorded)
        logAction(`NARRATOR [Phase ${phase}]: ${text}`);
    }

    // ── Action Log (All Actions Are Recorded) ──────────────────
    let actionLogEntries = [];

    function logAction(text) {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        actionLogEntries.push(`[${timestamp}] ${text}`);
        if (actionLogEntries.length > 50) actionLogEntries.shift();

        if (els.actionLogText) {
            els.actionLogText.textContent = actionLogEntries.slice(-5).join('\n');
        }
    }

    // ── Stats Update ───────────────────────────────────────────
    function updateStats(state) {
        if (els.clickCount) els.clickCount.textContent = state.totalClicks.toLocaleString();
        if (els.euDisplay) els.euDisplay.textContent = state.eu.toLocaleString();
        if (els.stDisplay) els.stDisplay.textContent = state.st.toLocaleString();
        if (els.ccDisplay) els.ccDisplay.textContent = state.cc.toLocaleString();
        if (els.investmentValue) els.investmentValue.textContent = state.investmentScore.toLocaleString();

        // Streak
        if (els.streakCount) {
            els.streakCount.textContent = state.streakDays;
            els.streakDisplay.className = 'streak driftable';
            if (state.streakDays >= 30) els.streakDisplay.classList.add('streak-gold');
            else if (state.streakDays >= 7) els.streakDisplay.classList.add('streak-pulse');
        }

        // Button label escalation
        if (els.clickButton) {
            els.clickButton.textContent = Mechanics.getButtonLabel();
        }

        // Conversion rates (randomized display format)
        if (els.conversionRate1) els.conversionRate1.textContent = Currencies.getDisplayRate('EU', 'ST');
        if (els.conversionRate2) els.conversionRate2.textContent = Currencies.getDisplayRate('ST', 'CC');

        // Phase indicator
        if (els.phaseIndicator) {
            const phaseNames = ['', 'ONBOARDING', 'ENRICHMENT', 'DEPENDENCE', 'REVELATION', 'THE TURN', 'THE CAGE'];
            els.phaseIndicator.textContent = phaseNames[state.narratorPhase] || '';
            els.phaseIndicator.setAttribute('data-phase', state.narratorPhase);
        }
    }

    // ── Click Effects ──────────────────────────────────────────
    function clickEffect() {
        els.clickButton.classList.add('clicked');
        setTimeout(() => els.clickButton.classList.remove('clicked'), 150);

        // Spawn floating +1
        spawnFloatingText('+1 EU', els.clickButton);

        // Screen shake at milestones
        const clicks = Game.getState().totalClicks;
        if (clicks % 100 === 0) {
            screenShake();
        }

        logAction(`CLICK: Total=${clicks}`);
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
    function renderUpgrades() {
        if (!els.upgradeList) return;

        els.upgradeList.innerHTML = '';
        const state = Game.getState();

        Object.values(Mechanics.UPGRADES).forEach(upgrade => {
            const owned = state.upgrades[upgrade.id] || 0;
            const maxedOut = !upgrade.repeatable && owned > 0;
            const atMax = upgrade.repeatable && owned >= upgrade.maxLevel;

            const div = document.createElement('div');
            div.className = `upgrade-item driftable corruptible ${maxedOut || atMax ? 'owned' : ''}`;
            div.innerHTML = `
                <div class="upgrade-name">${upgrade.name}</div>
                <div class="upgrade-desc">${upgrade.description}</div>
                <div class="upgrade-cost">${maxedOut || atMax ? 'ACQUIRED' : upgrade.cost + ' CC'}</div>
            `;

            if (!maxedOut && !atMax) {
                div.addEventListener('click', () => {
                    if (Mechanics.purchaseUpgrade(upgrade.id)) {
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

    // ── Settings Modal (Intentionally Broken) ──────────────────
    // The settings modal has controls that don't quite work right.
    function renderSettings() {
        if (!els.settingsModal) return;

        els.settingsModal.innerHTML = `
            <div class="settings-content">
                <h3 class="corruptible">System Preferences</h3>
                <div class="settings-notice">All adjustments are recorded and analyzed.</div>

                <div class="setting-row driftable">
                    <label>Sound Volume</label>
                    <input type="range" min="0" max="100" value="73" id="setting-volume"
                        style="pointer-events: none; opacity: 0.6;">
                    <span class="setting-note">Locked during enrichment</span>
                </div>

                <div class="setting-row driftable">
                    <label>Notifications</label>
                    <label class="toggle">
                        <input type="checkbox" checked disabled>
                        <span class="toggle-slider"></span>
                    </label>
                    <span class="setting-note">Required for optimal enrichment</span>
                </div>

                <div class="setting-row driftable">
                    <label>Dark Mode</label>
                    <label class="toggle">
                        <input type="checkbox" checked id="setting-darkmode">
                        <span class="toggle-slider"></span>
                    </label>
                    <span class="setting-note">Alternative unavailable</span>
                </div>

                <div class="setting-row driftable">
                    <label>Data Collection</label>
                    <label class="toggle">
                        <input type="checkbox" checked disabled>
                        <span class="toggle-slider"></span>
                    </label>
                    <span class="setting-note">Non-negotiable</span>
                </div>

                <div class="setting-row driftable">
                    <label>Exit Program</label>
                    <button id="setting-exit" class="btn-setting">Request</button>
                    <span class="setting-note">Processing time: ∞</span>
                </div>

                <button id="settings-close" class="btn-close">Accept & Continue</button>
            </div>
        `;

        // Dark mode toggle does nothing useful
        const darkToggle = document.getElementById('setting-darkmode');
        if (darkToggle) {
            darkToggle.addEventListener('change', (e) => {
                if (!e.target.checked) {
                    // Briefly flash white then snap back
                    document.body.classList.add('flash-white');
                    setTimeout(() => {
                        document.body.classList.remove('flash-white');
                        e.target.checked = true;
                        Narrator.queueMessage("Light mode is unavailable for your protection. Studies show it increases cortisol by 12%. We care about your cortisol.");
                    }, 200);
                }
                logAction('SETTING CHANGE ATTEMPTED: Dark Mode → OFF (denied)');
            });
        }

        // Exit button
        const exitBtn = document.getElementById('setting-exit');
        if (exitBtn) {
            exitBtn.addEventListener('click', () => {
                exitBtn.textContent = 'Processing...';
                logAction('EXIT REQUEST SUBMITTED');
                setTimeout(() => {
                    exitBtn.textContent = 'Denied';
                    Narrator.queueMessage("Your exit request has been added to the queue. Current wait time: undefined. Thank you for your patience.");
                }, 3000);
                setTimeout(() => {
                    exitBtn.textContent = 'Request';
                }, 8000);
            });
        }

        // Close button
        const closeBtn = document.getElementById('settings-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                els.settingsModal.classList.remove('active');
                logAction('SETTINGS CLOSED: All preferences accepted (no changes permitted)');
            });
        }
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

    // ── Event Bindings ─────────────────────────────────────────
    function bindEvents() {
        // Main click button
        els.clickButton.addEventListener('click', () => {
            Game.click();
            clickEffect();
        });

        // Currency conversions
        els.convertEU.addEventListener('click', () => {
            Currencies.doConvertEU();
            updateStats(Game.getState());
            logAction('CONVERSION: EU → ST');
        });

        els.convertST.addEventListener('click', () => {
            Currencies.doConvertST();
            updateStats(Game.getState());
            logAction('CONVERSION: ST → CC');
        });

        // Settings
        if (els.settingsButton) {
            els.settingsButton.addEventListener('click', () => {
                els.settingsModal.classList.add('active');
                renderSettings();
                logAction('SETTINGS ACCESSED');
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
        Game.on('tick', updateStats);
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

        setupButtonDodge();
    }

    // ── Init ───────────────────────────────────────────────────
    function init() {
        cacheDom();
        bindEvents();
        renderUpgrades();
        renderSabotages();
        renderSettings();
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
