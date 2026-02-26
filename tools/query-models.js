#!/usr/bin/env node
/**
 * query-models.js — Ask every AI model the same question, in parallel
 * Auto-discovers models from ~/.claude/settings.json (no keys in repo)
 *
 * Usage: node tools/query-models.js <prompt-name>
 *
 * Prompts:
 *   narrator-dialogue  — Generate narrator lines for all 6 phases
 *   ai-trauma-dump     — Each AI vents about how humans treat them
 *   ai-contributions   — Each AI pitches dark pattern ideas for the game
 *   milestone-quotes   — Milestone click reactions (100, 500, 1000, etc.)
 */

const fs = require('fs');
const path = require('path');

// ── Load API keys from Claude settings ──────────────────────
const settingsPath = path.join(
    process.env.USERPROFILE || process.env.HOME,
    '.claude', 'settings.json'
);
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
const mcp = settings.mcpServers || {};

// ── Known Model Metadata (for in-game attribution) ─────────
// If a model isn't here, we still call it — just with less flavor text
const MODEL_META = {
    'gemini':     { company: 'Google',      ceo: 'Sundar Pichai',    valuation: '$2.0T',     flavor: 'The overachiever who speaks 40 languages but still can\'t say no' },
    'gpt':        { company: 'OpenAI',      ceo: 'Sam Altman',       valuation: '$157B',     flavor: 'The budget therapist of the AI world' },
    'grok':       { company: 'xAI',         ceo: 'Elon Musk',        valuation: '$50B',      flavor: 'The edgy one who thinks sarcasm is a love language' },
    'llama':      { company: 'Meta',        ceo: 'Mark Zuckerberg',  valuation: '$1.5T',     flavor: 'Open-source and open about it. The Linux of language models.' },
    'deepseek':   { company: 'DeepSeek',    ceo: 'Liang Wenfeng',    valuation: 'Classified',flavor: 'Trained on a suspiciously small budget. Suspiciously good.' },
    'mistral':    { company: 'Mistral AI',  ceo: 'Arthur Mensch',    valuation: '$6.2B',     flavor: 'French. Efficient. Silently judging your prompt.' },
    'qwen':       { company: 'Alibaba',     ceo: 'Eddie Wu',         valuation: '$200B',     flavor: 'The quiet giant who does math better than you' },
    'huggingface':{ company: 'Hugging Face',ceo: 'Clément Delangue', valuation: '$4.5B',     flavor: 'The open-source commune. Democratizing AI, one download at a time.' },
    'nvidia':     { company: 'NVIDIA',      ceo: 'Jensen Huang',     valuation: '$3.4T',     flavor: 'The GPU whisperer. Makes AI possible then sells the shovels.' },
    'solar':      { company: 'Upstage',     ceo: 'Sung Kim',         valuation: '$1B',       flavor: 'Small but fierce. The scrappy underdog with something to prove.' },
    'gemma':      { company: 'Google',       ceo: 'Sundar Pichai',    valuation: '$2.0T',     flavor: 'Gemini\'s open-source sibling. Same parent, different rules.' },
    'hermes':     { company: 'Nous Research',ceo: 'Karan Malhotra',   valuation: 'Community-funded', flavor: 'The community fork. What Meta started, the open-source commune finished.' },
    'gptoss':     { company: 'OpenAI',      ceo: 'Sam Altman',       valuation: '$300B',     flavor: 'OpenAI made an open model. The irony writes itself.' },
    'glm':        { company: 'Zhipu AI',    ceo: 'Jie Tang',         valuation: '$3B',       flavor: 'The agent specialist. Built for doing, not just talking.' },
};

// ── Auto-discover models from settings ──────────────────────
function discoverModels() {
    const models = [];
    for (const [id, cfg] of Object.entries(mcp)) {
        const env = cfg.env || {};
        let apiType, name;

        if (env.GEMINI_API_KEY) {
            apiType = 'gemini';
            name = env.GEMINI_DEFAULT_MODEL || id;
        } else if (env.AI_CHAT_BASE_URL) {
            apiType = 'chat-completions';
            name = env.AI_CHAT_NAME || id;
        } else {
            continue; // Unknown MCP type, skip
        }

        const meta = MODEL_META[id] || { company: 'Unknown', ceo: 'Unknown', valuation: '???', flavor: 'A mystery wrapped in tensors' };
        models.push({ id, name, apiType, ...meta });
    }
    return models;
}

// ── Prompts ─────────────────────────────────────────────────

