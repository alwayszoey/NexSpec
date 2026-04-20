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
      th: "สคริปต์ Universal Aimbot V3"
    },
    shortDescription: {
      vi: "Script aimbot khoá đầu & giảm giật (No Recoil)",
      th: "สคริปต์ aimbot ล็อกหัว & ลดแรงดีด (No Recoil)"
    },
    fullDescription: {
      vi: `AimBot💥
[+] Khoá đầu 99% (Cam kết không ban 100%)
[+] Sử dụng để cày thuê cực kín
[+] Qua mặt phần mềm check 100%
💥 CHỈ DÀNH CHO iOS !!`,
      th: `AimBot💥
[+] ล็อกหัว 99% (การันตีไม่โดนแบน 100%)
[+] ใช้สำหรับปั๊มแรงค์เนียนๆ
[+] บายพาสระบบตรวจสอบ 100%
💥 สำหรับเล่นบน iOS เท่านั้น !!`
    },
    imageUrl: "https://picsum.photos/seed/aimbot/800/500",
    link: "https://www.mediafire.com/file/k8d1yvgzcp3w56s/Freestyle_0.1.json/file?dkey=9o6wvtoyc1c&r=77",
    tags: ["Aimbot", "Script", "ProxyPin"],
    warning: {
      vi: "Lưu ý: ",
      th: "หมายเหตุ: "
    },
    category: "Script",
    dateAdded: "2026-04-19",
    fileSize: "0.0346"
  },
  {
    id: "2",
    title: {
      vi: "Mod Skin FF OB53 IOS",
      th: "มอดสกิน FF บน IOS ฟรี!! ไม่ต้องรอคิว"
    },
    shortDescription: {
      vi: "Proxypin mod skin FF OB53 mới nhất nha, khỏi cần chờ luôn",
      th: "Proxypin ModSkin ล่าสุด 2026"
    },
    fullDescription: {
      vi: `Tải file script lên Proxypin, vào web verify key là dùng được liền, có thể dùng chung với file aimbot luôn`,
      th: `อัปโหลดไฟล์สคริปต์ลง Proxypin เข้าเว็บยืนยันรหัสแล้วใช้ได้เลย และสามารถใช้ร่วมกับไฟล์ aimbot ได้ด้วย`
    },
    imageUrl: "https://picsum.photos/seed/aimbot/800/500",
    link: "https://www.mediafire.com/file/k8d1yvgzcp3w56s/Freestyle_0.1.json/file?dkey=9o6wvtoyc1c&r=77",
    tags: ["Mod", "Script", "ProxyPin"],
    category: "MOD",
    dateAdded: "2026-04-19",
    fileSize: "0.0346",
    requiresLogin: true
  }
];
