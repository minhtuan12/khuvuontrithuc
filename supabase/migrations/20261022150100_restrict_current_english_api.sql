-- Supabase project had default public grants; explicitly remove them.
REVOKE ALL ON public.english_lesson_progress, public.teacher_english_plans FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.save_current_english_progress(text,text,timestamptz,timestamptz) FROM PUBLIC, anon;
