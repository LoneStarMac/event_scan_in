function calculateMetrics() {
  const regSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("✅ Registered students");
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Entry Log");

  const totalRegistered = regSheet.getRange("A:A").getValues().filter(String).length;
  const totalEntries = logSheet.getRange("A:A").getValues().filter(String).length;

  const percentageScannedIn = totalEntries / totalRegistered;
  return { totalRegistered, totalEntries, percentageScannedIn };
}

function refreshDashboardMetrics() {
  const dashboard = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Dashboard");
  const metrics = calculateMetrics();

  dashboard.getRange("D5").setValue(metrics.percentageScannedIn * 100 + "%");
}