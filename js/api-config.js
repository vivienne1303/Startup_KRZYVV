(function () {
  const PRODUCTION_API_ORIGIN = "https://teenlaunch-production.up.railway.app";
  const hostname = window.location.hostname.toLowerCase();
  const isLocal = hostname === "localhost"
    || hostname === "127.0.0.1"
    || hostname === "::1"
    || /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname);

  // Local pages are commonly opened with a frontend-only server on port 3000.
  // Use Railway by default so /api requests do not hit that static server.
  // Backend developers can opt into a local API from the console with:
  // localStorage.setItem("teenlaunch-api-origin", "http://localhost:3001")
  const localOverride = isLocal ? localStorage.getItem("teenlaunch-api-origin") : "";
  const apiOrigin = String(localOverride || PRODUCTION_API_ORIGIN).replace(/\/$/, "");
  window.TEENLAUNCH_API_ORIGIN = apiOrigin;
  window.TEENLAUNCH_API_BASE = `${apiOrigin}/api`;

  // The compact application page predates the shared navigation include.
  // Load it after its one-line document has been parsed so it matches every other page.
  if (window.location.pathname.replace(/\\/g, "/").endsWith("/pages/apply.html")) {
    window.addEventListener("DOMContentLoaded", () => {
      const script = document.createElement("script");
      script.src = "../js/auth-nav.js";
      document.body.appendChild(script);
    }, { once: true });
  }
})();
