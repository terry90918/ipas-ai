# JUR-672 D1 遷移驗證

狀態：開發及本地驗證完成，正式遷移待執行。

50項Node測試包含真實Miniflare D1 schema／adapter／交易與搬移。獨立Codex審查3項問題已分別RED→GREEN：保留PostgreSQL微秒、維護操作互斥、D1新增資料後freeze/resume。隔離PostgreSQL17測試驗證source conflict不寫入、保存IDs與ordinal、sequence接續，以及匿名／authenticated不可執行restore。rollback測試經過production supabaseSnapshot，保留來源微秒。

全專案lint、TypeScript、700題／14卷／700詳解及OpenNext Worker建置通過。本地preview以真正bundled Worker＋D1執行API，固定synthetic owner，Node僅提供靜態資產與模擬proxy的origin映射；不代表正式登入驗證。內建瀏覽器本回合不可用，使用Chrome。

Chrome完成五題：2/5題答對、3題錯題；重新整理後成果持續存在，錯題複習回合含3題。沒有使用正式資料；[隔離回合畫面](../images/d1-local-round.png)。

Sites原生D1建立、schema部署、正式freeze／copy／verify／activate及資料頁面readback仍須完成。GitHub來源與Sites正式來源的相容修補已對齊；私人資料與憑證不在Git中。

PR自動Codex與CodeRabbit完成：部署dist也明確含D1 journal／SQL，缺journal禁止打包；日期型歷史紀錄以UTC午夜匯入；維護秘密使用SHA256 digest與timingSafeEqual。前兩項新增三個實際RED失敗測試；不重新要求完整審查。

補強來源DB fence：source guard在Supabase拒絕insert／update／delete；pause使用exclusive table lock等待前一筆寫入交易完成。真實PG回復測試在source paused下執行：一般作答被拒絕，核對後restore可保留所有微秒／ordinal，匿名依舊拒絕。Node suite目前53項。

過渡發布version17未成功，SQLITE incomplete input；正式站仍version16、Supabase source paused=false、6作答不變。新增真實D1.exec測試重現0011多行trigger第一行不完整；僅修復失敗／未套用的0011及0012，前面成功SQL與journal timestamp保持不變。

重新發布v18仍在複合trigger SQL解析失敗，正式站仍v16，沒有freeze或搬移。改為唯一限制／外鍵及原子answer batch；0011／0012這兩個未套用migration改為一般索引SQL，所有已套用前項與journal timestamps保持不變。Adapter執行membership／owner／official-key驗證；並行insert使用conditional INSERT ON CONFLICT，batch內完成session與讀回實際choice，維持重送／衝突語意。
