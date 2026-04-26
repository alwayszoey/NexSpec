import React, { useState, useRef, useCallback } from 'react';
import { QrCode, CloudUpload, CheckCircle, XCircle, Loader2, ImageIcon } from 'lucide-react';
import { ModalShell } from './ModalShell';

interface TopupPromptPayModalProps {
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

type Step = 'amount' | 'qr' | 'verify' | 'done';
type OcrStatus = 'idle' | 'scanning' | 'done' | 'error';

interface ExtractedData {
  amount: number;
  ref: string;
  nameMatched: boolean;
  file: File | null;
}

// PromptPay ID จากเซิร์ฟเวอร์ — จะ fetch จาก /api/topup/bank-info
const DEFAULT_PROMPTPAY = '000-000-0000';

export function TopupPromptPayModal({ onClose, onSuccess }: TopupPromptPayModalProps) {
  const [step, setStep] = useState<Step>('amount');
  const [inputAmount, setInputAmount] = useState('');
  const [qrSrc, setQrSrc] = useState('');
  const [promptpayId, setPromptpayId] = useState(DEFAULT_PROMPTPAY);
  const [recipientName, setRecipientName] = useState('');

  const [ocrStatus, setOcrStatus] = useState<OcrStatus>('idle');
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<ExtractedData>({ amount: 0, ref: '', nameMatched: false, file: null });

  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Fetch bank info on mount
  React.useEffect(() => {
    fetch('/api/topup/bank-info')
      .then(r => r.json())
      .then(d => {
        if (d.promptpayId) setPromptpayId(d.promptpayId);
        if (d.recipientName) setRecipientName(d.recipientName);
      })
      .catch(() => {});
  }, []);

  const generateQR = () => {
    const amount = parseFloat(inputAmount);
    if (!amount || amount <= 0) return;
    const rawId = promptpayId.replace(/[^0-9]/g, '');
    const url = `https://promptpay.io/${rawId}/${amount}`;
    setQrSrc(url);
    setStep('qr');
  };

  const processSlip = useCallback(async (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setSlipPreview(imageUrl);
    setOcrStatus('scanning');
    setExtracted({ amount: 0, ref: '', nameMatched: false, file });

    try {
      // Dynamic import Tesseract
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('tha+eng');
      const result = await worker.recognize(imageUrl);
      const textRaw = result.data.text;

      // Extract amount
      const textForAmount = textRaw.replace(/[^0-9.]/g, ' ');
      const amountMatches = textForAmount.match(/(\d+\.\d{2})/g);
      let amount = 0;
      if (amountMatches) {
        amount = Math.max(...amountMatches.map((m) => parseFloat(m)));
      }

      // Extract Reference ID
      const textClean = textRaw.replace(/[^a-zA-Z0-9\u0E00-\u0E7F.]/g, '');
      const refMatches = textClean.match(/[0-9A-Z]{10,25}/g);
      let ref = '';
      if (refMatches) {
        ref = refMatches.reduce((a, b) => (a.length > b.length ? a : b), '');
      }

      // Name check
      const cleanExpected = recipientName.replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, '');
      const checkText = textRaw.replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, '');
      const nameMatched = cleanExpected ? checkText.includes(cleanExpected) : true;

      await worker.terminate();

      setExtracted({ amount, ref, nameMatched, file });
      setOcrStatus('done');
    } catch {
      setOcrStatus('error');
    }
  }, [recipientName]);

  const handleFileChange = (file: File) => {
    setSubmitStatus('idle');
    processSlip(file);
  };

  const handleConfirm = async () => {
    if (!extracted.file || extracted.amount <= 0 || !extracted.ref) return;
    setSubmitStatus('loading');

    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const form = new FormData();
      form.append('amount', String(extracted.amount));
      form.append('ref', extracted.ref);
      form.append('slip_image', extracted.file);

      const res = await fetch('/api/topup/slip', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setSubmitStatus('success');
        setSubmitMessage(data.message);
        setStep('done');
        setTimeout(() => onSuccess(extracted.amount), 1800);
      } else {
        setSubmitStatus('error');
        setSubmitMessage(data.message || 'ไม่สามารถเติมเงินได้');
      }
    } catch {
      setSubmitStatus('error');
      setSubmitMessage('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  };

  // Drag & drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) handleFileChange(e.dataTransfer.files[0]);
  };

  return (
    <ModalShell
      title="PromptPay QR"
      subtitle="สแกน QR Code แล้วแนบสลิปเพื่อยืนยัน"
      icon={<QrCode className="w-5 h-5" />}
      onClose={onClose}
    >
      <div className="space-y-4">

        {/* STEP 1: Enter Amount */}
        {step === 'amount' && (
          <>
            <div className="p-4 rounded-[14px] bg-slate-50 dark:bg-slate-900/50 border border-border-subtle space-y-3">
              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">PromptPay ID</label>
                <p className="font-bold text-text-main text-sm">{promptpayId}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-text-muted block mb-1.5">จำนวนเงินที่ต้องการเติม (บาท)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-[12px] border border-border-subtle bg-white dark:bg-slate-800 text-text-main text-xl font-bold text-center focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                />
              </div>
            </div>
            <p className="text-xs text-amber-500 text-center font-medium">* ตรวจสอบชื่อผู้รับโอนให้ถูกต้องก่อนโอน</p>
            <button
              onClick={generateQR}
              disabled={!inputAmount || parseFloat(inputAmount) <= 0}
              className="w-full py-3 rounded-[14px] bg-brand hover:bg-brand-hover text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              <QrCode className="w-4 h-4" /> สร้าง QR Code
            </button>
          </>
        )}

        {/* STEP 2: Show QR + Upload Slip */}
        {(step === 'qr' || step === 'verify') && (
          <>
            {/* QR Display */}
            <div className="flex flex-col items-center p-4 rounded-[16px] bg-slate-50 dark:bg-slate-900/50 border border-border-subtle">
              <p className="text-sm font-medium text-text-muted mb-3">สแกนเพื่อจ่าย</p>
              <img
                src={qrSrc}
                alt="PromptPay QR"
                className="w-44 h-44 rounded-[12px] object-contain bg-white p-2 shadow-sm mb-3"
              />
              <p className="text-2xl font-bold text-emerald-600">
                {parseFloat(inputAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ฿
              </p>
              {recipientName && (
                <p className="text-xs text-text-muted mt-1">ชื่อบัญชี: {recipientName}</p>
              )}
            </div>

            {/* Upload Zone */}
            <div
              ref={dropRef}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="relative cursor-pointer rounded-[16px] border-2 border-dashed border-border-subtle hover:border-brand/50 hover:bg-brand/5 transition-all p-5 text-center"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              />
              {slipPreview ? (
                <div>
                  <img src={slipPreview} className="max-h-40 mx-auto rounded-[10px] object-contain mb-2" alt="Slip preview" />
                  <p className="text-xs text-text-muted">คลิกเพื่อเปลี่ยนรูปสลิป</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <CloudUpload className="w-8 h-8 text-brand/60" />
                  <p className="font-semibold text-sm text-text-main">แนบสลิปการโอนเงิน</p>
                  <p className="text-xs text-text-muted">JPG, PNG ขนาดไม่เกิน 5MB</p>
                </div>
              )}
            </div>

            {/* OCR Result */}
            {ocrStatus === 'scanning' && (
              <div className="flex items-center justify-center gap-2 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-brand" />
                <p className="text-sm text-text-muted">กำลังอ่านข้อมูลสลิป...</p>
              </div>
            )}

            {ocrStatus === 'done' && (
              <div className="rounded-[14px] border border-border-subtle p-4 space-y-3">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wide">ผลการตรวจสอบสลิป</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-900/50 text-center">
                    <p className="text-xs text-text-muted mb-1">ยอดเงิน</p>
                    <p className="font-bold text-text-main text-sm">
                      {extracted.amount > 0 ? `${extracted.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ฿` : 'ค้นหาไม่พบ'}
                    </p>
                  </div>
                  <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-900/50 text-center">
                    <p className="text-xs text-text-muted mb-1">สถานะผู้รับ</p>
                    {extracted.nameMatched ? (
                      <span className="flex items-center justify-center gap-1 text-emerald-600 text-sm font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" /> ถูกต้อง
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1 text-red-500 text-sm font-semibold">
                        <XCircle className="w-3.5 h-3.5" /> ไม่พบ
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-900/50">
                  <p className="text-xs text-text-muted mb-0.5">Ref ID</p>
                  <p className="text-xs font-mono text-text-main break-all">{extracted.ref || 'ค้นหาไม่พบ'}</p>
                </div>
              </div>
            )}

            {ocrStatus === 'error' && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-[12px] bg-red-50 dark:bg-red-950/30 border border-red-100">
                <XCircle className="w-4 h-4 text-red-500" />
                <p className="text-sm text-red-600">เกิดข้อผิดพลาดในการอ่านสลิป</p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-[12px] bg-red-50 dark:bg-red-950/30 border border-red-100">
                <XCircle className="w-4 h-4 text-red-500" />
                <p className="text-sm text-red-600">{submitMessage}</p>
              </div>
            )}

            {/* Confirm Button */}
            <button
              onClick={handleConfirm}
              disabled={!extracted.nameMatched || extracted.amount <= 0 || !extracted.ref || submitStatus === 'loading'}
              className="w-full py-3 rounded-[14px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
            >
              {submitStatus === 'loading' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> กำลังตรวจสอบ...</>
              ) : (
                <><CheckCircle className="w-4 h-4" /> ยืนยันการเติมเงิน</>
              )}
            </button>
          </>
        )}

        {/* STEP DONE */}
        {step === 'done' && (
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="font-bold text-text-main text-lg">เติมเงินสำเร็จ! 🎉</p>
            <p className="text-text-muted text-sm">{submitMessage}</p>
          </div>
        )}
      </div>
    </ModalShell>
  );
}
