/**
 * Student Service - 학생 관리 CRUD
 * @module services/studentService
 */

import { StudentProfile } from '../types';
import { supabase, isSupabaseConfigured, STORAGE_KEYS } from './storageAdapter';
import { v4 as uuidv4 } from 'uuid';

export const studentService = {
    getAllStudents: async (): Promise<StudentProfile[]> => {
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .is('deleted_at', null)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Failed to load students from Supabase", error);
                return [];
            }

            return (data || []).map(s => ({
                id: s.id,
                name: s.name,
                birthYear: s.birth_year,
                notes: s.notes,
                avatarColor: s.avatar_color,
                createdAt: new Date(s.created_at).getTime()
            }));
        }

        // localStorage fallback
        try {
            const json = localStorage.getItem(STORAGE_KEYS.STUDENT_INDEX);
            if (!json) return [];
            const students = JSON.parse(json);
            return students.sort((a: StudentProfile, b: StudentProfile) => b.createdAt - a.createdAt);
        } catch (e) {
            console.error("Failed to load students", e);
            return [];
        }
    },

    createStudent: async (name: string, birthYear?: string, notes?: string): Promise<StudentProfile> => {
        const colors = ['#5500FF', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#d946ef'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const yearNum = birthYear ? parseInt(birthYear) : undefined;

        if (isSupabaseConfigured() && supabase) {
            // Get current user for RLS
            const { data: { user } } = await supabase.auth.getUser();

            const { data, error } = await supabase
                .from('students')
                .insert({
                    name,
                    birth_year: yearNum,
                    notes,
                    avatar_color: randomColor,
                    user_id: user?.id // Required for RLS
                })
                .select()
                .single();

            if (error) {
                console.error("Failed to create student in Supabase", error);
                throw error;
            }

            return {
                id: data.id,
                name: data.name,
                birthYear: data.birth_year,
                notes: data.notes,
                avatarColor: data.avatar_color,
                createdAt: new Date(data.created_at).getTime()
            };
        }

        // localStorage fallback
        const id = uuidv4();
        const newStudent: StudentProfile = {
            id,
            name,
            birthYear: yearNum,
            notes,
            avatarColor: randomColor,
            createdAt: Date.now()
        };

        const students = await studentService.getAllStudents();
        localStorage.setItem(STORAGE_KEYS.STUDENT_INDEX, JSON.stringify([newStudent, ...students]));
        return newStudent;
    },

    deleteStudent: async (id: string): Promise<void> => {
        // Note: Cross-service dependencies (groups, schedule, projects) 
        // are handled by storageService for backward compatibility
        if (isSupabaseConfigured() && supabase) {
            const { error } = await supabase.from('students').update({ deleted_at: new Date().toISOString() }).eq('id', id);
            if (error) console.error("Failed to delete student", error);
            return;
        }

        // localStorage fallback
        const students = await studentService.getAllStudents();
        const filtered = students.filter(s => s.id !== id);
        localStorage.setItem(STORAGE_KEYS.STUDENT_INDEX, JSON.stringify(filtered));
    },

    updateStudent: async (id: string, updates: Partial<Omit<StudentProfile, 'id' | 'createdAt'>>): Promise<void> => {
        if (isSupabaseConfigured() && supabase) {
            const supabaseUpdates: Record<string, unknown> = {};
            if (updates.name !== undefined) supabaseUpdates.name = updates.name;
            if (updates.birthYear !== undefined) supabaseUpdates.birth_year = updates.birthYear;
            if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes;
            if (updates.avatarColor !== undefined) supabaseUpdates.avatar_color = updates.avatarColor;

            const { error } = await supabase.from('students').update(supabaseUpdates).eq('id', id);
            if (error) console.error("Failed to update student", error);
            return;
        }

        // localStorage fallback
        const students = await studentService.getAllStudents();
        const updatedStudents = students.map(s => s.id === id ? { ...s, ...updates } : s);
        localStorage.setItem(STORAGE_KEYS.STUDENT_INDEX, JSON.stringify(updatedStudents));
    }
};
