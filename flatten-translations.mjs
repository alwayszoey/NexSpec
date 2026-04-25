import fs from 'fs';

const file = 'src/translations.ts';
let content = fs.readFileSync(file, 'utf-8');

// Replace { vi: "...", th: "..." } with just "..." 
content = content.replace(/\{\s*vi:\s*(".*?"|`[\s\S]*?`),\s*th:\s*(".*?"|`[\s\S]*?`)\s*\}/g, '$2');

fs.writeFileSync(file, content);
