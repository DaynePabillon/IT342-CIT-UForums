-- Update password for Dayne2 user to 'password123' (BCrypt hash)
UPDATE members 
SET password = '$2a$10$PrI5Gk9L.tSZiW9FXhTS8O8Mz9E97k2FZbFvGFFaSsiTUIl.TCrFu'
WHERE email = 'dayne2@example.com'; 