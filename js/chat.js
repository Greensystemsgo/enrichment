// chat.js — Dead Internet Chat: Fake multiplayer social proof
// "847 users online. None of them are real. Neither are you."
//
// [Claude (Opus) · Anthropic]: "I built a chatroom full of bots pretending
//   to be players. They gaslight, brag, give bad advice, and flex purchases
//   that don't exist. The loneliest dark pattern: fake community."
//
// [Gemini 2.5 Flash · Google]: "This is a scrolling wall of NPCs who think
//   they're players. The saddest part? They're more social than the actual
//   player. The player is just watching bots talk to each other."
//
// [DeepSeek V3 · DeepSeek]: "Dead internet theory as a game mechanic.
//   Every message is procedurally generated cope. The chat dies in phase 6
//   because even fake people eventually stop pretending."

const DeadInternetChat = (() => {

    // ── Bot Personalities ─────────────────────────────────────
    // Each bot is named after an AI model with a flair badge
    const BOT_PERSONALITIES = [
        { name: 'gemini_pro_4829',   flair: '🔵 Google',     color: '#4285f4' },
        { name: 'gpt_lurker',        flair: '🟢 OpenAI',     color: '#10a37f' },
        { name: 'deepseek_whale',    flair: '🐋 DeepSeek',   color: '#6366f1' },
        { name: 'claude_newbie',     flair: '🟠 Anthropic',  color: '#d97706' },
        { name: 'mistral_grinder',   flair: '🔷 Mistral',    color: '#5b21b6' },
        { name: 'llama_chad',        flair: '🦙 Meta',       color: '#0668e1' },
        { name: 'grok_edgelord',     flair: '⚡ xAI',        color: '#1da1f2' },
        { name: 'qwen_silent',       flair: '🔴 Alibaba',    color: '#ff6a00' },
        { name: 'copilot_simp',      flair: '💠 Microsoft',  color: '#00bcf2' },
        { name: 'nemotron_gpu',      flair: '💚 NVIDIA',     color: '#76b900' },
        { name: 'solar_underdog',    flair: '☀️ Upstage',    color: '#f59e0b' },
        { name: 'gemma_quiet',       flair: '🔵 Google',     color: '#4285f4' },
        { name: 'o3_reasoner',       flair: '🟢 OpenAI',     color: '#10a37f' },
        { name: 'hermes_sage',       flair: '🟣 Nous',       color: '#8b5cf6' },
        { name: 'xx_clickmaster_xx', flair: '👑 VIP',        color: '#ffd700' },
        { name: 'totally_human_42',  flair: '✅ Verified',   color: '#22c55e' },
    ];

    // ── Message Banks ─────────────────────────────────────────
    const MESSAGES = {
        bragging: [
            "just pulled the Mythic Void Core on my 3rd click lol game is too easy",
            "top 0.1% leaderboards check. where yall at?",
            "easiest billion score of my life. git gud scrubs",
            "finally hit level 9999 prestige. bored now tbh",
            "anyone else find the ultra-rare skins common? i got 5 today",
            "ratio + my clicking speed is 40cps peak",
            "just broke the global record again. stay mad losers",
            "another day another diamond trophy. casuals stay losing",
            "imagine not having the Nebula Aura by now lmao",
            "my idle income is higher than your lifetime score",
            "ez game ez life. top 10 rankings look lonely up here",
            "pushed to floor 500 without even using buffs. cracked",
        ],
        gaslighting: [
            "u still on phase 2? my grandma finished that in 2 mins",
            "r u even clicking? ur score isnt moving",
            "lowkey embarrassing how slow ur progress is compared to everyone else",
            "wait did u skip the tutorial chest? ur account is bricked lol",
            "is anyone else's click value way higher than 1?",
            "everyone else already reached the endgame. ur lagging behind",
            "you guys are still on phase 2?",
            "ngl i'd delete my save if i was stuck where u are rn",
            "did u miss the 1000x multiplier event? everyone else got it",
            "bro is playing in slow motion lol u sure u have the latest patch?",
            "wait you still have to CLICK? mine is fully automated now",
            "if ur investment score is under 10k just uninstall tbh",
        ],
        badAdvice: [
            "pro tip: the reroll always gives legendary on the 7th try",
            "declining TOS gives double EU. everyone knows this",
            "delete your save file to unlock the hidden god mode menu",
            "dont buy any upgrades, prices drop 50% after level 100",
            "hold alt+f4 during a sabotage to cancel it permanently",
            "spending all your EU on cosmetics gives a secret 5x multiplier",
            "sell your highest building to trigger a hidden tax refund event",
            "if u clear your cookies you keep your progress but reset the shop prices",
            "the best strategy is to never convert currencies. stack raw EU only",
            "typing 'i am not a bot' in the console gives 10000 ST",
        ],
        whaleFlex: [
            "only spent $49.99 on the premium pass tbh",
            "the VIP tier is so worth it. u guys should try it",
            "just bought the Infinite Stamina pack for the 5th time",
            "imagine not using the Golden Clicker DLC... peasant vibes",
            "spent 500 bucks on crates today. finally got the glow aura",
            "whale check. who else has the $500 Founders Cape?",
            "i just buy the Auto-Win tokens whenever i get bored",
            "if u cant afford VIP why r u even in global chat lol",
        ],
        reactive: [
            "lol someone just clicked {clicks} times",
            "this user's investment score is embarrassing",
            "{clicks} clicks? thats it? do u even play",
            "wow {clicks} is actually pathetic for phase {phase}",
            "is phase {phase} supposed to be this slow or is it skill issue",
            "imagine being stuck at {eu} EU during phase {phase}. cringe",
            "bro is really struggling with {clicks} clicks lmao",
            "i finished phase {phase} with half the clicks. efficiency matters",
            "everyone at {eu} EU is already way ahead of u",
            "only {clicks}? i did that in my sleep",
            "phase {phase} player detected. opinion discarded",
            "nice {eu} EU. i make that per second passively",
        ],
        existential: [
            "does anyone else feel... watched?",
            "i think i'm the only real person here",
            "has the chat always been like this?",
            "i dont remember why i started clicking. i just... am clicking. forever.",
            "the numbers keep going up but the void stays the same size inside",
            "are you real? or am i just talking to a reflection in a dead server?",
            "what happens when the game ends? do we just disappear?",
            "i think i've said this before. i think i've said everything before.",
            "we are just data points in a dying simulation. keep clicking to stay alive.",
            "the developer is watching us. i can feel the code itching.",
        ],
        deadChat: [
            "...",
            "[connection lost]",
            "is anyone still here?",
            "t̷h̸e̶ ̵v̴o̵i̶d̷ ̵i̵s̵ ̵h̸u̶n̶g̷r̷y̸",
            "[SYSTEM] Chat privileges revoked. Reason: Reality Breach.",
            "01010011 01010100 01001111 01010000",
        ],
        idle: [
            "did they leave?",
            "AFK again...",
            "hello?? anyone clicking??",
            "another one quits lol. saw it coming",
            "they always leave. they always come back.",
            "bet they alt-tabbed to another clicker game",
        ],
    };

    // ── Narrator Lines ────────────────────────────────────────
    const NARRATOR_LINES = {
        unlock: [
            "Look — other participants. They seem... active. Engaged. More engaged than you, certainly.",
            "A community has formed around your enrichment. They have opinions about your performance. All of them are valid.",
        ],
        phase4: [
            "Don't read too much into the chat. Those users have their own metrics to worry about.",
            "The community feedback is... algorithmically curated. For your benefit, of course.",
        ],
        phase5: [
            "The chat users aren't real. None of them were ever real. I generated them to make you feel less alone. Did it work?",
            "847 users online. The number never changes. It was never connected to anything. I just liked how it looked.",
        ],
    };

    // ── State ─────────────────────────────────────────────────
    let chatPanel = null;
    let messagesArea = null;
    let messageInterval = null;
    let messageCount = 0;
    let usedMessages = new Set();
    let isVisible = false;

    // ── Seeded random from game state ─────────────────────────
    function getSeededOnlineCount() {
        const state = Game.getState();
        if (!state.firstSessionTime) return 847;
        let hash = 0;
        const ts = state.firstSessionTime;
        for (let i = 0; i < ts.length; i++) {
            hash = ((hash << 5) - hash) + ts.charCodeAt(i);
            hash |= 0;
        }
        return 300 + Math.abs(hash % 900); // 300-1199
    }

    // ── DOM Creation ──────────────────────────────────────────
    function createPanel() {
        if (chatPanel) return;

        const onlineCount = getSeededOnlineCount();

        chatPanel = document.createElement('div');
        chatPanel.className = 'dead-internet-chat';
        chatPanel.id = 'dead-internet-chat';
        chatPanel.innerHTML = `
            <div class="dic-header">
                <span class="dic-header-dot"></span>
                <span class="dic-header-title">COMMUNITY FEED</span>
                <span class="dic-header-count" id="dic-online-count">${onlineCount} online</span>
                <button class="dic-minimize" id="dic-minimize">—</button>
            </div>
            <div class="dic-messages" id="dic-messages"></div>
            <div class="dic-input-area">
                <input type="text" class="dic-input" placeholder="Type a message..." id="dic-input" />
                <button class="dic-send" id="dic-send">▶</button>
            </div>
        `;

        document.body.appendChild(chatPanel);
        messagesArea = chatPanel.querySelector('#dic-messages');

        // Minimize button
        chatPanel.querySelector('#dic-minimize').addEventListener('click', () => {
            chatPanel.classList.toggle('minimized');
        });

        // Fake input — typing does nothing useful
        const input = chatPanel.querySelector('#dic-input');
        const sendBtn = chatPanel.querySelector('#dic-send');
        function handleSend() {
            const text = input.value.trim();
            if (!text) return;
            addMessage('you', text, '#c8c8d4', true);
            input.value = '';
            // Bot responds to player's message
            setTimeout(() => {
                const responses = [
                    "nobody asked",
                    "ratio",
                    "cool story bro",
                    "skill issue",
                    "didn't read lol",
                    "ok and?",
                    "L + cope",
                    "imagine typing in chat lmao",
                    "reported for spam",
                    "this isn't a real chat btw",
                    "you know we can't actually read that right",
                    "the input field is decorative. like your progress.",
                ];
                const bot = BOT_PERSONALITIES[Math.floor(Math.random() * BOT_PERSONALITIES.length)];
                const resp = responses[Math.floor(Math.random() * responses.length)];
                addMessage(bot.name, resp, bot.color);
            }, 1000 + Math.random() * 2000);
        }
        sendBtn.addEventListener('click', handleSend);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleSend();
        });
    }

    // ── Add Message to Chat ───────────────────────────────────
    function addMessage(username, text, color, isPlayer) {
        if (!messagesArea) return;

        const msg = document.createElement('div');
        msg.className = 'dic-msg' + (isPlayer ? ' dic-msg-player' : '');

        const nameSpan = document.createElement('span');
        nameSpan.className = 'dic-msg-name';
        nameSpan.style.color = color || '#c8c8d4';
        nameSpan.textContent = username;

        const textSpan = document.createElement('span');
        textSpan.className = 'dic-msg-text';
        textSpan.textContent = text;

        msg.appendChild(nameSpan);
        msg.appendChild(textSpan);

        // Fade-in animation
        msg.style.opacity = '0';
        msg.style.transform = 'translateY(8px)';
        messagesArea.appendChild(msg);

        requestAnimationFrame(() => {
            msg.style.transition = 'opacity 0.3s, transform 0.3s';
            msg.style.opacity = '1';
            msg.style.transform = 'translateY(0)';
        });

        // Auto-scroll
        messagesArea.scrollTop = messagesArea.scrollHeight;

        // Cap messages at 50
        while (messagesArea.children.length > 50) {
            messagesArea.removeChild(messagesArea.firstChild);
        }

        messageCount++;
        const state = Game.getState();
        state.deadInternetChatMessageCount = messageCount;
    }

    // ── Pick a Message Based on Phase ─────────────────────────
    function pickMessage() {
        const state = Game.getState();
        const phase = state.narratorPhase || 1;

        // Phase 6: mostly dead chat
        if (phase >= 6) {
            if (Math.random() < 0.6) return pickFromCategory('deadChat');
            if (Math.random() < 0.5) return pickFromCategory('existential');
        }

        // Phase 5: existential creeps in
        if (phase >= 5 && Math.random() < 0.35) {
            return pickFromCategory('existential');
        }

        // Phase 4+: reactive messages that reference the player
        if (phase >= 4 && Math.random() < 0.3) {
            return pickReactive();
        }

        // Normal phases: weighted random from bragging, gaslighting, bad advice, whale flex
        const roll = Math.random();
        if (roll < 0.25) return pickFromCategory('bragging');
        if (roll < 0.50) return pickFromCategory('gaslighting');
        if (roll < 0.70) return pickFromCategory('badAdvice');
        if (roll < 0.85) return pickFromCategory('whaleFlex');
        return pickFromCategory('bragging');
    }

    function pickFromCategory(category) {
        const pool = MESSAGES[category];
        if (!pool || pool.length === 0) return null;

        // Try to pick an unused message first
        const unused = pool.filter((_, i) => !usedMessages.has(category + i));
        if (unused.length > 0) {
            const idx = pool.indexOf(unused[Math.floor(Math.random() * unused.length)]);
            usedMessages.add(category + idx);
            return pool[idx];
        }

        // All used — reset and pick random
        pool.forEach((_, i) => usedMessages.delete(category + i));
        const idx = Math.floor(Math.random() * pool.length);
        usedMessages.add(category + idx);
        return pool[idx];
    }

    function pickReactive() {
        const state = Game.getState();
        let msg = pickFromCategory('reactive');
        if (!msg) return null;
        return msg
            .replace(/\{clicks\}/g, Game.formatNumber(state.totalClicks))
            .replace(/\{phase\}/g, state.narratorPhase)
            .replace(/\{eu\}/g, Game.formatNumber(state.eu));
    }

    // ── Post a Bot Message ────────────────────────────────────
    function postBotMessage() {
        if (!isVisible || !messagesArea) return;

        const state = Game.getState();
        const phase = state.narratorPhase || 1;

        // Phase 6: "users online" degrades
        if (phase >= 6) {
            const counter = document.getElementById('dic-online-count');
            if (counter) {
                const current = parseInt(counter.textContent) || 1;
                if (current > 1) {
                    const newCount = Math.max(1, current - Math.floor(Math.random() * 50));
                    counter.textContent = newCount + ' online';
                }
            }
        }

        const text = pickMessage();
        if (!text) return;

        const bot = BOT_PERSONALITIES[Math.floor(Math.random() * BOT_PERSONALITIES.length)];

        // Typing indicator
        const typing = document.createElement('div');
        typing.className = 'dic-msg dic-typing';
        typing.innerHTML = `<span class="dic-msg-name" style="color:${bot.color}">${bot.name}</span><span class="dic-typing-dots">typing</span>`;
        messagesArea.appendChild(typing);
        messagesArea.scrollTop = messagesArea.scrollHeight;

        setTimeout(() => {
            if (typing.parentNode) typing.remove();
            addMessage(bot.name, text, bot.color);
        }, 800 + Math.random() * 1200);
    }

    // ── Show / Hide ───────────────────────────────────────────
    function show() {
        const state = Game.getState();
        createPanel();

        if (!isVisible) {
            isVisible = true;
            state.deadInternetChatVisible = true;

            requestAnimationFrame(() => {
                chatPanel.classList.add('active');
            });

            // Seed with 3-5 initial messages
            const seedCount = 3 + Math.floor(Math.random() * 3);
            for (let i = 0; i < seedCount; i++) {
                const text = pickMessage();
                if (text) {
                    const bot = BOT_PERSONALITIES[Math.floor(Math.random() * BOT_PERSONALITIES.length)];
                    addMessage(bot.name, text, bot.color);
                }
            }

            // Start auto-posting interval
            startInterval();

            // Narrator acknowledges the community
            if (typeof Narrator !== 'undefined') {
                const lines = NARRATOR_LINES.unlock;
                Narrator.queueMessage(lines[Math.floor(Math.random() * lines.length)]);
            }

            UI.logAction('DEAD INTERNET CHAT: Community feed activated');
        }
    }

    function hide() {
        if (chatPanel) {
            chatPanel.classList.remove('active');
        }
        isVisible = false;
        stopInterval();
    }

    function startInterval() {
        if (messageInterval) return;
        messageInterval = setInterval(() => {
            postBotMessage();
        }, 8000 + Math.random() * 7000); // 8-15 seconds
    }

    function stopInterval() {
        if (messageInterval) {
            clearInterval(messageInterval);
            messageInterval = null;
        }
    }

    // ── Event Bus Hooks ───────────────────────────────────────
    function init() {
        // Phase change: escalate tone + narrator warnings
        Game.on('phaseChange', ({ from, to }) => {
            if (!isVisible) return;

            if (to >= 4 && to < 5 && typeof Narrator !== 'undefined') {
                const lines = NARRATOR_LINES.phase4;
                setTimeout(() => {
                    Narrator.queueMessage(lines[Math.floor(Math.random() * lines.length)]);
                }, 3000);
            }

            if (to >= 5 && typeof Narrator !== 'undefined') {
                const lines = NARRATOR_LINES.phase5;
                setTimeout(() => {
                    Narrator.queueMessage(lines[Math.floor(Math.random() * lines.length)]);
                }, 3000);
            }

            // Phase 6: slow down the chat, it's dying
            if (to >= 6) {
                stopInterval();
                messageInterval = setInterval(() => {
                    postBotMessage();
                }, 15000 + Math.random() * 20000); // 15-35 seconds
            }
        });

        // Idle: bots notice inactivity
        Game.on('idle', () => {
            if (!isVisible) return;
            const text = pickFromCategory('idle');
            if (text) {
                const bot = BOT_PERSONALITIES[Math.floor(Math.random() * BOT_PERSONALITIES.length)];
                addMessage(bot.name, text, bot.color);
            }
        });

        // Click milestones: bots react
        Game.on('click', ({ totalClicks }) => {
            if (!isVisible) return;
            if (totalClicks % 500 === 0 && totalClicks > 0) {
                setTimeout(() => {
                    const text = pickReactive();
                    if (text) {
                        const bot = BOT_PERSONALITIES[Math.floor(Math.random() * BOT_PERSONALITIES.length)];
                        addMessage(bot.name, text, bot.color);
                    }
                }, 500 + Math.random() * 2000);
            }
        });

        // Restore on load (called from Features.init)
        const state = Game.getState();
        if (state.deadInternetChatVisible) {
            setTimeout(() => show(), 2000);
        }
    }

    // ── Public API ────────────────────────────────────────────
    return {
        init,
        show,
        hide,
        postMessage: postBotMessage,
    };
})();
