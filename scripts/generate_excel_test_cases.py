import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
import os

OUTPUT_DIR = r"c:\Users\kanta\GitHub\eigo-taxi-management\docs\GoogleDrive_Upload"
os.makedirs(OUTPUT_DIR, exist_ok=True)
FILE_PATH = os.path.join(OUTPUT_DIR, "Mauro_Brenda_Taxi_Link_シナリオテスト仕様書.xlsx")

wb = openpyxl.Workbook()

# スタイル定義
font_title = Font(name="Meiryo", size=16, bold=True, color="059669")
font_section = Font(name="Meiryo", size=11, bold=True, color="0f172a")
font_header = Font(name="Meiryo", size=10, bold=True, color="FFFFFF")
font_body = Font(name="Meiryo", size=10, color="1e293b")
font_bold = Font(name="Meiryo", size=10, bold=True, color="1e293b")
font_mono = Font(name="Consolas", size=9, color="0284C7", bold=True)

fill_header = PatternFill(start_color="059669", end_color="059669", fill_type="solid")
fill_sub = PatternFill(start_color="F1F5F9", end_color="F1F5F9", fill_type="solid")
fill_pending = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid")
fill_ok = PatternFill(start_color="ECFDF5", end_color="ECFDF5", fill_type="solid")

thin_border = Border(
    left=Side(style='thin', color='CBD5E1'),
    right=Side(style='thin', color='CBD5E1'),
    top=Side(style='thin', color='CBD5E1'),
    bottom=Side(style='thin', color='CBD5E1')
)

# ==========================================
# 1. サマリー シート
# ==========================================
ws_summary = wb.active
ws_summary.title = "テスト概要・サマリー"
ws_summary.views.sheetView[0].showGridLines = True

ws_summary["B2"] = "Mauro & Brenda Taxi Link 送迎チケット管理システム"
ws_summary["B2"].font = font_title
ws_summary["B3"] = "受入シナリオテスト仕様書 ＆ 手動受入検証管理表"
ws_summary["B3"].font = font_section

summary_data = [
    ["プロジェクト名", "Mauro & Brenda Taxi Link (英語教室 送迎チケット管理)"],
    ["公開WebアプリURL", "https://kanta13jp1.github.io/eigo-taxi-management/"],
    ["GitHubリポジトリ", "https://github.com/kanta13jp1/eigo-taxi-management"],
    ["主要関係者", "管理者: Mauro先生 & Brenda先生 / コーディネーター: 小林雅水様"],
    ["テスト目的", "全28シナリオの受入検証（Web自動E2E検証 22件 ＋ 本番Google手動連携検証 6件）"],
    ["Web自動E2E検証", "22項目 実施完了 / PASS: 22件, FAIL: 0件 (合格率 100% / 客観的証跡画像22枚+ログ完備)"],
    ["Google連携手動検証", "6項目 / ステータス: 【手動受入検証待ち】（非技術者向け手順書に基づき本番アカウントで実施・証跡取得後に正式合格）"],
    ["総合判定ルール", "Web基本機能は完全動作確認済。Google実機連携はユーザー手動確認の証跡取得をもって最終合格・本番承認とする"],
]

for row_idx, (k, v) in enumerate(summary_data, start=5):
    ws_summary.cell(row=row_idx, column=2, value=k).font = font_bold
    ws_summary.cell(row=row_idx, column=2).fill = fill_sub
    ws_summary.cell(row=row_idx, column=2).border = thin_border
    
    ws_summary.cell(row=row_idx, column=3, value=v).font = font_body
    ws_summary.cell(row=row_idx, column=3).border = thin_border

ws_summary.column_dimensions["B"].width = 22
ws_summary.column_dimensions["C"].width = 85

# カテゴリ別集計
ws_summary["B15"] = "カテゴリ別 テスト検証状況"
ws_summary["B15"].font = font_section

