import { isDbConnected } from "../config/db.js";
import { Stat } from "../models/Stat.model.js";
import { User } from "../models/User.model.js";
import { Resource } from "../models/Resource.model.js";
import { MemoryCacheService } from "./cache.service.js";

const STATS_CACHE_KEY = "global_dashboard_stats";

// High-speed fallback in-memory state
const memoryStats = {
  views: 0,
  downloads: 0,
  users: 0,
  itemDownloads: {} as Record<string, number>,
  itemViews: {} as Record<string, number>,
};

export class StatsService {
  /**
   * Retrieves full aggregated statistics for the dashboard with caching
   */
  static async getStats() {
    // 1. Check in-memory cache first (< 1ms latency)
    const cached = MemoryCacheService.get<any>(STATS_CACHE_KEY);
    if (cached) {
      return cached;
    }

    const months = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
    ];
    const currentMonthIndex = new Date().getMonth();

    if (isDbConnected()) {
      try {
        const userCount = await User.countDocuments();
        let stats = await Stat.findOne({ name: "global" });
        if (!stats) {
          stats = await Stat.create({ name: "global", views: 0, downloads: 0 });
        }

        // Fetch all item-specific stats
        const allItemDownloadStats = await Stat.find({ name: { $regex: /^item_(?!view_)/ } });
        const allItemViewStats = await Stat.find({ name: { $regex: /^item_view_/ } });

        const itemDownloads: Record<string, number> = {};
        const itemViews: Record<string, number> = {};
        let totalDownloads = 0;

        allItemDownloadStats.forEach((st) => {
          const itemId = st.name.replace("item_", "");
          itemDownloads[itemId] = st.downloads || 0;
          totalDownloads += st.downloads || 0;
        });

        allItemViewStats.forEach((st) => {
          const itemId = st.name.replace("item_view_", "");
          itemViews[itemId] = st.views || 0;
        });

        // Also check Resource collection directly to ensure complete sync
        const dbResources = await Resource.find({}, "itemId views downloads salesCount").lean();
        dbResources.forEach((resItem) => {
          const rId = resItem.itemId;
          if (rId) {
            if (typeof resItem.downloads === "number" && resItem.downloads > (itemDownloads[rId] || 0)) {
              itemDownloads[rId] = resItem.downloads;
            }
            if (typeof resItem.views === "number" && resItem.views > (itemViews[rId] || 0)) {
              itemViews[rId] = resItem.views;
            }
          }
        });

        // Aggregate user growth by month
        const currentYear = new Date().getFullYear();
        const userGrowth = await User.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
                $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`),
              },
            },
          },
          {
            $group: {
              _id: { $month: "$createdAt" },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]);

        let cumulative = 0;
        const trustData = [];
        const maxMonth = Math.max(currentMonthIndex, 5);

        for (let i = 0; i <= maxMonth; i++) {
          const monthIndex = i + 1;
          const monthData = userGrowth.find((m: any) => m._id === monthIndex);
          if (monthData) cumulative += monthData.count;

          trustData.push({
            name: months[i],
            users: cumulative,
          });
        }

        const performanceData = [
          { name: "ความเสถียร", score: 99 },
          { name: "ความปลอดภัย", score: 98 },
          { name: "ความคุ้มค่า", score: 100 },
          { name: "การอัปเดต", score: 95 },
        ];

        const payload = {
          success: true,
          users: userCount,
          views: stats.views || 0,
          downloads: totalDownloads || stats.downloads || 0,
          itemDownloads,
          itemViews,
          trustData,
          performanceData,
        };

        // Cache for 15 seconds
        MemoryCacheService.set(STATS_CACHE_KEY, payload, 15000);
        return payload;
      } catch (err) {
        console.error("[StatsService] Error querying MongoDB stats, falling back to memory:", err);
      }
    }

    // In-Memory Mode
    const trustData = [];
    const maxMonth = Math.max(currentMonthIndex, 5);
    let cumulative = 0;
    for (let i = 0; i <= maxMonth; i++) {
      cumulative += 1;
      trustData.push({
        name: months[i],
        users: cumulative,
      });
    }

    const performanceData = [
      { name: "ความเสถียร", score: 99 },
      { name: "ความปลอดภัย", score: 98 },
      { name: "ความคุ้มค่า", score: 100 },
      { name: "การอัปเดต", score: 95 },
    ];

    const fallbackPayload = {
      success: true,
      users: memoryStats.users,
      views: memoryStats.views,
      downloads: memoryStats.downloads,
      itemDownloads: memoryStats.itemDownloads,
      itemViews: memoryStats.itemViews,
      trustData,
      performanceData,
    };

    MemoryCacheService.set(STATS_CACHE_KEY, fallbackPayload, 15000);
    return fallbackPayload;
  }

  /**
   * Records a page view (globally and optionally per item)
   */
  static async recordView(itemId?: string) {
    MemoryCacheService.del(STATS_CACHE_KEY);
    const cleanId = itemId ? String(itemId).trim() : "";

    if (isDbConnected()) {
      try {
        const stats = await Stat.findOneAndUpdate(
          { name: "global" },
          { $inc: { views: 1 } },
          { new: true, upsert: true }
        );

        let itemViewCount = 0;
        if (cleanId) {
          const itemStat = await Stat.findOneAndUpdate(
            { name: `item_view_${cleanId}` },
            { $inc: { views: 1 } },
            { new: true, upsert: true }
          );
          itemViewCount = itemStat.views;

          // Also update on Resource doc directly
          await Resource.updateOne(
            { $or: [{ itemId: cleanId }, { id: cleanId }] },
            { $inc: { views: 1 } }
          );
        }

        return {
          views: stats.views,
          itemViewCount,
        };
      } catch (err) {
        console.error("[StatsService] Error incrementing DB views:", err);
      }
    }

    memoryStats.views += 1;
    if (cleanId) {
      memoryStats.itemViews[cleanId] = (memoryStats.itemViews[cleanId] || 0) + 1;
    }

    return {
      views: memoryStats.views,
      itemViewCount: cleanId ? memoryStats.itemViews[cleanId] : 0,
    };
  }

  /**
   * Records a download globally and per-item, invalidates cache
   */
  static async recordDownload(itemId?: string) {
    MemoryCacheService.del(STATS_CACHE_KEY);
    const cleanId = itemId ? String(itemId).trim() : "";

    if (isDbConnected()) {
      try {
        let itemDownloads = 0;
        if (cleanId) {
          const itemStats = await Stat.findOneAndUpdate(
            { name: `item_${cleanId}` },
            { $inc: { downloads: 1 } },
            { new: true, upsert: true }
          );
          itemDownloads = itemStats.downloads;

          // Update Resource doc downloads & salesCount directly
          await Resource.updateOne(
            { $or: [{ itemId: cleanId }, { id: cleanId }] },
            { $inc: { downloads: 1, salesCount: 1 } }
          );
        }

        const allItemStats = await Stat.find({ name: { $regex: /^item_(?!view_)/ } });
        let totalDownloads = 0;
        allItemStats.forEach((st) => {
          totalDownloads += st.downloads || 0;
        });

        const stats = await Stat.findOneAndUpdate(
          { name: "global" },
          { $set: { downloads: totalDownloads } },
          { new: true, upsert: true }
        );

        return {
          downloads: stats.downloads,
          itemDownloads,
        };
      } catch (err) {
        console.error("[StatsService] Error incrementing DB downloads:", err);
      }
    }

    if (cleanId) {
      memoryStats.itemDownloads[cleanId] = (memoryStats.itemDownloads[cleanId] || 0) + 1;
    }
    memoryStats.downloads += 1;

    return {
      downloads: memoryStats.downloads,
      itemDownloads: cleanId ? memoryStats.itemDownloads[cleanId] : 0,
    };
  }

  /**
   * Cleans up individual item stats when a product is deleted
   */
  static async deleteItemStats(itemId: string) {
    MemoryCacheService.del(STATS_CACHE_KEY);
    const cleanId = String(itemId).trim();
    if (!cleanId) return;

    if (isDbConnected()) {
      try {
        await Stat.deleteMany({
          name: { $in: [`item_${cleanId}`, `item_view_${cleanId}`] },
        });

        // Recalculate global downloads
        const allItemStats = await Stat.find({ name: { $regex: /^item_(?!view_)/ } });
        let totalDownloads = 0;
        allItemStats.forEach((st) => {
          totalDownloads += st.downloads || 0;
        });
        await Stat.updateOne({ name: "global" }, { $set: { downloads: totalDownloads } });
      } catch (err) {
        console.error("[StatsService] Error deleting item stats:", err);
      }
    }

    delete memoryStats.itemDownloads[cleanId];
    delete memoryStats.itemViews[cleanId];
  }

  /**
   * Clears all item stats (used when clearing all resources)
   */
  static async clearAllItemStats() {
    MemoryCacheService.del(STATS_CACHE_KEY);

    if (isDbConnected()) {
      try {
        await Stat.deleteMany({
          name: { $regex: /^item_/ },
        });
        await Stat.updateOne({ name: "global" }, { $set: { downloads: 0 } });
      } catch (err) {
        console.error("[StatsService] Error clearing all item stats:", err);
      }
    }

    memoryStats.itemDownloads = {};
    memoryStats.itemViews = {};
    memoryStats.downloads = 0;
  }

  /**
   * Resets global downloads counter
   */
  static async resetDownloads() {
    MemoryCacheService.del(STATS_CACHE_KEY);

    if (isDbConnected()) {
      try {
        await Stat.deleteMany({ name: { $regex: /^item_/ } });
        const stats = await Stat.findOneAndUpdate(
          { name: "global" },
          { $set: { downloads: 0 } },
          { new: true, upsert: true }
        );
        return stats?.downloads || 0;
      } catch (err) {
        console.error("[StatsService] Error resetting DB downloads:", err);
      }
    }

    memoryStats.downloads = 0;
    memoryStats.itemDownloads = {};
    return 0;
  }
}

