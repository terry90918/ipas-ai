begin;
insert into public.ipas_exams(id,body) values ('fixture','{"level":"初級","subject":"測試","year":115,"session":3}');
insert into public.ipas_questions(id,exam_id,number,body) select 'fixture-q'||n,'fixture',n,'{"answer":"A"}'::jsonb from generate_series(1,7) n;
set local role service_role;
select public.ipas_start('owner','practice','{}');
do $$
declare s uuid; question text; second uuid; st jsonb;
begin
 select id into s from public.ipas_sessions where owner_id='owner' and not completed;
 select public.ipas_start('owner','practice','{}') into second;
 if s<>second then raise exception 'start must resume the active session'; end if;
 select question_ids[1] into question from public.ipas_sessions where id=s;
 perform public.ipas_answer('owner',s,question,'B');
 perform public.ipas_answer('owner',s,question,'B');
 if (select count(*) from public.ipas_attempts where owner_id='owner')<>1 then raise exception 'duplicate submission counted twice'; end if;
 begin perform public.ipas_answer('owner',s,question,'A'); raise exception 'conflicting answer should fail'; exception when raise_exception then if sqlerrm<>'ANSWER_CONFLICT' then raise; end if; end;
 begin perform public.ipas_answer('other',s,question,'A'); raise exception 'owner isolation failed'; exception when raise_exception then if sqlerrm<>'SESSION_NOT_FOUND' then raise; end if; end;
 begin perform public.ipas_answer('owner',s,'fixture-q999','A'); raise exception 'foreign question allowed'; exception when raise_exception then if sqlerrm<>'QUESTION_NOT_IN_SESSION' then raise; end if; end;
 st:=public.ipas_state('owner');
 if (st#>>'{stats,attempts}')::int<>1 or (st#>>'{stats,wrong}')::int<>1 then raise exception 'wrong stats'; end if;
 if (select count(distinct q) from public.ipas_sessions a,unnest(a.question_ids) q where a.id=s)<>5 then raise exception 'round duplicates or size'; end if;
 if (public.ipas_state('other')->'active')<>'null'::jsonb then raise exception 'state leaks owner'; end if;
end $$;
select public.ipas_import('legacy','[{"sourceKey":"old","date":"2026-10-08","questions":[{"id":"fixture-q1","choice":"B"},{"id":"fixture-q2","choice":"A"}]}]');
select public.ipas_import('legacy','[{"sourceKey":"old","date":"2026-10-08","questions":[{"id":"fixture-q1","choice":"B"},{"id":"fixture-q2","choice":"A"}]}]');
do $$
declare s uuid; ids text[];
begin
 if (select count(*) from public.ipas_attempts where owner_id='legacy')<>2 then raise exception 'import duplicate'; end if;
 if exists(select 1 from public.ipas_sessions where owner_id='legacy' and not completed) then raise exception 'import became unfinished'; end if;
 s:=public.ipas_start('legacy','wrong','{}');
 if (select question_ids from public.ipas_sessions where id=s)<>array['fixture-q1'] then raise exception 'wrong selection'; end if;
 perform public.ipas_answer('legacy',s,'fixture-q1','A');
 if (public.ipas_state('legacy')#>>'{stats,wrong}')::int<>0 then raise exception 'resolved wrong remains'; end if;
 begin perform public.ipas_start('legacy','wrong','{}'); raise exception 'empty wrong round allowed'; exception when raise_exception then if sqlerrm<>'NO_QUESTIONS' then raise; end if; end;
 s:=public.ipas_start('legacy','practice','{}');
 select question_ids into ids from public.ipas_sessions where id=s;
 if 'fixture-q1'=any(ids) or 'fixture-q2'=any(ids) then raise exception 'unseen not prioritized'; end if;
end $$;
rollback;
