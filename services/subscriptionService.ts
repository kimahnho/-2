/**
 * Subscription Service - 구독 관리
 * 플랜 조회, 구독 상태, AI 사용량 관리
 * @module services/subscriptionService
 */

import { supabase, isSupabaseConfigured } from './storageAdapter';

// Types
export interface SubscriptionPlan {
    id: string;
    name: string;
    originalPrice: number;
    price: number;
    templateLimit: number;
    aiLimit: number | null; // null = unlimited
    features: string[];
}

export interface UserSubscription {
    id: string;
    userId: string;
    planId: string;
    status: 'active' | 'cancelled' | 'expired' | 'pending';
    startedAt: string;
    expiresAt: string | null;
    cancelledAt: string | null;
    plan?: SubscriptionPlan;
}

export interface AIUsage {
    month: string;
    count: number;
    limit: number | null;
}

// Helper: Get current month in YYYY-MM format
const getCurrentMonth = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const subscriptionService = {
    /**
     * 모든 구독 플랜 조회
     */
    getPlans: async (): Promise<SubscriptionPlan[]> => {
        if (!isSupabaseConfigured() || !supabase) {
            // Return default plans for demo
            return [
                {
                    id: 'basic',
                    name: '기본',
                    originalPrice: 24900,
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
        }

        const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .order('price', { ascending: true });

        if (error) {
            console.error('Failed to fetch plans:', error);
            throw error;
        }

        return (data || []).map(p => ({
            id: p.id,
            name: p.name,
            originalPrice: p.original_price,
            price: p.price,
            templateLimit: p.template_limit,
            aiLimit: p.ai_limit,
            features: p.features || []
        }));
    },

    /**
     * 사용자의 현재 구독 조회
     */
    getUserSubscription: async (userId: string): Promise<UserSubscription | null> => {
        if (!isSupabaseConfigured() || !supabase) {
            return null;
        }

        const { data, error } = await supabase
            .from('user_subscriptions')
            .select(`
                *,
                subscription_plans (*)
            `)
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            console.error('Failed to fetch subscription:', error);
            throw error;
        }

        if (!data) return null;

        return {
            id: data.id,
            userId: data.user_id,
            planId: data.plan_id,
            status: data.status,
            startedAt: data.started_at,
            expiresAt: data.expires_at,
            cancelledAt: data.cancelled_at,
            plan: data.subscription_plans ? {
                id: data.subscription_plans.id,
                name: data.subscription_plans.name,
                originalPrice: data.subscription_plans.original_price,
                price: data.subscription_plans.price,
                templateLimit: data.subscription_plans.template_limit,
                aiLimit: data.subscription_plans.ai_limit,
                features: data.subscription_plans.features || []
            } : undefined
        };
    },

    /**
     * 구독 생성 (결제 완료 후 호출)
     */
    createSubscription: async (
        userId: string,
        planId: string,
        billingKey?: string,
        customerKey?: string
    ): Promise<UserSubscription> => {
        if (!isSupabaseConfigured() || !supabase) {
            throw new Error('Supabase is not configured');
        }

        // Calculate expiry (1 month from now)
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        const { data, error } = await supabase
            .from('user_subscriptions')
            .upsert({
                user_id: userId,
                plan_id: planId,
                status: 'active',
                started_at: new Date().toISOString(),
                expires_at: expiresAt.toISOString(),
                billing_key: billingKey,
                customer_key: customerKey
            }, { onConflict: 'user_id' })
            .select()
            .single();

        if (error) {
            console.error('Failed to create subscription:', error);
            throw error;
        }

        return {
            id: data.id,
            userId: data.user_id,
            planId: data.plan_id,
            status: data.status,
            startedAt: data.started_at,
            expiresAt: data.expires_at,
            cancelledAt: data.cancelled_at
        };
    },

    /**
     * 구독 취소
     */
    cancelSubscription: async (userId: string): Promise<void> => {
        if (!isSupabaseConfigured() || !supabase) {
            throw new Error('Supabase is not configured');
        }

        const { error } = await supabase
            .from('user_subscriptions')
            .update({
                status: 'cancelled',
                cancelled_at: new Date().toISOString()
            })
            .eq('user_id', userId);

        if (error) {
            console.error('Failed to cancel subscription:', error);
            throw error;
        }
    },

    /**
     * AI 사용량 조회
     */
    getAIUsage: async (userId: string): Promise<AIUsage> => {
        if (!isSupabaseConfigured() || !supabase) {
            return { month: getCurrentMonth(), count: 0, limit: 100 };
        }

        const month = getCurrentMonth();

        // Get current usage
        const { data: usage } = await supabase
            .from('ai_usage')
            .select('count')
            .eq('user_id', userId)
            .eq('month', month)
            .single();

        // Get user's plan limit
        const subscription = await subscriptionService.getUserSubscription(userId);
        const limit = subscription?.plan?.aiLimit ?? 100; // Default to basic limit

        return {
            month,
            count: usage?.count || 0,
            limit
        };
    },

    /**
     * AI 사용량 증가
     */
    incrementAIUsage: async (userId: string): Promise<number> => {
        if (!isSupabaseConfigured() || !supabase) {
            return 0;
        }

        const month = getCurrentMonth();

        // Upsert: Insert if not exists, increment if exists
        const { data, error } = await supabase
            .from('ai_usage')
            .upsert(
                { user_id: userId, month, count: 1 },
                { onConflict: 'user_id,month' }
            )
            .select('count')
            .single();

        if (error) {
            // If upsert fails, try to increment existing
            const { data: updated, error: updateError } = await supabase
                .rpc('increment_ai_usage', { p_user_id: userId, p_month: month });

            if (updateError) {
                console.error('Failed to increment AI usage:', updateError);
                return 0;
            }
            return updated || 0;
        }

        // If record already existed, we need to increment
        if (data && data.count === 1) {
            // This was an insert, count is already 1
            return 1;
        }

        // Increment existing count
        const { data: incremented } = await supabase
            .from('ai_usage')
            .update({ count: (data?.count || 0) + 1 })
            .eq('user_id', userId)
            .eq('month', month)
            .select('count')
            .single();

        return incremented?.count || 0;
    },

    /**
     * AI 사용 가능 여부 체크
     */
    canUseAI: async (userId: string): Promise<{ allowed: boolean; remaining: number | null; message?: string }> => {
        const usage = await subscriptionService.getAIUsage(userId);

        // Unlimited (Pro plan)
        if (usage.limit === null) {
            return { allowed: true, remaining: null };
        }

        // Check limit
        if (usage.count >= usage.limit) {
            return {
                allowed: false,
                remaining: 0,
                message: `이번 달 AI 생성 횟수(${usage.limit}회)를 모두 사용했습니다. 프로 플랜으로 업그레이드하면 무제한으로 사용할 수 있습니다.`
            };
        }

        return {
            allowed: true,
            remaining: usage.limit - usage.count
        };
    },

    /**
     * 템플릿 사용 가능 개수 조회
     */
    getTemplateLimit: async (userId: string): Promise<number> => {
        const subscription = await subscriptionService.getUserSubscription(userId);
        return subscription?.plan?.templateLimit ?? 0; // No subscription = no templates
    }
};
