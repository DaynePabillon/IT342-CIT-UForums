-- Delete threads in duplicate forums
DELETE FROM threads WHERE forum_id IN (
    SELECT f.id FROM forums f 
    WHERE f.id NOT IN (
        SELECT MIN(f2.id) 
        FROM forums f2 
        GROUP BY f2.title
    )
);

-- Delete duplicate forums
DELETE FROM forums WHERE id NOT IN (
    SELECT MIN(f2.id) 
    FROM forums f2 
    GROUP BY f2.title
); 