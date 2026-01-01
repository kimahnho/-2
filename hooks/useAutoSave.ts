/**
 * useAutoSave - 자동 저장 로직
 * MECE: 프로젝트 저장 기능만 담당
 */

import { useEffect, useRef, useState } from 'react';
import { ProjectData } from '../types';
import { storageService } from '../services/storageService';

interface UseAutoSaveProps {
    elements: any[];
    pages: any[];
    title: string;
    projectId: string;
    isGuest: boolean;
}

interface UseAutoSaveReturn {
    isSaving: boolean;
}

export const useAutoSave = ({
    elements,
    pages,
    title,
    projectId,
    isGuest
}: UseAutoSaveProps): UseAutoSaveReturn => {
    const [isSaving, setIsSaving] = useState(false);
    const saveTimeoutRef = useRef<any>(null);

    useEffect(() => {
        // Debounce save
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        setIsSaving(true);
        saveTimeoutRef.current = setTimeout(() => {
            const projectData: ProjectData = {
                elements,
                pages
            };
            const firstPageId = pages[0]?.id;
            const previewElements = firstPageId ? elements.filter(el => el.pageId === firstPageId) : [];
            storageService.saveProject(projectId, projectData, title, undefined, previewElements);
            setIsSaving(false);
        }, 1000); // Save after 1 second of inactivity

        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [elements, pages, title, projectId, isGuest]);

    return { isSaving };
};
