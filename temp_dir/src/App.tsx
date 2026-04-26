import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, ShieldAlert, Download, X, RefreshCcw, LayoutGrid, Layers, 
  Archive, Settings, FileText, Check, Zap, Menu, ArrowLeft, 
  Home, HelpCircle, Share2, Facebook, Instagram, MessageCircle,
  Play, ChevronRight, Loader2, Youtube, Send, MessageSquare, Sun, Moon, Lock, UserPlus, LogOut, Users, Eye, Star, Flame, ShoppingCart, Sparkles, ShoppingBag
} from 'lucide-react';
import { resourcesData, ResourceItem } from './data';
import { motion, AnimatePresence } from 'motion/react';
import ReCAPTCHA from "react-google-recaptcha";
import { translations } from './translations';
import { AuthModal } from './AuthModal';
import { ProfileModal } from './ProfileModal';

const EMOTICONS = ['🇹🇭', '🇻🇳', '🎮', '🚀', '✨', '🎁', '🔥', '💖', '👋'];

type ViewState = 'home' | 'details' | 'help' | 'category';
type AppLang = 'vi' | 'th';

const StatsCard = ({ icon: Icon, title, value, unit }: { icon: any, title: string, value: string | number, unit: string }) => (
  <div className="relative overflow-hidden rounded-[16px] sm:rounded-[20px] flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 bg-card-bg border border-border-subtle shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-shadow">
    <div className="absolute -right-2 -bottom-2 pointer-events-none opacity-[0.03] text-brand">
      <Icon className="w-16 h-16 sm:w-20 sm:h-20" />
    </div>
    <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-[12px] bg-brand/10 text-brand">
      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
    </div>
    <div className="flex flex-col min-w-0">
      <span className="text-xs font-medium leading-tight mb-0.5 text-text-muted">{title}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg sm:text-xl font-bold tabular-nums leading-none text-text-main">
          {value}
        </span>
        <span className="text-[10px] sm:text-xs font-medium text-text-muted/70 whitespace-nowrap">{unit}</span>
      </div>
    </div>
  </div>
);

