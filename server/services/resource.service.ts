import crypto from "crypto";
import mongoose from "mongoose";
import { isDbConnected } from "../config/db.js";
import { Resource, IResource } from "../models/Resource.model.js";
import { MemoryCacheService } from "./cache.service.js";
import { secureResourceDetails } from "./secureResources.js";
import { StatsService } from "./stats.service.js";

// In-Memory store for resources (starts empty, user/admin creates items)
let memoryResources: any[] = [];

export class ResourceService {
  private static CACHE_KEY_PUBLIC = "public_resources_list_v3";
  private static CACHE_KEY_ADMIN = "admin_resources_list_v3";

  /**
   * Invalidates caches whenever resources change
   */
  static invalidateCache() {
    MemoryCacheService.del(this.CACHE_KEY_PUBLIC);
    MemoryCacheService.del(this.CACHE_KEY_ADMIN);
  }

  /**
   * Helper to build flexible Mongo search filter by itemId or _id or id
   */
  private static buildIdFilter(itemId: string) {
    const clean = String(itemId || "").trim();
    const filters: any[] = [{ itemId: clean }, { id: clean }];
    if (mongoose.isValidObjectId(clean)) {
      filters.push({ _id: new mongoose.Types.ObjectId(clean) });
    }
    return { $or: filters };
  }

  /**
   * Retrieves public catalog resources (sanitized - hides raw target download URLs for security)
   */
  static async getPublicResources(): Promise<any[]> {
    const cached = MemoryCacheService.get<any[]>(this.CACHE_KEY_PUBLIC);
    if (cached) return cached;

    let items: any[] = [];

    if (isDbConnected()) {
      try {
        const dbItems = await Resource.find().sort({ createdAt: -1 }).lean();
        items = dbItems.map((item) => ({
          id: item.itemId,
          itemId: item.itemId,
          title: item.title,
          category: item.category,
          shortDescription: item.shortDescription,
          fullDescription: item.fullDescription,
          price: item.price,
          actionType: item.actionType || "link",
          imageUrl: item.imageUrl,
          videoUrl: item.videoUrl,
          warning: item.warning,
          tags: item.tags || [],
          fileSize: item.fileSize,
          isOutOfStock: item.isOutOfStock,
          isPopular: item.isPopular,
          isFeatured: item.isFeatured,
          requiresLogin: item.requiresLogin,
          dateAdded: item.dateAdded || item.createdAt?.toISOString().split("T")[0],
          views: item.views || 0,
          downloads: item.downloads || 0,
          salesCount: item.salesCount || 0,
          downloadLinks: (item.downloadLinks || []).map((dl) => ({
            label: dl.label,
            url: dl.url ? "protected" : "",
          })),
        }));
      } catch (err) {
        console.error("Error reading resources from DB:", err);
      }
    }

    if (items.length === 0 && memoryResources.length > 0) {
      items = memoryResources.map((item) => ({
        id: item.itemId || item.id,
        itemId: item.itemId || item.id,
        title: item.title,
        category: item.category,
        shortDescription: item.shortDescription,
        fullDescription: item.fullDescription,
        price: item.price,
        actionType: item.actionType || "link",
        imageUrl: item.imageUrl,
        videoUrl: item.videoUrl,
        warning: item.warning,
        tags: item.tags || [],
        fileSize: item.fileSize,
        isOutOfStock: item.isOutOfStock,
        isPopular: item.isPopular,
        isFeatured: item.isFeatured,
        requiresLogin: item.requiresLogin,
        dateAdded: item.dateAdded,
        views: item.views || 0,
        downloads: item.downloads || 0,
        salesCount: item.salesCount || 0,
        downloadLinks: (item.downloadLinks || []).map((dl: any) => ({
          label: dl.label,
          url: dl.url ? "protected" : "",
        })),
      }));
    }

    MemoryCacheService.set(this.CACHE_KEY_PUBLIC, items, 30 * 1000);
    return items;
  }

  /**
   * Retrieves full resource details for Admin
   */
  static async getAdminResources(): Promise<any[]> {
    const cached = MemoryCacheService.get<any[]>(this.CACHE_KEY_ADMIN);
    if (cached) return cached;

    let items: any[] = [];

    if (isDbConnected()) {
      try {
        const dbItems = await Resource.find().sort({ createdAt: -1 }).lean();
        items = dbItems.map((item) => ({
          id: item.itemId,
          itemId: item.itemId,
          title: item.title,
          category: item.category,
          shortDescription: item.shortDescription,
          fullDescription: item.fullDescription,
          price: item.price,
          actionType: item.actionType || "link",
          imageUrl: item.imageUrl,
          videoUrl: item.videoUrl,
          link: item.link,
          downloadLinks: item.downloadLinks || [],
          purchaseDetails: item.purchaseDetails,
          warning: item.warning,
          tags: item.tags || [],
          fileSize: item.fileSize,
          isOutOfStock: item.isOutOfStock,
          isPopular: item.isPopular,
          isFeatured: item.isFeatured,
          requiresLogin: item.requiresLogin,
          dateAdded: item.dateAdded,
          views: item.views || 0,
          downloads: item.downloads || 0,
          salesCount: item.salesCount || 0,
          createdAt: item.createdAt,
        }));
      } catch (err) {
        console.error("Error reading admin resources from DB:", err);
      }
    }

    if (items.length === 0 && memoryResources.length > 0) {
      items = memoryResources.map((item) => ({
        ...item,
        views: item.views || 0,
        downloads: item.downloads || 0,
        salesCount: item.salesCount || 0,
      }));
    }

    MemoryCacheService.set(this.CACHE_KEY_ADMIN, items, 15 * 1000);
    return items;
  }

