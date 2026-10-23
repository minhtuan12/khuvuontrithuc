# Production deployment verification

- Project: `khu-vuon-tri-thuc` (`prj_tm0Mkz9oRVICDfhYb9xPhHmBVOAn`), team `minhtuan12s-projects`.
- Production deployment: `dpl_8AZWQtDAMwbaK7LEqXW11ydqk5X4`, READY.
- Public URLs: https://khuvuontrithuc.vercel.app and https://khu-vuon-tri-thuc.vercel.app. Both return the verified frontend asset.
- Git integration was incorrectly connected to `minhtuan12/khu-vuon-tri-thuc`; it now targets `minhtuan12/khuvuontrithuc`. Previous production deployment source was CLI and its metadata already named `khuvuontrithuc`, explaining why code could be correct despite the wrong integration.
- Source: current local workspace, including uncommitted changes. No commit or Git push was performed. Deployment metadata therefore retains base SHA `00068518e17a3419443ba6e8d38edaa03e0af2c4`; it is not a claim that this SHA contains the new changes.
- Application env synchronized from `.env.local` to production: `GEMINI_API_KEY`, `APP_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`. Secret values were not printed. `VERCEL_OIDC_TOKEN` was excluded because Vercel provisions it. Optional `GEMINI_CHAT_MODEL` remains supported.
- Supabase Edge Function `kvtt-device` deployed as version 4, preserving existing device authentication and storage. Added shared teacher-preparation validation and the project's legitimate production origins. No database migration was executed.
- Staging caught a Node ESM module-resolution failure. Explicit TypeScript import extensions plus `rewriteRelativeImportExtensions` resolved it before domain promotion.
- Tests: 58 Bun tests pass; TypeScript and Vite build pass. Browser checks on the public production URL pass all 22 requested-change assertions. Browser speech calls were mocked; audible hardware output still requires listening on a device.
- Live AI: assistant, activity suggestions, lesson plan and self-study each returned HTTP 200 on the staged production build. Chat and suggestions were rechecked successfully through the primary public domain after promotion.
- Persistence: HttpOnly device cookie crosses the Vercel rewrite correctly; teacher drafts save and read back through Supabase. Production welcome WAV has the same SHA-256 as the supplied local WAV.
- Browser bundle contains neither the Gemini secret nor local OIDC token. Runtime error/fatal log scan for the released deployment returned no records in the checked 30-minute window.

Evidence: `vercel-stage-check.json`, `vercel-production-check.json`, `requested-changes.json` and the mobile screenshots in this directory.
