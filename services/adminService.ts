/**
 * Admin Service - 관리자 전용 자료 관리
 * @module services/adminService
 */

import { supabase, isSupabaseConfigured } from './storageAdapter';

export interface AdminResource {
    id: string;
    title: string;
    elements: any[];
    pages: any[];
    thumbnail?: string;
    previewElements?: any[];
    submittedBy: string;
    submittedAt: string;
    originalProjectId?: string;
    status: 'pending' | 'approved' | 'rejected';
    adminNotes?: string;
    reviewedBy?: string;
    reviewedAt?: string;
}

export interface SubmitterInfo {
    id: string;
    email?: string;
    name?: string;
}

export const adminService = {
    /**
     * 현재 사용자가 관리자인지 확인
     */
    isAdmin: async (): Promise<boolean> => {
        if (!isSupabaseConfigured() || !supabase) {
            return false;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        return (
            user.user_metadata?.is_admin === true ||
            user.app_metadata?.is_admin === true
        );
    },

    /**
     * 모든 프로젝트 조회 (관리자 전용)
     * projects 테이블에서 모든 사용자의 프로젝트를 가져옴
     */
    getAllProjects: async (): Promise<AdminResource[]> => {
        if (!isSupabaseConfigured() || !supabase) {
            return [];
        }

        // RLS를 우회하는 SECURITY DEFINER 함수 호출 (관리자만 사용 가능)
        const { data, error } = await supabase.rpc('get_all_projects_admin');

        if (error) {
            console.error('Failed to fetch all projects:', error);
            return [];
        }

        return (data || []).map((p: any) => ({
            id: p.id,
            title: p.title,
            elements: [],
            pages: [],
            thumbnail: p.thumbnail,
            previewElements: p.preview_elements,
            submittedBy: p.user_id,
            submittedAt: p.created_at,
            status: 'approved' as const,
            adminNotes: undefined,
            reviewedBy: undefined,
            reviewedAt: undefined
        }));
    },

    /**
     * 모든 유저 정보와 프로젝트 수 조회 (관리자 전용)
     * SQL 함수 get_all_users_with_projects 호출
     */
    getUsersWithProjects: async (): Promise<{
        userId: string;
        email: string;
        displayName: string;
        avatarUrl?: string;
        provider: string;
        projectCount: number;
    }[]> => {
        if (!isSupabaseConfigured() || !supabase) {
            return [];
        }

        const { data, error } = await supabase.rpc('get_all_users_with_projects');

        if (error) {
            console.error('Failed to fetch users with projects:', error);
            // Fallback: 기존 방식 사용
            return adminService.getProjectCountByUserFallback();
        }

        return (data || []).map((u: any) => ({
            userId: u.user_id,
            email: u.email || '',
            displayName: u.display_name || u.email?.split('@')[0] || 'Unknown',
            avatarUrl: u.avatar_url,
            provider: u.provider || 'email',
            projectCount: Number(u.project_count) || 0
        }));
    },

    /**
     * 폴백: SQL 함수가 없을 경우 기존 방식 사용
     */
    getProjectCountByUserFallback: async (): Promise<{
        userId: string;
        email: string;
        displayName: string;
        avatarUrl?: string;
        provider: string;
        projectCount: number;
    }[]> => {
        if (!isSupabaseConfigured() || !supabase) {
            return [];
        }

        const { data, error } = await supabase
            .from('projects')
            .select('user_id')
            .is('deleted_at', null);

        if (error) {
            console.error('Failed to fetch project counts:', error);
            return [];
        }

        const counts = (data || []).reduce((acc, p) => {
            if (p.user_id) {
                acc[p.user_id] = (acc[p.user_id] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts).map(([userId, count]) => ({
            userId,
            email: '',
            displayName: userId.slice(0, 8) + '...',
            provider: 'unknown',
            projectCount: count
        }));
    },

    /**
     * 특정 유저의 프로젝트만 조회
     */
    getProjectsByUser: async (userId: string): Promise<AdminResource[]> => {
        if (!isSupabaseConfigured() || !supabase) {
            return [];
        }

        const { data, error } = await supabase
            .from('projects')
            .select('id, title, thumbnail, preview_elements, user_id, created_at, updated_at')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Failed to fetch user projects:', error);
            return [];
        }

        return (data || []).map(p => ({
            id: p.id,
            title: p.title,
            elements: [],
            pages: [],
            thumbnail: p.thumbnail,
            previewElements: p.preview_elements,
            submittedBy: p.user_id,
            submittedAt: p.created_at,
            status: 'approved' as const,
            adminNotes: undefined,
            reviewedBy: undefined,
            reviewedAt: undefined
        }));
    },

    /**
     * 프로젝트 상세 데이터 조회 (다운로드용)
     */
    getProjectData: async (projectId: string): Promise<{ elements: any[]; pages: any[] } | null> => {
        if (!isSupabaseConfigured() || !supabase) {
            return null;
        }

        const { data, error } = await supabase
            .from('projects')
            .select('elements, pages')
            .eq('id', projectId)
            .single();

        if (error) {
            console.error('Failed to fetch project data:', error);
            return null;
        }

        return {
            elements: data?.elements || [],
            pages: data?.pages || []
        };
    },

    /**
     * 내가 제출한 자료 조회 (일반 사용자)
     */
    getMySubmissions: async (): Promise<AdminResource[]> => {
        if (!isSupabaseConfigured() || !supabase) {
            return [];
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('admin_resources')
            .select('*')
            .eq('submitted_by', user.id)
            .order('submitted_at', { ascending: false });

        if (error) {
            console.error('Failed to fetch my submissions:', error);
            return [];
        }

        return (data || []).map(r => ({
            id: r.id,
            title: r.title,
            elements: r.elements || [],
            pages: r.pages || [],
            thumbnail: r.thumbnail,
            previewElements: r.preview_elements,
            submittedBy: r.submitted_by,
            submittedAt: r.submitted_at,
            originalProjectId: r.original_project_id,
            status: r.status,
            adminNotes: r.admin_notes,
            reviewedBy: r.reviewed_by,
            reviewedAt: r.reviewed_at
        }));
    },

    /**
     * 자료 제출 (일반 사용자)
     */
    submitResource: async (
        title: string,
        elements: any[],
        pages: any[],
        thumbnail?: string,
        originalProjectId?: string
    ): Promise<string | null> => {
        if (!isSupabaseConfigured() || !supabase) {
            throw new Error('Supabase is not configured');
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
            .from('admin_resources')
            .insert({
                title,
                elements,
                pages,
                thumbnail,
                original_project_id: originalProjectId,
                submitted_by: user.id,
                status: 'pending'
            })
            .select('id')
            .single();

        if (error) {
            console.error('Failed to submit resource:', error);
            throw error;
        }

        return data?.id || null;
    },

    /**
     * 자료 상태 업데이트 (관리자 전용)
     */
    updateResourceStatus: async (
        resourceId: string,
        status: 'approved' | 'rejected',
        adminNotes?: string
    ): Promise<void> => {
        if (!isSupabaseConfigured() || !supabase) {
            throw new Error('Supabase is not configured');
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        const { error } = await supabase
            .from('admin_resources')
            .update({
                status,
                admin_notes: adminNotes,
                reviewed_by: user.id,
                reviewed_at: new Date().toISOString()
            })
            .eq('id', resourceId);

        if (error) {
            console.error('Failed to update resource status:', error);
            throw error;
        }
    },

    /**
     * 자료 삭제 (관리자 전용)
     */
    deleteResource: async (resourceId: string): Promise<void> => {
        if (!isSupabaseConfigured() || !supabase) {
            throw new Error('Supabase is not configured');
        }

        const { error } = await supabase
            .from('admin_resources')
            .delete()
            .eq('id', resourceId);

        if (error) {
            console.error('Failed to delete resource:', error);
            throw error;
        }
    },

    /**
     * 제출자 정보 조회 (관리자 전용)
     */
    getSubmitterInfo: async (userId: string): Promise<SubmitterInfo | null> => {
        if (!isSupabaseConfigured() || !supabase) {
            return null;
        }

        return {
            id: userId,
            email: undefined,
            name: undefined
        };
    },

    /**
     * 모든 학습자 조회 (관리자 전용)
     */
    getAllStudents: async (): Promise<{
        id: string;
        name: string;
        birthYear?: number;
        notes?: string;
        userId: string;
        createdAt: string;
    }[]> => {
        if (!isSupabaseConfigured() || !supabase) {
            return [];
        }

        const { data, error } = await supabase
            .from('students')
            .select('*')
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Failed to fetch all students:', error);
            return [];
        }

        return (data || []).map(s => ({
            id: s.id,
            name: s.name,
            birthYear: s.birth_year,
            notes: s.notes,
            userId: s.user_id,
            createdAt: s.created_at
        }));
    },

    /**
     * 모든 그룹 조회 (관리자 전용)
     */
    getAllGroups: async (): Promise<{
        id: string;
        name: string;
        description?: string;
        memberCount?: number;
        userId: string;
        createdAt: string;
    }[]> => {
        if (!isSupabaseConfigured() || !supabase) {
            return [];
        }

        const { data, error } = await supabase
            .from('groups')
            .select('*')
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Failed to fetch all groups:', error);
            return [];
        }

        return (data || []).map(g => ({
            id: g.id,
            name: g.name,
            description: g.description,
            memberCount: g.member_count,
            userId: g.user_id,
            createdAt: g.created_at
        }));
    }
};
