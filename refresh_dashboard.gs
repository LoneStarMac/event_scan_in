function refreshDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashboard = ss.getSheetByName("Dashboard");

  try {
    refreshDashboardMetrics();
    refreshCharts(dashboard);
  } catch (error) {
    Logger.log("Error during refresh: " + error.message);
  }
}

function refreshCharts(sheet) {
  const charts = sheet.getCharts();
  charts.forEach(chart => sheet.updateChart(chart));
}