function checkReEntry(entryID) {
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Entry Log");
  const regSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("✅ Registered students");
  const reEntryLog = logSheet.getRange("A:A").getValues().flat();
  
  if (reEntryLog.includes(entryID)) {
    Logger.log("Re-entry detected for ID: " + entryID);
    showReEntryAlert();
    logEntry(entryID, "Re-entry");
  }
}

function showReEntryAlert() {
  const ui = SpreadsheetApp.getUi();
  ui.alert("Warning: This student is re-entering. Please confirm the validation details.");
}