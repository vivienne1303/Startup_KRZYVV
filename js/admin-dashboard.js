(function () {
  const API_BASE = window.TEENLAUNCH_API_BASE;
  const token = localStorage.getItem("teenlaunch_token");
  const message = document.querySelector("[data-admin-message]");
  const contentBlocks = document.querySelectorAll("[data-admin-content]");

  const setMessage = (text, type) => {
    message.textContent = text || "";
    message.classList.toggle("error", type === "error");
    message.classList.toggle("success", type === "success");
  };

  const redirectToLogin = () => {
    window.location.replace(`auth.html?mode=login&returnTo=${encodeURIComponent(window.location.pathname)}`);
  };

  const parseError = async (response) => {
    try {
      const data = await response.json();
      return data?.error?.message || data?.message || "Something went wrong.";
    } catch (error) {
      return "Something went wrong.";
    }
  };

  const authFetch = async (path, options = {}) => {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
      },
    });

    if (!response.ok) throw new Error(await parseError(response));
    return response.json();
  };

  const setText = (selector, value) => {
    const target = document.querySelector(selector);
    if (target) target.textContent = value;
  };

  const formatDate = (value) => {
    if (!value) return "No date";
    return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  const emptyState = (text) => `<p class="admin-empty">${text}</p>`;
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));

  const renderUsers = (users) => {
    document.querySelector("[data-admin-users]").innerHTML = users.length
      ? users
          .map(
            (user) => `
              <article class="admin-list-item">
                <strong>${user.email || "No email"}</strong>
                <span>Created ${formatDate(user.created_at)}</span>
              </article>
            `
          )
          .join("")
      : emptyState("No users found.");
    setText('[data-count="users"]', users.length);
  };

  const renderRegistrations = (registrations) => {
    document.querySelector("[data-admin-registrations]").innerHTML = registrations.length
      ? registrations
          .map(
            (registration) => `
              <article class="admin-list-item">
                <strong>${escapeHtml(registration.full_name || "Applicant")} — ${escapeHtml(registration.opportunities?.title || "Opportunity")}</strong>
                <span>${escapeHtml(registration.email || "No email")} · ${escapeHtml(registration.school_name || "No school")}</span>
                <details><summary>View full application</summary><p><b>Phone:</b> ${escapeHtml(registration.phone_number || "—")}</p><p><b>Education:</b> ${escapeHtml(registration.education_level || "—")}</p><p><b>Motivation:</b> ${escapeHtml(registration.motivation || "—")}</p><p><b>Experience:</b> ${escapeHtml(registration.relevant_experience || "—")}</p><p><b>Comments:</b> ${escapeHtml(registration.additional_comments || "—")}</p></details>
                <label>Status <select data-registration-status="${registration.id}">${["pending", "shortlisted", "accepted", "rejected"].map((status) => `<option value="${status}" ${registration.status === status ? "selected" : ""}>${status[0].toUpperCase() + status.slice(1)}</option>`).join("")}</select></label>
                <span>${registration.status || "registered"} · ${formatDate(registration.created_at)}</span>
              </article>
            `
          )
          .join("")
      : emptyState("No registrations yet.");
    setText('[data-count="registrations"]', registrations.length);
    document.querySelectorAll("[data-registration-status]").forEach((select) => select.addEventListener("change", async () => {
      select.disabled = true;
      try {
        await authFetch(`/admin/registrations/${select.dataset.registrationStatus}`, { method: "PUT", body: JSON.stringify({ status: select.value }) });
        setMessage("Application status updated.", "success");
      } catch (error) {
        setMessage(error.message, "error");
        await loadAdminData();
      } finally {
        select.disabled = false;
      }
    }));
  };

  const renderCareerDna = (results) => {
    document.querySelector("[data-admin-career-dna]").innerHTML = results.length
      ? results
          .slice(0, 8)
          .map(
            (result) => `
              <article class="admin-list-item">
                <strong>${result.result_title || "Career DNA result"}</strong>
                <span>${formatDate(result.created_at)}</span>
              </article>
            `
          )
          .join("")
      : emptyState("No Career DNA submissions yet.");
    setText('[data-count="careerDna"]', results.length);
  };

  const loadAdminData = async () => {
    setMessage("Loading admin dashboard...", "");

    const [dashboard, users, registrations, careerDna] = await Promise.all([
      authFetch("/admin/dashboard"),
      authFetch("/admin/users"),
      authFetch("/admin/registrations"),
      authFetch("/admin/career-dna"),
    ]);

    Object.entries(dashboard.stats || {}).forEach(([key, value]) => {
      setText(`[data-stat="${key}"]`, value || 0);
    });

    renderUsers(users.users || []);
    renderRegistrations(registrations.registrations || []);
    renderCareerDna(careerDna.results || []);
    contentBlocks.forEach((block) => {
      block.hidden = false;
    });
    setMessage("", "");
  };

  const init = async () => {
    if (!token) {
      redirectToLogin();
      return;
    }

    try {
      const current = await authFetch("/auth/me");
      localStorage.setItem("teenlaunch_user", JSON.stringify(current.user || {}));
      localStorage.setItem("teenlaunch_profile", JSON.stringify(current.profile || {}));

      if (current.role !== "admin") {
        setMessage("Access denied. Admin account required.", "error");
        setTimeout(() => {
          window.location.href = "../index.html";
        }, 1200);
        return;
      }

      await loadAdminData();
    } catch (error) {
      setMessage(error.message, "error");
    }
  };

  document.querySelector("[data-admin-refresh]").addEventListener("click", () => {
    loadAdminData().catch((error) => setMessage(error.message, "error"));
  });

  const opportunityForm = document.querySelector("[data-opportunity-form]");
  opportunityForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(opportunityForm);
    const ageMin = formData.get("age_min") ? Number(formData.get("age_min")) : null;
    const ageMax = formData.get("age_max") ? Number(formData.get("age_max")) : null;

    if (ageMin !== null && ageMax !== null && ageMin > ageMax) {
      setMessage("Minimum age cannot be higher than maximum age.", "error");
      return;
    }

    const mode = String(formData.get("mode") || "").trim();
    const level = String(formData.get("level") || "").trim();
    const location = String(formData.get("location") || "").trim();
    const detailParts = [location, mode, level].filter(Boolean);
    const button = opportunityForm.querySelector("button[type='submit']");

    button.disabled = true;
    setMessage("Adding opportunity...", "");

    try {
      await authFetch("/opportunities", {
        method: "POST",
        body: JSON.stringify({
          title: String(formData.get("title") || "").trim(),
          description: String(formData.get("description") || "").trim(),
          category: formData.get("category"),
          organizer: String(formData.get("organizer") || "").trim() || null,
          location: detailParts.join(", ") || null,
          mode: mode || null,
          age_min: ageMin,
          age_max: ageMax,
          deadline: formData.get("deadline") || null,
          start_date: formData.get("start_date") || null,
          end_date: formData.get("end_date") || null,
          application_url: String(formData.get("application_url") || "").trim() || null,
          is_published: formData.get("is_published") === "on",
        }),
      });

      opportunityForm.reset();
      opportunityForm.elements.is_published.checked = true;
      setMessage("Opportunity added successfully.", "success");
      await loadAdminData();
    } catch (error) {
      setMessage(error.message, "error");
    } finally {
      button.disabled = false;
    }
  });

  init();
})();
