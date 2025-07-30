let signedInEmail = "";

const scriptURL =
  "https://script.google.com/macros/s/AKfycbzgOsJigva1aA5npQg_4GiqNA0D1i0VjXCYgEtkTucYemzZ-YL_Z0P3hd4ikFEaYKqg/exec";

function handleCredentialResponse(response) {
  const data = jwt_decode(response.credential);
  signedInEmail = data.email;
  document.getElementById("submittedBy").value = signedInEmail;
  document.getElementById("googleSignIn").style.display = "none";
}


window.onload = function () {
  google.accounts.id.initialize({
    client_id:
      "923748239564-vu6bjumjpfa36jt3rsvjtnrnh637m6a0.apps.googleusercontent.com",
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
document
  .getElementById("donationForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!signedInEmail) {
      alert("⚠️ Please sign in with Google before submitting.");
      return;
    }

    document.getElementById("submittedBy").value = signedInEmail;

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
      document.getElementById("submittedBy").value = signedInEmail;
      console.log(
        "Submission successful:",
        resultText,
        "submitted by:",
        signedInEmail
      );
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
    populateDropdowns(allData); // populate dropdowns from unique values
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
  const nameInput = document
    .getElementById("searchByName")
    .value.trim()
    .toLowerCase();
  const villageInput = document.getElementById("searchByVillage").value;
  const yearInput = document.getElementById("searchByYear").value;
  const localInput = document.getElementById("searchByLocal").value;
  const festivalInput = document.getElementById("searchByFestival").value;
  const submittedByInput = document
    .getElementById("searchBySubmittedBy")
    .value.trim()
    .toLowerCase();
  const amountRange = document.getElementById("searchByAmountRange")?.value || "";

  const filtered = allData.filter((row) => {
    const name = String(row.name || "").toLowerCase();
    const village = String(row.village || "");
    const year = String(row.year || "");
    const local = String(row.local || "");
    const festival = String(row.festival || "");
    const submittedBy = String(row.submittedBy || "").toLowerCase();
    const amt = parseFloat(row.amount || "0");

const matchesAmount = (() => {
  if (!amountRange) return true;

  let min = 0, max = Infinity;

  if (amountRange.includes("+")) {
    min = parseInt(amountRange.replace("+", ""), 10);
  } else if (amountRange.includes("-")) {
    [min, max] = amountRange.split("-").map(Number);
  }

  return amt >= min && amt <= max;
})();
  


    return (
      (!nameInput || name.includes(nameInput)) &&
      (!villageInput || village === villageInput) &&
      (!yearInput || year === yearInput) &&
      (!localInput || local === localInput) &&
      (!festivalInput || festival === festivalInput) &&
      (!submittedByInput || submittedBy.includes(submittedByInput)) &&
      matchesAmount
    );
  });

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
  const exportArea = document.getElementById("exportContent");

  // Create a deep clone to preserve content
  const clone = exportArea.cloneNode(true);

  // Check if table has rows — otherwise cancel
  const rows = clone.querySelectorAll("tbody tr");
  if (!rows.length) {
    alert("⚠️ No data to export! Please load or filter data first.");
    return;
  }

  // Force visual style
  clone.style.width = "100%";
  clone.style.maxWidth = "100%";
  clone.style.padding = "20px";
  clone.style.background = "#fff";
  clone.style.color = "#000";
  clone.style.fontSize = "12px";

  const table = clone.querySelector("table");
  if (table) {
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";

    table.querySelectorAll("th, td").forEach(cell => {
      cell.style.wordBreak = "break-word";
      cell.style.whiteSpace = "normal";
      cell.style.padding = "6px 8px";
      cell.style.border = "1px solid #ccc";
      cell.style.fontSize = "11px";
      cell.style.textAlign = "left";
      cell.style.background = "#fff"; // force white background
      cell.style.color = "#000";      // ensure dark text
    });
  }

  // Append total amount to bottom
  const totalBox = document.getElementById("totalAmountBox").cloneNode(true);
  totalBox.style.background = "#fef08a";
  totalBox.style.color = "#92400e";
  totalBox.style.fontWeight = "bold";
  totalBox.style.fontSize = "14px";
  totalBox.style.textAlign = "center";
  totalBox.style.marginTop = "20px";
  totalBox.style.padding = "10px";
  totalBox.style.borderRadius = "10px";
  clone.appendChild(totalBox);

  // Create a temp container
  const tempContainer = document.createElement("div");
  tempContainer.style.position = "absolute";
  tempContainer.style.left = "-9999px";
  tempContainer.appendChild(clone);
  document.body.appendChild(tempContainer);

  const opt = {
    margin: 10,
    filename: "budget-catcher-data.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      scrollY: 0,
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  html2pdf().set(opt).from(clone).save().then(() => {
    document.body.removeChild(tempContainer);
  });
});



function populateDropdowns(data) {
  const villages = new Set();
  const years = new Set();
  const locals = new Set();
  const festivals = new Set();

  data.forEach((row) => {
    if (row.village) villages.add(row.village);
    if (row.year) years.add(row.year);
    if (row.local) locals.add(row.local);
    if (row.festival) festivals.add(row.festival);
  });

  fillSelect("searchByVillage", villages);
  fillSelect("searchByYear", years);
  fillSelect("searchByLocal", locals);
  fillSelect("searchByFestival", festivals);
}

function fillSelect(id, valuesSet) {
  const select = document.getElementById(id);
  let label = '';
switch (id) {
  case 'searchByVillage':
    label = 'Select Village';
    break;
  case 'searchByYear':
    label = 'Select Year';
    break;
  case 'searchByLocal':
    label = 'Select Local';
    break;
  case 'searchByFestival':
    label = 'Select Festival';
    break;
  default:
    label = '-- Select --';
}

select.innerHTML = `<option value="">${label}</option>`;


  Array.from(valuesSet)
    .sort()
    .forEach((val) => {
      const option = document.createElement("option");
      option.value = val;
      option.textContent = val;
      select.appendChild(option);
    });
}
