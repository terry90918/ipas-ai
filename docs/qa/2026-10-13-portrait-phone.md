# JUR-665 直向手機驗證

基準：origin/main 2b11837。使用真實 Next.js、Practice、Radix 與題庫內容；127.0.0.1:3303 的隔離 API fixture 使用 domain parseAction/buildState，在記憶體保存作答。沒有正式使用者資料、Supabase 寫入或正式登入驗證。

## RED → GREEN

修改前 390×844：導覽位於上方，閱讀區554.8px、選項文字248px／15px、送出按鈕132px。答題隱藏導覽、閱讀高度、文字寬度／字級、滿寬按鈕五項斷言失敗。

修改後，以內建瀏覽器讀取 DOM 幾何驗證：

| 尺寸 | 閱讀區高度 | 選項文字寬 | 主按鈕寬 | 操作列底部 |
| --- | --- | --- | --- | --- |
| 360×800 | 677.8 | 258 | 307 | 792 |
| 390×844 | 721.8 | 288 | 337 | 836 |
| 430×932 | 809.8 | 328 | 377 | 924 |
| 360×640 | 517.8 | 258 | 307 | 632 |

斷言：手機側欄display=none；正常閱讀區高度至少 viewport−180；選項寬度至少 viewport−108；選項16px；主按鈕至少操作列寬−28；reading.bottom≤actions.top；actions.bottom≤viewport。上述四尺寸均PASS。失敗訊息會占用額外垂直空間；驗證底部操作與選項仍可達，不將一般高度下限套用到錯誤狀態。

總覽三尺寸開始按鈕底部594.5px，底部導覽頂部分別727／771／859px；入口可見，頁面無水平溢出。未完成回合接續按鈕底部364.2px。

## 操作證據

- 點選整張B選項，aria-checked=true；返回總覽及繼續仍保留B，未送出不顯示答案。
- 600ms保存期間按鈕、radio與返回控制禁用；隔離503失敗後B保留，顯示重新送出；恢復後重試只保存一次。
- 完整五題：第1／2／4／5題答錯、第3題答對，成果頁有五張回顧、1/5題答對；每題下一題維持相同底部位置。
- 360×640長題最後選項點選後位於reading底部內，reading與actions不重疊。
- 進入下一題，題幹取得焦點；題號狀態及答案揭露沿用伺服器回應。

## 驗證界線

瀏覽器為 Chromium 尺寸模擬；實體 iPhone Safari、瀏海／手勢區與動態瀏覽器工具列尚未直接驗證。只配置viewport-fit=cover及safe-area CSS，不宣稱完成實機驗收。正式部署與跨裝置同步不是本地fixture的證明。

## 回歸與審查

1180×820／1440×900：側欄可見、導覽static、reading.bottom分別700／780，actions.top720／800、bottom800／880；無水平溢出。

真實建置版原題 intermediate-114-2-2-q3：圖片預覽位於viewport內，圖片載入完成；關閉回到「查看參考圖」焦點；選B後開啟／關閉，B的aria-checked仍true。

一次獨立Codex審查發現P2：viewport-fit=cover後首頁／成果未保留頂部安全區。CDP模擬top47／bottom34，修改前brand.top12，RED；修正shell安全區後brand.top47、bottom padding34，GREEN。答題top padding47、bottom padding34，action.bottom810≤844−34、reading.bottom703.8≤action.top711.8。安全區模擬使用 [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/tot/Emulation/#method-setSafeAreaInsetsOverride)，不等於實體Safari驗證。

檢查：33/33 Node tests；全專案lint、TypeScript、Next正式建置均PASS。

畫面：[手機答題](../images/portrait-practice.png)、[手機總覽](../images/portrait-overview.png)。

PR自動Codex審查P2：圖片Dialog須避開安全區。390×400、top47/bottom34時dialog.top13／bottom387，RED；844×390、左右44/bottom21時bottom377>369，RED。延伸共用Dialog CSS定位與最大尺寸，保留reference dialog內部圖片捲動；不重新請求完整審查。

Dialog修正GREEN：390×400／top47/bottom34，稳定後top47、bottom366；844×390／左右44/bottom21，左右均在安全區，bottom368.7≤369。匯入Dialog top94.5/bottom290.5亦在安全區；只開啟／關閉，未匯入資料。修正後重新跑33 tests、lint、TypeScript、Next build，均PASS。

既有GitHub設定自動啟動新commit審查（未另外請求），指出橫向844px超過760px時頁面左右safe-area未套用。實測nav.left10、main.right833>844−44，RED。將左右安全區交由study-app共用shell處理，移除手機main／sidebar重複inset；fixed底部導覽及Dialog仍獨立保留safe-area。

橫向shell修正GREEN：844×390／left44 right44 bottom21，nav.left54、reading.right765、actions.right765≤800，無水平溢出。回到360／390／430px三組原斷言均PASS；33 tests、全專案lint、TypeScript及正式build重跑PASS。
