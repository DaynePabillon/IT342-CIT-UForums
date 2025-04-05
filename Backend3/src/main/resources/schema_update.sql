-- Check if admin column exists and is_admin doesn't
-- If true, we need to rename the column
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'members' AND column_name = 'admin'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'members' AND column_name = 'is_admin'
    ) THEN
        -- Rename admin column to is_admin
        ALTER TABLE members RENAME COLUMN admin TO is_admin;
    END IF;
END
$$;

-- Update password for existing members to use plain text
-- (only run this in development environments)
UPDATE members 
SET password = 'admin123' 
WHERE name = 'admin123';

UPDATE members 
SET password = 'password123' 
WHERE name = 'Dayne2';

-- Log the change
INSERT INTO logs (log_message, timestamp)
VALUES ('Updated schema: Renamed admin column to is_admin and updated passwords to plain text', NOW())
ON CONFLICT DO NOTHING; 