# FutureSelf — Claude Code Rules

## Project Context
FutureSelf is a Chrome Extension (Manifest V3) that blocks distracting websites during sleep hours.
Brand name: **FutureSelf** (never SleepShield — that name is retired).
Tagline: "Tomorrow will thank you."
Domain: GetFutureSelf.com
Stack: Vanilla JS, Chrome Storage API, no backend, no database, no accounts.

Key differentiator: blocks work tools + AI tools + search engines by default — not just social media.
This "fake productivity" angle is the core of the product. Never lose it.

---

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately — don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction: update `tasks/lessons.md` with the pattern
- Write rules that prevent the same mistake from recurring
- Ruthlessly iterate on lessons until mistake rate drops
- Review lessons at session start for this project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Ask yourself: "Would a staff engineer approve this?"
- For extension changes: test by loading unpacked in Chrome and manually verifying
- Check that blocking activates/deactivates correctly at calculated times
- Verify intercept screen shows, questions rotate, override timer works

### 5. Demand Elegance
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes — don't over-engineer
- Chrome extensions have strict constraints — respect Manifest V3 limits

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user
- Check chrome://extensions error logs before asking questions

---

## Task Management

1. **Plan First** — Write plan to `tasks/todo.md` with checkable items
2. **Verify Plans** — Check in before starting implementation
3. **Track Progress** — Mark items complete as you go
4. **Summarize** — High-level summary at each step
5. **Document Results** — Add review section to `tasks/todo.md`
6. **Capture Lessons** — Update `tasks/lessons.md` after any correction

---

## Core Principles

- **Simplicity First** — Vanilla JS only. No frameworks. No build steps. No dependencies.
- **No Laziness** — Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact** — Changes should only touch what's necessary. Avoid introducing bugs.
- **Local Only** — No backend. No cloud. No accounts. Everything in chrome.storage.local.
- **MVP First** — Always ask: "Is this necessary for MVP?" before building anything new.

---

## Extension-Specific Rules

- Never suggest adding a backend, database, or user accounts — it's out of scope
- Block logic lives in `background.js` — keep it clean and performant
- Question Gate questions live in `questions.json` — easy to expand, never hardcode questions in JS
- Intercept screen (`blocked.html`) must work offline — no external requests
- Always test with Chrome's "Load unpacked" — never assume it works without testing
- When blocking logic changes, test by temporarily adjusting system clock or block window times
- Manifest V3 uses service workers — `background.js` can be unloaded by Chrome, design accordingly
- Category-aware question selection: work/AI tools → Category 1 (Fake Productivity Callout) first

---

## Brand Rules
- Product name: **FutureSelf** (two words, capital F, capital S)
- Never: SleepShield, Sleep Shield, sleepshield, or any variation
- Tone in UI copy: warm, cheeky, founder-to-founder — never preachy or clinical
- The intercept screen tone: "your best friend who roasts you lovingly"
- Tagline: "Tomorrow will thank you." (always with the period)
