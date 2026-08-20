const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const revealElements = document.querySelectorAll(".reveal");
const searchInput = document.querySelector("#searchInput");
const categoryFilterContainer = document.querySelector(".filters[aria-label='Opportunity categories']");
let categoryFilters = document.querySelectorAll(".filter:not(.detail-filter)");
const detailFilters = document.querySelectorAll(".detail-filter");
let cards = document.querySelectorAll(".opportunity-card");
const emptyState = document.querySelector("#emptyState");
let isAdmin = false;

let activeFilter = "all";
let activeDetail = "all";
const preview = document.querySelector("[data-personalised-preview]");
const initialParams = new URLSearchParams(window.location.search);
const initialCategory = String(initialParams.get("category") || "").toLowerCase();
const categoryAliases = {
  competitions: "competition",
  volunteering: "volunteer",
  "innovation workshops": "workshop",
  workshops: "workshop",
  internships: "internship",
  hackathons: "hackathon",
  grants: "grant",
};
const categoryKey = (value) => String(value || "Other")
  .trim()
  .toLowerCase()
  .replace(/&/g, " and ")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "") || "other";
if (categoryAliases[initialCategory]) {
  activeFilter = categoryAliases[initialCategory];
  categoryFilters.forEach((button) => button.classList.toggle("active", button.dataset.filter === activeFilter));
}
if (initialParams.get("search")) searchInput.value = initialParams.get("search");

const updateHeader = () => {
  header.classList.toggle("scrolled", window.scrollY > 24);
};

const closeMenu = () => {
  navLinks.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("nav-open");
};

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("nav-open", isOpen);
});

navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

const filterCards = () => {
  const query = searchInput.value.trim().toLowerCase();
  let visibleCount = 0;

  cards.forEach((card) => {
    const matchesCategory = activeFilter === "all" || card.dataset.category === activeFilter;
    const matchesDetail = activeDetail === "all" || card.dataset.details.includes(activeDetail);
    const matchesSearch = card.dataset.title.includes(query) || card.textContent.toLowerCase().includes(query);
    const isVisible = matchesCategory && matchesDetail && matchesSearch;

    card.style.display = isVisible ? "grid" : "none";
    if (isVisible) visibleCount += 1;
  });

  emptyState.style.display = visibleCount ? "none" : "block";
};

const bindCategoryFilters = () => {
  categoryFilters = document.querySelectorAll(".filter:not(.detail-filter)");
  categoryFilters.forEach((button) => {
    button.addEventListener("click", () => {
      categoryFilters.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      activeFilter = button.dataset.filter;
      filterCards();
    });
  });
};

const renderCategoryFilters = (opportunities) => {
  if (!categoryFilterContainer) return;
  const categories = [...new Set(opportunities.map((item) => String(item.category || "Other").trim()).filter(Boolean))]
    .sort((first, second) => first.localeCompare(second));
  const availableKeys = new Set(categories.map(categoryKey));
  const exactRequestedKey = categoryKey(initialCategory);
  const requestedKey = availableKeys.has(exactRequestedKey) ? exactRequestedKey : (categoryAliases[initialCategory] || exactRequestedKey);
  activeFilter = initialCategory && availableKeys.has(requestedKey) ? requestedKey : "all";
  categoryFilterContainer.innerHTML = [
    `<button class="filter${activeFilter === "all" ? " active" : ""}" data-filter="all">All</button>`,
    ...categories.map((category) => `<button class="filter${activeFilter === categoryKey(category) ? " active" : ""}" data-filter="${escapeHtml(categoryKey(category))}">${escapeHtml(category)}</button>`),
  ].join("");
  bindCategoryFilters();
};

bindCategoryFilters();

detailFilters.forEach((button) => {
  button.addEventListener("click", () => {
    detailFilters.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    activeDetail = button.dataset.detail;
    filterCards();
  });
});

searchInput.addEventListener("input", filterCards);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealElements.forEach((element) => revealObserver.observe(element));
window.addEventListener("scroll", updateHeader);
updateHeader();

const resolveApiBase = () => window.TEENLAUNCH_API_BASE;
const translateUi = (text) => window.TeenLaunchI18n?.translate(text) || text;

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));

