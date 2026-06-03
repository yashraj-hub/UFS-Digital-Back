# UFS Digital Backend

Express + MySQL API for the UFS Digital website and admin panel.

## Setup

```bash
npm install
copy .env.example .env
npm run db:init
npm run admin:create -- admin@ufsdigital.one StrongPassword123 "Admin User"
npm run dev
```

The API runs on `http://localhost:5000` by default.

`npm run db:init` seeds two system roles:

- `super_admin`: full access and cannot be modified from the admin panel
- `admin`: full default access, including role and user management

## Main Routes

- `GET /api/health`
- `GET /api/blogs`
- `GET /api/blogs/:slug`
- `GET /api/team-members`
- `GET /api/partners`
- `POST /api/contact-submissions`
- `POST /api/bc-agent-applications`
- `POST /api/admin/auth/login`
- `GET /api/admin/auth/me`
- `GET|POST /api/admin/roles`
- `PATCH|DELETE /api/admin/roles/:id`
- `GET|POST /api/admin/users`
- `PATCH|DELETE /api/admin/users/:id`
- `GET|POST /api/admin/content/:resource`
- `GET|PATCH|DELETE /api/admin/content/:resource/:id`

Admin content resources:

- `blogs`
- `team-members`
- `partners`
- `contact-submissions`
- `bc-agent-applications`
