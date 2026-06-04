import { query } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getActivityLogs = asyncHandler(async (req, res) => {
  const isPrivileged = ["super_admin", "admin"].includes(req.admin.role);
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 30));
  const offset = (page - 1) * limit;
  const countOnly = req.query.count_only === "1";

  const filters = [];
  const params = {};

  if (!isPrivileged) {
    filters.push("user_id = :userId");
    params.userId = req.admin.id;
  } else if (req.query.user_id) {
    filters.push("user_id = :userId");
    params.userId = req.query.user_id;
  }

  if (req.query.action) {
    filters.push("action = :action");
    params.action = req.query.action;
  }

  if (req.query.resource) {
    filters.push("resource = :resource");
    params.resource = req.query.resource;
  }

  if (req.query.date_from) {
    filters.push("DATE(created_at) >= :dateFrom");
    params.dateFrom = req.query.date_from;
  }

  if (req.query.date_to) {
    filters.push("DATE(created_at) <= :dateTo");
    params.dateTo = req.query.date_to;
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  if (countOnly) {
    const countRows = await query(
      `SELECT COUNT(*) AS total FROM activity_logs ${where}`,
      params
    );
    return res.json({ data: { total: countRows[0].total } });
  }

  const rows = await query(
    `SELECT id, user_id, user_name, user_role, action, resource, description, created_at
     FROM activity_logs ${where}
     ORDER BY created_at DESC
     LIMIT :limit OFFSET :offset`,
    { ...params, limit, offset }
  );

  res.json({ data: { logs: rows, page, limit } });
});
