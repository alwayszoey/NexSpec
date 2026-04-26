import React, { useState } from 'react';
import { Gift, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { ModalShell } from './ModalShell';

interface TopupGiftModalProps {
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export function TopupGiftModal({ onClose, onSuccess }: TopupGiftModalProps) {
  const [link, setLink] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState<number | null>(null);

  const handleSubmit = async () => {
    if (!link.trim()) {
      setStatus('error');
      setMessage('กรุณากรอกลิงค์ซองของขวัญ');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const res = await fetch('/api/topup/gift', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ link }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setStatus('success');
        setAmount(data.amount);
        setMessage(data.message || `ได้รับเงิน ${data.amount} บาท`);
        setTimeout(() => onSuccess(data.amount), 1800);
      } else {
        setStatus('error');
        setMessage(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch {
      setStatus('error');
      setMessage('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  };

  return (
    <ModalShell
      title="TrueMoney Gift"
      subtitle="เติมเงินด้วยซองของขวัญ อั่งเปา"
      icon={<Gift className="w-5 h-5" />}
      onClose={onClose}
    >
      <div className="space-y-4">
        {/* Input */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">
            ลิงค์ซองของขวัญ
          </label>
          <input
            type="text"
            value={link}
            onChange={(e) => { setLink(e.target.value); setStatus('idle'); }}
            placeholder="https://gift.truemoney.com/campaign/?v=..."
            disabled={status === 'loading' || status === 'success'}
            className="w-full px-4 py-3 rounded-[14px] border border-border-subtle bg-slate-50 dark:bg-slate-900/50 text-text-main text-sm placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60 transition-all"
          />
        </div>

        {/* Fee notice */}
        <p className="text-xs text-text-muted text-center">
          ค่าธรรมเนียมการเติมเงินผ่าน TrueMoney: <span className="font-semibold text-amber-500">2.9% (สูงสุด 10 บาท)</span>
        </p>

        {/* Status Feedback */}
        {status === 'error' && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-[12px] bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50">
            <XCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
          </div>
        )}
        {status === 'success' && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-[12px] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              เติมเงินสำเร็จ! +{amount} บาท 🎉
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-[14px] border border-border-subtle text-text-muted text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={status === 'loading' || status === 'success'}
            className="flex-1 py-3 rounded-[14px] bg-brand hover:bg-brand-hover text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70 transition-all"
          >
            {status === 'loading' ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> กำลังตรวจสอบ...</>
            ) : status === 'success' ? (
              <><CheckCircle className="w-4 h-4" /> สำเร็จ!</>
            ) : (
              'ยืนยันการเติมเงิน'
            )}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
