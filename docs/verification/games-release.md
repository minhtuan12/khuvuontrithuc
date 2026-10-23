# English games release — 2026-10-23

Scope: six additional English games, 64 shared vocabulary entries and 72 adventure missions, owner-scoped progress/stars/canonical English counters, and removal of approximate Vietnamese phonetics from teacher English screens. Existing games and guest/account behavior remain supported.

Source: `main` in `https://github.com/minhtuan12/khuvuontrithuc`. Hosting retains the existing Vercel project name `khu-vuon-tri-thuc`, ID `prj_tm0Mkz9oRVICDfhYb9xPhHmBVOAn`, team `team_jh0uP5SxGvvkOvcZEZMrBVJN`. The source repository name and hosting-project name are intentionally distinct. Git automatic deployment remains disabled; this is a manually requested production release.

Pre-release checks:88tests passed, TypeScript/build passed, both new game browser suites passed, strict premium audits passed and independent reviews resolved. New progress is bounded to162game/topic/age keys. No migration, package dependency or environment change is required. Existing production environment variables remain server-managed; local `.env.local` is neither committed nor uploaded.

Release order: update `kvtt-device` Edge function and its complete shared TypeScript dependency graph; verify a valid game-progress write and reject malformed data; push reviewed source and deploy that exact commit on Vercel; verify production aliases, new cards, teacher phonetics removal, guest/account sessions, progress persistence and critical image/audio endpoints.

Repeat browser verification with `AUDIT_BASE_URL` set to the target URL before running `bun scripts/verify-garden-games.mjs` and `bun scripts/verify-adventure-games.mjs`. These scripts perform real guest writes and learning actions; use a dedicated verification browser/session, never a real learner's active session. Runtime release results are reported after deployment separately from these pre-release checks.
