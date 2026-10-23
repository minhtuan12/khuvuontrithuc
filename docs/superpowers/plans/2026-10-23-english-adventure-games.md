# Three additional English games

- [x] Curate24missions+24oddquestions+24sentences and pure helpers/tests/docs (`englishAdventureGames.ts`, test and vocabulary document).
- [x] New reusable game cards and setup/play/result component using existing styles; basket, odd-group and train child views.
- [x] Extend owner-scoped progress valid IDs/bounds and integrate menu/stars/canonical activity; preserve prior work.
- [x] Independent review and meaningful tests/typecheck/build:88tests passed, no review blockers remain.
- [x] Browser allthreegameflows, retry/partial/replay/no duplicate reward, mobile/keyboard/audio failure/persistedstate; strictaudit and verificationdocs. Previous threegames regression browser suite also passes. No push/deploy. Evidence: docs/verification/adventure-games.md.

Rulings: the user delegates selection and asks for execution, so choose the three concrete mechanics above without another approval round. Use the existing checkout and reuse established controls/data/storage. Shared lexical corpus remains canonical; gameplay data lives in a separate file. Parallel implementation stays in disjoint files; root owns menu/progress integration and browser verification.
