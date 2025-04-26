-- Create warnings table to track user warnings
CREATE TABLE IF NOT EXISTS warnings (
    id SERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL,
    warned_by_id BIGINT NOT NULL,
    reason TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (warned_by_id) REFERENCES members(id) ON DELETE SET NULL
);

-- Add warning_count column to members table
ALTER TABLE members
ADD COLUMN IF NOT EXISTS warning_count INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ban_reason TEXT,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS banned_by_id BIGINT,
ADD CONSTRAINT fk_banned_by FOREIGN KEY (banned_by_id) REFERENCES members(id) ON DELETE SET NULL;

-- Create function to automatically ban users after 3 warnings
CREATE OR REPLACE FUNCTION auto_ban_after_warnings()
RETURNS TRIGGER AS $$
BEGIN
    -- If warning count reaches 3, ban the user
    IF NEW.warning_count >= 3 AND NOT NEW.is_banned THEN
        NEW.is_banned := TRUE;
        NEW.ban_reason := 'Automatically banned after receiving 3 warnings';
        NEW.banned_at := NOW();
        -- banned_by_id remains NULL for auto-bans
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to execute the function when warning_count is updated
CREATE TRIGGER trigger_auto_ban_after_warnings
BEFORE UPDATE ON members
FOR EACH ROW
WHEN (OLD.warning_count IS DISTINCT FROM NEW.warning_count)
EXECUTE FUNCTION auto_ban_after_warnings();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_warnings_member_id ON warnings(member_id);
CREATE INDEX IF NOT EXISTS idx_members_warning_count ON members(warning_count);
CREATE INDEX IF NOT EXISTS idx_members_is_banned ON members(is_banned);
