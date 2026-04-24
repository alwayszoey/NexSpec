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
    id: "3",
    title: {
      vi: "🌟 Filza File Manager iOS 18-26",
      th: "🌟 แอพ Filza เสกไฟล์ iOS 18-26"
    },
    shortDescription: {
      vi: "🐟 Share cho ae con hàng Filza cực ngon, bao chỉnh sửa file hệ thống cho iOS đời cao nhé.",
      th: "🐟 แจก Filza ตัวตึงให้ชาวแก๊ง โมไฟล์ระบบ iOS ตัวใหม่ฉ่ำๆ โคตรลื่น ไปตำ!"
    },
    fullDescription: {
      vi: "🐟 Share cho ae con hàng Filza cực ngon, bao chỉnh sửa file hệ thống cho iOS đời cao nhé.\n\nAe cân nhắc kĩ trước khi làm, tránh trường hợp xoá nhầm file xong k có file gốc đắp vào là ăn cám đấy =))) Có lỗi j cứ hú tui nhé!",
      th: "🐟 แจกแอพ Filza ตัวตึง โมไฟล์ iOS ตัวใหม่ลื่นปื๊ดๆ ให้ชาวแก๊ง\n\nอ่านก่อนทำนะพวกแก ระวังแหก! อย่าหาลบมั่วเดี๋ยวเครื่องขิต ไม่มีไฟล์แก้ชิบหายแน่ =))) สะดุดตรงไหนทักมาโวยวายได้เลย!"
    },
    imageUrl: "https://img1.pic.in.th/images/IMG_012196467b8b130aef59.png",
    link: "https://example.com", 
    warning: {
      vi: "⚠️ Lưu ý cực quan trọng (Ae đọc kĩ):\n• Bản này chỉnh sửa (edit) file trực tiếp trên máy thì cực mượt, ổn áp luôn.\n• NHƯNG: Hiện tại vẫn chưa cho upload/import file từ ngoài vào được nhé ae. Chỉ vọc vạch mấy file có sẵn thôi.",
      th: "⚠️ เตือนตัวโตๆ (อ่านดิ๊):\n• แอพนี้แก้ไฟล์สดๆ ในเครื่องลื่นสุดติ่ง ปังม๊าก\n• ย้ำ: ตอนนี้ยังโยนไฟล์จากข้างนอกเข้าไม่ได้นะจ๊ะ ได้แค่ส่องๆ โมๆ ไฟล์ที่มีในเครื่องไปก่อนเด้อ"
    },
    tags: ["iOS 18-26", "Filza", "System"],
    category: "App",
    dateAdded: "2026-04-20",
    requiresLogin: false
  },
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
💥 เฉพาะแก๊งผลไม้ iOS เท่านั้นเว้ย!!`
    },
    imageUrl: "https://picsum.photos/seed/aimbot/800/500",
    link: "https://www.mediafire.com/file/k8d1yvgzcp3w56s/Freestyle_0.1.json/file?dkey=9o6wvtoyc1c&r=77",
    tags: ["Aimbot", "Script", "ProxyPin"],
    warning: {
      vi: "Lưu ý: ",
      th: "ระวังเด้อ: "
    },
    category: "Script",
    dateAdded: "2026-04-19",
    fileSize: "0.0346"
  },
  {
    id: "2",
    title: {
      vi: "Mod Skin FF OB53 IOS",
      th: "ดึงสกิน FF iOS โคตรตึง ฟรีๆ ไม่ต้องรอคิวฮะ"
    },
    shortDescription: {
      vi: "Proxypin mod skin FF OB53 mới nhất nha, khỏi cần chờ luôn",
      th: "โหมดสกิน FF ล่าสุด Proxypin จัดให้ ไม่ต้องคอยนาน"
    },
    fullDescription: {
      vi: `Tải file script lên Proxypin, vào web verify key là dùng được liền, có thể dùng chung với file aimbot luôn`,
      th: `ยัดสคริปต์เข้า Proxypin แล้วไปยืนยันคีย์หน้าเว็บก็ปังเลยจ้า ผสมกับ aimbot ก็ได้ รัวๆ`
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
