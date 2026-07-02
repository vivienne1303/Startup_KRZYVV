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
  });

  window.TeenLaunchTheme = {
    apply: applyTheme,
    get: () => normalizeTheme(localStorage.getItem(storageKey) || "light")
  };
})();
