# Three more English games — 2026-10-23

Added Giỏ hàng của bé, Tìm bạn khác nhóm and Đoàn tàu câu ngắn. All seven existing games and the removal of teacher approximate phonetics are preserved. Data review tables for all72missions live in `docs/english-adventure-vocabulary.md`; the typed source is `src/lib/englishAdventureGames.ts`.

## Evidence

- `bun test`:88passing tests across20files, including817new corpus/helper assertions and backward-compatible capacity checks for all162progress keys. Account isolation integration saves and restores summaries for all three new IDs.
- `bun --bun node_modules/typescript/bin/tsc --noEmit`:passed.
- `bun --bun node_modules/vite/bin/vite.js build`:passed; existing large-chunk warning retained, no new dependencies or remote image assets.
- `bun scripts/verify-adventure-games.mjs`, local production server `http://127.0.0.1:3008`:passed. Basket wrong item/retry, rapid-tap overfill protection, partial-task no reward, six missions and correct action-based accuracy; category wrong choice/explanation and six missions; train wrong order/reset keyboard focus, independently selectable repeated words, six sentences; duplicate Next/completion reward protection;15stars and3canonical English activities; mobile overflow/44px controls; replay/abandon, reload persistence and recoverable unavailable audio. No runtime exceptions. See `adventure-games-browser.json` and screenshots.
- Previous `verify-garden-games.mjs` rerun against3008:passed all three earlier garden games including save/reload and family labels.
- Strict premium audit:zero findings (`adventure-games-premium-audit.json`).
- Independent content/integration review found an entry-card focus selector mismatch; corrected and browser-verified. Final independent UI review found no blockers.

## Storage and release

Uses existing owner-scoped `english-garden-progress`, `game-stars`, canonical English activity counters and shared failure/retry/conflict behavior. New IDs are basket/odd/train; old summaries remain valid. No database migration or auth change. The summary field `words` is retained for compatibility and counts practice units (six missions or sentences per completed adventure session), not a claim of unique vocabulary mastery.

Implementation checks above were completed locally before release. Production release must include the updated shared Edge validation and its `gardenProgress.ts` dependency before publishing the frontend. Local preview for this set is3008. See `games-release.md` for the release scope and verification commands.
