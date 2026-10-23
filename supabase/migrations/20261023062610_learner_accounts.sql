-- Additive account storage. Only the server-side service role may reach it.
CREATE TABLE public.kvtt_accounts (
  id uuid PRIMARY KEY,
  username text UNIQUE NOT NULL CHECK (username ~ '^[a-z0-9_.-]{3,32}$'),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 100),
  gender text CHECK (gender IN ('male','female','other')),
  owner_id text UNIQUE NOT NULL REFERENCES public.kvtt_devices(id) CHECK (owner_id ~ '^[a-f0-9]{64}$'),
  password_hash text NOT NULL CHECK (password_hash ~ '^[a-f0-9]{64}$'),
  password_salt text NOT NULL CHECK (password_salt ~ '^[a-f0-9]{32}$'),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.kvtt_account_sessions (
  token_hash text PRIMARY KEY CHECK (token_hash ~ '^[a-f0-9]{64}$'),
  account_id uuid NOT NULL REFERENCES public.kvtt_accounts(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
CREATE INDEX kvtt_account_sessions_account_idx ON public.kvtt_account_sessions(account_id);
CREATE INDEX kvtt_account_sessions_expiry_idx ON public.kvtt_account_sessions(expires_at);
CREATE TABLE public.kvtt_login_throttle (
  username text PRIMARY KEY,
  started_at timestamptz NOT NULL,
  attempts integer NOT NULL CHECK (attempts > 0)
);
ALTER TABLE public.kvtt_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kvtt_account_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kvtt_login_throttle ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.kvtt_accounts, public.kvtt_account_sessions, public.kvtt_login_throttle FROM PUBLIC, anon, authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.kvtt_accounts, public.kvtt_account_sessions, public.kvtt_login_throttle TO service_role;

CREATE FUNCTION public.kvtt_create_account(p_id uuid,p_username text,p_full_name text,p_gender text,p_owner_id text,p_password_hash text,p_password_salt text)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.kvtt_devices(id) VALUES(p_owner_id);
  INSERT INTO public.kvtt_accounts(id,username,full_name,gender,owner_id,password_hash,password_salt)
    VALUES(p_id,p_username,p_full_name,p_gender,p_owner_id,p_password_hash,p_password_salt);
  RETURN true;
EXCEPTION WHEN unique_violation THEN
  -- PL/pgSQL exception subtransaction rolls back the owner insert as well.
  RETURN false;
END $$;
CREATE FUNCTION public.kvtt_consume_login_attempt(p_username text,p_now timestamptz)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE total integer;
BEGIN
  INSERT INTO public.kvtt_login_throttle(username,started_at,attempts) VALUES(p_username,p_now,1)
  ON CONFLICT(username) DO UPDATE SET
    attempts=CASE WHEN public.kvtt_login_throttle.started_at <= p_now-interval '15 minutes' THEN 1 ELSE public.kvtt_login_throttle.attempts+1 END,
    started_at=CASE WHEN public.kvtt_login_throttle.started_at <= p_now-interval '15 minutes' THEN p_now ELSE public.kvtt_login_throttle.started_at END
  RETURNING attempts INTO total;
  RETURN total <= 5;
END $$;
REVOKE ALL ON FUNCTION public.kvtt_create_account(uuid,text,text,text,text,text,text), public.kvtt_consume_login_attempt(text,timestamptz) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.kvtt_create_account(uuid,text,text,text,text,text,text), public.kvtt_consume_login_attempt(text,timestamptz) TO service_role;

