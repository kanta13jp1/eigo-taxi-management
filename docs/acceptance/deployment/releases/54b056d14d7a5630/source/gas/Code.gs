/**
 * 英語教室 送迎チケット管理 API
 * Data API: POST JSON { action, token, ...parameters }. GET is health only.
 * Configure AUTH_USERS_JSON in Script Properties; see docs/GAS_AUTH_SETUP.md.
 * This source is authoritative. Existing sheet columns remain 8 / 12 / 7.
 */
const STUDENTS_ = "生徒台帳";
const RIDES_ = "送迎予定履歴";
const PURCHASES_ = "チケット購入履歴";
const PENDING_ = "PENDING_MUTATION_JSON";

// Run manually from the script editor only. Never exposed through doPost.
// Re-running keeps existing sheets/data and never creates demonstration students.
function initSpreadsheet() {
  return withLock_(function () {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    [
      [STUDENTS_, ["生徒ID", "生徒氏名", "保護者名", "緊急連絡先", "送迎場所住所", "送迎時メモ", "残チケット数", "登録日"]],
      [RIDES_, ["送迎ID", "生徒ID", "生徒名", "送迎日", "送迎時間", "区分", "送迎場所", "ステータス", "カレンダーイベントID", "予約者", "備考", "完了日時"]],
      [PURCHASES_, ["購入ID", "生徒ID", "生徒名", "購入日", "追加枚数", "金額", "備考"]]
    ].forEach(function (schema) {
      if (!ss.getSheetByName(schema[0])) ss.insertSheet(schema[0]).appendRow(schema[1]);
    });
    SpreadsheetApp.flush();
  });
}

function doGet() {
  return jsonResponse({ success: true, message: "Eigo Taxi Link API Ready" });
}

function doPost(e) {
  try {
    let body;
    try { body = JSON.parse(e.postData.contents); } catch (_) {
      fail_("INVALID_REQUEST", "JSON形式のリクエストが必要です");
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) fail_("INVALID_REQUEST", "リクエスト形式が不正です");
    const user = authenticate_(body.token);
    if (body.action === "login") return jsonResponse({ success: true, data: user });
    const handlers = {
      getStudents: getStudents_, getRides: getRides_, createStudent: createStudent_,
      createReservation: createReservation_, cancelReservation: cancelReservation_,
      completeRide: completeRide_, addTickets: addTickets_
    };
    if (!Object.prototype.hasOwnProperty.call(handlers, body.action)) fail_("UNKNOWN_ACTION", "不明なアクションです");
    const result = withLock_(function () { return handlers[body.action](body, user); });
    return jsonResponse(result);
  } catch (err) {
    // Do not expose service exceptions, credentials, sheet IDs or other families' data.
    return jsonResponse({ success: false, code: err.apiCode || "SERVICE_ERROR", error: err.apiCode ? err.message : "処理を確認できませんでした。時間をおいて再試行してください" });
  }
}

function authenticate_(token) {
  if (typeof token !== "string" || token.length < 32 || token.length > 256) fail_("UNAUTHORIZED", "アクセスキーを確認してください");
  let users;
  try { users = JSON.parse(PropertiesService.getScriptProperties().getProperty("AUTH_USERS_JSON")); } catch (_) {
    fail_("AUTH_NOT_CONFIGURED", "認証設定を管理者に確認してください");
  }
  if (!users || typeof users !== "object" || Array.isArray(users) || !Object.keys(users).length) fail_("AUTH_NOT_CONFIGURED", "認証設定を管理者に確認してください");
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, token, Utilities.Charset.UTF_8)
    .map(function (b) { return (b & 255).toString(16).padStart(2, "0"); }).join("");
  if (!Object.prototype.hasOwnProperty.call(users, digest)) fail_("UNAUTHORIZED", "アクセスキーを確認してください");
  const user = users[digest];
  if (!user || typeof user.id !== "string" || !user.id || typeof user.name !== "string" || !user.name ||
      (user.role !== "admin" && user.role !== "parent") || !Array.isArray(user.studentIds) ||
      user.studentIds.some(function (id) { return typeof id !== "string" || !id; })) {
    fail_("AUTH_NOT_CONFIGURED", "認証設定を管理者に確認してください");
  }
  return { id: user.id, name: user.name, role: user.role, studentIds: user.studentIds.slice() };
}

function withLock_(work) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) fail_("BUSY", "別の処理が実行中です。同じ操作を再試行してください");
  try {
    if (PropertiesService.getScriptProperties().getProperty(PENDING_)) {
      fail_("RECONCILIATION_REQUIRED", "前回処理の結果を管理者が確認する必要があります");
    }
    return work();
  } finally { lock.releaseLock(); }
}

