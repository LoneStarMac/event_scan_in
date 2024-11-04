function logEntry(hexEntryID, timestamp, hasTicket, isIntoxicated, hasProhibitedItems) {
  const entryLogSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Entry log");
  if (!entryLogSheet) {
    throw new Error("Sheet 'Entry log' not found.");
  }

  // Convert boolean values to "Yes" or "No"
  const ticketResponse = hasTicket ? "Yes" : "No";
  const intoxicationResponse = isIntoxicated ? "Yes" : "No";
  const prohibitedItemsResponse = hasProhibitedItems ? "Yes" : "No";

  // Append new entry to the Entry log sheet
  entryLogSheet.appendRow([hexEntryID, timestamp, ticketResponse, intoxicationResponse, prohibitedItemsResponse]);
}

function updateReEntry(entryID) {
  const regSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("✅ Registered students");
  const entryRange = regSheet.getRange("H2:H");
  const entryTimes = entryRange.getValues();
  
  entryTimes.forEach((time, index) => {
    if (time[0] === entryID) {
      const newTime = new Date();
      entryRange.getCell(index + 1, 1).setValue(time[0] + ", " + newTime);
    }
  });
}