-- Check if admin column exists
SET @adminExists = (
    SELECT COUNT(*)
    FROM information_schema.columns 
    WHERE table_name = 'members' 
    AND column_name = 'admin'
    AND table_schema = DATABASE()
);

-- Check if is_admin column exists
SET @isAdminExists = (
    SELECT COUNT(*)
    FROM information_schema.columns 
    WHERE table_name = 'members' 
    AND column_name = 'is_admin'
    AND table_schema = DATABASE()
);

-- If admin exists but is_admin doesn't, rename the column
SET @sql = IF(
    @adminExists > 0 AND @isAdminExists = 0,
    'ALTER TABLE members CHANGE COLUMN admin is_admin BOOLEAN',
    IF(
        @adminExists = 0 AND @isAdminExists = 0,
        'ALTER TABLE members ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE',
        'SELECT "Column already exists or other condition"'
    )
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing passwords to plain text if needed
UPDATE members SET password = 'admin123' WHERE name = 'admin123';
UPDATE members SET password = 'password123' WHERE name = 'Dayne2'; 