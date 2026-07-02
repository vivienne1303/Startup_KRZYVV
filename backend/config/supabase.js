const { createClient } = require("@supabase/supabase-js");
const {
  supabaseUrl,
  supabasePublishableKey,
  supabaseSecretKey,
} = require("./env");

const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const createUserClient = (accessToken) =>
  createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

module.exports = {
  supabase,
  supabaseAdmin,
  createUserClient,
};
