'use client';
import React, { Component } from 'react';
import { useRouter } from 'next/navigation';

class AuthErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Check if it's an authentication error
        if (error.message?.includes('Invalid Refresh Token') || 
            error.message?.includes('Refresh Token Not Found') ||
            error.message?.includes('JWT expired') ||
            error.message?.includes('AuthApiError')) {
            return { hasError: true, error };
        }
        return null; // Let other errors bubble up
    }

    componentDidCatch(error, errorInfo) {
        console.error('Auth Error Boundary caught an error:', error, errorInfo);
        
        // If it's an auth error, clear storage and redirect
        if (error.message?.includes('Invalid Refresh Token') || 
            error.message?.includes('Refresh Token Not Found') ||
            error.message?.includes('JWT expired')) {
            
            // Clear storage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('supabase.auth.token');
                sessionStorage.clear();
            }
            
            // Redirect to login after a short delay
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100vh',
                    padding: '20px',
                    textAlign: 'center'
                }}>
                    <h2>Session Expired</h2>
                    <p>Your session has expired. Please log in again.</p>
                    <p>Redirecting to login page...</p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default AuthErrorBoundary;
