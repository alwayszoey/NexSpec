import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {  X, User as UserIcon, Link2, Loader2, Save, ExternalLink, HardDriveDownload, History, UserCircle, ShoppingBag , CheckSquare, Download } from 'lucide-react';

interface ProfileModalProps {
  currentUser: { id: string, username: string, email: string, avatarUrl?: string, history?: any[] };
  onClose: () => void;
  onUpdate: (updatedUser: any) => void;
  t: (key: string) => string;
}

type TabType = 'profile' | 'history';
type HistoryFilter = 'all' | 'purchase' | 'link';

export const ProfileModal: React.FC<ProfileModalProps> = ({ currentUser, onClose, onUpdate, t }) => {
  const [tab, setTab] = useState<TabType>('profile');
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');
  const [selectedHistories, setSelectedHistories] = useState<Set<number>>(new Set());
  
  const [username, setUsername] = useState(currentUser.username || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const histories = currentUser.history || [];
  const filteredHistories = historyFilter === 'all' 
    ? histories 
    : histories.filter(h => h.type === historyFilter);

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
      
      onUpdate(data.user);

      setTimeout(() => {
         onClose();
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Connection Error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyDetails = (text: string) => {
      navigator.clipboard.writeText(text);
      setSuccess("คัดลอกรายละเอียดแล้ว");
      setTimeout(() => setSuccess(''), 2000);
  };

  const handleToggleSelect = (index: number) => {
      const newSet = new Set(selectedHistories);
      if (newSet.has(index)) {
          newSet.delete(index);
      } else {
          newSet.add(index);
      }
      setSelectedHistories(newSet);
  };

  const handleSelectAll = (isAllSelected: boolean) => {
      if (isAllSelected) {
          setSelectedHistories(new Set<number>());
      } else {
          const newSet = new Set<number>();
          filteredHistories.forEach((_, i) => newSet.add(i));
          setSelectedHistories(newSet);
      }
  };

  const downloadSelectedAsTxt = () => {
    if (selectedHistories.size === 0) return;
    const selectedItems = Array.from(selectedHistories).map(i => filteredHistories[filteredHistories.length - 1 - i]); // because we map on reverse
    
    // We reverse again to natural order of the reversed list
    
    // Actually, when we render: filteredHistories.slice().reverse().map((h, i) => ...)
    // 'i' is the index in the reversed array.
    const itemsToDownload = Array.from(selectedHistories).sort((a,b)=>a-b).map(i => {
        const h = filteredHistories.slice().reverse()[i];
        return h;
    });

    const content = itemsToDownload.map(h => {
        return `[${h.type === 'purchase' ? 'สั่งซื้อ' : 'Get Link'}] ${h.title}
วันที่: ${new Date(h.date).toLocaleString('th-TH')}
${h.price ? 'ราคา: ' + h.price + '\n' : ''}รายละเอียด:
${h.details || '-'}
----------------------------------------`;
    }).join('\n\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ประวัติการสั่งซื้อ_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setSelectedHistories(new Set());
  };

  const isAllSelected = filteredHistories.length > 0 && selectedHistories.size === filteredHistories.length;

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
        className="bg-card-bg w-full max-w-[500px] p-6 sm:p-8 rounded-[24px] shadow-2xl relative border border-border-subtle z-10 text-text-main flex flex-col max-h-[90vh] overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-text-muted hover:text-text-main bg-bg-app hover:bg-border-subtle p-2 rounded-full transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex bg-bg-app p-1 rounded-xl mb-6 mt-4">
            <button
              onClick={() => setTab('profile')}
              className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${tab === 'profile' ? 'bg-card-bg shadow border border-border-subtle text-text-main' : 'text-text-muted hover:text-text-main'}`}
            >
              <UserCircle className="w-4 h-4" /> โปรไฟล์
            </button>
            <button
              onClick={() => setTab('history')}
              className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${tab === 'history' ? 'bg-card-bg shadow border border-border-subtle text-text-main' : 'text-text-muted hover:text-text-main'}`}
            >
              <History className="w-4 h-4" /> ประวัติ
            </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] px-4 py-3 rounded-[12px] mb-4 shrink-0">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[13px] px-4 py-3 rounded-[12px] mb-4 shrink-0">
            {success}
          </div>
        )}

        <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
          <AnimatePresence mode="wait">
            {tab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full"
              >
                <div className="text-center mb-6 shrink-0">
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

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-auto">
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
            )}

            {tab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full"
              >
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setHistoryFilter('all')} className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${historyFilter === 'all' ? 'bg-brand text-white' : 'bg-bg-app text-text-muted hover:text-text-main'}`}>ทั้งหมด</button>
                    <button onClick={() => setHistoryFilter('purchase')} className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${historyFilter === 'purchase' ? 'bg-brand text-white' : 'bg-bg-app text-text-muted hover:text-text-main'}`}>สั่งซื้อสินค้า</button>
                    <button onClick={() => setHistoryFilter('link')} className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${historyFilter === 'link' ? 'bg-brand text-white' : 'bg-bg-app text-text-muted hover:text-text-main'}`}>Get Link</button>
                  </div>
                  
                  {filteredHistories.length > 0 && (
                    <div className="flex items-center justify-between border-t border-border-subtle pt-3">
                      <label className="flex items-center gap-2 text-[12px] text-text-muted cursor-pointer hover:text-text-main">
                        <input 
                          type="checkbox" 
                          checked={isAllSelected}
                          onChange={() => handleSelectAll(isAllSelected)}
                          className="w-4 h-4 rounded text-brand focus:ring-brand border-border-subtle bg-bg-app cursor-pointer"
                        />
                        เลือกทั้งหมด
                      </label>
                      
                      <button 
                         onClick={downloadSelectedAsTxt}
                         disabled={selectedHistories.size === 0}
                         className="flex items-center gap-1.5 text-[12px] font-medium bg-brand/10 text-brand px-3 py-1.5 rounded-lg hover:bg-brand/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                         <Download className="w-3.5 h-3.5" /> โหลดที่เลือก (.txt)
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  {filteredHistories.length === 0 ? (
                    <div className="text-center py-10 bg-bg-app rounded-xl border border-border-subtle border-dashed">
                      <History className="w-8 h-8 mx-auto text-text-muted mb-2 opacity-50" />
                      <p className="text-text-muted text-[13px]">ยังไม่มีประวัติในหมวดหมู่นี้</p>
                    </div>
                  ) : (
                    filteredHistories.slice().reverse().map((h, i) => (
                      <div key={i} className={`p-4 rounded-xl border transition-colors flex flex-col gap-2 ${selectedHistories.has(i) ? 'border-brand bg-brand/5' : 'border-border-subtle bg-bg-app'}`}>
                         <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 w-full">
                                <input 
                                   type="checkbox" 
                                   checked={selectedHistories.has(i)}
                                   onChange={() => handleToggleSelect(i)}
                                   className="w-4 h-4 mt-1 rounded text-brand focus:ring-brand border-border-subtle bg-card-bg cursor-pointer shrink-0"
                                />
                                <div className="flex-1">
                            <div>
                                <h4 className="text-[14px] font-semibold text-text-main line-clamp-1">{h.title}</h4>
                                <p className="text-[11px] text-text-muted mt-0.5">{new Date(h.date).toLocaleString('th-TH')}</p>
                            </div>
                            </div>
                            </div>
                            {h.type === 'purchase' ? (
                                <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 shrink-0"><ShoppingBag className="w-3 h-3" /> {h.price || 'Free'}</span>
                            ) : (
                                <span className="bg-brand/10 text-brand text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 shrink-0"><Link2 className="w-3 h-3" /> Get Link</span>
                            )}
                         </div>

                         {h.type === 'purchase' && h.details && (
                           <div className="mt-2 bg-card-bg border border-border-subtle p-3 rounded-lg text-[12px] relative group mt-2">
                             <pre className="whitespace-pre-wrap font-sans text-text-muted">{h.details}</pre>
                             <button 
                               onClick={() => handleCopyDetails(h.details)}
                               className="absolute top-2 right-2 p-1.5 bg-bg-app hover:bg-brand/10 text-text-muted hover:text-brand transition-colors rounded-md border border-border-subtle opacity-0 group-hover:opacity-100"
                              >
                                <HardDriveDownload className="w-3.5 h-3.5" />
                             </button>
                           </div>
                         )}

                         {h.type === 'link' && h.details && (
                           <div className="mt-2 text-right">
                             <a href={h.details} target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 text-[12px] text-brand font-medium">
                               เปิดลิงก์อีกครั้ง <ExternalLink className="w-3.5 h-3.5" />
                             </a>
                           </div>
                         )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
