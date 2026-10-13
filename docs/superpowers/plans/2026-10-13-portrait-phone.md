# 直向手機操作 Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan in this session. Steps use checkbox syntax for tracking.

**Goal:** 直向手機能用拇指開始、選答、送出與接續五題，閱讀區不被導覽或操作列遮擋。

**Architecture:** 延伸既有 Practice 和 CSS 響應式規則。沿用現有 reading scroller、practice-actions、Radix radio/dialog 與 server-confirmed 保存，不新增依賴。手機導覽只在總覽與成果頁顯示於底部，答題頁保留返回總覽。

**Tech Stack:** Next.js 16、React 19、Tailwind 4、shadcn/Radix、Lucide。

**Spec:** 使用者於對話核准的四項設計；持續契約見 website/DESIGN.md、website/UX-CONTRACT.md。

## Global Constraints

- 只修改目前隔離 worktree；從 origin/main 2b11837 開始。
- 程式碼無註解；保留深綠、繁體中文、五題流程、草稿隔離與伺服器確認計分。
- 手機寬度 360、390、430px；觸控目標至少 48px；導覽文字至少 12px。
- 底部導覽與 practice-actions 各自保留 safe-area 空間，不覆蓋內容。
- 首頁與成果使用 document scroll；答題沿用一個獨立 reading scroller。

## Review Focus

- 360px 長科目與導覽不產生水平溢出。
- 手機動態高度縮短時，底部按鈕與最後選項保持可達。
- 選答後返回總覽及圖片預覽保留草稿，未送出不得揭露答案。
- 保存中／失敗重試保持按鈕尺寸和選擇，避免重複提交。
- 1180×820 平板与 1440×900 桌面沿用側欄及單一閱讀捲動。

### Task 1: 直向手機導覽、閱讀與操作

**Files:** website/components/practice.tsx、website/app/globals.css、website/app/layout.tsx、website/DESIGN.md、website/UX-CONTRACT.md、docs/qa/2026-10-13-portrait-phone.md。

**Interfaces:** 既有 Practice screen/home/practice/summary 與 practice-actions；API 與 domain 不變。

- [x] 在隔離 API fixture 的真實 Next.js 頁面，用內建瀏覽器先驗證 RED：總覽導覽靠底、答題隱藏導覽、文字寬度及底部按鈕可達。
- [x] 將既有三個導覽按鈕包進同一 nav；手機移至底部，縮短手機標籤並保留完整無障礙名稱；答題隱藏側欄。
- [x] 調整手機 100dvh grid、safe-area、題卡留白與 16px 選項／解析；底部操作改單一滿寬按鈕與一行状态提示。
- [x] 重跑相同幾何斷言 GREEN，完成五題、返回接續、長題、圖預覽、失敗重試、短高度及桌面／平板回歸。
- [x] 執行 npm test、npm run lint、npx tsc --noEmit、npm run build；記錄結果與 API fixture 的驗證界線。
- [x] 更新設計契約與 QA 證據；一次 fresh-context Codex review，修正具體問題；提交並建立 PR（交付狀態見 QA 紀錄）。

## 執行決定

使用者已明確核准設計並要求規劃與開發；本回合以 inline 執行，不再增加設計確認。UI 先跑真實瀏覽器幾何斷言 RED/GREEN；不新增只比對 CSS 原始文字的測試。
