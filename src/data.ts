export interface DownloadLink {
  label: string;
  url: string;
}

export type StringOrObj = string;
export type ActionType = "link" | "purchase";

export interface CategoryItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isPopular?: boolean;
  isRecommended?: boolean;
}

export const categoriesData: CategoryItem[] = [
  {
    id: "cat-script",
    name: "Script",
    description: "สคริปต์ต่างๆ",
    imageUrl: "https://img1.pic.in.th/images/2000x600_20260602154514.png",
    isRecommended: true,
    isPopular: true
  }
];

export interface ResourceItem {
  id: string;
  title: StringOrObj;
  shortDescription: StringOrObj;
  fullDescription: StringOrObj;
  imageUrl: string;
  videoUrl?: string;
  link?: string;
  downloadLinks?: DownloadLink[];
  actionType?: ActionType; // 'link' or 'purchase' (default is 'link')
  purchaseDetails?: string; // Text shown and copyable after a purchase succeeds
  warning?: StringOrObj;
  tags: string[];
  category: string;
  dateAdded: string; // Format: YYYY-MM-DD
  fileSize?: string;
  price?: string;
  requiresLogin?: boolean;
  isOutOfStock?: boolean;
}

// ============================================================================
// Hướng dẫn thêm/sửa dữ liệu / คำแนะนำในการเพิ่มข้อมูล (EASY EDIT SECTION)
// ============================================================================
// Bạn có thể đăng một văn bản thông thường Object hoặc "..." chỉ hỗ trợ 2 ngôn ngữ tự động
// ============================================================================

export const resourcesData: ResourceItem[] = [
  {
    id: "1",
    title: "SRC บอทหลายเมนู Xandria",
    shortDescription: "SRC บอทเมนูทุกอย่าง 0.1.4.4 - Xandria Releases FIXED",
    fullDescription: `รายละเอียด:
[+] SRC บอทเมนูทุกอย่าง ครบจบในตัวเดียว
[+] เป็นเวอร์ชั่น 0.1.4.4_-_Xandria_-_Releases_FIXED
[+] พร้อมวิธีการใช้งานเบื้องต้น`,
    imageUrl: "https://img1.pic.in.th/images/A555D9C4-01F8-461C-9007-04AAB3D47930c230b04e736443e0.png",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // รองรับ YouTube หรือวีดีโออื่นๆ ได้เช่นกัน
    actionType: "purchase",
    tags: ["SRC", "Bot", "Xandria"],
    warning: "",
    category: "Script",
    price: "0",
    dateAdded: "2026-04-26",
    fileSize: "Unknown"
  }
];
