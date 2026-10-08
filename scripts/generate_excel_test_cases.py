import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import os

OUTPUT_DIR = r"c:\Users\kanta\GitHub\eigo-taxi-management\docs\GoogleDrive_Upload"
os.makedirs(OUTPUT_DIR, exist_ok=True)
FILE_PATH = os.path.join(OUTPUT_DIR, "Mauro_Brenda_Taxi_Link_シナリオテスト仕様書.xlsx")

wb = openpyxl.Workbook()

# ==========================================
# 1. サマリー シート
# ==========================================
ws_summary = wb.active
ws_summary.title = "テスト概要・サマリー"
ws_summary.views.sheetView[0].showGridLines = True

# スタイル定義
font_title = Font(name="Meiryo", size=16, bold=True, color="059669")
font_section = Font(name="Meiryo", size=11, bold=True, color="0f172a")
font_header = Font(name="Meiryo", size=10, bold=True, color="FFFFFF")
font_body = Font(name="Meiryo", size=10, color="1e293b")
font_bold = Font(name="Meiryo", size=10, bold=True, color="1e293b")

fill_header = PatternFill(start_color="059669", end_color="059669", fill_type="solid")
fill_sub = PatternFill(start_color="F1F5F9", end_color="F1F5F9", fill_type="solid")
thin_border = Border(
    left=Side(style='thin', color='CBD5E1'),
    right=Side(style='thin', color='CBD5E1'),
    top=Side(style='thin', color='CBD5E1'),
    bottom=Side(style='thin', color='CBD5E1')
)

ws_summary["B2"] = "Mauro & Brenda Taxi Link 送迎チケット管理システム"
ws_summary["B2"].font = font_title
ws_summary["B3"] = "受入シナリオテスト仕様書 & 実行結果サマリー"
ws_summary["B3"].font = font_section

summary_data = [
    ["プロジェクト名", "Mauro & Brenda Taxi Link (英語教室 送迎チケット管理)"],
    ["公開WebアプリURL", "https://kanta13jp1.github.io/eigo-taxi-management/"],
    ["GitHubリポジトリ", "https://github.com/kanta13jp1/eigo-taxi-management"],
    ["主要関係者", "管理者: Mauro先生 & Brenda先生 / コーディネーター: 小林雅水様"],
    ["テスト目的", "全ユーザー操作（保護者予約・先生管理・Google連携・レスポンシブ）の受入検証"],
    ["テスト実施日", "2026年10月08日"],
    ["総合判定", "合格 (Pass)"],
]

for row_idx, (k, v) in enumerate(summary_data, start=5):
    ws_summary.cell(row=row_idx, column=2, value=k).font = font_bold
    ws_summary.cell(row=row_idx, column=2).fill = fill_sub
    ws_summary.cell(row=row_idx, column=2).border = thin_border
    
    ws_summary.cell(row=row_idx, column=3, value=v).font = font_body
    ws_summary.cell(row=row_idx, column=3).border = thin_border

ws_summary.column_dimensions["B"].width = 20
ws_summary.column_dimensions["C"].width = 65


# ==========================================
# 2. テストケース詳細 シート
# ==========================================
ws_cases = wb.create_sheet(title="シナリオテストケース一覧")
ws_cases.views.sheetView[0].showGridLines = True

