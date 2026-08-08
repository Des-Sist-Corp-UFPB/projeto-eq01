-- V6: Add username to usr_human and create testimonials table

-- 1. Add dsusername to usr_human (nullable initially to allow populating existing records)
ALTER TABLE usr_human ADD COLUMN dsusername VARCHAR(50);

-- 2. Populate dsusername for existing records using email prefix
UPDATE usr_human 
SET dsusername = COALESCE(
    LOWER(REGEXP_REPLACE(SPLIT_PART(dsemail, '@', 1), '[^a-zA-Z0-9_.]', '', 'g')), 
    'user_' || SUBSTR(idhuman::text, 1, 8)
);

-- Ensure none are blank or null
UPDATE usr_human 
SET dsusername = 'user_' || SUBSTR(idhuman::text, 1, 8) 
WHERE dsusername IS NULL OR dsusername = '';

-- Resolve any potential duplicates by appending row number
WITH duplicates AS (
    SELECT idhuman, dsusername, 
           ROW_NUMBER() OVER(PARTITION BY dsusername ORDER BY tsupdated) as rn
    FROM usr_human
)
UPDATE usr_human h
SET dsusername = d.dsusername || '_' || (d.rn - 1)
FROM duplicates d
WHERE h.idhuman = d.idhuman AND d.rn > 1;

-- 3. Enforce constraints
ALTER TABLE usr_human ALTER COLUMN dsusername SET NOT NULL;
ALTER TABLE usr_human ADD CONSTRAINT uk_usr_human_username UNIQUE (dsusername);

-- 4. Create usr_testimonial table
CREATE TABLE usr_testimonial (
    idtestimonial UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idreceiver UUID NOT NULL,
    idsender UUID NOT NULL,
    dscontent TEXT NOT NULL,
    flaccepted BOOLEAN NOT NULL DEFAULT FALSE,
    strecord INTEGER NOT NULL DEFAULT 1,
    idupdatedby UUID NOT NULL,
    tsupdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_testimonial_receiver FOREIGN KEY (idreceiver) REFERENCES usr_human (idhuman) ON DELETE CASCADE,
    CONSTRAINT fk_testimonial_sender FOREIGN KEY (idsender) REFERENCES usr_human (idhuman) ON DELETE CASCADE,
    CONSTRAINT fk_testimonial_updatedby FOREIGN KEY (idupdatedby) REFERENCES sec_user (iduser)
);

-- Indexing
CREATE INDEX ix_usr_testimonial_receiver ON usr_testimonial (idreceiver);
CREATE INDEX ix_usr_testimonial_sender ON usr_testimonial (idsender);
