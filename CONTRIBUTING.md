# 貢獻指南

歡迎提交題庫勘誤、介面問題與功能改善。先閱讀 [README](README.md) 與 [開發文件](website/README.md)，確認修改範圍。

## 回報問題

- 題庫問題附上完整題目 ID、原試卷、頁碼與你的判斷依據。計分保留公告答案；疑義與補充資料放在解析。
- 介面問題附上重現步驟、預期與實際結果、瀏覽器、裝置與畫面尺寸。
- 輸出、圖片與練習紀錄先移除個人資料、secret key 與 token。
- 安全問題使用 [私人安全回報](.github/SECURITY.md)，不要公開可利用的細節。

## 提交修改

1. Fork repository，從最新 `main` 建立分支；一個 PR 處理一個明確問題。
2. 沿用現有元件與資料流程，避免額外依賴與無關重構。程式碼保持無註解。
3. 題庫修改維持題目 ID 與來源對應；涉及 PDF 擷取、公式、程式碼或共用圖表時，核對原始頁面。
4. 在 `website/` 執行下列檢查；非程式修改依影響驗證連結、命令與文件內容。
5. PR 說明修改原因、結果、驗證與已知限制；介面修改附上使用隔離測試資料的畫面。

```sh
npm test
npm run lint
npx tsc --noEmit
python3 -m unittest discover -s tests -p 'test_*.py' -v
npm run validate:content
npm run build
```

涉及 schema、RPC 或個人紀錄的修改，另外執行 [資料庫驗證](website/README.md#本地資料庫驗證)。使用獨立測試資料庫，不要拿正式紀錄做測試。

## 審查與驗收

新 PR 由 CodeRabbit 自動審查一次；後續 commit 不自動增量審查。修正建議前先核對問題是否成立，修正後執行相關檢查。測試、審查、合併、部署與實際操作驗收各自記錄。

不要提交 `.env.local`、資料庫金鑰、個人練習紀錄或新的未授權素材。程式碼、歷屆試題與第三方素材的授權範圍見 [README](README.md#授權與來源)。
