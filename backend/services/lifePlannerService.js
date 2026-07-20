const DAY_MS = 24 * 60 * 60 * 1000;

const startOfWeek = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date;
};

const atTime = (date, time) => {
  const result = new Date(date);
  const [hours, minutes] = String(time || "00:00").split(":").map(Number);
  result.setHours(hours || 0, minutes || 0, 0, 0);
  return result;
};

const overlaps = (start, end, item) => start < item.end && end > item.start;

const expandBlockers = (tasks, preferences, weekStart) => {
  const blockers = [];
  const schedules = Array.isArray(preferences.school_schedule) ? preferences.school_schedule : [];
  schedules.forEach((entry) => {
    const day = Number(entry.day);
    if (day < 1 || day > 7 || !entry.start || !entry.end) return;
    const date = new Date(weekStart.getTime() + (day - 1) * DAY_MS);
    blockers.push({ start: atTime(date, entry.start), end: atTime(date, entry.end) });
  });

  tasks.filter((task) => task.start_time && task.end_time && !["rejected", "completed"].includes(task.status)).forEach((task) => {
    const start = new Date(task.start_time);
    const end = new Date(task.end_time);
    if (["weekly", "daily"].includes(task.recurrence)) {
      const jsDay = start.getDay() || 7;
      const targetDays = task.recurrence === "daily" ? [1, 2, 3, 4, 5, 6, 7] : [jsDay];
      targetDays.forEach((targetDay) => {
        const date = new Date(weekStart.getTime() + (targetDay - 1) * DAY_MS);
        blockers.push({ start: atTime(date, `${start.getHours()}:${start.getMinutes()}`), end: atTime(date, `${end.getHours()}:${end.getMinutes()}`) });
      });
    } else if (end >= weekStart && start < new Date(weekStart.getTime() + 7 * DAY_MS)) {
      blockers.push({ start, end });
    }
  });
  return blockers;
};

const priorityRank = { high: 3, medium: 2, low: 1 };

const generateWeeklySuggestions = ({ tasks, preferences, week }) => {
  const weekStart = startOfWeek(week);
  const sessionMinutes = Math.max(20, Math.min(180, Number(preferences.preferred_session_minutes) || 45));
  const wake = preferences.wake_time || "07:00";
  const sleep = preferences.sleep_time || "23:00";
  const preferredStart = preferences.preferred_study_start || "16:00";
  const preferredEnd = preferences.preferred_study_end || "21:00";
  const restDays = new Set((preferences.preferred_rest_days || []).map(Number));
  const blockers = expandBlockers(tasks, preferences, weekStart);
  const candidates = tasks
    .filter((task) => !task.is_suggestion && !task.start_time && !["completed", "rejected"].includes(task.status))
    .sort((a, b) => {
      const priority = priorityRank[b.priority] - priorityRank[a.priority];
      if (priority) return priority;
      return new Date(a.deadline || "9999-12-31") - new Date(b.deadline || "9999-12-31");
    });
  const suggestions = [];
  const unscheduled = [];

  for (const task of candidates) {
    let remaining = Math.max(20, Number(task.estimated_minutes) || sessionMinutes);
    let placed = false;
    for (let day = 1; day <= 7 && remaining > 0; day += 1) {
      if (restDays.has(day)) continue;
      const date = new Date(weekStart.getTime() + (day - 1) * DAY_MS);
      const dayOpen = atTime(date, task.category === "study" || task.category === "school" ? preferredStart : wake);
      const dayClose = atTime(date, task.category === "study" || task.category === "school" ? preferredEnd : sleep);
      const latestDeadline = task.deadline ? new Date(`${task.deadline}T23:59:59`) : null;
      for (let cursor = new Date(dayOpen); cursor < dayClose && remaining > 0; cursor = new Date(cursor.getTime() + 30 * 60000)) {
        const duration = Math.min(sessionMinutes, remaining);
        const end = new Date(cursor.getTime() + duration * 60000);
        if (end > dayClose || cursor < new Date() || (latestDeadline && cursor > latestDeadline)) continue;
        const dayScheduled = suggestions.filter((item) => new Date(item.start_time).toDateString() === date.toDateString());
        const occupied = blockers.concat(dayScheduled.map((item) => ({ start: new Date(item.start_time), end: new Date(new Date(item.end_time).getTime() + 15 * 60000) })));
        if (occupied.some((item) => overlaps(cursor, end, item))) continue;
        if (dayScheduled.reduce((sum, item) => sum + (new Date(item.end_time) - new Date(item.start_time)) / 60000, 0) + duration > 240) continue;
        suggestions.push({
          title: task.title,
          description: `Suggested session for ${task.title}`,
          category: task.category,
          priority: task.priority,
          start_time: cursor.toISOString(),
          end_time: end.toISOString(),
          deadline: task.deadline,
          recurrence: "none",
          status: "suggested",
          source_type: "planner_task",
          source_id: task.id,
          parent_task_id: task.id,
          estimated_minutes: duration,
          is_suggestion: true,
        });
        remaining -= duration;
        placed = true;
      }
    }
    if (remaining > 0) unscheduled.push({ id: task.id, title: task.title, remaining_minutes: remaining });
    if (!placed && !unscheduled.some((item) => item.id === task.id)) unscheduled.push({ id: task.id, title: task.title, remaining_minutes: remaining });
  }
  return { week_start: weekStart.toISOString(), suggestions, unscheduled };
};

module.exports = { generateWeeklySuggestions };
