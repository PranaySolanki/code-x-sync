'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase, { getSessionWithErrorHandling, handleAuthError } from "@/helper/supabaseClient";
import { ModalProvider } from '@/screen/Dashboard/components/Dialog_box_state';
import { PlaygroundProvider } from '@/screen/Dashboard/components/DataStoreContext';
import Home from '@/screen/Dashboard/Dashboard_Layout';

const Dashboard = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { session, error } = await getSessionWithErrorHandling(router);

                if (!session || error) {
                    router.replace('/login');
                    return;
                }

                setUser(session.user);
            } catch (error) {
                const wasHandled = await handleAuthError(error, router);
                if (!wasHandled) {
                    console.error('Auth check error:', error);
                    router.replace('/login');
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();

        // Set up auth state listener with enhanced error handling
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
                if (event === 'SIGNED_OUT') {
                    router.replace('/login');
                } else if (event === 'TOKEN_REFRESHED' && session) {
                    setUser(session.user);
                }
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, [router]);

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    if (!user) {
        return null;
    }

    return (
        <ModalProvider>
            <PlaygroundProvider>
                <Home />
            </PlaygroundProvider>
        </ModalProvider>
    );
};

export default Dashboard;
