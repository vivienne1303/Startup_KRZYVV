// app_metadata is managed by trusted server/admin code, never profile edits.
const hasPremium = (user, now = Date.now()) => {
  const subscription = user?.app_metadata?.subscription;
  return subscription?.plan === "premium" && subscription?.status === "active"
    && typeof subscription?.expires_at === "string"
    && Date.parse(subscription.expires_at) > now;
};
const requirePremium = (req, res, next) => {
  if (hasPremium(req.user)) return next();
  return res.status(403).json({ code: "PREMIUM_REQUIRED", message: "Premium is required for personalised recommendations." });
};
module.exports = { hasPremium, requirePremium };
