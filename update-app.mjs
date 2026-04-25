import fs from 'fs';

const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf-8');

// Replace `getLocalized` with a simple passthrough
content = content.replace(/const getLocalized = \([\s\S]*?\} \?: string \=\> \{\n[\s\S]*?\n  \};/, "const getLocalized = (val: string | undefined): string => val || '';");
// If that failed due to regex mismatch, let's just do a string replace:
content = content.replace(
  `  const getLocalized = (val: string | { vi: string, th: string } | undefined): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val[lang || 'vi'] || val['vi'];
  };`, 
  `  const getLocalized = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val['th'] || val['vi'] || '';
  };`
);
// It's safer to just return a string since data.ts is flattened

// Replace `const t = ...`
content = content.replace(
  `  const t = (key: keyof typeof translations) => {
    return translations[key]?.[lang || 'vi'] || translations[key]?.['vi'];
  };`,
  `  const t = (key: keyof typeof translations) => {
    return translations[key] || key;
  };`
);

// Replace lang state
content = content.replace(
  `const [lang, setLang] = useState<'vi' | 'th'>(() => (localStorage.getItem('appLang') as 'vi'|'th') || 'vi');`,
  `const lang = 'th'; // Hardcoded th fallback just in case`
);

// Replace default language setting
content = content.replace(
  `      setLang('th');
      localStorage.setItem('appLang', 'th');`,
  ``
);

// Replace "Assets Hub" stuff
content = content.replace(/Assets Hub Fanpage/g, 'Zorix Shop Fanpage');
content = content.replace(/@assetshub\.th/g, '@zorix.shop');
content = content.replace(/Assets Community/g, 'Zorix Community');
content = content.replace(/Assets Hub/gi, 'Zorix Shop');

fs.writeFileSync(file, content);
