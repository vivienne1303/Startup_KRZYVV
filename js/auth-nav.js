(function () {
  const API_BASE = window.TEENLAUNCH_API_BASE;
  const path = window.location.pathname.replace(/\\/g, "/");
  const inPagesFolder = path.includes("/pages/");
  const currentPage = path.split("/").pop() || "index.html";
  const settingsPages = new Set(["settings.html", "display-settings.html"]);
  const pageHref = (page) => (inPagesFolder ? page : `pages/${page}`);
  const homeHref = inPagesFolder ? "../index.html" : "index.html";
  const assetHref = (asset) => (inPagesFolder ? `../${asset}` : asset);
  const isCurrent = (...pages) => pages.includes(currentPage);

  const normaliseNavbar = () => {
    if (settingsPages.has(currentPage)) return;
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;
    const siteHeader = navbar.closest(".site-header");
    if (siteHeader) siteHeader.classList.add("standard-site-header");

    const brand = navbar.querySelector(".brand");
    if (brand) {
      brand.href = homeHref;
      brand.setAttribute("aria-label", "TeenLaunch home");
      const subtitle = brand.querySelector("small");
      if (subtitle) {
        subtitle.textContent = "Future founders start here";
        subtitle.dataset.i18n = "Future founders start here";
      }
    }

    let navToggle = navbar.querySelector(".nav-toggle");
    let createdToggle = false;
    if (!navToggle) {
      navToggle = document.createElement("button");
      navToggle.className = "nav-toggle";
      navToggle.type = "button";
      navToggle.setAttribute("aria-label", "Open navigation");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.innerHTML = "<span></span><span></span><span></span>";
      createdToggle = true;
    }

    let navLinks = navbar.querySelector(".nav-links");
    if (!navLinks) {
      navLinks = document.createElement("div");
      navLinks.className = "nav-links";
    }

    navLinks.innerHTML = `
      <a class="${isCurrent("index.html", "") ? "active" : ""}" href="${homeHref}" data-i18n="Home">Home</a>
      <div class="nav-dropdown opportunities-dropdown ${isCurrent("opportunities.html", "recommended-opportunities.html", "opportunity-details.html", "apply.html") ? "active" : ""}">
        <a class="nav-trigger" href="${pageHref("opportunities.html")}" data-i18n="Opportunities">Opportunities</a>
        <div class="dropdown-menu" aria-label="Opportunity navigation"><a href="${pageHref("opportunities.html")}" data-i18n="All Opportunities">All Opportunities</a><a href="${pageHref("recommended-opportunities.html")}" data-i18n="Recommended for You">Recommended for You</a></div>
      </div>
      <div class="nav-dropdown competitions-dropdown ${isCurrent("competitions.html", "competition_academic.html", "competition_non-academic.html") ? "active" : ""}">
        <a class="nav-trigger" href="${pageHref("competitions.html")}" data-i18n="Competitions">Competitions</a>
        <div class="dropdown-menu" aria-label="Competition categories"><a href="${pageHref("competition_academic.html")}" data-i18n="Academic">Academic</a><a href="${pageHref("competition_non-academic.html")}" data-i18n="Non-Academic">Non-Academic</a></div>
      </div>
      <a class="${isCurrent("resources.html") ? "active" : ""}" href="${pageHref("resources.html")}" data-i18n="Resources">Resources</a>
      <a class="${isCurrent("debate.html") ? "active" : ""}" href="${pageHref("debate.html")}" data-i18n="Soft Skills & Debate">Soft Skills &amp; Debate</a>
      <a class="${isCurrent("career-copilot.html", "aiassistant.html") ? "active" : ""}" href="${pageHref("career-copilot.html")}" data-i18n="Career Copilot">Career Copilot</a>
      <a class="auth-link" href="${pageHref("auth.html")}">Login</a>
      <a class="settings-button" href="${pageHref("settings.html")}" aria-label="Settings"><img src="${assetHref("assets/icons/settings.jpg")}" alt="" aria-hidden="true"></a>
      <button class="language-toggle" type="button" data-language-toggle aria-label="Switch language">中文</button>`;

    if (!navToggle.parentElement) navbar.appendChild(navToggle);
    if (!navLinks.parentElement) navbar.appendChild(navLinks);
    navbar.querySelectorAll(":scope > .dna-header-link").forEach((link) => link.remove());

    if (createdToggle) {
      navToggle.addEventListener("click", () => {
        const open = navLinks.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", String(open));
        navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      });
    }
  };

  normaliseNavbar();
  const authLink = document.querySelector(".auth-link");
  if (!authLink) return;
  const navLinks = authLink.closest(".nav-links");

  const clearSession = () => {
    localStorage.removeItem("teenlaunch_token");
    localStorage.removeItem("teenlaunch_user");
    localStorage.removeItem("teenlaunch_profile");
  };
  const addLink = (className, href, text, activePages) => {
    if (!navLinks || navLinks.querySelector(`.${className}`)) return;
    const link = document.createElement("a");
    link.className = `${className}${isCurrent(...activePages) ? " active" : ""}`;
    link.href = pageHref(href);
    link.textContent = text;
    link.dataset.i18n = text;
    navLinks.insertBefore(link, authLink);
  };
  const addProfileLink = () => addLink("profile-nav-link", "profile.html", "My Profile", ["profile.html", "account.html", "career_dna_test.html", "career_dna_result.html"]);
  const addPortfolioLink = () => addLink("portfolio-nav-link", "my-portfolio.html", "Portfolio", ["my-portfolio.html", "portfolio-builder.html"]);
  const addAdminLink = () => addLink("admin-dashboard-link", "admin-dashboard.html", "Admin Dashboard", ["admin-dashboard.html"]);
  const addSocialLinks = () => {
    if (!navLinks || navLinks.querySelector(".community-dropdown")) return;
    const wrapper = document.createElement("div");
    wrapper.className = `nav-dropdown community-dropdown${isCurrent("community.html", "inbox.html") ? " active" : ""}`;
    wrapper.innerHTML = `<a class="nav-trigger" href="${pageHref("community.html")}" data-i18n="Community">Community</a><div class="dropdown-menu" aria-label="Community navigation"><a href="${pageHref("community.html")}" data-i18n="Find People">Find People</a><a href="${pageHref("inbox.html")}" data-i18n="Inbox">Inbox</a></div>`;
    navLinks.insertBefore(wrapper, authLink);
  };

  const token = localStorage.getItem("teenlaunch_token");
  if (!token) {
    authLink.textContent = "Login";
    return;
  }

  const verifyRole = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error("Session could not be verified");
      const data = await response.json();
      localStorage.setItem("teenlaunch_user", JSON.stringify(data.user || {}));
      localStorage.setItem("teenlaunch_profile", JSON.stringify(data.profile || {}));
      addSocialLinks();
      addPortfolioLink();
      addProfileLink();
      if (data.role === "admin") addAdminLink();
    } catch (error) {
      console.warn("Session verification failed; clearing local session.", error);
      clearSession();
      authLink.textContent = "Login";
      authLink.classList.remove("is-logout");
      authLink.href = pageHref("auth.html");
    }
  };

  authLink.textContent = "Logout";
  authLink.classList.add("is-logout");
  authLink.href = "#logout";
  verifyRole();
  authLink.addEventListener("click", async (event) => {
    event.preventDefault();
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    } catch (error) {
      console.warn("Logout request failed; clearing local session.", error);
    } finally {
      clearSession();
      window.location.href = authLink.dataset.logoutRedirect || homeHref;
    }
  });
})();
