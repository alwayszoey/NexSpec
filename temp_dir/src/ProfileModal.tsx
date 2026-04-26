import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, User as UserIcon, Link2, Loader2, Save } from 'lucide-react';

interface ProfileModalProps {
  currentUser: { id: string, username: string, email: string, avatarUrl?: string };
  onClose: () => void;
  onUpdate: (updatedUser: any) => void;
  t: (key: string) => string;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ currentUser, onClose, onUpdate, t }) => {
  const [username, setUsername] = useState(currentUser.username || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const localToken = localStorage.getItem('authToken');
      const sessionToken = sessionStorage.getItem('authToken');
      const token = localToken || sessionToken;

      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, avatarUrl })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Connection Error');
        setLoading(false);
        return;
      }

      setSuccess(t('profileUpdated') || 'Profile updated successfully!');
      
      // Notify parent to update context state
      onUpdate(data.user);

      // Close modal shortly after success
      setTimeout(() => {
         onClose();
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Connection Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-card-bg w-full max-w-[400px] p-6 sm:p-8 rounded-[24px] shadow-2xl relative border border-border-subtle z-10 text-text-main"
      >
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-text-muted hover:text-text-main bg-bg-app hover:bg-border-subtle p-2 rounded-full transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-bg-app shadow-md" referrerPolicy="no-referrer" />
            ) : (
                <div className="w-20 h-20 rounded-full bg-brand/10 border-4 border-bg-app shadow-md flex items-center justify-center text-brand font-bold text-3xl">
                    {username ? username.charAt(0).toUpperCase() : '?'}
                </div>
            )}
          </div>
          <h2 className="text-[20px] font-bold mb-1">
            {t('profileSettings') || 'Profile Settings'}
          </h2>
          <p className="text-[13px] text-text-muted">{currentUser.email}</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] px-4 py-3 rounded-[12px] mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[13px] px-4 py-3 rounded-[12px] mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"><UserIcon className="w-4 h-4" /></span>
            <input 
              type="text" 
              placeholder={t('authUsername') || 'Username'}
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3 bg-bg-app border border-border-subtle rounded-[14px] focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 text-sm"
            />
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"><Link2 className="w-4 h-4" /></span>
            <input 
              type="url" 
              placeholder={t('avatarUrl') || 'Avatar URL'}
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-bg-app border border-border-subtle rounded-[14px] focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 text-sm"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-white py-3.5 rounded-[14px] font-medium mt-2 hover:opacity-90 active:scale-95 transition-all flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {loading ? '...' : (t('saveChanges') || 'Save Changes')}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
