ALTER TABLE feed_post ADD COLUMN idgroup UUID NULL;
ALTER TABLE feed_post ADD CONSTRAINT fk_feed_post_group FOREIGN KEY (idgroup) REFERENCES grp_group (idgroup) ON DELETE CASCADE;
