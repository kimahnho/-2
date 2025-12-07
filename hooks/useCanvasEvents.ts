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
  const [selectionBox, setSelectionBox] = useState<{ start: { x: number, y: number }, end: { x: number, y: number }, pageId: string } | null>(null);

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
    const initialPositions: Record<string, { x: number, y: number }> = {};
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

    // 선택된 모든 요소 가져오기
    const selectedElements = elements.filter(el => selectedIds.includes(el.id));
    if (selectedElements.length === 0) return;

    // 선택된 요소들의 바운딩 박스 계산
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const initialElements: Record<string, { x: number; y: number; width: number; height: number }> = {};

    selectedElements.forEach(el => {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + el.width);
      maxY = Math.max(maxY, el.y + el.height);
      initialElements[el.id] = { x: el.x, y: el.y, width: el.width, height: el.height };
    });

    const boundingBox = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };

    setResizeInfo({
      isResizing: true,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initialWidth: boundingBox.width,
      initialHeight: boundingBox.height,
      initialX: boundingBox.x,
      initialY: boundingBox.y,
      boundingBox,
      initialElements,
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

    // Resize Logic (그룹 리사이징 지원)
    if (resizeInfo && resizeInfo.isResizing && resizeInfo.initialElements && resizeInfo.boundingBox) {
      const deltaX = (e.clientX - resizeInfo.startX) / zoom;
      const deltaY = (e.clientY - resizeInfo.startY) / zoom;

      const bbox = resizeInfo.boundingBox;
      let newBboxX = bbox.x;
      let newBboxY = bbox.y;
      let newBboxW = bbox.width;
      let newBboxH = bbox.height;

      // 핸들에 따른 바운딩 박스 변화 계산
      if (resizeInfo.handle.includes('e')) newBboxW = Math.max(20, bbox.width + deltaX);
      if (resizeInfo.handle.includes('s')) newBboxH = Math.max(20, bbox.height + deltaY);
      if (resizeInfo.handle.includes('w')) {
        newBboxW = Math.max(20, bbox.width - deltaX);
        newBboxX = bbox.x + deltaX;
      }
      if (resizeInfo.handle.includes('n')) {
        newBboxH = Math.max(20, bbox.height - deltaY);
        newBboxY = bbox.y + deltaY;
      }

      // 스케일 계산
      const scaleX = bbox.width > 0 ? newBboxW / bbox.width : 1;
      const scaleY = bbox.height > 0 ? newBboxH / bbox.height : 1;

      // 모든 선택된 요소에 스케일 적용
      const newElements = elements.map(el => {
        const initial = resizeInfo.initialElements![el.id];
        if (!initial) return el;

        // 바운딩 박스 내 상대 위치 계산 후 스케일 적용
        const relX = initial.x - bbox.x;
        const relY = initial.y - bbox.y;

        return {
          ...el,
          x: newBboxX + relX * scaleX,
          y: newBboxY + relY * scaleY,
          width: Math.max(10, initial.width * scaleX),
          height: Math.max(10, initial.height * scaleY),
        };
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