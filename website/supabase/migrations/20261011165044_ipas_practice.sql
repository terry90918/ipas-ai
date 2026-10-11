create table public.ipas_exams (id text primary key, body jsonb not null);
create table public.ipas_questions (id text primary key, exam_id text not null references public.ipas_exams(id), number integer not null check(number>0), body jsonb not null check(body->>'answer' in ('A','B','C','D')), unique(exam_id,number));
create index ipas_questions_exam on public.ipas_questions(exam_id);
create table public.ipas_sessions (id uuid primary key default gen_random_uuid(), owner_id text not null check(length(owner_id)>0), mode text not null check(mode in ('practice','wrong','import')), question_ids text[] not null check(cardinality(question_ids) between 1 and 50), completed boolean not null default false, source_key text, created_at timestamptz not null default now(), unique(owner_id,source_key));
create unique index ipas_one_active on public.ipas_sessions(owner_id) where not completed;
create index ipas_sessions_owner_created on public.ipas_sessions(owner_id,created_at desc);
create table public.ipas_attempts (ordinal bigint generated always as identity unique, session_id uuid not null references public.ipas_sessions(id), question_id text not null references public.ipas_questions(id), owner_id text not null, choice text not null check(choice in ('A','B','C','D')), correct boolean not null, created_at timestamptz not null default now(), primary key(session_id,question_id));
create index ipas_attempts_owner_question on public.ipas_attempts(owner_id,question_id,created_at desc,ordinal desc);
create table public.ipas_imports (owner_id text primary key, imported_at timestamptz not null default now());
alter table public.ipas_exams enable row level security;
alter table public.ipas_questions enable row level security;
alter table public.ipas_sessions enable row level security;
alter table public.ipas_attempts enable row level security;
alter table public.ipas_imports enable row level security;
revoke all on public.ipas_exams,public.ipas_questions,public.ipas_sessions,public.ipas_attempts,public.ipas_imports from public,anon,authenticated;
grant select,insert,update on public.ipas_exams,public.ipas_questions,public.ipas_sessions,public.ipas_attempts,public.ipas_imports to service_role;
grant usage,select on sequence public.ipas_attempts_ordinal_seq to service_role;
create function public.ipas_state(p_owner text) returns jsonb language sql stable security invoker set search_path='' as $$
with latest as (
 select distinct on (a.question_id) a.question_id,a.correct from public.ipas_attempts a where a.owner_id=p_owner order by a.question_id,a.created_at desc,a.ordinal desc
), current_session as (
 select s.* from public.ipas_sessions s where s.owner_id=p_owner and s.mode<>'import' order by s.created_at desc,s.id desc limit 1
)
select jsonb_build_object(
 'stats', jsonb_build_object('attempts',(select count(*) from public.ipas_attempts where owner_id=p_owner),'correct',(select count(*) from public.ipas_attempts where owner_id=p_owner and correct),'practiced',(select count(*) from latest),'wrong',(select count(*) from latest where not correct)),
 'legacyImported',exists(select 1 from public.ipas_imports where owner_id=p_owner),
 'active',coalesce((select jsonb_build_object('id',s.id,'mode',s.mode,'completed',s.completed,'question_ids',s.question_ids,'answers',coalesce((select jsonb_agg(jsonb_build_object('question_id',a.question_id,'choice',a.choice,'correct',a.correct)) from public.ipas_attempts a where a.session_id=s.id and a.owner_id=p_owner),'[]'::jsonb)) from current_session s),'null'::jsonb)
);
$$;
create function public.ipas_start(p_owner text,p_mode text,p_filters jsonb) returns uuid language plpgsql security invoker set search_path='' as $$
declare existing uuid; selected text[]; created uuid;
begin
 if p_owner is null or length(p_owner)=0 or p_mode not in ('practice','wrong') then raise exception 'INVALID_CHOICE'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_owner,0));
 select id into existing from public.ipas_sessions where owner_id=p_owner and not completed;
 if existing is not null then return existing; end if;
 with history as (
  select a.question_id,count(*) as practiced from public.ipas_attempts a where a.owner_id=p_owner group by a.question_id
 ), latest as (
  select distinct on (a.question_id) a.question_id,a.correct from public.ipas_attempts a where a.owner_id=p_owner order by a.question_id,a.created_at desc,a.ordinal desc
 ), candidates as (
  select q.id,coalesce(h.practiced,0) as practiced,random() as tie from public.ipas_questions q join public.ipas_exams e on e.id=q.exam_id left join history h on h.question_id=q.id left join latest l on l.question_id=q.id
  where (p_filters->>'level' is null or e.body->>'level'=p_filters->>'level') and (p_filters->>'subject' is null or e.body->>'subject'=p_filters->>'subject') and (p_filters->>'year' is null or e.body->>'year'=p_filters->>'year') and (p_filters->>'session' is null or e.body->>'session'=p_filters->>'session') and (p_mode='practice' or l.correct=false)
  order by practiced,tie limit 5
 ) select array_agg(id order by practiced,tie) into selected from candidates;
 if selected is null then raise exception 'NO_QUESTIONS'; end if;
 insert into public.ipas_sessions(owner_id,mode,question_ids) values(p_owner,p_mode,selected) returning id into created;
 return created;
