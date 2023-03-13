-- Script to set up the MySQL database
CREATE DATABASE IF NOT EXISTS card_backend;
CREATE USER IF NOT EXISTS 'card_dev'@'localhost' IDENTIFIED BY 'nairalink';
GRANT ALL PRIVILEGES ON card_backend.* TO 'card_dev'@'localhost';
GRANT SELECT ON performance_schema.* TO 'card_dev'@'localhost';
