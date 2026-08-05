const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const revealElements = document.querySelectorAll(".reveal");
const countdown = document.querySelector("#countdown");
const reminderButtons = document.querySelectorAll(".reminder");
const reminderList = document.querySelector("#reminderList");
const t = (key) => window.TeenLaunchI18n?.translate(key) || key;
const reminderStorageKey = "teenlaunch_competition_reminders";

const loadReminders = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(reminderStorageKey) || "[]");
    return Array.isArray(saved) ? saved.filter((name) => typeof name === "string" && name.trim()) : [];
  } catch (error) {
    console.warn("Saved reminders could not be read.", error);
    return [];
  }
};

let reminders = loadReminders();

const saveReminders = () => {
  localStorage.setItem(reminderStorageKey, JSON.stringify(reminders));
};

const renderReminders = () => {
  reminderList.innerHTML = "";
  if (!reminders.length) {
    const emptyItem = document.createElement("li");
    emptyItem.dataset.i18n = "No reminders yet. Add one from a competition card.";
    emptyItem.textContent = t("No reminders yet. Add one from a competition card.");
    reminderList.appendChild(emptyItem);
  } else {
    reminders.forEach((eventName) => {
      const item = document.createElement("li");
      item.textContent = `${t(eventName)} — ${t("Reminder Added")}`;
      reminderList.appendChild(item);
    });
  }

  reminderButtons.forEach((button) => {
    const added = reminders.includes(button.dataset.event);
    button.dataset.i18n = added ? "Reminder Added" : "Set Reminder";
    button.textContent = t(added ? "Reminder Added" : "Set Reminder");
    button.setAttribute("aria-pressed", String(added));
  });
};

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
  const deadline = new Date(countdown.dataset.deadline || "2026-06-28T23:59:00");
  const now = new Date();
  const diff = Math.max(0, deadline - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);

  const isChinese = window.TeenLaunchI18n?.getLanguage?.() === "zh";
  countdown.textContent = diff > 0 ? (isChinese ? `${days}天 ${hours}小时` : `${days}d ${hours}h`) : t("Closed");
};

reminderButtons.forEach((button) => {
  button.type = "button";
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const eventName = button.dataset.event;
    if (!reminders.includes(eventName)) {
      reminders.push(eventName);
      saveReminders();
      renderReminders();
    }
  });
});

renderReminders();

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
document.addEventListener("click", (event) => {
  if (!event.target.closest("[data-language-toggle]")) return;
  renderReminders();
  updateCountdown();
});
