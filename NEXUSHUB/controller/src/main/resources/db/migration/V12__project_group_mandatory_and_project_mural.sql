-- V12: Make project group mandatory and add project mural to feed_post

-- Ensure all existing projects have a valid group or delete/update them if any are null (optional, safety check)
-- UPDATE prj_project SET idgroup = (SELECT idgroup FROM grp_group LIMIT 1) WHERE idgroup IS NULL;

-- Make idgroup column in prj_project NOT NULL
ALTER TABLE prj_project ALTER COLUMN idgroup SET NOT NULL;

-- Add idproject column to feed_post for project message boards (mural)
ALTER TABLE feed_post ADD COLUMN idproject UUID;
ALTER TABLE feed_post ADD CONSTRAINT fk_feed_post_project FOREIGN KEY (idproject) REFERENCES prj_project (idproject) ON DELETE CASCADE;
CREATE INDEX ix_feed_post_idproject ON feed_post (idproject);
