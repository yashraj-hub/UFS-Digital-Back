import { query } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";

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

export const listResources = asyncHandler(async (req, res) => {
  const resource = getResource(req.params.resource);
  const rows = await query(`SELECT * FROM ${resource.table} ORDER BY ${resource.orderBy}`);
  res.json({ data: rows });
});

export const getResourceById = asyncHandler(async (req, res) => {
  const resource = getResource(req.params.resource);
  const rows = await query(`SELECT * FROM ${resource.table} WHERE id = :id LIMIT 1`, {
    id: req.params.id,
  });

  if (!rows.length) {
    throw httpError(404, "Record not found");
  }

  res.json({ data: rows[0] });
});

export const createResource = asyncHandler(async (req, res) => {
  const resource = getResource(req.params.resource);
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

  res.status(201).json({ data: { id: result.insertId } });
});

export const updateResource = asyncHandler(async (req, res) => {
  const resource = getResource(req.params.resource);
  const data = filterPayload(req.body, resource.fields);
  const fields = Object.keys(data);

  if (!fields.length) {
    throw httpError(400, "No valid fields were provided");
  }

  const assignments = fields.map((field) => `${field} = :${field}`).join(", ");
  const result = await query(
    `UPDATE ${resource.table} SET ${assignments} WHERE id = :id`,
    { ...data, id: req.params.id }
  );

  if (result.affectedRows === 0) {
    throw httpError(404, "Record not found");
  }

  res.json({ data: { id: Number(req.params.id) } });
});

export const deleteResource = asyncHandler(async (req, res) => {
  const resource = getResource(req.params.resource);
  const result = await query(`DELETE FROM ${resource.table} WHERE id = :id`, {
    id: req.params.id,
  });

  if (result.affectedRows === 0) {
    throw httpError(404, "Record not found");
  }

  res.status(204).send();
});
