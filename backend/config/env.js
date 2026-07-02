require("dotenv").config();

const requiredEnv = [
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SECRET_KEY",
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnv.join(", ")}`);
}

module.exports = {
  port: process.env.PORT || 3000,
  supabaseUrl: process.env.SUPABASE_URL,
  supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY,
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY,
};
