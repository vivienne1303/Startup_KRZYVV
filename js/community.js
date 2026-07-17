(function () {
  const API = window.TEENLAUNCH_API_BASE;
  const token = localStorage.getItem("teenlaunch_token");
  if (!token) { location.replace(`auth.html?mode=login&returnTo=${encodeURIComponent("community.html")}`); return; }
  const headers = { Authorization: `Bearer ${token}` };
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const parseError = async (response) => { try { return (await response.json())?.error?.message || "Request failed"; } catch { return "Request failed"; } };
  const avatar = (user) => user.profile_picture_url || user.avatar_url || "../assets/images/light_logo.png";
  const card = (user, follower = false) => `<article class="person-card" data-user-card="${esc(user.id)}"><a href="member-profile.html?id=${encodeURIComponent(user.id)}"><img class="person-avatar" src="${esc(avatar(user))}" alt=""></a><div><h3><a href="member-profile.html?id=${encodeURIComponent(user.id)}">@${esc(user.username || "teenlaunch-user")}</a></h3><p>${esc(user.full_name || "TeenLaunch user")}</p><small>${esc(user.school_name || "")}</small></div><div class="person-actions"><button class="btn secondary" type="button" data-follow="${esc(user.id)}" data-following="${user.following || user.followed_back}">${user.following || user.followed_back ? "Following" : follower ? "Follow back" : "Follow"}</button><a class="btn primary" href="inbox.html?user=${encodeURIComponent(user.id)}">Message</a></div></article>`;

  const bind = (root) => root.querySelectorAll("[data-follow]").forEach((button) => button.addEventListener("click", async () => {
    const following = button.dataset.following === "true";
    button.disabled = true;
    const response = await fetch(`${API}/social/follows/${encodeURIComponent(button.dataset.follow)}`, { method: following ? "DELETE" : "POST", headers });
    if (response.ok || response.status === 409) { button.dataset.following = String(!following); button.textContent = !following ? "Following" : "Follow"; }
    else alert(await parseError(response));
    button.disabled = false;
  }));

  const results = document.querySelector("[data-search-results]");
  const status = document.querySelector("[data-search-status]");
  document.querySelector("[data-search-form]").addEventListener("submit", async (event) => {
    event.preventDefault(); const query = new FormData(event.currentTarget).get("q").trim();
    status.textContent = "Searching…"; results.innerHTML = "";
    const response = await fetch(`${API}/social/search?q=${encodeURIComponent(query)}`, { headers });
    if (!response.ok) { status.textContent = await parseError(response); return; }
    const users = (await response.json()).users || [];
    status.textContent = users.length ? `${users.length} user${users.length === 1 ? "" : "s"} found` : "No matching usernames found.";
    results.innerHTML = users.map((user) => card(user)).join(""); bind(results);
  });

  const loadFollowers = async () => {
    const response = await fetch(`${API}/social/followers`, { headers });
    if (!response.ok) return;
    const followers = (await response.json()).followers || [];
    const root = document.querySelector("[data-followers]"); root.innerHTML = followers.map((user) => card(user, true)).join("");
    document.querySelector("[data-followers-empty]").hidden = followers.length > 0; bind(root);
  };
  loadFollowers();
})();
