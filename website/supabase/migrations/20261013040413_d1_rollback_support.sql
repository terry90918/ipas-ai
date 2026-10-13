create function public.ipas_export_snapshot() returns jsonb language sql stable security invoker set search_path='' as $$
select jsonb_build_object(
 'ipas_exams',(select coalesce(jsonb_agg(to_jsonb(t) order by id),'[]'::jsonb) from public.ipas_exams t),
 'ipas_questions',(select coalesce(jsonb_agg(to_jsonb(t) order by id),'[]'::jsonb) from public.ipas_questions t),
 'ipas_sessions',(select coalesce(jsonb_agg(to_jsonb(t) order by id),'[]'::jsonb) from public.ipas_sessions t),
 'ipas_attempts',(select coalesce(jsonb_agg(to_jsonb(t) order by ordinal),'[]'::jsonb) from public.ipas_attempts t),
 'ipas_imports',(select coalesce(jsonb_agg(to_jsonb(t) order by owner_id),'[]'::jsonb) from public.ipas_imports t)
);
$$;
create function public.ipas_restore_snapshot(p_snapshot jsonb,p_before jsonb) returns void language plpgsql security invoker set search_path='' as $$
declare name text;
begin
 lock table public.ipas_exams,public.ipas_questions,public.ipas_sessions,public.ipas_attempts,public.ipas_imports in exclusive mode;
 if public.ipas_export_snapshot() is distinct from p_before then raise exception 'SOURCE_CHANGED'; end if;
 if jsonb_typeof(p_snapshot)<>'object' then raise exception 'INVALID_SNAPSHOT'; end if;
 foreach name in array array['ipas_exams','ipas_questions','ipas_sessions','ipas_attempts','ipas_imports'] loop
  if jsonb_typeof(p_snapshot->name) is distinct from 'array' then raise exception 'INVALID_SNAPSHOT'; end if;
 end loop;
 insert into public.ipas_exams select * from jsonb_populate_recordset(null::public.ipas_exams,p_snapshot->'ipas_exams') on conflict(id) do update set body=excluded.body;
 insert into public.ipas_questions select * from jsonb_populate_recordset(null::public.ipas_questions,p_snapshot->'ipas_questions') on conflict(id) do update set exam_id=excluded.exam_id,number=excluded.number,body=excluded.body;
 insert into public.ipas_sessions select * from jsonb_populate_recordset(null::public.ipas_sessions,p_snapshot->'ipas_sessions') order by completed desc on conflict(id) do update set owner_id=excluded.owner_id,mode=excluded.mode,question_ids=excluded.question_ids,completed=excluded.completed,source_key=excluded.source_key,created_at=excluded.created_at;
 if exists(select 1 from public.ipas_attempts a join jsonb_populate_recordset(null::public.ipas_attempts,p_snapshot->'ipas_attempts') b using(session_id,question_id) where a is distinct from b) then raise exception 'SNAPSHOT_MISMATCH'; end if;
 insert into public.ipas_attempts overriding system value select * from jsonb_populate_recordset(null::public.ipas_attempts,p_snapshot->'ipas_attempts') on conflict(session_id,question_id) do nothing;
 insert into public.ipas_imports select * from jsonb_populate_recordset(null::public.ipas_imports,p_snapshot->'ipas_imports') on conflict(owner_id) do update set imported_at=excluded.imported_at;
 perform setval('public.ipas_attempts_ordinal_seq',coalesce((select max(ordinal) from public.ipas_attempts),1),exists(select 1 from public.ipas_attempts));
end;
$$;
revoke all on function public.ipas_export_snapshot(),public.ipas_restore_snapshot(jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.ipas_export_snapshot(),public.ipas_restore_snapshot(jsonb,jsonb) to service_role;
grant update on sequence public.ipas_attempts_ordinal_seq to service_role;
