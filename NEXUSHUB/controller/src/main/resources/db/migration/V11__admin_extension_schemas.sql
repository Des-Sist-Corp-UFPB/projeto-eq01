CREATE TABLE adm_report_ticket (
    idticket UUID PRIMARY KEY,
    cdtarget_type VARCHAR(30) NOT NULL,
    idtarget UUID NOT NULL,
    dsreason VARCHAR(500) NOT NULL,
    dsstatus VARCHAR(20) NOT NULL,
    tscreated TIMESTAMP NOT NULL,
    idmoderator UUID
);

CREATE TABLE adm_banned_word (
    idword UUID PRIMARY KEY,
    nmword VARCHAR(100) NOT NULL UNIQUE,
    tscreated TIMESTAMP NOT NULL
);

CREATE TABLE adm_badge (
    idbadge UUID PRIMARY KEY,
    nmname VARCHAR(100) NOT NULL,
    dsdescription VARCHAR(250) NOT NULL,
    dsicon_url VARCHAR(250),
    nminput_rule VARCHAR(100),
    nixp_bonus INTEGER NOT NULL,
    tscreated TIMESTAMP NOT NULL
);

CREATE TABLE adm_xp_rule (
    idrule UUID PRIMARY KEY,
    cdaction_key VARCHAR(50) NOT NULL UNIQUE,
    nixp_value INTEGER NOT NULL
);

CREATE TABLE prv_lgpd_request (
    idrequest UUID PRIMARY KEY,
    iduser UUID NOT NULL,
    cdrequest_type VARCHAR(30) NOT NULL,
    dsstatus VARCHAR(20) NOT NULL,
    txpayload TEXT,
    tscreated TIMESTAMP NOT NULL
);

-- Seed some default banned words and XP rules
INSERT INTO adm_banned_word (idword, nmword, tscreated) VALUES 
('11111111-1111-1111-1111-111111111111', 'trapaça', CURRENT_TIMESTAMP),
('22222222-2222-2222-2222-222222222222', 'plágio', CURRENT_TIMESTAMP);

INSERT INTO adm_xp_rule (idrule, cdaction_key, nixp_value) VALUES 
('33333333-3333-3333-3333-333333333333', 'CREATE_PROJECT', 50),
('44444444-4444-4444-4444-444444444444', 'JOIN_PROJECT', 20),
('55555555-5555-5555-5555-555555555555', 'CREATE_POST', 10);
