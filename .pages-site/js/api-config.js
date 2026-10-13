(function () {
  const PRODUCTION_API_ORIGIN = "https://teenlaunch-production.up.railway.app";
  const hostname = window.location.hostname.toLowerCase();
  const isLocal = hostname === "localhost"
    || hostname === "127.0.0.1"
    || hostname === "::1"
    || /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname);

  // The local Express server serves both the website and /api on the same
  // origin. An explicit override remains available for split frontend/API
  // development setups.
  const localOverride = isLocal ? localStorage.getItem("teenlaunch-api-origin") : "";
  const defaultOrigin = isLocal ? window.location.origin : PRODUCTION_API_ORIGIN;
  const apiOrigin = String(localOverride || defaultOrigin).replace(/\/$/, "");
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
