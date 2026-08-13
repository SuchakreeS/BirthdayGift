# CLAUDE.md — agent instructions for this project

## Before starting any task
Always read `plan.md` and `handoff.md` in full before doing anything else, even if the request seems simple or you think you already know the context. `plan.md` is the source of truth for what this project is and what's been decided. `handoff.md` is the log of what's actually been built and what state things were left in.

## While working
- If anything is unclear, ambiguous, or not covered by `plan.md`/`handoff.md`, **stop and ask the user before proceeding**. Do not assume, do not guess at intent, and do not pick a default silently. This applies to product decisions (e.g. copy, content, flow behavior) as much as technical ones (e.g. libraries, file structure).
- If you discover a decision was already made in `plan.md` or `handoff.md`, follow it — don't relitigate it without reason. If you think it should change, ask the user first.
- Keep changes scoped to what was asked. Don't refactor or restructure unrelated parts of the project without checking in.

## After finishing any task
Update `handoff.md` before ending your turn. Every update should include:
- What was completed this session (files created/changed, decisions made)
- Current state of the project relative to `plan.md`'s build order
- Anything left unfinished or partially done, and why
- Open questions for the user that came up but weren't blocking
- Clear "next step" for whoever (human or agent) picks this up next

If `handoff.md` doesn't exist yet, create it. If it exists, append a new dated entry rather than deleting prior history — the log should read top-to-bottom as a timeline.

## General
- Match the design tokens and conventions already recorded in `plan.md`. Don't introduce new colors, fonts, or patterns without checking in first.
- This is a personal, one-off project (a birthday surprise), not a product with real users — favor simple, readable code over generalized/abstracted architecture.
