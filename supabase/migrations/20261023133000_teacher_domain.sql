-- Private teacher data. Service role only; HTTP service verifies live role/ownership.
do $$
declare t text;
begin
 foreach t in array array['teacher_lesson_plans','teacher_lesson_files','teacher_questions','teacher_student_profiles'] loop
  execute format('create table if not exists public.%I (id uuid primary key, owner_id uuid not null references public.kvtt_accounts(id) on delete restrict, version integer not null default 1 check(version>0), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz, data jsonb not null check(jsonb_typeof(data)=''object''), idempotency_key text not null, unique(owner_id,idempotency_key))',t);
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon, authenticated',t);
  execute format('grant all on public.%I to service_role',t);
  execute format('create index if not exists %I on public.%I(owner_id,updated_at,id)',t||'_owner_updated',t);
 end loop;
end $$;
create index if not exists teacher_questions_status_created on public.teacher_questions((data->>'status'),created_at,id);
create index if not exists teacher_files_plan on public.teacher_lesson_files((data->>'planId'));

create or replace function public.kvtt_teacher_create(p_kind text,p_record jsonb,p_key text) returns jsonb
language plpgsql security definer set search_path=public as $$
declare t text; existing jsonb; owner uuid:=(p_record->>'owner_id')::uuid; result jsonb; used bigint;
begin
 t:=case p_kind when 'lessons' then 'teacher_lesson_plans' when 'files' then 'teacher_lesson_files' when 'questions' then 'teacher_questions' when 'profiles' then 'teacher_student_profiles' else null end;
 if t is null then raise exception 'INVALID_TEACHER_KIND'; end if;
 perform pg_advisory_xact_lock(hashtextextended(owner::text||':'||p_kind,0));
 execute format('select to_jsonb(r) from public.%I r where owner_id=$1 and idempotency_key=$2',t) into existing using owner,p_key;
 if existing is not null then return existing; end if;
 if p_kind='files' then
  select coalesce(sum((data->>'byteSize')::bigint),0) into used from teacher_lesson_files where owner_id=owner and data->>'state' in ('pending','ready','deleting');
  if used+(p_record->'data'->>'byteSize')::bigint>104857600 then raise exception 'TEACHER_FILE_QUOTA'; end if;
 end if;
 if p_kind='questions' then
  select count(*) into used from teacher_questions where owner_id=owner and created_at>now()-interval '1 hour';
  if used>=5 then raise exception 'TEACHER_QUESTION_QUOTA'; end if;
 end if;
 execute format('insert into public.%I(id,owner_id,version,created_at,updated_at,deleted_at,data,idempotency_key) values($1,$2,1,$3,$4,null,$5,$6) returning to_jsonb(%I.*)',t,t) into result using (p_record->>'id')::uuid,owner,(p_record->>'created_at')::timestamptz,(p_record->>'updated_at')::timestamptz,p_record->'data',p_key;
 return result;
end $$;
create or replace function public.kvtt_teacher_update(p_kind text,p_id uuid,p_owner uuid,p_expected integer,p_data jsonb,p_deleted_at timestamptz,p_updated_at timestamptz) returns jsonb
language plpgsql security definer set search_path=public as $$
declare t text; result jsonb;
begin
 t:=case p_kind when 'lessons' then 'teacher_lesson_plans' when 'files' then 'teacher_lesson_files' when 'questions' then 'teacher_questions' when 'profiles' then 'teacher_student_profiles' else null end;
 if t is null then raise exception 'INVALID_TEACHER_KIND'; end if;
 execute format('update public.%I set version=version+1,data=$1,deleted_at=$2,updated_at=$3 where id=$4 and owner_id=$5 and version=$6 returning to_jsonb(%I.*)',t,t) into result using p_data,p_deleted_at,p_updated_at,p_id,p_owner,p_expected;
 return result;
end $$;
create or replace function public.kvtt_teacher_students(p_query text default '',p_activity text default 'all',p_cursor uuid default null,p_limit integer default 21) returns jsonb
language sql security definer set search_path=public stable as $$
 with learners as (
  select a.id,a.username,a.full_name,a.owner_id,exists(select 1 from kvtt_documents d where d.owner=a.owner_id and d.key in ('stars','game-stars','badges','learning-stats','english-progress','english-garden-progress','study-time','daily-activity') and d.value is not null and d.value<>'null'::jsonb) as active from kvtt_accounts a where a.role='learner'
 ), selected as (
  select id,username,full_name,owner_id from learners where (p_cursor is null or id>p_cursor) and (strpos(lower(username),lower(p_query))>0 or strpos(lower(full_name),lower(p_query))>0) and (p_activity='all' or p_activity='active' and active or p_activity='inactive' and not active) order by id limit least(greatest(p_limit,1),51)
 ) select jsonb_build_object('total',(select count(*) from learners),'activeCount',(select count(*) from learners where active),'items',coalesce((select jsonb_agg(to_jsonb(s) order by s.id) from selected s),'[]'::jsonb));
$$;
revoke all on function public.kvtt_teacher_create(text,jsonb,text) from public,anon,authenticated;
revoke all on function public.kvtt_teacher_update(text,uuid,uuid,integer,jsonb,timestamptz,timestamptz) from public,anon,authenticated;
revoke all on function public.kvtt_teacher_students(text,text,uuid,integer) from public,anon,authenticated;
grant execute on function public.kvtt_teacher_create(text,jsonb,text) to service_role;
grant execute on function public.kvtt_teacher_update(text,uuid,uuid,integer,jsonb,timestamptz,timestamptz) to service_role;
grant execute on function public.kvtt_teacher_students(text,text,uuid,integer) to service_role;
insert into storage.buckets(id,name,public,file_size_limit) values('kvtt-teacher-word','kvtt-teacher-word',false,10485760) on conflict(id) do update set public=false,file_size_limit=10485760;
-- No storage.objects browser policies: only service-role backend can read/write.
