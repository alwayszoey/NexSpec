import React, { useState } from 'react';
import { Wallet, Gift, QrCode, Receipt, Clock, ChevronRight, X } from 'lucide-react';
import { TopupGiftModal } from './modals/TopupGiftModal';
import { TopupPromptPayModal } from './modals/TopupPromptPayModal';
import { TopupSlipModal } from './modals/TopupSlipModal';
import { TopupHistoryModal } from './modals/TopupHistoryModal';

type ModalType = 'gift' | 'promptpay' | 'slip' | 'history' | null;

interface TopupPageProps {
  currentUser: { id: string; username: string; email: string } | null;
  onBalanceUpdate?: (newBalance: number) => void;
}

const METHOD_CARDS = [
  {
    id: 'gift' as ModalType,
    icon: Gift,
    title: 'TrueMoney Gift',
    desc: 'ซองของขวัญ อั่งเปา',
    badge: 'ปกติ',
    badgeColor: 'text-emerald-600 bg-emerald-50',
    iconBg: 'bg-slate-900',
    iconColor: 'text-white',
    imgSrc: 'https://img2.pic.in.th/download7a68ea330c321b38.png',
  },
  {
    id: 'promptpay' as ModalType,
    icon: QrCode,
    title: 'PromptPay QR',
    desc: 'สแกนจ่ายผ่าน QR Code',
    badge: 'แนะนำ',
    badgeColor: 'text-brand bg-brand-light',
    iconBg: 'bg-slate-900',
    iconColor: 'text-white',
    imgSrc: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXwvGngc1UzYjIpR9vQOUmqQoNLhwK30eptdsBu-CbpA&s',
  },
  {
    id: 'slip' as ModalType,
    icon: Receipt,
    title: 'SLIP CHECK',
    desc: 'แนบสลิปการโอนเงิน',
    badge: 'อัตโนมัติ',
    badgeColor: 'text-emerald-600 bg-emerald-50',
    iconBg: 'bg-slate-900',
    iconColor: 'text-white',
    imgSrc: 'https://img5.pic.in.th/file/secure-sv1/slip.webp',
  },
];

export function TopupPage({ currentUser, onBalanceUpdate }: TopupPageProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const openModal = (id: ModalType) => {
    if (!currentUser) {
      alert('กรุณาเข้าสู่ระบบก่อนเติมเงิน');
      return;
    }
    setActiveModal(id);
  };

  const closeModal = () => setActiveModal(null);

  const handleSuccess = (amount: number) => {
    onBalanceUpdate?.(amount);
    closeModal();
  };

  return (
    <div className="min-h-screen bg-bg-app px-4 py-8 font-sans">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-[14px] bg-brand/10 text-brand">
              <Wallet className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-text-main">เติมเงิน</h1>
          </div>
          <p className="text-text-muted text-sm ml-[52px]">เลือกช่องทางการเติมเงินที่ต้องการ</p>
        </div>

        {/* Method Cards */}
        <div className="flex flex-col gap-3 mb-6">
          {METHOD_CARDS.map((method) => (
            <button
              key={method.id}
              onClick={() => openModal(method.id)}
              className="group w-full flex items-center gap-4 p-4 rounded-[18px] bg-card-bg border border-border-subtle hover:border-brand/40 hover:shadow-[0_4px_20px_rgba(106,154,251,0.12)] transition-all duration-200 text-left"
            >
              {/* Icon */}
              <div
                className={`shrink-0 w-[60px] h-[60px] rounded-[14px] flex items-center justify-center overflow-hidden ${method.iconBg}`}
              >
                <img
                  src={method.imgSrc}
                  alt={method.title}
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-text-main text-base">{method.title}</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${method.badgeColor}`}>
                    {method.badge}
                  </span>
                </div>
                <p className="text-text-muted text-sm">{method.desc}</p>
              </div>

              {/* Arrow */}
              <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-brand group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ))}
        </div>

        {/* History Button */}
        <button
          onClick={() => openModal('history')}
          className="w-full flex items-center gap-3 p-4 rounded-[18px] border border-dashed border-border-subtle hover:border-brand/40 text-text-muted hover:text-brand transition-all duration-200 group"
        >
          <Clock className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium flex-1 text-left">ประวัติการเติมเงิน</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Modals */}
        {activeModal === 'gift' && (
          <TopupGiftModal onClose={closeModal} onSuccess={handleSuccess} />
        )}
        {activeModal === 'promptpay' && (
          <TopupPromptPayModal onClose={closeModal} onSuccess={handleSuccess} />
        )}
        {activeModal === 'slip' && (
          <TopupSlipModal onClose={closeModal} onSuccess={handleSuccess} />
        )}
        {activeModal === 'history' && (
          <TopupHistoryModal onClose={closeModal} />
        )}
      </div>
    </div>
  );
}
