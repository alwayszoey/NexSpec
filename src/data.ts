export interface DownloadLink {
  label: string;
  url: string;
}

export interface LocalizedString {
  vi: string;
  th: string;
}

export type StringOrObj = string | LocalizedString;

export interface ResourceItem {
  id: string;
  title: StringOrObj;
  shortDescription: StringOrObj;
  fullDescription: StringOrObj;
  imageUrl: string;
  link?: string;
  downloadLinks?: DownloadLink[];
  warning?: StringOrObj;
  tags: string[];
  category: string;
  dateAdded: string; // Format: YYYY-MM-DD
  fileSize?: string;
  requiresLogin?: boolean;
}

// ============================================================================
// Hướng dẫn thêm/sửa dữ liệu / คำแนะนำในการเพิ่มข้อมูล (EASY EDIT SECTION)
// ============================================================================
// Bạn có thể đăng một văn bản thông thường Object hoặc { vi: "...", th: "..." } chỉ hỗ trợ 2 ngôn ngữ tự động
// ============================================================================

export const resourcesData: ResourceItem[] = [
  {
    id: "1",
    title: {
      vi: "Universal Aimbot Script V3 (No Recoil)",
      th: "หัวหลุด! แจกโปร Aimbot V3"
    },
    shortDescription: {
      vi: "Script aimbot khoá đầu & giảm giật (No Recoil)",
      th: "สคริปต์ล็อกหัวเป๊ะๆ & ปืนนิ่งกริ๊บ (No Recoil)"
    },
    fullDescription: {
      vi: `AimBot💥
[+] Khoá đầu 99% (Cam kết không ban 100%)
[+] Sử dụng để cày thuê cực kín
[+] Qua mặt phần mềm check 100%
💥 CHỈ DÀNH CHO iOS !!`,
      th: `AimBot💥โคตรตึง
[+] ล็อกหัว 99% (โนแบนล้านเปอร์เซ็นต์!)
[+] ปั๊มแรงค์เนียนๆ ไม่โป๊ะแน่นอน
[+] ระบบจับไม่ได้ชัวร์ๆ ทะลุสบาย 100%
💥 เฉพาะ iOS เท่านั้น!!`
    },
    imageUrl: "https://picsum.photos/seed/aimbot/800/500",
    link: "https://www.mediafire.com/file/k8d1yvgzcp3w56s/Freestyle_0.1.json/file?dkey=9o6wvtoyc1c&r=77",
    tags: ["Aimbot", "Script", "ProxyPin"],
    warning: {
      vi: "Lưu ý: ",
      th: "คำเตือน: "
    },
    category: "Script",
    dateAdded: "2026-04-19",
    fileSize: "0.0346"
  }
];
