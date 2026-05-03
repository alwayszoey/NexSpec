import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Trash2, Edit, Plus, X, Search, Image as ImageIcon, Save, LogOut } from 'lucide-react';
import { ResourceItem, categoriesData } from '../data';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');

  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [editingItem, setEditingItem] = useState<ResourceItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/resources');
      const data = await res.json();
      if (data.success && Array.isArray(data.resources)) {
        setResources(data.resources.map((r: any) => ({ ...r, id: r._id || r.id })));
      }

      const resCat = await fetch('/api/categories');
      const dataCat = await resCat.json();
      if (dataCat.success && Array.isArray(dataCat.categories)) {
        setCategories(dataCat.categories.map((c: any) => ({ ...c, id: c._id || c.id })));
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string | number) => {
    if (!confirm('ยืนยันการลบสินค้านี้?')) return;
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const res = await fetch(`/api/admin/resources/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setResources(resources.filter(r => r.id !== id));
      }
    } catch(err) {
      console.error('Delete error', err);
    }
  };

  const handleDeleteCategory = async (id: string | number) => {
    if (!confirm('ยืนยันการลบหมวดหมู่นี้?')) return;
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setCategories(categories.filter(c => c.id !== id));
      }
    } catch(err) {
      console.error('Delete error', err);
    }
  };

  const getLoc = (val: any) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val['th'] || val['en'] || val['vi'] || '';
  };

  const filteredResources = resources.filter(r => getLoc(r.title).toLowerCase().includes(search.toLowerCase()));
  const filteredCategories = categories.filter(c => getLoc(c.name).toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-[1200px] mx-auto px-4 py-8 w-full"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">แอดมินแดชบอร์ด</h1>
            <p className="text-text-muted text-sm mt-1">จัดการทรัพยากรและหมวดหมู่</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {resources.length === 0 && categories.length === 0 && (
            <button 
              onClick={async () => {
                try {
                  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                  for (let item of ((window as any).__INITIAL_DATA__ || [])) {
                    await fetch('/api/admin/resources', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify({...item, id: undefined})
                    });
                  }
                  for (let cat of ((window as any).__INITIAL_CATEGORIES__ || [])) {
                    await fetch('/api/admin/categories', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify({...cat, id: undefined})
                    });
                  }
                  alert('จำลองข้อมูลให้เรียบร้อยแล้ว แนะนำให้ Refresh ระบบ');
                  loadData();
                } catch(e) { console.error(e); }
              }}
              className="flex items-center gap-2 bg-text-muted/10 text-text-main px-4 py-2 rounded-xl font-medium hover:bg-text-muted/20 shadow-sm"
            >
              Seed Data (นำเข้าข้อมูลตั้งต้น)
            </button>
          )}
          {activeTab === 'products' ? (
            <button 
              onClick={() => { setIsAdding(true); setEditingItem({ id: '', title: '', category: categories.length > 0 ? categories[0].name : 'ALL', price: 0, originalPrice: 0, imageUrl: '', isNew: false, isOutOfStock: false, tags: [], shortDescription: '', downloadUrl: '' } as any); }}
              className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-xl font-medium hover:opacity-90 shadow-sm"
            >
              <Plus className="w-4 h-4" /> เพิ่มสินค้าใหม่
            </button>
          ) : (
            <button 
              onClick={() => { setIsAddingCategory(true); setEditingCategory({ id: '', name: '', description: '', imageUrl: '' }); }}
              className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-xl font-medium hover:opacity-90 shadow-sm"
            >
              <Plus className="w-4 h-4" /> เพิ่มหมวดหมู่
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-border-subtle">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-1 font-semibold transition-colors border-b-2 ${activeTab === 'products' ? 'text-brand border-brand' : 'text-text-muted border-transparent hover:text-text-main'}`}
        >
          จัดการสินค้า
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 px-1 font-semibold transition-colors border-b-2 ${activeTab === 'categories' ? 'text-brand border-brand' : 'text-text-muted border-transparent hover:text-text-main'}`}
        >
          จัดการหมวดหมู่
        </button>
      </div>

      <div className="bg-card-bg border border-border-subtle rounded-2xl p-4 shadow-sm mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder={activeTab === 'products' ? "ค้นหาสินค้า..." : "ค้นหาหมวดหมู่..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-app border border-border-subtle rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-text-muted">กำลังโหลดข้อมูล...</div>
      ) : activeTab === 'products' ? (
        <div className="grid gap-4">
          {filteredResources.map(item => (
            <div key={item.id} className="bg-card-bg border border-border-subtle rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
              <img src={item.imageUrl} alt="" className="w-20 h-20 rounded-xl object-cover border border-border-subtle shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded flex items-center bg-brand/10 text-brand line-clamp-1">{item.category}</span>
                  {item.isOutOfStock && <span className="text-xs font-semibold px-2 py-0.5 rounded flex items-center bg-red-100 text-red-600">หมด</span>}
                </div>
                <h3 className="font-bold text-lg truncate text-text-main">{getLoc(item.title)}</h3>
                <p className="text-sm text-text-muted truncate">{getLoc(item.shortDescription)}</p>
                <div className="mt-2 text-sm font-semibold text-text-main">
                  {Number(item.price) > 0 ? (
                      `฿${Number(item.price).toLocaleString()}`
                  ) : <span className="text-green-600">ฟรี</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 sm:mt-0">
                <button 
                  onClick={() => { setIsAdding(false); setEditingItem(item); }}
                  className="bg-bg-app border border-border-subtle hover:text-brand px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {filteredResources.length === 0 && <div className="text-center py-10 text-text-muted">ไม่พบสินค้า</div>}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCategories.map(cat => (
            <div key={cat.id} className="bg-card-bg border border-border-subtle rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
              <img src={cat.imageUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e"} alt="" className="w-20 h-20 rounded-xl object-cover border border-border-subtle shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate text-text-main">{getLoc(cat.name)}</h3>
                <p className="text-sm text-text-muted truncate">{getLoc(cat.description)}</p>
              </div>
              <div className="flex items-center gap-2 mt-4 sm:mt-0">
                <button 
                  onClick={() => { setIsAddingCategory(false); setEditingCategory(cat); }}
                  className="bg-bg-app border border-border-subtle hover:text-brand px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {filteredCategories.length === 0 && <div className="text-center py-10 text-text-muted">ไม่พบหมวดหมู่</div>}
        </div>
      )}

      {/* MODAL: ADD / EDIT */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
               onClick={() => setEditingItem(null)}
            />
            <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative bg-card-bg w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
               <div className="p-5 border-b border-border-subtle flex items-center justify-between bg-bg-app">
                 <h2 className="text-lg font-bold text-text-main">
                   {isAdding ? 'เพิ่มสินค้าใหม่' : `แก้ไข: ${getLoc(editingItem.title)}`}
                 </h2>
                 <button onClick={() => setEditingItem(null)} className="w-8 h-8 rounded-full bg-border-subtle/50 flex items-center justify-center hover:bg-border-subtle"><X className="w-4 h-4" /></button>
               </div>
               
               <div className="p-5 overflow-y-auto w-full flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-semibold text-text-muted mb-1 text-left">ชื่อสินค้า <span className="text-red-500">*</span></label>
                       <input type="text" value={getLoc(editingItem.title)} onChange={e => setEditingItem({...editingItem, title: e.target.value})} className="w-full bg-bg-app border border-border-subtle rounded-xl px-4 py-2.5 text-sm" placeholder="Ex: Script A" />
                     </div>
                     <div>
                       <label className="block text-xs font-semibold text-text-muted mb-1 text-left">หมวดหมู่ <span className="text-red-500">*</span></label>
                       <select value={editingItem.category} onChange={e => setEditingItem({...editingItem, category: e.target.value})} className="w-full bg-bg-app border border-border-subtle rounded-xl px-4 py-2.5 text-sm outline-none">
                         {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                       </select>
                     </div>
                     <div>
                       <label className="block text-xs font-semibold text-text-muted mb-1 text-left">รายละเอียดแบบย่อ</label>
                       <input type="text" value={getLoc(editingItem.shortDescription)} onChange={e => setEditingItem({...editingItem, shortDescription: e.target.value})} className="w-full bg-bg-app border border-border-subtle rounded-xl px-4 py-2.5 text-sm" />
                     </div>
                     <div>
                       <label className="block text-xs font-semibold text-text-muted mb-1 text-left">รูปภาพประกอบ (URL) <span className="text-red-500">*</span></label>
                       <div className="relative">
                         <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                         <input type="text" value={editingItem.imageUrl} onChange={e => setEditingItem({...editingItem, imageUrl: e.target.value})} className="w-full bg-bg-app border border-border-subtle rounded-xl pl-9 pr-4 py-2.5 text-sm" placeholder="https://..." />
                       </div>
                     </div>
                     <div>
                       <label className="block text-xs font-semibold text-text-muted mb-1 text-left">ประเภทปุ่ม <span className="text-red-500">*</span></label>
                       <select value={editingItem.actionType || 'download'} onChange={e => setEditingItem({...editingItem, actionType: e.target.value as any})} className="w-full bg-bg-app border border-border-subtle rounded-xl px-4 py-2.5 text-sm outline-none">
                         <option value="download">ปุ่ม - Download</option>
                         <option value="link">ปุ่ม - Get Link (ผ่านเว็บย่อลิงก์)</option>
                         <option value="purchase">ปุ่ม - สั่งซื้อสินค้า</option>
                       </select>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-semibold text-text-muted mb-1 text-left">ราคา (บาท) <span className="text-red-500">*</span></label>
                       <input type="number" min="0" value={editingItem.price === undefined ? 0 : editingItem.price} onChange={e => setEditingItem({...editingItem, price: parseFloat(e.target.value) || 0})} className="w-full bg-bg-app border border-border-subtle rounded-xl px-4 py-2 text-sm text-brand font-semibold" />
                     </div>
                     <div>
                       <label className="block text-xs font-semibold text-text-muted mb-1 text-left">ราคาเดิม (ก่อนลด) (บาท)</label>
                       <input type="number" min="0" value={editingItem.originalPrice === undefined ? 0 : editingItem.originalPrice} onChange={e => setEditingItem({...editingItem, originalPrice: parseFloat(e.target.value) || 0})} className="w-full bg-bg-app border border-border-subtle rounded-xl px-4 py-2 text-sm text-text-muted line-through" />
                     </div>
                  </div>

                  <div>
                     <label className="block text-xs font-semibold text-text-muted mb-1 text-left">รายละเอียดแบบยาว (รองรับ Markdown)</label>
                     <textarea value={getLoc(editingItem.description || editingItem.fullDescription)} onChange={e => setEditingItem({...editingItem, description: e.target.value, fullDescription: e.target.value})} className="w-full h-32 bg-bg-app border border-border-subtle rounded-xl px-4 py-2.5 text-sm resize-y font-mono text-[13px]" placeholder="ข้อมูลเพิ่มเติมเกี่ยวกับสินค้า..." />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1 text-left">Tags (คั่นด้วย ,)</label>
                    <input type="text" value={(editingItem.tags || []).join(', ')} onChange={e => setEditingItem({...editingItem, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})} className="w-full bg-bg-app border border-border-subtle rounded-xl px-4 py-2.5 text-sm" placeholder="Game, Action, RPG" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                     <div>
                       <label className="block text-xs font-semibold text-text-muted mb-1 text-left">ลิงก์ดาวน์โหลด (ใส่เมื่อต้องการแจกฟรี/ดาวน์โหลดได้เลย)</label>
                       <input type="text" value={editingItem.downloadUrl || ''} onChange={e => setEditingItem({...editingItem, downloadUrl: e.target.value})} className="w-full bg-bg-app border border-border-subtle rounded-xl px-4 py-2.5 text-sm" placeholder="https://" />
                     </div>
                     <div>
                       <label className="block text-xs font-semibold text-text-muted mb-1 text-left">ลิงก์เป้าหมาย (สำหรับ Get Link)</label>
                       <input type="text" value={editingItem.targetLink || ''} onChange={e => setEditingItem({...editingItem, targetLink: e.target.value})} className="w-full bg-bg-app border border-border-subtle rounded-xl px-4 py-2.5 text-sm" placeholder="https://" />
                     </div>
                     <div>
                       <label className="block text-xs font-semibold text-text-muted mb-1 text-left">ข้อมูลหลังการสั่งซื้อ (สำหรับ Purchase)</label>
                       <input type="text" value={editingItem.purchaseDetails || ''} onChange={e => setEditingItem({...editingItem, purchaseDetails: e.target.value})} className="w-full bg-bg-app border border-border-subtle rounded-xl px-4 py-2.5 text-sm" placeholder="Thank you..." />
                     </div>
                  </div>

                  <div className="flex items-center gap-6 mt-2 pb-4">
                     <label className="flex items-center gap-2 text-sm cursor-pointer">
                       <input type="checkbox" checked={editingItem.isNew || false} onChange={e => setEditingItem({...editingItem, isNew: e.target.checked})} className="w-4 h-4 accent-brand cursor-pointer" />
                       <span className="font-medium">สินค้าเข้าใหม่ (New)</span>
                     </label>
                     <label className="flex items-center gap-2 text-sm cursor-pointer">
                       <input type="checkbox" checked={editingItem.isOutOfStock || false} onChange={e => setEditingItem({...editingItem, isOutOfStock: e.target.checked})} className="w-4 h-4 accent-brand cursor-pointer" />
                       <span className="font-medium">ของหมด (Out of Stock)</span>
                     </label>
                  </div>
               </div>

               <div className="p-5 border-t border-border-subtle bg-bg-app flex justify-end gap-3 mt-auto">
                 <button onClick={() => setEditingItem(null)} className="px-5 py-2.5 rounded-xl font-medium border border-border-subtle hover:bg-card-bg transition-colors">ยกเลิก</button>
                 <button 
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                      const mth = isAdding ? 'POST' : 'PATCH';
                      const url = isAdding ? '/api/admin/resources' : `/api/admin/resources/${editingItem.id}`;
                      
                      const submitData = { ...editingItem };
                      if (isAdding) delete submitData.id;

                      const res = await fetch(url, {
                        method: mth,
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}` 
                        },
                        body: JSON.stringify(submitData)
                      });
                      if (res.ok) {
                        alert(isAdding ? 'เพิ่มสินค้าสำเร็จ' : 'อัปเดตสินค้าสำเร็จ');
                        setEditingItem(null);
                        loadData(); // reload DB manually
                      } else {
                        const err = await res.json();
                        alert('Error: ' + JSON.stringify(err));
                      }
                    } catch(e) {
                      console.error(e);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl font-medium bg-brand text-white hover:opacity-90 transition-colors flex items-center gap-2"
                 >
                   <Save className="w-4 h-4" /> บันทึกข้อมูล
                 </button>
               </div>
            </motion.div>
          </div>
        )}

        {editingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingCategory(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg max-h-[90vh] bg-card-bg border border-border-subtle shadow-2xl rounded-2xl flex flex-col overflow-hidden"
            >
               <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-app">
                 <h2 className="text-xl font-bold flex items-center gap-2">
                   {isAddingCategory ? 'เพิ่มหมวดหมู่ใหม่' : 'แก้ไขหมวดหมู่'}
                 </h2>
                 <button onClick={() => setEditingCategory(null)} className="p-2 hover:bg-card-bg rounded-xl text-text-muted transition-colors">
                   <X className="w-5 h-5" />
                 </button>
               </div>

               <div className="p-6 overflow-y-auto w-full space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1">ชื่อหมวดหมู่ (ภาษาอังกฤษ/สั้นๆ)</label>
                    <input type="text" value={getLoc(editingCategory.name)} onChange={e => setEditingCategory({...editingCategory, name: e.target.value})} className="w-full bg-bg-app border border-border-subtle rounded-xl px-4 py-2.5 text-sm" placeholder="Script" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1">รายละเอียด</label>
                    <input type="text" value={getLoc(editingCategory.description)} onChange={e => setEditingCategory({...editingCategory, description: e.target.value})} className="w-full bg-bg-app border border-border-subtle rounded-xl px-4 py-2.5 text-sm" placeholder="สคริปต์ต่างๆ" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1">รูปภาพหมวดหมู่ (URL)</label>
                    <input type="text" value={editingCategory.imageUrl} onChange={e => setEditingCategory({...editingCategory, imageUrl: e.target.value})} className="w-full bg-bg-app border border-border-subtle rounded-xl px-4 py-2.5 text-sm" placeholder="https://..." />
                  </div>
               </div>

               <div className="p-5 border-t border-border-subtle bg-bg-app flex justify-end gap-3 mt-auto">
                 <button onClick={() => setEditingCategory(null)} className="px-5 py-2.5 rounded-xl font-medium border border-border-subtle hover:bg-card-bg transition-colors">ยกเลิก</button>
                 <button 
                  onClick={async () => {
                    try {
                      if (!editingCategory.name) return alert('กรุณาใส่ชื่อหมวดหมู่');
                      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                      const mth = isAddingCategory ? 'POST' : 'PATCH'; // But wait, we didn't add PATCH in API yet? We did POST and DELETE.
                      // Wait, we didn't do PATCH for category! I'll add it if it doesn't exist. Actually, let me check the API for PATCH /api/admin/categories/:id. Wait I only added GET, POST, DELETE.
                      // No problem, I can do POST/DELETE for categories for now if PATCH isn't available, but let's assume PATCH is missing and we'll add it.
                      const url = isAddingCategory ? '/api/admin/categories' : `/api/admin/categories/${editingCategory.id}`;
                      
                      const submitData = { ...editingCategory };
                      if (isAddingCategory) delete submitData.id;

                      const res = await fetch(url, {
                        method: mth,
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}` 
                        },
                        body: JSON.stringify(submitData)
                      });
                      if (res.ok) {
                        alert(isAddingCategory ? 'เพิ่มหมวดหมู่สำเร็จ' : 'อัปเดตหมวดหมู่สำเร็จ');
                        setEditingCategory(null);
                        loadData();
                      } else {
                        const err = await res.json();
                        alert('Error: ' + JSON.stringify(err));
                      }
                    } catch(e) {
                      console.error(e);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl font-medium bg-brand text-white hover:opacity-90 transition-colors flex items-center gap-2"
                 >
                   <Save className="w-4 h-4" /> บันทึกหมวดหมู่
                 </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
