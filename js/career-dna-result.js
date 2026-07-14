(function () {
  const API_BASE = String(window.TEENLAUNCH_API_BASE || localStorage.getItem("teenlaunch_api_base") || "http://localhost:3000/api").replace(/^http:\/\/teenlaunch\.app\b/i, "https://teenlaunch.app");
  const tokenKey = "teenlaunch_token";
  const loading = document.querySelector("[data-result-loading]");
  const content = document.querySelector("[data-result-content]");
  const errorBox = document.querySelector("[data-result-error]");
  const authFetch = (path) => fetch(`${API_BASE}${path}`, { headers: { Authorization: `Bearer ${localStorage.getItem(tokenKey)}` } });
  const login = () => window.location.replace(`auth.html?mode=login&returnTo=${encodeURIComponent("career_dna_result.html")}`);
  const clearSession = () => ["teenlaunch_token", "teenlaunch_user", "teenlaunch_profile"].forEach((key) => localStorage.removeItem(key));
  const toList = (value) => Array.isArray(value) ? value : [];
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));

  const render = (result) => {
    const score = result.score || {};
    const percentages = score.percentages || {};
    const paths = result.recommended_paths || {};
    document.querySelector("[data-profile-name]").textContent = score.profile_name || result.result_title;
    document.querySelector("[data-profile-summary]").textContent = result.summary || "Your Career DNA highlights the ways you naturally create, solve and lead.";
    document.querySelector("[data-top-type]").textContent = score.top_category || result.interests?.[0] || "—";
    document.querySelector("[data-secondary-type]").textContent = score.secondary_category || result.interests?.[1] || "—";
    document.querySelector("[data-score-list]").innerHTML = ["Creator", "Builder", "Explorer", "Connector", "Leader"].map((type) => { const value = Number(percentages[type]) || 0; return `<div><div class="dna-score-head"><span>${type}</span><span>${value}%</span></div><div class="dna-score-track"><span style="width:${Math.max(0, Math.min(100, value))}%"></span></div></div>`; }).join("");
    const jobs = toList(paths.job_families || score.recommended_job_families);
    const opportunities = toList(paths.opportunity_types || score.recommended_opportunity_types);
    document.querySelector("[data-job-families]").innerHTML = jobs.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    document.querySelector("[data-opportunity-types]").innerHTML = opportunities.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    loading.hidden = true; errorBox.hidden = true; content.hidden = false;
  };

  const load = async () => {
    loading.hidden = false; loading.textContent = "Loading your Career DNA..."; content.hidden = true; errorBox.hidden = true;
    if (!localStorage.getItem(tokenKey)) { login(); return; }
    try {
      const me = await authFetch("/auth/me");
      if (!me.ok) { clearSession(); login(); return; }
      const session = await me.json();
      if (session.role === "admin") { window.location.replace("admin-dashboard.html"); return; }
      const response = await authFetch("/career-dna/latest");
      if (!response.ok) throw new Error("The result could not be retrieved.");
      const { result } = await response.json();
      if (!result) { window.location.replace("career_dna_test.html"); return; }
      render(result);
    } catch (error) { loading.hidden = true; errorBox.hidden = false; document.querySelector("[data-result-error-message]").textContent = error.message; }
  };
  document.querySelector("[data-result-retry]").addEventListener("click", load);
  load();
})();
