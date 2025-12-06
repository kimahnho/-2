/**
 * LoginPage - 로그인/회원가입 페이지
 * 구글, 카카오, 이메일 로그인 지원
 */

import React, { useState } from 'react';
import { authService } from '../../services';

interface LoginPageProps {
    onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            await authService.signInWithGoogle();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : '구글 로그인에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleKakaoLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            await authService.signInWithKakao();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : '카카오 로그인에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            if (mode === 'signup') {
                await authService.signUpWithEmail(email, password, name);
                setSuccessMessage('회원가입이 완료되었습니다. 이메일을 확인해주세요.');
                setMode('login');
            } else {
                await authService.signInWithEmail(email, password);
                onLoginSuccess?.();
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : '로그인에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Logo */}
                <div style={styles.logoSection}>
                    <h1 style={styles.logo}>MURU.AI</h1>
                    <p style={styles.subtitle}>언어치료사를 위한 학습지 디자인 도구</p>
                </div>

                {/* Social Login Buttons */}
                <div style={styles.socialButtons}>
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        style={{ ...styles.socialButton, ...styles.googleButton }}
                    >
                        <svg style={styles.socialIcon} viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google로 계속하기
                    </button>

                    <button
                        onClick={handleKakaoLogin}
                        disabled={loading}
                        style={{ ...styles.socialButton, ...styles.kakaoButton }}
                    >
                        <svg style={styles.socialIcon} viewBox="0 0 24 24">
                            <path fill="#3C1E1E" d="M12 3c5.8 0 10.5 3.66 10.5 8.18 0 4.52-4.7 8.18-10.5 8.18-.88 0-1.73-.08-2.55-.24l-4.05 2.75c-.34.23-.8-.04-.73-.44l.56-3.39C2.72 16.16 1.5 14.32 1.5 12.18 1.5 7.66 6.2 4 12 4z" />
                        </svg>
                        카카오로 계속하기
                    </button>
                </div>

                {/* Divider */}
                <div style={styles.divider}>
                    <span style={styles.dividerText}>또는</span>
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailSubmit} style={styles.form}>
                    {mode === 'signup' && (
                        <input
                            type="text"
                            placeholder="이름"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={styles.input}
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="이메일"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        required
                        minLength={6}
                    />

                    {error && <p style={styles.error}>{error}</p>}
                    {successMessage && <p style={styles.success}>{successMessage}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        style={styles.submitButton}
                    >
                        {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
                    </button>
                </form>

                {/* Mode Toggle */}
                <p style={styles.toggleText}>
                    {mode === 'login' ? (
                        <>
                            계정이 없으신가요?{' '}
                            <button onClick={() => setMode('signup')} style={styles.toggleButton}>
                                회원가입
                            </button>
                        </>
                    ) : (
                        <>
                            이미 계정이 있으신가요?{' '}
                            <button onClick={() => setMode('login')} style={styles.toggleButton}>
                                로그인
                            </button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
    },
    card: {
        background: 'white',
        borderRadius: '24px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    logoSection: {
        textAlign: 'center',
        marginBottom: '32px'
    },
    logo: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#5500FF',
        margin: 0
    },
    subtitle: {
        color: '#6b7280',
        marginTop: '8px',
        fontSize: '14px'
    },
    socialButtons: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    socialButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '14px 24px',
        borderRadius: '12px',
        border: 'none',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    googleButton: {
        background: '#f8f9fa',
        color: '#3c4043',
        border: '1px solid #dadce0'
    },
    kakaoButton: {
        background: '#FEE500',
        color: '#3C1E1E'
    },
    socialIcon: {
        width: '20px',
        height: '20px'
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        margin: '24px 0',
        gap: '16px'
    },
    dividerText: {
        flex: 1,
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: '14px',
        position: 'relative'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    input: {
        padding: '14px 16px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        fontSize: '15px',
        outline: 'none',
        transition: 'border-color 0.2s ease'
    },
    submitButton: {
        padding: '14px 24px',
        borderRadius: '12px',
        border: 'none',
        background: '#5500FF',
        color: 'white',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '8px',
        transition: 'background 0.2s ease'
    },
    error: {
        color: '#ef4444',
        fontSize: '14px',
        margin: '8px 0 0'
    },
    success: {
        color: '#10b981',
        fontSize: '14px',
        margin: '8px 0 0'
    },
    toggleText: {
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '14px',
        marginTop: '24px'
    },
    toggleButton: {
        background: 'none',
        border: 'none',
        color: '#5500FF',
        fontWeight: '600',
        cursor: 'pointer',
        padding: 0
    }
};
