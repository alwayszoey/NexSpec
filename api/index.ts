import express from "express";
import crypto from "crypto";
import cors from "cors"; // 1. เพิ่ม CORS
import { connectDB } from "./_lib/db.js";
import authRoutes from "./_lib/auth.js";
import statsRoutes from "./_lib/stats.js";

const app = express();

// 2. ตั้งค่า CORS ให้ Dashboard ลับยิงเข้ามาได้
app.use(cors({
  origin: '*', 
  allowedHeaders: ['Content-Type', 'x-admin-token']
}));

app.use(express.json());

// Vercel Debug Middleware
app.use((req, res, next) => {
  console.log(`[Vercel Express Hook] URL: ${req.url}, Original: ${req.originalUrl}, Path: ${req.path}`);
  next();
});

let isDbConnected = false;

// Middleware to ensure DB is connected
app.use(async (req, res, next) => {
  if (isDbConnected) return next();
  try {
    await connectDB();
    isDbConnected = true;
    next();
  } catch (err: any) {
    console.error("[DB middleware error]", err);
    res.status(500).json({ success: false, error: "Database Connection Error", details: err.message || "Unknown database error" });
  }
});

// --- [ ส่วนที่เพิ่มใหม่: ADMIN API ] ---

// ด่านตรวจรหัสลับ
const isAdmin = (req: any, res: any, next: any) => {
  const adminToken = req.headers['x-admin-token'];
  if (adminToken && adminToken === process.env.ADMIN_TOKEN) {
    next();
  } else {
    res.status(403).json({ success: false, message: "Forbidden: Invalid Admin Token" });
  }
};

// ดึงรายชื่อ User
app.get('/api/admin/users', isAdmin, async (req: any, res: any) => {
  try {
    const dbInstance: any = await connectDB();
    const db = dbInstance?.db || dbInstance;
    const users = await db.collection("users").find({}).sort({ createdAt: -1 }).toArray();
    res.json({ success: true, users });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ดึง Resources ทั้งหมด
app.get('/api/admin/resources', isAdmin, async (req: any, res: any) => {
  try {
    const dbInstance: any = await connectDB();
    const db = dbInstance?.db || dbInstance;
    const resources = await db.collection("resources").find({}).sort({ createdAt: -1 }).toArray();
    res.json({ success: true, resources });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// สร้าง Resource ใหม่
app.post('/api/admin/resources', isAdmin, async (req: any, res: any) => {
  try {
    const data = req.body;
    const dbInstance: any = await connectDB();
    const db = dbInstance?.db || dbInstance;
    await db.collection("resources").insertOne({ ...data, createdAt: new Date() });
    res.json({ success: true, message: "Created successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// อัปเดต Resource เดิม (ตาม ID)
app.patch('/api/admin/resources/:id', isAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const dbInstance: any = await connectDB();
    const db = dbInstance?.db || dbInstance;
    // หมายเหตุ: ถ้า id เป็น ObjectId ต้องใช้ new ObjectId(id)
    await db.collection("resources").updateOne({ _id: id }, { $set: req.body });
    res.json({ success: true, message: "Updated successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// --- [ จบส่วน ADMIN API ] ---

// Mount original routes
app.use("/api/auth", authRoutes);
app.use("/api/stats", statsRoutes);

// Stateless URL signer using HMAC (Original)
function generateSignedToken(url: string, ip: string) {
  const expires = Date.now() + 5 * 60 * 1000;
  const payload = JSON.stringify({ url, exp: expires });
  const payloadB64 = Buffer.from(payload).toString('base64url');
  const signature = crypto.createHmac('sha256', process.env.RECAPTCHA_SECRET_KEY || 'default_secret_key_12345')
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${signature}`;
}

function verifySignedToken(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payloadB64, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', process.env.RECAPTCHA_SECRET_KEY || 'default_secret_key_12345')
      .update(payloadB64)
      .digest('base64url');
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    if (Date.now() > payload.exp) return null;
    return payload.url;
  } catch (e) { return null; }
}

const usedTokens = new Set<string>();

function botDetection(req: express.Request) {
  const userAgent = req.headers['user-agent'];
  if (!userAgent || userAgent.trim() === '' || userAgent.toLowerCase().includes('curl') || userAgent.toLowerCase().includes('bot')) {
    return false;
  }
  return true;
}

// API Routes (Original)
app.post("/api/verify-captcha", async (req, res) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  if (!botDetection(req)) {
      res.status(403).json({ success: false, error: 'Request blocked by bot detection' });
      return;
  }
  const origin = req.get('origin') || '';
  if (process.env.NODE_ENV === "production" && origin) {
     if (!origin.includes('localhost') && !origin.includes('vercel.app') && !origin.includes(process.env.APP_URL || '')) {
         res.status(403).json({ success: false, error: 'Origin validation failed' });
         return;
     }
  }
  const { token, targetUrl } = req.body;
  if (!token || !targetUrl) {
      res.status(400).json({ success: false, error: 'Missing token or target url' });
      return;
  }
  if (usedTokens.has(token)) {
      res.status(400).json({ success: false, error: 'Captcha token reused' });
      return;
  }
  usedTokens.add(token);
  try {
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (recaptchaSecret) {
      const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${recaptchaSecret}&response=${token}&remoteip=${ip}`
      });
      const data = await response.json();
      if (!data.success) {
        res.status(400).json({ success: false, error: 'Captcha verification failed' });
        return;
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
    return;
  }
  const signedKey = generateSignedToken(targetUrl, ip);
  res.json({ success: true, key: signedKey, expiresIn: 300 });
});

app.get("/api/download/:key", (req, res) => {
  const { key } = req.params;
  const targetUrl = verifySignedToken(key);
  if (!targetUrl) {
      res.status(403).send('Download key is invalid or has expired');
      return;
  }
  res.redirect(302, targetUrl);
});

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Global Express Error:", err);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

console.log("[api/index.ts] File executed, Express app created and exported.");

export default app;
