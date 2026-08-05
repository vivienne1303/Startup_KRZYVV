(function () {
  const API_BASE = window.TEENLAUNCH_API_BASE;
  const tokenKey = "teenlaunch_token";
  const userKey = "teenlaunch_user";
  const profileKey = "teenlaunch_profile";
  const t = (key) => window.TeenLaunchI18n?.translate(key) || key;

  const params = new URLSearchParams(window.location.search);
  if (params.get("logout") === "1") {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    localStorage.removeItem(profileKey);
    window.history.replaceState({}, "", window.location.pathname);
  }
  const initialMode = params.get("mode") === "register" ? "register" : "login";
  const returnTo = params.get("returnTo") || "../index.html";

  const tabs = document.querySelectorAll("[data-auth-tab]");
  const forms = document.querySelectorAll("[data-auth-form]");
  const message = document.querySelector("[data-auth-message]");

  const setMessage = (text, type) => {
    message.textContent = text ? t(text) : "";
    message.classList.toggle("error", type === "error");
    message.classList.toggle("success", type === "success");
  };

  const showMode = (mode) => {
    const nextMode = mode === "register" ? "register" : "login";
    tabs.forEach((tab) => {
      const active = tab.dataset.authTab === nextMode;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    forms.forEach((form) => {
      const active = form.dataset.authForm === nextMode;
      form.classList.toggle("active", active);
      form.hidden = !active;
      form.setAttribute("aria-hidden", String(!active));
    });

    document.getElementById("authTitle").textContent = t(nextMode === "register" ? "Create your account" : "Login to continue");
    setMessage("", "");
  };

  const parseError = async (response) => {
    const fallback = response.ok ? "" : "Something went wrong. Please try again.";

    try {
      const data = await response.json();
      return data?.error?.message || data?.message || fallback;
    } catch (error) {
      return fallback;
    }
  };

  const saveSession = (data) => {
    const token = data.token || data.access_token || data.session?.access_token;
    if (!token) {
      throw new Error("Login succeeded, but no token was returned.");
    }

    localStorage.setItem(tokenKey, token);
    localStorage.setItem(userKey, JSON.stringify(data.user || {}));
    localStorage.setItem(profileKey, JSON.stringify(data.profile || {}));
  };

  const postJson = async (path, body) => {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(await parseError(response));
    }

    return response.json();
  };

  const getCurrentUser = async () => {
    const token = localStorage.getItem(tokenKey);
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(await parseError(response));
    }

    return response.json();
  };

  const getLatestCareerDnaResult = async () => {
    const token = localStorage.getItem(tokenKey);
    const response = await fetch(`${API_BASE}/career-dna/latest`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(await parseError(response));
    }

    return response.json();
  };

  const safeReturnTo = () => {
    const isCareerTest = /career_dna_test\.html/i.test(returnTo);
    const isExplicitRetake = /career_dna_test\.html\?[^#]*\bretake=true\b/i.test(returnTo);
    if (!returnTo || /(?:^|\/)auth\.html(?:[?#]|$)/i.test(returnTo) || (isCareerTest && !isExplicitRetake)) {
      return "../index.html";
    }
    return returnTo;
  };

  const resumeExistingSession = async () => {
    const token = localStorage.getItem(tokenKey);
    if (!token || params.get("logout") === "1") return;

    setMessage("You are already signed in. Continuing...", "success");
    document.querySelectorAll("[data-auth-form] input, [data-auth-form] select, [data-auth-form] button")
      .forEach((control) => { control.disabled = true; });

    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(userKey);
        localStorage.removeItem(profileKey);
        document.querySelectorAll("[data-auth-form] input, [data-auth-form] select, [data-auth-form] button")
          .forEach((control) => { control.disabled = false; });
        setMessage("Your session has expired. Please log in again.", "error");
        return;
      }

      if (!response.ok) throw new Error(`Session verification failed (${response.status})`);
      const data = await response.json();
      localStorage.setItem(userKey, JSON.stringify(data.user || {}));
      localStorage.setItem(profileKey, JSON.stringify(data.profile || {}));
      window.location.replace(data.role === "admin" ? "admin-dashboard.html" : safeReturnTo());
    } catch (error) {
      // Do not turn a temporary mobile network interruption into another login.
      console.warn("Could not refresh the session; continuing with the saved login.", error);
      window.location.replace(safeReturnTo());
    }
  };

  document.querySelector(".auth-tabs").addEventListener("click", (event) => {
    const tab = event.target.closest("[data-auth-tab]");
    if (!tab) return;
    event.preventDefault();
    showMode(tab.dataset.authTab);
  });

  document.querySelector(".auth-tabs").addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = [...tabs].findIndex((tab) => tab.getAttribute("aria-selected") === "true");
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextTab = tabs[(currentIndex + direction + tabs.length) % tabs.length];
    showMode(nextTab.dataset.authTab);
    nextTab.focus();
  });

  document.querySelector('[data-auth-form="login"]').addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector("button");
    const formData = new FormData(form);

    button.disabled = true;
    setMessage("Logging you in...", "");

    try {
      const data = await postJson("/auth/login", {
        email: formData.get("email"),
        password: formData.get("password"),
      });

      saveSession(data);
      const verified = await getCurrentUser();
      localStorage.setItem(userKey, JSON.stringify(verified.user || data.user || {}));
      localStorage.setItem(profileKey, JSON.stringify(verified.profile || data.profile || {}));

      if (verified.role === "admin") {
        window.location.href = "admin-dashboard.html";
        return;
      }

      setMessage("Checking your Career DNA profile...", "");
      const { result } = await getLatestCareerDnaResult();
      window.location.href = result ? safeReturnTo() : "career_dna_test.html";
    } catch (error) {
      setMessage(error.message, "error");
      button.disabled = false;
    }
  });

  document.querySelector('[data-auth-form="register"]').addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector("button");
    const formData = new FormData(form);
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirm_password") || "");
    const age = Number(formData.get("age"));

    if (password !== confirmPassword) {
      setMessage("Passwords do not match. Please check both password fields.", "error");
      return;
    }

    if (!Number.isInteger(age) || age < 1 || age > 120) {
      setMessage("Please enter a valid age as a whole number.", "error");
      return;
    }

    button.disabled = true;
    setMessage("Creating your account...", "");

    try {
      await postJson("/auth/register", {
        name: formData.get("name"),
        email: formData.get("email"),
        password,
        age,
        school_name: String(formData.get("school_name") || "").trim() || null,
        education_level: formData.get("education_level"),
      });

      document.querySelector('[data-auth-form="login"] input[name="email"]').value = formData.get("email");
      form.reset();
      showMode("login");
      setMessage("Account created successfully. Please log in to continue.", "success");
    } catch (error) {
      setMessage(error.message, "error");
    } finally {
      button.disabled = false;
    }
  });

  showMode(initialMode);
  resumeExistingSession();
})();
