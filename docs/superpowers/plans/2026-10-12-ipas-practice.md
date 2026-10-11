# iPAS Practice Implementation Plan

> For agentic workers: use Superpowers execution and focused delegated content work. Preserve owned files and shared interfaces.

Goal: complete private exam practice website with all 14 PDFs and detailed explanations.
Architecture: Vinext Sites frontend/server, platform identity, server-only Supabase REST RPC. Offline extracted immutable corpus with original assets. Database stores immutable corpus and user sessions/attempts.
Tech Stack: React, TypeScript, Vinext, Supabase Postgres, Poppler/Python, node:test.
Spec: ../specs/2026-10-12-ipas-practice-design.md

## Global Constraints
- No application code comments; no root-main edits; no invented questions or answer keys.
- Complete explanations and diagrams are release gates.
- Reject missing identity; every user-owned SQL operation validates owner; secret remains server-side.

## Review Focus
- Cross-page options and standalone answer columns must preserve source meaning.
- Uncertain official answers must carry visible caveats.
- Concurrent saves and session starts must not duplicate scoring or active sessions.
- Failed cloud writes preserve UI choice and allow retry.
- Legacy imports must not repeat or become unfinished active sessions.

## Task 1: Corpus and detailed explanations
- [ ] Write extraction tests; prove RED.
- [ ] Extract 14 PDFs to content/exams.json and questions.json; preserve diagrams and page provenance; prove GREEN.
- [ ] Author detailed explanations in content/explanations/<examId>.json with reasoning, options, concept, pitfalls, sources, optional caveat.
- [ ] Validate all question IDs, options, answer keys, image references, explanations, per-exam counts and original PDFs.

## Task 2: Persistence and API
- [ ] Test selection, public projections, validation, stats, duplicates and ownership failures RED.
- [ ] Create Supabase schema/RPC; enable RLS and revoke anonymous access; seed immutable corpus outside migrations.
- [ ] Implement /api/practice GET and POST with PracticeState and PracticeAction from lib/types.ts. No client-provided user ID.
- [ ] Test successful, failing and conflicting operations GREEN; verify database actual queries.

## Task 3: Interface
- [ ] Implement Practice component against lib/types.ts, no bank imports into client.
- [ ] Initial GET /api/practice; POST start/answer/import returns refreshed PracticeState.
- [ ] Build home filters, stats, mobile single-question page, detailed explanations and round summary.
- [ ] Browser check saving/retry, keyboard choices, image/formula/code display and responsive layout.

## Task 4: Review and delivery
- [ ] Corpus validation, node:test, Python tests, TypeScript, full lint and build.
- [ ] One complete Codex review and CodeRabbit route per JT Harness before GitHub merge.
- [ ] Package exact source and deploy private Sites only after content gates.
- [ ] Actual login/save/resume readback; report evidence and remaining blockers, update JUR-630.
