# Accounts and learning data implementation plan

**Goal:** Add username/password accounts and isolate all personal learning data.
**Spec:** ../specs/2026-10-23-account-learning-design.md
**Stack:** React, Express/Bun SQLite locally, existing Supabase Edge/Postgres in production.

- [x] Backend: shared credential/session service, SQLite and Supabase repositories, HTTP adapter, private migration and meaningful security tests.
- [x] Client data: account identity store, scoped storage, request barriers, English progress reset, local/Edge owner routing and cross-account tests.
- [x] UI: account provider/boundary and native login/register/account modal using existing garden styles; header/settings integration.
- [x] Integration: apply additive Supabase migration and deploy backward-compatible Edge API after local/security verification; do not deploy Vercel.
- [x] Verify tests/typecheck/build, security advisors, real API integration with disposable test accounts, browser account flow/isolation/modal/mobile. Existing image assets are unchanged; new modal artwork verified visually.
- [x] Independent code/security review and fix findings; update DESIGN/UX contract and verification notes. See docs/verification/accounts.md.

Rulings: password choice is explicitly approved. All existing personal documents/uploads become account-scoped. Guest data stays separate to avoid silently claiming another child's data on a shared device. Supabase existing device API and server-only role are retained; no email field, OAuth provider, authentication secret or paid service is added. Vercel auto-deploy stays disabled; no website deploy or Git push is part of this request.
