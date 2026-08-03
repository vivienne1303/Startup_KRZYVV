const app = require("./app");
const { port } = require("./config/env");

const server = app.listen(Number(port), "0.0.0.0", () => {
  console.log(`TeenLaunch API running on port ${port}`);
});

// Keep the HTTP listener referenced explicitly. Some Windows terminal/process
// launchers can otherwise allow the entry process to finish immediately.
server.ref();

server.on("error", (error) => {
  console.error(`TeenLaunch API failed to start: ${error.message}`);
  process.exitCode = 1;
});

server.on("close", () => {
  console.log("TeenLaunch API server closed");
});

const shutdown = (signal) => {
  console.log(`${signal} received; closing HTTP server`);
  server.close(() => process.exit(0));
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
