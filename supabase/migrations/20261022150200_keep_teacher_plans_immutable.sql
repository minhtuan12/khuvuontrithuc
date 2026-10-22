CREATE OR REPLACE FUNCTION public.keep_approved_teacher_plan() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  IF OLD.status = 'approved' THEN RAISE EXCEPTION 'Approved teacher plans cannot be changed'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER keep_approved_teacher_plan_update BEFORE UPDATE OR DELETE ON public.teacher_english_plans
  FOR EACH ROW EXECUTE FUNCTION public.keep_approved_teacher_plan();
REVOKE ALL ON FUNCTION public.keep_approved_teacher_plan() FROM PUBLIC, anon;
