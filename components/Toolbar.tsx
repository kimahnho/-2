
import React from 'react';
import {
    Shapes,
    Type,
    Upload,
    Smile,
    Sparkles,
    ChevronLeft,
    Layout,
    Grid,
} from 'lucide-react';
import { ElementType, DesignElement, CharacterProfile, TabType } from '../types';
import { DesignPanel } from './toolbar/DesignPanel';
import { EmotionsPanel } from './toolbar/EmotionsPanel';
import { ElementsPanel } from './toolbar/ElementsPanel';
import { TemplatesPanel } from './toolbar/TemplatesPanel';
import { AACPanel, AACCard } from './toolbar/AACPanel';

interface Props {
    activeTab: TabType | null;
    onTabChange: (tab: TabType | null) => void;
    onAddElement: (type: ElementType, content?: string, options?: any) => void;
    onLoadTemplate: (elements: DesignElement[]) => void;
    onUpdatePageOrientation?: (orientation: 'portrait' | 'landscape') => void;
    uploadedAssets: string[];
    onSaveAsset: (url: string) => void;

    // Character Props
    characters: CharacterProfile[];
    onAddCharacter: (name: string, description: string, style: 'character' | 'realistic' | 'emoji', baseImageUrl?: string) => void;
    onDeleteCharacter: (id: string) => void;
    onAddEmotionToCharacter: (charId: string, label: string, imageUrl: string) => void;
    onDeleteEmotionFromCharacter?: (charId: string, emotionId: string) => void;
    onUpdateEmotionLabel?: (charId: string, emotionId: string, newLabel: string) => void;

    onApplyEmotion?: (imageUrl: string, label: string) => void;
    onAddElementWithCaption?: (url: string, caption: string) => void;
    onLogoClick?: () => void;
    // AAC 카드 관련
    onSelectAACCard?: (card: AACCard) => void;
    currentAACCardIndex?: number;
    totalAACCards?: number;
    // 자동화 요소 삽입
    onAddEmotionCard?: () => void;
    onAddAACCard?: () => void;
    // 파일 업로드
    // 파일 업로드
    onUploadImage?: () => void;
    isGuest?: boolean;
}