// Write-ahead guard survives timeout/process termination. Compensation is best effort;
// an uncertain Calendar result or failed compensation leaves the guard in place.
// A script lock cannot make Sheets + Calendar + Properties one atomic transaction.
function mutate_(action, key, work) {
  const props = PropertiesService.getScriptProperties();
  const record = { action: action, key: key, startedAt: new Date().toISOString() };
  props.setProperty(PENDING_, JSON.stringify(record));
  const tx = { undo: [], uncertain: false };
  try {
    const result = work(tx);
    SpreadsheetApp.flush();
    props.deleteProperty(PENDING_);
    return result;
  } catch (_) {
    let recovered = !tx.uncertain;
    for (let i = tx.undo.length - 1; i >= 0; i--) {
      try { tx.undo[i](); } catch (_) { recovered = false; }
    }
    try { SpreadsheetApp.flush(); } catch (_) { recovered = false; }
    if (recovered) {
      try { props.deleteProperty(PENDING_); } catch (_) { recovered = false; }
    }
    if (!recovered) {
      // deleteProperty may itself have applied before throwing. Re-establish the
      // guard when possible; a Properties outage still requires operator review.
      try { props.setProperty(PENDING_, JSON.stringify(record)); } catch (_) { /* preserve failure response */ }
    }
    fail_(recovered ? "OPERATION_FAILED" : "RECONCILIATION_REQUIRED", recovered ?
      "保存できませんでした。変更を取り消しました。同じ操作を再試行してください" :
      "処理結果を確認できませんでした。管理者による照合が必要です");
  }
}

function getStudents_(body, user) {
  return { success: true, data: rows_(sheet_(STUDENTS_)).filter(function (r) { return canAccess_(user, String(r[0])); }).map(student_) };
}

function getRides_(body, user) {
  return { success: true, data: rows_(sheet_(RIDES_)).filter(function (r) { return canAccess_(user, String(r[1])); }).map(ride_) };
}

function createStudent_(body, user) {
  requireAdmin_(user);
  const id = id_(body.id === undefined ? "STU-" + Utilities.getUuid() : body.id, "生徒ID");
  const row = [id, text_(body.name, "生徒名", true), text_(body.parentName, "保護者名"), text_(body.phone, "電話番号"),
    text_(body.address, "住所", true), text_(body.pickupNote, "送迎メモ"), integer_(body.ticketBalance === undefined ? 0 : body.ticketBalance, "残チケット数", 0), today_()];
  const sheet = sheet_(STUDENTS_);
  const existing = find_(sheet, id);
  if (existing) {
    if (row.slice(1, 7).some(function (v, i) { return existing.values[i + 1] !== v; })) fail_("ID_CONFLICT", "同じ生徒IDで異なる内容が登録されています");
    return { success: true, replayed: true, data: student_(existing.values) };
  }
  return mutate_("createStudent", id, function (tx) {
    append_(tx, sheet, row);
    return { success: true, data: student_(row) };
  });
}

function createReservation_(body, user) {
  const id = id_(body.rideId, "送迎ID");
  const studentId = id_(body.studentId, "生徒ID");
  requireAccess_(user, studentId);
  const student = required_(sheet_(STUDENTS_), studentId, "生徒");
  const date = text_(body.rideDate, "送迎日", true);
  const time = text_(body.rideTime, "送迎時間", true);
  const start = rideDate_(date, time);
  const type = rideType_(body.rideType);
  const location = text_(body.pickupLocation, "送迎場所", true);
  const note = text_(body.note, "備考");
  const sheet = sheet_(RIDES_);
  const existing = find_(sheet, id);
  if (existing) {
    requireAccess_(user, String(existing.values[1]));
    const old = ride_(existing.values);
    if (old.studentId !== studentId || old.rideDate !== date || old.rideTime !== time || old.rideType !== type || old.pickupLocation !== location || old.note !== note) {
      fail_("ID_CONFLICT", "同じ送迎IDで異なる予約が登録されています");
    }
    return { success: true, replayed: true, data: old };
  }
  return mutate_("createReservation", id, function (tx) {
    const cal = CalendarApp.getDefaultCalendar();
    const name = String(student.values[1]);
    const reservedBy = user.role === "parent" ? "parent" : "teacher";
    const label = type === "pickup" ? "お迎え" : (type === "dropoff" ? "送り" : "往復");
    // A thrown createEvent may have succeeded remotely: preserve guard if no ID returned.
    tx.uncertain = true;
    const event = cal.createEvent("🚗【送迎】" + name + " (" + label + ")", start, new Date(start.getTime() + 30 * 60000), {
      description: "送迎場所: " + location + "\n連絡先/メモ: " + (note || "なし") + "\n予約者: " + (reservedBy === "parent" ? "保護者予約" : "先生登録"),
      location: location
    });
    tx.undo.push(function () { event.deleteEvent(); });
    tx.uncertain = false;
    const eventId = event.getId();
    if (!eventId) throw new Error("Missing calendar event ID");
    const row = [id, studentId, name, date, time, type, location, "scheduled", eventId, reservedBy, note, ""];
    append_(tx, sheet, row);
    return { success: true, data: ride_(row) };
  });
}

