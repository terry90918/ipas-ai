# iPAS 自習室：Supabase → Sites D1 遷移規格

狀態：待使用者審閱；方向已核准，尚未核准實作計畫或切換正式資料。
Issue：JUR-672。

## 目的與決定

將 iPAS 的正式持久化儲存改為 Sites 管理的 Cloudflare D1。遷移所有題庫、作答、練習回合與匯入標記，讓 Sites 的資料庫頁面能查看資料表。保留目前 Site、私人存取、登入識別、五題流程、公告答案與介面。

使用者已接受切換時短暫停用作答。採一次切換；Supabase 與 D1 不雙寫。Supabase 原資料保留，切換後新增的 D1 紀錄須納入回復程序。

## 現況與證據

- GitHub main：cd2e9a98f98cf5402600a7ddb3fdd633fb0e3bc0。
- 正式 Site：appgprj_6acbbd493ac88191940864e7b695ac62，已發布版本16。
- 已發布來源：ee3ca0a522823047d33462731a24e4e1d3b0f250；正式登入相容處理與 OpenNext preview-props 修補必須保留。
- Sites D1 overview 回傳 bindings=[]；目前沒有 D1 資料庫。
- 2026-10-13 本次盤點：Supabase 有14份試卷、700題、6筆作答、2個回合、0筆匯入標記。這是盤點快照，正式切換必須重新盤點。
- `website/app/api/practice/route.ts` 呼叫四個 RPC；`website/supabase/migrations/20261011165044_ipas_practice.sql` 定義資料表、計分、並行及權限規則。
- 題目詳解與圖片資料仍由受版本控制的 catalog 提供；遷移不改題目或公告答案。

## 架構與範圍

維持 Next.js／OpenNext 與現有 API 路徑。建立共同儲存介面，包含取得狀態、開始回合、送出答案、匯入既有紀錄；Supabase 與 D1 adapter 接受相同參數並回傳相同 domain state。D1 透過伺服器 Worker binding `DB` 存取。

沿用 `.openai/hosting.json` 的 project_id，將 d1 binding 宣告為 `DB`，由 Sites 配置資料庫。R2 維持現況。D1 schema migrations 只包含表、索引、限制與必要 trigger；題庫種子及私人歷史複製是獨立維護工作。

GitHub 程式來源與 Sites 發布來源都須更新；保留正式站已驗證的登入與建置相容修補，不直接用較少設定的 GitHub 來源覆蓋正式站。

不新增 Supabase Auth、Cloudflare 帳號登入或瀏覽器資料庫。正式切換完成前保留 Supabase adapter 與既有伺服器憑證，以供明確回復操作；D1 故障不得自動切回 Supabase 或偷偷改成雙寫。

## 資料映射

| 表 | D1 保留內容與限制 |
| --- | --- |
| ipas_exams | 相同 id、完整 JSON body |
| ipas_questions | 相同 id、exam_id、number、完整 JSON body；保留外鍵與卷內題號唯一性 |
| ipas_sessions | 相同 id、owner_id、mode、question_ids、completed、source_key、created_at；每位使用者最多一個未完成回合 |
| ipas_attempts | 相同 ordinal、session_id、question_id、owner_id、choice、correct、created_at；同回合同題唯一 |
| ipas_imports | 相同 owner_id、imported_at；每個帳號只匯入一次 |

SQLite 使用 JSON 字串保存 JSON／題號陣列，整數保存布林值，文字保存原 UUID 與時間戳。遷移工具須轉型並還原為原 domain 型別。不得重新產生 owner_id、回合ID、時間戳或 ordinal；新作答排序序號必須大於所有既有 ordinal。來源 body 中的額外欄位也須保留。

若 Supabase 題庫與版本控制 catalog 不同，先輸出具體差異並停止切換；不得默默以任一方覆蓋。私人資料不寫入公開 Git、題庫種子、發布截圖或工具日誌。

## 行為與授權契約

- 登入身份取自 Sites 伺服器身份與正式站既有 owner 相容設定；請求不得自訂 owner_id。
- D1 沒有本專案原有的 Postgres RLS 層。每個使用者資料查詢及異動都必須以伺服器驗證的 owner_id 限定範圍，並驗證回合所有權。
- 題目在送出前仍不揭露公告答案或詳解。僅伺服器確認儲存成功後回傳評分。
- 同時開始兩次只能得到同一個未完成回合。
- 同回合同題同選項重送成功但只記錄一次；不同選項重送回傳409及最新狀態。
- 作答插入與回合完成標記必須是同一原子交易；匯入亦不得留下半套紀錄。
- 未練過優先、依練習次數排序、隨機同順位、每輪最多五題、依篩選範圍複習錯題維持現況。
- 最新錯題以作答 created_at 與 ordinal 決定；保留同時刻作答的穩定排序。
- 使用參數化 SQL、唯一限制與 D1 batch 交易；不在應用程式中模擬 Postgres FOR UPDATE 或 advisory lock。

