const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/คงเหลือ \\\$\{item\.stock\}/g, "คงเหลือ ${item.stock}");

fs.writeFileSync('src/App.tsx', code);
