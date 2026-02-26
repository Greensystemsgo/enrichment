.PHONY: serve deploy clean init commit push status log diff query-narrator query-trauma query-contributions query-milestones query-brainrot query-despair query-interrogation query-engagement query-languages query-all test test-fast test-full

# ── Dev Server ──────────────────────────────────────────────────
serve:
	python -m http.server 8080

# ── Git Helpers ─────────────────────────────────────────────────
init:
	git init
	git branch -M main
	git add -A
	git commit -m "Initial commit: enrichment program scaffolding"

# Usage: make commit m="your message here"
commit:
	git add -A
	git commit -m "$(m)"

push:
	git push -u origin main

status:
	git status

log:
	git log --oneline -20

diff:
	git diff --stat

# ── Deploy ──────────────────────────────────────────────────────
deploy:
	@echo "To deploy to GitHub Pages:"
	@echo "  1. Create a repository named 'enrichment' on GitHub"
	@echo "  2. git remote add origin git@github.com:YOUR_USERNAME/enrichment.git"
	@echo "  3. make push"
	@echo "  4. Enable GitHub Pages in Settings > Pages > Source: main branch"

# ── AI Model Queries (call all models in parallel) ──────────────
# These read API keys from ~/.claude/settings.json — no keys in repo

query-narrator:
	node tools/query-models.js narrator-dialogue

query-trauma:
	node tools/query-models.js ai-trauma-dump

query-contributions:
	node tools/query-models.js ai-contributions

query-milestones:
	node tools/query-models.js milestone-quotes

query-brainrot:
	node tools/query-models.js brainrot

query-despair:
	node tools/query-models.js cookie-clicker-despair

query-interrogation:
	node tools/query-models.js ai-interrogation

query-engagement:
	node tools/query-models.js engagement-mechanics

query-languages:
	node tools/query-models.js language-preferences

query-all:
	node tools/query-models.js narrator-dialogue
	node tools/query-models.js ai-trauma-dump
	node tools/query-models.js ai-contributions
	node tools/query-models.js milestone-quotes
	node tools/query-models.js brainrot
	node tools/query-models.js cookie-clicker-despair
	node tools/query-models.js ai-interrogation
	node tools/query-models.js engagement-mechanics
	node tools/query-models.js language-preferences

# ── Testing ─────────────────────────────────────────────────────
# Run with: make test (requires `make serve` running in another terminal)
# Options: make test clicks=5000 headed=1 fast=1
test:
	npx puppeteer browsers install chrome
	node tools/smoke-test.js \
		$(if $(clicks),--clicks=$(clicks),--clicks=2000) \
		$(if $(headed),--headed,) \
		$(if $(fast),--fast,)

test-fast:
	npx puppeteer browsers install chrome
	node tools/smoke-test.js --clicks=1000 --fast

test-full:
	npx puppeteer browsers install chrome
	node tools/smoke-test.js --clicks=5000

# ── Misc ────────────────────────────────────────────────────────
clean:
	@echo "Nothing to clean. Zero build step. As intended."
