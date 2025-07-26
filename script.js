let signedInEmail = null;

window.onload = function () {
  google.accounts.id.initialize({
    client_id: "207915409411-dctd16ba0gvr3t8d3hq2hgdkg541b0cj.apps.googleusercontent.com",
    callback: handleCredentialResponse
  });

  google.accounts.id.renderButton(
    document.getElementById("googleBtn"),
    { theme: "outline", size: "large" }
  );

  fetchSheetData();
};

function handleCredentialResponse(response) {
  const decoded = jwt_decode(response.credential);
  signedInEmail = decoded.email;
  document.getElementById("email").value = signedInEmail;
  document.getElementById("updatedBy").value = signedInEmail;
  console.log("Signed-in email:", signedInEmail);
}
document.getElementById("feedbackForm").addEventListener("submit", function (e) {
  e.preventDefault();

  if (!signedInEmail) {
    alert("Please sign in with Google first.");
    return;
  }

  const formData = new FormData(this); // ✅ Send this directly

  const sheetURL = "https://script.google.com/macros/s/AKfycbwWER_UoLtPkT8dp05O3SlBPCQEmuPKYm6ecCsrhQoFetKzrtx-DRmhqY6mR9_Opz-7/exec";

  fetch(sheetURL, {
    method: "POST",
    body: formData // ✅ No headers, no JSON.stringify
  })
    .then(res => res.text())
    .then(text => {
      alert("✅ Success!");
      this.reset();
      fetchSheetData();
    })
    .catch(err => {
      console.error("Error submitting:", err);
      alert("❌ Submission failed.");
    });
});

function fetchSheetData() {
  const sheetReadURL = "https://script.google.com/macros/s/AKfycbwWER_UoLtPkT8dp05O3SlBPCQEmuPKYm6ecCsrhQoFetKzrtx-DRmhqY6mR9_Opz-7/exec?action=read";

  fetch(sheetReadURL)
    .then(res => res.json())
    .then(data => {
      if (data && data.length > 0) {
        renderTable(data);
      }
    })
    .catch(err => console.error("Failed to load sheet data:", err));
}

function renderTable(data) {
  const table = document.getElementById("dataTable");
  const dataSection = document.getElementById("dataSection");
  dataSection.style.display = "block";

  table.innerHTML = "";

  const headers = Object.keys(data[0]);
  const thead = document.createElement("tr");
  headers.forEach(h => {
    const th = document.createElement("th");
    th.textContent = h;
    thead.appendChild(th);
  });
  table.appendChild(thead);

  data.forEach(row => {
    const tr = document.createElement("tr");
    headers.forEach(key => {
      const td = document.createElement("td");
      td.textContent = row[key];
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
}

function downloadPDF() {
  const element = document.getElementById("dataSection");
  html2pdf().from(element).save("submitted_data.pdf");
}