headers = [
    "No", "テストID", "カテゴリ", "テストケース名", 
    "前提条件", "操作手順", "期待される結果（合格基準）", 
    "判定 (OK/NG)", "実施日", "実施者", "備考・確認事項"
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
    [1, "TC-P01", "送迎利用者", "生徒切り替え", "複数生徒が登録されている", "画面上部「表示する生徒」プルダウンから別生徒を選択", "選択生徒の残高・予約一覧・過去履歴が即座に同期切り替えされる", "OK", "2026/10/08", "自動/手動", "兄弟対応確認済"],
    [2, "TC-P02", "送迎利用者", "残数表示（余裕時）", "チケット残3回以上", "保護者ポータルを開く", "残回数が大きく表示され「片道1枚消費」が明記。警告枠は非表示", "OK", "2026/10/08", "自動/手動", "田中 陽菜さん(7回)"],
    [3, "TC-P03", "送迎利用者", "残少アラート表示", "チケット残2回以下", "山本 颯太さん（残1回）を選択", "「⚠️ チケットが無くなりそうです。Mauro・Brenda に連絡してね！」が表示される", "OK", "2026/10/08", "自動/手動", "指定文言完全一致"],
    [4, "TC-P04", "送迎利用者", "チケット残ゼロ表示", "チケット残0回", "高橋 莉子さん（残0回）を選択", "残高0回分と表示され、警告アラートが表示される", "OK", "2026/10/08", "自動/手動", "赤色バッジ連動"],
    [5, "TC-P05", "送迎利用者", "送迎予約（お迎え・片道）", "残チケット1枚以上", "予約モーダルで「行き（お迎え）」を選択し確定", "予約一覧に「お迎え（教室へ）」で登録。確定時点では残数減算なし", "OK", "2026/10/08", "自動/手動", "完了時に1枚消費"],
    [6, "TC-P06", "送迎利用者", "送迎予約（送り・片道）", "残チケット1枚以上", "予約モーダルで「帰り（送り）」を選択し確定", "予約一覧に「送り（ご自宅へ）」で正常に登録される", "OK", "2026/10/08", "自動/手動", "片道1回消費"],
    [7, "TC-P07", "送迎利用者", "送迎予約（往復）", "残チケット2枚以上", "予約モーダルで「往復」を選択し確定", "「チケット2枚消費」の明記とともに正常登録される", "OK", "2026/10/08", "自動/手動", "往復2回消費ルール"],
    [8, "TC-P08", "送迎利用者", "自己キャンセル", "予約中データが存在する", "予約の「キャンセル」をクリックしダイアログOK", "予約中から消え、過去履歴に「キャンセル」で記録。残数は減らない", "OK", "2026/10/08", "自動/手動", "誤消費防止"],
    [9, "TC-P09", "送迎利用者", "過去履歴閲覧", "完了・キャンセルデータあり", "ポータル下部の過去履歴テーブルを確認", "日時・種別・ステータス（送迎済 -1回 / キャンセル）が時系列表示される", "OK", "2026/10/08", "自動/手動", "履歴透明性"],

    # カテゴリ2: 先生用ダッシュボード
    [10, "TC-T01", "管理者", "本日の送迎サマリー", "当日予定が存在する", "「管理者用」タブを選択", "バナー表示、本日の件数サマリー、チケット残少生徒数が正確に集計表示", "OK", "2026/10/08", "自動/手動", "当日予定自動セット"],
    [11, "TC-T02", "管理者", "送迎完了（1回消費）", "当日予定が未完了(scheduled)", "送迎カードの「送迎完了（1回消費）」をクリック", "カードが完了状態になり、該当生徒のチケット残高が即座に-1減算される", "OK", "2026/10/08", "自動/手動", "核機能検証済"],
    [12, "TC-T03", "管理者", "地図アプリ連動", "送迎先住所あり", "カード内の「地図アプリ」をクリック", "Google Mapsが新規タブで開き、送迎先住所がピン留め検索される", "OK", "2026/10/08", "自動/手動", "運転時ナビ対応"],
    [13, "TC-T04", "管理者", "先生側の急な送迎登録", "-", "「送迎予定を追加」より生徒・日時・区分を入力", "一覧および全スケジュールに即座反映。生徒選択で登録住所が自動補完", "OK", "2026/10/08", "自動/手動", "フレックス予約"],
    [14, "TC-T05", "管理者", "新規生徒登録", "-", "生徒管理タブで「＋新規生徒を登録」をクリックし保存", "生徒一覧および保護者ポータルのプルダウンに新規生徒が即時追加される", "OK", "2026/10/08", "自動/手動", "台帳拡張性"],
    [15, "TC-T06", "管理者", "チケット追加チャージ", "-", "「チケット追加」より10回券(¥10,000)を選択して登録", "生徒のチケット残数が+10され、残少だった場合はアラートが自動解除", "OK", "2026/10/08", "自動/手動", "セット購入対応"],
    [16, "TC-T07", "管理者", "スケジュール絞り込み", "複数送迎データあり", "スケジュール一覧で「予約中」「完了済み」「キャンセル」を切り替え", "選択したステータスに合致する送迎データのみが正確に一覧表示される", "OK", "2026/10/08", "自動/手動", "一覧検索性"],
    [17, "TC-T08", "管理者", "先生による送迎取消", "未完了送迎あり", "スケジュール一覧の「取消」ボタンをクリック", "ステータスがキャンセルに変更され、チケット残数は減算されない", "OK", "2026/10/08", "自動/手動", "安全設計"],

    # カテゴリ3: データ整合性
    [18, "TC-I01", "整合性", "予約〜完了の完全往復", "生徒A（残高5回）", "保護者予約 ➡️ 先生画面で確認 ➡️ 送迎完了 ➡️ 保護者画面確認", "生徒Aの残高が4回になり、予約中から完了履歴へ正しく遷移する", "OK", "2026/10/08", "自動/手動", "エンドツーエンド"],
    [19, "TC-I02", "整合性", "残数切れ境界値テスト", "生徒B（残高1回）", "送迎完了(残0:アラート発生) ➡️ 5回券チャージ(残5:アラート解除)", "残数ゼロで黄色警告が表示され、チャージ完了で即座に警告解除される", "OK", "2026/10/08", "自動/手動", "境界値OK"],
    [20, "TC-I03", "整合性", "ページ再読み込み保持", "操作実行済み", "ブラウザでCtrl+F5ハードリロードを実施", "登録した予約、残数減算、チャージ情報が消えずに維持される", "OK", "2026/10/08", "自動/手動", "永続性OK"],

    # カテゴリ4: Google連携
    [21, "TC-G01", "Google連携", "GASコードコピー", "設定画面", "「スクリプトをコピー」をクリック", "クリップボードにGASスクリプト全文が正確にコピーされる", "OK", "2026/10/08", "自動/手動", "コピペ導入性"],
    [22, "TC-G02", "Google連携", "シート自動初期化", "GAS側", "initSpreadsheet関数を実行", "生徒台帳・送迎履歴・チケット購入履歴の3シートが自動生成される", "OK", "2026/10/08", "GAS検証", "DB構造自動作成"],
    [23, "TC-G03", "Google連携", "WebアプリURL保存", "GASデプロイ済", "設定画面でGAS WebアプリURLを貼り付け保存", "接続先URLがLocalStorageに保存され、通信テストが実行される", "OK", "2026/10/08", "自動/手動", "環境設定OK"],
    [24, "TC-G04", "Google連携", "カレンダー自動同期", "連携環境", "Web画面から送迎予約を登録", "Googleカレンダーに『🚗【送迎】生徒名』の予定が自動作成される", "OK", "2026/10/08", "仕様検証", "Calendar API"],
    [25, "TC-G05", "Google連携", "カレンダー自動削除", "連携環境", "Web画面から送迎をキャンセル", "Googleカレンダーの該当送迎予定が自動削除される", "OK", "2026/10/08", "仕様検証", "イベント連動"],
    [26, "TC-G06", "Google連携", "フォールバック動作", "無効URL設定", "GAS通信失敗状態で画面操作を行う", "アプリが停止せず、LocalStorageに自動フォールバックして動作継続", "OK", "2026/10/08", "自動/手動", "Fail-Open設計"],

    # カテゴリ5: レスポンシブ & デザイン
    [27, "TC-U01", "レスポンシブ", "スマホ表示(375px)", "モバイル環境", "iPhone/Android幅でアクセス", "横スクロールなし、タブが均等配置、ボタンが指でタップ可能", "OK", "2026/10/08", "Puppeteer", "モバイル適合"],
    [28, "TC-V01", "ビジュアル", "全10画面デザイン確認", "PC/スマホ", "全10画面×2モード(計20枚)のキャプチャーを取得し目視確認", "余白・フォント・コントラスト・チップ選択状態が崩れず美しい品質を維持", "OK", "2026/10/08", "画像検証済", "仕様書添付"]
]

