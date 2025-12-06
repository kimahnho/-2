
import { useState, useEffect } from 'react';
import { DesignElement } from '../types';

interface ProjectActions {
  elements: DesignElement[];
  selectedIds: string[];
  activePageId: string;
  pages: { id: string }[];
  editingId: string | null;
  
  setEditingId: (id: string | null) => void;
  setSelectedIds: (ids: string[]) => void;
  updateElements: (elements: DesignElement[]) => void;
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
        
        // --- Copy (Ctrl+C) ---
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
            e.preventDefault();
            if (project.selectedIds.length > 0) {
                // Copy Elements
                const selectedElements = project.elements.filter(el => project.selectedIds.includes(el.id));
                setClipboard({ type: 'elements', data: selectedElements });
            } else {
                // Check if page manager is focused or just default to copying active page if no elements selected
                // (Relaxed condition: if no elements selected, assume page copy)
                setClipboard({ type: 'page', data: project.activePageId });
            }
            return;
        }

        // --- Paste (Ctrl+V) ---
        if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
            e.preventDefault();
            if (!clipboard) return;

            if (clipboard.type === 'elements') {
                const elementsToPaste = clipboard.data as DesignElement[];
                const newIds: string[] = [];
                const newElements = elementsToPaste.map(el => {
                    const newId = generateId();
                    newIds.push(newId);
                    return {
                        ...el,
                        id: newId,
                        pageId: project.activePageId,
                        x: el.x + 20, // Offset
                        y: el.y + 20,
                        zIndex: project.elements.length + newIds.length
                    };
                });
                project.updateElements([...project.elements, ...newElements]);
                project.setSelectedIds(newIds);
            } else if (clipboard.type === 'page') {
                // Paste Page (Insert AFTER current active page)
                project.pastePage(clipboard.data);
            }
            return;
        }

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
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, clipboard]);

  return { clipboard };
};