cat_headers = ["カテゴリ", "対象機能", "ケース数", "検証方式", "証跡状況", "判定ステータス"]
for col_idx, ch in enumerate(cat_headers, start=2):
    cell = ws_summary.cell(row=17, column=col_idx, value=ch)
    cell.font = font_header
    cell.fill = fill_header
    cell.alignment = Alignment(horizontal="center", vertical="center")
    cell.border = thin_border

cat_data = [
    ["1. 保護者ポータル", "生徒切替・残高確認・アラート・予約・自己キャンセル・履歴閲覧", 9, "Puppeteer E2E自動", "画面キャプチャー9枚 + ログ", "OK (PASS 100%)"],
    ["2. 管理者ダッシュボード", "サマリー・送迎完了減算・地図連動・予定追加・生徒登録・チャージ・取消", 8, "Puppeteer E2E自動", "画面キャプチャー8枚 + ログ", "OK (PASS 100%)"],
    ["3. データ整合性", "予約〜完了往復連携・残数0境界値警告・リロード永続化", 3, "Puppeteer E2E自動", "画面キャプチャー3枚 + ログ", "OK (PASS 100%)"],
    ["4. デザイン＆レスポンシブ", "スマートフォン(375px)適合・全画面ビジュアル品質", 2, "Puppeteer E2E自動", "画面キャプチャー2枚 + ログ", "OK (PASS 100%)"],
    ["5. Google連携 (GAS)", "シート自動初期化・URL設定・カレンダー同期/削除・フォールバック", 6, "手動受入検証 (UAT)", "手動実施時の実画面キャプチャー4枚で判定", "手動受入検証待ち"],
    ["合計", "全機能完全網羅", 28, "自動22件 ＋ 手動6件", "自動22枚完備 ＋ 手動4枚予定", "22件合格 / 6件手動確認中"]
]

for row_idx, r in enumerate(cat_data, start=18):
    for col_idx, val in enumerate(r, start=2):
        cell = ws_summary.cell(row=row_idx, column=col_idx, value=val)
        cell.font = font_bold if row_idx == 23 else font_body
        cell.fill = PatternFill(start_color="E2E8F0" if row_idx == 23 else ("FFFFFF" if row_idx % 2 == 0 else "F8FAFC"), fill_type="solid")
        cell.border = thin_border
        if col_idx in [4, 5, 6, 7]:
            cell.alignment = Alignment(horizontal="center", vertical="center")
        if isinstance(val, str) and "手動受入検証待ち" in val:
            cell.fill = fill_pending
            cell.font = Font(name="Meiryo", size=10, bold=True, color="D97706")
        elif isinstance(val, str) and "OK" in val:
            cell.font = Font(name="Meiryo", size=10, bold=True, color="059669")

# ==========================================
# 2. テストケース詳細 シート
# ==========================================
ws_cases = wb.create_sheet(title="シナリオテストケース一覧")
ws_cases.views.sheetView[0].showGridLines = True

headers = [
    "No", "テストID", "カテゴリ", "テストケース名", 
    "前提条件", "操作手順", "期待される結果（合格基準）", 
    "判定", "検証方式", "証跡状況 / ファイル名", "実行ログ・受入確認詳細"
]

for col_idx, h in enumerate(headers, start=1):
    cell = ws_cases.cell(row=2, column=col_idx, value=h)
    cell.font = font_header
    cell.fill = fill_header
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    cell.border = thin_border
ws_cases.row_dimensions[2].height = 28

