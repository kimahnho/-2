/**
 * Group Service - 그룹 관리 CRUD
 * @module services/groupService
 */

import { StudentGroup } from '../types';
import { supabase, isSupabaseConfigured, STORAGE_KEYS } from './storageAdapter';
import { v4 as uuidv4 } from 'uuid';

export const groupService = {
    getAllGroups: async (): Promise<StudentGroup[]> => {
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('groups')
                .select('*')
                .is('deleted_at', null)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Failed to load groups from Supabase", error);
                return [];
            }

            return (data || []).map(g => ({
                id: g.id,
                name: g.name,
                studentIds: g.student_ids || [],
                description: g.description,
                color: g.color,
                createdAt: new Date(g.created_at).getTime()
            }));
        }

        try {
            const json = localStorage.getItem(STORAGE_KEYS.GROUP_INDEX);
            if (!json) return [];
            const groups = JSON.parse(json);
            return groups.sort((a: StudentGroup, b: StudentGroup) => b.createdAt - a.createdAt);
        } catch (e) {
            return [];
        }
    },

    createGroup: async (name: string, studentIds: string[], description?: string): Promise<StudentGroup> => {
        const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        if (isSupabaseConfigured() && supabase) {
            // Get current user for RLS
            const { data: { user } } = await supabase.auth.getUser();

            const { data, error } = await supabase
                .from('groups')
                .insert({
                    name,
                    student_ids: studentIds,
                    description,
                    color: randomColor,
                    user_id: user?.id // Required for RLS
                })
                .select()
                .single();

            if (error) {
                console.error("Failed to create group in Supabase", error);
                throw error;
            }

            return {
                id: data.id,
                name: data.name,
                studentIds: data.student_ids || [],
                description: data.description,
                color: data.color,
                createdAt: new Date(data.created_at).getTime()
            };
        }

        const id = uuidv4();
        const newGroup: StudentGroup = {
            id,
            name,
            studentIds,
            description,
            color: randomColor,
            createdAt: Date.now()
        };

        const groups = await groupService.getAllGroups();
        localStorage.setItem(STORAGE_KEYS.GROUP_INDEX, JSON.stringify([newGroup, ...groups]));
        return newGroup;
    },

    deleteGroup: async (id: string): Promise<void> => {
        // Note: Cross-service dependencies (schedule, projects) 
        // are handled by storageService for backward compatibility
        if (isSupabaseConfigured() && supabase) {
            const { error } = await supabase.from('groups').update({ deleted_at: new Date().toISOString() }).eq('id', id);
            if (error) console.error("Failed to delete group", error);
            return;
        }

        const groups = await groupService.getAllGroups();
        const filtered = groups.filter(g => g.id !== id);
        localStorage.setItem(STORAGE_KEYS.GROUP_INDEX, JSON.stringify(filtered));
    },

    updateGroup: async (id: string, updates: Partial<Omit<StudentGroup, 'id' | 'createdAt'>>): Promise<void> => {
        if (isSupabaseConfigured() && supabase) {
            const supabaseUpdates: Record<string, unknown> = {};
            if (updates.name !== undefined) supabaseUpdates.name = updates.name;
            if (updates.studentIds !== undefined) supabaseUpdates.student_ids = updates.studentIds;
            if (updates.description !== undefined) supabaseUpdates.description = updates.description;
            if (updates.color !== undefined) supabaseUpdates.color = updates.color;

            const { error } = await supabase.from('groups').update(supabaseUpdates).eq('id', id);
            if (error) console.error("Failed to update group", error);
            return;
        }

        const groups = await groupService.getAllGroups();
        const updatedGroups = groups.map(g => g.id === id ? { ...g, ...updates } : g);
        localStorage.setItem(STORAGE_KEYS.GROUP_INDEX, JSON.stringify(updatedGroups));
    },

    removeStudentFromAllGroups: async (studentId: string): Promise<void> => {
        if (isSupabaseConfigured() && supabase) {
            const { data: groups } = await supabase.from('groups').select('*');
            if (groups) {
                for (const group of groups) {
                    if (group.student_ids?.includes(studentId)) {
                        const updatedIds = group.student_ids.filter((sid: string) => sid !== studentId);
                        await supabase.from('groups').update({ student_ids: updatedIds }).eq('id', group.id);
                    }
                }
            }
            return;
        }

        const groups = await groupService.getAllGroups();
        const updatedGroups = groups.map(g => ({
            ...g,
            studentIds: g.studentIds.filter(sid => sid !== studentId)
        }));
        localStorage.setItem(STORAGE_KEYS.GROUP_INDEX, JSON.stringify(updatedGroups));
    }
};
