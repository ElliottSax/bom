-- PostgreSQL production security initialization
-- Run as postgres superuser during container initialization

-- Create application user with limited privileges
CREATE USER bom_user WITH PASSWORD 'AUg70iapRWTq3DGqGbg662W7rikJdMXm4gJDAoaP07M=';

-- Create database
CREATE DATABASE bom_production OWNER bom_user;

-- Connect to the application database
\c bom_production;

-- Revoke default permissions
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON DATABASE bom_production FROM PUBLIC;

-- Grant necessary permissions to application user
GRANT CONNECT ON DATABASE bom_production TO bom_user;
GRANT USAGE ON SCHEMA public TO bom_user;
GRANT CREATE ON SCHEMA public TO bom_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO bom_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO bom_user;

-- Security settings
-- Log only DDL and modifications to avoid logging sensitive data (passwords, PII)
ALTER SYSTEM SET log_statement = 'mod';
ALTER SYSTEM SET log_duration = 'on';
ALTER SYSTEM SET log_connections = 'on';
ALTER SYSTEM SET log_disconnections = 'on';
ALTER SYSTEM SET log_lock_waits = 'on';
ALTER SYSTEM SET log_min_duration_statement = '1000'; -- Log slow queries (>1s)

-- Performance and connection limits
ALTER SYSTEM SET max_connections = '100';
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET random_page_cost = '1.1';

-- Reload configuration
SELECT pg_reload_conf();