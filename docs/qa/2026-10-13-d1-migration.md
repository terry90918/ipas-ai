# JUR-672 D1 遷移驗證

狀態：開發及本地驗證完成，正式遷移待執行。

50項Node測試包含真實Miniflare D1 schema／adapter／交易與搬移。獨立Codex審查3項問題已分別RED→GREEN：保留PostgreSQL微秒、維護操作互斥、D1新增資料後freeze/resume。隔離PostgreSQL17測試驗證source conflict不寫入、保存IDs與ordinal、sequence接續，以及匿名／authenticated不可執行restore。rollback測試經過production supabaseSnapshot，保留來源微秒。

全專案lint、TypeScript、700題／14卷／700詳解及OpenNext Worker建置通過。本地preview以真正bundled Worker＋D1執行API，固定synthetic owner，Node僅提供靜態資產與模擬proxy的origin映射；不代表正式登入驗證。內建瀏覽器本回合不可用，使用Chrome。

Chrome完成五題：2/5題答對、3題錯題；重新整理後成果持續存在，錯題複習回合含3題。沒有使用正式資料；[隔離回合畫面](../images/d1-local-round.png)。

Sites原生D1建立、schema部署、正式freeze／copy／verify／activate及資料頁面readback仍須完成。GitHub來源與Sites正式來源的相容修補已對齊；私人資料與憑證不在Git中。
