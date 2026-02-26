.PHONY: serve deploy clean init commit push status log diff

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

# ── Misc ────────────────────────────────────────────────────────
clean:
	@echo "Nothing to clean. Zero build step. As intended."
