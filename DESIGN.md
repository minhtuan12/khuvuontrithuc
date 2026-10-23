# UI design context

The English roadmap follows the reference at `D:/khu-vuon-tri-thuc-source/khu-vuon-tri-thuc-source/src/routes/roadmap.tsx`: cream storybook garden, green headings, Mầm mascot, pastel stepping stones, dotted paths and flower progress. Styles and palette are scoped under `.english-roadmap`. Use existing Nunito and Baloo 2 fonts.

Current English lesson objects, IDs, age groups, progress events and `onOpenLesson` remain the canonical content and behavior owners. Topic buttons open the first lesson of a garden; returning restores that garden's path. The native labeled age select chooses the curriculum. Lesson buttons and the continue action both call the existing lesson opener. Completed flowers represent played lessons. Mobile uses a vertical alternating path; keyboard focus and reduced motion must remain supported. Application scrollbars remain owned by `src/index.css`.

The roadmap is the single child-learning entry in English navigation. Lesson detail is nested under it and retains its active navigation item; returning restores the curriculum age. TeacherWorkshop owns the email-free activity form, AI activity suggestions, editable AI lesson plan and self-study output. These use the existing pink teacher palette and native labeled controls. The shared AuthorFooter uses existing garden artwork, Nunito/Baloo 2, author Nguyễn Thị Nga, telephone 0349627607 and email Nguyennga.dp91@gmail.com; contacts remain readable links at narrow widths.

## Accounts

The account dialog uses the existing garden-story illustration, green Baloo 2 headings, Nunito labels, white rounded frame and pastel profile cards. `src/components/account-modal.css` owns responsive layout, visible focus and reduced-motion behavior. Login and registration are modes within one native dialog; account access lives in the Home profile button and Settings. Guest entry stays unchanged and never requires registration. Optional gender defaults to not shared. Authentication errors stay inline, and busy submits are disabled synchronously.

## English garden games

`EnglishGardenGames` extends the existing playground with flower-shaped picture pairs, a nine-leaf picture reveal and honey-colored spelling slots. It retains Nunito/Baloo 2, green headings, sky polka page background, cream panels and the local garden-story illustration. Scoped `english-garden-games.css` owns `--gg-*` visual tokens; it does not replace global fonts or scrollbars. Vocabulary pictograms use local Unicode emoji, with visible Vietnamese relationship labels when family pictures alone are ambiguous. No external image URLs are introduced.

Age and topic selectors are native labeled controls. Game play uses large tap buttons, explicit listen actions, retry without a countdown, and focus transfer after answers. Reduced motion and keyboard use remain supported. The original four games stay available alongside the three new entry cards.

## English adventures

The second English game set reuses the garden controls and `--gg-*` tokens: `EnglishAdventureGames` adds a basket shelf with quantity chips, a category picnic and train word carriages. `english-adventure-games.css` owns only these illustrations/layout variants. Keep all six garden entry cards and the original four games. Every picture card has visible Vietnamese context and an optional listen action; quantities and short sentences supplement the image where it cannot convey the full meaning. Back restores keyboard focus to the specific entry card. Train reset restores focus after the word bank becomes enabled.

## Family screens

ParentDashboard uses the same sky polka setting as Home with white rounded frames, restrained pastel cards and green Baloo 2 headings. Nunito remains the body face. Reference assets live under `public/illustrations`: garden-story.jpg anchors the parent/check-in heroes; school-hero.webp appears on the family activity card; garden-card.webp, colors-card.webp and animals-card.webp illustrate the matching roadmap topics. No generated replacement art is necessary.

`src/screens/parent-dashboard.css` owns the parent tokens and responsive layout. `src/components/emotion-check-in.css` owns the check-in dialog. Both preserve the existing application palette and sibling typography; illustration stays separate from text. Emotion metadata and validated device history are shared through `src/lib/wellbeing.ts`. See `UX-CONTRACT.md` for behavior ownership and native select decisions.

Parent totals come from actual learning counters, persisted stars, and recorded study time. Reference menus are labeled as suggestions; local family shares and teacher discussion notes never pretend to have been sent to an external service. Emotion feedback supports conversation and does not diagnose the child. No scores or rewards are invented after failed speech recognition.

## Teacher workspace

`TeacherWorkspace` owns the role-gated teacher navigation; `teacher-workspace.css` reuses the cream garden frames, green Baloo headings and Nunito body. Library/editor/upload and teacher statistics/questions share labeled native controls, 44px actions and inline request states. `TeacherConfirm` owns native modal confirmation for destructive actions and unsaved edits. The existing account dialog owns login; no PIN dialog is introduced. Guests and learner accounts do not mount teacher workflows.

The bottom navigation exposes **Cô giáo** only to authenticated teacher accounts. `/giao-vien` is the teacher overview; `/giao-vien/giao-an`, `/giao-vien/hoc-sinh`, `/giao-vien/hop-thu`, `/giao-vien/chuan-bi-bai`, and `/giao-vien/tu-hoc` are reload-safe routes. The overview uses the existing pale garden surface, restrained green heading and four operational cards; it does not introduce a separate admin visual brand.
