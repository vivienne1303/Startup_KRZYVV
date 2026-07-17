const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");

const publicProfileColumns = "id, username, full_name, profile_picture_url, avatar_url, bio, school_name";
const fail = (error) => { if (error) throw new HttpError(400, error.message, error.details); };

const profilesByIds = async (client, ids) => {
  if (!ids.length) return new Map();
  const { data, error } = await client.from("user_profiles").select(publicProfileColumns).in("id", [...new Set(ids)]);
  fail(error);
  return new Map((data || []).map((profile) => [profile.id, profile]));
};

const searchUsers = asyncHandler(async (req, res) => {
  const query = String(req.query.q || "").trim().replace(/[%_,]/g, "").slice(0, 50);
  if (query.length < 2) return res.json({ users: [] });
  const { data, error } = await req.app.locals.supabaseAdmin.from("user_profiles").select(publicProfileColumns)
    .neq("id", req.user.id).or(`username.ilike.%${query}%,full_name.ilike.%${query}%`).limit(20);
  fail(error);
  const ids = (data || []).map((profile) => profile.id);
  const { data: following, error: followError } = ids.length
    ? await req.supabase.from("user_follows").select("following_id").eq("follower_id", req.user.id).in("following_id", ids)
    : { data: [], error: null };
  fail(followError);
  const followed = new Set((following || []).map((item) => item.following_id));
  res.json({ users: (data || []).map((profile) => ({ ...profile, following: followed.has(profile.id) })) });
});

const follow = asyncHandler(async (req, res) => {
  if (req.params.userId === req.user.id) throw new HttpError(400, "You cannot follow yourself");
  const { data, error } = await req.supabase.from("user_follows")
    .insert({ follower_id: req.user.id, following_id: req.params.userId }).select("id, follower_id, following_id, created_at").single();
  if (error) throw new HttpError(error.code === "23505" ? 409 : 400, error.code === "23505" ? "Already following this user" : error.message, error.details);
  res.status(201).json({ follow: data });
});

const unfollow = asyncHandler(async (req, res) => {
  const { error } = await req.supabase.from("user_follows").delete().eq("follower_id", req.user.id).eq("following_id", req.params.userId);
  fail(error); res.status(204).send();
});

const listFollowers = asyncHandler(async (req, res) => {
  const [{ data: incoming, error: incomingError }, { data: outgoing, error: outgoingError }] = await Promise.all([
    req.supabase.from("user_follows").select("follower_id, created_at").eq("following_id", req.user.id).order("created_at", { ascending: false }),
    req.supabase.from("user_follows").select("following_id").eq("follower_id", req.user.id),
  ]);
  fail(incomingError || outgoingError);
  const profiles = await profilesByIds(req.app.locals.supabaseAdmin, (incoming || []).map((item) => item.follower_id));
  const following = new Set((outgoing || []).map((item) => item.following_id));
  res.json({ followers: (incoming || []).map((item) => ({ ...profiles.get(item.follower_id), followed_back: following.has(item.follower_id), followed_at: item.created_at })) });
});

const listInbox = asyncHandler(async (req, res) => {
  const [{ data: messages, error: messageError }, { data: followers, error: followerError }, { data: applications, error: appError }] = await Promise.all([
    req.supabase.from("direct_messages").select("id, sender_id, recipient_id, body, read_at, created_at")
      .or(`sender_id.eq.${req.user.id},recipient_id.eq.${req.user.id}`).order("created_at", { ascending: false }).limit(200),
    req.supabase.from("user_follows").select("follower_id, created_at").eq("following_id", req.user.id).order("created_at", { ascending: false }).limit(20),
    req.supabase.from("registrations").select("id, status, created_at, opportunity_id, opportunities(id, title, deadline)").order("created_at", { ascending: false }),
  ]);
  fail(messageError || followerError || appError);
  const people = await profilesByIds(req.app.locals.supabaseAdmin, [...(messages || []).flatMap((m) => [m.sender_id, m.recipient_id]), ...(followers || []).map((f) => f.follower_id)]);
  const threads = new Map();
  (messages || []).forEach((message) => {
    const otherId = message.sender_id === req.user.id ? message.recipient_id : message.sender_id;
    if (!threads.has(otherId)) threads.set(otherId, { user: people.get(otherId), last_message: message, unread: 0 });
    if (message.recipient_id === req.user.id && !message.read_at) threads.get(otherId).unread += 1;
  });
  const now = new Date();
  const reminders = (applications || []).filter((item) => {
    const deadline = item.opportunities?.deadline && new Date(`${item.opportunities.deadline}T23:59:59`);
    return deadline && deadline >= now && deadline - now <= 14 * 86400000;
  }).map((item) => ({ type: "deadline", id: item.id, title: `${item.opportunities.title} deadline`, body: `Deadline: ${item.opportunities.deadline}`, created_at: item.created_at }));
  const applicationNotices = (applications || []).map((item) => ({ type: "application", id: item.id, title: `Application: ${item.opportunities?.title || "Opportunity"}`, body: `Your application status is ${item.status}.`, created_at: item.created_at }));
  const followerNotices = (followers || []).map((item) => ({ type: "follower", id: item.follower_id, title: `${people.get(item.follower_id)?.username || people.get(item.follower_id)?.full_name || "Someone"} followed you`, body: "View your followers to follow them back.", created_at: item.created_at }));
  res.json({ threads: [...threads.values()], notifications: [...reminders, ...followerNotices, ...applicationNotices].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) });
});

