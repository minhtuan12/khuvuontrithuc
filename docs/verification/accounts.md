# Account verification — 2026-10-23

Implemented username/password registration and login, optional gender, logout, server-only session cookies, and account-scoped documents/uploads. Guests retain previous device data and can use learning features without creating an account. There is no automatic guest-to-account import.

Validation:

- `bun test`: 76 tests passed, including credentials, throttling, expiry/revocation, A/B/guest isolation, stale requests, upload privacy, blocked storage, and bootstrap identity mismatch.
- TypeScript check and production Vite build passed. Build retains the existing large-bundle warning.
- Browser registration without gender, session reload, A/B progress isolation, logout, wrong-password feedback, login restoring progress, Escape dismissal and mobile modal bounds passed with no runtime exceptions. See `accounts-browser.json` and account screenshots.
- Strict premium UI audit: zero findings.
- Existing Vercel URL forwarded the new API successfully: 13 checks passed, including guest compatibility, real registration/login/logout, secure cookies, profile privacy, cross-account isolation, stale-write rejection and progress restoration. See `accounts-remote.json`. Both disposable test accounts and their learning data were removed afterward.
- Independent backend/security review found no blockers. New private tables have RLS enabled, no client grants, and service-role-only RPC access. Security advisors show expected no-policy INFO for private server tables; two pre-existing SECURITY DEFINER warnings concern `approve_learning_experience` and `reserve_ai_request`, outside this feature. Guidance: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable

Infrastructure: additive `learner_accounts` migration applied; `kvtt-device` Edge function v5 deployed and verified. No frontend deployment, Git push, or change to Vercel automatic deployment settings was performed. The new frontend remains in this workspace pending a requested release.

Known scope: password reset/recovery and account deletion UI are not implemented. Because no email/phone is collected, there is no email recovery flow. Guest data remains tied to its device cookie; signed-in data follows the account across devices.
