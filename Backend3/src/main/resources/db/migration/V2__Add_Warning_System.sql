-- Add new columns as nullable first
ALTER TABLE members ADD COLUMN IF NOT EXISTS warning_count INTEGER;
ALTER TABLE members ADD COLUMN IF NOT EXISTS is_banned BOOLEAN;
ALTER TABLE members ADD COLUMN IF NOT EXISTS ban_reason VARCHAR(255);
ALTER TABLE members ADD COLUMN IF NOT EXISTS banned_until TIMESTAMP;

-- Update existing records with default values
UPDATE members SET warning_count = 0 WHERE warning_count IS NULL;
UPDATE members SET is_banned = false WHERE is_banned IS NULL;

-- Now make the columns non-nullable
ALTER TABLE members ALTER COLUMN warning_count SET NOT NULL;
ALTER TABLE members ALTER COLUMN is_banned SET NOT NULL;

-- Create warnings table
CREATE TABLE IF NOT EXISTS warnings (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL REFERENCES members(id),
    admin_id BIGINT NOT NULL REFERENCES members(id),
    reason VARCHAR(500) NOT NULL,
    content_type VARCHAR(50),
    content_id BIGINT,
    created_at TIMESTAMP NOT NULL,
    acknowledged BOOLEAN NOT NULL DEFAULT false,
    acknowledged_at TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_warnings_member_id ON warnings(member_id);