export const Toolbar: React.FC<Props> = ({
    activeTab,
    onTabChange,
    onAddElement,
    onLoadTemplate,
    onUpdatePageOrientation,
    uploadedAssets,
    onSaveAsset,
    characters,
    onAddCharacter,
    onDeleteCharacter,
    onAddEmotionToCharacter,
    onDeleteEmotionFromCharacter,
    onUpdateEmotionLabel,
    onApplyEmotion,
    onAddElementWithCaption,
    onLogoClick,
    onSelectAACCard,
    currentAACCardIndex,
    totalAACCards,
    onAddEmotionCard,
    onAddAACCard,
    onUploadImage,
    isGuest = false
}) => {

    const toggleTab = (tab: TabType) => {
        if (activeTab === tab) {
            onTabChange(null); // Close
        } else {
            onTabChange(tab); // Open
        }
    };

    return (
        <div className="flex h-full z-30 shadow-xl no-print">
            {/* Navigation Rail */}
            <div className="w-[72px] bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-4 shrink-0 z-40">
                <div className="mb-4 cursor-pointer" onClick={onLogoClick} title="대시보드로 돌아가기">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shadow-lg hover:scale-105 transition-transform bg-white">
                        <img src="/logo-turtle.png" alt="MURU.AI" className="w-9 h-9 object-contain" />
                    </div>
                </div>

                <NavButton
                    active={activeTab === 'design'}
                    onClick={() => toggleTab('design')}
                    icon={<Sparkles />}
                    label="디자인"
                />
                <NavButton
                    active={activeTab === 'templates'}
                    onClick={() => toggleTab('templates')}
                    icon={<Layout />}
                    label="템플릿"
                />
                <NavButton
                    active={activeTab === 'emotions'}
                    onClick={() => toggleTab('emotions')}
                    icon={<Smile />}
                    label="감정"
                />
                <NavButton
                    active={activeTab === 'elements'}
                    onClick={() => toggleTab('elements')}
                    icon={<Shapes />}
                    label="요소"
                />
                <NavButton
                    active={activeTab === 'text'}
                    onClick={() => toggleTab('text')}
                    icon={<Type />}
                    label="텍스트"
                />
                <NavButton
                    active={activeTab === 'uploads'}
                    onClick={() => toggleTab('uploads')}
                    icon={<Upload />}
                    label="업로드"
                />
                <NavButton
                    active={activeTab === 'aac'}
                    onClick={() => toggleTab('aac')}
                    icon={<Grid />}
                    label="AAC"
                />
            </div>

            {/* Side Panel Drawer */}
            <div
                className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden relative ${activeTab ? 'w-[340px] opacity-100' : 'w-0 opacity-0'
                    }`}
            >
                {activeTab && (
                    <div className="h-full flex flex-col min-w-[340px]">
                        {/* Panel Header */}
                        <div className="h-14 border-b border-gray-100 flex items-center justify-center px-5 shrink-0 relative">
                            <h2 className="font-bold text-lg text-gray-800">
                                {activeTab === 'design' && 'AI 생성'}
                                {activeTab === 'templates' && '템플릿'}
                                {activeTab === 'emotions' && '감정 카드'}
                                {activeTab === 'elements' && '요소'}
                                {activeTab === 'text' && '텍스트'}
                                {activeTab === 'uploads' && '내 파일'}
                                {activeTab === 'aac' && 'AAC 카드'}
                            </h2>
                            <button onClick={() => onTabChange(null)} className="absolute right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Panel Content */}
                        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">

                            {activeTab === 'design' && (
                                <DesignPanel
                                    onAddElement={onAddElement}
                                    onAddElementWithCaption={onAddElementWithCaption}
                                    onSaveAsset={onSaveAsset}
                                    characters={characters}
                                    isGuest={isGuest}
                                />
                            )}

                            {activeTab === 'templates' && (
                                <TemplatesPanel
                                    onLoadTemplate={onLoadTemplate}
                                    onUpdatePageOrientation={onUpdatePageOrientation}
                                />
                            )}

                            {activeTab === 'aac' && onSelectAACCard && (
                                <AACPanel
                                    onSelectAACCard={onSelectAACCard}
                                    currentCardIndex={currentAACCardIndex}
                                    totalCards={totalAACCards}
                                />
                            )}

                            {activeTab === 'emotions' && (
                                <EmotionsPanel
                                    onAddElement={onAddElement}
                                    onApplyEmotion={onApplyEmotion}
                                    onSaveAsset={onSaveAsset}
                                    characters={characters}
                                    onAddCharacter={onAddCharacter}
                                    onDeleteCharacter={onDeleteCharacter}
                                    onAddEmotionToCharacter={onAddEmotionToCharacter}
                                    onDeleteEmotionFromCharacter={onDeleteEmotionFromCharacter}
                                    onUpdateEmotionLabel={onUpdateEmotionLabel}
                                    isGuest={isGuest}
                                />
                            )}

                            {activeTab === 'elements' && (
                                <ElementsPanel
                                    onAddElement={onAddElement}
                                    onAddEmotionCard={onAddEmotionCard}
                                    onAddAACCard={onAddAACCard}
                                />
                            )}

                            {activeTab === 'text' && (
                                <div className="space-y-4">
                                    <button
                                        onClick={() => onAddElement('text', '제목 텍스트 추가')}
                                        className="w-full py-4 bg-gray-50 border border-gray-200 rounded-lg text-lg font-bold text-gray-800 hover:bg-gray-100 hover:border-gray-300 transition-all text-left px-4"
                                    >
                                        제목 텍스트 추가
                                    </button>
                                    <button
                                        onClick={() => onAddElement('text', '본문 텍스트 내용을 입력하세요')}
                                        className="w-full py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-all text-left px-4"
                                    >
                                        본문 텍스트 추가
                                    </button>
                                </div>
                            )}

                            {activeTab === 'uploads' && (
                                <div className="space-y-4">
                                    <button
                                        type="button"
                                        onClick={onUploadImage}
                                        className="w-full py-3 bg-[#EAEFFF] text-[#5500FF] rounded-lg font-bold hover:bg-[#D6E0FF] transition-colors border border-[#B0C0ff] border-dashed"
                                    >
                                        파일 업로드
                                    </button>

                                    <div className="pt-4 border-t border-gray-100">
                                        <h3 className="font-bold text-sm text-gray-700 mb-3">내 파일 / 저장된 에셋</h3>
                                        {uploadedAssets.length === 0 ? (
                                            <p className="text-xs text-gray-400 text-center py-4">저장된 파일이 없습니다.</p>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-2">
                                                {uploadedAssets.map((url, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => onAddElement('image', url)}
                                                        className="aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:border-[#5500FF] relative group"
                                                    >
                                                        <img src={url} className="w-full h-full object-cover" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-200 ${active ? 'bg-[#5500FF]/10 text-[#5500FF]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
    >
        {React.cloneElement(icon as React.ReactElement<any>, { size: 24, strokeWidth: active ? 2.5 : 2 })}
        <span className={`text-[10px] mt-1 font-medium ${active ? 'text-[#5500FF]' : ''}`}>{label}</span>
    </button>
);
