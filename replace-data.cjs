const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf8');

const easyEditMatcher = `// ============================================================================
// Hướng dẫn thêm/sửa dữ liệu / คำแนะนำในการเพิ่มข้อมูล (EASY EDIT SECTION)
// ============================================================================
// Bạn có thể đăng một văn bản thông thường Object hoặc "..." chỉ hỗ trợ 2 ngôn ngữ tự động
// ============================================================================`;

const easyEditReplacement = `// ============================================================================
// Hướng dẫn thêm/sửa dữ liệu / คำแนะนำในการเพิ่มข้อมูล (EASY EDIT SECTION)
// ============================================================================
// Bạn có thể đăng một văn bản thông thường Object hoặc "..." chỉ hỗ trợ 2 ngôn ngữ tự động
// ============================================================================

export interface AnnouncementItem {
  id: string;
  text: string;
  date: string;
}

export const announcementsData: AnnouncementItem[] = [
  {
    id: "announce-1",
    text: "ยินดีต้อนรับสู่ระบบร้านค้าใหม่ของเรา!",
    date: new Date().toISOString()
  }
];`;

if (code.includes(easyEditMatcher)) {
  code = code.replace(easyEditMatcher, easyEditReplacement);
}

fs.writeFileSync('src/data.ts', code);
