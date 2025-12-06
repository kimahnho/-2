/**
 * AuthGuard - 인증 상태 확인 래퍼 컴포넌트
 * 로그인 안 됨 → LoginPage 표시
 * 로그인 됨 → children 렌더링
 */

import React, { useEffect, useState } from 'react';
import { authService, type AuthUser } from '../../services';
import { LoginPage } from './LoginPage';

interface AuthGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check current session
        const checkAuth = async () => {
            try {
                const currentUser = await authService.getCurrentUser();
                setUser(currentUser);
            } catch (e) {
                console.error('Auth check error:', e);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        // Listen for auth state changes
        const { data: { subscription } } = authService.onAuthStateChange((event, authUser) => {
            setUser(authUser);
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    if (loading) {
        return (
            <div style={styles.loading}>
                {fallback || (
                    <div style={styles.spinner}>
                        <div style={styles.spinnerInner}></div>
                        <p style={styles.loadingText}>로딩 중...</p>
                    </div>
                )}
            </div>
        );
    }

    if (!user) {
        return <LoginPage onLoginSuccess={() => { }} />;
    }

    return <>{children}</>;
};

const styles: Record<string, React.CSSProperties> = {
    loading: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    spinner: {
        textAlign: 'center'
    },
    spinnerInner: {
        width: '48px',
        height: '48px',
        border: '4px solid rgba(255,255,255,0.3)',
        borderTopColor: 'white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto'
    },
    loadingText: {
        color: 'white',
        marginTop: '16px',
        fontSize: '16px'
    }
};

// Add keyframe animation
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
    document.head.appendChild(style);
}
