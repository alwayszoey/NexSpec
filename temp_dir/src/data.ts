export interface DownloadLink {
  label: string;
  url: string;
}



export type StringOrObj = string;

export interface ResourceItem {
  id: string;
  title: StringOrObj;
  shortDescription: StringOrObj;
  fullDescription: StringOrObj;
  imageUrl: string;
  videoUrl?: string;
  link?: string;
  downloadLinks?: DownloadLink[];
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
    title: "หัวหลุด! แจกสคริปต์ Aimbot V3",
    shortDescription: "สคริปต์ล็อกหัวเป๊ะๆ & ปืนนิ่งกริ๊บ (No Recoil)",
    fullDescription: `AimBot💥โคตรตึง
[+] ล็อกหัว 99% (โนแบนล้านเปอร์เซ็นต์!)
[+] ปั๊มแรงค์เนียนๆ ไม่โป๊ะแน่นอน
[+] ระบบจับไม่ได้ชัวร์ๆ ทะลุสบาย 100%
💥 เฉพาะ iOS เท่านั้น!!`,
    imageUrl: "https://picsum.photos/seed/aimbot/800/500",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // รองรับ YouTube หรือวีดีโออื่นๆ ได้เช่นกัน
    link: "https://www.mediafire.com/file/k8d1yvgzcp3w56s/Freestyle_0.1.json/file?dkey=9o6wvtoyc1c&r=77",
    tags: ["Aimbot", "Script", "ProxyPin"],
    warning: "คำเตือน: ",
    category: "Script",
    price: "150 ฿",
    dateAdded: "2026-04-19",
    fileSize: "0.0346"
  }
];
