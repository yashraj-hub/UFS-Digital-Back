USE ufs_digital;

CREATE TABLE IF NOT EXISTS activity_logs (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  user_name VARCHAR(120) NOT NULL,
  user_email VARCHAR(190) NOT NULL,
  user_role VARCHAR(80) NOT NULL,
  action ENUM('create', 'update', 'delete', 'login', 'change_password') NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(40) NULL,
  description TEXT NOT NULL,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_activity_logs_user_id (user_id),
  KEY idx_activity_logs_created_at (created_at)
);
