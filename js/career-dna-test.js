(function () {
  const API_BASE = String(window.TEENLAUNCH_API_BASE || localStorage.getItem("teenlaunch_api_base") || "http://localhost:3000/api").replace(/^http:\/\/teenlaunch\.app\b/i, "https://teenlaunch.app");
  const tokenKey = "teenlaunch_token";
  const questions = [
    { type: "Creator", text: "I enjoy turning my ideas into videos, designs, stories or presentations." },
    { type: "Creator", text: "I often notice how the appearance or message of something could be improved." },
    { type: "Builder", text: "I enjoy figuring out how apps, machines or technology work." },
    { type: "Builder", text: "I prefer learning by building, testing or trying something myself." },
    { type: "Explorer", text: "I like researching a topic and comparing information before making a decision." },
    { type: "Explorer", text: "I enjoy finding patterns and understanding why something happened." },
    { type: "Connector", text: "I feel satisfied when I help someone learn or solve a problem." },
    { type: "Connector", text: "I enjoy working with different people and listening to their ideas." },
    { type: "Leader", text: "I naturally take charge when a group is unsure what to do next." },
    { type: "Leader", text: "I enjoy presenting my ideas and encouraging others to support them." },
  ];
  const options = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"];
  const profileNames = {
    "Creator|Leader": "Creative Initiator", "Connector|Creator": "Community Storyteller",
    "Creator|Explorer": "Imaginative Researcher", "Builder|Creator": "Digital Maker",
    "Builder|Explorer": "Technical Investigator", "Builder|Leader": "Innovation Driver",
    "Builder|Connector": "Practical Supporter", "Explorer|Leader": "Strategic Visionary",
    "Connector|Explorer": "Insightful Guide", "Connector|Leader": "Community Champion",
  };
  const recommendations = {
    Creator: { jobs: ["Design and media", "Content and communications", "Creative technology"], opportunities: ["Creative competitions", "Media projects", "Design workshops"] },
    Builder: { jobs: ["Engineering and technology", "Product development", "Skilled technical work"], opportunities: ["Hackathons", "Maker programmes", "Technology challenges"] },
    Explorer: { jobs: ["Research and analysis", "Science and discovery", "Strategy and policy"], opportunities: ["Research programmes", "Case competitions", "Science challenges"] },
    Connector: { jobs: ["Education and coaching", "Community services", "People and culture"], opportunities: ["Volunteering", "Peer mentoring", "Community projects"] },
    Leader: { jobs: ["Entrepreneurship", "Business leadership", "Advocacy and public speaking"], opportunities: ["Leadership programmes", "Pitch competitions", "Student councils"] },
  };

  const card = document.querySelector("[data-test-card]");
  const loading = document.querySelector("[data-dna-loading]");
  const message = document.querySelector("[data-dna-message]");
  let current = 0;
  let answers = Array(10).fill(null);
  let progressKey = "";
  let saving = false;

  const clearSession = () => ["teenlaunch_token", "teenlaunch_user", "teenlaunch_profile"].forEach((key) => localStorage.removeItem(key));
  const goToLogin = () => window.location.replace(`auth.html?mode=login&returnTo=${encodeURIComponent("career_dna_test.html" + window.location.search)}`);
  const authFetch = (path, options = {}) => fetch(`${API_BASE}${path}`, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem(tokenKey)}`, ...(options.headers || {}) } });
  const errorMessage = async (response) => { try { const data = await response.json(); return data?.error?.message || data?.message || "Please try again."; } catch (_) { return "Please try again."; } };

  const saveProgress = () => localStorage.setItem(progressKey, JSON.stringify({ answers, current, savedAt: new Date().toISOString() }));
  const render = () => {
    const question = questions[current];
    document.querySelector("[data-question-count]").textContent = `Question ${current + 1} of 10`;
    document.querySelector("[data-progress-percent]").textContent = `${(current + 1) * 10}%`;
    const bar = document.querySelector("[data-progress-bar]");
    bar.style.width = `${(current + 1) * 10}%`;
    bar.parentElement.setAttribute("aria-valuenow", String(current + 1));
    document.querySelector("[data-question-type]").textContent = question.type;
    const questionText = document.querySelector("[data-question-text]");
    questionText.textContent = question.text;
    document.querySelector("[data-options]").innerHTML = options.map((label, index) => {
      const value = index + 1;
      return `<label class="dna-option${answers[current] === value ? " selected" : ""}"><input type="radio" name="answer" value="${value}" ${answers[current] === value ? "checked" : ""}><span class="dna-option-number">${value}</span><span>${label}</span></label>`;
    }).join("");
    document.querySelector("[data-previous]").disabled = current === 0 || saving;
    const next = document.querySelector("[data-next]");
    next.textContent = current === 9 ? "Submit Test" : "Next";
    next.disabled = saving;
    message.textContent = "";
    document.querySelectorAll('input[name="answer"]').forEach((input) => input.addEventListener("change", () => selectAnswer(Number(input.value), true)));
    questionText.focus({ preventScroll: true });
  };

  const selectAnswer = (value, autoAdvance) => {
    answers[current] = value;
    saveProgress();
    render();
    if (autoAdvance && current < 9) window.setTimeout(() => { current += 1; saveProgress(); render(); }, 220);
  };

  const scoreTest = () => {
    const raw = { Creator: 0, Builder: 0, Explorer: 0, Connector: 0, Leader: 0 };
    questions.forEach((question, index) => { raw[question.type] += answers[index]; });
    const percentages = Object.fromEntries(Object.entries(raw).map(([type, value]) => [type, Math.round(((value - 2) / 8) * 100)]));
    const ranking = Object.keys(percentages).sort((a, b) => percentages[b] - percentages[a] || Object.keys(percentages).indexOf(a) - Object.keys(percentages).indexOf(b));
    const top = ranking[0];
    const secondary = ranking[1];
    const key = [top, secondary].sort().join("|");
    return { raw, percentages, ranking, top, secondary, profileName: profileNames[key] };
  };

  const submit = async () => {
    if (answers.some((answer) => answer === null)) { message.textContent = "Please answer all 10 questions before submitting."; current = answers.findIndex((answer) => answer === null); render(); return; }
    saving = true;
    render();
    message.textContent = "Saving your Career DNA result...";
    const result = scoreTest();
    const jobs = [...new Set([...recommendations[result.top].jobs, ...recommendations[result.secondary].jobs])];
    const opportunities = [...new Set([...recommendations[result.top].opportunities, ...recommendations[result.secondary].opportunities])];
    const completionDate = new Date().toISOString();
    const payload = {
      result_title: result.profileName,
      summary: `Your strongest Career DNA types are ${result.top} and ${result.secondary}.`,
      strengths: result.ranking,
      interests: [result.top, result.secondary],
      recommended_paths: { job_families: jobs, opportunity_types: opportunities },
      answers: Object.fromEntries(answers.map((answer, index) => [`question_${index + 1}`, answer])),
      score: { raw_scores: result.raw, percentages: result.percentages, top_category: result.top, secondary_category: result.secondary, profile_name: result.profileName, recommended_job_families: jobs, recommended_opportunity_types: opportunities, test_version: "1.0", completion_date: completionDate },
    };
    try {
      const response = await authFetch("/career-dna", { method: "POST", body: JSON.stringify(payload) });
      if (response.status === 401 || response.status === 403) { clearSession(); goToLogin(); return; }
      if (!response.ok) throw new Error(await errorMessage(response));
      localStorage.removeItem(progressKey);
      window.location.replace("career_dna_result.html");
    } catch (error) {
      saving = false;
      render();
      message.textContent = `Your answers are safe. ${error.message} Select Submit Test to retry.`;
    }
  };

  document.querySelector("[data-previous]").addEventListener("click", () => { if (current > 0) { current -= 1; saveProgress(); render(); } });
  document.querySelector("[data-next]").addEventListener("click", () => { if (answers[current] === null) { message.textContent = "Choose an answer before continuing."; return; } if (current < 9) { current += 1; saveProgress(); render(); } else submit(); });
  document.querySelector("[data-restart]").addEventListener("click", () => { if (window.confirm("Restart the test and clear all saved answers?")) { answers = Array(10).fill(null); current = 0; localStorage.removeItem(progressKey); render(); } });
  document.addEventListener("keydown", (event) => { if (card.hidden || saving) return; if (/^[1-5]$/.test(event.key)) selectAnswer(Number(event.key), true); else if (event.key === "ArrowLeft" && current > 0) { current -= 1; saveProgress(); render(); } else if (event.key === "ArrowRight" && answers[current] !== null) { current < 9 ? (current += 1, saveProgress(), render()) : submit(); } });

  (async () => {
    if (!localStorage.getItem(tokenKey)) { goToLogin(); return; }
    try {
      const response = await authFetch("/auth/me");
      if (!response.ok) { clearSession(); goToLogin(); return; }
      const session = await response.json();
      if (session.role === "admin") { window.location.replace("admin-dashboard.html"); return; }
      const isRetake = new URLSearchParams(window.location.search).get("retake") === "true";
      if (!isRetake) {
        const latestResponse = await authFetch("/career-dna/latest");
        if (latestResponse.status === 401 || latestResponse.status === 403) { clearSession(); goToLogin(); return; }
        if (!latestResponse.ok) throw new Error(await errorMessage(latestResponse));
        const latest = await latestResponse.json();
        if (latest.result) { window.location.replace("career_dna_result.html"); return; }
      }
      progressKey = `teenlaunch_career_dna_progress_${session.user.id}`;
      const saved = JSON.parse(localStorage.getItem(progressKey) || "null");
      if (saved && Array.isArray(saved.answers) && saved.answers.length === 10) { answers = saved.answers; current = Math.min(Math.max(Number(saved.current) || 0, 0), 9); }
      loading.hidden = true; card.hidden = false; render();
    } catch (_) { loading.textContent = "Unable to confirm your session. Check your connection and refresh."; }
  })();
})();
