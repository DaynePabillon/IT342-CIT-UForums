INSERT INTO `members` (`name`, `email`, `password`, `first_name`, `last_name`, `is_admin`, `created_at`, `updated_at`, `active`)
VALUES ('admin123', 'admin@citforums.com', 'admin123', 'Admin', 'User', true, NOW(), NOW(), true); 

INSERT INTO `members` (`name`, `email`, `password`, `first_name`, `last_name`, `is_admin`, `created_at`, `updated_at`, `active`)
VALUES ('Dayne2', 'dayne2@example.com', 'password123', 'Dayne', 'User', false, NOW(), NOW(), true); 

-- Insert initial forum categories
INSERT INTO `forum_categories` (`name`, `description`) VALUES
('ANNOUNCEMENTS', 'Important announcements and updates'),
('EVENTS', 'Upcoming events and activities'),
('FREEDOM_WALL', 'Share your thoughts and opinions'),
('CONFESSION', 'Anonymous confessions and stories'),
('ACADEMIC', 'Academic discussions and help'),
('GENERAL', 'General discussions and topics'),
('TECHNOLOGY', 'Technology-related discussions'),
('SPORTS', 'Sports and physical activities'),
('ENTERTAINMENT', 'Entertainment and media discussions'); 

-- Delete threads in extra GENERAL forums
DELETE FROM threads WHERE forum_id IN (
    SELECT f.id FROM forums f 
    JOIN forum_categories fc ON f.category_id = fc.id 
    WHERE fc.name = 'GENERAL' 
    AND f.id > (SELECT MIN(f2.id) FROM forums f2 JOIN forum_categories fc2 ON f2.category_id = fc2.id WHERE fc2.name = 'GENERAL')
);

-- Delete extra GENERAL forums
DELETE FROM forums WHERE id IN (
    SELECT f.id FROM forums f 
    JOIN forum_categories fc ON f.category_id = fc.id 
    WHERE fc.name = 'GENERAL' 
    AND f.id > (SELECT MIN(f2.id) FROM forums f2 JOIN forum_categories fc2 ON f2.category_id = fc2.id WHERE fc2.name = 'GENERAL')
); 
 