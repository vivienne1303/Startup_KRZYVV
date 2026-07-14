const app = require("./app");
const { port } = require("./config/env");

const server = app.listen(Number(port), "0.0.0.0", () => {
  console.log(`TeenLaunch API running on port ${port}`);
});

const shutdown = (signal) => {
  console.log(`${signal} received; closing HTTP server`);
  server.close(() => process.exit(0));
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
