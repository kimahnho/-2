-- ============================================
-- Security Definer View 보안 문제 수정
-- ============================================
-- 
-- 문제: deleted_* 뷰들이 SECURITY DEFINER로 생성되어
-- 쿼리하는 사용자가 아닌 뷰 생성자의 RLS 정책이 적용됨
-- 
-- 해결: SECURITY INVOKER로 재생성하여 
-- 각 사용자의 RLS 정책이 올바르게 적용되도록 함
-- ============================================

-- 기존 뷰 삭제
DROP VIEW IF EXISTS deleted_students;
DROP VIEW IF EXISTS deleted_groups;
DROP VIEW IF EXISTS deleted_projects;

-- SECURITY INVOKER로 뷰 재생성
-- (PostgreSQL 15+ 기본값이지만 명시적으로 지정)

CREATE VIEW deleted_students 
WITH (security_invoker = true) AS
SELECT *, 
    deleted_at + INTERVAL '14 days' AS permanent_delete_at,
    EXTRACT(DAY FROM (deleted_at + INTERVAL '14 days' - NOW())) AS days_remaining
FROM students 
WHERE deleted_at IS NOT NULL;

CREATE VIEW deleted_groups 
WITH (security_invoker = true) AS
SELECT *, 
    deleted_at + INTERVAL '14 days' AS permanent_delete_at,
    EXTRACT(DAY FROM (deleted_at + INTERVAL '14 days' - NOW())) AS days_remaining
FROM groups 
WHERE deleted_at IS NOT NULL;

CREATE VIEW deleted_projects 
WITH (security_invoker = true) AS
SELECT *, 
    deleted_at + INTERVAL '14 days' AS permanent_delete_at,
    EXTRACT(DAY FROM (deleted_at + INTERVAL '14 days' - NOW())) AS days_remaining
FROM projects 
WHERE deleted_at IS NOT NULL;

-- ============================================
-- 완료! Supabase Dashboard > SQL Editor에서 실행하세요
-- ============================================
