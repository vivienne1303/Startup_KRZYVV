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

let activeFilter = "all";
let activeDetail = "all";

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

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));

const loadOpportunities = async () => {
  try {
    const response = await fetch(`${resolveApiBase()}/opportunities`);
    if (!response.ok) return;
    const { opportunities } = await response.json();
    if (!Array.isArray(opportunities)) return;
    document.querySelector("#opportunityGrid").innerHTML = opportunities.map((opportunity) => {
      const categoryLabel = String(opportunity.category || "other").toLowerCase();
      const category = categoryLabel.includes("startup") ? "startup" : categoryLabel.includes("camp") ? "camp" : categoryLabel.includes("workshop") ? "workshop" : categoryLabel.includes("intern") ? "internship" : categoryLabel.includes("entrepreneur") ? "entrepreneurship" : categoryLabel;
      const mode = opportunity.mode === "in_person" ? "physical" : (opportunity.mode || "");
      const ages = `${opportunity.age_min || "Any"}-${opportunity.age_max || "Any"}`;
      return `<article class="opportunity-card visible" data-category="${escapeHtml(category)}" data-details="${escapeHtml(mode)}" data-title="${escapeHtml(String(opportunity.title || "").toLowerCase())}"><span class="tag">${escapeHtml(opportunity.category)}</span><h3>${escapeHtml(opportunity.title)}</h3><p>${escapeHtml(opportunity.description)}</p><ul><li>Deadline: ${opportunity.deadline ? new Date(`${opportunity.deadline}T00:00:00`).toLocaleDateString() : "Rolling"}</li><li>Eligibility: Ages ${escapeHtml(ages)}</li><li>${escapeHtml([opportunity.mode, opportunity.location].filter(Boolean).join(", "))}</li></ul><a class="btn secondary apply-button" href="apply.html?id=${encodeURIComponent(opportunity.id)}" data-opportunity-id="${escapeHtml(opportunity.id)}">Apply</a></article>`;
    }).join("");
    cards = document.querySelectorAll(".opportunity-card");
    document.querySelectorAll(".apply-button").forEach((link) => link.addEventListener("click", (event) => {
      if (localStorage.getItem("teenlaunch_token")) return;
      event.preventDefault();
      const target = `apply.html?id=${encodeURIComponent(link.dataset.opportunityId)}`;
      window.location.href = `auth.html?mode=login&returnTo=${encodeURIComponent(target)}`;
    }));
    const token = localStorage.getItem("teenlaunch_token");
    if (token) {
      const checks = [...document.querySelectorAll(".apply-button")].map(async (link) => {
        const response = await fetch(`${resolveApiBase()}/registrations/check/${encodeURIComponent(link.dataset.opportunityId)}`, { headers: { Authorization: `Bearer ${token}` } });
        if (response.ok && (await response.json()).applied) { link.textContent = "Applied"; link.classList.add("disabled"); link.removeAttribute("href"); link.setAttribute("aria-disabled", "true"); }
      });
      await Promise.all(checks);
    }
    filterCards();
  } catch (_) { /* Keep the existing static cards as an offline fallback. */ }
};

loadOpportunities();
