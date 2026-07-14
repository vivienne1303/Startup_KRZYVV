const { createClient } = require("@supabase/supabase-js");
const WebSocket = require("ws");
const {
  supabaseUrl,
  supabasePublishableKey,
  supabaseSecretKey,
} = require("./env");

// supabase-js constructs its Realtime client even when no channels are used.
// Supplying the Node transport avoids relying on an environment-native WebSocket.
const serverClientOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    transport: WebSocket,
  },
};

const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  ...serverClientOptions,
});

const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
  ...serverClientOptions,
});

const createUserClient = (accessToken) =>
  createClient(supabaseUrl, supabasePublishableKey, {
    ...serverClientOptions,
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
