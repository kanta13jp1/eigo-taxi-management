function verifyAcceptanceCalendarReadOnly() {
  const calendar = verificationCalendar_();
  const expectedId = (PropertiesService.getScriptProperties().getProperty("TEST_CALENDAR_ID") || "").trim();
  const calendarMatches = calendar.getId() === expectedId;
  const timeZoneMatches = calendar.getTimeZone() === "Asia/Tokyo";
  if (!calendarMatches || !timeZoneMatches) throw new Error("Verification calendar metadata did not match.");
  console.log(JSON.stringify({
    result: "PASS",
    checkedAtJst: Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy-MM-dd HH:mm:ss"),
    timeZoneMatches: timeZoneMatches,
    calendarMatches: calendarMatches
  }));
}
