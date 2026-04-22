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
      th: "🌟 Filza File Manager iOS 18-26"
    },
    shortDescription: {
      vi: "🐟 Share cho ae con hàng Filza cực ngon, bao chỉnh sửa file hệ thống cho iOS đời cao nhé.",
      th: "🐟 แจก Filza ตัวเด็ดให้พี่น้อง แก้ไขไฟล์ระบบสำหรับ iOS เวอร์ชั่นสูงๆ ได้ลื่นๆ เลยครับ"
    },
    fullDescription: {
      vi: "🐟 Share cho ae con hàng Filza cực ngon, bao chỉnh sửa file hệ thống cho iOS đời cao nhé.\n\nAe cân nhắc kĩ trước khi làm, tránh trường hợp xoá nhầm file xong k có file gốc đắp vào là ăn cám đấy =))) Có lỗi j cứ hú tui nhé!",
      th: "🐟 แจก Filza ตัวเด็ดให้พี่น้อง แอพแก้ไขไฟล์ระบบของ iOS เวอร์ชั่นใหม่ๆ แบบลื่นสุดๆ\n\nโปรดพิจารณาและอ่านให้ดีก่อนลงมือทำ ระวังลบไฟล์ผิดแล้วไม่มีไฟล์ต้นฉบับมาแทน จะซวยเอานะครับ =))) ถ้ามีError เกิดขึ้นทักมาบอกผมได้เลย!"
    },
    imageUrl: "https://img1.pic.in.th/images/IMG_012196467b8b130aef59.png",
    link: "https://example.com", 
    warning: {
      vi: "⚠️ Lưu ý cực quan trọng (Ae đọc kĩ):\n• Bản này chỉnh sửa (edit) file trực tiếp trên máy thì cực mượt, ổn áp luôn.\n• NHƯNG: Hiện tại vẫn chưa cho upload/import file từ ngoài vào được nhé ae. Chỉ vọc vạch mấy file có sẵn thôi.",
      th: "⚠️ หมายเหตุสำคัญมาก (โปรดอ่านอย่างละเอียด):\n• เวอร์ชั่นนี้แก้ไข (edit) ไฟล์โดยตรงบนอุปกรณ์ได้ลื่นไหลมากๆ ใช้งานได้เสถียร\n• แต่ว่า: ขณะนี้ยังไม่อนุญาตให้อัปโหลด/นำเข้า (Import) ไฟล์จากภายนอกเข้ามาได้ ทำได้เพียงศึกษาและแก้ไขไฟล์ที่มีอยู่แล้วในเครื่องเท่านั้น"
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
