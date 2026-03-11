-- Fix admin user role: set role to 'admin' for the admin user
-- Run this in your MySQL/MariaDB to enable admin dashboard and members page
UPDATE users SET role = 'admin' WHERE username = 'admin';
