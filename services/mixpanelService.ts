/**
 * Mixpanel Service - AARRR Analytics Tracking
 * @module services/mixpanelService
 * 
 * AARRR Framework:
 * - Acquisition: 사용자 획득
 * - Activation: 첫 가치 경험
 * - Retention: 재방문
 * - Revenue: 수익화
 * - Referral: 추천
 */

import mixpanel from 'mixpanel-browser';

// @ts-ignore - Vite environment variable
const MIXPANEL_TOKEN = (import.meta as any).env?.VITE_MIXPANEL_TOKEN || '098f43b5782de9c54c60458c33731649';

let isInitialized = false;

/**
 * Mixpanel 초기화
 */
export const initMixpanel = () => {
    if (isInitialized) return;

    mixpanel.init(MIXPANEL_TOKEN, {
        debug: typeof window !== 'undefined' && window.location.hostname === 'localhost',
        track_pageview: true,
        persistence: 'localStorage',
        record_sessions_percent: 100, // Session Replay: 100% of sessions
    });

    isInitialized = true;
    console.log('[Mixpanel] Initialized');
};

/**
 * 사용자 식별 (로그인 시 호출)
 */
export const identifyUser = (userId: string, properties?: Record<string, any>) => {
    if (!isInitialized) return;

    mixpanel.identify(userId);

    if (properties) {
        mixpanel.people.set(properties);
    }
};

/**
 * 사용자 식별 해제 (로그아웃 시 호출)
 */
export const resetUser = () => {
    if (!isInitialized) return;
    mixpanel.reset();
};

// ==================== ACQUISITION (획득) ====================

export const trackSignUpStarted = (method: 'email' | 'google' | 'naver') => {
    if (!isInitialized) return;
    mixpanel.track('Sign Up Started', { method });
};

export const trackSignUpCompleted = (userId: string, method: 'email' | 'google' | 'naver') => {
    if (!isInitialized) return;
    mixpanel.track('Sign Up Completed', { method });
    identifyUser(userId, {
        $created: new Date().toISOString(),
        sign_up_method: method,
    });
};

export const trackLogin = (method: 'email' | 'google' | 'naver') => {
    if (!isInitialized) return;
    mixpanel.track('Login', { method });
};

// ==================== ACTIVATION (활성화) ====================

export const trackFirstProjectCreated = () => {
    if (!isInitialized) return;
    mixpanel.track('First Project Created');
    mixpanel.people.set({ first_project_at: new Date().toISOString() });
};

export const trackTemplateUsed = (templateId: string, templateName: string) => {
    if (!isInitialized) return;
    mixpanel.track('Template Used', { template_id: templateId, template_name: templateName });
};

export const trackAACCardSelected = (cardId: string, category: string) => {
    if (!isInitialized) return;
    mixpanel.track('AAC Card Selected', { card_id: cardId, category });
};

export const trackEmotionCardSelected = (emotionId: string, emotionLabel: string) => {
    if (!isInitialized) return;
    mixpanel.track('Emotion Card Selected', { emotion_id: emotionId, emotion_label: emotionLabel });
};

// ==================== RETENTION (유지) ====================

export const trackSessionStart = () => {
    if (!isInitialized) return;
    mixpanel.track('Session Start');
    mixpanel.people.increment('session_count');
    mixpanel.people.set({ last_seen: new Date().toISOString() });
};

export const trackProjectOpened = (projectId: string, projectTitle: string) => {
    if (!isInitialized) return;
    mixpanel.track('Project Opened', { project_id: projectId, project_title: projectTitle });
};

export const trackProjectSaved = (projectId: string) => {
    if (!isInitialized) return;
    mixpanel.track('Project Saved', { project_id: projectId });
    mixpanel.people.increment('total_saves');
};

export const trackProjectCreated = (projectId: string) => {
    if (!isInitialized) return;
    mixpanel.track('Project Created', { project_id: projectId });
    mixpanel.people.increment('total_projects');
};

// ==================== REVENUE (수익) ====================

export const trackSubscriptionViewed = (planType?: string) => {
    if (!isInitialized) return;
    mixpanel.track('Subscription Viewed', { plan_type: planType });
};

export const trackSubscriptionStarted = (planType: string, amount: number) => {
    if (!isInitialized) return;
    mixpanel.track('Subscription Started', { plan_type: planType, amount });
    mixpanel.people.set({
        subscription_plan: planType,
        subscription_started_at: new Date().toISOString(),
    });
};

// ==================== REFERRAL (추천) ====================

export const trackProjectShared = (projectId: string, shareMethod: string) => {
    if (!isInitialized) return;
    mixpanel.track('Project Shared', { project_id: projectId, share_method: shareMethod });
    mixpanel.people.increment('total_shares');
};

export const trackPdfDownloaded = (projectId: string) => {
    if (!isInitialized) return;
    mixpanel.track('PDF Downloaded', { project_id: projectId });
    mixpanel.people.increment('total_downloads');
};

// ==================== GENERIC ====================

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (!isInitialized) return;
    mixpanel.track(eventName, properties);
};

export const trackPageView = (pageName: string) => {
    if (!isInitialized) return;
    mixpanel.track('Page View', { page: pageName });
};
