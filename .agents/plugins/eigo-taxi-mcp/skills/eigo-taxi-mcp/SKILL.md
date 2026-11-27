---
name: eigo-taxi-mcp
description: >-
  Eigo Taxi Link (英語教室 送迎チケット管理システム) を Antigravity から直接操作する
  MCP サーバー（eigo-taxi / 名前空間 eigo-taxi-mcp_eigo-taxi）および MCP App ダッシュボード (open_dashboard) の利用ガイド。
  生徒台帳の確認・登録、送迎予約の作成・キャンセル、送迎完了（片道1枚/往復2枚消費）、
  チケット追加を行う際に使用します。
---

# Eigo Taxi Link MCP 利用手順

## 1. 安全境界・動作モード
- **既定モード (`demo`)**: `${PLUGIN_DATA}/demo-state.json` に永続化されるローカルモック台帳を操作します。GAS / スプレッドシート / Google Calendar へは送信しません。
- **実連携モード (`live-gas`)**: `EIGO_TAXI_MCP_MODE=live-gas` と有効な Firebase Google ID トークン (`EIGO_TAXI_GAS_ID_TOKEN`) を明示指定したオプトイン環境でのみ動作します。読み取り専用にする場合は `EIGO_TAXI_MCP_READONLY=true` を設定します。
- **顧客受入・本番方針**: 本システムは `release: "HOLD"`、`CUST-01..06 = NOT_RUN`（`thirdPartyPassed: 0`）を維持します。MCP 操作結果を顧客受入合格とみなさないでください。

## 2. 主要ツールと使い分け
- **状況サマリーと UI 起動**: `open_dashboard`（引数 `{}` 可）を呼び出すと、Antigravity 上にインタラクティブ UI (`ui://eigo-taxi/dashboard.html`) と本日のサマリーを表示できます。
- **状態・GAS疎通確認**: `get_service_status`（`checkGasHealth: true` で非破壊 `GET` 確認可）。
- **生徒参照・登録**: `list_students`, `get_student`, `create_student`（管理者権限）。
- **送迎予約・完了・取消**: `list_rides`, `create_reservation`（予約時は残数未消費）, `complete_ride`（完了時に片道1枚・往復2枚を消費）, `cancel_reservation`（予定中のみ取消可）。
- **チケット追加・招待URL**: `add_tickets`（1〜100枚）, `list_portal_invitations`。
- **デモ補助**: `switch_demo_role` (`admin` / `parent`), `reset_demo_data` (`confirm: true`)。

## 3. 業務ルール（`gas/Code.gs`・`src/services/api.ts` 準拠）
- 送迎完了時の消費枚数は `pickup` / `dropoff` が 1 枚、`roundtrip` が 2 枚で固定です。残チケット不足時は完了を拒否します。
- `parent` ロールは担当生徒（デモ時は `STU-001`）の参照・予約・キャンセルのみ許可され、完了処理・チケット追加・生徒新規登録は拒否されます。
