-- V15: Extend opportunities with modular dynamic form capability and additional metadata

-- 1. Alter existing opp_opp table to add new columns
ALTER TABLE opp_opp ADD COLUMN tptagopp INTEGER;
ALTER TABLE opp_opp ADD COLUMN flpaid BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE opp_opp ADD COLUMN dsremuneration VARCHAR(255);
ALTER TABLE opp_opp ADD COLUMN fluseform BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE opp_opp ADD COLUMN dscontactphone VARCHAR(30);

-- 2. Alter existing opp_apply table to add candidate contact phone
ALTER TABLE opp_apply ADD COLUMN dsphone VARCHAR(30);

-- 3. Create opp_form table for dynamic application forms
CREATE TABLE opp_form (
    idoppform UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idopp UUID NOT NULL,
    nmform VARCHAR(255) NOT NULL,
    strecord INTEGER NOT NULL DEFAULT 1,
    idupdatedby UUID NOT NULL,
    tsupdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_opp_form_opportunity FOREIGN KEY (idopp) REFERENCES opp_opp (idopp) ON DELETE CASCADE,
    CONSTRAINT fk_opp_form_updatedby FOREIGN KEY (idupdatedby) REFERENCES sec_user (iduser)
);

-- 4. Create opp_question table for form questions
CREATE TABLE opp_question (
    idquestion UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idoppform UUID NOT NULL,
    dslabel VARCHAR(500) NOT NULL,
    tpquestion INTEGER NOT NULL, -- 1 = SHORT_ANSWER, 2 = MULTIPLE_CHOICE, 3 = SINGLE_CHOICE
    flrequired BOOLEAN NOT NULL DEFAULT FALSE,
    nrsortorder INTEGER NOT NULL DEFAULT 0,
    strecord INTEGER NOT NULL DEFAULT 1,
    idupdatedby UUID NOT NULL,
    tsupdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_opp_question_form FOREIGN KEY (idoppform) REFERENCES opp_form (idoppform) ON DELETE CASCADE,
    CONSTRAINT fk_opp_question_updatedby FOREIGN KEY (idupdatedby) REFERENCES sec_user (iduser)
);

-- 5. Create opp_option table for choice options
CREATE TABLE opp_option (
    idoption UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idquestion UUID NOT NULL,
    nmoption VARCHAR(255) NOT NULL,
    nrsortorder INTEGER NOT NULL DEFAULT 0,
    strecord INTEGER NOT NULL DEFAULT 1,
    idupdatedby UUID NOT NULL,
    tsupdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_opp_option_question FOREIGN KEY (idquestion) REFERENCES opp_question (idquestion) ON DELETE CASCADE,
    CONSTRAINT fk_opp_option_updatedby FOREIGN KEY (idupdatedby) REFERENCES sec_user (iduser)
);

-- 6. Create opp_answer table for candidate answers
CREATE TABLE opp_answer (
    idanswer UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idapply UUID NOT NULL,
    idquestion UUID NOT NULL,
    dsanswer TEXT NOT NULL,
    strecord INTEGER NOT NULL DEFAULT 1,
    idupdatedby UUID NOT NULL,
    tsupdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_opp_answer_apply FOREIGN KEY (idapply) REFERENCES opp_apply (idapply) ON DELETE CASCADE,
    CONSTRAINT fk_opp_answer_question FOREIGN KEY (idquestion) REFERENCES opp_question (idquestion),
    CONSTRAINT fk_opp_answer_updatedby FOREIGN KEY (idupdatedby) REFERENCES sec_user (iduser)
);

-- Create indexes for performance optimization
CREATE INDEX ix_opp_form_opportunity ON opp_form (idopp);
CREATE INDEX ix_opp_question_form ON opp_question (idoppform);
CREATE INDEX ix_opp_option_question ON opp_option (idquestion);
CREATE INDEX ix_opp_answer_apply ON opp_answer (idapply);
CREATE INDEX ix_opp_answer_question ON opp_answer (idquestion);
