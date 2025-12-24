/**
 * Project Service - 프로젝트 관리 CRUD
 * @module services/projectService
 */

import { SavedProjectMetadata, ProjectData } from '../types';
import { supabase, isSupabaseConfigured, STORAGE_KEYS } from './storageAdapter';
import { v4 as uuidv4 } from 'uuid';
import { trackProjectCreated, trackProjectSaved } from './mixpanelService';

// Helper to ensure unique titles
const getUniqueTitle = async (baseTitle: string, excludeId?: string): Promise<string> => {
    const projects = await projectService.getAllProjects();
    const isTaken = (t: string) => projects.some(p => p.title === t && p.id !== excludeId);

    if (!isTaken(baseTitle)) return baseTitle;

    let counter = 1;
    let newTitle = `${baseTitle}(${counter})`;
    while (isTaken(newTitle)) {
        counter++;
        newTitle = `${baseTitle}(${counter})`;
    }
    return newTitle;
};

export const projectService = {
    getAllProjects: async (): Promise<SavedProjectMetadata[]> => {
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('projects')
                .select('id, student_id, group_id, title, thumbnail, preview_elements, created_at, updated_at')
                .is('deleted_at', null)
                .order('updated_at', { ascending: false });

            if (error) {
                console.error("Failed to load projects from Supabase", error);
                return [];
            }

            return (data || []).map(p => ({
                id: p.id,
                studentId: p.student_id,
                groupId: p.group_id,
                title: p.title,
                thumbnail: p.thumbnail,
                createdAt: new Date(p.created_at).getTime(),
                updatedAt: new Date(p.updated_at).getTime(),
                previewElements: p.preview_elements // Assuming snake_case in Supabase if implemented
            }));
        }

        try {
            const json = localStorage.getItem(STORAGE_KEYS.PROJECT_INDEX);
            if (!json) return [];
            const projects = JSON.parse(json);
            return projects.sort((a: SavedProjectMetadata, b: SavedProjectMetadata) => b.updatedAt - a.updatedAt);
        } catch (e) {
            console.error("Failed to load project index", e);
            return [];
        }
    },

    getProject: async (id: string): Promise<ProjectData | null> => {
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('projects')
                .select('elements, pages')
                .eq('id', id)
                .single();

            if (error) {
                console.error(`Failed to load project ${id} from Supabase`, error);
                return null;
            }

            return {
                elements: data.elements || [],
                pages: data.pages || [{ id: 'page-1' }]
            };
        }

        try {
            const json = localStorage.getItem(`${STORAGE_KEYS.PROJECT_DATA_PREFIX}${id}`);
            if (!json) return null;
            return JSON.parse(json);
        } catch (e) {
            console.error(`Failed to load project ${id}`, e);
            return null;
        }
    },

    createProject: async (title: string = '제목 없는 디자인', ownerId?: string, isGroup: boolean = false): Promise<string> => {
        const uniqueTitle = await getUniqueTitle(title);

        if (isSupabaseConfigured() && supabase) {
            // Get current user for RLS
            const { data: { user } } = await supabase.auth.getUser();

            const insertData: Record<string, unknown> = {
                title: uniqueTitle,
                elements: [],
                pages: [{ id: 'page-1' }],
                user_id: user?.id // Required for RLS
            };

            if (isGroup && ownerId) {
                insertData.group_id = ownerId;
            } else if (ownerId) {
                insertData.student_id = ownerId;
            }

            const { data, error } = await supabase
                .from('projects')
                .insert(insertData)
                .select('id')
                .single();

            if (error) {
                console.error("Failed to create project in Supabase", error);
                throw error;
            }

            // Track project created
            trackProjectCreated(data.id);

            return data.id;
        }

        // localStorage fallback
        const id = uuidv4();
        const now = Date.now();

        const newMetadata: SavedProjectMetadata = {
            id,
            title: uniqueTitle,
            updatedAt: now,
            createdAt: now,
            ...(isGroup ? { groupId: ownerId } : { studentId: ownerId })
        };

        const projects = await projectService.getAllProjects();
        localStorage.setItem(STORAGE_KEYS.PROJECT_INDEX, JSON.stringify([newMetadata, ...projects]));

        const initialData: ProjectData = {
            elements: [],
            pages: [{ id: 'page-1' }]
        };
        localStorage.setItem(`${STORAGE_KEYS.PROJECT_DATA_PREFIX}${id}`, JSON.stringify(initialData));

        return id;
    },

    saveProject: async (id: string, data: ProjectData, title?: string, thumbnail?: string, previewElements?: any[]): Promise<void> => {
        if (isSupabaseConfigured() && supabase) {
            const updateData: Record<string, unknown> = {
                elements: data.elements,
                pages: data.pages
            };

            if (title) {
                const uniqueTitle = await getUniqueTitle(title, id);
                updateData.title = uniqueTitle;
            }

            if (thumbnail) {
                updateData.thumbnail = thumbnail;
            }

            if (previewElements) {
                updateData.preview_elements = previewElements;
            }

            const { error } = await supabase.from('projects').update(updateData).eq('id', id);
            if (error) {
                console.error("Failed to save project", error);
            } else {
                // Track project saved
                trackProjectSaved(id);
            }
            return;
        }

        // localStorage fallback
        localStorage.setItem(`${STORAGE_KEYS.PROJECT_DATA_PREFIX}${id}`, JSON.stringify(data));

        const projects = await projectService.getAllProjects();
        const updatedProjects = projects.map(p => {
            if (p.id === id) {
                let newTitle = p.title;
                if (title && title !== p.title) {
                    // For localStorage, we do sync unique title check
                    const isTaken = (t: string) => projects.some(proj => proj.title === t && proj.id !== id);
                    if (!isTaken(title)) {
                        newTitle = title;
                    } else {
                        let counter = 1;
                        let candidateTitle = `${title}(${counter})`;
                        while (isTaken(candidateTitle)) {
                            counter++;
                            candidateTitle = `${title}(${counter})`;
                        }
                        newTitle = candidateTitle;
                    }
                }

                return {
                    ...p,
                    updatedAt: Date.now(),
                    title: newTitle,
                    thumbnail: thumbnail || p.thumbnail,
                    previewElements: previewElements || p.previewElements // Save preview elements
                };
            }
            return p;
        });
        localStorage.setItem(STORAGE_KEYS.PROJECT_INDEX, JSON.stringify(updatedProjects));
    },

    deleteProject: async (id: string): Promise<void> => {
        if (isSupabaseConfigured() && supabase) {
            const { error } = await supabase.from('projects').update({ deleted_at: new Date().toISOString() }).eq('id', id);
            if (error) console.error("Failed to delete project", error);
            return;
        }

        try {
            localStorage.removeItem(`${STORAGE_KEYS.PROJECT_DATA_PREFIX}${id}`);

            const projects = await projectService.getAllProjects();
            const filtered = projects.filter(p => p.id !== id);
            localStorage.setItem(STORAGE_KEYS.PROJECT_INDEX, JSON.stringify(filtered));
        } catch (e) {
            console.error("Failed to delete project", e);
        }
    },

    deleteByStudentId: async (studentId: string): Promise<void> => {
        const projects = await projectService.getAllProjects();
        const studentProjects = projects.filter(p => p.studentId === studentId);
        for (const p of studentProjects) {
            await projectService.deleteProject(p.id);
        }
    },

    deleteByGroupId: async (groupId: string): Promise<void> => {
        const projects = await projectService.getAllProjects();
        const groupProjects = projects.filter(p => p.groupId === groupId);
        for (const p of groupProjects) {
            await projectService.deleteProject(p.id);
        }
    }
};
