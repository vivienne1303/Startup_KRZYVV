(function () {
  const main = document.querySelector("main");
  if (!main) return;
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));

  main.className = "simplified-home";
  main.innerHTML = `
    <section class="home-focus-section home-focus-hero"><div><p class="eyebrow">Your future, made clearer</p><h1>Know yourself. Find your path. Build your future.</h1><p>Discover opportunities matched to your strengths and interests, gain real-world experience, and build a portfolio for your future.</p><div class="focus-actions"><a class="btn primary" href="pages/career_dna_test.html">Discover My Career DNA</a><a class="btn secondary" href="pages/opportunities.html">Explore Opportunities</a></div></div><aside class="dna-preview"><p class="eyebrow">Your Career DNA</p><h2>A clearer picture of you</h2><div class="dna-row"><span>Creator</span><i style="--score:92%"></i><strong>92%</strong></div><div class="dna-row"><span>Builder</span><i style="--score:84%"></i><strong>84%</strong></div><div class="dna-row"><span>Leader</span><i style="--score:71%"></i><strong>71%</strong></div><div class="dna-match">Discover opportunities that fit your strengths</div></aside></section>
    <section class="home-focus-section"><div class="focus-heading"><p class="eyebrow">Opportunities for you</p><h2>Good next steps, not endless choices.</h2><p>Explore a focused selection and open the official page when you are ready.</p></div><div class="home-opportunity-grid" data-home-opportunities><p>Loading current opportunities…</p></div><div class="focus-actions"><a class="btn secondary" href="pages/opportunities.html">Explore All Opportunities →</a></div></section>
    <section class="home-focus-section"><div class="focus-heading"><p class="eyebrow">How TeenLaunch works</p><h2>One connected journey.</h2></div><div class="journey-strip"><article><strong>01</strong><h3>Discover Yourself</h3><p>Understand your strengths.</p></article><article><strong>02</strong><h3>Find Opportunities</h3><p>Choose relevant next steps.</p></article><article><strong>03</strong><h3>Gain Experience</h3><p>Learn through participation.</p></article><article><strong>04</strong><h3>Build Your Portfolio</h3><p>Show how you have grown.</p></article></div></section>
    <section class="home-focus-section portfolio-story"><div><p class="eyebrow">Your growth record</p><h2>Experience becomes evidence.</h2><p>Save achievements, reflections and verified participation in one portfolio that grows with you.</p><a class="btn primary" href="pages/portfolio-builder.html">Build My Portfolio</a></div><div class="portfolio-visual"><div><strong>Community Project</strong><p>Leadership · Collaboration</p></div><div><strong>Innovation Challenge</strong><p>Research · Prototyping</p></div><div><strong>Reflection added</strong><p>What I learned and what comes next</p></div></div></section>
    <section class="home-focus-section"><div class="focus-heading"><p class="eyebrow">TeenLaunch in your pocket</p><h2>Keep opportunities and reminders close.</h2><p>The TeenLaunch mobile app is coming soon for iOS and Android. You can preview the mobile experience now.</p><div class="focus-actions"><a class="btn secondary" href="mobile-showcase.html">View Mobile App Preview →</a></div></div></section>
    <section class="home-focus-section focus-final"><p class="eyebrow">Your next step</p><h2>Ready to find what’s next?</h2><a class="btn primary" href="pages/career_dna_test.html">Start My Career DNA</a></section>`;

  const renderCards = (items, showMatch) => {
    const root = document.querySelector("[data-home-opportunities]");
    root.innerHTML = items.length ? items.slice(0, 3).map((item) => {
      const opportunity = item.opportunity || item;
      const percentage = Number(item.match_percentage);
      const match = showMatch && Number.isFinite(percentage) ? `<span class="match">${Math.round(percentage)}% Match</span>` : "";
      return `<article>${opportunity.image_url ? `<img src="${escapeHtml(opportunity.image_url)}" alt="">` : ""}${match}<h3>${escapeHtml(opportunity.title)}</h3><strong>${escapeHtml(opportunity.organisation || opportunity.organizer || "")}</strong><small>${escapeHtml(opportunity.category || "Opportunity")} · ${escapeHtml(opportunity.application_deadline || opportunity.deadline || "Rolling deadline")}</small><p>${escapeHtml((opportunity.description || "").slice(0, 120))}</p></article>`;
    }).join("") : "<p>New opportunities are being reviewed. Check back soon.</p>";
  };

  const token = localStorage.getItem("teenlaunch_token");
  const personalised = token ? fetch(`${window.TEENLAUNCH_API_BASE}/opportunities/recommended`, { headers: { Authorization: `Bearer ${token}` } }).then((response) => response.ok ? response.json() : Promise.reject()).then((data) => {
    const recommendations = data.recommendations || [];
    if (!recommendations.length) return Promise.reject();
    renderCards(recommendations, true);
  }) : Promise.reject();

  personalised.catch(() => fetch(`${window.TEENLAUNCH_API_BASE}/opportunities`).then((response) => response.ok ? response.json() : Promise.reject()).then((data) => renderCards(data.opportunities || [], false))).catch(() => {
    document.querySelector("[data-home-opportunities]").innerHTML = "<p>Current opportunities could not be loaded right now.</p>";
  });
}());