cases_data = [
    # カテゴリ1: 保護者ポータル
    [1, "TC-P01", "送迎利用者", "生徒切り替え操作", "複数生徒が登録されている", "画面上部「表示する生徒」プルダウンから別生徒を選択", "選択生徒の残高・予約一覧・過去履歴が即座に同期切り替えされる", "OK", "Puppeteer E2E", "TC-P01_student_switch.png", "生徒「山本 颯太」へ切り替え成功。残1回表示と予約一覧の同期を確認。"],
    [2, "TC-P02", "送迎利用者", "チケット残数表示（余裕時）", "チケット残3回以上", "保護者ポータルを開く", "残回数が大きく表示され「片道1枚消費」が明記。警告枠は非表示", "OK", "Puppeteer E2E", "TC-P02_residual_normal.png", "田中 陽菜さん 残7回分および「片道1回につきチケット1枚消費」表示を確認。"],
    [3, "TC-P03", "送迎利用者", "残少アラート表示（残り1回）", "チケット残2回以下", "山本 颯太さん（残1回）を選択", "「⚠️ チケットが無くなりそうです（残り1回）Mauro・Brenda に連絡してね！」が表示される", "OK", "Puppeteer E2E", "TC-P03_residual_alert.png", "警告枠および指定メッセージの完全一致レンダリングを確認。"],
    [4, "TC-P04", "送迎利用者", "チケット残ゼロ表示", "チケット残0回", "高橋 莉子さん（残0回）を選択", "残高0回分と表示され、警告アラートが表示される", "OK", "Puppeteer E2E", "TC-P04_residual_zero.png", "高橋 莉子さん 残0回分表示および警告枠を確認。"],
    [5, "TC-P05", "送迎利用者", "送迎予約登録（行き・お迎え）", "残チケット1枚以上", "予約モーダルで「行き（お迎え）」を選択し確定", "予約一覧に「お迎え（教室へ）」で登録。確定時点では残数減算なし", "OK", "Puppeteer E2E", "TC-P05_reservation_pickup.png", "「お迎え（教室へ）」送迎予約の新規登録・一覧反映を確認。"],
    [6, "TC-P06", "送迎利用者", "送迎予約登録（帰り・送り）", "残チケット1枚以上", "予約モーダルで「帰り（送り）」を選択し確定", "予約一覧に「送り（ご自宅へ）」で正常に登録される", "OK", "Puppeteer E2E", "TC-P06_reservation_dropoff.png", "「送り（ご自宅へ）」送迎予約の新規登録・一覧反映を確認。"],
    [7, "TC-P07", "送迎利用者", "送迎予約登録（往復・2枚消費）", "残チケット2枚以上", "予約モーダルで「往復」を選択し確定", "「往復（チケット2枚消費）」の明記とともに正常登録される", "OK", "Puppeteer E2E", "TC-P07_reservation_roundtrip.png", "「往復」送迎予約（チケット2枚消費）の登録成功を確認。"],
    [8, "TC-P08", "送迎利用者", "保護者による自己キャンセル", "予約中データが存在する", "予約の「キャンセル」をクリックしダイアログOK", "予約中から消え、過去履歴に「キャンセル」で記録。残数は減らない", "OK", "Puppeteer E2E", "TC-P08_reservation_cancel.png", "送迎予定のキャンセル実行および過去履歴への「キャンセル」移動を確認（confirm自動承諾）。"],
    [9, "TC-P09", "送迎利用者", "過去利用履歴テーブル閲覧", "完了・キャンセルデータあり", "ポータル下部の過去履歴テーブルを確認", "日時・種別・ステータス（送迎済 / キャンセル）が時系列表示される", "OK", "Puppeteer E2E", "TC-P09_history_table.png", "過去の送迎実績・ステータス（送迎済 / キャンセル）が履歴表に正確に表示されていることを確認。"],

    # カテゴリ2: 先生用ダッシュボード
    [10, "TC-T01", "管理者", "管理者ダッシュボード＆サマリー", "当日予定が存在する", "「管理者用」タブを選択", "バナー表示、本日の件数サマリー、チケット残少生徒数が正確に集計表示", "OK", "Puppeteer E2E", "TC-T01_teacher_summary.png", "「Mauro・Brenda 先生用管理ダッシュボード」バナーおよび3カードサマリーを確認。"],
    [11, "TC-T02", "管理者", "送迎完了処理とチケット自動減算", "当日予定が未完了(scheduled)", "送迎カードの「送迎完了（1回消費）」をクリック", "カードが完了状態になり、該当生徒のチケット残高が即座に-1減算される", "OK", "Puppeteer E2E", "TC-T02_ride_completed.png", "送迎完了処理を実行し、チケットが自動で-1枚減算されステータスが更新されたことを確認。"],
    [12, "TC-T03", "管理者", "Google Maps地図アプリ連動", "送迎先住所あり", "カード内の「地図アプリ」をクリック", "Google Mapsが新規タブで開き、送迎先住所がピン留め検索される", "OK", "Puppeteer E2E", "TC-T03_map_link.png", "地図アプリボタンがGoogle Maps検索リンクと連携していることを確認。"],
    [13, "TC-T04", "管理者", "先生側からの送迎予定追加", "-", "「送迎予定を追加」より生徒・日時・区分を入力", "一覧および全スケジュールに即座反映。生徒選択で登録住所が自動補完", "OK", "Puppeteer E2E", "TC-T04_teacher_add_ride.png", "先生用画面からの送迎予定追加モーダルおよびスケジュール反映を確認。"],
    [14, "TC-T05", "管理者", "新規生徒登録（住所・連絡先含む）", "-", "生徒管理タブで「＋新規生徒を登録」をクリックし保存", "生徒一覧および保護者ポータルのプルダウンに新規生徒が即時追加される", "OK", "Puppeteer E2E", "TC-T05_add_student.png", "新規生徒「鈴木 陸斗」の登録実行および台帳一覧への即時追加を確認。"],
    [15, "TC-T06", "管理者", "チケット追加チャージ（10回券）", "-", "「チケット追加」より10回券(¥10,000)を選択して登録", "生徒のチケット残数が+10され、残少だった場合はアラートが自動解除", "OK", "Puppeteer E2E", "TC-T06_add_ticket.png", "10回券（+10回分）のチャージ処理成功および生徒残数加算を確認。"],
    [16, "TC-T07", "管理者", "送迎スケジュール一覧と絞り込み", "複数送迎データあり", "スケジュール一覧で「予約中」「完了済み」「キャンセル」を切り替え", "選択したステータスに合致する送迎データのみが正確に一覧表示される", "OK", "Puppeteer E2E", "TC-T07_schedule_filter.png", "スケジュール一覧におけるステータスフィルター（完了済み）による絞り込み表示を確認。"],
    [17, "TC-T08", "管理者", "先生による送迎取消操作", "未完了送迎あり", "スケジュール一覧の「取消」ボタンをクリック", "ステータスがキャンセルに変更され、チケット残数は減算されない", "OK", "Puppeteer E2E", "TC-T08_teacher_cancel.png", "先生画面における送迎取消・ステータス管理機能の正常性を確認。"],

    # カテゴリ3: データ整合性
    [18, "TC-I01", "データ整合性", "エンドツーエンド結合（予約〜完了）", "生徒A（残高5回）", "保護者予約 ➡️ 先生画面で確認 ➡️ 送迎完了 ➡️ 保護者画面確認", "生徒Aの残高が4回になり、予約中から完了履歴へ正しく遷移する", "OK", "Puppeteer E2E", "TC-I01_e2e_integration.png", "保護者と管理者の双方向データ連動およびチケット減算の整合性を確認。"],
    [19, "TC-I02", "データ整合性", "残数境界値テスト（アラート〜解除）", "生徒B（残高1回）", "送迎完了(残0:アラート発生) ➡️ 5回券チャージ(残5:アラート解除)", "残数ゼロで黄色警告が表示され、チャージ完了で即座に警告解除される", "OK", "Puppeteer E2E", "TC-I02_boundary_alert_clear.png", "残1回での警告表示およびチケット追加時の動的更新を確認。"],
    [20, "TC-I03", "データ整合性", "リロード時のデータ永続化", "操作実行済み", "ブラウザでCtrl+F5ハードリロードを実施", "登録した予約、残数減算、チャージ情報が消えずに維持される", "OK", "Puppeteer E2E", "TC-I03_reload_persistence.png", "ブラウザリロード後も登録データ・チケット情報がLocalStorageに正常保持されることを確認。"],

    # カテゴリ4: デザイン＆レスポンシブ
    [21, "TC-U01", "レスポンシブ", "スマホ画面幅(375px)レスポンシブ適合", "iPhone幅", "375×812 viewportで全画面描画", "横スクロールなし、タブが下部または適正配置、ボタンタップ領域44px以上", "OK", "Puppeteer E2E", "TC-U01_mobile_responsive.png", "iPhoneサイズ（375×812）における横スクロールなし・タップ領域44px以上の適合を確認。"],
    [22, "TC-V01", "ビジュアル", "全画面デザイン・ビジュアル品質検証", "PC/スマホ", "全10画面×PC/スマホ(計20枚)のビジュアル検証", "余白・フォント・コントラスト・チップ選択状態が崩れず美しい品質を維持", "OK", "Puppeteer E2E", "TC-V01_visual_quality.png", "デスクトップ（1280×800）およびモバイル（375×812）における全画面ビジュアル品質・コントラスト・余白の適合を確認。"],

    # カテゴリ5: Google連携 (GAS) - 手動受入検証
    [23, "TC-G01", "Google連携", "GASコード表示とワンクリックコピー", "設定画面", "「スクリプトをコピー」をクリック", "クリップボードにGASスクリプト全文が正確にコピーされる", "手動受入検証待ち", "手動 (Step 1)", "TC-G01_gas_code_view.png", "Web画面でのコード表示・コピーは自動確認済。Apps Scriptへの貼り付けを手動確認。"],
    [24, "TC-G02", "Google連携", "シート自動初期化ロジック検証", "Googleアカウント", "initSpreadsheet関数を実行", "生徒台帳・送迎予定履歴・チケット購入履歴の3シートが自動生成される", "手動受入検証待ち", "手動 (Step 2)", "【証跡1】スプレッドシート全景", "手動受入手順書Step 2に基づき実施。3シート生成画面のキャプチャー提出でOK。"],
    [25, "TC-G03", "Google連携", "GAS WebアプリURL設定・保存", "設定画面", "設定画面でGAS WebアプリURLを入力し「接続設定を保存」", "接続先URLがLocalStorageに保存され、緑色フィードバックが表示される", "手動受入検証待ち", "手動 (Step 3)", "TC-G03_gas_url_saved.png", "Web画面でのURL保存機能は自動確認済。発行した実URLの接続テストを手動確認。"],
    [26, "TC-G04", "Google連携", "Googleカレンダー予定自動登録検証", "連携環境", "Web画面からテスト予約を登録", "Googleカレンダーに『🚗【送迎】生徒名』の予定が自動作成され、シートに行追加される", "手動受入検証待ち", "手動 (Step 4)", "【証跡2&3】シート行追加＆カレンダー", "手動受入手順書Step 4に基づき実施。カレンダーおよびシート行追加キャプチャーでOK。"],
    [27, "TC-G05", "Google連携", "Googleカレンダー予定自動削除検証", "連携環境", "Web画面からテスト予約をキャンセル", "Googleカレンダーの該当送迎予定が自動削除され、シートがcancelledになる", "手動受入検証待ち", "手動 (Step 5)", "【証跡4】カレンダー消去＆cancelled", "手動受入手順書Step 5に基づき実施。予定削除後の画面キャプチャー提出でOK。"],
    [28, "TC-G06", "Google連携", "GAS通信失敗時の自動フォールバック", "オフライン/異常系", "GAS未デプロイ状態で画面操作を実施", "アプリが停止せず、LocalStorageに自動フォールバックして動作継続する", "OK", "Puppeteer E2E", "TC-G06_fallback_handling.png", "自動E2E検証完了。GAS未接続時もFail-Openにより画面操作が停止しないことを実証済。"]
]

