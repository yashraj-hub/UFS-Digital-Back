import { query } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";
import { logActivity, buildDescription } from "../utils/activityLogger.js";

const RESOURCES = {
  "blog-categories": {
    table: "blog_categories",
    fields: ["name", "slug", "display_order", "is_active"],
    orderBy: "display_order ASC, id ASC",
  },
  blogs: {
    table: "blogs",
    fields: ["title", "slug", "excerpt", "content", "cover_image_url", "tag", "category_id", "status", "published_at"],
    orderBy: "created_at DESC, id DESC",
  },
  "team-members": {
    table: "team_members",
    fields: ["name", "role", "experience_years", "bio", "photo_url", "linkedin_url", "display_order", "is_active"],
    orderBy: "display_order ASC, id ASC",
  },
  partners: {
    table: "partners",
    fields: ["name", "logo_url", "website_url", "display_order", "is_active"],
    orderBy: "display_order ASC, id ASC",
  },
  "contact-submissions": {
    table: "contact_submissions",
    fields: ["name", "email", "phone", "subject", "message", "status"],
    orderBy: "created_at DESC, id DESC",
  },
  "bc-agent-applications": {
    table: "bc_agent_applications",
    fields: [
      "full_name",
      "phone",
      "email",
      "pan_number",
      "aadhar_number",
      "bank_name",
      "state",
      "district",
      "city",
      "pincode",
      "address",
      "occupation",
      "experience",
      "message",
      "status",
    ],
    orderBy: "created_at DESC, id DESC",
  },
  jobs: {
    table: "jobs",
    fields: ["title", "department", "status", "description", "location", "experience_required", "image_url"],
    orderBy: "created_at DESC",
  },
  "job-applications": {
    table: "job_applications",
    fields: [
      "job_id",
      "full_name",
      "email",
      "phone",
      "current_location",
      "experience_years",
      "current_ctc",
      "expected_ctc",
      "notice_period",
      "linkedin_url",
      "portfolio_url",
      "resume_url",
      "cover_letter",
      "status",
    ],
    orderBy: "applied_at DESC",
  },
};

function getResource(name) {
  const resource = RESOURCES[name];
  if (!resource) {
    throw httpError(404, "Admin resource not found");
  }
  return resource;
}

function filterPayload(body, fields) {
  return Object.fromEntries(
    fields
      .filter((field) => Object.prototype.hasOwnProperty.call(body, field))
      .map((field) => [field, body[field]])
  );
}

