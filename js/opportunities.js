const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const revealElements = document.querySelectorAll(".reveal");
const searchInput = document.querySelector("#searchInput");
const filters = document.querySelectorAll(".filter");
const categoryFilters = document.querySelectorAll(".filter:not(.detail-filter)");
const detailFilters = document.querySelectorAll(".detail-filter");
let cards = document.querySelectorAll(".opportunity-card");
const emptyState = document.querySelector("#emptyState");
let isAdmin = false;

let activeFilter = "all";
let activeDetail = "all";
const preview = document.querySelector("[data-personalised-preview]");

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

categoryFilters.forEach((button) => {
  button.addEventListener("click", () => {
    categoryFilters.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    filterCards();
  });
});

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
  const categoryLabel = String(opportunity.category || "other").toLowerCase();
  const category = categoryLabel.includes("startup") ? "startup" : categoryLabel.includes("camp") ? "camp" : categoryLabel.includes("workshop") ? "workshop" : categoryLabel.includes("intern") ? "internship" : categoryLabel.includes("entrepreneur") ? "entrepreneurship" : categoryLabel;
  const mode = opportunity.mode === "in_person" ? "physical" : (opportunity.mode || "");
  const ages = `${opportunity.age_min || "Any"}-${opportunity.age_max || "Any"}`;
  const actions = isAdmin
    ? `<div class="opportunity-actions admin-opportunity-actions"><a class="btn secondary admin-edit-button" href="admin-dashboard.html?edit=${encodeURIComponent(opportunity.id)}"><img src="../assets/icons/edit-button.svg" alt="">Edit</a><button class="save-button admin-delete-button" type="button" data-delete-id="${escapeHtml(opportunity.id)}" data-delete-title="${escapeHtml(opportunity.title)}" aria-label="Delete ${escapeHtml(opportunity.title)}"><img src="../assets/icons/delete-icon.jpg" alt=""></button></div>`
    : `<div class="opportunity-actions user-opportunity-actions"><a class="btn secondary" href="opportunity-details.html?id=${encodeURIComponent(opportunity.id)}">Details</a><a class="btn secondary apply-button" href="apply.html?id=${encodeURIComponent(opportunity.id)}" data-opportunity-id="${escapeHtml(opportunity.id)}">Apply</a><button class="save-button" type="button" data-save-id="${escapeHtml(opportunity.id)}" aria-label="Save ${escapeHtml(opportunity.title)}" aria-pressed="false"><img src="../assets/icons/save_icon.png" alt=""></button></div>`;
  const sourceLabel = opportunity.source_type === "partner" ? `Verified partner · ${opportunity.source_name || opportunity.organizer || "Partner"}` : opportunity.source_type === "public_manual" ? "Public source · Admin reviewed" : "TeenLaunch verified";
  return `<article class="opportunity-card visible" data-opportunity-card-id="${escapeHtml(opportunity.id)}" data-category="${escapeHtml(category)}" data-details="${escapeHtml(mode)}" data-title="${escapeHtml(String(opportunity.title || "").toLowerCase())}"><div class="opportunity-badges"><span class="tag">${escapeHtml(opportunity.category)}</span><span class="verification-badge verified">${escapeHtml(sourceLabel)}</span></div><h3>${escapeHtml(opportunity.title)}</h3><p>${escapeHtml(opportunity.description)}</p><ul><li>Deadline: ${opportunity.deadline ? new Date(`${opportunity.deadline}T00:00:00`).toLocaleDateString() : "Rolling"}</li><li>Eligibility: Ages ${escapeHtml(ages)}</li><li>${escapeHtml([opportunity.mode, opportunity.location].filter(Boolean).join(", "))}</li></ul>${actions}</article>`;
};

