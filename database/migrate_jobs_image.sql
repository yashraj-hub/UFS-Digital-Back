USE ufs_digital;

ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS image_url VARCHAR(600) NULL AFTER experience_required;
