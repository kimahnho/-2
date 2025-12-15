/**
 * TemplatesPanel - 템플릿 전용 패널
 * 추천 템플릿 및 카테고리별 템플릿 표시
 */

import React, { useState } from 'react';
import { Layout, Heart, Brain, Users, Star, Grid, Layers } from 'lucide-react';
import { DesignElement } from '../../types';
import { TEMPLATES } from '../../constants';
import { AACConfigModal } from '../templates/AACConfigModal';
import { StorySequenceConfigModal } from '../templates/StorySequenceConfigModal';
import { TemplatePreview } from '../templates/TemplatePreview';

interface Props {
    onLoadTemplate: (elements: DesignElement[]) => void;
    onUpdatePageOrientation?: (orientation: 'portrait' | 'landscape') => void;
}

// 템플릿 카테고리 정의
const TEMPLATE_CATEGORIES = [
    { id: 'all', name: '전체', icon: <Layout className="w-4 h-4" /> },
    { id: 'emotion', name: '감정', icon: <Heart className="w-4 h-4" /> },
    { id: 'cognitive', name: '인지', icon: <Brain className="w-4 h-4" /> },
    { id: 'social', name: '사회성', icon: <Users className="w-4 h-4" /> },
    { id: 'aac', name: 'AAC', icon: <Grid className="w-4 h-4" /> },
];

