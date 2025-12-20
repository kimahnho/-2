
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
import { compressImage, isImageFile, isFileTooLarge } from '../../utils/imageUtils';
import { uploadToCloudinary, isCloudinaryConfigured } from '../../services/cloudinaryService';
import { storageService } from '../../services/storageService';
import { ExportModal } from '../ExportModal';

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
  readOnly?: boolean; // 관리자 미리보기용 읽기 전용 모드
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
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simple helper for assets
  const handleSaveAsset = (url: string) => {
    setUploadedAssets(prev => prev.includes(url) ? prev : [url, ...prev]);
  };

  // Image upload handler
  const handleUploadImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 검증
    if (!isImageFile(file)) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }
    if (isFileTooLarge(file, 10)) {
      alert('파일 크기는 10MB 이하로 제한됩니다.');
      return;
    }

    try {
      let imageUrl: string;

      // Cloudinary 사용 가능 시 CDN 업로드, 아니면 Base64
      if (isCloudinaryConfigured()) {
        const result = await uploadToCloudinary(file, {
          folder: 'muru-assets/user-uploads',
          tags: ['user-upload']
        });
        imageUrl = result.secureUrl;
        console.log(`[Upload] Cloudinary URL: ${imageUrl}`);
      } else {
        // Fallback: 로컬 압축
        imageUrl = await compressImage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.8,
          maxSizeKB: 500
        });
      }

      const img = new Image();
      img.onload = () => {
        const maxSize = 400;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const width = img.width * ratio;
        const height = img.height * ratio;

        // If single shape is selected, fill it with image
        if (project.selectedIds.length === 1) {
          const el = project.elements.find(e => e.id === project.selectedIds[0]);
          if (el && (el.type === 'shape' || el.type === 'circle')) {
            project.updateElement(el.id, { backgroundImage: imageUrl }, true);
            handleSaveAsset(imageUrl);
            return;
          }
        }

        // Otherwise add as new image element
        const x = (800 - width) / 2;
        const y = (1132 - height) / 2;
        const newEl = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'image' as const,
          x, y, width, height,
          content: imageUrl,
          rotation: 0,
          zIndex: project.elements.length + 1,
          pageId: project.activePageId,
          borderRadius: 0,
        };
        project.updateElements([...project.elements, newEl]);
        project.setSelectedIds([newEl.id]);
        handleSaveAsset(imageUrl);
      };
      img.src = imageUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('이미지 업로드에 실패했습니다.');
    }
    e.target.value = ''; // Reset for same file selection
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

      // 새 구조: aacData에서 이모지와 라벨 가져오기
      const aacData = selectedEl.metadata?.aacData;
      const emoji = aacData?.emoji || '❓';
      const label = aacData?.label || '';
      addSentenceItem(sentenceBuilderId, emoji, label);

      // 모드 유지를 위해 sentenceBuilderId는 null로 만들지 않음
    } else {
      // 엉뚱한 요소 클릭 시 모드 종료
      setSentenceBuilderId(null);
    }
  }, [project.selectedIds, sentenceBuilderId /* project.elements 등은 생략, 루프 방지 */]);

  // AAC 카드 또는 감정 카드 선택 시 자동 탭 전환
  useEffect(() => {
    if (project.selectedIds.length === 1) {
      const selectedId = project.selectedIds[0];
      const selectedEl = project.elements.find(el => el.id === selectedId);

      // AAC 요소 (카드 또는 문장 영역) 선택 시 'aac' 탭으로 전환
      const isAACCard = selectedEl?.metadata?.isAACCard && selectedEl.metadata.aacIndex !== undefined;
      const isSentenceArea = selectedEl?.metadata?.isAACSentenceArea;

      if (isAACCard || isSentenceArea) {
        if (activeTab !== 'aac') setActiveTab('aac');

        // 문장 영역 선택 시 자동으로 빌더 모드 활성화
        if (isSentenceArea) {
          setSentenceBuilderId(selectedId);
        }

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

      // 감정 카드/플레이스홀더 선택 시 'emotions' 탭으로 전환
      const isEmotionCard = selectedEl?.metadata?.isEmotionPlaceholder || selectedEl?.metadata?.isEmotionCard;
      if (isEmotionCard) {
        if (activeTab !== 'emotions') setActiveTab('emotions');
      }
    }
  }, [project.selectedIds, project.elements, project.activePageId, activeTab]);

  // 문장 구성 아이템 추가 헬퍼 함수
  const addSentenceItem = (areaId: string, emoji: string, label: string) => {
    const areaEl = project.elements.find(el => el.id === areaId);
    if (!areaEl) return;

    const itemCount = areaEl.metadata?.itemCount || 0;

    // 아이템 크기: 문장 영역 높이의 80% 정도로 설정
    const ITEM_SIZE = Math.min(areaEl.height * 0.8, 50);
    const GAP = 8;
    const START_PADDING = 16;

    // 위치 계산 (왼쪽 -> 오른쪽)
    const nextX = areaEl.x + START_PADDING + itemCount * (ITEM_SIZE + GAP);
    const nextY = areaEl.y + (areaEl.height - ITEM_SIZE) / 2;

    // 영역 초과 체크
    if (nextX + ITEM_SIZE > areaEl.x + areaEl.width - START_PADDING) return;

    // AAC 카드 형태의 아이템 생성 (흰색 배경 + 이모지 + 라벨)
    const newItemId = `sentence-card-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newItem = {
      id: newItemId,
      type: 'card' as const,
      x: nextX,
      y: nextY,
      width: ITEM_SIZE,
      height: ITEM_SIZE,
      rotation: 0,
      backgroundColor: '#ffffff',
      borderRadius: 6,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      zIndex: 100 + itemCount,
      pageId: project.activePageId,
      metadata: {
        isAACSentenceItem: true,
        parentSentenceAreaId: areaId,
        aacData: {
          emoji: emoji,
          label: label,
          isFilled: true
        }
      }
    };

    // 영역 카운트 업데이트, 플레이스홀더 텍스트 삭제, 새 아이템 추가
    let updatedElements = project.elements.map(el => {
      if (el.id === areaId) {
        return {
          ...el,
          metadata: {
            ...el.metadata,
            itemCount: itemCount + 1
          }
        };
      }
      return el;
    });

    // 첫 번째 아이템 추가 시 플레이스홀더 텍스트 삭제
    if (itemCount === 0) {
      // 플레이스홀더를 메타데이터 또는 콘텐츠로 찾기
      updatedElements = updatedElements.filter(el => {
        // 메타데이터로 찾기
        if (el.metadata?.isAACSentencePlaceholder && el.metadata?.parentSentenceAreaId === areaId) {
          return false;
        }
        // 콘텐츠로 찾기 (기존 템플릿 호환)
        if (el.type === 'text' && el.content === '문장 구성 영역') {
          // 문장 영역 내부에 있는지 확인
          if (el.x >= areaEl.x && el.x <= areaEl.x + areaEl.width &&
            el.y >= areaEl.y && el.y <= areaEl.y + areaEl.height) {
            return false;
          }
        }
        return true;
      });
    }

    project.updateElements([...updatedElements, newItem as any]);
  };

  const handleSelectAACCard = (card: AACCard) => {
    // 문장 빌더 모드가 활성화되어 있으면 해당 영역에 카드 추가
    if (sentenceBuilderId) {
      const sentenceArea = project.elements.find(el => el.id === sentenceBuilderId);
      if (sentenceArea?.metadata?.isAACSentenceArea) {
        addSentenceItem(sentenceBuilderId, card.emoji || '❓', card.label || '');
        return;
      }
    }

    if (project.selectedIds.length !== 1) return;
    const selectedId = project.selectedIds[0];
    const selectedEl = project.elements.find(el => el.id === selectedId);

    // 유효한 AAC 요소 선택 확인
    if (!selectedEl) return;

    // A. 문장 구성 영역 선택 시: 카드 추가 (더블클릭 없이 직접 선택한 경우)
    if (selectedEl.metadata?.isAACSentenceArea) {
      addSentenceItem(selectedId, card.emoji || '❓', card.label || '');
      return;
    }

    // B. 일반 AAC 카드 선택 시: aacData 업데이트
    if (selectedEl.metadata?.isAACCard && selectedEl.type === 'card') {
      const targetIndex = selectedEl.metadata.aacIndex;

      // 카드의 aacData만 업데이트 (단순하고 명확한 로직)
      const newElements = project.elements.map(el => {
        if (el.id === selectedId) {
          return {
            ...el,
            metadata: {
              ...el.metadata,
              aacData: {
                emoji: card.emoji || '❓',
                label: card.label,
                isFilled: true
              }
            }
          };
        }
        return el;
      });

      // 한 번에 업데이트
      project.updateElements(newElements);

      // 다음 카드로 자동 이동 (세로 우선: 위→아래, 다음 열)
      const aacCards = newElements
        .filter(el => el.pageId === project.activePageId && el.metadata?.isAACCard && el.type === 'card' && el.metadata.aacIndex !== undefined)
        // 세로 우선 정렬: x좌표(열) 우선, 같은 열이면 y좌표(행) 순서
        .sort((a, b) => {
          const xDiff = a.x - b.x;
          if (Math.abs(xDiff) > 10) return xDiff; // 10px 허용 오차 (같은 열 판정)
          return a.y - b.y; // 같은 열이면 위→아래
        });

      // 현재 카드의 위치 찾기
      const currentCard = newElements.find(el => el.id === selectedId);
      const currentArrayIdx = aacCards.findIndex(el => el.id === selectedId);

      if (currentArrayIdx !== -1 && currentArrayIdx < aacCards.length - 1) {
        const nextCard = aacCards[currentArrayIdx + 1];
        setTimeout(() => {
          project.setSelectedIds([nextCard.id]);
        }, 100);
      }
    }
  };

  // --- Automation Elements Handlers ---
  // 감정 카드 삽입 - 겹치지 않게 위치 오프셋 적용
  const handleAddEmotionCard = () => {
    const cardId = `emotion-card-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    // 현재 페이지의 감정 카드 개수로 오프셋 계산
    const existingEmotionCards = project.elements.filter(
      el => el.pageId === project.activePageId && el.metadata?.isEmotionCard
    ).length;
    const offset = existingEmotionCards * 30;

    const newCard = {
      id: cardId,
      type: 'card' as const,
      x: 100 + offset,
      y: 100 + offset,
      width: 150,
      height: 180,
      rotation: 0,
      backgroundColor: '#FFF0F5',
      borderRadius: 16,
      borderWidth: 2,
      borderColor: '#F472B6',
      borderStyle: 'solid' as const,
      zIndex: 100 + existingEmotionCards,
      pageId: project.activePageId,
      isEmotionPlaceholder: true,
      metadata: {
        isEmotionCard: true,
        emotionData: {
          imageUrl: undefined,
          label: undefined,
          isFilled: false
        }
      }
    };
    project.updateElements([...project.elements, newCard as any]);
    // 카드 선택만 하고 탭은 변경하지 않음 (여러 개 추가 가능)
    project.setSelectedIds([cardId]);
  };

  // AAC 카드 삽입 - 겹치지 않게 위치 오프셋 적용
  const handleAddAACCard = () => {
    const cardId = `aac-card-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    // 현재 페이지의 AAC 카드 개수로 오프셋 계산 (템플릿 AAC 카드는 제외, 직접 추가된 것만)
    const existingAACCards = project.elements.filter(
      el => el.pageId === project.activePageId && el.metadata?.isAACCard && el.id.startsWith('aac-card-')
    ).length;
    const offset = existingAACCards * 30;

    const newCard = {
      id: cardId,
      type: 'card' as const,
      x: 100 + offset,
      y: 100 + offset,
      width: 120,
      height: 120,
      rotation: 0,
      backgroundColor: '#ffffff',
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#E5E7EB',
      borderStyle: 'solid' as const,
      zIndex: 100 + existingAACCards,
      pageId: project.activePageId,
      metadata: {
        isAACCard: true,
        aacRow: 0,
        aacCol: 0,
        aacIndex: 0,
        aacData: {
          emoji: undefined,
          label: undefined,
          isFilled: false,
          fontSize: 20,
          fontWeight: 400,
          color: '#000000',
          symbolScale: 0.45,
          labelPosition: 'below' as 'above' | 'below' | 'none'
        }
      }
    };
    project.updateElements([...project.elements, newCard as any]);
    // 카드 선택만 하고 탭은 변경하지 않음 (여러 개 추가 가능)
    project.setSelectedIds([cardId]);
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
      const firstPageId = project.pages[0]?.id;
      const previewElements = firstPageId ? project.elements.filter(el => el.pageId === firstPageId) : [];
      storageService.saveProject(projectId, projectData, title, undefined, previewElements);
      setIsSaving(false);
    }, 1000); // Save after 1 second of inactivity

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [project.elements, project.pages, title, projectId, isGuest]);

  // Wrapper to select page and clear element selection
  // Also triggers scroll to the newly selected page
  const handleSelectPage = (pageId: string) => {
    if (pageId !== project.activePageId) {
      project.setActivePageId(pageId);
      // Scroll to the selected page after state update
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
      onDoubleClickCapture={readOnly ? undefined : handleCanvasDoubleClick}>

      {/* 읽기 전용 모드 배너 */}
      {readOnly && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-50 font-medium text-sm">
          🔒 읽기 전용 모드 - 편집이 비활성화되었습니다
        </div>
      )}

      {/* Left Sidebar: Toolbar - 읽기 전용 모드에서 숨김 */}
      {!readOnly && (
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
          onAddEmotionCard={handleAddEmotionCard}
          onAddAACCard={handleAddAACCard}
          onUploadImage={handleUploadImage}
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
                isSaving ? <><Loader2 className="w-3 h-3 animate-spin" /> 저장 중...</> : <><Save className="w-3 h-3" /> 저장됨</>
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
            <button onClick={() => { if (window.confirm("현재 페이지의 요소를 초기화하시겠습니까?")) { project.deleteElements(project.elements.filter(e => e.pageId === project.activePageId).map(e => e.id)); } }} className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-lg"><Trash2 className="w-4 h-4 sm:w-5 sm:h-5" /></button>
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
            // Pass commit=false for live dragging
            onUpdateElements={(els) => project.updateElements(els, false)}
            // Pass commit=true for final state (Mouse Up)
            onCommitElements={(els) => project.updateElements(els, true)}
            onSetSelectedIds={project.setSelectedIds}
            onSetEditingId={project.setEditingId}
            onSetActiveTab={setActiveTab}
            onAddImageElement={(dataUrl) => {
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
        <PageManager
          pages={project.pages} elements={project.elements} activePageId={project.activePageId}
          onSelectPage={handleSelectPage} onMovePage={project.movePage}
          onDeletePage={project.deletePage} onDuplicatePage={project.duplicatePage} onAddPage={project.addPage}
        />
      </div>

      {/* Right Sidebar: Properties - 읽기 전용 모드에서 숨김 */}
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
          onUploadImage={handleUploadImage}
        />
      )}

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
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