// ============================================================================
// 📌 COMPONENT: PromoPopup (แก้ไข Popup แจ้งเตือน/โฆษณา ตอนเข้าเว็บได้ที่นี่)
// ============================================================================
function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShow1Hour, setDontShow1Hour] = useState(false);

  useEffect(() => {
    // Only show if they've visited before (so welcome screen doesn't overlap) or just wait until welcome state is done
    const hiddenUntil = localStorage.getItem('hidePromoUntil');
    if (hiddenUntil && Date.now() < parseInt(hiddenUntil, 10)) {
      return;
    }
    
    // Slight delay so it poops up nicely after page load
    const t = setTimeout(() => {
      setIsOpen(true);
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    if (dontShow1Hour) {
      localStorage.setItem('hidePromoUntil', (Date.now() + 60 * 60 * 1000).toString());
    }
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-5 overflow-auto"
        >
          <motion.div 
            initial={{ scale: 0.8, y: 50, opacity: 0, rotate: -5 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotate: 0, transition: { type: "spring", bounce: 0.5, duration: 0.6 } }}
            exit={{ scale: 0.8, y: -50, opacity: 0, rotate: 5, transition: { duration: 0.3, type: "tween", ease: "easeInOut" } }}
            className="relative shadow-2xl rounded-2xl max-w-full"
          >
            <a href="https://discord.gg/hSuBbnwWZY" target="_blank" rel="noopener noreferrer" className="block outline-none ring-offset-2 ring-offset-black focus-visible:ring-2 focus-visible:ring-brand rounded-2xl">
              <img src="https://img2.pic.in.th/never.png" alt="Join Discord" className="block w-[500px] h-[500px] max-w-[90vw] max-h-[80vh] object-cover rounded-2xl" />
            </a>
            
            <button 
              aria-label="ปิด" 
              onClick={handleClose} 
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#ffffff] text-[#000000] border-none text-base font-bold cursor-pointer flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95 transition-transform z-10"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
            exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100000] bg-[#000000]/20 backdrop-blur-[24px] px-5 py-3 rounded-2xl border border-[#ffffff]/20 flex items-center gap-4 text-[#ffffff] text-[13px] flex-wrap w-max max-w-[calc(100%-40px)] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
          >
            <label className="inline-flex items-center gap-2 cursor-pointer select-none whitespace-nowrap">
              <input type="checkbox" checked={dontShow1Hour} onChange={(e) => setDontShow1Hour(e.target.checked)} className="accent-brand w-4 h-4 cursor-pointer" />
              <span className="font-medium text-[#ffffff]/90">ไม่แสดงอีก 1 ชั่วโมง</span>
            </label>
            <div className="w-[1px] h-4 bg-[#ffffff]/20 mx-1"></div>
            <button onClick={handleClose} className="px-4 py-1.5 bg-[#ffffff]/20 hover:bg-[#ffffff]/30 text-[#ffffff] border border-[#ffffff]/20 rounded-xl text-[13px] font-semibold cursor-pointer active:scale-95 transition-all whitespace-nowrap shadow-sm">
              ปิดทั้งหมด
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// 📌 COMPONENT: App (ส่วนหลักของเว็บไซต์ รวบรวมหน้าต่างๆ ไว้ที่นี่)
// ============================================================================
export default function App() {
  const [lang, setLang] = useState<AppLang | null>(null);
  const [isAppLoading, setIsAppLoading] = useState(true);

  const [welcomeState, setWelcomeState] = useState<'welcome' | 'checking' | 'done'>('done');
  
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // ==========================================
  // 📌 ตัวแปร State ต่างๆ ในระบบ
  // ==========================================
  // ====== AUTH STATES ======
  const [authModalType, setAuthModalType] = useState<'login' | 'register' | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string, username: string, email: string, avatarUrl?: string } | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // ====== STATS STATES ======
  const [appStats, setAppStats] = useState(() => {
    try {
      const cached = localStorage.getItem('cachedStats');
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.error(e);
    }
    return { users: 0, views: 0, downloads: 0 };
  });

  useEffect(() => {
    // Theme Initializer (Default to Light always on first visit)
    const savedTheme = localStorage.getItem('appTheme') as 'light' | 'dark';
    if (savedTheme === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('appTheme', 'light');
    }

    const hasVisited = localStorage.getItem('hasVisitedStore');
    if (hasVisited) {
      setWelcomeState('done');
    } else {
      setWelcomeState('welcome');
    }

    // Check Auth Session
    const localToken = localStorage.getItem('authToken');
    const sessionToken = sessionStorage.getItem('authToken');
    const token = localToken || sessionToken;
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setCurrentUser({ id: data.user._id, username: data.user.username, email: data.user.email, avatarUrl: data.user.avatarUrl });
        }
      })
      .catch(err => {
        console.error("Session check failed:", err);
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
      });
    }

    // Fetch initial app stats and setup polling for real-time updates
    const fetchStats = () => {
      fetch('/api/stats')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const newStats = { users: data.users, views: data.views, downloads: data.downloads };
            setAppStats(newStats);
            localStorage.setItem('cachedStats', JSON.stringify(newStats));
          }
        })
        .catch(err => { /* quiet fail */ });
    };

    fetchStats();
    const statsInterval = setInterval(fetchStats, 3000);

    // Increment view counter if not viewed this session
    if (!sessionStorage.getItem('hasViewed')) {
      fetch('/api/stats/view', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setAppStats(prev => {
              const newStats = { ...prev, views: data.views };
              localStorage.setItem('cachedStats', JSON.stringify(newStats));
              return newStats;
            });
            sessionStorage.setItem('hasViewed', 'true');
          }
        })
        .catch(err => console.error("Failed to increment view:", err));
    }

    // Simulate loading to ensure everything is ready
    setTimeout(() => {
      setIsAppLoading(false);
    }, 1000);

    return () => clearInterval(statsInterval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    setCurrentUser(null);
    setIsMobileMenuOpen(false);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('appTheme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const t = (key: keyof typeof translations) => {
    return translations[key] || key;
  };

  const getLocalized = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val['th'] || val['vi'] || '';
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [selectedItem, setSelectedItem] = useState<ResourceItem | null>(null);
  const [activeDownloadUrl, setActiveDownloadUrl] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('ALL');
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSocialsModal, setShowSocialsModal] = useState(false);
  
  // Extract unique categories from resourcesData, prepending 'ALL'
  const allCategoriesSet = new Set(resourcesData.map(item => item.category));
  const categories = ['ALL', ...Array.from(allCategoriesSet)];

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  
  // Feedback States
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  type StepStatus = 'idle' | 'checking' | 'completed' | 'error';
  const [step1Status, setStep1Status] = useState<StepStatus>('idle');
  const [step2Status, setStep2Status] = useState<StepStatus>('idle');
  const step1OpenedAt = useRef<number>(0);
  const step2OpenedAt = useRef<number>(0);
  const [isChecked, setIsChecked] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [isCounting, setIsCounting] = useState(false);
  const [isNetworkChecking, setIsNetworkChecking] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [downloadKey, setDownloadKey] = useState<string | null>(null);

  // Auto-redirect to home grid if user types in search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (currentView !== 'home') {
      setCurrentView('home');
    }
    if (selectedItem) setSelectedItem(null);
  };

  const filteredResources = resourcesData.filter(item => {
    const isAll = activeCategory === 'ALL';
    const matchesCategory = isAll || item.category === activeCategory;
    
    // Getting localized strings for accurate searching
    const titleText = getLocalized(item.title);
    const ms = titleText.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && ms;
  });

  const handleOpenDetails = (item: ResourceItem) => {
    setSelectedItem(item);
    setCurrentView('details');
  };

  const handleGetLink = (e?: React.MouseEvent, item?: ResourceItem, specificLink?: string) => {
    if (e) e.stopPropagation();
    
    // Determine which item we are acting on
    const targetItem = item || selectedItem;
    if (targetItem) setSelectedItem(targetItem);
    
    // Check if item requires login and user is not logged in
    if (targetItem?.requiresLogin && !currentUser) {
      setAuthModalType('login');
      return;
    }
    
    // Default to targetItem.link if specificLink is not provided
    const targetUrl = specificLink || targetItem?.link;
    setActiveDownloadUrl(targetUrl || null);
    
    setStep1Status('idle');
    setStep2Status('idle');
    setIsChecked(false);
    setCountdown(15);
    setIsCounting(false);
    setNetworkError(null);
    setIsNetworkChecking(false);
    setDownloadKey(null);
    setShowVerifyModal(true);
  };

  const handleVerifyRecaptcha = async (token: string | null) => {
    if (!token) return;
    if (step1Status !== 'completed' || step2Status !== 'completed') {
      alert(t('alertSteps'));
      return;
    }
    if (isChecked || isNetworkChecking) return;

    setIsNetworkChecking(true);
    setNetworkError(null);

    // --- REINSTATE CLIENT-SIDE VPN / PROXY CHECK ---
    let isVpn = false;
    let errorMessage = "";

    try {
      // 1. IP Check via GeoJS (Great for detecting Cloudflare WARP/1.1.1.1 and Cloud hosts)
      const geoRes = await fetch('https://get.geojs.io/v1/ip/geo.json', { cache: 'no-store' });
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        const org = (geoData.organization || "").toLowerCase();
        
        if (org.includes('cloudflare') || org.includes('warp') || org.includes('digitalocean') || org.includes('amazon') || org.includes('google cloud') || org.includes('microsoft')) {
           isVpn = true;
           errorMessage = "❌ Phát hiện kết nối VPN hoặc 1.1.1.1 (WARP). Vui lòng tắt và thao tác lại! / พบการเชื่อมต่อ VPN หรือ 1.1.1.1 (WARP) โปรดปิดและลองอีกครั้ง!";
        }
      }
    } catch (err) {
      console.warn("GeoJS API Network Warning (Adblock/Brave):", err);
    }

    if (!isVpn) {
      try {
        // 2. IP Check via ipwho.is (Backup - Fully supports HTTPS)
        const proxyRes = await fetch('https://ipwho.is/', { cache: 'no-store' });
        if (proxyRes.ok) {
          const proxyData = await proxyRes.json();
          const org = (proxyData.connection?.org || "").toLowerCase();
          
          if (proxyData.security && (proxyData.security.vpn || proxyData.security.proxy || proxyData.security.tor)) {
             isVpn = true;
             errorMessage = "❌ Phát hiện sử dụng VPN hoặc Proxy. Vui lòng tắt trước khi tiếp tục! / ตรวจพบการใช้ VPN หรือ Proxy โปรดปิดก่อนดำเนินการต่อ!";
          } else if (org.includes('cloudflare') || org.includes('warp')) {
             isVpn = true;
             errorMessage = "❌ Phát hiện kết nối VPN hoặc 1.1.1.1 (WARP). Vui lòng tắt và thao tác lại! / พบการเชื่อมต่อ VPN หรือ 1.1.1.1 (WARP) โปรดปิดและลองอีกครั้ง!";
          }
        }
      } catch (err) {
        console.warn("IPWhoIs API Network Warning:", err);
      }
    }

    if (isVpn) {
      setNetworkError(errorMessage);
      setIsNetworkChecking(false);
      // Reset ReCAPTCHA (optional, but they'd have to reload or close/open modal to try again anyway)
      return; 
    }
    // --- END VPN CHECK ---

    try {
      const response = await fetch('/api/verify-captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          targetUrl: activeDownloadUrl || ''
        })
      });

      const textResponse = await response.text();
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (parseErr) {
        throw new Error(`Server returned invalid response: ${textResponse.substring(0, 50)}...`);
      }
      
      if (!response.ok || !data.success) {
        setNetworkError(data.error || "Captcha verification failed");
        setIsNetworkChecking(false);
        return;
      }

      // Success
      setDownloadKey(data.key);
      setIsChecked(true);
      setIsCounting(true);
      setIsNetworkChecking(false);
    } catch (err: any) {
      console.error(err);
      setNetworkError(`Error: ${err.message || 'Network connection failed'}`);
      setIsNetworkChecking(false);
    }
  };

  const handleFinalRedirect = () => {
    if (selectedItem && downloadKey) {
      if (countdown > 0 || !isChecked) {
        alert(t('alertTimer'));
        return;
      }
      
      // Increment download stat
      fetch('/api/stats/download', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
             setAppStats(prev => {
               const newStats = { ...prev, downloads: data.downloads };
               localStorage.setItem('cachedStats', JSON.stringify(newStats));
               return newStats;
             });
          }
        })
        .catch(err => console.error("Failed to increment download:", err));

      window.open(`/api/download/${downloadKey}`, '_blank');
      setShowVerifyModal(false);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCounting && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (isCounting && countdown === 0) {
      setIsCounting(false);
    }
    return () => clearTimeout(timer);
  }, [isCounting, countdown]);

  useEffect(() => {
    const handleDocumentFocus = () => {
      // Add a small delay to simulate processing and let the page render properly
      setTimeout(() => {
        const now = Date.now();
        
        setStep1Status(prev => {
          if (prev === 'checking') {
            const timeDiff = now - step1OpenedAt.current;
            if (timeDiff >= 12000) { // 12 seconds cooldown
              return 'completed';
            } else {
              alert(t('alertErrYT'));
              return 'error';
            }
          }
          return prev;
        });

        setStep2Status(prev => {
          if (prev === 'checking') {
            const timeDiff = now - step2OpenedAt.current;
            if (timeDiff >= 5000) { // 5 seconds cooldown
              return 'completed';
            } else {
              alert(t('alertErrTG'));
              return 'error';
            }
          }
          return prev;
        });
      }, 800);
    };

    window.addEventListener('focus', handleDocumentFocus);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleDocumentFocus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleDocumentFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleEnterStore = () => {
    localStorage.setItem('hasVisitedStore', 'true');
    setWelcomeState('checking');
    setTimeout(() => {
      setWelcomeState('done');
    }, 1500); // Wait 1.5s reading the welcome message
  };

  const handleRecaptchaChange = (token: string | null) => {
    // Kept to prevent breaking just in case, but no longer used for language select
  };

  // ============================================================================
  // 📌 1. หน้าต่างต้อนรับก่อนเข้าเว็บ (Welcome Screen)
  // ============================================================================
  if (welcomeState !== 'done') {
    return (
      <div className="fixed inset-0 overflow-hidden bg-bg-app z-[999] flex flex-col justify-center items-center p-4">
        {/* Floating Emojis Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {Array.from({ length: 25 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute opacity-20 text-3xl sm:text-4xl"
              initial={{ 
                top: '-10%', 
                left: `${Math.random() * 100}%`, 
                rotate: 0 
              }}
              animate={{ 
                top: '110%', 
                left: `${Math.random() * 100}%`, 
                rotate: Math.random() * 360 
              }}
              transition={{ 
                duration: 6 + Math.random() * 6, 
                repeat: Infinity, 
                ease: 'linear', 
                delay: Math.random() * 5 
              }}
            >
              {EMOTICONS[Math.floor(Math.random() * EMOTICONS.length)]}
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring', bounce: 0.5 }}
          className="bg-card-bg/95 backdrop-blur-xl max-w-md w-full p-8 rounded-[32px] text-center shadow-2xl relative z-10 border border-border-subtle"
        >
          <img src="https://img2.pic.in.th/IMG_0083.png" alt="Logo" className="h-16 mx-auto mb-6 object-contain drop-shadow-md" />
          
          <AnimatePresence mode="wait">
            {welcomeState === 'welcome' && (
              <motion.div key="welcome" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}>
                <h2 className="text-[22px] sm:text-[26px] font-bold text-text-main mb-2 tracking-tight">ยินดีต้อนรับสู่ Zorix Shop</h2>
                <h2 className="text-[15px] sm:text-[16px] font-normal text-text-muted mb-8 leading-relaxed">
                  ศูนย์รวมซอร์สโค้ดและสคริปต์คุณภาพสูง พร้อมใช้สำหรับโปรเจกต์ของคุณ
                </h2>
                
                <button 
                  onClick={handleEnterStore}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-[16px] bg-brand hover:brightness-110 border-2 border-transparent text-white transition-all text-[16px] font-bold cursor-pointer shadow-lg shadow-brand/20 active:scale-[0.98]"
                >
                  เข้าสู่ Zorix Shop <ChevronRight className="w-5 h-5 opacity-80" />
                </button>
              </motion.div>
            )}

            {welcomeState === 'checking' && (
              <motion.div key="checking" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-8">
                <Loader2 className="w-12 h-12 text-brand animate-spin mx-auto mb-6" />
                <h2 className="text-[22px] font-bold text-text-main mb-2">กำลังเตรียมข้อมูลร้านค้า...</h2>
                <p className="text-[15px] font-medium text-text-muted">โปรดรอสักครู่</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  // Define translated categories array
  const activeCategories = [t('allResources'), 'Aimbet', 'Bypass', 'ProxyPin', 'Scripts', 'Macros', 'MOD'];

  if (isAppLoading && lang) {
    return (
      <div className="fixed inset-0 bg-slate-50 z-[9999] flex flex-col justify-center items-center">
        <Loader2 className="w-10 h-10 text-brand animate-spin mb-4" />
        <h2 className="text-slate-700 font-medium text-[16px]">{t('loadingData')}</h2>
      </div>
    );
  }

  // ============================================================================
  // 📌 RENDER - โครงสร้าง HTML ทั้งหมดของเว็บ
  // ============================================================================
  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-bg-app text-text-main font-sans selection:bg-brand selection:text-white">
      
      <PromoPopup />

      {/* ========================================================================= */}
      {/* TOP NAVBAR */}
      {/* ========================================================================= */}
      <nav className="sticky top-0 z-40 bg-card-bg/95 backdrop-blur-xl border-b border-border-subtle px-4 sm:px-8 py-3.5 flex items-center justify-between gap-3 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
        
        {/* Logo Section */}
        <div 
          onClick={() => { setCurrentView('home'); setSelectedItem(null); }} 
          className="flex items-center gap-3 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img src="https://img2.pic.in.th/IMG_0083.png" alt="Logo" className="h-9 sm:h-10 object-contain drop-shadow-sm" />
        </div>
        
        {/* Center Search Bar */}
        <div className="flex-1 max-w-2xl relative mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-text-muted" />
          </div>
          <input 
            type="text" 
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full py-2.5 pl-11 pr-4 bg-bg-app border border-border-subtle focus:bg-card-bg rounded-[16px] text-[14px] sm:text-[15px] shadow-inner focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-text-muted font-normal text-text-main"
          />
        </div>

        {/* Right Actions & Burger Menu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative">
          
          <button 
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 text-text-muted bg-card-bg border border-border-subtle hover:bg-bg-app rounded-[12px] transition-colors shadow-sm"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
          </button>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 sm:p-2.5 text-text-muted bg-card-bg border border-border-subtle hover:bg-bg-app rounded-[12px] transition-colors shadow-sm"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* ANNOUNCEMENT BANNER */}
      <div className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 overflow-hidden h-8 relative flex items-center shrink-0 w-full">
        <div className="animate-marquee flex items-center h-full absolute whitespace-nowrap px-4">
          <div className="shrink-0 flex items-center whitespace-nowrap">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0 mx-3 text-white" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="text-xs font-medium text-white">
              {t('marquee')}
            </span>
          </div>
        </div>
      </div>

      {/* BURGER MENU DROPDOWN */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 top-[68px] bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-[68px] right-0 sm:right-6 w-full sm:w-[280px] bg-card-bg border-b sm:border border-border-subtle sm:rounded-[24px] shadow-2xl z-50 p-4 flex flex-col gap-1.5"
            >
              <button 
                onClick={() => { setIsMobileMenuOpen(false); setCurrentView('home'); setSelectedItem(null); }} 
                className="flex items-center gap-3 p-3.5 rounded-[16px] hover:bg-bg-app text-left font-medium text-text-main hover:text-brand transition-colors w-full group"
              >
                <Home className="w-5 h-5 text-text-muted group-hover:text-brand transition-colors" /> {t('home')}
              </button>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); setCurrentView('help'); setSelectedItem(null); }} 
                className="flex items-center gap-3 p-3.5 rounded-[16px] hover:bg-bg-app text-left font-medium text-text-main hover:text-brand transition-colors w-full group"
              >
                <HelpCircle className="w-5 h-5 text-text-muted group-hover:text-brand transition-colors" /> {t('help')}
              </button>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); setShowSocialsModal(true); }} 
                className="flex items-center gap-3 p-3.5 rounded-[16px] hover:bg-bg-app text-left font-medium text-text-main hover:text-brand transition-colors w-full group"
              >
                <Share2 className="w-5 h-5 text-text-muted group-hover:text-brand transition-colors" /> {t('socials')}
              </button>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); setShowFeedbackModal(true); }} 
                className="flex items-center gap-3 p-3.5 rounded-[16px] hover:bg-bg-app text-left font-medium text-text-main hover:text-brand transition-colors w-full group mb-2"
              >
                <MessageSquare className="w-5 h-5 text-text-muted group-hover:text-brand transition-colors" /> {t('feedbackMenu')}
              </button>
              
              <div className="h-px bg-border-subtle w-full mb-1"></div>

              {/* AUTH MENU */}
              {currentUser ? (
                <div className="flex flex-col gap-1.5">
                  <div className="px-3.5 py-2 flex items-center gap-3">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-border-subtle" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex px-0 items-center justify-center text-brand font-bold text-lg">
                        {currentUser.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-muted">{t('loginAs')}</p>
                      <p className="font-semibold text-sm truncate text-text-main">{currentUser.username}</p>
                      <p className="text-xs truncate text-text-muted">{currentUser.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); setShowProfileModal(true); }}
                    className="flex items-center gap-3 p-3.5 rounded-[16px] hover:bg-brand-light text-left font-medium text-text-main transition-colors w-full group"
                  >
                    <Settings className="w-5 h-5 text-text-muted group-hover:text-brand transition-colors" /> {t('profileSettings') || 'Profile Settings'}
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-3.5 rounded-[16px] hover:bg-red-50 dark:hover:bg-red-500/10 text-left font-medium text-red-600 transition-colors w-full group mb-2"
                  >
                    <LogOut className="w-5 h-5 text-red-500 group-hover:text-red-600 transition-colors" /> {t('logout')}
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); setAuthModalType('login'); }} 
                    className="flex items-center gap-3 p-3.5 rounded-[16px] hover:bg-brand-light text-left font-medium text-text-main hover:text-brand transition-colors w-full group"
                  >
                    <Lock className="w-5 h-5 text-text-muted group-hover:text-brand transition-colors" /> {t('login')}
                  </button>
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); setAuthModalType('register'); }} 
                    className="flex items-center gap-3 p-3.5 rounded-[16px] hover:bg-brand-light text-left font-medium text-text-main hover:text-brand transition-colors w-full group mb-2"
                  >
                    <UserPlus className="w-5 h-5 text-text-muted group-hover:text-brand transition-colors" /> {t('register')}
                  </button>
                </>
              )}

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================================= */}
      <main className="flex-1 overflow-y-auto w-full relative">
        <AnimatePresence mode="wait">
          
          {/* ---------------------------------------------------- */}
          {/* PAGE 1: RESOURCES GRID */}
          {/* ---------------------------------------------------- */}
          {/* ============================================================================ */}
        {/* 📌 2. หน้าแรก (Home View) */}
        {/* ============================================================================ */}
        {currentView === 'home' && (
            <motion.div 
              key="grid-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8 w-full"
            >
              <div className="mb-6 sm:mb-8">
                <h1 className="text-[20px] sm:text-[24px] lg:text-[28px] font-semibold text-slate-900 m-0 leading-tight tracking-tight">{t('welcomeTitle')}</h1>
                <p className="text-slate-500 text-[13px] sm:text-[14px] mt-1.5 font-normal mb-5 leading-relaxed max-w-2xl">{t('welcomeDesc')}</p>
                
                {/* Promotional Banner */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="w-full mb-6 rounded-[16px] sm:rounded-[20px] overflow-hidden shadow-sm border border-slate-100 bg-white relative shiny-effect"
                >
                  <img 
                    alt="Carousel" 
                    fetchPriority="high" 
                    loading="eager" 
                    width="2000" 
                    height="600" 
                    decoding="async" 
                    className="w-full h-auto aspect-[10/3] object-cover object-center" 
                    src="https://img1.pic.in.th/images/zorixshop_20260426124700.png" 
                  />
                </motion.div>

                {/* Dashboard Stats */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6"
                >
                  <StatsCard 
                    icon={Users} 
                    title={t('statsUsers') || 'Đăng ký'}
                    value={appStats.users.toLocaleString()}
                    unit={t('unitPeople') || 'người'}
                  />
                  <StatsCard 
                    icon={Layers} 
                    title={t('statsItems') || 'Tài nguyên'}
                    value={resourcesData.length.toLocaleString()}
                    unit={t('unitItems') || 'mục'}
                  />
                  <StatsCard 
                    icon={Eye} 
                    title={t('statsViews') || 'Lượt truy cập'}
                    value={appStats.views.toLocaleString()}
                    unit={t('unitTimes') || 'lần'}
                  />
                  <StatsCard 
                    icon={Download} 
                    title={t('statsDownloads') || 'Lượt tải'}
                    value={(appStats.downloads).toLocaleString()}
                    unit={t('unitTimes') || 'lần'}
                  />
                </motion.div>

                <section className="relative -mt-px flex flex-col items-center overflow-hidden bg-card-bg px-3 pt-4 pb-8 w-[100vw] ml-[calc(-50vw+50%)] border-t border-border-subtle transition-colors duration-300">
                  <div className="w-full max-w-[1600px] relative mx-auto">
                    <div className="mt-2 flex items-center justify-between space-x-2">
                      <div>
                        <h3 className="font-semibold text-xl sm:text-2xl text-text-main">หมวดหมู่ที่คุณอาจสนใจ</h3>
                        <p className="text-sm text-text-muted mt-1 inline-flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-brand fill-brand" /> แนะนำหมวดหมู่ยอดฮิต
                        </p>
                      </div>
                      <div>
                        <button 
                          onClick={() => { setActiveCategory('ALL'); setCurrentView('category'); }}
                          className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap text-sm font-medium outline-none select-none transition-all duration-150 ease-out hover:-translate-y-px active:scale-[0.98] bg-brand/15 text-brand border border-brand/40 hover:opacity-90 h-9 px-4 py-2 rounded-xl cursor-pointer"
                        >
                          <LayoutGrid className="w-4 h-4" /> ดูทั้งหมด
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5 mb-2">
                      {categories.map((tab) => {
                        const isActive = activeCategory === tab;
                        // Calculate counts
                        const count = tab === 'ALL' 
                          ? resourcesData.length 
                          : resourcesData.filter(i => i.category === tab).length;
                        
                        // Pick an image
                        let imgPath = "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1640&auto=format&fit=crop";
                        if (tab === 'ALL') {
                          imgPath = "https://i.postimg.cc/8zb4Q7C4/2000x600-20260425003051.png"
                        } else {
                          const match = resourcesData.find(i => i.category === tab);
                          if (match) imgPath = match.imageUrl;
                        }

                        return (
                          <div 
                            key={tab} 
                            tabIndex={0} 
                            onClick={() => { setActiveCategory(tab); setCurrentView('category'); }}
                            className="cursor-pointer focus:outline-none"
                          >
                            <div className={`group block transition-transform active:scale-[0.98]`}>
                              <div className={`rounded-lg border p-2 transition-colors ${
                                isActive 
                                  ? 'border-brand bg-brand/10 shadow-[0_0_15px_rgba(36,168,235,0.12)]' 
                                  : 'border-border-subtle bg-bg-app hover:border-brand/80'
                              }`}>
                                <div className="relative overflow-hidden rounded-md bg-bg-app aspect-[10/3]">
                                  <img 
                                    className="w-full h-full object-cover rounded-md transition-[opacity,transform] duration-500 ease-out opacity-100 group-hover:scale-[1.02]" 
                                    alt={tab === 'ALL' ? t('allResources') : tab} 
                                    draggable="false" 
                                    loading="eager" 
                                    fetchPriority="high"
                                    decoding="async"
                                    src={imgPath} 
                                  />
                                </div>
                                <div className="mt-3 flex items-start justify-between gap-3 px-1">
                                  <div className="min-w-0">
                                    <h4 className="text-lg sm:text-lg lg:text-xl font-medium leading-tight line-clamp-1 text-text-main group-hover:text-brand transition-colors">
                                      {tab === 'ALL' ? t('allResources') : tab}
                                    </h4>
                                    <p className="mt-1 text-xs sm:text-sm font-medium text-text-muted line-clamp-1">
                                      {tab === 'ALL' ? 'รวมสินค้าทั้งหมดในร้าน' : 'การันตีสะอาด 100%'}
                                    </p>
                                  </div>
                                  <div className="shrink-0 pt-0.5 text-right">
                                    <p className="text-sm font-medium text-text-muted">{count} สินค้า</p>
                                    <div className="mt-1 flex flex-wrap items-center justify-end gap-1">
                                      {tab === 'ALL' && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-brand/40 bg-brand/15 px-2 py-0.5 text-[11px] font-semibold text-brand">
                                          <Star className="w-3 h-3 fill-brand text-brand" /> แนะนำ
                                        </span>
                                      )}
                                      {appStats.downloads >= 100 && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-brand/40 bg-brand/15 px-2 py-0.5 text-[11px] font-semibold text-brand">
                                          <Flame className="w-3 h-3 fill-brand text-brand" /> ยอดฮิต
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>

                {/* ---------------------------------------------------- */}
                {/* RECOMMENDED PRODUCTS SECTION */}
                {/* ---------------------------------------------------- */}
                <div className="w-full relative mt-8 pt-6 border-t border-border-subtle">
                  <div className="flex items-center space-x-2 justify-between">
                    <div>
                      <h3 className="font-semibold text-xl sm:text-2xl text-text-main line-clamp-1">สินค้าที่คุณอาจสนใจ</h3>
                      <p className="text-xs sm:text-sm text-text-muted mt-1 inline-flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-brand" /> แนะนำสินค้ายอดฮิต
                      </p>
                    </div>
                    <div>
                      <button 
                        onClick={() => { setActiveCategory('ALL'); setCurrentView('category'); }}
                        className="inline-flex shrink-0 items-center justify-center whitespace-nowrap font-medium transition-colors duration-150 py-1.5 px-3 text-xs sm:text-sm rounded-xl bg-card-bg text-text-main border border-border-subtle hover:bg-bg-app shadow-sm gap-1.5"
                      >
                        <ShoppingCart className="w-4 h-4" /> ดูทั้งหมด
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5 pb-12">
                    {resourcesData.slice(0, 5).map((item, index) => {
                       return (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2, delay: index * 0.03 }}
                          key={"rec-" + item.id}
                          onClick={() => handleOpenDetails(item)}
                          className="relative rounded-md sm:rounded-lg group overflow-hidden cursor-pointer p-0 bg-transparent flex flex-col shadow-sm"
                        >
                          <div className="relative flex-1 z-10 bg-card-bg border border-border-subtle group-hover:border-brand transition-colors duration-200 rounded-md sm:rounded-lg p-1.5 sm:p-2 flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.02)] group-hover:shadow-[0_8px_30px_rgba(106,154,251,0.12)]">
                            
                            {appStats.downloads >= 100 && (
                              <div className="absolute top-1 right-1 z-30 pointer-events-none">
                                <div className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-2 py-1 border border-orange-300/40">
                                  <Flame className="w-3 h-3 text-white fill-white" />
                                  <span className="text-[10px] sm:text-[11px] font-semibold text-white">ยอดฮิต</span>
                                </div>
                              </div>
                            )}

                            <div className="relative z-20 rounded-md overflow-hidden bg-bg-app aspect-square">
                              <motion.img 
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.4 }}
                                src={item.imageUrl} 
                                alt={getLocalized(item.title)} 
                                className="w-full h-full object-cover sm:object-contain object-center transition-opacity duration-500 ease-out" 
                                referrerPolicy="no-referrer" 
                              />
                            </div>
                            
                            <div className="relative z-20 mt-2 flex-1 flex flex-col">
                              <h3 className="text-sm sm:text-base font-bold text-text-main line-clamp-1 group-hover:text-brand transition-colors">{getLocalized(item.title)}</h3>
                              <p className="text-[11px] sm:text-xs text-brand line-clamp-1 mt-1 font-medium bg-brand/10 w-fit px-1.5 py-0.5 rounded-md border border-brand/20">
                                ✦ {getLocalized(item.shortDescription) || 'คุณสมบัติพิเศษ'}
                              </p>
                              
                              <div className="flex items-center mt-3 justify-between space-x-2 pt-2 border-t border-border-subtle mt-auto">
                                <p className="text-xs sm:text-sm font-medium text-text-main inline-flex items-center">
                                  <span className="text-lg sm:text-xl font-bold leading-none">฿</span>
                                  <span className="text-lg sm:text-xl font-bold leading-none text-brand ml-[1px]">0</span>
                                </p>
                                <p className="text-[10px] sm:text-[11px] rounded px-1.5 py-0.5 border inline-flex items-center gap-1 border-border-subtle text-text-muted bg-bg-app">
                                  <Archive className="w-3 h-3 shrink-0" /> คงเหลือ ∞
                                </p>
                              </div>
                              
                              <div className="flex items-center space-x-2 mt-2">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleOpenDetails(item); }}
                                  className="inline-flex shrink-0 items-center justify-center whitespace-nowrap text-sm font-medium outline-none select-none transition-[transform,background-color,color,border-color,box-shadow,opacity] duration-150 py-1.5 px-3 w-full rounded-xl bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] shadow-[0_4px_14px_rgba(59,130,246,0.25),inset_0_1px_0_rgba(255,255,255,0.22)] hover:shadow-[0_8px_24px_rgba(59,130,246,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] group"
                                >
                                  <ShoppingCart className="w-4 h-4 mr-1.5 shrink-0 [transform:perspective(700px)_rotateY(0deg)] [transform-style:preserve-3d] transition-transform duration-700 group-hover:[transform:perspective(700px)_rotateY(360deg)]" /> ซื้อสินค้า
                                </button>
                              </div>

                              <div className="mt-2.5 flex items-center justify-center">
                                <p className="text-[10px] sm:text-[11px] inline-flex items-center gap-1 text-text-muted">
                                  <Flame className="w-3 h-3 shrink-0 text-orange-500 fill-orange-500" /> ขายแล้ว {(appStats.downloads).toLocaleString()} ชิ้น
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                       )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ---------------------------------------------------- */}
          {/* PAGE 1.5: CATEGORY PAGE WITH BACK BUTTON */}
          {/* ---------------------------------------------------- */}
          {/* ============================================================================ */}
        {/* 📌 3. หน้าร้านค้า / หมวดหมู่สินค้า (Category View) */}
        {/* ============================================================================ */}
        {currentView === 'category' && (
            <motion.div 
              key="category-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-[1600px] mx-auto px-4 sm:px-8 py-6 sm:py-8 w-full"
            >
              <button 
                onClick={() => { setCurrentView('home'); }}
                className="flex items-center gap-2 text-text-muted hover:text-brand font-medium mb-6 transition-colors group px-2 text-[14px] sm:text-[15px] bg-card-bg border border-border-subtle py-2 rounded-xl hover:bg-bg-app shadow-sm w-fit"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
                กลับสู่หน้าหลัก
              </button>

              <div className="w-full relative mx-auto border-t border-border-subtle pt-6 transition-colors duration-300">
                <div className="flex items-center space-x-2 justify-between">
                  <div>
                    <h3 className="font-semibold text-xl sm:text-2xl text-text-main line-clamp-1">
                      {activeCategory === 'ALL' ? 'สินค้าทั้งหมด' : `หมวดหมู่ : ${activeCategory}`}
                    </h3>
                    <p className="text-xs sm:text-sm text-text-muted mt-1 inline-flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-brand fill-brand" /> {filteredResources.length} สินค้าในหมวดหมู่
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5 pb-12">
                  <AnimatePresence mode="popLayout">
                    {filteredResources.map((item, index) => {
                       const pseudoSold = (item.title as any)?.th?.length * 15 + index * 7 + 10;
                       return (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2, delay: index * 0.03 }}
                          key={item.id}
                          onClick={() => handleOpenDetails(item)}
                          className="relative rounded-md sm:rounded-lg group overflow-hidden cursor-pointer p-0 bg-transparent flex flex-col shadow-sm"
                        >
                          <div className="relative flex-1 z-10 bg-card-bg border border-border-subtle group-hover:border-brand transition-colors duration-200 rounded-md sm:rounded-lg p-1.5 sm:p-2 flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.02)] group-hover:shadow-[0_8px_30px_rgba(106,154,251,0.12)]">
                            
                            {appStats.downloads >= 100 && (
                              <div className="absolute top-1 right-1 z-30 pointer-events-none">
                                <div className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-2 py-1 border border-orange-300/40">
                                  <Flame className="w-3 h-3 text-white fill-white" />
                                  <span className="text-[10px] sm:text-[11px] font-semibold text-white">ยอดฮิต</span>
                                </div>
                              </div>
                            )}

                            <div className="relative z-20 rounded-md overflow-hidden bg-bg-app aspect-square">
                              <motion.img 
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.4 }}
                                src={item.imageUrl} 
                                alt={getLocalized(item.title)} 
                                className="w-full h-full object-cover sm:object-contain object-center transition-opacity duration-500 ease-out" 
                                referrerPolicy="no-referrer" 
                              />
                            </div>
                            
                            <div className="relative z-20 mt-2 flex-1 flex flex-col">
                              <h3 className="text-sm sm:text-base font-bold text-text-main line-clamp-1 group-hover:text-brand transition-colors">{getLocalized(item.title)}</h3>
                              <p className="text-[11px] sm:text-xs text-brand line-clamp-1 mt-1 font-medium bg-brand/10 w-fit px-1.5 py-0.5 rounded-md border border-brand/20">
                                ✦ {getLocalized(item.shortDescription) || 'คุณสมบัติพิเศษ'}
                              </p>
                              
                              <div className="flex items-center mt-3 justify-between space-x-2 pt-2 border-t border-border-subtle mt-auto">
                                <p className="text-xs sm:text-sm font-medium text-text-main inline-flex items-center">
                                  <span className="text-lg sm:text-xl font-bold leading-none">฿</span>
                                  <span className="text-lg sm:text-xl font-bold leading-none text-brand ml-[1px]">0</span>
                                </p>
                                <p className="text-[10px] sm:text-[11px] rounded px-1.5 py-0.5 border inline-flex items-center gap-1 border-border-subtle text-text-muted bg-bg-app">
                                  <Archive className="w-3 h-3 shrink-0" /> คงเหลือ ∞
                                </p>
                              </div>
                              
                              <div className="flex items-center space-x-2 mt-2">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleOpenDetails(item); }}
                                  className="inline-flex shrink-0 items-center justify-center whitespace-nowrap text-sm font-medium outline-none select-none transition-[transform,background-color,color,border-color,box-shadow,opacity] duration-150 py-1.5 px-3 w-full rounded-xl bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] shadow-[0_4px_14px_rgba(59,130,246,0.25),inset_0_1px_0_rgba(255,255,255,0.22)] hover:shadow-[0_8px_24px_rgba(59,130,246,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] group"
                                >
                                  <ShoppingCart className="w-4 h-4 mr-1.5 shrink-0 [transform:perspective(700px)_rotateY(0deg)] [transform-style:preserve-3d] transition-transform duration-700 group-hover:[transform:perspective(700px)_rotateY(360deg)]" /> ซื้อสินค้า
                                </button>
                              </div>

                              <div className="mt-2.5 flex items-center justify-center">
                                <p className="text-[10px] sm:text-[11px] inline-flex items-center gap-1 text-text-muted">
                                  <Flame className="w-3 h-3 shrink-0 text-orange-500 fill-orange-500" /> ขายแล้ว {(appStats.downloads).toLocaleString()} ชิ้น
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                       )
                    })}
                  </AnimatePresence>
                  
                  {filteredResources.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="col-span-full py-20 flex flex-col items-center justify-center text-text-muted border border-dashed border-border-subtle rounded-2xl bg-card-bg shadow-sm"
                    >
                      <div className="w-16 h-16 bg-bg-app rounded-[20px] flex items-center justify-center mb-4 border border-border-subtle">
                        <Archive className="w-8 h-8 text-text-muted" />
                      </div>
                      <h3 className="text-[18px] font-semibold text-text-main">{t('emptyTitle')}</h3>
                      <p className="text-[14px] mt-2 font-normal text-text-muted max-w-sm text-center">{t('emptyDesc')}</p>
                    </motion.div>
                  )}
                </div>
              </div>

            </motion.div>
          )}

          {/* ---------------------------------------------------- */}
          {/* PAGE 2: ITEM DETAILS PAGE */}
          {/* ---------------------------------------------------- */}
          {/* ============================================================================ */}
        {/* 📌 4. หน้ารายละเอียดสินค้า (Product Details View) */}
        {/* ============================================================================ */}
        {currentView === 'details' && selectedItem && (
            <motion.div 
              key="details-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-[1000px] mx-auto px-5 sm:px-8 py-6 sm:py-8 pb-32 sm:pb-12 w-full"
            >
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-text-muted font-medium mb-6 px-2 text-[13px] sm:text-[14px]">
                <button 
                  onClick={() => { setCurrentView('home'); setSelectedItem(null); }}
                  className="flex items-center gap-1.5 sm:gap-2 hover:text-brand transition-colors whitespace-nowrap"
                >
                  <Home className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  {t('home') || 'หน้าแรก'}
                </button>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                <button 
                  onClick={() => { setCurrentView('category'); setSelectedItem(null); setActiveCategory(selectedItem.category); }}
                  className="flex items-center gap-1.5 sm:gap-2 hover:text-brand transition-colors whitespace-nowrap"
                >
                  <Layers className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  {selectedItem.category}
                </button>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                <span className="flex items-center gap-1.5 sm:gap-2 text-text-main whitespace-nowrap overflow-hidden text-ellipsis">
                  <ShoppingBag className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  {getLocalized(selectedItem.title)}
                </span>
              </div>

              <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
                <div className="w-full lg:w-1/2">
                  <div className="w-full aspect-[4/3] sm:aspect-video lg:aspect-[4/3] bg-bg-app rounded-[24px] sm:rounded-[32px] overflow-hidden relative shadow-lg shadow-black/5 border border-border-subtle">
                    <img src={selectedItem.imageUrl} alt={getLocalized(selectedItem.title)} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute top-4 left-4 bg-card-bg/80 backdrop-blur-md px-3 py-1.5 text-[11px] sm:text-[12px] font-medium text-text-main rounded-full shadow-sm border border-border-subtle">
                      {selectedItem.category}
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-1/2 flex flex-col">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedItem.tags.map((tag, idx) => (
                      <span key={idx} className="bg-brand/10 text-brand border border-brand/20 px-3 py-1 rounded-full text-[11px] sm:text-[12px] font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Unified Product Card */}
                  <div className="rounded-[16px] overflow-hidden border border-border-subtle bg-card-bg shadow-[0_2px_10px_rgba(0,0,0,0.02)] mb-5">
                    
                    {/* Header: Title, Price & Stock */}
                    <div className="p-4 sm:p-5 flex flex-col gap-3 border-b border-border-subtle">
                      {/* Product Title */}
                      <h1 className="text-2xl sm:text-3xl font-semibold text-text-main tracking-tight leading-[1.3]">
                        {getLocalized(selectedItem.title)}
                      </h1>

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        {/* Product Price */}
                        <div className="flex items-center gap-2">
                          <span className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
                            {selectedItem.price ? selectedItem.price : "ฟรี"}
                          </span>
                          {!selectedItem.price && (
                            <span className="bg-emerald-500/10 text-emerald-500 text-xs font-semibold px-2 py-0.5 rounded border border-emerald-500/20">
                              Free Download
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-text-muted">
                           จำนวนคงเหลือ : ∞ ไม่จำกัด
                        </div>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 flex flex-col gap-5">
                      
                      {/* Video Clip Button */}
                      {selectedItem.videoUrl && (
                        <button onClick={() => window.open(selectedItem.videoUrl, '_blank')} className="w-full flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all hover:opacity-80 border border-border-subtle bg-card-bg text-text-main shadow-[0_2px_10px_rgba(0,0,0,0.02)] cursor-pointer">
                          <Play className="w-4 h-4 opacity-50" fill="currentColor" />
                          <div className="flex-1 text-left line-clamp-1">
                            <p className="text-xs font-semibold">{t('videoPreviewTitle')}</p>
                            <p className="text-[10px] text-text-muted">{t('videoPreviewDesc')}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 opacity-30" />
                        </button>
                      )}

                      {/* Details Block */}
                      <div>
                        <h5 className="text-[14px] font-bold flex items-center mb-2.5 text-text-main gap-2">
                          <FileText className="w-4 h-4 text-brand" /> รายละเอียดสินค้า
                        </h5>
                        <div className="rounded-[12px] p-4 bg-bg-app border border-border-subtle shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-brand/60"></div>
                          <p className="text-[13px] leading-relaxed break-words whitespace-pre-line text-text-main font-normal markdown-body">
                            {getLocalized(selectedItem.fullDescription)}
                          </p>
                        </div>
                      </div>

                      {/* Product Info Block */}
                      <div>
                        <h5 className="text-[14px] font-bold flex items-center mb-2.5 text-text-main gap-2">
                          <Archive className="w-4 h-4 text-brand" /> ข้อมูลของสินค้า
                        </h5>
                        <div className="px-4 py-3 rounded-[12px] border border-border-subtle bg-bg-app flex flex-col gap-2 shadow-sm">
                            <div className="flex justify-between items-center text-[13px] border-b border-border-subtle pb-2">
                              <span className="text-text-muted">ชื่อสินค้า :</span>
                              <span className="text-text-main font-medium line-clamp-1 text-right ml-4">{getLocalized(selectedItem.title)}</span>
                            </div>
                            <div className="flex justify-between items-center text-[13px] border-b border-border-subtle pb-2">
                              <span className="text-text-muted">ยอดขาย :</span>
                              <span className="text-text-main font-medium">{(appStats.downloads).toLocaleString()} ชิ้น</span>
                            </div>
                            <div className="flex justify-between items-center text-[13px] pt-1">
                              <span className="text-text-muted">สถานะ :</span>
                              <span className="text-brand bg-brand/10 px-2 py-0.5 rounded-md font-semibold text-[11px] flex items-center gap-1 border border-brand/20">
                                <Check className="w-3 h-3" /> พร้อมใช้งาน
                              </span>
                            </div>
                        </div>
                      </div>

                      {/* Warnings / Notes */}
                      {selectedItem.warning && (
                        <div>
                          <h5 className="text-[14px] font-bold flex items-center mb-2.5 text-red-500 gap-2">
                            <ShieldAlert className="w-4 h-4 text-red-500" /> ข้อควรทราบ
                          </h5>
                          <div className="text-red-500 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 p-3.5 rounded-[12px] text-[13px] leading-relaxed">
                            <span className="font-semibold">{t('friendlyNote')}</span> {getLocalized(selectedItem.warning)}
                          </div>
                        </div>
                      )}

                      {/* Link & Buy Button */}
                      {selectedItem.downloadLinks && selectedItem.downloadLinks.length > 0 ? (
                        <div className="flex flex-col gap-2 mt-2">
                          <h3 className="text-[13px] font-semibold text-text-main px-1">{t('downloadVersion')}</h3>
                          {selectedItem.downloadLinks.map((dl, idx) => (
                            <button 
                              key={idx}
                              onClick={() => handleGetLink(undefined, selectedItem, dl.url)}
                              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] text-[14px] font-medium transition-all group cursor-pointer w-full py-2.5 px-4 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white shadow-sm hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98]"
                            >
                              {selectedItem.requiresLogin && !currentUser ? (
                                <>
                                  <Lock className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                                  {t('loginToDownload') || 'Login to Download'}
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="w-4 h-4 shrink-0 [transform:perspective(700px)_rotateY(0deg)] [transform-style:preserve-3d] transition-transform duration-700 group-hover:[transform:perspective(700px)_rotateY(360deg)]" />
                                  {dl.label}
                                </>
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-2 text-center">
                          <button 
                            onClick={() => handleGetLink(undefined, selectedItem)}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] text-[14px] font-medium transition-all group cursor-pointer sm:w-auto w-full py-2.5 px-6 mx-auto bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white shadow-sm hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98]"
                          >
                            {selectedItem.requiresLogin && !currentUser ? (
                              <>
                                <Lock className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                                {t('loginToDownload') || 'Login to Download'}
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4 shrink-0 [transform:perspective(700px)_rotateY(0deg)] [transform-style:preserve-3d] transition-transform duration-700 group-hover:[transform:perspective(700px)_rotateY(360deg)]" />
                                สั่งซื้อสินค้า
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ---------------------------------------------------- */}
          {/* PAGE 3: HELP & FAQ PAGE */}
          {/* ---------------------------------------------------- */}
          {/* ============================================================================ */}
        {/* 📌 5. หน้าช่วยเหลือ / วิธีรับสินค้า (Help View) */}
        {/* ============================================================================ */}
        {currentView === 'help' && (
             <motion.div 
               key="help-view"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
               className="max-w-[1000px] mx-auto px-4 sm:px-8 py-8 w-full"
             >
               <button 
                 onClick={() => setCurrentView('home')}
                 className="flex items-center gap-2 text-slate-500 hover:text-brand font-medium mb-8 transition-colors group px-2"
               >
                 <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                 {t('backHelp')}
               </button>

               <div className="bg-card-bg rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 shadow-sm border border-border-subtle mb-8">
                 <h1 className="text-xl sm:text-2xl font-semibold text-text-main mb-2">{t('helpHeader')}</h1>
                 <p className="text-text-muted font-normal mb-8 sm:mb-10 text-[14px] sm:text-[15px]">{t('helpSubHeader')}</p>
                 
                 {/* How to use */}
                 <div className="mb-10 sm:mb-12">
                   <h2 className="text-[16px] sm:text-[18px] font-semibold text-brand mb-5 flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5"/> {t('howToUse')}
                   </h2>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                     <div className="bg-bg-app border border-border-subtle p-5 sm:p-6 rounded-[20px] sm:rounded-[24px]">
                       <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand/10 border border-brand/20 text-brand rounded-full flex items-center justify-center font-medium mb-3 sm:mb-4 text-[14px] sm:text-[16px]">1</div>
                       <h3 className="font-medium text-[14px] sm:text-[15px] text-text-main mb-2">{t('step1Title')}</h3>
                       <p className="text-[13px] sm:text-[14px] font-normal text-text-muted leading-relaxed">{t('step1Desc')}</p>
                     </div>
                     <div className="bg-bg-app border border-border-subtle p-5 sm:p-6 rounded-[20px] sm:rounded-[24px]">
                       <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand/10 border border-brand/20 text-brand rounded-full flex items-center justify-center font-medium mb-3 sm:mb-4 text-[14px] sm:text-[16px]">2</div>
                       <h3 className="font-medium text-[14px] sm:text-[15px] text-text-main mb-2">{t('step2Title')}</h3>
                       <p className="text-[13px] sm:text-[14px] font-normal text-text-muted leading-relaxed">{t('step2Desc')}</p>
                     </div>
                     <div className="bg-bg-app border border-border-subtle p-5 sm:p-6 rounded-[20px] sm:rounded-[24px]">
                       <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand/10 border border-brand/20 text-brand rounded-full flex items-center justify-center font-medium mb-3 sm:mb-4 text-[14px] sm:text-[16px]">3</div>
                       <h3 className="font-medium text-[14px] sm:text-[15px] text-text-main mb-2">{t('step3Title')}</h3>
                       <p className="text-[13px] sm:text-[14px] font-normal text-text-muted leading-relaxed">{t('step3Desc')}</p>
                     </div>
                   </div>
                 </div>

                 {/* FAQ */}
                 <div>
                    <h2 className="text-[16px] sm:text-[18px] font-semibold text-brand mb-5 flex items-center gap-2">
                       <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5"/> {t('faqHeader')}
                    </h2>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="border border-border-subtle rounded-[16px] sm:rounded-[20px] p-5 sm:p-6 hover:shadow-md transition-shadow bg-card-bg">
                        <h3 className="font-medium text-text-main mb-2 text-[14px] sm:text-[15px]">{t('q1')}</h3>
                        <p className="text-[13px] sm:text-[14px] font-normal text-text-muted leading-relaxed">{t('a1')}</p>
                      </div>
                      <div className="border border-border-subtle rounded-[16px] sm:rounded-[20px] p-5 sm:p-6 hover:shadow-md transition-shadow bg-card-bg">
                        <h3 className="font-medium text-text-main mb-2 text-[14px] sm:text-[15px]">{t('q2')}</h3>
                        <p className="text-[13px] sm:text-[14px] font-normal text-text-muted leading-relaxed">{t('a2')}</p>
                      </div>
                      <div className="border border-border-subtle rounded-[16px] sm:rounded-[20px] p-5 sm:p-6 hover:shadow-md transition-shadow bg-card-bg">
                        <h3 className="font-medium text-text-main mb-2 text-[14px] sm:text-[15px]">{t('q3')}</h3>
                        <p className="text-[13px] sm:text-[14px] font-normal text-text-muted leading-relaxed">{t('a3')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Feedback CTA */}
                  <div className="mt-12 bg-brand/5 border border-brand/20 p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-brand/10 border border-brand/20 rounded-full flex items-center justify-center mb-4">
                      <MessageSquare className="w-6 h-6 text-brand" />
                    </div>
                    <h3 className="text-[16px] sm:text-[18px] font-semibold text-brand mb-2">{t('feedbackMenu')}</h3>
                    <p className="text-[14px] text-text-muted mb-6 max-w-sm">{t('feedbackDesc')}</p>
                    <button 
                      onClick={() => setShowFeedbackModal(true)} 
                      className="px-6 py-2.5 bg-brand text-white font-medium rounded-full hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                      {t('feedbackTitle')} <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
               </div>
             </motion.div>
          )}

        </AnimatePresence>

        {/* ========================================================================= */}
        {/* GLOBAL FOOTER */}
        {/* ========================================================================= */}
        <footer className="w-full border-t border-border-subtle bg-card-bg/50 backdrop-blur-sm mt-8">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left flex flex-col items-center md:items-start">
              <img src="https://img2.pic.in.th/IMG_0083.png" alt="Logo" className="h-6 sm:h-7 object-contain drop-shadow-sm mb-1 opacity-80 mix-blend-multiply" />
              <p className="text-[13px] text-text-muted mt-1">{t('footerDesc')}</p>
            </div>
            <div className="flex items-center gap-6 text-[13px] font-medium text-text-muted">
              <button onClick={() => setCurrentView('help')} className="hover:text-brand transition-colors">{t('help')}</button>
              <button onClick={() => setShowSocialsModal(true)} className="hover:text-brand transition-colors">{t('socialsFollow')}</button>
            </div>
            <div className="text-[12px] text-text-muted/70">
              &copy; {new Date().getFullYear()} Zorix Shop. All rights reserved.
            </div>
          </div>
        </footer>

      </main>

      {/* ========================================================================= */}
      {/* SOCIALS MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {/* ============================================================================ */}
      {/* 📌 หน้าต่าง Pop-up แสดงช่องทางติดต่อ Social Media */}
      {/* ============================================================================ */}
      {showSocialsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/40 backdrop-blur-md"
               onClick={() => setShowSocialsModal(false)}
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-card-bg w-full max-w-[360px] p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] relative border border-border-subtle z-10 max-h-[90dvh] overflow-y-auto hide-scrollbar"
             >
               <button 
                 onClick={() => setShowSocialsModal(false)}
                 className="absolute top-5 right-5 bg-bg-app text-text-muted hover:text-text-main hover:bg-border-subtle p-2.5 rounded-full transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>

               <div className="text-center mb-6 mt-2">
                 <div className="w-16 h-16 bg-brand/10 border border-brand/20 rounded-[20px] flex items-center justify-center mx-auto mb-4">
                    <Share2 className="w-8 h-8 text-brand" />
                 </div>
                 <h2 className="m-0 mb-2 text-xl font-semibold text-text-main">{t('socialsFollow')}</h2>
                 <p className="text-[14px] text-text-muted font-normal">{t('socialsFamily')}</p>
               </div>

               <div className="space-y-3">
                 <a href="#" onClick={(e) => { e.preventDefault(); alert(t('fbLink')); }} className="flex items-center gap-4 bg-bg-app hover:bg-brand hover:text-white group p-4 rounded-[16px] transition-all cursor-pointer border border-transparent hover:border-brand">
                   <Facebook className="w-5 h-5 text-[#1877F2] group-hover:text-white transition-colors" />
                   <span className="font-medium text-text-main group-hover:text-white transition-colors">Zorix Shop Fanpage</span>
                 </a>
                 <a href="#" onClick={(e) => { e.preventDefault(); alert(t('igLink')); }} className="flex items-center gap-4 bg-bg-app hover:bg-brand hover:text-white group p-4 rounded-[16px] transition-all cursor-pointer border border-transparent hover:border-brand">
                   <Instagram className="w-5 h-5 text-[#E4405F] group-hover:text-white transition-colors" />
                   <span className="font-medium text-text-main group-hover:text-white transition-colors">@zorix.shop</span>
                 </a>
                 <a href="#" onClick={(e) => { e.preventDefault(); alert(t('dcLink')); }} className="flex items-center gap-4 bg-bg-app hover:bg-brand hover:text-white group p-4 rounded-[16px] transition-all cursor-pointer border border-transparent hover:border-brand">
                   <MessageCircle className="w-5 h-5 text-[#00B2FF] group-hover:text-white transition-colors" />
                   <span className="font-medium text-text-main group-hover:text-white transition-colors">Zorix Community</span>
                 </a>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* FEEDBACK MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {/* ============================================================================ */}
      {/* 📌 หน้าต่าง Pop-up Feedback แจ้งปัญหา / แนะนำ */}
      {/* ============================================================================ */}
      {showFeedbackModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/40 backdrop-blur-md"
               onClick={() => setShowFeedbackModal(false)}
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-card-bg w-full max-w-[400px] p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] relative border border-border-subtle z-10"
             >
               <button 
                 onClick={() => setShowFeedbackModal(false)}
                 className="absolute top-5 right-5 bg-bg-app text-text-muted hover:text-text-main hover:bg-border-subtle p-2.5 rounded-full transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>

               <div className="text-center mb-6 mt-2">
                 <div className="w-16 h-16 bg-brand/10 border border-brand/20 rounded-[20px] flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-brand" />
                 </div>
                 <h2 className="m-0 mb-2 text-xl font-semibold text-text-main">{t('feedbackTitle')}</h2>
                 <p className="text-[14px] text-text-muted font-normal">{t('feedbackDesc')}</p>
               </div>

               {feedbackStatus === 'success' ? (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="text-center py-6 bg-emerald-500/10 rounded-[20px] border border-emerald-500/20"
                 >
                   <span className="text-4xl mb-3 block">🎉</span>
                   <span className="text-emerald-500 font-medium">
                     {t('feedbackSuccess')}
                   </span>
                 </motion.div>
               ) : (
                 <div className="flex flex-col gap-4">
                   <textarea 
                     value={feedbackText}
                     onChange={(e) => setFeedbackText(e.target.value)}
                     placeholder={t('feedbackPlaceholder')}
                     className="w-full bg-bg-app border border-border-subtle rounded-[20px] p-4 text-[14px] sm:text-[15px] focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 h-[120px] resize-none transition-all placeholder:text-text-muted/50 text-text-main"
                   />
                   <button 
                     disabled={!feedbackText.trim() || feedbackStatus === 'submitting'}
                     onClick={() => {
                        setFeedbackStatus('submitting');
                        setTimeout(() => {
                          setFeedbackStatus('success');
                          setTimeout(() => {
                             setShowFeedbackModal(false);
                             setFeedbackText('');
                             setFeedbackStatus('idle');
                          }, 2000);
                        }, 1000);
                     }}
                     className={`w-full py-4 rounded-[20px] font-medium text-[15px] transition-all flex items-center justify-center gap-2 ${
                       feedbackText.trim() && feedbackStatus !== 'submitting' 
                         ? 'bg-brand text-white hover:shadow-xl hover:shadow-brand/30 active:scale-95 cursor-pointer' 
                         : 'bg-bg-app text-text-muted cursor-not-allowed border border-border-subtle'
                     }`}
                   >
                     {feedbackStatus === 'submitting' ? <Loader2 className="w-5 h-5 animate-spin" /> : t('feedbackSubmit')}
                   </button>
                 </div>
               )}
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* reCAPTCHA VERIFICATION MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {/* ============================================================================ */}
      {/* 📌 หน้าต่าง Pop-up ยืนยันการรับสินค้า (Verification Modal) */}
      {/* ============================================================================ */}
      {showVerifyModal && selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card-bg w-full max-w-[420px] p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] relative border border-border-subtle z-10 max-h-[90dvh] overflow-y-auto hide-scrollbar"
            >
              <button 
                onClick={() => setShowVerifyModal(false)}
                className="absolute top-5 right-5 bg-bg-app text-text-muted hover:text-text-main hover:bg-border-subtle p-2.5 rounded-full transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center mb-8 mt-2">
                <div className="w-16 h-16 bg-brand/10 border border-brand/20 rounded-[20px] flex items-center justify-center mx-auto mb-4">
                   <ShieldAlert className="w-8 h-8 text-brand" />
                </div>
                <h2 className="m-0 mb-2 text-[22px] font-semibold text-text-main">{t('verifySafe')}</h2>
                <p className="text-[14px] text-text-muted font-normal mb-4">{t('verifyHuman')}</p>
                
                {/* Anti-VPN Warning Banner */}
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-[12px] text-left flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-[13px] font-semibold text-red-500 mb-0.5">{t('verifyWarning')}</h3>
                    <p className="text-[12px] text-red-500/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('verifyWarningDesc') }}></p>
                  </div>
                </div>
              </div>

              {/* Steps Container */}
              <div className="flex flex-col gap-3 mb-6">
                
                {/* Step 1 */}
                <div className="bg-bg-app border border-border-subtle rounded-[16px] p-4 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step1Status === 'completed' ? 'bg-emerald-500/20 text-emerald-500' : step1Status === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-rose-500/20 text-rose-500'}`}>
                        {step1Status === 'completed' ? <Check className="w-4 h-4" /> : <Youtube className="w-4 h-4" />}
                     </div>
                     <div className="flex flex-col">
                       <span className={`text-[15px] font-medium tracking-tight ${step1Status === 'completed' ? 'text-text-muted line-through' : 'text-text-main'}`}>
                         {t('verifyYT')}
                       </span>
                       {step1Status === 'checking' && <span className="text-[12px] text-brand font-medium">{t('verifyYTWait')}</span>}
                       {step1Status === 'error' && <span className="text-[12px] text-red-500 font-medium">{t('verifyYTErr')}</span>}
                     </div>
                  </div>
                  <button 
                    onClick={() => { window.open('https://youtube.com', '_blank'); step1OpenedAt.current = Date.now(); setStep1Status('checking'); }}
                    disabled={step1Status === 'completed'}
                    className={`px-4 py-2 rounded-[12px] text-[13px] font-medium transition-all flex-shrink-0 flex items-center gap-2 ${
                      step1Status === 'completed' ? 'bg-emerald-500 text-white opacity-70 cursor-not-allowed' : 
                      step1Status === 'checking' ? 'bg-amber-500 text-white cursor-pointer hover:bg-amber-600 animate-pulse' :
                      'bg-rose-600 text-white hover:bg-rose-700 shadow-sm cursor-pointer'
                    }`}
                  >
                    {step1Status === 'checking' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {step1Status === 'completed' ? t('verifyDone') : step1Status === 'checking' ? t('verifyCheck') : step1Status === 'error' ? t('verifyRetry') : t('verifyDo')}
                  </button>
                </div>

                {/* Step 2 */}
                <div className="bg-bg-app border border-border-subtle rounded-[16px] p-4 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step2Status === 'completed' ? 'bg-emerald-500/20 text-emerald-500' : step2Status === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-[#5865F2]/20 text-[#5865F2]'}`}>
                        {step2Status === 'completed' ? <Check className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                     </div>
                     <div className="flex flex-col">
                       <span className={`text-[15px] font-medium tracking-tight ${step2Status === 'completed' ? 'text-text-muted line-through' : 'text-text-main'}`}>
                         {t('verifyTG')}
                       </span>
                       {step2Status === 'checking' && <span className="text-[12px] text-brand font-medium">{t('verifyTGWait')}</span>}
                       {step2Status === 'error' && <span className="text-[12px] text-red-500 font-medium">{t('verifyTGErr')}</span>}
                     </div>
                  </div>
                  <button 
                    onClick={() => { window.open('https://discord.gg/hSuBbnwWZY', '_blank'); step2OpenedAt.current = Date.now(); setStep2Status('checking'); }}
                    disabled={step2Status === 'completed'}
                    className={`px-4 py-2 rounded-[12px] text-[13px] font-medium transition-all flex-shrink-0 flex items-center gap-2 ${
                      step2Status === 'completed' ? 'bg-emerald-500 text-white opacity-70 cursor-not-allowed' : 
                      step2Status === 'checking' ? 'bg-amber-500 text-white cursor-pointer hover:bg-amber-600 animate-pulse' :
                      'bg-[#5865F2] text-white hover:bg-[#4752C4] shadow-sm cursor-pointer'
                    }`}
                  >
                    {step2Status === 'checking' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {step2Status === 'completed' ? t('verifyDone') : step2Status === 'checking' ? t('verifyCheck') : step2Status === 'error' ? t('verifyRetry') : t('verifyDo')}
                  </button>
                </div>

                {/* Step 3 (Verified Check Block) */}
                <div className={`flex justify-center transition-opacity duration-300 ${(step1Status !== 'completed' || step2Status !== 'completed') ? 'opacity-60 grayscale pointer-events-none' : 'opacity-100'}`}>
                  {isChecked ? (
                     <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[16px] p-4 text-emerald-500 flex items-center justify-center gap-3 w-full shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                       <Check className="w-5 h-5"/> {t('noRobot')} - Verified
                     </div>
                  ) : isNetworkChecking ? (
                     <div className="bg-bg-app border border-border-subtle rounded-[16px] p-4 text-brand flex items-center justify-center gap-3 w-full shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                       <Loader2 className="w-5 h-5 animate-spin"/> Verifying...
                     </div>
                  ) : (
                     <div className="mx-auto rounded-[8px] overflow-hidden shadow-sm inline-block relative">
                        <ReCAPTCHA
                          sitekey="6LcHYMgsAAAAAIxpQxY5vKS5gdu3Uw-E92pgPEXh"
                          onChange={handleVerifyRecaptcha}
                          theme={theme}
                        />
                        {(step1Status !== 'completed' || step2Status !== 'completed') && (
                          <div className="absolute inset-0 z-10" onClick={() => alert(t('alertSteps'))}></div>
                        )}
                     </div>
                  )}
                </div>

              </div>

              <AnimatePresence>
                {networkError && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-red-500/10 text-red-500 text-[13px] font-medium p-3 rounded-[12px] border border-red-500/20 text-center mb-6">
                      {networkError}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Timer & Confirmation block */}
              <div className="h-[90px] flex items-center justify-center mb-6">
                {isChecked && isCounting && (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.9 }} 
                     animate={{ opacity: 1, scale: 1 }} 
                     className="w-full relative bg-brand/10 rounded-[20px] border border-brand/20 overflow-hidden h-full flex flex-col items-center justify-center"
                   >
                     <motion.div 
                       className="absolute top-0 left-0 bottom-0 bg-brand/20"
                       initial={{ width: 0 }}
                       animate={{ width: `${((15 - countdown) / 15) * 100}%` }}
                       transition={{ ease: "linear", duration: 1 }}
                     />
                     <div className="relative z-10 flex flex-col items-center justify-center">
                        <div className="flex items-end gap-1 text-brand mb-0.5">
                           <motion.div 
                             key={countdown}
                             initial={{ opacity: 0, y: -10 }}
                             animate={{ opacity: 1, y: 0 }}
                             className="text-[36px] font-semibold leading-none tracking-tighter"
                           >
                             {countdown}
                           </motion.div>
                           <span className="text-[16px] font-medium mb-1">s</span>
                        </div>
                        <div className="text-[12px] font-medium text-brand/70 uppercase tracking-widest flex items-center gap-1.5">
                          <RefreshCcw className="w-3 h-3 animate-spin"/> {t('generatingLink')}
                        </div>
                     </div>
                   </motion.div>
                )}
                
                {isChecked && !isCounting && countdown === 0 && (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.9 }} 
                     animate={{ opacity: 1, scale: 1 }} 
                     className="w-full text-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-center gap-3"
                   >
                     <div className="bg-emerald-500/20 p-1.5 rounded-full">
                       <Check className="w-5 h-5 text-emerald-500" strokeWidth={3} />
                     </div>
                     <span className="text-emerald-500 text-[15px] font-medium">
                       {t('readyDl')}
                     </span>
                   </motion.div>
                )}
              </div>

              {/* Final CTA Button */}
              <button 
                disabled={!(!isCounting && isChecked && countdown === 0)}
                onClick={handleFinalRedirect}
                className={`w-full py-4.5 rounded-[20px] text-[15px] font-bold text-center transition-all flex items-center justify-center gap-2 group ${
                  !isCounting && isChecked && countdown === 0 
                    ? 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white shadow-[0_4px_14px_rgba(59,130,246,0.25),inset_0_1px_0_rgba(255,255,255,0.22)] hover:shadow-[0_8px_24px_rgba(59,130,246,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] cursor-pointer' 
                    : 'bg-bg-app text-text-muted border border-border-subtle cursor-not-allowed'
                }`}
              >
                {!isChecked ? t('waitingVerify') : (countdown > 0 ? t('gettingLink') : (
                  <>
                    <ShoppingCart className="w-5 h-5 shrink-0 [transform:perspective(700px)_rotateY(0deg)] [transform-style:preserve-3d] transition-transform duration-700 group-hover:[transform:perspective(700px)_rotateY(360deg)]" />
                    {t('goDownload')}
                  </>
                ))}
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {/* ============================================================================ */}
      {/* 📌 หน้าต่าง Pop-up ล็อกอิน / สมัครสมาชิก (Auth Modal) */}
      {/* ============================================================================ */}
      {authModalType && (
          <AuthModal
            type={authModalType}
            onClose={() => setAuthModalType(null)}
            t={t}
            onSuccess={(user, token, rememberMe) => {
              if (rememberMe) {
                localStorage.setItem('authToken', token);
              } else {
                sessionStorage.setItem('authToken', token);
              }
              setCurrentUser({ id: user.id, username: user.username, email: user.email, avatarUrl: user.avatarUrl });
              setAuthModalType(null);
            }}
          />
        )}
        
        {/* ============================================================================ */}
      {/* 📌 หน้าต่าง Pop-up โปรไฟล์ส่วนตัว (Profile Modal) */}
      {/* ============================================================================ */}
      {showProfileModal && currentUser && (
          <ProfileModal
            currentUser={currentUser}
            onClose={() => setShowProfileModal(false)}
            onUpdate={(updatedUser) => {
              setCurrentUser(prev => prev ? { ...prev, username: updatedUser.username, avatarUrl: updatedUser.avatarUrl } : null);
            }}
            t={t}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
