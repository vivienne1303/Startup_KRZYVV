(function () {
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  const t = (key) => window.TeenLaunchI18n?.translate(key) || key;
  const locale = () => window.TeenLaunchI18n?.getLanguage() === "zh" ? "zh-CN" : undefined;
  const chips = (values) => `<div class="skill-list">${(values || []).map((value) => `<span class="skill-chip">${esc(t(value))}</span>`).join("")}</div>`;
  const evidence = (urls) => (urls || []).map((url, index) => `<a class="certificate-link" href="${esc(url)}" target="_blank" rel="noopener">${t("Evidence")} ${index + 1}</a>`).join(" · ");

  window.renderTeenLaunchPortfolio = (root, data) => {
    const profile = data.profile || {};
    const portfolio = data.portfolio || {};
    const items = data.items || [];
    const projects = data.projects || [];
    const picture = profile.profile_picture_url || profile.avatar_url || "../assets/images/light_logo.png";
    const skills = [...new Set(items.flatMap((item) => [...(item.registrations?.verified_skills || []), ...(item.skills_learned || [])]).concat(projects.flatMap((project) => project.skills || [])))];
    const certificates = items.filter((item) => item.registrations?.certificate_url);
    const reflections = items.filter((item) => item.reflection);

    const achievementCards = items.length ? items.map((item) => {
      const registration = item.registrations || {};
      const opportunity = registration.opportunities || {};
      return `<article class="preview-card"><span class="verified-badge">✓ ${esc(t(registration.completion_badge || "Verified"))}</span><h3>${esc(opportunity.title || t("Achievement"))}</h3><p><strong>${esc(opportunity.organizer || "")}</strong></p><p>${t("Completed")} ${registration.completion_date ? new Date(`${registration.completion_date}T00:00:00`).toLocaleDateString(locale()) : ""}</p>${chips([...(registration.verified_skills || []), ...(item.skills_learned || [])])}${item.user_description ? `<p>${esc(item.user_description)}</p>` : ""}${registration.admin_remarks ? `<p><strong>${t("Admin remarks:")}</strong> ${esc(registration.admin_remarks)}</p>` : ""}${evidence(item.evidence_urls)}</article>`;
    }).join("") : `<p>${t("No published achievements.")}</p>`;

    const projectCards = projects.length ? projects.map((project) => `<article class="preview-card"><h3>${esc(t(project.title))}</h3><p>${esc(project.description || "")}</p>${chips(project.skills)}${evidence(project.evidence_urls)}</article>`).join("") : `<p>${t("No published projects.")}</p>`;
    const certificateCards = certificates.length ? certificates.map((item) => `<article class="preview-card"><span class="verified-badge">${t("Verified certificate")}</span><h3>${esc(item.registrations.opportunities?.title || t("Certificate"))}</h3><p>${esc(item.registrations.opportunities?.organizer || "")}</p><a class="certificate-link" href="${esc(item.registrations.certificate_url)}" target="_blank" rel="noopener">${t("View certificate")}</a></article>`).join("") : `<p>${t("No published certificates.")}</p>`;
    const reflectionCards = reflections.length ? reflections.map((item) => `<article class="preview-card"><h3>${esc(item.registrations?.opportunities?.title || t("Reflection"))}</h3><blockquote>${esc(item.reflection)}</blockquote></article>`).join("") : `<p>${t("No published reflections.")}</p>`;

    root.innerHTML = `<section class="preview-hero"><img class="preview-avatar" src="${esc(picture)}" alt=""><div><p class="eyebrow">${t("Verified TeenLaunch Portfolio")}</p><h1>${esc(profile.full_name || profile.username || t("TeenLaunch member"))}</h1><p>${esc(portfolio.introduction || portfolio.personal_description || profile.bio || "")}</p></div></section>
      ${data.career_dna ? `<section class="preview-section"><h2>${t("Career DNA")}</h2><div class="preview-card"><h3>${esc(t(data.career_dna.result_title))}</h3><p>${esc(t(data.career_dna.summary || ""))}</p>${chips(data.career_dna.strengths)}</div></section>` : ""}
      <section class="preview-section"><h2>${t("Verified Achievements")}</h2><div class="preview-grid">${achievementCards}</div></section>
      <section class="preview-section"><h2>${t("Projects")}</h2><div class="preview-grid">${projectCards}</div></section>
      <section class="preview-section"><h2>${t("Skills")}</h2>${skills.length ? chips(skills) : `<p>${t("No published skills.")}</p>`}</section>
      <section class="preview-section"><h2>${t("Certificates")}</h2><div class="preview-grid">${certificateCards}</div></section>
      <section class="preview-section"><h2>${t("Personal Reflections")}</h2><div class="preview-grid">${reflectionCards}</div></section>
      <section class="preview-section"><h2>${t("Contact")}</h2><div class="contact-links">${portfolio.contact_links?.contact ? `<a href="${esc(portfolio.contact_links.contact)}">${t("Contact")}</a>` : ""}${portfolio.contact_links?.social ? `<a href="${esc(portfolio.contact_links.social)}" target="_blank" rel="noopener">${t("Social profile")}</a>` : ""}</div></section>`;
  };
})();
