/**
 * TemplateSection - 추천 템플릿 섹션
 * 인기 템플릿 및 카테고리별 템플릿 표시
 */

import React from 'react';
import { Sparkles, FileText, Users, Brain, Heart, Star } from 'lucide-react';

interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: React.ReactNode;
    popular?: boolean;
}

const templates: Template[] = [
    {
        id: 'emotion-card',
        name: '감정 카드',
        description: '다양한 감정을 표현하고 인식하는 활동',
        category: '사회성',
        icon: <Heart className="w-6 h-6" />,
        popular: true
    },
    {
        id: 'daily-routine',
        name: '일과표',
        description: '하루 일과를 시각적으로 정리',
        category: '일상생활',
        icon: <FileText className="w-6 h-6" />,
        popular: true
    },
    {
        id: 'social-story',
        name: '사회적 이야기',
        description: '상황별 적절한 행동 학습',
        category: '사회성',
        icon: <Users className="w-6 h-6" />,
        popular: true
    },
    {
        id: 'cognitive-task',
        name: '인지 과제',
        description: '분류, 매칭, 순서 배열 등',
        category: '인지',
        icon: <Brain className="w-6 h-6" />
    },
    {
        id: 'reward-chart',
        name: '보상 차트',
        description: '목표 달성과 동기 부여',
        category: '행동지원',
        icon: <Star className="w-6 h-6" />
    },
    {
        id: 'choice-board',
        name: '선택판',
        description: '의사결정 및 선택 연습',
        category: '의사소통',
        icon: <Sparkles className="w-6 h-6" />
    }
];

interface Props {
    onSelectTemplate?: (templateId: string) => void;
}

export const TemplateSection: React.FC<Props> = ({ onSelectTemplate }) => {
    const popularTemplates = templates.filter(t => t.popular);
    const otherTemplates = templates.filter(t => !t.popular);

    return (
        <div className="w-full max-w-5xl mx-auto mt-12">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">추천 템플릿</h2>
                    <p className="text-gray-500 mt-1">자주 사용되는 학습지 템플릿을 선택해보세요</p>
                </div>
                <button className="text-[#5500FF] font-medium hover:underline">
                    전체보기 →
                </button>
            </div>

            {/* Popular Templates */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
                {popularTemplates.map(template => (
                    <div
                        key={template.id}
                        onClick={() => onSelectTemplate?.(template.id)}
                        className="bg-white rounded-xl p-5 border border-gray-200 hover:border-[#5500FF] hover:shadow-lg transition-all cursor-pointer group"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-[#5500FF]/10 rounded-xl text-[#5500FF] group-hover:bg-[#5500FF] group-hover:text-white transition-all">
                                {template.icon}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-gray-900">{template.name}</h3>
                                    {template.popular && (
                                        <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-bold rounded-full">
                                            인기
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                                <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                    {template.category}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Other Templates */}
            <div className="grid md:grid-cols-3 gap-4">
                {otherTemplates.map(template => (
                    <div
                        key={template.id}
                        onClick={() => onSelectTemplate?.(template.id)}
                        className="bg-white rounded-xl p-5 border border-gray-200 hover:border-[#5500FF] hover:shadow-lg transition-all cursor-pointer group"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-gray-100 rounded-xl text-gray-600 group-hover:bg-[#5500FF] group-hover:text-white transition-all">
                                {template.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900">{template.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                                <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                    {template.category}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