const opportunityMarkup = (opportunity) => {
  const category = categoryKey(opportunity.category);
  const mode = opportunity.mode === "in_person" ? "physical" : (opportunity.mode || "");
  const detailTokens = new Set();
  const format = String(opportunity.mode || opportunity.format || "").toLowerCase();
  if (["online", "hybrid"].includes(format)) detailTokens.add("online");
  if (["in_person", "physical", "hybrid"].includes(format)) detailTokens.add("physical");
  const rawMinimumAge = opportunity.minimum_age ?? opportunity.age_min;
  const rawMaximumAge = opportunity.maximum_age ?? opportunity.age_max;
  const minimumAge = rawMinimumAge === null || rawMinimumAge === undefined || rawMinimumAge === "" ? NaN : Number(rawMinimumAge);
  const maximumAge = rawMaximumAge === null || rawMaximumAge === undefined || rawMaximumAge === "" ? NaN : Number(rawMaximumAge);
  if (Number.isFinite(minimumAge) || Number.isFinite(maximumAge)) {
    const low = Number.isFinite(minimumAge) ? minimumAge : 0;
    const high = Number.isFinite(maximumAge) ? maximumAge : 99;
    if (low <= 13 && high >= 10) detailTokens.add("10-13");
    if (low <= 16 && high >= 14) detailTokens.add("14-16");
    if (low <= 19 && high >= 17) detailTokens.add("17-19");
  }
  const levelText = String(opportunity.level || opportunity.difficulty || opportunity.eligibility || "").toLowerCase();
  if (/beginner|introductory|no experience/.test(levelText)) detailTokens.add("beginner");
  if (/advanced|experienced|intermediate/.test(levelText)) detailTokens.add("advanced");
  const deadlineValue = opportunity.application_deadline || opportunity.deadline;
  if (deadlineValue) {
    const daysLeft = (new Date(`${deadlineValue}T23:59:59`) - new Date()) / 86400000;
    if (daysLeft >= 0 && daysLeft <= 30) detailTokens.add("soon");
  }
  const ageParts = [];
  if (Number.isFinite(minimumAge)) ageParts.push(`from ${minimumAge}`);
  if (Number.isFinite(maximumAge)) ageParts.push(`up to ${maximumAge}`);
  const displayDeadline = opportunity.application_deadline || opportunity.deadline;
  const metaItems = [
    `<li><strong>Deadline:</strong> ${displayDeadline ? new Date(`${displayDeadline}T00:00:00`).toLocaleDateString() : "Rolling"}</li>`,
    ageParts.length ? `<li><strong>Eligibility:</strong> Ages ${escapeHtml(ageParts.join(" "))}</li>` : "",
    [opportunity.mode, opportunity.location].filter(Boolean).length ? `<li>${escapeHtml([opportunity.mode, opportunity.location].filter(Boolean).join(" · "))}</li>` : "",
  ].filter(Boolean).join("");
  const officialUrl = opportunity.application_url || opportunity.source_url;
  const detailsHref = officialUrl || `opportunity-details.html?id=${encodeURIComponent(opportunity.id)}`;
  const detailsAttrs = officialUrl ? ' rel="noopener"' : '';
  const actions = isAdmin
    ? `<div class="opportunity-actions admin-opportunity-actions"><a class="btn secondary admin-edit-button" href="admin-dashboard.html?edit=${encodeURIComponent(opportunity.id)}"><img src="../assets/icons/edit-button.svg" alt="">Edit</a><button class="save-button admin-delete-button" type="button" data-delete-id="${escapeHtml(opportunity.id)}" data-delete-title="${escapeHtml(opportunity.title)}" aria-label="Delete ${escapeHtml(opportunity.title)}"><img src="../assets/icons/delete-icon.jpg" alt=""></button></div>`
    : `<div class="opportunity-actions user-opportunity-actions"><a class="btn secondary" href="${escapeHtml(detailsHref)}"${detailsAttrs}${officialUrl ? ` data-external-details="${escapeHtml(opportunity.id)}" data-opportunity-title="${escapeHtml(opportunity.title)}"` : ""}>Details</a><button class="save-button" type="button" data-save-id="${escapeHtml(opportunity.id)}" aria-label="Save ${escapeHtml(opportunity.title)}" aria-pressed="false"><img src="../assets/icons/save_icon.png" alt=""></button></div>`;
  const sourceLabel = opportunity.source_type === "partner" ? `Verified partner · ${opportunity.source_name || opportunity.organisation || "Partner"}` : opportunity.source_type === "ai_fetched" ? "External source · Admin reviewed" : "TeenLaunch verified";
  return `<article class="opportunity-card visible" data-opportunity-card-id="${escapeHtml(opportunity.id)}" data-category="${escapeHtml(category)}" data-details="${escapeHtml([...detailTokens].join(" ") || mode)}" data-title="${escapeHtml(String(opportunity.title || "").toLowerCase())}"><div class="opportunity-badges"><span class="tag">${escapeHtml(opportunity.category)}</span><span class="verification-badge verified">${escapeHtml(sourceLabel)}</span></div><h3>${escapeHtml(opportunity.title)}</h3><p class="opportunity-description">${escapeHtml(opportunity.description)}</p><ul class="opportunity-meta">${metaItems}</ul>${actions}</article>`;
};