const recommendationMarkup = ({ opportunity, match_percentage: percentage, explanation }) => {
  const base = opportunityMarkup(opportunity);
  return base.replace('<span class="tag">', `<div class="match-badge">${percentage}% match</div><span class="tag">`).replace(`<p>${escapeHtml(opportunity.description)}</p>`, `<p class="match-explanation">${escapeHtml(explanation)}</p><p>${escapeHtml(opportunity.description)}</p>`);
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
  document.querySelectorAll(".apply-button").forEach((link) => link.addEventListener("click", (event) => {
    if (token) return;
    event.preventDefault();
    window.location.href = `auth.html?mode=login&returnTo=${encodeURIComponent(`apply.html?id=${link.dataset.opportunityId}`)}`;
  }));
  document.querySelectorAll(".save-button").forEach((button) => button.addEventListener("click", async () => {
    if (!token) { window.location.href = `auth.html?mode=login&returnTo=${encodeURIComponent("opportunities.html")}`; return; }
    const saving = !button.classList.contains("saved");
    button.disabled = true;
    try {
      const response = await fetch(`${resolveApiBase()}/profile/saved${saving ? "" : `/${encodeURIComponent(button.dataset.saveId)}`}`, { method: saving ? "POST" : "DELETE", headers: { Authorization: `Bearer ${token}`, ...(saving ? { "Content-Type": "application/json" } : {}) }, body: saving ? JSON.stringify({ opportunity_id: button.dataset.saveId }) : undefined });
      if (!response.ok && response.status !== 409) throw new Error("Save failed");
      button.classList.toggle("saved", saving); button.setAttribute("aria-pressed", String(saving)); button.setAttribute("aria-label", saving ? "Remove from saved" : "Save opportunity");
    } catch (_) { window.alert("We could not update this saved opportunity. Please try again."); }
    finally { button.disabled = false; }
  }));
  if (!token) return;
  const [savedResponse, ...checks] = await Promise.all([fetch(`${resolveApiBase()}/profile/saved`, { headers: { Authorization: `Bearer ${token}` } }), ...[...document.querySelectorAll(".apply-button")].map(link => fetch(`${resolveApiBase()}/registrations/check/${encodeURIComponent(link.dataset.opportunityId)}`, { headers: { Authorization: `Bearer ${token}` } }))]);
  if (savedResponse.ok) { const ids = new Set(((await savedResponse.json()).saved || []).map(item => item.opportunity_id)); document.querySelectorAll(".save-button").forEach(button => { const saved = ids.has(button.dataset.saveId); button.classList.toggle("saved", saved); button.setAttribute("aria-pressed", String(saved)); }); }
  const links = [...document.querySelectorAll(".apply-button")];
  await Promise.all(checks.map(async (response, index) => { if (response.ok && (await response.json()).applied) { links[index].textContent = "Applied"; links[index].classList.add("disabled"); links[index].removeAttribute("href"); links[index].setAttribute("aria-disabled", "true"); } }));
};

const loadOpportunities = async () => {
  try {
    const token = localStorage.getItem("teenlaunch_token");
    if (token) {
      const sessionResponse = await fetch(`${resolveApiBase()}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (sessionResponse.ok) isAdmin = (await sessionResponse.json()).role === "admin";
    }
    const response = await fetch(`${resolveApiBase()}/opportunities`);
    if (!response.ok) return;
    const { opportunities } = await response.json();
    if (!Array.isArray(opportunities) || !opportunities.length) throw new Error("No opportunities returned");
    document.querySelector("#opportunityGrid").innerHTML = opportunities.map(opportunityMarkup).join("");
    await loadRecommendationPreview();
    cards = document.querySelectorAll("#opportunityGrid .opportunity-card");
    await bindOpportunityActions();
    filterCards();
  } catch (_) {
    document.querySelector("#opportunityGrid").innerHTML = "";
    cards = document.querySelectorAll("#opportunityGrid .opportunity-card");
    emptyState.style.display = "block";
    emptyState.textContent = "Verified opportunities could not be loaded right now. Please try again later.";
  }
};

loadOpportunities();
