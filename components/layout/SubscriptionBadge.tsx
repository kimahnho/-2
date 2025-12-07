/**
 * SubscriptionBadge - 헤더용 구독 상태 뱃지
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Zap, Sparkles } from 'lucide-react';
import { subscriptionService, type UserSubscription, type AIUsage } from '../../services';

interface Props {
    userId: string;
}

export const SubscriptionBadge: React.FC<Props> = ({ userId }) => {
    const navigate = useNavigate();
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);
    const [aiUsage, setAIUsage] = useState<AIUsage | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [sub, usage] = await Promise.all([
                    subscriptionService.getUserSubscription(userId),
                    subscriptionService.getAIUsage(userId)
                ]);
                setSubscription(sub);
                setAIUsage(usage);
            } catch (error) {
                console.error('Failed to load subscription:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [userId]);

    if (loading) {
        return null;
    }

    // No subscription - show upgrade button
    if (!subscription || subscription.status !== 'active') {
        return (
            <button
                onClick={() => navigate('/pricing')}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#5500FF] to-[#8B5CF6] text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
                <Crown className="w-4 h-4" />
                업그레이드
            </button>
        );
    }

    const isPro = subscription.planId === 'pro';
    const planName = subscription.plan?.name || subscription.planId;

    return (
        <div
            onClick={() => navigate('/subscription')}
            className="flex items-center gap-3 cursor-pointer group"
        >
            {/* Plan Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-all ${isPro
                    ? 'bg-gradient-to-r from-[#5500FF] to-[#8B5CF6] text-white'
                    : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200'
                }`}>
                {isPro ? <Sparkles className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                {planName}
            </div>

            {/* AI Usage (only for non-pro) */}
            {aiUsage && aiUsage.limit !== null && (
                <div className="text-xs text-gray-500">
                    AI: <span className={aiUsage.count >= aiUsage.limit ? 'text-red-500 font-bold' : 'text-gray-700'}>
                        {aiUsage.count}/{aiUsage.limit}
                    </span>
                </div>
            )}

            {/* Unlimited badge for Pro */}
            {isPro && (
                <div className="text-xs text-[#5500FF] font-medium">
                    AI 무제한
                </div>
            )}
        </div>
    );
};
