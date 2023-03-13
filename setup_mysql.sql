-- Script to set up the MySQL database
CREATE DATABASE IF NOT EXISTS virtual_cards;
CREATE USER IF NOT EXISTS 'card_dev'@'localhost' IDENTIFIED BY 'nairalink';
GRANT ALL PRIVILEGES ON virtual_cards.* TO 'card_dev'@'localhost';
GRANT SELECT ON performance_schema.* TO 'card_dev'@'localhost';
