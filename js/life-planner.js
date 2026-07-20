(function () {
  const API = `${window.TEENLAUNCH_API_BASE}/life-planner`;
  const token = localStorage.getItem("teenlaunch_token");
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const state = { preferences: null, tasks: [], deadlines: [], weekStart: monday(new Date()) };
  const content = document.querySelector("[data-planner-content]");
  const notice = document.querySelector("[data-planner-notice]");
  const taskForm = document.querySelector("[data-task-form]");
  const preferencesForm = document.querySelector("[data-preferences-form]");

  function monday(value) {
    const date = new Date(value); date.setHours(0, 0, 0, 0);
    const day = date.getDay() || 7; date.setDate(date.getDate() - day + 1); return date;
  }
  const addDays = (date, amount) => new Date(date.getTime() + amount * 86400000);
  const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  const headers = (json = false) => ({ Authorization: `Bearer ${token}`, ...(json ? { "Content-Type": "application/json" } : {}) });
  const localInput = (value) => { if (!value) return ""; const date = new Date(value); const offset = date.getTimezoneOffset() * 60000; return new Date(date - offset).toISOString().slice(0, 16); };
  const formatDate = (value, options = {}) => new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", ...options }).format(new Date(value));
  const formatTime = (value) => new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(value));
  const setNotice = (message, type = "") => { notice.textContent = message; notice.className = `planner-notice ${type}`.trim(); notice.hidden = !message; };

  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, { ...options, headers: { ...headers(Boolean(options.body)), ...(options.headers || {}) } });
    if (response.status === 204) return null;
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "The planner could not be updated.");
    return data;
  }

  function buildPreferenceFields() {
    const school = document.querySelector("[data-school-days]");
    const rests = document.querySelector("[data-rest-days]");
    school.innerHTML = days.map((day, index) => `<div class="school-day"><label><input type="checkbox" data-school-enabled="${index + 1}"> ${day.slice(0, 3)}</label><input type="time" data-school-start="${index + 1}" value="08:00" aria-label="${day} school start"><input type="time" data-school-end="${index + 1}" value="15:00" aria-label="${day} school end"></div>`).join("");
    rests.innerHTML = days.map((day, index) => `<label><input type="checkbox" name="rest_day" value="${index + 1}"> ${day.slice(0, 3)}</label>`).join("");
  }

  function fillPreferences() {
    const prefs = state.preferences;
    ["education_level", "preferred_session_minutes", "wake_time", "sleep_time", "preferred_study_start", "preferred_study_end", "personal_goals"].forEach((name) => { if (preferencesForm.elements[name]) preferencesForm.elements[name].value = String(prefs[name] || "").slice(0, 5) || preferencesForm.elements[name].value; });
    document.querySelectorAll("[data-school-enabled]").forEach((box) => { box.checked = false; });
    (prefs.school_schedule || []).forEach((entry) => {
      const enabled = document.querySelector(`[data-school-enabled="${entry.day}"]`);
      if (!enabled) return; enabled.checked = true;
      document.querySelector(`[data-school-start="${entry.day}"]`).value = entry.start;
      document.querySelector(`[data-school-end="${entry.day}"]`).value = entry.end;
    });
    preferencesForm.querySelectorAll('[name="rest_day"]').forEach((box) => { box.checked = (prefs.preferred_rest_days || []).includes(Number(box.value)); });
  }

  function taskInstances(task) {
    if (!task.start_time || !task.end_time) return [];
    const originalStart = new Date(task.start_time); const originalEnd = new Date(task.end_time);
    const duration = originalEnd - originalStart; const weekEnd = addDays(state.weekStart, 7);
    if (task.recurrence === "none") return originalEnd >= state.weekStart && originalStart < weekEnd ? [{ ...task, displayStart: originalStart, displayEnd: originalEnd }] : [];
    const instances = [];
    for (let index = 0; index < 7; index += 1) {
      const date = addDays(state.weekStart, index);
      if (task.recurrence === "weekly" && (originalStart.getDay() || 7) !== index + 1) continue;
      const start = new Date(date); start.setHours(originalStart.getHours(), originalStart.getMinutes(), 0, 0);
      instances.push({ ...task, displayStart: start, displayEnd: new Date(start.getTime() + duration) });
    }
    return instances;
  }

  function actionButtons(task) {
    if (task.status === "suggested") return `<button class="mini-button" data-action="accept" data-id="${task.id}">Accept</button><button class="mini-button" data-action="reject" data-id="${task.id}">Reject</button><button class="mini-button" data-action="edit" data-id="${task.id}">Edit</button>`;
    return `<button class="mini-button" data-action="complete" data-id="${task.id}">${task.status === "completed" ? "Reopen" : "Done"}</button><button class="mini-button" data-action="edit" data-id="${task.id}">Edit</button><button class="mini-button" data-action="delete" data-id="${task.id}">Delete</button>`;
  }

  function renderCalendar() {
    const end = addDays(state.weekStart, 6);
    document.querySelector("[data-week-label]").textContent = `${formatDate(state.weekStart)} – ${formatDate(end, { year: "numeric" })}`;
    const today = new Date().toDateString();
    document.querySelector("[data-weekly-calendar]").innerHTML = days.map((day, index) => {
      const date = addDays(state.weekStart, index);
      const events = state.tasks.flatMap(taskInstances).filter((item) => item.displayStart.toDateString() === date.toDateString()).sort((a, b) => a.displayStart - b.displayStart);
      return `<article class="calendar-day ${date.toDateString() === today ? "today" : ""}"><h3>${day}<span>${formatDate(date)}</span></h3><div class="calendar-events">${events.map((task) => `<div class="calendar-event ${esc(task.status)}"><strong>${esc(task.title)}</strong><time>${formatTime(task.displayStart)}–${formatTime(task.displayEnd)}</time><div class="event-actions">${actionButtons(task)}</div></div>`).join("")}</div></article>`;
    }).join("");
  }

  function taskCard(task) {
    const date = task.deadline ? `Due ${formatDate(`${task.deadline}T12:00:00`)}` : task.start_time ? formatDate(task.start_time) : "Not scheduled";
    return `<article class="task-card"><strong>${esc(task.title)}</strong> <span class="priority ${esc(task.priority)}">${esc(task.priority)}</span><p>${esc(task.category)} · ${date}</p><div class="task-actions">${actionButtons(task)}</div></article>`;
  }

  function renderLists() {
    const now = new Date(); const today = now.toISOString().slice(0, 10);
    const regular = state.tasks.filter((task) => !task.is_suggestion && task.status !== "rejected");
    const groups = {
      overdue: regular.filter((task) => task.status !== "completed" && task.deadline && task.deadline < today),
      upcoming: regular.filter((task) => task.status !== "completed" && (!task.deadline || task.deadline >= today)),
      completed: regular.filter((task) => task.status === "completed"),
    };
    Object.entries(groups).forEach(([name, tasks]) => {
      document.querySelector(`[data-${name}-list]`).innerHTML = tasks.map(taskCard).join("");
      document.querySelector(`[data-${name}-empty]`).hidden = tasks.length > 0;
    });
  }

  function renderDeadlines() {
    const list = document.querySelector("[data-deadline-list]");
    list.innerHTML = state.deadlines.sort((a, b) => a.deadline.localeCompare(b.deadline)).map((item) => `<a class="deadline-item" href="opportunity-details.html?id=${encodeURIComponent(item.opportunity_id)}"><strong>${esc(item.title)}</strong><span>${esc(item.relationship)} · ${formatDate(`${item.deadline}T12:00:00`)}</span></a>`).join("");
    document.querySelector("[data-deadline-empty]").hidden = state.deadlines.length > 0;
  }
  function render() { renderCalendar(); renderLists(); renderDeadlines(); }

  function editTask(task) {
    taskForm.elements.task_id.value = task.id; taskForm.elements.title.value = task.title;
    ["description", "category", "priority", "deadline", "recurrence", "estimated_minutes"].forEach((name) => { taskForm.elements[name].value = task[name] || (name === "estimated_minutes" ? 45 : ""); });
    taskForm.elements.start_time.value = localInput(task.start_time); taskForm.elements.end_time.value = localInput(task.end_time);
    document.querySelector("[data-task-form-title]").textContent = "Edit task"; document.querySelector("[data-task-submit]").textContent = "Save changes"; document.querySelector("[data-cancel-edit]").hidden = false;
    taskForm.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function resetTaskForm() { taskForm.reset(); taskForm.elements.task_id.value = ""; taskForm.elements.estimated_minutes.value = "45"; taskForm.elements.priority.value = "medium"; document.querySelector("[data-task-form-title]").textContent = "New task"; document.querySelector("[data-task-submit]").textContent = "Add task"; document.querySelector("[data-cancel-edit]").hidden = true; }

  function validateTime(payload, editingId) {
    if (!payload.start_time && !payload.end_time) return;
    if (!payload.start_time || !payload.end_time) throw new Error("Add both a start and end time.");
    const start = new Date(payload.start_time); const end = new Date(payload.end_time);
    const wake = state.preferences.wake_time || "07:00"; const sleep = state.preferences.sleep_time || "23:00";
    const minutes = (date) => date.getHours() * 60 + date.getMinutes(); const parse = (time) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
    if (minutes(start) < parse(wake) || minutes(end) > parse(sleep)) throw new Error("That time is outside your waking hours.");
    const school = (state.preferences.school_schedule || []).find((item) => Number(item.day) === (start.getDay() || 7));
    if (school && minutes(start) < parse(school.end) && minutes(end) > parse(school.start)) throw new Error("That time overlaps your school hours.");
    const conflict = state.tasks.find((task) => task.id !== editingId && task.start_time && task.end_time && !["rejected", "completed"].includes(task.status) && start < new Date(task.end_time) && end > new Date(task.start_time));
    if (conflict) throw new Error(`That time overlaps “${conflict.title}”.`);
  }

  taskForm.addEventListener("submit", async (event) => {
    event.preventDefault(); const data = new FormData(taskForm); const id = data.get("task_id");
    const payload = Object.fromEntries(data.entries()); delete payload.task_id;
    payload.start_time = payload.start_time ? new Date(payload.start_time).toISOString() : null; payload.end_time = payload.end_time ? new Date(payload.end_time).toISOString() : null;
    try { validateTime(payload, id); const result = await request(id ? `/tasks/${id}` : "/tasks", { method: id ? "PUT" : "POST", body: JSON.stringify(payload) }); if (id) state.tasks = state.tasks.map((task) => task.id === id ? result.task : task); else state.tasks.push(result.task); resetTaskForm(); render(); setNotice(id ? "Task updated." : "Task added.", "success"); } catch (error) { setNotice(error.message, "error"); }
  });

  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]"); if (!button) return;
    const task = state.tasks.find((item) => item.id === button.dataset.id); if (!task) return;
    const action = button.dataset.action;
    if (action === "edit") { editTask(task); return; }
    try {
      if (action === "delete") { if (!window.confirm(`Delete “${task.title}”?`)) return; await request(`/tasks/${task.id}`, { method: "DELETE" }); state.tasks = state.tasks.filter((item) => item.id !== task.id); }
      else { const status = action === "accept" ? "planned" : action === "reject" ? "rejected" : task.status === "completed" ? "todo" : "completed"; const result = await request(`/tasks/${task.id}`, { method: "PUT", body: JSON.stringify({ status }) }); state.tasks = state.tasks.map((item) => item.id === task.id ? result.task : item); }
      render(); setNotice("Planner updated.", "success");
    } catch (error) { setNotice(error.message, "error"); }
  });

  preferencesForm.addEventListener("submit", async (event) => {
    event.preventDefault(); const form = new FormData(preferencesForm);
    const school_schedule = days.map((_, index) => index + 1).filter((day) => document.querySelector(`[data-school-enabled="${day}"]`).checked).map((day) => ({ day, start: document.querySelector(`[data-school-start="${day}"]`).value, end: document.querySelector(`[data-school-end="${day}"]`).value }));
    const payload = { education_level: form.get("education_level"), preferred_session_minutes: Number(form.get("preferred_session_minutes")), wake_time: form.get("wake_time"), sleep_time: form.get("sleep_time"), preferred_study_start: form.get("preferred_study_start"), preferred_study_end: form.get("preferred_study_end"), personal_goals: form.get("personal_goals"), preferred_rest_days: form.getAll("rest_day").map(Number), school_schedule };
    try { const result = await request("/preferences", { method: "PUT", body: JSON.stringify(payload) }); state.preferences = result.preferences; document.querySelector("[data-settings-panel]").hidden = true; setNotice("Planning preferences saved.", "success"); } catch (error) { setNotice(error.message, "error"); }
  });

  document.querySelector("[data-generate-plan]").addEventListener("click", async () => {
    setNotice("Building a balanced suggestion with scheduling rules…");
    try { const result = await request("/generate", { method: "POST", body: JSON.stringify({ week_start: state.weekStart.toISOString() }) }); state.tasks = state.tasks.filter((task) => !(task.is_suggestion && task.status === "suggested")).concat(result.suggestions); render(); const warning = result.unscheduled.length ? ` ${result.unscheduled.length} task(s) could not fit realistically; shorten them, move a deadline or free up time.` : ""; setNotice(`Suggested ${result.suggestions.length} session(s) using transparent planning rules.${warning}`, result.unscheduled.length ? "error" : "success"); } catch (error) { setNotice(error.message, "error"); }
  });
  document.querySelector("[data-toggle-settings]").addEventListener("click", () => { document.querySelector("[data-settings-panel]").hidden = false; });
  document.querySelector("[data-close-settings]").addEventListener("click", () => { document.querySelector("[data-settings-panel]").hidden = true; });
  document.querySelector("[data-cancel-edit]").addEventListener("click", resetTaskForm);
  document.querySelector("[data-week-previous]").addEventListener("click", () => { state.weekStart = addDays(state.weekStart, -7); renderCalendar(); });
  document.querySelector("[data-week-next]").addEventListener("click", () => { state.weekStart = addDays(state.weekStart, 7); renderCalendar(); });
  document.querySelector("[data-week-today]").addEventListener("click", () => { state.weekStart = monday(new Date()); renderCalendar(); });

  async function load() {
    try { const data = await request("/me"); state.preferences = data.preferences; state.tasks = data.tasks || []; state.deadlines = data.opportunity_deadlines || []; buildPreferenceFields(); fillPreferences(); render(); content.hidden = false; setNotice(""); } catch (error) { setNotice(`${error.message} Make sure the Life Planner SQL migration has been run.`, "error"); }
  }
  load();
})();
