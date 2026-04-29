const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf8');

code = code.replace(
  'date: new Date().toISOString()',
  'date: "2026-04-29T12:00:00Z" // สามารถเปลี่ยนวันที่ตรงนี้'
);

fs.writeFileSync('src/data.ts', code);
