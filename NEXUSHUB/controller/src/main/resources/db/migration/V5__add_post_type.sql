-- V5: Add post type (tppost) column to feed_post table
ALTER TABLE feed_post ADD COLUMN tppost VARCHAR(50) DEFAULT 'USER';