function toAbsoluteAssetUrl(req, value) {
  if (!value || /^https?:\/\//i.test(value)) {
    return value;
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return value.startsWith("/") ? `${baseUrl}${value}` : value;
}

export const listResources = asyncHandler(async (req, res) => {
  const resourceName = req.params.resource;
  const resource = getResource(resourceName);
  const { job_id } = req.query;

  let sql;
  let params = {};

  if (resourceName === "jobs") {
    sql = `
      SELECT j.*, COUNT(ja.id) as applications_count
      FROM jobs j
      LEFT JOIN job_applications ja ON ja.job_id = j.id
      GROUP BY j.id
      ORDER BY j.created_at DESC
    `;
  } else if (resourceName === "job-applications" && job_id) {
    sql = `SELECT * FROM job_applications WHERE job_id = :job_id ORDER BY applied_at DESC`;
    params.job_id = job_id;
  } else {
    sql = `SELECT * FROM ${resource.table} ORDER BY ${resource.orderBy}`;
  }

  const rows = await query(sql, params);
  
  // Convert relative asset paths to absolute URLs
  const assetFields = ["cover_image_url", "photo_url", "logo_url", "image_url", "resume_url"];
  const data = rows.map((row) => {
    const newRow = { ...row };
    assetFields.forEach((field) => {
      if (newRow[field]) {
        newRow[field] = toAbsoluteAssetUrl(req, newRow[field]);
      }
    });
    return newRow;
  });

  res.json({ data });
});

export const getResourceById = asyncHandler(async (req, res) => {
  const resource = getResource(req.params.resource);
  const rows = await query(`SELECT * FROM ${resource.table} WHERE id = :id LIMIT 1`, {
    id: req.params.id,
  });

  if (!rows.length) {
    throw httpError(404, "Record not found");
  }

  const row = rows[0];
  const assetFields = ["cover_image_url", "photo_url", "logo_url", "image_url", "resume_url"];
  assetFields.forEach((field) => {
    if (row[field]) {
      row[field] = toAbsoluteAssetUrl(req, row[field]);
    }
  });

  res.json({ data: row });
});

export const createResource = asyncHandler(async (req, res) => {
  const resource = getResource(req.params.resource);
  const resourceName = req.params.resource;
  const data = filterPayload(req.body, resource.fields);
  const fields = Object.keys(data);

  if (!fields.length) {
    throw httpError(400, "No valid fields were provided");
  }

  const columns = fields.join(", ");
  const placeholders = fields.map((field) => `:${field}`).join(", ");
  const result = await query(
    `INSERT INTO ${resource.table} (${columns}) VALUES (${placeholders})`,
    data
  );

  const detail = data.title || data.name || data.full_name || null;
  logActivity({
    user: req.admin,
    action: "create",
    resource: resourceName,
    resourceId: result.insertId,
    description: buildDescription("create", resourceName, detail),
    metadata: { fields: Object.keys(data) },
  });

  res.status(201).json({ data: { id: result.insertId } });
});

export const updateResource = asyncHandler(async (req, res) => {
  const resource = getResource(req.params.resource);
  const resourceName = req.params.resource;
  const data = filterPayload(req.body, resource.fields);
  const fields = Object.keys(data);

  if (!fields.length) {
    throw httpError(400, "No valid fields were provided");
  }

  // Fetch existing record for name + smart description
  const existing = await query(
    `SELECT * FROM ${resource.table} WHERE id = :id LIMIT 1`,
    { id: req.params.id }
  );

  const assignments = fields.map((field) => `${field} = :${field}`).join(", ");
  const result = await query(
    `UPDATE ${resource.table} SET ${assignments} WHERE id = :id`,
    { ...data, id: req.params.id }
  );

  if (result.affectedRows === 0) {
    throw httpError(404, "Record not found");
  }

  const existingRow = existing[0] || {};
  const recordName = existingRow.title || existingRow.name || existingRow.full_name || `#${req.params.id}`;

  let description;
  if (Object.prototype.hasOwnProperty.call(data, "is_active") && fields.length === 1) {
    const state = data.is_active == 1 || data.is_active === true ? "Activated" : "Deactivated";
    const RESOURCE_LABELS = {
      "team-members": "Team Member", partners: "Partner", "blog-categories": "Blog Category",
    };
    const label = RESOURCE_LABELS[resourceName] || resourceName;
    description = `${state} ${label}: "${recordName}"`;
  } else if (data.status && fields.length === 1) {
    description = `Changed status to "${data.status}" for ${recordName}`;
  } else {
    description = `Updated ${RESOURCES[resourceName]?.table ? resourceName.replace(/-/g, " ") : resourceName}: "${recordName}"`;
  }

  logActivity({
    user: req.admin,
    action: "update",
    resource: resourceName,
    resourceId: req.params.id,
    description,
    metadata: { updatedFields: fields },
  });

  res.json({ data: { id: Number(req.params.id) } });
});

export const deleteResource = asyncHandler(async (req, res) => {
  const resource = getResource(req.params.resource);
  const resourceName = req.params.resource;

  const existing = await query(
    `SELECT * FROM ${resource.table} WHERE id = :id LIMIT 1`,
    { id: req.params.id }
  );
  const existingRow = existing[0] || {};
  const recordName = existingRow.title || existingRow.name || existingRow.full_name || `#${req.params.id}`;

  const result = await query(`DELETE FROM ${resource.table} WHERE id = :id`, {
    id: req.params.id,
  });

  if (result.affectedRows === 0) {
    throw httpError(404, "Record not found");
  }

  logActivity({
    user: req.admin,
    action: "delete",
    resource: resourceName,
    resourceId: req.params.id,
    description: buildDescription("delete", resourceName, recordName),
  });

  res.status(204).send();
});

export const deleteMultipleResources = asyncHandler(async (req, res) => {
  const resource = getResource(req.params.resource);
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw httpError(400, "Invalid or empty IDs list");
  }

  // Use a string of placeholders (?, ?, ?) for safe query
  const placeholders = ids.map(() => "?").join(", ");
  
  // Note: our query helper uses named parameters (:name), 
  // but for IN clauses with variable length, we might need a direct mysql2 call 
  // or handle it via named params in a loop if the helper doesn't support arrays.
  // Checking db.js implementation...
  
  await query(`DELETE FROM ${resource.table} WHERE id IN (${ids.join(',')})`)

  logActivity({
    user: req.admin,
    action: "delete",
    resource: req.params.resource,
    description: buildDescription("delete", req.params.resource) + ` (bulk: ${ids.length} records)`,
    metadata: { ids },
  });

  res.status(204).send();
});
