# English garden games verification — 2026-10-23

Implemented Nối hình với từ, Bức tranh bí mật and Ong chăm chỉ đánh vần alongside the four existing English playground games. The shared 64-word corpus covers eight topics with 32/48/64 words available across cumulative scaffolding levels. See `docs/english-garden-vocabulary.md` and `src/lib/englishGardenGames.ts`.

## Checks

- `bun test`: 82 passing tests across 19 files. New coverage validates complete/unique corpus records, age/topic coverage, immutable randomized sampling, unique correct options, repeated letters, two spelling decoys, progress counters, bounded schema, persistence/CAS and account A/B isolation.
- `bun --bun node_modules/typescript/bin/tsc --noEmit`: passed.
- `bun --bun node_modules/vite/bin/vite.js build`: passed; existing large-chunk warning remains. No new package dependencies or remote image assets.
- `bun scripts/verify-garden-games.mjs` against local production server at `http://127.0.0.1:3007`: passed. Covers all three games, wrong answer/retry, rapid duplicate answer/reward protection, family relationship clues, six-word Bee run with repeated letters, mobile overflow/44px targets, replay/abandon, keyboard focus restoration, English learning counters, persisted stars after reload and unavailable-audio recovery. No runtime exceptions. See `garden-games-browser.json` and screenshots.
- Strict frontend premium audit passed with no findings; report in `garden-games-premium-audit.json`.
- Independent review found a family-picture ambiguity; visible Vietnamese labels resolved it and the scoped re-review found no blockers.
- CodSpeed connector returned no configured repositories, so no CodSpeed performance run is claimed. Sampling uses bounded arrays and Fisher–Yates; no performance service or dependency was added.

## Persistence and release state

The existing owner-scoped document API now accepts `english-garden-progress`. Summaries store runs, practiced-word count, best accuracy and last play for each game/topic/age. Existing `game-stars` stores five stars per completed run, and the canonical app callback records one English activity. Hints, wrong answers and unfinished runs do not award stars. Saves reuse existing retry/offline-cache/version-conflict/restore behavior, and guests remain supported.

Implementation checks above were completed locally before release. The 2026-10-23 release includes these games together with the adventure set and teacher phonetic-display cleanup. Release ordering: deploy shared Edge validation with its new `src/lib/gardenProgress.ts` dependency before publishing the frontend. No database migration is needed. See `games-release.md` for release scope and verification commands.

Pictograms are local Unicode emoji, so their visual drawing varies by platform. Existing garden-story artwork is reused. Audio uses the existing explicit speech helper; actual voice output depends on device English voice support and browser audio settings, with a visible recoverable error when unavailable.
