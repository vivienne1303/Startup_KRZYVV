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

const corsOptions = {
  origin(origin, callback) {
    const normalizedOrigin = String(origin || "").replace(/\/$/, "");
    const isRailwayDomain = /^https:\/\/[a-z0-9-]+\.up\.railway\.app$/i.test(normalizedOrigin);
    const isAllowed = !origin || corsOrigins.includes(normalizedOrigin) || isRailwayDomain;
    callback(isAllowed ? null : new Error("Origin is not allowed by CORS"), isAllowed);
  },
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.use("/api", apiRoutes);
app.use(express.static(path.join(__dirname, "..")));

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
