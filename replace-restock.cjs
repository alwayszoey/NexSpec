const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Initialization logic for products
const initialStockMatcher = `           if (found) {\n             const newStock = found.stock;`;
const initialStockReplacement = `           const isRestocked = found.maxStock !== item.maxStock || (found.initialStock !== undefined && found.initialStock !== item.stock);\n           if (found && !isRestocked) {\n             const newStock = found.stock;`;

if (code.includes(initialStockMatcher)) {
  code = code.replace(initialStockMatcher, initialStockReplacement);
}

// 2. Saving logic for products purchases
const purchaseMatcher = `                   ...updated,\n                   stock: newStock,\n                   isOutOfStock: newStock === 0 || updated.isOutOfStock,\n                   uniqueKeys: newUniqueKeys,\n                   purchaseDetails: newUniqueKeys ? assignedDetails : updated.purchaseDetails\n                 };`;

const purchaseReplacement = `                   ...updated,\n                   stock: newStock,\n                   isOutOfStock: newStock === 0 || updated.isOutOfStock,\n                   uniqueKeys: newUniqueKeys,\n                   purchaseDetails: newUniqueKeys ? assignedDetails : updated.purchaseDetails,\n                   initialStock: p.initialStock ?? p.stock\n                 };`;

if (code.includes(purchaseMatcher)) {
  code = code.replace(purchaseMatcher, purchaseReplacement);
}

fs.writeFileSync('src/App.tsx', code);