  /**
   * Retrieves a single full resource (for download or buy logic)
   */
  static async getResource(itemId: string): Promise<any | null> {
    if (!itemId) return null;

    if (isDbConnected()) {
      try {
        const doc = await Resource.findOne(this.buildIdFilter(itemId)).lean();
        if (doc) return doc;
      } catch (err) {
        console.error("Error finding resource by ID in DB:", err);
      }
    }

    const memoryItem = memoryResources.find(
      (r) => r.itemId === itemId || r.id === itemId
    );
    if (memoryItem) return memoryItem;

    // Check secureResourceDetails fallback if available
    if (secureResourceDetails[itemId]) {
      return {
        itemId,
        id: itemId,
        title: `Resource #${itemId}`,
        link: secureResourceDetails[itemId].link,
        downloadLinks: secureResourceDetails[itemId].downloadLinks || [
          { label: "ดาวน์โหลดหลัก", url: secureResourceDetails[itemId].link || "" },
        ],
        purchaseDetails: secureResourceDetails[itemId].purchaseDetails || "",
      };
    }

    return null;
  }

  /**
   * Resolves the real download URL for an item
   */
  static async resolveDownloadUrl(itemId: string, linkIndex?: number): Promise<string | null> {
    const resource = await this.getResource(itemId);
    if (!resource) return null;

    if (Array.isArray(resource.downloadLinks) && resource.downloadLinks.length > 0) {
      const idx =
        typeof linkIndex === "number" &&
        linkIndex >= 0 &&
        linkIndex < resource.downloadLinks.length
          ? linkIndex
          : 0;
      return resource.downloadLinks[idx]?.url || resource.link || null;
    }

    return resource.link || null;
  }

