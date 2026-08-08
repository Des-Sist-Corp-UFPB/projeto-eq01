DROP TABLE IF EXISTS opp_apply CASCADE;
DROP TABLE IF EXISTS opp_opp CASCADE;
DROP TABLE IF EXISTS prj_prjtag CASCADE;
DROP TABLE IF EXISTS prj_tag CASCADE;
DROP TABLE IF EXISTS prj_request CASCADE;
DROP TABLE IF EXISTS prj_hummember CASCADE;
DROP TABLE IF EXISTS prj_project CASCADE;
DROP TABLE IF EXISTS grp_hummember CASCADE;
DROP TABLE IF EXISTS grp_group CASCADE;
DROP TABLE IF EXISTS usr_humint CASCADE;
DROP TABLE IF EXISTS usr_interest CASCADE;
DROP TABLE IF EXISTS sec_user CASCADE;
DROP TABLE IF EXISTS usr_human CASCADE;
DROP TABLE IF EXISTS sec_role CASCADE;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE sec_role (
    idrole UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nmrole VARCHAR(80) NOT NULL,
    dsrole VARCHAR(255),
    tprole INTEGER NOT NULL,
    strecord INTEGER NOT NULL DEFAULT 1,
    idupdatedby UUID NOT NULL,
    tsupdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_sec_role_nmrole UNIQUE (nmrole),
    CONSTRAINT ck_sec_role_strecord CHECK (strecord IN (0, 1))
);

CREATE TABLE usr_human (
    idhuman UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nmhuman VARCHAR(255) NOT NULL,
    dsemail VARCHAR(255),
    dsbio VARCHAR(1000),
    dscourse VARCHAR(255),
    nrperiod INTEGER,
    dtbirth DATE,
    tpgender INTEGER,
    urlphoto VARCHAR(500),
    strecord INTEGER NOT NULL DEFAULT 1,
    idupdatedby UUID NOT NULL,
    tsupdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_usr_human_strecord CHECK (strecord IN (0, 1))
);

CREATE TABLE sec_user (
    iduser UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idhuman UUID NOT NULL,
    idrole UUID NOT NULL,
    dsemail VARCHAR(255) NOT NULL,
    dspasshash VARCHAR(255) NOT NULL,
    stemail INTEGER NOT NULL DEFAULT 0,
    dhlastaccess TIMESTAMP,
    strecord INTEGER NOT NULL DEFAULT 1,
    idupdatedby UUID NOT NULL,
    tsupdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_sec_user_idhuman UNIQUE (idhuman),
    CONSTRAINT uk_sec_user_dsemail UNIQUE (dsemail),
    CONSTRAINT ck_sec_user_stemail CHECK (stemail IN (0, 1, 2)),
    CONSTRAINT ck_sec_user_strecord CHECK (strecord IN (0, 1)),
    CONSTRAINT fk_sec_user_human FOREIGN KEY (idhuman) REFERENCES usr_human (idhuman) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_sec_user_role FOREIGN KEY (idrole) REFERENCES sec_role (idrole)
);

ALTER TABLE usr_human
    ADD CONSTRAINT fk_usr_human_updatedby
    FOREIGN KEY (idupdatedby) REFERENCES sec_user (iduser)
    DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE sec_user
    ADD CONSTRAINT fk_sec_user_updatedby
    FOREIGN KEY (idupdatedby) REFERENCES sec_user (iduser)
    DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE sec_role
    ADD CONSTRAINT fk_sec_role_updatedby
    FOREIGN KEY (idupdatedby) REFERENCES sec_user (iduser)
    DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE usr_interest (
    idinterest UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nminterest VARCHAR(120) NOT NULL,
    dsinterest VARCHAR(255),
    strecord INTEGER NOT NULL DEFAULT 1,
    idupdatedby UUID NOT NULL,
    tsupdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_usr_interest_nminterest UNIQUE (nminterest),
    CONSTRAINT ck_usr_interest_strecord CHECK (strecord IN (0, 1)),
    CONSTRAINT fk_usr_interest_updatedby FOREIGN KEY (idupdatedby) REFERENCES sec_user (iduser)
);

