USE ufs_digital;

CREATE TABLE IF NOT EXISTS blog_categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_blog_categories_slug (slug)
);

INSERT INTO blog_categories (name, slug, display_order, is_active)
VALUES
  ('Finance', 'finance', 1, 1),
  ('Technology', 'technology', 2, 1),
  ('Empowerment', 'empowerment', 3, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

ALTER TABLE blogs
  ADD COLUMN IF NOT EXISTS category_id INT UNSIGNED NULL AFTER tag;

UPDATE blogs b
INNER JOIN blog_categories bc ON bc.slug = LOWER(REPLACE(b.tag, ' ', '-'))
SET b.category_id = bc.id
WHERE b.category_id IS NULL AND b.tag IS NOT NULL;
