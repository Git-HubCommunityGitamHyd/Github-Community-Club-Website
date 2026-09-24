-- Event photos used to ship with the site in public/images/events/. They are
-- managed in the CMS now (uploaded to Cloudinary from /admin/events), and the
-- bundled files are gone, so references to them are dropped. An event left
-- with no photos shows its category glyph until photos are uploaded.
-- json_each keeps any Cloudinary URLs already in the list, in order.
UPDATE events
SET images = (
  SELECT coalesce(json_group_array(value), '[]')
  FROM (
    SELECT value FROM json_each(events.images)
    WHERE value NOT LIKE '/images/events/%'
    ORDER BY key
  )
)
WHERE images LIKE '%/images/events/%';
