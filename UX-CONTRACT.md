# Application UI ownership

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Select/Listbox | Native labeled select in EnglishRoadmap and TeacherWorkshop | This contract and existing curriculum catalog | native | Browser age change, keyboard selection; workshop validation |
| Form | ParentDashboard and TeacherWorkshop application validation | This contract | local draft / teacher preparation / authentication | Browser local save/reload, empty submit, storage error |
| Scrollbar | src/index.css | DESIGN.md | global / horizontal parent tabs | Narrow viewport and computed styles |

- Navigation: `src/App.tsx` owns top-level screens and the bottom navigation. The visible main tab determines its single active item; English is a view within Home. A destination reached through search includes category, curriculum age, and section (`src/lib/navigation.ts`). Parent Back means Home. Settings offers a return to the parent space.
- Select/Listbox: native selects are intentional for curriculum and teacher lesson pickers. Platform popup geometry and keyboard behavior are accepted. Keep their visible labels and focus indicators.
- Forms: parent drafts and teacher preparation use application-owned validation with `noValidate`, trimmed values, disabled unavailable submits, length limits, and inline status/errors. Textareas have fixed minimum height, internal scrolling and no resize handle.
- Emotion overlay: `EmotionCheckIn` owns a native modal dialog. `showModal()` provides modal keyboard containment and background inertness; Escape and both close actions dismiss without recording, then focus returns to the invoking element. Choice metadata is owned by `src/lib/wellbeing.ts`.
- Notifications: use local inline role=status or role=alert feedback close to the changed workflow. Browser alert/confirm are not part of new flows.
- Storage: emotion history, study time, stars, settings and private parent drafts read/write through device-scoped backend APIs; browser storage is a migration source and offline backup. Initial hydration must finish before editable forms are enabled. Saves use versioned CAS; show errors and an explicit backed-up restore on conflict. A saved note/share does not imply a message was sent to another person. Do not show invented metrics or psychological diagnoses.
- Scrollbar: `src/index.css` owns global standard and WebKit fallback scrollbar styling. Parent subtabs may scroll horizontally on narrow screens.
- Async learning: answer/submit locks are synchronous. Cancel question timers and microphone/recognition work on exit, question reset, or topic change. A failed speech recognition attempt has no score and no earned rewards.
- Teacher AI: `TeacherWorkshop` owns preparation validation and async state. `/api/teacher/plan` generates age-specific suggestions, lesson plans or self-study using server credentials. The device-scoped `teacher-preparation` document stores the current editable draft without an email account; hydration precedes editing and existing conflict/retry behavior applies. A generated plan is a teacher-reviewable suggestion. Failed AI requests retain prior output.
- Assistant audio: explicit listen requests use `src/lib/assistantSpeech.ts`, expose playback errors and stop on exit or a second click. Automatic application narration stays disabled. The start gesture plays the supplied local `/audio/welcome.wav`.
- No application table selection, date input, billing, or destructive CRUD is introduced by this work.

- Accounts: `AccountRoot` resolves identity before mounting learning screens; `AccountModal` owns login/register validation, pending/error states and native dialog focus. Registration asks for username, full name, password and optional gender; no email is required. Guest learning stays available without registration. All personal documents and uploads use the authenticated account owner or the existing guest device owner. Account changes abort pending requests and microphone work, remount learning state and select an isolated browser cache. Requests include captured identity to reject stale cross-account writes. Guest data never silently moves into an account; logout restores the guest garden. Secrets never enter browser storage.