CREATE TABLE usr_humint (
    idhumint UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idhuman UUID NOT NULL,
    idinterest UUID NOT NULL,
    strecord INTEGER NOT NULL DEFAULT 1,
    idupdatedby UUID NOT NULL,
    tsupdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_usr_humint_humaninterest UNIQUE (idhuman, idinterest),
    CONSTRAINT ck_usr_humint_strecord CHECK (strecord IN (0, 1)),
    CONSTRAINT fk_usr_humint_human FOREIGN KEY (idhuman) REFERENCES usr_human (idhuman),
    CONSTRAINT fk_usr_humint_interest FOREIGN KEY (idinterest) REFERENCES usr_interest (idinterest),
    CONSTRAINT fk_usr_humint_updatedby FOREIGN KEY (idupdatedby) REFERENCES sec_user (iduser)
);

CREATE TABLE grp_group (
    idgroup UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nmgroup VARCHAR(255) NOT NULL,
    dsgroup TEXT NOT NULL,
    tpgroup INTEGER NOT NULL,
    stgroup INTEGER NOT NULL DEFAULT 1,
    cdcolor VARCHAR(20),
    urllogo VARCHAR(500),
    strecord INTEGER NOT NULL DEFAULT 1,
    idupdatedby UUID NOT NULL,
    tsupdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_grp_group_stgroup CHECK (stgroup IN (1, 2, 3, 4)),
    CONSTRAINT ck_grp_group_strecord CHECK (strecord IN (0, 1)),
    CONSTRAINT fk_grp_group_updatedby FOREIGN KEY (idupdatedby) REFERENCES sec_user (iduser)
);

CREATE TABLE grp_hummember (
    idgrphummember UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idgroup UUID NOT NULL,
    idhuman UUID NOT NULL,
    fladmin BOOLEAN NOT NULL DEFAULT FALSE,
    stmember INTEGER NOT NULL DEFAULT 1,
    dtjoined DATE NOT NULL DEFAULT CURRENT_DATE,
    strecord INTEGER NOT NULL DEFAULT 1,
    idupdatedby UUID NOT NULL,
    tsupdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_grp_hummember_grouphuman UNIQUE (idgroup, idhuman),
    CONSTRAINT ck_grp_hummember_stmember CHECK (stmember IN (1, 2, 3, 4)),
    CONSTRAINT ck_grp_hummember_strecord CHECK (strecord IN (0, 1)),
    CONSTRAINT fk_grp_hummember_group FOREIGN KEY (idgroup) REFERENCES grp_group (idgroup),
    CONSTRAINT fk_grp_hummember_human FOREIGN KEY (idhuman) REFERENCES usr_human (idhuman),
    CONSTRAINT fk_grp_hummember_updatedby FOREIGN KEY (idupdatedby) REFERENCES sec_user (iduser)
);

CREATE TABLE prj_project (
    idproject UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idgroup UUID,
    idowner UUID NOT NULL,
    nmproject VARCHAR(255) NOT NULL,
    dsresume VARCHAR(1000) NOT NULL,
    dsgoals TEXT,
    tpproject INTEGER NOT NULL,
    stproject INTEGER NOT NULL DEFAULT 1,
    stvisibility INTEGER NOT NULL DEFAULT 1,
    urlcover VARCHAR(500),
    urlland VARCHAR(500),
    qtxp INTEGER NOT NULL DEFAULT 0,
    nrpoints INTEGER NOT NULL DEFAULT 0,
    strecord INTEGER NOT NULL DEFAULT 1,
    idupdatedby UUID NOT NULL,
    tsupdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_prj_project_stproject CHECK (stproject IN (1, 2, 3, 4)),
    CONSTRAINT ck_prj_project_stvisibility CHECK (stvisibility IN (1, 2, 3)),
    CONSTRAINT ck_prj_project_strecord CHECK (strecord IN (0, 1)),
    CONSTRAINT fk_prj_project_group FOREIGN KEY (idgroup) REFERENCES grp_group (idgroup),
    CONSTRAINT fk_prj_project_owner FOREIGN KEY (idowner) REFERENCES usr_human (idhuman),
    CONSTRAINT fk_prj_project_updatedby FOREIGN KEY (idupdatedby) REFERENCES sec_user (iduser)
);

