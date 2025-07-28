const scriptURL = "https://script.google.com/macros/s/AKfycbxmZpb_VseccxhaEnUR9GHN_iy1lblFJgCDW3rOxUNHXX6fPMAxu66y7sCSb0vb7up5/exec"; 

function handleCredentialResponse(response) {
  const data = jwt_decode(response.credential);
  document.getElementById("submittedBy").value = data.email;
  document.getElementById("googleSignIn").style.display = "none";
}

window.onload = function () {
  google.accounts.id.initialize({
    // client_id: "207915409411-dctd16ba0gvr3t8d3hq2hgdkg541b0cj.apps.googleusercontent.com",
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
    const response = await fetch(
      scriptURL,
      {
        method: "POST",
        body: new URLSearchParams(jsonData),
        // mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

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

async function fetchData() {
  try {
    const response = await fetch(`${scriptURL}?action=read`);
    const data = await response.json();

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

  } catch (err) {
    console.error("Fetching error:", err);
    alert("❌ Failed to load data.");
  }
}
