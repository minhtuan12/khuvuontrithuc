# Accounts and personal learning data

User request: username/full name registration, optional gender, login modal matching the existing garden UI, and API persistence per account. User explicitly selected adding a password at registration and username/password login. Existing authorization to keep Vercel Git deployments disabled remains in force; do not deploy the website.

## Behavior
- Register with username, full name, password, optional gender. Normalize username case; validate 3–32 ASCII letters/numbers/underscore/dot/hyphen, full name 2–100 characters and password 8–128 characters. No email required.
- Login restores that account's progress on any browser/device. Logout returns to the previous guest workspace. Never implicitly copy guest records into an account or between accounts.
- Preserve existing guest mode and data. Personal data includes all existing document keys: stars, game stars, learning stats, badges, emotions, study time, settings, family posts/comments, teacher notes/preparation, English stars/progress, and uploads. Media and notes stay private to the same owner.
- Show account entry in the existing header and settings. Use a native dialog with login/register modes, visible labels, inline errors/loading, password visibility toggle, Escape close and focus restoration. Signed-in account view shows name/username and logout. Use existing garden artwork, Nunito/Baloo 2, white rounded card, green headings, sky/pink accents. No new illustration generation.

## Architecture
- Extend the existing cookie/device API rather than introduce an email-based login. Account endpoints: POST `/api/device/auth/register`, `/login`, `/logout`; GET `/api/device/auth/session`.
- Shared account service: PBKDF2-SHA256 (600,000 iterations, random salt), random 256-bit session tokens, SHA256 token hashes at rest, 30-day expiry, logout revocation, username-based throttling and generic login failures. Passwords/tokens never appear in responses or logs. Cookies HttpOnly, SameSite=Strict, Secure in production.
- Store accounts/sessions in private, RLS-enabled Supabase tables inaccessible to anon/authenticated roles, accessed only by the existing server-side service role in Edge Functions. Local development uses matching SQLite adapter. No privileged key in Vite.
- Each account gets a random stable 64-hex document owner recorded in existing devices table. Backend derives owner from verified session, ignores client-supplied owner, and rejects expired/invalid account cookies instead of falling back to guest writes. Guest cookie must never authenticate an account owner.
- Keep existing CAS document and upload APIs, selecting account owner when signed in. Preserve Supabase external rewrite and all guest data.
- Auth boundary resolves current session before mounting App. Namespace every learning cache by account, retaining guest legacy keys only for guests. Abort stale requests during account changes, reset English progress singleton, remount account-dependent screens, and notify other tabs to re-resolve identity. A failed auth request preserves the current account.

## Verification
Registration duplicate/validation, wrong password, throttling, logout revocation, expiry, unknown-token isolation, cross-account GET/PUT/upload protection, CAS and cookie attributes; cache isolation and late response cancellation; browser registration/login/logout, account A/B switching, reload, native modal keyboard/Escape, mobile and failure states. Existing tests/build/typecheck and strict UI audit must pass. Preserve all prior image imports and verify images decode.