CREATE TABLE prj_hummember (
    idprjhummember UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idproject UUID NOT NULL,
    idhuman UUID NOT NULL,
    tpprjrole INTEGER NOT NULL DEFAULT 1,
    stmember INTEGER NOT NULL DEFAULT 1,
    dtjoined DATE NOT NULL DEFAULT CURRENT_DATE,
    strecord INTEGER NOT NULL DEFAULT 1,
    idupdatedby UUID NOT NULL,
    tsupdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_prj_hummember_projecthuman UNIQUE (idproject, idhuman),
    CONSTRAINT ck_prj_hummember_stmember CHECK (stmember IN (1, 2, 3, 4)),
    CONSTRAINT ck_prj_hummember_strecord CHECK (strecord IN (0, 1)),
    CONSTRAINT fk_prj_hummember_project FOREIGN KEY (idproject) REFERENCES prj_project (idproject),
    CONSTRAINT fk_prj_hummember_human FOREIGN KEY (idhuman) REFERENCES usr_human (idhuman),
    CONSTRAINT fk_prj_hummember_updatedby FOREIGN KEY (idupdatedby) REFERENCES sec_user (iduser)
);

CREATE TABLE prj_request (
    idrequest UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idproject UUID NOT NULL,
    idhuman UUID NOT NULL,
    idevaluator UUID,
    dsmotive VARCHAR(1000) NOT NULL,
    dsanswer VARCHAR(1000),
    strequest INTEGER NOT NULL DEFAULT 1,
    tsevaluated TIMESTAMP,
    strecord INTEGER NOT NULL DEFAULT 1,
    idupdatedby UUID NOT NULL,
    tsupdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_prj_request_projecthuman UNIQUE (idproject, idhuman),
    CONSTRAINT ck_prj_request_strequest CHECK (strequest IN (1, 2, 3, 4)),
    CONSTRAINT ck_prj_request_strecord CHECK (strecord IN (0, 1)),
    CONSTRAINT fk_prj_request_project FOREIGN KEY (idproject) REFERENCES prj_project (idproject),
    CONSTRAINT fk_prj_request_human FOREIGN KEY (idhuman) REFERENCES usr_human (idhuman),
    CONSTRAINT fk_prj_request_evaluator FOREIGN KEY (idevaluator) REFERENCES usr_human (idhuman),
    CONSTRAINT fk_prj_request_updatedby FOREIGN KEY (idupdatedby) REFERENCES sec_user (iduser)
);

CREATE TABLE prj_tag (
    idtag UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nmtag VARCHAR(80) NOT NULL,
    strecord INTEGER NOT NULL DEFAULT 1,
    idupdatedby UUID NOT NULL,
    tsupdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_prj_tag_nmtag UNIQUE (nmtag),
    CONSTRAINT ck_prj_tag_strecord CHECK (strecord IN (0, 1)),
    CONSTRAINT fk_prj_tag_updatedby FOREIGN KEY (idupdatedby) REFERENCES sec_user (iduser)
);

CREATE TABLE prj_prjtag (
    idprjtag UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idproject UUID NOT NULL,
    idtag UUID NOT NULL,
    strecord INTEGER NOT NULL DEFAULT 1,
    idupdatedby UUID NOT NULL,
    tsupdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_prj_prjtag_projecttag UNIQUE (idproject, idtag),
    CONSTRAINT ck_prj_prjtag_strecord CHECK (strecord IN (0, 1)),
    CONSTRAINT fk_prj_prjtag_project FOREIGN KEY (idproject) REFERENCES prj_project (idproject),
    CONSTRAINT fk_prj_prjtag_tag FOREIGN KEY (idtag) REFERENCES prj_tag (idtag),
    CONSTRAINT fk_prj_prjtag_updatedby FOREIGN KEY (idupdatedby) REFERENCES sec_user (iduser)
);

