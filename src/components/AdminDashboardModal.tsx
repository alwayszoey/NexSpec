import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Settings as SettingsIcon,
  Users as UsersIcon,
  ShieldCheck,
  Plus,
  Trash2,
  Edit3,
  Save,
  RefreshCw,
  Search,
  AlertTriangle,
  Sparkles,
  Palette,
  Globe,
  Database,
  Cpu,
  X,
  ExternalLink,
  Check,
  CheckCircle2,
  Tag,
  DollarSign,
  Video,
  Image as ImageIcon,
  FileText,
  Lock,
  Layers,
  ArrowRight,
  ChevronRight,
  Eye,
  Download,
  AlertCircle,
  Activity,
  Server,
  Terminal,
  Radio,
  Sliders,
  CheckSquare,
  Copy,
  FolderPlus,
  Star,
  Flame,
  Share2,
} from "lucide-react";
import { ResourceItem, DownloadLink, CategoryItem } from "../data";

export interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  siteSettings?: any;
  onUpdateSiteSettings?: (newSettings: any) => void;
  onSettingsUpdate?: (newSettings: any) => void;
  onRefreshResources?: () => void;
  onResourcesUpdate?: () => void;
}

export const PRESET_THEME_COLORS = [
  { name: "น้ำเงินคลาสสิก (Blue)", hex: "#3b82f6" },
  { name: "ฟ้าไซเบอร์ (Cyan)", hex: "#06b6d4" },
  { name: "ม่วงนีออน (Purple)", hex: "#8b5cf6" },
  { name: "เขียวมรกต (Emerald)", hex: "#10b981" },
  { name: "ส้มอำพัน (Amber)", hex: "#f59e0b" },
  { name: "ชมพูกุหลาบ (Rose)", hex: "#f43f5e" },
  { name: "อินดิโก้เข้ม (Indigo)", hex: "#6366f1" },
  { name: "แดงเพลิง (Red)", hex: "#ef4444" },
];

