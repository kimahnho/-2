
import React, { useState, useEffect, useRef } from 'react';
// import { renderToStaticMarkup } from 'react-dom/server'; // Removed to prevent build/runtime errors in CSR
import { AACCard } from '../toolbar/AACPanel';
import { Toolbar } from '../Toolbar';
import { PropertiesPanel } from '../PropertiesPanel';
import { PageManager } from '../PageManager';
import { CanvasArea } from '../CanvasArea';
import { TabType, ProjectData } from '../../types';
import { Download, Trash2, Printer, Undo2, Redo2, ZoomIn, ZoomOut, Maximize, Loader2, Home, Save, Smartphone, Monitor } from 'lucide-react';
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

  // --- AAC Logic ---
  const [currentAACCardIndex, setCurrentAACCardIndex] = useState<number | undefined>(undefined);

  const [totalAACCards, setTotalAACCards] = useState<number | undefined>(undefined);
  const [sentenceBuilderId, setSentenceBuilderId] = useState<string | null>(null);

  // 문장 구성 영역 더블클릭 핸들러
  const handleCanvasDoubleClick = () => {
    if (project.selectedIds.length === 1) {
      const el = project.elements.find(e => e.id === project.selectedIds[0]);
      if (el?.metadata?.isAACSentenceArea) {
        setSentenceBuilderId(el.id);
        // 시각적 피드백이 있으면 좋음 (API상 alert 사용)
        // alert('문장 구성 모드 시작! 카드를 클릭하여 문장을 만드세요.');
      }
    }
  };

  // 문장 빌더 모드 로직 (캔버스 내 카드 클릭 감지)
  useEffect(() => {
    if (!sentenceBuilderId) return;

    // 선택 해제 시 모드 종료 (빈 공간 클릭)
    if (project.selectedIds.length === 0) {
      setSentenceBuilderId(null);
      return;
    }

    // 자기 자신(문장 영역) 선택 시 유지
    if (project.selectedIds[0] === sentenceBuilderId) return;

    const selectedEl = project.elements.find(el => el.id === project.selectedIds[0]);

    // AAC 카드 선택 시 아이템 추가
    if (selectedEl?.metadata?.isAACCard && selectedEl.metadata.aacIndex !== undefined) {
      const aacIndex = selectedEl.metadata.aacIndex;
      // 아이콘(이모지) 요소 찾기
      const iconEl = project.elements.find(e =>
        e.pageId === project.activePageId &&
        e.metadata?.isAACCard &&
        e.metadata.aacIndex === aacIndex &&
        e.metadata.isAACIcon
      );

      const emoji = iconEl?.content || '❓';
      addSentenceItem(sentenceBuilderId, emoji);

      // 모드 유지를 위해 sentenceBuilderId는 null로 만들지 않음
    } else {
      // 엉뚱한 요소 클릭 시 모드 종료
      setSentenceBuilderId(null);
    }
  }, [project.selectedIds, sentenceBuilderId /* project.elements 등은 생략, 루프 방지 */]);

  // AAC 카드 선택 감지 및 탭 자동 열기
  useEffect(() => {
    if (project.selectedIds.length === 1) {
      const selectedId = project.selectedIds[0];
      const selectedEl = project.elements.find(el => el.id === selectedId);

      // AAC 요소 (카드 또는 문장 영역) 선택 시
      const isAACCard = selectedEl?.metadata?.isAACCard && selectedEl.metadata.aacIndex !== undefined;
      const isSentenceArea = selectedEl?.metadata?.isAACSentenceArea;

      if (isAACCard || isSentenceArea) {
        if (activeTab !== 'aac') setActiveTab('aac');

        // 카드 선택 시 진행도 표시 (문장 영역 선택 시에는 표시 안함)
        if (isAACCard) {
          // 현재 페이지의 모든 AAC 카드 계산 (인덱싱, 순수 카드 객체 기준)
          const aacCards = project.elements
            .filter(el => el.pageId === project.activePageId && el.metadata?.isAACCard && el.type === 'card' && el.metadata.aacIndex !== undefined)
            .sort((a, b) => (a.metadata!.aacIndex!) - (b.metadata!.aacIndex!));

          setTotalAACCards(aacCards.length);

          // 현재 선택된 요소의 인덱스를 기반으로 설정
          const currentIdx = selectedEl!.metadata!.aacIndex;
          // 유효한 인덱스인지 확인
          const isValid = aacCards.some(c => c.metadata!.aacIndex === currentIdx);
          if (isValid) setCurrentAACCardIndex(currentIdx);
        } else {
          // 문장 영역 선택 시 진행도 초기화
          setCurrentAACCardIndex(undefined);
          setTotalAACCards(undefined);
        }
      }
    }
  }, [project.selectedIds, project.elements, project.activePageId, activeTab]);

  // 문장 구성 아이템 추가 헬퍼 함수
  const addSentenceItem = (areaId: string, emoji: string) => {
    const areaEl = project.elements.find(el => el.id === areaId);
    if (!areaEl) return;

    const itemCount = areaEl.metadata?.itemCount || 0;
    // 아이템 크기: 문장 영역 높이의 70% 정도로 설정 (패딩 고려)
    const ITEM_SIZE = Math.min(areaEl.height * 0.7, 80);
    const GAP = 10;
    const START_PADDING = 20;

    // 위치 계산 (왼쪽 -> 오른쪽)
    const nextX = areaEl.x + START_PADDING + itemCount * (ITEM_SIZE + GAP);
    // 수직 중앙 정렬: y + (height - size) / 2
    const nextY = areaEl.y + (areaEl.height - ITEM_SIZE) / 2;

    // 영역 초과 체크
    if (nextX + ITEM_SIZE > areaEl.x + areaEl.width) {
      // 꽉 참
      return;
    }

    const newEl = project.addElement('text', emoji);
    if (newEl) {
      project.updateElement(newEl.id, {
        x: nextX,
        y: nextY,
        width: ITEM_SIZE,
        height: ITEM_SIZE,
        fontSize: ITEM_SIZE * 0.85, // 폰트 크기는 박스보다 약간 작게
        color: '#000000',
        metadata: {
          isAACSentenceItem: true,
          parentSentenceAreaId: areaId
        }
      });

      // 카운트 증가
      project.updateElement(areaId, {
        metadata: {
          ...areaEl.metadata,
          itemCount: itemCount + 1
        }
      });
    }
  };

  const handleSelectAACCard = (card: AACCard) => {
    if (project.selectedIds.length !== 1) return;
    const selectedId = project.selectedIds[0];
    const selectedEl = project.elements.find(el => el.id === selectedId);

    // 유효한 AAC 요소 선택 확인
    if (!selectedEl) return;

    // A. 문장 구성 영역 선택 시: 카드 추가
    if (selectedEl.metadata?.isAACSentenceArea) {
      addSentenceItem(selectedId, card.emoji || '❓');
      return;
    }

    // B. 일반 AAC 카드 선택 시: 기존 채우기 로직
    if (selectedEl.metadata?.isAACCard && selectedEl.metadata.aacIndex !== undefined) {
      const targetIndex = selectedEl.metadata.aacIndex;

      // 1. 타겟 카드(배경) 찾기
      const targetCard = project.elements.find(el =>
        el.pageId === project.activePageId &&
        el.type === 'card' &&
        el.metadata?.isAACCard &&
        el.metadata?.aacIndex === targetIndex
      );

      if (!targetCard) return; // 타겟이 없으면 종료

      // 2. 카드 배경색 업데이트
      project.updateElement(targetCard.id, {
        backgroundColor: card.backgroundColor
      });

      // 3. 아이콘 추가 (이모지 텍스트로 대체)
      const existingIcon = project.elements.find(el =>
        el.pageId === project.activePageId &&
        el.type === 'text' &&
        el.metadata?.isAACCard &&
        el.metadata?.aacIndex === targetIndex &&
        el.metadata?.isAACIcon
      );

      const iconSize = Math.min(targetCard.width, targetCard.height) * 0.45;
      const iconX = targetCard.x + (targetCard.width - iconSize) / 2;
      const iconY = targetCard.y + (targetCard.height - iconSize) / 2 - 15;

      if (existingIcon) {
        project.updateElement(existingIcon.id, {
          content: card.emoji || '❓',
          fontSize: iconSize,
          x: iconX,
          y: iconY
        });
      } else {
        const newEl = project.addElement('text', card.emoji || '❓');
        if (newEl) {
          project.updateElement(newEl.id, {
            x: iconX,
            y: iconY,
            width: iconSize,
            height: iconSize,
            fontSize: iconSize,
            content: card.emoji || '❓',
            color: '#000000',
            metadata: {
              isAACCard: true,
              aacIndex: targetIndex,
              isAACIcon: true
            }
          });
        }
      }

      // 4. 라벨 텍스트 업데이트
      const labelText = project.elements.find(el =>
        el.pageId === project.activePageId &&
        el.type === 'text' &&
        el.metadata?.isAACCard &&
        el.metadata?.aacIndex === targetIndex &&
        !el.metadata?.isAACIcon
      );

      if (labelText) {
        project.updateElement(labelText.id, {
          content: card.label,
          color: '#000000',
          fontSize: 14
        });
      }

      // 5. 다음 카드로 자동 이동
      const aacCards = project.elements
        .filter(el => el.pageId === project.activePageId && el.metadata?.isAACCard && el.type === 'card' && el.metadata.aacIndex !== undefined)
        .sort((a, b) => (a.metadata!.aacIndex!) - (b.metadata!.aacIndex!));

      const currentArrayIdx = aacCards.findIndex(el => el.metadata!.aacIndex === targetIndex);

      if (currentArrayIdx !== -1 && currentArrayIdx < aacCards.length - 1) {
        const nextCard = aacCards[currentArrayIdx + 1];
        setTimeout(() => {
          project.setSelectedIds([nextCard.id]);
        }, 50);
      }
    }
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
      onMouseMove={viewport.handlePanMove} onMouseUp={viewport.endPan} onWheel={viewport.handleWheel}
      onDoubleClickCapture={handleCanvasDoubleClick}>

      {/* Left Sidebar: Toolbar */}
      <Toolbar
        activeTab={activeTab} onTabChange={setActiveTab}
        onAddElement={project.addElement} onLoadTemplate={project.loadTemplate}
        onUpdatePageOrientation={(orientation) => project.updatePageOrientation(project.activePageId, orientation)}

        // AAC Props
        onSelectAACCard={handleSelectAACCard}
        currentAACCardIndex={currentAACCardIndex}
        totalAACCards={totalAACCards}
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
            <div className="h-6 w-px bg-gray-200"></div>
            {/* 페이지 방향 토글 */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => project.updatePageOrientation(project.activePageId, 'portrait')}
                className={`p-1.5 rounded-md transition-all flex items-center gap-1.5 text-xs font-medium ${project.getActivePageOrientation() === 'portrait'
                  ? 'bg-white text-[#5500FF] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
                title="세로 방향"
              >
                <Smartphone className="w-4 h-4" />
                <span className="hidden lg:inline">세로</span>
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
                <span className="hidden lg:inline">가로</span>
              </button>
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
