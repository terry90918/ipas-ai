# iPAS 自習室 UI contract

## Business evidence

| Constraint | Source |
| --- | --- |
| One active round, maximum five questions, unseen priority | `supabase/migrations/20261011165044_ipas_practice.sql` |
| Answer secrecy before saving, question IDs and grading | `lib/domain.ts`, `lib/types.ts` |
| Site identity and owner isolation | `app/chatgpt-auth.ts`, `app/api/practice/route.ts` |
| Duplicate submission and conflict recovery | `components/practice-helpers.ts`, `lib/database.ts` |
| 700-question completeness and source-paper coverage | `README.md`, `scripts/content-validation.mjs` |

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
| --- | --- | --- | --- | --- |
| Select/Listbox | `components/ui/native-select.tsx` | platform popup | native | popup, label, keyboard |
| Form | `Practice`, `parseAction` | domain/API | filters, answer | validation and duplicate prevention |
| Scrollbar | `app/globals.css` | DESIGN.md | standard, forced colors | computed style, narrow viewport |
| Toast | inline `role=alert` / `role=status` in `Practice` | server result | error, saved result | failure recovery |
| CRUD | `app/api/practice/route.ts` | domain/API | start, answer, import | full practice and sync |

No table selection, date input, deletion, billing or locale switching exists in this scope.

## Flow ledger

| Operation | Pending | Success | Failure |
| --- | --- | --- | --- |
| Load | labeled spinner | home or persisted round | reload / sign in |
| Start/resume | controls disabled | first unanswered question | inline error, no fabricated progress |
| Answer | selected choice retained, save button busy | saved grade and explanation | draft retained; retry or 409 reconciliation |
| Next | local navigation | next question and heading focus | no additional mutation |
| Review | same question view | grade and full sources | parsed question and explanation remain readable |
| Import | Radix dialog, busy controls | dismiss on server acknowledgement | dialog stays open, error remains visible |

Only server-confirmed answers count. Unanswered future questions remain disabled. Previous saved answers can be reviewed. Home filters are transient non-shareable local state; no URL-state migration is part of this visual change.

## Navigation, focus and accessibility

The application has no top header. Plain text identity lives in the sidebar and remains visible on narrow layouts. There is no app-owned logout control; Site authentication and server ownership checks remain required. Page title remains `iPAS 自習室｜AI 應用規劃師` because views share one route. Button labels remain localized. Every action uses Button or a real link. RadioGroup and Dialog retain their native/Radix keyboard patterns. Preserve skip navigation, visible focus and heading focus on question changes. Sticky UI reserves scroll padding; no body scroll lock.

Narrow layout at 390px must expose the start action on the first 844px screen, keep options readable, and avoid horizontal page overflow. Use one document scroll owner. Original exam page images are omitted from the question card. The exam PDF remains available from the answer references, and supplementary explanation diagrams remain visible.

## Errors and recovery

401 offers Site sign-in; invalid requests remain server rejected. Config/network/5xx errors show inline recovery without claiming saving. A 409 presents the refreshed server round. UI never creates an optimistic score or a local-only saved claim. Existing domain and concurrency tests own these invariants.
