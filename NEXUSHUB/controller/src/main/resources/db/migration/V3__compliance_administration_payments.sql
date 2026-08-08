CREATE TABLE adm_audit (
    idaudit UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idactor UUID,
    cdaction VARCHAR(80) NOT NULL,
    nmentity VARCHAR(120) NOT NULL,
    identity VARCHAR(120),
    dsresult VARCHAR(20) NOT NULL,
    dsip VARCHAR(64),
    cdcorrelation VARCHAR(80),
    dsbefore TEXT,
    dsafter TEXT,
    tscreated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_adm_audit_actor FOREIGN KEY (idactor) REFERENCES sec_user (iduser)
);

CREATE TABLE adm_feature (
    idfeature UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cdfeature VARCHAR(100) NOT NULL,
    flenabled BOOLEAN NOT NULL DEFAULT FALSE,
    dsfeature VARCHAR(255),
    tsupdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_adm_feature_code UNIQUE (cdfeature)
);

CREATE TABLE lgp_consent (
    idconsent UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    iduser UUID NOT NULL,
    cdpurpose VARCHAR(80) NOT NULL,
    cdversion VARCHAR(30) NOT NULL,
    flgranted BOOLEAN NOT NULL,
    tscreated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lgp_consent_user FOREIGN KEY (iduser) REFERENCES sec_user (iduser)
);

CREATE TABLE lgp_request (
    idrequest UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    iduser UUID NOT NULL,
    tprequest VARCHAR(20) NOT NULL,
    strequest VARCHAR(20) NOT NULL,
    tscreated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tscompleted TIMESTAMP,
    CONSTRAINT fk_lgp_request_user FOREIGN KEY (iduser) REFERENCES sec_user (iduser)
);

CREATE TABLE pay_product (
    idproduct UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nmproduct VARCHAR(180) NOT NULL,
    dsproduct VARCHAR(500),
    vlprice NUMERIC(12,2) NOT NULL,
    flactive BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE pay_order (
    idorder UUID PRIMARY KEY,
    iduser UUID NOT NULL,
    idproduct UUID NOT NULL,
    vlamount NUMERIC(12,2) NOT NULL,
    storder VARCHAR(30) NOT NULL,
    cdprovider VARCHAR(30) NOT NULL,
    idprovider VARCHAR(120),
    cdidempotency VARCHAR(80) NOT NULL,
    urlcheckout VARCHAR(1000),
    tscreated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tsupdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_pay_order_idempotency UNIQUE (cdidempotency),
    CONSTRAINT fk_pay_order_user FOREIGN KEY (iduser) REFERENCES sec_user (iduser),
    CONSTRAINT fk_pay_order_product FOREIGN KEY (idproduct) REFERENCES pay_product (idproduct)
);

CREATE TABLE pay_webhook (
    idwebhook UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cdprovider VARCHAR(30) NOT NULL,
    idevent VARCHAR(150) NOT NULL,
    idorder UUID,
    dsevent TEXT,
    tsprocessed TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_pay_webhook_event UNIQUE (cdprovider, idevent),
    CONSTRAINT fk_pay_webhook_order FOREIGN KEY (idorder) REFERENCES pay_order (idorder)
);

CREATE INDEX ix_adm_audit_actor ON adm_audit (idactor);
CREATE INDEX ix_adm_audit_created ON adm_audit (tscreated);
CREATE INDEX ix_lgp_request_user ON lgp_request (iduser);
CREATE INDEX ix_pay_order_user ON pay_order (iduser);

INSERT INTO adm_feature (cdfeature, flenabled, dsfeature) VALUES
('payment.enabled', FALSE, 'Habilita pagamentos reais'),
('payment.pix.enabled', FALSE, 'Habilita Pix'),
('admin.audit.enabled', TRUE, 'Habilita consulta administrativa da auditoria'),
('lgpd.export.enabled', TRUE, 'Habilita exportacao de dados pessoais');

INSERT INTO pay_product (nmproduct, dsproduct, vlprice) VALUES
('Apoiador NexusHub', 'Apoie a plataforma e receba o selo de apoiador.', 10.00),
('Kit Acadêmico', 'Kit simbólico da comunidade NexusHub.', 25.00);
