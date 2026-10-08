# Mauro & Brenda Taxi Link 画面デザイン仕様書（UI/UX Design Specification）

本仕様書は、英語教室 送迎チケット管理Webアプリケーション「**Mauro & Brenda Taxi Link**」のUI/UXデザイン仕様および全画面のデスクトップ版（PC）・モバイル版（スマートフォン）の画面キャプチャーをまとめた包括的デザインドキュメントです。

---

## 1. デザインシステム & 基本設計原則

### ▍1.1 コア・デザインコンセプト
- **シンプル＆ストレスフリー (KISS & YAGNI)**: 先生の運転前後や保護者の移動中でも迷わず1タップで目的が達成できる直感的な操作性。
- **明確な2軸ペルソナ分離**: 「管理者用 (Mauro・Brenda)」と「送迎利用者用 (生徒・保護者)」をタブで即座に切り替え可能。
- **ヒアリング要件の完全反映**:
  - チケット消費ルール（「片道1回につき1枚消費」）の明記
  - 完全予約制（フレックス都度予約）に最適化した予約UI
  - 残数少（2回以下）時の**「Mauro・Brenda に連絡してね！」**アラートによるチケット切れ防止

### ▍1.2 カラーパレット

| 役割 | カラー名 | カラーコード | Tailwind クラス | 用途 |
| :--- | :--- | :--- | :--- | :--- |
| **Primary** | Emerald 600 | `#059669` | `bg-emerald-600` | 主要アクションボタン、チケットカード、ロゴ |
| **Primary Soft**| Emerald 50 | `#ecfdf5` | `bg-emerald-50` | アクティブタブ、サマリーアイコン背景 |
| **Dark Neutral**| Slate 900 | `#0f172a` | `bg-slate-900` | 予約申込ボタン、強調ボタン、重要見出し |
| **Base Surface**| Slate 50/100| `#f8fafc` | `bg-slate-100/70` | アプリ全体の背景 |
| **Card Surface**| White | `#ffffff` | `bg-white` | カード、モーダル、入力フォーム背景 |
| **Warning** | Amber 600 | `#d97706` | `text-amber-600` | チケット残少アラート（残り1〜2回） |
| **Danger** | Rose 600 | `#e11d48` | `text-rose-600` | チケット切れ（0回）、キャンセルボタン |

---

## 2. 全画面デザインカタログ（PC版 / スマホ版 比較）

### ▍画面 01: 管理者ダッシュボード（本日の送迎）
- **目的**: 先生（Mauro・Brenda）がその日の送迎予定（何時に誰をどこへ送迎するか）を一目で把握し、ワンタップで送迎完了（1回消費）を行うメイン画面。
- **特徴**: 当日の予定件数、チケット残少生徒数、生徒総数のサマリーカードを最上部に配置。地図アプリへの直リンクを完備。

