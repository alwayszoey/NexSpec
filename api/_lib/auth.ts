import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "./User.model";

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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing Email or Password" });
    }

    const user = await (User as any).findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.provider !== "credentials") {
      return res.status(400).json({ error: `Account uses ${user.provider} login` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: { id: user._id, username: user.username, email: user.email }
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

// 4. SOCIAL OAUTH (Stubs for Google/Discord mapping if needed)
router.get("/google", (req, res) => {
  res.status(501).send("Google OAuth Not Fully Documented. Can implement with custom frontend flow or passport-google-oauth20.");
});

router.get("/discord", (req, res) => {
  res.status(501).send("Discord OAuth Not Fully Documented.");
});

export default router;
