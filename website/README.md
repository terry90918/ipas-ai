# iPAS 自習室

Next.js App Router + shadcn/ui。私人 Sites 網站，ChatGPT 登入，Supabase 保存練習紀錄。

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

本地 UI QA 可使用獨立 PostgreSQL/PostgREST 配置，再以 Next.js 正式建置啟動於 127.0.0.1:3302，執行 `node scripts/local-preview.mjs`。3303 代理只使用固定本地測試身分，不代表真正的 ChatGPT 登入驗證，亦不參與正式部署。

## Sites 發布

`build:sites` 透過 OpenNext 將真正的 Next.js 建置為 Worker，輸出 `dist/server/index.js` 與 `dist/client/`。Sites 身分保存在 `.openai/hosting.json`。沿用同一 Site ID，透過 Sites source helper 推送、封裝及私人發布。部署成功與實際登入／跨裝置同步驗證分別記錄。
