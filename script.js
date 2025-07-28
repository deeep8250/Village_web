const scriptURL = "https://script.google.com/macros/s/AKfycby4oNfNjC1bKtL0rIWng4E0DYTEV9KBuMUsEbLFW5Q6HqVv7zi36IrUWi30mpC8PvoD-w/exec";

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

  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.Timestamp || ""}</td>
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
}

function applyFilters() {
  const nameInput = document.getElementById("searchByName").value.trim().toLowerCase();
  const villageInput = document.getElementById("searchByVillage").value.trim().toLowerCase();
  const yearInput = document.getElementById("searchByYear").value.trim().toLowerCase();

  const filtered = allData.filter(row => {
    const name = String(row.name || "").toLowerCase();
    const village = String(row.village || "").toLowerCase();
    const year = String(row.year || "").toLowerCase();

    const nameMatch = !nameInput || name.startsWith(nameInput);
    const villageMatch = !villageInput || village.startsWith(villageInput);
    const yearMatch = !yearInput || year.startsWith(yearInput);

    return nameMatch && villageMatch && yearMatch;
  });

  renderTable(filtered);
}


// ✅ Now filters only apply when user clicks "Load Data"
document.getElementById("loadDataBtn").addEventListener("click", applyFilters);
// ✅ END: Filter setup