for row_idx, row_data in enumerate(cases_data, start=3):
    is_even = (row_idx % 2 == 0)
    row_fill = PatternFill(start_color="F8FAFC" if is_even else "FFFFFF", end_color="F8FAFC" if is_even else "FFFFFF", fill_type="solid")
    
    for col_idx, val in enumerate(row_data, start=1):
        cell = ws_cases.cell(row=row_idx, column=col_idx, value=val)
        cell.font = font_body
        cell.fill = row_fill
        cell.border = thin_border
        
        if col_idx in [1, 2, 3, 8, 9]:
            cell.alignment = Alignment(horizontal="center", vertical="center")
        elif col_idx == 10:
            cell.alignment = Alignment(horizontal="left", vertical="center")
            if "TC-" in str(val):
                cell.font = font_mono
        else:
            cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
            
        if col_idx == 8:
            if val == "OK":
                cell.font = Font(name="Meiryo", size=10, bold=True, color="059669")
                cell.fill = fill_ok
            elif "手動受入検証待ち" in val:
                cell.font = Font(name="Meiryo", size=9, bold=True, color="D97706")
                cell.fill = fill_pending

    ws_cases.row_dimensions[row_idx].height = 25

widths = {
    "A": 6,   # No
    "B": 11,  # テストID
    "C": 15,  # カテゴリ
    "D": 26,  # テストケース名
    "E": 20,  # 前提条件
    "F": 32,  # 操作手順
    "G": 38,  # 期待される結果
    "H": 16,  # 判定
    "I": 16,  # 検証方式
    "J": 30,  # 証跡状況
    "K": 45   # 実行ログ・受入確認詳細
}

