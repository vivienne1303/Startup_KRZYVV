(function () {
  const API = window.TEENLAUNCH_API_BASE;
  const token = localStorage.getItem("teenlaunch_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const request = (url, options = {}) => fetch(url, { ...options, signal: AbortSignal.timeout(10000) });
  const notice = document.querySelector("[data-recommendation-notice]");
  const loading = document.querySelector("[data-recommendation-loading]");
  const onboarding = document.querySelector("[data-recommendation-onboarding]");
  const empty = document.querySelector("[data-recommendation-empty]");
  const errorBox = document.querySelector("[data-recommendation-error]");
  const grid = document.querySelector("[data-recommendation-grid]");
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  const premium = document.querySelector("[data-recommendation-premium]");
  const hideStates = () => [loading, onboarding, empty, errorBox, grid, premium].forEach((element) => { element.hidden = true; });
  const parseError = async (response) => { try { const data = await response.json(); return data?.error?.message || data?.message || "Please try again."; } catch { return "Please try again."; } };

  const card = ({ opportunity, match_percentage: percentage, explanation }) => {
    const minimumAge = opportunity.minimum_age ?? opportunity.age_min;
    const maximumAge = opportunity.maximum_age ?? opportunity.age_max;
    const deadline = opportunity.application_deadline || opportunity.deadline;
    const hasAge = minimumAge != null || maximumAge != null;
    const ages = hasAge ? `Ages ${minimumAge ?? "not specified"} to ${maximumAge ?? "not specified"}` : "Age eligibility not specified";
    const organisation = opportunity.organisation || opportunity.organizer || opportunity.source_name;
    const formatAndLocation = [opportunity.format || opportunity.mode, opportunity.location].filter(Boolean).join(" · ");
    const metadata = [organisation, ages, formatAndLocation, `Deadline: ${deadline ? new Date(`${deadline}T00:00:00`).toLocaleDateString() : opportunity.discovery?.deadline_status === "rolling" ? "Rolling (confirmed)" : "Not confirmed"}`]
      .filter(Boolean).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    const internal = opportunity.application_method === "internal" && opportunity.internal_application_enabled === true;
    const officialUrl = !internal && (opportunity.application_url || opportunity.source_url);
    const primaryAction = officialUrl
      ? `<a class="btn primary" href="opportunity-details.html?id=${encodeURIComponent(opportunity.id)}" target="_blank" rel="noopener noreferrer">Visit official site</a>`
      : `<a class="btn secondary" href="opportunity-details.html?id=${encodeURIComponent(opportunity.id)}">View details</a><a class="btn primary" href="apply.html?id=${encodeURIComponent(opportunity.id)}">Apply</a>`;
    return `<article class="opportunity-card recommendation-card">
      ${Number.isFinite(percentage) ? `<div class="match-badge">${percentage}% match</div>` : ""}
      <span class="tag">${escapeHtml(opportunity.category)}</span>
      <div class="opportunity-status-labels">${window.OpportunityFilters.statusLabels(opportunity).map(label => `<span class="tag">${escapeHtml(label)}</span>`).join(' ')}</div>
      <h2>${escapeHtml(opportunity.title)}</h2>
      <p class="match-explanation">${escapeHtml(explanation)}</p>
      <p class="recommendation-description">${escapeHtml(opportunity.description)}</p>
      <ul class="recommendation-meta">${metadata}</ul>
      <p>Last checked: ${escapeHtml((opportunity.discovery?.last_checked_at || opportunity.last_verified_at || 'Not recorded').slice(0,10))}</p>
      ${opportunity.discovery ? `<p>Fees: ${escapeHtml(opportunity.discovery.fees || 'Unknown')}</p><p>${escapeHtml(opportunity.eligibility || 'Eligibility not confirmed')}</p><p>${escapeHtml(opportunity.discovery.notes || '')}</p>` : ''}
      ${/^https?:\/\//i.test(opportunity.source_url || '') ? `<a href="${escapeHtml(opportunity.source_url)}" target="_blank" rel="noopener">Source</a>` : ''}
      <div class="recommendation-actions">${primaryAction}<button class="save-button" type="button" data-save-id="${escapeHtml(opportunity.id)}" aria-label="Save ${escapeHtml(opportunity.title)}"><img src="../assets/icons/save_icon.png" alt=""></button></div>
    </article>`;
  };

  const loginHref = 'auth.html?mode=login&returnTo=recommended-opportunities.html';
  let generation = 0;
  const savedIds = new Set();
  const updateSavedButtons = () => grid.querySelectorAll('[data-save-id]').forEach(button => {
    const saved = savedIds.has(button.dataset.saveId);
    button.classList.toggle('saved', saved);
    button.setAttribute('aria-pressed', String(saved));
  });
  grid.addEventListener('click', async event => {
    const button = event.target.closest('[data-save-id]');
    if (!button) return;
    if (!token) { location.href = loginHref; return; }
    const id = button.dataset.saveId, saving = !savedIds.has(id);
    button.disabled = true;
    try {
      const response = await request(API + '/profile/saved' + (saving ? '' : '/' + encodeURIComponent(id)), {
        method: saving ? 'POST' : 'DELETE',
        headers: { ...headers, ...(saving ? { 'Content-Type': 'application/json' } : {}) },
        body: saving ? JSON.stringify({ opportunity_id: id }) : undefined,
      });
      if (response.status === 401) { location.href = loginHref; return; }
      if (!response.ok && response.status !== 409) throw new Error(await parseError(response));
      if (saving) savedIds.add(id); else savedIds.delete(id);
      updateSavedButtons();
    } catch (error) { window.alert('We could not save this opportunity. ' + error.message); }
    finally { button.disabled = false; }
  });
  // Saved-state loading must never hide otherwise successful recommendations.
  if (token) request(API + '/profile/saved', { headers }).then(async response => {
    if (!response.ok) return;
    for (const item of (await response.json()).saved || []) savedIds.add(item.opportunity_id);
    updateSavedButtons();
  }).catch(() => {});

  const render = (items, personalised) => {
    grid.innerHTML = items.filter(item => !window.OpportunityFilters.expired(item.opportunity))
      .sort((a,b) => window.OpportunityFilters.confidenceRank(a.opportunity) - window.OpportunityFilters.confidenceRank(b.opportunity)).map(card).join('');
    grid.hidden = false;
    notice.textContent = personalised ? 'Your Career DNA matches' : 'Opportunities to explore. Check each listing’s status and restrictions.';
    notice.hidden = false;
    updateSavedButtons();
  };
  const load = async () => {
    const run = ++generation;
    hideStates(); notice.hidden = true;
    loading.hidden = false;
    let settled = false;
    const publicResult = request(API + '/opportunities').then(async response => {
      if (!response.ok) throw new Error(await parseError(response));
      const data = await response.json();
      return (data.opportunities || []).map(opportunity => ({ opportunity, explanation: '' }));
    }).catch(() => []);
    // Show useful listings while the private matching request is still running.
    publicResult.then(items => {
      if (run === generation && !settled && items.length) render(items, false);
    });
    const fallback = async () => {
      const items = await publicResult;
      if (run !== generation) return;
      loading.hidden = true;
      if (items.length) render(items, false);
      else { grid.hidden = true; notice.hidden = true; empty.hidden = false; }
    };
    try {
      if (!token) {
        settled = true; loading.hidden = true; premium.hidden = false;
        await fallback(); return;
      }
      const response = await request(API + '/opportunities/recommended', { headers });
      const data = await response.json();
      if (run !== generation) return;
      settled = true; hideStates();
      if (response.status === 403 && data.code === 'PREMIUM_REQUIRED') {
        premium.hidden = false; await fallback(); return;
      }
      if (response.status === 401) {
        errorBox.hidden = false;
        document.querySelector('[data-recommendation-error-message]').textContent = 'Your session has expired. Log in again for personalised matches.';
        await fallback(); return;
      }
      if (!response.ok) throw new Error(data.error?.message || data.message || 'Please try again.');
      if (!data.completed) { onboarding.hidden = false; await fallback(); return; }
      if (!data.recommendations?.length) { empty.hidden = false; await fallback(); return; }
      render(data.recommendations, true);
    } catch (error) {
      if (run !== generation) return;
      settled = true; hideStates(); errorBox.hidden = false;
      document.querySelector('[data-recommendation-error-message]').textContent = error.name === 'TimeoutError' || error.name === 'AbortError'
        ? 'Matching is taking longer than expected. You can browse open opportunities below or try again.' : error.message;
      await fallback();
    }
  };

  document.querySelector("[data-recommendation-retry]").addEventListener("click", load);
  load();
})();