| デスクトップ版 (1280×800) | モバイル版 (375×812) |
| :--- | :--- |
| ![デスクトップ - 本日の送迎](file:///C:/Users/kanta/.gemini/antigravity/brain/f13af8ae-0c47-431f-a942-5a5423722165/screenshots/desktop_01_teacher_today.png) | ![モバイル - 本日の送迎](file:///C:/Users/kanta/.gemini/antigravity/brain/f13af8ae-0c47-431f-a942-5a5423722165/screenshots/mobile_01_teacher_today.png) |

---

### ▍画面 02: 管理者ダッシュボード（送迎スケジュール一覧）
- **目的**: 過去・未来を含めたすべての送迎履歴を一覧表示し、ステータス（予約中・完了・キャンセル）で絞り込み検索。
- **特徴**: 片道1回消費、往復2回消費のステータスバッジを表示。キャンセル操作も一覧から直接実行可能。

| デスクトップ版 (1280×800) | モバイル版 (375×812) |
| :--- | :--- |
| ![デスクトップ - 送迎一覧](file:///C:/Users/kanta/.gemini/antigravity/brain/f13af8ae-0c47-431f-a942-5a5423722165/screenshots/desktop_02_teacher_all_rides.png) | ![モバイル - 送迎一覧](file:///C:/Users/kanta/.gemini/antigravity/brain/f13af8ae-0c47-431f-a942-5a5423722165/screenshots/mobile_02_teacher_all_rides.png) |

---

### ▍画面 03: 管理者ダッシュボード（生徒台帳 & チケット管理）
- **目的**: 登録生徒の連絡先・ご自宅住所・チケット残数状況をカード形式で把握。
- **特徴**: 残数に応じてバッジの色が自動変化（緑: 3回以上、黄: 1〜2回、赤: 0回）。カードから直接「チケット追加」「予約登録」が可能。

| デスクトップ版 (1280×800) | モバイル版 (375×812) |
| :--- | :--- |
| ![デスクトップ - 生徒管理](file:///C:/Users/kanta/.gemini/antigravity/brain/f13af8ae-0c47-431f-a942-5a5423722165/screenshots/desktop_03_teacher_students.png) | ![モバイル - 生徒管理](file:///C:/Users/kanta/.gemini/antigravity/brain/f13af8ae-0c47-431f-a942-5a5423722165/screenshots/mobile_03_teacher_students.png) |

---

### ▍画面 04: 新規生徒登録モーダル
- **目的**: 新しく入会した生徒・保護者の基本情報と初期購入チケット数を一括登録。
- **特徴**: モーダル背景はブラー効果（Backdrop blur）。緊急連絡先や送迎時の注意メモ欄を用意。

| デスクトップ版 (1280×800) | モバイル版 (375×812) |
| :--- | :--- |
| ![デスクトップ - 新規生徒登録](file:///C:/Users/kanta/.gemini/antigravity/brain/f13af8ae-0c47-431f-a942-5a5423722165/screenshots/desktop_04_modal_add_student.png) | ![モバイル - 新規生徒登録](file:///C:/Users/kanta/.gemini/antigravity/brain/f13af8ae-0c47-431f-a942-5a5423722165/screenshots/mobile_04_modal_add_student.png) |

---

### ▍画面 05: チケット購入・追加モーダル
- **目的**: 保護者からチケット購入依頼（現金手渡しや振込等）があった際に、残数をチャージ。
- **特徴**: 「5回券（¥5,000）」「10回券（¥10,000）」「1回分（¥1,000）」のクイック選択チップを搭載。現在残数から追加後の残数がプレビュー表示。

| デスクトップ版 (1280×800) | モバイル版 (375×812) |
| :--- | :--- |
| ![デスクトップ - チケット追加](file:///C:/Users/kanta/.gemini/antigravity/brain/f13af8ae-0c47-431f-a942-5a5423722165/screenshots/desktop_05_modal_add_ticket.png) | ![モバイル - チケット追加](file:///C:/Users/kanta/.gemini/antigravity/brain/f13af8ae-0c47-431f-a942-5a5423722165/screenshots/mobile_05_modal_add_ticket.png) |

---

### ▍画面 06: 送迎予定の登録モーダル（先生側）
- **目的**: 先生側から電話連絡や直接依頼による送迎予定を代理登録。
- **特徴**: 生徒を選択すると登録済み住所が自動補完。「行き（お迎え: 1枚）」「帰り（送り: 1枚）」「往復: 2枚」の消費枚数をチップで明示。

| デスクトップ版 (1280×800) | モバイル版 (375×812) |
| :--- | :--- |
| ![デスクトップ - 送迎登録(先生)](file:///C:/Users/kanta/.gemini/antigravity/brain/f13af8ae-0c47-431f-a942-5a5423722165/screenshots/desktop_06_modal_add_ride.png) | ![モバイル - 送迎登録(先生)](file:///C:/Users/kanta/.gemini/antigravity/brain/f13af8ae-0c47-431f-a942-5a5423722165/screenshots/mobile_06_modal_add_ride.png) |

---

### ▍画面 07: 送迎利用者ポータル（通常：チケット残数余裕時）
- **目的**: 生徒・保護者が現在のチケット残高を確認し、次回の送迎予約を申し込む。
- **特徴**: エメラルドグリーンのチケット風グラフィックで残回数を大きく表示。「片道1回につきチケット1枚消費です」と明記して安心感を提供。

| デスクトップ版 (1280×800) | モバイル版 (375×812) |
| :--- | :--- |
| ![デスクトップ - 保護者通常](file:///C:/Users/kanta/.gemini/antigravity/brain/f13af8ae-0c47-431f-a942-5a5423722165/screenshots/desktop_07_parent_normal.png) | ![モバイル - 保護者通常](file:///C:/Users/kanta/.gemini/antigravity/brain/f13af8ae-0c47-431f-a942-5a5423722165/screenshots/mobile_07_parent_normal.png) |

---

### ▍画面 08: 送迎利用者ポータル（チケット残少アラート表示時）
- **目的**: チケット残数が2回以下になった保護者に連絡を促す。
- **特徴**: カード内にアンバー色のアラート枠が出現し、**「⚠️ チケットが無くなりそうです（残り○回） Mauro・Brenda に連絡してね！ 次回のチケットをご用意します。」** を最前面に表示。

| デスクトップ版 (1280×800) | モバイル版 (375×812) |
| :--- | :--- |
| ![デスクトップ - 保護者アラート](file:///C:/Users/kanta/.gemini/antigravity/brain/f13af8ae-0c47-431f-a942-5a5423722165/screenshots/desktop_08_parent_alert.png) | ![モバイル - 保護者アラート](file:///C:/Users/kanta/.gemini/antigravity/brain/f13af8ae-0c47-431f-a942-5a5423722165/screenshots/mobile_08_parent_alert.png) |

---

### ▍画面 09: 送迎予約申込モーダル（保護者側）
- **目的**: 保護者が前日・当日に急なレッスンやフレックス送迎を申し込む。
- **特徴**: 残チケット数が少なくなっている場合はモーダル内にも注意文が表示され、無理な重複予約を防止。

| デスクトップ版 (1280×800) | モバイル版 (375×812) |
| :--- | :--- |
| ![デスクトップ - 送迎予約(保護者)](file:///C:/Users/kanta/.gemini/antigravity/brain/f13af8ae-0c47-431f-a942-5a5423722165/screenshots/desktop_09_parent_modal_ride.png) | ![モバイル - 送迎予約(保護者)](file:///C:/Users/kanta/.gemini/antigravity/brain/f13af8ae-0c47-431f-a942-5a5423722165/screenshots/mobile_09_parent_modal_ride.png) |

---

### ▍画面 10: Google連携設定画面
- **目的**: Googleスプレッドシート（生徒台帳・履歴）とGoogleカレンダーの自動同期を設定。
- **特徴**: ワンクリックでコピー可能なApps Scriptソースコード表示エリアと、導入の4ステップ手順ガイドを提供。

| デスクトップ版 (1280×800) | モバイル版 (375×812) |
| :--- | :--- |
| ![デスクトップ - Google連携](file:///C:/Users/kanta/.gemini/antigravity/brain/f13af8ae-0c47-431f-a942-5a5423722165/screenshots/desktop_10_settings_google.png) | ![モバイル - Google連携](file:///C:/Users/kanta/.gemini/antigravity/brain/f13af8ae-0c47-431f-a942-5a5423722165/screenshots/mobile_10_settings_google.png) |

---

## 3. レスポンシブ & 操作性（UX）検証結果

| 検証項目 | デスクトップ（PC）の挙動 | モバイル（スマートフォン）の挙動 | 判定 |
| :--- | :--- | :--- | :---: |
| **ヘッダー & ナビゲーション** | ブランド名とタブが横並びで配置され、クリック操作が快適 | 上部にロゴが配置され、下部に3つのタブが均等配置（親指で届くエリア） | **適合** |
| **サマリーカード** | 横3カラム（`grid-cols-3`）で情報を一望 | 縦1カラムでスクロールしながら大きな数字を確認可能 | **適合** |
| **ボタン・タップ領域** | 余白十分、ホバー時の背景色変化が明確 | 最小タップ領域（44px以上）をクリアし、誤タップを防止 | **適合** |
| **モーダル表示** | 画面中央に配置され、背景クリックでクローズ可能 | 画面幅いっぱいに収まり、キーボードが出てもスクロール可能 | **適合** |
| **横スクロールの有無** | 発生なし（1280px） | 発生なし（375px）：要素が適切に折り返されている | **適合** |

---

## 4. 今後の拡張・改善ポイント（デザイン観点）

1. **先生向け英語UI切り替え（多言語対応）**:
   - Mauro先生・Brenda先生が英語ネイティブである場合を考慮し、右上に「JP / EN」切り替えボタンを設置可能な設計にしておく。
2. **完了時・チャージ時のマイクロインタラクション**:
   - チケット消化時にチケット枚数がカウントダウンする軽快なアニメーションの追加。
3. **PWA（ホーム画面追加）対応**:
   - スマートフォンのホーム画面にアプリアイコンを設置し、ワンタップでフルスクリーン起動できる仕様の準備。
