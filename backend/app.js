const express = require("express");
const cors = require("cors");
const path = require("path");
const apiRoutes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const notFoundHandler = require("./middleware/notFoundHandler");
const { supabaseAdmin } = require("./config/supabase");
const { corsOrigins } = require("./config/env");

const app = express();

app.locals.supabaseAdmin = supabaseAdmin;

const normalizeOrigin = (origin) => String(origin || "").trim().replace(/\/$/, "");

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  const normalizedOrigin = normalizeOrigin(origin);
  if (corsOrigins.includes(normalizedOrigin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.up\.railway\.app$/i.test(normalizedOrigin)) return true;

  try {
    const url = new URL(normalizedOrigin);
    const isLocalHostname = url.hostname === "localhost"
      || url.hostname === "127.0.0.1"
      || url.hostname === "::1"
      || /^192\.168\.\d{1,3}\.\d{1,3}$/.test(url.hostname);
    return ["http:", "https:"].includes(url.protocol) && isLocalHostname;
  } catch {
    return false;
  }
};

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, origin ? normalizeOrigin(origin) : true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400,
  optionsSuccessStatus: 204,
};

app.options(/.*/, cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.use("/api", apiRoutes);
app.use(express.static(path.join(__dirname, "..")));

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
