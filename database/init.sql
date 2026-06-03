CREATE DATABASE IF NOT EXISTS ufs_digital
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE ufs_digital;

CREATE TABLE IF NOT EXISTS roles (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) NOT NULL,
  description VARCHAR(500) NULL,
  is_system TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_slug (slug)
);

INSERT INTO roles (name, slug, description, is_system, is_active)
VALUES
  ('Super Admin', 'super_admin', 'Full access to every admin page and action.', 1, 1),
  ('Admin', 'admin', 'Default admin role with access to manage content, users and roles.', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  is_system = VALUES(is_system),
  is_active = VALUES(is_active);

CREATE TABLE IF NOT EXISTS admin_users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'admin', 'editor') NOT NULL DEFAULT 'admin',
  role_id INT UNSIGNED NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_users_email (email)
);

ALTER TABLE admin_users
  MODIFY role ENUM('super_admin', 'admin', 'editor') NOT NULL DEFAULT 'admin';

ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS role_id INT UNSIGNED NULL AFTER role;

UPDATE admin_users au
INNER JOIN roles r
  ON r.slug = CASE
    WHEN au.role = 'super_admin' THEN 'super_admin'
    ELSE 'admin'
  END
SET au.role_id = r.id
WHERE au.role_id IS NULL;

CREATE TABLE IF NOT EXISTS role_permissions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  role_id INT UNSIGNED NOT NULL,
  area VARCHAR(80) NOT NULL,
  can_view TINYINT(1) NOT NULL DEFAULT 0,
  can_create TINYINT(1) NOT NULL DEFAULT 0,
  can_edit TINYINT(1) NOT NULL DEFAULT 0,
  can_delete TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_role_permissions_role_area (role_id, area)
);

INSERT INTO role_permissions (role_id, area, can_view, can_create, can_edit, can_delete)
SELECT r.id, p.area, 1, 1, 1, 1
FROM roles r
INNER JOIN (
  SELECT 'dashboard' AS area
  UNION ALL SELECT 'blogs'
  UNION ALL SELECT 'team-members'
  UNION ALL SELECT 'partners'
  UNION ALL SELECT 'contact-submissions'
  UNION ALL SELECT 'bc-agent-applications'
  UNION ALL SELECT 'admin-users'
  UNION ALL SELECT 'roles'
) p
WHERE r.slug IN ('super_admin', 'admin')
ON DUPLICATE KEY UPDATE
  area = VALUES(area);

CREATE TABLE IF NOT EXISTS blogs (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(220) NOT NULL,
  slug VARCHAR(240) NOT NULL,
  excerpt TEXT NULL,
  content LONGTEXT NULL,
  cover_image_url VARCHAR(600) NULL,
  tag VARCHAR(80) NULL,
  status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  published_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_blogs_slug (slug),
  KEY idx_blogs_status_published_at (status, published_at)
);

CREATE TABLE IF NOT EXISTS team_members (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(160) NOT NULL,
  role VARCHAR(160) NOT NULL,
  experience_years INT NULL,
  bio TEXT NULL,
  photo_url VARCHAR(600) NULL,
  linkedin_url VARCHAR(600) NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_team_members_active_order (is_active, display_order)
);

CREATE TABLE IF NOT EXISTS partners (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(160) NOT NULL,
  logo_url VARCHAR(600) NULL,
  website_url VARCHAR(600) NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_partners_active_order (is_active, display_order)
);

INSERT INTO partners (name, logo_url, website_url, display_order, is_active)
SELECT 'Bank of Baroda', '/assets/partners/bob.jpg', NULL, 1, 1
WHERE NOT EXISTS (SELECT 1 FROM partners WHERE name = 'Bank of Baroda');

INSERT INTO partners (name, logo_url, website_url, display_order, is_active)
SELECT 'UCO Bank', '/assets/partners/uco.jpg', NULL, 2, 1
WHERE NOT EXISTS (SELECT 1 FROM partners WHERE name = 'UCO Bank');

INSERT INTO partners (name, logo_url, website_url, display_order, is_active)
SELECT 'State Bank of India', '/assets/partners/sbi.jpg', NULL, 3, 1
WHERE NOT EXISTS (SELECT 1 FROM partners WHERE name = 'State Bank of India');

