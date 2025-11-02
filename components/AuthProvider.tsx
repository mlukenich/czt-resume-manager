import React, { useState, useEffect, useCallback } from 'react';
import { getSession, clearSession, createSession } from '../services/api.ts';
import { Session, User } from '../types.ts';
import App from '../App.tsx';
import Login from './Login.tsx';
import { SpinnerIcon } from './IconComponents.tsx';

export const AuthProvider: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkSession = () => {
            const existingSession = getSession();
            setSession(existingSession);
            setIsLoading(false);
        };
        checkSession();
    }, []);

    const handleLoginSuccess = useCallback((user: User) => {
        const newSession = createSession(user);
        setSession(newSession);
    }, []);

    const handleLogout = useCallback(() => {
        clearSession();
        setSession(null);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-gray-500 flex items-center space-x-3">
                    <svg className="animate-spin h-5 w-5 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading session...</span>
                </div>
            </div>
        )
    }

    if (session?.user) {
        return <App user={session.user} onLogout={handleLogout} />;
    }

    return <Login onLoginSuccess={handleLoginSuccess} />;
}