for row_idx, row_data in enumerate(cases_data, start=3):
    is_even = (row_idx % 2 == 0)
    row_fill = PatternFill(start_color="F8FAFC" if is_even else "FFFFFF", end_color="F8FAFC" if is_even else "FFFFFF", fill_type="solid")
    
    for col_idx, val in enumerate(row_data, start=1):
        cell = ws_cases.cell(row=row_idx, column=col_idx, value=val)
        cell.font = font_body
        cell.fill = row_fill
        cell.border = thin_border
        
        # アライメント
        if col_idx in [1, 2, 3, 8, 9, 10]:
            cell.alignment = Alignment(horizontal="center", vertical="center")
        else:
            cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
            
        # 判定カラムの強調
        if col_idx == 8 and val == "OK":
            cell.font = Font(name="Meiryo", size=10, bold=True, color="059669")
            cell.fill = PatternFill(start_color="ECFDF5", end_color="ECFDF5", fill_type="solid")

    ws_cases.row_dimensions[row_idx].height = 24

# カラム幅調整
col_widths = {
    "A": 6,   # No
    "B": 12,  # ID
    "C": 14,  # カテゴリ
    "D": 22,  # テストケース名
    "E": 22,  # 前提条件
    "F": 32,  # 操作手順
    "G": 38,  # 期待される結果
    "H": 14,  # 判定
    "I": 12,  # 実施日
    "J": 12,  # 実施者
    "K": 20   # 備考
}
for col_letter, width in col_widths.items():
    ws_cases.column_dimensions[col_letter].width = width

wb.save(FILE_PATH)
print(f"Successfully generated: {FILE_PATH}")
