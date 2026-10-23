# UI design context

The English roadmap follows the reference at `D:/khu-vuon-tri-thuc-source/khu-vuon-tri-thuc-source/src/routes/roadmap.tsx`: cream storybook garden, green headings, Mầm mascot, pastel stepping stones, dotted paths and flower progress. Styles and palette are scoped under `.english-roadmap`. Use existing Nunito and Baloo 2 fonts.

Current English lesson objects, IDs, age groups, progress events and `onOpenLesson` remain the canonical content and behavior owners. Topic buttons open the first lesson of a garden; returning restores that garden's path. The native labeled age select chooses the curriculum. Lesson buttons and the continue action both call the existing lesson opener. Completed flowers represent played lessons. Mobile uses a vertical alternating path; keyboard focus and reduced motion must remain supported. Application scrollbars remain owned by `src/index.css`.

The roadmap is the single child-learning entry in English navigation. Lesson detail is nested under it and retains its active navigation item; returning restores the curriculum age. TeacherWorkshop owns the email-free activity form, AI activity suggestions, editable AI lesson plan and self-study output. These use the existing pink teacher palette and native labeled controls. The shared AuthorFooter uses existing garden artwork, Nunito/Baloo 2, author Nguyễn Thị Nga, telephone 0349627607 and email Nguyennga.dp91@gmail.com; contacts remain readable links at narrow widths.

## Family screens

ParentDashboard uses the same sky polka setting as Home with white rounded frames, restrained pastel cards and green Baloo 2 headings. Nunito remains the body face. Reference assets live under `public/illustrations`: garden-story.jpg anchors the parent/check-in heroes; school-hero.webp appears on the family activity card; garden-card.webp, colors-card.webp and animals-card.webp illustrate the matching roadmap topics. No generated replacement art is necessary.

`src/screens/parent-dashboard.css` owns the parent tokens and responsive layout. `src/components/emotion-check-in.css` owns the check-in dialog. Both preserve the existing application palette and sibling typography; illustration stays separate from text. Emotion metadata and validated device history are shared through `src/lib/wellbeing.ts`. See `UX-CONTRACT.md` for behavior ownership and native select decisions.

Parent totals come from actual learning counters, persisted stars, and recorded study time. Reference menus are labeled as suggestions; local family shares and teacher discussion notes never pretend to have been sent to an external service. Emotion feedback supports conversation and does not diagnose the child. No scores or rewards are invented after failed speech recognition.
