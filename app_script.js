function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
    var data = e.parameter;

    var row = [
      new Date(),
      data.name || "",
      data.amount || "",
      data.area || "",
      data.remarks || "",
      data.email || "",
      data.updatedBy || "", // ✅ fixed casing
      data.updatedFor || "", // ✅ fixed casing
      data.role || ""
    ];

    sheet.appendRow(row);

    return ContentService.createTextOutput(
      JSON.stringify({
        status: "✅ Success! Data saved.",
        submittedData: {
          name: data.name || "",
          amount: data.amount || "",
          area: data.area || "",
          remarks: data.remarks || "",
          email: data.email || "",
          updatedBy: data.updatedBy || "", // ✅ fixed casing
          updatedFor: data.updatedFor || "", // ✅ fixed casing
          role: data.role || ""
        }
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "❌ Failed to save.",
        error: error.message
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
