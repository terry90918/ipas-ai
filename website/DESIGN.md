---
version: alpha
name: "iPAS 自習室"
description: "以五題回合為中心的繁體中文自習工具"
colors:
  primary: "#155e4b"
  background: "#f4f8f7"
  surface: "#ffffff"
  foreground: "#193b33"
  muted: "#536b63"
  border: "#dce7e2"
  danger: "#a74436"
typography:
  sans:
    fontFamily: '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif'
  mono:
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
rounded:
  DEFAULT: "0.75rem"
  control: "0.5rem"
spacing:
  reading-width: "940px"
  page-max: "1200px"
components:
  primary-action:
    height: "48px"
  question-step:
    height: "56px"
---

# iPAS 自習室

## Overview

服務準備 iPAS AI 應用規劃師的繁體中文讀者。首頁的工作是開始或接續練習；答題頁的工作是讀題、選答、保存及學習解析。手機短時間練習和桌面長題閱讀使用同一套操作。

保留原有深綠識別，使用白色題頁與冷薄荷灰背景。特色是依真實回合題數呈現的五格題號列：未答、答對、答錯；不以色彩單獨表示狀態。不使用行銷大數字、裝飾性步驟編號或背景動畫。

Runtime CSS remains canonical: `app/globals.css` owns values; `@theme inline` maps them to Tailwind and shared primitives. This file mirrors accepted values, not a second generator.

## Colors

主操作、目前題號和連結使用 primary。內容放在 surface，foreground 用於題文。muted 用於次要說明；錯誤仍沿用 danger。對錯保留文字和圖示。Focus uses the existing `--ring: #4f8c78`.

## Typography

Sans for Traditional Chinese headings, questions and controls. Headings use size and weight for hierarchy; question text is 21px desktop / 18px narrow, option and explanation text 16px desktop / 15px narrow. Mono is limited to scores and numbered question steps. Join PDF soft wraps in prose while preserving blank paragraphs, structured lists, code, tables and standalone equations. Preserve mixed-script content.

## Layout

Main content max width 1200px; practice and summary 940px. Home places filters and primary practice action before compact statistics. No top header. Desktop sidebar begins with plain text “iPAS 自習室” and “AI 應用規劃師”, without a logo, personal-space badge or logout action. At 761–1280px the sidebar is 164px wide, navigation remains labeled, and practice hides the repeated five-question note. At 760px the same sidebar places its text identity above a horizontal navigation row. At 390px the primary practice action must appear in the initial 844px viewport. Native select options may use the browser popup. Home and summary use document scrolling. Practice uses a viewport-bounded main panel: the question and explanation region owns scrolling, with a separate bottom action row. No global body scroll lock. Original exam page images are omitted from the question card. Questions that depend on a chart or shared context provide compact buttons that open answer-free question crops in a Radix image-preview dialog; supplementary explanation diagrams remain inline, and the full PDF link stays in the answer references.

## Elevation & Depth

Flat cards use borders. Only the persistent practice action surface receives a subtle shadow to separate them from scrolling text. Error feedback remains inline, not transient.

## Shapes

Existing 12px containers and 8px controls remain the baseline. Question navigation is rectangular and contains both number and state.

## Components

| Role | Runtime owner | Consumers |
| --- | --- | --- |
| Primary | `--primary` → `--color-primary` | Button, active navigation, progress |
| Background / surface | `--background`, `--card` | page, cards, action bars |
| Text | `--foreground`, `--muted-foreground` | title, question, supporting copy |
| Border / focus | `--border`, `--ring` | cards, select, options, keyboard focus |
| Typography | `--font-sans`, `--font-mono` | prose and data |
| Scrollbar | `--scrollbar-*` global baseline | all owned scroll regions |

Reuse shared Button, NativeSelect, RadioGroup, Progress and Dialog. The browser owns select popups; Radix owns radio keyboard semantics and modal focus. Selected answers retain distinct outlines. Busy and saved controls cannot activate; labels and icons expose state. Primary answer buttons reserve at least 148px × 48px while saving. Submit and next-question actions share one separate bottom surface outside the scrollable reading region, with the same button position and at least 148px × 48px on tablets. It occupies its own layout row and cannot overlap reading content. Scroll padding and margins reserve 100px around focus targets. Common actions and native select triggers are at least 48px tall; secondary text is at least 12px. Portrait and landscape practice layouts preserve the same single reading scroller; overview and summary restore document scrolling.

Lucide line icons accompany text. Motion is limited to short state transitions; reduced-motion disables smooth motion. Global visible scrollbars include standard and WebKit styling and forced-colors fallback.

## Do's and Don'ts

- Start with the user's next practice action.
- Preserve source diagrams, answer confidentiality and server-confirmed saving.
- Keep action labels consistent across home, practice, summary and review.
- Do not replace native/Radix behavior with screen-local widgets.
- Do not change selection, grading, owner isolation or retry semantics for visual effect.

Image previews preserve the current answer draft, contain image scrolling within the viewport, return focus to the trigger on close, and provide loading and retry states. Preview and close controls are at least 48px. Supplementary diagrams use the same preview; external sources and PDFs remain links.
