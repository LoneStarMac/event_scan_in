function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  
  if (sheet.getName() === "Party entry" && range.getA1Notation() === "C2") {
    clearStatus();
    const entryID = range.getValue().trim();
    if (entryID) {
      processEntry();
    }
  }
}

function processEntry() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Party entry");
  let entryID = sheet.getRange("C2").getValue();

  // Clear C2 and start fresh if the button is pressed
  if (entryID) {
    sheet.getRange("C2").clearContent(); // Clear the existing ID
    entryID = promptForID(); // Prompt for a new ID
    if (!entryID) return; // Exit if no ID is provided (cancelled)
    sheet.getRange("C2").setValue(entryID); // Set the new ID into C2
  } else {
    // If C2 is empty, just prompt for ID
    entryID = promptForID(); // Moved prompt to ui_helpers.js
    if (!entryID) return; // Exit if no ID is provided (cancelled)
    sheet.getRange("C2").setValue(entryID); // Set the new ID into C2
  }

  // Run parsing function to extract the 7-digit ID if it's a scanner string
  entryID = parseScannerString(entryID);
  const hexEntryID = parseInt(entryID, 10).toString(16).toUpperCase();

  if (!validateID(hexEntryID)) {
    restartEntryProcess(); // Only restart if validation fails
    return; // Exit after restarting
  } else {
    checkReEntry(hexEntryID);
    proceedWithValidation(hexEntryID);
  }

  // Start fresh again by prompting for a new ID immediately after finishing
  processEntry(); // Recursively call the function to restart the entry process
}



function validateID(entryID) {
  const regSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("✅ Registered students");

  if (!regSheet) {
    throw new Error("Sheet '✅ Registered students' not found.");
  }

  const regIDs = regSheet.getRange("A:A").getValues().flat().map(id => id.toString().trim());
  Logger.log("Registered IDs: " + regIDs);
  Logger.log("Entry ID to validate: " + entryID);

  const occurrences = regIDs.filter(id => id === entryID.trim()).length;

  if (occurrences > 1) {
    // Update C9 and show secondary screening alert
    updateStatus("SECONDARY SCREENING—Duplicate ID found", "SECONDARY SCREENING—Duplicate ID found");
    return false;
  } else if (occurrences === 1) {
    return true;  // Valid ID, single occurrence
  } else {
    // Update C9 and show entry denied alert
    updateStatus("ENTRY DENIED—ID not found in RSVP list", "ENTRY DENIED—ID not found in RSVP list");
    return false;
  }
}


function checkReEntry(entryID) {
  Logger.log("Checking for re-entry of ID: " + entryID);
}

function proceedWithValidation(entryID) {
  Logger.log("Proceeding with validation for ID: " + entryID);
  
  // Check if the input is a scanner string or a direct ID
  const parsedID = parseEntryID(entryID);
  
  if (!parsedID) {
    updateStatus("INVALID ID FORMAT", "The entered ID is not valid. Please check and try again."); // Notify about invalid format
    restartEntryProcess(); // Restart the entry process
    return; // Exit the function
  }
  
  const hexEntryID = parsedID.toUpperCase(); // Use the HEX representation of the ID
  const currentTime = new Date(); // Get the current time for logging

  // Check for duplicates in the Entry log
  if (checkForDuplicateEntry(hexEntryID)) {
    updateStatus("DUPLICATE ENTRY DETECTED", "The student has already scanned in.");
    logEntry(hexEntryID, currentTime, null, null, null); // Log entry for duplicate access
    restartEntryProcess(); // Restart the entry process
    return; // Exit the function
  }

  // Check if the ID matches any registered students
  if (!validateID(hexEntryID)) {
    updateStatus("ENTRY DENIED—ID not found in RSVP list", "The provided ID is not in the RSVP list."); // Update status for entry denial
    logEntry(hexEntryID, currentTime, null, null, null); // Log entry for denied access
    restartEntryProcess(); // Restart the entry process
    return; // Exit the function
  }

  // Ask if the student has a ticket or wristband
  const hasTicket = askYesNoQuestion("Does the student have a ticket or wristband?");
  
  if (!hasTicket) {
    updateStatus("SECONDARY SCREENING—No ticket/wristband", "The student must go to secondary screening.");
    logEntry(hexEntryID, currentTime, hasTicket, null, null); // Log entry with reason for secondary screening
    restartEntryProcess(); // Restart the process after logging
    return; // Exit the function
  }

  // Ask if the student appears intoxicated
  const isIntoxicated = askYesNoQuestion("Does the student appear intoxicated?");
  
  if (isIntoxicated) {
    updateStatus("SECONDARY SCREENING—Student appears intoxicated", "The student must go to secondary screening.");
    logEntry(hexEntryID, currentTime, hasTicket, isIntoxicated, null); // Log entry with reason for secondary screening
    restartEntryProcess(); // Restart the process after logging
    return; // Exit the function
  }

  // Ask if the student has any prohibited items
  const hasProhibitedItems = askYesNoQuestion("Does the student have any prohibited items?");
  
  if (hasProhibitedItems) {
    updateStatus("SECONDARY SCREENING—Prohibited items present", "The student must go to secondary screening.");
    logEntry(hexEntryID, currentTime, hasTicket, isIntoxicated, hasProhibitedItems); // Log entry with reason for secondary screening
    restartEntryProcess(); // Restart the process after logging
    return; // Exit the function
  }

  // If all checks are clear
  updateStatus("CLEAR FOR ENTRY", "The student is clear for entry.");
  logEntry(hexEntryID, currentTime, hasTicket, isIntoxicated, hasProhibitedItems); // Log entry for cleared entry
  restartEntryProcess(); // Restart the process after logging
}

// Function to parse the entry ID from the input (scanner string or direct ID)
function parseEntryID(entryID) {
  // Check if the entryID matches a known pattern (7-digit)
  const regex = /(?:;?\d{5}=\d{5}=\d{7})?/; // Update this pattern based on scanner string structure
  const match = entryID.match(regex);
  
  if (match) {
    // Extract the 7-digit ID from the matched string
    return match[0].split('=').pop(); // Get the last part after the last '='
  }

  // If the entry ID is already in the correct format (7 digits)
  if (/^\d{7}$/.test(entryID.trim())) {
    return entryID.trim(); // Return as is
  }

  return null; // Invalid ID format
}