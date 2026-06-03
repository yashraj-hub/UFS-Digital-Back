import bcrypt from "bcryptjs";
import { query } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";

const USER_SELECT = `
  SELECT
    au.id,
    au.name,
    au.email,
    au.role_id,
    au.is_active,
    au.created_at,
    au.updated_at,
    r.name AS role_name,
    r.slug AS role
  FROM admin_users au
  INNER JOIN roles r ON r.id = au.role_id
`;

async function assertRoleExists(roleId) {
  const rows = await query(
    "SELECT id FROM roles WHERE id = :roleId AND is_active = 1 LIMIT 1",
    { roleId }
  );

  if (!rows.length) {
    throw httpError(400, "Select an active role");
  }
}

async function assertEmailIsUnique(email, excludeUserId = null) {
  const rows = await query(
    "SELECT id FROM admin_users WHERE email = :email LIMIT 1",
    { email }
  );

  if (rows.length && rows[0].id !== excludeUserId) {
    throw httpError(400, "Email is already registered");
  }
}

export const listAdminUsers = asyncHandler(async (req, res) => {
  const rows = await query(`
    ${USER_SELECT}
    ORDER BY au.created_at DESC, au.id DESC
  `);

  res.json({
    data: rows.map((row) => ({
      ...row,
      is_active: Boolean(row.is_active),
    })),
  });
});

export const createAdminUser = asyncHandler(async (req, res) => {
  const { name, email, password, role_id, is_active = true } = req.body;
  const roleId = Number(role_id);

  if (!name || !email || !password || !roleId) {
    throw httpError(400, "Name, email, password and role are required");
  }

  await assertRoleExists(roleId);
  await assertEmailIsUnique(email);

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await query(
    `
      INSERT INTO admin_users (name, email, password_hash, role_id, is_active)
      VALUES (:name, :email, :passwordHash, :roleId, :isActive)
    `,
    {
      name,
      email,
      passwordHash,
      roleId,
      isActive: Boolean(is_active) ? 1 : 0,
    }
  );

  res.status(201).json({ data: { id: result.insertId } });
});

export const updateAdminUser = asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);
  const rows = await query("SELECT * FROM admin_users WHERE id = :id LIMIT 1", { id: userId });
  const user = rows[0];

  if (!user) {
    throw httpError(404, "Admin user not found");
  }

  const name = req.body.name ?? user.name;
  const email = req.body.email ?? user.email;
  const roleId = Number(req.body.role_id ?? user.role_id);
  const isActive = Object.prototype.hasOwnProperty.call(req.body, "is_active")
    ? Boolean(req.body.is_active)
    : Boolean(user.is_active);

  if (!name || !email || !roleId) {
    throw httpError(400, "Name, email and role are required");
  }

  if (userId === req.admin.id && !isActive) {
    throw httpError(400, "You cannot deactivate your own account");
  }

  await assertRoleExists(roleId);
  await assertEmailIsUnique(email, userId);

  const data = {
    id: userId,
    name,
    email,
    roleId,
    isActive: isActive ? 1 : 0,
  };

  let passwordSql = "";

  if (req.body.password) {
    data.passwordHash = await bcrypt.hash(req.body.password, 12);
    passwordSql = ", password_hash = :passwordHash";
  }

  await query(
    `
      UPDATE admin_users
      SET name = :name,
          email = :email,
          role_id = :roleId,
          is_active = :isActive
          ${passwordSql}
      WHERE id = :id
    `,
    data
  );

  res.json({ data: { id: userId } });
});

export const deleteAdminUser = asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);

  if (userId === req.admin.id) {
    throw httpError(400, "You cannot delete your own account");
  }

  const result = await query("DELETE FROM admin_users WHERE id = :id", { id: userId });

  if (result.affectedRows === 0) {
    throw httpError(404, "Admin user not found");
  }

  res.status(204).send();
});
