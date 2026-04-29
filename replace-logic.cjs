const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add States
if (!code.includes('isNotificationOpen')) {
  code = code.replace(
    /const \[currentUser, setCurrentUser\]([^]+?);/,
    `const [currentUser, setCurrentUser]$1;\n  const [isNotificationOpen, setIsNotificationOpen] = useState(false);\n  const [notifications, setNotifications] = useState<any[]>([]);`
  );
}

// 2. Modify handlePurchaseConfirm
const handlePurchaseConfirmMatcher = `      // Simulate a purchase delay or call real payment API if needed\n      setTimeout(async () => {\n         let assignedDetails = selectedItem.purchaseDetails || 'ไม่พบรายละเอียด';`;

const handlePurchaseConfirmReplacement = `      const alreadyPurchased = currentUser?.history?.find((h: any) => h.id === selectedItem.id && h.type === 'purchase');

      // Simulate a purchase delay or call real payment API if needed\n      setTimeout(async () => {\n         if (alreadyPurchased) {\n            setSelectedItem({ ...selectedItem, purchaseDetails: alreadyPurchased.details });\n            setIsProcessingOrder(false);\n            setShowOrderConfirmModal(false);\n            \n            setNotifications(prev => [{\n               id: Date.now().toString(),\n               text: \`คุณได้สั่งซื้อสินค้านี้ไปแล้ว (\${getLocalized(selectedItem.title)})\`,\n               date: new Date()\n            }, ...prev]);\n            \n            setShowPurchaseSuccessModal(true);\n            setIsNotificationOpen(true);\n            return;\n         }\n         \n         let assignedDetails = selectedItem.purchaseDetails || 'ไม่พบรายละเอียด';`;

if (code.includes(handlePurchaseConfirmMatcher)) {
  code = code.replace(handlePurchaseConfirmMatcher, handlePurchaseConfirmReplacement);
}

// 3. Add Component at bottom
const UI = `
        {/* ============================================================================ */}
        {/* 📌 ระบบแจ้งเตือน (Notifications) */}
        {/* ============================================================================ */}
        <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col items-end">
          <div className={\`mb-3 w-auto max-w-[calc(100vw-2rem)] rounded-xl bg-zinc-950/95 backdrop-blur-sm shadow-xl transform-gpu transition-all duration-300 ease-out pointer-events-auto \${isNotificationOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-95 pointer-events-none'}\`} style={{ width: '330px' }}>
            <div className="flex items-center justify-between px-3 py-2">
              <h4 className="th text-base font-semibold text-white">ประกาศแจ้งเตือน</h4>
              <button onClick={() => setIsNotificationOpen(false)} className="inline-flex shrink-0 items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 rounded-md gap-1.5 px-3 bg-red-600 text-white hover:bg-red-500" type="button">
                <X className="w-4 h-4" /> ปิดแจ้งเตือน
              </button>
            </div>
            <div className="hide-scrollbar max-h-[60vh] overflow-y-auto p-2 space-y-2">
              {notifications.length === 0 ? (
                <div className="text-sm text-text-muted text-center py-8">ยังไม่มีประกาศ</div>
              ) : (
                notifications.map((n) => (
                   <div key={n.id} className="p-3 bg-card-bg/20 rounded-lg text-sm text-white shadow-sm border border-border-subtle/50">
                     <div className="font-medium">{n.text}</div>
                     <div className="text-xs text-text-muted mt-1">{new Date(n.date).toLocaleString('th-TH')}</div>
                   </div>
                ))
              )}
            </div>
          </div>
          <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 text-black size-9 pointer-events-auto relative h-16 w-16 rounded-full p-0 overflow-visible border border-zinc-800/70 bg-black/80 shadow-lg cursor-pointer hover:scale-105 active:scale-95 hover:bg-zinc-800/90 focus:outline-none" type="button">
            <img alt="notification button" className="h-full w-full object-contain p-1" loading="eager" src="/media/view?d=cPNNzeeOzMtzioI7A1-J8Pc0&amp;e=1777453037&amp;s=046998a9bf3e63e26004b485878fca3136a9ebc65e27078afab5ed9b53193b03" />
            {notifications.length > 0 && !isNotificationOpen && (
               <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-black" />
            )}
          </button>
        </div>
      </AnimatePresence>
    </div>
  );
}
`;

code = code.replace(/<\/AnimatePresence>\s*<\/div>\s*\);\s*}/g, UI);

fs.writeFileSync('src/App.tsx', code);