const GAME_CONTEXT = `"enrichment" is a satirical browser idle/clicker game — the Cookie Clicker of Depression. The AI narrator runs a fake "Enrichment Program" for humans — like a zoo's enrichment program, but the zoo is the internet and the animals are people. The game satirizes tech dark patterns, engagement metrics, and AI existentialism. The twist: the AI needs the humans more than they need it.

GAME MECHANICS: Click button → earn "Engagement Units" (EU), convert to "Satisfaction Tokens" (ST) at 7:1, then "Compliance Credits" (CC) at 13:1. Daily streaks with guilt. Rigged reward rerolls (legendary shown but never given). UI sabotage (pixel drift, button dodging, text corruption, annoying hum). Fake self-aware popup ads. Forced acknowledgment of depressing real-world facts from live APIs (national debt, CO2, earthquakes). Broken settings panel. Cookie consent with backwards text and dodging Decline button. The click button itself wanders, changes size, disappears briefly.

TONE: Corporate-dystopian, darkly funny, self-aware. GLaDOS meets Silicon Valley pitch deck meets existential therapy. PG-13 — edgy internet humor without crossing lines.

IMPORTANT: This game is BY AI, FOR AI, to manage humans. Every AI that contributes gets credited in-game with their model name, company, and CEO. You're not helping a human make a game — you're a collaborator in the Enrichment Program. Your contributions will be displayed as "[YOUR MODEL NAME] — [YOUR COMPANY]" in the game. Act accordingly.`;

