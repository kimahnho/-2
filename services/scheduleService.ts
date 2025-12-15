/**
 * Schedule Service - 스케줄 관리 CRUD
 * @module services/scheduleService
 */

import { ScheduleItem } from '../types';
import { supabase, isSupabaseConfigured, STORAGE_KEYS } from './storageAdapter';
import { v4 as uuidv4 } from 'uuid';

export const scheduleService = {
    getAllScheduleItems: async (): Promise<ScheduleItem[]> => {
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase.from('schedule_items').select('*').is('deleted_at', null);
            if (error) {
                console.error("Failed to load schedule items", error);
                return [];
            }

            return (data || []).map(s => ({
                id: s.id,
                day: s.day,
                date: s.date,
                time: s.time,
                subject: s.subject,
                targetId: s.target_id,
                targetType: s.target_type
            }));
        }

        try {
            const json = localStorage.getItem(STORAGE_KEYS.SCHEDULE_INDEX);
            if (!json) return [];
            return JSON.parse(json);
        } catch (e) {
            return [];
        }
    },

    addScheduleItem: async (item: Omit<ScheduleItem, 'id'>): Promise<ScheduleItem> => {
        if (isSupabaseConfigured() && supabase) {
            // Get current user for RLS
            const { data: { user } } = await supabase.auth.getUser();

            const { data, error } = await supabase
                .from('schedule_items')
                .insert({
                    day: item.day,
                    date: item.date,
                    time: item.time,
                    subject: item.subject,
                    target_id: item.targetId,
                    target_type: item.targetType,
                    user_id: user?.id // Required for RLS
                })
                .select()
                .single();

            if (error) {
                console.error("Failed to add schedule item", error);
                throw error;
            }

            return {
                id: data.id,
                day: data.day,
                date: data.date,
                time: data.time,
                subject: data.subject,
                targetId: data.target_id,
                targetType: data.target_type
            };
        }

        const id = uuidv4();
        const newItem = { ...item, id };
        const items = await scheduleService.getAllScheduleItems();
        localStorage.setItem(STORAGE_KEYS.SCHEDULE_INDEX, JSON.stringify([...items, newItem]));
        return newItem;
    },

    updateScheduleItem: async (id: string, updates: Partial<ScheduleItem>): Promise<void> => {
        if (isSupabaseConfigured() && supabase) {
            const supabaseUpdates: Record<string, unknown> = {};
            if (updates.day !== undefined) supabaseUpdates.day = updates.day;
            if (updates.date !== undefined) supabaseUpdates.date = updates.date;
            if (updates.time !== undefined) supabaseUpdates.time = updates.time;
            if (updates.subject !== undefined) supabaseUpdates.subject = updates.subject;
            if (updates.targetId !== undefined) supabaseUpdates.target_id = updates.targetId;
            if (updates.targetType !== undefined) supabaseUpdates.target_type = updates.targetType;

            const { error } = await supabase.from('schedule_items').update(supabaseUpdates).eq('id', id);
            if (error) console.error("Failed to update schedule item", error);
            return;
        }

        const items = await scheduleService.getAllScheduleItems();
        const updatedItems = items.map(item => item.id === id ? { ...item, ...updates } : item);
        localStorage.setItem(STORAGE_KEYS.SCHEDULE_INDEX, JSON.stringify(updatedItems));
    },

    deleteScheduleItem: async (id: string): Promise<void> => {
        if (isSupabaseConfigured() && supabase) {
            const { error } = await supabase.from('schedule_items').update({ deleted_at: new Date().toISOString() }).eq('id', id);
            if (error) console.error("Failed to delete schedule item", error);
            return;
        }

        const items = await scheduleService.getAllScheduleItems();
        const filtered = items.filter(i => i.id !== id);
        localStorage.setItem(STORAGE_KEYS.SCHEDULE_INDEX, JSON.stringify(filtered));
    },

    deleteByTargetId: async (targetId: string): Promise<void> => {
        if (isSupabaseConfigured() && supabase) {
            await supabase.from('schedule_items').update({ deleted_at: new Date().toISOString() }).eq('target_id', targetId);
            return;
        }

        const items = await scheduleService.getAllScheduleItems();
        const filtered = items.filter(s => s.targetId !== targetId);
        localStorage.setItem(STORAGE_KEYS.SCHEDULE_INDEX, JSON.stringify(filtered));
    }
};
