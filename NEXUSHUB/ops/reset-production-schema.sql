-- NEXUSHUB / EQ01 - Production schema reset
--
-- WARNING:
-- This script is destructive. It removes every table, sequence, view,
-- function and Flyway history entry from the public schema.
--
-- Use only when the production/homologation database has no real data
-- to preserve. After running it, restart the backend so Flyway recreates
-- the database from controller/src/main/resources/db/migration/V1__init_schema.sql.

\set ON_ERROR_STOP on

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public AUTHORIZATION eq01;

GRANT ALL ON SCHEMA public TO eq01;
GRANT ALL ON SCHEMA public TO public;

COMMENT ON SCHEMA public IS 'standard public schema reset for EQ01/NEXUSHUB';
