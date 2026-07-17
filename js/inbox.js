(function () {
  const API = window.TEENLAUNCH_API_BASE;
  const token = localStorage.getItem("teenlaunch_token");
  if (!token) { location.replace(`auth.html?mode=login&returnTo=${encodeURIComponent(location.pathname + location.search)}`); return; }
  const headers = { Authorization: `Bearer ${token}` };
  let currentUserId = new URLSearchParams(location.search).get("user");
  let myId = "";
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const parseError = async (response) => { try { return (await response.json())?.error?.message || "Request failed"; } catch { return "Request failed"; } };
  const threadList = document.querySelector("[data-thread-list]");
  const notificationList = document.querySelector("[data-notification-list]");
  const status = document.querySelector("[data-inbox-status]");

  const openConversation = async (userId) => {
    currentUserId = userId; history.replaceState(null, "", `inbox.html?user=${encodeURIComponent(userId)}`);
    const response = await fetch(`${API}/social/messages/${encodeURIComponent(userId)}`, { headers });
    if (!response.ok) { status.textContent = await parseError(response); return; }
    const data = await response.json();
    document.querySelector("[data-conversation-empty]").hidden = true; document.querySelector("[data-conversation-content]").hidden = false;
    document.querySelector("[data-chat-name]").textContent = data.user?.full_name || "TeenLaunch user";
    document.querySelector("[data-chat-username]").textContent = `@${data.user?.username || "user"}`;
    const list = document.querySelector("[data-message-list]");
    list.innerHTML = (data.messages || []).map((message) => `<div class="message-bubble ${message.sender_id === myId ? "mine" : ""}">${esc(message.body)}<small>${new Date(message.created_at).toLocaleString()}</small></div>`).join("");
    list.scrollTop = list.scrollHeight;
  };

  const load = async () => {
    const [meResponse, inboxResponse] = await Promise.all([fetch(`${API}/auth/me`, { headers }), fetch(`${API}/social/inbox`, { headers })]);
    if (meResponse.status === 401 || inboxResponse.status === 401) { location.replace("auth.html?mode=login&returnTo=inbox.html"); return; }
    if (!inboxResponse.ok) { status.textContent = await parseError(inboxResponse); return; }
    myId = (await meResponse.json()).user?.id || "";
    const data = await inboxResponse.json();
    threadList.innerHTML = data.threads.length ? data.threads.map((thread) => `<button class="thread-card" type="button" data-thread="${esc(thread.user?.id)}"><div class="thread-meta"><h3>@${esc(thread.user?.username || "user")}</h3>${thread.unread ? `<span class="unread-badge">${thread.unread}</span>` : ""}</div><p>${esc(thread.last_message.body)}</p><small>${new Date(thread.last_message.created_at).toLocaleString()}</small></button>`).join("") : `<div class="notification-card"><p>No messages yet.</p></div>`;
    notificationList.innerHTML = data.notifications.length ? data.notifications.map((notice) => `<article class="notification-card"><strong>${esc(notice.title)}</strong><p>${esc(notice.body)}</p><small>${new Date(notice.created_at).toLocaleString()}</small></article>`).join("") : `<div class="notification-card"><p>No updates yet.</p></div>`;
    threadList.querySelectorAll("[data-thread]").forEach((button) => button.addEventListener("click", () => openConversation(button.dataset.thread)));
    status.textContent = "";
    if (currentUserId) openConversation(currentUserId);
  };

  document.querySelectorAll("[data-inbox-tab]").forEach((button) => button.addEventListener("click", () => {
    document.querySelectorAll("[data-inbox-tab]").forEach((item) => item.classList.toggle("active", item === button));
    const messages = button.dataset.inboxTab === "messages"; threadList.hidden = !messages; notificationList.hidden = messages;
  }));
  document.querySelector("[data-message-form]").addEventListener("submit", async (event) => {
    event.preventDefault(); if (!currentUserId) return;
    const body = new FormData(event.currentTarget).get("body").trim(); if (!body) return;
    const response = await fetch(`${API}/social/messages/${encodeURIComponent(currentUserId)}`, { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ body }) });
    if (!response.ok) { alert(await parseError(response)); return; }
    event.currentTarget.reset(); await openConversation(currentUserId);
  });
  load();
})();
