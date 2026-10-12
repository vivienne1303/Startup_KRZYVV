(function () {
  const token = localStorage.getItem("teenlaunch_token");
  if (token) return;

  const path = window.location.pathname.replace(/\\/g, "/");
  const isPageFolder = path.includes("/pages/");
  const authPath = isPageFolder ? "auth.html" : "pages/auth.html";
  const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  window.location.replace(`${authPath}?mode=login&returnTo=${encodeURIComponent(returnTo)}`);
})();
