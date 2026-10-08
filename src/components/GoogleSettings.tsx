import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { Check, Copy, RefreshCw, Database, Calendar, Shield } from 'lucide-react';

const SAMPLE_GAS_CODE = `/**
 * 英語教室 送迎チケット管理 Google Apps Script (GAS)
 * スプレッドシート & Googleカレンダー連携コード
 */

// スプレッドシート初期化関数（初回に実行）
function initSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. 生徒台帳シート
  let studentSheet = ss.getSheetByName("生徒台帳");
  if (!studentSheet) {
    studentSheet = ss.insertSheet("生徒台帳");
    studentSheet.appendRow(["生徒ID", "生徒氏名", "保護者名", "連絡先", "送迎先住所", "送迎メモ", "残チケット", "登録日"]);
    studentSheet.getRange("A1:H1").setBackground("#10b981").setFontColor("#ffffff").setFontWeight("bold");
    // サンプルデータ
    studentSheet.appendRow(["STU-001", "田中 陽菜", "田中 美咲", "090-1111-2222", "東京都世田谷区桜新町1-10-5", "エントランス前", 7, "2026-09-01"]);
    studentSheet.appendRow(["STU-002", "山本 颯太", "山本 健一", "080-3333-4444", "東京都世田谷区用賀2-5-12", "道路沿いで待機", 1, "2026-09-10"]);
  }

  // 2. 送迎予定・履歴シート
  let rideSheet = ss.getSheetByName("送迎予定履歴");
  if (!rideSheet) {
    rideSheet = ss.insertSheet("送迎予定履歴");
    rideSheet.appendRow(["送迎ID", "生徒ID", "生徒名", "送迎日", "送迎時間", "区分", "送迎場所", "ステータス", "カレンダーイベントID", "予約者", "備考", "完了日時"]);
    rideSheet.getRange("A1:L1").setBackground("#0284c7").setFontColor("#ffffff").setFontWeight("bold");
  }

  // 3. チケット購入履歴シート
  let purchaseSheet = ss.getSheetByName("チケット購入履歴");
  if (!purchaseSheet) {
    purchaseSheet = ss.insertSheet("チケット購入履歴");
    purchaseSheet.appendRow(["購入ID", "生徒ID", "生徒名", "購入日", "枚数", "金額", "備考"]);
    purchaseSheet.getRange("A1:G1").setBackground("#8b5cf6").setFontColor("#ffffff").setFontWeight("bold");
  }
}

// Web API (GET)
function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === "getStudents") {
    const sheet = ss.getSheetByName("生徒台帳");
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const students = data.slice(1).map(row => ({
      id: row[0],
      name: row[1],
      parentName: row[2],
      phone: row[3],
      address: row[4],
      pickupNote: row[5],
      ticketBalance: Number(row[6]),
      createdAt: row[7]
    }));
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: students }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Eigo Taxi API Ready" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Web API (POST) - 予約追加・キャンセル・送迎完了
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "createReservation") {
      // 1. Googleカレンダーへ予定を作成
      const cal = CalendarApp.getDefaultCalendar();
      const startTime = new Date(body.rideDate + "T" + body.rideTime + ":00");
      const endTime = new Date(startTime.getTime() + 30 * 60000); // 30分枠
      
      const typeLabel = body.rideType === "pickup" ? "行き" : (body.rideType === "dropoff" ? "帰り" : "送迎");
      const name = body.studentName || "生徒";
      const eventTitle = "🚗【送迎】" + name + " (" + typeLabel + ")";
      const eventDesc = "送迎場所: " + body.pickupLocation + "\\nメモ: " + (body.note || "なし");
      const event = cal.createEvent(eventTitle, startTime, endTime, {
        description: eventDesc,
        location: body.pickupLocation
      });

      // 2. スプレッドシートへ行追加
      const rideSheet = ss.getSheetByName("送迎予定履歴");
      const rideId = "RIDE-" + new Date().getTime();
      rideSheet.appendRow([
        rideId, body.studentId, body.studentName, body.rideDate, body.rideTime,
        body.rideType, body.pickupLocation, "scheduled", event.getId(), body.reservedBy, body.note || "", ""
      ]);

      return ContentService.createTextOutput(JSON.stringify({ success: true, data: { id: rideId, calendarEventId: event.getId() } }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "cancelReservation") {
      // カレンダーイベントの削除
      const rideSheet = ss.getSheetByName("送迎予定履歴");
      const data = rideSheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === body.rideId) {
          const calId = data[i][8];
          if (calId) {
            try {
              CalendarApp.getDefaultCalendar().getEventById(calId).deleteEvent();
            } catch (err) {}
          }
          rideSheet.getRange(i + 1, 8).setValue("cancelled");
          break;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Unknown action" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;

export const GoogleSettings: React.FC = () => {
  const [apiUrl, setApiUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setApiUrl(ApiService.getGasApiUrl());
  }, []);

  const handleSaveUrl = () => {
    ApiService.setGasApiUrl(apiUrl);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(SAMPLE_GAS_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('モックデータを初期状態にリセットしますか？')) {
      ApiService.resetToMock();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 連携の概要 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-600" />
          Google スプレッドシート ＆ カレンダー連携の仕組み
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          本アプリは、Google Apps Script (GAS)
          をWebエンドポイントとして利用することで、外部サーバー代ゼロ（完全無料）でGoogleスプレッドシートおよびGoogleカレンダーとリアルタイムに同期します。
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-start gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Google スプレッドシート</p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                生徒台帳・チケット残数・送迎予約と履歴を保存するデータベースとして稼働します。
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-start gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Google カレンダー</p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                予約登録時に自動で予定を作成。保護者がキャンセルした場合は自動でカレンダーから削除されます。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* GAS URL設定フォーム */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          Google Apps Script (GAS) WebアプリURLの設定
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          GASを「ウェブアプリとしてデプロイ」したURLを入力すると、実物のGoogleスプレッドシート・カレンダーと直接通信します（未入力の場合はブラウザ内の即時モックで動作します）。
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/AKfycb.../exec"
            className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleSaveUrl}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
          >
            設定を保存
          </button>
        </div>

        {saveSuccess && (
          <p className="text-xs text-emerald-600 font-bold mt-2">✅ API接続先を更新しました</p>
        )}
      </div>

      {/* 簡単導入手順 & GASコード */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800">初期セットアップ用 GAS コード (Code.gs)</h3>
          <button
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'コピー完了！' : 'スクリプトをコピー'}
          </button>
        </div>

        <ol className="text-xs text-slate-600 space-y-1.5 mb-4 list-decimal list-inside bg-slate-50 p-3.5 rounded-xl border border-slate-100">
          <li>新規のGoogleスプレッドシートを作成し、メニューの「拡張機能」→「Apps Script」を開きます。</li>
          <li>以下のコードを貼り付けて保存します。</li>
          <li>関数一覧から <code className="bg-slate-200 px-1 py-0.5 rounded font-bold text-slate-800">initSpreadsheet</code> を選択して実行すると、必要なシートが全自動で作成されます。</li>
          <li>右上の「デプロイ」→「新しいデプロイ」→「ウェブアプリ」を選択（アクセス権: 全員）して発行されたURLを上記に貼り付ければ連携完了です。</li>
        </ol>

        <div className="relative">
          <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-[11px] overflow-x-auto font-mono max-h-72">
            {SAMPLE_GAS_CODE}
          </pre>
        </div>
      </div>

      {/* デモ用リセット */}
      <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-700">デモデータの初期化</p>
          <p className="text-[11px] text-slate-500">
            送迎完了やチケット追加のテスト内容をリセットして初期状態に戻します。
          </p>
        </div>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-300 px-3 py-1.5 rounded-xl font-medium transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          モック初期化
        </button>
      </div>
    </div>
  );
};
