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

const filterCards = () => { currentPage = 1; loadPage(); };

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
  // Keep the focused category button in the DOM across page/filter changes.
  const signature = JSON.stringify(categories);
  if (categoryFilterContainer.dataset.categories === signature) {
    categoryFilters.forEach(button => {
      button.classList.toggle("active", button.dataset.filter === activeFilter);
      button.setAttribute("aria-pressed", String(button.dataset.filter === activeFilter));
    });
    return;
  }
  categoryFilterContainer.dataset.categories = signature;
  categoryFilterContainer.innerHTML = [
    `<button type="button" aria-pressed="${activeFilter === "all"}" class="filter${activeFilter === "all" ? " active" : ""}" data-filter="all">All</button>`,
    ...categories.map((category) => `<button type="button" aria-pressed="${activeFilter === categoryKey(category)}" class="filter${activeFilter === categoryKey(category) ? " active" : ""}" data-filter="${escapeHtml(categoryKey(category))}">${escapeHtml(category)}</button>`),
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

let searchTimer;
searchInput.addEventListener("input", () => { clearTimeout(searchTimer); searchTimer = setTimeout(filterCards, 250); });

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
    `<li class="opportunity-location">${escapeHtml(OpportunityFilters.locationLabel(opportunity, language()))}</li>`,
    `<li>${escapeHtml(translateUi(({ online: "Online", in_person: "In person", hybrid: "Hybrid" })[opportunity.format || opportunity.mode] || "Format not specified"))}${opportunity.travel_required == null ? "" : ` · ${escapeHtml(translateUi(opportunity.travel_required ? "Travel required" : "No travel required"))}`}</li>`,
  ].filter(Boolean).join("");
  const internal = opportunity.application_method === "internal" && opportunity.internal_application_enabled === true;
  const candidateUrl = opportunity.application_url || opportunity.source_url;
  const officialUrl = !internal && /^https?:\/\//i.test(candidateUrl || "") ? candidateUrl : null;
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
    if (response.status === 403 && (await response.clone().json()).code === "PREMIUM_REQUIRED") {
      grid.innerHTML = "";
      message.innerHTML = `Personalised recommendations require Premium. <a href="../index.html#pricing">View plans</a>`;
      return;
    }
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
    document.querySelectorAll("#opportunityGrid [data-delete-id]").forEach((button) => button.addEventListener("click", async () => {
      if (!window.confirm(`${translateUi("Delete")} “${button.dataset.deleteTitle}”? ${translateUi("This cannot be undone.")}`)) return;
      button.disabled = true;
      try {
        const response = await fetch(`${resolveApiBase()}/opportunities/${encodeURIComponent(button.dataset.deleteId)}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error("Delete failed");
        document.querySelector(`[data-opportunity-card-id="${CSS.escape(button.dataset.deleteId)}"]`)?.remove();
        cards = document.querySelectorAll(".opportunity-card");
        legacyRows = null;
        loadPage();
      } catch (_) { window.alert(translateUi("The opportunity could not be deleted. Please try again.")); button.disabled = false; }
    }));
    return;
  }
  document.querySelectorAll("#opportunityGrid .save-button").forEach((button) => button.addEventListener("click", async () => {
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
  if (savedResponse.ok) { const ids = new Set(((await savedResponse.json()).saved || []).map(item => item.opportunity_id)); document.querySelectorAll("#opportunityGrid .save-button").forEach(button => { const saved = ids.has(button.dataset.saveId); button.classList.toggle("saved", saved); button.setAttribute("aria-pressed", String(saved)); }); }
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
  if (window.externalRegistrationPromptBound) return;
  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-external-details]");
    if (!link) return;
    localStorage.setItem("teenlaunch_pending_external", JSON.stringify({
      id: link.dataset.externalDetails,
      title: link.dataset.opportunityTitle,
      url: link.href,
      openedAt: Date.now(),
    }));
  });
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
        const form = dialog.querySelector("form");
        form.innerHTML = `<p class="eyebrow">Application recorded</p><h2>Saved to your profile</h2><p>You marked this opportunity as applied. This does not submit an application or confirm acceptance by the organiser. Check your confirmation from the organiser.</p><div><a class="btn primary" href="profile.html?tab=applied">View My Applications</a><button class="btn secondary" value="close">Close</button></div>`;
      } catch (error) { message.textContent = error.message; button.disabled = false; }
    });
    dialog.showModal();
  };
  window.addEventListener("focus", showPrompt);
  window.addEventListener("pageshow", showPrompt);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) showPrompt(); });
  window.setTimeout(showPrompt, 1200);
};

const language = () => window.TeenLaunchI18n?.getLanguage() || "en";
const locationFilter = document.querySelector("#locationFilter");
const countrySearch = document.querySelector("#countrySearch");
const resultCount = document.querySelector("#resultCount");
const previousPage = document.querySelector("#previousPage");
const nextPage = document.querySelector("#nextPage");
let currentPage = 1, currentCountry = "all", requestVersion = 0, currentRequest;
let currentResult = null, countryCodes = [], legacyRows = null;
activeFilter = initialCategory === "innovation workshops" ? "workshops" : initialCategory ? categoryKey(initialCategory) : "all";

const renderCountryOptions = () => {
  const query = countrySearch.value.trim().toLowerCase();
  const matching = countryCodes.filter(code => [code, OpportunityFilters.countryName(code, "en"), OpportunityFilters.countryName(code, "zh")].some(name => name.toLowerCase().includes(query)));
  const visible = [...new Set([...matching, ...(countryCodes.includes(currentCountry) ? [currentCountry] : [])])]
    .sort((a,b) => OpportunityFilters.countryName(a, language()).localeCompare(OpportunityFilters.countryName(b, language()), language()));
  locationFilter.innerHTML = `<option value="all">${escapeHtml(translateUi("All opportunities"))}</option><option value="global">${escapeHtml(translateUi("Global opportunities"))}</option>`
    + visible.map(code => `<option value="${escapeHtml(code)}">${escapeHtml(OpportunityFilters.countryName(code, language()))}</option>`).join("");
  locationFilter.value = currentCountry;
  document.querySelector("#countrySearchStatus").innerHTML = query && !matching.length ? escapeHtml(translateUi("No matching countries. Try another country name.")) : "";
  document.querySelector("#clearLocation").disabled = currentCountry === "all" && !query;
};
const renderPage = () => {
  if (!currentResult) return;
  const { opportunities, total, page, pages, facets } = currentResult;
  countryCodes = facets.countries;
  renderCountryOptions();
  renderCategoryFilters(facets.categories.map(category => ({category})));
  const grid = document.querySelector("#opportunityGrid");
  grid.innerHTML = opportunities.map(opportunityMarkup).join("");
  cards = grid.querySelectorAll(".opportunity-card");
  const first = total ? (page - 1) * 25 + 1 : 0, last = Math.min(page * 25, total);
  resultCount.innerHTML = escapeHtml(language() === "zh" ? `显示第 ${first}–${last} 条，共 ${total} 个机会` : `Showing ${first}–${last} of ${total} opportunities`);
  document.querySelector("#pageStatus").innerHTML = escapeHtml(language() === "zh" ? `第 ${page} 页，共 ${pages} 页` : `Page ${page} of ${pages}`);
  previousPage.disabled = page <= 1;
  nextPage.disabled = page >= pages;
  emptyState.hidden = total > 0;
  emptyState.style.display = total ? "none" : "block";
  emptyState.innerHTML = total ? "" : `<p>${escapeHtml(translateUi("No opportunities match these filters. Try another country, broaden your search, or clear the filters."))}</p><p>${escapeHtml(translateUi("Listings with unspecified eligibility appear under All opportunities only."))}</p>`;
  bindOpportunityActions().catch(() => {});
};
const loadPage = async () => {
  const version = ++requestVersion;
  currentRequest?.abort();
  currentRequest = new AbortController();
  const controller = currentRequest;
  const timeout = setTimeout(() => controller.abort(), 15000);
  const grid = document.querySelector("#opportunityGrid");
  grid.setAttribute("aria-busy", "true");
  previousPage.disabled = nextPage.disabled = true;
  resultCount.innerHTML = escapeHtml(translateUi("Loading verified opportunities..."));
  emptyState.hidden = true;
  emptyState.style.display = "none";
  const filters = { search: searchInput.value.trim(), category: activeFilter, detail: activeDetail, country: currentCountry, page: currentPage };
  try {
    let data;
    if (legacyRows) data = OpportunityFilters.browse(legacyRows, filters);
    else {
      const response = await fetch(`${resolveApiBase()}/opportunities?${new URLSearchParams({ paged: "true", ...filters })}`, { signal: controller.signal });
      if (!response.ok) throw new Error("Opportunities unavailable");
      data = await response.json();
      // The old API ignores paged and applies some filters itself. Fetch an unfiltered
      // copy once during a staggered deployment; never mistake one filtered page for all data.
      if (!data.facets) {
        const legacyResponse = await fetch(`${resolveApiBase()}/opportunities`, { signal: controller.signal });
        if (!legacyResponse.ok) throw new Error("Opportunities unavailable");
        const legacy = await legacyResponse.json();
        if (!Array.isArray(legacy.opportunities)) throw new Error("Invalid opportunities");
        if (version !== requestVersion) return;
        legacyRows = legacy.opportunities;
        data = OpportunityFilters.browse(legacyRows, filters);
      }
    }
    if (version !== requestVersion) return;
    if (!Array.isArray(data.opportunities) || !data.facets) throw new Error("Invalid opportunities");
    currentResult = data;
    currentPage = data.page;
    renderPage();
  } catch (_) {
    if (version !== requestVersion) return;
    grid.innerHTML = "";
    currentResult = null;
    resultCount.innerHTML = "";
    document.querySelector("#pageStatus").innerHTML = "";
    emptyState.hidden = false;
    emptyState.style.display = "block";
    emptyState.innerHTML = `${escapeHtml(translateUi("Verified opportunities could not be loaded right now."))} <button class="btn secondary opportunity-retry" type="button">${escapeHtml(translateUi("Try again"))}</button>`;
    emptyState.querySelector("button").addEventListener("click", loadPage, { once: true });
  } finally {
    clearTimeout(timeout);
    if (version === requestVersion) grid.removeAttribute("aria-busy");
  }
};
countrySearch.addEventListener("input", renderCountryOptions);
locationFilter.addEventListener("change", () => { currentCountry = locationFilter.value; filterCards(); });
document.querySelector("#clearLocation").addEventListener("click", () => { currentCountry = "all"; countrySearch.value = ""; filterCards(); });
document.querySelector("#clearFilters").addEventListener("click", () => {
  clearTimeout(searchTimer);
  currentCountry = activeFilter = activeDetail = "all";
  countrySearch.value = searchInput.value = "";
  detailFilters.forEach(button => button.classList.toggle("active", button.dataset.detail === "all"));
  filterCards();
});
previousPage.addEventListener("click", () => { currentPage--; loadPage(); });
nextPage.addEventListener("click", () => { currentPage++; loadPage(); });
document.addEventListener("teenlaunch:languagechange", () => { renderPage(); });
const loadOpportunities = async () => {
  const token = localStorage.getItem("teenlaunch_token");
  if (token) {
    try {
      const response = await fetch(`${resolveApiBase()}/auth/me`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000) });
      if (response.ok) isAdmin = (await response.json()).role === "admin";
    } catch (_) { /* Public opportunities remain available without session verification. */ }
  }
  await loadPage();
  setupExternalRegistrationPrompt();
  loadRecommendationPreview();
};
loadOpportunities();