end;
$$;
create function public.ipas_answer(p_owner text,p_session uuid,p_question text,p_choice text) returns void language plpgsql security invoker set search_path='' as $$
declare s public.ipas_sessions; saved text; official text;
begin
 if p_choice is null or p_choice not in ('A','B','C','D') then raise exception 'INVALID_CHOICE'; end if;
 select * into s from public.ipas_sessions where id=p_session and owner_id=p_owner for update;
 if s.id is null then raise exception 'SESSION_NOT_FOUND'; end if;
 if not p_question=any(s.question_ids) then raise exception 'QUESTION_NOT_IN_SESSION'; end if;
 select choice into saved from public.ipas_attempts where session_id=p_session and question_id=p_question and owner_id=p_owner;
 if saved is not null then
  if saved<>p_choice then raise exception 'ANSWER_CONFLICT'; end if;
  return;
 end if;
 if s.completed then raise exception 'SESSION_COMPLETED'; end if;
 select body->>'answer' into official from public.ipas_questions where id=p_question;
 if official is null then raise exception 'CATALOG_NOT_READY'; end if;
 insert into public.ipas_attempts(session_id,question_id,owner_id,choice,correct) values(p_session,p_question,p_owner,p_choice,p_choice=official);
 if (select count(*) from public.ipas_attempts where session_id=p_session)=cardinality(s.question_ids) then update public.ipas_sessions set completed=true where id=p_session; end if;
end;
$$;
create function public.ipas_import(p_owner text,p_records jsonb) returns void language plpgsql security invoker set search_path='' as $$
declare entry jsonb; item jsonb; sid uuid; ids text[]; official text;
begin
 if p_owner is null or length(p_owner)=0 or jsonb_typeof(p_records)<>'array' or jsonb_array_length(p_records)>100 then raise exception 'INVALID_CHOICE'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_owner,0));
 if exists(select 1 from public.ipas_imports where owner_id=p_owner) then return; end if;
 for entry in select value from jsonb_array_elements(p_records) loop
  select array_agg(value->>'id') into ids from jsonb_array_elements(entry->'questions');
  if ids is null or cardinality(ids)<> (select count(distinct x) from unnest(ids) x) then raise exception 'INVALID_CHOICE'; end if;
  insert into public.ipas_sessions(owner_id,mode,question_ids,completed,source_key,created_at) values(p_owner,'import',ids,true,entry->>'sourceKey',(entry->>'date')::timestamptz) returning id into sid;
  for item in select value from jsonb_array_elements(entry->'questions') loop
   select body->>'answer' into official from public.ipas_questions where id=item->>'id';
   if official is null then raise exception 'CATALOG_NOT_READY'; end if;
   insert into public.ipas_attempts(session_id,question_id,owner_id,choice,correct,created_at) values(sid,item->>'id',p_owner,item->>'choice',item->>'choice'=official,(entry->>'date')::timestamptz);
  end loop;
 end loop;
 insert into public.ipas_imports(owner_id) values(p_owner);
end;
$$;
revoke all on function public.ipas_state(text),public.ipas_start(text,text,jsonb),public.ipas_answer(text,uuid,text,text),public.ipas_import(text,jsonb) from public,anon,authenticated;
grant execute on function public.ipas_state(text),public.ipas_start(text,text,jsonb),public.ipas_answer(text,uuid,text,text),public.ipas_import(text,jsonb) to service_role;
