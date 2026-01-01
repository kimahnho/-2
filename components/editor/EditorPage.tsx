import React, { useState } from 'react';
import { Toolbar } from '../Toolbar';
import { PropertiesPanel } from '../PropertiesPanel';
import { PageManager } from '../PageManager';
import { CanvasArea } from '../CanvasArea';
import { TabType, ProjectData, DesignElement } from '../../types';
import { TextCommand, TextStyle } from '../../types/editor.types';
import { Download, Trash2, Printer, Undo2, Redo2, ZoomIn, ZoomOut, Maximize, Loader2, Home, Save, Smartphone, Monitor, X } from 'lucide-react';
import { printCanvas } from '../../utils/exportUtils';
import { ExportModal } from '../ExportModal';
import { ContextMenu } from '../ui/ContextMenu';

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
  const [showGuestBanner, setShowGuestBanner] = useState(true);

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
  const { guides: keyboardGuides } = useKeyboardShortcuts(project);

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

  // --- Middleman State for Text Editing ---
  const [activeTextCommand, setActiveTextCommand] = useState<TextCommand | null>(null);
  const [activeTextStyle, setActiveTextStyle] = useState<TextStyle | null>(null);

  // Wrapper to intercept properties for text editing
  const handlePropertyUpdate = (id: string, updates: Partial<DesignElement>, isCommit: boolean) => {
    // 텍스트 편집 중이고 해당 요소를 업데이트하려 할 때
    if (id === project.editingId) {
      const element = project.elements.find(e => e.id === id);
      if (element?.type === 'text') {
        const cmdId = Date.now().toString();

        let handled = false;
        if (updates.fontFamily) {
          setActiveTextCommand({ type: 'fontName', value: updates.fontFamily, id: cmdId });
          handled = true;
        }
        if (updates.fontSize) {
          setActiveTextCommand({ type: 'fontSize', value: updates.fontSize, id: cmdId });
          handled = true;
        }
        if (updates.color) {
          setActiveTextCommand({ type: 'foreColor', value: updates.color, id: cmdId });
          handled = true;
        }
        if (updates.fontWeight !== undefined) {
          // 600 이상이면 bold
          setActiveTextCommand({ type: 'bold', value: updates.fontWeight >= 600, id: cmdId });
          handled = true;
        }

        if (handled) return;
      }
    }

    project.updateElement(id, updates, isCommit);
  };

  // --- Context Menu & Clipboard Logic ---
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });
  const [clipboard, setClipboard] = useState<DesignElement[]>([]);

  // Handle right click
  const handleContextMenu = (e: React.MouseEvent, type: 'element' | 'canvas', id?: string) => {
    e.preventDefault();
    if (readOnly) return;

    // If clicked on an element, ensure it's selected. 
    // If it's already part of a multi-selection, keep selection.
    if (type === 'element' && id) {
      if (!project.selectedIds.includes(id)) {
        project.setSelectedIds([id]);
      }
    } else {
      // If clicked on canvas background, clear selection
      project.setSelectedIds([]);
      project.setEditingId(null);
    }

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      visible: true
    });
  };

  const handleCopy = () => {
    if (project.selectedIds.length === 0) return;
    const selectedElements = project.elements.filter(el => project.selectedIds.includes(el.id));
    setClipboard(selectedElements);
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleCut = () => {
    handleCopy();
    project.deleteElements(project.selectedIds);
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  // Context Menu Paste Action
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;

      try {
        const data = JSON.parse(text);
        if (data && data.type === 'muru-elements' && Array.isArray(data.data)) {
          const elementsToPaste = data.data as DesignElement[];
          const newIds: string[] = [];
          const newElements = elementsToPaste.map(el => {
            const newId = Math.random().toString(36).substr(2, 9);
            newIds.push(newId);
            return { ...el, id: newId, pageId: project.activePageId, x: el.x + 20, y: el.y + 20 };
          });
          project.updateElements([...project.elements, ...newElements]);
          project.setSelectedIds(newIds);
        } else {
          throw new Error('Not muru-elements');
        }
      } catch {
        // Plain text - create text box
        const newId = Math.random().toString(36).substr(2, 9);
        const newTextElement: DesignElement = {
          id: newId, type: 'text', x: 300, y: 400, width: 300, height: 100,
          content: text, rotation: 0, zIndex: project.elements.length + 1,
          pageId: project.activePageId, fontFamily: 'Pretendard', fontSize: 24,
          color: '#000000', textAlign: 'center', verticalAlign: 'middle', fontWeight: 400,
        } as any;
        project.updateElements([...project.elements, newTextElement]);
        project.setSelectedIds([newId]);
      }
    } catch (err) {
      console.error('Clipboard read failed:', err);
      if (clipboard.length > 0) {
        const newIds: string[] = [];
        const newElements = clipboard.map(el => {
          const newId = Math.random().toString(36).substr(2, 9);
          newIds.push(newId);
          return { ...el, id: newId, pageId: project.activePageId, x: el.x + 20, y: el.y + 20 };
        });
        project.updateElements([...project.elements, ...newElements]);
        project.setSelectedIds(newIds);
      }
    }
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  // --- Smart Paste Logic (Fixed: Using refs for stale closure avoidance) ---
  const projectRef = React.useRef(project);
  React.useEffect(() => { projectRef.current = project; }, [project]);

  // Global Paste Listener
  React.useEffect(() => {
    const handleGlobalPaste = async (e: ClipboardEvent) => {
      // Ignore if input/textarea is focused
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.target instanceof HTMLElement && e.target.isContentEditable) return;

      e.preventDefault();
      const currentProject = projectRef.current;

      // 1. Check for Files (Images)
      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          // Read as Data URL for simplicity (minimal viable paste)
          const reader = new FileReader();
          reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string;
            if (!dataUrl) return;

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
                zIndex: currentProject.elements.length + 1,
                pageId: currentProject.activePageId,
                borderRadius: 0,
              };
              currentProject.updateElements([...currentProject.elements, newEl]);
              currentProject.setSelectedIds([newEl.id]);
            };
            img.src = dataUrl;
          };
          reader.readAsDataURL(file);
          return;
        }
      }

      // 2. Check for Text
      const text = e.clipboardData?.getData('text');
      if (!text) return;

      try {
        const data = JSON.parse(text);
        if (data && data.type === 'muru-elements' && Array.isArray(data.data)) {
          // 3. Paste Elements
          const elementsToPaste = data.data as DesignElement[];
          const newIds: string[] = [];
          const newElements = elementsToPaste.map(el => {
            const newId = Math.random().toString(36).substr(2, 9);
            newIds.push(newId);
            return {
              ...el,
              id: newId,
              pageId: currentProject.activePageId,
              x: el.x + 20,
              y: el.y + 20,
              zIndex: currentProject.elements.length + newIds.length + 1
            };
          });
          currentProject.updateElements([...currentProject.elements, ...newElements]);
          currentProject.setSelectedIds(newIds);
          return;
        }
      } catch {
        // Ignore JSON parse errors - it's plain text
      }

      // 4. Smart Text Paste
      const newId = Math.random().toString(36).substr(2, 9);
      const newTextElement: DesignElement = {
        id: newId,
        type: 'text',
        x: 300,
        y: 400,
        width: 300,
        height: 100,
        content: text,
        rotation: 0,
        zIndex: currentProject.elements.length + 1,
        pageId: currentProject.activePageId,
        fontFamily: 'Pretendard',
        fontSize: 24,
        color: '#000000',
        textAlign: 'center',
        verticalAlign: 'middle',
        fontWeight: 400,
      } as any;

      currentProject.updateElements([...currentProject.elements, newTextElement]);
      currentProject.setSelectedIds([newId]);
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, []); // Empty deps - uses ref for latest state

  const handleDelete = () => {
    project.deleteElements(project.selectedIds);
    setContextMenu(prev => ({ ...prev, visible: false }));
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

      {/* 게스트 모드 경고 배너 */}
      {!readOnly && isGuest && showGuestBanner && (
        <div className="fixed top-0 left-0 right-0 bg-indigo-600 text-white text-center py-2 z-50 font-medium text-sm flex justify-center items-center gap-2 px-4 shadow-md transition-all">
          <span>⚠️ 게스트 모드: 작업 내용이 이 브라우저에만 임시 저장됩니다. 안전한 보관을 위해 로그인을 권장합니다.</span>
          <button
            onClick={() => setShowGuestBanner(false)}
            className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
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
          isGuest={isGuest}
        />
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col relative min-w-0 ${readOnly ? 'pt-10' : ''}`}>

        {/* Top Navigation Bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-2 sm:px-4 shrink-0 z-20 no-print gap-2">
          {/* ... (Header content omitted for brevity, keeping existing structure) ... */}
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
            {/* ... rest of header ... */}
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
            activeTextCommand={activeTextCommand}
            onStyleChange={setActiveTextStyle}
            externalGuides={keyboardGuides}
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
            onContextMenu={handleContextMenu}
            onAddPage={project.addPage}
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
          onUpdate={(id, updates) => handlePropertyUpdate(id, updates, false)}
          onCommit={(id, updates) => handlePropertyUpdate(id, updates, true)}
          onBatchUpdate={(updates) => project.updateMultipleElements(updates, false)}
          onBatchCommit={(updates) => project.updateMultipleElements(updates, true)}
          onDelete={project.deleteElements} onDuplicate={project.duplicateElements}
          onBringForward={project.bringForward} onSendBackward={project.sendBackward}
          onBringToFront={project.bringToFront} onSendToBack={project.sendToBack}
          onAlign={project.alignSelected} onGenerateImage={handleGuestAiGen}
          onUploadImage={imageUpload.handleUploadImage}
          activeTextStyle={activeTextStyle}
          onTextCommand={setActiveTextCommand}
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
          elements={project.elements}
          projectTitle={title}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))}
          onCopy={handleCopy}
          onCut={handleCut}
          onPaste={handlePaste}
          onDelete={handleDelete}
          hasSelection={project.selectedIds.length > 0}
          canPaste={clipboard.length > 0}

          // Grouping
          onGroup={() => {
            if (project.selectedIds.length < 2) return;
            const groupId = Math.random().toString(36).substr(2, 9);
            project.updateElements(project.elements.map(el => {
              if (project.selectedIds.includes(el.id)) {
                return { ...el, groupId };
              }
              return el;
            }), true); // Commit history
            setContextMenu(prev => ({ ...prev, visible: false }));
          }}
          onUngroup={() => {
            project.updateElements(project.elements.map(el => {
              if (project.selectedIds.includes(el.id)) {
                const { groupId, ...rest } = el;
                return rest;
              }
              return el;
            }), true);
            setContextMenu(prev => ({ ...prev, visible: false }));
          }}
          canGroup={project.selectedIds.length >= 2}
          canUngroup={(() => {
            // Can ungroup if ANY selected element is part of a group
            return project.elements.some(el => project.selectedIds.includes(el.id) && el.groupId);
          })()}
        />
      )}
    </div>
  );
};
