const scriptURL = "https://script.google.com/macros/s/AKfycbz2ln-FyQX9wbeN1ucfwg12OVj58iPDck_2D3q9IsQ10YLv32xaHWVsKuvhVO2r8m1TKQ/exec";

function handleCredentialResponse(response) {
  const data = jwt_decode(response.credential);
  document.getElementById("submittedBy").value = data.email;
  document.getElementById("googleSignIn").style.display = "none";
}

window.onload = function () {
  google.accounts.id.initialize({
    client_id: "923748239564-vu6bjumjpfa36jt3rsvjtnrnh637m6a0.apps.googleusercontent.com",
    callback: handleCredentialResponse,
  });
  google.accounts.id.renderButton(document.getElementById("googleSignIn"), {
    theme: "outline",
    size: "large",
    type: "standard",
    shape: "pill",
  });

  fetchData();
};

document.getElementById("donationForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const formData = new FormData(this);
  const jsonData = Object.fromEntries(formData.entries());

  try {
    const response = await fetch(scriptURL, {
      method: "POST",
      body: new URLSearchParams(jsonData),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const resultText = await response.text();
    alert(resultText);
    this.reset();
    document.getElementById("submittedBy").value = jsonData.submittedBy;
    console.log("Submission successful:", resultText, "submitted by:", jsonData.submittedBy);
    fetchData();
  } catch (err) {
    console.error("Submission error:", err);
    alert("❌ Submission failed.");
  }
});

// ✅ START: Filter setup (only on Load Data button)
let allData = []; // Store all data once loaded

async function fetchData() {
  try {
    const response = await fetch(`${scriptURL}?action=read`);
    allData = await response.json(); // store for filtering
    renderTable(allData); // show all initially
  } catch (err) {
    console.error("Fetching error:", err);
    alert("❌ Failed to load data.");
  }
}

function renderTable(data) {
  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";

  data.forEach((row, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="white-space: nowrap;">${row.Timestamp || ""}</td>
      <td>${row.name || ""}</td>
      <td>${row.amount || ""}</td>
      <td>${row.local || ""}</td>
      <td>${row.village || ""}</td>
      <td>${row.festival || ""}</td>
      <td>${row.remarks || ""}</td>
      <td>${row.year || ""}</td>
      <td>${row.submittedBy || ""}</td>
    
    `;
    tbody.appendChild(tr);
  });

  // Attach edit button listeners

}


function applyFilters() {
  const nameInput = document.getElementById("searchByName").value.trim().toLowerCase();
  const villageInput = document.getElementById("searchByVillage").value.trim().toLowerCase();
  const yearInput = document.getElementById("searchByYear").value.trim().toLowerCase();
  const amountInput = document.getElementById("searchByAmount").value.trim().toLowerCase();
  const localInput = document.getElementById("searchByLocal").value.trim().toLowerCase();
  const festivalInput = document.getElementById("searchByFestival").value.trim().toLowerCase();
  const remarksInput = document.getElementById("searchByRemarks").value.trim().toLowerCase();
  const submittedByInput = document.getElementById("searchBySubmittedBy").value.trim().toLowerCase();

  const filtered = allData.filter(row => {
    const name = String(row.name || "").toLowerCase();
    const village = String(row.village || "").toLowerCase();
    const year = String(row.year || "").toLowerCase();
    const amount = String(row.amount || "").toLowerCase();
    const local = String(row.local || "").toLowerCase();
    const festival = String(row.festival || "").toLowerCase();
    const remarks = String(row.remarks || "").toLowerCase();
    const submittedBy = String(row.submittedBy || "").toLowerCase();

    return (
      (!nameInput || name.startsWith(nameInput)) &&
      (!villageInput || village.startsWith(villageInput)) &&
      (!yearInput || year.startsWith(yearInput)) &&
      (!amountInput || amount.startsWith(amountInput)) &&
      (!localInput || local.startsWith(localInput)) &&
      (!festivalInput || festival.startsWith(festivalInput)) &&
      (!remarksInput || remarks.startsWith(remarksInput)) &&
      (!submittedByInput || submittedBy.startsWith(submittedByInput))
    );
  });

  // Show table
  renderTable(filtered);

  // ✅ Show total amount
  const total = filtered.reduce((sum, row) => {
    const amt = parseFloat(row.amount);
    return !isNaN(amt) ? sum + amt : sum;
  }, 0);

  document.getElementById("totalAmount").textContent = total.toFixed(2);
}




// ✅ Now filters only apply when user clicks "Load Data"
document.getElementById("loadDataBtn").addEventListener("click", applyFilters);






document.getElementById("downloadPDF").addEventListener("click", function () {
  const element = document.getElementById("exportContent");

  // Force width 100% and max width for PDF rendering
  element.style.width = "100%";
  element.style.maxWidth = "none";

  const opt = {
    margin: [10, 10, 10, 10], // small margins
    filename: 'filtered_data.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,             // higher quality render
      scrollY: 0,
      windowWidth: 2000     // balances between fit and wrapping
    },
    jsPDF: {
      unit: 'mm',
      format: [330, 210],    // custom wide size (landscape)
      orientation: 'landscape'
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  html2pdf().set(opt).from(element).save();
});







//update or edit portion
