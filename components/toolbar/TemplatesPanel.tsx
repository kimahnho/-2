/**
 * TemplatesPanel - 템플릿 전용 패널
 * 추천 템플릿 및 카테고리별 템플릿 표시
 */

import React from 'react';
import { Layout, FileText, Heart, Brain, Users, Star, Sparkles } from 'lucide-react';
import { DesignElement } from '../../types';
import { TEMPLATES } from '../../constants';

interface Props {
    onLoadTemplate: (elements: DesignElement[]) => void;
}

// 템플릿 카테고리 정의
const TEMPLATE_CATEGORIES = [
    { id: 'all', name: '전체', icon: <Layout className="w-4 h-4" /> },
    { id: 'emotion', name: '감정', icon: <Heart className="w-4 h-4" /> },
    { id: 'cognitive', name: '인지', icon: <Brain className="w-4 h-4" /> },
    { id: 'social', name: '사회성', icon: <Users className="w-4 h-4" /> },
];

export const TemplatesPanel: React.FC<Props> = ({ onLoadTemplate }) => {
    const [selectedCategory, setSelectedCategory] = React.useState('all');

    // 향후 카테고리 필터링에 사용
    const filteredTemplates = TEMPLATES;

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

            {/* Popular Templates */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-orange-500" />
                    <h3 className="font-bold text-sm text-gray-700">인기 템플릿</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {filteredTemplates.slice(0, 4).map(template => (
                        <button
                            key={template.id}
                            onClick={() => onLoadTemplate(template.elements as unknown as DesignElement[])}
                            className="group relative aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border border-gray-200 hover:border-[#5500FF] hover:shadow-lg transition-all text-left"
                        >
                            {/* Background Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                            {/* Preview Icon */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-40 transition-opacity">
                                <Layout className="w-12 h-12 text-gray-600" />
                            </div>

                            {/* Template Info */}
                            <div className="absolute inset-0 p-3 flex flex-col justify-end">
                                <div className="flex items-center gap-1 mb-1">
                                    <span className="px-1.5 py-0.5 bg-orange-500/90 text-white text-[9px] font-bold rounded">인기</span>
                                </div>
                                <h4 className="text-white text-xs font-bold">{template.name}</h4>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* All Templates */}
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
                            className="group relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 hover:border-[#5500FF] hover:shadow-lg transition-all text-left"
                        >
                            {/* Background */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                            {/* Preview Icon */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-40 transition-opacity">
                                <Layout className="w-12 h-12 text-gray-600" />
                            </div>

                            {/* Template Info */}
                            <div className="absolute inset-0 p-3 flex flex-col justify-end">
                                <h4 className="text-white text-xs font-bold">{template.name}</h4>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
