
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
  // 스마트 선택을 위한 필터 기준 요소 ID 저장
  const selectionFilterRef = useRef<string | null>(null);

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

    // Shift 키가 눌려있고 이미 선택된 요소가 있다면, 첫 번째 선택된 요소를 필터 기준으로 설정
    if (e.shiftKey && selectedIds.length > 0) {
      selectionFilterRef.current = selectedIds[0];
    } else if (!e.shiftKey) {
      onSetSelectedIds([]);
      onSetEditingId(null);
      selectionFilterRef.current = null;
    } else {
      selectionFilterRef.current = null;
    }
  };

  // 캔버스 배경 클릭 시 처리 (현재 활성화된 페이지 기준으로 좌표 계산)
  const handleBackgroundMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click

    const pageEl = pageRefs.current[activePageId];
    if (!pageEl) return;

    const rect = pageEl.getBoundingClientRect();
    const startX = (e.clientX - rect.left) / zoom;
    const startY = (e.clientY - rect.top) / zoom;

    setSelectionBox({
      start: { x: startX, y: startY },
      end: { x: startX, y: startY },
      pageId: activePageId
    });

    onSetSelectedIds([]);
    onSetEditingId(null);
    selectionFilterRef.current = null;
  };

  const handleElementMouseDown = (e: React.MouseEvent, id: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    // Reset filter ref on element click
    selectionFilterRef.current = null;

    // Prepare Group Selection
    const clickedEl = elements.find(el => el.id === id);
    if (!clickedEl) return;

    // Group logic: If clicked element is part of a group, select ALL group members
    let idsToToggle = [id];
    if (clickedEl.groupId) {
      // Find all elements in the same group on the same page
      const groupMembers = elements.filter(el => el.pageId === activePageId && el.groupId === clickedEl.groupId);
      idsToToggle = groupMembers.map(el => el.id);
    }

    if (clickedEl?.isEmotionPlaceholder) onSetActiveTab('emotions');
    if (clickedEl && clickedEl.pageId !== activePageId && clickedEl.pageId) {
      onSelectPage(clickedEl.pageId);
    }

    let newSelectedIds = [...selectedIds];

    if (e.shiftKey) {
      // Toggle Logic for Group
      // If ALL items in the group are already selected, Deselect ALL.
      // Otherwise, Select ALL.
      const allSelected = idsToToggle.every(tid => selectedIds.includes(tid));

      if (allSelected) {
        newSelectedIds = selectedIds.filter(sid => !idsToToggle.includes(sid));
      } else {
        // Add ones that aren't there
        const toAdd = idsToToggle.filter(tid => !selectedIds.includes(tid));
        newSelectedIds = [...selectedIds, ...toAdd];
      }
    } else {
      // If not Shift, and clicked a group member that is NOT selected -> Select ONLY that group (Replace Selection)
      // If clicked a group member that IS selected -> Do NOT deselect others yet (might be drag). 
      // Logic: if already selected, keep selection AS IS (unless it's the only thing selected? No, standard logic)

      const isAlreadySelected = selectedIds.includes(id);

      if (!isAlreadySelected) {
        newSelectedIds = idsToToggle;
      } else {
        // If already selected, we don't change selection on MOUSE DOWN.
        // We might change it on Mouse Up if it was a simple click (handled by click event?)
        // But here we set Drag.
        // Wait, if I have [A, B] selected, and I click A. I want to drag [A, B].
        // If I click C (unselected), I want to drag [C] (or [C_group]).
        // So if `!isAlreadySelected`, replace selection.
        // If `isAlreadySelected`, keep selection? Yes.
        // BUT: If the user clicked just ONE member of a multi-select group...
        // Use standard logic logic.
        newSelectedIds = selectedIds; // Keep existing selection logic for drag prep
      }
    }

    // Safety: ensure no duplicates
    newSelectedIds = Array.from(new Set(newSelectedIds));

    onSetSelectedIds(newSelectedIds);
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
      if (selectionBox) { setSelectionBox(null); selectionFilterRef.current = null; }
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

        let overlappingIds = elements
          .filter(el => el.pageId === selectionBox.pageId)
          .filter(el => {
            const elRight = el.x + el.width;
            const elBottom = el.y + el.height;
            return (el.x < x2 && elRight > x1 && el.y < y2 && elBottom > y1);
          })
          .map(el => el.id);

        // Smart Selection Filter
        if (selectionFilterRef.current) {
          const filterElement = elements.find(el => el.id === selectionFilterRef.current);
          if (filterElement) {
            overlappingIds = overlappingIds.filter(id => {
              const targetEl = elements.find(el => el.id === id);
              if (!targetEl) return false;

              // 1. Check basic type
              if (targetEl.type !== filterElement.type) return false;

              // 2. Check metadata (e.g., isAACCard)
              const isFilterAAC = filterElement.metadata?.isAACCard;
              const isTargetAAC = targetEl.metadata?.isAACCard;
              if (isFilterAAC !== isTargetAAC) return false;

              return true;
            });

            // Add the filter element itself to selection if not filtered out (optional, but good UX)
            if (!overlappingIds.includes(selectionFilterRef.current)) {
              overlappingIds.push(selectionFilterRef.current);
            }
          }
        }

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

    // Resize Logic (그룹 리사이징 지원, Shift = 정비율)
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

      // Shift 키 누르면 정비율 리사이징
      if (e.shiftKey) {
        const aspectRatio = bbox.width / bbox.height;

        // 코너 핸들 (nw, ne, sw, se)인 경우
        if (resizeInfo.handle.length === 2) {
          // 더 많이 변한 쪽을 기준으로 정비율 적용
          const widthChange = Math.abs(newBboxW - bbox.width);
          const heightChange = Math.abs(newBboxH - bbox.height);

          if (widthChange >= heightChange) {
            // 가로 변화가 더 크면 세로를 맞춤
            newBboxH = newBboxW / aspectRatio;
          } else {
            // 세로 변화가 더 크면 가로를 맞춤
            newBboxW = newBboxH * aspectRatio;
          }

          // 핸들 방향에 따라 위치 조정
          if (resizeInfo.handle.includes('w')) {
            newBboxX = bbox.x + bbox.width - newBboxW;
          }
          if (resizeInfo.handle.includes('n')) {
            newBboxY = bbox.y + bbox.height - newBboxH;
          }
        }
      }

      // 스케일 계산
      const scaleX = bbox.width > 0 ? newBboxW / bbox.width : 1;
      const scaleY = bbox.height > 0 ? newBboxH / bbox.height : 1;

      // Helper to calculate minimum text box height given a width
      const getTextMinHeight = (el: DesignElement, targetWidth: number): number => {
        if (el.type !== 'text' || !el.content) return 30;

        const fontSize = el.fontSize || 24;
        const lineHeight = fontSize * 1.5;
        const fontFamily = el.fontFamily || "'Gowun Dodum', sans-serif";

        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return lineHeight + 10;

          ctx.font = `${fontSize}px ${fontFamily}`;

          // Calculate wrapped line count at target width
          const availableWidth = targetWidth - 10; // padding
          const lines = el.content.split('\n');
          let totalLines = 0;

          for (const line of lines) {
            if (line.trim() === '') {
              totalLines++; // Empty line
              continue;
            }
            const words = line.split(/\s+/);
            let currentLineWidth = 0;
            let linesForThisLine = 1;

            for (const word of words) {
              const wordWidth = ctx.measureText(word + ' ').width;
              if (currentLineWidth + wordWidth > availableWidth && currentLineWidth > 0) {
                linesForThisLine++;
                currentLineWidth = wordWidth;
              } else {
                currentLineWidth += wordWidth;
              }
            }
            totalLines += linesForThisLine;
          }

          return Math.max(lineHeight + 10, totalLines * lineHeight + 10);
        } catch {
          return 30;
        }
      };

      // Helper to get minimum width (longest word)
      const getTextMinWidth = (el: DesignElement): number => {
        if (el.type !== 'text' || !el.content) return 50;

        const fontSize = el.fontSize || 24;
        const fontFamily = el.fontFamily || "'Gowun Dodum', sans-serif";

        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return 50;

          ctx.font = `${fontSize}px ${fontFamily}`;
          const words = el.content.split(/\s+/);
          let maxWordWidth = 0;
          for (const word of words) {
            const w = ctx.measureText(word).width;
            if (w > maxWordWidth) maxWordWidth = w;
          }
          return Math.min(maxWordWidth + 20, 400);
        } catch {
          return 50;
        }
      };

      // 모든 선택된 요소에 스케일 적용
      const newElements = elements.map(el => {
        const initial = resizeInfo.initialElements![el.id];
        if (!initial) return el;

        // 바운딩 박스 내 상대 위치 계산 후 스케일 적용
        const relX = initial.x - bbox.x;
        const relY = initial.y - bbox.y;

        // Calculate proposed new dimensions
        let proposedWidth = initial.width * scaleX;
        let proposedHeight = initial.height * scaleY;

        // For text elements, enforce minimum sizes
        if (el.type === 'text') {
          const minWidth = getTextMinWidth(el);
          proposedWidth = Math.max(minWidth, proposedWidth);

          // Calculate minimum height based on the new width
          const minHeight = getTextMinHeight(el, proposedWidth);
          proposedHeight = Math.max(minHeight, proposedHeight);
        } else {
          proposedWidth = Math.max(20, proposedWidth);
          proposedHeight = Math.max(20, proposedHeight);
        }

        const updates: Partial<DesignElement> = {
          x: newBboxX + relX * scaleX,
          y: newBboxY + relY * scaleY,
          width: proposedWidth,
          height: proposedHeight,
        };

        // backgroundPosition is now stored as relative ratios, no scaling needed

        return { ...el, ...updates };
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
    if (selectionBox) {
      setSelectionBox(null);
      selectionFilterRef.current = null;
    }
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
    handleMouseUp,
    handleBackgroundMouseDown
  };
};