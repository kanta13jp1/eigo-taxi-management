# Antigravity 向け MCP / MCP Apps / W3C WebMCP 統合ガイド

本ドキュメントは、`eigo-taxi-management`（Eigo Taxi Link）を Google Antigravity（App / CLI / IDE）および対応ブラウザエージェントから直接参照・操作するための 3 層 MCP 統合仕様をまとめます。

> **受入・本番凍結境界**: 顧客確認 `CUST-01`〜`CUST-06` は `NOT_RUN`（0/6）、`thirdPartyPassed: 0`、`release: "HOLD"` を維持します。MCP 経由の操作やデモ実行を顧客受入合格・本番運用開始とみなしてはなりません。関連手順は [README](../README.md) と [開発担当者による初期認証設定](DEVELOPER_SETUP_AUTH.md) を参照してください。

## 1. 全体構成（3 層統合）

| 層 | 実装先 | 方式 | 用途 |
| --- | --- | --- | --- |
| **MCP サーバー** | `mcp/` (`server.mjs`) | Stdio / Streamable HTTP (`/mcp`, `/health`) | Antigravity App / CLI / IDE からの直接操作（`demo` 既定 / `live-gas` オプトイン） |
| **MCP App UI** | `mcp/app/` (`dashboard.html`) | `ui://eigo-taxi/dashboard.html` (`text/html;profile=mcp-app`) | チャット内インライン、サイドペイン (`aux_pane`)、左サイドバー (`global`) からの対話操作 |
| **Antigravity プラグイン** | `.agents/plugins/eigo-taxi-mcp/` | `plugin.json` + `mcp_config.json` + `SKILL.md` | Antigravity への単一パッケージ配布・ツール/スキル自動認識 |
| **Web サイト WebMCP** | `src/components/WebMcpBridge.tsx` | `document.modelContext ?? navigator.modelContext` | 公開サイト開覧中の現在ログインセッション権限に同期したブラウザ内操作 |

## 2. MCP サーバー機能一覧（`mcp/src/server.ts`）

### 2.1 ツール（14 種）

| ツール名 | 権限 / モード | 主な役割 |
| --- | --- | --- |
| `get_service_status` | 共通（読取専用） | 動作モード、現在ロール、`readonly` 設定、`HOLD` 方針、任意で GAS `GET` ヘルスチェック |
| `open_dashboard` | 共通（読取専用・UI付） | 引数 `{}` でも起動可。`ui://eigo-taxi/dashboard.html` と最新スナップショット返却 |
| `list_students` | ログイン権限内（読取専用） | 生徒一覧取得（部分一致 `query` / 残少 `lowTicketOnly` 絞り込み） |
| `get_student` | 担当生徒範囲内（読取専用） | 指定生徒の詳細情報と関連予約一覧 |
| `create_student` | 管理者（`readonly` 時拒否） | 新規生徒登録（冪等 ID 対応） |
| `list_rides` | ログイン権限内（読取専用） | 送迎予約一覧（`date`, `todayOnly`, `studentId`, `status` 絞り込み） |
| `create_reservation` | 担当生徒範囲内（`readonly` 時拒否） | 送迎予約登録（予約時は残高消費なし、冪等 ID 対応） |
| `cancel_reservation` | 担当生徒範囲内（`readonly` 時拒否） | 予約中 (`scheduled`) のキャンセル（完了済みは拒否） |
| `complete_ride` | 管理者（`readonly` 時拒否） | 送迎完了＆チケット消費（片道 1 枚 / 往復 2 枚、残高不足拒否） |
| `add_tickets` | 管理者（`readonly` 時拒否） | チケット追加（1〜100 枚、0 円以上）と購入履歴記録 |
| `list_portal_invitations` | 管理者（読取専用） | 保護者専用エントリ URL（`#/parent/<publicEntryId>`）一覧 |
| `list_managed_users` | `live-gas` フル管理者（読取専用） | 登録済み Google アカウント一覧の参照 |
| `switch_demo_role` | `demo` モード専用 | `admin` / `parent` のデモロール切替 |
| `reset_demo_data` | `demo` モード専用（要 `confirm: true`） | ローカルデモ保存データの初期状態へのリセット |