CREATE TABLE opp_opp (
    idopp UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idgroup UUID,
    idproject UUID,
    idpublisher UUID NOT NULL,
    nmopp VARCHAR(255) NOT NULL,
    dsopp TEXT NOT NULL,
    tpopp INTEGER NOT NULL,
    stopp INTEGER NOT NULL DEFAULT 1,
    dtdeadline DATE,
    urlapply VARCHAR(500),
    strecord INTEGER NOT NULL DEFAULT 1,
    idupdatedby UUID NOT NULL,
    tsupdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_opp_opp_stopp CHECK (stopp IN (1, 2, 3, 4)),
    CONSTRAINT ck_opp_opp_strecord CHECK (strecord IN (0, 1)),
    CONSTRAINT fk_opp_opp_group FOREIGN KEY (idgroup) REFERENCES grp_group (idgroup),
    CONSTRAINT fk_opp_opp_project FOREIGN KEY (idproject) REFERENCES prj_project (idproject),
    CONSTRAINT fk_opp_opp_publisher FOREIGN KEY (idpublisher) REFERENCES usr_human (idhuman),
    CONSTRAINT fk_opp_opp_updatedby FOREIGN KEY (idupdatedby) REFERENCES sec_user (iduser)
);

CREATE TABLE opp_apply (
    idapply UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idopp UUID NOT NULL,
    idhuman UUID NOT NULL,
    dsmessage VARCHAR(1000),
    stapply INTEGER NOT NULL DEFAULT 1,
    strecord INTEGER NOT NULL DEFAULT 1,
    idupdatedby UUID NOT NULL,
    tsupdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_opp_apply_opphuman UNIQUE (idopp, idhuman),
    CONSTRAINT ck_opp_apply_stapply CHECK (stapply IN (1, 2, 3, 4)),
    CONSTRAINT ck_opp_apply_strecord CHECK (strecord IN (0, 1)),
    CONSTRAINT fk_opp_apply_opp FOREIGN KEY (idopp) REFERENCES opp_opp (idopp),
    CONSTRAINT fk_opp_apply_human FOREIGN KEY (idhuman) REFERENCES usr_human (idhuman),
    CONSTRAINT fk_opp_apply_updatedby FOREIGN KEY (idupdatedby) REFERENCES sec_user (iduser)
);

CREATE INDEX ix_sec_user_idhuman ON sec_user (idhuman);
CREATE INDEX ix_sec_user_idrole ON sec_user (idrole);
CREATE INDEX ix_sec_role_idupdatedby ON sec_role (idupdatedby);
CREATE INDEX ix_usr_human_idupdatedby ON usr_human (idupdatedby);
CREATE INDEX ix_usr_humint_idhuman ON usr_humint (idhuman);
CREATE INDEX ix_usr_humint_idinterest ON usr_humint (idinterest);
CREATE INDEX ix_grp_hummember_idgroup ON grp_hummember (idgroup);
CREATE INDEX ix_grp_hummember_idhuman ON grp_hummember (idhuman);
CREATE INDEX ix_prj_project_idgroup ON prj_project (idgroup);
CREATE INDEX ix_prj_project_idowner ON prj_project (idowner);
CREATE INDEX ix_prj_hummember_idproject ON prj_hummember (idproject);
CREATE INDEX ix_prj_hummember_idhuman ON prj_hummember (idhuman);
CREATE INDEX ix_prj_request_idproject ON prj_request (idproject);
CREATE INDEX ix_prj_request_idhuman ON prj_request (idhuman);
CREATE INDEX ix_prj_prjtag_idproject ON prj_prjtag (idproject);
CREATE INDEX ix_prj_prjtag_idtag ON prj_prjtag (idtag);
CREATE INDEX ix_opp_opp_idgroup ON opp_opp (idgroup);
CREATE INDEX ix_opp_opp_idproject ON opp_opp (idproject);
CREATE INDEX ix_opp_opp_idpublisher ON opp_opp (idpublisher);
CREATE INDEX ix_opp_apply_idopp ON opp_apply (idopp);
CREATE INDEX ix_opp_apply_idhuman ON opp_apply (idhuman);