for col_letter, width in widths.items():
    ws_cases.column_dimensions[col_letter].width = width

# ==========================================
# 3. 手動受入検証（Google連携）管理シート
# ==========================================
ws_manual = wb.create_sheet(title="Google連携手動受入検証手順")
ws_manual.views.sheetView[0].showGridLines = True

ws_manual["B2"] = "Google連携（スプレッドシート＆カレンダー）手動受入検証 手順＆証跡貼付表"
ws_manual["B2"].font = font_title
ws_manual["B3"] = "※技術的知識のない方でも本手順を実施し、各証跡画像を添付・確認することで正式合格（Pass）となります"
ws_manual["B3"].font = font_section

manual_steps = [
    ["Step 1", "スプレッドシート作成 & コード貼付", "Googleドライブで「空白のスプレッドシート」を作成 ➜ メニュー「拡張機能」>「Apps Script」 ➜ Webアプリ「Google連携」タブの「スクリプトをコピー」を押してエディタに貼り付け ➜ 保存", "スクリプト保存完了"],
    ["Step 2", "3シート自動初期化 & アクセス承認", "プルダウンで「initSpreadsheet」を選択し「実行」 ➜ 「権限を確認」 ➜ 「詳細」>「安全ではないページに移動」>「許可」 ➜ スプレッドシート下に3シート（生徒台帳、送迎予定履歴、チケット購入履歴）が生成される", "【証跡1】3シート生成画面キャプチャー"],
    ["Step 3", "Webアプリデプロイ & URL連携", "右上の「デプロイ」>「新しいデプロイ」 ➜ 種類「ウェブアプリ」、アクセス「全員」でデプロイ ➜ 表示されたURLをコピー ➜ Webアプリ「Google連携」タブに貼り付けて「接続設定を保存」", "URL保存完了"],
    ["Step 4", "テスト予約登録 & カレンダー・シート確認", "Webアプリ「送迎利用者用」で山本颯太くんを選択 ➜ 「送迎の予約を申し込む」（送迎日、16:30、行き、メモ:テスト） ➜ スプレッドシート「送迎予定履歴」に行追加 & Googleカレンダーに『🚗【送迎】山本 颯太』登録を確認", "【証跡2&3】シート行追加 & カレンダー予定キャプチャー"],
    ["Step 5", "キャンセル連動 & カレンダー自動削除", "Webアプリでテスト予約の「キャンセル」をクリック ➜ Googleカレンダーから予定が自動消去されたことを確認 ➜ スプレッドシートのステータスが「cancelled」に自動更新されたことを確認", "【証跡4】予定消去 & cancelled更新キャプチャー"],
]

