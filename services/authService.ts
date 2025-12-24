/**
 * Auth Service - 인증 관리
 * 구글, 카카오, 이메일 로그인/회원가입
 * @module services/authService
 */

import { supabase, isSupabaseConfigured } from './storageAdapter';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { trackSignUpCompleted, trackLogin, identifyUser, resetUser } from './mixpanelService';

export interface AuthUser {
    id: string;
    email?: string;
    name?: string;
    avatarUrl?: string;
    provider: 'google' | 'kakao' | 'email';
}

// Map Supabase User to AuthUser
const mapUser = (user: User | null): AuthUser | null => {
    if (!user) return null;

    const provider = user.app_metadata?.provider as 'google' | 'kakao' | 'email' || 'email';

    return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0],
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        provider
    };
};

export const authService = {
    /**
     * 구글 OAuth 로그인
     */
    signInWithGoogle: async (): Promise<void> => {
        if (!isSupabaseConfigured() || !supabase) {
            throw new Error('Supabase is not configured');
        }

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        });

        if (error) {
            console.error('Google sign in error:', error);
            throw error;
        }
    },

    /**
     * 카카오 OAuth 로그인
     */
    signInWithKakao: async (): Promise<void> => {
        if (!isSupabaseConfigured() || !supabase) {
            throw new Error('Supabase is not configured');
        }

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'kakao',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        });

        if (error) {
            console.error('Kakao sign in error:', error);
            throw error;
        }
    },

    /**
     * 이메일 회원가입
     */
    signUpWithEmail: async (email: string, password: string, name?: string): Promise<AuthUser | null> => {
        if (!isSupabaseConfigured() || !supabase) {
            throw new Error('Supabase is not configured');
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name || email.split('@')[0]
                }
            }
        });

        if (error) {
            console.error('Email sign up error:', error);
            throw error;
        }

        // Track signup completed
        if (data.user) {
            trackSignUpCompleted(data.user.id, 'email');
        }

        return mapUser(data.user);
    },

    /**
     * 이메일 로그인
     */
    signInWithEmail: async (email: string, password: string): Promise<AuthUser | null> => {
        if (!isSupabaseConfigured() || !supabase) {
            throw new Error('Supabase is not configured');
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('Email sign in error:', error);
            throw error;
        }

        // Track login and identify user
        if (data.user) {
            trackLogin('email');
            identifyUser(data.user.id, {
                $email: data.user.email,
                $name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
            });
        }

        return mapUser(data.user);
    },

    /**
     * 로그아웃
     */
    signOut: async (): Promise<void> => {
        if (!isSupabaseConfigured() || !supabase) {
            return;
        }

        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Sign out error:', error);
            throw error;
        }

        // Reset Mixpanel user
        resetUser();
    },

    /**
     * 현재 사용자 조회
     */
    getCurrentUser: async (): Promise<AuthUser | null> => {
        if (!isSupabaseConfigured() || !supabase) {
            return null;
        }

        const { data: { user } } = await supabase.auth.getUser();
        return mapUser(user);
    },

    /**
     * 현재 세션 조회
     */
    getSession: async (): Promise<Session | null> => {
        if (!isSupabaseConfigured() || !supabase) {
            return null;
        }

        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },

    /**
     * 인증 상태 변화 감지
     */
    onAuthStateChange: (callback: (event: AuthChangeEvent, user: AuthUser | null) => void) => {
        if (!isSupabaseConfigured() || !supabase) {
            return { data: { subscription: { unsubscribe: () => { } } } };
        }

        return supabase.auth.onAuthStateChange((event, session) => {
            callback(event, mapUser(session?.user || null));
        });
    },

    /**
     * 비밀번호 재설정 이메일 발송
     */
    resetPassword: async (email: string): Promise<void> => {
        if (!isSupabaseConfigured() || !supabase) {
            throw new Error('Supabase is not configured');
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`
        });

        if (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    }
};
