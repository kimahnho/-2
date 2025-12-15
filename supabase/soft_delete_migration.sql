-- Soft Delete Migration
-- 14일 보관 정책으로 데이터 복구 가능

-- 1. Add deleted_at columns to all relevant tables
ALTER TABLE students ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE schedule_items ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Create indexes for better query performance on soft delete filtering
CREATE INDEX IF NOT EXISTS idx_students_deleted_at ON students(deleted_at);
CREATE INDEX IF NOT EXISTS idx_groups_deleted_at ON groups(deleted_at);
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at);
CREATE INDEX IF NOT EXISTS idx_schedule_items_deleted_at ON schedule_items(deleted_at);

-- 3. Create a function to permanently delete old soft-deleted records (14 days)
CREATE OR REPLACE FUNCTION cleanup_soft_deleted_records()
RETURNS void AS $$
BEGIN
    -- Delete students older than 14 days
    DELETE FROM students 
    WHERE deleted_at IS NOT NULL 
    AND deleted_at < NOW() - INTERVAL '14 days';
    
    -- Delete groups older than 14 days
    DELETE FROM groups 
    WHERE deleted_at IS NOT NULL 
    AND deleted_at < NOW() - INTERVAL '14 days';
    
    -- Delete projects older than 14 days
    DELETE FROM projects 
    WHERE deleted_at IS NOT NULL 
    AND deleted_at < NOW() - INTERVAL '14 days';
    
    -- Delete schedule_items older than 14 days
    DELETE FROM schedule_items 
    WHERE deleted_at IS NOT NULL 
    AND deleted_at < NOW() - INTERVAL '14 days';
END;
$$ LANGUAGE plpgsql;

-- 4. Optional: Create a scheduled job using pg_cron (if extension is enabled)
-- This runs daily at 3 AM to cleanup old records
-- SELECT cron.schedule('cleanup-soft-deleted', '0 3 * * *', 'SELECT cleanup_soft_deleted_records()');

-- 5. Admin helper: View all soft-deleted records
CREATE OR REPLACE VIEW deleted_students AS
SELECT *, 
    deleted_at + INTERVAL '14 days' AS permanent_delete_at,
    EXTRACT(DAY FROM (deleted_at + INTERVAL '14 days' - NOW())) AS days_remaining
FROM students 
WHERE deleted_at IS NOT NULL;

CREATE OR REPLACE VIEW deleted_groups AS
SELECT *, 
    deleted_at + INTERVAL '14 days' AS permanent_delete_at,
    EXTRACT(DAY FROM (deleted_at + INTERVAL '14 days' - NOW())) AS days_remaining
FROM groups 
WHERE deleted_at IS NOT NULL;

CREATE OR REPLACE VIEW deleted_projects AS
SELECT *, 
    deleted_at + INTERVAL '14 days' AS permanent_delete_at,
    EXTRACT(DAY FROM (deleted_at + INTERVAL '14 days' - NOW())) AS days_remaining
FROM projects 
WHERE deleted_at IS NOT NULL;

-- 6. Restore functions for admin use
CREATE OR REPLACE FUNCTION restore_student(student_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE students SET deleted_at = NULL WHERE id = student_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION restore_group(group_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE groups SET deleted_at = NULL WHERE id = group_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION restore_project(project_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE projects SET deleted_at = NULL WHERE id = project_id;
END;
$$ LANGUAGE plpgsql;
