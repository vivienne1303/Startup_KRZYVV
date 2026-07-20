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
                <label>Status <select data-registration-status="${registration.id}">${["pending", "accepted", "rejected", "attended", "completed"].map((status) => `<option value="${status}" ${registration.status === status ? "selected" : ""}>${status[0].toUpperCase() + status.slice(1)}</option>`).join("")}</select></label>
                <details class="verification-editor"><summary>Completion and verification</summary>
                  <div class="admin-form-grid">
                    <label>Completion date<input type="date" data-completion-date value="${escapeHtml(registration.completion_date || "")}"></label>
                    <label>Badge<input type="text" data-completion-badge value="${escapeHtml(registration.completion_badge || "")}" placeholder="Verified participant"></label>
                    <label>Verified skills<input type="text" data-verified-skills value="${escapeHtml((registration.verified_skills || []).join(", "))}" placeholder="Leadership, Communication"></label>
                    <label>Certificate URL<input type="url" data-certificate-url value="${escapeHtml(registration.certificate_url || "")}" placeholder="https://"></label>
                    <label class="admin-checkbox"><input type="checkbox" data-completion-verified ${registration.completion_verified ? "checked" : ""}> Mark completion verified</label>
                    <label>Admin remarks<textarea data-admin-remarks rows="3">${escapeHtml(registration.admin_remarks || "")}</textarea></label>
                  </div><button class="btn secondary" type="button" data-save-verification="${registration.id}">Save verification</button>
                </details>
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
    document.querySelectorAll("[data-save-verification]").forEach((button) => button.addEventListener("click", async () => {
      const item = button.closest(".admin-list-item");
      button.disabled = true;
      try {
        await authFetch(`/admin/registrations/${button.dataset.saveVerification}`, { method: "PUT", body: JSON.stringify({
          completion_date: item.querySelector("[data-completion-date]").value || null,
          completion_badge: item.querySelector("[data-completion-badge]").value.trim() || null,
          verified_skills: item.querySelector("[data-verified-skills]").value.split(",").map((value) => value.trim()).filter(Boolean),
          certificate_url: item.querySelector("[data-certificate-url]").value.trim() || null,
          completion_verified: item.querySelector("[data-completion-verified]").checked,
          admin_remarks: item.querySelector("[data-admin-remarks]").value.trim() || null,
        }) });
        setMessage("Completion verification saved.", "success");
      } catch (error) { setMessage(error.message, "error"); }
      finally { button.disabled = false; }
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
      await loadOpportunityForEditing();
    } catch (error) {
      setMessage(error.message, "error");
    }
  };

  document.querySelector("[data-admin-refresh]").addEventListener("click", () => {
    loadAdminData().catch((error) => setMessage(error.message, "error"));
  });

  const opportunityForm = document.querySelector("[data-opportunity-form]");
  const publishConfirmation = document.querySelector("[data-publish-confirmation]");
  const opportunityFormTitle = document.querySelector("[data-opportunity-form-title]");
  const opportunitySubmit = document.querySelector("[data-opportunity-submit]");
  const editOpportunityId = new URLSearchParams(window.location.search).get("edit");
  const categorySummary = document.querySelector("[data-category-summary]");
  const educationSummary = document.querySelector("[data-education-summary]");
  const updateCategorySummary = () => {
    const selected = [...opportunityForm.querySelectorAll('input[name="categories"]:checked')].map((input) => input.value);
    categorySummary.textContent = selected.length ? selected.join(", ") : "Select categories";
  };
  opportunityForm.querySelectorAll('input[name="categories"]').forEach((input) => input.addEventListener("change", updateCategorySummary));
  const updateEducationSummary = () => {
    const selected = [...opportunityForm.querySelectorAll('input[name="education_levels"]:checked')].map((input) => input.value);
    educationSummary.textContent = selected.length ? selected.join(", ") : "Select education levels";
  };
  opportunityForm.querySelectorAll('input[name="education_levels"]').forEach((input) => input.addEventListener("change", updateEducationSummary));

  const loadOpportunityForEditing = async () => {
    if (!editOpportunityId) return;
    const { opportunity } = await authFetch(`/admin/opportunities/${encodeURIComponent(editOpportunityId)}`);
    ["title", "description", "deadline", "start_date", "end_date", "age_min", "age_max", "organizer", "application_url", "image_url", "status"].forEach((name) => {
      opportunityForm.elements[name].value = opportunity?.[name] ?? "";
    });
    const categories = opportunity?.categories?.length ? opportunity.categories : [opportunity?.category].filter(Boolean);
    opportunityForm.querySelectorAll('input[name="categories"]').forEach((input) => { input.checked = categories.includes(input.value); });
    updateCategorySummary();
    opportunityForm.querySelectorAll('input[name="education_levels"]').forEach((input) => { input.checked = (opportunity?.education_levels || []).includes(input.value); });
    updateEducationSummary();
    opportunityForm.elements.skills.value = (opportunity?.skills || []).join(", ");
    opportunityForm.elements.mode.value = opportunity?.mode || "";
    opportunityForm.elements.location.value = opportunity?.location || "";
    opportunityForm.elements.is_published.checked = Boolean(opportunity?.is_published);
    opportunityFormTitle.textContent = "Edit opportunity";
    opportunitySubmit.textContent = "Save Changes";
    opportunityForm.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  opportunityForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(opportunityForm);
    const ageMin = formData.get("age_min") ? Number(formData.get("age_min")) : null;
    const ageMax = formData.get("age_max") ? Number(formData.get("age_max")) : null;

    if (ageMin !== null && ageMax !== null && ageMin > ageMax) {
      setMessage("Minimum age cannot be higher than maximum age.", "error");
      return;
    }

    const submittedMode = String(formData.get("mode") || "").trim().toLowerCase();
    const mode = ({ online: "online", physical: "in_person", in_person: "in_person", hybrid: "hybrid" })[submittedMode] || "";
    const location = String(formData.get("location") || "").trim();
    const categories = formData.getAll("categories").map((value) => String(value).trim()).filter(Boolean);
    const skills = String(formData.get("skills") || "").split(",").map((value) => value.trim()).filter(Boolean);
    const educationLevels = formData.getAll("education_levels").map((value) => String(value).trim()).filter(Boolean);
    if (!categories.length) {
      setMessage("Select at least one category.", "error");
      return;
    }
    const publishImmediately = formData.get("is_published") === "on";
    const button = opportunityForm.querySelector("button[type='submit']");

    button.disabled = true;
    publishConfirmation.hidden = true;
    publishConfirmation.classList.remove("error");
    setMessage("Adding opportunity...", "");

    try {
      await authFetch(editOpportunityId ? `/opportunities/${encodeURIComponent(editOpportunityId)}` : "/opportunities", {
        method: editOpportunityId ? "PUT" : "POST",
        body: JSON.stringify({
          title: String(formData.get("title") || "").trim(),
          description: String(formData.get("description") || "").trim(),
          category: categories[0],
          categories,
          skills,
          education_levels: educationLevels,
          organizer: String(formData.get("organizer") || "").trim() || null,
          location: location || null,
          mode: mode || null,
          age_min: ageMin,
          age_max: ageMax,
          deadline: formData.get("deadline") || null,
          start_date: formData.get("start_date") || null,
          end_date: formData.get("end_date") || null,
          application_url: String(formData.get("application_url") || "").trim() || null,
          image_url: String(formData.get("image_url") || "").trim() || null,
          status: formData.get("status") || "active",
          is_published: publishImmediately,
        }),
      });

      if (!editOpportunityId) {
        opportunityForm.reset();
        opportunityForm.elements.is_published.checked = true;
        updateCategorySummary();
        updateEducationSummary();
      }
      await loadAdminData();
      await loadOpportunityForEditing();
      const confirmationText = editOpportunityId ? "Changes saved!" : (publishImmediately ? "Published!" : "Saved as draft!");
      setMessage(confirmationText, "success");
      publishConfirmation.textContent = confirmationText;
      publishConfirmation.classList.remove("error");
      publishConfirmation.hidden = false;
    } catch (error) {
      setMessage(error.message, "error");
      publishConfirmation.textContent = `${editOpportunityId ? "Could not save" : "Could not publish"}: ${error.message}`;
      publishConfirmation.classList.add("error");
      publishConfirmation.hidden = false;
    } finally {
      button.disabled = false;
    }
  });

  init();
})();
