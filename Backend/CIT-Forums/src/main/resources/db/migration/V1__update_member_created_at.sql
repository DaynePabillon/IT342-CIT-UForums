-- Update any existing members that have NULL or invalid created_at values
UPDATE members 
SET created_at = NOW() 
WHERE created_at IS NULL OR created_at = '0000-00-00 00:00:00'; 