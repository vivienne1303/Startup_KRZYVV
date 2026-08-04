const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { getProfileById, updateOwnProfile } = require("../services/profileService");
const { listRegistrations } = require("../services/registrationService");
const { listSaved, remove: removeSaved, save: saveOpportunity } = require("../services/savedOpportunityService");

const TIERS = [
  { name: "Explorer", xp: 0, reward: "Starter profile badge" },
  { name: "Challenger", xp: 25, reward: "One streak freeze" },
  { name: "Builder", xp: 75, reward: "Workshop priority access" },
  { name: "Achiever", xp: 150, reward: "Portfolio review" },
  { name: "Trailblazer", xp: 250, reward: "Mentor office hour" },
];

const engagementSummary = (registrations, experiences) => {
  const xp = (registrations.length + experiences.length) * 5;
  const tierIndex = TIERS.reduce((best, tier, index) => xp >= tier.xp ? index : best, 0);
  const tier = TIERS[tierIndex];
  const next = TIERS[tierIndex + 1] || null;
  const activeDays = new Set([...registrations, ...experiences].map((item) => {
    const date = new Date(item.created_at);
    date.setHours(0, 0, 0, 0);
    return date.toISOString().slice(0, 10);
  }));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!activeDays.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);
  while (activeDays.has(cursor.toISOString().slice(0, 10))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
  return { xp, tier, next, progress: next ? Math.round(((xp - tier.xp) / (next.xp - tier.xp)) * 100) : 100, streak, tiers: TIERS };
};

const getProfile = asyncHandler(async (req, res) => {
  const { data, error } = await getProfileById(req.supabase, req.user.id);

  if (error) {
    throw new HttpError(404, "Profile not found", error.message);
  }

  res.json({ profile: data });
});

const updateProfile = asyncHandler(async (req, res) => {
  if (Object.prototype.hasOwnProperty.call(req.body, "role")) {
    throw new HttpError(403, "Role cannot be updated through this endpoint");
  }

  const { data, error } = await updateOwnProfile(req.app.locals.supabaseAdmin, req.user.id, req.body);

  if (error) {
    throw new HttpError(400, error.message, error.details);
  }

  if (!data) {
    throw new HttpError(500, "Profile update did not return the saved profile");
  }

  res.json({ profile: data });
});

const getApplications = asyncHandler(async (req, res) => {
  const { data, error } = await listRegistrations(req.supabase);
  if (error) throw new HttpError(400, error.message, error.details);
  res.json({ applications: data || [] });
});

const getCounts = asyncHandler(async (req, res) => {
  const [followers, following, applications] = await Promise.all([
    req.supabase.from("user_follows").select("id", { count: "exact", head: true }).eq("following_id", req.user.id),
    req.supabase.from("user_follows").select("id", { count: "exact", head: true }).eq("follower_id", req.user.id),
    req.supabase.from("registrations").select("id", { count: "exact", head: true }),
  ]);
  const failure = [followers, following, applications].find((result) => result.error);
  if (failure) throw new HttpError(400, failure.error.message, failure.error.details);
  res.json({ counts: { followers: followers.count || 0, following: following.count || 0, applications: applications.count || 0 } });
});

const getSaved = asyncHandler(async (req, res) => {
  const { data, error } = await listSaved(req.supabase);
  if (error && ["42P01", "PGRST205"].includes(error.code)) {
    res.json({ saved: [], available: false });
    return;
  }
  if (error) throw new HttpError(400, error.message, error.details);
  res.json({ saved: data || [] });
});

const getEngagement = asyncHandler(async (req, res) => {
  const [registrations, experiences] = await Promise.all([
    req.supabase.from("registrations").select("id,created_at"),
    req.supabase.from("experience_posts").select("id,title,caption,event_date,image_url,created_at").order("event_date", { ascending: false }),
  ]);
  const failure = [registrations, experiences].find((result) => result.error);
  if (failure) throw new HttpError(400, failure.error.message, failure.error.details);
  res.json({ engagement: engagementSummary(registrations.data || [], experiences.data || []), experiences: experiences.data || [] });
});

const addExperience = asyncHandler(async (req, res) => {
  const { title, caption = "", event_date: eventDate, image_data: imageData } = req.body;
  const cleanTitle = typeof title === "string" ? title.trim() : "";
  const cleanCaption = typeof caption === "string" ? caption.trim() : "";
  if (!cleanTitle || !eventDate || !imageData) throw new HttpError(400, "Title, event date and photo are required");
  if (cleanTitle.length > 100 || cleanCaption.length > 1000) throw new HttpError(400, "Experience text is too long");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate) || Number.isNaN(Date.parse(`${eventDate}T00:00:00Z`))) throw new HttpError(400, "Enter a valid event date");
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(imageData);
  if (!match) throw new HttpError(400, "Use a JPG, PNG or WebP image");
  const bytes = Buffer.from(match[2], "base64");
  if (bytes.length > 4 * 1024 * 1024) throw new HttpError(400, "Photo must be 4 MB or smaller");
  const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[match[1]];
  const path = `${req.user.id}/${crypto.randomUUID()}.${extension}`;
  const admin = req.app.locals.supabaseAdmin;
  const uploaded = await admin.storage.from("experience-photos").upload(path, bytes, { contentType: match[1], upsert: false });
  if (uploaded.error) throw new HttpError(400, uploaded.error.message);
  const imageUrl = admin.storage.from("experience-photos").getPublicUrl(path).data.publicUrl;
  const result = await admin.from("experience_posts").insert({ user_id: req.user.id, title: cleanTitle, caption: cleanCaption, event_date: eventDate, image_url: imageUrl }).select().single();
  if (result.error) { await admin.storage.from("experience-photos").remove([path]); throw new HttpError(400, result.error.message, result.error.details); }
  res.status(201).json({ experience: result.data });
});

const deleteExperience = asyncHandler(async (req, res) => {
  const admin = req.app.locals.supabaseAdmin;
  const existing = await admin.from("experience_posts").select("id,image_url").eq("id", req.params.experienceId).eq("user_id", req.user.id).maybeSingle();
  if (existing.error) throw new HttpError(400, existing.error.message);
  if (!existing.data) throw new HttpError(404, "Experience not found");
  const result = await admin.from("experience_posts").delete().eq("id", existing.data.id).eq("user_id", req.user.id);
  if (result.error) throw new HttpError(400, result.error.message);
  const marker = "/experience-photos/";
  const path = decodeURIComponent(existing.data.image_url.split(marker)[1] || "");
  if (path) await admin.storage.from("experience-photos").remove([path]);
  res.status(204).send();
});

const addSaved = asyncHandler(async (req, res) => {
  if (!req.body.opportunity_id) throw new HttpError(400, "opportunity_id is required");
  const { data, error } = await saveOpportunity(req.supabase, req.user.id, req.body.opportunity_id);
  if (error) throw new HttpError(error.code === "23505" ? 409 : 400, error.code === "23505" ? "Opportunity is already saved" : error.message, error.details);
  res.status(201).json({ saved: data });
});

const deleteSaved = asyncHandler(async (req, res) => {
  const { error } = await removeSaved(req.supabase, req.params.opportunityId);
  if (error) throw new HttpError(400, error.message, error.details);
  res.status(204).send();
});

module.exports = {
  getApplications,
  getSaved,
  addSaved,
  deleteSaved,
  getCounts,
  getEngagement,
  addExperience,
  deleteExperience,
  getProfile,
  updateProfile,
};
