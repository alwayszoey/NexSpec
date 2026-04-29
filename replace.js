const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/\{appStats\.downloads >= 100 && \(/g, "{(item.sales || 0) >= 100 && (");
code = code.replace(/ขายแล้ว \{\(appStats\.downloads\)\.toLocaleString\(\)\} ชิ้น/g, "ขายแล้ว {(item.sales || 0).toLocaleString()} ชิ้น");

fs.writeFileSync('src/App.tsx', code);
