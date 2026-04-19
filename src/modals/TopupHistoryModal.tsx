import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Loader2, Wallet } from 'lucide-react';
import { ModalShell } from './ModalShell';

interface TopupHistoryModalProps {
  onClose: () => void;
}

interface HistoryItem {
  _id: string;
  method: string;
  amount: number;
  status: 'success' | 'failed';
  note?: string;
  createdAt: string;
}

const METHOD_LABELS: Record<string, string> = {
  gift: 'TrueMoney Gift',
  slip: 'Slip Check',
  promptpay: 'PromptPay QR',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('th-TH', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function TopupHistoryModal({ onClose }: TopupHistoryModalProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    fetch('/api/topup/history', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.history) setHistory(d.history);
        else setError(d.message || 'เกิดข้อผิดพลาด');
      })
      .catch(() => setError('ไม่สามารถโหลดข้อมูลได้'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ModalShell
      title="ประวัติการเติมเงิน"
      subtitle="รายการทั้งหมดของคุณ"
      icon={<Clock className="w-5 h-5" />}
      onClose={onClose}
    >
      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-text-muted">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">กำลังโหลด...</span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-muted">
          <Wallet className="w-10 h-10 opacity-30" />
          <p className="text-sm">ยังไม่มีประวัติการเติมเงิน</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-3 p-3.5 rounded-[14px] border border-border-subtle hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
            >
              {/* Status Icon */}
              <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                item.status === 'success'
                  ? 'bg-emerald-100 dark:bg-emerald-950/40'
                  : 'bg-red-100 dark:bg-red-950/40'
              }`}>
                {item.status === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-main truncate">
                  {METHOD_LABELS[item.method] || item.method || 'เติมเงิน'}
                </p>
                <p className="text-xs text-text-muted">{formatDate(item.createdAt)}</p>
                {item.note && item.status === 'failed' && (
                  <p className="text-xs text-red-500 mt-0.5">{item.note}</p>
                )}
              </div>

              {/* Amount */}
              <div className="text-right shrink-0">
                <p className={`font-bold text-sm ${
                  item.status === 'success' ? 'text-emerald-600' : 'text-text-muted line-through'
                }`}>
                  +{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ฿
                </p>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                  item.status === 'success'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-600'
                }`}>
                  {item.status === 'success' ? 'สำเร็จ' : 'ไม่สำเร็จ'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </ModalShell>
  );
}
