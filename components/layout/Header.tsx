import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, AuthUser } from '../../services';
import { adminService } from '../../services/adminService';
import { SubscriptionBadge } from './SubscriptionBadge';

interface HeaderProps {
    user: AuthUser | null;
    onLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogin }) => {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Check admin status
    useEffect(() => {
        if (user) {
            adminService.isAdmin().then(setIsAdmin);
        } else {
            setIsAdmin(false);
        }
    }, [user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        await authService.signOut();
        window.location.reload();
    };

    const getInitials = (email: string) => {
        return email.substring(0, 2).toUpperCase();
    };

    return (
        <header style={styles.header}>
            <div style={styles.container}>
                {/* Logo */}
                <div style={styles.logoSection}>
                    <a href="/" style={{ display: 'flex', alignItems: 'center' }}>
                        <img src="/logo.png" alt="MURU.AI" style={styles.logo} />
                    </a>
                </div>

                {/* Navigation - Hidden during BETA */}
                {/* TODO: Re-enable after beta test by removing this comment wrapper
                <nav style={styles.navSection}>
                    <button
                        onClick={() => navigate('/templates')}
                        style={styles.navLink}
                    >
                        템플릿
                    </button>
                    <button
                        onClick={() => navigate('/pricing')}
                        style={styles.navLink}
                    >
                        가격
                    </button>
                </nav>
                */}

                {/* User Profile or Login Button */}
                {user ? (
                    <div style={styles.rightSection}>
                        {/* Subscription Badge - Hidden during BETA */}
                        {/* TODO: Re-enable after beta test
                        <SubscriptionBadge userId={user.id} />
                        */}

                        {/* Profile Button */}
                        <div style={{ position: 'relative' }} ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: '#5500FF',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {getInitials(user.email || '')}
                            </button>

                            {/* Dropdown */}
                            {isDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '50px',
                                    right: 0,
                                    background: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                    border: '1px solid #e5e7eb',
                                    padding: '8px',
                                    minWidth: '160px',
                                    zIndex: 9999
                                }}>
                                    {/* Admin Button - Only visible to admins */}
                                    {isAdmin && (
                                        <button
                                            onClick={() => {
                                                navigate('/admin');
                                                setIsDropdownOpen(false);
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                background: 'none',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                color: '#5500FF',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = '#f3f0ff'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                        >
                                            🛡️ 관리자 페이지
                                        </button>
                                    )}

                                    {isAdmin && (
                                        <div style={{ height: '1px', background: '#e5e7eb', margin: '4px 0' }} />
                                    )}

                                    <button
                                        onClick={handleSignOut}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            background: 'none',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            fontWeight: '500'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                    >
                                        로그아웃
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={styles.rightSection}>
                        <button onClick={onLogin} style={styles.loginButton}>
                            로그인
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

const styles: Record<string, React.CSSProperties> = {
    header: {
        height: '64px',
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px'
    },
    container: {
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '100%' // 컨테이너 높이 꽉 채우기
    },
    logoSection: {
        display: 'flex',
        alignItems: 'center',
        height: '100%'
    },
    logo: {
        height: '160px', // 로고 이미지 자체가 여백이 많아서 크게 설정
        width: 'auto'
    },
    navSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        marginLeft: '32px'
    },
    navLink: {
        background: 'none',
        border: 'none',
        fontSize: '15px',
        fontWeight: '500',
        color: '#374151',
        cursor: 'pointer',
        padding: '8px 16px',
        borderRadius: '8px',
        transition: 'all 0.2s'
    },
    rightSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    },
    profileSection: {
        position: 'relative'
    },
    avatarButton: {
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        borderRadius: '50%'
    },
    avatar: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: '#5500FF',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: '600'
    },
    dropdown: {
        position: 'absolute',
        top: '120%',
        right: 0,
        width: '240px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb',
        padding: '8px 0',
        overflow: 'hidden',
        zIndex: 1000
    },
    userInfo: {
        padding: '12px 16px',
    },
    userEmail: {
        margin: 0,
        fontSize: '14px',
        color: '#374151',
        fontWeight: '500',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    divider: {
        height: '1px',
        background: '#e5e7eb',
        margin: '8px 0'
    },
    menuItem: {
        display: 'block',
        width: '100%',
        padding: '8px 16px',
        textAlign: 'left',
        background: 'none',
        border: 'none',
        fontSize: '14px',
        color: '#ef4444', // Red for logout
        cursor: 'pointer',
        transition: 'background 0.2s'
    },
    loginButton: {
        padding: '8px 16px',
        borderRadius: '8px',
        border: '1px solid #5500FF',
        background: 'white',
        color: '#5500FF',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s'
    }
};
