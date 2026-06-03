import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const healthCheck = asyncHandler(async (req, res) => {
  await pool.query("SELECT 1");
  res.json({
    ok: true,
    service: "ufs-digital-backend",
    database: "connected",
    timestamp: new Date().toISOString(),
  });
});
