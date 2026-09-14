const assert = require('node:assert/strict');
const { hasPremium, requirePremium } = require('../backend/middleware/premiumMiddleware');
const future = new Date(Date.now() + 86400000).toISOString();
const active = { plan: 'premium', status: 'active', expires_at: future };
assert.equal(hasPremium(undefined), false);
assert.equal(hasPremium({ user_metadata: { subscription: active } }), false);
for (const subscription of [undefined, {}, {...active, plan:'free'}, {...active, status:'cancelled'}, {...active, expires_at:'invalid'}, {...active, expires_at:'2000-01-01'}, {...active, expires_at:undefined}]) {
  let nextCalled = false;
  const res = { status(code) { assert.equal(code, 403); return this; }, json(body) { assert.equal(body.code, 'PREMIUM_REQUIRED'); assert.equal(body.recommendations, undefined); } };
  requirePremium({user:{app_metadata:{subscription}}}, res, () => {nextCalled=true;});
  assert.equal(nextCalled, false);
}
let allowed = false;
requirePremium({user:{app_metadata:{subscription:active}}}, {}, () => { allowed=true; });
assert.equal(allowed, true);
assert.equal(hasPremium({app_metadata:{subscription:active}}, Date.parse(future)), false);
console.log('Premium access checks passed: free, forged, expired, invalid and active subscriptions.');
