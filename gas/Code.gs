/**
 * 英語教室 送迎チケット管理 Google Apps Script (GAS)
 * 
 * 機能:
 * 1. スプレッドシート初期化 (initSpreadsheet)
 * 2. 生徒台帳の同期 (getStudents)
 * 3. 送迎予定の登録 ＆ Googleカレンダー自動作成 (createReservation)
 * 4. 送迎予約のキャンセル ＆ カレンダー予定の自動削除 (cancelReservation)
 * 5. 送迎完了 ＆ チケット残数マイナス1消化 (completeRide)
 * 6. チケット購入・残数チャージ (addTickets)
 * 7. 新規生徒の追加登録 (createStudent)
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
    const students = data.slice(1).map(row => ({
      id: String(row[0]),
      name: String(row[1]),
      parentName: String(row[2]),
      phone: String(row[3]),
      address: String(row[4]),
      pickupNote: String(row[5]),
      ticketBalance: Number(row[6]) || 0,
      createdAt: String(row[7])
    }));
    return jsonResponse({ success: true, data: students });
  }

  // 送迎予定一覧取得
  if (action === "getRides") {
    const sheet = ss.getSheetByName("送迎予定履歴");
    if (!sheet) return jsonResponse({ success: false, error: "送迎予定履歴シートがありません" });
    const data = sheet.getDataRange().getValues();
    const rides = data.slice(1).map(row => ({
      id: String(row[0]),
      studentId: String(row[1]),
      studentName: String(row[2]),
      rideDate: String(row[3]),
      rideTime: String(row[4]),
      rideType: String(row[5]),
      pickupLocation: String(row[6]),
      status: String(row[7]),
      calendarEventId: String(row[8]),
      reservedBy: String(row[9]),
      note: String(row[10]),
      completedAt: String(row[11])
    }));
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
      
      const eventTitle = "【送迎】" + body.studentName + " (" + (body.rideType === 'pickup' ? 'お迎え' : body.rideType === 'dropoff' ? '送り' : '往復') + ")";
      const eventDesc = "送迎場所: " + body.pickupLocation + "\n連絡先/メモ: " + (body.note || "なし") + "\n予約者: " + (body.reservedBy === 'parent' ? '保護者予約' : '先生登録');
      
      const event = cal.createEvent(eventTitle, startTime, endTime, {
        description: eventDesc,
        location: body.pickupLocation
      });

      const rideSheet = ss.getSheetByName("送迎予定履歴");
      const rideId = "RIDE-" + new Date().getTime();
      rideSheet.appendRow([
        rideId, body.studentId, body.studentName, body.rideDate, body.rideTime,
        body.rideType, body.pickupLocation, "scheduled", event.getId(), body.reservedBy, body.note || "", ""
      ]);

      return jsonResponse({
        success: true,
        data: {
          id: rideId,
          studentId: body.studentId,
          studentName: body.studentName,
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
        if (String(data[i][0]) === String(body.rideId)) {
          const calId = data[i][8];
          if (calId) {
            try {
              CalendarApp.getDefaultCalendar().getEventById(calId).deleteEvent();
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

    // 3. 送迎完了 ＆ チケット1回分消化
    if (action === "completeRide") {
      const rideSheet = ss.getSheetByName("送迎予定履歴");
      const studentSheet = ss.getSheetByName("生徒台帳");
      const rides = rideSheet.getDataRange().getValues();
      const students = studentSheet.getDataRange().getValues();

      let targetStudentId = "";
      for (let i = 1; i < rides.length; i++) {
        if (String(rides[i][0]) === String(body.rideId)) {
          targetStudentId = String(rides[i][1]);
          rideSheet.getRange(i + 1, 8).setValue("completed");
          rideSheet.getRange(i + 1, 12).setValue(new Date().toLocaleString("ja-JP"));
          break;
        }
      }

      if (!targetStudentId) return jsonResponse({ success: false, error: "送迎が見つかりません" });

      // 生徒台帳の残チケット数をマイナス
      const consumeCount = Number(body.consumeTickets) || 1;
      let newBalance = 0;
      for (let j = 1; j < students.length; j++) {
        if (String(students[j][0]) === targetStudentId) {
          const currentBal = Number(students[j][6]) || 0;
          newBalance = Math.max(0, currentBal - consumeCount);
          studentSheet.getRange(j + 1, 7).setValue(newBalance);
          break;
        }
      }

      return jsonResponse({ success: true, remainingBalance: newBalance });
    }

    // 4. チケット追加（購入）
    if (action === "addTickets") {
      const studentSheet = ss.getSheetByName("生徒台帳");
      const purchaseSheet = ss.getSheetByName("チケット購入履歴");
      const students = studentSheet.getDataRange().getValues();

      let targetName = "";
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
      const purId = "PUR-" + new Date().getTime();
      purchaseSheet.appendRow([
        purId, body.studentId, targetName, new Date().toISOString().split("T")[0],
        Number(body.ticketCount), Number(body.amount), body.note || ""
      ]);

      return jsonResponse({ success: true, newBalance: newBalance });
    }

    // 5. 新規生徒の追加
    if (action === "createStudent") {
      const studentSheet = ss.getSheetByName("生徒台帳");
      const data = studentSheet.getDataRange().getValues();
      const newId = "STU-" + String(data.length).padStart(3, "0");
      const today = new Date().toISOString().split("T")[0];
      studentSheet.appendRow([
        newId, body.name, body.parentName || "", body.phone || "",
        body.address, body.pickupNote || "", Number(body.ticketBalance) || 0, today
      ]);

      return jsonResponse({
        success: true,
        data: {
          id: newId,
          name: body.name,
          parentName: body.parentName,
          phone: body.phone,
          address: body.address,
          pickupNote: body.pickupNote,
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
