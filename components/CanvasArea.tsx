
import React from 'react';
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
    onSetActiveTab
  } = props;

  const {
    guides,
    selectionBox,
    pageRefs,
    handlePageMouseDown,
    handleElementMouseDown,
    handleResizeStart,
    handleRotateStart,
    handleMouseMove,
    handleMouseUp
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

  // Debug log
  console.log('[CanvasArea] Rendering with pages:', pages.length, 'activePageId:', activePageId);

  return (
    <div
      className="flex-1 overflow-auto bg-gray-100 relative custom-scrollbar flex flex-col items-center"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
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
              onMouseDown={(e) => handlePageMouseDown(e, page.id)}
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
                    onBlur={() => onCommitElements(elements)}
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
