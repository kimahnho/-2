
import React, { useState } from 'react';
import { Toolbar } from '../Toolbar';
import { PropertiesPanel } from '../PropertiesPanel';
import { PageManager } from '../PageManager';
import { CanvasArea } from '../CanvasArea';
import { TabType, ProjectData } from '../../types';
import { Download, Trash2, Printer, Undo2, Redo2, ZoomIn, ZoomOut, Maximize, Loader2, Home, Save, Smartphone, Monitor } from 'lucide-react';
import { printCanvas } from '../../utils/exportUtils';
import { ExportModal } from '../ExportModal';

// Custom Hooks - Logic Layer
import { useProject } from '../../hooks/useProject';
import { useCharacters } from '../../hooks/useCharacters';
import { useViewport } from '../../hooks/useViewport';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useAppActions } from '../../hooks/useAppActions';

// NEW MECE Hooks
import { useAAC } from '../../hooks/useAAC';
import { useImageUpload } from '../../hooks/useImageUpload';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useCardInsertion } from '../../hooks/useCardInsertion';

interface Props {
  projectId: string;
  initialData?: ProjectData;
  initialTitle?: string;
  onBack: () => void;
  isGuest?: boolean;
  readOnly?: boolean;
}

export const EditorPage: React.FC<Props> = ({ projectId, initialData, initialTitle, onBack, isGuest = false, readOnly = false }) => {
  // --- 1. Domain State (Data) ---
  const project = useProject(initialData);
  const characterManager = useCharacters();

  // --- 2. View State (UI) ---
  const viewport = useViewport();
  const [activeTab, setActiveTab] = useState<TabType>('design');
  const [title, setTitle] = useState(initialTitle || '제목 없는 디자인');
  const [uploadedAssets, setUploadedAssets] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);

  // Simple helper for assets
  const handleSaveAsset = (url: string) => {
    setUploadedAssets(prev => prev.includes(url) ? prev : [url, ...prev]);
  };

  // --- 3. MECE Hooks ---
  const autoSave = useAutoSave({
    elements: project.elements,
    pages: project.pages,
    title,
    projectId,
    isGuest
  });

  const imageUpload = useImageUpload({
    elements: project.elements,
    selectedIds: project.selectedIds,
    activePageId: project.activePageId,
    updateElement: project.updateElement,
    updateElements: project.updateElements,
    setSelectedIds: project.setSelectedIds,
    onSaveAsset: handleSaveAsset
  });

  const cardInsertion = useCardInsertion({
    elements: project.elements,
    activePageId: project.activePageId,
    updateElements: project.updateElements,
    setSelectedIds: project.setSelectedIds
  });

  const aac = useAAC({
    elements: project.elements,
    selectedIds: project.selectedIds,
    activePageId: project.activePageId,
    activeTab,
    setActiveTab,
    updateElements: project.updateElements,
    setSelectedIds: project.setSelectedIds
  });

  // --- 4. Business Logic (Composite Actions) ---
  const actions = useAppActions(project, title, handleSaveAsset);

  // Guest AI Limit Check Wrapper
  const handleGuestAiGen = async (id: string, prompt: string, style: 'character' | 'realistic' | 'emoji') => {
    if (isGuest) {
      const count = parseInt(localStorage.getItem('guest_ai_count') || '0');
      if (count >= 3) {
        alert('게스트 모드에서는 AI 기능을 3회까지만 사용할 수 있습니다.\n로그인하고 무제한으로 이용해보세요!');
        return;
      }
      localStorage.setItem('guest_ai_count', (count + 1).toString());
    }
    await actions.handleAiImageFill(id, prompt, style);
  };

  // --- 5. Input Handling (Keyboard) ---
  useKeyboardShortcuts(project);

  // Wrapper to select page and clear element selection
  const handleSelectPage = (pageId: string) => {
    if (pageId !== project.activePageId) {
      project.setActivePageId(pageId);
      setTimeout(() => {
        const el = document.getElementById(`page-container-${pageId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 0);
    }
    project.setSelectedIds([]);
    project.setEditingId(null);
  };

  return (
    <div className={`flex h-screen bg-gray-100 overflow-hidden font-sans select-none ${viewport.isPanning ? 'cursor-grabbing' : ''}`}
      onMouseMove={viewport.handlePanMove} onMouseUp={viewport.endPan} onWheel={viewport.handleWheel}
      onDoubleClickCapture={readOnly ? undefined : aac.handleCanvasDoubleClick}>

      {/* 읽기 전용 모드 배너 */}
      {readOnly && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-50 font-medium text-sm">
          🔒 읽기 전용 모드 - 편집이 비활성화되었습니다
        </div>
      )}

      {/* Left Sidebar: Toolbar */}
      {!readOnly && (
        <Toolbar
          activeTab={activeTab} onTabChange={setActiveTab}
          onAddElement={project.addElement} onLoadTemplate={project.loadTemplate}
          onUpdatePageOrientation={(orientation) => project.updatePageOrientation(project.activePageId, orientation)}

          // AAC Props
          onSelectAACCard={aac.handleSelectAACCard}
          currentAACCardIndex={aac.currentAACCardIndex}
          totalAACCards={aac.totalAACCards}
          uploadedAssets={uploadedAssets} onSaveAsset={handleSaveAsset}
          characters={characterManager.characters}
          onAddCharacter={characterManager.addCharacter}
          onDeleteCharacter={characterManager.deleteCharacter}
          onAddEmotionToCharacter={characterManager.addEmotionToCharacter}
          onDeleteEmotionFromCharacter={characterManager.deleteEmotionFromCharacter}
          onUpdateEmotionLabel={characterManager.updateEmotionLabel}
          onApplyEmotion={actions.handleApplyEmotion}
          onAddElementWithCaption={actions.handleAddImageWithCaption}
          onLogoClick={onBack}
          onAddEmotionCard={cardInsertion.handleAddEmotionCard}
          onAddAACCard={cardInsertion.handleAddAACCard}
          onUploadImage={imageUpload.handleUploadImage}
        />
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col relative min-w-0 ${readOnly ? 'pt-10' : ''}`}>

        {/* Top Navigation Bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-2 sm:px-4 shrink-0 z-20 no-print gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-[#5500FF] transition-colors shrink-0" title="뒤로 가기">
              <Home className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
            {readOnly ? (
              <span className="font-bold text-gray-800 text-sm sm:text-lg px-2 py-1">{title}</span>
            ) : (
              <input value={title} onChange={e => setTitle(e.target.value)} className="font-bold text-gray-800 text-sm sm:text-lg bg-transparent border border-transparent hover:border-gray-200 focus:border-[#5500FF] rounded px-2 py-1 outline-none transition-all w-24 sm:w-40 md:w-64 min-w-0" />
            )}
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 min-w-[80px]">
              {readOnly ? (
                <span className="text-yellow-600 font-medium">🔒 읽기 전용</span>
              ) : isGuest ? (
                <span className="text-orange-500 font-medium">게스트 모드</span>
              ) : (
                autoSave.isSaving ? <><Loader2 className="w-3 h-3 animate-spin" /> 저장 중...</> : <><Save className="w-3 h-3" /> 저장됨</>
              )}
            </div>
            <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
            <div className="hidden md:flex gap-1">
              <button onClick={project.undo} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" title="실행 취소 (Ctrl+Z)"><Undo2 className="w-4 h-4" /></button>
              <button onClick={project.redo} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" title="다시 실행 (Ctrl+Shift+Z)"><Redo2 className="w-4 h-4" /></button>
            </div>
            <div className="h-6 w-px bg-gray-200 hidden lg:block"></div>
            {/* 페이지 방향 토글 */}
            <div className="hidden lg:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => project.updatePageOrientation(project.activePageId, 'portrait')}
                className={`p-1.5 rounded-md transition-all flex items-center gap-1.5 text-xs font-medium ${project.getActivePageOrientation() === 'portrait'
                  ? 'bg-white text-[#5500FF] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
                title="세로 방향"
              >
                <Smartphone className="w-4 h-4" />
                <span className="hidden xl:inline">세로</span>
              </button>
              <button
                onClick={() => project.updatePageOrientation(project.activePageId, 'landscape')}
                className={`p-1.5 rounded-md transition-all flex items-center gap-1.5 text-xs font-medium ${project.getActivePageOrientation() === 'landscape'
                  ? 'bg-white text-[#5500FF] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
                title="가로 방향"
              >
                <Monitor className="w-4 h-4" />
                <span className="hidden xl:inline">가로</span>
              </button>
            </div>
          </div>
          <div className="flex gap-1 sm:gap-2 shrink-0">
            {!readOnly && <button onClick={() => { if (window.confirm("현재 페이지의 요소를 초기화하시겠습니까?")) { project.deleteElements(project.elements.filter(e => e.pageId === project.activePageId).map(e => e.id)); } }} className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-lg"><Trash2 className="w-4 h-4 sm:w-5 sm:h-5" /></button>}
            <button onClick={printCanvas} className="p-2 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-lg"><Printer className="w-4 h-4 sm:w-5 sm:h-5" /></button>
            <button onClick={() => setShowExportModal(true)} className="bg-[#5500FF] text-white px-2 sm:px-4 py-2 rounded-lg font-medium hover:bg-[#4400cc] flex items-center gap-1 sm:gap-2 transition-all text-xs sm:text-sm">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">내보내기</span>
            </button>
          </div>
        </header>

        {/* Canvas Workspace */}
        <div ref={viewport.scrollContainerRef} className="flex-1 overflow-hidden relative flex flex-col" onMouseDown={viewport.startPan}>
          <CanvasArea
            pages={project.pages}
            elements={project.elements}
            activePageId={project.activePageId}
            selectedIds={project.selectedIds}
            zoom={viewport.zoom}
            editingId={project.editingId}
            onSelectPage={handleSelectPage}
            onUpdateElements={(els) => project.updateElements(els, false)}
            onCommitElements={(els) => project.updateElements(els, true)}
            onSetSelectedIds={project.setSelectedIds}
            onSetEditingId={readOnly ? () => { } : project.setEditingId}
            onSetActiveTab={setActiveTab}
            readOnly={readOnly}
            onAddImageElement={readOnly ? () => { } : (dataUrl) => {
              const img = new Image();
              img.onload = () => {
                const maxSize = 400;
                const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
                const width = img.width * ratio;
                const height = img.height * ratio;
                const x = (800 - width) / 2;
                const y = (1132 - height) / 2;
                const newEl = {
                  id: Math.random().toString(36).substr(2, 9),
                  type: 'image' as const,
                  x, y, width, height,
                  content: dataUrl,
                  rotation: 0,
                  zIndex: project.elements.length + 1,
                  pageId: project.activePageId,
                  borderRadius: 0,
                };
                project.updateElements([...project.elements, newEl]);
                project.setSelectedIds([newEl.id]);
                handleSaveAsset(dataUrl);
              };
              img.src = dataUrl;
            }}
          />
        </div>

        {/* Floating Zoom Controls */}
        <div className="absolute bottom-[220px] right-8 flex flex-col gap-2 z-40 no-print">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-1 flex flex-col items-center">
            <button onClick={viewport.zoomFit} className="p-2 hover:bg-gray-100 rounded text-gray-600"><Maximize className="w-4 h-4" /></button>
          </div>
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-1 flex flex-col items-center gap-1">
            <button onClick={viewport.zoomIn} className="p-2 hover:bg-gray-100 rounded text-gray-600"><ZoomIn className="w-4 h-4" /></button>
            <span className="text-[10px] font-bold py-1 px-1 w-full text-center text-gray-600">{Math.round(viewport.zoom * 100)}%</span>
            <button onClick={viewport.zoomOut} className="p-2 hover:bg-gray-100 rounded text-gray-600"><ZoomOut className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Bottom Bar: Page Manager */}
        {readOnly ? (
          <div className="h-[60px] bg-white border-t border-gray-200 flex items-center justify-center text-gray-500 text-sm">
            🔒 페이지 관리 비활성화됨
          </div>
        ) : (
          <PageManager
            pages={project.pages} elements={project.elements} activePageId={project.activePageId}
            onSelectPage={handleSelectPage} onMovePage={project.movePage}
            onDeletePage={project.deletePage} onDuplicatePage={project.duplicatePage} onAddPage={project.addPage}
          />
        )}
      </div>

      {/* Right Sidebar: Properties */}
      {!readOnly && (
        <PropertiesPanel
          elements={project.elements} selectedIds={project.selectedIds}
          onUpdate={(id, updates) => project.updateElement(id, updates, false)}
          onCommit={(id, updates) => project.updateElement(id, updates, true)}
          onBatchUpdate={(updates) => project.updateMultipleElements(updates, false)}
          onBatchCommit={(updates) => project.updateMultipleElements(updates, true)}
          onDelete={project.deleteElements} onDuplicate={project.duplicateElements}
          onBringForward={project.bringForward} onSendBackward={project.sendBackward}
          onBringToFront={project.bringToFront} onSendToBack={project.sendToBack}
          onAlign={project.alignSelected} onGenerateImage={handleGuestAiGen}
          onUploadImage={imageUpload.handleUploadImage}
        />
      )}

      {/* Hidden file input for image upload */}
      <input
        ref={imageUpload.fileInputRef}
        type="file"
        accept="image/*"
        onChange={imageUpload.handleFileChange}
        className="hidden"
      />

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          pages={project.pages}
          projectTitle={title}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};
