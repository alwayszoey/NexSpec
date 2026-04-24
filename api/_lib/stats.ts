import express from 'express';
import Stat from './Stat.model.js';
import { User } from './User.model.js';
import { connectDB } from './db.js';

const router = express.Router();

// Get real-time stats
router.get('/', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    // @ts-ignore
    let stats = await Stat.findOne({ name: 'global' });
    if (!stats) {
    // @ts-ignore
      stats = await Stat.create({ name: 'global', views: 0, downloads: 0 });
    }
    res.json({
      success: true,
      users: userCount,
      views: stats.views,
      downloads: stats.downloads
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// Increment views
router.post('/view', async (req, res) => {
  try {
    // @ts-ignore
    const stats = await Stat.findOneAndUpdate(
      { name: 'global' },
      { $inc: { views: 1 } },
      { new: true, upsert: true }
    );
    res.json({ success: true, views: stats.views });
  } catch (error) {
    console.error("Error incrementing view:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// Increment downloads
router.post('/download', async (req, res) => {
  try {
    // @ts-ignore
    const stats = await Stat.findOneAndUpdate(
      { name: 'global' },
      { $inc: { downloads: 1 } },
      { new: true, upsert: true }
    );
    res.json({ success: true, downloads: stats.downloads });
  } catch (error) {
    console.error("Error incrementing download:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// Reset downloads to 0
router.post('/reset', async (req, res) => {
  try {
    // @ts-ignore
    const stats = await Stat.findOneAndUpdate(
      { name: 'global' },
      { $set: { downloads: 0 } },
      { new: true, upsert: true }
    );
    res.json({ success: true, downloads: stats?.downloads || 0 });
  } catch (error) {
    console.error("Error resetting download:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

export default router;
