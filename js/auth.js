(function () {
  const resolveApiBase = () => {
    const base = window.TEENLAUNCH_API_BASE || localStorage.getItem("teenlaunch_api_base") || "http://localhost:3000/api";
    return String(base).replace(/^http:\/\/teenlaunch\.app\b/i, "https://teenlaunch.app");
  };

  const API_BASE = resolveApiBase();
  const tokenKey = "teenlaunch_token";
  const userKey = "teenlaunch_user";
  const profileKey = "teenlaunch_profile";

  const params = new URLSearchParams(window.location.search);
  const initialMode = params.get("mode") === "register" ? "register" : "login";
  const returnTo = params.get("returnTo") || "../index.html";

  const tabs = document.querySelectorAll("[data-auth-tab]");
  const forms = document.querySelectorAll("[data-auth-form]");
  const message = document.querySelector("[data-auth-message]");

  const setMessage = (text, type) => {
    message.textContent = text || "";
    message.classList.toggle("error", type === "error");
    message.classList.toggle("success", type === "success");
  };

  const showMode = (mode) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.authTab === mode;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
    });

    forms.forEach((form) => {
      form.classList.toggle("active", form.dataset.authForm === mode);
    });

    document.getElementById("authTitle").textContent = mode === "register" ? "Create your account" : "Login to continue";
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

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => showMode(tab.dataset.authTab));
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

    if (!Number.isInteger(age) || age < 10 || age > 19) {
      setMessage("Age must be a whole number between 10 and 19.", "error");
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
})();
