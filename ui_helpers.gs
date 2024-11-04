// Clears the status message in C9
function clearStatus() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Party entry");
  sheet.getRange("C9").clearContent();
}

// Updates the status both in cell C9 and in a dialog box
// Updates the status both in cell C9 and in a dialog box
function updateStatus(sheetMessage, dialogMessage) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Party entry");
  sheet.getRange("C9").setValue(sheetMessage); // Write the status to the sheet
  Logger.log("Updated C9 with message: " + sheetMessage); // Log status update
  // Show the dialog to the user without waiting for completion
  SpreadsheetApp.getUi().alert(dialogMessage);
}

// Prompts the user to enter an ID if C2 is empty
function promptForID() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt("Enter ID", "Please enter the student's ID:", ui.ButtonSet.OK_CANCEL);
  
  // If the user clicks "Cancel", return null without showing a message
  if (response.getSelectedButton() === ui.Button.CANCEL) {
    return null; // Simply return null if canceled
  }
  
  // Return the trimmed input value
  return response.getResponseText().trim();
}


// Handles validation prompts after ID is confirmed
function showValidationPrompts() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Party entry");

  // Asking validation questions
  ui.alert("Does the ID match the student's name?");
  ui.alert("Does the student have a wristband?");
  ui.alert("Is the student intoxicated?");
  ui.alert("Check for prohibited items.");

  // Update sheet with final clearance message
  updateStatus("CLEAR FOR ENTRY", "The student is clear for entry");
}


// Helper function to ask Yes/No questions
function askYesNoQuestion(question) {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(question, ui.ButtonSet.YES_NO);
  return response === ui.Button.YES;
}

// Function to restart the entry process with a new ID prompt
function restartEntryProcess() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Party entry");
  sheet.getRange("C2").clearContent().activate();
  const newID = promptForID();
  if (newID) {
    sheet.getRange("C2").setValue(newID);
    processEntry();
  }
}

// Function to parse scanner string and extract the relevant 7-digit ID
function parseScannerString(scannerString) {
  const match = scannerString.match(/=\d{5}=(\d{7})\?/);
  return match ? match[1] : scannerString;
}