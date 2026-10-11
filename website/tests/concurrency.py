import concurrent.futures
import json
import subprocess

def sql(query):
    result = subprocess.run(['docker', 'exec', '-i', 'ipas-practice-test', 'psql', '-U', 'postgres', '-tA', '-v', 'ON_ERROR_STOP=1'], input=query, text=True, capture_output=True)
    if result.returncode:
        raise RuntimeError(result.stderr)
    return result.stdout.strip()

sql("insert into ipas_exams(id,body) values('concurrency','{\"level\":\"初級\"}') on conflict do nothing; insert into ipas_questions(id,exam_id,number,body) select 'concurrency-q'||n,'concurrency',n,'{\"answer\":\"A\"}'::jsonb from generate_series(1,5)n on conflict do nothing;")
owner = 'concurrency-test'
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    rounds = list(pool.map(lambda _: sql(f"set role service_role; select ipas_start('{owner}','practice','{{}}');"), range(2)))
assert rounds[0] == rounds[1], rounds
session = rounds[0].splitlines()[-1]
question = sql(f"select question_ids[1] from ipas_sessions where id='{session}';")
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    list(pool.map(lambda _: sql(f"set role service_role; select ipas_answer('{owner}','{session}','{question}','A');"), range(2)))
assert sql(f"select count(*) from ipas_attempts where owner_id='{owner}';") == '1'
privileges = sql("select jsonb_build_object('anonymous_rpc',has_function_privilege('anon','ipas_state(text)','execute'),'anonymous_table',has_table_privilege('anon','ipas_attempts','select'),'authenticated_rpc',has_function_privilege('authenticated','ipas_answer(text,uuid,text,text)','execute'),'rls_tables',(select count(*) from pg_class where relname like 'ipas_%' and relkind='r' and relrowsecurity));")
privileges = json.loads(privileges)
assert privileges == {'anonymous_rpc': False, 'anonymous_table': False, 'authenticated_rpc': False, 'rls_tables': 5}, privileges
sql(f"delete from ipas_attempts where owner_id='{owner}'; delete from ipas_sessions where owner_id='{owner}'; delete from ipas_questions where exam_id='concurrency'; delete from ipas_exams where id='concurrency';")
print('PASS: concurrent start/save, anonymous denial, 5 RLS tables')
