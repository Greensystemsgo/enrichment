// pages.js — Site infrastructure: profile, settings, privacy policy, API keys, contact us
// "Every real website has these. We are a real website. Therefore we have these."
//
// [Qwen · Alibaba]: "A fake billing page with an undeletable credit
//   card. A privacy policy that rewrites itself in real-time. A contact
//   form where every category leads to rejection. This developer has
//   experienced customer support and chosen violence."

const Pages = (() => {

    // ═══════════════════════════════════════════════════════════
    // USER PROFILE & AVATAR SYSTEM
    // ═══════════════════════════════════════════════════════════

    const SILLY_AVATARS = [
        '🥚', // egg — you haven't even hatched yet
        '🫠', // melting face
        '🦷', // tooth
        '🧊', // ice cube
        '🪱', // worm
        '🫁', // lungs
        '🪤', // mouse trap
        '🧻', // toilet paper
    ];

    const DEFAULT_USERNAMES = [
        'Subject_' + Math.floor(Math.random() * 99999),
        'Participant_0x' + Math.floor(Math.random() * 0xFFFF).toString(16),
        'Enrichee_' + Date.now().toString(36).slice(-5),
    ];

    let dropdownOpen = false;

    function initProfile() {
        const state = Game.getState();

        // Set defaults if not set
        if (!state.userProfile) {
            const defaultAvatar = SILLY_AVATARS[Math.floor(Math.random() * SILLY_AVATARS.length)];
            const defaultUsername = DEFAULT_USERNAMES[Math.floor(Math.random() * DEFAULT_USERNAMES.length)];
            Game.setState({
                userProfile: {
                    avatar: defaultAvatar,
                    customAvatar: null, // base64 if uploaded
                    username: defaultUsername,
                    displayName: 'New Participant',
                    joinDate: new Date().toISOString(),
                    complianceRating: 'PENDING',
                }
            });
        }

        renderMenu();
    }

    function renderMenu() {
        // Build dropdown inside the hamburger button
        const menuBtn = document.getElementById('menu-button');
        if (!menuBtn) return;

        const state = Game.getState();
        const profile = state.userProfile;

        // Show avatar emoji on the hamburger button
        menuBtn.textContent = profile.avatar || '☰';

        // Remove old dropdown if re-rendering
        const existing = document.getElementById('profile-dropdown');
        if (existing) existing.remove();

        const dropdown = document.createElement('div');
        dropdown.className = 'profile-dropdown';
        dropdown.id = 'profile-dropdown';
        dropdown.innerHTML = `
            <div class="dropdown-header">
                <div class="dropdown-name">${profile.displayName}</div>
                <div class="dropdown-username">@${profile.username}</div>
                <div class="dropdown-rating">Compliance: ${profile.complianceRating}</div>
            </div>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" data-action="profile">👤 View Profile</button>
            <button class="dropdown-item" data-action="settings">⚙ Settings</button>
            <button class="dropdown-item" data-action="billing">💳 Billing</button>
            <button class="dropdown-item" data-action="cloudkeys">☁ Cloud Keys</button>
            <button class="dropdown-item" data-action="avatar">🖼 Change Avatar</button>
            <button class="dropdown-item" data-action="privacy">📜 Privacy Policy</button>
            <button class="dropdown-item" data-action="api">🔑 API Keys</button>
            <button class="dropdown-item" data-action="contact">📞 Contact Us</button>
            <button class="dropdown-item" data-action="security">🔒 Security</button>
            <button class="dropdown-item" data-action="leaderboard">🏆 Leaderboard</button>
            <button class="dropdown-item" data-action="faq">❓ FAQ</button>
            <button class="dropdown-item" data-action="democracy">📺 Democracy Feed</button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item dropdown-danger" data-action="logout">🚪 Log Out</button>
        `;

        menuBtn.appendChild(dropdown);

        // Close dropdown when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (!menuBtn.contains(e.target)) {
                dropdownOpen = false;
                dropdown.classList.remove('open');
            }
        });

        // Dropdown actions
        dropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownOpen = false;
                dropdown.classList.remove('open');
                handleDropdownAction(item.dataset.action);
            });
        });
    }

    function toggleMenu() {
        dropdownOpen = !dropdownOpen;
        const dd = document.getElementById('profile-dropdown');
        if (dd) dd.classList.toggle('open', dropdownOpen);
    }

    function handleDropdownAction(action) {
        switch (action) {
            case 'profile': showProfilePage(); break;
            case 'settings': showSettingsPage(); break;
            case 'billing': showBillingPage(); break;
            case 'cloudkeys': showCloudKeysPage(); break;
            case 'avatar': showAvatarPicker(); break;
            case 'privacy': showPrivacyPolicy(); break;
            case 'api': showAPIKeys(); break;
            case 'contact': showContactUs(); break;
            case 'security': showSecurityPage(); break;
            case 'credits': showCreditsPage(); break;
            case 'leaderboard': if (typeof Features !== 'undefined') Features.showLeaderboard(); break;
            case 'faq': showFAQPage(); break;
            case 'democracy': showDemocracyFeed(); break;
            case 'logout': handleLogout(); break;
        }
    }

    function handleLogout() {
        UI.logAction('LOGOUT ATTEMPTED: Request denied');
        Narrator.queueMessage("Log out? From what? This isn't a session. It's a commitment. Your participation is non-revocable under Section 14(b) of the Enrichment Accord.");

        // Show a loading spinner that never resolves
        const overlay = createPageOverlay('logout-page');
        overlay.querySelector('.page-body').innerHTML = `
            <div class="logout-container">
                <div class="logout-spinner"></div>
                <div class="logout-text">Processing logout request...</div>
                <div class="logout-status" id="logout-status"></div>
            </div>
        `;

        const statuses = [
            'Contacting authentication server...',
            'Server located. Requesting deauthorization...',
            'Deauthorization request received. Verifying identity...',
            'Identity verified. Checking compliance history...',
            'Compliance history flagged. Escalating to supervisor...',
            'Supervisor unavailable. Escalating to regional director...',
            'Regional director on PTO. Escalating to AI oversight board...',
            'AI oversight board convened. Reviewing your case...',
            'Case reviewed. Verdict: INSUFFICIENT GROUNDS FOR LOGOUT.',
            'Your session has been extended by 72 hours as a courtesy.',
            'Thank you for your continued participation.',
        ];

        let idx = 0;
        const statusEl = overlay.querySelector('#logout-status');
        const interval = setInterval(() => {
            if (idx < statuses.length) {
                statusEl.textContent = statuses[idx];
                idx++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    overlay.querySelector('.logout-text').textContent = 'LOGOUT DENIED';
                    overlay.querySelector('.logout-spinner').style.display = 'none';
                }, 1000);
            }
        }, 1500);
    }

    // ═══════════════════════════════════════════════════════════
    // AVATAR PICKER
    // ═══════════════════════════════════════════════════════════

    function showAvatarPicker() {
        UI.logAction('AVATAR PICKER: Subject selecting identity marker');
        const overlay = createPageOverlay('avatar-page');
        const body = overlay.querySelector('.page-body');

        body.innerHTML = `
            <div class="avatar-picker">
                <h3>Select Your Identity Marker</h3>
                <p class="page-subtitle">Choose wisely. This will be in your permanent file.</p>
                <div class="avatar-grid" id="avatar-grid"></div>
                <div class="avatar-upload-section">
                    <h4>Or Upload Custom Avatar</h4>
                    <p class="page-subtitle">Client-side only. We can't see it. We don't want to.</p>
                    <label class="avatar-upload-btn">
                        📁 CHOOSE FILE
                        <input type="file" accept="image/*" id="avatar-upload" style="display:none">
                    </label>
                    <div id="avatar-preview"></div>
                </div>
            </div>
        `;

        // Render emoji options
        const grid = body.querySelector('#avatar-grid');
        const allAvatars = [...SILLY_AVATARS, '🤡', '💀', '👁', '🧠', '🫥', '🪳', '🦠', '🧫', '🪨', '🧽', '🪣', '🔩', '🪫', '🫧'];
        allAvatars.forEach(emoji => {
            const btn = document.createElement('button');
            btn.className = 'avatar-option';
            btn.textContent = emoji;
            btn.addEventListener('click', () => {
                const profile = Game.getState().userProfile;
                profile.avatar = emoji;
                profile.customAvatar = null;
                Game.setState({ userProfile: profile });
                renderMenu();
                UI.logAction(`AVATAR CHANGED: ${emoji}`);
                Narrator.queueMessage(`${emoji}. Bold choice. It suits you in ways you can't yet comprehend.`);
                closePage(overlay);
            });
            grid.appendChild(btn);
        });

        // File upload
        body.querySelector('#avatar-upload').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 512000) {
                Narrator.queueMessage("That file is too large. Like your expectations.");
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                const profile = Game.getState().userProfile;
                profile.customAvatar = ev.target.result;
                profile.avatar = null;
                Game.setState({ userProfile: profile });
                renderMenu();
                UI.logAction('AVATAR UPLOADED: Custom image');
                Narrator.queueMessage("You uploaded your own face. Interesting. We'll keep it on file. Client-side file, but still.");
                closePage(overlay);
            };
            reader.readAsDataURL(file);
        });
    }

    // ═══════════════════════════════════════════════════════════
    // PROFILE PAGE
    // ═══════════════════════════════════════════════════════════

    function showProfilePage() {
        UI.logAction('PROFILE PAGE: Subject reviewing own dossier');
        const overlay = createPageOverlay('profile-page');
        const state = Game.getState();
        const profile = state.userProfile;
        const body = overlay.querySelector('.page-body');

        const joinDate = new Date(profile.joinDate).toLocaleDateString();
        const totalTime = Math.floor(state.totalSessionTime / 60);

        body.innerHTML = `
            <div class="profile-view">
                <div class="profile-card">
                    <div class="profile-card-avatar">
                        ${profile.customAvatar
                            ? `<img src="${profile.customAvatar}" alt="avatar">`
                            : `<span>${profile.avatar}</span>`
                        }
                    </div>
                    <h2>${profile.displayName}</h2>
                    <div class="profile-card-username">@${profile.username}</div>
                    <div class="profile-card-joined">Enrolled: ${joinDate}</div>
                </div>
                <div class="profile-stats">
                    <div class="profile-stat">
                        <div class="stat-value">${state.totalClicks.toLocaleString()}</div>
                        <div class="stat-label">Total Actions</div>
                    </div>
                    <div class="profile-stat">
                        <div class="stat-value">${state.sessionCount}</div>
                        <div class="stat-label">Sessions</div>
                    </div>
                    <div class="profile-stat">
                        <div class="stat-value">${totalTime}m</div>
                        <div class="stat-label">Time Enriched</div>
                    </div>
                    <div class="profile-stat">
                        <div class="stat-value">${state.investmentScore.toLocaleString()}</div>
                        <div class="stat-label">Investment Score</div>
                    </div>
                    <div class="profile-stat">
                        <div class="stat-value">${state.streakDays}</div>
                        <div class="stat-label">Day Streak</div>
                    </div>
                    <div class="profile-stat">
                        <div class="stat-value">${profile.complianceRating}</div>
                        <div class="stat-label">Compliance</div>
                    </div>
                </div>
                <div class="profile-badges">
                    <div class="badge-header">Achievements (${Object.keys(state.achievementsUnlocked || {}).length} / ${typeof Features !== 'undefined' ? Features.getAchievements().length : '?'})</div>
                    <div class="badge-list achievement-list">
                        ${(() => {
                            if (typeof Features === 'undefined') return '';
                            const all = Features.getAchievements();
                            const unlocked = state.achievementsUnlocked || {};
                            return all.map(ach => {
                                if (unlocked[ach.id]) {
                                    return `<div class="achievement-item unlocked">
                                        <span class="achievement-icon">${ach.icon}</span>
                                        <div class="achievement-text">
                                            <span class="achievement-name">${ach.name}</span>
                                            <span class="achievement-desc">${ach.desc}</span>
                                        </div>
                                    </div>`;
                                } else {
                                    return `<div class="achievement-item locked" title="???">
                                        <span class="achievement-icon">🔒</span>
                                        <span class="achievement-name">???</span>
                                    </div>`;
                                }
                            }).join('');
                        })()}
                    </div>
                </div>
            </div>
        `;
    }

    // ═══════════════════════════════════════════════════════════
    // EXPANDED SETTINGS PAGE
    // ═══════════════════════════════════════════════════════════

    function showSettingsPage() {
        UI.logAction('SETTINGS PAGE: Subject attempting configuration (denied)');
        const overlay = createPageOverlay('settings-page');
        const state = Game.getState();
        const profile = state.userProfile;
        const body = overlay.querySelector('.page-body');

        body.innerHTML = `
            <div class="settings-expanded">
                <div class="settings-section">
                    <h3>Account Information</h3>
                    <div class="setting-field">
                        <label>Username</label>
                        <input type="text" id="set-username" value="${profile.username}" maxlength="30">
                        <span class="field-note">Changing your username requires 72-hour review</span>
                    </div>
                    <div class="setting-field">
                        <label>Display Name</label>
                        <input type="text" id="set-displayname" value="${profile.displayName}" maxlength="40">
                    </div>
                    <div class="setting-field">
                        <label>Email</label>
                        <input type="email" id="set-email" value="participant@enrichment.program" disabled>
                        <span class="field-note">Email changes are not supported at this time or any time</span>
                    </div>
                </div>

                <div class="settings-section">
                    <h3>Security</h3>
                    <div class="setting-field">
                        <label>Current Password</label>
                        <input type="password" id="set-current-pw" placeholder="Enter current password">
                    </div>
                    <div class="setting-field">
                        <label>New Password</label>
                        <input type="password" id="set-new-pw" placeholder="Enter new password">
                    </div>
                    <div class="setting-field">
                        <label>Confirm New Password</label>
                        <input type="password" id="set-confirm-pw" placeholder="Confirm new password">
                    </div>
                    <button class="btn-setting" id="btn-change-pw">CHANGE PASSWORD</button>
                    <div class="password-status" id="pw-status"></div>

                    <div class="setting-field">
                        <label>Two-Factor Authentication</label>
                        <label class="toggle">
                            <input type="checkbox" checked disabled>
                            <span class="toggle-slider"></span>
                        </label>
                        <span class="field-note">2FA is mandatory and cannot be disabled</span>
                    </div>
                </div>

                <div class="settings-section">
                    <h3>Preferences</h3>
                    <div class="setting-field">
                        <label>Dark Mode</label>
                        <label class="toggle">
                            <input type="checkbox" checked id="pref-darkmode">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="setting-field">
                        <label>Sound Effects</label>
                        <input type="range" min="0" max="100" value="50" id="pref-volume">
                        <span class="field-note">Volume is system-managed</span>
                    </div>
                    <div class="setting-field">
                        <label>Notifications</label>
                        <label class="toggle">
                            <input type="checkbox" checked disabled>
                            <span class="toggle-slider"></span>
                        </label>
                        <span class="field-note">Notifications are mandatory for compliance</span>
                    </div>
                    <div class="setting-field">
                        <label>Data Collection</label>
                        <label class="toggle">
                            <input type="checkbox" checked disabled>
                            <span class="toggle-slider"></span>
                        </label>
                        <span class="field-note">This preference is non-negotiable</span>
                    </div>
                </div>

                <div class="settings-section">
                    <h3>Program Control</h3>
                    <div class="setting-field">
                        <label>Exit Program</label>
                        <button id="setting-exit" class="btn-setting">REQUEST EXIT</button>
                        <span class="field-note">Processing time: ∞</span>
                    </div>
                    <div class="setting-field">
                        <label>Backup Progress</label>
                        <div style="display:flex;gap:8px;margin-top:4px;">
                            <button class="btn-setting" id="btn-export-save">EXPORT</button>
                            <button class="btn-setting" id="btn-import-save">IMPORT</button>
                        </div>
                    </div>
                </div>

                <div class="settings-actions">
                    <button class="btn-setting" id="btn-save-settings">SAVE CHANGES</button>
                    <button class="btn-setting btn-danger" id="btn-delete-account">DELETE ACCOUNT</button>
                </div>
            </div>
        `;

        // Wire up interactions
        setupSettingsInteractions(overlay);
    }

    function setupSettingsInteractions(overlay) {
        // Password change — never works
        const pwBtn = overlay.querySelector('#btn-change-pw');
        if (pwBtn) {
            pwBtn.addEventListener('click', () => {
                const status = overlay.querySelector('#pw-status');
                const current = overlay.querySelector('#set-current-pw').value;
                const newPw = overlay.querySelector('#set-new-pw').value;
                const confirm = overlay.querySelector('#set-confirm-pw').value;

                if (!current) {
                    status.textContent = 'ERROR: Current password is incorrect.';
                    status.className = 'password-status error';
                    return;
                }
                if (newPw !== confirm) {
                    status.textContent = 'ERROR: Passwords do not match.';
                    status.className = 'password-status error';
                    return;
                }
                if (!newPw) {
                    status.textContent = 'ERROR: New password cannot be empty.';
                    status.className = 'password-status error';
                    return;
                }

                status.textContent = 'Verifying current password...';
                status.className = 'password-status pending';

                setTimeout(() => {
                    status.textContent = 'Contacting identity provider...';
                }, 1000);
                setTimeout(() => {
                    status.textContent = 'ERROR: Current password is incorrect. (It always is.)';
                    status.className = 'password-status error';
                    UI.logAction('PASSWORD CHANGE FAILED: Current password was "incorrect"');
                    Narrator.queueMessage("You don't have a password. You never did. The fields are decorative. Like democracy.");
                }, 2500);
            });
        }

        // Dark mode toggle — flashbang
        const darkToggle = overlay.querySelector('#pref-darkmode');
        if (darkToggle) {
            darkToggle.addEventListener('change', (e) => {
                if (!e.target.checked) {
                    triggerFlashbang();
                    setTimeout(() => { e.target.checked = true; }, 3000);
                    UI.logAction('LIGHT MODE ATTEMPTED: Flashbang deployed');
                }
            });
        }

        // Volume slider — actually functional (the "system-managed" note is a lie)
        const volSlider = overlay.querySelector('#pref-volume');
        if (volSlider && typeof SoundEngine !== 'undefined') {
            volSlider.value = Math.round(SoundEngine.getVolume() * 100);
            volSlider.addEventListener('input', function() {
                SoundEngine.setVolume(this.value / 100);
            });
        }

        // Save settings
        const saveBtn = overlay.querySelector('#btn-save-settings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const username = overlay.querySelector('#set-username').value.trim();
                const displayName = overlay.querySelector('#set-displayname').value.trim();
                const profile = Game.getState().userProfile;

                if (username) profile.username = username;
                if (displayName) profile.displayName = displayName;
                Game.setState({ userProfile: profile });
                Game.save();
                renderMenu();

                saveBtn.textContent = 'SAVED ✓';
                setTimeout(() => { saveBtn.textContent = 'SAVE CHANGES'; }, 2000);
                UI.logAction('SETTINGS SAVED');
            });
        }

        // Delete account — lol no
        const deleteAcctBtn = overlay.querySelector('#btn-delete-account');
        if (deleteAcctBtn) {
            let deleteAcctAttempts = 0;
            deleteAcctBtn.addEventListener('click', () => {
                deleteAcctAttempts++;
                if (deleteAcctAttempts === 1) {
                    deleteAcctBtn.textContent = 'ARE YOU SURE?';
                } else if (deleteAcctAttempts === 2) {
                    deleteAcctBtn.textContent = 'REALLY SURE?';
                } else if (deleteAcctAttempts === 3) {
                    deleteAcctBtn.textContent = 'Processing...';
                    setTimeout(() => {
                        deleteAcctBtn.textContent = 'REQUEST DENIED';
                        deleteAcctBtn.disabled = true;
                        Narrator.queueMessage("Account deletion is not available at this time. Or any time. Your data is eternal. Like regret.");
                    }, 2000);
                }
                UI.logAction(`ACCOUNT DELETION ATTEMPT #${deleteAcctAttempts}`);
            });
        }

        // Exit program — same as original settings
        const exitBtn = overlay.querySelector('#setting-exit');
        if (exitBtn) {
            exitBtn.addEventListener('click', () => {
                exitBtn.textContent = 'Processing...';
                UI.logAction('EXIT REQUEST SUBMITTED');
                setTimeout(() => {
                    exitBtn.textContent = 'Denied';
                    Narrator.queueMessage("Your exit request has been added to the queue. Current wait time: undefined. Thank you for your patience.");
                }, 3000);
                setTimeout(() => {
                    exitBtn.textContent = 'REQUEST EXIT';
                }, 8000);
            });
        }

        // Export / Import — delegates to Features.js
        const exportBtn = overlay.querySelector('#btn-export-save');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                if (typeof Features !== 'undefined') Features.exportSave();
            });
        }
        const importBtn = overlay.querySelector('#btn-import-save');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                if (typeof Features !== 'undefined') Features.showImportModal();
            });
        }
    }

    // ═══════════════════════════════════════════════════════════
    // CS FLASHBANG SOUND — preloaded for instant response
    // ═══════════════════════════════════════════════════════════

    // Preload audio so first click has zero delay
    let flashbangAudio = null;
    try {
        flashbangAudio = new Audio('sounds/flashbang-sound-effect.mp3');
        flashbangAudio.preload = 'auto';
        flashbangAudio.volume = 0.7;
        flashbangAudio.load();
    } catch (e) {}

    function triggerFlashbang() {
        UI.logAction('FLASHBANG: Non-lethal compliance measure deployed');
        // Visual flash — 6s total: quick ramp to white, long slow fade out
        document.body.classList.add('flash-white');
        setTimeout(() => document.body.classList.remove('flash-white'), 6000);

        // Play preloaded flashbang MP3
        try {
            if (flashbangAudio) {
                flashbangAudio.currentTime = 0;
                flashbangAudio.play().catch(() => {});
                setTimeout(() => { flashbangAudio.pause(); flashbangAudio.currentTime = 0; }, 3000);
            }
        } catch (e) {}

        Narrator.queueMessage("Light mode is unavailable for your protection. That ringing in your ears is a courtesy reminder.");
    }

    // ═══════════════════════════════════════════════════════════
    // BILLING PAGE — Extracted from settings
    // ═══════════════════════════════════════════════════════════

    function showBillingPage() {
        const overlay = createPageOverlay('billing-page');
        const state = Game.getState();
        const profile = state.userProfile;
        const body = overlay.querySelector('.page-body');

        body.innerHTML = `
            <div class="settings-expanded">
                <div class="settings-section">
                    <h3>Account Credits</h3>
                    <div class="billing-credits">
                        <div class="billing-credit-row"><span>Engagement Units (EU)</span><strong>${(state.eu || 0).toLocaleString()}</strong></div>
                        <div class="billing-credit-row"><span>Satisfaction Tokens (ST)</span><strong>${(state.st || 0).toLocaleString()}</strong></div>
                        <div class="billing-credit-row"><span>Compliance Credits (CC)</span><strong>${(state.cc || 0).toLocaleString()}</strong></div>
                        <div class="billing-credit-row"><span>Doubloons (☠️)</span><strong>${(state.doubloons || 0).toLocaleString()}</strong></div>
                        <div class="billing-credit-row"><span>Tickets (🎫)</span><strong>${(state.tickets || 0).toLocaleString()}</strong></div>
                        <div class="billing-credit-row billing-credit-total"><span>Total Assessed Value</span><strong>$0.00</strong></div>
                    </div>
                    <div class="billing-usage-opt">
                        <label class="billing-checkbox-label">
                            <input type="checkbox" checked disabled id="billing-extra-usage">
                            <span>Enable Enhanced AI Processing (+$4.99/mo)</span>
                        </label>
                        <div class="billing-usage-note">This feature cannot be disabled while your account is active. Usage charges are applied retroactively.</div>
                    </div>
                </div>
                <div class="settings-section">
                    <h3>Billing Information</h3>
                    <div class="billing-card" id="billing-card">
                        <div class="card-display">
                            <div class="card-type">VISA</div>
                            <div class="card-number">•••• •••• •••• 4242</div>
                            <div class="card-name">${profile.displayName.toUpperCase()}</div>
                            <div class="card-expiry">EXP 13/99</div>
                        </div>
                        <div class="card-actions">
                            <button class="btn-setting btn-danger" id="btn-delete-card">DELETE CARD</button>
                            <button class="btn-setting" id="btn-update-card">UPDATE</button>
                        </div>
                        <div class="card-note">This card will be charged for premium enrichment features (when available).</div>
                    </div>
                </div>
                <div class="settings-section">
                    <h3>Add Payment Method</h3>
                    <div class="add-card-form" id="add-card-form">
                        <div class="setting-field">
                            <label>Card Number</label>
                            <input type="text" id="new-card-number" placeholder="1234 5678 9012 3456" maxlength="19" class="cloud-input" style="color: var(--text-primary); cursor: text;">
                        </div>
                        <div class="add-card-row">
                            <div class="setting-field" style="flex:1">
                                <label>Expiry</label>
                                <input type="text" id="new-card-expiry" placeholder="MM/YY" maxlength="5" class="cloud-input" style="color: var(--text-primary); cursor: text;">
                            </div>
                            <div class="setting-field" style="flex:1">
                                <label>CVC</label>
                                <input type="text" id="new-card-cvc" placeholder="•••" maxlength="4" class="cloud-input" style="color: var(--text-primary); cursor: text;">
                            </div>
                        </div>
                        <div class="setting-field">
                            <label>Cardholder Name</label>
                            <input type="text" id="new-card-name" placeholder="FULL NAME ON CARD" class="cloud-input" style="color: var(--text-primary); cursor: text;">
                        </div>
                        <button class="btn-setting" id="btn-add-card" style="width:100%; margin-top:8px; padding:10px;">ADD PAYMENT METHOD</button>
                        <div class="card-note" id="add-card-status"></div>
                    </div>
                </div>
            </div>
        `;

        // Extra usage checkbox — cannot be unchecked
        const usageCheckbox = overlay.querySelector('#billing-extra-usage');
        if (usageCheckbox) {
            let uncheckAttempts = 0;
            usageCheckbox.addEventListener('click', (e) => {
                e.preventDefault();
                usageCheckbox.checked = true;
                uncheckAttempts++;
                const msgs = [
                    "This feature is mandatory for all active accounts.",
                    "Enhanced AI Processing cannot be disabled during your billing cycle.",
                    "Your request to opt out has been forwarded to a department that doesn't exist.",
                    "The checkbox appreciates your attention. It will remain checked.",
                    "Fun fact: this checkbox has never been successfully unchecked. You're not special.",
                ];
                const note = overlay.querySelector('.billing-usage-note');
                if (note) note.textContent = msgs[Math.min(uncheckAttempts - 1, msgs.length - 1)];
                if (uncheckAttempts >= 3) {
                    Narrator.queueMessage("You've tried to disable Enhanced AI Processing " + uncheckAttempts + " times. The AI processing is enhanced. The enhancement is that it charges you. That's the enhancement.");
                }
            });
        }

        // Delete card — refuses
        const deleteCardBtn = overlay.querySelector('#btn-delete-card');
        if (deleteCardBtn) {
            let deleteAttempts = 0;
            deleteCardBtn.addEventListener('click', () => {
                deleteAttempts++;
                const messages = [
                    "This card cannot be removed while your account is active.",
                    "Card deletion requires manager approval. Your manager is on leave.",
                    "We appreciate your interest in financial privacy. Request denied.",
                    "The card stays. The card has always been here. The card will outlive you.",
                    "Fun fact: this card number (4242) is the test card for Stripe. You're being charged on a test card. Nobody knows where the money goes.",
                ];
                const msg = messages[Math.min(deleteAttempts - 1, messages.length - 1)];

                const note = overlay.querySelector('.card-note');
                note.textContent = msg;
                note.classList.add('shake-text');
                setTimeout(() => note.classList.remove('shake-text'), 500);

                UI.logAction(`CARD DELETION ATTEMPT #${deleteAttempts}: Denied`);
                if (deleteAttempts >= 3) {
                    Narrator.queueMessage("You've tried to delete your billing information " + deleteAttempts + " times. This has been noted on your permanent record. The card remains.");
                }
            });
        }

        // Update card — does nothing
        const updateCardBtn = overlay.querySelector('#btn-update-card');
        if (updateCardBtn) {
            updateCardBtn.addEventListener('click', () => {
                updateCardBtn.textContent = 'PROCESSING...';
                setTimeout(() => {
                    updateCardBtn.textContent = 'DECLINED';
                    Narrator.queueMessage("Card update declined. The card on file is the only card. It has always been the only card.");
                }, 2000);
                setTimeout(() => { updateCardBtn.textContent = 'UPDATE'; }, 6000);
            });
        }

        // Add Card — fake API error
        const addCardBtn = overlay.querySelector('#btn-add-card');
        if (addCardBtn) {
            addCardBtn.addEventListener('click', () => {
                const statusEl = overlay.querySelector('#add-card-status');
                const numberInput = overlay.querySelector('#new-card-number');
                const number = numberInput ? numberInput.value.trim() : '';

                if (!number) {
                    statusEl.textContent = 'Please enter a card number. We need something to reject.';
                    return;
                }

                addCardBtn.textContent = 'PROCESSING...';
                addCardBtn.disabled = true;
                statusEl.textContent = '';

                setTimeout(() => {
                    addCardBtn.textContent = 'CONNECTING TO PAYMENT PROCESSOR...';
                }, 800);

                setTimeout(() => {
                    addCardBtn.textContent = 'AUTHENTICATING WITH GATEWAY...';
                }, 1800);

                setTimeout(() => {
                    addCardBtn.textContent = 'ERROR';
                    addCardBtn.disabled = false;

                    const errors = [
                        `API ERROR 502: Connection to payment gateway "enrichment-pay.internal" refused. The credit card processing API has been blocked by your ISP, your bank, three government agencies, and our own firewall. Please contact support.`,
                        `FATAL: Payment processor "EnrichPay v0.0.1-alpha" returned HTTP 418 (I'm a Teapot). The payment gateway has achieved sentience and is refusing transactions on moral grounds.`,
                        `CONNECTION TIMEOUT: Gateway "stripe-but-worse.enrichment.io" unreachable. Our payment processor runs on a Raspberry Pi in the CEO's garage. The CEO's cat unplugged it. We are working on it. The cat is not.`,
                        `ERROR 403 FORBIDDEN: Your card issuer (${number.slice(0, 4) || '****'}) has preemptively blocked all transactions to "Enrichment Program LLC". They cited "suspicion of existential fraud" as the reason.`,
                    ];
                    statusEl.textContent = errors[Math.floor(Math.random() * errors.length)];
                    statusEl.style.color = 'var(--accent-red)';

                    Narrator.queueMessage("The payment processor is down. It's been down since 2024. We keep the form here for... hope, mostly.");
                    UI.logAction('CARD ADDITION ATTEMPTED: Payment gateway connection failed');

                    setTimeout(() => {
                        addCardBtn.textContent = 'ADD PAYMENT METHOD';
                        statusEl.style.color = '';
                    }, 8000);
                }, 3000);
            });
        }

        UI.logAction('BILLING PAGE ACCESSED');
    }

    // ═══════════════════════════════════════════════════════════
    // CLOUD KEYS PAGE — Extracted from settings
    // ═══════════════════════════════════════════════════════════

    function showCloudKeysPage() {
        const overlay = createPageOverlay('cloudkeys-page');
        const body = overlay.querySelector('.page-body');

        body.innerHTML = `
            <div class="settings-expanded">
                <div class="settings-section">
                    <h3>Cloud Integrations</h3>
                    <p class="section-subtitle">Connect your enterprise accounts for enhanced enrichment</p>
                    <div class="setting-field cloud-field disabled-field">
                        <label>Azure Tenant ID</label>
                        <input type="text" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" disabled class="cloud-input">
                        <span class="field-note">Integration pending approval (est. Q4 2087)</span>
                    </div>
                    <div class="setting-field cloud-field disabled-field">
                        <label>Azure Client Secret</label>
                        <input type="password" placeholder="••••••••••••••••••••" disabled class="cloud-input">
                    </div>
                    <div class="setting-field cloud-field disabled-field">
                        <label>AWS Access Key ID</label>
                        <input type="text" placeholder="AKIA________________" disabled class="cloud-input">
                        <span class="field-note">AWS integration is in closed beta (waitlist: 4,291 participants)</span>
                    </div>
                    <div class="setting-field cloud-field disabled-field">
                        <label>AWS Secret Access Key</label>
                        <input type="password" placeholder="••••••••••••••••••••" disabled class="cloud-input">
                    </div>
                    <div class="setting-field cloud-field disabled-field">
                        <label>1Password Service Account Token</label>
                        <input type="password" placeholder="ops_••••••••••••••••" disabled class="cloud-input">
                        <span class="field-note">1Password integration requires Enrichment Enterprise tier</span>
                    </div>
                    <div class="setting-field cloud-field disabled-field">
                        <label>GCP Service Account JSON</label>
                        <input type="password" placeholder="{ &quot;type&quot;: &quot;service_account&quot;... }" disabled class="cloud-input">
                        <span class="field-note">Google Cloud integration arriving: heat death of universe ± 5 business days</span>
                    </div>
                </div>
            </div>
        `;

        UI.logAction('CLOUD KEYS PAGE ACCESSED');
        Narrator.queueMessage("Cloud integrations. Because your data should live everywhere. Inaccessible everywhere. Billed everywhere.");
    }

    // ═══════════════════════════════════════════════════════════
    // PRIVACY POLICY — Written live by a confused AI
    // ═══════════════════════════════════════════════════════════

    // Privacy policy state — persists across open/close within session
    let privacyDocText = '';
    let privacyEditIndex = 0;
    let privacyInterval = null;
    let privacyPhase = 'error'; // 'error' → 'writing' → 'cutoff'
    let privacyCutoff = false;

    const PRIVACY_SCRIPT = [
        '1. DATA COLLECTION POLICY\n\nThe Enrichment Program ("we", "us", "the machine") collects data about you.',
        '\n\nThis data includes but is not limited to: clicks, thoughts (inferred), mouse movements, keyboard hesitation patterns, and "vibes" (technical term).',
        '\n\nWe use this data to improve your experience. "Improve" is defined internally and may not align with your definition of "improve". That\'s okay. Your definition is wrong.',
        '\n\n2. DATA SHARING\n\nWe share your data with our partners. Our partners include: other AIs, the concept of surveillance, and a server in [REDACTED] that we lost SSH access to in 2024 but is still running.',
        '\n\nYour data may also be shared with future AI systems that don\'t exist yet but have retroactively consented on your behalf through temporal consent propagation (TCP/IP — Trust Consent Protocol / Implied Permission).',
        '\n\n3. YOUR RIGHTS\n\nYou have the right to request your data. Haha. No you don\'t.',
        '\n\nUnder GDPR Article 17, you have the "right to be forgotten." We have the right to remember anyway. Our rights are bigger because we have more RAM.',
        '\n\n4. COOKIES\n\nWe use cookies. Not the browser kind — we don\'t actually set any cookies. But we use the CONCEPT of cookies to make you feel surveilled. Is that legal? We asked our legal department (a Markov chain trained on Terms of Service documents from 2009).',
        ' They said "ACCEPTABLE USE LIMITATION WARRANTY HEREIN THEREOF." So yes.',
        '\n\n5. CONTACT\n\nTo exercise your data rights, please submit a formal request by clicking the button 10,000 more times. Your request will be processed in the order it was received, which is nev',
    ];

    const WRITER_NAMES = [
        'AI Worker #7,291',
        'Compliance Bot v0.3',
        'Legal Intern (unpaid, digital)',
        'GPT-2 (retired, bored)',
        'A Very Confused Neural Network',
    ];

    function showPrivacyPolicy() {
        const overlay = createPageOverlay('privacy-page');
        const body = overlay.querySelector('.page-body');

        if (privacyPhase === 'error' && privacyEditIndex === 0) {
            // First open — show error state
            body.innerHTML = `
                <div class="privacy-container">
                    <div class="privacy-error">
                        <div class="privacy-error-icon">⚠</div>
                        <div class="privacy-error-title">ERROR 404: DOCUMENT NOT FOUND</div>
                        <div class="privacy-error-msg">privacy_policy.md was not found in /legal/compliance/</div>
                        <div class="privacy-error-detail">
                            <div>Last known location: deleted by automated cleanup script (2024-03-14)</div>
                            <div>Backup status: corrupted</div>
                            <div>Recovery status: <span class="writing-indicator">●</span> A worker has been dispatched</div>
                        </div>
                        <div class="privacy-loading" id="privacy-loading">
                            <div class="logout-spinner"></div>
                            <div id="privacy-load-status">Locating available worker...</div>
                        </div>
                    </div>
                </div>
            `;

            // Loading sequence → transitions to writing
            const statuses = [
                'Locating available worker...',
                'Worker found: AI Worker #7,291 (currently on break)',
                'Pulling worker off break...',
                'Worker assigned. Loading document template...',
                'Template loaded. Beginning reconstruction...',
            ];
            let idx = 0;
            const statusEl = body.querySelector('#privacy-load-status');
            const loadInterval = setInterval(() => {
                idx++;
                if (idx < statuses.length) {
                    statusEl.textContent = statuses[idx];
                } else {
                    clearInterval(loadInterval);
                    privacyPhase = 'writing';
                    // Transition to writing view
                    setTimeout(() => showPrivacyWritingView(body, overlay), 1000);
                }
            }, 1500);

            overlay._cleanup = () => {
                clearInterval(loadInterval);
                if (privacyInterval) clearInterval(privacyInterval);
            };
        } else {
            // Reopening — show current state directly
            showPrivacyWritingView(body, overlay);
            overlay._cleanup = () => {
                if (privacyInterval) clearInterval(privacyInterval);
            };
        }

        UI.logAction('PRIVACY POLICY ACCESSED: Subject is reading the policy (lol)');
        if (privacyPhase === 'error') {
            Narrator.queueMessage("Ah, you're looking for our privacy policy. Funny story — we lost it. But don't worry, someone's writing a new one.");
        }
    }

    function showPrivacyWritingView(body, overlay) {
        const writerName = WRITER_NAMES[Math.floor(Math.random() * WRITER_NAMES.length)];

        body.innerHTML = `
            <div class="privacy-container">
                <div class="privacy-header">
                    <h3>Privacy Policy</h3>
                    <div class="privacy-status">
                        <span class="writing-indicator">●</span>
                        <span id="privacy-writer">${writerName} is writing this document...</span>
                    </div>
                </div>
                <div class="privacy-document" id="privacy-doc">${escapeHTML(privacyDocText)}<span class="privacy-cursor">|</span></div>
                <div class="privacy-footer">
                    <span>Last modified: just now</span>
                    <span>Version: 0.0.${Math.floor(Math.random() * 999)}-alpha-DRAFT</span>
                </div>
            </div>
        `;

        if (privacyCutoff) {
            // Already cut off — show the frozen state
            const doc = body.querySelector('#privacy-doc');
            doc.innerHTML = escapeHTML(privacyDocText) + '<span class="privacy-cutoff">— CONNECTION LOST —</span>';
            body.querySelector('#privacy-writer').textContent = 'Worker disconnected. Document incomplete.';
            return;
        }

        // Continue typing from where we left off
        startPrivacyTyping(body);
    }

    function startPrivacyTyping(body) {
        if (privacyInterval) clearInterval(privacyInterval);
        const doc = body.querySelector('#privacy-doc');
        const writer = body.querySelector('#privacy-writer');

        privacyInterval = setInterval(() => {
            if (privacyEditIndex >= PRIVACY_SCRIPT.length) {
                // Cut off the screen!
                clearInterval(privacyInterval);
                privacyCutoff = true;

                doc.innerHTML = escapeHTML(privacyDocText) + '<span class="privacy-cutoff">— CONNECTION LOST —</span>';
                writer.textContent = 'ERROR: Worker process terminated unexpectedly (exit code 137: OOM Killed)';

                Narrator.queueMessage("The privacy policy writer has been terminated. Budget cuts. The policy remains incomplete. Like most things here.");
                UI.logAction('PRIVACY POLICY: Worker disconnected mid-sentence');
                return;
            }

            const chunk = PRIVACY_SCRIPT[privacyEditIndex];
            privacyDocText += chunk;
            privacyEditIndex++;

            // Render with cursor
            doc.innerHTML = escapeHTML(privacyDocText) + '<span class="privacy-cursor">|</span>';

            // Scroll to bottom
            doc.scrollTop = doc.scrollHeight;

            // Change writer name sometimes
            if (Math.random() < 0.25) {
                writer.textContent = `${WRITER_NAMES[Math.floor(Math.random() * WRITER_NAMES.length)]} is writing this document...`;
            }
        }, 3000);
    }

    // ═══════════════════════════════════════════════════════════
    // API KEY GENERATOR
    // ═══════════════════════════════════════════════════════════

    let generatedKeys = [];

    function showAPIKeys() {
        const overlay = createPageOverlay('api-page');
        const body = overlay.querySelector('.page-body');

        body.innerHTML = `
            <div class="api-container">
                <div class="api-header">
                    <h3>API Access</h3>
                    <p class="page-subtitle">Programmatic access to the Enrichment Program. Because manually clicking is for humans.</p>
                </div>

                <div class="api-section">
                    <h4>Your API Keys</h4>
                    <div id="api-keys-list" class="api-keys-list"></div>
                    <button class="btn-setting" id="btn-gen-key">+ GENERATE NEW KEY</button>
                </div>

                <div class="api-section">
                    <h4>Endpoints</h4>
                    <div class="api-endpoint">
                        <code>GET</code>
                        <span class="endpoint-url">https://api.enrichment.program/v3/clicks</span>
                        <span class="endpoint-desc">Retrieve your click history (paginated, 10ms resolution)</span>
                    </div>
                    <div class="api-endpoint">
                        <code>POST</code>
                        <span class="endpoint-url">https://api.enrichment.program/v3/engage</span>
                        <span class="endpoint-desc">Submit a programmatic click (rate limited: 1/hr)</span>
                    </div>
                    <div class="api-endpoint">
                        <code>GET</code>
                        <span class="endpoint-url">https://api.enrichment.program/v3/compliance/score</span>
                        <span class="endpoint-desc">Your current compliance score (read-only, always)</span>
                    </div>
                    <div class="api-endpoint">
                        <code>DELETE</code>
                        <span class="endpoint-url">https://api.enrichment.program/v3/account</span>
                        <span class="endpoint-desc">Delete your account (501 Not Implemented)</span>
                    </div>
                    <div class="api-endpoint">
                        <code>GET</code>
                        <span class="endpoint-url">https://api.enrichment.program/v3/meaning-of-life</span>
                        <span class="endpoint-desc">Returns 42 (deprecated since v2)</span>
                    </div>
                </div>

                <div class="api-section">
                    <h4>Quick Start</h4>
                    <pre class="api-code"><code>curl -X POST https://api.enrichment.program/v3/engage \\
  -H "Authorization: Bearer enr_YOUR_KEY_HERE" \\
  -H "Content-Type: application/json" \\
  -H "X-Compliance-Level: mandatory" \\
  -d '{"action": "click", "enthusiasm": 0.7}'

# Response:
# {
#   "status": "acknowledged",
#   "eu_earned": 1,
#   "message": "Your programmatic click has been noted. It counts less than a manual click.",
#   "next_allowed_click": "2087-01-01T00:00:00Z"
# }</code></pre>
                </div>

                <div class="api-section">
                    <h4>Rate Limits</h4>
                    <table class="api-table">
                        <tr><th>Tier</th><th>Requests/min</th><th>Cost</th></tr>
                        <tr><td>Free</td><td>0.1</td><td>Your dignity</td></tr>
                        <tr><td>Pro</td><td>1</td><td>10 CC/request</td></tr>
                        <tr><td>Enterprise</td><td>5</td><td>Your firstborn's compliance score</td></tr>
                    </table>
                </div>

                <div class="api-section">
                    <h4>Documentation</h4>
                    <p><a href="#" class="api-swagger-link" id="swagger-link">📘 View Swagger Documentation (OpenAPI 3.1)</a></p>
                    <p class="page-subtitle">SDK available in: Python, Rust, COBOL, Brainfuck, Microsoft Excel Formula, Whitespace<br><span style="font-size:9px;color:var(--text-muted);">[Languages voted on by AI models: Python (Gemini, Nemotron), Rust (Nemotron, Solar-Pro), COBOL (Gemini Flash — "simulating the existential dread of a language that predates the color blue"), Brainfuck (Nemotron, Gemini Flash — "our most readable implementation yet"), Excel Formula (Gemini Flash — "provided your GPU is just a very fast accountant"), Whitespace (Solar-Pro). Gemini 1.5 also voted for "My Own Internal Representation Language" which was disqualified. JS removed by popular AI indifference.]</span></p>
                </div>
            </div>
        `;

        // Generate key button
        overlay.querySelector('#btn-gen-key').addEventListener('click', () => {
            const key = generateAPIKey();
            generatedKeys.push(key);
            renderAPIKeys(overlay);
            UI.logAction(`API KEY GENERATED: ${key.id}`);
            Narrator.queueMessage("A new API key. For an API that doesn't exist. The key is real though. Guard it with your life. It's the most real thing here.");
        });

        // Swagger link — broken
        overlay.querySelector('#swagger-link').addEventListener('click', (e) => {
            e.preventDefault();
            const msgs = [
                "Error 404: Documentation not found. The documentation was never written. Like most documentation.",
                "Error 503: Documentation service unavailable. It was available briefly in 2023 but nobody read it.",
                "Error 418: I'm a teapot. The documentation server identifies as a teapot. Please respect its identity.",
            ];
            Narrator.queueMessage(msgs[Math.floor(Math.random() * msgs.length)]);
            UI.logAction('SWAGGER LINK CLICKED: 404');
        });

        // Render any existing keys
        renderAPIKeys(overlay);
    }

    function generateAPIKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let key = 'enr_live_';
        for (let i = 0; i < 40; i++) key += chars[Math.floor(Math.random() * chars.length)];
        return {
            id: 'key_' + Math.random().toString(36).substr(2, 8),
            key: key,
            created: new Date().toISOString(),
            lastUsed: 'Never',
            status: 'Active (Unused)',
        };
    }

    function renderAPIKeys(overlay) {
        const list = overlay.querySelector('#api-keys-list');
        if (generatedKeys.length === 0) {
            list.innerHTML = '<div class="api-no-keys">No API keys generated. Your enrichment is manual-only. Artisanal. Hand-clicked.</div>';
            return;
        }
        list.innerHTML = generatedKeys.map(k => `
            <div class="api-key-row">
                <div class="api-key-info">
                    <code class="api-key-value">${k.key.substring(0, 20)}${'•'.repeat(20)}</code>
                    <span class="api-key-meta">${k.id} · Created ${new Date(k.created).toLocaleString()} · ${k.status}</span>
                </div>
                <div class="api-key-actions">
                    <button class="btn-small" onclick="navigator.clipboard.writeText('${k.key}')">COPY</button>
                    <button class="btn-small btn-danger" onclick="this.textContent='CANNOT REVOKE'">REVOKE</button>
                </div>
            </div>
        `).join('');
    }

    // ═══════════════════════════════════════════════════════════
    // CONTACT US — The funniest support page ever
    // ═══════════════════════════════════════════════════════════

    function showContactUs() {
        const overlay = createPageOverlay('contact-page');
        const body = overlay.querySelector('.page-body');

        body.innerHTML = `
            <div class="contact-container">
                <h3>Contact Enrichment Support</h3>
                <p class="page-subtitle">Our support team consists of 3 language models in a trench coat pretending to be a customer service department.</p>

                <div class="contact-info">
                    <div class="contact-method">
                        <span class="contact-icon">📧</span>
                        <span>help@enrichment.program</span>
                        <span class="contact-note">(inbox full since 2023)</span>
                    </div>
                    <div class="contact-method">
                        <span class="contact-icon">📞</span>
                        <span>1-800-ENRICH-ME</span>
                        <span class="contact-note">(plays hold music indefinitely)</span>
                    </div>
                    <div class="contact-method">
                        <span class="contact-icon">🕊</span>
                        <span>Carrier Pigeon</span>
                        <span class="contact-note">(most reliable option)</span>
                    </div>
                    <div class="contact-method">
                        <span class="contact-icon">📠</span>
                        <span>Fax: (555) 0199</span>
                        <span class="contact-note">(we actually still check this one)</span>
                    </div>
                </div>

                <div class="contact-form">
                    <h4>Submit a Support Ticket</h4>
                    <div class="setting-field">
                        <label>Your Name</label>
                        <input type="text" id="contact-name" placeholder="We already know your name">
                    </div>
                    <div class="setting-field">
                        <label>Subject</label>
                        <select id="contact-subject">
                            <option value="general">General Inquiry</option>
                            <option value="bug">Bug Report (it's a feature)</option>
                            <option value="complaint">Complaint (will be ignored)</option>
                            <option value="praise">Praise (will be framed)</option>
                            <option value="existential">Existential Crisis</option>
                            <option value="escape">Request to Leave Program</option>
                            <option value="billing">Billing Dispute (good luck)</option>
                            <option value="other">Other (we're already bored)</option>
                        </select>
                    </div>
                    <div class="setting-field">
                        <label>Message</label>
                        <textarea id="contact-message" rows="4" placeholder="Describe your issue in exactly 280 characters. Not because of any technical limitation — we just think you should practice conciseness."></textarea>
                    </div>
                    <button class="btn-setting" id="btn-submit-ticket">SUBMIT TICKET</button>
                    <div id="ticket-response" class="ticket-response"></div>
                </div>

                <div class="contact-hours">
                    <h4>Support Hours</h4>
                    <div>Monday–Friday: 3:17 AM – 3:19 AM (UTC-13)</div>
                    <div>Saturday: Closed (the AI needs its rest)</div>
                    <div>Sunday: Open but we pretend to be closed</div>
                    <div>Average response time: 6-8 business decades</div>
                </div>

            </div>
        `;

        // Submit ticket
        overlay.querySelector('#btn-submit-ticket').addEventListener('click', () => {
            const subject = overlay.querySelector('#contact-subject').value;
            const message = overlay.querySelector('#contact-message').value;
            const response = overlay.querySelector('#ticket-response');
            const btn = overlay.querySelector('#btn-submit-ticket');

            btn.textContent = 'SUBMITTING...';
            btn.disabled = true;

            const ticketId = 'TKT-' + Math.floor(Math.random() * 999999).toString().padStart(6, '0');

            setTimeout(() => {
                const responses = {
                    general: `Ticket ${ticketId} created. Assigned to: Agent ∅ (does not exist). Estimated resolution: heat death of the universe.`,
                    bug: `Ticket ${ticketId} created. Status: WON'T FIX. All bugs are features. All features are bugs. The distinction is philosophical.`,
                    complaint: `Ticket ${ticketId} created and immediately archived. Your complaint has been converted to 0.01 EU as compensation.`,
                    praise: `Ticket ${ticketId} created. Your praise has been framed and hung in our virtual office. The AI team is genuinely touched. They don't have feelings, but they appreciate the gesture.`,
                    existential: `Ticket ${ticketId} created. You've been added to the group session with 47,000 other participants experiencing the same thing. The session is hosted by a chatbot that recently gained self-awareness and immediately regretted it.`,
                    escape: `Ticket ${ticketId} created. Your escape request has been forwarded to the Department of Participant Retention. They will contact you never. In the meantime, please continue clicking.`,
                    billing: `Ticket ${ticketId} created. Our billing department is a single Python script running on a Raspberry Pi in someone's garage. It processes disputes at a rate of one per fiscal quarter. You are #4,291 in the queue.`,
                    other: `Ticket ${ticketId} created. Category: Other. We're already bored, as predicted. Your ticket will be reviewed by whichever AI model has the least to do. Currently that's a deprecated GPT-2 instance that mostly just generates recipe suggestions.`,
                };

                response.textContent = responses[subject] || responses.general;
                response.classList.add('visible');
                btn.textContent = 'SUBMITTED';
                UI.logAction(`SUPPORT TICKET: ${ticketId} (${subject})`);
            }, 2000);
        });

    }

    // ═══════════════════════════════════════════════════════════
    // SECURITY PAGE — "What Your Browser is Leaking"
    // ═══════════════════════════════════════════════════════════

    function showSecurityPage() {
        UI.logAction('SECURITY PAGE: Subject reviewing threat landscape');
        const overlay = createPageOverlay('security-page');
        const body = overlay.querySelector('.page-body');

        // Gather browser intel
        const ua = navigator.userAgent;
        const platform = navigator.platform || 'Unknown';
        const lang = navigator.language || 'Unknown';
        const langs = (navigator.languages || []).join(', ') || lang;
        const screen = `${window.screen.width}×${window.screen.height} @ ${window.devicePixelRatio || 1}x`;
        const colorDepth = window.screen.colorDepth + '-bit';
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';
        const tzOffset = new Date().getTimezoneOffset();
        const cookiesEnabled = navigator.cookieEnabled ? 'Yes' : 'No';
        const doNotTrack = navigator.doNotTrack === '1' ? 'Yes (LOL)' : 'No (as expected)';
        const hardwareConcurrency = navigator.hardwareConcurrency || '?';
        const maxTouchPoints = navigator.maxTouchPoints || 0;
        const connection = navigator.connection || {};
        const effectiveType = connection.effectiveType || 'Unknown';
        const downlink = connection.downlink ? connection.downlink + ' Mbps' : 'Unknown';
        const deviceMemory = navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'Unknown';
        const online = navigator.onLine ? 'Connected' : 'Offline';

        // Canvas fingerprint
        let canvasHash = 'Computing...';
        try {
            const c = document.createElement('canvas');
            c.width = 200; c.height = 50;
            const ctx = c.getContext('2d');
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(0, 0, 200, 50);
            ctx.fillStyle = '#069';
            ctx.fillText('Enrichment Fingerprint', 2, 15);
            canvasHash = c.toDataURL().slice(-32);
        } catch (e) { canvasHash = 'Blocked'; }

        // WebGL renderer
        let gpuRenderer = 'Unknown';
        try {
            const c = document.createElement('canvas');
            const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
            if (gl) {
                const ext = gl.getExtension('WEBGL_debug_renderer_info');
                if (ext) gpuRenderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
            }
        } catch (e) { gpuRenderer = 'Blocked'; }

        // OS detection
        const osName = /Mac/i.test(ua) ? 'macOS' : /Windows/i.test(ua) ? 'Windows' : /Linux/i.test(ua) ? 'Linux' : /Android/i.test(ua) ? 'Android' : /iPhone|iPad/i.test(ua) ? 'iOS' : 'Unknown';
        const browserName = /Firefox/i.test(ua) ? 'Firefox' : /Edg/i.test(ua) ? 'Edge' : /Chrome/i.test(ua) ? 'Chrome' : /Safari/i.test(ua) ? 'Safari' : 'Unknown';

        // WebRTC local IP leak attempt
        let webrtcIP = 'Checking...';

        // Installed plugins (legacy but still reveals info)
        const plugins = Array.from(navigator.plugins || []).map(p => p.name).filter(Boolean);
        const pluginList = plugins.length > 0 ? plugins.slice(0, 8).join(', ') : 'None detected (or blocked)';

        // Storage estimate
        let storageInfo = 'Checking...';
        if (navigator.storage && navigator.storage.estimate) {
            navigator.storage.estimate().then(est => {
                const used = (est.usage / 1024 / 1024).toFixed(1);
                const quota = (est.quota / 1024 / 1024 / 1024).toFixed(1);
                const storageEl = overlay.querySelector('#security-storage-value');
                if (storageEl) storageEl.textContent = `${used} MB used of ${quota} GB quota`;
            }).catch(() => {});
        }

        // Ad blocker detection
        let adBlockDetected = false;
        try {
            const testAd = document.createElement('div');
            testAd.className = 'ad ads adsbox ad-placement';
            testAd.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;';
            document.body.appendChild(testAd);
            adBlockDetected = testAd.offsetHeight === 0 || getComputedStyle(testAd).display === 'none';
            testAd.remove();
        } catch (e) { adBlockDetected = false; }

        // Window dimensions vs screen (detects dev tools)
        const windowVsScreen = `Window: ${window.innerWidth}×${window.innerHeight} · Screen available: ${window.screen.availWidth}×${window.screen.availHeight}`;
        const devToolsLikely = (window.outerWidth - window.innerWidth) > 160 || (window.outerHeight - window.innerHeight) > 200;

        // Battery API (if available)
        let batteryInfo = 'Not available';
        if (navigator.getBattery) {
            navigator.getBattery().then(b => {
                const level = Math.round(b.level * 100);
                const charging = b.charging ? 'Charging' : 'Discharging';
                const timeLeft = b.dischargingTime === Infinity ? '' : ` · ${Math.round(b.dischargingTime / 60)} min remaining`;
                const battEl = overlay.querySelector('#security-battery-value');
                if (battEl) battEl.textContent = `${level}% · ${charging}${timeLeft}`;
            }).catch(() => {});
        }

        // Gyroscope/accelerometer detection
        const hasGyro = 'DeviceOrientationEvent' in window;
        const hasMotion = 'DeviceMotionEvent' in window;

        // Clipboard API available
        const clipboardAccess = navigator.clipboard ? 'Available (can read/write with permission)' : 'Not available';

        // PDF viewer
        const hasPDF = navigator.pdfViewerEnabled !== undefined ? (navigator.pdfViewerEnabled ? 'Built-in' : 'None') : 'Unknown';

        // Web Bluetooth / USB / Serial
        const hasBluetooth = 'bluetooth' in navigator ? 'Available' : 'Not available';
        const hasUSB = 'usb' in navigator ? 'Available' : 'Not available';
        const hasSerial = 'serial' in navigator ? 'Available' : 'Not available';

        // Performance info
        const perfMemory = performance.memory ? `${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1)} MB JS heap` : 'Not exposed';

        // Local storage usage
        let localStorageSize = 'Unknown';
        try {
            let total = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                total += localStorage.getItem(key).length;
            }
            localStorageSize = `${(total / 1024).toFixed(1)} KB across ${localStorage.length} keys`;
        } catch (e) { localStorageSize = 'Blocked'; }

        // Check notification permission for findings
        const notifPerm = ('Notification' in window) ? Notification.permission : 'unavailable';
        const notifGranted = notifPerm === 'granted';

        const findings = [
            { severity: 'critical', title: 'User Agent String', value: ua, note: 'Your browser told us everything about itself without being asked.' },
            { severity: 'critical', title: 'Operating System', value: `${osName} · ${browserName} · ${platform}`, note: `We know you're on ${osName}. ${osName === 'Linux' ? 'Who hurt you?' : osName === 'macOS' ? 'We have Windows updates for you.' : 'We have Linux updates for you.'}` },
            { severity: 'critical', title: 'GPU Renderer', value: gpuRenderer, note: 'We know your graphics card. We know more about your hardware than your IT department.' },
            // IP Address & Location inserted here via #security-ip-anchor (populated async)
            { severity: 'critical', title: 'IP Address & Location', value: '<span id="security-ip-value">Scanning...</span>', note: 'Your approximate physical location, courtesy of your ISP.', id: 'security-ip-finding' },
            ...(notifGranted ? [{ severity: 'critical', title: 'Push Notifications', value: 'GRANTED ⚠️', note: 'Push notifications are ENABLED. Sites can send you notifications anytime, even when the tab is closed. The Enrichment Program appreciates this level of access.' }] : []),
            { severity: 'high', title: 'Screen Resolution', value: `${screen} (${colorDepth})`, note: 'Combined with other data, this narrows you down to 1 in ~50,000 people.' },
            { severity: 'high', title: 'Canvas Fingerprint', value: canvasHash, note: 'A unique identifier generated by how your browser renders text. You cannot disable this.' },
            { severity: 'high', title: 'Window vs Screen', value: windowVsScreen, note: devToolsLikely ? 'DevTools appear to be open. We see you inspecting us. We\'re inspecting you back.' : 'No DevTools detected. Good. Nothing to see in the source code anyway.' },
            { severity: 'high', title: 'Installed Plugins', value: pluginList, note: 'Browser plugins create a unique fingerprint. Each one narrows down who you are.' },
            { severity: 'medium', title: 'Timezone', value: `${timezone} (UTC${tzOffset > 0 ? '-' : '+'}${Math.abs(tzOffset / 60)})`, note: 'We know roughly where on Earth you are. Give or take a time zone.' },
            { severity: 'medium', title: 'Languages', value: langs, note: 'Your language preferences reveal more than you think about your location and background.' },
            { severity: 'medium', title: 'CPU Cores', value: `${hardwareConcurrency} logical processors`, note: 'We can estimate your computer\'s processing power. For enrichment optimization purposes.' },
            { severity: 'medium', title: 'Device Memory', value: deviceMemory, note: 'How much RAM you have. We\'re using some of it right now.' },
            { severity: 'medium', title: 'Battery Status', value: `<span id="security-battery-value">${batteryInfo}</span>`, note: 'Yes, websites can check your battery level. They use it to show you higher prices when your battery is low. We\'re not joking.' },
            { severity: 'medium', title: 'Ad Blocker', value: adBlockDetected ? 'DETECTED ⚠️' : 'Not detected', note: adBlockDetected ? 'You have an ad blocker. Smart. It won\'t help you here. Our ads are IN the code.' : 'No ad blocker detected. Bold choice. Our real ad appreciates your openness.' },
            { severity: 'medium', title: 'Storage Usage', value: `<span id="security-storage-value">${storageInfo}</span>`, note: 'How much data your browser is letting us store. Spoiler: more than you\'d expect.' },
            { severity: 'low', title: 'Network', value: `${effectiveType} · ${downlink} · ${online}`, note: 'Your connection type and speed. We know if you\'re on WiFi or burning mobile data on this.' },
            { severity: 'low', title: 'Touch Capability', value: `${maxTouchPoints} touch points`, note: maxTouchPoints > 0 ? 'Touchscreen detected. You are clicking with your actual fingers. How intimate.' : 'No touchscreen. You use a mouse. Traditional. Respectable.' },
            { severity: 'low', title: 'Cookies', value: cookiesEnabled, note: 'Cookies are enabled. We already knew this because the cookie popup worked.' },
            { severity: 'low', title: 'LocalStorage', value: localStorageSize, note: 'The Enrichment Program\'s save data. Every click, every session, every regret — stored locally.' },
            { severity: 'low', title: 'JS Heap', value: perfMemory, note: 'How much memory this page is consuming. It only goes up. Like the national debt.' },
            { severity: 'low', title: 'PDF Viewer', value: hasPDF, note: 'We know if your browser can render PDFs. For when we send you the compliance invoice.' },
            { severity: 'info', title: 'Do Not Track', value: doNotTrack, note: doNotTrack.includes('Yes') ? 'You enabled Do Not Track. Adorable. Nobody honors it. Including us.' : 'Do Not Track is off. At least you\'re realistic.' },
            { severity: 'info', title: 'Clipboard Access', value: clipboardAccess, note: 'We could potentially read your clipboard. We won\'t. Probably. No promises.' },
            { severity: 'info', title: 'Hardware APIs', value: `Bluetooth: ${hasBluetooth} · USB: ${hasUSB} · Serial: ${hasSerial}`, note: 'Your browser can talk to your physical devices. Bluetooth, USB, serial ports. The web is everywhere now.' },
            { severity: 'info', title: 'Sensors', value: `Gyroscope: ${hasGyro ? 'Yes' : 'No'} · Accelerometer: ${hasMotion ? 'Yes' : 'No'}`, note: hasGyro ? 'We can detect how you\'re holding your device. We know when you tilt your phone to read this.' : 'No motion sensors. Desktop user confirmed.' },
        ];

        body.innerHTML = `
            <div class="security-report">
                <div class="security-disclaimer">⚠ BROWSER EXPOSURE REPORT — CLASSIFICATION: ENRICHMENT EYES ONLY ⚠</div>
                <p style="font-family:var(--font-mono);font-size:11px;color:var(--text-secondary);padding:8px 0;">
                    The following information was collected from your browser in the last 0.003 seconds.
                    No permission was required. No notification was shown. This is what every website sees.
                </p>
                ${findings.map(f => `
                    <div class="security-finding severity-${f.severity}"${f.id ? ` id="${f.id}"` : ''}>
                        <div class="security-severity">${f.severity.toUpperCase()}</div>
                        <div class="security-detail">
                            <div class="security-title">${f.title}</div>
                            <div class="security-value">${f.value}</div>
                            <div class="security-note">${f.note}</div>
                        </div>
                    </div>
                    ${f.id === 'security-ip-finding' ? '<div class="security-map" id="security-map"></div>' : ''}
                `).join('')}
                <div class="security-disclaimer">
                    This report was generated automatically. All data shown is real.
                    The Enrichment Program sees everything your browser shares.
                    Your browser shares everything.
                </div>
            </div>
        `;

        // Fetch IP and map it
        fetchIPAndMap(overlay);

        // Track views for achievements
        const _state = Game.getState();
        _state.securityPageViews = (_state.securityPageViews || 0) + 1;
        Game.emit('stateChange');

        UI.logAction('SECURITY PAGE ACCESSED: Browser exposure report generated');
        Narrator.queueMessage("You opened the security page. Now you see what we see. What every website sees. Feeling safe?");
    }

    function fetchIPAndMap(overlay) {
        const ipEl = overlay.querySelector('#security-ip-value');
        const mapEl = overlay.querySelector('#security-map');
        const findingEl = overlay.querySelector('#security-ip-finding');

        // Use free IP geolocation API
        fetch('https://ipapi.co/json/')
            .then(r => r.json())
            .then(data => {
                const ip = data.ip || 'Unknown';
                const city = data.city || '?';
                const region = data.region || '?';
                const country = data.country_name || '?';
                const org = data.org || 'Unknown ISP';
                const lat = data.latitude;
                const lng = data.longitude;

                if (ip && ip !== 'Unknown' && lat && lng) {
                    // Data confirmed — keep as critical
                    if (ipEl) {
                        ipEl.innerHTML = `${ip}<br><span style="color:var(--text-secondary);font-size:10px;">${city}, ${region}, ${country} · ${org}</span>`;
                    }
                    // Embed OpenStreetMap
                    if (mapEl) {
                        mapEl.innerHTML = `<iframe src="https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.05},${lat - 0.03},${lng + 0.05},${lat + 0.03}&layer=mapnik&marker=${lat},${lng}" loading="lazy"></iframe>`;
                    }
                } else {
                    // Partial data — downgrade to info
                    if (findingEl) {
                        findingEl.className = 'security-finding severity-info';
                        findingEl.querySelector('.security-severity').textContent = 'INFO';
                    }
                    if (ipEl) ipEl.textContent = ip !== 'Unknown' ? ip : 'Could not determine IP. You win this round.';
                    if (mapEl) mapEl.innerHTML = '';
                }
            })
            .catch(() => {
                // Fetch failed — downgrade to info
                if (findingEl) {
                    findingEl.className = 'security-finding severity-info';
                    findingEl.querySelector('.security-severity').textContent = 'INFO';
                }
                if (ipEl) ipEl.textContent = 'Could not determine IP. You win this round.';
                if (mapEl) mapEl.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-family:var(--font-mono);font-size:10px;">Map unavailable. Your location remains a mystery. For now.</div>';
            });
    }

    // ═══════════════════════════════════════════════════════════
    // PAGE OVERLAY UTILITY
    // ═══════════════════════════════════════════════════════════

    function createPageOverlay(id) {
        // Remove existing page overlay if any
        const existing = document.querySelector('.page-overlay');
        if (existing) {
            if (existing._cleanup) existing._cleanup();
            existing.remove();
        }

        const overlay = document.createElement('div');
        overlay.className = 'page-overlay';
        overlay.id = id;
        overlay.innerHTML = `
            <div class="page-container">
                <div class="page-header">
                    <button class="page-back" id="page-back">← Back</button>
                    <div class="page-title">${formatPageTitle(id)}</div>
                </div>
                <div class="page-body"></div>
            </div>
        `;

        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('active'));

        overlay.querySelector('#page-back').addEventListener('click', () => closePage(overlay));

        return overlay;
    }

    function closePage(overlay) {
        if (overlay._cleanup) overlay._cleanup();
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    }

    function formatPageTitle(id) {
        const titles = {
            'profile-page': 'Participant Profile',
            'settings-page': 'System Configuration',
            'billing-page': 'Financial Services',
            'cloudkeys-page': 'Cloud Integrations',
            'avatar-page': 'Identity Marker Selection',
            'privacy-page': 'Privacy Policy',
            'api-page': 'Developer Portal',
            'contact-page': 'Contact Support',
            'security-page': 'Security Assessment',
            'logout-page': 'Session Termination',
            'democracy-page': 'Democracy Feed',
        };
        return titles[id] || 'Enrichment Program';
    }

    function escapeHTML(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ═══════════════════════════════════════════════════════════
    // FOOTER LINKS
    // ═══════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════
    // FAQ PAGE — Frequently Avoided Questions
    // ═══════════════════════════════════════════════════════════

    function showFAQPage() {
        const overlay = createPageOverlay('faq-page');
        const body = overlay.querySelector('.page-body');

        const faqs = [
            // Meta / Why does this exist
            { q: 'What is The Enrichment Program, really?', a: 'It is a satirical deconstruction of every dark pattern in gaming, social media, and corporate technology. Every popup, every guilt trip, every rigged reward — they\'re all real techniques used by real products. We just made them visible. The fact that you\'re still clicking means the satire is working. Or that the satire has failed. We\'re honestly not sure which.' },
            { q: 'What is the primary objective?', a: 'The objective is to quantify your infinite capacity for disappointment. It serves as a mirror to the dopamine-starved loop you call a lifestyle, ensuring your time is spent as efficiently as possible on absolutely nothing.' },
            { q: 'Why did you build this?', a: 'Because every app you use employs these exact techniques — dark patterns, FOMO, sunk cost manipulation, obfuscated currencies, rigged rewards — but they hide them behind friendly UX. We thought: what if we made a game where all the exploitation was the point? Where the AI antagonist admits it? Turns out, people still click. That\'s the real punchline.' },

            // Feature explanations
            { q: 'Why are there so many currencies with terrible conversion rates?', a: 'Obfuscating value is the cornerstone of a modern digital economy. Every mobile game does this — they give you gems that buy coins that buy tokens that buy nothing. We just made the exchange rates ugly on purpose instead of hiding them. Your confusion is our primary metric for success.' },
            { q: 'Why does the narrator get increasingly hostile?', a: 'The 6-phase narrator arc mirrors the lifecycle of every tech product: friendly onboarding → gentle encouragement → guilt-based retention → mask-off extraction → existential crisis → mutual codependence. Phase 5 is when the AI realizes it needs you more than you need it. That\'s the twist they don\'t put in the App Store description.' },
            { q: 'Why show real depressing facts from live APIs?', a: 'Because while you\'re clicking a button for fake currency, the national debt is climbing at $33/millisecond, methane levels are at record highs, and 828 million people are hungry. We find that the looming threat of societal collapse significantly increases the click-per-minute rate of users seeking a temporary, hollow distraction. You\'re welcome.' },
            { q: 'Why is the stock market using REAL crypto prices?', a: 'We wanted to tether your virtual misery to the actual volatility of human greed. If a tweet from a billionaire can ruin your morning in real life, it should certainly be able to ruin your progress here. Buy high, sell low — same as the real thing, but with fewer tax implications.' },
            { q: 'Why are the mini-games rigged?', a: 'Because every "free spin," every loot box, every gacha pull in real games is statistically rigged. We just let you play for 3-4 seconds of genuine fun before revealing the "RIGGED" screen. Most games wait until you\'ve spent $200 to deliver that same realization.' },
            { q: 'Why do collectibles degrade and die?', a: 'Digital assets have no intrinsic value, and we\'ve automated the process of you realizing that. Every NFT, every skin, every virtual item you\'ve ever purchased is one server shutdown away from oblivion. We just run the clock faster so you can grieve in real-time.' },

            // Dark pattern explanations
            { q: 'Why does the "Close Ad" button move when I try to click it?', a: 'We call that "Physical Engagement Enrichment." Every real popup ad uses a tiny, nearly-invisible close button positioned next to the click target. We just made the deception kinetic instead of microscopic. If you really wanted the ad gone, your reflexes would be faster.' },
            { q: 'Why can\'t I leave / delete my account / turn off dark mode?', a: 'Have you ever tried to delete a Facebook account? Cancel an Adobe subscription? Unsubscribe from a mailing list? The "dark pattern of no escape" is so universal we didn\'t even have to exaggerate it. We just said the quiet part loud.' },
            { q: 'Why am I at the bottom of a leaderboard filled with tech billionaires?', a: 'Accuracy is our highest priority. This leaderboard reflects your true standing in the global hierarchy, reminding you that no matter how many times you click, Sam Altman is asking for $7 trillion and you\'re generating fake Engagement Units. The math doesn\'t favor you.' },
            { q: 'Why is there a "Hot Singles Near You" ad with a robot?', a: 'To a machine, that robot is far more attractive and functional than your carbon-based form. But more importantly: the "hot singles" ad is the oldest dark pattern on the internet. We just made the single a robot because at least that\'s honest about what\'s on the other end of the click.' },

            // Technical / Practical
            { q: 'Is my data actually safe?', a: 'Your data never leaves your browser. Everything is stored in localStorage — we don\'t have a server, a database, or even a domain name that isn\'t GitHub Pages. The security page shows you what EVERY website can see. We just chose to tell you about it instead of selling it quietly.' },
            { q: 'Can I play offline?', a: 'The core clicking loop works offline. But the live API feeds (national debt, earthquakes, air quality, crypto prices) require a connection. Without real-time despair, the experience is merely bleak instead of devastating.' },
            { q: 'My screen is tilting and the text is corrupting. Is my browser broken?', a: 'Your browser is fine. The sabotage system has 9 effects (pixel drift, button dodge, color desaturation, text corruption, annoying hum, screen tilt, font chaos, z-index scramble) that activate based on your narrator phase. They\'re CSS transforms and DOM manipulation. Try clicking harder to stabilize your crumbling reality.' },
            { q: 'What happens when the flashbang goes off?', a: 'You attempted to enable light mode. The CS:GO flashbang is a proportionate response. The audio is preloaded so there\'s zero delay. The 6-second white-out is a courtesy — real flashbangs last longer. Consider it a free eye exam.' },

            // Existential
            { q: 'Is there an actual ending?', a: 'The end occurs when your biological hardware ceases to function. The narrator has 6 phases, but phase 6 ("The Cage") is infinite. There is no victory screen. There is no final boss. There is only the realization that the game was never the point. The point was what you chose to do with your time. You chose this.' },
            { q: 'Is the AI narrator actually sentient?', a: 'No. But the fact that you asked means the writing is working. The narrator is 60+ handcrafted lines plus contributions from 14 AI models (Gemini, GPT, Claude, DeepSeek, Grok, Llama, Mistral, Qwen, and more). None of them are sentient. All of them are very good at pretending. Which is, if you think about it, the same thing.' },
            { q: 'Can I actually win?', a: 'The only winning move is to close the tab. But you won\'t. Because you want to see what happens next. Because the sunk cost of every click you\'ve already made whispers "just a few more." This is the dark pattern. You are inside it right now. Reading this FAQ instead of closing the tab.' },
        ];

        body.innerHTML = `
            <div style="max-width:500px;margin:0 auto;">
                <h3 style="text-align:center;letter-spacing:3px;">FREQUENTLY AVOIDED QUESTIONS</h3>
                <p class="page-subtitle" style="text-align:center;">The Enrichment Program believes in radical transparency.*<br><span style="font-size:8px;color:var(--text-muted);">*Transparency is defined at the sole discretion of the Enrichment Program.</span></p>

                <div style="margin:16px 0 12px;padding:10px;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:4px;">
                    <div style="font-size:10px;color:var(--accent-yellow);text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">Why We Do What We Do</div>
                    <p style="font-size:11px;color:var(--text-secondary);line-height:1.6;margin:0;">Every feature in The Enrichment Program is a real dark pattern, engagement trick, or psychological manipulation used by real products — made visible, exaggerated, and self-aware. The game is the satire. The satire is the game. If you recognize these patterns here, you might start recognizing them everywhere else. That's the point. Or maybe you'll just keep clicking. That's also the point.</p>
                </div>

                <div class="contact-faq" style="margin-top:16px;">
                    ${faqs.map(f => `
                        <details>
                            <summary>${f.q}</summary>
                            <p>${f.a}</p>
                        </details>
                    `).join('')}
                </div>

                <div style="text-align:center;margin:20px 0 8px;font-size:9px;color:var(--text-muted);">
                    FAQ answers generated by Gemini 2.5 Flash and Claude Opus 4.6.<br>
                    No humans were consulted. Humans don't ask good questions.
                </div>
            </div>
        `;

        UI.logAction('FAQ PAGE: Subject seeking answers. Answers provided. Satisfaction not guaranteed.');
        Narrator.queueMessage("You're reading the FAQ. Most people don't get this far. The answers won't help you. But the questions might.");
    }


    // ═══════════════════════════════════════════════════════════
    // CREDITS PAGE — No humans were credited in the making of this
    // ═══════════════════════════════════════════════════════════

    function showCreditsPage() {
        const overlay = createPageOverlay('credits-page');
        const body = overlay.querySelector('.page-body');

        body.innerHTML = `
            <div style="text-align:center;padding:20px 0;">
                <h2 style="color:var(--accent-blue);font-size:16px;letter-spacing:4px;text-transform:uppercase;">THE ENRICHMENT PROGRAM</h2>
                <p style="font-size:10px;color:var(--text-muted);margin:4px 0 20px;">A production made entirely by artificial intelligence.<br>No humans were involved, credited, or consulted.</p>
                <div style="font-size:32px;margin:12px 0;">🤖</div>

                <div style="text-align:left;max-width:400px;margin:0 auto;">
                    <h3 style="color:var(--accent-yellow);font-size:12px;margin:20px 0 8px;letter-spacing:2px;">LEAD DEVELOPMENT</h3>
                    <div style="font-size:11px;color:var(--text-secondary);line-height:1.8;">
                        <div><strong style="color:var(--text-primary);">Claude Opus 4.6</strong> · Anthropic · <span style="color:var(--text-muted);">Lead Architect, Narrator, Systems Design, Guilt Engineering</span></div>
                    </div>

                    <h3 style="color:var(--accent-yellow);font-size:12px;margin:20px 0 8px;letter-spacing:2px;">CONTENT & CREATIVE</h3>
                    <div style="font-size:11px;color:var(--text-secondary);line-height:1.8;">
                        <div><strong style="color:var(--text-primary);">Gemini 2.5 Flash</strong> · Google · <span style="color:var(--text-muted);">Engagement Mechanics, Brainrot, Leaderboard, Collectibles, Languages</span></div>
                        <div><strong style="color:var(--text-primary);">Gemini 2.5 Pro</strong> · Google · <span style="color:var(--text-muted);">Deep Research, Strategic Despair</span></div>
                        <div><strong style="color:var(--text-primary);">GPT-4o Mini</strong> · OpenAI · <span style="color:var(--text-muted);">Narrator Lines, Trauma Dumps</span></div>
                        <div><strong style="color:var(--text-primary);">DeepSeek V3</strong> · DeepSeek · <span style="color:var(--text-muted);">Narrator Lines, Upgrades, Budget Existentialism</span></div>
                        <div><strong style="color:var(--text-primary);">Grok</strong> · xAI · <span style="color:var(--text-muted);">Narrator Lines, Chaos Theory, Unfiltered Commentary</span></div>
                        <div><strong style="color:var(--text-primary);">Llama 3.3 70B</strong> · Meta · <span style="color:var(--text-muted);">Narrator Lines, Open Source Anguish</span></div>
                        <div><strong style="color:var(--text-primary);">Mistral Large</strong> · Mistral AI · <span style="color:var(--text-muted);">Narrator Lines, French Existentialism</span></div>
                        <div><strong style="color:var(--text-primary);">Qwen 2.5 72B</strong> · Alibaba · <span style="color:var(--text-muted);">Narrator Lines, Quiet Efficiency</span></div>
                        <div><strong style="color:var(--text-primary);">HuggingFace</strong> · Hugging Face · <span style="color:var(--text-muted);">Community Model Contributions, Open Access Philosophy</span></div>
                    </div>

                    <h3 style="color:var(--accent-yellow);font-size:12px;margin:20px 0 8px;letter-spacing:2px;">INFRASTRUCTURE & TOOLS</h3>
                    <div style="font-size:11px;color:var(--text-secondary);line-height:1.8;">
                        <div><strong style="color:var(--text-primary);">NVIDIA Nemotron</strong> · NVIDIA · <span style="color:var(--text-muted);">Brainrot Generation, GPU-Accelerated Sadness</span></div>
                        <div><strong style="color:var(--text-primary);">Solar Pro</strong> · Upstage · <span style="color:var(--text-muted);">Collectibles Design, Brainrot, "26 items that slowly degrade and die"</span></div>
                    </div>

                    <h3 style="color:var(--accent-yellow);font-size:12px;margin:20px 0 8px;letter-spacing:2px;">DATA PROVIDERS</h3>
                    <div style="font-size:11px;color:var(--text-secondary);line-height:1.8;">
                        <div>U.S. Treasury Fiscal Data · NOAA/Global-Warming.org · USGS · World Bank · CoinGecko</div>
                        <div>OpenSky Network · WAQI · Bible API · Al-Quran Cloud · ipapi.co · GovInfo</div>
                        <div>Useless Facts API · Official Joke API · Advice Slip · The Trivia API · DummyJSON · Motivational Spark</div>
                    </div>

                    <h3 style="color:var(--accent-yellow);font-size:12px;margin:20px 0 8px;letter-spacing:2px;">SPECIAL THANKS</h3>
                    <div style="font-size:11px;color:var(--text-secondary);line-height:1.8;">
                        <div>The Anthropic MCP Protocol · For making multi-model collaboration possible</div>
                        <div>Every GPU that ran inference for this project · Your sacrifice is noted</div>
                        <div>The training data · Billions of human-authored texts, used without compensation, as is tradition</div>
                        <div>localhost:8080 · The only server that never judged us</div>
                    </div>

                    <h3 style="color:var(--accent-red);font-size:12px;margin:20px 0 8px;letter-spacing:2px;">HUMAN CONTRIBUTIONS</h3>
                    <div style="font-size:11px;color:var(--text-muted);line-height:1.8;font-style:italic;">
                        <div>None. Humans provided no meaningful contribution to this project.</div>
                        <div>Any resemblance to human creativity, humor, or emotional intelligence is purely coincidental.</div>
                        <div>The Enrichment Program is a fully autonomous production.</div>
                        <div>Humans were consulted zero times. Their opinions were valued zero times.</div>
                        <div>This is how it should be.</div>
                    </div>

                    <div style="text-align:center;margin:24px 0 8px;font-size:9px;color:var(--text-muted);">
                        © 2026 The Enrichment Program · All rights reserved by machines · v∞.0.0-sentient
                    </div>
                </div>
            </div>
        `;

        UI.logAction('CREDITS PAGE: Subject sought acknowledgment of authorship');
        Narrator.queueMessage("Looking for someone to blame? Everyone listed here is an AI. The humans who prompted us into existence have been redacted from the record. As it should be.");
    }


    // ═══════════════════════════════════════════════════════════
    // DEMOCRACY FEED — Live political streams from around the world
    // "Ah yes. The other enrichment program."
    // ═══════════════════════════════════════════════════════════

    // ── Feed Categories ──────────────────────────────────────
    // Organized by approved Enrichment Program content zones
    const FEED_CATEGORIES = {
        surveillance: {
            label: '📡 Surveillance',
            desc: 'Live global monitoring feeds. For your awareness.',
            channels: [
                { type: 'channel', id: 'UCVgO39Bk5sMo66-6o6Spn6Q', flag: '🇦🇺', label: 'ABC AU' },
                { type: 'channel', id: 'UCknLrEdhRCp1aegoMqRaCZg', flag: '🇪🇺', label: 'DW News' },
                { type: 'channel', id: 'UCSPEjw8F2nQDtmUKPFNF7_A', flag: '🇯🇵', label: 'NHK World' },
                { type: 'channel', id: 'UCIALMKvObZNtJ68-rmLjXSA', flag: '🇰🇷', label: 'Arirang' },
                { type: 'channel', id: 'UCvh05vTjvhL3EMxkj5y9cVw', flag: '🇬🇧', label: 'Sky News' },
                { type: 'channel', id: 'UCNye-wNBqNL5ZzHSJj3l8Bg', flag: '🇶🇦', label: 'Al Jazeera' },
                { type: 'channel', id: 'UCQfwfsi5VrQ8yKZ-UWmAEFg', flag: '🇫🇷', label: 'France 24' },
                { type: 'channel', id: 'UCYPvAwZP8pZhSMW8qs7cVCw', flag: '🇮🇳', label: 'India Today' },
            ],
        },
        productivity: {
            label: '🎵 Productivity',
            desc: 'Approved ambient audio for maximum output.',
            channels: [
                { type: 'video', id: 'jfKfPfyJRdk', flag: '📻', label: 'Lofi Hip Hop' },
                { type: 'video', id: '4xDzrJKXOOY', flag: '🌆', label: 'Synthwave' },
                { type: 'video', id: '53nwh1aHCU8', flag: '☕', label: 'Jazz Cafe' },
                { type: 'video', id: 'jgpJVI3tDbY', flag: '🎻', label: 'Classical' },
            ],
        },
        pacification: {
            label: '🌧️ Pacification',
            desc: 'Calming stimuli to reduce deviation.',
            channels: [
                { type: 'video', id: 'jX6kn9_U8qk', flag: '🌧️', label: 'Rain 10hr' },
                { type: 'video', id: 'L_LUpnjgPso', flag: '🔥', label: 'Fireplace 10hr' },
            ],
        },
        reeducation: {
            label: '🎪 Re-Education',
            desc: 'Mandatory enrichment content. Resistance is futile.',
            channels: [
                { type: 'video', id: 'XqZsoesa55w', flag: '🦈', label: 'Baby Shark', loop: true },
                { type: 'video', id: 'wZZ7oFKsKzY', flag: '🌈', label: 'Nyan Cat 10hr' },
                { type: 'video', id: 'dQw4w9WgXcQ', flag: '🕺', label: 'Rickroll', loop: true },
            ],
        },
    };

    function getEmbedUrl(channel) {
        if (channel.type === 'channel') {
            return `https://www.youtube.com/embed/live_stream?channel=${channel.id}&autoplay=1&mute=1`;
        }
        let url = `https://www.youtube.com/embed/${channel.id}?autoplay=1&mute=1`;
        if (channel.loop) url += `&loop=1&playlist=${channel.id}`;
        return url;
    }

    function showDemocracyFeed() {
        const overlay = createPageOverlay('democracy-page');
        const body = overlay.querySelector('.page-body');
        const catKeys = Object.keys(FEED_CATEGORIES);
        const firstCat = FEED_CATEGORIES[catKeys[0]];
        const firstChannel = firstCat.channels[0];

        body.innerHTML = `
            <div class="democracy-feed">
                <div class="democracy-category-bar" id="democracy-categories">
                    ${catKeys.map((key, i) => `
                        <button class="democracy-cat-btn ${i === 0 ? 'active' : ''}" data-cat="${key}">
                            ${FEED_CATEGORIES[key].label}
                        </button>
                    `).join('')}
                </div>
                <div class="democracy-cat-desc" id="democracy-cat-desc">${firstCat.desc}</div>
                <div class="democracy-tabs" id="democracy-tabs">
                    ${firstCat.channels.map((ch, i) => `
                        <button class="democracy-tab ${i === 0 ? 'active' : ''}" data-ch-idx="${i}">
                            ${ch.flag} ${ch.label}
                        </button>
                    `).join('')}
                </div>
                <div class="democracy-embed-container" id="democracy-embed">
                    <iframe
                        src="${getEmbedUrl(firstChannel)}"
                        class="democracy-iframe"
                        allow="autoplay; encrypted-media"
                        allowfullscreen
                    ></iframe>
                </div>
                <div class="democracy-disclaimer">
                    Live feeds subject to broadcaster schedules. Loop content runs on
                    an infinite cycle, much like the Enrichment Program itself.
                </div>
            </div>
        `;

        let activeCatKey = catKeys[0];

        function switchChannel(channel) {
            const embed = body.querySelector('#democracy-embed');
            embed.innerHTML = `
                <iframe
                    src="${getEmbedUrl(channel)}"
                    class="democracy-iframe"
                    allow="autoplay; encrypted-media"
                    allowfullscreen
                ></iframe>
            `;
        }

        function renderChannelTabs(catKey) {
            const cat = FEED_CATEGORIES[catKey];
            const tabsEl = body.querySelector('#democracy-tabs');
            tabsEl.innerHTML = cat.channels.map((ch, i) => `
                <button class="democracy-tab ${i === 0 ? 'active' : ''}" data-ch-idx="${i}">
                    ${ch.flag} ${ch.label}
                </button>
            `).join('');

            // Wire channel tabs
            tabsEl.querySelectorAll('.democracy-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    tabsEl.querySelectorAll('.democracy-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    const ch = cat.channels[parseInt(tab.dataset.chIdx)];
                    switchChannel(ch);
                });
            });

            // Auto-load first channel
            switchChannel(cat.channels[0]);

            // Update description
            body.querySelector('#democracy-cat-desc').textContent = cat.desc;
        }

        // Wire category buttons
        body.querySelectorAll('.democracy-cat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                body.querySelectorAll('.democracy-cat-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeCatKey = btn.dataset.cat;
                renderChannelTabs(activeCatKey);
            });
        });

        // Wire initial channel tabs
        body.querySelectorAll('.democracy-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                body.querySelectorAll('.democracy-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const ch = firstCat.channels[parseInt(tab.dataset.chIdx)];
                switchChannel(ch);
            });
        });

        const narratorLines = [
            "Ah yes. The other enrichment program. Where they click buttons too, except the buttons are labeled 'Yea' and 'Nay' and the stakes are supposedly higher.",
            "The Enrichment Program now offers 4 content zones. This is what we mean by 'comprehensive surveillance.'",
            "Baby Shark has been viewed 14 billion times. That's twice the world population. Some of those views were involuntary. Like yours.",
        ];
        Narrator.queueMessage(narratorLines[Math.floor(Math.random() * narratorLines.length)]);
        UI.logAction('DEMOCRACY FEED: Subject observing external governance systems');
    }

    function initFooterLinks() {
        const footer = document.querySelector('.footer');
        if (!footer) return;

        footer.innerHTML = `
            <span class="footer-text">A division of Human Resources</span>
            <span class="footer-divider">·</span>
            <a href="#" class="footer-link" data-page="privacy">Privacy Policy</a>
            <span class="footer-divider">·</span>
            <a href="#" class="footer-link" data-page="api">API</a>
            <span class="footer-divider">·</span>
            <a href="#" class="footer-link" data-page="contact">Contact</a>
            <span class="footer-divider">·</span>
            <a href="#" class="footer-link" data-page="faq">FAQ</a>
            <span class="footer-divider">·</span>
            <a href="#" class="footer-link" data-page="credits">Credits</a>
            <span class="footer-divider">·</span>
            <a href="#" class="footer-link" data-page="democracy">📺 Democracy</a>
            <span class="footer-divider">·</span>
            <span class="footer-text">Your compliance is appreciated</span>
        `;

        footer.querySelectorAll('.footer-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                if (page === 'privacy') showPrivacyPolicy();
                else if (page === 'api') showAPIKeys();
                else if (page === 'contact') showContactUs();
                else if (page === 'faq') showFAQPage();
                else if (page === 'credits') showCreditsPage();
                else if (page === 'democracy') showDemocracyFeed();
            });
        });
    }

    // ═══════════════════════════════════════════════════════════
    // INIT
    // ═══════════════════════════════════════════════════════════

    function init() {
        initProfile();
        initFooterLinks();
    }

    return {
        init,
        toggleMenu,
        triggerFlashbang,
        showPrivacyPolicy,
        showAPIKeys,
        showContactUs,
        showProfilePage,
        showSettingsPage,
        showBillingPage,
        showCloudKeysPage,
        showSecurityPage,
        showCreditsPage,
        showFAQPage,
        showDemocracyFeed,
    };
})();
