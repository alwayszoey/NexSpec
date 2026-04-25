import fs from 'fs';

const file = 'src/data.ts';
let content = fs.readFileSync(file, 'utf-8');

// Replace standard { vi: "...", th: "..." }
content = content.replace(/\{\s*vi:\s*(".*?"|`[\s\S]*?`),\s*th:\s*(".*?"|`[\s\S]*?`)\s*\}/g, '$2');
// Also remove `export interface LocalizedString { vi: string; th: string; }`
content = content.replace(/export interface LocalizedString \{\s*vi: string;\s*th: string;\s*\}/, '');
// And `export type StringOrObj = string | LocalizedString;` -> `export type StringOrObj = string;`
content = content.replace(/export type StringOrObj = string \| LocalizedString;/, 'export type StringOrObj = string;');

fs.writeFileSync(file, content);
