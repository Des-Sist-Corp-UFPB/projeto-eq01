-- V7: Create Marketplace (Lojinha) module tables and alter academic period column types

-- 1. Alter academic period column types to String (VARCHAR(10))
ALTER TABLE usr_human ALTER COLUMN nryingresso TYPE VARCHAR(10);
ALTER TABLE usr_human ALTER COLUMN nyconclusao TYPE VARCHAR(10);

-- 2. Create mkt_shop table
CREATE TABLE mkt_shop (
    idshop UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idowner UUID NOT NULL UNIQUE,
    dsname VARCHAR(100) NOT NULL,
    dsdescription TEXT,
    dslogo TEXT,
    dscampus VARCHAR(50) NOT NULL,
    flactive BOOLEAN NOT NULL DEFAULT TRUE,
    strecord INTEGER NOT NULL DEFAULT 1,
    idupdatedby UUID NOT NULL,
    tsupdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mkt_shop_owner FOREIGN KEY (idowner) REFERENCES usr_human (idhuman) ON DELETE CASCADE,
    CONSTRAINT fk_mkt_shop_updatedby FOREIGN KEY (idupdatedby) REFERENCES sec_user (iduser)
);

-- 3. Create mkt_product table
CREATE TABLE mkt_product (
    idproduct UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idshop UUID,
    idseller UUID NOT NULL,
    dstitle VARCHAR(150) NOT NULL,
    dsdescription TEXT,
    dscategory VARCHAR(50) NOT NULL DEFAULT 'Outros',
    numprice DECIMAL(10, 2) NOT NULL,
    numstock INTEGER NOT NULL DEFAULT 1,
    dsphotos TEXT,
    dspaymentmethods VARCHAR(255) NOT NULL,
    dspixkey VARCHAR(100),
    dsmeetlocations TEXT,
    dscampus VARCHAR(50) NOT NULL,
    flactive BOOLEAN NOT NULL DEFAULT TRUE,
    strecord INTEGER NOT NULL DEFAULT 1,
    idupdatedby UUID NOT NULL,
    tsupdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mkt_product_shop FOREIGN KEY (idshop) REFERENCES mkt_shop (idshop) ON DELETE CASCADE,
    CONSTRAINT fk_mkt_product_seller FOREIGN KEY (idseller) REFERENCES usr_human (idhuman) ON DELETE CASCADE,
    CONSTRAINT fk_mkt_product_updatedby FOREIGN KEY (idupdatedby) REFERENCES sec_user (iduser)
);

-- 4. Create mkt_product_metric table
CREATE TABLE mkt_product_metric (
    idmetric UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idproduct UUID NOT NULL UNIQUE,
    numviews INTEGER NOT NULL DEFAULT 0,
    numclicks INTEGER NOT NULL DEFAULT 0,
    strecord INTEGER NOT NULL DEFAULT 1,
    idupdatedby UUID NOT NULL,
    tsupdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mkt_product_metric_product FOREIGN KEY (idproduct) REFERENCES mkt_product (idproduct) ON DELETE CASCADE,
    CONSTRAINT fk_mkt_product_metric_updatedby FOREIGN KEY (idupdatedby) REFERENCES sec_user (iduser)
);

-- Indexing for performance
CREATE INDEX ix_mkt_shop_owner ON mkt_shop (idowner);
CREATE INDEX ix_mkt_product_shop ON mkt_product (idshop);
CREATE INDEX ix_mkt_product_seller ON mkt_product (idseller);
CREATE INDEX ix_mkt_product_campus ON mkt_product (dscampus);
CREATE INDEX ix_mkt_product_metric_product ON mkt_product_metric (idproduct);
