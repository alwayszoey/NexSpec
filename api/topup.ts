/**
 * api/topup.ts — NexSpec Topup API Routes
 *
 * เพิ่มไฟล์นี้ใน api/index.ts:
 *   import topupRoutes from './topup.js';
 *   app.use('/api/topup', topupRoutes);
 *
 * ต้องการ ENV:
 *   WALLET_PHONE    — เบอร์โทรศัพท์ที่ใช้ดึง TrueMoney Gift
 *   PROMPTPAY_ID    — PromptPay ID (เบอร์โทร / เลขบัตรประชาชน)
 *   BANK_NAME       — ชื่อธนาคาร เช่น "กสิกรไทย"
 *   BANK_ACCOUNT    — เลขบัญชี
 *   BANK_FNAME      — ชื่อเจ้าของบัญชี
 *   BANK_LNAME      — นามสกุลเจ้าของบัญชี
 *
 * MongoDB Collections ที่ต้องสร้าง:
 *   topup_history   — { userId, username, method, amount, ref, imageHash, status, note, createdAt }
 *   topup_used_refs — { ref, imageHash, createdAt }   (ป้องกัน duplicate)
 *
 * Schema เพิ่มใน User.model.ts:
 *   credits: { type: Number, default: 0 }
 *   totalTopup: { type: Number, default: 0 }
 */

import express from 'express';
import crypto from 'crypto';
import multer from 'multer';
import { verifyAuth } from './_lib/auth.js';
import { connectDB } from './_lib/db.js';
import { User } from './_lib/User.model.js';

const router = express.Router();

// Multer — memory storage (ไม่บันทึกไฟล์ลงดิสก์)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('รองรับเฉพาะไฟล์รูปภาพ'));
  },
});

// ─────────────────────────────────────────────────────────────
// GET /api/topup/bank-info  — ข้อมูลบัญชีธนาคาร (public)
// ─────────────────────────────────────────────────────────────
router.get('/bank-info', (_req, res: any) => {
  const fname = process.env.BANK_FNAME || '';
  const lname = process.env.BANK_LNAME || '';

  res.json({
    bankName: process.env.BANK_NAME || 'ธนาคาร',
    accountNumber: process.env.BANK_ACCOUNT || '000-0-00000-0',
    recipientName: `${fname} ${lname}`.trim(),
    promptpayId: process.env.PROMPTPAY_ID || process.env.BANK_ACCOUNT || '',
  });
});

