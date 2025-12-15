
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DesignElement, Page } from '../types';
import { CanvasElement } from './CanvasElement';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/canvasUtils';
import { useCanvasEvents } from '../hooks/useCanvasEvents';

interface Props {
  pages: Page[];
  elements: DesignElement[];
  activePageId: string;
  selectedIds: string[];
  zoom: number;
  editingId: string | null;
  onSelectPage: (pageId: string) => void;
  onUpdateElements: (elements: DesignElement[]) => void; // For live updates
  onCommitElements: (elements: DesignElement[]) => void; // For history commit
  onSetSelectedIds: (ids: string[]) => void;
  onSetEditingId: (id: string | null) => void;
  onSetActiveTab: (tab: any) => void;
  onAddImageElement?: (dataUrl: string, x?: number, y?: number) => void;
}

export const CanvasArea: React.FC<Props> = (props) => {
  const {
    pages,
    elements,
    activePageId,
    selectedIds,
    zoom,
    editingId,
    onSelectPage,
    onUpdateElements,
    onCommitElements,
    onSetSelectedIds,
    onSetEditingId,
    onSetActiveTab,
    onAddImageElement
  } = props;

  // Panning state for middle mouse button
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isDragOver, setIsDragOver] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Ref to track latest elements for proper commit in onBlur
  const elementsRef = useRef(elements);
  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  const {
    guides,
    selectionBox,
    pageRefs,
    handlePageMouseDown,
    handleElementMouseDown,
    handleResizeStart,
    handleRotateStart,
    handleMouseMove: handleCanvasMouseMove,
    handleMouseUp: handleCanvasMouseUp
  } = useCanvasEvents({
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
  });

  // Handle mouse down for panning (middle button = button 1)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1) { // Middle mouse button
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, []);

  // Handle mouse move for panning and canvas events
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && scrollContainerRef.current) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      scrollContainerRef.current.scrollLeft -= dx;
      scrollContainerRef.current.scrollTop -= dy;
      setPanStart({ x: e.clientX, y: e.clientY });
    }
    handleCanvasMouseMove(e);
  }, [isPanning, panStart, handleCanvasMouseMove]);

  // Handle mouse up for panning and canvas events
  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
    }
    handleCanvasMouseUp();
  }, [isPanning, handleCanvasMouseUp]);

  // Prevent default behavior for middle click
  const handleAuxClick = useCallback((e: React.MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault();
    }
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (onAddImageElement) {
        onAddImageElement(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  }, [onAddImageElement]);

  return (
    <div
      ref={scrollContainerRef}
      className={`flex-1 overflow-auto bg-gray-100 relative custom-scrollbar flex flex-col items-center transition-colors ${isDragOver ? 'bg-blue-100' : ''}`}
      style={{ cursor: isPanning ? 'grabbing' : 'default' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onAuxClick={handleAuxClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-500/20 border-4 border-dashed border-blue-500 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white px-6 py-4 rounded-xl shadow-lg text-blue-600 font-bold text-lg">
            여기에 이미지를 놓으세요
          </div>
        </div>
      )}
      <div className="py-12 flex flex-col gap-8 pb-32">
        {pages.map((page) => {
          const pageElements = elements.filter(el => el.pageId === page.id);
          const isActive = activePageId === page.id;

          // Calculate canvas size based on orientation
          const isLandscape = page.orientation === 'landscape';
          const canvasW = isLandscape ? CANVAS_HEIGHT : CANVAS_WIDTH; // Swap for landscape
          const canvasH = isLandscape ? CANVAS_WIDTH : CANVAS_HEIGHT;

          return (
            <div
              key={page.id}
              id={`page-container-${page.id}`}
              className={`relative transition-shadow duration-200 ${isActive ? 'ring-2 ring-[#5500FF]/50 shadow-2xl' : 'shadow-lg opacity-90 hover:opacity-100'}`}
              style={{ width: canvasW * zoom, height: canvasH * zoom }}
              onMouseDown={(e) => {
                if (e.button !== 1) handlePageMouseDown(e, page.id); // Don't trigger page select on middle click
              }}
            >
              <div
                ref={el => { pageRefs.current[page.id] = el; }}
                className="bg-white print-container overflow-hidden"
                style={{
                  width: canvasW, height: canvasH,
                  transform: `scale(${zoom})`, transformOrigin: 'top left',
                  position: 'absolute', top: 0, left: 0
                }}
              >
                {pageElements.map(el => (
                  <CanvasElement
                    key={el.id}
                    element={el}
                    isSelected={selectedIds.includes(el.id)}
                    isEditing={editingId === el.id}
                    onMouseDown={handleElementMouseDown}
                    onDoubleClick={(e) => { e.stopPropagation(); onSetEditingId(el.id); }}
                    onResizeStart={handleResizeStart}
                    onRotateStart={handleRotateStart}
                    onUpdate={(update) => {
                      // Support both string (text) and object (image props) updates
                      const updates = typeof update === 'string' ? { content: update } : update;
                      // @ts-ignore - TS might complain about partial match but it's safe
                      const newElements = elements.map(e => e.id === el.id ? { ...e, ...updates } : e);
                      onUpdateElements(newElements);
                    }}
                    onBlur={() => onCommitElements(elementsRef.current)}
                  />
                ))}

                {/* Selection Box Render */}
                {selectionBox && selectionBox.pageId === page.id && (
                  <div style={{
                    position: 'absolute',
                    left: Math.min(selectionBox.start.x, selectionBox.end.x),
                    top: Math.min(selectionBox.start.y, selectionBox.end.y),
                    width: Math.abs(selectionBox.end.x - selectionBox.start.x),
                    height: Math.abs(selectionBox.end.y - selectionBox.start.y),
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid #3b82f6',
                    pointerEvents: 'none',
                    zIndex: 9999
                  }}
                  />
                )}

                {/* Guides Render */}
                {isActive && guides.map((guide, i) => (
                  <div key={i} style={{
                    position: 'absolute',
                    left: guide.type === 'vertical' ? guide.position : 0,
                    top: guide.type === 'horizontal' ? guide.position : 0,
                    width: guide.type === 'vertical' ? '1px' : '100%',
                    height: guide.type === 'horizontal' ? '1px' : '100%',
                    backgroundColor: '#ff00ff', zIndex: 9999, pointerEvents: 'none'
                  }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
