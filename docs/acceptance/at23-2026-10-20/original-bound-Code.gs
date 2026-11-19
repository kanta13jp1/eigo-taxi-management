/**
 * 英語教室 送迎チケット管理 Google Apps Script (GAS)
 * 完全双方向同期 & カレンダー連携コード
 */

function initSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let studentSheet = ss.getSheetByName("生徒台帳");
  if (!studentSheet) {
    studentSheet = ss.insertSheet("生徒台帳");
    studentSheet.appendRow(["生徒ID", "生徒氏名", "保護者名", "連絡先", "送迎先住所", "送迎メモ", "残チケット", "登録日"]);
    studentSheet.getRange("A1:H1").setBackground("#10b981").setFontColor("#ffffff").setFontWeight("bold");
    studentSheet.appendRow(["STU-001", "田中 陽菜", "田中 美咲", "090-1111-2222", "東京都世田谷区桜新町1-10-5 パークサイド201", "レッスン前のお迎え", 8, "2026-10-01"]);
    studentSheet.appendRow(["STU-002", "山本 颯太", "山本 健一", "080-3333-4444", "東京都世田谷区用賀2-5-12", "レッスン後のご自宅送り", 2, "2026-10-02"]);
  }

  let rideSheet = ss.getSheetByName("送迎予定履歴");
  if (!rideSheet) {
    rideSheet = ss.insertSheet("送迎予定履歴");
    rideSheet.appendRow(["送迎ID", "生徒ID", "生徒名", "送迎日", "送迎時間", "区分", "送迎場所", "ステータス", "カレンダーイベントID", "予約者", "備考", "完了日時"]);
    rideSheet.getRange("A1:L1").setBackground("#0284c7").setFontColor("#ffffff").setFontWeight("bold");
  }

  let ticketSheet = ss.getSheetByName("チケット購入履歴");
  if (!ticketSheet) {
    ticketSheet = ss.insertSheet("チケット購入履歴");
    ticketSheet.appendRow(["購入ID", "生徒ID", "生徒名", "購入日", "枚数", "金額", "備考"]);
    ticketSheet.getRange("A1:G1").setBackground("#8b5cf6").setFontColor("#ffffff").setFontWeight("bold");
  }
}

function doGet(e) {
  const action = e ? e.parameter.action : "";
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === "getStudents") {
    const sheet = ss.getSheetByName("生徒台帳");
    if (!sheet) return ContentService.createTextOutput(JSON.stringify({ success: true, data: [] })).setMimeType(ContentService.MimeType.JSON);
    const data = sheet.getDataRange().getValues();
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
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: students })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "getRides") {
    const rideSheet = ss.getSheetByName("送迎予定履歴");
    if (!rideSheet) return ContentService.createTextOutput(JSON.stringify({ success: true, data: [] })).setMimeType(ContentService.MimeType.JSON);
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
          calendarEventId: String(data[i][8]),
          reservedBy: String(data[i][9]),
          note: String(data[i][10] || ""),
          completedAt: data[i][11] ? String(data[i][11]) : undefined
        });
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: rides })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Eigo Taxi API Ready" })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "createReservation") {
      const cal = CalendarApp.getDefaultCalendar();
      const startTime = new Date(body.rideDate + "T" + body.rideTime + ":00");
      const endTime = new Date(startTime.getTime() + 30 * 60000);
      
      const typeLabel = body.rideType === "pickup" ? "行き" : (body.rideType === "dropoff" ? "帰り" : "送迎");
      const name = body.studentName || "生徒";
      const eventTitle = "🚗【送迎】" + name + " (" + typeLabel + ")";
      const eventDesc = "送迎場所: " + body.pickupLocation + "\nメモ: " + (body.note || "なし");
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

      return ContentService.createTextOutput(JSON.stringify({ success: true, data: { id: rideId, calendarEventId: event.getId() } })).setMimeType(ContentService.MimeType.JSON);
    }

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
            } catch (err) {}
          }
          rideSheet.getRange(i + 1, 8).setValue("cancelled");
          break;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Unknown action" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}