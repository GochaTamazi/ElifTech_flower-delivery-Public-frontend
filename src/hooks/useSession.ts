// src/hooks/useSession.ts
import { useEffect, useState, useCallback } from 'react';
import {apiConfig} from '../config';

interface SessionResponse {
    success: boolean;
    data: {
        userId: string;
        sessionId: string;
        isNew?: boolean;
        isAuthenticated?: boolean;
    };
}

interface UseSessionReturn {
    userId: string | null;
    sessionId: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: Error | null;
    refreshSession: () => Promise<void>;
}

const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const useSession = (): UseSessionReturn => {
    const [sessionData, setSessionData] = useState<{
        userId: string | null;
        sessionId: string | null;
        isAuthenticated: boolean;
    }>({ 
        userId: null, 
        sessionId: null, 
        isAuthenticated: false 
    });
    
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    // Initialize or check session
    const initOrCheckSession = useCallback(async (): Promise<SessionResponse['data'] | null> => {
        try {
            console.log('Checking for existing session...');
            const checkResponse = await fetch(`${apiConfig.baseURL}/session/check`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'include', // Required for proper cookie handling
            });

            console.log('Response from /session/check:', {
                status: checkResponse.status,
                statusText: checkResponse.statusText,
                headers: Object.fromEntries(checkResponse.headers.entries())
            });

            if (checkResponse.ok) {
                const response = await checkResponse.json() as SessionResponse;
                console.log('Session data:', response);
                return response.data;
            }

            console.log('No session found, initializing a new one...');

            const initResponse = await fetch(`${apiConfig.baseURL}/session/init`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'include',
            });

            console.log('Response from /session/init:', {
                status: initResponse.status,
                statusText: initResponse.statusText,
                headers: Object.fromEntries(initResponse.headers.entries())
            });

            if (!initResponse.ok) {
                throw new Error(`Failed to initialize session: ${initResponse.statusText}`);
            }

            const response = await initResponse.json() as SessionResponse;
            console.log('New session created:', response);
            return response.data;
        } catch (error) {
            console.error('Session error:', error);
            throw error;
        }
    }, []);

    // Refresh session data
    const refreshSession = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await initOrCheckSession();
            if (data) {
                const newSessionData = {
                    userId: data.userId,
                    sessionId: data.sessionId,
                    isAuthenticated: data.isAuthenticated ?? false,
                };
                
                setSessionData(newSessionData);
                
                // Ensure userId is saved to localStorage
                if (newSessionData.userId) {
                    localStorage.setItem('userId', newSessionData.userId);
                }
                
                setError(null);
            }
        } catch (err) {
            console.error('Session refresh error:', err);
            setError(err instanceof Error ? err : new Error('Failed to refresh session'));
            
            // Clear userId from localStorage on error
            localStorage.removeItem('userId');
        } finally {
            setIsLoading(false);
        }
    }, [initOrCheckSession]);

    // Initialize session on mount
    useEffect(() => {
        let isMounted = true;
        let checkInterval: NodeJS.Timeout;

        const initialize = async () => {
            try {
                await refreshSession();
                
                // Set up periodic session check
                checkInterval = setInterval(async () => {
                    if (isMounted) {
                        await refreshSession();
                    }
                }, SESSION_CHECK_INTERVAL);
            } catch (error) {
                if (isMounted) {
                    setError(error instanceof Error ? error : new Error('Session initialization failed'));
                    setIsLoading(false);
                }
            }
        };

        initialize();

        return () => {
            isMounted = false;
            if (checkInterval) {
                clearInterval(checkInterval);
            }
        };
    }, [refreshSession]);

    return {
        userId: sessionData.userId,
        sessionId: sessionData.sessionId,
        isAuthenticated: sessionData.isAuthenticated,
        isLoading,
        error,
        refreshSession,
    };
};