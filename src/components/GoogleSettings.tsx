import React, { useState } from 'react';
import { ApiService } from '../services/api';
import { Check, Copy, RefreshCw, Database, Calendar, Shield, Trash2, AlertTriangle } from 'lucide-react';

const SAMPLE_GAS_CODE = `/**
 * 英語教室 送迎チケット管理 Google Apps Script (GAS)
 * 
 * 機能:
 * 1. スプレッドシート初期化 (initSpreadsheet)
 * 2. 生徒台帳の同期 (getStudents)
 * 3. 送迎予定の取得・日付時刻正規化 (getRides)
 * 4. 送迎予定の登録 ＆ Googleカレンダー自動作成 (createReservation)
 * 5. 送迎予約のキャンセル ＆ カレンダー予定の自動削除 (cancelReservation)
 * 6. 送迎完了 ＆ チケット残数消化 (completeRide)
 * 7. チケット購入・残数チャージ (addTickets)
 * 8. 新規生徒の追加登録 (createStudent)
 */

// 初回に一度だけ実行する初期化関数
function initSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. 生徒台帳シート
  let studentSheet = ss.getSheetByName("生徒台帳");
  if (!studentSheet) {
    studentSheet = ss.insertSheet("生徒台帳");
    studentSheet.appendRow(["生徒ID", "生徒氏名", "保護者名", "緊急連絡先", "送迎場所住所", "送迎時メモ", "残チケット数", "登録日"]);
    studentSheet.getRange("A1:H1").setBackground("#10b981").setFontColor("#ffffff").setFontWeight("bold");
    
    // サンプルデータ登録
    studentSheet.appendRow(["STU-001", "田中 陽菜 (ひな)", "田中 美咲", "090-1111-2222", "東京都世田谷区桜新町1-10-5 パークサイド201", "エントランス前。到着時LINE", 7, "2026-09-01"]);
    studentSheet.appendRow(["STU-002", "山本 颯太 (そうた)", "山本 健一", "080-3333-4444", "東京都世田谷区用賀2-5-12", "正面道路沿いで待機", 1, "2026-09-10"]);
    studentSheet.appendRow(["STU-003", "高橋 莉子 (りこ)", "高橋 智子", "090-5555-6666", "東京都世田谷区弦巻3-8-1", "玄関先までお越しください", 0, "2026-09-15"]);
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
    purchaseSheet.appendRow(["購入ID", "生徒ID", "生徒名", "購入日", "追加枚数", "金額", "備考"]);
    purchaseSheet.getRange("A1:G1").setBackground("#8b5cf6").setFontColor("#ffffff").setFontWeight("bold");
  }
}

// Web API (GET)
function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 生徒一覧取得
  if (action === "getStudents") {
    const sheet = ss.getSheetByName("生徒台帳");
    if (!sheet) return jsonResponse({ success: false, error: "生徒台帳シートがありません" });
    const data = sheet.getDataRange().getValues();
    const students = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        let createdDate = data[i][7];
        if (createdDate instanceof Date) {
          createdDate = Utilities.formatDate(createdDate, "JST", "yyyy-MM-dd");
        }
        students.push({
          id: String(data[i][0]),
          name: String(data[i][1]),
          parentName: String(data[i][2] || ""),
          phone: String(data[i][3] || ""),
          address: String(data[i][4] || ""),
          pickupNote: String(data[i][5] || ""),
          ticketBalance: Number(data[i][6]) || 0,
          createdAt: String(createdDate || "")
        });
      }
    }
    return jsonResponse({ success: true, data: students });
  }

  // 送迎予定一覧取得
  if (action === "getRides") {
    const rideSheet = ss.getSheetByName("送迎予定履歴");
    if (!rideSheet) return jsonResponse({ success: true, data: [] });
    const data = rideSheet.getDataRange().getValues();
    const rides = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        let rDate = data[i][3];
        if (rDate instanceof Date) {
          rDate = Utilities.formatDate(rDate, "JST", "yyyy-MM-dd");
        }
        let rTime = data[i][4];
        if (rTime instanceof Date) {
          rTime = Utilities.formatDate(rTime, "JST", "HH:mm");
        }
        rides.push({
          id: String(data[i][0]),
          studentId: String(data[i][1]),
          studentName: String(data[i][2]),
          rideDate: String(rDate),
          rideTime: String(rTime),
          rideType: String(data[i][5]),
          pickupLocation: String(data[i][6]),
          status: String(data[i][7]),
          calendarEventId: String(data[i][8] || ""),
          reservedBy: String(data[i][9]),
          note: String(data[i][10] || ""),
          completedAt: data[i][11] ? String(data[i][11]) : undefined
        });
      }
    }
    return jsonResponse({ success: true, data: rides });
  }

  return jsonResponse({ success: true, message: "Eigo Taxi Link API Ready" });
}

// Web API (POST)
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. 送迎予約の登録 ＆ Googleカレンダー自動作成
    if (action === "createReservation") {
      const cal = CalendarApp.getDefaultCalendar();
      const startTime = new Date(body.rideDate + "T" + body.rideTime + ":00");
      const endTime = new Date(startTime.getTime() + 30 * 60000); // 30分枠
      
      const typeLabel = body.rideType === "pickup" ? "お迎え" : (body.rideType === "dropoff" ? "送り" : "往復");
      const name = body.studentName || "生徒";
      const eventTitle = "🚗【送迎】" + name + " (" + typeLabel + ")";
      const eventDesc = "送迎場所: " + body.pickupLocation + "\\n連絡先/メモ: " + (body.note || "なし") + "\\n予約者: " + (body.reservedBy === "parent" ? "保護者予約" : "先生登録");
      
      const event = cal.createEvent(eventTitle, startTime, endTime, {
        description: eventDesc,
        location: body.pickupLocation
      });

      const rideSheet = ss.getSheetByName("送迎予定履歴");
      const rideId = body.rideId || ("RIDE-" + new Date().getTime());
      rideSheet.appendRow([
        rideId, body.studentId, name, body.rideDate, body.rideTime,
        body.rideType, body.pickupLocation, "scheduled", event.getId(), body.reservedBy, body.note || "", ""
      ]);

      return jsonResponse({
        success: true,
        data: {
          id: rideId,
          studentId: body.studentId,
          studentName: name,
          rideDate: body.rideDate,
          rideTime: body.rideTime,
          rideType: body.rideType,
          pickupLocation: body.pickupLocation,
          status: "scheduled",
          calendarEventId: event.getId(),
          reservedBy: body.reservedBy,
          note: body.note || ""
        }
      });
    }

    // 2. 送迎予約のキャンセル ＆ カレンダー予定の自動削除
    if (action === "cancelReservation") {
      const rideSheet = ss.getSheetByName("送迎予定履歴");
      const data = rideSheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        const idMatch = body.rideId && String(data[i][0]) === String(body.rideId);
        const detailMatch = body.rideDate && body.rideTime &&
          String(data[i][3]).indexOf(body.rideDate) !== -1 &&
          String(data[i][4]).indexOf(body.rideTime) !== -1;

        if (idMatch || detailMatch) {
          const calId = data[i][8];
          if (calId) {
            try {
              const event = CalendarApp.getDefaultCalendar().getEventById(calId);
              if (event) {
                event.deleteEvent();
              }
            } catch (err) {
              console.warn("カレンダーイベント削除スキップ: " + err);
            }
          }
          rideSheet.getRange(i + 1, 8).setValue("cancelled");
          return jsonResponse({ success: true });
        }
      }
      return jsonResponse({ success: false, error: "該当の送迎IDが見つかりません" });
    }

    // 3. 送迎完了 ＆ チケット消化
    if (action === "completeRide") {
      const rideSheet = ss.getSheetByName("送迎予定履歴");
      const studentSheet = ss.getSheetByName("生徒台帳");
      const rides = rideSheet.getDataRange().getValues();
      const students = studentSheet.getDataRange().getValues();

      let targetStudentId = "";
      let rideType = "";
      for (let i = 1; i < rides.length; i++) {
        if (String(rides[i][0]) === String(body.rideId)) {
          targetStudentId = String(rides[i][1]);
          rideType = String(rides[i][5]);
          rideSheet.getRange(i + 1, 8).setValue("completed");
          rideSheet.getRange(i + 1, 12).setValue(Utilities.formatDate(new Date(), "JST", "yyyy/MM/dd HH:mm:ss"));
          break;
        }
      }

      if (!targetStudentId) return jsonResponse({ success: false, error: "送迎が見つかりません" });

      // 生徒台帳の残チケット数をマイナス（往復の場合はデフォルト2枚、片道は1枚）
      const defaultConsume = rideType === "roundtrip" ? 2 : 1;
      const consumeCount = Number(body.consumeTickets) || defaultConsume;
      let newBalance = 0;
      for (let j = 1; j < students.length; j++) {
        if (String(students[j][0]) === targetStudentId) {
          const currentBal = Number(students[j][6]) || 0;
          newBalance = Math.max(0, currentBal - consumeCount);
          studentSheet.getRange(j + 1, 7).setValue(newBalance);
          break;
        }
      }

      return jsonResponse({ success: true, remainingBalance: newBalance, consumedTickets: consumeCount });
    }

    // 4. チケット追加（購入）
    if (action === "addTickets") {
      const studentSheet = ss.getSheetByName("生徒台帳");
      const purchaseSheet = ss.getSheetByName("チケット購入履歴");
      const students = studentSheet.getDataRange().getValues();

      let targetName = body.studentName || "";
      let newBalance = 0;
      for (let i = 1; i < students.length; i++) {
        if (String(students[i][0]) === String(body.studentId)) {
          targetName = String(students[i][1]);
          const currentBal = Number(students[i][6]) || 0;
          newBalance = currentBal + Number(body.ticketCount);
          studentSheet.getRange(i + 1, 7).setValue(newBalance);
          break;
        }
      }

      // 購入履歴記録
      const purId = body.purchaseId || ("PUR-" + new Date().getTime());
      const today = Utilities.formatDate(new Date(), "JST", "yyyy-MM-dd");
      purchaseSheet.appendRow([
        purId, body.studentId, targetName, today,
        Number(body.ticketCount), Number(body.amount), body.note || ""
      ]);

      return jsonResponse({ success: true, newBalance: newBalance });
    }

    // 5. 新規生徒の追加
    if (action === "createStudent") {
      const studentSheet = ss.getSheetByName("生徒台帳");
      const data = studentSheet.getDataRange().getValues();
      const newId = body.id || ("STU-" + String(data.length).padStart(3, "0"));
      const today = Utilities.formatDate(new Date(), "JST", "yyyy-MM-dd");
      studentSheet.appendRow([
        newId, body.name, body.parentName || "", body.phone || "",
        body.address, body.pickupNote || "", Number(body.ticketBalance) || 0, today
      ]);

      return jsonResponse({
        success: true,
        data: {
          id: newId,
          name: body.name,
          parentName: body.parentName || "",
          phone: body.phone || "",
          address: body.address,
          pickupNote: body.pickupNote || "",
          ticketBalance: Number(body.ticketBalance) || 0,
          createdAt: today
        }
      });
    }

    return jsonResponse({ success: false, error: "不明なアクションです" });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

export const GoogleSettings: React.FC = () => {
  const [apiUrl, setApiUrl] = useState(() => ApiService.getGasApiUrl());
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
    if (window.confirm('モックデータを初期状態（デモ生徒3名）にリセットしますか？')) {
      ApiService.resetToMock();
      window.location.reload();
    }
  };

  const handlePurge = () => {
    if (window.confirm('【本番開始前クレンジング】\nすべてのデモデータ（生徒・送迎履歴・チケット購入履歴）を完全に消去して空にしますか？\n※本番の生徒データを新規登録する前に実行してください。')) {
      ApiService.purgeAllData();
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

      {/* データ管理 & リセット */}
      <div className="bg-slate-100 rounded-2xl p-5 border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-slate-700">デモデータの初期化</p>
            <p className="text-[11px] text-slate-500">
              送迎完了やチケット追加のテスト内容をリセットして初期デモ状態（生徒3名）に戻します。
            </p>
          </div>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-300 px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            モック初期化
          </button>
        </div>

        <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              本番開始用：デモデータの完全消去（パージ）
            </p>
            <p className="text-[11px] text-slate-500">
              すべての生徒データ・予約履歴を空にし、本番の生徒データを新規登録できるクリーンな状態にします。
            </p>
          </div>
          <button
            onClick={handlePurge}
            className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 bg-white border border-rose-200 px-3 py-1.5 rounded-xl font-bold transition-colors shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            全データ消去
          </button>
        </div>
      </div>
    </div>
  );
};
