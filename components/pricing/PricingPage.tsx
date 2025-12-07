/**
 * PricingPage - 가격표 페이지
 * 구독 플랜 비교 및 선택
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { subscriptionService, type SubscriptionPlan, type UserSubscription } from '../../services';
import { authService, type AuthUser } from '../../services';

interface Props {
    user: AuthUser | null;
}

export const PricingPage: React.FC<Props> = ({ user }) => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
    const [loading, setLoading] = useState(true);

    // Default plans for fallback
    const defaultPlans: SubscriptionPlan[] = [
        {
            id: 'basic',
            name: '기본',
            originalPrice: 27900,
            price: 15900,
            templateLimit: 3,
            aiLimit: 100,
            features: ['템플릿 3개 구독', 'AI 생성 월 100회', '기본 지원']
        },
        {
            id: 'pro',
            name: '프로',
            originalPrice: 89000,
            price: 55000,
            templateLimit: 10,
            aiLimit: null,
            features: ['템플릿 10개 구독', 'AI 생성 무제한', '우선 지원', '신규 템플릿 우선 접근']
        }
    ];

    useEffect(() => {
        const loadData = async () => {
            try {
                const plansData = await subscriptionService.getPlans();
                setPlans(plansData.length > 0 ? plansData : defaultPlans);

                if (user) {
                    const subscription = await subscriptionService.getUserSubscription(user.id);
                    setCurrentSubscription(subscription);
                }
            } catch (error) {
                console.error('Failed to load plans:', error);
                setPlans(defaultPlans); // Use default plans on error
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    const handleSelectPlan = async (planId: string) => {
        if (!user) {
            navigate('/login');
            return;
        }

        // TODO: Phase 4에서 토스페이먼츠 결제 연동
        // 지금은 바로 구독 생성 (테스트용)
        try {
            await subscriptionService.createSubscription(user.id, planId);
            alert('구독이 완료되었습니다!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Subscription failed:', error);
            alert('구독 처리 중 오류가 발생했습니다.');
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ko-KR').format(price);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-16 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        나에게 맞는 플랜을 선택하세요
                    </h1>
                    <p className="text-gray-500 text-lg">
                        지금 가입하면 특별 할인가로 시작할 수 있습니다
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {plans.map((plan, index) => {
                        const isPro = plan.id === 'pro';
                        const isBasic = plan.id === 'basic';
                        const isCurrentPlan = currentSubscription?.planId === plan.id;
                        const discount = Math.round((1 - plan.price / plan.originalPrice) * 100);

                        return (
                            <div
                                key={plan.id}
                                className={`relative bg-white rounded-2xl p-8 shadow-lg transition-all hover:shadow-xl flex flex-col ${isBasic ? 'border-2 border-[#5500FF] ring-4 ring-[#5500FF]/10' : 'border border-gray-200'
                                    }`}
                            >
                                {/* Popular Badge */}
                                {isBasic && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <div className="bg-[#5500FF] text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                            <Crown className="w-4 h-4" />
                                            인기
                                        </div>
                                    </div>
                                )}

                                {/* Plan Icon */}
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${isBasic ? 'bg-[#5500FF]' : 'bg-gray-100'
                                    }`}>
                                    {isBasic ? (
                                        <Sparkles className="w-7 h-7 text-white" />
                                    ) : (
                                        <Zap className="w-7 h-7 text-[#5500FF]" />
                                    )}
                                </div>

                                {/* Plan Name */}
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    {plan.name}
                                </h2>

                                {/* Price */}
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-bold text-gray-900">
                                            ₩{formatPrice(plan.price)}
                                        </span>
                                        <span className="text-gray-500">/월</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-gray-400 line-through text-sm">
                                            ₩{formatPrice(plan.originalPrice)}
                                        </span>
                                        <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold">
                                            {discount}% 할인
                                        </span>
                                    </div>
                                </div>

                                {/* Features */}
                                <ul className="space-y-3 mb-8 flex-grow">
                                    <li className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isBasic ? 'bg-[#5500FF]' : 'bg-gray-200'
                                            }`}>
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-gray-700">
                                            템플릿 <strong>{plan.templateLimit}개</strong> 구독
                                        </span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isBasic ? 'bg-[#5500FF]' : 'bg-gray-200'
                                            }`}>
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-gray-700">
                                            AI 생성 {plan.aiLimit === null ? (
                                                <strong className="text-[#5500FF]">무제한</strong>
                                            ) : (
                                                <>월 <strong>{plan.aiLimit}회</strong></>
                                            )}
                                        </span>
                                    </li>
                                    {plan.features.slice(2).map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isBasic ? 'bg-[#5500FF]' : 'bg-gray-200'
                                                }`}>
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                <button
                                    onClick={() => handleSelectPlan(plan.id)}
                                    disabled={isCurrentPlan}
                                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all mt-auto ${isCurrentPlan
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : isBasic
                                            ? 'bg-[#5500FF] text-white hover:bg-[#4400CC] shadow-lg shadow-[#5500FF]/30'
                                            : 'bg-gray-900 text-white hover:bg-gray-800'
                                        }`}
                                >
                                    {isCurrentPlan ? '현재 플랜' : '시작하기'}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Individual Template */}
                <div className="mt-16 text-center">
                    <div className="bg-white rounded-2xl p-8 max-w-2xl mx-auto border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            개별 템플릿 구매
                        </h3>
                        <p className="text-gray-500 mb-4">
                            원하는 템플릿만 개별로 구매하여 영구적으로 사용하세요
                        </p>
                        <div className="text-3xl font-bold text-gray-900 mb-4">
                            ₩9,900 <span className="text-base font-normal text-gray-500">/ 템플릿당</span>
                        </div>
                        <button
                            onClick={() => navigate('/templates')}
                            className="px-8 py-3 border-2 border-[#5500FF] text-[#5500FF] rounded-xl font-bold hover:bg-[#5500FF] hover:text-white transition-all"
                        >
                            템플릿 둘러보기
                        </button>
                    </div>
                </div>

                {/* FAQ or Additional Info */}
                <div className="mt-16 text-center text-gray-500 text-sm">
                    <p>모든 플랜은 언제든지 취소할 수 있습니다.</p>
                    <p className="mt-1">문의: support@muru.ai</p>
                </div>
            </div>
        </div>
    );
};
