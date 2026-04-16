import React from 'react';
/**
 * Security Utility for SSVM Institutions
 * Handles cache clearing, input sanitization, and malicious code protection.
 */

export const SecurityUtils = {
    /**
     * Clears application cache, local storage, and session storage.
     * This is the "Catch Clear" logic requested.
     */
    /**
     * Clears application cache, local storage, and session storage.
     * Thoroughly wipes all state to ensure a clean slate.
     */
    clearAppCache: async () => {
        try {
            console.log("Security Layer: Initiating deep cache clear...");

            // 1. Clear Storage
            localStorage.clear();
            sessionStorage.clear();

            // 2. Clear All Caches
            if ('caches' in window) {
                const names = await caches.keys();
                await Promise.all(names.map(name => caches.delete(name)));
            }

            // 3. Unregister Service Workers
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(registrations.map(reg => reg.unregister()));
            }

            // 4. Clear Cookies
            const cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i];
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
            }

            // ✅ Clear Console (Requested "Catch Clear")
            console.clear();
            console.log("Security Layer: System wiped and console cleared successfully.");
            return true;
        } catch (error) {
            console.clear();
            console.error("Security Layer Error: Failed to clear cache. Console cleared anyway.", error);
            return false;
        }
    },

    /**
     * Sanitizes strings to prevent XSS and malicious code injection.
     */
    sanitizeInput: (input) => {
        if (typeof input !== 'string') return input;

        return input
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(/script/gi, "[removed]")
            .replace(/eval\(/gi, "[removed](");
    },

    /**
     * Validates if a file type is safe.
     */
    isSafeFile: (file, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']) => {
        if (!file) return false;
        if (!allowedTypes.includes(file.type)) return false;
        const maxSize = 5 * 1024 * 1024; // 5MB
        return file.size <= maxSize;
    }
};

/**
 * Premium Error Boundary Component
 * Provides a sophisticated fallback UI with automatic recovery.
 */
export class SecurityErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Security Layer caught an error:", error, errorInfo);
        // Automatically clear cache to prevent persistent corrupted state
        SecurityUtils.clearAppCache();
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    fontFamily: "'Inter', sans-serif",
                    color: 'white',
                    padding: '20px'
                }}>
                    <div style={{
                        maxWidth: '500px',
                        width: '100%',
                        padding: '40px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        textAlign: 'center',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            color: '#ef4444',
                            fontSize: '24px'
                        }}>
                            <i className="bi bi-shield-lock-fill"></i>
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
                            Security Shield Active
                        </h2>
                        <p style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6', marginBottom: '32px' }}>
                            We detected an inconsistency that might affect your experience.
                            Your environment has been automatically neutralized and secured.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                width: '100%',
                                padding: '14px 28px',
                                background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                fontSize: '16px',
                                boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(59, 130, 246, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.3)';
                            }}
                        >
                            Resume Securely
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
