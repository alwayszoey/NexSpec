import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingBag, Info, Mail, LayoutGrid, User, Search } from 'lucide-react';
import { siteConfig } from '../config';

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: LayoutGrid },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-bg-app">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform">
            <img src={siteConfig.logoUrl} alt="Logo" className="h-8 sm:h-10 object-contain" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    isActive ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-text-muted hover:bg-slate-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand transition-colors" />
              <input 
                type="text" 
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-xl bg-slate-100/50 border border-transparent focus:bg-white focus:border-brand/30 focus:outline-none text-sm w-48 lg:w-64 transition-all"
              />
            </div>
            <button className="p-2 rounded-xl bg-brand/10 text-brand hover:bg-brand hover:text-white transition-all active:scale-90">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border-subtle py-12 px-4">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
          <div className="space-y-4">
            <img src={siteConfig.logoUrl} alt="Logo" className="h-10 mx-auto md:mx-0" />
            <p className="text-sm text-text-muted">
              The best platform for high-quality digital assets and tools.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-text-main mb-6 uppercase tracking-widest text-xs">Platform</h4>
            <ul className="space-y-3 text-sm text-text-muted">
              <li><Link to="/" className="hover:text-brand transition-colors">Marketplace</Link></li>
              <li><Link to="/about" className="hover:text-brand transition-colors">Our Story</Link></li>
              <li><Link to="/contact" className="hover:text-brand transition-colors">Support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-text-main mb-6 uppercase tracking-widest text-xs">Legal</h4>
            <ul className="space-y-3 text-sm text-text-muted">
              <li><a href="#" className="hover:text-brand transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <h4 className="font-bold text-text-main mb-2">Need Help?</h4>
            <p className="text-xs text-text-muted mb-4">Our team is available 24/7 to assist you with any issues.</p>
            <Link to="/contact" className="block text-center bg-brand text-white text-xs font-bold py-3 rounded-xl hover:brightness-110 transition-all">
              Contact Support
            </Link>
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">© 2026 NexSpec. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <ShoppingBag className="w-4 h-4 text-slate-300" />
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Powered by NexSpec Engine</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