export const TemplatesPanel: React.FC<Props> = ({ onLoadTemplate, onUpdatePageOrientation }) => {
    const [selectedCategory, setSelectedCategory] = React.useState('all');
    const [showAACConfig, setShowAACConfig] = useState(false);
    const [showStorySequenceConfig, setShowStorySequenceConfig] = useState(false);

    // 카테고리 필터링 (AAC 카테고리는 일반 템플릿에서 제외)
    const filteredTemplates = selectedCategory === 'all'
        ? TEMPLATES.filter(t => !(t as any).category || (t as any).category !== 'aac')
        : selectedCategory === 'aac'
            ? [] // AAC는 별도 카드로 처리
            : TEMPLATES.filter(t => (t as any).category === selectedCategory);

    const handleAACApply = (elements: DesignElement[], orientation: 'portrait' | 'landscape') => {
        // 1. 먼저 페이지 방향 변경
        if (onUpdatePageOrientation) {
            onUpdatePageOrientation(orientation);
        }
        // 2. 방향 변경 후 템플릿 요소 로드 (약간의 지연으로 상태 업데이트 보장)
        setTimeout(() => {
            onLoadTemplate(elements);
        }, 50);
        setShowAACConfig(false);
    };

    const handleStorySequenceApply = (elements: DesignElement[], orientation: 'portrait' | 'landscape') => {
        if (onUpdatePageOrientation) {
            onUpdatePageOrientation(orientation);
        }
        setTimeout(() => {
            onLoadTemplate(elements);
        }, 50);
        setShowStorySequenceConfig(false);
    };

    return (
        <div className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
                {TEMPLATE_CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategory === cat.id
                            ? 'bg-[#5500FF] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {cat.icon}
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* AAC 의사소통 판 (전체 또는 AAC 카테고리 선택 시 표시) */}
            {(selectedCategory === 'all' || selectedCategory === 'aac') && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Grid className="w-4 h-4 text-[#5500FF]" />
                        <h3 className="font-bold text-sm text-gray-700">AAC 의사소통 판</h3>
                    </div>
                    <button
                        onClick={() => setShowAACConfig(true)}
                        className="w-full p-4 bg-gradient-to-br from-[#5500FF]/5 to-[#7733FF]/10 rounded-xl border-2 border-[#5500FF]/20 hover:border-[#5500FF] hover:shadow-lg transition-all text-left group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#5500FF] rounded-xl text-white group-hover:scale-110 transition-transform">
                                <Grid className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-base">AAC 의사소통 판</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    1~8 그리드, 가로/세로 방향 선택
                                </p>
                            </div>
                            <div className="px-3 py-1 bg-[#5500FF]/10 text-[#5500FF] text-xs font-bold rounded-full">
                                설정
                            </div>
                        </div>
                    </button>
                </div>
            )}

            {/* 이야기 장면 순서 맞추기 (전체 또는 인지 카테고리 선택 시 표시) */}
            {(selectedCategory === 'all' || selectedCategory === 'cognitive') && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Layers className="w-4 h-4 text-blue-500" />
                        <h3 className="font-bold text-sm text-gray-700">이야기 장면 순서 맞추기</h3>
                    </div>
                    <button
                        onClick={() => setShowStorySequenceConfig(true)}
                        className="w-full p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 hover:border-blue-500 hover:shadow-lg transition-all text-left group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500 rounded-xl text-white group-hover:scale-110 transition-transform">
                                <Layers className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-base">이야기 장면 순서 맞추기</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    2~8개 카드, 순서 화살표 자동 생성
                                </p>
                            </div>
                            <div className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-full">
                                설정
                            </div>
                        </div>
                    </button>
                </div>
            )}

            {/* Popular Templates */}
            {filteredTemplates.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Star className="w-4 h-4 text-orange-500" />
                        <h3 className="font-bold text-sm text-gray-700">
                            {selectedCategory === 'all' ? '인기 템플릿' : '템플릿'}
                        </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {filteredTemplates.slice(0, selectedCategory === 'all' ? 4 : undefined).map(template => (
                            <button
                                key={template.id}
                                onClick={() => onLoadTemplate(template.elements as unknown as DesignElement[])}
                                className="group relative aspect-[3/4] bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-[#5500FF] hover:shadow-lg transition-all text-left"
                            >
                                {/* Template Preview */}
                                <div className="absolute inset-0 p-1">
                                    <TemplatePreview
                                        elements={template.elements as Partial<DesignElement>[]}
                                        width={110}
                                        height={146}
                                    />
                                </div>

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                {/* Template Info */}
                                <div className="absolute inset-0 p-3 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-1 mb-1">
                                        <span className="px-1.5 py-0.5 bg-orange-500/90 text-white text-[9px] font-bold rounded">인기</span>
                                    </div>
                                    <h4 className="text-white text-xs font-bold">{template.name}</h4>
                                </div>

                                {/* Always visible name at bottom */}
                                <div className="absolute bottom-0 left-0 right-0 bg-white/95 px-2 py-1.5 border-t border-gray-100">
                                    <h4 className="text-gray-700 text-[10px] font-medium text-center truncate">{template.name}</h4>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* All Templates (only in 'all' category) */}
            {selectedCategory === 'all' && filteredTemplates.length > 4 && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-sm text-gray-700">모든 템플릿</h3>
                        <span className="text-xs text-gray-400">{filteredTemplates.length}개</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {filteredTemplates.map(template => (
                            <button
                                key={template.id}
                                onClick={() => onLoadTemplate(template.elements as unknown as DesignElement[])}
                                className="group relative aspect-[3/4] bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-[#5500FF] hover:shadow-lg transition-all text-left"
                            >
                                {/* Template Preview */}
                                <div className="absolute inset-0 p-1">
                                    <TemplatePreview
                                        elements={template.elements as Partial<DesignElement>[]}
                                        width={110}
                                        height={146}
                                    />
                                </div>

                                {/* Overlay Gradient on hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                {/* Template Info on hover */}
                                <div className="absolute inset-0 p-3 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <h4 className="text-white text-xs font-bold">{template.name}</h4>
                                </div>

                                {/* Always visible name at bottom */}
                                <div className="absolute bottom-0 left-0 right-0 bg-white/95 px-2 py-1.5 border-t border-gray-100">
                                    <h4 className="text-gray-700 text-[10px] font-medium text-center truncate">{template.name}</h4>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* AAC 카테고리 선택 시 추가 설명 */}
            {selectedCategory === 'aac' && (
                <div className="text-center text-gray-400 text-sm py-4">
                    위의 "AAC 의사소통 판" 버튼을 클릭하여<br />
                    그리드 크기와 용지 방향을 설정하세요.
                </div>
            )}

            {/* AAC Config Modal */}
            {showAACConfig && (
                <AACConfigModal
                    onClose={() => setShowAACConfig(false)}
                    onApply={handleAACApply}
                    onOrientationChange={onUpdatePageOrientation}
                />
            )}

            {/* Story Sequence Config Modal */}
            {showStorySequenceConfig && (
                <StorySequenceConfigModal
                    onClose={() => setShowStorySequenceConfig(false)}
                    onApply={handleStorySequenceApply}
                    onOrientationChange={onUpdatePageOrientation}
                />
            )}
        </div>
    );
};
