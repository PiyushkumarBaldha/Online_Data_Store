function doPost(e) {
    try {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create("Quiz Results");
      let sheet = spreadsheet.getSheetByName("QuizData");
      
      // Create sheet with headers if it doesn't exist
      if (!sheet) {
        sheet = spreadsheet.insertSheet("QuizData");
        const headers = [
          "Timestamp",
          "Player ID",
          "Session ID",
          "Play Number",
          "Age",
          "Profession",
          "Score",
          "Time Taken (seconds)"
        ];
        
        // Add question headers (10 questions)
        for (let i = 1; i <= 10; i++) {
          headers.push(`Q${i} Image`);
          headers.push(`Q${i} Answer`);
          headers.push(`Q${i} Confidence`);
          headers.push(`Q${i} Correct`);
        }
        
        sheet.appendRow(headers);
      }
      
      // Prepare the row data
      const rowData = [
        new Date(e.parameters.timestamp[0]),
        e.parameters.playerId[0],
        e.parameters.sessionId[0],
        e.parameters.playNumber[0],
        e.parameters.age[0],
        e.parameters.profession[0],
        e.parameters.score[0],
        e.parameters.timeTaken[0]
      ];
      
      // Add question data (10 questions)
      for (let i = 1; i <= 10; i++) {
        rowData.push(e.parameters[`q${i}_image`] ? e.parameters[`q${i}_image`][0] : '');
        rowData.push(e.parameters[`q${i}_answer`] ? e.parameters[`q${i}_answer`][0] : '');
        rowData.push(e.parameters[`q${i}_confidence`] ? e.parameters[`q${i}_confidence`][0] : '');
        rowData.push(e.parameters[`q${i}_correct`] ? e.parameters[`q${i}_correct`][0] : '');
      }
      
      // Append the row to the sheet
      sheet.appendRow(rowData);
      
      // Return success response
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Quiz data saved successfully'
      })).setMimeType(ContentService.MimeType.JSON);
      
    } catch (error) {
      // Return error response
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // For testing - run this once to set up your sheet
  function setupQuizSheet() {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create("Quiz Results");
    let sheet = spreadsheet.getSheetByName("QuizData");
    
    if (sheet) {
      spreadsheet.deleteSheet(sheet);
    }
    
    sheet = spreadsheet.insertSheet("QuizData");
    const headers = [
      "Timestamp",
      "Player ID",
      "Session ID",
      "Play Number",
      "Age",
      "Profession",
      "Score",
      "Time Taken (seconds)"
    ];
    
    // Add question headers (10 questions)
    for (let i = 1; i <= 10; i++) {
      headers.push(`Q${i} Image`);
      headers.push(`Q${i} Answer`);
      headers.push(`Q${i} Confidence`);
      headers.push(`Q${i} Correct`);
    }
    
    sheet.appendRow(headers);
  }