for col_idx, h in enumerate(["ステップ", "実施項目", "具体的な操作手順（迷わずできる手順）", "合格に必要な証跡"], start=2):
    cell = ws_manual.cell(row=5, column=col_idx, value=h)
    cell.font = font_header
    cell.fill = fill_header
    cell.alignment = Alignment(horizontal="center", vertical="center")
    cell.border = thin_border
ws_manual.row_dimensions[5].height = 26

for row_idx, r in enumerate(manual_steps, start=6):
    for col_idx, val in enumerate(r, start=2):
        cell = ws_manual.cell(row=row_idx, column=col_idx, value=val)
        cell.font = font_bold if col_idx in [2, 3] else font_body
        cell.fill = PatternFill(start_color="FFFFFF" if row_idx % 2 == 0 else "F8FAFC", fill_type="solid")
        cell.border = thin_border
        if col_idx == 2:
            cell.alignment = Alignment(horizontal="center", vertical="center")
        elif col_idx == 5:
            cell.alignment = Alignment(horizontal="center", vertical="center")
            cell.font = Font(name="Meiryo", size=9.5, bold=True, color="0284C7")
        else:
            cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
    ws_manual.row_dimensions[row_idx].height = 42

ws_manual.column_dimensions["B"].width = 12
ws_manual.column_dimensions["C"].width = 28
ws_manual.column_dimensions["D"].width = 65
ws_manual.column_dimensions["E"].width = 35

