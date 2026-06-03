import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const port = Number(process.env.PORT || 5000);

const server = app.listen(port, () => {
  console.log(`UFS Digital API running on http://localhost:${port}`);
});

server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Another process may be running.`);
    console.error("If this is unexpected, stop the other process or change PORT in .env and retry.");
    process.exit(1);
  }
  console.error("Server error:", err);
  process.exit(1);
});
