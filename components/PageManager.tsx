
import React, { useRef, useState } from 'react';
import { Page, DesignElement } from '../types';
import { PRESET_COLORS } from '../constants';
import { Trash2, Copy, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { MiniElementRenderer } from './MiniElementRenderer';

interface Props {
  pages: Page[];
  elements: DesignElement[];
  activePageId: string;
  onSelectPage: (id: string) => void;
  onMovePage: (fromIndex: number, toIndex: number) => void;
  onDeletePage: (id: string) => void;
  onDuplicatePage: (id: string) => void;
  onAddPage: () => void;
}

const THUMBNAIL_SCALE = 0.1; // 800px -> 80px width, 1123px -> 112.3px height
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 1123;

export const PageManager: React.FC<Props> = ({
  pages,
  elements,
  activePageId,
  onSelectPage,
  onMovePage,
  onDeletePage,
  onDuplicatePage,
  onAddPage
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const thumbWidth = CANVAS_WIDTH * THUMBNAIL_SCALE;
  const thumbHeight = CANVAS_HEIGHT * THUMBNAIL_SCALE;

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Transparent drag image
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    onMovePage(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="h-[200px] bg-white border-t border-gray-200 flex flex-col shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] no-print transition-all">
      <div className="h-9 px-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/80">
        <span className="text-xs font-bold text-gray-600 flex items-center gap-2">
          페이지 목록 <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px]">{pages.length}</span>
        </span>
        <div className="text-[10px] text-gray-400">드래그하여 순서 변경</div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden flex items-start px-4 gap-4 custom-scrollbar bg-gray-50/30 pt-4">
        {pages.map((page, index) => {
          const pageElements = elements.filter(el => el.pageId === page.id || (!el.pageId && index === 0 && pages.length === 1));
          const isActive = activePageId === page.id;

          // 페이지 방향에 따른 캔버스 크기 계산
          const isLandscape = page.orientation === 'landscape';
          const pageCanvasWidth = isLandscape ? CANVAS_HEIGHT : CANVAS_WIDTH;
          const pageCanvasHeight = isLandscape ? CANVAS_WIDTH : CANVAS_HEIGHT;
          const pageThumbWidth = pageCanvasWidth * THUMBNAIL_SCALE;
          const pageThumbHeight = pageCanvasHeight * THUMBNAIL_SCALE;

          return (
            <div
              key={page.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onClick={(e) => {
                // Explicitly focus this element to ensure keyboard events (like Delete, Ctrl+C) work
                e.currentTarget.focus();
                onSelectPage(page.id);
              }}
              tabIndex={0} // Make it focusable
              className={`page-thumbnail group relative flex-shrink-0 flex flex-col items-center gap-2 transition-all duration-200 outline-none ${isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                }`}
            >
              {/* Thumbnail Container */}
              <div
                className={`relative bg-white rounded-md overflow-hidden cursor-pointer transition-all ${isActive
                  ? 'ring-2 ring-[#5500FF] shadow-md scale-[1.02]'
                  : 'ring-1 ring-gray-200 hover:ring-[#B0C0ff] hover:shadow-sm'
                  }`}
                style={{
                  width: pageThumbWidth,
                  height: pageThumbHeight,
                }}
              >
                {/* Scaled Preview */}
                <div
                  style={{
                    width: pageCanvasWidth,
                    height: pageCanvasHeight,
                    transform: `scale(${THUMBNAIL_SCALE})`,
                    transformOrigin: 'top left',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    pointerEvents: 'none',
                    backgroundColor: 'white'
                  }}
                >
                  {pageElements.map(el => (
                    <MiniElementRenderer key={el.id} element={el} />
                  ))}
                </div>

                {/* Page Number Badge */}
                <div className={`absolute bottom-1 right-1 text-[9px] px-1.5 py-0.5 rounded-full backdrop-blur-sm font-medium ${isActive ? 'bg-[#5500FF] text-white' : 'bg-black/40 text-white'
                  }`}>
                  {index + 1}
                </div>

                {/* Hover Actions Overlay (Move Left/Right) */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white rounded-md shadow-sm border border-gray-100 flex overflow-hidden transform scale-90">
                    <button
                      onClick={(e) => { e.stopPropagation(); onMovePage(index, index - 1); }}
                      className="p-1 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white text-gray-600"
                      disabled={index === 0}
                      title="왼쪽으로 이동"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <div className="w-px bg-gray-100"></div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onMovePage(index, index + 1); }}
                      className="p-1 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white text-gray-600"
                      disabled={index === pages.length - 1}
                      title="오른쪽으로 이동"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons Below (Duplicate/Delete) */}
              <div className={`flex items-center justify-center gap-2 transition-opacity ${isActive || 'group-hover:opacity-100 opacity-0'}`}>
                <button
                  onClick={(e) => { e.stopPropagation(); onDuplicatePage(page.id); }}
                  className="p-1.5 rounded-md bg-white border border-gray-200 text-gray-400 hover:text-[#5500FF] hover:border-[#5500FF] hover:bg-[#5500FF]/5 shadow-sm transition-all"
                  title="페이지 복제 (Ctrl+D)"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeletePage(page.id); }}
                  className="p-1.5 rounded-md bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-500 hover:bg-red-50 shadow-sm transition-all"
                  title="페이지 삭제 (Delete)"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Add Page Button at the end */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onAddPage}
            style={{ width: thumbWidth, height: thumbHeight }}
            className="flex-shrink-0 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-[#5500FF] hover:bg-[#5500FF]/5 text-gray-400 hover:text-[#5500FF] transition-all group bg-white"
          >
            <div className="p-2 rounded-full bg-gray-50 group-hover:bg-white group-hover:shadow-sm transition-all">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium">페이지 추가</span>
          </button>
        </div>

      </div>
    </div>
  );
};