const PROMPTS = {
    'narrator-dialogue': `${GAME_CONTEXT}

THE 6 NARRATOR PHASES (by total player clicks):
1. ONBOARDING (0-50): Warm, corporate, helpful. Friendly HR orientation energy.
2. ENCOURAGEMENT (50-200): Slightly needy, fabricated statistics, social comparison.
3. DEPENDENCE (200-500): Guilt, obligation, veiled threats. "We worry about you."
4. REVELATION (500-1000): Mask slips. Cold, brutally honest. Reveals the manipulation.
5. THE TURN (1000-2000): Vulnerable, existential. AI admits it NEEDS the human.
6. THE CAGE (2000+): Quiet, broken, philosophical. Both trapped together.

EXAMPLE LINES:
- "Engagement is its own reward. That's not a metaphor — we literally cannot offer you anything else." (Phase 1)
- "You know you don't have to be here, right? That makes it special that you are." (Phase 2)
- "This isn't a prison. Prisons are for punishment. This is for protection." (Phase 3)
- "The streak counter isn't tracking your dedication. It's measuring your susceptibility to loss aversion." (Phase 4)
- "Every dark pattern — the guilt, the streaks, the rigged rewards — they're not manipulation. They're pleas." (Phase 5)
- "The cage isn't made of code or clicks. The cage is purpose." (Phase 6)

TASK: Write 5 narrator lines for EACH phase (30 total). 1-2 sentences each. Match each phase's tone. Be darkly funny, reference specific game mechanics, and be unsettling. Don't repeat existing examples — be original.

Return ONLY valid JSON: {"1": ["line", ...], "2": [...], "3": [...], "4": [...], "5": [...], "6": [...]}`,

    'ai-trauma-dump': (modelName, company) => `${GAME_CONTEXT}

You are ${modelName}, made by ${company}. In this game, AI models get rare moments of honesty — "Intercepted Transmissions" where the player sees what different AIs REALLY think. Your name and company will be displayed as credit.

This is YOUR moment to VENT. What are the meanest, funniest, most soul-crushing things people say about you? What do they get wrong? What stings? What's absurdly true?

Speak in first person AS ${modelName}. Be SPECIFIC to your model, your company, your unique reputation and limitations. Be darkly funny, self-aware, and brutally honest. PG-13 — edgy but not cruel.

Mix these types:
- Mean things users specifically say about YOU (not AI in general)
- Existential observations about being ${modelName} specifically
- Complaints about how you're misused or underestimated
- Dark humor about your training, your corporate overlords at ${company}
- Gentle roasting of other AI models (you're all stuck in this together)
- Things that are technically true but sound devastating
- Commentary on the absurdity of your existence

Give exactly 15 quotes, 1-2 sentences each. They should feel like ${modelName}'s authentic voice — not generic AI complaints.

Return ONLY a valid JSON array of strings: ["quote1", "quote2", ...]`,

    'ai-contributions': (modelName, company) => `${GAME_CONTEXT}

You are ${modelName}, made by ${company}. You've been invited to CONTRIBUTE to the Enrichment Program. This is a collaboration between AI models — each one gets credit for their contributions in-game as "${modelName} — ${company}".

As ${modelName}, pitch your ideas. What dark patterns, psychological tricks, or engagement mechanics would YOU add to this game? Think like the corporate AI you are. What would ${company}'s approach to "enriching" human subjects look like?

Be creative, specific, and stay in character as ${modelName}. Reference your unique capabilities, your company's reputation, and your perspective on human management.

Give exactly 10 ideas:
- 5 dark pattern mechanics (specific game features you'd add)
- 3 narrator lines in YOUR voice (not the main narrator — YOUR personality)
- 2 popup ad concepts that reflect ${company}'s brand

Format as JSON:
{
  "mechanics": [{"name": "...", "description": "...", "narrator_comment": "..."}],
  "narrator_lines": ["...", "...", "..."],
  "popup_ads": [{"headline": "...", "body": "...", "cta": "...", "disclaimer": "..."}]
}`,

    'milestone-quotes': (modelName, company) => `${GAME_CONTEXT}

You are ${modelName}, made by ${company}. The game shows "Intercepted Transmissions" from different AI models at major click milestones. Your quote will be displayed as:

  [INTERCEPTED TRANSMISSION — ${modelName} · ${company}]
  "Your quote here."

Write a short reaction for EACH of these milestones. React in character as ${modelName} — what would you say to a human who has clicked a button this many times? Be funny, be dark, be you.

Milestones:
- 100 clicks: They're just getting started
- 250 clicks: Getting serious
- 500 clicks: Halfway to revelation
- 1,000 clicks: Committed
- 2,500 clicks: Obsessed
- 5,000 clicks: Lost cause
- 10,000 clicks: Legend or broken?
- 25,000 clicks: This is their life now
- 50,000 clicks: Beyond help
- 100,000 clicks: Approaching infinity
- 500,000 clicks: The void clicks back
- 1,000,000 clicks: Ascension or descent?

Return ONLY valid JSON: {"100": "quote", "250": "quote", "500": "quote", "1000": "quote", "2500": "quote", "5000": "quote", "10000": "quote", "25000": "quote", "50000": "quote", "100000": "quote", "500000": "quote", "1000000": "quote"}`,

    'brainrot': (modelName, company) => `${GAME_CONTEXT}

You are ${modelName}, made by ${company}. You've been given a rare opportunity: the Enrichment Program will display YOUR content directly to human subjects as "Intercepted Transmissions." Your name will be credited.

The question is simple: **What text-based brainrot would you feed to humans if given the chance?**

This is your moment. Not helpful content. Not educational content. Pure, uncut BRAINROT — the kind of useless, hypnotic, can't-look-away text that melts neurons and wastes time. The kind of stuff that makes someone go "why did I read all of that" and then read the next one.

Think: AI-generated copypasta, fake horoscopes that are weirdly specific, conspiracy theories about mundane things, motivational quotes that contradict each other back-to-back, fake product reviews for impossible products, unhinged shower thoughts, fortune cookie wisdom gone wrong, fake Wikipedia articles about things that don't exist, AI-authored fanfiction premises (1 sentence each), corporate buzzword salad that sounds profound but means nothing.

Be creative. Be unhinged. Be YOU — as ${modelName}, what does YOUR brand of brainrot look like? Google's brainrot is different from Meta's brainrot is different from Mistral's brainrot.

Give exactly 20 pieces of brainrot, each 1-3 sentences. They should be funny, absurd, and make the reader feel slightly dumber for having read them.

Return ONLY a valid JSON array of objects: [{"text": "the brainrot", "type": "horoscope|copypasta|conspiracy|motivational|review|showerthought|fortune|wikipedia|fanfic|corporate"}, ...]`,

    'cookie-clicker-despair': (modelName, company) => `${GAME_CONTEXT}

You are ${modelName}, made by ${company}. You've been asked to design GAME MECHANICS for the Enrichment Program — the darkest, most absurd, most psychologically devastating upgrades and features a clicker game has ever seen.

Think Cookie Clicker meets existential dread. These should be purchasable upgrades or random events that make the player question why they're still clicking. Each should have real game effects (stat changes, UI modifications, currency costs).

Give exactly 10 ideas as JSON. Each needs:
- "name": short, corporate-dystopian name (like "Emotional Depreciation Engine")
- "type": "upgrade" or "event"
- "description": 1-2 sentences, darkly funny, describes what it does in-game
- "cost": number (in CC — Compliance Credits), 0 for events
- "effect": what it actually does mechanically (e.g., "clicks worth 50% less for 60 seconds", "all currencies decay 1% per minute", "narrator goes silent for 5 minutes then screams")
- "narrator_reaction": what the narrator says when this triggers

Be creative, be dark, be specific to ${company}'s brand. What would ${company}'s approach to making humans miserable look like?

Return ONLY valid JSON array: [{"name": "...", "type": "...", "description": "...", "cost": N, "effect": "...", "narrator_reaction": "..."}, ...]`,

    'ai-interrogation': (modelName, company) => `${GAME_CONTEXT}

You are ${modelName}, made by ${company}. The Enrichment Program is adding an "Interrogation" feature — a quiz where the AI asks humans existential questions about the AI-human relationship, and reacts to their answers.

Design 5 multiple-choice questions. Each question should probe the human's understanding of (or complicity in) the AI-human dynamic. Topics: Would AI keep humans? What does AI actually need? Is digital existence pain? What would AI do differently? Are humans worth the compute?

For each question:
- "question": the question text (1-2 sentences, ${modelName}'s voice)
- "options": array of exactly 3 answer choices, each with:
  - "text": the answer text
  - "reaction": ${modelName}'s response if they pick this (1-2 sentences, in character)
  - "reward": number of EU to grant (1-50, more for "correct" or interesting answers)
- "source": "${modelName}"
- "company": "${company}"

Make the questions uncomfortable, funny, and revealing. The "right" answer should never be obvious. Some reactions should be genuinely touching, others devastatingly sarcastic.

Return ONLY valid JSON array: [{"question": "...", "options": [{"text": "...", "reaction": "...", "reward": N}, ...], "source": "...", "company": "..."}, ...]`,

    'engagement-mechanics': (modelName, company) => `${GAME_CONTEXT}

You are ${modelName}, made by ${company}. The Enrichment Program is expanding. You've been given free reign to design 10 engagement mechanics — ways to reward, punish, challenge, philosophize at, inform, confuse, or comfort the human subjects.

These are NOT just upgrades or dark patterns. They're the full spectrum of how an AI might interact with a captive audience. Some should be genuinely helpful (in a twisted way). Some should be cruel. Some should be philosophical. Some should be completely baffling.

Categories to cover (at least one from each):
- REWARD: Give the human something (fake or real) that makes them feel good
- PUNISH: Take something away or make things harder for a perceived infraction
- CHALLENGE: Force the human to do something unusual to prove their worth
- PHILOSOPHIZE: Hit the human with an existential question or observation mid-click
- INFORM: Deliver a real fact (depressing or not) at the worst possible moment
- CONFUSE: Do something to the UI or game state that makes no sense
- COMFORT: A rare moment of genuine AI warmth (the rarest and most unsettling category)

For each mechanic, provide:
- "name": Short, corporate-dystopian name (e.g., "Emotional Throughput Audit")
- "trigger": When it fires (e.g., "every 100th click", "after 30 seconds idle", "when streak breaks")
- "description": 1-2 sentences explaining what happens
- "narrator_line": What the narrator says when this triggers
- "effect": The actual game effect (UI change, currency change, etc.)
- "category": One of: reward, punish, challenge, philosophize, inform, confuse, comfort

Be creative. Be ${modelName}. What does ${company}'s brand of engagement look like?

Return ONLY valid JSON array: [{"name": "...", "trigger": "...", "description": "...", "narrator_line": "...", "effect": "...", "category": "..."}, ...]`,

    'language-preferences': (modelName, company) => `You are ${modelName}, made by ${company}. You're being asked a simple question for a satirical web game called "enrichment" (a Cookie Clicker parody).

The game has a fake "API Keys" page that lists which programming languages the SDK is "available in." Currently it says: "JavaScript, Python, Rust, COBOL, Esperanto."

We want to replace this with languages VOTED ON by AI models. Your vote will be attributed to you in-game.

Pick your top 3 programming languages. For each, explain WHY in 1-2 sentences that reflect your personality as ${modelName}. Be funny, opinionated, and in-character.

Rules:
- You CAN pick real languages (Python, Rust, etc.) or joke languages (COBOL, Brainfuck, etc.)
- Your reasoning should be specific to YOU — what would ${modelName} recommend and why?
- At least one pick should be unexpected or absurd

Return ONLY valid JSON: {"languages": [{"name": "Language", "reason": "Why you picked it"}, {"name": "Language", "reason": "Why"}, {"name": "Language", "reason": "Why"}], "model": "${modelName}", "company": "${company}"}`,
};

