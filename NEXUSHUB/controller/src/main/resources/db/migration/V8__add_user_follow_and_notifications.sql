-- V8: Add user follow relationships, in-app notifications, and moderation cases for reporting content

-- 1. Create usr_follow table
CREATE TABLE usr_follow (
    idfollow UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idfollower UUID NOT NULL,
    idfollowing UUID NOT NULL,
    tscreated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_usr_follow_follower_following UNIQUE (idfollower, idfollowing),
    CONSTRAINT fk_usr_follow_follower FOREIGN KEY (idfollower) REFERENCES usr_human (idhuman) ON DELETE CASCADE,
    CONSTRAINT fk_usr_follow_following FOREIGN KEY (idfollowing) REFERENCES usr_human (idhuman) ON DELETE CASCADE
);

CREATE INDEX ix_usr_follow_follower ON usr_follow (idfollower);
CREATE INDEX ix_usr_follow_following ON usr_follow (idfollowing);

-- 2. Create usr_notification table
CREATE TABLE usr_notification (
    idnotification UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idreceiver UUID NOT NULL,
    dsmessage VARCHAR(255) NOT NULL,
    flread BOOLEAN NOT NULL DEFAULT FALSE,
    tscreated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usr_notification_receiver FOREIGN KEY (idreceiver) REFERENCES usr_human (idhuman) ON DELETE CASCADE
);

CREATE INDEX ix_usr_notification_receiver ON usr_notification (idreceiver);

-- 3. Create adm_moderation_case table
CREATE TABLE adm_moderation_case (
    idcase UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idreporter UUID NOT NULL,
    idreviewer UUID,
    dstargettype VARCHAR(50) NOT NULL, -- 'POST' or 'USER'
    idtarget UUID NOT NULL,
    dsstatus VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    dsreason VARCHAR(255) NOT NULL,
    tscreated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tsreviewed TIMESTAMP,
    CONSTRAINT fk_moderation_reporter FOREIGN KEY (idreporter) REFERENCES usr_human (idhuman) ON DELETE CASCADE,
    CONSTRAINT fk_moderation_reviewer FOREIGN KEY (idreviewer) REFERENCES usr_human (idhuman) ON DELETE SET NULL
);

CREATE INDEX ix_moderation_reporter ON adm_moderation_case (idreporter);
CREATE INDEX ix_moderation_status ON adm_moderation_case (dsstatus);
