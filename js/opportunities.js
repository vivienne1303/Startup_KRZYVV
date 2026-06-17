const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const revealElements = document.querySelectorAll(".reveal");
const searchInput = document.querySelector("#searchInput");
const filters = document.querySelectorAll(".filter");
const categoryFilters = document.querySelectorAll(".filter:not(.detail-filter)");
const detailFilters = document.querySelectorAll(".detail-filter");
const cards = document.querySelectorAll(".opportunity-card");
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
