# English garden games implementation

Spec: ../specs/2026-10-23-english-garden-games-design.md

- [x] Curated corpus, topic/age metadata, pure session/choice/spelling helpers and tests (`src/lib/englishGardenGames.ts`, `tests/englishGardenGames.test.ts`).
- [x] Three playable game views and CSS, shared age/topic/session flow (`src/components/EnglishGardenGames.tsx`, `english-garden-games.css`).
- [x] Integrate entry cards/menu with existing stars and owner-scoped progress; shared server validator and API tests. Keep old games.
- [x] Review interaction races, content and account isolation; fix findings. Family pictures now have explicit Vietnamese relationship labels; Bee has two distinct decoys and independent repeated-letter buttons.
- [x] Typecheck, 82 passing tests, build, strict audit, local browser desktop/mobile/reload and API validation. See docs/verification/garden-games.md. No deployment/push.

Ruling: work in the existing workspace because this is the user's active reviewed checkout; retain unrelated premium-audit.json. No Git mutations during implementation. Parallel work is confined to separate new files; root owns integration and validation.