const recommendationMarkup = ({ opportunity, match_percentage: percentage, explanation }) => {
  const base = opportunityMarkup(opportunity);
  return base.replace('<span class="tag">', `<div class="match-badge">${percentage}% match</div><span class="tag">`).replace(`<p class="opportunity-description">${escapeHtml(opportunity.description)}</p>`, `<p class="match-explanation">${escapeHtml(explanation)}</p><p class="opportunity-description">${escapeHtml(opportunity.description)}</p>`);
};

const loadRecommendationPreview = async () => {
  const token = localStorage.getItem("teenlaunch_token");
  if (!preview || !token || isAdmin) return;
  preview.hidden = false;
  const message = document.querySelector("[data-preview-message]");
  const grid = document.querySelector("[data-preview-grid]");
  try {
    const response = await fetch(`${resolveApiBase()}/opportunities/recommended`, { headers: { Authorization: `Bearer ${token}` } });
    if (response.status === 401 || response.status === 403) {
      message.innerHTML = `Your session has expired. <a href="auth.html?mode=login&returnTo=${encodeURIComponent("recommended-opportunities.html")}">Log in again to view recommendations.</a>`;
      return;
    }
    if (!response.ok) throw new Error("Recommendations unavailable");
    const data = await response.json();
    if (!data.completed) {
      message.innerHTML = `Complete your Career DNA Test to unlock personalised recommendations. <a href="career_dna_test.html">Take the Career DNA Test</a>`;
      return;
    }
    if (!data.recommendations?.length) { message.textContent = "No personalised matches are available yet."; return; }
    grid.innerHTML = data.recommendations.slice(0, 3).map(recommendationMarkup).join("");
    message.hidden = true;
  } catch (_) { message.textContent = "Personalised recommendations could not be loaded right now."; }
};

