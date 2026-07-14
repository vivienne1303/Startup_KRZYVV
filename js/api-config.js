(function () {
  const LOCAL_API_ORIGIN = "http://localhost:3000";
  const PRODUCTION_API_ORIGIN = "https://teenlaunch-production.up.railway.app";
  const hostname = window.location.hostname.toLowerCase();
  const isLocal = hostname === "localhost"
    || hostname === "127.0.0.1"
    || hostname === "::1"
    || /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname);

  const apiOrigin = isLocal ? LOCAL_API_ORIGIN : PRODUCTION_API_ORIGIN;
  window.TEENLAUNCH_API_ORIGIN = apiOrigin;
  window.TEENLAUNCH_API_BASE = `${apiOrigin}/api`;
})();
