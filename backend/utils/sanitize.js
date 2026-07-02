const sanitizeAuthUser = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    created_at: user.created_at,
    updated_at: user.updated_at,
    last_sign_in_at: user.last_sign_in_at,
  };
};

module.exports = {
  sanitizeAuthUser,
};
