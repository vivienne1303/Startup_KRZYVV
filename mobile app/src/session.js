// Shared by all mobile pages. No backend secrets or Supabase keys are bundled.
export function installSession(window) {
  const storage = window.localStorage;
  const api = 'https://teenlaunch-production.up.railway.app/api';
  const originalFetch = window.fetch.bind(window);
  const keys = ['teenlaunch_token', 'teenlaunch_refresh_token', 'teenlaunch_user', 'teenlaunch_profile'];
  let refreshing = null;
  let generation = 0;
  function clearSession() {
    generation++;
    keys.forEach(key => storage.removeItem(key));
  }
  function saveSession(data) {
    const token = data.token || data.access_token || data.session?.access_token;
    const refresh = data.refreshToken || data.refresh_token || data.session?.refresh_token;
    if (!token) throw new Error('Login succeeded, but no access token was returned.');
    generation++;
    storage.setItem(keys[0], token);
    // Do not accidentally retain the previous user's refresh token.
    if (refresh) storage.setItem(keys[1], refresh);
    else storage.removeItem(keys[1]);
    if (data.user) storage.setItem(keys[2], JSON.stringify(data.user));
    if (data.profile) storage.setItem(keys[3], JSON.stringify(data.profile));
  }
  function expiresSoon(token) {
    try {
      const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(part));
      return !payload.exp || payload.exp * 1000 < Date.now() + 60000;
    } catch { return true; }
  }
  async function refreshSession() {
    if (refreshing) return refreshing;
    const refreshToken = storage.getItem(keys[1]);
    if (!refreshToken) return null;
    const currentGeneration = generation;
    refreshing = (async () => {
      const response = await originalFetch(api + '/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        signal: AbortSignal.timeout(15000)
      });
      if (!response.ok) {
        if (currentGeneration === generation && [400, 401].includes(response.status)) clearSession();
        // Network/server errors and an undeployed endpoint must not erase sessions.
        throw new Error(response.status === 404
          ? 'Session renewal is not available on the server yet. Please log in again.'
          : 'Your session could not be renewed. Please reconnect or log in again.');
      }
      const data = await response.json();
      if (currentGeneration !== generation) return null; // Logout/login happened during refresh.
      if (!data.token || !data.refreshToken) throw new Error('Invalid session renewal response.');
      saveSession(data);
      return data.token;
    })().finally(() => { refreshing = null; });
    return refreshing;
  }
  // Feature scripts sometimes capture a token once. Always replace it with the latest token.
  window.fetch = async (input, init) => {
    const request = new Request(input, init);
    const url = new URL(request.url, window.location.href);
    const isApi = url.origin === new URL(api).origin && url.pathname.startsWith('/api/');
    if (!isApi) return originalFetch(input, init);
    const isLogout = url.pathname === '/api/auth/logout';
    const authenticated = /^Bearer /i.test(request.headers.get('Authorization') || '');
    if (!authenticated) return originalFetch(request);
    try {
      let token = storage.getItem(keys[0]);
      if (!isLogout && token && expiresSoon(token) && storage.getItem(keys[1])) {
        token = await refreshSession();
      }
      const send = () => {
        const headers = new Headers(request.headers);
        const latest = storage.getItem(keys[0]);
        if (latest) headers.set('Authorization', 'Bearer ' + latest);
        else headers.delete('Authorization');
        return originalFetch(new Request(request.clone(), { headers }));
      };
      const response = await send();
      if (!isLogout && response.status === 401 && storage.getItem(keys[1])) {
        await refreshSession();
        return send();
      }
      return response;
    } finally {
      if (isLogout) clearSession();
    }
  };
  async function refreshIfNeeded() {
    const token = storage.getItem(keys[0]);
    if (token && expiresSoon(token) && storage.getItem(keys[1])) return refreshSession();
    return token;
  }
  const session = { saveSession, clearSession, refreshSession, refreshIfNeeded };
  window.TeenLaunchSession = session;
  window.addEventListener('online', () => refreshIfNeeded().catch(() => {}));
  window.document.addEventListener('visibilitychange', () => {
    if (!window.document.hidden) refreshIfNeeded().catch(() => {});
  });
  // Refresh in the foreground before long-lived pages encounter token expiry.
  window.setInterval(() => {
    if (!window.document.hidden) refreshIfNeeded().catch(() => {});
  }, 60000);
  return session;
}
