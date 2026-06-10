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
    id: "2",
    title: "สคริปต์เว็บสุ่มบัตรทรู",
    shortDescription: "สคริปต์สุ่มบัตรการีน่า/ทรูมันนี่ ใช้งานง่าย ไม่ซับซ้อน",
    fullDescription: `รายละเอียด:
[+] ระบบแอดมินจัดการสินค้าและผู้เล่น
[+] ตัวสคริปต์ไม่กินทรัพยากร
[+] เปลี่ยนรูปและตั้งค่าในโค้ดได้ง่ายดาย`,
    imageUrl: "https://img1.pic.in.th/images/2000x600_20260602154514.png",
    actionType: "purchase",
    tags: ["เว็บ", "สุ่ม", "PHP"],
    warning: "รองรับ Phatom CSS เท่านั้น",
    category: "Script",
    price: "150",
    dateAdded: "2026-06-10",
    fileSize: "7MB"
  },
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
    actionType: "purchase",
    tags: ["SRC", "Bot", "Xandria"],
    warning: "",
    category: "Script",
    price: "0",
    dateAdded: "2026-04-26",
    fileSize: "Unknown"
  }
];
