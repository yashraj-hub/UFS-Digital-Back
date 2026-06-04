USE ufs_digital;

-- Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  location VARCHAR(100) DEFAULT 'Remote',
  experience_required VARCHAR(100) NULL,
  description LONGTEXT NULL,
  status ENUM('draft', 'active', 'closed') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_jobs_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Job Applications Table
CREATE TABLE IF NOT EXISTS job_applications (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  job_id INT UNSIGNED NOT NULL,
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  current_location VARCHAR(160) NULL,
  experience_years INT NULL,
  current_ctc VARCHAR(100) NULL,
  expected_ctc VARCHAR(100) NULL,
  notice_period VARCHAR(100) NULL,
  linkedin_url VARCHAR(600) NULL,
  portfolio_url VARCHAR(600) NULL,
  resume_url VARCHAR(600) NULL,
  cover_letter TEXT NULL,
  status ENUM('new', 'reviewed', 'shortlisted', 'rejected') NOT NULL DEFAULT 'new',
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_applications_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  KEY idx_applications_job_id (job_id),
  KEY idx_applications_status_applied (status, applied_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add permissions for careers area to roles
INSERT INTO role_permissions (role_id, area, can_view, can_create, can_edit, can_delete)
SELECT r.id, p.area, 1, 1, 1, 1
FROM roles r
CROSS JOIN (
  SELECT 'jobs' AS area
  UNION ALL SELECT 'job-applications'
) p
WHERE r.slug IN ('super_admin', 'admin')
ON DUPLICATE KEY UPDATE area = VALUES(area);