## 遷移控制與維護通道

D1 另設單筆遷移控制紀錄，記錄目前 authoritative backend、寫入是否暫停、來源／目標核對結果及遷移識別。切換不能只依賴可能尚未同步到所有 Worker 的本地旗標。

先發布能讀取這份控制紀錄、仍使用 Supabase 的過渡版本。所有 start／answer／import 都檢查寫入暫停狀態；暫停時回傳503與「資料搬移中，請稍後重試」，草稿保留，GET 仍可讀取。

維護通道只提供限定的題庫準備、歷史複製、核對、切換及回復動作。它不接受任意 SQL、資料表名稱或任意 backend URL。限制為正式站已配置的 owner 與明確啟用的維護模式；關閉維護模式後不得異動資料。狀態回應只包含數量、雜湊及階段，不回傳私人紀錄。

伺服器使用既有 Supabase 憑證，分頁讀取來源五張表至結束，並以固定欄位／轉型規則寫入 D1；不將憑證或私人資料內嵌到發布來源。每段複製使用有限 batch，失敗可依主鍵及快照識別安全重試。核對成功前，D1 的資料不得成為正式讀寫來源。

## 正式切換程序

1. 先在隔離本地 D1 驗證 schema、adapter、遷移、並行與回復；再完成審查與合併。
2. 驗證 Sites 能建立 `DB`、套用本專案 schema migrations、從 Next API 存取，以及在資料庫頁面讀回五張表。任一項無法驗證，就保留 Supabase 正式運作，記錄具體阻礙。
3. 發布過渡版本；確認正式 GET／POST 仍經 Supabase，登入與現有進度一致。
4. 啟用寫入暫停；確認正式 POST 不會成功。等待暫停前的請求完成，以連續兩次一致的來源快照雜湊驗證沒有尾端異動；來源仍變動就停止切換。
5. 重新複製最終快照至 D1；核對五表數量、主鍵集合及正規化全列雜湊。JSON 欄位先解析後按鍵排序；時間戳轉成同一UTC表示；陣列順序、ID與ordinal必須完全保留。
6. 比對每位owner的domain state：總作答、答對、已練習、錯題、匯入狀態、目前回合與已作答選擇必須相同。
7. 在仍暫停寫入的狀態，將 authoritative backend 明確改為 D1；讀回正式站及 Sites 資料庫頁面。
8. 所有核對通過才解除寫入暫停。驗證原有回合接續及跨裝置讀回；新增作答測試使用可清楚辨識的隔離驗證資料，不能替使用者提交任意答案。
9. 關閉維護通道，記錄版本、來源commit、binding、資料核對摘要與runtime結果；Supabase保留。

不承諾固定停機秒數；暫停持續至核對成功或完成回復。未達成驗收不得宣稱遷移完成。

## 回復程序

D1 尚未開放寫入時：維持暫停，切回 Supabase，核對原domain state，再解除暫停。

D1 已產生新紀錄時：先暫停全部應用寫入，保留D1快照；將D1新增回合、作答與匯入標記依相同ID／owner／時間／ordinal同步回Supabase，再更新既有回合completed狀態。檢查來源相同主鍵不同內容的衝突；有衝突不得覆蓋或恢復寫入。完成逐表與逐owner狀態一致核對後，才切回Supabase並解除暫停。

不能只部署舊版本就宣稱回復完成。Supabase在D1運作期間不接受背景雙寫或手動新增產品紀錄。

## 驗收

- Sites資料庫overview回傳DB與五張產品表；資料庫頁面能讀到表與資料。
- 14份／700題題庫與切換時全部私人歷史逐筆一致；後續統計與錯題行為一致。
- 兩個owner互不可讀寫；匿名、偽造owner、其他owner回合及未授權維護請求均拒絕。
- 同時開始、同選項重送、不同選項重送、最後一題完成與匯入重試均通過真實D1測試。
- 交易途中失敗無部分紀錄；作答失敗保留草稿並可重試。
- 遷移重試、來源在複製中改變、核對不符、切換前回復與D1新增資料後回復都有可重跑的測試。
- 全專案lint、TypeScript、產品測試、700題驗證與實際OpenNext／Sites Worker打包通過。
- 正式站登入、進度接續、手機與桌面讀回通過；現有私人audience保持不變。

## 來源

- 現行資料庫定義：`website/supabase/migrations/20261011165044_ipas_practice.sql`。
- 現行API與domain：`website/app/api/practice/route.ts`、`website/lib/domain.ts`、`website/lib/types.ts`。
- 已發布相容修補：正式Sites來源 ee3ca0a522823047d33462731a24e4e1d3b0f250。
- Sites storage契約：原生binding宣告、schema-only migrations、種子與搬移分離。
- [Cloudflare D1 prepared statements與batch交易](https://developers.cloudflare.com/d1/worker-api/d1-database/)。
- [OpenNext Cloudflare bindings](https://opennext.js.org/cloudflare/bindings)。
