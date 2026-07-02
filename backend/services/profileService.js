const { supabaseAdmin } = require("../config/supabase");

const profileColumns =
  "id, full_name, role, avatar_url, bio, school_name, age, country, created_at, updated_at";

const getProfileById = async (client, userId) => {
  const { data, error } = await client
    .from("user_profiles")
    .select(profileColumns)
    .eq("id", userId)
    .single();

  return { data, error };
};

const createProfileForUser = async ({ userId, fullName, profile }) => {
  const payload = {
    id: userId,
    full_name: fullName,
    role: "user",
    avatar_url: profile?.avatar_url || null,
    bio: profile?.bio || null,
    school_name: profile?.school_name || null,
    age: profile?.age || null,
    country: profile?.country || null,
  };

  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .insert(payload)
    .select(profileColumns)
    .single();

  return { data, error };
};

const updateOwnProfile = async (client, userId, updates) => {
  const allowedFields = ["full_name", "avatar_url", "bio", "school_name", "age", "country"];
  const payload = {};

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(updates, field)) {
      payload[field] = updates[field];
    }
  });

  const { data, error } = await client
    .from("user_profiles")
    .update(payload)
    .eq("id", userId)
    .select(profileColumns)
    .single();

  return { data, error };
};

module.exports = {
  createProfileForUser,
  getProfileById,
  updateOwnProfile,
  profileColumns,
};
