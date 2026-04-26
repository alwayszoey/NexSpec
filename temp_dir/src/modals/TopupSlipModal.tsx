import React, { useState, useRef, useCallback } from 'react';
import { Receipt, CloudUpload, CheckCircle, XCircle, Loader2, Copy } from 'lucide-react';
import { ModalShell } from './ModalShell';

interface TopupSlipModalProps {
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

type OcrStatus = 'idle' | 'scanning' | 'done' | 'error';

interface BankInfo {
  bankName: string;
  accountNumber: string;
  recipientName: string;
}

interface ExtractedData {
  amount: number;
  ref: string;
  nameMatched: boolean;
  file: File | null;
}

export function TopupSlipModal({ onClose, onSuccess }: TopupSlipModalProps) {
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    bankName: '...',
    accountNumber: '...',
    recipientName: '',
  });
  const [copied, setCopied] = useState(false);

  const [ocrStatus, setOcrStatus] = useState<OcrStatus>('idle');
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<ExtractedData>({ amount: 0, ref: '', nameMatched: false, file: null });

  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [done, setDone] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    fetch('/api/topup/bank-info')
      .then(r => r.json())
      .then(d => {
        setBankInfo({
          bankName: d.bankName || 'ธนาคาร',
          accountNumber: d.accountNumber || '000-0-00000-0',
          recipientName: d.recipientName || '',
        });
      })
      .catch(() => {});
  }, []);

  const copyAccountNumber = () => {
    const raw = bankInfo.accountNumber.replace(/-/g, '');
    navigator.clipboard.writeText(raw).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const processSlip = useCallback(async (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setSlipPreview(imageUrl);
    setOcrStatus('scanning');
    setExtracted({ amount: 0, ref: '', nameMatched: false, file });
    setSubmitStatus('idle');

    try {
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

      // Extract ref
      const textClean = textRaw.replace(/[^a-zA-Z0-9\u0E00-\u0E7F.]/g, '');
      const refMatches = textClean.match(/[0-9A-Z]{10,25}/g);
      let ref = '';
      if (refMatches) {
        ref = refMatches.reduce((a, b) => (a.length > b.length ? a : b), '');
      }

      // Name check
      const cleanExpected = bankInfo.recipientName.replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, '');
      const checkText = textRaw.replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, '');
      const nameMatched = cleanExpected ? checkText.includes(cleanExpected) : true;

      await worker.terminate();
      setExtracted({ amount, ref, nameMatched, file });
      setOcrStatus('done');
    } catch {
      setOcrStatus('error');
    }
  }, [bankInfo.recipientName]);

  const handleFileChange = (file: File) => processSlip(file);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) handleFileChange(e.dataTransfer.files[0]);
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
        setDone(true);
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

  if (done) {
    return (
      <ModalShell title="SLIP CHECK" icon={<Receipt className="w-5 h-5" />} onClose={onClose}>
        <div className="flex flex-col items-center py-6 gap-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="font-bold text-text-main text-lg">เติมเงินสำเร็จ! 🎉</p>
          <p className="text-text-muted text-sm">{submitMessage}</p>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell
      title="SLIP CHECK"
      subtitle="ระบบตรวจสอบสลิปอัตโนมัติ"
      icon={<Receipt className="w-5 h-5" />}
      onClose={onClose}
    >
      <div className="space-y-4">
        {/* Warning */}
        <p className="text-xs text-amber-500 font-medium">
          ⚠️ หลีกเลี่ยงการโอนเงินช่วง 23:30 – 00:30 น. (ระบบธนาคารปิดปรับปรุง)
        </p>

        {/* Bank Card */}
        <div className="p-4 rounded-[16px] bg-slate-50 dark:bg-slate-900/50 border border-border-subtle text-center space-y-2">
          <p className="font-bold text-text-main">{bankInfo.bankName}</p>
          <p className="text-2xl font-bold text-brand tracking-wide">{bankInfo.accountNumber}</p>
          {bankInfo.recipientName && (
            <div className="p-2.5 bg-white dark:bg-slate-800 rounded-[10px] border border-border-subtle">
              <p className="text-xs text-text-muted mb-0.5">ชื่อบัญชีผู้รับเงิน</p>
              <p className="font-bold text-text-main text-sm">{bankInfo.recipientName}</p>
            </div>
          )}
          <button
            onClick={copyAccountNumber}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-700 transition-colors"
          >
            <Copy className="w-3 h-3" />
            {copied ? 'คัดลอกแล้ว ✓' : 'คัดลอกเลขบัญชี'}
          </button>
        </div>

        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer rounded-[16px] border-2 border-dashed border-border-subtle hover:border-brand/50 hover:bg-brand/5 transition-all p-5 text-center"
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
              <img src={slipPreview} className="max-h-48 mx-auto rounded-[10px] object-contain mb-2" alt="Slip preview" />
              <p className="text-xs text-text-muted">คลิกเพื่อเปลี่ยนรูปสลิป</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <CloudUpload className="w-8 h-8 text-brand/60" />
              <p className="font-semibold text-sm text-text-main">แนบไฟล์สลิปการโอนเงิน</p>
              <p className="text-xs text-text-muted">รองรับ JPG, PNG (ไม่เกิน 5MB)</p>
            </div>
          )}
        </div>

        {/* OCR Status */}
        {ocrStatus === 'scanning' && (
          <div className="flex items-center justify-center gap-2 py-2">
            <Loader2 className="w-4 h-4 animate-spin text-brand" />
            <p className="text-sm text-text-muted">กำลังอ่านข้อมูลสลิปและตรวจสอบชื่อ...</p>
          </div>
        )}

        {ocrStatus === 'done' && (
          <div className="rounded-[14px] border border-border-subtle p-4 space-y-3">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wide">ตรวจสอบข้อมูลสลิป</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-900/50 text-center">
                <p className="text-xs text-text-muted mb-1">จำนวนเงิน</p>
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
                    <XCircle className="w-3.5 h-3.5" /> ไม่พบชื่อ
                  </span>
                )}
              </div>
            </div>
            <div className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-900/50">
              <p className="text-xs text-text-muted mb-0.5">เลขอ้างอิงสลิป</p>
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

        {/* Confirm */}
        <button
          onClick={handleConfirm}
          disabled={!extracted.nameMatched || extracted.amount <= 0 || !extracted.ref || submitStatus === 'loading'}
          className="w-full py-3 rounded-[14px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition-all text-sm"
        >
          {submitStatus === 'loading' ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> กำลังตรวจสอบสลิป...</>
          ) : (
            <><CheckCircle className="w-4 h-4" /> ยืนยันและเติมเงิน</>
          )}
        </button>
      </div>
    </ModalShell>
  );
}