const getConversation = asyncHandler(async (req, res) => {
  const otherId = req.params.userId;
  const { data, error } = await req.supabase.from("direct_messages").select("id, sender_id, recipient_id, body, read_at, created_at")
    .or(`and(sender_id.eq.${req.user.id},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${req.user.id})`).order("created_at", { ascending: true }).limit(500);
  fail(error);
  await req.supabase.from("direct_messages").update({ read_at: new Date().toISOString() }).eq("sender_id", otherId).eq("recipient_id", req.user.id).is("read_at", null);
  const profiles = await profilesByIds(req.app.locals.supabaseAdmin, [otherId]);
  res.json({ user: profiles.get(otherId), messages: data || [] });
});

const sendMessage = asyncHandler(async (req, res) => {
  const body = String(req.body.body || "").trim();
  if (!body || body.length > 2000) throw new HttpError(400, "Message must be between 1 and 2000 characters");
  const { data, error } = await req.supabase.from("direct_messages")
    .insert({ sender_id: req.user.id, recipient_id: req.params.userId, body }).select("id, sender_id, recipient_id, body, read_at, created_at").single();
  fail(error); res.status(201).json({ message: data });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const admin = req.app.locals.supabaseAdmin;
  const [{ data: profile, error: profileError }, { data: applications, error: appError }, { data: saved, error: savedError }, { count: followers, error: followerError }, { count: following, error: followingError }, { data: relationship, error: relationshipError }] = await Promise.all([
    admin.from("user_profiles").select(publicProfileColumns).eq("id", userId).maybeSingle(),
    admin.from("registrations").select("id, opportunity_id, created_at, opportunities(id, title, description, category, organizer, deadline, image_url)").eq("user_id", userId).order("created_at", { ascending: false }),
    admin.from("saved_opportunities").select("id, opportunity_id, created_at, opportunities(id, title, description, category, organizer, deadline, image_url)").eq("user_id", userId).order("created_at", { ascending: false }),
    admin.from("user_follows").select("id", { count: "exact", head: true }).eq("following_id", userId),
    admin.from("user_follows").select("id", { count: "exact", head: true }).eq("follower_id", userId),
    req.supabase.from("user_follows").select("id").eq("follower_id", req.user.id).eq("following_id", userId).maybeSingle(),
  ]);
  fail(profileError || appError || followerError || followingError || relationshipError);
  if (!profile) throw new HttpError(404, "User profile not found");
  const savedUnavailable = savedError && ["42P01", "PGRST205"].includes(savedError.code);
  if (savedError && !savedUnavailable) fail(savedError);
  res.json({ profile, applications: applications || [], saved: savedUnavailable ? [] : (saved || []), counts: { applications: applications?.length || 0, followers: followers || 0, following: following || 0 }, following: Boolean(relationship), own_profile: userId === req.user.id });
});

const listConnections = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const type = req.query.type === "following" ? "following" : "followers";
  const column = type === "following" ? "follower_id" : "following_id";
  const targetColumn = type === "following" ? "following_id" : "follower_id";
  const { data, error } = await req.app.locals.supabaseAdmin.from("user_follows").select(`${targetColumn}, created_at`).eq(column, userId).order("created_at", { ascending: false });
  fail(error);
  const profiles = await profilesByIds(req.app.locals.supabaseAdmin, (data || []).map((item) => item[targetColumn]));
  const ids = (data || []).map((item) => item[targetColumn]);
  const { data: mine, error: mineError } = ids.length ? await req.supabase.from("user_follows").select("following_id").eq("follower_id", req.user.id).in("following_id", ids) : { data: [], error: null };
  fail(mineError);
  const followed = new Set((mine || []).map((item) => item.following_id));
  res.json({ type, users: ids.map((id) => ({ ...profiles.get(id), following: followed.has(id) })).filter((item) => item.id) });
});

module.exports = { searchUsers, follow, unfollow, listFollowers, listInbox, getConversation, sendMessage, getUserProfile, listConnections };