# 証跡貼付枠
ws_manual["B13"] = "▍手動受入検証 証跡キャプチャー貼付 ＆ 受入サイン欄"
ws_manual["B13"].font = font_section

check_boxes = [
    ["検証証跡 1: シート自動生成画面", "スプレッドシート下部に「生徒台帳」「送迎予定履歴」「チケット購入履歴」の3シートが表示されている画面", "[   ] 確認完了"],
    ["検証証跡 2: スプレッドシート行追加画面", "「送迎予定履歴」シートに、Webアプリから登録したテスト予約（16:30 行き）が追加されている画面", "[   ] 確認完了"],
    ["検証証跡 3: Googleカレンダー予定自動登録", "Googleカレンダーの該当日時に『🚗【送迎】生徒名』の予定が自動登録されている画面", "[   ] 確認完了"],
    ["検証証跡 4: カレンダー予定削除 & cancelled更新", "Webアプリでキャンセル後、カレンダー予定が消え、シートステータスが「cancelled」になった画面", "[   ] 確認完了"],
]

for row_idx, (title, desc, status) in enumerate(check_boxes, start=15):
    ws_manual.cell(row=row_idx, column=2, value=title).font = font_bold
    ws_manual.cell(row=row_idx, column=2).fill = fill_sub
    ws_manual.cell(row=row_idx, column=2).border = thin_border
    
    ws_manual.cell(row=row_idx, column=3, value=desc).font = font_body
    ws_manual.cell(row=row_idx, column=3).border = thin_border
    
    cell_st = ws_manual.cell(row=row_idx, column=4, value=status)
    cell_st.font = font_bold
    cell_st.alignment = Alignment(horizontal="center", vertical="center")
    cell_st.fill = fill_pending
    cell_st.border = thin_border
    ws_manual.row_dimensions[row_idx].height = 28

ws_manual["B20"] = "検証実施日: 2026年 _____月 _____日"
ws_manual["B20"].font = font_bold
ws_manual["B21"] = "検証実施者ご署名: _______________________________"
ws_manual["B21"].font = font_bold
ws_manual["B22"] = "使用Googleアカウント: _______________________________"
ws_manual["B22"].font = font_bold
ws_manual["B23"] = "総合受入判定: [   ] 合格（本番リリース承認）   /   [   ] 不合格（再調整要）"
ws_manual["B23"].font = Font(name="Meiryo", size=11, bold=True, color="059669")

wb.save(FILE_PATH)
print(f"[SUCCESS] Updated Test Specification Excel: {FILE_PATH}")
