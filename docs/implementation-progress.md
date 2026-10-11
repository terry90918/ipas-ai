# iPAS implementation ledger

Plan: docs/superpowers/plans/2026-10-12-ipas-practice.md
Task 1: PDF extraction delegated, RED/GREEN tests required. Authoring pending parsed corpus.
Task 2: Supabase organization JruisLM approved. get_cost tool unavailable; browser login required for creation. No fallback to existing staging.
Task 3: frontend delegated against lib/types.ts; server implementation owned by parent.
User decision: browser-local storage was declined in favor of cross-device sync; use server Supabase RPC and Sites identity. No duplicate OAuth.

Ruling: protect the user practice history from the public GitHub source; store import JSON in a private Sites runtime secret, not tracked application code. Existing diagram SVGs omit old personal grading labels. Cost if wrong: import stays unavailable until runtime configuration.
Task 1: extraction complete, 14/14 exams, 700/700 questions, 872 original crops, 9 tests pass. Detailed explanation authoring ongoing.
Task 2: Postgres17 service-role tests pass; full concurrency and production readback pending.
Task 3: Next.js16.4.0/shadcn UI done; Next/OpenNext build and Worker dry-run pass. Content release gate intentionally not yet passing.

Task 1: 600/700 detailed explanations drafted and per-exam structural gates checked. Corrected q40/q42 of intermediate-115-1-3 after original image review; parser11 tests pass, only2 stem/options changes.
Task 2: fixed empty/204 RPC response handling after real PostgREST save. RED/GREEN tests cover no-body saves and diagnostic sanitization.
Task 3: local production browser readback shows saved answers, full option reasoning, original images, wrong count, resume; 390px width equals scroll width. Explicit database outage preserved selected answer and attempt count2; recovery persisted third attempt once.
Cloud blocker: GitHub SSO reached Supabase MFA. User requested to complete MFA in browser; no project created, no production deployment.

Task 1: complete700/700 detailed explanations. All14 source inventories, explanation schemas and referenced assets validated. All11 extraction tests pass. Primary-source author audits saved for200+200+300 entries.
Task 2: local database seeded700 questions/700 explanations. Modern sb_secret API-key headers checked against current Supabase docs; dedicated regression test passes.
Task 3: full-project lint, TypeScript,13 Node tests and Next/OpenNext/Sites Worker build pass. Build uses OpenNext1.20.9 and Wrangler4.149.0 to remove vulnerable minifier dependency chain.
Dependency audit: production dependencies0 advisories; five high-severity development-only entries in eslint-config-next→fast-glob→micromatch→braces chain, no patched braces release available. Trusted local lint patterns only; not in published Worker.
Task 4: source commit and complete code review pending; no Supabase project or actual production authentication/synchronization yet.

Final review: one independent Codex review83cbacb, findingsP1 shared contexts andP2 stale cross-round draft. One focused correction wave, no additional full reviews.
CodeRabbit: GitHub skipped945-file PR limit100; one CLI review completed with warnings and4 issues, all verified/actionable issues fixed.
Ruling: regrade Apriori false superset claim and punctuation-only image choices from Minor to Important because they teach or display wrong question information; fix with source checks and real-data regression tests. Cost if wrong: narrow content changes, no answer-key changes.
Fix wave verified:12 shared contexts,872 unique crops/907 references;16 question objects corrected without changing any official key;7 option-note dictionaries corrected;24 Node tests and14 extraction tests pass.
Browser focused readback: independent HTTP client completed an old round/start new while browser retained old choice. Old idempotent200 and conflicting409 both reset to new first-unanswered question with zero selected radios and disabled submit. Saved attempt count stayed10 after conflicting old submission. Local testing only, not production authentication.
