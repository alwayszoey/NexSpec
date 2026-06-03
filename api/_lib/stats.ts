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
    let globalStats = await Stat.findOne({ name: 'global' });
    if (!globalStats) {
    // @ts-ignore
      globalStats = await Stat.create({ name: 'global', views: 0, downloads: 0 });
    }
    
    // Fetch all item stats
    const allItemStats = await Stat.find({ name: { $regex: /^item_/ } });
    const itemStats = allItemStats.reduce((acc: any, stat: any) => {
      const itemId = stat.name.replace('item_', '');
      acc[itemId] = { views: stat.views, downloads: stat.downloads };
      return acc;
    }, {});

    res.json({
      success: true,
      users: userCount,
      views: globalStats.views,
      downloads: globalStats.downloads,
      itemStats
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// Increment views
router.post('/view', async (req, res) => {
  try {
    const { itemId } = req.body || {};
    
    // Increment global 
    // @ts-ignore
    const globalStats = await Stat.findOneAndUpdate(
      { name: 'global' },
      { $inc: { views: 1 } },
      { new: true, upsert: true }
    );
    
    let itemViews = 0;
    if (itemId) {
      const itemStat = await Stat.findOneAndUpdate(
        { name: `item_${itemId}` },
        { $inc: { views: 1 } },
        { new: true, upsert: true }
      );
      itemViews = itemStat.views;
    }

    res.json({ success: true, views: globalStats.views, itemViews });
  } catch (error) {
    console.error("Error incrementing view:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// Increment downloads
router.post('/download', async (req, res) => {
  try {
    const { itemId } = req.body || {};

    // @ts-ignore
    const globalStats = await Stat.findOneAndUpdate(
      { name: 'global' },
      { $inc: { downloads: 1 } },
      { new: true, upsert: true }
    );
    
    let itemDownloads = 0;
    if (itemId) {
      const itemStat = await Stat.findOneAndUpdate(
        { name: `item_${itemId}` },
        { $inc: { downloads: 1 } },
        { new: true, upsert: true }
      );
      itemDownloads = itemStat.downloads;
    }

    res.json({ success: true, downloads: globalStats.downloads, itemDownloads });
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
