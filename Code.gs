// Function to trigger via button on desktop (assign this to the button)
function buttonTrigger() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Party entry");
  var idOrString = sheet.getRange("C2").getValue();  // Get value from C2
  
  // Check if C2 is empty
  if (!idOrString) {
    // Prompt user for ID or swipe string if C2 is empty
    var ui = SpreadsheetApp.getUi();
    var response = ui.prompt("Please enter a valid ID or swipe string:");
    
    if (response.getSelectedButton() == ui.Button.OK) {
      idOrString = response.getResponseText();
      sheet.getRange("C2").setValue(idOrString);  // Set C2 with the entered value
      processEntry(idOrString);  // Proceed with validation
    } else {
      showError("No ID or swipe string provided.");
    }
  } else {
    // If C2 is not empty, process the existing value
    processEntry(idOrString);
  }
}

// Processing the ID or swipe string
function processEntry(idOrString) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Party entry");
  var regex = /^\d{7}$/;

  // Clear form fields for new entry (preserve C2 and C9)
  resetFormFields();

  // Check if the input is a 7-digit number
  if (regex.test(idOrString)) {
    Logger.log("Valid 7-digit ID: " + idOrString);
    askNameMatch(idOrString);  // Start validation with name match
  } else {
    // If it's a swipe string, attempt to extract the 7-digit ID
    var parsedID = parseSwipeString(idOrString);
    if (parsedID) {
      Logger.log("Extracted 7-digit ID from swipe: " + parsedID);
      sheet.getRange("C2").setValue(parsedID);  // Update C2 with parsed ID
      askNameMatch(parsedID);  // Proceed with name match
    } else {
      Logger.log("Invalid input or unable to extract ID.");
      showError("Invalid input. Please enter a valid ID or swipe string.");
    }
  }
}

// Asking if the ID matches the student's name (desktop/mobile workflow)
function askNameMatch(id) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Party entry");
  
  // Show the first question in the sheet (for mobile users)
  sheet.getRange("C4").setValue("Does the ID match the student's name? (See D4)");
  showDropDownInCell("D4", ["Yes", "No"]);

  // For desktop users, show the UI prompt
  if (isRunningOnDesktop()) {
    var ui = SpreadsheetApp.getUi();
    var response = ui.alert("Does the ID match the student's name?", ui.ButtonSet.YES_NO);
    
    if (response == ui.Button.YES) {
      sheet.getRange("D4").setValue("Yes");
      askTicketOrWristband();
    } else {
      sheet.getRange("D4").setValue("No");
      handleEntryDenied();
    }
  }
}

// Ask if the student has a ticket or wristband
function askTicketOrWristband() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Party entry");

  // Show second question
  sheet.getRange("C5").setValue("Does the student have a ticket or wristband? (See D5)");
  showDropDownInCell("D5", ["Yes", "No"]);

  if (isRunningOnDesktop()) {
    var ui = SpreadsheetApp.getUi();
    var response = ui.alert("Does the student have a ticket or wristband?", ui.ButtonSet.YES_NO);

    if (response == ui.Button.YES) {
      sheet.getRange("D5").setValue("Yes");
      askIntoxicated();
    } else {
      sheet.getRange("D5").setValue("No");
      handleSecondaryScreening("No wristband.");
    }
  }
}

// Ask if the student appears intoxicated
function askIntoxicated() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Party entry");

  // Show third question
  sheet.getRange("C6").setValue("Does the student appear intoxicated? (See D6)");
  showDropDownInCell("D6", ["Yes", "No"]);

  if (isRunningOnDesktop()) {
    var ui = SpreadsheetApp.getUi();
    var response = ui.alert("Does the student appear intoxicated?", ui.ButtonSet.YES_NO);

    if (response == ui.Button.NO) {
      sheet.getRange("D6").setValue("No");
      askProhibitedItems();
    } else {
      sheet.getRange("D6").setValue("Yes");
      handleSecondaryScreening("Appears intoxicated.");
    }
  }
}

// Ask if the student has prohibited items
function askProhibitedItems() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Party entry");

  // Show final question
  sheet.getRange("C7").setValue("Is the student sneaking prohibited items? (See D7)");
  showDropDownInCell("D7", ["Yes", "No"]);

  if (isRunningOnDesktop()) {
    var ui = SpreadsheetApp.getUi();
    var response = ui.alert("Is the student sneaking prohibited items?", ui.ButtonSet.YES_NO);

    if (response == ui.Button.NO) {
      sheet.getRange("D7").setValue("No");
      handleClearEntry();
    } else {
      sheet.getRange("D7").setValue("Yes");
      handleSecondaryScreening("Prohibited items found.");
    }
  }
}

// Handle denied entry (ID mismatch)
function handleEntryDenied() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Party entry");
  sheet.getRange("C9").setValue("ENTRY DENIED");
  showError("ID does not match. Entry denied.");
  restartEntryProcess();  // Clear C2 and re-prompt for ID
}

// Handle secondary screening
function handleSecondaryScreening(reason) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Party entry");
  sheet.getRange("C9").setValue("SECONDARY SCREENING");
  showError(reason + " Student requires secondary screening.");
  restartEntryProcess();  // Clear C2 and re-prompt for ID
}

// Handle clear entry
function handleClearEntry() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Party entry");
  sheet.getRange("C9").setValue("CLEAR");
  sheet.getRange("C3").setValue("Student is clear for entry.");
  restartEntryProcess();  // Clear C2 and re-prompt for ID
}

// Restart the process by clearing C2 and popping up the ID input prompt
function restartEntryProcess() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Party entry");
  sheet.getRange("C2").clearContent();  // Clear C2

  // Prompt for new ID or swipe string
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt("Please enter a valid ID or swipe string:");

  if (response.getSelectedButton() == ui.Button.OK) {
    var idOrString = response.getResponseText();
    sheet.getRange("C2").setValue(idOrString);  // Set C2 with the entered value
    processEntry(idOrString);  // Re-start the validation process
  } else {
    showError("No ID or swipe string provided. Please restart.");
  }
}

// Error handling
function showError(message) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Party entry");
  sheet.getRange("C3").setValue(message);  // Display error message in the sheet
  if (isRunningOnDesktop()) {
    SpreadsheetApp.getUi().alert(message);  // Show error alert on desktop
  }
}

// Reset the form (except C2 and C9) when a new ID is entered
function resetFormFields() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Party entry");
  // Clear questions and responses except for C2 (ID) and C9 (status)
  sheet.getRange("C4:C7").clearContent();
  sheet.getRange("D4:D7").clearContent();
  sheet.getRange("D4:D7").clearDataValidations();
}

// Helper function to show dropdown for mobile users
function showDropDownInCell(cell, options) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Party entry");
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(options, true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(cell).setDataValidation(rule).setValue("");
}

// Check if script is running on desktop
function isRunningOnDesktop() {
  try {
    SpreadsheetApp.getUi();  // This will only work on desktop
    return true;
  } catch (e) {
    return false;  // If UI is unavailable, assume mobile environment
  }
}