(function () {
  const API = window.TEENLAUNCH_API_BASE;
  const token = localStorage.getItem("teenlaunch_token");
  const headers = { Authorization: `Bearer ${token}` };
  const loading = document.querySelector("[data-recommendation-loading]");
  const onboarding = document.querySelector("[data-recommendation-onboarding]");
  const empty = document.querySelector("[data-recommendation-empty]");
  const errorBox = document.querySelector("[data-recommendation-error]");
  const grid = document.querySelector("[data-recommendation-grid]");
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  const hideStates = () => [loading, onboarding, empty, errorBox, grid].forEach((element) => { element.hidden = true; });
  const parseError = async (response) => { try { const data = await response.json(); return data?.error?.message || data?.message || "Please try again."; } catch { return "Please try again."; } };

  const card = ({ opportunity, match_percentage: percentage, explanation }) => {
    const ages = opportunity.age_min || opportunity.age_max ? `Ages ${opportunity.age_min ?? "any"}–${opportunity.age_max ?? "any"}` : "Open age eligibility";
    return `<article class="opportunity-card recommendation-card">
      ${opportunity.image_url ? `<img class="recommendation-image" src="${escapeHtml(opportunity.image_url)}" alt="">` : ""}
      <div class="match-badge">${percentage}% match</div>
      <span class="tag">${escapeHtml(opportunity.category)}</span>
      <h2>${escapeHtml(opportunity.title)}</h2>
      <p class="match-explanation">${escapeHtml(explanation)}</p>
      <p>${escapeHtml(opportunity.description)}</p>
      <ul><li>${escapeHtml(opportunity.organizer || "Organisation not specified")}</li><li>${escapeHtml(ages)}</li><li>${escapeHtml([opportunity.mode, opportunity.location].filter(Boolean).join(" · "))}</li><li>Deadline: ${opportunity.deadline ? new Date(`${opportunity.deadline}T00:00:00`).toLocaleDateString() : "Rolling"}</li></ul>
      <div class="recommendation-actions"><a class="btn secondary" href="opportunity-details.html?id=${encodeURIComponent(opportunity.id)}">View details</a><a class="btn primary" href="apply.html?id=${encodeURIComponent(opportunity.id)}">Apply</a><button class="save-button" type="button" data-save-id="${escapeHtml(opportunity.id)}" aria-label="Save ${escapeHtml(opportunity.title)}"><img src="../assets/icons/save_icon.png" alt=""></button></div>
    </article>`;
  };

  const bindSaveButtons = async () => {
    const savedResponse = await fetch(`${API}/profile/saved`, { headers });
    const savedIds = savedResponse.ok ? new Set(((await savedResponse.json()).saved || []).map((item) => item.opportunity_id)) : new Set();
    document.querySelectorAll("[data-save-id]").forEach((button) => {
      button.classList.toggle("saved", savedIds.has(button.dataset.saveId));
      button.addEventListener("click", async () => {
        const saving = !button.classList.contains("saved");
        button.disabled = true;
        const response = await fetch(`${API}/profile/saved${saving ? "" : `/${encodeURIComponent(button.dataset.saveId)}`}`, { method: saving ? "POST" : "DELETE", headers: { ...headers, ...(saving ? { "Content-Type": "application/json" } : {}) }, body: saving ? JSON.stringify({ opportunity_id: button.dataset.saveId }) : undefined });
        if (response.ok || response.status === 409) button.classList.toggle("saved", saving);
        else window.alert("We could not update this saved opportunity. Please try again.");
        button.disabled = false;
      });
    });
  };

  const load = async () => {
    hideStates(); loading.hidden = false;
    try {
      const response = await fetch(`${API}/opportunities/recommended`, { headers });
      if (response.status === 401 || response.status === 403) { window.location.replace(`auth.html?mode=login&returnTo=${encodeURIComponent("recommended-opportunities.html")}`); return; }
      if (!response.ok) throw new Error(await parseError(response));
      const data = await response.json();
      hideStates();
      if (!data.completed) { onboarding.hidden = false; return; }
      if (!data.recommendations?.length) { empty.hidden = false; return; }
      grid.innerHTML = data.recommendations.map(card).join("");
      grid.hidden = false;
      await bindSaveButtons();
    } catch (error) { hideStates(); errorBox.hidden = false; document.querySelector("[data-recommendation-error-message]").textContent = error.message; }
  };

  document.querySelector("[data-recommendation-retry]").addEventListener("click", load);
  load();
})();