  /**
   * Creates a new resource
   */
  static async createResource(data: any): Promise<any> {
    const itemId =
      String(data.itemId || data.id || "").trim() ||
      `item_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const actionType: "link" | "purchase" =
      data.actionType === "purchase" ? "purchase" : "link";

    const downloadLinks = Array.isArray(data.downloadLinks)
      ? data.downloadLinks.filter((l: any) => l && l.url)
      : data.link
      ? [{ label: "ดาวน์โหลดหลัก", url: data.link }]
      : [];

    const link = data.link?.trim() || (downloadLinks[0]?.url || "");

    const newResource = {
      itemId,
      id: itemId,
      title: data.title?.trim() || "สินค้าไม่มีชื่อ",
      category: data.category?.trim() || "Script",
      shortDescription: data.shortDescription?.trim() || "",
      fullDescription: data.fullDescription?.trim() || "",
      price: data.price !== undefined ? String(data.price).trim() : "ฟรี",
      actionType,
      imageUrl: data.imageUrl?.trim() || "",
      videoUrl: data.videoUrl?.trim() || "",
      link,
      downloadLinks,
      purchaseDetails: data.purchaseDetails?.trim() || "",
      warning: data.warning?.trim() || "",
      tags: Array.isArray(data.tags)
        ? data.tags.map((t: string) => String(t).trim()).filter(Boolean)
        : typeof data.tags === "string"
        ? data.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        : [],
      fileSize: data.fileSize?.trim() || "",
      isOutOfStock: Boolean(data.isOutOfStock),
      isPopular: Boolean(data.isPopular),
      isFeatured: Boolean(data.isFeatured),
      requiresLogin: Boolean(data.requiresLogin),
      dateAdded: data.dateAdded || new Date().toISOString().split("T")[0],
    };

    let dbResult: any = null;

    if (isDbConnected()) {
      try {
        let existingDoc = await Resource.findOne(this.buildIdFilter(itemId));
        if (existingDoc) {
          existingDoc.set(newResource);
          const saved = await existingDoc.save();
          dbResult = saved.toObject();
        } else {
          const created = await Resource.create(newResource);
          dbResult = created.toObject();
        }
      } catch (err: any) {
        console.error("Error saving resource to DB:", err.message);
      }
    }

    const existingIndex = memoryResources.findIndex(
      (r) => r.itemId === itemId || r.id === itemId
    );
    if (existingIndex !== -1) {
      memoryResources[existingIndex] = newResource;
    } else {
      memoryResources.unshift(newResource);
    }

    this.invalidateCache();
    return dbResult ? { ...dbResult, id: dbResult.itemId || itemId } : newResource;
  }

  /**
   * Updates an existing resource
   */
  static async updateResource(itemId: string, data: any): Promise<any> {
    const cleanId = String(itemId || data.itemId || data.id || "").trim();
    if (!cleanId) {
      throw new Error("กรุณาระบุรหัสสินค้า");
    }

    const updates: any = {};
    if (data.title !== undefined) updates.title = String(data.title).trim();
    if (data.category !== undefined) updates.category = String(data.category).trim();
    if (data.shortDescription !== undefined) updates.shortDescription = String(data.shortDescription).trim();
    if (data.fullDescription !== undefined) updates.fullDescription = String(data.fullDescription).trim();
    if (data.price !== undefined) updates.price = String(data.price).trim();
    if (data.actionType !== undefined)
      updates.actionType = data.actionType === "purchase" ? "purchase" : "link";
    if (data.imageUrl !== undefined) updates.imageUrl = String(data.imageUrl).trim();
    if (data.videoUrl !== undefined) updates.videoUrl = String(data.videoUrl).trim();
    if (data.link !== undefined) updates.link = String(data.link).trim();
    if (data.downloadLinks !== undefined) {
      updates.downloadLinks = Array.isArray(data.downloadLinks)
        ? data.downloadLinks.filter((l: any) => l && l.url)
        : [];
      if (!updates.link && updates.downloadLinks.length > 0) {
        updates.link = updates.downloadLinks[0].url;
      }
    }
    if (data.purchaseDetails !== undefined) updates.purchaseDetails = String(data.purchaseDetails).trim();
    if (data.warning !== undefined) updates.warning = String(data.warning).trim();
    if (data.tags !== undefined) {
      updates.tags = Array.isArray(data.tags)
        ? data.tags.map((t: string) => String(t).trim()).filter(Boolean)
        : typeof data.tags === "string"
        ? data.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        : [];
    }
    if (data.fileSize !== undefined) updates.fileSize = String(data.fileSize).trim();
    if (data.isOutOfStock !== undefined) updates.isOutOfStock = Boolean(data.isOutOfStock);
    if (data.isPopular !== undefined) updates.isPopular = Boolean(data.isPopular);
    if (data.isFeatured !== undefined) updates.isFeatured = Boolean(data.isFeatured);
    if (data.requiresLogin !== undefined) updates.requiresLogin = Boolean(data.requiresLogin);

    let updatedDoc: any = null;

    // If MongoDB is connected, find and update document safely
    if (isDbConnected()) {
      try {
        let doc = await Resource.findOne(this.buildIdFilter(cleanId));
        if (doc) {
          doc.set({ ...updates, itemId: doc.itemId || cleanId });
          const saved = await doc.save();
          updatedDoc = saved.toObject();
        } else {
          // If not found in DB, create new
          const created = await Resource.create({
            itemId: cleanId,
            ...updates,
          });
          updatedDoc = created.toObject();
        }
      } catch (err: any) {
        console.error("Error updating resource in DB:", err.message);
      }
    }

    // Always update in-memory storage synchronously
    const index = memoryResources.findIndex(
      (r) => r.itemId === cleanId || r.id === cleanId
    );
    if (index !== -1) {
      memoryResources[index] = {
        ...memoryResources[index],
        ...updates,
        itemId: cleanId,
        id: cleanId,
      };
    } else {
      memoryResources.unshift({
        itemId: cleanId,
        id: cleanId,
        title: updates.title || "สินค้า",
        category: updates.category || "Script",
        ...updates,
      });
    }

    this.invalidateCache();

    if (updatedDoc) {
      return {
        ...updatedDoc,
        id: updatedDoc.itemId || cleanId,
      };
    }

    const item = memoryResources.find((r) => r.itemId === cleanId || r.id === cleanId);
    return item || { itemId: cleanId, id: cleanId, ...updates };
  }

  /**
   * Deletes a resource
   */
  static async deleteResource(itemId: string): Promise<boolean> {
    if (!itemId) return false;
    const cleanId = String(itemId).trim();

    if (isDbConnected()) {
      try {
        await Resource.deleteMany(this.buildIdFilter(cleanId));
      } catch (err) {
        console.error("Error deleting resource from DB:", err);
      }
    }

    memoryResources = memoryResources.filter(
      (r) => r.itemId !== cleanId && r.id !== cleanId
    );

    // Clean up isolated stats for this item
    await StatsService.deleteItemStats(cleanId);

    this.invalidateCache();
    return true;
  }

  /**
   * Deletes all resources (Clears catalog & removes old legacy items)
   */
  static async clearAllResources(): Promise<boolean> {
    if (isDbConnected()) {
      try {
        await Resource.deleteMany({});
      } catch (err) {
        console.error("Error deleting all resources from DB:", err);
      }
    }

    memoryResources = [];

    // Clear all item statistics
    await StatsService.clearAllItemStats();

    this.invalidateCache();
    return true;
  }
}