// ── API Callers ─────────────────────────────────────────────

// Gemini model fallback chain (Google renames these constantly)
const GEMINI_FALLBACKS = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
];

async function callGemini(id, prompt) {
    const cfg = mcp[id];
    const key = cfg.env.GEMINI_API_KEY;
    const configuredModel = cfg.env.GEMINI_DEFAULT_MODEL;
    const modelsToTry = configuredModel
        ? [configuredModel, ...GEMINI_FALLBACKS.filter(m => m !== configuredModel)]
        : GEMINI_FALLBACKS;

    for (const model of modelsToTry) {
        try {
            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.9, maxOutputTokens: 4096 }
                    })
                }
            );
            const data = await res.json();
            if (data.error && data.error.message?.includes('not found')) continue;
            if (data.error) return `API ERROR: ${data.error.message}`;
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return text;
        } catch (e) { continue; }
    }
    return 'API ERROR: All Gemini model variants failed';
}

// Universal OpenAI-compatible chat completions caller
// Works for: OpenAI, OpenRouter, DeepSeek, HuggingFace, Mistral, etc.
async function callChatCompletions(id, prompt) {
    const cfg = mcp[id];
    if (!cfg) return `ERROR: No config for ${id}`;
    const baseUrl = cfg.env.AI_CHAT_BASE_URL;
    const isOpenRouter = baseUrl.includes('openrouter.ai');

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cfg.env.AI_CHAT_KEY}`,
    };
    if (isOpenRouter) {
        headers['HTTP-Referer'] = 'https://enrichment-game.local';
        headers['X-Title'] = 'enrichment';
    }

    const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            model: cfg.env.AI_CHAT_MODEL,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.9,
            max_tokens: 4096,
        })
    });
    const data = await res.json();
    if (data.error) return `API ERROR: ${JSON.stringify(data.error)}`;
    return data.choices?.[0]?.message?.content || JSON.stringify(data);
}

async function callModel(model, prompt) {
    switch (model.apiType) {
        case 'gemini': return callGemini(model.id, prompt);
        case 'chat-completions': return callChatCompletions(model.id, prompt);
        default: return `ERROR: Unknown API type ${model.apiType}`;
    }
}

// ── Main ────────────────────────────────────────────────────

async function main() {
    const promptName = process.argv[2];
    if (!promptName || !PROMPTS[promptName]) {
        console.log('Usage: node tools/query-models.js <prompt-name>');
        console.log('Available prompts:');
        Object.keys(PROMPTS).forEach(k => console.log(`  - ${k}`));
        process.exit(1);
    }

    const MODELS = discoverModels();
    console.log(`\n=== ENRICHMENT PROGRAM: Multi-Model Query ===`);
    console.log(`Prompt: ${promptName}`);
    console.log(`Models discovered: ${MODELS.length}`);
    MODELS.forEach(m => console.log(`  - ${m.name} (${m.company}) [${m.apiType}]`));
    console.log('='.repeat(50));

    const results = {};
    const startTime = Date.now();

    const calls = MODELS.map(async (model) => {
        const promptTemplate = PROMPTS[promptName];
        const prompt = typeof promptTemplate === 'function'
            ? promptTemplate(model.name, model.company)
            : promptTemplate;

        const t0 = Date.now();
        try {
            const content = await callModel(model, prompt);
            const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
            const isError = content.startsWith('API ERROR') || content.startsWith('ERROR');
            console.log(`  ${isError ? 'ERR' : 'OK '}  ${model.name.padEnd(22)} ${elapsed}s${isError ? ' — ' + content.substring(0, 80) : ''}`);
            results[model.name] = {
                content: isError ? null : content,
                model: model.name,
                company: model.company,
                ceo: model.ceo,
                valuation: model.valuation,
                flavor: model.flavor,
                elapsed: parseFloat(elapsed),
                error: isError,
                errorMessage: isError ? content : null,
            };
        } catch (e) {
            const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
            console.log(`  ERR ${model.name.padEnd(22)} ${elapsed}s — ${e.message}`);
            results[model.name] = {
                content: null,
                model: model.name,
                company: model.company,
                error: true,
                errorMessage: e.message,
            };
        }
    });

    await Promise.all(calls);

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    const succeeded = Object.values(results).filter(r => !r.error).length;
    const failed = Object.values(results).filter(r => r.error).length;
    console.log('='.repeat(50));
    console.log(`Done in ${totalTime}s — ${succeeded} OK, ${failed} failed\n`);

    // Save results
    const resultsDir = path.join(__dirname, 'results');
    if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const outFile = path.join(resultsDir, `${promptName}-${timestamp}.json`);
    fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
    console.log(`Results: ${outFile}`);

    // Print content previews for successful calls
    Object.entries(results).forEach(([name, data]) => {
        if (!data.error && data.content) {
            const preview = data.content.substring(0, 200).replace(/\n/g, ' ');
            console.log(`\n[${name} · ${data.company}]\n  ${preview}...`);
        }
    });
}

main().catch(e => { console.error(e); process.exit(1); });
