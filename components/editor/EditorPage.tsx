
import React, { useState, useEffect, useRef } from 'react';
import { Toolbar } from '../Toolbar';
import { PropertiesPanel } from '../PropertiesPanel';
import { PageManager } from '../PageManager';
import { CanvasArea } from '../CanvasArea';
import { TabType, ProjectData } from '../../types';
import { Download, Trash2, Printer, Undo2, Redo2, ZoomIn, ZoomOut, Maximize, Loader2, Home, Save } from 'lucide-react';
import { printCanvas } from '../../utils/exportUtils';
import { storageService } from '../../services/storageService';

// Custom Hooks - Logic Layer
import { useProject } from '../../hooks/useProject';
import { useCharacters } from '../../hooks/useCharacters';
import { useViewport } from '../../hooks/useViewport';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useAppActions } from '../../hooks/useAppActions';

interface Props {
  projectId: string;
  initialData?: ProjectData;
  initialTitle?: string;
  onBack: () => void;
  isGuest?: boolean; // Added
}

export const EditorPage: React.FC<Props> = ({ projectId, initialData, initialTitle, onBack, isGuest = false }) => {
  // --- 1. Domain State (Data) ---
  const project = useProject(initialData);
  const characterManager = useCharacters();

  // --- 2. View State (UI) ---
  const viewport = useViewport();
  const [activeTab, setActiveTab] = useState<TabType | null>('design');
  const [title, setTitle] = useState(initialTitle || '제목 없는 디자인');
  const [uploadedAssets, setUploadedAssets] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Simple helper for assets
  const handleSaveAsset = (url: string) => {
    setUploadedAssets(prev => prev.includes(url) ? prev : [url, ...prev]);
  };


  // --- 3. Business Logic (Composite Actions) ---
  // AI 사용 제한을 위해 handleAiImageFill 래핑 필요하지만, useAppActions 내부 수정이 깔끔함.
  // 여기서는 useEffect 제어만 수행.
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

  // --- 4. Input Handling (Keyboard) ---
  useKeyboardShortcuts(project);

  // --- Auto Save Logic ---
  const saveTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (isGuest) return; // Disable auto-save for guest

    // Debounce save
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(() => {
      const projectData: ProjectData = {
        elements: project.elements,
        pages: project.pages
      };
      storageService.saveProject(projectId, projectData, title);
      setIsSaving(false);
    }, 1000); // Save after 1 second of inactivity

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [project.elements, project.pages, title, projectId, isGuest]);

  // Wrapper to select page and clear element selection
  const handleSelectPage = (pageId: string) => {
    project.setActivePageId(pageId);
    project.setSelectedIds([]);
    project.setEditingId(null);
  };

  // Auto-scroll to active page
  useEffect(() => {
    const el = document.getElementById(`page-container-${project.activePageId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [project.activePageId]);

  return (
    <div className={`flex h-screen bg-gray-100 overflow-hidden font-sans select-none ${viewport.isPanning ? 'cursor-grabbing' : ''}`}
      onMouseMove={viewport.handlePanMove} onMouseUp={viewport.endPan} onWheel={viewport.handleWheel}>

      {/* Left Sidebar: Toolbar */}
      <Toolbar
        activeTab={activeTab} onTabChange={setActiveTab}
        onAddElement={project.addElement} onLoadTemplate={project.loadTemplate}
        onAddPage={project.addPage}
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
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative min-w-0">

        {/* Top Navigation Bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-20 no-print">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-[#5500FF] transition-colors" title="대시보드로 돌아가기">
              <Home className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-gray-200"></div>
            <input value={title} onChange={e => setTitle(e.target.value)} className="font-bold text-gray-800 text-lg bg-transparent border border-transparent hover:border-gray-200 focus:border-[#5500FF] rounded px-2 py-1 outline-none transition-all w-64" />
            <div className="flex items-center gap-2 text-xs text-gray-400 min-w-[80px]">
              {isGuest ? (
                <span className="text-orange-500 font-medium">게스트 모드 (저장 안 됨)</span>
              ) : (
                isSaving ? <><Loader2 className="w-3 h-3 animate-spin" /> 저장 중...</> : <><Save className="w-3 h-3" /> 저장됨</>
              )}
            </div>
            <div className="h-6 w-px bg-gray-200"></div>
            <div className="flex gap-1">
              <button onClick={project.undo} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" title="실행 취소 (Ctrl+Z)"><Undo2 className="w-4 h-4" /></button>
              <button onClick={project.redo} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" title="다시 실행 (Ctrl+Shift+Z)"><Redo2 className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { if (window.confirm("현재 페이지의 요소를 초기화하시겠습니까?")) { project.deleteElements(project.elements.filter(e => e.pageId === project.activePageId).map(e => e.id)); } }} className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-lg"><Trash2 className="w-5 h-5" /></button>
            <button onClick={printCanvas} className="p-2 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-lg"><Printer className="w-5 h-5" /></button>
            <button onClick={actions.handleExport} disabled={actions.isExporting} className="bg-[#5500FF] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#4400cc] flex items-center gap-2 transition-all">
              {actions.isExporting ? <Loader2 className="animate-spin w-4 h-4" /> : <Download className="w-4 h-4" />} 내보내기
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
            // Pass commit=false for live dragging
            onUpdateElements={(els) => project.updateElements(els, false)}
            // Pass commit=true for final state (Mouse Up)
            onCommitElements={(els) => project.updateElements(els, true)}
            onSetSelectedIds={project.setSelectedIds}
            onSetEditingId={project.setEditingId}
            onSetActiveTab={setActiveTab}
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
        <PageManager
          pages={project.pages} elements={project.elements} activePageId={project.activePageId}
          onSelectPage={handleSelectPage} onMovePage={project.movePage}
          onDeletePage={project.deletePage} onDuplicatePage={project.duplicatePage} onAddPage={project.addPage}
        />
      </div>

      {/* Right Sidebar: Properties */}
      <PropertiesPanel
        elements={project.elements} selectedIds={project.selectedIds}
        onUpdate={(id, updates) => project.updateElement(id, updates, false)}
        onCommit={(id, updates) => project.updateElement(id, updates, true)}
        onDelete={project.deleteElements} onDuplicate={project.duplicateElements}
        onBringForward={project.bringForward} onSendBackward={project.sendBackward}
        onBringToFront={project.bringToFront} onSendToBack={project.sendToBack}
        onAlign={project.alignSelected} onGenerateImage={handleGuestAiGen}
      />
    </div>
  );
};