INSERT INTO partners (name, logo_url, website_url, display_order, is_active)
SELECT 'Baroda Gujarat Gramin Bank', '/assets/partners/bggb.jpg', NULL, 4, 1
WHERE NOT EXISTS (SELECT 1 FROM partners WHERE name = 'Baroda Gujarat Gramin Bank');

INSERT INTO partners (name, logo_url, website_url, display_order, is_active)
SELECT 'Punjab National Bank', '/assets/partners/pnb.jpg', NULL, 5, 1
WHERE NOT EXISTS (SELECT 1 FROM partners WHERE name = 'Punjab National Bank');

INSERT INTO team_members (name, role, bio, photo_url, linkedin_url, display_order, is_active)
SELECT 'Rajesh Kumar', 'Chief Executive Officer', 'Rajesh leads UFS Digital with over 15 years of experience in banking operations and business growth.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', 'https://www.linkedin.com/in/rajesh-kumar', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Rajesh Kumar');

INSERT INTO team_members (name, role, bio, photo_url, linkedin_url, display_order, is_active)
SELECT 'Priya Sharma', 'Chief Technology Officer', 'Priya drives our technology strategy and builds secure digital platforms for rural customers.', 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80', 'https://www.linkedin.com/in/priya-sharma', 2, 1
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Priya Sharma');

INSERT INTO team_members (name, role, bio, photo_url, linkedin_url, display_order, is_active)
SELECT 'Amit Verma', 'Head of Operations', 'Amit oversees field operations and ensures our BC agents receive on-time support across regions.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', 'https://www.linkedin.com/in/amit-verma', 3, 1
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Amit Verma');

INSERT INTO team_members (name, role, bio, photo_url, linkedin_url, display_order, is_active)
SELECT 'Sunita Patel', 'Head of BC Network', 'Sunita manages our BC network and builds trusted partnerships with local entrepreneurs.', 'https://images.unsplash.com/photo-1540196350-b795576e43e5?auto=format&fit=crop&w=200&q=80', 'https://www.linkedin.com/in/sunita-patel', 4, 1
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Sunita Patel');

INSERT INTO team_members (name, role, bio, photo_url, linkedin_url, display_order, is_active)
SELECT 'Deepa Nair', 'Head of Marketing', 'Deepa shapes our brand story and makes financial inclusion understood and accessible.', 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=200&q=80', 'https://www.linkedin.com/in/deepa-nair', 5, 1
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Deepa Nair');

CREATE TABLE IF NOT EXISTS contact_submissions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(40) NULL,
  subject VARCHAR(220) NULL,
  message TEXT NOT NULL,
  status ENUM('new', 'reviewed', 'archived') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_contact_submissions_status_created (status, created_at)
);

CREATE TABLE IF NOT EXISTS districts (
  id INT NOT NULL AUTO_INCREMENT,
  state VARCHAR(30) NULL,
  district VARCHAR(26) NULL,
  status TINYINT(4) NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS bc_agent_applications (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(160) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  email VARCHAR(190) NULL,
  pan_number VARCHAR(10) NULL,
  aadhar_number VARCHAR(12) NULL,
  bank_name VARCHAR(180) NULL,
  state VARCHAR(120) NULL,
  district VARCHAR(120) NULL,
  city VARCHAR(120) NULL,
  pincode VARCHAR(20) NULL,
  address VARCHAR(500) NULL,
  occupation VARCHAR(160) NULL,
  experience TEXT NULL,
  message TEXT NULL,
  status ENUM('new', 'contacted', 'approved', 'rejected', 'archived') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_bc_agent_applications_status_created (status, created_at)
);

ALTER TABLE bc_agent_applications
  ADD COLUMN IF NOT EXISTS pan_number VARCHAR(10) NULL AFTER email,
  ADD COLUMN IF NOT EXISTS aadhar_number VARCHAR(12) NULL AFTER pan_number,
  ADD COLUMN IF NOT EXISTS bank_name VARCHAR(180) NULL AFTER aadhar_number,
  ADD COLUMN IF NOT EXISTS address VARCHAR(500) NULL AFTER pincode;

ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS experience_years INT NULL AFTER role;
