-- V16: Add payment methods and pix key to mkt_shop table
ALTER TABLE mkt_shop ADD COLUMN dspaymentmethods VARCHAR(100);
ALTER TABLE mkt_shop ADD COLUMN dspixkey VARCHAR(255);
