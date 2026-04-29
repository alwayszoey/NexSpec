const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const initMatcher = `const [products, setProducts] = useState<ResourceItem[]>(() => {`;
const initReplacement = `const CACHE_VERSION = 'v2';

  const [products, setProducts] = useState<ResourceItem[]>(() => {
    // Clear old cache version to prevent stuck maxStock issues
    if (localStorage.getItem('storeCacheVersion') !== CACHE_VERSION) {
       localStorage.removeItem('storeProducts');
       localStorage.setItem('storeCacheVersion', CACHE_VERSION);
    }`;

if (code.includes(initMatcher)) {
  code = code.replace(initMatcher, initReplacement);
}

fs.writeFileSync('src/App.tsx', code);
