import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "./User.model.js";

const router = express.Router();

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "default_jwt_secret_dev";

// Middleware to verify token for protected routes
export const verifyAuth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// 1. REGISTER =========================================
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, recaptchaToken } = req.body;
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

    if (!username || !email || !password || !recaptchaToken) {
      return res.status(400).json({ error: "Missing required fields or reCAPTCHA" });
    }

    // Verify reCAPTCHA
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (recaptchaSecret) {
      const gRes = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${recaptchaSecret}&response=${recaptchaToken}&remoteip=${ip}`
      });
      const gData = await gRes.json();
      if (!gData.success) {
        return res.status(400).json({ error: "Bot verification failed" });
      }
    }

    // Check if user exists
    const existingUser = await (User as any).findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await (User as any).create({
      username,
      email,
      password: hashedPassword,
      provider: "credentials"
    });

    res.json({ success: true, message: "Registered successfully" });
  } catch (error: any) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 2. LOGIN ============================================
router.post("/login", async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing Email or Password" });
    }

    const user = await (User as any).findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.provider && user.provider !== "credentials" && user.provider !== "multiple") {
      return res.status(400).json({ error: `Account uses ${user.provider} login` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    // Create JWT token
    const expiresIn = rememberMe ? "30d" : "1d";
    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn }
    );

    res.json({
      success: true,
      token,
      user: { id: user._id, username: user.username, email: user.email, avatarUrl: user.avatarUrl }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 3. GET CURRENT USER =================================
router.get("/me", verifyAuth, async (req: any, res) => {
  try {
    const user = await (User as any).findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 3.5 UPDATE CURRENT USER =============================
router.put("/me", verifyAuth, async (req: any, res) => {
  try {
    const { username, avatarUrl } = req.body;
    const user = await (User as any).findByIdAndUpdate(
      req.user.id,
      { username, avatarUrl },
      { new: true, runValidators: true }
    ).select("-password");
    
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    console.error("Update User Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 4. SOCIAL OAUTH & CALLBACKS

import passport from "./passport.js";

// --- Google ---
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

router.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/?error=GoogleAuthFailed" }), (req: any, res) => {
  const user = req.user;
  const token = jwt.sign(
    { id: user._id, email: user.email, username: user.username },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Use a popup callback HTML to send the token back via postMessage then close
  res.send(`
    <html>
      <head><title>Authentication Successful</title></head>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', token: '${token}', user: ${JSON.stringify({ id: user._id, username: user.username, email: user.email })} }, '*');
            window.close();
          } else {
            // Fallback if not opened in popup
            window.location.href = '/?token=${token}';
          }
        </script>
        <p>Authentication successful! Please wait...</p>
      </body>
    </html>
  `);
});

// --- Discord ---
router.get("/discord", passport.authenticate("discord", { session: false }));

router.get("/discord/callback", passport.authenticate("discord", { session: false, failureRedirect: "/?error=DiscordAuthFailed" }), (req: any, res) => {
  const user = req.user;
  const token = jwt.sign(
    { id: user._id, email: user.email, username: user.username },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.send(`
    <html>
      <head><title>Authentication Successful</title></head>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', token: '${token}', user: ${JSON.stringify({ id: user._id, username: user.username, email: user.email })} }, '*');
            window.close();
          } else {
            window.location.href = '/?token=${token}';
          }
        </script>
        <p>Authentication successful! Please wait...</p>
      </body>
    </html>
  `);
});

export default router;
