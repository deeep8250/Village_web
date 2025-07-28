function doPost(e) {
  try {
    const data = e.parameter;
    const sheetName = `${data.year}_${data.festival}`;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);


    
    // Set your expected fields (preserve order)
    const expectedHeaders = [
      "Timestamp", "year", "village", "festival", "remarks", "local", "name","amount", "submittedBy",
    ];

    // Create sheet if not exists
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(expectedHeaders);
    }

    // Ensure headers match (optional safety check)
    const sheetHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (sheetHeaders.join() !== expectedHeaders.join()) {
      throw new Error("Sheet headers mismatch – please verify header structure.");
    }

    // Prepare row
    const row = [new Date()];
    for (let i = 1; i < expectedHeaders.length; i++) {
      const key = expectedHeaders[i];
      row.push(data[key] || "");
    }

    sheet.appendRow(row);

    return ContentService
      .createTextOutput("✅ Data saved successfully")
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (err) {
    return ContentService
      .createTextOutput(`❌ Error: ${err.message}`)
      .setMimeType(ContentService.MimeType.TEXT);
  }
}


function doGet(e) {
  const action = e.parameter.action;
  if (action === "read") {
    return readSheetData();
  }

  return ContentService
    .createTextOutput("Invalid action")
    .setMimeType(ContentService.MimeType.TEXT);
}

function readSheetData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();

  const combinedData = [];
  const expectedHeaders = [
    "Timestamp", "year", "village", "festival", "remarks", "local", "name", "amount", "submittedBy"
  ];

  for (const sheet of sheets) {
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) continue; // skip if only header or empty

    const headers = data[0];
    if (headers.join() !== expectedHeaders.join()) continue; // skip if header structure doesn't match

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowObject = {};
      headers.forEach((header, index) => {
        rowObject[header] = row[index];
      });
      combinedData.push(rowObject);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify(combinedData))
    .setMimeType(ContentService.MimeType.JSON);
}

