(function () {
  const API_BASE = window.TEENLAUNCH_API_BASE;
  const authLink = document.querySelector(".auth-link");
  if (!authLink) return;
  const inPagesFolder = window.location.pathname.replace(/\\/g, "/").includes("/pages/");
  const navLinks = authLink.closest(".nav-links");

  const clearSession = () => {
    localStorage.removeItem("teenlaunch_token");
    localStorage.removeItem("teenlaunch_user");
    localStorage.removeItem("teenlaunch_profile");
  };

  const token = localStorage.getItem("teenlaunch_token");
  if (!token) {
    authLink.textContent = "Login";
    return;
  }

  const addAdminLink = () => {
    if (!navLinks || navLinks.querySelector(".admin-dashboard-link")) return;

    const link = document.createElement("a");
    link.className = "admin-dashboard-link";
    link.href = inPagesFolder ? "admin-dashboard.html" : "pages/admin-dashboard.html";
    link.textContent = "Admin Dashboard";
    navLinks.insertBefore(link, authLink);
  };

  const addProfileLink = () => {
    if (!navLinks || navLinks.querySelector(".profile-nav-link")) return;
    const link = document.createElement("a");
    link.className = "profile-nav-link";
    link.href = inPagesFolder ? "profile.html" : "pages/profile.html";
    link.textContent = "My Profile";
    navLinks.insertBefore(link, authLink);
  };

  const verifyRole = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Session could not be verified");

      const data = await response.json();
      localStorage.setItem("teenlaunch_user", JSON.stringify(data.user || {}));
      localStorage.setItem("teenlaunch_profile", JSON.stringify(data.profile || {}));
      addProfileLink();

      if (data.role === "admin") addAdminLink();
    } catch (error) {
      console.warn("Session verification failed; clearing local session.", error);
      clearSession();
      authLink.textContent = "Login";
      authLink.classList.remove("is-logout");
      authLink.setAttribute("href", inPagesFolder ? "auth.html" : "pages/auth.html");
    }
  };

  authLink.textContent = "Logout";
  authLink.classList.add("is-logout");
  authLink.setAttribute("href", "#logout");
  verifyRole();

  authLink.addEventListener("click", async (event) => {
    event.preventDefault();

    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.warn("Logout request failed; clearing local session.", error);
    } finally {
      clearSession();
      window.location.href = authLink.dataset.logoutRedirect || (inPagesFolder ? "../index.html" : "index.html");
    }
  });
})();
