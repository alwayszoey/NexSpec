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
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1640&auto=format&fit=crop", // placeholder image
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
  uniqueKeys?: string[]; // Array of unique items (e.g., game keys, accounts), one given per purchase
  warning?: StringOrObj;
  tags: string[];
  category: string;
  dateAdded: string; // Format: YYYY-MM-DD
  fileSize?: string;
  price?: string;
  requiresLogin?: boolean;
  isOutOfStock?: boolean;
  stock?: number;
  maxStock?: number;
  sales?: number;
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
    imageUrl: "https://img1.pic.in.th/images/-5_20260426220753.png",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // รองรับ YouTube หรือวีดีโออื่นๆ ได้เช่นกัน
    link: "https://www.mediafire.com/file/k8d1yvgzcp3w56s/Freestyle_0.1.json/file?dkey=9o6wvtoyc1c&r=77",
    actionType: "purchase",
    purchaseDetails: "ขอบคุณที่สั่งซื้อ!\n\nลิงก์สำหรับโหลด: https://www.mediafire.com/file/k8d1yvgzcp3w56s/Freestyle_0.1.json/file?dkey=9o6wvtoyc1c&r=77",
    tags: ["SRC", "Bot", "Xandria"],
    warning: "",
    category: "Script",
    price: "0",
    dateAdded: "2026-04-26",
    fileSize: "Unknown",
    stock: 5,
    maxStock: 5
  },
  {
    id: "3",
    title: "Premium Game Keys",
    shortDescription: "รหัสเกมระดับพรีเมียม (ไม่ซ้ำกัน)",
    fullDescription: "ซื้อ 1 ครั้ง จะได้รับ 1 โค้ดสำหรับเติมเกม คุณจะไม่ได้รับโค้ดซ้ำกับคนอื่นแน่นอน เมื่อโควตาหมดจะสั่งซื้อไม่ได้อีก",
    imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=1640&auto=format&fit=crop",
    link: "https://example.com/download-2",
    actionType: "purchase",
    purchaseDetails: "ไม่พบโค้ด (อาจจะหมดแล้ว)",
    uniqueKeys: ["KEY-ABCD-1234", "KEY-WXYZ-9876", "KEY-QWER-5678"],
    tags: ["Premium", "Game Key"],
    category: "Game Keys",
    price: "100",
    dateAdded: "2026-04-28",
    fileSize: "Digital Key",
    stock: 0,
    maxStock: 3
  }
];
