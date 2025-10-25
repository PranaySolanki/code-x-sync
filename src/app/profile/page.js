'use client';
import { useEffect, useState } from 'react';
import supabase, { getSessionWithErrorHandling, handleAuthError } from '@/helper/supabaseClient'; 
import { useRouter } from 'next/navigation';
import '@/screen/profilescreen/index.scss';

const ProfilePage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [email, setEmail] = useState('');
    const [userName, setUserName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState(null); 
    const [newAvatarFile, setNewAvatarFile] = useState(null); 
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const fetchProfileData = async (user) => {
        setUserId(user.id);
        setEmail(user.email || '');

        // 1. Fetch user metadata (name and existing avatar URL)
        const metaName = user.user_metadata?.username || user.user_metadata?.full_name || user.user_metadata?.name;
        if (metaName) setUserName(metaName);

        const { data: profileRow } = await supabase
            .from('User-Table')
            .select('user_name, avatar_url')
            .eq('user_id', user.id)
            .maybeSingle();

        if (profileRow) {
            if (profileRow.user_name) setUserName(profileRow.user_name);
            if (profileRow.avatar_url) setAvatarUrl(profileRow.avatar_url); 
        }
    };
    
    useEffect(() => {
        const load = async () => {
            try {
                const { session, error } = await getSessionWithErrorHandling(router);
                const user = session?.user;
                
                if (!user || error) {
                    router.replace('/login');
                    return;
                }
                await fetchProfileData(user);
            } catch (e) {
                const wasHandled = await handleAuthError(e, router);
                if (!wasHandled) {
                    console.error('Profile load error:', e);
                }
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [router]);


    const handleAvatarUpload = async () => {
        if (!newAvatarFile || !userId) return null;

        // 1. Define the path in Supabase Storage: 'avatars/[user_id].[ext]'
        const fileExt = newAvatarFile.name.split('.').pop();
        const filePath = `${userId}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('avatars') 
            .upload(filePath, newAvatarFile, {
                cacheControl: '3600',
                upsert: true, 
            });

        if (error) throw new Error('Avatar upload failed: ' + error.message);

        // 2. Get the public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
        
        return publicUrl;
    };


    const saveProfile = async (e) => {
        e.preventDefault();
        if (!userId) return;
        setSaving(true);
        setMessage('');
        
        let newUrl = avatarUrl;
        try {
            // STEP 1: Upload new image if selected
            if (newAvatarFile) {
                newUrl = await handleAvatarUpload();
            }

            // STEP 2: Update database with new data (including potential new URL)
            const { error } = await supabase
                .from('User-Table')
                .upsert({ 
                    user_id: userId, 
                    user_name: userName, 
                    email_id: email, 
                    avatar_url: newUrl 
                }, { onConflict: 'user_id' });
            
            if (error) throw error;
            
            // Success: Update the local state
            setAvatarUrl(newUrl);
            setNewAvatarFile(null); // Clear selected file
            setMessage('Profile saved');

            // Force Next.js to re-render components that rely on auth/profile hooks (like the Navbar/Home Page)
            router.refresh(); 

        } catch (err) {
            setMessage(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) return <div className="profile-container tw-text-white">Loading...</div>;

    return (
        <div className="profile-container">
            <form className="profile-card" onSubmit={saveProfile}>
                <h1>Your profile</h1>
                {message ? <div className="message">{message}</div> : null}
                
                {/* ADDED: Avatar Upload Section */}
                <div className="avatar-group">
                    <label>Profile Picture</label>
                    <div className="avatar-preview-container">
                        <img 
                            // CORRECTED LOGIC: Only call createObjectURL if newAvatarFile exists
                            src={newAvatarFile ? URL.createObjectURL(newAvatarFile) : avatarUrl || '/default-avatar.png'}
                            alt="Avatar" 
                            className="avatar-preview"
                        />
                        <label htmlFor="avatar-upload" className="upload-btn">
                            {newAvatarFile ? 'Change File' : 'Upload'}
                        </label>
                        <input 
                            type="file" 
                            id="avatar-upload" 
                            accept="image/*" 
                            style={{display: 'none'}}
                            onChange={(e) => setNewAvatarFile(e.target.files[0])}
                        />
                    </div>
                </div>
                {/* END Avatar Upload Section */}

                <div className="input-group">
                    <label>Email</label>
                    <input value={email} disabled />
                </div>
                
                <div className="input-group">
                    <label>Name</label>
                    <input value={userName} onChange={(e) => setUserName(e.target.value)} />
                </div>
                
                <div className="button-group">
                    <button type="submit" disabled={saving} className="save-btn">
                        {saving ? 'Saving...' : 'Save changes'}
                    </button>
                    <a href="/home" className="back-btn">Back to Home</a>
                </div>
            </form>
        </div>
    );
};

export default ProfilePage;