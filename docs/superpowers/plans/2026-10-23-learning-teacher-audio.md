# Learning navigation, teacher AI and audio implementation plan

**Goal:** Implement the four changes in the user's request on the latest repository revision.
**Architecture:** Keep EnglishRoadmap and the catalog as curriculum owners. Open lesson detail as a child of the roadmap. Replace TeacherWorkshop authentication with an AI form using the existing server AI router. Keep automatic application speech disabled; provide explicit assistant read-aloud separately. Reuse garden artwork and existing typography for the author footer.
**Tech stack:** React, TypeScript, Express, Gemini server proxy, browser speech synthesis, Bun tests.
**Spec:** User request dated 2026-10-23; footer reference at Desktop/tải xuống (1).jpg.

- [x] Pull latest code with a clean working tree.
- [x] Add regression tests for explicit speech and teacher AI input/provider failure handling; observe failure.
- [x] Make roadmap the sole child-learning navigation entry and preserve return age.
- [x] Replace teacher login UI with activity suggestions, AI lesson preparation and self-study; support editable results, local drafts and errors.
- [x] Add responsive author footer using exact reference contact details.
- [x] Copy supplied WAV to public audio and use it on the start gesture.
- [x] Restore explicit assistant speech with errors and cleanup; preserve silent automatic speech elsewhere.
- [x] Run typecheck, tests, build, UI audit and browser checks.

Decisions: no new authentication or cloud schema is needed; teacher drafts use the existing device-document storage contract. Existing illustration assets provide the footer garden setting. CodSpeed tools concern performance profiling, outside these functional changes; no performance infrastructure will be added.

Review: independent reviewer found an age-change return-context bug. Browser regression reproduced the wrong topic, then passed after propagating the topic reset to the parent.

Verification: 55 Bun tests pass; TypeScript and production build pass; strict premium UI audit reports no findings. The supplied and served WAV have identical SHA-256 hashes and browser decoding succeeds. Requested-change browser checks cover 22 assertions, with real device persistence and simulated provider/speech success. Local AI returns 503 because GEMINI_API_KEY is not configured; audible hardware playback still needs manual listening. Run the browser suite against production to avoid Vite reloads when screenshots/results are written.

Full browser suite passed against http://127.0.0.1:3001/ (production), including family flows, learning/rewards, microphone denial, keyboard containment, service errors and requested-change checks. Existing build warning about a JavaScript chunk exceeding 500 kB remains; no performance refactor was requested.
