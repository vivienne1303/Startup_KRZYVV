const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { generateWeeklySuggestions } = require("../services/lifePlannerService");

const categories = new Set(["school", "study", "cca", "tuition", "opportunity", "personal"]);
const priorities = new Set(["low", "medium", "high"]);
const statuses = new Set(["todo", "planned", "suggested", "rejected", "completed"]);
const recurrences = new Set(["none", "daily", "weekly"]);
const cleanText = (value, length = 500) => String(value || "").trim().slice(0, length);
const fail = (error, status = 400) => { if (error) throw new HttpError(status, error.message, error.details); };
const validDate = (value) => value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toISOString() : null;

const taskPayload = (body, partial = false) => {
  const payload = {};
  const add = (key, value) => { if (!partial || Object.prototype.hasOwnProperty.call(body, key)) payload[key] = value; };
  add("title", cleanText(body.title, 120));
  add("description", cleanText(body.description, 1000) || null);
  add("category", categories.has(body.category) ? body.category : "personal");
  add("priority", priorities.has(body.priority) ? body.priority : "medium");
  add("start_time", validDate(body.start_time));
  add("end_time", validDate(body.end_time));
  add("deadline", body.deadline || null);
  add("recurrence", recurrences.has(body.recurrence) ? body.recurrence : "none");
  add("status", statuses.has(body.status) ? body.status : "todo");
  add("estimated_minutes", Math.max(20, Math.min(1440, Number(body.estimated_minutes) || 45)));
  if (payload.start_time && payload.end_time && new Date(payload.end_time) <= new Date(payload.start_time)) throw new HttpError(400, "End time must be after start time");
  if (!partial && !payload.title) throw new HttpError(400, "Task title is required");
  return payload;
};

const getOrCreatePreferences = async (req) => {
  const query = await req.supabase.from("planner_preferences").select("*").eq("user_id", req.user.id).maybeSingle();
  fail(query.error);
  if (query.data) return query.data;
  const created = await req.supabase.from("planner_preferences").insert({ user_id: req.user.id, education_level: req.profile.education_level || null }).select("*").single();
  fail(created.error); return created.data;
};

const list = asyncHandler(async (req, res) => {
  const preferences = await getOrCreatePreferences(req);
  const [tasks, saved, registrations] = await Promise.all([
    req.supabase.from("planner_tasks").select("*").order("start_time", { ascending: true, nullsFirst: false }),
    req.supabase.from("saved_opportunities").select("opportunity_id, opportunities(id,title,deadline,status,is_published)").order("created_at", { ascending: false }),
    req.supabase.from("registrations").select("id,status,opportunity_id, opportunities(id,title,deadline,status,is_published)").in("status", ["pending", "shortlisted", "accepted", "attended", "completed"]).order("created_at", { ascending: false }),
  ]);
  [tasks, saved, registrations].forEach((result) => fail(result.error));
  const deadlineMap = new Map();
  (saved.data || []).forEach((entry) => {
    const opportunity = entry.opportunities;
    if (opportunity?.deadline && opportunity.status === "active" && opportunity.is_published) deadlineMap.set(opportunity.id, { opportunity_id: opportunity.id, registration_id: null, title: opportunity.title, deadline: opportunity.deadline, relationship: "saved" });
  });
  (registrations.data || []).forEach((entry) => {
    const opportunity = entry.opportunities;
    if (opportunity?.deadline) deadlineMap.set(opportunity.id, { opportunity_id: opportunity.id, registration_id: entry.id, title: opportunity.title, deadline: opportunity.deadline, relationship: entry.status });
  });
  res.json({ preferences, tasks: tasks.data || [], opportunity_deadlines: [...deadlineMap.values()] });
});

const updatePreferences = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const updates = {
    education_level: cleanText(body.education_level, 80) || null,
    school_schedule: Array.isArray(body.school_schedule) ? body.school_schedule.slice(0, 7) : [],
    personal_goals: cleanText(body.personal_goals, 2000) || null,
    preferred_session_minutes: Math.max(20, Math.min(180, Number(body.preferred_session_minutes) || 45)),
    preferred_rest_days: Array.isArray(body.preferred_rest_days) ? body.preferred_rest_days.map(Number).filter((day) => day >= 1 && day <= 7) : [],
    wake_time: body.wake_time || "07:00",
    sleep_time: body.sleep_time || "23:00",
    preferred_study_start: body.preferred_study_start || "16:00",
    preferred_study_end: body.preferred_study_end || "21:00",
  };
  const result = await req.supabase.from("planner_preferences").upsert({ user_id: req.user.id, ...updates }, { onConflict: "user_id" }).select("*").single();
  fail(result.error); res.json({ preferences: result.data });
});

const createTask = asyncHandler(async (req, res) => {
  const payload = taskPayload(req.body);
  const result = await req.supabase.from("planner_tasks").insert({ user_id: req.user.id, ...payload, source_type: "personal" }).select("*").single();
  fail(result.error); res.status(201).json({ task: result.data });
});

const updateTask = asyncHandler(async (req, res) => {
  const payload = taskPayload(req.body, true);
  const result = await req.supabase.from("planner_tasks").update(payload).eq("id", req.params.id).select("*").single();
  fail(result.error, 403); res.json({ task: result.data });
});

const removeTask = asyncHandler(async (req, res) => {
  const result = await req.supabase.from("planner_tasks").delete().eq("id", req.params.id);
  fail(result.error, 403); res.status(204).send();
});

const generate = asyncHandler(async (req, res) => {
  const preferences = await getOrCreatePreferences(req);
  const existing = await req.supabase.from("planner_tasks").select("*");
  fail(existing.error);
  const plan = generateWeeklySuggestions({ tasks: existing.data || [], preferences, week: req.body.week_start });
  await req.supabase.from("planner_tasks").delete().eq("is_suggestion", true).eq("status", "suggested");
  let suggestions = [];
  if (plan.suggestions.length) {
    const inserted = await req.supabase.from("planner_tasks").insert(plan.suggestions.map((item) => ({ ...item, user_id: req.user.id }))).select("*");
    fail(inserted.error); suggestions = inserted.data || [];
  }
  res.json({ suggestions, unscheduled: plan.unscheduled, method: "rules", notice: "Generated with transparent scheduling rules, not an LLM." });
});

module.exports = { list, updatePreferences, createTask, updateTask, removeTask, generate };
