(function () {
  const storageKey = "teenlaunch-theme";
  const savedTheme = localStorage.getItem(storageKey) || "light";
  const root = document.documentElement;

  const normalizeTheme = (theme) => theme === "dark" ? "dark" : "light";

  const applyTheme = (theme) => {
    const nextTheme = normalizeTheme(theme);
    root.dataset.theme = nextTheme;
    localStorage.setItem(storageKey, nextTheme);

    document.querySelectorAll(".brand-logo").forEach((logo) => {
      const isNestedPage = logo.getAttribute("src")?.startsWith("../");
      const prefix = isNestedPage ? "../" : "";
      logo.src = `${prefix}assets/images/${nextTheme === "dark" ? "dark_logo.png" : "light_logo.png"}`;
    });

    document.querySelectorAll("[data-theme-choice]").forEach((button) => {
      const isActive = button.dataset.themeChoice === nextTheme;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  applyTheme(savedTheme);

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(localStorage.getItem(storageKey) || savedTheme);

    document.querySelectorAll("[data-theme-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        applyTheme(button.dataset.themeChoice);
      });
    });

    document.body.classList.add("tl-motion-ready");
    document.querySelectorAll(".opportunity-card,.application-card,.review-card,.portfolio-card,.person-card").forEach((card, index) => {
      card.style.setProperty("--tl-order", String(index % 10));
      card.style.setProperty("--tl-card-tilt", `${index % 2 ? ".45" : "-.45"}deg`);
    });

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.addEventListener("pointermove", (event) => {
        const card = event.target.closest?.(".opportunity-card,.application-card,.review-card,.portfolio-card,.person-card");
        if (!card) return;
        const bounds = card.getBoundingClientRect();
        const rotate = ((event.clientX - bounds.left) / bounds.width - .5) * 1.6;
        card.style.setProperty("--tl-card-tilt", `${rotate.toFixed(2)}deg`);
      });
    }
  });

  window.TeenLaunchTheme = {
    apply: applyTheme,
    get: () => normalizeTheme(localStorage.getItem(storageKey) || "light")
  };
})();
