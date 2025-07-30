const scriptURL =
  "https://script.google.com/macros/s/AKfycbzgOsJigva1aA5npQg_4GiqNA0D1i0VjXCYgEtkTucYemzZ-YL_Z0P3hd4ikFEaYKqg/exec";

function handleCredentialResponse(response) {
  const data = jwt_decode(response.credential);
  document.getElementById("submittedBy").value = data.email;
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
      console.log(
        "Submission successful:",
        resultText,
        "submitted by:",
        jsonData.submittedBy
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
  const element = document.getElementById("exportContent");

  // Force width 100% and max width for PDF rendering
  element.style.width = "100%";
  element.style.maxWidth = "none";

  const opt = {
    margin: [10, 10, 10, 10], // small margins
    filename: "filtered_data.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2, // higher quality render
      scrollY: 0,
      windowWidth: 2000, // balances between fit and wrapping
    },
    jsPDF: {
      unit: "mm",
      format: [330, 210], // custom wide size (landscape)
      orientation: "landscape",
    },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  html2pdf().set(opt).from(element).save();
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