const bindOpportunityActions = async () => {
  const token = localStorage.getItem("teenlaunch_token");
  if (isAdmin) {
    document.querySelectorAll("[data-delete-id]").forEach((button) => button.addEventListener("click", async () => {
      if (!window.confirm(`${translateUi("Delete")} “${button.dataset.deleteTitle}”? ${translateUi("This cannot be undone.")}`)) return;
      button.disabled = true;
      try {
        const response = await fetch(`${resolveApiBase()}/opportunities/${encodeURIComponent(button.dataset.deleteId)}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error("Delete failed");
        document.querySelector(`[data-opportunity-card-id="${CSS.escape(button.dataset.deleteId)}"]`)?.remove();
        cards = document.querySelectorAll(".opportunity-card");
        filterCards();
      } catch (_) { window.alert(translateUi("The opportunity could not be deleted. Please try again.")); button.disabled = false; }
    }));
    return;
  }
  document.querySelectorAll(".save-button").forEach((button) => button.addEventListener("click", async () => {
    if (!token) { window.location.href = `auth.html?mode=login&returnTo=${encodeURIComponent("opportunities.html")}`; return; }
    const saving = !button.classList.contains("saved");
    button.classList.toggle("saved", saving);
    button.setAttribute("aria-pressed", String(saving));
    button.setAttribute("aria-label", saving ? "Remove from saved" : "Save opportunity");
    button.disabled = true;
    try {
      const response = await fetch(`${resolveApiBase()}/profile/saved${saving ? "" : `/${encodeURIComponent(button.dataset.saveId)}`}`, { method: saving ? "POST" : "DELETE", headers: { Authorization: `Bearer ${token}`, ...(saving ? { "Content-Type": "application/json" } : {}) }, body: saving ? JSON.stringify({ opportunity_id: button.dataset.saveId }) : undefined });
      if (!response.ok && response.status !== 409) throw new Error("Save failed");
    } catch (_) {
      button.classList.toggle("saved", !saving);
      button.setAttribute("aria-pressed", String(!saving));
      button.setAttribute("aria-label", saving ? "Save opportunity" : "Remove from saved");
      window.alert("We could not update this saved opportunity. Please try again.");
    }
    finally { button.disabled = false; }
  }));
  if (!token) return;
  const headers = { Authorization: `Bearer ${token}` };
  const [savedResponse, registrationsResponse] = await Promise.all([
    fetch(`${resolveApiBase()}/profile/saved`, { headers }),
    fetch(`${resolveApiBase()}/registrations/me`, { headers }),
  ]);
  if (savedResponse.ok) { const ids = new Set(((await savedResponse.json()).saved || []).map(item => item.opportunity_id)); document.querySelectorAll(".save-button").forEach(button => { const saved = ids.has(button.dataset.saveId); button.classList.toggle("saved", saved); button.setAttribute("aria-pressed", String(saved)); }); }
  if (registrationsResponse.ok) {
    const appliedIds = new Set(((await registrationsResponse.json()).registrations || []).map(item => item.opportunity_id));
    document.querySelectorAll(".apply-button").forEach((link) => {
      if (!appliedIds.has(link.dataset.opportunityId)) return;
      link.textContent = "Applied";
      link.classList.add("disabled");
      link.removeAttribute("href");
      link.setAttribute("aria-disabled", "true");
    });
  }
};

const setupExternalRegistrationPrompt = () => {
  const token = localStorage.getItem("teenlaunch_token");
  document.querySelectorAll("[data-external-details]").forEach((link) => link.addEventListener("click", () => {
    localStorage.setItem("teenlaunch_pending_external", JSON.stringify({
      id: link.dataset.externalDetails,
      title: link.dataset.opportunityTitle,
      url: link.href,
      openedAt: Date.now(),
    }));
  }));
  if (window.externalRegistrationPromptBound) return;
  window.externalRegistrationPromptBound = true;
  const showPrompt = () => {
    let pending;
    try { pending = JSON.parse(localStorage.getItem("teenlaunch_pending_external") || "null"); } catch { pending = null; }
    if (!pending || Date.now() - pending.openedAt < 800 || document.querySelector(".external-registration-dialog")) return;
    const dialog = document.createElement("dialog");
    dialog.className = "external-registration-dialog";
    dialog.innerHTML = `<form method="dialog"><p class="eyebrow">Application check-in</p><h2>Did you register?</h2><article><strong>${escapeHtml(pending.title)}</strong><small>You opened the official application page.</small></article><p>Did you actually register for this opportunity?</p><div><button class="btn primary" value="yes" type="button" data-confirm-external>Yes, I registered</button><button class="btn secondary" value="no">No, I was just checking</button></div><p class="external-registration-message" aria-live="polite"></p></form>`;
    document.body.appendChild(dialog);
    dialog.addEventListener("close", () => { localStorage.removeItem("teenlaunch_pending_external"); dialog.remove(); });
    dialog.querySelector("[data-confirm-external]").addEventListener("click", async (event) => {
      const button = event.currentTarget, message = dialog.querySelector(".external-registration-message");
      if (!token) {
        location.href = `auth.html?mode=login&returnTo=${encodeURIComponent("opportunities.html")}`;
        return;
      }
      button.disabled = true; message.textContent = "Saving to your profile…";
      try {
        const response = await fetch(`${resolveApiBase()}/registrations/external-confirm`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ opportunity_id: pending.id }) });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error?.message || "Could not record your registration");
        localStorage.removeItem("teenlaunch_pending_external");
        const registrationId = data.registration.id;
        const form = dialog.querySelector("form");
        form.innerHTML = `<p class="eyebrow">Next step</p><h2>Add to your portfolio?</h2><p>We can remind you to upload proof of participation and a reflection later. It will not be marked verified until proof is reviewed.</p><div><button class="btn primary" type="button" data-add-portfolio>Yes, add reminder</button><button class="btn secondary" type="button" data-skip-portfolio>No thanks</button></div><p class="external-registration-message" aria-live="polite"></p>`;
        form.querySelector("[data-skip-portfolio]").addEventListener("click", () => { dialog.close(); location.href = "profile.html?tab=applied"; });
        form.querySelector("[data-add-portfolio]").addEventListener("click", async (portfolioEvent) => {
          const portfolioButton = portfolioEvent.currentTarget, portfolioMessage = form.querySelector(".external-registration-message");
          portfolioButton.disabled = true; portfolioMessage.textContent = "Adding portfolio reminder…";
          try {
            const reminderResponse = await fetch(`${resolveApiBase()}/registrations/${encodeURIComponent(registrationId)}/portfolio-reminder`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
            const reminderData = await reminderResponse.json().catch(() => ({}));
            if (!reminderResponse.ok) throw new Error(reminderData.error?.message || "Could not add the portfolio reminder");
            form.innerHTML = `<p class="eyebrow">Registration recorded</p><h2>You’re all set!</h2><p>We’ll keep this opportunity in your profile and remind you to add proof of participation and a reflection.</p><div><a class="btn primary" href="portfolio-builder.html">Go to Portfolio →</a><a class="btn secondary" href="profile.html?tab=applied">View in Profile</a></div>`;
          } catch (error) { portfolioMessage.textContent = error.message; portfolioButton.disabled = false; }
        });
      } catch (error) { message.textContent = error.message; button.disabled = false; }
    });
    dialog.showModal();
  };
  window.addEventListener("focus", showPrompt);
  window.addEventListener("pageshow", showPrompt);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) showPrompt(); });
  window.setTimeout(showPrompt, 1200);
};

const loadOpportunities = async () => {
  const grid = document.querySelector("#opportunityGrid");
  grid.setAttribute("aria-busy", "true");
  grid.innerHTML = `
    <div class="opportunity-load-state" role="status">
      <span class="opportunity-spinner" aria-hidden="true"></span>
      <strong>Loading verified opportunities...</strong>
      <p>Checking current deadlines and application details.</p>
    </div>`;
  emptyState.style.display = "none";
  try {
    const token = localStorage.getItem("teenlaunch_token");
    const sessionRequest = token
      ? fetch(`${resolveApiBase()}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      : Promise.resolve(null);
    const [response, sessionResponse] = await Promise.all([
      fetch(`${resolveApiBase()}/opportunities`),
      sessionRequest,
    ]);
    if (sessionResponse?.ok) isAdmin = (await sessionResponse.json()).role === "admin";
    if (!response.ok) throw new Error("Verified opportunities could not be loaded.");
    const { opportunities } = await response.json();
    if (!Array.isArray(opportunities)) throw new Error("The opportunity response was invalid.");
    if (!opportunities.length) {
      grid.innerHTML = "";
      const message = "No verified opportunities are open right now. Please check again soon.";
      emptyState.hidden = false;
      emptyState.removeAttribute("data-i18n");
      emptyState.style.setProperty("display", "block", "important");
      emptyState.textContent = translateUi(message);
      return;
    }
    renderCategoryFilters(opportunities);
    grid.innerHTML = opportunities.map(opportunityMarkup).join("");
    cards = document.querySelectorAll("#opportunityGrid .opportunity-card");
    filterCards();
    bindOpportunityActions().catch(() => {});
    setupExternalRegistrationPrompt();
    loadRecommendationPreview();
  } catch (_) {
    grid.innerHTML = "";
    cards = document.querySelectorAll("#opportunityGrid .opportunity-card");
    emptyState.hidden = false;
    emptyState.removeAttribute("data-i18n");
    emptyState.style.setProperty("display", "block", "important");
    emptyState.innerHTML = `${translateUi("Verified opportunities could not be loaded right now.")} <button class="btn secondary opportunity-retry" type="button">${translateUi("Try again")}</button>`;
    emptyState.querySelector(".opportunity-retry").addEventListener("click", loadOpportunities, { once: true });
  } finally {
    grid.removeAttribute("aria-busy");
  }
};

loadOpportunities();
