import json
import subprocess
from datetime import datetime
from pathlib import Path

container = 'ipas-d1-rollback-test'

def sql(query, success=True):
    result = subprocess.run(['docker', 'exec', '-i', container, 'psql', '-U', 'postgres', '-d', 'ipas_d1_rollback_fixture', '-tA', '-v', 'ON_ERROR_STOP=1'], input=query, text=True, capture_output=True)
    if success and result.returncode:
        raise AssertionError(result.stderr)
    return result

def literal(value):
    return "'" + json.dumps(value, ensure_ascii=False).replace("'", "''") + "'::jsonb"

bootstrap = subprocess.run(['docker', 'exec', '-i', container, 'psql', '-U', 'postgres', '-v', 'ON_ERROR_STOP=1'], input='drop database if exists ipas_d1_rollback_fixture; create database ipas_d1_rollback_fixture;', text=True, capture_output=True)
assert bootstrap.returncode == 0, bootstrap.stderr
schema = Path(__file__).resolve().parents[1] / 'supabase/migrations'
sql("do $$ begin create role anon; exception when duplicate_object then null; end $$; do $$ begin create role authenticated; exception when duplicate_object then null; end $$; do $$ begin create role service_role; exception when duplicate_object then null; end $$; alter role service_role bypassrls;")
sql((schema / '20261011165044_ipas_practice.sql').read_text())
for migration in sorted(schema.glob('*_d1_rollback_support.sql')):
    sql(migration.read_text())
sql("insert into ipas_exams values('exam','{}'); insert into ipas_questions values('q1','exam',1,'{\"answer\":\"A\"}'),('q2','exam',2,'{\"answer\":\"A\"}'); insert into ipas_sessions(id,owner_id,mode,question_ids) values('00000000-0000-0000-0000-000000000001','alice','practice',array['q1','q2']); select ipas_answer('alice','00000000-0000-0000-0000-000000000001','q1','B');")
before = json.loads(sql('select ipas_export_snapshot();').stdout)
after = json.loads(json.dumps(before))
after['ipas_sessions'][0]['completed'] = True
after['ipas_attempts'].append({'ordinal': 2, 'session_id': '00000000-0000-0000-0000-000000000001', 'question_id': 'q2', 'owner_id': 'alice', 'choice': 'A', 'correct': True, 'created_at': '2026-10-13T00:00:00+00:00'})
normalizer = subprocess.run(['node', '--experimental-strip-types', '--input-type=module', '-e', "import {supabaseSnapshot} from './website/lib/migration.ts';let s='';for await(const c of process.stdin)s+=c;process.stdout.write(JSON.stringify(supabaseSnapshot(JSON.parse(s))));"], input=json.dumps(after), text=True, capture_output=True, cwd=Path(__file__).resolve().parents[2])
assert normalizer.returncode == 0, normalizer.stderr
after = json.loads(normalizer.stdout)
conflict = sql(f'select ipas_restore_snapshot({literal(after)}, {literal({})});', False)
assert conflict.returncode != 0
assert json.loads(sql('select ipas_export_snapshot();').stdout) == before
sql(f'set role service_role; select ipas_restore_snapshot({literal(after)}, {literal(before)});')
restored = json.loads(sql('select ipas_export_snapshot();').stdout)
assert restored['ipas_attempts'][0]['created_at'] == before['ipas_attempts'][0]['created_at']
def canonical(snapshot):
    result = json.loads(json.dumps(snapshot))
    for rows in result.values():
        for row in rows:
            for key in ['created_at', 'imported_at']:
                if key in row:
                    row[key] = datetime.fromisoformat(row[key].replace('Z', '+00:00'))
    return result
assert canonical(restored) == canonical(after), (restored, after)
assert sql("select nextval('ipas_attempts_ordinal_seq');").stdout.strip() == '3'
assert sql("select has_function_privilege('anon','ipas_restore_snapshot(jsonb,jsonb)','execute');").stdout.strip() == 'f'
assert sql("select has_function_privilege('authenticated','ipas_export_snapshot()','execute');").stdout.strip() == 'f'
print('PASS: snapshot conflict rollback, identity-preserving restore, ordinal sequence and anonymous denial')
