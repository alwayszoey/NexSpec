const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove states
code = code.replace(/  const \[isNotificationOpen, setIsNotificationOpen\] = useState\(false\);\n  const \[notifications, setNotifications\] = useState<any\[\]>\(announcementsData\.slice\(\)\.reverse\(\)\);\n/, '');

// 2. Remove from purchase confirm
const purchaseNotifications = `            setNotifications(prev => [{
               id: Date.now().toString(),
               text: \`คุณได้สั่งซื้อสินค้านี้ไปแล้ว (\${getLocalized(selectedItem.title)})\`,
               date: new Date()
            }, ...prev]);
            
            setShowPurchaseSuccessModal(true);
            setIsNotificationOpen(true);`;
const purchaseReplacement = `            setShowPurchaseSuccessModal(true);`;
code = code.replace(purchaseNotifications, purchaseReplacement);

// 3. Remove UI
const uiStart = `        {/* ============================================================================ */}
        {/* 📌 ระบบแจ้งเตือน (Notifications) */}`;
const uiEnd = `        </div>
      </AnimatePresence>`;
code = code.substring(0, code.indexOf(uiStart)) + `      </AnimatePresence>`;

fs.writeFileSync('src/App.tsx', code);
