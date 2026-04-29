const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add import
if (!code.includes('announcementsData')) {
  code = code.replace(
    /import \{ resourcesData, ResourceItem, categoriesData \} from '\.\/data';/,
    "import { resourcesData, ResourceItem, categoriesData, announcementsData } from './data';"
  );

  // 2. Init notifications
  code = code.replace(
    /const \[notifications, setNotifications\] = useState<any\[\]>\(\[\]\);/,
    "const [notifications, setNotifications] = useState<any[]>(announcementsData.slice().reverse());"
  );
}

fs.writeFileSync('src/App.tsx', code);
