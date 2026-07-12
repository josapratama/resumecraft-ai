-- Grant full privileges to cv_user on cv_builder database
-- This runs automatically on first container startup
GRANT ALL PRIVILEGES ON cv_builder.* TO 'cv_user'@'%';
FLUSH PRIVILEGES;
