
import { useState, useEffect } from 'react';
import { DesignElement, Guide } from '../types';
import { calculateSnapping } from '../utils/canvasUtils';

interface ProjectActions {
    elements: DesignElement[];
    selectedIds: string[];
    activePageId: string;
    pages: { id: string }[];
    editingId: string | null;

    setEditingId: (id: string | null) => void;
    setSelectedIds: (ids: string[]) => void;
    updateElements: (elements: DesignElement[], isCommit?: boolean) => void;
    deleteElements: (ids: string[]) => void;
    deletePage: (id: string) => void;
    duplicatePage: (id: string) => void;
    pastePage: (sourceId: string) => void; // New action for pasting
    undo: () => void;
    redo: () => void;
}

interface ClipboardData {
    type: 'elements' | 'page';
    data: any;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useKeyboardShortcuts = (project: ProjectActions) => {
    const [clipboard, setClipboard] = useState<ClipboardData | null>(null);
    const [guides, setGuides] = useState<Guide[]>([]);


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent repeated events (e.g. holding down key) checks
            if (e.repeat) return;

            // 1. Handle Escape key (Highest Priority)
            if (e.key === 'Escape') {
                e.preventDefault();
                // If text editing is active, stop editing
                if (project.editingId) {
                    project.setEditingId(null);
                }
                // If elements are selected, deselect them
                else if (project.selectedIds.length > 0) {
                    project.setSelectedIds([]);
                }

                // Blur any focused input
                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }
                return;
            }

            // 2. Guard for Input/Textarea (Don't trigger shortcuts while typing)
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            // ★ 텍스트 편집 중일 때는 Ctrl+C/V를 브라우저 기본 동작에 맡김 (복사/붙여넣기)
            const isTextEditing = project.editingId !== null;
            if (isTextEditing && (e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'a')) {
                // Don't prevent default - let browser handle native copy/paste/cut/select-all
                return;
            }

            // --- Copy (Ctrl+C) ---
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                // Don't prevent default immediately if we want to allow native copy for text? 
                // But we have custom elements.
                // We previously prevented default.

                if (project.selectedIds.length > 0) {
                    e.preventDefault();
                    // Copy Elements
                    const selectedElements = project.elements.filter(el => project.selectedIds.includes(el.id));
                    const clipboardData = { type: 'muru-elements', data: selectedElements };
                    navigator.clipboard.writeText(JSON.stringify(clipboardData));
                    setClipboard({ type: 'elements', data: selectedElements }); // Keep internal for now (optional)
                } else {
                    // Page Copy
                    e.preventDefault();
                    setClipboard({ type: 'page', data: project.activePageId });
                    // Optionally write page data to system clipboard? Skip for now to minimize risk.
                }
                return;
            }

            // --- Paste (Ctrl+V) ---
            // REMOVED: Handled by global 'paste' event in EditorPage.tsx
            // if ((e.ctrlKey || e.metaKey) && e.key === 'v') { ... }

            // --- Duplicate (Ctrl+D) ---
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                // If Page focused?
                const activeEl = document.activeElement;
                if (project.selectedIds.length === 0 && activeEl?.classList.contains('page-thumbnail')) {
                    project.duplicatePage(project.activePageId);
                } else {
                    // Duplicate Elements Logic
                    if (project.selectedIds.length === 0) return;
                    const newElements = [...project.elements];
                    const newSelectedIds: string[] = [];
                    project.selectedIds.forEach(id => {
                        const el = project.elements.find(e => e.id === id);
                        if (el) {
                            const newId = generateId();
                            newElements.push({ ...el, id: newId, x: el.x + 20, y: el.y + 20, zIndex: newElements.length + 1 });
                            newSelectedIds.push(newId);
                        }
                    });
                    project.updateElements(newElements);
                    project.setSelectedIds(newSelectedIds);
                }
            }

            // --- Delete ---
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (project.editingId) return;

                // 1. If elements are selected, delete them
                if (project.selectedIds.length > 0) {
                    e.preventDefault();
                    project.deleteElements(project.selectedIds);
                    return;
                }

                // 2. Page Deletion Logic
                e.preventDefault();

                const isLastPage = project.pages.length <= 1;

                if (isLastPage) {
                    const pageElements = project.elements.filter(el => el.pageId === project.activePageId);
                    if (pageElements.length > 0) {
                        if (window.confirm("현재 페이지의 모든 내용을 삭제하시겠습니까?")) {
                            project.deletePage(project.activePageId);
                        }
                    }
                } else {
                    project.deletePage(project.activePageId);
                }
            }

            // --- Undo / Redo ---
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                e.shiftKey ? project.redo() : project.undo();
                return;
            }

            // --- Arrow Keys (Nudge) ---
            if (project.selectedIds.length > 0 && !project.editingId) {
                const isArrowKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key);
                if (isArrowKey) {
                    e.preventDefault();

                    // Calculate delta
                    const step = e.shiftKey ? 10 : 1;
                    let dx = 0;
                    let dy = 0;

                    switch (e.key) {
                        case 'ArrowLeft': dx = -step; break;
                        case 'ArrowRight': dx = step; break;
                        case 'ArrowUp': dy = -step; break;
                        case 'ArrowDown': dy = step; break;
                    }

                    // Apply movement
                    const newElements = project.elements.map(el => {
                        if (project.selectedIds.includes(el.id)) {
                            return { ...el, x: el.x + dx, y: el.y + dy };
                        }
                        return el;
                    });

                    // Update LIVE (no commit) - pass false for isCommit
                    project.updateElements(newElements, false);

                    // --- Calculate Guides ---
                    const movingElements = newElements.filter(el => project.selectedIds.includes(el.id));
                    const otherElements = newElements.filter(el => !project.selectedIds.includes(el.id) && el.pageId === project.activePageId);

                    const initialPositions: any = {};
                    movingElements.forEach(el => initialPositions[el.id] = { x: el.x, y: el.y });

                    // We pass 0,0 as delta because "movingElements" already has the new position
                    const { guides: newGuides, snapDeltaX, snapDeltaY } = calculateSnapping(
                        movingElements,
                        otherElements,
                        0, 0,
                        initialPositions
                    );

                    // Only show guides if strictly aligned (pixel perfect) for keyboard nudge
                    const strictGuides = newGuides.filter(g => {
                        if (g.type === 'vertical') return Math.abs(snapDeltaX) < 1;
                        if (g.type === 'horizontal') return Math.abs(snapDeltaY) < 1;
                        return false;
                    });

                    setGuides(strictGuides);
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            // Commit on arrow key release if we were nudging
            const isArrowKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key);
            if (isArrowKey && project.selectedIds.length > 0 && !project.editingId) {
                // Commit the CURRENT state of elements
                // Since handleKeyDown updated them with isCommit=false, this "saves" the final position
                project.updateElements(project.elements, true);
                setGuides([]); // Clear guides
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [project, clipboard]);

    return { clipboard, guides };
};
