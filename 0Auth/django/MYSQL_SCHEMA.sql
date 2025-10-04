-- MySQL Database Schema for Django OAuth Authentication
-- Run this script to create the database and tables manually if needed

-- Create database
CREATE DATABASE IF NOT EXISTS oauth_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE oauth_db;

-- Create user (optional, for dedicated database user)
CREATE USER IF NOT EXISTS 'oauth_user'@'localhost' 
IDENTIFIED BY 'oauth_password123';

-- Grant privileges
GRANT ALL PRIVILEGES ON oauth_db.* TO 'oauth_user'@'localhost';
FLUSH PRIVILEGES;

-- Note: Django will create the actual tables through migrations
-- This script only sets up the database and user

-- Expected tables after Django migrations:
-- 
-- users (custom user model)
-- oauth_accounts (OAuth provider accounts)
-- user_profiles (extended user profiles)
-- auth_group, auth_permission, auth_user_user_permissions, auth_user_groups
-- django_content_type, django_session
-- account_emailaddress, account_emailconfirmation
-- socialaccount_socialapp, socialaccount_socialaccount, socialaccount_socialtoken
-- sites_site
-- admin_logentry
-- sessions_session

-- To verify tables after migrations:
-- SHOW TABLES;

-- To check table structure:
-- DESCRIBE users;
-- DESCRIBE oauth_accounts;
-- DESCRIBE user_profiles;
