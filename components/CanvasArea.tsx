
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { DesignElement, Page, TextCommand, TextStyle } from '../types/editor.types';
import { Guide } from '../types';
import { isHtmlEmpty } from '../utils/textUtils';
import { CanvasElement } from './CanvasElement';
import { SelectionOverlay } from './canvas/SelectionOverlay';
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
  readOnly?: boolean; // 관리자 읽기 전용 모드
  activeTextCommand?: TextCommand | null;
  onStyleChange?: (style: TextStyle) => void;
  externalGuides?: Guide[];
  onContextMenu?: (e: React.MouseEvent, type: 'element' | 'canvas', id?: string) => void;
  onAddPage?: (orientation?: 'portrait' | 'landscape', index?: number) => void;
  onTab: (id: string, shiftKey: boolean) => void; // Added onTab prop
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
    onAddImageElement,
    readOnly = false,
    activeTextCommand,
    onStyleChange,
    externalGuides,
    onContextMenu,
    onAddPage
  } = props;

  // Panning state
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePos = useRef<{ x: number, y: number } | null>(null);
  const elementsRef = useRef(elements);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  const {
    guides,
    selectionBox, // Used for internal logic but we will render custom overlay if needed, or keep existing? SelectionBox (blue drag box) is different from SelectionOverlay (frame around selected items). We KEEP SelectionBox logic in useCanvasEvents.
    pageRefs,
    handlePageMouseDown,
    handleElementMouseDown,
    handleResizeStart,
    handleRotateStart,
    handleMouseMove,
    handleMouseUp,
    handleBackgroundMouseDown
  } = useCanvasEvents({
    elements,
    activePageId,
    selectedIds,
    zoom,
    // viewport, setViewport removed as they are not in UseCanvasEventsProps
    onSelectPage,
    onSetSelectedIds,
    onSetEditingId,
    onUpdateElements,
    onCommitElements,
    onSetActiveTab
  });

  // Handle mouse down/move/up for panning wrapper and canvas events
  const handleCanvasAreaMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
    handleBackgroundMouseDown(e);
  }, [handleBackgroundMouseDown]);

  const handleCanvasAreaMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && scrollContainerRef.current && lastMousePos.current) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      scrollContainerRef.current.scrollLeft -= dx;
      scrollContainerRef.current.scrollTop -= dy;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
    handleMouseMove(e);
  }, [isPanning, handleMouseMove]);

  const handleCanvasAreaMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      lastMousePos.current = null;
    }
    handleMouseUp();
  }, [isPanning, handleMouseUp]);

  const handleAuxClick = useCallback((e: React.MouseEvent) => {
    if (e.button === 1) e.preventDefault();
  }, []);

  // Drag handlers
  const [isDragOver, setIsDragOver] = useState(false);
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) setIsDragOver(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragOver(false);
  }, []);

  // ... handleDrop (kept same)
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) { alert('파일 크기는 10MB 이하로 제한됩니다.'); return; }
    try {
      let imageUrl: string;
      const { uploadToCloudinary, isCloudinaryConfigured } = await import('../services/cloudinaryService');
      if (isCloudinaryConfigured()) {
        const result = await uploadToCloudinary(file, { folder: 'muru-assets/user-uploads', tags: ['user-upload'] });
        imageUrl = result.secureUrl;
      } else {
        const { compressImage } = await import('../utils/imageUtils');
        imageUrl = await compressImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.8, maxSizeKB: 500 });
      }
      if (onAddImageElement) onAddImageElement(imageUrl);
    } catch (error) { console.error('Image upload failed:', error); alert('실패'); }
  }, [onAddImageElement]);


  // Handle Tab
  const handleTab = useCallback((currentId: string, shiftKey: boolean = false) => {
    const pageElements = elementsRef.current.filter(el => el.pageId === activePageId);
    const currentElement = pageElements.find(el => el.id === currentId);
    if (!currentElement) return;

    const targetType = currentElement.type;
    const isTextMode = targetType === 'text';

    const siblingElements = pageElements.filter(el => {
      if (isTextMode) return el.type === 'text' || el.content === '“○○”을 찾아봐!';
      return el.type === targetType;
    });

    if (siblingElements.length === 0) return;

    siblingElements.sort((a, b) => {
      const yDiff = Math.abs(a.y - b.y);
      if (yDiff < 20) return a.x - b.x;
      return a.y - b.y;
    });

    const currentIndex = siblingElements.findIndex(el => el.id === currentId);
    if (currentIndex !== -1) {
      const nextIndex = (currentIndex + 1) % siblingElements.length;
      const nextElement = siblingElements[nextIndex];
      if (isTextMode) { onSetEditingId(nextElement.id); }
      else { onSetSelectedIds([nextElement.id]); if (editingId) onSetEditingId(null); }
    }
  }, [activePageId, onSetEditingId, onSetSelectedIds, editingId]);

  // Global Tab Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !editingId && selectedIds.length === 1) {
        e.preventDefault();
        handleTab(selectedIds[0]);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [editingId, selectedIds, handleTab]);

  return (
    <div
      ref={scrollContainerRef}
      className={`flex-1 overflow-auto bg-gray-100 relative custom-scrollbar flex flex-col items-center transition-colors ${isDragOver ? 'bg-blue-100' : ''}`}
      style={{ cursor: isPanning ? 'grabbing' : 'default' }}
      onMouseDown={handleCanvasAreaMouseDown}
      onMouseMove={handleCanvasAreaMouseMove}
      onMouseUp={handleCanvasAreaMouseUp}
      onMouseLeave={handleCanvasAreaMouseUp}
      onAuxClick={handleAuxClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-500/20 border-4 border-dashed border-blue-500 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white px-6 py-4 rounded-xl shadow-lg text-blue-600 font-bold text-lg">여기에 이미지를 놓으세요</div>
        </div>
      )}
      <div className="py-12 flex flex-col gap-8 pb-32">
        {pages.map((page, index) => {
          const pageElements = elements.filter(el => el.pageId === page.id);
          const isActive = activePageId === page.id;
          const isLandscape = page.orientation === 'landscape';
          const canvasW = isLandscape ? CANVAS_HEIGHT : CANVAS_WIDTH;
          const canvasH = isLandscape ? CANVAS_WIDTH : CANVAS_HEIGHT;

          return (
            <React.Fragment key={page.id}>
              <div
                id={`page-container-${page.id}`}
                className={`relative transition-shadow duration-200 ${isActive ? 'ring-2 ring-[#5500FF]/50 shadow-2xl' : 'shadow-lg opacity-90 hover:opacity-100'}`}
                style={{ width: canvasW * zoom, height: canvasH * zoom }}
                onMouseDown={(e) => { if (e.button !== 1) handlePageMouseDown(e, page.id); }}
                onContextMenu={(e) => {
                  if (readOnly) return;
                  if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('bg-white')) {
                    onContextMenu?.(e, 'canvas');
                  }
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
                  {pageElements.map(el => {
                    // Logic for Selection Style
                    // 1. If part of a group AND the group is actively selected implies we treat it as a unit -> 'none' (Overlay handles group box)
                    // 2. If Single Selected -> 'none' (Overlay handles single box)
                    // 3. If Multi-Selected (Ungrouped) -> 'border' (Show individual cues + Overlay handles big box)

                    const isSelected = !readOnly && selectedIds.includes(el.id);
                    const isGrouped = !!el.groupId;
                    const isMultiSelect = selectedIds.length > 1;

                    let selectionStyle: 'none' | 'border' | 'default' = 'default';

                    if (!isSelected) {
                      selectionStyle = 'none';
                    } else {
                      // It IS selected.
                      if (isGrouped) {
                        // If grouped, we hide individual borders because the group should look like one object.
                        // The SelectionOverlay will draw the box around the whole group.
                        selectionStyle = 'none';
                      } else if (isMultiSelect) {
                        // Multiple ungrouped items. Show 'border' for each to indicate they are separate but selected.
                        selectionStyle = 'border';
                      } else {
                        // Single ungrouped item.
                        // SelectionOverlay draws the frame. Can we hide this? 
                        // Yes, Overlay handles single items too.
                        selectionStyle = 'none';
                      }
                    }

                    return (
                      <CanvasElement
                        key={el.id}
                        element={el}
                        isSelected={isSelected}
                        isEditing={!readOnly && editingId === el.id}
                        onMouseDown={readOnly ? () => { } : handleElementMouseDown}
                        onDoubleClick={readOnly ? () => { } : (e) => { e.stopPropagation(); onSetEditingId(el.id); }}
                        onResizeStart={readOnly ? () => { } : handleResizeStart}
                        onRotateStart={readOnly ? () => { } : handleRotateStart}
                        onUpdate={readOnly ? () => { } : (update) => {
                          const updates = typeof update === 'string' ? { content: update } : update;
                          // @ts-ignore
                          const newElements = elements.map(e => e.id === el.id ? { ...e, ...updates } : e);
                          onUpdateElements(newElements);
                        }}
                        onBlur={readOnly ? () => { } : (val) => {
                          if (typeof val === 'string') {
                            // Always save, even if empty - no auto-delete
                            const updated = elementsRef.current.map(e => e.id === el.id ? { ...e, richTextHtml: val } : e);
                            onCommitElements(updated);
                          } else {
                            onCommitElements(elementsRef.current);
                          }
                          onSetEditingId(null);
                        }}
                        textCommand={editingId === el.id ? activeTextCommand : null}
                        onTextStyleChange={onStyleChange}
                        onContextMenu={readOnly ? undefined : (e, id) => onContextMenu?.(e, 'element', id)}
                        onTab={handleTab}
                        selectionStyle={selectionStyle}
                      />
                    );
                  })}

                  {/* Unified Selection Overlay */}
                  {!readOnly && isActive && !editingId && (
                    <SelectionOverlay
                      elements={elements}
                      selectedIds={selectedIds}
                      zoom={zoom}
                      onResizeStart={handleResizeStart}
                      onRotateStart={handleRotateStart}
                      showRotationHandle={selectedIds.length === 1}
                    />
                  )}

                  {/* Selection Box (Blue Drag Rect) */}
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
                    }} />
                  )}

                  {/* Guides */}
                  {isActive && [...guides, ...(externalGuides || [])].map((guide, i) => (
                    <div key={i} style={{
                      position: 'absolute',
                      left: guide.type === 'vertical' ? guide.position : 0,
                      top: guide.type === 'horizontal' ? guide.position : 0,
                      width: guide.type === 'vertical' ? '1px' : '100%',
                      height: guide.type === 'horizontal' ? '1px' : '100%',
                      backgroundColor: '#ff00ff', zIndex: 9999, pointerEvents: 'none'
                    }} />
                  ))}
                </div>
              </div>

              {!readOnly && onAddPage && (
                <div
                  className="h-8 w-full relative group flex items-center justify-center cursor-pointer z-10"
                  onClick={() => onAddPage(page.orientation, index + 1)}
                  title="여기에 새 페이지 추가"
                >
                  <div className="absolute inset-x-0 mx-auto w-[600px] h-0.5 bg-[#5500FF] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-6 h-6 rounded-full bg-[#5500FF] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg transform scale-0 group-hover:scale-100">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
