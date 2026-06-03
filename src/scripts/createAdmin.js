import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import pool, { query } from "../config/db.js";

dotenv.config();

const [, , email, password, name = "Admin User"] = process.argv;

if (!email || !password) {
  console.error('Usage: npm run admin:create -- admin@example.com "StrongPassword123" "Admin User"');
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 12);

const roles = await query("SELECT id FROM roles WHERE slug = 'super_admin' LIMIT 1");
const roleId = roles[0]?.id;

if (!roleId) {
  console.error("Super admin role is missing. Run npm run db:init first.");
  await pool.end();
  process.exit(1);
}

await query(
  `
    INSERT INTO admin_users (name, email, password_hash, role, role_id)
    VALUES (:name, :email, :passwordHash, 'super_admin', :roleId)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      password_hash = VALUES(password_hash),
      is_active = 1,
      role = 'super_admin',
      role_id = VALUES(role_id)
  `,
  { name, email, passwordHash, roleId }
);

console.log(`Admin user ready: ${email}`);
await pool.end();
