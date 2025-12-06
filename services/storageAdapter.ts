/**
 * Storage Adapter - Supabase/localStorage 공통 분기 로직
 * @module services/storageAdapter
 */

import { supabase, isSupabaseConfigured as checkSupabase } from './supabaseClient';

export { supabase };
export const isSupabaseConfigured = checkSupabase;

// localStorage 키 상수
export const STORAGE_KEYS = {
    PROJECT_INDEX: 'muru_projects_index',
    PROJECT_DATA_PREFIX: 'muru_project_',
    STUDENT_INDEX: 'muru_students_index',
    GROUP_INDEX: 'muru_groups_index',
    SCHEDULE_INDEX: 'muru_schedule_index',
} as const;
