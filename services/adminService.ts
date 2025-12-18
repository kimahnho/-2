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
     * 모든 제출된 자료 조회 (관리자 전용)
     */
    getAllResources: async (status?: string): Promise<AdminResource[]> => {
        if (!isSupabaseConfigured() || !supabase) {
            return [];
        }

        let query = supabase
            .from('admin_resources')
            .select('*')
            .order('submitted_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Failed to fetch admin resources:', error);
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

        // Note: This requires admin or service role access
        // For now, just return the userId
        return {
            id: userId,
            email: undefined,
            name: undefined
        };
    }
};