function cancelReservation_(body, user) {
  const id = id_(body.rideId, "送迎ID");
  const sheet = sheet_(RIDES_);
  const target = required_(sheet, id, "送迎");
  requireAccess_(user, String(target.values[1]));
  const status = String(target.values[7]);
  if (status === "cancelled") return { success: true, replayed: true };
  if (status !== "scheduled") fail_("INVALID_STATE", "予約中の送迎だけキャンセルできます");
  const eventId = String(target.values[8] || "");
  // Only the server's stored event ID is used; no date/time fallback or supplied ID.
  const event = eventId ? CalendarApp.getDefaultCalendar().getEventById(eventId) : null;
  return mutate_("cancelReservation", id, function (tx) {
    replace_(tx, sheet, target.row, 8, "cancelled", target.values[7]);
    SpreadsheetApp.flush();
    if (event) {
      // Deletion cannot be reversed with the same event ID. Retain the guard if an
      // exception/timeout occurs during or after deletion, even after sheet rollback.
      tx.uncertain = true;
      event.deleteEvent();
    }
    return { success: true };
  });
}

function completeRide_(body, user) {
  requireAdmin_(user);
  const id = id_(body.rideId, "送迎ID");
  const rideSheet = sheet_(RIDES_);
  const target = required_(rideSheet, id, "送迎");
  const consume = rideType_(target.values[5]) === "roundtrip" ? 2 : 1;
  if (body.consumeTickets !== undefined && integer_(body.consumeTickets, "消化枚数", 1) !== consume) fail_("INVALID_INPUT", "消化枚数は登録された送迎区分から決まります");
  const studentSheet = sheet_(STUDENTS_);
  const student = required_(studentSheet, String(target.values[1]), "生徒");
  const balance = integer_(student.values[6], "保存された残チケット数", 0);
  const status = String(target.values[7]);
  if (status === "completed") return { success: true, replayed: true, remainingBalance: balance, consumedTickets: 0 };
  if (status !== "scheduled") fail_("INVALID_STATE", "予約中の送迎だけ完了できます");
  if (balance < consume) fail_("INSUFFICIENT_TICKETS", "チケットが不足しています。追加後に完了してください");
  return mutate_("completeRide", id, function (tx) {
    replace_(tx, studentSheet, student.row, 7, balance - consume, balance);
    replace_(tx, rideSheet, target.row, 8, "completed", target.values[7]);
    replace_(tx, rideSheet, target.row, 12, Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy/MM/dd HH:mm:ss"), target.values[11] || "");
    return { success: true, remainingBalance: balance - consume, consumedTickets: consume };
  });
}

function addTickets_(body, user) {
  requireAdmin_(user);
  const id = id_(body.purchaseId, "購入ID");
  const studentId = id_(body.studentId, "生徒ID");
  const count = integer_(body.ticketCount, "追加枚数", 1);
  if (count > 100) fail_("INVALID_INPUT", "追加枚数は1〜100枚で入力してください");
  const amount = integer_(body.amount, "金額", 0);
  const note = text_(body.note, "備考");
  const studentSheet = sheet_(STUDENTS_);
  const purchaseSheet = sheet_(PURCHASES_);
  const student = required_(studentSheet, studentId, "生徒");
  const balance = integer_(student.values[6], "保存された残チケット数", 0);
  const existing = find_(purchaseSheet, id);
  if (existing) {
    if (String(existing.values[1]) !== studentId || existing.values[4] !== count || existing.values[5] !== amount || String(existing.values[6] || "") !== note) fail_("ID_CONFLICT", "同じ購入IDで異なる購入が登録されています");
    return { success: true, replayed: true, newBalance: balance };
  }
  const nextBalance = integer_(balance + count, "追加後の残チケット数", 0);
  return mutate_("addTickets", id, function (tx) {
    append_(tx, purchaseSheet, [id, studentId, String(student.values[1]), today_(), count, amount, note]);
    replace_(tx, studentSheet, student.row, 7, nextBalance, balance);
    return { success: true, newBalance: nextBalance };
  });
}

function append_(tx, sheet, values) {
  // Undo is registered before the write: a service can throw after applying a write.
  const row = sheet.getLastRow() + 1;
  tx.undo.push(function () {
    const current = sheet.getRange(row, 1, 1, values.length).getValues()[0];
    if (String(current[0]) === String(values[0])) sheet.deleteRow(row);
    else if (current.some(function (v) { return v !== ""; })) throw new Error("Append outcome unknown");
  });
  sheet.appendRow(values.map(sheetValue_));
}

function replace_(tx, sheet, row, column, next, previous) {
  tx.undo.push(function () { sheet.getRange(row, column).setValue(sheetValue_(previous)); });
  sheet.getRange(row, column).setValue(sheetValue_(next));
}

function sheetValue_(value) {
  // Prevent user-entered text from being evaluated as a Sheets formula.
  return typeof value === "string" && value.charAt(0) === "=" ? "'" + value : value;
}

function sheet_(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) fail_("NOT_INITIALIZED", "必要なシートがありません。管理者が初期化してください");
  return sheet;
}
function rows_(sheet) { return sheet.getDataRange().getValues().slice(1).filter(function (r) { return r[0] !== ""; }); }
function find_(sheet, id) {
  const values = sheet.getDataRange().getValues();
  let result = null;
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === id) {
      if (result) fail_("DATA_CONFLICT", "IDが重複しています。管理者による照合が必要です");
      result = { row: i + 1, values: values[i] };
    }
  }
  return result;
}
function required_(sheet, id, label) {
  const found = find_(sheet, id);
  if (!found) fail_("NOT_FOUND", label + "が見つかりません");
  return found;
}
function canAccess_(user, id) { return user.role === "admin" || user.studentIds.indexOf(id) !== -1; }
function requireAccess_(user, id) { if (!canAccess_(user, id)) fail_("FORBIDDEN", "この生徒の操作権限がありません"); }
function requireAdmin_(user) { if (user.role !== "admin") fail_("FORBIDDEN", "管理者権限が必要です"); }
function id_(value, label) {
  if (typeof value !== "string" || !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/.test(value)) fail_("INVALID_INPUT", label + "が不正です");
  return value;
}
function text_(value, label, required) {
  if (value === undefined && !required) return "";
  if (typeof value !== "string" || value.length > 2000 || (required && !value.trim())) fail_("INVALID_INPUT", label + "を確認してください");
  return value.trim();
}
function integer_(value, label, min) {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < min) fail_("INVALID_INPUT", label + "は" + min + "以上の整数で入力してください");
  return value;
}
function rideType_(value) {
  if (["pickup", "dropoff", "roundtrip"].indexOf(value) === -1) fail_("INVALID_INPUT", "送迎区分が不正です");
  return value;
}
function rideDate_(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) fail_("INVALID_INPUT", "送迎日時が不正です");
  const start = new Date(date + "T" + time + ":00+09:00");
  if (!Number.isFinite(start.getTime()) || Utilities.formatDate(start, "Asia/Tokyo", "yyyy-MM-dd") !== date) fail_("INVALID_INPUT", "送迎日時が不正です");
  return start;
}
function today_() { return Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy-MM-dd"); }
function formatted_(value, pattern) { return value instanceof Date ? Utilities.formatDate(value, "Asia/Tokyo", pattern) : String(value || ""); }
function student_(r) {
  return { id: String(r[0]), name: String(r[1]), parentName: String(r[2] || ""), phone: String(r[3] || ""),
    address: String(r[4] || ""), pickupNote: String(r[5] || ""), ticketBalance: integer_(r[6], "保存された残チケット数", 0), createdAt: formatted_(r[7], "yyyy-MM-dd") };
}
function ride_(r) {
  return { id: String(r[0]), studentId: String(r[1]), studentName: String(r[2]), rideDate: formatted_(r[3], "yyyy-MM-dd"),
    rideTime: formatted_(r[4], "HH:mm"), rideType: String(r[5]), pickupLocation: String(r[6]), status: String(r[7]),
    calendarEventId: String(r[8] || ""), reservedBy: String(r[9]), note: String(r[10] || ""), completedAt: formatted_(r[11], "yyyy/MM/dd HH:mm:ss") || undefined };
}
function fail_(code, message) { const error = new Error(message); error.apiCode = code; throw error; }
function jsonResponse(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
