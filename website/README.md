# iPAS 自習室

Next.js App Router + shadcn/ui。私人 Sites 網站，ChatGPT 登入，Supabase 保存練習紀錄。

產品介紹、題庫範圍與快速開始見 [根目錄 README](../README.md)。此頁補充開發、資料庫與發布方式；貢獻與安全回報分別見 [CONTRIBUTING](../CONTRIBUTING.md) 與 [SECURITY](../.github/SECURITY.md)。

## 功能

- 14 份試卷、700 題，完整原題圖與逐題解析。
- 每回合五題，未練過優先，再依練習次數排序。
- 錯題複習、跨裝置接續、重複提交不重複計分。
- 匯入既有練習紀錄；歷史個人資料只放私人 runtime 設定。

## 開發與檢查

```sh
npm ci
npm test
npm run lint
npx tsc --noEmit
python3 -m unittest discover -s tests -p 'test_*.py' -v
npm run validate:content
npm run build:sites
```

題庫原始來源位於上一層初級／中級資料夾。重建題庫需要 Python 的 pdfplumber、Pillow 與 Poppler；使用 `scripts/extract_questions.py --help` 查看參數。`content/extraction-audit.json` 記錄來源 SHA256、共用情境與圖表轉錄。

`content/explanations/` 每卷一份詳細解析，題目 ID 對應原始試卷和題號。解析含推理、各選項分析、概念、常見誤區與來源。公告答案有歧義時保留原答案，另外顯示 caveat。

`validate:content` 完整核對 700 題及全部解析後才輸出彙整檔；`build:sites` 強制執行此檢查，避免發布部分題庫。

## Supabase

使用獨立專案。部署 `supabase/migrations/` 的 schema，再執行 `node scripts/seed-catalog.mjs` 產生完整種子 SQL。種子資料與 schema migration 分開。所有表啟用 RLS，匿名與 Supabase authenticated 角色沒有存取權。只有 Sites 伺服器使用 secret key 呼叫 RPC；每個請求依平台提供的使用者 ID 授權。

私人 Sites runtime 設定：

- `SUPABASE_URL`：專案 API URL。
- `SUPABASE_SECRET_KEY`：僅供伺服器使用的 Supabase secret key。
- `LEGACY_PRACTICE_JSON`：選填，舊練習紀錄原始 JSON。禁止提交到公開 Git。

登入由 Sites 處理，勿另設 Supabase Auth 或 OAuth 路由。

## 本地資料庫驗證

`tests/database.sql` 在交易內驗證作答、錯題、匯入與隔離，結束時 rollback。`tests/concurrency.py` 僅對名為 `ipas-practice-test` 的獨立 Docker PostgreSQL 測試容器執行，建立與清除自身的測試紀錄，不能指向正式資料庫。

### 完整本地預覽

需要已啟動的 Docker，以及 Node.js。以下命令在 `website/` 執行，建立獨立的 PostgreSQL 17 與 PostgREST 13.0.7 測試環境。容器名稱與網路名稱必須尚未被使用；已有相同名稱時，先確認該環境的用途，不要覆蓋既有資料。

第一個終端機先建立資料庫與角色：

```sh
docker network create ipas-practice-qa
docker run -d --name ipas-practice-test --network ipas-practice-qa \
  -e POSTGRES_PASSWORD=ipas-local-qa postgres:17
until docker exec ipas-practice-test pg_isready -U postgres; do sleep 1; done
docker exec -i ipas-practice-test psql -U postgres -v ON_ERROR_STOP=1 <<'SQL'
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create role authenticator login noinherit password 'ipas-local-qa';
grant anon, service_role to authenticator;
grant usage on schema public to anon, authenticated, service_role;
SQL
docker exec -i ipas-practice-test psql -U postgres -v ON_ERROR_STOP=1 \
  < supabase/migrations/20261011165044_ipas_practice.sql
node scripts/seed-catalog.mjs | \
  docker exec -i ipas-practice-test psql -U postgres -v ON_ERROR_STOP=1
```

在同一個終端機產生僅供本次測試使用、24 小時後到期的 JWT，並啟動 REST 與 Next.js。這些環境變數會覆寫本地 `.env.local`，不使用正式 Supabase 專案：

```sh
export IPAS_QA_JWT_SECRET="$(node -e 'process.stdout.write(require("node:crypto").randomBytes(32).toString("hex"))')"
export SUPABASE_SECRET_KEY="$(node <<'NODE'
const { createHmac } = require('node:crypto');
const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
const body = [encode({ alg: 'HS256', typ: 'JWT' }), encode({ role: 'service_role', exp: Math.floor(Date.now() / 1000) + 86400 })].join('.');
process.stdout.write(`${body}.${createHmac('sha256', process.env.IPAS_QA_JWT_SECRET).update(body).digest('base64url')}`);
NODE
)"
export SUPABASE_URL=http://127.0.0.1:3303
export LEGACY_PRACTICE_JSON=
docker run -d --name ipas-practice-rest --network ipas-practice-qa \
  -p 127.0.0.1:55474:3000 \
  -e PGRST_DB_URI=postgres://authenticator:ipas-local-qa@ipas-practice-test:5432/postgres \
  -e PGRST_DB_SCHEMAS=public -e PGRST_DB_ANON_ROLE=anon \
  -e PGRST_JWT_SECRET="$IPAS_QA_JWT_SECRET" postgrest/postgrest:v13.0.7
npm run build
npm run start -- --port 3302
```

