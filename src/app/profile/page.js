'use client';
import { useEffect, useState } from 'react';
import supabase from '@/helper/supabaseClient';
import { useRouter } from 'next/navigation';

const ProfilePage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [email, setEmail] = useState('');
    const [userName, setUserName] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const user = session?.user;
                if (!user) {
                    router.replace('/login');
                    return;
                }
                setUserId(user.id);
                setEmail(user.email || '');

                const metaName = user.user_metadata?.username || user.user_metadata?.full_name || user.user_metadata?.name;
                if (metaName) {
                    setUserName(metaName);
                } else {
                    const { data: profileRow } = await supabase
                        .from('User-Table')
                        .select('user_name')
                        .eq('user_id', user.id)
                        .maybeSingle();
                    if (profileRow?.user_name) setUserName(profileRow.user_name);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [router]);

    const saveProfile = async (e) => {
        e.preventDefault();
        if (!userId) return;
        setSaving(true);
        setMessage('');
        try {
            const { error } = await supabase
                .from('User-Table')
                .upsert({ user_id: userId, user_name: userName, email_id: email }, { onConflict: 'user_id' });
            if (error) throw error;
            setMessage('Profile saved');
        } catch (err) {
            setMessage(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) return <div className="tw-text-white tw-p-6">Loading...</div>;

    return (
        <div className="tw-min-h-[100vh] tw-bg-black tw-text-white tw-p-6 tw-flex tw-justify-center">
            <form className="tw-w-full tw-max-w-[480px] tw-space-y-4 tw-bg-[#0c0c0c] tw-rounded-lg tw-border tw-border-[#1f1f1f] tw-p-6">
                <h1 className="tw-text-2xl tw-font-semibold">Your profile</h1>
                {message ? <div className="tw-text-sm tw-text-gray-300">{message}</div> : null}
                <div className="tw-flex tw-flex-col tw-gap-1">
                    <label className="tw-text-sm tw-text-gray-400">Email</label>
                    <input value={email} disabled className="tw-bg-[#141414] tw-rounded tw-px-3 tw-py-2 tw-border tw-border-[#2a2a2a]" />
                </div>
                <div className="tw-flex tw-flex-col tw-gap-1">
                    <label className="tw-text-sm tw-text-gray-400">Name</label>
                    <input value={userName} onChange={(e) => setUserName(e.target.value)} className="tw-bg-[#141414] tw-rounded tw-px-3 tw-py-2 tw-border tw-border-[#2a2a2a]" />
                </div>
                <div className="tw-flex tw-gap-3 tw-pt-2">
                    <button disabled={saving} onClick={saveProfile} className="a LPbtn">
                        {saving ? 'Saving...' : 'Save changes'}
                    </button>
                    <a href="/dashboard" className="tw-inline-flex tw-items-center tw-rounded tw-border tw-border-[#2a2a2a] tw-bg-[#141414] tw-px-4 tw-py-2">Back to dashboard</a>
                </div>
            </form>
        </div>
    );
};

export default ProfilePage;


