const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const notFoundHandler = require("./middleware/notFoundHandler");
const { supabaseAdmin } = require("./config/supabase");

const app = express();

app.locals.supabaseAdmin = supabaseAdmin;

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use("/api", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
