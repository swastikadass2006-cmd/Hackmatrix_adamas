
document.addEventListener("DOMContentLoaded", async () => {
  const urlEl = document.getElementById("active-url");
  const scoreVal = document.getElementById("score-val");
  const verdictVal = document.getElementById("verdict-val");
  const rescanBtn = document.getElementById("rescan-btn");

  async function auditActiveTab() {
    scoreVal.textContent = "...";
    verdictVal.textContent = "AUDITING";

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.url) {
        urlEl.textContent = "No active web tab.";
        return;
      }

      urlEl.textContent = tab.url;

      const response = await fetch("http://localhost:8000/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: tab.url }),
      });

      if (!response.ok) {
        scoreVal.textContent = "ERR";
        verdictVal.textContent = "FAILED";
        return;
      }

      const data = await response.json();
      scoreVal.textContent = data.trust_score.toString().padStart(2, "0");
      verdictVal.textContent = data.verdict.toUpperCase();

      scoreVal.className = "score-num score-" + data.verdict;
      verdictVal.className = "verdict-badge badge-" + data.verdict;
    } catch (err) {
      scoreVal.textContent = "--";
      verdictVal.textContent = "OFFLINE";
      urlEl.textContent = "Gateway at localhost:8000 offline";
    }
  }

  rescanBtn.addEventListener("click", auditActiveTab);
  auditActiveTab();
});

