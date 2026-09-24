-- Board photos used to ship with the site in public/images/board/. They are
-- managed in the CMS now (uploaded to Cloudinary from /admin/board), and the
-- bundled files are gone, so any row still pointing at them would render a
-- broken image. Clearing them makes the site fall back to initials (homepage)
-- and an identicon (profile) until a photo is uploaded.
UPDATE board_members SET image_url = NULL WHERE image_url LIKE '/images/board/%';
UPDATE members SET image_url = NULL WHERE image_url LIKE '/images/board/%';
