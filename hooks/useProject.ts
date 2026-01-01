
import { useState, useCallback, useRef, useEffect } from 'react';
import { DesignElement, Page, ElementType, ProjectData } from '../types';
import { useHistory } from './useHistory';
import { CANVAS_WIDTH, CANVAS_HEIGHT, moveLayer, alignElements } from '../utils/canvasUtils';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useProject = (initialData?: ProjectData) => {
  // Initialize history with provided data or default empty state
  const {
    state: projectData,
    pushState: commitToHistory,
    updateCurrent: updateWithoutCommit,
    undo,
    redo,
    resetHistory
  } = useHistory<ProjectData>(initialData || {
    elements: [],
    pages: [{ id: 'page-1' }]
  });

  // Effect to reset history when initialData changes (e.g., loading a different project)
  useEffect(() => {
    if (initialData) {
      resetHistory(initialData);
      // Ensure we set active page to the first page of loaded project
      if (initialData.pages.length > 0) {
        setActivePageId(initialData.pages[0].id);
      }
    }
  }, [initialData]);

  const elements = projectData.elements;
  const pages = projectData.pages;

  // Active Page & Selection State
  const [activePageId, setActivePageId] = useState<string>('page-1');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Validate activePageId - fallback to last page if current ID doesn't exist in pages
  // Using last page as fallback handles the case when a new page is added
  const foundPage = pages.find(p => p.id === activePageId);
  const validatedActivePageId = foundPage
    ? activePageId
    : (pages.length > 0 ? pages[pages.length - 1].id : 'page-1');

  // References for non-react-cycle access if needed
  const elementsRef = useRef(elements);
  elementsRef.current = elements;

  // --- Element CRUD ---

  const updateElements = useCallback((newElements: DesignElement[], shouldCommit: boolean = true) => {
    if (shouldCommit) {
      commitToHistory({ elements: newElements, pages });
    } else {
      updateWithoutCommit({ elements: newElements, pages });
    }
  }, [commitToHistory, updateWithoutCommit, pages]);

  const addElement = (type: ElementType, content?: string, options: { targetPageId?: string, borderRadius?: number } = {}) => {
    const id = generateId();
    const pageId = options.targetPageId || activePageId;
    const zIndex = elements.length + 1;

    const baseDefaults = { id, type, rotation: 0, zIndex, pageId };
    let newEl: DesignElement;

    if (type === 'text') {
      const width = 300;
      const height = 60;
      newEl = {
        ...baseDefaults,
        x: (CANVAS_WIDTH - width) / 2,
        y: (CANVAS_HEIGHT - height) / 2,
        width, height,
        content: content || '텍스트를 편집하려면 더블 클릭하세요',
        color: '#000000', fontSize: 24, fontFamily: "'Gowun Dodum', sans-serif"
      } as DesignElement;
    } else if (type === 'image') {
      const width = 200; const height = 200;
      newEl = { ...baseDefaults, x: 0, y: 0, width, height, content: content, borderRadius: 0 } as DesignElement;
    } else if (type === 'shape') {
      newEl = {
        ...baseDefaults,
        x: (CANVAS_WIDTH - 150) / 2,
        y: (CANVAS_HEIGHT - 150) / 2,
        width: 150,
        height: 150,
        backgroundColor: '#B0C0ff',
        borderRadius: options.borderRadius !== undefined ? options.borderRadius : 0,
        borderWidth: 0,
        borderColor: '#000000',
        opacity: 1
      } as DesignElement;
    } else if (type === 'card') {
      newEl = { ...baseDefaults, x: (CANVAS_WIDTH - 200) / 2, y: (CANVAS_HEIGHT - 300) / 2, width: 200, height: 300, backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 2, borderColor: '#e5e7eb', opacity: 1 } as DesignElement;
    } else if (type === 'circle') {
      newEl = { ...baseDefaults, x: (CANVAS_WIDTH - 150) / 2, y: (CANVAS_HEIGHT - 150) / 2, width: 150, height: 150, backgroundColor: '#B0C0ff', borderRadius: 500, borderWidth: 0, borderColor: '#000000', opacity: 1 } as DesignElement;
    } else if (type === 'line' || type === 'arrow') {
      newEl = { ...baseDefaults, x: (CANVAS_WIDTH - 200) / 2, y: (CANVAS_HEIGHT - 40) / 2, width: 200, height: 40, borderColor: '#000000', borderWidth: 4, borderStyle: 'solid', opacity: 1, borderRadius: 0, arrowHeadType: type === 'arrow' ? 'triangle' : undefined } as DesignElement;
    } else { return; }

    updateElements([...elements, newEl]);
    setSelectedIds([id]);
    setEditingId(null);
    return newEl;
  };

  const updateElement = (id: string, updates: Partial<DesignElement>, commit: boolean = true) => {
    const newElements = elements.map(el => {
      if (el.id !== id) return el;

      // Deep merge for metadata to preserve nested properties
      if (updates.metadata && el.metadata) {
        const mergedAACData = updates.metadata.aacData && el.metadata.aacData
          ? { ...el.metadata.aacData, ...updates.metadata.aacData }
          : updates.metadata.aacData || el.metadata.aacData;

        const mergedMetadata = {
          ...el.metadata,
          ...updates.metadata,
          aacData: mergedAACData
        };

        return { ...el, ...updates, metadata: mergedMetadata };
      }

      return { ...el, ...updates };
    });
    updateElements(newElements, commit);
  };

  // Batch update for multiple elements at once (avoids sequential override issues)
  const updateMultipleElements = (
    updates: Array<{ id: string; changes: Partial<DesignElement> }>,
    commit: boolean = true
  ) => {
    const newElements = elements.map(el => {
      const updateEntry = updates.find(u => u.id === el.id);
      if (!updateEntry) return el;

      const changes = updateEntry.changes;

      // Deep merge for metadata
      if (changes.metadata && el.metadata) {
        const mergedAACData = changes.metadata.aacData && el.metadata.aacData
          ? { ...el.metadata.aacData, ...changes.metadata.aacData }
          : changes.metadata.aacData || el.metadata.aacData;

        const mergedMetadata = {
          ...el.metadata,
          ...changes.metadata,
          aacData: mergedAACData
        };

        return { ...el, ...changes, metadata: mergedMetadata };
      }

      return { ...el, ...changes };
    });
    updateElements(newElements, commit);
  };

  const deleteElements = (ids: string[]) => {
    let newElements = elements.filter(el => !ids.includes(el.id));

    // 문장 아이템 삭제 시 영역 카운트 업데이트
    const deletedSentenceItems = elements.filter(el =>
      ids.includes(el.id) && el.metadata?.isAACSentenceItem
    );

    // 삭제된 문장 아이템의 부모 영역별로 그룹화
    const parentCounts: { [parentId: string]: number } = {};
    deletedSentenceItems.forEach(item => {
      const parentId = item.metadata?.parentSentenceAreaId;
      if (parentId) {
        parentCounts[parentId] = (parentCounts[parentId] || 0) + 1;
      }
    });

    // 각 부모 영역의 카운트 감소
    newElements = newElements.map(el => {
      if (el.metadata?.isAACSentenceArea && parentCounts[el.id]) {
        const currentCount = el.metadata.itemCount || 0;
        const newCount = Math.max(0, currentCount - parentCounts[el.id]);

        // 카운트가 0이 되면 플레이스홀더 텍스트 복구 필요
        if (newCount === 0 && currentCount > 0) {
          // 플레이스홀더 텍스트 추가
          const SENTENCE_H = el.height;
          newElements = [...newElements, {
            id: `sentence-txt-${Date.now()}`,
            type: 'text' as const,
            x: el.x + 16,
            y: el.y + (SENTENCE_H - 18) / 2,
            width: 140,
            height: 18,
            content: '문장 구성 영역',
            fontSize: 14,
            color: '#7C3AED',
            rotation: 0,
            zIndex: 2,
            pageId: el.pageId,
            fontFamily: "'Gowun Dodum', sans-serif",
            metadata: {
              isAACSentencePlaceholder: true,
              parentSentenceAreaId: el.id
            }
          }];
        }

        return {
          ...el,
          metadata: {
            ...el.metadata,
            itemCount: newCount
          }
        };
      }
      return el;
    });

    updateElements(newElements);
    setSelectedIds([]);
  };

  const duplicateElements = (ids: string[]) => {
    if (ids.length === 0) return;
    const newElements = [...elements];
    const newSelectedIds: string[] = [];
    ids.forEach(id => {
      const el = elements.find(e => e.id === id);
      if (el) {
        const newId = generateId();
        newElements.push({ ...el, id: newId, x: el.x + 20, y: el.y + 20, zIndex: newElements.length + 1 });
        newSelectedIds.push(newId);
      }
    });
    updateElements(newElements);
    setSelectedIds(newSelectedIds);
  };

  // Add a fully-formed element object directly
  const addElementDirect = (element: Omit<DesignElement, 'id'> & { id?: string }) => {
    const id = element.id || generateId();
    const newElement = { ...element, id, zIndex: elements.length + 1 };
    updateElements([...elements, newElement as DesignElement]);
    return newElement;
  };

  // Add multiple elements at once
  const addMultipleElements = (newElementsToAdd: Array<Omit<DesignElement, 'id'> & { id?: string }>) => {
    const addedElements = newElementsToAdd.map((el, i) => ({
      ...el,
      id: el.id || generateId(),
      zIndex: elements.length + i + 1,
    } as DesignElement));
    updateElements([...elements, ...addedElements]);
    return addedElements;
  };

  // --- Page CRUD ---

  const addPage = (orientation?: 'portrait' | 'landscape', index?: number) => {
    const newPageId = `page-${generateId()}`;
    const newPages = [...pages];
    if (index !== undefined) {
      newPages.splice(index, 0, { id: newPageId, orientation: orientation || 'portrait' });
    } else {
      newPages.push({ id: newPageId, orientation: orientation || 'portrait' });
    }
    commitToHistory({ elements, pages: newPages });
    setActivePageId(newPageId);
    return newPageId;
  };

  const deletePage = (pageId: string) => {
    if (pages.length <= 1) {
      const newElements = elements.filter(el => el.pageId !== pageId);
      commitToHistory({ elements: newElements, pages });
      return;
    }
    const newPages = pages.filter(p => p.id !== pageId);
    const newElements = elements.filter(el => el.pageId !== pageId);

    let newActive = activePageId;
    if (activePageId === pageId) {
      const idx = pages.findIndex(p => p.id === pageId);
      newActive = (newPages[idx - 1] || newPages[idx] || newPages[0]).id;
    }
    commitToHistory({ elements: newElements, pages: newPages });
    setActivePageId(newActive);
  };

  const duplicatePage = (pageId: string) => {
    const pageIndex = pages.findIndex(p => p.id === pageId);
    const newPageId = `page-${generateId()}`;
    const sourceElements = elements.filter(el => el.pageId === pageId);
    const clonedElements = sourceElements.map(el => ({ ...el, id: generateId(), pageId: newPageId }));

    const newPages = [...pages];
    newPages.splice(pageIndex + 1, 0, { id: newPageId });

    commitToHistory({ elements: [...elements, ...clonedElements], pages: newPages });
    setActivePageId(newPageId);
  };

  const pastePage = (sourcePageId: string) => {
    const sourceElements = elements.filter(el => el.pageId === sourcePageId);

    const activePageIndex = pages.findIndex(p => p.id === activePageId);
    const insertIndex = activePageIndex !== -1 ? activePageIndex + 1 : pages.length;

    const newPageId = `page-${generateId()}`;
    const clonedElements = sourceElements.map(el => ({ ...el, id: generateId(), pageId: newPageId }));

    const newPages = [...pages];
    newPages.splice(insertIndex, 0, { id: newPageId });

    commitToHistory({ elements: [...elements, ...clonedElements], pages: newPages });
    setActivePageId(newPageId);
  };

  const movePage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= pages.length) return;
    const newPages = [...pages];
    const [removed] = newPages.splice(fromIndex, 1);
    newPages.splice(toIndex, 0, removed);
    commitToHistory({ elements, pages: newPages });
  };

  // --- Alignment & Layering ---

  const alignSelected = (type: any) => {
    const newElements = alignElements(elements, selectedIds, type);
    updateElements(newElements);
  };

  const bringForward = (id: string) => updateElements(moveLayer(elements, id, 'forward', activePageId));
  const sendBackward = (id: string) => updateElements(moveLayer(elements, id, 'backward', activePageId));
  const bringToFront = (id: string) => updateElements(moveLayer(elements, id, 'front', activePageId));
  const sendToBack = (id: string) => updateElements(moveLayer(elements, id, 'back', activePageId));

  // --- External Replacements (Templates) ---
  const loadTemplate = (templateElements: DesignElement[]) => {
    if (elements.some(el => el.pageId === activePageId)) {
      if (!window.confirm("현재 페이지를 템플릿으로 교체하시겠습니까?")) return;
    }
    const otherPageElements = elements.filter(el => el.pageId !== activePageId);
    const newPageElements = templateElements.map((el, i) => ({
      ...el, id: generateId(), pageId: activePageId, zIndex: otherPageElements.length + i + 1
    }));
    updateElements([...otherPageElements, ...newPageElements]);
  };

  // --- Page Orientation ---
  const updatePageOrientation = (pageId: string, orientation: 'portrait' | 'landscape') => {
    const newPages = pages.map(p =>
      p.id === pageId ? { ...p, orientation } : p
    );
    commitToHistory({ elements, pages: newPages });
  };

  const getActivePageOrientation = (): 'portrait' | 'landscape' => {
    const activePage = pages.find(p => p.id === validatedActivePageId);
    return activePage?.orientation || 'portrait';
  };

  return {
    elements,
    pages,
    activePageId: validatedActivePageId,
    selectedIds,
    editingId,
    setActivePageId,
    setSelectedIds,
    setEditingId,
    // Actions
    addElement,
    addElementDirect,
    addMultipleElements,
    updateElement,
    updateMultipleElements,
    updateElements,
    deleteElements,
    duplicateElements,
    addPage,
    deletePage,
    duplicatePage,
    pastePage,
    movePage,
    alignSelected,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    loadTemplate,
    updatePageOrientation,
    getActivePageOrientation,
    undo,
    redo
  };
};
