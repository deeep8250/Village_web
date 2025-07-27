function handleCredentialResponse(response) {
  const data = jwt_decode(response.credential);
  document.getElementById("updatedBy").value = data.email;
  document.getElementById("googleSignIn").style.display = "none";
}

window.onload = function () {
  google.accounts.id.initialize({
    client_id: "207915409411-dctd16ba0gvr3t8d3hq2hgdkg541b0cj.apps.googleusercontent.com",
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
  formData.append("email", document.getElementById("updatedBy").value);

  const jsonData = Object.fromEntries(formData.entries());

  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbwWER_UoLtPkT8dp05O3SlBPCQEmuPKYm6ecCsrhQoFetKzrtx-DRmhqY6mR9_Opz-7/exec",
      {
        method: "POST",
        body: new URLSearchParams(jsonData),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const resultText = await response.text();
    alert(resultText);
    this.reset();
    document.getElementById("updatedBy").value = jsonData.email;
    fetchData();
  } catch (err) {
    console.error("Submission error:", err);
    alert("❌ Submission failed.");
  }
});

async function fetchData() {
  const response = await fetch(
    "https://script.google.com/macros/s/AKfycbwWER_UoLtPkT8dp05O3SlBPCQEmuPKYm6ecCsrhQoFetKzrtx-DRmhqY6mR9_Opz-7/exec"
  );
  const data = await response.json();
  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";

  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.timestamp}</td>
      <td>${row.name}</td>
      <td>${row.amount}</td>
      <td>${row.local}</td>
      <td>${row.festival}</td>
      <td>${row.remarks}</td>
      <td>${row.year}</td>
      <td>${row.updatedBy}</td>
    `;
    tbody.appendChild(tr);
  });
}

document.getElementById("searchBox").addEventListener("input", function () {
  const searchText = this.value.toLowerCase();
  document.querySelectorAll("#dataTable tbody tr").forEach((row) => {
    row.style.display = row.textContent.toLowerCase().includes(searchText)
      ? ""
      : "none";
  });
});

function downloadPDF() {
  window.print();
}