export const safeString = (val: any): string => {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    if (typeof val.th === "string" && val.th.trim()) return val.th;
    if (typeof val.en === "string" && val.en.trim()) return val.en;
    const first = Object.values(val)[0];
    if (typeof first === "string") return first;
    return "";
  }
  return String(val);
};

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  siteSettings: initialSiteSettings,
  onUpdateSiteSettings,
  onSettingsUpdate,
  onRefreshResources,
  onResourcesUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "categories" | "settings" | "users" | "system">("overview");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Overview / Metrics state
  const [metrics, setMetrics] = useState<any>(null);

  // Products state
  const [adminResources, setAdminResources] = useState<any[]>([]);
  const [searchProduct, setSearchProduct] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Categories state
  const [adminCategories, setAdminCategories] = useState<CategoryItem[]>([]);
  const [searchCategory, setSearchCategory] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    id: "",
    categoryId: "",
    name: "",
    description: "",
    imageUrl: "",
    isPopular: false,
    isRecommended: false,
    sortOrder: 0,
  });

  // Product Form state
  const [formData, setFormData] = useState({
    itemId: "",
    title: "",
    category: "Script",
    price: "0",
    actionType: "link" as "link" | "purchase",
    shortDescription: "",
    fullDescription: "",
    imageUrl: "",
    videoUrl: "",
    link: "",
    purchaseDetails: "",
    warning: "",
    tags: "",
    fileSize: "",
    isPopular: false,
    isFeatured: false,
    isOutOfStock: false,
    requiresLogin: false,
    downloadLinks: [{ label: "ดาวน์โหลดหลัก", url: "" }] as DownloadLink[],
  });

  // Settings state
  const [settingsForm, setSettingsForm] = useState({
    name: "Zorix Shop",
    logoUrl: "",
    slogan: "",
    primaryColor: "#3b82f6",
    bannerImageUrl: "",
    promoPopupImageUrl: "",
    announcementText: "",
    announcementEnabled: true,
    announcementLink: "",
    socials: {
      discord: "",
      facebook: "",
      line: "",
      youtube: "",
      tiktok: "",
      instagram: "",
    },
    footerText: "",
  });

  // Users state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [searchUser, setSearchUser] = useState("");
  const [selectedUserHistory, setSelectedUserHistory] = useState<any | null>(null);

  // Custom Confirmation Dialog State (Replaces window.confirm which fails in iframe)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Master Admin Security Gate (Strictly cpjustink@gmail.com)
  const isMasterUser = currentUser?.email?.toLowerCase() === "cpjustink@gmail.com";
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return isMasterUser || sessionStorage.getItem("admin_dashboard_master_unlocked") === "true";
  });
  const [securityEmail, setSecurityEmail] = useState("");
  const [securityPin, setSecurityPin] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (isMasterUser) {
      setIsUnlocked(true);
      sessionStorage.setItem("admin_dashboard_master_unlocked", "true");
    }
  }, [currentUser, isMasterUser]);

  const handleSecurityUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setSecurityError("");

    setTimeout(() => {
      const email = securityEmail.trim().toLowerCase();
      const pin = securityPin.trim().toUpperCase();

      const isMaster = email === "cpjustink@gmail.com" || currentUser?.email?.toLowerCase() === "cpjustink@gmail.com";
      const isValidPin = pin === "ZORIX-9921" || pin === "ADMIN" || pin === "ZORIX";

      if (isMaster && isValidPin) {
        setIsUnlocked(true);
        sessionStorage.setItem("admin_dashboard_master_unlocked", "true");
        showToast("success", "ปลดล็อกเข้าสู่ระบบจัดการหลังบ้าน Master Admin สำเร็จ");
      } else {
        setSecurityError("ปฏิเสธการเข้าถึง: แดชบอร์ดนี้จำกัดเฉพาะบัญชี Master (cpjustink@gmail.com) และต้องใช้ Master PIN ที่ถูกต้อง");
      }
      setIsAuthenticating(false);
    }, 400);
  };

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const triggerSettingsUpdate = (newSettings: any) => {
    if (typeof onUpdateSiteSettings === "function") onUpdateSiteSettings(newSettings);
    if (typeof onSettingsUpdate === "function") onSettingsUpdate(newSettings);
  };

  const triggerResourcesUpdate = () => {
    if (typeof onRefreshResources === "function") onRefreshResources();
    if (typeof onResourcesUpdate === "function") onResourcesUpdate();
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "x-admin-token": "zorix-admin-secret-token",
    };
  };

  // Fetch metrics
  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/metrics", { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMetrics(data);
        }
      }
    } catch (err) {
      console.error("Error fetching metrics:", err);
    }
  }, []);

  // Fetch products
  const fetchAdminResources = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/resources", { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAdminResources(data.resources || []);
        }
      }
    } catch (err) {
      console.error("Error fetching admin resources:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories
  const fetchAdminCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories", { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.categories)) {
          setAdminCategories(data.categories);
        }
      }
    } catch (err) {
      console.error("Error fetching admin categories:", err);
    }
  }, []);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings", { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setSettingsForm({
            name: data.settings.name || "Zorix Shop",
            logoUrl: data.settings.logoUrl || "",
            slogan: data.settings.slogan || "",
            primaryColor: data.settings.primaryColor || "#3b82f6",
            bannerImageUrl: data.settings.bannerImageUrl || "",
            promoPopupImageUrl: data.settings.promoPopupImageUrl || "",
            announcementText: data.settings.announcementText || "",
            announcementEnabled: data.settings.announcementEnabled !== undefined ? data.settings.announcementEnabled : true,
            announcementLink: data.settings.announcementLink || "",
            socials: {
              discord: data.settings.socials?.discord || "",
              facebook: data.settings.socials?.facebook || "",
              line: data.settings.socials?.line || "",
              youtube: data.settings.socials?.youtube || "",
              tiktok: data.settings.socials?.tiktok || "",
              instagram: data.settings.socials?.instagram || "",
            },
            footerText: data.settings.footerText || "",
          });
        }
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  }, []);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users", { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUsersList(data.users || []);
        }
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchMetrics();
      fetchAdminResources();
      fetchAdminCategories();
      fetchSettings();
      fetchUsers();
    }
  }, [isOpen, fetchMetrics, fetchAdminResources, fetchAdminCategories, fetchSettings, fetchUsers]);

  // Initial settings sync
  useEffect(() => {
    if (initialSiteSettings) {
      setSettingsForm((prev) => ({
        ...prev,
        name: initialSiteSettings.name || prev.name,
        logoUrl: initialSiteSettings.logoUrl || prev.logoUrl,
        slogan: initialSiteSettings.slogan || prev.slogan,
        primaryColor: initialSiteSettings.primaryColor || prev.primaryColor,
        bannerImageUrl: initialSiteSettings.bannerImageUrl || prev.bannerImageUrl,
        promoPopupImageUrl: initialSiteSettings.promoPopupImageUrl || prev.promoPopupImageUrl,
        announcementText: initialSiteSettings.announcementText !== undefined ? initialSiteSettings.announcementText : prev.announcementText,
        announcementEnabled: initialSiteSettings.announcementEnabled !== undefined ? initialSiteSettings.announcementEnabled : prev.announcementEnabled,
        announcementLink: initialSiteSettings.announcementLink || prev.announcementLink,
        socials: {
          ...prev.socials,
          ...(initialSiteSettings.socials || {}),
        },
        footerText: initialSiteSettings.footerText || prev.footerText,
      }));
    }
  }, [initialSiteSettings]);

  // ----------------------------------------------------
  // Category Management Handlers
  // ----------------------------------------------------
  const handleOpenCategoryModal = (cat?: CategoryItem) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryFormData({
        id: cat.id,
        categoryId: cat.categoryId || cat.id,
        name: cat.name,
        description: cat.description || "",
        imageUrl: cat.imageUrl || "",
        isPopular: Boolean(cat.isPopular),
        isRecommended: Boolean(cat.isRecommended),
        sortOrder: cat.sortOrder || 0,
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({
        id: "",
        categoryId: `cat-${Date.now().toString(36)}`,
        name: "",
        description: "",
        imageUrl: "https://img1.pic.in.th/images/2000x600_20260602154514.png",
        isPopular: false,
        isRecommended: false,
        sortOrder: adminCategories.length + 1,
      });
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) {
      showToast("error", "กรุณาระบุชื่อหมวดหมู่");
      return;
    }

    try {
      setLoading(true);
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id || editingCategory.categoryId}`
        : `/api/admin/categories`;
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryFormData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("success", data.message || "บันทึกหมวดหมู่สำเร็จ");
        setIsCategoryModalOpen(false);
        fetchAdminCategories();
        triggerResourcesUpdate();
      } else {
        showToast("error", data.error || "เกิดข้อผิดพลาดในการบันทึกหมวดหมู่");
      }
    } catch (err: any) {
      showToast("error", err.message || "เชื่อมต่อกับเซิร์ฟเวอร์ล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "ยืนยันการลบหมวดหมู่",
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่ "${name}"? สินค้าที่อยู่ในหมวดหมู่นี้จะไม่ถูกลบ`,
      confirmText: "ลบหมวดหมู่",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          setLoading(true);
          // Optimistic local state update
          setAdminCategories((prev) =>
            prev.filter((c) => (c.id || c.categoryId || c.name) !== id)
          );
          const res = await fetch(`/api/admin/categories/${encodeURIComponent(id)}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast("success", "ลบหมวดหมู่สำเร็จ");
            fetchAdminCategories();
            triggerResourcesUpdate();
          } else {
            showToast("error", data.error || "ลบหมวดหมู่ไม่สำเร็จ");
            fetchAdminCategories();
          }
        } catch (err: any) {
          showToast("error", err.message || "เชื่อมต่อเซิร์ฟเวอร์ล้มเหลว");
          fetchAdminCategories();
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // ----------------------------------------------------
  // Product Management Handlers
  // ----------------------------------------------------
  const handleOpenProductModal = (prod?: any) => {
    if (prod) {
      setEditingProduct(prod);
      setFormData({
        itemId: prod.itemId || prod.id,
        title: safeString(prod.title),
        category: prod.category || (adminCategories[0]?.name || "Script"),
        price: prod.price ? String(prod.price) : "0",
        actionType: prod.actionType || "link",
        shortDescription: safeString(prod.shortDescription),
        fullDescription: safeString(prod.fullDescription),
        imageUrl: prod.imageUrl || "",
        videoUrl: prod.videoUrl || "",
        link: prod.link || "",
        purchaseDetails: prod.purchaseDetails || "",
        warning: safeString(prod.warning),
        tags: Array.isArray(prod.tags) ? prod.tags.join(", ") : safeString(prod.tags),
        fileSize: prod.fileSize || "",
        isPopular: Boolean(prod.isPopular),
        isFeatured: Boolean(prod.isFeatured),
        isOutOfStock: Boolean(prod.isOutOfStock),
        requiresLogin: Boolean(prod.requiresLogin),
        downloadLinks:
          Array.isArray(prod.downloadLinks) && prod.downloadLinks.length > 0
            ? prod.downloadLinks
            : [{ label: "ดาวน์โหลดหลัก", url: prod.link || "" }],
      });
    } else {
      setEditingProduct(null);
      setFormData({
        itemId: `item-${Date.now().toString(36)}`,
        title: "",
        category: adminCategories[0]?.name || "Script",
        price: "0",
        actionType: "link",
        shortDescription: "",
        fullDescription: "",
        imageUrl: "",
        videoUrl: "",
        link: "",
        purchaseDetails: "",
        warning: "",
        tags: "script, mod, safe",
        fileSize: "15 MB",
        isPopular: false,
        isFeatured: false,
        isOutOfStock: false,
        requiresLogin: false,
        downloadLinks: [{ label: "ดาวน์โหลดหลัก", url: "" }],
      });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("error", "กรุณาระบุชื่อสินค้า");
      return;
    }

    const targetId = editingProduct
      ? (editingProduct.itemId || editingProduct.id || formData.itemId)
      : (formData.itemId || `item-${Date.now().toString(36)}`);

    const validDownloadLinks = formData.downloadLinks.filter((l) => l.url.trim() !== "");
    const primaryLink = validDownloadLinks[0]?.url || formData.link || "";

    const payload = {
      ...formData,
      itemId: targetId,
      id: targetId,
      link: primaryLink,
      tags: typeof formData.tags === "string"
        ? formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : Array.isArray(formData.tags)
        ? formData.tags
        : [],
      downloadLinks: validDownloadLinks,
    };

    try {
      setLoading(true);
      const url = editingProduct
        ? `/api/admin/resources/${encodeURIComponent(targetId)}`
        : `/api/admin/resources`;
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("success", data.message || "บันทึกสินค้าสำเร็จ");
        setIsProductModalOpen(false);

        // Optimistic instant state update for immediate responsive UI feedback
        const savedResource = data.resource || { ...payload, id: targetId, itemId: targetId };
        setAdminResources((prev) => {
          const idx = prev.findIndex((p) => (p.itemId || p.id) === targetId);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...savedResource };
            return next;
          }
          return [savedResource, ...prev];
        });

        fetchAdminResources();
        triggerResourcesUpdate();
      } else {
        showToast("error", data.error || "เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (err: any) {
      showToast("error", err.message || "เชื่อมต่อกับเซิร์ฟเวอร์ล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = (id: string, title: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "ยืนยันการลบสินค้า",
      message: `คุณต้องการลบสินค้า "${title}" หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`,
      confirmText: "ลบสินค้า",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          setLoading(true);
          // Immediate optimistic UI update
          setAdminResources((prev) =>
            prev.filter((p) => (p.itemId || p.id) !== id && p.title !== title)
          );
          const res = await fetch(`/api/admin/resources/${encodeURIComponent(id)}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast("success", "ลบสินค้าสำเร็จ");
            fetchAdminResources();
            triggerResourcesUpdate();
          } else {
            showToast("error", data.error || "ลบสินค้าไม่สำเร็จ");
            fetchAdminResources();
          }
        } catch (err: any) {
          showToast("error", err.message || "เชื่อมต่อเซิร์ฟเวอร์ล้มเหลว");
          fetchAdminResources();
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleClearAllProducts = () => {
    setConfirmDialog({
      isOpen: true,
      title: "⚠️ ยืนยันลบสินค้าทั้งหมด",
      message: "คำเตือน: คุณต้องการลบสินค้าทั้งหมดในระบบจริงหรือไม่? การกระทำนี้จะล้างแคตตาล็อกสินค้าทั้งหมดและไม่สามารถย้อนกลับได้",
      confirmText: "ล้างสินค้าทั้งหมด",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          setLoading(true);
          setAdminResources([]);
          const res = await fetch("/api/admin/resources/clear-all", {
            method: "POST",
            headers: getAuthHeaders(),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast("success", "ลบสินค้าทั้งหมดสำเร็จ");
            fetchAdminResources();
            triggerResourcesUpdate();
          } else {
            showToast("error", data.error || "ลบสินค้าทั้งหมดไม่สำเร็จ");
            fetchAdminResources();
          }
        } catch (err: any) {
          showToast("error", err.message || "เชื่อมต่อเซิร์ฟเวอร์ล้มเหลว");
          fetchAdminResources();
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // ----------------------------------------------------
  // Site Settings Handlers
  // ----------------------------------------------------
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(settingsForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("success", "บันทึกการตั้งค่าเว็บไซต์สำเร็จ");
        triggerSettingsUpdate(data.settings);
      } else {
        showToast("error", data.error || "บันทึกไม่สำเร็จ");
      }
    } catch (err: any) {
      showToast("error", err.message || "เชื่อมต่อเซิร์ฟเวอร์ล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // Cache & System Handlers
  // ----------------------------------------------------
  const handleFlushCache = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/cache/flush", {
        method: "POST",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("success", "ล้างแคชระบบเรียบร้อยแล้ว");
        fetchMetrics();
      }
    } catch (err: any) {
      showToast("error", "ล้างแคชล้มเหลว: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // User Management Handlers
  // ----------------------------------------------------
  const handleDeleteUser = (id: string, username: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "ยืนยันการลบผู้ใช้",
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ "${username}" ออกจากระบบ?`,
      confirmText: "ลบผู้ใช้",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          setLoading(true);
          setUsersList((prev) => prev.filter((u) => (u.id || u._id) !== id && u.username !== username));
          const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast("success", "ลบผู้ใช้สำเร็จ");
            fetchUsers();
          } else {
            showToast("error", data.error || "ลบผู้ใช้ไม่สำเร็จ");
            fetchUsers();
          }
        } catch (err: any) {
          showToast("error", err.message || "เชื่อมต่อเซิร์ฟเวอร์ล้มเหลว");
          fetchUsers();
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Filtered lists
  const filteredProducts = useMemo(() => {
    return adminResources.filter((prod) => {
      const matchSearch =
        safeString(prod.title).toLowerCase().includes(searchProduct.toLowerCase()) ||
        safeString(prod.shortDescription).toLowerCase().includes(searchProduct.toLowerCase()) ||
        (prod.itemId && prod.itemId.toLowerCase().includes(searchProduct.toLowerCase()));
      const matchCat =
        selectedCategoryFilter === "all" || prod.category?.toLowerCase() === selectedCategoryFilter.toLowerCase();
      return matchSearch && matchCat;
    });
  }, [adminResources, searchProduct, selectedCategoryFilter]);

  const filteredCategories = useMemo(() => {
    return adminCategories.filter((cat) => {
      return (
        cat.name.toLowerCase().includes(searchCategory.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchCategory.toLowerCase()) ||
        cat.id.toLowerCase().includes(searchCategory.toLowerCase())
      );
    });
  }, [adminCategories, searchCategory]);

  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      return (
        u.username?.toLowerCase().includes(searchUser.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchUser.toLowerCase()) ||
        u.role?.toLowerCase().includes(searchUser.toLowerCase())
      );
    });
  }, [usersList, searchUser]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-md animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-[200] px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-sm font-medium animate-slideIn ${
            toastMessage.type === "success"
              ? "bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20"
              : "bg-red-500 text-white border-red-400 shadow-red-500/20"
          }`}
        >
          {toastMessage.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Admin Card Modal */}
      <div className="bg-card-bg text-text-main w-full max-w-[1400px] h-[92vh] max-h-[900px] rounded-[24px] sm:rounded-[32px] border border-border-subtle shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header Bar */}
        <header className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-card-bg/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand border border-brand/20 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6 text-brand" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-text-main m-0 leading-tight">ระบบจัดการหลังบ้าน (Master Dashboard)</h2>
                <span className="bg-brand/15 text-brand text-[11px] font-bold px-2 py-0.5 rounded-full border border-brand/30">
                  MASTER ONLY
                </span>
              </div>
              <p className="text-xs text-text-muted m-0 mt-0.5">
                บัญชีผู้ดูแลหลัก (Master): <span className="text-brand font-semibold">cpjustink@gmail.com</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUnlocked && (
              <button
                onClick={() => {
                  fetchMetrics();
                  fetchAdminResources();
                  fetchAdminCategories();
                  fetchSettings();
                  fetchUsers();
                  showToast("success", "รีเฟรชข้อมูลล่าสุดแล้ว");
                }}
                className="p-2.5 rounded-xl bg-bg-app hover:bg-border-subtle text-text-muted hover:text-text-main border border-border-subtle transition-all cursor-pointer"
                title="รีเฟรชข้อมูล"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand" : ""}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-bg-app hover:bg-danger hover:text-white text-text-muted border border-border-subtle transition-all cursor-pointer"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {!isUnlocked ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-bg-app/40 overflow-y-auto">
            <div className="bg-card-bg w-full max-w-[480px] p-8 rounded-[28px] border border-border-subtle shadow-2xl text-center">
              <div className="w-16 h-16 rounded-3xl bg-brand/10 border border-brand/20 text-brand flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand/10">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-text-main mb-2">เข้าสู่ระบบ Master Admin</h3>
              <p className="text-xs leading-relaxed text-text-muted mb-6">
                แดชบอร์ดหลังบ้านนี้จำกัดสิทธิ์เฉพาะบัญชี Master (<strong className="text-brand">cpjustink@gmail.com</strong>) เท่านั้น กรุณายืนยันตัวตนเพื่อเข้าถึงแผงควบคุม
              </p>

              {securityError && (
                <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2.5 text-left">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{securityError}</span>
                </div>
              )}

              <form onSubmit={handleSecurityUnlock} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5">
                    อีเมล Master Account
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="cpjustink@gmail.com"
                    value={securityEmail}
                    onChange={(e) => setSecurityEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-bg-app border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 text-text-main"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5">
                    Master PIN / Security Key
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="ระบุรหัส PIN ปลดล็อก (เช่น ZORIX-9921)"
                    value={securityPin}
                    onChange={(e) => setSecurityPin(e.target.value)}
                    className="w-full px-4 py-3 bg-bg-app border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 text-text-main font-mono"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-1/3 py-3 rounded-xl text-xs font-semibold bg-bg-app hover:bg-border-subtle text-text-muted border border-border-subtle cursor-pointer transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-2/3 py-3 rounded-xl text-xs font-bold bg-brand hover:brightness-110 text-white shadow-lg shadow-brand/25 cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    {isAuthenticating ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>ปลดล็อกสิทธิ์ Master</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <>

        {/* Navigation Tabs */}
        <nav className="px-6 py-2.5 border-b border-border-subtle bg-bg-app/40 flex items-center gap-2 overflow-x-auto hide-scrollbar shrink-0">
          {[
            { id: "overview", label: "ภาพรวมระบบ", icon: LayoutDashboard },
            { id: "products", label: `สินค้า (${adminResources.length})`, icon: Package },
            { id: "categories", label: `หมวดหมู่ (${adminCategories.length})`, icon: FolderTree },
            { id: "settings", label: "ตั้งค่าเว็บไซต์", icon: SettingsIcon },
            { id: "users", label: `สมาชิก (${usersList.length})`, icon: UsersIcon },
            { id: "system", label: "เซิร์ฟเวอร์ & แคช", icon: Cpu },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-brand text-white shadow-md shadow-brand/20"
                    : "text-text-muted hover:text-text-main hover:bg-card-bg border border-transparent hover:border-border-subtle"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-bg-app/30">
          
          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW */}
          {/* ========================================================================= */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: "สินค้าทั้งหมด", val: adminResources.length, unit: "ชิ้น", icon: Package, color: "text-blue-500 bg-blue-500/10" },
                  { label: "หมวดหมู่", val: adminCategories.length, unit: "หมวด", icon: FolderTree, color: "text-indigo-500 bg-indigo-500/10" },
                  { label: "สมาชิกทั้งหมด", val: metrics?.counts?.users || usersList.length, unit: "คน", icon: UsersIcon, color: "text-purple-500 bg-purple-500/10" },
                  { label: "ยอดเข้าชม", val: (metrics?.counts?.views || 0).toLocaleString(), unit: "ครั้ง", icon: Eye, color: "text-cyan-500 bg-cyan-500/10" },
                  { label: "ยอดโหลด/สั่งซื้อ", val: (metrics?.counts?.downloads || 0).toLocaleString(), unit: "ครั้ง", icon: Download, color: "text-emerald-500 bg-emerald-500/10" },
                  { label: "สถานะฐานข้อมูล", val: metrics?.db?.state || "Connected", unit: "", icon: Database, color: "text-amber-500 bg-amber-500/10" },
                ].map((st, i) => {
                  const Icon = st.icon;
                  return (
                    <div key={i} className="bg-card-bg p-4 rounded-2xl border border-border-subtle shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-text-muted">{st.label}</span>
                        <div className={`p-2 rounded-xl ${st.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-text-main">{st.val}</span>
                        {st.unit && <span className="text-xs text-text-muted">{st.unit}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions & System Highlights */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Fast Action Box */}
                <div className="bg-card-bg p-6 rounded-2xl border border-border-subtle shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-text-main mb-1 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-brand" /> เมนูลัดการจัดการ
                    </h3>
                    <p className="text-xs text-text-muted mb-4">เพิ่มสินค้าหรือหมวดหมู่ใหม่ได้ทันทีจากที่นี่</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => { setActiveTab("products"); handleOpenProductModal(); }}
                        className="p-3 bg-brand text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 hover:brightness-110 shadow-md shadow-brand/20 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> เพิ่มสินค้าใหม่
                      </button>
                      <button
                        onClick={() => { setActiveTab("categories"); handleOpenCategoryModal(); }}
                        className="p-3 bg-indigo-600 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 hover:brightness-110 shadow-md shadow-indigo-600/20 cursor-pointer"
                      >
                        <FolderPlus className="w-4 h-4" /> เพิ่มหมวดหมู่
                      </button>
                      <button
                        onClick={() => setActiveTab("settings")}
                        className="p-3 bg-bg-app hover:bg-border-subtle border border-border-subtle text-text-main font-semibold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Palette className="w-4 h-4 text-brand" /> ปรับแต่งสี/ธีม
                      </button>
                      <button
                        onClick={handleFlushCache}
                        className="p-3 bg-bg-app hover:bg-border-subtle border border-border-subtle text-text-main font-semibold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4 text-emerald-500" /> ล้างแคชระบบ
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
                    <span>Uptime: <span className="font-semibold text-text-main">{metrics?.uptime ? `${Math.round(metrics.uptime)}s` : "-"}</span></span>
                    <span>Database: <span className="font-semibold text-emerald-500">{metrics?.db?.engine || "MongoDB"}</span></span>
                  </div>
                </div>

                {/* Categories Summary */}
                <div className="bg-card-bg p-6 rounded-2xl border border-border-subtle shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                      <FolderTree className="w-5 h-5 text-indigo-500" /> หมวดหมู่ที่มีสินค้า
                    </h3>
                    <button
                      onClick={() => setActiveTab("categories")}
                      className="text-xs font-semibold text-brand hover:underline"
                    >
                      จัดการหมวดหมู่ทั้งหมด →
                    </button>
                  </div>
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px] pr-1">
                    {adminCategories.length === 0 ? (
                      <p className="text-xs text-text-muted py-6 text-center">ยังไม่มีหมวดหมู่</p>
                    ) : (
                      adminCategories.map((c) => {
                        const count = adminResources.filter((r) => r.category === c.name).length;
                        return (
                          <div key={c.id} className="p-3 rounded-xl bg-bg-app border border-border-subtle flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg overflow-hidden bg-card-bg border border-border-subtle shrink-0 flex items-center justify-center">
                                {c.imageUrl && c.imageUrl.trim() ? (
                                  <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                                ) : (
                                  <FolderPlus className="w-4 h-4 text-text-muted opacity-50" />
                                )}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-text-main leading-tight">{c.name}</h4>
                                <p className="text-[11px] text-text-muted line-clamp-1">{c.description || "ไม่มีคำอธิบาย"}</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand/10 text-brand">
                              {count} ชิ้น
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Latest Products */}
                <div className="bg-card-bg p-6 rounded-2xl border border-border-subtle shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-500" /> สินค้าล่าสุด
                    </h3>
                    <button
                      onClick={() => setActiveTab("products")}
                      className="text-xs font-semibold text-brand hover:underline"
                    >
                      ดูทั้งหมด →
                    </button>
                  </div>
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px] pr-1">
                    {adminResources.slice(0, 4).map((item) => (
                      <div key={item.itemId || item.id} className="p-3 rounded-xl bg-bg-app border border-border-subtle flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-card-bg border border-border-subtle shrink-0 flex items-center justify-center">
                            {item.imageUrl && item.imageUrl.trim() ? (
                              <img src={item.imageUrl} alt="preview" className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-4 h-4 text-text-muted opacity-50" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-text-main truncate">{safeString(item.title)}</h4>
                            <p className="text-[11px] text-text-muted">{item.category} • {item.price || "Free"}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab("products");
                            handleOpenProductModal(item);
                          }}
                          className="p-1.5 rounded-lg bg-card-bg hover:bg-border-subtle text-text-muted hover:text-brand border border-border-subtle"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {adminResources.length === 0 && (
                      <p className="text-xs text-text-muted py-6 text-center">ยังไม่มีสินค้าในระบบ</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PRODUCTS MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === "products" && (
            <div className="space-y-4">
              {/* Product Top Action Bar */}
              <div className="bg-card-bg p-4 rounded-2xl border border-border-subtle shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-72">
                    <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="ค้นหาสินค้า (ชื่อ, คำอธิบาย, รหัส)..."
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-bg-app border border-border-subtle rounded-xl text-sm text-text-main focus:outline-none focus:border-brand"
                    />
                  </div>

                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="py-2 px-3 bg-bg-app border border-border-subtle rounded-xl text-sm text-text-main focus:outline-none focus:border-brand"
                  >
                    <option value="all">ทุกหมวดหมู่ ({adminResources.length})</option>
                    {adminCategories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={handleClearAllProducts}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-danger bg-danger/10 hover:bg-danger hover:text-white border border-danger/20 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> ล้างทั้งหมด
                  </button>
                  <button
                    onClick={() => handleOpenProductModal()}
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-brand text-white hover:brightness-110 shadow-md shadow-brand/20 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> เพิ่มสินค้าใหม่
                  </button>
                </div>
              </div>

              {/* Product Grid / Table */}
              <div className="bg-card-bg rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-text-main">
                    <thead className="bg-bg-app/80 border-b border-border-subtle text-xs font-semibold text-text-muted uppercase">
                      <tr>
                        <th className="p-4">รูปภาพ</th>
                        <th className="p-4">ชื่อสินค้า</th>
                        <th className="p-4">หมวดหมู่</th>
                        <th className="p-4">ราคา / ประเภท</th>
                        <th className="p-4">สถิติแยกรายชิ้น</th>
                        <th className="p-4">สถานะ / ป้ายกำกับ</th>
                        <th className="p-4 text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-text-muted">
                            ไม่พบสินค้าที่ตรงกับเงื่อนไขการค้นหา
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => {
                          const title = safeString(p.title);
                          const desc = safeString(p.shortDescription);
                          return (
                            <tr key={p.itemId || p.id} className="hover:bg-bg-app/50 transition-colors">
                              <td className="p-4 w-20">
                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-bg-app border border-border-subtle flex items-center justify-center">
                                  {p.imageUrl && p.imageUrl.trim() ? (
                                    <img src={p.imageUrl} alt={title} className="w-full h-full object-cover" />
                                  ) : (
                                    <Package className="w-6 h-6 text-text-muted opacity-40" />
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="font-bold text-text-main line-clamp-1">{title}</div>
                                <div className="text-xs text-text-muted line-clamp-1">{desc}</div>
                                <div className="text-[11px] text-text-muted/60 mt-0.5">ID: {p.itemId || p.id}</div>
                              </td>
                              <td className="p-4">
                                <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand/10 text-brand">
                                  {p.category}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="font-bold text-text-main">{p.price || "Free"}</div>
                                <div className="text-xs text-text-muted">
                                  {p.actionType === "purchase" ? "🛒 จำหน่าย (ซื้อ)" : "🔗 รับลิงก์ดาวน์โหลด"}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex flex-col gap-1 text-xs">
                                  <span className="flex items-center gap-1.5 text-cyan-500 font-medium">
                                    <Eye className="w-3.5 h-3.5 shrink-0" />
                                    <span>{(p.views || 0).toLocaleString()} วิว</span>
                                  </span>
                                  <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
                                    <Download className="w-3.5 h-3.5 shrink-0" />
                                    <span>{(p.downloads || 0).toLocaleString()} {p.actionType === "purchase" ? "ยอดซื้อ" : "ยอดโหลด"}</span>
                                  </span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex flex-wrap gap-1">
                                  {p.isPopular && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                      ฮิต
                                    </span>
                                  )}
                                  {p.isFeatured && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                      แนะนำ
                                    </span>
                                  )}
                                  {p.isOutOfStock && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                                      หมด
                                    </span>
                                  )}
                                  {p.requiresLogin && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                      ต้องล็อกอิน
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleOpenProductModal(p)}
                                    className="p-2 rounded-xl bg-bg-app hover:bg-brand hover:text-white text-text-muted border border-border-subtle transition-all cursor-pointer"
                                    title="แก้ไขสินค้า"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(p.itemId || p.id, title)}
                                    className="p-2 rounded-xl bg-bg-app hover:bg-danger hover:text-white text-text-muted border border-border-subtle transition-all cursor-pointer"
                                    title="ลบสินค้า"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CATEGORIES MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === "categories" && (
            <div className="space-y-4">
              {/* Category Top Action Bar */}
              <div className="bg-card-bg p-4 rounded-2xl border border-border-subtle shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 w-full sm:w-80">
                  <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ค้นหาหมวดหมู่..."
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-bg-app border border-border-subtle rounded-xl text-sm text-text-main focus:outline-none focus:border-brand"
                  />
                </div>

                <button
                  onClick={() => handleOpenCategoryModal()}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:brightness-110 shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <FolderPlus className="w-4 h-4" /> เพิ่มหมวดหมู่ใหม่
                </button>
              </div>

              {/* Categories Grid Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.length === 0 ? (
                  <div className="col-span-full p-12 text-center text-text-muted bg-card-bg rounded-2xl border border-border-subtle">
                    ไม่พบหมวดหมู่ที่ตรงกับการค้นหา
                  </div>
                ) : (
                  filteredCategories.map((cat) => {
                    const itemCount = adminResources.filter((r) => r.category === cat.name).length;
                    return (
                      <div
                        key={cat.id}
                        className="bg-card-bg rounded-2xl border border-border-subtle shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
                      >
                        <div>
                          <div className="relative h-32 w-full bg-zinc-950 overflow-hidden flex items-center justify-center">
                            {cat.imageUrl && cat.imageUrl.trim() ? (
                              <img
                                src={cat.imageUrl}
                                alt={cat.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <FolderPlus className="w-12 h-12 text-zinc-600 opacity-40" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                            
                            <div className="absolute top-3 right-3 flex items-center gap-1.5">
                              {cat.isRecommended && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand text-white shadow-sm flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-white" /> แนะนำ
                                </span>
                              )}
                              {cat.isPopular && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-sm flex items-center gap-1">
                                  <Flame className="w-3 h-3 fill-white" /> ยอดฮิต
                                </span>
                              )}
                            </div>

                            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                              <h3 className="text-lg font-bold text-white drop-shadow-md leading-none m-0">
                                {cat.name}
                              </h3>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30">
                                {itemCount} สินค้า
                              </span>
                            </div>
                          </div>

                          <div className="p-4">
                            <p className="text-xs text-text-muted line-clamp-2 min-h-[32px]">
                              {cat.description || "ไม่มีคำอธิบายสำหรับหมวดหมู่นี้"}
                            </p>
                            <div className="mt-3 text-[11px] text-text-muted/70 font-mono">
                              ID: {cat.categoryId || cat.id}
                            </div>
                          </div>
                        </div>

                        <div className="p-3 border-t border-border-subtle bg-bg-app/50 flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenCategoryModal(cat)}
                            className="px-3 py-1.5 rounded-xl bg-card-bg hover:bg-brand hover:text-white text-text-muted border border-border-subtle text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> แก้ไข
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id || cat.categoryId || cat.name, cat.name)}
                            className="px-3 py-1.5 rounded-xl bg-card-bg hover:bg-danger hover:text-white text-text-muted border border-border-subtle text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> ลบ
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: SITE SETTINGS */}
          {/* ========================================================================= */}
          {activeTab === "settings" && (
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
              {/* Brand & Theme Colors */}
              <div className="bg-card-bg p-6 rounded-2xl border border-border-subtle shadow-sm space-y-4">
                <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                  <Palette className="w-5 h-5 text-brand" /> สีแบรนด์และธีมหลักของเว็บไซต์ (Accent Color)
                </h3>
                <p className="text-xs text-text-muted">
                  เปลี่ยนสีหลักของปุ่ม ลิงก์ และสเตตัสทั้งระบบได้ทันที
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {PRESET_THEME_COLORS.map((clr) => (
                    <button
                      key={clr.hex}
                      type="button"
                      onClick={() => setSettingsForm({ ...settingsForm, primaryColor: clr.hex })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        settingsForm.primaryColor.toLowerCase() === clr.hex.toLowerCase()
                          ? "border-brand bg-brand/10 shadow-sm"
                          : "border-border-subtle hover:bg-bg-app"
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: clr.hex }} />
                      <span className="text-text-main">{clr.name}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="text-xs font-semibold text-text-muted">หรือกรอกโค้ด HEX:</label>
                  <input
                    type="text"
                    value={settingsForm.primaryColor}
                    onChange={(e) => setSettingsForm({ ...settingsForm, primaryColor: e.target.value })}
                    className="w-32 px-3 py-1.5 bg-bg-app border border-border-subtle rounded-xl text-sm font-mono text-text-main focus:outline-none focus:border-brand"
                  />
                  <div
                    className="w-8 h-8 rounded-xl border border-border-subtle shadow-inner"
                    style={{ backgroundColor: settingsForm.primaryColor }}
                  />
                </div>
              </div>

              {/* General Site Information */}
              <div className="bg-card-bg p-6 rounded-2xl border border-border-subtle shadow-sm space-y-4">
                <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-500" /> ข้อมูลทั่วไปของเว็บไซต์
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1">ชื่อร้าน / เว็บไซต์</label>
                    <input
                      type="text"
                      value={settingsForm.name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-bg-app border border-border-subtle rounded-xl text-sm text-text-main focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1">สโลแกนใต้ชื่อร้าน</label>
                    <input
                      type="text"
                      value={settingsForm.slogan}
                      onChange={(e) => setSettingsForm({ ...settingsForm, slogan: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-bg-app border border-border-subtle rounded-xl text-sm text-text-main focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1">URL รูปภาพโลโก้</label>
                    <input
                      type="text"
                      value={settingsForm.logoUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-bg-app border border-border-subtle rounded-xl text-sm text-text-main focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1">URL แบนเนอร์หน้าแรก</label>
                    <input
                      type="text"
                      value={settingsForm.bannerImageUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bannerImageUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-bg-app border border-border-subtle rounded-xl text-sm text-text-main focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-text-muted mb-1">URL รูปภาพป๊อปอัปโปรโมชัน (Promo Popup)</label>
                    <input
                      type="text"
                      value={settingsForm.promoPopupImageUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, promoPopupImageUrl: e.target.value })}
                      placeholder="ใส่ URL รูปภาพโปรโมชันเมื่อผู้ใช้เข้าเว็บ"
                      className="w-full px-3.5 py-2.5 bg-bg-app border border-border-subtle rounded-xl text-sm text-text-main focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>
              </div>

              {/* Announcement Bar */}
              <div className="bg-card-bg p-6 rounded-2xl border border-border-subtle shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                    <Radio className="w-5 h-5 text-amber-500" /> แถบประกาศวิ่งด้านบน (Announcement Marquee)
                  </h3>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.announcementEnabled}
                      onChange={(e) => setSettingsForm({ ...settingsForm, announcementEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-brand focus:ring-brand"
                    />
                    <span>เปิดใช้งานแถบประกาศ</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-text-muted mb-1">ข้อความประกาศ</label>
                    <input
                      type="text"
                      value={settingsForm.announcementText}
                      onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-bg-app border border-border-subtle rounded-xl text-sm text-text-main focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-text-muted mb-1">ลิงก์คลิกไปเมื่อแตะแถบประกาศ (ไม่บังคับ)</label>
                    <input
                      type="text"
                      value={settingsForm.announcementLink}
                      onChange={(e) => setSettingsForm({ ...settingsForm, announcementLink: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 bg-bg-app border border-border-subtle rounded-xl text-sm text-text-main focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>
              </div>

              {/* Social Channels */}
              <div className="bg-card-bg p-6 rounded-2xl border border-border-subtle shadow-sm space-y-4">
                <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-purple-500" /> ช่องทางโซเชียลมีเดีย (Social Links)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.keys(settingsForm.socials).map((soc) => (
                    <div key={soc}>
                      <label className="block text-xs font-semibold text-text-muted capitalize mb-1">{soc}</label>
                      <input
                        type="text"
                        value={(settingsForm.socials as any)[soc] || ""}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            socials: {
                              ...settingsForm.socials,
                              [soc]: e.target.value,
                            },
                          })
                        }
                        placeholder={`https://${soc}.com/...`}
                        className="w-full px-3 py-2 bg-bg-app border border-border-subtle rounded-xl text-xs text-text-main focus:outline-none focus:border-brand"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Text */}
              <div className="bg-card-bg p-6 rounded-2xl border border-border-subtle shadow-sm space-y-2">
                <label className="block text-xs font-semibold text-text-muted">ข้อความท้ายเว็บ (Footer Copyright)</label>
                <input
                  type="text"
                  value={settingsForm.footerText}
                  onChange={(e) => setSettingsForm({ ...settingsForm, footerText: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-bg-app border border-border-subtle rounded-xl text-sm text-text-main focus:outline-none focus:border-brand"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-xl font-bold text-sm bg-brand text-white hover:brightness-110 shadow-lg shadow-brand/25 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> บันทึกการตั้งค่าทั้งหมด
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: USER MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="bg-card-bg p-4 rounded-2xl border border-border-subtle shadow-sm flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ค้นหาสมาชิก (Username, Email, Role)..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-bg-app border border-border-subtle rounded-xl text-sm text-text-main focus:outline-none focus:border-brand"
                  />
                </div>
                <div className="text-xs text-text-muted font-medium">
                  สมาชิกทั้งหมด: <span className="font-bold text-text-main">{usersList.length} คน</span>
                </div>
              </div>

              <div className="bg-card-bg rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-text-main">
                    <thead className="bg-bg-app/80 border-b border-border-subtle text-xs font-semibold text-text-muted uppercase">
                      <tr>
                        <th className="p-4">ผู้ใช้งาน</th>
                        <th className="p-4">อีเมล</th>
                        <th className="p-4">ผู้ให้บริการ (Provider)</th>
                        <th className="p-4">ตำแหน่ง (Role)</th>
                        <th className="p-4">ประวัติสั่งซื้อ</th>
                        <th className="p-4 text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-text-muted">
                            ไม่พบรายชื่อผู้ใช้ที่ตรงกับการค้นหา
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.id || u._id} className="hover:bg-bg-app/50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-brand/10 text-brand border border-brand/20 flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                                  {u.avatarUrl && u.avatarUrl.trim() ? (
                                    <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                                  ) : (
                                    u.username?.charAt(0) || "U"
                                  )}
                                </div>
                                <span className="font-bold text-text-main">{u.username}</span>
                              </div>
                            </td>
                            <td className="p-4 text-text-muted">{u.email}</td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-bg-app border border-border-subtle">
                                {u.provider || "credentials"}
                              </span>
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  u.role === "admin"
                                    ? "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                                    : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                }`}
                              >
                                {u.role || "user"}
                              </span>
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => setSelectedUserHistory(u)}
                                className="text-xs font-semibold text-brand hover:underline cursor-pointer"
                              >
                                {Array.isArray(u.history) ? u.history.length : 0} รายการ
                              </button>
                            </td>
                            <td className="p-4 text-right">
                              {u.role !== "admin" && (
                                <button
                                  onClick={() => handleDeleteUser(u.id || u._id, u.username)}
                                  className="p-1.5 rounded-lg bg-bg-app hover:bg-danger hover:text-white text-text-muted border border-border-subtle transition-all cursor-pointer"
                                  title="ลบสมาชิก"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: SYSTEM & SERVER */}
          {/* ========================================================================= */}
          {activeTab === "system" && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-card-bg p-6 rounded-2xl border border-border-subtle shadow-sm space-y-4">
                <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-500" /> สุขภาพและสถานะการทำงานของระบบ (System Health)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-bg-app border border-border-subtle">
                    <span className="text-xs text-text-muted block mb-1">Database Engine</span>
                    <span className="text-base font-bold text-text-main">{metrics?.db?.engine || "MongoDB"}</span>
                    <span className="text-xs text-emerald-500 block mt-1">Status: {metrics?.db?.state || "Connected"}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-bg-app border border-border-subtle">
                    <span className="text-xs text-text-muted block mb-1">RAM Memory RSS</span>
                    <span className="text-base font-bold text-text-main">{metrics?.memory?.rss || "Normal"}</span>
                    <span className="text-xs text-text-muted block mt-1">Heap: {metrics?.memory?.heapUsed || "0 MB"}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-bg-app border border-border-subtle">
                    <span className="text-xs text-text-muted block mb-1">Server Uptime</span>
                    <span className="text-base font-bold text-text-main">{metrics?.uptime ? `${Math.round(metrics.uptime)} วินาที` : "Running"}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-bg-app border border-border-subtle">
                    <span className="text-xs text-text-muted block mb-1">In-Memory Cache Items</span>
                    <span className="text-base font-bold text-text-main">{metrics?.cache?.keys || 0} keys</span>
                  </div>
                </div>
              </div>

              {/* Maintenance Tools */}
              <div className="bg-card-bg p-6 rounded-2xl border border-border-subtle shadow-sm space-y-4">
                <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-brand" /> เครื่องมือบำรุงรักษาระบบ (Maintenance Tools)
                </h3>

                <div className="flex items-center justify-between p-4 rounded-xl bg-bg-app border border-border-subtle">
                  <div>
                    <h4 className="text-sm font-bold text-text-main">ล้าง Memory Cache</h4>
                    <p className="text-xs text-text-muted">รีเซ็ตและล้างข้อมูลที่เก็บไว้ชั่วคราวในแคช เพื่อให้โหลดข้อมูลใหม่จากฐานข้อมูลทันที</p>
                  </div>
                  <button
                    onClick={handleFlushCache}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all shrink-0"
                  >
                    Flush Cache
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
        </>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT CATEGORY */}
      {/* ========================================================================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[180] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-card-bg text-text-main w-full max-w-[520px] rounded-[28px] border border-border-subtle shadow-2xl p-6 relative">
            <button
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-bg-app hover:bg-border-subtle text-text-muted hover:text-text-main"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <FolderTree className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-main m-0">
                  {editingCategory ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
                </h3>
                <p className="text-xs text-text-muted m-0">กำหนดชื่อ รูปหน้าปก และรายละเอียดหมวดหมู่</p>
              </div>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">
                  ชื่อหมวดหมู่ (Name) <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น Script, Bot, Web Template"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-bg-app border border-border-subtle rounded-xl text-sm text-text-main focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">คำอธิบายย่อ</label>
                <input
                  type="text"
                  placeholder="เช่น ศูนย์รวมสคริปต์คุณภาพสูง..."
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-bg-app border border-border-subtle rounded-xl text-sm text-text-main focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">URL รูปภาพหน้าปกหมวดหมู่</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={categoryFormData.imageUrl}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-bg-app border border-border-subtle rounded-xl text-sm text-text-main focus:outline-none focus:border-brand"
                />
              </div>

              {categoryFormData.imageUrl && categoryFormData.imageUrl.trim() && (
                <div className="h-24 rounded-xl overflow-hidden bg-bg-app border border-border-subtle">
                  <img src={categoryFormData.imageUrl} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-text-main cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryFormData.isRecommended}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, isRecommended: e.target.checked })}
                    className="w-4 h-4 rounded text-brand focus:ring-brand"
                  />
                  <span>ติดป้าย แนะนำ (Recommended)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-text-main cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryFormData.isPopular}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, isPopular: e.target.checked })}
                    className="w-4 h-4 rounded text-brand focus:ring-brand"
                  />
                  <span>ติดป้าย ยอดนิยม (Popular)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-bg-app text-text-muted hover:bg-border-subtle border border-border-subtle cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer"
                >
                  บันทึกหมวดหมู่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT PRODUCT */}
      {/* ========================================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[180] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
          <div className="bg-card-bg text-text-main w-full max-w-[700px] max-h-[90vh] rounded-[28px] border border-border-subtle shadow-2xl p-6 relative flex flex-col my-auto">
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-bg-app hover:bg-border-subtle text-text-muted hover:text-text-main"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-main m-0">
                  {editingProduct ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
                </h3>
                <p className="text-xs text-text-muted m-0">กรอกข้อมูลสินค้า ลิงก์ดาวน์โหลด และราคา</p>
              </div>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">
                    ชื่อสินค้า <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-bg-app border border-border-subtle rounded-xl text-sm text-text-main focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">หมวดหมู่</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-bg-app border border-border-subtle rounded-xl text-sm text-text-main focus:outline-none focus:border-brand"
                  >
                    {adminCategories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">ราคา (ใส่ 0 หรือ Free หากแจกฟรี)</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-bg-app border border-border-subtle rounded-xl text-sm text-text-main focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">ประเภทการทำงาน (Action Type)</label>
                  <select
                    value={formData.actionType}
                    onChange={(e) => setFormData({ ...formData, actionType: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-bg-app border border-border-subtle rounded-xl text-sm text-text-main focus:outline-none focus:border-brand"
                  >
                    <option value="link">🔗 ลิงก์ดาวน์โหลด (Link)</option>
                    <option value="purchase">🛒 สินค้าจำหน่าย (Purchase / License Key)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">คำอธิบายย่อ (Short Description)</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-bg-app border border-border-subtle rounded-xl text-sm text-text-main focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">คำอธิบายเต็ม (Full Description)</label>
                <textarea
                  rows={3}
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-bg-app border border-border-subtle rounded-xl text-sm text-text-main focus:outline-none focus:border-brand resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">URL รูปภาพสินค้า</label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-bg-app border border-border-subtle rounded-xl text-sm text-text-main focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">URL วิดีโอพรีวิว (YouTube)</label>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-bg-app border border-border-subtle rounded-xl text-sm text-text-main focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              {/* Download Links / Multi-links */}
              <div className="bg-bg-app/70 p-4 rounded-xl border border-border-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-text-main flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-brand" /> ลิงก์ดาวน์โหลดสินค้า (Download Links)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        downloadLinks: [...formData.downloadLinks, { label: "ลิงก์สำรอง", url: "" }],
                      })
                    }
                    className="text-xs font-bold text-brand hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> เพิ่มลิงก์
                  </button>
                </div>

                {formData.downloadLinks.map((dl, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="ชื่อลิงก์ (เช่น ลิงก์หลัก)"
                      value={dl.label}
                      onChange={(e) => {
                        const next = [...formData.downloadLinks];
                        next[idx].label = e.target.value;
                        setFormData({ ...formData, downloadLinks: next });
                      }}
                      className="w-36 px-3 py-1.5 bg-card-bg border border-border-subtle rounded-lg text-xs text-text-main"
                    />
                    <input
                      type="text"
                      placeholder="URL ดาวน์โหลด (https://...)"
                      value={dl.url}
                      onChange={(e) => {
                        const next = [...formData.downloadLinks];
                        next[idx].url = e.target.value;
                        setFormData({ ...formData, downloadLinks: next });
                      }}
                      className="flex-1 px-3 py-1.5 bg-card-bg border border-border-subtle rounded-lg text-xs text-text-main"
                    />
                    {formData.downloadLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const next = formData.downloadLinks.filter((_, i) => i !== idx);
                          setFormData({ ...formData, downloadLinks: next });
                        }}
                        className="p-1.5 text-danger hover:bg-danger/10 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Purchase details / License / Key info */}
              {formData.actionType === "purchase" && (
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">
                    ข้อมูลที่จะแสดงหลังสั่งซื้อสำเร็จ (Purchase Details / License Key)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="เช่น คีย์: XXXX-YYYY-ZZZZ หรือ ลิงก์เข้ากลุ่มดิสคอร์ดลับ"
                    value={formData.purchaseDetails}
                    onChange={(e) => setFormData({ ...formData, purchaseDetails: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-bg-app border border-border-subtle rounded-xl text-sm text-text-main focus:outline-none focus:border-brand font-mono"
                  />
                </div>
              )}

              {/* Status checkboxes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-text-main cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="w-4 h-4 rounded text-brand focus:ring-brand"
                  />
                  <span>ยอดฮิต</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-text-main cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-brand focus:ring-brand"
                  />
                  <span>แนะนำ</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-text-main cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isOutOfStock}
                    onChange={(e) => setFormData({ ...formData, isOutOfStock: e.target.checked })}
                    className="w-4 h-4 rounded text-brand focus:ring-brand"
                  />
                  <span>สินค้าหมด</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-text-main cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requiresLogin}
                    onChange={(e) => setFormData({ ...formData, requiresLogin: e.target.checked })}
                    className="w-4 h-4 rounded text-brand focus:ring-brand"
                  />
                  <span>ต้องล็อกอิน</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle shrink-0">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-bg-app text-text-muted hover:bg-border-subtle border border-border-subtle cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-brand text-white shadow-md hover:brightness-110 cursor-pointer"
                >
                  บันทึกสินค้า
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: USER HISTORY VIEWER */}
      {/* ========================================================================= */}
      {selectedUserHistory && (
        <div className="fixed inset-0 z-[190] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-card-bg text-text-main w-full max-w-[500px] rounded-[28px] border border-border-subtle shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedUserHistory(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-bg-app hover:bg-border-subtle text-text-muted"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-text-main mb-1">
              ประวัติการทำรายการของ {selectedUserHistory.username}
            </h3>
            <p className="text-xs text-text-muted mb-4">{selectedUserHistory.email}</p>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {Array.isArray(selectedUserHistory.history) && selectedUserHistory.history.length > 0 ? (
                selectedUserHistory.history.map((h: any, i: number) => (
                  <div key={i} className="p-3 bg-bg-app rounded-xl border border-border-subtle text-xs">
                    <div className="flex items-center justify-between font-bold text-text-main">
                      <span>{h.title}</span>
                      <span className="text-brand">{h.price || "Free"}</span>
                    </div>
                    <div className="text-text-muted mt-1">{new Date(h.date).toLocaleString("th-TH")}</div>
                    {h.details && (
                      <pre className="mt-2 p-2 bg-card-bg rounded-lg border border-border-subtle text-[11px] font-mono break-all whitespace-pre-wrap">
                        {h.details}
                      </pre>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-text-muted py-6 text-center">ยังไม่มีประวัติการทำรายการ</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CUSTOM CONFIRMATION DIALOG */}
      {/* ========================================================================= */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-card-bg text-text-main w-full max-w-[440px] rounded-[24px] border border-border-subtle shadow-2xl p-6 relative">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-text-main mb-1.5">{confirmDialog.title}</h3>
                <p className="text-xs leading-relaxed text-text-muted">{confirmDialog.message}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border-subtle">
              <button
                type="button"
                disabled={loading}
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-bg-app text-text-muted hover:bg-border-subtle border border-border-subtle cursor-pointer transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => confirmDialog.onConfirm()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 cursor-pointer transition-all flex items-center gap-2"
              >
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{confirmDialog.confirmText || "ยืนยันการลบ"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
