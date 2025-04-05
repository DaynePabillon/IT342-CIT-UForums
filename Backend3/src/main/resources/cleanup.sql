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