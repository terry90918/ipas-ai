# iPAS Sites D1 Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task in this session. Use one independent whole-change review after implementation.

**Goal:** 保留正式資料、登入與產品行為，將持久化切換至 Sites D1，完成資料庫頁面與正式站讀回。

**Architecture:** 既有 API 仍呼叫相同四種儲存操作。D1 adapter 使用參數化 SQL、約束與原子 batch；控制表決定 authoritative backend 與寫入暫停。限定 owner 的維護通道分頁複製 Supabase、核對快照／domain state及執行切換與回復。

**Tech Stack:** Next.js16.4、OpenNext1.20.9、Sites Worker／D1、TypeScript、Miniflare真實本地D1。

**Spec:** docs/superpowers/specs/2026-10-13-ipas-sites-d1-migration-design.md

## Global Constraints

- 目前隔離分支 codex/ipas-sites-d1-migration；不修改root repo。
- 保留Sites project_id、私人audience與正式owner身份兼容；程式碼不加入註解。
- 不刪除Supabase、不自動fallback、不雙寫、不提交私人歷史或憑證。
- schema-only migrations；題庫與歷史由維護流程搬移。
- 來源切換前重新讀取五表並核對；D1新增紀錄後須同步回Supabase才可回復。

## Review Focus

- 兩個並行請求：唯一未完成回合、重送只記錄一次、衝突409。
- 交易中途錯誤：回合／作答／匯入不得部分成功。
- 偽造owner及其他使用者回合：不能讀寫或執行維護。
- 複製時來源改變、核對不符：維持Supabase與暫停，不能啟用D1。
- 回復有新D1資料：保留IDs／timestamps／ordinal，逐表核對後才恢復。

### Task 1: Schema 與 D1 adapter

**Files:** website/drizzle/*、website/lib/d1.ts、website/tests/d1.test.ts。
**Interfaces:** D1 adapter提供call(name,args)，回傳既有DatabaseState／void／session ID。

- [ ] 先寫真實Miniflare D1測試：state／start／answer／import、owner隔離、並行與失敗原子性；確認RED。
- [ ] 建立五張產品表與控制表；每個migration檔一個SQL statement，Drizzle journal供Sites部署；不用SQL說明註解。
- [ ] 實作呼叫、約束與交易；以既有domain state格式還原JSON、布林、ID與時間。
- [ ] 測試GREEN及現有suite；提交schema與adapter。

### Task 2: 遷移與回復

**Files:** website/lib/migration.ts、website/tests/migration.test.ts、website/lib/database.ts。
**Interfaces:** Supabase分頁讀取固定五表；D1複製／正規化hash／核對／回復；控制表保存phase。

- [ ] 先寫fixture的搬移、來源變動、重試與D1新增資料後回復測試；確認RED。
- [ ] 所有網路複製限於既有SupabaseURL，資料參數化；輸出只含數量與hash。
- [ ] 頁面寫入使用控制紀錄；暫停前請求以DB lease追蹤，切換須等所有lease完成或失效。
- [ ] 初始化、freeze、copy／verify、activate、abort／rollback動作限制明確；重複執行安全，核對失敗不開放寫入。
- [ ] GREEN及suite；提交。

### Task 3: API、身份、建置

**Files:** website/app/api/migration/route.ts、website/app/api/practice/route.ts、website/lib/site-identity.ts、website/app/chatgpt-auth.ts、website/scripts/patch-opennext.mjs、website/wrangler.json、website/.openai/hosting.json、website/README.md。
**Interfaces:** 維護route只接受固定action，驗證Site owner與維護秘密；既有practice API與UI契約不變。

- [ ] 拒絕匿名、非owner、無秘密、跨來源與任意SQL；服務token只准授權維護操作，不作一般使用者身份。
- [ ] 保留正式站已存在的身份／manifest相容修補；DB透過getCloudflareContext存取，主runtime保持Worker。
- [ ] 原生Sites DB binding與打包的Drizzle migrations／Worker實際可部署。
- [ ] 產品suite、lint、TypeScript、700題與OpenNext build；一次完整審查、修正具體問題、PR與合併。

### Task 4: 正式切換與驗收

**Files:** docs/implementation-progress.md（僅非私人摘要）；Sites發布來源及runtime設定。

- [ ] 取得新的同Site來源憑證、讀取最新已部署版本，保留所有相容設定；先發過渡版本。
- [ ] DB binding與schema讀回；舊backend產品讀回；維護通道驗證。
- [ ] freeze／等待leases／最終copy與verify；不一致就abort，不切換。
- [ ] activate後維持暫停讀回一致，再解除暫停與停用維護模式。
- [ ] Sites DB表及正式瀏覽器讀回；原有回合可接續，沒有人為新增答案；記錄版本／commit／核對摘要與Supabase備份。

## 執行決定

使用者已確認書面規格並要求「可以開始執行」。本回合以inline執行規劃、開發及已核准的遷移流程，不再增加中間確認。原生D1配置或安全核對不可完成時，保留原正式來源及資料，回報具體限制。
