import React, { useState } from 'react';
import { Upload, Sparkles } from 'lucide-react';
import { DesignElement } from '../../types/editor.types';

interface ImageFillControlsProps {
    element: DesignElement;
    onUploadImage?: () => void;
    onGenerateImage?: (id: string, prompt: string, style: 'character' | 'realistic' | 'emoji') => Promise<void>;
}

/**
 * ImageFillControls - 이미지 채우기 및 AI 생성
 */
export const ImageFillControls: React.FC<ImageFillControlsProps> = ({
    element,
    onUploadImage,
    onGenerateImage
}) => {
    const [activeImageTab, setActiveImageTab] = useState<'upload' | 'ai'>('upload');
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500">이미지 채우기</label>
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onUploadImage?.(); }}
                    className="flex-1 py-2 text-xs font-bold text-gray-700 border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                    <Upload className="w-3.5 h-3.5" /> 업로드
                </button>
                <button
                    type="button"
                    onClick={() => activeImageTab === 'ai' ? setActiveImageTab('upload') : setActiveImageTab('ai')}
                    className="flex-1 py-2 text-xs font-bold text-[#5500FF] border border-[#5500FF] rounded hover:bg-[#5500FF]/5 flex items-center justify-center gap-2"
                >
                    <Sparkles className="w-3.5 h-3.5" /> AI 생성
                </button>
            </div>
            {activeImageTab === 'ai' && (
                <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                    <input
                        value={aiPrompt}
                        onChange={e => setAiPrompt(e.target.value)}
                        placeholder="프롬프트 입력..."
                        className="w-full text-xs p-2 border rounded mb-2 outline-none focus:border-[#5500FF]"
                    />
                    <button
                        onClick={async () => {
                            if (!onGenerateImage) return;
                            setIsGenerating(true);
                            await onGenerateImage(element.id, aiPrompt, 'character');
                            setIsGenerating(false);
                        }}
                        disabled={isGenerating}
                        className={`w-full py-1.5 bg-[#5500FF] text-white text-xs font-bold rounded ${isGenerating ? 'opacity-50 cursor-wait' : ''}`}
                    >
                        {isGenerating ? '생성 중...' : '생성하기'}
                    </button>
                </div>
            )}
        </div>
    );
};