第二個終端機也切換到 `website/`，啟動登入代理：

```sh
node scripts/local-preview.mjs
```

開啟 `http://127.0.0.1:3303`，即可用固定的 `local-qa` 測試身分開始五題練習、提交作答及重新載入進度。3302 是 Next.js，55474 是本地 REST，3303 同時代理網站與 `/rest/v1/`，三者的埠號需與現有代理一致。這個代理只綁定 `127.0.0.1`，不代表真正的 ChatGPT 登入驗證，亦不參與正式部署。

JWT 到期或關閉第一個終端機後，需要重新產生測試設定；重新產生 secret 時也要重建本地 REST 容器。測試金鑰與上述本地資料庫密碼不可用於正式環境。

### 執行資料庫檢查與清理

`tests/database.sql` 使用自己的題庫 fixture，因此在同一個測試容器另建空白的 `ipas_checks` 資料庫執行，避免與已匯入的 700 題混用。在另一個終端機的 `website/` 執行：

```sh
docker exec ipas-practice-test createdb -U postgres ipas_checks
docker exec -i ipas-practice-test psql -U postgres -d ipas_checks -v ON_ERROR_STOP=1 \
  < supabase/migrations/20261011165044_ipas_practice.sql
docker exec -i ipas-practice-test psql -U postgres -d ipas_checks -v ON_ERROR_STOP=1 < tests/database.sql
docker exec ipas-practice-test dropdb -U postgres ipas_checks
python3 tests/concurrency.py
```

預覽完成後，先以 Ctrl+C 停止兩個終端機的 Node 程序。以下命令只清除本節新建的測試容器與網路，會移除其中的測試作答紀錄：

```sh
docker rm -f ipas-practice-rest ipas-practice-test
docker network rm ipas-practice-qa
```

## Sites 發布

`build:sites` 透過 OpenNext 將真正的 Next.js 建置為 Worker，輸出 `dist/server/index.js` 與 `dist/client/`。Sites 身分保存在 `.openai/hosting.json`。沿用同一 Site ID，透過 Sites source helper 推送、封裝及私人發布。部署成功與實際登入／跨裝置同步驗證分別記錄。

## Sites D1 遷移

Sites manifest 的 `d1: "DB"` 由平台建立原生資料庫；`drizzle/meta/_journal.json` 與單一陳述式SQL檔由發布套件帶入。維持Next.js／OpenNext，不使用額外ORM。正式Site的身份相容與OpenNext preview-props修補也納入GitHub來源。

控制表 `ipas_storage_control` 決定目前讀寫來源，`ipas_write_leases` 追蹤在途寫入。預設仍使用Supabase；D1錯誤不會自動fallback。讀取持續可用，暫停寫入回傳503並保留答案草稿。

維護API `/api/migration` 必須先設定秘密 `IPAS_MIGRATION_KEY`、`IPAS_MIGRATION_ENABLED=true` 與既有 `PRIVATE_OWNER_ID`。私人Site服務存取和這個維護秘密是兩道獨立界線。簽入者只能是配置的owner；服務存取可使用維護秘密，但不能作為一般practice身份。只接受固定action，無任意SQL或任意來源URL。

操作順序：status → freeze → 等待inFlight=0 → copy → verify → activate → 正式讀回 → resume。activate另要求暫停至少30秒；每次verify重新讀取來源，核對五表hash與每位owner的domain state。公開題庫必須與已版本控制catalog一致。freeze之後若需要取消：abort → resume。D1啟用之後需要回復：freeze → rollback → resume；rollback保留D1新增資料的ID／時間／ordinal並先同步回Supabase，再核對狀態。完成後關閉維護模式。

Supabase rollback support migration只新增service-role可執行的匯出／還原RPC及sequence修復權限；匿名與authenticated均不可執行。Supabase資料不刪除，私人歷史不加入Git。只有有限count／hash摘要可以進交付記錄。

本地D1測試使用已固定版本的Miniflare，包含真實SQLite交易、重送、帳號隔離、搬移與freeze。`python3 tests/rollback.py` 僅使用名為 `ipas-d1-rollback-test` 的隔離PostgreSQL容器，不指向正式資料庫。

時間戳以六位小數的UTC文字保留PostgreSQL微秒精度；所有mutating maintenance action以資料庫mutex互斥。正常失敗會釋放mutex；若Worker被終止而留下mutex，保持fail-closed，需先確認該操作已停止再由operator恢復，不能直接開放重疊搬移。正式回復測試也會經過同一時間戳正規化流程。
