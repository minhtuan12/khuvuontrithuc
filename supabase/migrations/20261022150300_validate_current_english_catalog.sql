-- IDs and age bands are copied from src/constants/englishData.ts. Lesson content
-- remains in that file; this small registry validates references in Supabase.
CREATE TABLE public.english_catalog_lessons (
  lesson_id text NOT NULL,
  age_band text NOT NULL CHECK (age_band IN ('3-4', '4-5', '5-6')),
  PRIMARY KEY (lesson_id, age_band)
);
ALTER TABLE public.english_catalog_lessons ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.english_catalog_lessons FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.english_catalog_lessons TO anon, authenticated;
CREATE POLICY english_catalog_lessons_read ON public.english_catalog_lessons
  FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.english_catalog_lessons(lesson_id, age_band) VALUES
  ('greetings-34','3-4'),('self-34','3-4'),('family-34','3-4'),('school-34','3-4'),
  ('colors-34','3-4'),('numbers-34','3-4'),('animals-34','3-4'),('toys-34','3-4'),
  ('body-34','3-4'),('food-34','3-4'),('jobs-34','3-4'),('spring-34','3-4'),
  ('plants-34','3-4'),('vehicles-34','3-4'),
  ('shapes-45','4-5'),('numbers-45','4-5'),('transport-45','4-5'),
  ('weather-clothes-45','4-5'),('commands-45','4-5'),('school-45','4-5'),
  ('family-45','4-5'),('jobs-45','4-5'),('spring-45','4-5'),('plants-45','4-5'),
  ('colors-45','4-5'),('animals-45','4-5'),
  ('intro-self-56','5-6'),('school-supplies-56','5-6'),('jobs-56','5-6'),
  ('phonics-abc-56','5-6'),('family-56','5-6'),('spring-56','5-6'),
  ('plants-56','5-6'),('transport-56','5-6'),('colors-56','5-6'),('animals-56','5-6');

ALTER TABLE public.english_lesson_progress ADD CONSTRAINT english_progress_catalog_fk
  FOREIGN KEY (lesson_id, age_band) REFERENCES public.english_catalog_lessons(lesson_id, age_band);
ALTER TABLE public.teacher_english_plans ADD CONSTRAINT teacher_english_plans_catalog_fk
  FOREIGN KEY (lesson_id, age_band) REFERENCES public.english_catalog_lessons(lesson_id, age_band);
