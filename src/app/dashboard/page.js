'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from "@/helper/supabaseClient";
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
                const { data: { session }, error } = await supabase.auth.getSession();

                if (!session || error) {
                    router.replace('/login');
                    return;
                }

                setUser(session.user);
            } catch (error) {
                console.log('Auth check error:', error);
                router.replace('/login');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                router.replace('/login');
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

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
