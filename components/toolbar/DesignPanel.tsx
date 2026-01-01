import React, { useState, useEffect } from 'react';
import { Wand2, Sparkles, Loader2, User } from 'lucide-react';
import { CharacterProfile } from '../../types';
import { generateTherapyImage, getDailyUsageCount, DAILY_LIMIT } from '../../services/geminiService';

interface Props {
    onAddElement: (type: any, content?: string) => void;
    onAddElementWithCaption?: (url: string, caption: string) => void;
    onSaveAsset: (url: string) => void;
    isGuest?: boolean;
    characters?: CharacterProfile[];
}

export const DesignPanel: React.FC<Props> = ({ onAddElement, onAddElementWithCaption, onSaveAsset, characters = [], isGuest = false }) => {
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiStyle, setAiStyle] = useState<'character' | 'realistic' | 'emoji'>('character');
    const [selectedCharId, setSelectedCharId] = useState<string>('');
    const [dailyUsage, setDailyUsage] = useState<number>(0);

    useEffect(() => {
        const checkUsage = async () => {
            console.log('[DesignPanel] Checking usage...');
            const count = await getDailyUsageCount();
            console.log('[DesignPanel] Usage count received:', count);
            setDailyUsage(count);
        };
        checkUsage();
    }, [isGenerating]); // Re-check after generation

    const isLimitReached = dailyUsage >= DAILY_LIMIT;
    console.log('[DesignPanel] Render state:', { dailyUsage, DAILY_LIMIT, isLimitReached, isGenerating });

    const handleAiGenerate = async () => {
        if (!aiPrompt) return;
        setIsGenerating(true);
        try {
            const selectedChar = characters.find(c => c.id === selectedCharId);
            const referenceImage = selectedChar?.baseImageUrl;

            const imageUrl = await generateTherapyImage(aiPrompt, aiStyle, referenceImage);

            // 이미지만 삽입 (캡션 없이)
            onAddElement('image', imageUrl);
            // AI 생성 이미지는 업로드 패널에 저장하지 않음 (직접 업로드만 저장)

            // Re-fetch usage right after success to update UI immediately
            const newCount = await getDailyUsageCount();
            setDailyUsage(newCount);
        } catch (error: any) {
            console.error("AI Generation Error:", error);
            alert(`이미지 생성에 실패했습니다: ${error.message || "알 수 없는 오류"}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* AI Generator */}
            <div className="bg-[#5500FF]/5 p-4 rounded-xl border border-[#5500FF]/10 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                    <Wand2 className="w-4 h-4 text-[#5500FF]" />
                    <span className="text-sm font-bold text-[#5500FF]">AI 매직 생성</span>
                    {/* <span className="ml-auto text-[10px] bg-white px-2 py-0.5 rounded-full border border-[#5500FF]/20 text-[#5500FF] font-medium">
                        {isLimitReached ? '한도 초과' : `${dailyUsage}/${DAILY_LIMIT}회`}
                    </span> */}
                </div>

                {isGuest && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4 text-center">
                        <p className="text-sm font-bold text-gray-800 mb-2">로그인 후 사용 가능합니다</p>
                        <p className="text-xs text-gray-500 mb-4">AI 이미지 생성은 회원 전용 기능입니다.</p>
                        <button
                            onClick={() => window.location.href = '/login'}
                            className="bg-[#5500FF] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#4400cc] transition-colors"
                        >
                            로그인 하러가기
                        </button>
                    </div>
                )}

                <div className={`space-y-3 ${isGuest ? 'opacity-20 pointer-events-none' : ''}`}>
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
                        disabled={isGenerating || !aiPrompt || isLimitReached}
                        className="w-full py-2.5 bg-[#5500FF] text-white rounded-lg font-medium hover:bg-[#4400cc] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#5500FF]/20"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {isLimitReached ? '오늘 한도 초과 (내일 다시 생성)' : '이미지 생성'}
                    </button>
                </div>
            </div>
        </div>
    );
};

