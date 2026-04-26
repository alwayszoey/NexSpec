import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ModalShellProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}

export function ModalShell({ title, subtitle, icon, onClose, children }: ModalShellProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
          className="w-full sm:max-w-lg bg-card-bg rounded-t-[28px] sm:rounded-[24px] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5 pb-4 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="flex items-center justify-center w-10 h-10 rounded-[13px] bg-brand/10 text-brand shrink-0">
                  {icon}
                </div>
              )}
              <div>
                <h2 className="font-bold text-text-main text-lg leading-tight">{title}</h2>
                {subtitle && <p className="text-text-muted text-xs mt-0.5">{subtitle}</p>}
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-text-muted transition-colors mt-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 max-h-[80vh] overflow-y-auto">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
