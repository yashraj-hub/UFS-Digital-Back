import { query } from "../config/db.js";
import { ACTIONS, PERMISSION_AREAS, PERMISSION_AREA_KEYS } from "../config/permissions.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizePermissionPayload(permissions = []) {
  const byArea = new Map();

  permissions.forEach((permission) => {
    if (!PERMISSION_AREA_KEYS.includes(permission.area)) {
      return;
    }

    byArea.set(permission.area, {
      area: permission.area,
      can_view: Boolean(permission.can_view) ? 1 : 0,
      can_create: Boolean(permission.can_create) ? 1 : 0,
      can_edit: Boolean(permission.can_edit) ? 1 : 0,
      can_delete: Boolean(permission.can_delete) ? 1 : 0,
    });
  });

  return PERMISSION_AREA_KEYS.map((area) => ({
    area,
    can_view: byArea.get(area)?.can_view || 0,
    can_create: byArea.get(area)?.can_create || 0,
    can_edit: byArea.get(area)?.can_edit || 0,
    can_delete: byArea.get(area)?.can_delete || 0,
  }));
}

async function getRolePermissions(roleIds) {
  if (!roleIds.length) {
    return {};
  }

  const placeholders = roleIds.map((_, index) => `:id${index}`).join(", ");
  const params = Object.fromEntries(roleIds.map((id, index) => [`id${index}`, id]));
  const rows = await query(
    `
      SELECT role_id, area, can_view, can_create, can_edit, can_delete
      FROM role_permissions
      WHERE role_id IN (${placeholders})
      ORDER BY area ASC
    `,
    params
  );

  return rows.reduce((acc, row) => {
    acc[row.role_id] = acc[row.role_id] || [];
    acc[row.role_id].push({
      area: row.area,
      can_view: Boolean(row.can_view),
      can_create: Boolean(row.can_create),
      can_edit: Boolean(row.can_edit),
      can_delete: Boolean(row.can_delete),
    });
    return acc;
  }, {});
}

async function replaceRolePermissions(roleId, permissions) {
  const normalized = normalizePermissionPayload(permissions);

  await query("DELETE FROM role_permissions WHERE role_id = :roleId", { roleId });

  for (const permission of normalized) {
    await query(
      `
        INSERT INTO role_permissions
          (role_id, area, can_view, can_create, can_edit, can_delete)
        VALUES
          (:roleId, :area, :can_view, :can_create, :can_edit, :can_delete)
      `,
      { roleId, ...permission }
    );
  }
}

export const getPermissionCatalog = asyncHandler(async (req, res) => {
  res.json({
    data: {
      actions: ACTIONS,
      areas: PERMISSION_AREAS,
    },
  });
});

export const listRoles = asyncHandler(async (req, res) => {
  const roles = await query(`
    SELECT id, name, slug, description, is_system, is_active, created_at, updated_at
    FROM roles
    ORDER BY is_system DESC, name ASC
  `);
  const permissionsByRole = await getRolePermissions(roles.map((role) => role.id));

  res.json({
    data: roles.map((role) => ({
      ...role,
      is_system: Boolean(role.is_system),
      is_active: Boolean(role.is_active),
      permissions: permissionsByRole[role.id] || [],
    })),
  });
});

export const createRole = asyncHandler(async (req, res) => {
  const { name, description = null, permissions = [] } = req.body;
  const slug = slugify(req.body.slug || name);

  if (!name || !slug) {
    throw httpError(400, "Role name is required");
  }

  const result = await query(
    `
      INSERT INTO roles (name, slug, description, is_system, is_active)
      VALUES (:name, :slug, :description, 0, 1)
    `,
    { name, slug, description }
  );

  await replaceRolePermissions(result.insertId, permissions);

  res.status(201).json({ data: { id: result.insertId } });
});

export const updateRole = asyncHandler(async (req, res) => {
  const roleId = Number(req.params.id);
  const rows = await query("SELECT * FROM roles WHERE id = :id LIMIT 1", { id: roleId });
  const role = rows[0];

  if (!role) {
    throw httpError(404, "Role not found");
  }

  if (role.slug === "super_admin") {
    throw httpError(400, "Super admin role cannot be changed");
  }

  const name = req.body.name ?? role.name;
  const description = req.body.description ?? role.description;
  const slug = role.is_system ? role.slug : slugify(req.body.slug || role.slug || name);
  const isActive = Object.prototype.hasOwnProperty.call(req.body, "is_active")
    ? Boolean(req.body.is_active)
    : Boolean(role.is_active);

  if (!name || !slug) {
    throw httpError(400, "Role name is required");
  }

  await query(
    `
      UPDATE roles
      SET name = :name,
          slug = :slug,
          description = :description,
          is_active = :isActive
      WHERE id = :id
    `,
    { id: roleId, name, slug, description, isActive: isActive ? 1 : 0 }
  );

  if (Array.isArray(req.body.permissions) && role.slug !== "super_admin") {
    await replaceRolePermissions(roleId, req.body.permissions);
  }

  res.json({ data: { id: roleId } });
});

export const deleteRole = asyncHandler(async (req, res) => {
  const roleId = Number(req.params.id);
  const rows = await query("SELECT * FROM roles WHERE id = :id LIMIT 1", { id: roleId });
  const role = rows[0];

  if (!role) {
    throw httpError(404, "Role not found");
  }

  if (role.is_system) {
    throw httpError(400, "System roles cannot be deleted");
  }

  const users = await query("SELECT id FROM admin_users WHERE role_id = :roleId LIMIT 1", {
    roleId,
  });

  if (users.length) {
    throw httpError(400, "Move users to another role before deleting this role");
  }

  await query("DELETE FROM role_permissions WHERE role_id = :roleId", { roleId });
  await query("DELETE FROM roles WHERE id = :roleId", { roleId });

  res.status(204).send();
});
