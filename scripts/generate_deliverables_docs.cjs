const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve('c:/Users/kanta/GitHub/eigo-taxi-management/docs/GoogleDrive_Upload/成果物一覧');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Mauro & Brenda Taxi Link プロジェクト成果物一覧</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Meiryo", sans-serif; margin: 0; padding: 24px; color: #1e293b; background: #fff; font-size: 11px; }
      .header { border-bottom: 2px solid #059669; padding-bottom: 10px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
      h1 { font-size: 18px; color: #059669; margin: 0 0 4px 0; }
      .sub { font-size: 11px; color: #64748b; margin: 0; }
      .meta { font-size: 10px; color: #475569; text-align: right; }
      
      .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 11px; }
      .info-item strong { color: #0f172a; }

      table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
      th { background: #059669; color: #fff; font-weight: bold; padding: 7px 10px; text-align: left; font-size: 10.5px; border: 1px solid #047857; }
      td { padding: 7px 10px; border: 1px solid #cbd5e1; font-size: 10px; vertical-align: middle; line-height: 1.4; }
      tr:nth-child(even) { background: #f8fafc; }
      .center { text-align: center; }
      .badge-done { background: #ecfdf5; color: #059669; font-weight: bold; border-radius: 4px; padding: 2px 6px; display: inline-block; font-size: 9.5px; border: 1px solid #a7f3d0; }
      .badge-cat { background: #f1f5f9; color: #334155; font-weight: bold; border-radius: 4px; padding: 2px 6px; display: inline-block; font-size: 9.5px; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <h1>Mauro & Brenda Taxi Link プロジェクト成果物一覧</h1>
        <p class="sub">英語教室 送迎チケット管理システム | 納品・管理用インベントリ</p>
      </div>
      <div class="meta">
        納品日: 2026年10月08日<br>
        バージョン: v1.0.0 (Production)
      </div>
    </div>

    <div class="info-box">
      <div class="info-item"><strong>■ Webサイト本番URL:</strong> https://kanta13jp1.github.io/eigo-taxi-management/</div>
      <div class="info-item"><strong>■ ソースコード:</strong> https://github.com/kanta13jp1/eigo-taxi-management</div>
      <div class="info-item"><strong>■ 主な関係者:</strong> 管理者（Mauro・Brenda先生） / コーディネーター（小林雅水様）</div>
      <div class="info-item"><strong>■ 技術スタック:</strong> React 19, TypeScript, Tailwind CSS, Vite, Google Apps Script</div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:30px;" class="center">No</th>
          <th style="width:110px;">分類</th>
          <th style="width:180px;">成果物名称</th>
          <th style="width:110px;">形式 / 所在</th>
          <th>概要・詳細説明</th>
          <th style="width:110px;">主な利用者</th>
          <th style="width:70px;" class="center">状態</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="center">1</td>
          <td><span class="badge-cat">システム本体</span></td>
          <td><strong>送迎チケット管理Webアプリ</strong></td>
          <td>Web (GitHub Pages)</td>
          <td>管理者（先生）と送迎利用者（保護者）の2軸切り替え。完全予約制（フレックス予約）、送迎完了時のチケット自動消化機能。</td>
          <td>Mauro・Brenda先生、保護者、生徒</td>
          <td class="center"><span class="badge-done">稼働中</span></td>
        </tr>
        <tr>
          <td class="center">2</td>
          <td><span class="badge-cat">システム本体</span></td>
          <td><strong>フロントエンドソースコード</strong></td>
          <td>Git (GitHub)</td>
          <td>React 19 + TypeScript + Tailwind CSS による完全型安全設計。コンポーネント指向・レスポンシブ対応。</td>
          <td>開発・保守担当</td>
          <td class="center"><span class="badge-done">公開済</span></td>
        </tr>
        <tr>
          <td class="center">3</td>
          <td><span class="badge-cat">システム本体</span></td>
          <td><strong>自動CI/CDパイプライン</strong></td>
          <td>GitHub Actions</td>
          <td>mainブランチ変更時に自動ビルド・検証・GitHub Pages本番デプロイを行う自動化パイプライン。</td>
          <td>運用保守担当</td>
          <td class="center"><span class="badge-done">稼働中</span></td>
        </tr>
        <tr>
          <td class="center">4</td>
          <td><span class="badge-cat">バックエンド</span></td>
          <td><strong>Google Apps Script (GAS) コード</strong></td>
          <td>JavaScript / GAS</td>
          <td>Googleスプレッドシートへのデータ同期およびGoogleカレンダーへの予定自動生成・削除を行うスクリプト。</td>
          <td>先生、運用担当</td>
          <td class="center"><span class="badge-done">完了</span></td>
        </tr>
        <tr>
          <td class="center">5</td>
          <td><span class="badge-cat">バックエンド</span></td>
          <td><strong>Googleスプレッドシート連携仕様</strong></td>
          <td>Spreadsheet 仕様</td>
          <td>「生徒台帳」「送迎履歴」「チケット購入履歴」の3シート自動作成および双方向データ連携設計。</td>
          <td>先生、小林様</td>
          <td class="center"><span class="badge-done">完了</span></td>
        </tr>
        <tr>
          <td class="center">6</td>
          <td><span class="badge-cat">バックエンド</span></td>
          <td><strong>Googleカレンダー連動機能</strong></td>
          <td>Calendar API</td>
          <td>送迎予約登録時に「🚗【送迎】生徒名」の予定を自動作成、キャンセル時に自動削除する連動ロジック。</td>
          <td>Mauro・Brenda先生</td>
          <td class="center"><span class="badge-done">完了</span></td>
        </tr>
        <tr>
          <td class="center">7</td>
          <td><span class="badge-cat">設計仕様書</span></td>
          <td><strong>画面デザイン仕様書 (PDF版)</strong></td>
          <td>PDF (A4横)</td>
          <td>全10画面×PC版・スマホ版の【実機スクリーンショット計20枚】を掲載した詳細デザイン仕様書。</td>
          <td>全関係者</td>
          <td class="center"><span class="badge-done">完了</span></td>
        </tr>
        <tr>
          <td class="center">8</td>
          <td><span class="badge-cat">設計仕様書</span></td>
          <td><strong>画面デザイン仕様書 (Markdown版)</strong></td>
          <td>Markdown (.md)</td>
          <td>デザインコンセプト、カラーパレット、レスポンシブ設計基準、ヒアリング要件反映一覧の原本。</td>
          <td>開発・保守担当</td>
          <td class="center"><span class="badge-done">完了</span></td>
        </tr>
        <tr>
          <td class="center">9</td>
          <td><span class="badge-cat">テスト検証</span></td>
          <td><strong>受入シナリオテスト仕様書 (Excel版)</strong></td>
          <td>Excel (.xlsx)</td>
          <td>全28項目の合否判定（OK/NG）・客観的証跡画像ファイル名・詳細実行ログを完備したチェックリスト。</td>
          <td>小林様、開発者</td>
          <td class="center"><span class="badge-done">Pass 100%</span></td>
        </tr>
        <tr>
          <td class="center">10</td>
          <td><span class="badge-cat">テスト検証</span></td>
          <td><strong>受入シナリオテスト仕様書 (PDF版)</strong></td>
          <td>PDF (A4横)</td>
          <td>全28テストケースの手順・判定基準・証跡画像・ログをA4横形式で美麗にまとめた受入報告PDF。</td>
          <td>全関係者</td>
          <td class="center"><span class="badge-done">Pass 100%</span></td>
        </tr>
        <tr>
          <td class="center">11</td>
          <td><span class="badge-cat">テスト検証</span></td>
          <td><strong>受入テスト客観的証跡一式 (キャプチャー＆ログ)</strong></td>
          <td>PNG 28枚 + TXT</td>
          <td>全28項目ブラウザ実行時の実機画面キャプチャー（TC-xxx.png）およびDOMアサーションログ（test_execution_log.txt）。</td>
          <td>全関係者・受入担当</td>
          <td class="center"><span class="badge-done">全28件完備</span></td>
        </tr>
        <tr>
          <td class="center">12</td>
          <td><span class="badge-cat">テスト検証</span></td>
          <td><strong>全自動E2E証跡取得テストスイート</strong></td>
          <td>Puppeteer</td>
          <td>全28ケースを自動実行し、画面キャプチャーと実行ログをリアルタイム採取する検証エンジン。</td>
          <td>開発・品質保証</td>
          <td class="center"><span class="badge-done">検証済</span></td>
        </tr>
        <tr>
          <td class="center">13</td>
          <td><span class="badge-cat">運用マニュアル</span></td>
          <td><strong>Google連携 導入4ステップガイド</strong></td>
          <td>Web内蔵ガイド</td>
          <td>スプレッドシート作成からGASデプロイ、WebアプリURL貼り付けまでの手順を画面内に完備。</td>
          <td>Mauro・Brenda先生、小林様</td>
          <td class="center"><span class="badge-done">完了</span></td>
        </tr>
        <tr>
          <td class="center">14</td>
          <td><span class="badge-cat">運用マニュアル</span></td>
          <td><strong>システム管理者・利用者運用手引書</strong></td>
          <td>Markdown / Docs</td>
          <td>日常の送迎受付、チケット追加チャージ、急な予定変更・キャンセル、トラブル対応手順。</td>
          <td>Mauro・Brenda先生、保護者</td>
          <td class="center"><span class="badge-done">完了</span></td>
        </tr>
      </tbody>
    </table>
  </body>
  </html>
  `;

  await page.setContent(html, { waitUntil: 'load' });
  const pdfPath = path.join(OUTPUT_DIR, 'Mauro_Brenda_Taxi_Link_成果物一覧.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
  });
  console.log('Saved Deliverables PDF:', pdfPath);

  await browser.close();

  // Markdown ファイルの生成
  const mdContent = `# Mauro & Brenda Taxi Link プロジェクト成果物一覧（Deliverables Inventory）

英語教室 送迎チケット管理Webアプリケーション「**Mauro & Brenda Taxi Link**」の納品・運用対象となる全成果物の一覧です。

---

## 1. プロジェクト基本情報

- **プロジェクト名**: Mauro & Brenda Taxi Link（英語教室 送迎チケット管理）
- **本番公開URL**: [https://kanta13jp1.github.io/eigo-taxi-management/](https://kanta13jp1.github.io/eigo-taxi-management/)
- **ソースコードリポジトリ**: [https://github.com/kanta13jp1/eigo-taxi-management](https://github.com/kanta13jp1/eigo-taxi-management)
- **主要関係者**:
  - 管理者: Mauro 先生 & Brenda 先生
  - コーディネーター: 小林雅水 様
  - 利用者: 英語教室の生徒・保護者の皆様
- **納品日 / バージョン**: 2026年10月08日 / v1.0.0 (Production Release)
- **技術スタック**: React 19, TypeScript, Tailwind CSS, Vite, GitHub Pages, Google Apps Script (GAS)

---

## 2. 納品成果物一覧

| No | 成果物分類 | 成果物名称 | 形式 / 所在 | 概要・詳細説明 | 主な利用者 | ステータス |
| :-: | :--- | :--- | :--- | :--- | :--- | :-: |
| **1** | システム本体 | **送迎チケット管理Webアプリ** | Web (GitHub Pages) | 本番稼働URL。管理者（Mauro・Brenda）と送迎利用者（保護者）の2軸切り替え、完全予約制（フレックス都度予約）、送迎完了時のチケット自動消化処理を完備。 | 先生、保護者、生徒 | **稼働中** |
| **2** | システム本体 | **フロントエンド ソースコード一式** | Git (GitHub) | TypeScript + React 19 + Tailwind CSS による型安全な実装。コンポーネント指向・レスポンシブ完全対応。 | 開発・保守担当 | **公開済** |
| **3** | システム本体 | **自動デプロイ CI/CD パイプライン** | GitHub Actions | mainブランチ更新時に自動ビルド・検証・GitHub Pages本番デプロイを実行するワークフロー (.github/workflows/deploy.yml)。 | 運用保守担当 | **稼働中** |
| **4** | バックエンド | **Google Apps Script (GAS) コード** | JavaScript / GAS | Googleスプレッドシート（3シート自動初期化）およびGoogleカレンダーへの送迎予定自動作成・削除バックエンドスクリプト。 | 先生、運用担当 | **完了** |
| **5** | バックエンド | **Googleスプレッドシート連携仕様** | GSS 定義 | 「生徒台帳」「送迎履歴」「チケット購入履歴」の3テーブルスキーマ定義および自動データ同期設計。 | 先生、小林様 | **完了** |
| **6** | バックエンド | **Googleカレンダー連動機能** | Calendar API | 予約確定時に「🚗【送迎】生徒名」の予定を自動作成、キャンセル時に自動削除する連動ロジック。 | Mauro・Brenda先生 | **完了** |
| **7** | 設計仕様書 | **画面デザイン仕様書 (PDF版)** | PDF (A4横) | 全10画面×PC版・スマホ版の【実機スクリーンショット計20枚】を収録したビジュアルUI/UXデザイン仕様書。 | 全関係者 | **完了** |
| **8** | 設計仕様書 | **画面デザイン仕様書 (Markdown版)** | Markdown (.md) | デザインコンセプト、カラーパレット、レスポンシブ設計要件、ヒアリング要件反映一覧の原本ドキュメント。 | 開発・保守担当 | **完了** |
| **9** | テスト検証 | **受入シナリオテスト仕様書 (Excel版)** | Excel (.xlsx) | 保護者ポータル・先生画面・Google連携・レスポンシブの全28項目テストマトリクス（合否・証跡画像名・実行ログ付・GSS対応）。 | 小林様、開発者 | **Pass 100%** |
| **10**| テスト検証 | **受入シナリオテスト仕様書 (PDF版)** | PDF (A4横) | 全28テストケースの手順・判定基準・証跡画像・ログをA4横形式で美麗にまとめた受入報告PDF。 | 全関係者 | **Pass 100%** |
| **11**| テスト検証 | **受入テスト客観的証跡一式 (キャプチャー＆ログ)** | PNG 28枚 + TXT | 全28項目ブラウザ実行時の実機画面キャプチャー（TC-xxx.png）およびDOMアサーションログ（test_execution_log.txt）。 | 全関係者・受入担当 | **全28件完備** |
| **12**| テスト検証 | **全自動E2E証跡取得テストスイート** | Puppeteer | 全28ケースを自動実行し、画面キャプチャーと実行ログをリアルタイム採取する検証エンジン。 | 開発・品質保証 | **検証済** |
| **13**| 運用マニュアル | **Google連携 導入4ステップガイド** | Web内蔵ガイド | スプレッドシート作成からGASデプロイ、WebアプリURL貼り付けまでの手順を画面内に完備。 | 先生、小林様 | **完了** |
| **14**| 運用マニュアル | **システム管理者・利用者運用手引書** | Markdown / Docs | 日常の送迎受付、チケット追加チャージ、急な予定変更・キャンセル、トラブル対応手順。 | 先生、保護者 | **完了** |

---

## 3. ヒアリング反映仕様の確認ポイント

1. **管理者2名体制への対応**:
   - サービス名を「Mauro & Brenda Taxi Link」とし、ヘッダーおよびダッシュボードに管理者名を明記。
2. **チケット消費ルール**:
   - 「片道1回（お迎えで1回、送りで1回、往復で2回）」の消費ルールをUI各所に明記。送迎完了ボタン（「送迎完了（1回消費）」）で自動消化。
3. **完全予約制（フレックス予約）対応**:
   - 前日や当日でも保護者・先生の双方から随時送迎予約を追加・キャンセル可能。
4. **チケット残少アラート**:
   - 残チケットが2回以下になった際、保護者画面の最前面に「⚠️ チケットが無くなりそうです。Mauro・Brenda に連絡してね！」を表示。
5. **シンプル運用の徹底（KISS原則）**:
   - LINE連携やオンライン決済、定期予約などの不要な複雑機能をあえて排除し、Googleスプレッドシートとカレンダー連携で誰でもすぐ使える直感性を実現。
`;

  const mdPath = path.join(OUTPUT_DIR, 'Mauro_Brenda_Taxi_Link_成果物一覧.md');
  fs.writeFileSync(mdPath, mdContent, 'utf-8');
  console.log('Saved Deliverables Markdown:', mdPath);
}

run().catch(console.error);
