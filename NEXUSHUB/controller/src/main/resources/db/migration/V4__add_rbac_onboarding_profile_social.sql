-- V4: Add RBAC, Onboarding, Expanded Profile, and Social Feed structure

-- 1. RBAC User Types (Vínculo) and Onboarding Completed Flag
ALTER TABLE usr_human ADD COLUMN tpuser VARCHAR(30) DEFAULT 'Aluno';
ALTER TABLE sec_user ADD COLUMN flonboarding BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Onboarding & Profile Expansion Fields in usr_human
ALTER TABLE usr_human ADD COLUMN flshowbirthday BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE usr_human ADD COLUMN nrmatricula VARCHAR(30);
ALTER TABLE usr_human ADD COLUMN nryingresso INTEGER;
ALTER TABLE usr_human ADD COLUMN nyconclusao INTEGER;
ALTER TABLE usr_human ADD COLUMN nrwhatsapp VARCHAR(30);
ALTER TABLE usr_human ADD COLUMN urlgithub VARCHAR(255);
ALTER TABLE usr_human ADD COLUMN urlinstagram VARCHAR(255);
ALTER TABLE usr_human ADD COLUMN urllinkedin VARCHAR(255);
ALTER TABLE usr_human ADD COLUMN urlwebsite VARCHAR(255);
ALTER TABLE usr_human ADD COLUMN dsgenderother VARCHAR(100);
ALTER TABLE usr_human ADD COLUMN flnotifrecommendations BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE usr_human ADD COLUMN flnotifapplications BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE usr_human ADD COLUMN flnotifannouncements BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE usr_human ADD COLUMN flnotifedicts BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE usr_human ADD COLUMN flnotifadmin BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE usr_human ADD COLUMN dsexperience TEXT;
ALTER TABLE usr_human ADD COLUMN dseducation TEXT;
ALTER TABLE usr_human ADD COLUMN dscertification TEXT;

-- 3. Stacks/Technologies Tables
CREATE TABLE usr_technology (
    idtechnology UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nmtechnology VARCHAR(80) NOT NULL,
    strecord INTEGER NOT NULL DEFAULT 1,
    idupdatedby UUID NOT NULL,
    tsupdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_usr_technology_name UNIQUE (nmtechnology),
    CONSTRAINT fk_usr_technology_updatedby FOREIGN KEY (idupdatedby) REFERENCES sec_user (iduser)
);

CREATE TABLE usr_humtech (
    idhumtech UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idhuman UUID NOT NULL,
    idtechnology UUID NOT NULL,
    strecord INTEGER NOT NULL DEFAULT 1,
    idupdatedby UUID NOT NULL,
    tsupdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_usr_humtech_human_tech UNIQUE (idhuman, idtechnology),
    CONSTRAINT fk_usr_humtech_human FOREIGN KEY (idhuman) REFERENCES usr_human (idhuman),
    CONSTRAINT fk_usr_humtech_tech FOREIGN KEY (idtechnology) REFERENCES usr_technology (idtechnology),
    CONSTRAINT fk_usr_humtech_updatedby FOREIGN KEY (idupdatedby) REFERENCES sec_user (iduser)
);

-- Seed dummy role, human, and user if not exists to satisfy not-null constraints during clean migrations
INSERT INTO sec_role (idrole, nmrole, dsrole, tprole, strecord, idupdatedby, tsupdated)
SELECT '00000000-0000-0000-0000-000000000000', 'SYSTEM_ADMIN', 'System Admin Role', 1, 1, '00000000-0000-0000-0000-000000000000', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM sec_role);

INSERT INTO usr_human (idhuman, nmhuman, dsemail, strecord, idupdatedby, tsupdated)
SELECT '00000000-0000-0000-0000-000000000000', 'System', 'system@nexushub.com', 1, '00000000-0000-0000-0000-000000000000', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM usr_human);

INSERT INTO sec_user (iduser, idhuman, idrole, dsemail, dspasshash, strecord, idupdatedby, tsupdated)
SELECT '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'system@nexushub.com', 'dummy_hash', 1, '00000000-0000-0000-0000-000000000000', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM sec_user);

-- Seed standard technologies using a subquery to resolve updating user ID
INSERT INTO usr_technology (nmtechnology, idupdatedby) VALUES 
('React', (SELECT iduser FROM sec_user LIMIT 1)),
('Node.js', (SELECT iduser FROM sec_user LIMIT 1)),
('Python', (SELECT iduser FROM sec_user LIMIT 1)),
('Java', (SELECT iduser FROM sec_user LIMIT 1)),
('TypeScript', (SELECT iduser FROM sec_user LIMIT 1)),
('Figma', (SELECT iduser FROM sec_user LIMIT 1)),
('Git', (SELECT iduser FROM sec_user LIMIT 1)),
('SQL', (SELECT iduser FROM sec_user LIMIT 1)),
('Angular', (SELECT iduser FROM sec_user LIMIT 1)),
('Spring Boot', (SELECT iduser FROM sec_user LIMIT 1)),
('PostgreSQL', (SELECT iduser FROM sec_user LIMIT 1));

-- 4. Social Feed Tables (Posts, Likes, Comments)
CREATE TABLE feed_post (
    idpost UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idauthor UUID NOT NULL,
    dscontent TEXT NOT NULL,
    urlimage VARCHAR(500),
    strecord INTEGER NOT NULL DEFAULT 1,
    idupdatedby UUID NOT NULL,
    tsupdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feed_post_author FOREIGN KEY (idauthor) REFERENCES usr_human (idhuman),
    CONSTRAINT fk_feed_post_updatedby FOREIGN KEY (idupdatedby) REFERENCES sec_user (iduser)
);

CREATE TABLE feed_like (
    idlike UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idpost UUID NOT NULL,
    idhuman UUID NOT NULL,
    tscreated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_feed_like_post_human UNIQUE (idpost, idhuman),
    CONSTRAINT fk_feed_like_post FOREIGN KEY (idpost) REFERENCES feed_post (idpost) ON DELETE CASCADE,
    CONSTRAINT fk_feed_like_human FOREIGN KEY (idhuman) REFERENCES usr_human (idhuman)
);

CREATE TABLE feed_comment (
    idcomment UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idpost UUID NOT NULL,
    idauthor UUID NOT NULL,
    dscontent TEXT NOT NULL,
    strecord INTEGER NOT NULL DEFAULT 1,
    idupdatedby UUID NOT NULL,
    tsupdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feed_comment_post FOREIGN KEY (idpost) REFERENCES feed_post (idpost) ON DELETE CASCADE,
    CONSTRAINT fk_feed_comment_author FOREIGN KEY (idauthor) REFERENCES usr_human (idhuman),
    CONSTRAINT fk_feed_comment_updatedby FOREIGN KEY (idupdatedby) REFERENCES sec_user (iduser)
);

CREATE INDEX ix_usr_humtech_human ON usr_humtech (idhuman);
CREATE INDEX ix_feed_post_author ON feed_post (idauthor);
CREATE INDEX ix_feed_like_post ON feed_like (idpost);
CREATE INDEX ix_feed_comment_post ON feed_comment (idpost);
