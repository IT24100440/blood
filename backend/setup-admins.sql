-- Create default admin accounts if they don't exist
INSERT INTO admins (full_name, email, password, role, created_at) 
VALUES ('Default Admin', 'admin@blood.com', 'Admin@123', 'Admin', NOW())
ON DUPLICATE KEY UPDATE admin_id = admin_id;

INSERT INTO admins (full_name, email, password, role, created_at) 
VALUES ('Test Admin', 'admin@test.com', 'password123', 'Admin', NOW())
ON DUPLICATE KEY UPDATE admin_id = admin_id;
