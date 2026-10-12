// Local source only: deploy this endpoint before relying on native session renewal.
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
const { supabaseUrl, supabasePublishableKey } = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { sanitizeAuthUser } = require('../utils/sanitize');

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.body?.refreshToken;
  if (typeof refreshToken !== 'string' || !refreshToken.trim() || refreshToken.length > 8192) {
    throw new HttpError(400, 'A valid refresh token is required');
  }
  // A fresh client per request prevents one user's session from replacing another's.
  const client = createClient(supabaseUrl, supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    realtime: { transport: WebSocket },
  });
  const { data, error } = await client.auth.refreshSession({ refresh_token: refreshToken });
  if (error) {
    // A temporary upstream failure must not cause clients to erase a valid refresh token.
    const transient = !error.status || error.status === 429 || error.status >= 500;
    throw new HttpError(transient ? 503 : 401, transient ? 'Session service temporarily unavailable' : 'Session expired. Please log in again.');
  }
  if (!data?.session?.access_token || !data.session.refresh_token) {
    throw new HttpError(401, 'Session expired. Please log in again.');
  }
  res.set('Cache-Control', 'no-store');
  res.json({
    token: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresAt: data.session.expires_at,
    user: sanitizeAuthUser(data.user),
  });
});
module.exports = { refresh };
