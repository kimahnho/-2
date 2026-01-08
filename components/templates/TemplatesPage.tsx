/**
 * TemplatesPage - 템플릿 마켓 페이지
 * 구독 플랜 또는 개별 구매 가능한 템플릿 표시
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Layout, Heart, Brain, Users, Star, Sparkles,
    FileText, Calendar, MessageSquare, Award,
    Check, Lock, ShoppingCart
} from 'lucide-react';
import { AuthUser } from '../../services';

interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    icon: React.ReactNode;
    popular?: boolean;
    features: string[];
}

const templates: Template[] = [
    {
        id: 'aac',
        name: '어휘 학습 카드',
        description: '이미지와 AAC 상징을 활용한 맞춤형 어휘 학습 카드 만들기',
        category: '의사소통',
        price: 0,
        icon: <Layout className="w-6 h-6" />,
        popular: true,
        features: ['이미지 삽입 가이드', 'AAC 상징 활용', '자유로운 편집']
    },
    {
        id: 'emotion-card',
        name: '감정 카드',
        description: '다양한 감정을 표현하고 인식하는 활동지',
        category: '사회성',
        price: 9900,
        icon: <Heart className="w-6 h-6" />,
        popular: true,
        features: ['10가지 기본 감정', '상황 카드 포함', 'AI 감정 생성']
    },
    {
        id: 'daily-routine',
        name: '일과표',
        description: '하루 일과를 시각적으로 정리하는 템플릿',
        category: '일상생활',
        price: 9900,
        icon: <Calendar className="w-6 h-6" />,
        popular: true,
        features: ['시간대별 레이아웃', '시각적 타임라인', '커스텀 아이콘']
    },
    {
        id: 'social-story',
        name: '사회적 이야기',
        description: '상황별 적절한 행동 학습을 위한 스토리 템플릿',
        category: '사회성',
        price: 12900,
        icon: <Users className="w-6 h-6" />,
        popular: true,
        features: ['상황별 시나리오', '단계별 가이드', '선택지 카드']
    },
    {
        id: 'cognitive-task',
        name: '인지 과제',
        description: '분류, 매칭, 순서 배열 등 인지 활동',
        category: '인지',
        price: 9900,
        icon: <Brain className="w-6 h-6" />,
        features: ['난이도별 구성', '다양한 활동 유형', '진행 체크리스트']
    },
    {
        id: 'reward-chart',
        name: '보상 차트',
        description: '목표 달성과 동기 부여를 위한 차트',
        category: '행동지원',
        price: 7900,
        icon: <Award className="w-6 h-6" />,
        features: ['목표 설정', '스티커 시스템', '보상 관리']
    },
    {
        id: 'choice-board',
        name: '선택판',
        description: '의사결정 및 선택 연습을 위한 보드',
        category: '의사소통',
        price: 9900,
        icon: <MessageSquare className="w-6 h-6" />,
        features: ['카테고리별 선택지', '이미지 + 텍스트', 'AI 이미지 생성']
    }
];

const categories = ['전체', '사회성', '일상생활', '인지', '행동지원', '의사소통'];

interface Props {
    user: AuthUser | null;
}

export const TemplatesPage: React.FC<Props> = ({ user }) => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('전체');

    const filteredTemplates = selectedCategory === '전체'
        ? templates
        : templates.filter(t => t.category === selectedCategory);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ko-KR').format(price);
    };

    const handlePurchase = (templateId: string) => {
        if (!user) {
            navigate('/login');
            return;
        }
        // TODO: 결제 연동
        alert('결제 기능은 준비 중입니다.');
    };

    const handleUseTemplate = (templateId: string) => {
        navigate(`/editor/template-${templateId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        템플릿 마켓
                    </h1>
                    <p className="text-gray-500 text-lg">
                        전문가가 설계한 학습지 템플릿으로 빠르게 시작하세요
                    </p>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-3 mb-10">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-5 py-2 rounded-full font-medium transition-all ${selectedCategory === cat
                                ? 'bg-[#5500FF] text-white shadow-lg shadow-[#5500FF]/30'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Templates Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map(template => (
                        <div
                            key={template.id}
                            className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all group"
                        >
                            {/* Template Preview */}
                            <div className="h-40 bg-gradient-to-br from-[#5500FF]/5 to-[#5500FF]/10 flex items-center justify-center relative">
                                <div className="p-4 bg-white rounded-2xl shadow-lg text-[#5500FF]">
                                    {template.icon}
                                </div>
                                {template.popular && (
                                    <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-current" />
                                        인기
                                    </div>
                                )}
                            </div>

                            {/* Template Info */}
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{template.name}</h3>
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                            {template.category}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-500 mb-4">{template.description}</p>

                                {/* Features */}
                                <ul className="space-y-1 mb-4">
                                    {template.features.slice(0, 3).map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                                            <Check className="w-3 h-3 text-[#5500FF]" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                {/* Price & CTA */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div>
                                        <span className="text-2xl font-bold text-gray-900">
                                            ₩{formatPrice(template.price)}
                                        </span>
                                        <span className="text-xs text-gray-400 ml-1">/ 영구 사용</span>
                                    </div>
                                    <button
                                        onClick={() => handlePurchase(template.id)}
                                        className="px-4 py-2 bg-[#5500FF] text-white rounded-lg font-medium hover:bg-[#4400CC] transition-all flex items-center gap-2"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        구매
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Subscription CTA */}
                <div className="mt-16 bg-gradient-to-r from-[#5500FF] to-[#7733FF] rounded-2xl p-8 text-white text-center">
                    <h2 className="text-2xl font-bold mb-2">구독하고 모든 템플릿을 이용하세요</h2>
                    <p className="text-white/80 mb-6">
                        기본 플랜은 3개, 프로 플랜은 10개 템플릿을 자유롭게 사용할 수 있습니다
                    </p>
                    <button
                        onClick={() => navigate('/pricing')}
                        className="px-8 py-3 bg-white text-[#5500FF] rounded-xl font-bold hover:bg-gray-100 transition-all"
                    >
                        구독 플랜 보기
                    </button>
                </div>

                {/* Footer Info */}
                <div className="mt-12 text-center text-gray-500 text-sm">
                    <p>모든 템플릿은 한 번 구매하면 영구적으로 사용할 수 있습니다.</p>
                    <p className="mt-1">문의: support@muru.ai</p>
                </div>
            </div>
        </div>
    );
};
