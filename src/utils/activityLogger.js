import { query } from "../config/db.js";

const RESOURCE_LABELS = {
  blogs: "Blog",
  "blog-categories": "Blog Category",
  "team-members": "Team Member",
  partners: "Partner",
  "contact-submissions": "Contact Submission",
  "bc-agent-applications": "BC Agent Application",
  jobs: "Job",
  "job-applications": "Job Application",
  "admin-users": "Admin User",
  roles: "Role",
};

const ACTION_LABELS = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  login: "Logged in",
  change_password: "Changed password",
};

export function buildDescription(action, resource, detail = null) {
  const resourceLabel = RESOURCE_LABELS[resource] || resource;
  const actionLabel = ACTION_LABELS[action] || action;
  if (action === "login" || action === "change_password") {
    return `${actionLabel}`;
  }
  return detail
    ? `${actionLabel} ${resourceLabel}: "${detail}"`
    : `${actionLabel} ${resourceLabel}`;
}

export async function logActivity({ user, action, resource, resourceId = null, description, metadata = null }) {
  try {
    await query(
      `INSERT INTO activity_logs (user_id, user_name, user_email, user_role, action, resource, resource_id, description, metadata)
       VALUES (:userId, :userName, :userEmail, :userRole, :action, :resource, :resourceId, :description, :metadata)`,
      {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        action,
        resource,
        resourceId: resourceId ? String(resourceId) : null,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
      }
    );
  } catch {
    // never block the main request if logging fails
  }
}
