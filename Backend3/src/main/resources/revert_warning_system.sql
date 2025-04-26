-- Revert warning system changes

-- Check if the warnings table exists and drop it
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'warnings'
    ) THEN
        DROP TABLE warnings;
    END IF;
END
$$;

-- Remove warning and ban related columns from members table
DO $$
BEGIN
    -- Remove warning_count column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'members' AND column_name = 'warning_count'
    ) THEN
        ALTER TABLE members DROP COLUMN warning_count;
    END IF;
    
    -- Remove is_banned column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'members' AND column_name = 'is_banned'
    ) THEN
        ALTER TABLE members DROP COLUMN is_banned;
    END IF;
    
    -- Remove ban_reason column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'members' AND column_name = 'ban_reason'
    ) THEN
        ALTER TABLE members DROP COLUMN ban_reason;
    END IF;
    
    -- Remove banned_at column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'members' AND column_name = 'banned_at'
    ) THEN
        ALTER TABLE members DROP COLUMN banned_at;
    END IF;
    
    -- Remove banned_by_id column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'members' AND column_name = 'banned_by_id'
    ) THEN
        ALTER TABLE members DROP COLUMN banned_by_id;
    END IF;
END
$$;

-- Log the change
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'logs'
    ) THEN
        INSERT INTO logs (log_message, timestamp)
        VALUES ('Reverted warning system: Dropped warnings table and removed warning/ban columns from members table', NOW());
    END IF;
END
$$;
