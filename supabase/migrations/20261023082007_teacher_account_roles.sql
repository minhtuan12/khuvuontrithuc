-- Existing accounts remain learners. Privileged provisioning is server-only.
ALTER TABLE public.kvtt_accounts
  ADD COLUMN role text NOT NULL DEFAULT 'learner' CHECK (role IN ('learner','teacher')),
  ADD COLUMN seed_key text;
CREATE UNIQUE INDEX kvtt_accounts_seed_key_idx ON public.kvtt_accounts(seed_key) WHERE seed_key IS NOT NULL;

-- Preserve the previous Edge version's RPC signature during rollout; it may
-- create learners only and must not claim the reserved provisioning username.
CREATE OR REPLACE FUNCTION public.kvtt_create_account(p_id uuid,p_username text,p_full_name text,p_gender text,p_owner_id text,p_password_hash text,p_password_salt text)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  IF lower(p_username) = 'ngant' THEN RETURN false; END IF;
  INSERT INTO public.kvtt_devices(id) VALUES(p_owner_id);
  INSERT INTO public.kvtt_accounts(id,username,full_name,gender,owner_id,password_hash,password_salt,role)
    VALUES(p_id,p_username,p_full_name,p_gender,p_owner_id,p_password_hash,p_password_salt,'learner');
  RETURN true;
EXCEPTION WHEN unique_violation THEN RETURN false;
END $$;

CREATE FUNCTION public.kvtt_create_account_with_role(p_id uuid,p_username text,p_full_name text,p_gender text,p_owner_id text,p_password_hash text,p_password_salt text,p_role text,p_seed_key text)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  IF p_role IS NULL OR p_role NOT IN ('learner','teacher') THEN RETURN false; END IF;
  IF lower(p_username) = 'ngant' AND (p_role <> 'teacher' OR p_seed_key IS DISTINCT FROM 'default-teacher-v1' OR p_full_name <> 'Cô Nga') THEN RETURN false; END IF;
  IF p_seed_key IS NOT NULL AND (p_seed_key <> 'default-teacher-v1' OR p_username <> 'ngant' OR p_role <> 'teacher') THEN RETURN false; END IF;
  INSERT INTO public.kvtt_devices(id) VALUES(p_owner_id);
  INSERT INTO public.kvtt_accounts(id,username,full_name,gender,owner_id,password_hash,password_salt,role,seed_key)
    VALUES(p_id,p_username,p_full_name,p_gender,p_owner_id,p_password_hash,p_password_salt,p_role,p_seed_key);
  RETURN true;
EXCEPTION WHEN unique_violation THEN RETURN false;
END $$;
REVOKE ALL ON FUNCTION public.kvtt_create_account(uuid,text,text,text,text,text,text), public.kvtt_create_account_with_role(uuid,text,text,text,text,text,text,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.kvtt_create_account(uuid,text,text,text,text,text,text), public.kvtt_create_account_with_role(uuid,text,text,text,text,text,text,text,text) TO service_role;
-- Reassert private privileges; roles must never be editable by public clients.
ALTER TABLE public.kvtt_accounts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.kvtt_accounts FROM PUBLIC, anon, authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.kvtt_accounts TO service_role;
