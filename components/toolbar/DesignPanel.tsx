
import React, { useState } from 'react';
import { Wand2, Sparkles, Loader2, Layout, User } from 'lucide-react';
import { DesignElement, CharacterProfile } from '../../types';
import { TEMPLATES } from '../../constants';
import { generateTherapyImage } from '../../services/geminiService';

interface Props {
  onAddElement: (type: any, content?: string) => void;
  onAddElementWithCaption?: (url: string, caption: string) => void;
  onSaveAsset: (url: string) => void;
  onLoadTemplate: (elements: DesignElement[]) => void;
  characters?: CharacterProfile[]; // Added prop
}

export const DesignPanel: React.FC<Props> = ({ onAddElement, onAddElementWithCaption, onSaveAsset, onLoadTemplate, characters = [] }) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStyle, setAiStyle] = useState<'character' | 'realistic' | 'emoji'>('character');
  const [selectedCharId, setSelectedCharId] = useState<string>('');

  const handleAiGenerate = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    try {
      // Find selected character (if any)
      const selectedChar = characters.find(c => c.id === selectedCharId);
      const referenceImage = selectedChar?.baseImageUrl;

      // Image Generation (with optional reference)
      const imageUrl = await generateTherapyImage(aiPrompt, aiStyle, referenceImage);
      
      if (onAddElementWithCaption) {
          onAddElementWithCaption(imageUrl, aiPrompt);
      } else {
          onAddElement('image', imageUrl);
      }
      onSaveAsset(imageUrl);
    } catch (error) {
      alert("이미지 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
        {/* AI Generator */}
        <div className="bg-[#5500FF]/5 p-4 rounded-xl border border-[#5500FF]/10">
            <div className="flex items-center gap-2 mb-3">
                <Wand2 className="w-4 h-4 text-[#5500FF]" />
                <span className="text-sm font-bold text-[#5500FF]">AI 매직 생성</span>
                <span className="ml-auto text-[10px] bg-white px-2 py-0.5 rounded-full border border-[#5500FF]/20 text-[#5500FF] font-medium">이미지</span>
            </div>
            
            <div className="space-y-3">
                {/* Character Selector */}
                {characters.length > 0 && (
                    <div className="bg-white p-2 rounded-lg border border-gray-200">
                        <label className="text-[10px] font-bold text-gray-500 mb-1 flex items-center gap-1">
                            <User className="w-3 h-3" /> 주인공 선택 (내 캐릭터)
                        </label>
                        <select 
                            value={selectedCharId}
                            onChange={(e) => {
                                setSelectedCharId(e.target.value);
                                // Sync style if character is selected
                                const char = characters.find(c => c.id === e.target.value);
                                if (char) setAiStyle(char.style);
                            }}
                            className="w-full text-xs p-1.5 rounded bg-gray-50 border-none focus:ring-1 focus:ring-[#5500FF] outline-none"
                        >
                            <option value="">선택 안 함 (새로운 랜덤 캐릭터)</option>
                            {characters.map(char => (
                                <option key={char.id} value={char.id}>
                                    {char.name} ({char.style})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="relative">
                    <select 
                    value={aiStyle}
                    onChange={(e) => setAiStyle(e.target.value as any)}
                    className="w-full mb-2 text-xs p-2 rounded border border-gray-200 bg-white focus:border-[#5500FF] outline-none"
                    >
                        <option value="character">캐릭터/일러스트</option>
                        <option value="realistic">실사/사진</option>
                        <option value="emoji">3D 이모지</option>
                    </select>
                </div>
                <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={selectedCharId 
                        ? "이 캐릭터가 무엇을 하고 있나요? (예: 학교에서 발표하는 모습)" 
                        : "어떤 이미지가 필요하신가요? (예: 빨간 사과, 웃는 아이)"
                    }
                    className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B0C0ff] focus:border-[#5500FF] h-24 resize-none bg-white"
                />
                <button 
                    onClick={handleAiGenerate}
                    disabled={isGenerating || !aiPrompt}
                    className="w-full py-2.5 bg-[#5500FF] text-white rounded-lg font-medium hover:bg-[#4400cc] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#5500FF]/20"
                >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    이미지 생성
                </button>
            </div>
        </div>

        {/* Templates */}
        <div>
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm text-gray-700">추천 템플릿</h3>
                <button className="text-xs text-gray-400 hover:text-[#5500FF]">모두 보기</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {TEMPLATES.map(template => (
                    <button 
                        key={template.id}
                        onClick={() => onLoadTemplate(template.elements as unknown as DesignElement[])}
                        className="group relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-[#5500FF] hover:shadow-md transition-all text-left"
                    >
                        {/* Preview Placeholder */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                        <div className="absolute inset-0 p-3 flex flex-col justify-end">
                            <h4 className="text-white text-xs font-bold">{template.name}</h4>
                        </div>
                        {/* Preview Icon */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-40 transition-opacity">
                            <Layout className="w-12 h-12 text-gray-600" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
};
