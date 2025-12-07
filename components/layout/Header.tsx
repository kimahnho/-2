import React, { useState, useRef, useEffect } from 'react';
import { authService, AuthUser } from '../../services';

interface HeaderProps {
    user: AuthUser | null;
    onLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogin }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
        window.location.reload(); // 강제 리로드로 상태 초기화
    };

    const getInitials = (email: string) => {
        return email.substring(0, 2).toUpperCase();
    };

    return (
        <header style={styles.header}>
            <div style={styles.container}>
                {/* Logo */}
                <div style={styles.logoSection}>
                    <img src="/logo.png" alt="MURU.AI" style={styles.logo} />
                </div>

                {/* User Profile or Login Button */}
                {user ? (
                    <div style={styles.profileSection} ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            style={styles.avatarButton}
                        >
                            <div style={styles.avatar}>
                                {getInitials(user.email || '')}
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div style={styles.dropdown}>
                                <div style={styles.userInfo}>
                                    <p style={styles.userEmail}>{user.email}</p>
                                </div>
                                <div style={styles.divider} />
                                <button onClick={handleSignOut} style={styles.menuItem}>
                                    로그아웃
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button onClick={onLogin} style={styles.loginButton}>
                        로그인
                    </button>
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
        alignItems: 'center'
    },
    logoSection: {
        display: 'flex',
        alignItems: 'center'
    },
    logo: {
        height: '32px',
        width: 'auto'
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
        overflow: 'hidden'
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
