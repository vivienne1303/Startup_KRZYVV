const { supabase, supabaseAdmin } = require("../config/supabase");
const HttpError = require("../utils/httpError");
const { createProfileForUser } = require("./profileService");

const findAuthUserByEmail = async (email) => {
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw new HttpError(500, "Email availability could not be checked");
    }

    const match = data.users.find((user) => user.email?.toLowerCase() === email);

    if (match) return match;
    if (data.users.length < perPage) return null;

    page += 1;
  }
};

const registerUser = async ({ name, email, password, profile }) => {
  const existingUser = await findAuthUserByEmail(email);

  if (existingUser) {
    throw new HttpError(409, "Email already exists");
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: name,
    },
  });

  if (error) {
    throw new HttpError(400, error.message);
  }

  if (!data.user) {
    throw new HttpError(500, "Supabase did not return a created user");
  }

  const { data: profileData, error: profileError } = await createProfileForUser({
    userId: data.user.id,
    fullName: name,
    profile,
  });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    throw new HttpError(400, profileError.message, profileError.details);
  }

  return {
    user: data.user,
    session: data.session,
    profile: profileData,
  };
};

const loginUser = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new HttpError(401, "Invalid email or password");
  }

  return data;
};

module.exports = {
  registerUser,
  loginUser,
};
