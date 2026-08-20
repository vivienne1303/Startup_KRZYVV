(function () {
  const main = document.querySelector("main");
  if (!main) return;
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  const token = localStorage.getItem("teenlaunch_token");
  const storedProfile = (() => { try { return JSON.parse(localStorage.getItem("teenlaunch_profile") || "null"); } catch { return null; } })();
  const firstName = String(storedProfile?.full_name || "").trim().split(/\s+/)[0];
  const startHref = token ? "pages/my-journey.html" : "pages/auth.html?mode=register&returnTo=my-journey.html";
  const startLabel = token ? "Continue my journey" : "Personalise my journey";
  // Replace this empty string with the Luma event URL when registration opens.
  const LAUNCH_EVENT_REGISTRATION_URL = "";
  const launchRegistrationHref = LAUNCH_EVENT_REGISTRATION_URL || "#launch-tickets";

  main.className = "simplified-home joyful-home";
  main.innerHTML = `
    <section class="launch-event-hero" aria-labelledby="launch-event-title">
      <div class="launch-event-shell">
        <div class="launch-event-copy">
          <p class="launch-badge"><span aria-hidden="true">✦</span> You’re invited</p>
          <h1 id="launch-event-title">TeenLaunch is Launching! <span aria-hidden="true">🚀</span></h1>
          <p class="launch-event-lead">Join us as we officially launch TeenLaunch — discover opportunities, connect with others and kickstart your journey.</p>
          <a class="btn launch-register-button" href="${launchRegistrationHref}" data-luma-registration-url="${LAUNCH_EVENT_REGISTRATION_URL}">Register for Launch Event <span aria-hidden="true">→</span></a>
          ${LAUNCH_EVENT_REGISTRATION_URL ? "" : '<small class="launch-link-note">Luma registration link coming soon</small>'}
          <div class="launch-ticket-grid" id="launch-tickets" aria-label="Launch event ticket categories">
            <article class="launch-ticket student-ticket"><span>STUDENTS</span><strong>FREE</strong><p>For the young people TeenLaunch is built to support.</p></article>
            <article class="launch-ticket vip-ticket"><span>VIP · INVESTORS / ENTREPRENEURS</span><strong>$20</strong><p>For adult entrepreneurs and investors joining the launch.</p></article>
          </div>
          <p class="launch-luma-note"><span aria-hidden="true">✓</span> Registration will be handled securely through Luma.</p>
        </div>
        <div class="launch-goodie-card">
          <div class="launch-goodie-heading"><p class="eyebrow">Exclusive for launch attendees</p><h2>🎁 Get Your TeenLaunch Launch Goodie Bag</h2><p>Register and join us to receive exclusive TeenLaunch goodies made to help you discover, plan and launch your next step.</p></div>
          <figure><img src="assets/images/Goodie_bags.jpg" alt="TeenLaunch Launch Goodie Bag illustration showing a tote bag, Launchpad notebook, bookmark front and back, and Career DNA sticker sheet"><figcaption><span>TeenLaunch Tote Bag</span><span>Launchpad Notebook</span><span>Bookmark</span><span>Career DNA Stickers</span></figcaption></figure>
        </div>
      </div>
    </section>
    <section class="home-focus-section home-focus-hero joyful-hero">
      <div class="hero-intro">
        <p class="eyebrow">${firstName ? `Welcome back, ${escapeHtml(firstName)}` : "Your next step starts here"}</p>
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
      <div class="section-row"><div class="focus-heading"><p class="eyebrow">${token ? "Picked for you" : "Start exploring"}</p><h2 id="opportunities-title">Good next steps, not endless choices.</h2><p>${token ? "Recommendations shaped by your profile and Career DNA." : "A few current opportunities to help you begin."}</p></div><a class="text-link" href="pages/opportunities.html">See all opportunities <span aria-hidden="true">→</span></a></div>
      <div class="home-opportunity-grid" data-home-opportunities aria-live="polite"><p class="loading-note">Finding fresh opportunities for you…</p></div>
    </section>
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
      <div class="support-chat" aria-label="Example Career Copilot conversation"><p>I’m interested in design, but I don’t know where to start.</p><p>That’s okay. Let’s find one beginner-friendly workshop you can try this month.</p></div>
    </section>
    <section class="home-focus-section focus-final joyful-final"><p class="eyebrow">Your future is yours to explore</p><h2>Ready for one joyful next step?</h2><p>Start with what interests you today. TeenLaunch will help with what comes next.</p><a class="btn primary" href="${startHref}">${startLabel} <span aria-hidden="true">→</span></a></section>`;

  const renderCards = (items, showMatch) => {
    const root = document.querySelector("[data-home-opportunities]");
    if (!root) return;
    root.innerHTML = items.length ? items.slice(0, 3).map((item) => {
      const opportunity = item.opportunity || item;
      const percentage = Number(item.match_percentage);
      const match = showMatch && Number.isFinite(percentage) ? `<span class="match">${Math.round(percentage)}% match</span>` : "";
      const date = opportunity.application_deadline || opportunity.deadline || "Rolling deadline";
      const organiser = opportunity.organisation || opportunity.organizer || "TeenLaunch partner";
      const reason = item.explanation || `A ${opportunity.category || "growth"} opportunity worth exploring.`;
      const href = `pages/opportunity-details.html?id=${encodeURIComponent(opportunity.id)}`;
      return `<a class="opportunity-card" href="${href}">${opportunity.image_url ? `<img src="${escapeHtml(opportunity.image_url)}" alt="">` : `<div class="opportunity-placeholder" aria-hidden="true">${escapeHtml((opportunity.category || "Opportunity").slice(0, 1))}</div>`}<div class="card-topline">${match}<span class="category-pill">${escapeHtml(opportunity.category || "Opportunity")}</span></div><h3>${escapeHtml(opportunity.title)}</h3><strong>${escapeHtml(organiser)}</strong><small>${escapeHtml(date)}${opportunity.mode ? ` · ${escapeHtml(opportunity.mode.replace("_", " "))}` : ""}</small><p>${escapeHtml(reason)}</p><b class="card-action">See if it’s for me <span aria-hidden="true">→</span></b></a>`;
    }).join("") : `<div class="empty-opportunities"><span aria-hidden="true">🌱</span><h3>Fresh opportunities are on the way.</h3><p>Our team is reviewing new options. Explore all opportunities or check back soon.</p><a class="btn secondary" href="pages/opportunities.html">Explore opportunities</a></div>`;
  };

  const personalised = token ? fetch(`${window.TEENLAUNCH_API_BASE}/opportunities/recommended`, { headers: { Authorization: `Bearer ${token}` } }).then((response) => response.ok ? response.json() : Promise.reject()).then((data) => { const recommendations = data.recommendations || []; if (!recommendations.length) return Promise.reject(); renderCards(recommendations, true); }) : Promise.reject();
  personalised.catch(() => fetch(`${window.TEENLAUNCH_API_BASE}/opportunities`).then((response) => response.ok ? response.json() : Promise.reject()).then((data) => renderCards(data.opportunities || [], false))).catch(() => { const root = document.querySelector("[data-home-opportunities]"); if (root) root.innerHTML = `<div class="empty-opportunities"><span aria-hidden="true">☁️</span><h3>We couldn’t load opportunities right now.</h3><p>Please try the full Explore page in a moment.</p><a class="btn secondary" href="pages/opportunities.html">Open Explore</a></div>`; });
}());