### 2.2 リソース（4 種）とプロンプト（2 種）

- **リソース**: `ui://eigo-taxi/dashboard.html`（`text/html;profile=mcp-app`）、`eigo-taxi://overview`、`eigo-taxi://students`、`eigo-taxi://rides/today`
- **プロンプト**: `daily_dispatch_briefing`、`low_ticket_followup`

## 3. Antigravity でのビルド・起動・接続方法

### 3.1 ビルドと単体テスト

```powershell
cd mcp
npm install
npm run typecheck
npm run build
npm test
```

`npm run build` により自己完結型バンドル `dist/server.mjs` と単一 HTML `dist/dashboard.html` が生成され、`.agents/plugins/eigo-taxi-mcp/bin/`（および導入済みの場合は `~/.gemini/config/plugins/eigo-taxi-mcp/bin/`）へ同期されます。

### 3.2 Antigravity プラグイン配置と検証

1. リポジトリ同梱のプラグイン定義 `.agents/plugins/eigo-taxi-mcp/` を `agy plugin validate --strict .agents/plugins/eigo-taxi-mcp` で検証します。
2. ローカル Antigravity で有効化するには `~/.gemini/config/plugins/eigo-taxi-mcp/` へ配置します（二重登録を防ぐため `.agents/mcp_config.json` は併用しない単一構成を推奨）。
3. `agy plugin list --json` で `eigo-taxi-mcp`（`enabled: true`, `mcpServers: ["eigo-taxi"]`, `skills: ["eigo-taxi-mcp"]`）を確認します。

### 3.3 動作モード切替と Streamable HTTP

- **既定 `demo` モード**: `EIGO_TAXI_MCP_MODE=demo`。`EIGO_TAXI_MCP_DATA_DIR` 配下の `demo-state.json` にローカル保存し、GAS や本番台帳へは一切送信しません。
- **オプトイン `live-gas` モード**:
  - `EIGO_TAXI_MCP_MODE=live-gas`
  - `EIGO_TAXI_GAS_ID_TOKEN`: 有効な Firebase Google ID トークン（未設定時はデータ取得を Fail-Closed 拒否）
  - `EIGO_TAXI_PORTAL_ROLE`: `admin` または `parent`
  - `EIGO_TAXI_ENTRY_ID`: 保護者エントリ UUID（任意）
  - `EIGO_TAXI_MCP_READONLY=true`: すべての書き込み系ツールをサーバー側で強制拒否
- **Streamable HTTP サーバー起動**:

```powershell
node .agents/plugins/eigo-taxi-mcp/bin/server.mjs --transport http --host 127.0.0.1 --port 8787
```

`EIGO_TAXI_MCP_HTTP_TOKEN` を設定した場合、`POST /mcp` は `Authorization: Bearer <token>` をタイミングセーフ検証します（`GET /health` で稼働確認可）。ループバックバインド時は `Host` / `Origin` ヘッダをローカルホストに制限します。

## 4. Web サイト本体（W3C WebMCP）連携

`src/components/WebMcpBridge.tsx` は `document.modelContext ?? navigator.modelContext` に対応したエージェント・ブラウザ上で自動有効化されます（非対応ブラウザでは完全にノーオペレーション）。

- **未ログイン時**: 個人情報を含まない `eigo_taxi_get_status` と、ローカルデモ体験を開始する `eigo_taxi_enter_demo` のみを公開。
- **ログイン中**: 現行セッション（`admin` / `parent` / `reviewOnly`）の許可範囲内ツール（`eigo_taxi_list_students`, `eigo_taxi_list_rides`, `eigo_taxi_create_reservation`, `eigo_taxi_cancel_reservation`, `eigo_taxi_refresh_data`、管理者時 `eigo_taxi_complete_ride`・`eigo_taxi_add_tickets`、フル管理者時 `eigo_taxi_create_student`・`eigo_taxi_switch_tab`）のみを登録し、ログアウト・画面遷移時に `AbortController`（および `unregisterTool`）で即座に解除します。
