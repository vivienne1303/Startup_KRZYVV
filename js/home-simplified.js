(function () {
  const main = document.querySelector("main");
  if (!main) return;
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  const token = localStorage.getItem("teenlaunch_token");
  const storedProfile = (() => { try { return JSON.parse(localStorage.getItem("teenlaunch_profile") || "null"); } catch { return null; } })();
  const firstName = String(storedProfile?.full_name || "").trim().split(/\s+/)[0];
  const startHref = token ? "pages/my-journey.html" : "pages/auth.html?mode=register&returnTo=my-journey.html";
  const startLabel = token ? "Continue my journey" : "Personalise my journey";
  main.className = "simplified-home joyful-home";
  main.innerHTML = `
    <section class="home-focus-section home-focus-hero joyful-hero">
      <div class="hero-intro">
        <p class="eyebrow">${firstName ? `<span data-i18n="Welcome back">Welcome back</span>, ${escapeHtml(firstName)}` : '<span data-i18n="Your next step starts here">Your next step starts here</span>'}</p>
        <h1>What could your future look like?</h1>
        <p class="hero-lead">You do not need to have it all figured out. Discover what excites you, find a real opportunity, and grow one step at a time.</p>
        <div class="focus-actions"><a class="btn primary" href="${startHref}">${startLabel} <span aria-hidden="true">→</span></a><a class="btn secondary" href="pages/opportunities.html">Browse all opportunities</a></div>
        <p class="hero-reassurance"><span aria-hidden="true">✓</span> Free to explore <span aria-hidden="true">·</span> Made for young people <span aria-hidden="true">·</span> Start in minutes</p>
      </div>
      <aside class="future-board" aria-label="TeenLaunch journey preview">
        <div class="future-orbit orbit-one" aria-hidden="true">✦</div><div class="future-orbit orbit-two" aria-hidden="true">●</div>
        <p class="future-kicker">YOUR JOURNEY</p><h2>One small step can open a new path.</h2>
        <div class="future-steps"><span><b>1</b> Know yourself</span><span><b>2</b> Try something real</span><span><b>3</b> Show how you grew</span></div>
        <div class="future-note">There is no single “right” path. Let’s find one that feels like you.</div>
      </aside>
    </section>
    <section class="interest-band" aria-labelledby="interest-title"><div class="home-focus-section interest-inner">
      <div class="focus-heading compact-heading"><p class="eyebrow">Find what excites you</p><h2 id="interest-title">What sounds fun right now?</h2><p>Pick a direction. You can always change your mind.</p></div>
      <div class="interest-grid">
        <a href="pages/opportunities.html?category=Competitions"><span aria-hidden="true">🏆</span><strong>Compete</strong><small>Challenges and contests</small></a>
        <a href="pages/opportunities.html?category=Volunteering"><span aria-hidden="true">🌱</span><strong>Make an impact</strong><small>Community and service</small></a>
        <a href="pages/opportunities.html?category=Innovation%20Workshops"><span aria-hidden="true">💡</span><strong>Create</strong><small>Workshops and building</small></a>
        <a href="pages/opportunities.html?category=Internships"><span aria-hidden="true">🚀</span><strong>Explore careers</strong><small>Internships and exposure</small></a>
        <a href="pages/career_dna_test.html"><span aria-hidden="true">🧭</span><strong>Not sure yet</strong><small>Discover my Career DNA</small></a>
      </div>
    </div></section>
    <section class="home-focus-section" aria-labelledby="opportunities-title">
      <div class="section-row"><div class="focus-heading"><p class="eyebrow">Start exploring</p><h2 id="opportunities-title">Good next steps, not endless choices.</h2><p>A few current opportunities to help you begin.</p></div><a class="text-link" href="pages/opportunities.html">See all opportunities <span aria-hidden="true">→</span></a></div>
      <div class="home-opportunity-grid" data-home-opportunities aria-live="polite"><p class="loading-note">Finding fresh opportunities for you…</p></div>
    </section>
    <section class="home-focus-section premium-pricing" id="pricing" aria-labelledby="pricing-title">
      <div class="pricing-heading"><p class="eyebrow">Grow at your own pace</p><h2 id="pricing-title">Your next step. Your plan.</h2><p>Explore for free. Unlock recommendations tailored to you with Premium.</p></div>
      <div class="pricing-grid">
        <article class="pricing-card"><h3>Free</h3><p>Discover what is out there.</p><p class="plan-price">$0 <span>/ always</span></p><ul><li>Browse all public opportunities</li><li>Discover your Career DNA</li><li>Save opportunities with an account</li><li>Track your journey and build a portfolio</li></ul><a class="btn secondary" href="pages/opportunities.html">Explore for free</a></article>
        <article class="pricing-card premium-plan"><span class="plan-badge">Personalised for you</span><h3>Premium</h3><p>Find opportunities that fit who you are.</p><p class="plan-price coming-soon">Coming soon</p><ul><li>Everything in Free</li><li>Personalised opportunity recommendations</li><li>Matches based on your profile and Career DNA</li><li>Match scores and reasons for each recommendation</li></ul><button class="btn primary" type="button" disabled>Premium coming soon</button><small>Pricing and subscriptions will be announced here.</small></article>
      </div>
    </section>
    <section class="home-focus-section premium-preview" aria-labelledby="premium-preview-title"><div class="focus-heading"><p class="eyebrow">TeenLaunch Premium</p><h2 id="premium-preview-title">Recommended for You</h2><p>Opportunity matches shaped by your profile and Career DNA.</p></div><div data-premium-home aria-live="polite"><p>Unlock personalised recommendations with Premium.</p><a class="btn primary" href="#pricing">View plans</a></div></section>
    <section class="journey-band" aria-labelledby="journey-title"><div class="home-focus-section">
      <div class="focus-heading"><p class="eyebrow">A journey that grows with you</p><h2 id="journey-title">From curious to confident.</h2><p>TeenLaunch keeps discovery, action, and reflection connected.</p></div>
      <div class="journey-strip joyful-journey">
        <a href="pages/career_dna_test.html"><strong>01</strong><span aria-hidden="true">🧬</span><h3>Discover yourself</h3><p>Understand your strengths and interests.</p><b>Start Career DNA →</b></a>
        <a href="pages/recommended-opportunities.html"><strong>02</strong><span aria-hidden="true">🔎</span><h3>Choose a next step</h3><p>See opportunities that fit who you are.</p><b>View my matches →</b></a>
        <a href="pages/my-journey.html"><strong>03</strong><span aria-hidden="true">✨</span><h3>Try and grow</h3><p>Track applications and real experiences.</p><b>Open my journey →</b></a>
        <a href="pages/portfolio-builder.html"><strong>04</strong><span aria-hidden="true">🌟</span><h3>Tell your story</h3><p>Turn what you did into proof of growth.</p><b>Build my portfolio →</b></a>
      </div>
    </div></section>
    <section class="home-focus-section support-story">
      <div><p class="eyebrow">You are not doing this alone</p><h2>Stuck? Ask for a little help.</h2><p>Use Career Copilot to compare options, prepare an application, or work out one realistic thing to do next.</p><div class="focus-actions"><a class="btn primary" href="pages/career-copilot.html">Ask Career Copilot</a><a class="btn secondary" href="pages/resources.html">Explore resources</a></div></div>
      <div class="support-chat" aria-label="Example Career Copilot conversation"><p>I’m interested in design, but I don’t know where to start.</p><p>That’s okay. Let’s find one workshop for beginners that you can try this month.</p></div>
    </section>
    <section class="home-focus-section focus-final joyful-final"><p class="eyebrow">Your future is yours to explore</p><h2>Ready for one joyful next step?</h2><p>Start with what interests you today. TeenLaunch will help with what comes next.</p><a class="btn primary" href="${startHref}">${startLabel} <span aria-hidden="true">→</span></a></section>`;

  const renderCards = (items, showMatch) => {
    const root = document.querySelector("[data-home-opportunities]");
    if (!root) return;
    root.innerHTML = items.length ? items.slice(0, 3).map((item) => {
      const opportunity = item.opportunity || item;
      const percentage = Number(item.match_percentage);
      const match = showMatch && Number.isFinite(percentage) ? `<span class="match">${Math.round(percentage)}% <span data-i18n="match">match</span></span>` : "";
      const date = opportunity.application_deadline || opportunity.deadline || "Rolling deadline";
      const organiser = opportunity.organisation || opportunity.organizer || "TeenLaunch partner";
      const reason = item.explanation || `A ${opportunity.category || "growth"} opportunity worth exploring.`;
      const officialUrl = opportunity.application_url || opportunity.source_url;
      const href = officialUrl || `pages/opportunity-details.html?id=${encodeURIComponent(opportunity.id)}`;
      const externalAttributes = officialUrl ? ' target="_blank" rel="noopener noreferrer"' : "";
      const actionLabel = officialUrl ? "Visit official site" : "See if it’s for me";
      return `<a class="opportunity-card" href="${escapeHtml(href)}"${externalAttributes}><div class="card-topline">${match}<span class="category-pill">${escapeHtml(opportunity.category || "Opportunity")}</span></div><h3>${escapeHtml(opportunity.title)}</h3><strong>${escapeHtml(organiser)}</strong><small>${escapeHtml(date)}${opportunity.mode ? ` · ${escapeHtml(opportunity.mode.replace("_", " "))}` : ""}</small><p>${escapeHtml(reason)}</p><b class="card-action">${actionLabel} <span aria-hidden="true">→</span></b></a>`;
    }).join("") : `<div class="empty-opportunities"><span aria-hidden="true">🌱</span><h3>Fresh opportunities are on the way.</h3><p>Our team is reviewing new options. Explore all opportunities or check back soon.</p><a class="btn secondary" href="pages/opportunities.html">Explore opportunities</a></div>`;
  };

  fetch(`${window.TEENLAUNCH_API_BASE}/opportunities`).then(response => { if (!response.ok) throw new Error(); return response.json(); }).then(data => renderCards(data.opportunities || [], false)).catch(() => { document.querySelector("[data-home-opportunities]").innerHTML = '<p>Opportunities could not be loaded. <a href="pages/opportunities.html">Open Explore</a></p>'; });
  if (token) fetch(`${window.TEENLAUNCH_API_BASE}/opportunities/recommended`, { headers: { Authorization: `Bearer ${token}` } }).then(async response => {
    const root = document.querySelector("[data-premium-home]");
    if (response.status === 403 && (await response.clone().json()).code === "PREMIUM_REQUIRED") return;
    if (!response.ok) throw new Error();
    const data = await response.json();
    root.innerHTML = data.completed ? '<p>Your Premium recommendations are ready to explore.</p><a class="btn primary" href="pages/recommended-opportunities.html">View my recommendations</a>' : '<p>Complete Career DNA to start using your Premium recommendations.</p><a class="btn primary" href="pages/career_dna_test.html">Take Career DNA</a>';
  }).catch(() => { document.querySelector("[data-premium-home]").innerHTML = '<p>We could not check your Premium access. <a href="pages/recommended-opportunities.html">Try again</a></p>'; });
}());
