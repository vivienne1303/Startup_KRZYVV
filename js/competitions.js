const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const revealElements = document.querySelectorAll(".reveal");
const countdown = document.querySelector("#countdown");
const reminderButtons = document.querySelectorAll(".reminder");
const reminderList = document.querySelector("#reminderList");
const t = (key) => window.TeenLaunchI18n?.translate(key) || key;

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

const updateCountdown = () => {
  const deadline = new Date("2026-06-28T23:59:00");
  const now = new Date();
  const diff = Math.max(0, deadline - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);

  countdown.textContent = diff > 0 ? `${days}d ${hours}h` : t("Closed");
};

reminderButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const eventName = button.dataset.event;

    if (reminderList.children.length === 1 && reminderList.children[0].textContent.includes("No reminders")) {
      reminderList.innerHTML = "";
    }

    const exists = Array.from(reminderList.children).some((item) => item.textContent.includes(eventName));
    if (!exists) {
      const item = document.createElement("li");
      item.textContent = `${eventName} reminder added`;
      reminderList.appendChild(item);
    }

    button.dataset.i18n = "Reminder Added";
    button.textContent = t("Reminder Added");
  });
});

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
updateCountdown();
setInterval(updateCountdown, 60000);
