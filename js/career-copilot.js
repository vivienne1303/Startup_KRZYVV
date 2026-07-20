(function () {
  const API = window.TEENLAUNCH_API_BASE;
  const token = localStorage.getItem("teenlaunch_token");
  if (!token) {
    location.replace(`auth.html?mode=login&returnTo=${encodeURIComponent("career-copilot.html")}`);
    return;
  }

  const storageKey = "teenlaunch_career_copilot_session";
  const messagesRoot = document.querySelector("[data-chat-messages]");
  const form = document.querySelector("[data-chat-form]");
  const loading = document.querySelector("[data-chat-loading]");
  const errorBox = document.querySelector("[data-chat-error]");
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));

  const formatResponse = (value) => {
    const safe = escapeHtml(value).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    return safe.split("\n").map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '<div class="copilot-space"></div>';
      if (/^[-•]\s+/.test(trimmed)) return `<div class="copilot-list-item"><span>•</span><p>${trimmed.replace(/^[-•]\s+/, "")}</p></div>`;
      const numbered = trimmed.match(/^(\d+)\.\s+(.+)$/);
      if (numbered) return `<div class="copilot-list-item"><span>${numbered[1]}.</span><p>${numbered[2]}</p></div>`;
      if (/^[A-Za-z][^.!?]{1,45}:$/.test(trimmed)) return `<h3 class="copilot-response-heading">${trimmed.slice(0, -1)}</h3>`;
      return `<p class="copilot-response-line">${trimmed}</p>`;
    }).join("");
  };

  let messages = [];
  try {
    messages = JSON.parse(sessionStorage.getItem(storageKey) || "[]").filter((message) => ["user", "assistant"].includes(message.role)).slice(-20);
  } catch {
    messages = [];
  }
  if (!messages.length) messages = [{ role: "assistant", content: "Hi! I’m your TeenLaunch Career Copilot. I can help you understand your Career DNA, explore skills and find suitable verified TeenLaunch opportunities.", source: "database" }];

  const save = () => sessionStorage.setItem(storageKey, JSON.stringify(messages.slice(-20)));
  const render = () => {
    messagesRoot.innerHTML = messages.map((message) => {
      const source = message.source === "ai" ? "Personalised Career Copilot guidance" : message.source === "database_fallback" ? "TeenLaunch database guidance" : "TeenLaunch guidance";
      const references = message.opportunities?.length ? `<div class="opportunity-references"><strong>Recommended TeenLaunch opportunities</strong>${message.opportunities.map((opportunity) => `<a href="${escapeHtml(opportunity.link.replace(/^pages\//, ""))}"><span>${escapeHtml(opportunity.title)}</span><small>${escapeHtml(opportunity.why || "View verified opportunity details")}</small></a>`).join("")}</div>` : "";
      return `<article class="copilot-bubble ${message.role}"><div class="copilot-response">${message.role === "assistant" ? formatResponse(message.content) : `<p>${escapeHtml(message.content)}</p>`}</div>${message.role === "assistant" ? `${references}<small class="response-source">${source}</small>` : ""}</article>`;
    }).join("");
    messagesRoot.scrollTop = messagesRoot.scrollHeight;
  };

  const send = async (text) => {
    const question = String(text || "").trim();
    if (!question) return;
    errorBox.hidden = true;
    messages.push({ role: "user", content: question });
    render(); save(); form.elements.message.value = "";
    form.querySelector("button").disabled = true; loading.hidden = false;
    try {
      const history = messages.slice(0, -1).slice(-8).map(({ role, content }) => ({ role, content }));
      const response = await fetch(`${API}/career-copilot/chat`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ message: question, history }) });
      if (response.status === 401 || response.status === 403) {
        location.replace(`auth.html?mode=login&returnTo=${encodeURIComponent("career-copilot.html")}`);
        return;
      }
      if (!response.ok) {
        let error = "Career Copilot could not respond.";
        try { error = (await response.json()).error?.message || error; } catch {}
        throw new Error(error);
      }
      const data = await response.json();
      messages.push({ role: "assistant", content: data.answer, source: data.source, opportunities: data.opportunities || [] });
      save(); render();
    } catch (error) {
      errorBox.textContent = error.message; errorBox.hidden = false;
    } finally {
      loading.hidden = true; form.querySelector("button").disabled = false; form.elements.message.focus();
    }
  };

  form.addEventListener("submit", (event) => { event.preventDefault(); send(form.elements.message.value); });
  document.querySelectorAll("[data-starter]").forEach((button) => button.addEventListener("click", () => send(button.textContent)));
  document.querySelector("[data-clear-chat]").addEventListener("click", () => {
    messages = [{ role: "assistant", content: "Conversation cleared. What career goal would you like to explore?", source: "database" }];
    sessionStorage.removeItem(storageKey); render();
  });
  render();
})();
