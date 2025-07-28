function doGet(e) {
  const action = e.parameter.action;

  if (action === "read") {
    const year = e.parameter.year;
    const festival = e.parameter.festival;
    return readSheetData(year, festival);
  }

  return ContentService
    .createTextOutput("Invalid action")
    .setMimeType(ContentService.MimeType.TEXT);
}

function readSheetData(year, festival) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let sheetsToRead = [];

  if (year && festival) {
    const sheetName = `${year}_${festival}`;
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      return ContentService
        .createTextOutput(`[]`) // return empty array if not found
        .setMimeType(ContentService.MimeType.JSON);
    }
    sheetsToRead = [sheet];
  } else {
    // If no filters provided, return from all sheets
    sheetsToRead = ss.getSheets();
  }

  let result = [];

  sheetsToRead.forEach(sheet => {
    const data = sheet.getDataRange().getValues();
    const headers = data.shift(); // first row as headers

    data.forEach(row => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i];
      });
      result.push(obj);
    });
  });

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
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


