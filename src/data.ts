export interface DownloadLink {
  label: string;
  url: string;
}

export type StringOrObj = string;
export type ActionType = "link" | "purchase";

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
    fileSize: "Unknown"
  }
];
