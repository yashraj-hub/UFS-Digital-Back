import { Router } from "express";
import { login, me, changePassword } from "../controllers/adminAuthController.js";
import {
  createRole,
  deleteRole,
  getPermissionCatalog,
  listRoles,
  updateRole,
} from "../controllers/adminRolesController.js";
import {
  createAdminUser,
  deleteAdminUser,
  listAdminUsers,
  updateAdminUser,
} from "../controllers/adminUsersController.js";
import {
  createResource,
  deleteResource,
  deleteMultipleResources,
  getResourceById,
  listResources,
  updateResource,
} from "../controllers/adminContentController.js";
import { getActivityLogs } from "../controllers/adminActivityController.js";
import {
  requireAdmin,
  requireAnyPermission,
  requirePermission,
  requireResourcePermission,
} from "../middleware/auth.js";

const router = Router();

router.post("/auth/login", login);
router.get("/auth/me", requireAdmin, me);
router.post("/auth/change-password", requireAdmin, changePassword);

router.get("/permissions", requireAdmin, requirePermission("roles", "view"), getPermissionCatalog);

router.get(
  "/roles",
  requireAdmin,
  requireAnyPermission([
    { area: "roles", action: "view" },
    { area: "admin-users", action: "view" },
    { area: "admin-users", action: "create" },
    { area: "admin-users", action: "edit" },
  ]),
  listRoles
);
router.post("/roles", requireAdmin, requirePermission("roles", "create"), createRole);
router.patch("/roles/:id", requireAdmin, requirePermission("roles", "edit"), updateRole);
router.delete("/roles/:id", requireAdmin, requirePermission("roles", "delete"), deleteRole);

router.get("/users", requireAdmin, requirePermission("admin-users", "view"), listAdminUsers);
router.post("/users", requireAdmin, requirePermission("admin-users", "create"), createAdminUser);
router.patch("/users/:id", requireAdmin, requirePermission("admin-users", "edit"), updateAdminUser);
router.delete("/users/:id", requireAdmin, requirePermission("admin-users", "delete"), deleteAdminUser);

router.get("/activity-logs", requireAdmin, getActivityLogs);

router.get("/content/:resource", requireAdmin, requireResourcePermission("view"), listResources);
router.post("/content/:resource", requireAdmin, requireResourcePermission("create"), createResource);
router.get("/content/:resource/:id", requireAdmin, requireResourcePermission("view"), getResourceById);
router.patch("/content/:resource/:id", requireAdmin, requireResourcePermission("edit"), updateResource);
router.delete("/content/:resource/:id", requireAdmin, requireResourcePermission("delete"), deleteResource);
router.post("/content/:resource/bulk-delete", requireAdmin, requireResourcePermission("delete"), deleteMultipleResources);

export default router;
