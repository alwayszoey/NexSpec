const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/\\$\{item\.stock\}/g, "${item.stock}");

fs.writeFileSync('src/App.tsx', code);
