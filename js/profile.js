(function () {
  const API = window.TEENLAUNCH_API_BASE;
  const token = localStorage.getItem("teenlaunch_token");
  const headers = { Authorization: `Bearer ${token}` };
  const t = (key) => window.TeenLaunchI18n?.translate(key) || key;
  const locale = () => window.TeenLaunchI18n?.getLanguage() === "zh" ? "zh-CN" : undefined;
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  if (!token) { location.replace("auth.html?mode=login&returnTo=profile.html"); return; }

  const request = async (path, options = {}) => {
    const response = await fetch(API + path, { ...options, headers: { ...headers, ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers } });
    if (response.status === 401) { localStorage.removeItem("teenlaunch_token"); location.replace("auth.html?mode=login&returnTo=profile.html"); throw new Error("Please log in again."); }
    if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.error?.message || "Something went wrong."); }
    return response.status === 204 ? null : response.json();
  };
  const opportunityCard = (item, saved = false) => {
    const opportunity = item.opportunities || {};
    const officialUrl = opportunity.application_url || opportunity.source_url;
    const detailUrl = officialUrl || `opportunity-details.html?id=${encodeURIComponent(item.opportunity_id)}`;
    return `<article class="application-card">${opportunity.image_url ? `<img src="${esc(opportunity.image_url)}" alt="">` : ""}<h3>${esc(opportunity.title || t("Opportunity"))}</h3><p>${esc(opportunity.category || "")}</p>${saved ? "" : `<span class="status">${t("Applied")}</span><p>${t("Applied")} ${new Date(item.registered_at || item.created_at).toLocaleDateString(locale())}</p>`}<p>${t("Deadline:")} ${opportunity.deadline ? new Date(`${opportunity.deadline}T00:00:00`).toLocaleDateString(locale()) : t("Rolling")}</p><div class="profile-card-actions"><a class="btn secondary" href="${esc(detailUrl)}"${officialUrl ? ' target="_blank" rel="noopener"' : ""}>${t("View Details")}</a>${saved ? `<button class="btn secondary" type="button" data-unsave="${esc(item.opportunity_id)}">${t("Remove")}</button>` : ""}</div></article>`;
  };
  const renderEngagement = ({ engagement, experiences }) => {
    document.querySelector("[data-tier-name]").textContent = t(engagement.tier.name);
    document.querySelector("[data-xp]").textContent = engagement.xp;
    document.querySelector("[data-streak]").textContent = engagement.streak;
    document.querySelector("[data-streak-unit]").textContent = t(engagement.streak === 1 ? "day" : "days");
    document.querySelector("[data-xp-progress]").style.width = `${engagement.progress}%`;
    document.querySelector("[data-next-tier]").textContent = engagement.next ? (window.TeenLaunchI18n?.getLanguage() === "zh" ? `距离${t(engagement.next.name)}还需 ${engagement.next.xp - engagement.xp} XP` : `${engagement.next.xp - engagement.xp} XP to ${engagement.next.name}`) : t("Highest tier reached");
    document.querySelector("[data-rewards]").innerHTML = engagement.tiers.map((tier) => `<article class="reward-step ${engagement.xp >= tier.xp ? "unlocked" : ""}"><span>${engagement.xp >= tier.xp ? "✓" : "🔒"}</span><div><strong>${esc(t(tier.name))}</strong><small>${esc(t(tier.reward))} · ${tier.xp} XP</small></div></article>`).join("");
    const root = document.querySelector("[data-experiences]");
    root.innerHTML = experiences.map((post) => `<article class="experience-post" data-open-experience-post="${esc(post.id)}" role="button" tabindex="0" aria-label="Open ${esc(post.title)}"><div class="experience-photo"><img src="${esc(post.image_url)}" alt="${esc(post.title)}" loading="lazy"><button type="button" data-delete-experience="${esc(post.id)}" aria-label="Delete ${esc(post.title)}">×</button></div><div class="experience-copy"><div><h3>${esc(post.title)}</h3><time datetime="${esc(post.event_date)}">${new Date(`${post.event_date}T00:00:00`).toLocaleDateString(locale(), { day: "numeric", month: "short", year: "numeric" })}</time></div>${post.caption ? `<p>${esc(post.caption)}</p>` : ""}<span>${t("+5 XP earned")}</span></div></article>`).join("");
    document.querySelector("[data-experiences-empty]").hidden = experiences.length > 0;
    const dialog = document.querySelector("[data-experience-dialog]");
    const openPost = (post) => {
      dialog.querySelector("[data-dialog-image]").src = post.image_url;
      dialog.querySelector("[data-dialog-image]").alt = post.title;
      dialog.querySelector("[data-dialog-title]").textContent = post.title;
      dialog.querySelector("[data-dialog-date]").textContent = new Date(`${post.event_date}T00:00:00`).toLocaleDateString(locale(), { day: "numeric", month: "long", year: "numeric" });
      dialog.querySelector("[data-dialog-caption]").textContent = post.caption || t("No caption added.");
      dialog.showModal();
    };
    root.querySelectorAll("[data-open-experience-post]").forEach((card) => {
      const post = experiences.find((item) => String(item.id) === card.dataset.openExperiencePost);
      card.addEventListener("click", () => openPost(post));
      card.addEventListener("keydown", (event) => { if (["Enter", " "].includes(event.key)) { event.preventDefault(); openPost(post); } });
    });
    root.querySelectorAll("[data-delete-experience]").forEach((button) => button.addEventListener("click", async (event) => {
      event.stopPropagation();
      if (!confirm("Remove this experience from your profile?")) return;
      button.disabled = true;
      try { await request(`/profile/experiences/${encodeURIComponent(button.dataset.deleteExperience)}`, { method: "DELETE" }); await load(); } catch (error) { alert(error.message); button.disabled = false; }
    }));
  };
  const experienceDialog = document.querySelector("[data-experience-dialog]");
  document.querySelector("[data-close-experience-dialog]").addEventListener("click", () => experienceDialog.close());
  experienceDialog.addEventListener("click", (event) => { if (event.target === experienceDialog) experienceDialog.close(); });
  const fillProfile = (current, applications, counts, saved) => {
    const profile = current.profile || {};
    document.querySelector("[data-username]").textContent = profile.username ? `@${profile.username}` : `@${(current.user?.email || "teenlaunch").split("@")[0]}`;
    document.querySelector("[data-full-name]").textContent = profile.full_name || "TeenLaunch user";
    document.querySelector("[data-bio]").textContent = profile.bio || "No bio yet.";
    document.querySelector("[data-school]").textContent = profile.school_name || "";
    document.querySelector("[data-app-count]").textContent = counts.applications || 0;
    document.querySelector("[data-followers]").textContent = counts.followers || 0;
    document.querySelector("[data-following]").textContent = counts.following || 0;
    const picture = profile.profile_picture_url || profile.avatar_url;
    if (picture) document.querySelector("[data-profile-picture]").src = picture;
    document.querySelector("[data-profile-initials]").textContent = (profile.full_name || "TL").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
    [["name", profile.full_name], ["bio", profile.bio], ["school", profile.school_name], ["education", profile.education_level]].forEach(([key, value]) => { document.querySelector(`[data-about-${key}]`).textContent = value || "-"; });
    document.querySelector("[data-applications]").innerHTML = applications.map((item) => opportunityCard(item)).join("");
    document.querySelector("[data-empty]").hidden = applications.length > 0;
    document.querySelector("[data-saved]").innerHTML = saved.map((item) => opportunityCard(item, true)).join("");
    document.querySelector("[data-saved-empty]").hidden = saved.length > 0;
    document.querySelectorAll("[data-unsave]").forEach((button) => button.addEventListener("click", async () => { button.disabled = true; try { await request(`/profile/saved/${encodeURIComponent(button.dataset.unsave)}`, { method: "DELETE" }); await load(); } catch (_) { button.disabled = false; } }));
  };
  const load = async () => {
    document.querySelector("[data-profile-loading]").hidden = false;
    document.querySelector("[data-profile-error]").hidden = true;
    try {
      const [current, applicationData, countData, savedData, engagementData] = await Promise.all([request("/auth/me"), request("/profile/applications"), request("/profile/counts"), request("/profile/saved"), request("/profile/engagement")]);
      fillProfile(current, applicationData.applications || [], countData.counts || {}, savedData.saved || []);
      renderEngagement(engagementData);
      document.querySelector("[data-profile-loading]").hidden = true;
      document.querySelector("[data-profile-content]").hidden = false;
    } catch (error) { document.querySelector("[data-profile-loading]").hidden = true; document.querySelector("[data-profile-error]").hidden = false; document.querySelector("[data-profile-error-message]").textContent = error.message; }
  };

  const selectTab = (name) => {
    const selected = document.querySelector(`[data-tab="${CSS.escape(name)}"]`) || document.querySelector('[data-tab="experiences"]');
    document.querySelectorAll("[data-tab]").forEach((item) => item.classList.toggle("active", item === selected));
    document.querySelectorAll("[data-panel]").forEach((panel) => { panel.hidden = panel.dataset.panel !== selected.dataset.tab; });
  };
  document.querySelectorAll("[data-tab]").forEach((button) => button.addEventListener("click", () => selectTab(button.dataset.tab)));
  selectTab(new URLSearchParams(location.search).get("tab") || "experiences");
  const form = document.querySelector("[data-experience-form]");
  const openForm = () => { form.hidden = false; form.scrollIntoView({ behavior: "smooth", block: "center" }); form.elements.title.focus(); };
  document.querySelector("[data-open-experience]").addEventListener("click", openForm);
  document.querySelector("[data-empty-add]").addEventListener("click", openForm);
  document.querySelector("[data-cancel-experience]").addEventListener("click", () => { form.hidden = true; form.reset(); });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = document.querySelector("[data-experience-message]");
    const submit = form.querySelector('[type="submit"]');
    const photo = form.elements.photo.files[0];
    if (!photo || photo.size > 4 * 1024 * 1024) { message.textContent = "Choose a photo no larger than 4 MB."; return; }
    submit.disabled = true; message.textContent = "Sharing your experience…";
    try {
      const imageData = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(photo); });
      await request("/profile/experiences", { method: "POST", body: JSON.stringify({ title: form.elements.title.value, event_date: form.elements.event_date.value, caption: form.elements.caption.value, image_data: imageData }) });
      form.reset(); form.hidden = true; await load();
    } catch (error) { message.textContent = error.message; } finally { submit.disabled = false; }
  });
  document.querySelector("[data-retry]").addEventListener("click", load);
  load();
})();
