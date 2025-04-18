-- SQL script to update the foreign key constraint in the reports table

-- First, drop the existing foreign key constraint
ALTER TABLE reports
DROP FOREIGN KEY FKd3qiw2om5d2oh5xb7fbdcq225;

-- Then, add a new foreign key constraint that references the members table
ALTER TABLE reports
ADD CONSTRAINT FK_reports_members
FOREIGN KEY (reporter_id) REFERENCES members(id);

-- Also update the resolver_id foreign key if it exists
ALTER TABLE reports
DROP FOREIGN KEY FKnrpbvueuiw8c3esc3y0xtlyhx;

ALTER TABLE reports
ADD CONSTRAINT FK_reports_members_resolver
FOREIGN KEY (resolver_id) REFERENCES members(id);
