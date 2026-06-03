export const ACTIONS = ["view", "create", "edit", "delete"];

export const PERMISSION_AREAS = [
  { key: "dashboard", label: "Overview" },
  { key: "blog-categories", label: "Blog Categories" },
  { key: "blogs", label: "Blogs" },
  { key: "team-members", label: "Team" },
  { key: "partners", label: "Partners" },
  { key: "contact-submissions", label: "Contact Messages" },
  { key: "bc-agent-applications", label: "BC Agent Leads" },
  { key: "admin-users", label: "Admin Users" },
  { key: "roles", label: "Roles" },
];

export const PERMISSION_AREA_KEYS = PERMISSION_AREAS.map((area) => area.key);

export function normalizePermissions(rows = []) {
  return rows.map((row) => ({
    area: row.area,
    can_view: Boolean(row.can_view),
    can_create: Boolean(row.can_create),
    can_edit: Boolean(row.can_edit),
    can_delete: Boolean(row.can_delete),
  }));
}
