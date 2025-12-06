
import React, { useState } from 'react';
import { Search, Sparkles, Loader2, X } from 'lucide-react';
import { CharacterProfile } from '../../types';
import { EMOTION_CARDS } from '../../constants';
import { generateCharacterEmotion, generateTherapyImage } from '../../services/geminiService';

interface Props {
  onAddElement: (type: any, content?: string) => void;
  onApplyEmotion?: (imageUrl: string, label: string) => void;
  onSaveAsset: (url: string) => void;
  
  characters: CharacterProfile[];
  onAddCharacter: (name: string, description: string, style: 'character' | 'realistic' | 'emoji', baseImageUrl?: string) => void;
  onDeleteCharacter: (id: string) => void;
  onAddEmotionToCharacter: (charId: string, label: string, imageUrl: string) => void;
  onDeleteEmotionFromCharacter?: (charId: string, emotionId: string) => void;
  onUpdateEmotionLabel?: (charId: string, emotionId: string, newLabel: string) => void;
}

export const EmotionsPanel: React.FC<Props> = ({ 
  onAddElement, onApplyEmotion, onSaveAsset, 
  characters, onAddCharacter, onDeleteCharacter, 
  onAddEmotionToCharacter, onDeleteEmotionFromCharacter, onUpdateEmotionLabel 
}) => {
  const [emotionSubTab, setEmotionSubTab] = useState<'presets' | 'my-characters'>('presets');
  const [emotionSearch, setEmotionSearch] = useState('');
  
  // Character Generation State
  const [characterName, setCharacterName] = useState('');
  const [characterDesc, setCharacterDesc] = useState('');
  const [isCreatingCharacter, setIsCreatingCharacter] = useState(false);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [emotionInput, setEmotionInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStyle, setAiStyle] = useState<'character' | 'realistic' | 'emoji'>('character');

  const filteredEmotions = EMOTION_CARDS.filter(card => 
     card.label.includes(emotionSearch)
  );

  const activeCharacter = characters.find(c => c.id === selectedCharId);

  const handleRegisterCharacter = async () => {
      if (!characterName || !characterDesc) return;
      
      setIsCreatingCharacter(true);
      try {
          // Generate the base character appearance first
          let basePrompt = "";
          switch(aiStyle) {
              case 'realistic': basePrompt = `A photorealistic Korean child, ${characterDesc}. Upper body portrait.`; break;
              case 'emoji': basePrompt = `A 3D rendered Korean style emoji character, ${characterDesc}. Upper body portrait.`; break;
              default: basePrompt = `A cute Korean character illustration, ${characterDesc}. Upper body portrait.`; break;
          }

          // Use the basic image generator to create the 'Reference'
          const baseImageUrl = await generateTherapyImage(basePrompt, aiStyle);
          
          onAddCharacter(characterName, characterDesc, aiStyle, baseImageUrl);
          onSaveAsset(baseImageUrl); // Also save to assets
          
          setCharacterName('');
          setCharacterDesc('');
      } catch (error) {
          console.error(error);
          alert("캐릭터 생성에 실패했습니다.");
      } finally {
          setIsCreatingCharacter(false);
      }
  };

  const handleGenerateEmotion = async () => {
      if (!selectedCharId || !emotionInput) return;
      
      const char = characters.find(c => c.id === selectedCharId);
      if (!char) return;

      setIsGenerating(true);
      try {
          // Pass the baseImageUrl to the service
          const imageUrl = await generateCharacterEmotion(
              char.description, 
              emotionInput, 
              char.style,
              char.baseImageUrl // Provide the reference image!
          );
          
          onAddEmotionToCharacter(char.id, emotionInput, imageUrl);
          // Note: We deliberately do NOT add to canvas automatically here.
          // The user must click the generated card to add it.
          
          setEmotionInput('');
      } catch (error) {
          alert("감정 생성 실패");
      } finally {
          setIsGenerating(false);
      }
  };

  return (
    <div className="h-full flex flex-col">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-4 shrink-0">
            <button 
                onClick={() => setEmotionSubTab('presets')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${emotionSubTab === 'presets' ? 'bg-white text-[#5500FF] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                기본 감정
            </button>
            <button 
                onClick={() => setEmotionSubTab('my-characters')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${emotionSubTab === 'my-characters' ? 'bg-white text-[#5500FF] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <div className="flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3" /> 내 캐릭터 (AI)
                </div>
            </button>
        </div>

        <p className="text-xs text-gray-500 mb-2">클릭하면 캔버스와 '내 파일'에 추가됩니다.</p>

        {emotionSubTab === 'presets' ? (
            <>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        value={emotionSearch}
                        onChange={(e) => setEmotionSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5500FF]"
                        placeholder="감정 검색 (예: 기쁨, 슬픔)"
                    />
                </div>
                <div className="grid grid-cols-2 gap-3 overflow-y-auto pb-4">
                    {filteredEmotions.length > 0 ? (
                        filteredEmotions.map((card, idx) => (
                            <button 
                                key={idx}
                                onClick={() => {
                                    onSaveAsset(card.url);
                                    if (onApplyEmotion) {
                                        onApplyEmotion(card.url, card.label);
                                    } else {
                                        onAddElement('image', card.url);
                                    }
                                }}
                                className="flex flex-col items-center gap-2 p-2 rounded-xl border border-gray-100 hover:border-[#B0C0ff] hover:bg-[#F5F7FF] transition-all group"
                            >
                                <div className="w-full aspect-square rounded-lg overflow-hidden bg-white shadow-sm flex items-center justify-center p-2">
                                    <img src={card.url} alt={card.label} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <span className="text-xs font-medium text-gray-600 group-hover:text-[#5500FF]">{card.label}</span>
                            </button>
                        ))
                    ) : (
                        <div className="col-span-2 text-center py-8 text-gray-400 text-xs">
                            검색 결과가 없습니다.
                        </div>
                    )}
                </div>
            </>
        ) : (
            <div className="space-y-6 flex-1 overflow-y-auto pb-4">
                {/* 1. Character List / Add */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-xs text-gray-600">내 캐릭터 목록</h3>
                        <button onClick={() => setSelectedCharId(null)} className="text-[10px] text-[#5500FF] bg-[#5500FF]/10 px-2 py-0.5 rounded hover:bg-[#5500FF]/20">+ 새 캐릭터</button>
                    </div>
                    
                    {characters.length === 0 ? (
                        <div className="bg-gray-50 p-4 rounded-lg text-center border border-dashed border-gray-200">
                            <p className="text-xs text-gray-400 mb-2">등록된 캐릭터가 없습니다.</p>
                            <p className="text-[10px] text-gray-400">캐릭터를 등록하고 일관성 있는<br/>감정 카드를 만들어보세요.</p>
                        </div>
                    ) : (
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {characters.map(char => (
                                <button 
                                    key={char.id}
                                    onClick={() => setSelectedCharId(char.id)}
                                    className={`flex-shrink-0 w-16 flex flex-col items-center gap-1 ${selectedCharId === char.id ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                                >
                                    <div className={`w-12 h-12 rounded-full bg-gray-200 overflow-hidden border-2 ${selectedCharId === char.id ? 'border-[#5500FF]' : 'border-transparent'}`}>
                                        {char.baseImageUrl ? (
                                            <img src={char.baseImageUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            char.emotions[0] ? (
                                                <img src={char.emotions[0].imageUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-[#5500FF] text-white text-xs font-bold">{char.name[0]}</div>
                                            )
                                        )}
                                    </div>
                                    <span className="text-[10px] truncate w-full text-center">{char.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. Character Form or Emotion Generator */}
                {!selectedCharId ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <h3 className="font-bold text-sm mb-3">새 캐릭터 등록 (AI 생성)</h3>
                        <div className="space-y-3">
                            <input 
                                value={characterName}
                                onChange={e => setCharacterName(e.target.value)}
                                placeholder="캐릭터 이름 (예: 민수)"
                                className="w-full p-2 text-xs border rounded focus:border-[#5500FF] outline-none"
                            />
                            <textarea 
                                value={characterDesc}
                                onChange={e => setCharacterDesc(e.target.value)}
                                placeholder="외모 묘사 (예: 파란 모자를 쓴 갈색 머리 소년, 노란 티셔츠)"
                                className="w-full p-2 text-xs border rounded h-20 resize-none focus:border-[#5500FF] outline-none"
                            />
                            <select 
                                value={aiStyle}
                                onChange={(e) => setAiStyle(e.target.value as any)}
                                className="w-full p-2 text-xs border rounded bg-white"
                            >
                                <option value="character">일러스트 스타일</option>
                                <option value="realistic">실사 스타일</option>
                                <option value="emoji">이모지 스타일</option>
                            </select>
                            <button 
                                onClick={handleRegisterCharacter}
                                disabled={!characterName || !characterDesc || isCreatingCharacter}
                                className="w-full py-2 bg-gray-900 text-white rounded text-xs font-bold hover:bg-black disabled:bg-gray-300 flex items-center justify-center gap-2"
                            >
                                {isCreatingCharacter ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        캐릭터 생성 중...
                                    </>
                                ) : '캐릭터 생성 및 등록'}
                            </button>
                            <p className="text-[10px] text-gray-500 text-center">등록 시 기본 캐릭터 이미지가 AI로 생성됩니다.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Generator */}
                        <div className="bg-[#5500FF]/5 p-4 rounded-xl border border-[#5500FF]/10">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xs font-bold text-[#5500FF]">{activeCharacter?.name}의 감정 만들기</h3>
                                <button onClick={() => onDeleteCharacter(selectedCharId)} className="text-[10px] text-red-400 hover:text-red-600">삭제</button>
                            </div>
                            <div className="flex gap-2">
                                <input 
                                    value={emotionInput}
                                    onChange={e => setEmotionInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            if (e.nativeEvent.isComposing) return;
                                            e.preventDefault();
                                            handleGenerateEmotion();
                                        }
                                    }}
                                    placeholder="감정 입력 (예: 기쁨)"
                                    className="flex-1 p-2 text-xs border rounded focus:border-[#5500FF] outline-none bg-white"
                                />
                                <button 
                                    onClick={handleGenerateEmotion}
                                    disabled={isGenerating || !emotionInput}
                                    className="px-3 bg-[#5500FF] text-white rounded text-xs font-bold hover:bg-[#4400cc] disabled:bg-gray-300"
                                >
                                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : '생성'}
                                </button>
                            </div>
                            <p className="text-[10px] text-[#5500FF]/70 mt-2">
                                * 기본 캐릭터 이미지를 참조하여 일관성 있게 생성합니다.
                            </p>
                        </div>

                        {/* Saved Emotions for Character */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Show Base Character Image first if available */}
                            {activeCharacter?.baseImageUrl && (
                                    <button 
                                    onClick={() => {
                                        onSaveAsset(activeCharacter.baseImageUrl!);
                                        if (onApplyEmotion) {
                                            onApplyEmotion(activeCharacter.baseImageUrl!, "기본");
                                        } else {
                                            onAddElement('image', activeCharacter.baseImageUrl!);
                                        }
                                    }}
                                    className="flex flex-col items-center gap-2 p-2 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#B0C0ff] hover:bg-[#F5F7FF] transition-all group relative opacity-80 hover:opacity-100"
                                >
                                    <div className="w-full aspect-square rounded-lg overflow-hidden bg-white shadow-sm">
                                        <img src={activeCharacter.baseImageUrl} alt="Base" className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 group-hover:text-[#5500FF]">기본 모습</span>
                                </button>
                            )}

                            {activeCharacter?.emotions.map(emotion => (
                                <div 
                                    key={emotion.id}
                                    className="relative group flex flex-col items-center gap-2 p-2 rounded-xl border border-gray-100 hover:border-[#B0C0ff] hover:bg-[#F5F7FF] transition-all"
                                >
                                    {/* Delete Button - Only visible on hover */}
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (onDeleteEmotionFromCharacter && activeCharacter) {
                                                onDeleteEmotionFromCharacter(activeCharacter.id, emotion.id);
                                            }
                                        }}
                                        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-50 text-gray-400 hover:text-red-500"
                                        title="감정 카드 삭제"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>

                                    {/* Image Trigger */}
                                    <button 
                                        onClick={() => {
                                            if (onApplyEmotion) {
                                                onApplyEmotion(emotion.imageUrl, emotion.label);
                                            } else {
                                                onAddElement('image', emotion.imageUrl);
                                            }
                                        }}
                                        className="w-full aspect-square rounded-lg overflow-hidden bg-white shadow-sm"
                                    >
                                        <img src={emotion.imageUrl} alt={emotion.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </button>

                                    {/* Editable Label */}
                                    <input 
                                        value={emotion.label}
                                        onChange={(e) => {
                                            if (onUpdateEmotionLabel && activeCharacter) {
                                                onUpdateEmotionLabel(activeCharacter.id, emotion.id, e.target.value);
                                            }
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-xs font-medium text-center bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#5500FF] outline-none w-full text-gray-600 focus:text-[#5500FF] transition-colors"
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        )}
    </div>
  );
};
