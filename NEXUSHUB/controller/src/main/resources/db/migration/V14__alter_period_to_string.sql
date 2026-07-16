-- V14: Alter human current period (nrperiod) column to VARCHAR(10) to support formats like '2023.1'
ALTER TABLE usr_human ALTER COLUMN nrperiod TYPE VARCHAR(10);
