// Function to create necessary triggers for onEdit and onOpen events
function createTriggers() {
  // Delete existing triggers first to prevent duplicates
  deleteAllTriggers();

  // Create the onEdit trigger for the onEdit function
  ScriptApp.newTrigger("onEdit")
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onEdit()
    .create();

  // Create the onOpen trigger for the onOpenTrigger function
  ScriptApp.newTrigger("onOpenTrigger")
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onOpen()
    .create();

  Logger.log("Triggers created successfully.");
}

// Function to delete all existing triggers
function deleteAllTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  Logger.log("All existing triggers deleted.");
}