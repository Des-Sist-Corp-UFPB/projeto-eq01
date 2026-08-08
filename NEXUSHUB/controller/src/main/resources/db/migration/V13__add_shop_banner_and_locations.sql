-- V13: Add dsbanner and dsmeetlocations to mkt_shop table
ALTER TABLE mkt_shop ADD COLUMN dsbanner TEXT;
ALTER TABLE mkt_shop ADD COLUMN dsmeetlocations TEXT;
