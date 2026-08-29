import mongoose from "mongoose";
import { Category, ICategory } from "../models/Category.model.js";
import { isDbConnected } from "../config/db.js";
import { MemoryCacheService } from "./cache.service.js";

const DEFAULT_CATEGORIES = [
  {
    id: "cat-script",
    categoryId: "cat-script",
    name: "Script",
    description: "สคริปต์ต่างๆ โค้ดเกม และระบบอัตโนมัติ",
    imageUrl: "https://img1.pic.in.th/images/2000x600_20260602154514.png",
    isRecommended: true,
    isPopular: true,
    sortOrder: 1,
  },
  {
    id: "cat-bot",
    categoryId: "cat-bot",
    name: "Bot",
    description: "บอทระบบ Discord Bot และบอทช่วยเล่น",
    imageUrl: "https://img1.pic.in.th/images/-5_20260426220753.png",
    isRecommended: true,
    isPopular: false,
    sortOrder: 2,
  },
  {
    id: "cat-web",
    categoryId: "cat-web",
    name: "Web Template",
    description: "เทมเพลตเว็บไซต์ ระบบจัดการหลังบ้าน และ UI",
    imageUrl: "https://img1.pic.in.th/images/2000x600_20260603154931.png",
    isRecommended: false,
    isPopular: false,
    sortOrder: 3,
  },
];

let inMemoryCategories: any[] = [...DEFAULT_CATEGORIES];

export class CategoryService {
  private static CACHE_KEY = "categories_all_v3";

  private static buildCategoryFilter(id: string) {
    const filters: any[] = [{ categoryId: id }, { name: id }, { id: id }];
    if (mongoose.isValidObjectId(id)) {
      filters.push({ _id: id });
    }
    return { $or: filters };
  }

  /**
   * Initialize & Seed default categories if collection is empty
   */
  static async initSeed() {
    if (isDbConnected()) {
      try {
        const count = await Category.countDocuments();
        if (count === 0) {
          for (const cat of DEFAULT_CATEGORIES) {
            await Category.create(cat);
          }
          console.log("[Categories] Seeded initial categories into MongoDB.");
        }
      } catch (err: any) {
        console.warn("[Categories] Seed failed:", err.message);
      }
    }
  }

  /**
   * Get all categories
   */
  static async getCategories(): Promise<any[]> {
    const cached = MemoryCacheService.get<any[]>(this.CACHE_KEY);
    if (cached) return cached;

    if (isDbConnected()) {
      try {
        await this.initSeed();
        const docs = await Category.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
        if (docs && docs.length > 0) {
          const formatted = docs.map((doc: any) => ({
            id: doc.categoryId || String(doc._id),
            categoryId: doc.categoryId || String(doc._id),
            name: doc.name,
            description: doc.description || "",
            imageUrl: doc.imageUrl || "",
            isPopular: Boolean(doc.isPopular),
            isRecommended: Boolean(doc.isRecommended),
            sortOrder: doc.sortOrder || 0,
          }));
          MemoryCacheService.set(this.CACHE_KEY, formatted, 30000);
          return formatted;
        }
      } catch (err: any) {
        console.warn("[Categories] Fetch DB error, falling back to memory:", err.message);
      }
    }

    MemoryCacheService.set(this.CACHE_KEY, inMemoryCategories, 30000);
    return inMemoryCategories;
  }

  /**
   * Create a new category
   */
  static async createCategory(data: Partial<ICategory>): Promise<any> {
    const categoryId =
      data.categoryId?.trim() ||
      `cat-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    const newCat = {
      id: categoryId,
      categoryId,
      name: data.name?.trim() || "New Category",
      description: data.description || "",
      imageUrl: data.imageUrl || "https://img1.pic.in.th/images/2000x600_20260602154514.png",
      isPopular: Boolean(data.isPopular),
      isRecommended: Boolean(data.isRecommended),
      sortOrder: Number(data.sortOrder) || inMemoryCategories.length + 1,
    };

    if (isDbConnected()) {
      try {
        const created = await Category.create(newCat);
        MemoryCacheService.del(this.CACHE_KEY);
        return {
          id: created.categoryId,
          categoryId: created.categoryId,
          name: created.name,
          description: created.description,
          imageUrl: created.imageUrl,
          isPopular: created.isPopular,
          isRecommended: created.isRecommended,
          sortOrder: created.sortOrder,
        };
      } catch (err: any) {
        console.warn("[Categories] Create in DB failed, using memory:", err.message);
      }
    }

    inMemoryCategories.push(newCat);
    MemoryCacheService.del(this.CACHE_KEY);
    return newCat;
  }

  /**
   * Update category
   */
  static async updateCategory(id: string, updates: Partial<ICategory>): Promise<any> {
    if (isDbConnected()) {
      try {
        const updated = await Category.findOneAndUpdate(
          this.buildCategoryFilter(id),
          { $set: updates },
          { new: true, upsert: true }
        ).lean();

        if (updated) {
          MemoryCacheService.del(this.CACHE_KEY);
          return {
            id: (updated as any).categoryId || id,
            categoryId: (updated as any).categoryId || id,
            name: (updated as any).name,
            description: (updated as any).description,
            imageUrl: (updated as any).imageUrl,
            isPopular: (updated as any).isPopular,
            isRecommended: (updated as any).isRecommended,
            sortOrder: (updated as any).sortOrder,
          };
        }
      } catch (err: any) {
        console.warn("[Categories] Update in DB failed:", err.message);
      }
    }

    const idx = inMemoryCategories.findIndex(
      (c) => c.id === id || c.categoryId === id || c.name === id
    );
    if (idx !== -1) {
      inMemoryCategories[idx] = {
        ...inMemoryCategories[idx],
        ...updates,
        id: inMemoryCategories[idx].id || id,
      };
      MemoryCacheService.del(this.CACHE_KEY);
      return inMemoryCategories[idx];
    }

    const created = await this.createCategory({ ...updates, categoryId: id });
    return created;
  }

  /**
   * Delete category
   */
  static async deleteCategory(id: string): Promise<boolean> {
    if (!id) return false;

    if (isDbConnected()) {
      try {
        await Category.deleteMany(this.buildCategoryFilter(id));
        MemoryCacheService.del(this.CACHE_KEY);
      } catch (err: any) {
        console.warn("[Categories] Delete in DB failed:", err.message);
      }
    }

    inMemoryCategories = inMemoryCategories.filter(
      (c) =>
        c.id !== id &&
        c.categoryId !== id &&
        c.name !== id &&
        String(c._id) !== id
    );
    MemoryCacheService.del(this.CACHE_KEY);
    return true;
  }
}
