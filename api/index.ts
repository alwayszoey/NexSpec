import express from "express";
import crypto from "crypto";
import { connectDB } from "./_lib/db.js";
import authRoutes from "./_lib/auth.js";
import statsRoutes from "./_lib/stats.js";

const app = express();

app.use(express.json());

// Vercel Debug Middleware
app.use((req, res, next) => {
  console.log(`[Vercel Express Hook] URL: ${req.url}, Original: ${req.originalUrl}, Path: ${req.path}`);
  next();
});

let isDbConnected = false;

// Middleware to ensure DB is connected before handling any requests
app.use(async (req, res, next) => {
  if (isDbConnected) {
    return next();
  }
  
  try {
    await connectDB();
    isDbConnected = true;
    next();
  } catch (err: any) {
    console.error("[DB middleware error]", err);
    res.status(500).json({ success: false, error: "Database Connection Error", details: err.message || "Unknown database error" });
  }
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/stats", statsRoutes);

// Stateless URL signer using HMAC
function generateSignedToken(url: string, ip: string) {
  const expires = Date.now() + 5 * 60 * 1000; // 5 mins
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
    if (Date.now() > payload.exp) return null; // expired
    
    return payload.url;
  } catch (e) {
    return null;
  }
}

// Memory blocklist just to prevent basic replays in long-running instances
// (On Vercel, this is best-effort since it resets on cold start)
const usedTokens = new Set<string>();

// Ensure simple bot detection
function botDetection(req: express.Request) {
  const userAgent = req.headers['user-agent'];
  if (!userAgent || userAgent.trim() === '' || userAgent.toLowerCase().includes('curl') || userAgent.toLowerCase().includes('bot')) {
    return false;
  }
  return true;
}

// API Routes
app.post("/api/verify-captcha", async (req, res) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  // 1. Bot detection
  if (!botDetection(req)) {
      res.status(403).json({ success: false, error: 'Request blocked by bot detection' });
      return;
  }

  // 2. Origin validation (Relaxed for iFrame previews and official Vercel domain)
  const origin = req.get('origin') || '';
  const referer = req.get('referer') || '';
  
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

  // 3. Anti-replay protection (Best-effort on serverless)
  if (usedTokens.has(token)) {
      res.status(400).json({ success: false, error: 'Captcha token reused' });
      return;
  }
  usedTokens.add(token);

  // 4. Google reCAPTCHA Verification
  try {
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (!recaptchaSecret) {
      console.warn("RECAPTCHA_SECRET_KEY is missing, skipping actual verification");
    } else {
      const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${recaptchaSecret}&response=${token}&remoteip=${ip}`
      });
      const data = await response.json();
      
      if (!data.success) {
        res.status(400).json({ success: false, error: 'Captcha verification failed', details: data['error-codes'] });
        return;
      }
    }
  } catch (error) {
    console.error("Recaptcha verification error:", error);
    res.status(500).json({ success: false, error: 'Internal server error during captcha verification' });
    return;
  }

  // 5. Generate a stateless signed JWT-like key instead of memory store
  const signedKey = generateSignedToken(targetUrl, ip);

  res.json({ 
    success: true, 
    key: signedKey, 
    expiresIn: 300 // 5 minutes
  });
});

app.get("/api/download/:key", (req, res) => {
  const { key } = req.params;

  const targetUrl = verifySignedToken(key);

  if (!targetUrl) {
      res.status(403).send('Download key is invalid or has expired');
      return;
  }

  // Let's redirect to the actual URL
  res.redirect(302, targetUrl);
});

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Global Express Error:", err);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

console.log("[api/index.ts] File executed, Express app created and exported.");

export default app;
