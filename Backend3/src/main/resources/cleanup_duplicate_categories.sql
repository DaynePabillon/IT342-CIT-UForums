-- First, delete forums associated with duplicate categories
DELETE FROM forums 
WHERE category_id IN (
    SELECT id FROM (
        SELECT id, name, 
               ROW_NUMBER() OVER (PARTITION BY name ORDER BY id) as rn
        FROM forum_categories
    ) t 
    WHERE rn > 1
);

-- Then delete the duplicate categories, keeping only the one with the lowest ID
DELETE FROM forum_categories 
WHERE id IN (
    SELECT id FROM (
        SELECT id, name, 
               ROW_NUMBER() OVER (PARTITION BY name ORDER BY id) as rn
        FROM forum_categories
    ) t 
    WHERE rn > 1
); 