// ─────────────────────────────────────────────────────────────
// POST /api/topup/gift  — เติมเงินด้วย TrueMoney Gift
// ─────────────────────────────────────────────────────────────
router.post('/gift', verifyAuth, async (req: any, res: any) => {
  try {
    const { link } = req.body;
    if (!link?.trim()) {
      return res.status(400).json({ status: 'error', message: 'กรุณาใส่ลิงค์ซองของขวัญ' });
    }

    const db = await connectDB() as any;
    const userId = req.user.id || req.user._id;
    const user = await db.collection('users').findOne({ _id: userId });
    if (!user) return res.status(404).json({ status: 'error', message: 'ไม่พบผู้ใช้' });

    // เรียก TrueMoney Wallet API
    const walletRes = await fetch('https://api.xdnvc.store/api/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: new URLSearchParams({
        lnk: link,
        phone: process.env.WALLET_PHONE || '',
      }),
    });

    if (!walletRes.ok) {
      await logTopup(db, { userId, username: user.username, method: 'gift', amount: 0, ref: link, imageHash: '', status: 'failed', note: `API HTTP ${walletRes.status}` });
      return res.status(502).json({ status: 'error', message: 'ไม่สามารถเชื่อมต่อ TrueMoney API ได้' });
    }

    const walletData = await walletRes.json();

    if (walletData.status === 400) {
      await logTopup(db, { userId, username: user.username, method: 'gift', amount: 0, ref: link, imageHash: '', status: 'failed', note: walletData.message });
      return res.status(400).json({ status: 'error', message: walletData.message });
    }

    if (walletData.status === 200) {
      const amount: number = parseFloat(walletData.amount);

      // อัพเดต credits ผู้ใช้
      await db.collection('users').updateOne(
        { _id: userId },
        { $inc: { credits: amount, totalTopup: amount } }
      );

      await logTopup(db, { userId, username: user.username, method: 'gift', amount, ref: link, imageHash: '', status: 'success', note: '' });

      return res.json({
        status: 'success',
        message: `เติมเงินสำเร็จ ได้รับ ${amount} บาท`,
        amount,
      });
    }

    return res.status(400).json({ status: 'error', message: 'API ตอบกลับผิดพลาด' });
  } catch (err: any) {
    console.error('[topup/gift]', err);
    return res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาดภายในระบบ' });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/topup/slip  — ยืนยันด้วยสลิป (PromptPay / โอนเงิน)
// ─────────────────────────────────────────────────────────────
router.post('/slip', verifyAuth, upload.single('slip_image'), async (req: any, res: any) => {
  try {
    const amount = parseFloat(req.body.amount ?? 0);
    const ref = (req.body.ref ?? '').trim();
    const file = req.file;

    if (!file) return res.status(400).json({ status: 'error', message: 'กรุณาแนบไฟล์สลิป' });
    if (amount <= 0) return res.status(400).json({ status: 'error', message: 'จำนวนเงินไม่ถูกต้อง' });
    if (!ref) return res.status(400).json({ status: 'error', message: 'ไม่พบเลขที่อ้างอิง' });

    const db = await connectDB() as any;
    const userId = req.user.id || req.user._id;
    const user = await db.collection('users').findOne({ _id: userId });
    if (!user) return res.status(404).json({ status: 'error', message: 'ไม่พบผู้ใช้' });

    // Hash ไฟล์เพื่อตรวจซ้ำ
    const imageHash = crypto.createHash('md5').update(file.buffer).digest('hex');

    // ตรวจสอบ Ref/Hash ซ้ำ
    const duplicate = await db.collection('topup_used_refs').findOne({
      $or: [{ ref }, { imageHash }],
    });
    if (duplicate) {
      await logTopup(db, { userId, username: user.username, method: 'slip', amount, ref, imageHash, status: 'failed', note: 'Duplicate slip' });
      return res.status(400).json({ status: 'error', message: 'สลิปนี้ถูกใช้งานไปแล้ว!' });
    }

    // บันทึก ref + hash เพื่อกันซ้ำ
    await db.collection('topup_used_refs').insertOne({ ref, imageHash, createdAt: new Date() });

    // อัพเดต credits
    await db.collection('users').updateOne(
      { _id: userId },
      { $inc: { credits: amount, totalTopup: amount } }
    );

    await logTopup(db, { userId, username: user.username, method: 'slip', amount, ref, imageHash, status: 'success', note: 'Complete' });

    return res.json({
      status: 'success',
      message: `เติมเงินสำเร็จ ${amount.toFixed(2)} บาท`,
      amount,
      ref,
    });
  } catch (err: any) {
    console.error('[topup/slip]', err);
    return res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาดภายในระบบ' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/topup/history  — ประวัติการเติมเงิน
// ─────────────────────────────────────────────────────────────
router.get('/history', verifyAuth, async (req: any, res: any) => {
  try {
    const db = await connectDB() as any;
    const userId = req.user.id || req.user._id;

    const history = await db
      .collection('topup_history')
      .find({ userId: String(userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return res.json({ status: 'success', history });
  } catch (err: any) {
    console.error('[topup/history]', err);
    return res.status(500).json({ status: 'error', message: 'โหลดประวัติไม่สำเร็จ' });
  }
});

// ─────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────
async function logTopup(
  db: any,
  opts: {
    userId: any;
    username: string;
    method: string;
    amount: number;
    ref: string;
    imageHash: string;
    status: 'success' | 'failed';
    note: string;
  }
) {
  await db.collection('topup_history').insertOne({
    userId: String(opts.userId),
    username: opts.username,
    method: opts.method,
    amount: opts.amount,
    ref: opts.ref,
    imageHash: opts.imageHash,
    status: opts.status,
    note: opts.note,
    createdAt: new Date(),
  });
}

export default router;
