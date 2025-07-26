// Google Sign-In
function handleCredentialResponse(response) {
  const data = jwt_decode(response.credential);
  document.getElementById("updatedBy").value = data.email;
  document.querySelector(".g_id_signin").style.display = "none";
}

// Google Sign-In Init
window.onload = function () {
  google.accounts.id.initialize({
    client_id: "207915409411-dctd16ba0gvr3t8d3hq2hgdkg541b0cj.apps.googleusercontent.com",
    callback: handleCredentialResponse,
  });
  google.accounts.id.renderButton(document.querySelector(".g_id_signin"), {
    theme: "outline",
    size: "large",
    type: "standard",
    shape: "pill",
  });

  fetchData();
};

// Submit Form
document.getElementById("donationForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const updatedBy = document.getElementById("updatedBy").value;
  formData.append("email", updatedBy); // Add email field from updatedBy

  const jsonData = Object.fromEntries(formData.entries());

  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbwWER_UoLtPkT8dp05O3SlBPCQEmuPKYm6ecCsrhQoFetKzrtx-DRmhqY6mR9_Opz-7/exec", {
      method: "POST",
      body: new URLSearchParams(jsonData),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const resultText = await response.text();
    alert(resultText);
    this.reset();
    document.getElementById("updatedBy").value = updatedBy;
    fetchData();
  } catch (err) {
    console.error("Submission error:", err);
    alert("❌ Submission failed.");
  }
});

// Fetch Table Data
async function fetchData() {
  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbwWER_UoLtPkT8dp05O3SlBPCQEmuPKYm6ecCsrhQoFetKzrtx-DRmhqY6mR9_Opz-7/exec");
    const data = await response.json();
    const tableBody = document.getElementById("dataTableBody");
    tableBody.innerHTML = "";

    data.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.timestamp || ""}</td>
        <td>${row.name || ""}</td>
        <td>${row.amount || ""}</td>
        <td>${row.area || ""}</td>
        <td>${row.remarks || ""}</td>
        <td>${row.email || ""}</td>
        <td>${row.updatedby || ""}</td>
        <td>${row.updatedfor || ""}</td>
        <td>${row.role || ""}</td>
        <td>${row.festival || ""}</td>
        <td>${row.year || ""}</td>
      `;
      tableBody.appendChild(tr);
    });
  } catch (err) {
    console.error("Data fetch error:", err);
  }
}
