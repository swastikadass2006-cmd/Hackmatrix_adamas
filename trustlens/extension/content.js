// TrustLens Manifest V3 In-Page Credential Interceptor
(function () {
  let hasWarned = false;

  function injectWarningModal(trustScore, verdict, reason) {
    if (document.getElementById("trustlens-shield-alert")) return;

    const banner = document.createElement("div");
    banner.id = "trustlens-shield-alert";
    banner.style.cssText = `
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 2147483647;
      background: #09090b;
      color: #fafafa;
      border: 2px solid #ef4444;
      border-radius: 12px;
      padding: 16px 20px;
      max-width: 420px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.8), 0 0 25px rgba(239,68,68,0.4);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      animation: trustlens-slidein 0.3s ease-out;
    `;

    banner.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="background: rgba(239,68,68,0.2); border-radius: 8px; padding: 6px; color: #ef4444; font-size: 20px; font-weight: bold;">
          ⚠️
        </div>
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <strong style="color: #f87171; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
              Phishing Warning (Score: ${trustScore}/100)
            </strong>
            <button id="trustlens-dismiss-btn" style="background: none; border: none; color: #a1a1aa; cursor: pointer; font-size: 16px;">&times;</button>
          </div>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #d4d4d8; line-height: 1.4;">
            ${reason || "This website is an unauthorized clone attempting credential exfiltration."}
          </p>
          <div style="font-size: 11px; font-weight: bold; color: #ef4444; background: rgba(239,68,68,0.1); padding: 4px 8px; border-radius: 4px;">
            ⛔ DO NOT ENTER PASSWORDS OR OTPs
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    document.getElementById("trustlens-dismiss-btn")?.addEventListener("click", () => {
      banner.remove();
    });
  }

  async function checkPageSafety() {
    if (hasWarned) return;
    const currentUrl = window.location.href;

    try {
      const response = await fetch("http://localhost:8000/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: currentUrl }),
      });

      if (!response.ok) return;
      const data = await response.json();

      if (data.verdict === "malicious" || data.trust_score <= 30) {
        hasWarned = true;
        const reason = data.override_reason || data.explanation?.headline || "Critical threat detected.";
        injectWarningModal(data.trust_score, data.verdict, reason);
      }
    } catch {
      // Backend gateway offline or unreachable
    }
  }

  // Intercept when user clicks or focuses any password input
  document.addEventListener("focusin", (e) => {
    if (e.target && e.target.type === "password") {
      checkPageSafety();
    }
  });

  // Also check immediately if the page has password inputs
  if (document.querySelector('input[type="password"]')) {
    checkPageSafety();
  }
})();
