(function () {
  const API = window.TEENLAUNCH_API_BASE;
  const token = localStorage.getItem("teenlaunch_token");
  const id = new URLSearchParams(location.search).get("id");
  const loading = document.querySelector("[data-detail-loading]");
  const content = document.querySelector("[data-detail-content]");
  const errorBox = document.querySelector("[data-detail-error]");
  const setText = (selector, value) => { document.querySelector(selector).textContent = value || "Not specified"; };
  const fail = (message) => { loading.hidden = true; content.hidden = true; errorBox.hidden = false; setText("[data-detail-error-message]", message); };
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));

  async function load() {
    if (!id) { fail("Missing opportunity ID."); return; }
    try {
      const response = await fetch(`${API}/opportunities/${encodeURIComponent(id)}`);
      if (!response.ok) throw new Error("Opportunity not found.");
      const opportunity = (await response.json()).opportunity;
      const skills = Array.isArray(opportunity.skills) ? opportunity.skills : [];
      const education = Array.isArray(opportunity.education_levels) ? opportunity.education_levels : [];
      setText("[data-detail-category]", opportunity.category);
      setText("[data-detail-title]", opportunity.title);
      setText("[data-detail-organisation]", opportunity.organizer);
      setText("[data-detail-description]", opportunity.description);
      setText("[data-detail-deadline]", opportunity.deadline ? new Date(`${opportunity.deadline}T00:00:00`).toLocaleDateString() : "Rolling");
      setText("[data-detail-age]", opportunity.age_min || opportunity.age_max ? `Ages ${opportunity.age_min ?? "any"}–${opportunity.age_max ?? "any"}` : "Open eligibility");
      setText("[data-detail-education]", education.join(", ") || "All education levels");
      setText("[data-detail-location]", [opportunity.mode, opportunity.location].filter(Boolean).join(" · "));
      document.querySelector("[data-detail-skills]").innerHTML = skills.length ? skills.map((skill) => `<span class="tag">${escapeHtml(skill)}</span>`).join("") : "<p>No specific skills listed.</p>";
      const sourceLabel = opportunity.source_type === "partner" ? `Verified partner · ${opportunity.source_name || opportunity.organizer}` : opportunity.source_type === "public_manual" ? "Public source · Admin reviewed" : "TeenLaunch verified";
      const category = document.querySelector("[data-detail-category]");
      category.insertAdjacentHTML("afterend", `<span class="verification-badge verified">${escapeHtml(sourceLabel)}</span>`);
      category.parentElement.classList.add("opportunity-badges");
      const image = document.querySelector("[data-detail-image]"); if (opportunity.image_url) { image.src = opportunity.image_url; image.hidden = false; }
      const apply = document.querySelector("[data-detail-apply]");
      apply.href = `apply.html?id=${encodeURIComponent(id)}`;
      apply.hidden = !opportunity.internal_application_enabled || !["internal", "both"].includes(opportunity.application_method);
      const external = document.querySelector("[data-detail-external]");
      if (opportunity.application_url && ["external", "both"].includes(opportunity.application_method)) { external.href = opportunity.application_url; external.hidden = false; }
      const save = document.querySelector("[data-detail-save]");
      if (token) {
        const saved = await fetch(`${API}/profile/saved`, { headers: { Authorization: `Bearer ${token}` } });
        if (saved.ok) { const ids = new Set(((await saved.json()).saved || []).map((item) => item.opportunity_id)); save.classList.toggle("saved", ids.has(id)); save.textContent = ids.has(id) ? "Saved" : "Save opportunity"; }
      }
      save.addEventListener("click", async () => {
        if (!token) { location.href = `auth.html?mode=login&returnTo=${encodeURIComponent(location.pathname + location.search)}`; return; }
        const saving = !save.classList.contains("saved"); save.disabled = true;
        const result = await fetch(`${API}/profile/saved${saving ? "" : `/${encodeURIComponent(id)}`}`, { method: saving ? "POST" : "DELETE", headers: { Authorization: `Bearer ${token}`, ...(saving ? { "Content-Type": "application/json" } : {}) }, body: saving ? JSON.stringify({ opportunity_id: id }) : undefined });
        if (result.ok || result.status === 409) { save.classList.toggle("saved", saving); save.textContent = saving ? "Saved" : "Save opportunity"; }
        save.disabled = false;
      });
      loading.hidden = true; content.hidden = false;
    } catch (error) { fail(error.message); }
  }
  load();
})();
