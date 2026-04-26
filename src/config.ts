export const siteConfig = {
  // ============================================
  // 🎨 ตั้งค่าสีเว็บต่างๆ (Color Theme Configuration)
  // หมายเหตุ: สีหลักของเว็บถูกตั้งค่าไว้ที่ src/index.css
  // คุณสามารถไปเปลี่ยน --theme-brand, --theme-bg-app ที่ไฟล์นั้นได้ง่ายๆ
  // ============================================

  // ============================================
  // 📝 เนื้อหาทั่วไป (General Info)
  // ============================================
  name: "Zorix Shop",
  logoUrl: "https://img2.pic.in.th/IMG_0083.png",
  seoImageUrl: "https://img2.pic.in.th/IMG_0083.png", // แนะนำ: 1200x630 px (สำหรับ Social Media Preview)
  bannerImageUrl: "https://img1.pic.in.th/images/zorixshop_20260426124700.png", // แนะนำเท่านนี้อัตราส่วน 10:3 หรือขนาด 2000x600 px
  promoPopupImageUrl: "https://img2.pic.in.th/never.png", // แนะนำขนาดรูปภาพแนวตั้ง 1:1 หรือ 4:5
  
  // ขนาดภาพการ์ดสินค้าที่แนะนำ: อัตราส่วน 1:1 (สี่เหลี่ยมจัตุรัส) เช่น 500x500 px หรือ 800x800 px
  
  // ============================================
  // 🏷️ หมวดหมู่ (Categories)
  // แก้ไขหรือเพิ่ม/ลดหมวดหมู่ได้ที่นี่
  // ============================================
  categories: [
    {
      id: "all",
      name: { th: "🔥 แนะนำหมวดหมู่ยอดฮิต", vi: "🔥 Danh mục phổ biến" },
    },
    {
      id: "scripts",
      icon: "https://cdn-icons-png.flaticon.com/512/1005/1005141.png",
      name: { th: "Script", vi: "Script" },
      desc: { th: "สคริปต์ต่างๆ", vi: "Các tập lệnh" }
    },
    {
      id: "configs",
      icon: "https://cdn-icons-png.flaticon.com/512/5832/5832416.png",
      name: { th: "Config", vi: "Cấu hình" },
      desc: { th: "การตั้งค่า", vi: "Cài đặt" }
    },
    {
      id: "tools",
      icon: "https://cdn-icons-png.flaticon.com/512/2885/2885412.png",
      name: { th: "Tools", vi: "Công cụ" },
      desc: { th: "เครื่องมือ", vi: "Công cụ" }
    }
  ],

  // ============================================
  // 💳 ตั้งค่าเพิ่มเติม
  // ============================================
  socials: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    discord: "https://discord.com"
  }
};
