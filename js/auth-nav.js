(function () {
  const API_BASE = window.TEENLAUNCH_API_BASE;
  const path = window.location.pathname.replace(/\\/g, "/");
  const inPagesFolder = path.includes("/pages/");
  const currentPage = path.split("/").pop() || "index.html";
  const pageHref = (page) => (inPagesFolder ? page : `pages/${page}`);
  const homeHref = inPagesFolder ? "../index.html" : "index.html";
  const assetHref = (asset) => (inPagesFolder ? `../${asset}` : asset);
  const isCurrent = (...pages) => pages.includes(currentPage);
  const storedToken = localStorage.getItem("teenlaunch_token");
  const publicPages = new Set(["index.html", "auth.html", "public-portfolio.html", "opportunities.html", "opportunity-details.html"]);

  if (!storedToken && !publicPages.has(currentPage)) {
    const returnTo = `${currentPage}${window.location.search}${window.location.hash}`;
    window.location.replace(`${pageHref("auth.html")}?mode=login&returnTo=${encodeURIComponent(returnTo)}`);
    return;
  }

  const normaliseNavbar = () => {
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
        <div class="dropdown-menu" aria-label="Opportunity navigation"><a href="${pageHref("opportunities.html")}" data-i18n="All Opportunities">All Opportunities</a><a href="${pageHref("recommended-opportunities.html")}" data-i18n="Recommended for You">Recommended for You</a><a href="${pageHref("partner-submission.html")}" data-i18n="Submit an Opportunity">Submit an Opportunity</a></div>
      </div>
      <div class="nav-dropdown competitions-dropdown ${isCurrent("competitions.html", "competition_academic.html", "competition_non-academic.html") ? "active" : ""}">
        <a class="nav-trigger" href="${pageHref("competitions.html")}" data-i18n="Competitions">Competitions</a>
        <div class="dropdown-menu" aria-label="Competition categories"><a href="${pageHref("competition_academic.html")}" data-i18n="Academic">Academic</a><a href="${pageHref("competition_non-academic.html")}" data-i18n="Non-Academic">Non-Academic</a></div>
      </div>
      <a class="${isCurrent("resources.html") ? "active" : ""}" href="${pageHref("resources.html")}" data-i18n="Resources">Resources</a>
      <a class="${isCurrent("debate.html") ? "active" : ""}" href="${pageHref("debate.html")}" data-i18n="Soft Skills & Debate">Soft Skills &amp; Debate</a>
      <a class="${isCurrent("career-copilot.html", "aiassistant.html") ? "active" : ""}" href="${pageHref("career-copilot.html")}" data-i18n="Career Copilot">Career Copilot</a>
      <a class="${isCurrent("life-planner.html") ? "active" : ""}" href="${pageHref("life-planner.html")}" data-i18n="Life Planner">Life Planner</a>
      <a href="${inPagesFolder ? "../mobile-showcase.html" : "mobile-showcase.html"}">Mobile App</a>
      <a class="auth-link" href="${pageHref("auth.html")}">Login</a>
      <a class="settings-button${isCurrent("settings.html", "display-settings.html") ? " active" : ""}" href="${pageHref("settings.html")}" aria-label="Settings"><span aria-hidden="true">⚙</span></a>
      <button class="language-toggle" type="button" data-language-toggle aria-label="Switch language">中文</button>`;

    navLinks.innerHTML = `
      <a class="${isCurrent("index.html", "") ? "active" : ""}" href="${homeHref}">Home</a>
      <a class="${isCurrent("opportunities.html", "competitions.html", "competition_academic.html", "competition_non-academic.html") ? "active" : ""}" href="${pageHref("opportunities.html")}">Explore</a>
      <a class="${isCurrent("my-journey.html", "career_dna_test.html", "career_dna_result.html", "recommended-opportunities.html", "life-planner.html") ? "active" : ""}" href="${pageHref("my-journey.html")}">My Journey</a>
      <a class="${isCurrent("profile.html", "portfolio-builder.html", "my-portfolio.html", "public-portfolio.html") ? "active" : ""}" href="${pageHref("profile.html?tab=applied")}">Profile</a>
      <a class="${isCurrent("about.html", "help.html", "partner-submission.html") ? "active" : ""}" href="${pageHref("about.html")}">About</a>
      <a class="auth-link" href="${pageHref("auth.html")}">Login</a>`;

    const dropdowns = navLinks.querySelectorAll(".nav-dropdown");
    dropdowns.forEach((dropdown) => {
      const trigger = dropdown.querySelector(".nav-trigger");
      if (trigger) {
        trigger.setAttribute("aria-expanded", "false");
        trigger.addEventListener("click", (event) => {
          if (!window.matchMedia("(max-width: 1460px)").matches) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          const willOpen = !dropdown.classList.contains("open");
          dropdowns.forEach((other) => {
            other.classList.remove("open");
            other.querySelector(".nav-trigger")?.setAttribute("aria-expanded", "false");
          });
          dropdown.classList.toggle("open", willOpen);
          trigger.setAttribute("aria-expanded", String(willOpen));
        });
      }
      dropdown.addEventListener("pointerenter", () => {
        dropdowns.forEach((other) => {
          if (other === dropdown || !other.contains(document.activeElement)) return;
          document.activeElement.blur();
        });
      });
    });

    if (!navToggle.parentElement) navbar.appendChild(navToggle);
    if (!navLinks.parentElement) navbar.appendChild(navLinks);
    navbar.querySelectorAll(":scope > .dna-header-link").forEach((link) => link.remove());

    // Opening a large menu inside a sticky header can trigger browser scroll
    // anchoring, especially on mobile. Keep the user's current reading position
    // while either this script or a page-specific script toggles the menu.
    let menuScrollPosition = window.scrollY;
    navToggle.addEventListener("pointerdown", () => {
      menuScrollPosition = window.scrollY;
    }, true);
    navToggle.addEventListener("click", (event) => {
      const scrollPosition = event.detail > 0 ? menuScrollPosition : window.scrollY;
      window.requestAnimationFrame(() => {
        window.scrollTo(0, scrollPosition);
        window.requestAnimationFrame(() => window.scrollTo(0, scrollPosition));
      });
    }, true);

    if (createdToggle) {
      navToggle.addEventListener("click", () => {
        const open = navLinks.classList.toggle("open");
        if (!open) {
          dropdowns.forEach((dropdown) => {
            dropdown.classList.remove("open");
            dropdown.querySelector(".nav-trigger")?.setAttribute("aria-expanded", "false");
          });
        }
        navToggle.setAttribute("aria-expanded", String(open));
        navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      });
    }
  };

  normaliseNavbar();
  const explorePages = ["opportunities.html", "recommended-opportunities.html", "competitions.html", "competition_academic.html", "competition_non-academic.html"];
  if (explorePages.includes(currentPage) && !document.querySelector(".explore-section-nav")) {
    const exploreNav = document.createElement("nav");
    exploreNav.className = "explore-section-nav";
    exploreNav.setAttribute("aria-label", "Explore sections");
    exploreNav.innerHTML = `
      <a class="${currentPage === "opportunities.html" ? "active" : ""}" href="${pageHref("opportunities.html")}">All Opportunities</a>
      <a class="${currentPage === "recommended-opportunities.html" ? "active" : ""}" href="${pageHref("recommended-opportunities.html")}">Recommended for You</a>
      <div class="explore-competition-group">
        <a class="${["competitions.html", "competition_academic.html", "competition_non-academic.html"].includes(currentPage) ? "active" : ""}" href="${pageHref("competitions.html")}">Competitions</a>
        <div class="explore-subfilters" aria-label="Competition filters">
          <a class="${currentPage === "competition_academic.html" ? "active" : ""}" href="${pageHref("competition_academic.html")}">Academic</a>
          <a class="${currentPage === "competition_non-academic.html" ? "active" : ""}" href="${pageHref("competition_non-academic.html")}">Non-Academic</a>
        </div>
      </div>`;
    document.querySelector("main")?.prepend(exploreNav);
  }
  if (!document.querySelector(".ask-teenlaunch-fab")) {
    const ask = document.createElement("a");
    ask.className = "ask-teenlaunch-fab";
    ask.href = pageHref("aiassistant.html");
    ask.setAttribute("aria-label", "Ask TeenLaunch AI");
    ask.innerHTML = "<span aria-hidden=\"true\">✨</span> Ask TeenLaunch";
    document.body.appendChild(ask);
  }
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
  const addProfileLink = () => {};
  const addAdminLink = () => {
    addLink("admin-dashboard-link", "admin-dashboard.html", "Admin Dashboard", ["admin-dashboard.html"]);
  };

  const token = storedToken;
  if (!token) {
    authLink.textContent = "Login";
    return;
  }

  const verifyRole = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.status === 401 || response.status === 403) {
        clearSession();
        authLink.textContent = "Login";
        authLink.classList.remove("is-logout");
        authLink.href = pageHref("auth.html");
        return;
      }
      if (!response.ok) throw new Error(`Session verification failed (${response.status})`);
      const data = await response.json();
      localStorage.setItem("teenlaunch_user", JSON.stringify(data.user || {}));
      localStorage.setItem("teenlaunch_profile", JSON.stringify(data.profile || {}));
      addProfileLink();
      if (data.role === "admin") addAdminLink();
    } catch (error) {
      // Mobile connections can briefly fail while changing network or resuming a
      // browser tab. Keep the local session unless the API explicitly rejects it.
      console.warn("Session verification was unavailable; keeping the local session.", error);
    }
  };

  authLink.textContent = "Logout";
  authLink.classList.add("is-logout");
  authLink.href = pageHref("auth.html");
  addProfileLink();
  verifyRole();
  const logout = async (event) => {
    if (!authLink.classList.contains("is-logout")) return;
    event.preventDefault();
    event.stopPropagation();
    authLink.setAttribute("aria-disabled", "true");
    authLink.textContent = "Logging out...";
    clearSession();
    try {
      await Promise.race([
        fetch(`${API_BASE}/auth/logout`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }),
        new Promise((resolve) => window.setTimeout(resolve, 1500)),
      ]);
    } catch (error) {
      console.warn("Logout request failed; local session was still cleared.", error);
    } finally {
      window.location.replace(authLink.dataset.logoutRedirect || homeHref);
    }
  };
  authLink.addEventListener("click", logout);
  document.addEventListener("click", (event) => {
    const logoutLink = event.target.closest(".auth-link.is-logout");
    if (!logoutLink || logoutLink === authLink) return;
    logout(event);
  }, true);
})();
