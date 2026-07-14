const { supabaseAdmin } = require("../config/supabase");

const profileColumns =
  "id, username, full_name, role, avatar_url, profile_picture_url, bio, school_name, phone_number, portfolio_url, age, education_level, country, created_at, updated_at";

const getProfileById = async (client, userId) => {
  const { data, error } = await client
    .from("user_profiles")
    .select(profileColumns)
    .eq("id", userId)
    .single();

  return { data, error };
};

const listProfiles = async (client) => {
  const { data, error } = await client
    .from("user_profiles")
    .select(profileColumns)
    .order("created_at", { ascending: false });

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
    education_level: profile?.education_level || null,
    country: profile?.country || null,
  };

  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .insert(payload)
    .select(profileColumns)
    .single();

  return { data, error };
};

const updateProfileById = async (client, userId, updates, options = {}) => {
  const baseFields = ["username", "full_name", "avatar_url", "profile_picture_url", "bio", "school_name", "phone_number", "portfolio_url", "age", "education_level", "country"];
  const allowedFields = options.allowRole ? [...baseFields, "role"] : baseFields;
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

const updateOwnProfile = async (client, userId, updates) => {
  return updateProfileById(client, userId, updates);
};

module.exports = {
  createProfileForUser,
  getProfileById,
  listProfiles,
  updateProfileById,
  updateOwnProfile,
  profileColumns,
};
