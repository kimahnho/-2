/**
 * TemplatesPanel - 템플릿 전용 패널
 * 추천 템플릿 및 카테고리별 템플릿 표시
 */

import React, { useState } from 'react';
import { Layout, Heart, Brain, Users, Grid, Layers } from 'lucide-react';
import { DesignElement } from '../../types';
import { ALL_TEMPLATES, TemplateDefinition } from '../../templates';
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
    const [configuringTemplate, setConfiguringTemplate] = useState<TemplateDefinition | null>(null);

    // 카테고리 필터링
    const filteredTemplates = selectedCategory === 'all'
        ? ALL_TEMPLATES
        : ALL_TEMPLATES.filter(t => t.category === selectedCategory);

    const handleTemplateClick = (template: TemplateDefinition) => {
        if (template.isDynamic) {
            setConfiguringTemplate(template);
        } else if (template.elements) {
            onLoadTemplate(template.elements);
        }
    };

    const handleDynamicApply = (elements: DesignElement[], orientation: 'portrait' | 'landscape') => {
        if (onUpdatePageOrientation) {
            onUpdatePageOrientation(orientation);
        }
        setTimeout(() => {
            onLoadTemplate(elements);
        }, 50);
        setConfiguringTemplate(null);
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
                        onClick={() => handleTemplateClick(ALL_TEMPLATES.find(t => t.id === 'aac-config')!)}
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
                        onClick={() => handleTemplateClick(ALL_TEMPLATES.find(t => t.id === 'story-sequence')!)}
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

            {/* Unified Template List (Exclude Dynamic templates that are handled above) */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Layout className="w-4 h-4 text-gray-500" />
                        <h3 className="font-bold text-sm text-gray-700">
                            {selectedCategory === 'all' ? '모든 템플릿' : '템플릿'}
                        </h3>
                    </div>
                    <span className="text-xs text-gray-400">
                        {filteredTemplates.filter(t => !t.isDynamic).length}개
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {filteredTemplates
                        .filter(t => !t.isDynamic) // Exclude dynamic templates from grid
                        .map(template => (
                            <button
                                key={template.id}
                                onClick={() => handleTemplateClick(template)}
                                className="group relative aspect-[3/4] bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-[#5500FF] hover:shadow-lg transition-all text-left"
                            >
                                {/* Template Preview or Thumbnail */}
                                <div className="absolute inset-0 p-1">
                                    {template.thumbnail ? (
                                        <img
                                            src={template.thumbnail}
                                            alt={template.name}
                                            className="w-full h-full object-cover rounded-lg opacity-80"
                                        />
                                    ) : template.elements ? (
                                        <TemplatePreview
                                            elements={template.elements as Partial<DesignElement>[]}
                                            width={110}
                                            height={146}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                                            <span className="text-xs text-gray-400">No Preview</span>
                                        </div>
                                    )}
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

            {/* Dynamic Configuration Modal */}
            {configuringTemplate && configuringTemplate.ConfigComponent && (
                <configuringTemplate.ConfigComponent
                    onClose={() => setConfiguringTemplate(null)}
                    onApply={handleDynamicApply}
                    onOrientationChange={onUpdatePageOrientation}
                />
            )}
        </div>
    );
};
