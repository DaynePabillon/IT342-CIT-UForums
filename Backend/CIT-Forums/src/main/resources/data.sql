INSERT IGNORE INTO member (name, email, password, first_name, last_name, admin, created_at, updated_at, active)
VALUES ('admin123', 'admin@citforums.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Admin', 'User', true, NOW(), NOW(), true); 
 