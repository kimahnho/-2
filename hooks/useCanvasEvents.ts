import React, { useState, useRef } from 'react';
import { DesignElement, DragInfo, ResizeInfo, RotateInfo, Guide } from '../types';
import { calculateSnapping, calculateRotation } from '../utils/canvasUtils';

interface UseCanvasEventsProps {
  elements: DesignElement[];
  activePageId: string;
  selectedIds: string[];
  zoom: number;
  onSelectPage: (id: string) => void;
  onSetSelectedIds: (ids: string[]) => void;
  onSetEditingId: (id: string | null) => void;
  onUpdateElements: (elements: DesignElement[]) => void;
  onCommitElements: (elements: DesignElement[]) => void;
  onSetActiveTab: (tab: any) => void;
}

export const useCanvasEvents = ({
  elements,
  activePageId,
  selectedIds,
  zoom,
  onSelectPage,
  onSetSelectedIds,
  onSetEditingId,
  onUpdateElements,
  onCommitElements,
  onSetActiveTab
}: UseCanvasEventsProps) => {
  const [dragInfo, setDragInfo] = useState<DragInfo | null>(null);
  const [resizeInfo, setResizeInfo] = useState<ResizeInfo | null>(null);
  const [rotateInfo, setRotateInfo] = useState<RotateInfo | null>(null);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [selectionBox, setSelectionBox] = useState<{start: {x: number, y: number}, end: {x: number, y: number}, pageId: string} | null>(null);
  
  const pageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handlePageMouseDown = (e: React.MouseEvent, pageId: string) => {
    if (e.button !== 0) return; // Only left click
    
    if (pageId !== activePageId) onSelectPage(pageId);

    const pageEl = pageRefs.current[pageId];
    if (!pageEl) return;

    const rect = pageEl.getBoundingClientRect();
    const startX = (e.clientX - rect.left) / zoom;
    const startY = (e.clientY - rect.top) / zoom;

    setSelectionBox({
      start: { x: startX, y: startY },
      end: { x: startX, y: startY },
      pageId: pageId
    });

    if (!e.shiftKey) {
       onSetSelectedIds([]);
       onSetEditingId(null);
    }
  };

  const handleElementMouseDown = (e: React.MouseEvent, id: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    const clickedEl = elements.find(el => el.id === id);
    if (clickedEl?.isEmotionPlaceholder) onSetActiveTab('emotions');
    if (clickedEl && clickedEl.pageId !== activePageId && clickedEl.pageId) {
        onSelectPage(clickedEl.pageId);
    }

    const isSelected = selectedIds.includes(id);
    let newSelectedIds = selectedIds;

    if (e.shiftKey) {
      newSelectedIds = isSelected ? selectedIds.filter(sid => sid !== id) : [...selectedIds, id];
      onSetSelectedIds(newSelectedIds);
    } else if (!isSelected) {
      newSelectedIds = [id];
      onSetSelectedIds(newSelectedIds);
    }

    onSetEditingId(null);

    // Prepare Drag
    const initialPositions: Record<string, {x: number, y: number}> = {};
    newSelectedIds.forEach(eid => {
       const el = elements.find(e => e.id === eid);
       if (el) initialPositions[eid] = { x: el.x, y: el.y };
    });

    setDragInfo({
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initialPositions
    });
  };

  const handleResizeStart = (e: React.MouseEvent, id: string, handle: string) => {
    e.stopPropagation();
    const el = elements.find(element => element.id === id);
    if (!el) return;

    setResizeInfo({
      isResizing: true,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initialWidth: el.width,
      initialHeight: el.height,
      initialX: el.x,
      initialY: el.y,
    });
  };

  const handleRotateStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const el = elements.find(e => e.id === id);
    if (!el || !el.pageId) return;
    
    const pageEl = pageRefs.current[el.pageId];
    if (!pageEl) return;
    
    const pageRect = pageEl.getBoundingClientRect();
    const centerX = pageRect.left + (el.x + el.width / 2) * zoom;
    const centerY = pageRect.top + (el.y + el.height / 2) * zoom;
    
    setRotateInfo({ isRotating: true, id, pageId: el.pageId, centerX, centerY, startAngle: el.rotation });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 0) {
       // Cleanup if mouse released outside
       if (dragInfo) { setDragInfo(null); onCommitElements(elements); }
       if (resizeInfo) { setResizeInfo(null); onCommitElements(elements); }
       if (rotateInfo) { setRotateInfo(null); onCommitElements(elements); }
       if (selectionBox) setSelectionBox(null);
       setGuides([]);
       return;
    }

    // Selection Box Logic
    if (selectionBox) {
        const pageEl = pageRefs.current[selectionBox.pageId];
        if (pageEl) {
            const rect = pageEl.getBoundingClientRect();
            const currentX = (e.clientX - rect.left) / zoom;
            const currentY = (e.clientY - rect.top) / zoom;

            setSelectionBox(prev => prev ? ({ ...prev, end: { x: currentX, y: currentY } }) : null);

            const x1 = Math.min(selectionBox.start.x, currentX);
            const x2 = Math.max(selectionBox.start.x, currentX);
            const y1 = Math.min(selectionBox.start.y, currentY);
            const y2 = Math.max(selectionBox.start.y, currentY);

            const overlappingIds = elements
                .filter(el => el.pageId === selectionBox.pageId)
                .filter(el => {
                    const elRight = el.x + el.width;
                    const elBottom = el.y + el.height;
                    return (el.x < x2 && elRight > x1 && el.y < y2 && elBottom > y1);
                })
                .map(el => el.id);
            onSetSelectedIds(overlappingIds);
        }
        return;
    }

    // Rotation Logic
    if (rotateInfo && rotateInfo.isRotating) {
        const newAngle = calculateRotation(rotateInfo.centerX, rotateInfo.centerY, e.clientX, e.clientY, e.shiftKey);
        const newElements = elements.map(el => el.id === rotateInfo.id ? { ...el, rotation: newAngle } : el);
        onUpdateElements(newElements);
        return;
    }

    // Resize Logic
    if (resizeInfo && resizeInfo.isResizing) {
        const deltaX = (e.clientX - resizeInfo.startX) / zoom;
        const deltaY = (e.clientY - resizeInfo.startY) / zoom;
        
        const newElements = elements.map(el => {
            if (el.id !== selectedIds[0]) return el;
            
            let newX = resizeInfo.initialX;
            let newY = resizeInfo.initialY;
            let newWidth = resizeInfo.initialWidth;
            let newHeight = resizeInfo.initialHeight;

            if (resizeInfo.handle.includes('e')) newWidth = Math.max(10, resizeInfo.initialWidth + deltaX);
            if (resizeInfo.handle.includes('s')) newHeight = Math.max(10, resizeInfo.initialHeight + deltaY);
            if (resizeInfo.handle.includes('w')) {
              newWidth = Math.max(10, resizeInfo.initialWidth - deltaX);
              newX = resizeInfo.initialX + deltaX;
            }
            if (resizeInfo.handle.includes('n')) {
              newHeight = Math.max(10, resizeInfo.initialHeight - deltaY);
              newY = resizeInfo.initialY + deltaY;
            }
            return { ...el, x: newX, y: newY, width: newWidth, height: newHeight };
        });
        onUpdateElements(newElements);
        return;
    }

    // Drag Logic
    if (dragInfo && dragInfo.isDragging) {
      const deltaX = (e.clientX - dragInfo.startX) / zoom;
      const deltaY = (e.clientY - dragInfo.startY) / zoom;

      const movingElements = elements.filter(el => selectedIds.includes(el.id));
      const otherElements = elements.filter(el => !selectedIds.includes(el.id) && el.pageId === activePageId);
      
      const { guides: newGuides, newPositions } = calculateSnapping(
          movingElements, otherElements, deltaX, deltaY, dragInfo.initialPositions
      );
      
      setGuides(newGuides);

      const newElements = elements.map(el => {
          if (newPositions[el.id]) return { ...el, ...newPositions[el.id] };
          return el;
      });
      onUpdateElements(newElements);
    }
  };

  const handleMouseUp = () => {
      if (dragInfo || resizeInfo || rotateInfo) {
          onCommitElements(elements); // Commit the final state to history
          setDragInfo(null);
          setResizeInfo(null);
          setRotateInfo(null);
          setGuides([]);
      }
      if (selectionBox) setSelectionBox(null);
  };

  return {
    guides,
    selectionBox,
    pageRefs,
    handlePageMouseDown,
    handleElementMouseDown,
    handleResizeStart,
    handleRotateStart,
    handleMouseMove,
    handleMouseUp
  };
};