-- The current website's 36 English lesson IDs are distinct from the source
-- project's 12 path-v1 word IDs. Keep both data models side by side.
CREATE TABLE IF NOT EXISTS public.english_lesson_progress (
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id text NOT NULL CHECK (char_length(lesson_id) BETWEEN 1 AND 100),
  age_band text NOT NULL CHECK (age_band IN ('3-4', '4-5', '5-6')),
  opened_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS public.teacher_english_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id text NOT NULL CHECK (char_length(lesson_id) BETWEEN 1 AND 100),
  age_band text NOT NULL CHECK (age_band IN ('3-4', '4-5', '5-6')),
  teacher_note text NOT NULL DEFAULT '' CHECK (char_length(teacher_note) <= 2000),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS teacher_english_plans_owner_lesson_idx ON public.teacher_english_plans(owner_id, lesson_id);

ALTER TABLE public.english_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_english_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY english_lesson_progress_owner ON public.english_lesson_progress
  FOR ALL TO authenticated USING ((SELECT auth.uid()) = owner_id)
  WITH CHECK ((SELECT auth.uid()) = owner_id);
CREATE POLICY teacher_english_plans_owner ON public.teacher_english_plans
  FOR ALL TO authenticated USING ((SELECT auth.uid()) = owner_id)
  WITH CHECK ((SELECT auth.uid()) = owner_id);

GRANT SELECT, INSERT, UPDATE ON public.english_lesson_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_english_plans TO authenticated;

-- Stable API for the current website. Existing source-project progress RPC is unchanged.
CREATE OR REPLACE FUNCTION public.save_current_english_progress(
  p_lesson_id text, p_age_band text, p_opened_at timestamptz, p_completed_at timestamptz
) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF p_lesson_id IS NULL OR char_length(p_lesson_id) NOT BETWEEN 1 AND 100
     OR p_age_band NOT IN ('3-4', '4-5', '5-6')
     OR p_opened_at IS NULL THEN RAISE EXCEPTION 'Invalid lesson progress'; END IF;
  INSERT INTO public.english_lesson_progress(owner_id, lesson_id, age_band, opened_at, completed_at)
  VALUES(auth.uid(), p_lesson_id, p_age_band, p_opened_at, p_completed_at)
  ON CONFLICT (owner_id, lesson_id) DO UPDATE SET
    opened_at = LEAST(english_lesson_progress.opened_at, EXCLUDED.opened_at),
    completed_at = COALESCE(english_lesson_progress.completed_at, EXCLUDED.completed_at),
    updated_at = now();
END $$;
REVOKE ALL ON FUNCTION public.save_current_english_progress(text,text,timestamptz,timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_current_english_progress(text,text,timestamptz,timestamptz) TO authenticated;
