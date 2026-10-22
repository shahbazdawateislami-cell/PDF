import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit, 
  RotateCcw, 
  TrendingUp, 
  ShoppingBag, 
  FileText, 
  ArrowLeft,
  X,
  Check,
  Search,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  FileCheck,
  Layers,
  AlertTriangle,
  Sparkles,
  Calendar,
  Filter,
  Clock,
  Lock,
  Eye,
  EyeOff,
  BookOpen,
  Palette,
  Link2,
  UploadCloud,
  RefreshCw,
  Zap,
  Copy,
  Share2,
  CheckCheck,
  KeyRound,
  Tag,
  Percent,
  Ticket,
  Coins
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { Product, Bundle, HeroStackedCard, HeroBannerConfig, Coupon } from '../types';
import { createBookCoverSvg, createSamplePageSvg } from '../data/coverImages';

export default function Admin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    resetToDefaults, 
    bundles,
    addBundle,
    updateBundle,
    deleteBundle,
    coupons,
    addCoupon,
    bulkAddCoupons,
    updateCoupon,
    deleteCoupon,
    resetCouponsToDefaults,
    orders, 
    downloadLogs, 
    categories,
    saveCustomPdfFile,
    heroConfig,
    updateHeroConfig,
    resetHeroConfig
  } = useProducts();
  const { isAdmin, adminLogin, toggleAdminMode } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleAdminDirectLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin(loginId, loginPassword)) {
      setLoginError('');
      setLoginId('');
      setLoginPassword('');
    } else {
      setLoginError('Galat Admin ID ya Password! Iske alawa kisi aur cheez se access allowed nahi hai.');
    }
  };

  const requestedTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'products' | 'bundles' | 'orders' | 'logs' | 'coupons' | 'hero' | 'api-keys'>(
    requestedTab === 'hero' ? 'hero' : requestedTab === 'api-keys' ? 'api-keys' : requestedTab === 'coupons' ? 'coupons' : 'products'
  );

  // Hero Banner Customization state
  const [heroBgImage, setHeroBgImage] = useState<string>('');
  const [heroBgOpacity, setHeroBgOpacity] = useState<number>(0.55);
  const [heroStackedCards, setHeroStackedCards] = useState<HeroStackedCard[]>([]);
  const [isHeroSaving, setIsHeroSaving] = useState(false);
  const [resetHeroConfirmOpen, setResetHeroConfirmOpen] = useState(false);
  const heroBgFileInputRef = useRef<HTMLInputElement>(null);
  const cardFileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    if (heroConfig) {
      setHeroBgImage(heroConfig.backgroundImage || '');
      setHeroBgOpacity(heroConfig.backgroundOverlayOpacity ?? 0.55);
      setHeroStackedCards(
        heroConfig.stackedCards && heroConfig.stackedCards.length > 0
          ? heroConfig.stackedCards
          : [
              { id: 'card-1', title: products[0]?.title || 'ChatGPT & AI Tools Master Guide', image: products[0]?.coverImage || '', link: `/product/${products[0]?.id || ''}` },
              { id: 'card-2', title: products[1]?.title || 'Canva Pro Design Mastery', image: products[1]?.coverImage || '', link: `/product/${products[1]?.id || ''}` },
              { id: 'card-3', title: products[2]?.title || 'Instagram Reels Viral Growth', image: products[2]?.coverImage || '', link: `/product/${products[2]?.id || ''}` },
              { id: 'card-4', title: products[3]?.title || 'Affiliate Marketing Zero to Hero', image: products[3]?.coverImage || '', link: `/product/${products[3]?.id || ''}` }
            ]
      );
    }
  }, [heroConfig, products]);

  const handleHeroBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('Photo size 8MB se kam honi chahiye');
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => showNotify('⚠️ Photo read karne mein error aaya');
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setHeroBgImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCardImageUpload = (cardId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('Photo size 8MB se kam honi chahiye');
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => showNotify('⚠️ Photo read karne mein error aaya');
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setHeroStackedCards((prev) =>
          prev.map((c) => (c.id === cardId ? { ...c, image: result } : c))
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCardFieldChange = (cardId: string, field: 'title' | 'image' | 'link', value: string) => {
    setHeroStackedCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, [field]: value } : c))
    );
  };

  const handleAutofillCardFromProduct = (cardId: string, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    setHeroStackedCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? {
              ...c,
              title: prod.title,
              image: prod.coverImage,
              link: `/product/${prod.id}`
            }
          : c
      )
    );
  };

  const handleSaveHeroBanner = async () => {
    setIsHeroSaving(true);
    await updateHeroConfig({
      backgroundImage: heroBgImage,
      backgroundOverlayOpacity: heroBgOpacity,
      stackedCards: heroStackedCards
    });
    setIsHeroSaving(false);
    showNotify('✓ Hero Banner aur Overlapping PDFs safalta-poorvak save ho gaye!');
  };

  const handleResetHeroBanner = async () => {
    await resetHeroConfig();
    setResetHeroConfirmOpen(false);
    showNotify('✓ Hero Banner default background aur books par reset ho gaya!');
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Sales Date Filter states
  const [salesTimeFilter, setSalesTimeFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customFilterDate, setCustomFilterDate] = useState<string>('');

  // Modal State for Add / Edit Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // In-app Delete Confirmation Modal (NO window.confirm)
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{ id: string; title: string; type: 'product' | 'bundle' } | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Bundle Add/Edit Modal
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [bundleTitle, setBundleTitle] = useState('');
  const [bundleSubtitle, setBundleSubtitle] = useState('');
  const [bundlePrice, setBundlePrice] = useState(149);
  const [bundleOldPrice, setBundleOldPrice] = useState(496);
  const [bundleBadge, setBundleBadge] = useState('SAVE 70%');
  const [bundleSelectedProducts, setBundleSelectedProducts] = useState<string[]>([]);
  const [bundleDescription, setBundleDescription] = useState('');
  const [bundleCoverImage, setBundleCoverImage] = useState('');
  const bundleFileInputRef = useRef<HTMLInputElement>(null);

  const handleBundleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      showNotify('⚠️ Image size 8MB se kam honi chahiye');
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => showNotify('⚠️ Combo cover photo read karne mein error aaya');
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBundleCoverImage(reader.result);
        showNotify('✓ Combo Cover image upload ho gayi!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Form Fields for Product
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('AI Tools');
  const [formPrice, setFormPrice] = useState<number>(99);
  const [formOldPrice, setFormOldPrice] = useState<number>(199);
  const [formRating, setFormRating] = useState<number>(4.8);
  const [formDescription, setFormDescription] = useState('');
  const [formHighlights, setFormHighlights] = useState('');
  const [formBadge, setFormBadge] = useState('Bestseller');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formPagesCount, setFormPagesCount] = useState<number>(140);
  const [formLanguage, setFormLanguage] = useState('Hindi + English');

  // Local File Upload states
  const [uploadedCoverName, setUploadedCoverName] = useState<string | null>(null);
  const [uploadedCoverFile, setUploadedCoverFile] = useState<File | null>(null);
  const [uploadedPdfName, setUploadedPdfName] = useState<string | null>(null);
  const [uploadedPdfFile, setUploadedPdfFile] = useState<File | null>(null);
  const [uploadedSampleFiles, setUploadedSampleFiles] = useState<File[]>([]);
  const [uploadedPdfData, setUploadedPdfData] = useState<string | null>(null);
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [uploadProgressPercent, setUploadProgressPercent] = useState<number>(0);
  const [pdfUploadSource, setPdfUploadSource] = useState<'device' | 'url'>('device');

  // PDF Inside Pages & Sample Material for Horizontal Carousel
  const [formSamplePages, setFormSamplePages] = useState<string[]>([]);

  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);
  const samplePagesFileInputRef = useRef<HTMLInputElement>(null);

  // Notification Toast
  const [notification, setNotification] = useState<string | null>(null);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Meta Ads / Direct Ad Link Modal
  const [adLinkModalData, setAdLinkModalData] = useState<{
    title: string;
    landingUrl: string;
    checkoutUrl: string;
    type: 'product' | 'bundle';
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyText = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showNotify(`✓ ${label} copied to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Payment Gateway / API Keys settings state
  const [apiKeyId, setApiKeyId] = useState('');
  const [apiKeySecret, setApiKeySecret] = useState('');
  const [apiWebhookSecret, setApiWebhookSecret] = useState('');
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [isSavingKeys, setIsSavingKeys] = useState(false);
  const [isKeysConfigured, setIsKeysConfigured] = useState(false);
  const [keyEnvironment, setKeyEnvironment] = useState<'test' | 'live'>('test');

  useEffect(() => {
    fetch('/api/settings/keys')
      .then((res) => res.json())
      .then((data) => {
        if (data.keyId) {
          setApiKeyId(data.keyId);
        }
        setIsKeysConfigured(!!data.isConfigured);
        setKeyEnvironment(data.environment || 'test');
      })
      .catch((err) => console.warn('Could not load api keys info:', err));
  }, []);

  const handleSaveApiKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyId.trim()) {
      showNotify('⚠️ Razorpay Key ID enter karein (e.g. rzp_live_... ya rzp_test_...)');
      return;
    }
    setIsSavingKeys(true);
    try {
      const res = await fetch('/api/settings/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId: apiKeyId.trim(),
          keySecret: apiKeySecret.trim(),
          webhookSecret: apiWebhookSecret.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setIsKeysConfigured(true);
        setKeyEnvironment(apiKeyId.trim().startsWith('rzp_live') ? 'live' : 'test');
        showNotify('✓ Razorpay API Keys safalta-poorvak save aur active ho gayi!');
      } else {
        showNotify(`⚠️ Error: ${data.error || 'Failed to save keys'}`);
      }
    } catch (err) {
      showNotify('⚠️ Server se connect karne mein error aaya');
    } finally {
      setIsSavingKeys(false);
    }
  };

  // ==========================================
  // COUPONS MANAGEMENT STATE & ACTIONS
  // ==========================================
  const [couponSearch, setCouponSearch] = useState('');
  const [couponFilterType, setCouponFilterType] = useState<'all' | 'percentage' | 'flat'>('all');
  const [couponFilterStatus, setCouponFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Single Coupon Modal
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formCouponCode, setFormCouponCode] = useState('');
  const [formCouponType, setFormCouponType] = useState<'percentage' | 'flat'>('percentage');
  const [formCouponValue, setFormCouponValue] = useState<number>(20);
  const [formCouponMinOrder, setFormCouponMinOrder] = useState<number>(0);
  const [formCouponExpiry, setFormCouponExpiry] = useState<string>('');
  const [formCouponDesc, setFormCouponDesc] = useState('');
  const [formCouponActive, setFormCouponActive] = useState<boolean>(true);

  // Bulk Add Coupons Modal
  const [isBulkCouponModalOpen, setIsBulkCouponModalOpen] = useState(false);
  const [bulkCouponsList, setBulkCouponsList] = useState<Array<{
    code: string;
    discountType: 'percentage' | 'flat';
    value: number;
    minOrder: number;
    description: string;
  }>>([
    { code: 'MASTER10', discountType: 'percentage', value: 10, minOrder: 0, description: '10% Sitewide Discount on All Guides' },
    { code: 'FIRST50', discountType: 'percentage', value: 50, minOrder: 99, description: '50% First Order Welcome Offer (Min ₹99)' },
    { code: 'FLAT50', discountType: 'flat', value: 50, minOrder: 99, description: 'Flat ₹50 Instant Rupee Savings' },
    { code: 'MEGA100', discountType: 'flat', value: 100, minOrder: 199, description: 'Flat ₹100 Mega Discount (Orders ₹199+)' },
    { code: 'FESTIVE25', discountType: 'percentage', value: 25, minOrder: 0, description: 'Festive Flash Sale 25% Off' }
  ]);

  // Delete Coupon Target
  const [couponDeleteConfirmTarget, setCouponDeleteConfirmTarget] = useState<Coupon | null>(null);

  const handleOpenAddCoupon = () => {
    setEditingCoupon(null);
    setFormCouponCode('');
    setFormCouponType('percentage');
    setFormCouponValue(20);
    setFormCouponMinOrder(0);
    setFormCouponExpiry('');
    setFormCouponDesc('');
    setFormCouponActive(true);
    setIsCouponModalOpen(true);
  };

  const handleOpenEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormCouponCode(coupon.code);
    setFormCouponType(coupon.discountType || (coupon.discountAmount ? 'flat' : 'percentage'));
    setFormCouponValue(coupon.discountType === 'flat' ? (coupon.discountAmount || 50) : (coupon.discountPercent || 10));
    setFormCouponMinOrder(coupon.minOrderAmount || 0);
    setFormCouponExpiry(coupon.expiryDate || '');
    setFormCouponDesc(coupon.description || '');
    setFormCouponActive(coupon.isActive !== false);
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = formCouponCode.trim().toUpperCase();
    if (!cleanCode) {
      showNotify('⚠️ Kripya Coupon Code enter karein (e.g. MASTER10 ya FLAT50)');
      return;
    }
    if (formCouponValue <= 0) {
      showNotify('⚠️ Discount value 0 se zyada honi chahiye');
      return;
    }

    const payload: Omit<Coupon, 'id'> = {
      code: cleanCode,
      discountType: formCouponType,
      discountPercent: formCouponType === 'percentage' ? Number(formCouponValue) : 0,
      discountAmount: formCouponType === 'flat' ? Number(formCouponValue) : 0,
      minOrderAmount: Number(formCouponMinOrder) || 0,
      expiryDate: formCouponExpiry || undefined,
      description: formCouponDesc.trim() || `${formCouponType === 'flat' ? `Flat ₹${formCouponValue} OFF` : `${formCouponValue}% OFF`} on checkout`,
      isActive: formCouponActive
    };

    if (editingCoupon && editingCoupon.id) {
      await updateCoupon(editingCoupon.id, payload);
      showNotify(`✓ Coupon "${cleanCode}" successfully update ho gaya!`);
    } else {
      await addCoupon(payload);
      showNotify(`✓ Naya Coupon "${cleanCode}" successfully add aur checkout payment se connect ho gaya!`);
    }
    setIsCouponModalOpen(false);
  };

  const handleToggleCouponActive = async (coupon: Coupon) => {
    if (!coupon.id) return;
    const newStatus = !(coupon.isActive !== false);
    await updateCoupon(coupon.id, { isActive: newStatus });
    showNotify(newStatus ? `✓ Coupon "${coupon.code}" active ho gaya!` : `⚠️ Coupon "${coupon.code}" deactivate ho gaya.`);
  };

  const handleConfirmDeleteCoupon = async () => {
    if (!couponDeleteConfirmTarget?.id) return;
    await deleteCoupon(couponDeleteConfirmTarget.id);
    showNotify(`✓ Coupon "${couponDeleteConfirmTarget.code}" successfully delete ho gaya.`);
    setCouponDeleteConfirmTarget(null);
  };

  const handleBulkAdd5Coupons = async () => {
    const couponsToAdd: Omit<Coupon, 'id'>[] = bulkCouponsList.map((item) => ({
      code: item.code.trim().toUpperCase(),
      discountType: item.discountType,
      discountPercent: item.discountType === 'percentage' ? Number(item.value) : 0,
      discountAmount: item.discountType === 'flat' ? Number(item.value) : 0,
      minOrderAmount: Number(item.minOrder) || 0,
      description: item.description,
      isActive: true,
      timesUsed: 0
    }));
    await bulkAddCoupons(couponsToAdd);
    showNotify('✓ 5 Alag-alag Coupon Codes ek sath successfully add aur checkout se connect ho gaye!');
    setIsBulkCouponModalOpen(false);
  };

  const handleResetCoupons = async () => {
    await resetCouponsToDefaults();
    showNotify('✓ Saare default coupons reset aur restore ho gaye!');
  };

  // Automatically format Google Drive or Dropbox links to direct instant download links
  const formatCloudPdfUrl = (raw: string): string => {
    const trimmed = raw.trim();
    if (!trimmed) return '';
    const driveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
    }
    const driveIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (trimmed.includes('drive.google.com') && driveIdMatch && driveIdMatch[1]) {
      return `https://drive.google.com/uc?export=download&id=${driveIdMatch[1]}`;
    }
    if (trimmed.includes('dropbox.com') && trimmed.includes('dl=0')) {
      return trimmed.replace('dl=0', 'dl=1');
    }
    return trimmed;
  };

  // Ultra-fast, non-blocking native streaming upload with real-time progress tracking
  const uploadFileToServer = (
    file: File | Blob,
    productId: string,
    fileType: 'pdf' | 'image',
    fileNameOverride?: string
  ): Promise<{ fileUrl: string; fileName: string; size?: number }> => {
    return new Promise((resolve, reject) => {
      const originalName = fileNameOverride || (file as File).name || (fileType === 'pdf' ? 'document.pdf' : 'image.jpg');
      setUploadProgressPercent(5);

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          const percent = Math.min(Math.round((event.loaded / event.total) * 100), 99);
          const loadedMb = (event.loaded / (1024 * 1024)).toFixed(1);
          const totalMb = (event.total / (1024 * 1024)).toFixed(1);
          setUploadProgressPercent(percent);
          setUploadStatusText(`Uploading ${percent}% (${loadedMb}MB / ${totalMb}MB)...`);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.fileUrl) {
              setUploadProgressPercent(100);
              resolve(data);
              return;
            }
          } catch (parseErr) {}
        }
        triggerFallback();
      };

      xhr.onerror = () => {
        triggerFallback();
      };

      xhr.ontimeout = () => {
        triggerFallback();
      };

      try {
        const formData = new FormData();
        formData.append('file', file, originalName);
        formData.append('productId', productId);
        formData.append('fileType', fileType);

        xhr.open('POST', '/api/upload-file', true);
        xhr.timeout = 60000; // 60s
        xhr.send(formData);
      } catch (sendErr) {
        triggerFallback();
      }

      function triggerFallback() {
        // Fast, asynchronous native FileReader fallback (no blocking JS loops)
        try {
          const reader = new FileReader();
          reader.onload = async () => {
            const base64Data = reader.result as string;
            setUploadProgressPercent(90);
            try {
              const res = await fetch('/api/upload-file', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  fileData: base64Data,
                  fileName: originalName,
                  fileType: file.type || (fileType === 'pdf' ? 'application/pdf' : 'image/jpeg'),
                  productId
                })
              });
              if (res.ok) {
                const data = await res.json();
                if (data.fileUrl) {
                  setUploadProgressPercent(100);
                  resolve(data);
                  return;
                }
              }
            } catch {}
            // Static hosting fallback: avoid massive 20MB base64 in state
            let fallbackUrl = base64Data;
            try {
              if (fileType === 'pdf' || (file as File).size > 500 * 1024) {
                fallbackUrl = URL.createObjectURL(file);
              }
            } catch {}
            setUploadProgressPercent(100);
            resolve({
              fileUrl: fallbackUrl,
              fileName: originalName,
              size: (file as File).size || 0
            });
          };
          reader.onerror = () => {
            reject(new Error(`File upload error: ${originalName}`));
          };
          reader.readAsDataURL(file);
        } catch (err: any) {
          reject(err);
        }
      }
    });
  };

  // Handle Cover Image File Selection from Mobile Gallery / PC with instant upload
  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        showNotify('File size too large. Please select an image under 25MB.');
        return;
      }
      setUploadedCoverFile(file);
      setUploadedCoverName(file.name);
      try {
        const previewUrl = URL.createObjectURL(file);
        setFormCoverImage(previewUrl);
      } catch (err) {
        console.warn('URL.createObjectURL notice:', err);
      }

      setIsUploadingCover(true);
      showNotify(`⏳ Cover photo "${file.name}" select ho gayi aur upload ho rahi hai...`);
      const targetProductId = editingProduct?.id || `cover-${Date.now()}`;

      try {
        const uploadRes = await uploadFileToServer(file, targetProductId, 'image');
        if (uploadRes && uploadRes.fileUrl) {
          setFormCoverImage(uploadRes.fileUrl);
          setUploadedCoverName(uploadRes.fileName || file.name);
          showNotify(`✓ Cover photo "${file.name}" successfully upload ho gayi!`);
        }
      } catch (err) {
        console.warn('Cover immediate upload will retry during product save:', err);
      } finally {
        setIsUploadingCover(false);
      }
    }
  };

  // Handle PDF File Selection from Mobile / PC Storage with instant upload
  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 150 * 1024 * 1024) {
        showNotify('File size too large. Please select a PDF under 150MB.');
        return;
      }
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setUploadedPdfFile(file);
      setUploadedPdfName(file.name);
      setIsUploadingPdf(true);
      setUploadStatusText(`PDF "${file.name}" (${sizeMb} MB) upload ho raha hai...`);
      showNotify(`⏳ PDF "${file.name}" (${sizeMb} MB) upload ho raha hai, kripya 2 second wait karein...`);

      const targetProductId = editingProduct?.id || `pdf-${Date.now()}`;

      // Auto-populate Title if user has not typed one yet
      if (!formTitle.trim()) {
        const cleanName = file.name
          .replace(/\.pdf$/i, '')
          .replace(/[_-]/g, ' ')
          .replace(/\b(apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d+.*$/i, '')
          .trim();
        const formattedTitle = cleanName
          .split(' ')
          .filter(Boolean)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        if (formattedTitle) {
          setFormTitle(formattedTitle);
        }
      }

      // Auto-detect category from filename
      const lowerName = file.name.toLowerCase();
      if (lowerName.includes('madni') || lowerName.includes('qaeda') || lowerName.includes('islam') || lowerName.includes('quran') || lowerName.includes('deen') || lowerName.includes('hadith')) {
        setFormCategory('Islamic Books');
      }

      try {
        const uploadRes = await uploadFileToServer(file, targetProductId, 'pdf');
        if (uploadRes && uploadRes.fileUrl) {
          setUploadedPdfUrl(uploadRes.fileUrl);
          setUploadedPdfName(uploadRes.fileName || file.name);
          setUploadStatusText(`✓ PDF "${file.name}" uploaded! Niche "Upload & Publish PDF" par click karke live karein.`);
          showNotify(`✓ PDF uploaded! Live karne ke liye "Publish PDF" button dabayein.`);
        }
      } catch (err: any) {
        console.warn('Immediate PDF upload warning:', err);
        setUploadStatusText(`File select ho gayi hai. Save product par click karke upload confirm karein.`);
      } finally {
        setIsUploadingPdf(false);
      }
    }
  };

  // Handle Multiple Inside Pages File Selection from Mobile Gallery / PC
  const handleSamplePagesFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setUploadedSampleFiles((prev) => [...prev, ...fileList]);
    const previewUrls = fileList.map((f) => {
      try {
        return URL.createObjectURL(f);
      } catch {
        return '';
      }
    }).filter(Boolean);

    setFormSamplePages((prev) => [...prev, ...previewUrls]);
    showNotify(`✓ Attached ${fileList.length} inside page(s) to preview carousel!`);
    e.target.value = '';
  };

  // Add Generated Template Sample Page
  const handleAddTemplateSamplePage = () => {
    const pageNum = formSamplePages.length + 1;
    const newSvg = createSamplePageSvg(pageNum, formTitle || 'Inside Topic & Architecture');
    setFormSamplePages((prev) => [...prev, newSvg]);
    showNotify(`✓ Added generated sample page #${pageNum}!`);
  };

  // Remove Individual Sample Page
  const handleRemoveSamplePage = (indexToRemove: number) => {
    setFormSamplePages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setUploadedSampleFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    showNotify(`Removed sample page #${indexToRemove + 1}`);
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormTitle('');
    setFormCategory('AI Tools');
    setFormPrice(99);
    setFormOldPrice(199);
    setFormRating(4.8);
    setFormDescription('Comprehensive practical guide with step by step instructions.');
    setFormHighlights('Step by step guide\nReal life examples\nLifetime access');
    setFormBadge('New');
    setFormCoverImage('');
    setUploadedCoverName(null);
    setUploadedCoverFile(null);
    setUploadedPdfName(null);
    setUploadedPdfFile(null);
    setUploadedPdfData(null);
    setUploadedPdfUrl(null);
    setUploadedSampleFiles([]);
    setUploadStatusText('');
    setFormPagesCount(120);
    setFormLanguage('Hindi + English');
    setFormSamplePages([
      createSamplePageSvg(1, 'Introduction & Core Foundations'),
      createSamplePageSvg(2, 'Step-by-Step Practical Blueprint'),
      createSamplePageSvg(3, 'Templates & Plug-and-Play Prompts')
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormTitle(p.title || '');
    setFormCategory(p.category || 'AI Tools');
    setFormPrice(p.price || 99);
    setFormOldPrice(p.oldPrice || 199);
    setFormRating(p.rating || 4.8);
    setFormDescription(p.description || '');
    setFormHighlights((p.highlights || []).join('\n'));
    setFormBadge(p.badge || '');
    setFormCoverImage(p.coverImage || '');
    setUploadedCoverName(null);
    setUploadedCoverFile(null);
    setUploadedPdfName(p.pdfFileName || (p.pdfUrl ? 'Existing Uploaded PDF' : null));
    setUploadedPdfFile(null);
    setUploadedPdfData(null);
    setUploadedPdfUrl(p.pdfUrl || null);
    setUploadedSampleFiles([]);
    setUploadStatusText('');
    setFormPagesCount(p.pdfPagesCount || 120);
    setFormLanguage(p.language || 'Hindi + English');
    const existingPages = (p.previewImages && p.previewImages.length > 0)
      ? p.previewImages
      : (p.samplePages && p.samplePages.length > 0)
      ? p.samplePages
      : [p.coverImage || ''];
    setFormSamplePages(existingPages.filter(Boolean));
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showNotify('⚠️ Kripya Product Title enter karein');
      return;
    }

    setIsSubmittingProduct(true);
    setUploadStatusText('Uploading files to secure server...');

    try {
      const generatedOrExistingId = editingProduct?.id || `pdf-${Date.now()}`;

      // 1. Upload Cover Image if a local file was selected and not already uploaded to server
      let finalCoverImage = formCoverImage;
      if (uploadedCoverFile && (!finalCoverImage || finalCoverImage.startsWith('blob:'))) {
        setUploadStatusText('Book Cover image upload ho rahi hai...');
        try {
          const coverUploadRes = await uploadFileToServer(uploadedCoverFile, generatedOrExistingId, 'image');
          finalCoverImage = coverUploadRes.fileUrl;
        } catch (coverErr) {
          console.warn('Cover upload warning during save:', coverErr);
        }
      }
      if (!finalCoverImage || finalCoverImage.startsWith('blob:')) {
        finalCoverImage = createBookCoverSvg(
          formTitle.slice(0, 24),
          'Practical Edition',
          ['#0F172A', '#1E3A8A'],
          '#F59E0B',
          formBadge || 'PRO',
          'book'
        );
      }

      // 2. Upload PDF Document: Use already-uploaded URL if ready, otherwise upload now
      let finalPdfUrl = uploadedPdfUrl || editingProduct?.pdfUrl || '';
      let finalPdfFileName = uploadedPdfName || editingProduct?.pdfFileName || '';
      let finalFileSize = editingProduct?.fileSize || '18.4 MB';

      if (!finalPdfUrl && uploadedPdfFile) {
        setUploadStatusText(`PDF Document "${uploadedPdfFile.name}" upload ho raha hai...`);
        const pdfUploadRes = await uploadFileToServer(uploadedPdfFile, generatedOrExistingId, 'pdf');
        finalPdfUrl = pdfUploadRes.fileUrl;
        finalPdfFileName = pdfUploadRes.fileName;
      }
      if (uploadedPdfFile) {
        const mb = (uploadedPdfFile.size / (1024 * 1024)).toFixed(1);
        finalFileSize = `${mb} MB`;
      }

      // 3. Upload Inside Preview Pages in parallel for maximum speed
      let finalSamplePages: string[] = [];
      if (uploadedSampleFiles.length > 0) {
        setUploadStatusText('Inside preview pages upload ho rahe hain...');
        const uploadPromises = uploadedSampleFiles.map((sf, idx) =>
          uploadFileToServer(sf, `${generatedOrExistingId}_sample_${idx + 1}`, 'image')
            .then((res) => res.fileUrl)
            .catch((err) => {
              console.warn('Sample page upload warning:', err);
              return '';
            })
        );
        const results = await Promise.all(uploadPromises);
        finalSamplePages = results.filter(Boolean);
      } else {
        finalSamplePages = formSamplePages.filter((p) => p && !p.startsWith('blob:'));
        if (finalSamplePages.length === 0) {
          finalSamplePages = [finalCoverImage, createSamplePageSvg(1, formTitle || 'Inside Guide')];
        }
      }

      const highlightsArr = formHighlights
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const productPayload: Omit<Product, 'id'> = {
        title: formTitle.trim(),
        category: formCategory || 'AI Tools',
        price: Number(formPrice) || 99,
        oldPrice: Number(formOldPrice) || 199,
        rating: Number(formRating) || 4.8,
        reviewsCount: editingProduct?.reviewsCount || 18,
        description: formDescription.trim() || 'Comprehensive practical digital guide with instant download access.',
        highlights: highlightsArr.length > 0 ? highlightsArr : ['Step-by-step practical guide', 'Lifetime validity & mobile reading', 'Instant verified PDF delivery'],
        features: highlightsArr.length > 0 ? highlightsArr : ['Direct digital download', 'High quality format', 'Lifetime access'],
        badge: formBadge.trim() || 'New',
        coverImage: finalCoverImage,
        pdfPagesCount: Number(formPagesCount) || 120,
        fileSize: finalFileSize,
        language: formLanguage.trim() || 'Hindi + English',
        pdfUrl: finalPdfUrl,
        pdfFileName: finalPdfFileName,
        tableOfContents: editingProduct?.tableOfContents || [
          { chapter: 'Chapter 1', title: 'Introduction & Foundations', pages: '01 - 30' },
          { chapter: 'Chapter 2', title: 'Actionable Frameworks', pages: '31 - 70' }
        ],
        previewImages: finalSamplePages,
        samplePages: finalSamplePages,
        videos: editingProduct?.videos || [],
        reviews: editingProduct?.reviews || [],
        faqs: editingProduct?.faqs || [
          { question: 'How is it delivered?', answer: 'Instant PDF download link upon verified payment.' }
        ]
      };

      setUploadStatusText('Saving product to database...');

      if (editingProduct) {
        await updateProduct(editingProduct.id, productPayload);
        showNotify(`✓ "${formTitle}" updated successfully!`);
      } else {
        await addProduct(productPayload);
        showNotify(`✓ Added "${formTitle}" successfully! Live and ready for customers.`);
      }

      setIsModalOpen(false);
      setUploadedCoverFile(null);
      setUploadedPdfFile(null);
      setUploadedSampleFiles([]);
    } catch (err: any) {
      console.error('Save product error:', err);
      showNotify(`⚠️ Error: ${err?.message || 'Failed to save product. Please try again.'}`);
    } finally {
      setIsSubmittingProduct(false);
      setUploadStatusText('');
    }
  };

  // Perform Delete (triggered from custom modal)
  const confirmDeleteAction = async () => {
    if (!deleteConfirmTarget) return;

    if (deleteConfirmTarget.type === 'product') {
      await deleteProduct(deleteConfirmTarget.id);
      showNotify(`✓ Product "${deleteConfirmTarget.title}" deleted.`);
    } else {
      await deleteBundle(deleteConfirmTarget.id);
      showNotify(`✓ Bundle "${deleteConfirmTarget.title}" deleted.`);
    }
    setDeleteConfirmTarget(null);
  };

  // Bundle Add / Edit Handlers
  const handleOpenAddBundleModal = () => {
    setEditingBundle(null);
    setBundleTitle('');
    setBundleSubtitle('All-in-One Mega Pack');
    setBundlePrice(149);
    const defaultProds = products.slice(0, 4);
    const defIds = defaultProds.map((p) => p.id);
    const defSum = defaultProds.reduce((sum, p) => sum + (p.price || 99), 0);
    setBundleOldPrice(defSum || 496);
    setBundleBadge('SAVE 70%');
    setBundleSelectedProducts(defIds);
    setBundleDescription('Get this discounted combo pack with instant access to all included PDF guides.');
    setBundleCoverImage('');
    setIsBundleModalOpen(true);
  };

  const handleOpenEditBundleModal = (b: Bundle) => {
    setEditingBundle(b);
    setBundleTitle(b.title);
    setBundleSubtitle(b.subtitle);
    setBundlePrice(b.price);
    setBundleOldPrice(b.oldPrice);
    setBundleBadge(b.badge);
    setBundleSelectedProducts(b.productIds || []);
    setBundleDescription(b.description);
    setBundleCoverImage(b.coverImage || '');
    setIsBundleModalOpen(true);
  };

  const handleSaveBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bundleSelectedProducts.length === 0) {
      showNotify('Please select at least one PDF for this bundle!');
      return;
    }

    const cover = bundleCoverImage.trim() || createBookCoverSvg(
      bundleTitle.slice(0, 24),
      `${bundleSelectedProducts.length} Guides Included`,
      ['#0F172A', '#7C3AED'],
      '#F59E0B',
      bundleBadge || 'COMBO',
      'ai'
    );

    if (editingBundle) {
      await updateBundle(editingBundle.id, {
        title: bundleTitle,
        subtitle: bundleSubtitle,
        price: Number(bundlePrice),
        oldPrice: Number(bundleOldPrice),
        badge: bundleBadge,
        productIds: bundleSelectedProducts,
        description: bundleDescription,
        coverImage: cover
      });
      showNotify(`✓ Bundle "${bundleTitle}" updated!`);
    } else {
      await addBundle({
        title: bundleTitle,
        subtitle: bundleSubtitle,
        price: Number(bundlePrice),
        oldPrice: Number(bundleOldPrice),
        badge: bundleBadge,
        productIds: bundleSelectedProducts,
        description: bundleDescription,
        coverImage: cover,
        isPopular: true
      });
      showNotify(`✓ Bundle "${bundleTitle}" created!`);
    }

    setIsBundleModalOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    if (!p) return false;
    const q = (searchQuery || '').toLowerCase();
    const titleMatch = (p.title || '').toLowerCase().includes(q);
    const catMatch = (p.category || '').toLowerCase().includes(q);
    const matchesQuery = titleMatch || catMatch;
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesQuery && matchesCategory;
  });

  const totalRevenue = orders.filter((o) => o.status === 'paid').reduce((sum, o) => sum + o.amount, 0);

  // Helper date calculations for sales analytics
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  // Start of this week (Monday)
  const dayOfWeek = now.getDay();
  const distanceToMonday = (dayOfWeek + 6) % 7;
  const startOfThisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday).getTime();

  // Paid orders
  const paidOrders = orders.filter((o) => o.status === 'paid');

  // Today Sales
  const todayPaidOrders = paidOrders.filter((o) => new Date(o.date).getTime() >= startOfToday);
  const todaySalesAmount = todayPaidOrders.reduce((sum, o) => sum + o.amount, 0);

  // This Week Sales
  const weekPaidOrders = paidOrders.filter((o) => new Date(o.date).getTime() >= startOfThisWeek);
  const weekSalesAmount = weekPaidOrders.reduce((sum, o) => sum + o.amount, 0);

  // This Month Sales
  const monthPaidOrders = paidOrders.filter((o) => new Date(o.date).getTime() >= startOfThisMonth);
  const monthSalesAmount = monthPaidOrders.reduce((sum, o) => sum + o.amount, 0);

  // Filtered Orders for the Orders Tab & Search by Specific Date
  const filteredOrders = orders.filter((ord) => {
    if (salesTimeFilter === 'all') return true;
    const ordTime = new Date(ord.date).getTime();
    if (salesTimeFilter === 'today') {
      return ordTime >= startOfToday;
    }
    if (salesTimeFilter === 'week') {
      return ordTime >= startOfThisWeek;
    }
    if (salesTimeFilter === 'month') {
      return ordTime >= startOfThisMonth;
    }
    if (salesTimeFilter === 'custom' && customFilterDate) {
      const ordDateStr = new Date(ord.date).toISOString().split('T')[0];
      return ordDateStr === customFilterDate;
    }
    return true;
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B1528] via-[#0F1E3D] to-[#1E293B] flex flex-col justify-center items-center px-4 py-12 text-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-4 transition-colors font-medium">
              <ArrowLeft size={15} /> Store par wapas jayein
            </Link>
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl mb-3 text-white border border-white/10">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Admin Panel Login</h1>
            <p className="text-xs text-gray-400 mt-1">PDF Master India • Restricted Access</p>
          </div>

          <div className="bg-white text-gray-900 rounded-2xl shadow-2xl p-6 md:p-8 border border-white/10">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 mb-5 flex items-start gap-2.5">
              <Lock size={16} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Surakshit Admin Area:</span> Is panel ko kholne ke liye apna authorized Admin ID aur Password enter karein.
              </div>
            </div>

            <form onSubmit={handleAdminDirectLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Admin ID
                </label>
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => {
                    setLoginId(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="Enter Admin ID"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm font-medium focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setLoginError('');
                    }}
                    placeholder="Enter Password"
                    className="w-full pl-4 pr-11 py-3 rounded-xl border border-gray-300 text-sm font-medium focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 font-semibold text-center">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 mt-2"
              >
                <Lock size={16} /> Login to Admin Panel
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <Link to="/" className="text-xs text-gray-500 hover:text-gray-900 font-semibold transition-colors">
                ← Back to Store
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredOrdersRevenue = filteredOrders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-gray-900 pb-16">
      {/* Top Admin Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-gray-400 hover:text-white flex items-center gap-1 text-xs font-semibold">
              <ArrowLeft size={16} /> Back to Store
            </Link>
            <div className="h-4 w-px bg-gray-700" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-xs">
                <ShieldCheck size={16} />
              </div>
              <h1 className="font-black text-sm md:text-base tracking-tight">
                PDF Master India • Admin Panel
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setResetConfirmOpen(true)}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-gray-700 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw size={13} /> Reset Dummies
            </button>
            <button
              onClick={() => {
                toggleAdminMode(false);
                navigate('/');
              }}
              className="text-xs bg-red-600/90 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold transition-colors"
            >
              Exit Admin
            </button>
          </div>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-16 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <Check size={16} /> {notification}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* STATS OVERVIEW CARDS WITH REAL-TIME SALES TIME-PERIOD FILTERS */}
        <section className="space-y-3">
          {/* Main 4 Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-all">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Total Revenue (Lifetime)
              </div>
              <div className="text-xl md:text-2xl font-black text-gray-900">
                ₹{totalRevenue.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <TrendingUp size={12} /> {paidOrders.length} Verified Purchases
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:border-blue-300 transition-all">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Active Single PDFs
              </div>
              <div className="text-xl md:text-2xl font-black text-gray-900">
                {products.length}
              </div>
              <div className="text-[10px] text-blue-600 font-bold mt-1">
                Manage / Delete anytime
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:border-orange-300 transition-all">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Mega Combos / Bundles
              </div>
              <div className="text-xl md:text-2xl font-black text-gray-900">
                {bundles.length}
              </div>
              <div className="text-[10px] text-orange-600 font-bold mt-1">
                High AOV Sales Boosters
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:border-purple-300 transition-all">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Verified Orders
              </div>
              <div className="text-xl md:text-2xl font-black text-gray-900">
                {orders.length}
              </div>
              <div className="text-[10px] text-purple-600 font-bold mt-1">
                Customer Purchases
              </div>
            </div>
          </div>

          {/* Quick Sales Filter Breakdown Bar (Today, This Week, This Month, Specific Date) */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-4 text-white shadow-md border border-slate-700/50">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-[11px] uppercase tracking-wider px-2">
                    Live Sales Analytics
                  </span>
                  <span className="text-xs text-gray-300 font-medium">
                    سیلز رپورٹ (آج، اس ہفتے، اس مہینے اور مخصوص تاریخ)
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-white mt-1">
                  Sales Overview &amp; Date-wise Report
                </h2>
              </div>

              {/* Specific Date Search Input */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-gray-200">
                  <Calendar size={14} className="text-orange-400 shrink-0" />
                  <span className="text-[11px] font-semibold text-gray-300 whitespace-nowrap">Kisi Ek Date Search:</span>
                  <input
                    type="date"
                    value={customFilterDate}
                    onChange={(e) => {
                      setCustomFilterDate(e.target.value);
                      if (e.target.value) {
                        setSalesTimeFilter('custom');
                      }
                    }}
                    className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-1 text-white text-xs outline-none focus:border-orange-500 cursor-pointer"
                  />
                  {customFilterDate && (
                    <button
                      onClick={() => {
                        setCustomFilterDate('');
                        setSalesTimeFilter('all');
                      }}
                      className="p-1 hover:bg-slate-700 rounded text-gray-400 hover:text-white"
                      title="Clear date filter"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {salesTimeFilter !== 'all' && (
                  <button
                    onClick={() => {
                      setSalesTimeFilter('all');
                      setCustomFilterDate('');
                    }}
                    className="text-xs bg-slate-700 hover:bg-slate-600 text-gray-200 px-3 py-1.5 rounded-xl font-bold transition-colors"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </div>

            {/* 4 Interactive Time Period Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-slate-800">
              {/* Card 1: Today's Sales */}
              <button
                type="button"
                onClick={() => {
                  setSalesTimeFilter('today');
                  setCustomFilterDate('');
                }}
                className={`text-left p-3 rounded-xl border transition-all ${
                  salesTimeFilter === 'today'
                    ? 'bg-emerald-500/20 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400 uppercase">
                  <span>آج کی سیلز (Today)</span>
                  <Clock size={12} />
                </div>
                <div className="text-lg sm:text-xl font-black text-white mt-0.5">
                  ₹{todaySalesAmount.toLocaleString()}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {todayPaidOrders.length} Paid {todayPaidOrders.length === 1 ? 'Order' : 'Orders'} Today
                </div>
              </button>

              {/* Card 2: This Week's Sales */}
              <button
                type="button"
                onClick={() => {
                  setSalesTimeFilter('week');
                  setCustomFilterDate('');
                }}
                className={`text-left p-3 rounded-xl border transition-all ${
                  salesTimeFilter === 'week'
                    ? 'bg-blue-500/20 border-blue-500 shadow-sm ring-1 ring-blue-500'
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-blue-400 uppercase">
                  <span>اس ہفتے کی سیلز (This Week)</span>
                  <Calendar size={12} />
                </div>
                <div className="text-lg sm:text-xl font-black text-white mt-0.5">
                  ₹{weekSalesAmount.toLocaleString()}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {weekPaidOrders.length} Paid Orders This Week
                </div>
              </button>

              {/* Card 3: This Month's Sales */}
              <button
                type="button"
                onClick={() => {
                  setSalesTimeFilter('month');
                  setCustomFilterDate('');
                }}
                className={`text-left p-3 rounded-xl border transition-all ${
                  salesTimeFilter === 'month'
                    ? 'bg-purple-500/20 border-purple-500 shadow-sm ring-1 ring-purple-500'
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-purple-400 uppercase">
                  <span>اس مہینے کی سیلز (This Month)</span>
                  <TrendingUp size={12} />
                </div>
                <div className="text-lg sm:text-xl font-black text-white mt-0.5">
                  ₹{monthSalesAmount.toLocaleString()}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {monthPaidOrders.length} Paid Orders This Month
                </div>
              </button>

              {/* Card 4: Specific Selected Date */}
              <div
                className={`p-3 rounded-xl border transition-all ${
                  salesTimeFilter === 'custom' && customFilterDate
                    ? 'bg-amber-500/20 border-amber-500 shadow-sm ring-1 ring-amber-500'
                    : 'bg-slate-800/60 border-slate-700/60'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 uppercase">
                  <span>مخصوص تاریخ (Specific Date)</span>
                  <Filter size={12} />
                </div>
                <div className="text-lg sm:text-xl font-black text-white mt-0.5">
                  {customFilterDate ? `₹${filteredOrdersRevenue.toLocaleString()}` : 'Select Date'}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5 truncate">
                  {customFilterDate ? `${customFilterDate} (${filteredOrders.filter(o => o.status === 'paid').length} Orders)` : 'اوپر دی گئی تاریخ منتخب کریں'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-2 border-b border-gray-300 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            PDF Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('bundles')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'bundles'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Layers size={14} /> Discount Bundles &amp; Combos ({bundles.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Orders &amp; Payments ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Download Activity Logs ({downloadLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 shadow-xs ${
              activeTab === 'coupons'
                ? 'bg-purple-600 text-white ring-2 ring-purple-400/50 shadow-sm'
                : 'bg-white text-purple-700 hover:bg-purple-50 border border-purple-200'
            }`}
          >
            <Tag size={14} className={activeTab === 'coupons' ? 'text-white' : 'text-purple-600'} />
            🎟️ Discount Coupons ({coupons.length})
          </button>
          <button
            onClick={() => setActiveTab('hero')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'hero'
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/50'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Palette size={14} className={activeTab === 'hero' ? 'text-white' : 'text-blue-600'} />
            Hero Banner &amp; Overlapping PDFs
          </button>
          <button
            onClick={() => setActiveTab('api-keys')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 shadow-xs ${
              activeTab === 'api-keys'
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/50'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
            }`}
          >
            <KeyRound size={14} className={activeTab === 'api-keys' ? 'text-white' : 'text-emerald-700'} />
            🔑 API Keys &amp; Payment Gateway {isKeysConfigured ? '✓' : '⚠️'}
          </button>
        </div>

        {/* TAB 1: SINGLE PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search product..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none font-medium text-gray-700"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleOpenAddModal}
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Plus size={15} /> Upload / Add New PDF
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Cover</th>
                    <th className="py-3 px-4">Title &amp; Category</th>
                    <th className="py-3 px-4">Price (₹)</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Pages</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 w-14">
                        <img
                          src={p.coverImage}
                          alt=""
                          className="w-10 h-14 object-cover rounded shadow-xs border border-gray-200"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-1">
                          {p.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                            {p.category}
                          </span>
                          {p.badge && (
                            <span className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded font-bold">
                              {p.badge}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">
                        ₹{p.price} <span className="text-[10px] text-gray-400 line-through">₹{p.oldPrice}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        ★ {p.rating}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {p.pdfPagesCount || 120} pgs
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const base = window.location.origin;
                              setAdLinkModalData({
                                title: p.title,
                                landingUrl: `${base}/product/${p.id}`,
                                checkoutUrl: `${base}/checkout/${p.id}`,
                                type: 'product'
                              });
                            }}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors font-extrabold flex items-center gap-1 text-[11px] px-2.5 border border-emerald-200"
                            title="Meta Ads / Facebook & Instagram Ads Link"
                          >
                            <Link2 size={13} className="text-emerald-700" /> 🔗 Ad Link
                          </button>
                          <Link
                            to={`/product/${p.id}`}
                            className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View on Store"
                          >
                            <ExternalLink size={14} />
                          </Link>
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-bold flex items-center gap-1 text-[11px] px-2.5"
                            title="Edit Product"
                          >
                            <Edit size={13} /> Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirmTarget({ id: p.id, title: p.title, type: 'product' })}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-bold flex items-center gap-1 text-[11px] px-2.5"
                            title="Delete Product"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-400">
                        No products found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: MEGA COMBOS & BUNDLES MANAGEMENT */}
        {activeTab === 'bundles' && (
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-sm text-gray-900">
                  Mega PDF Bundles &amp; Combos
                </h3>
                <p className="text-[11px] text-gray-500">
                  Combine 2 to 5 PDFs into a single discounted package to maximize sales revenue!
                </p>
              </div>

              <button
                onClick={handleOpenAddBundleModal}
                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Plus size={15} /> Create New PDF Bundle
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {bundles.map((b) => (
                <div key={b.id} className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 flex flex-col justify-between">
                  <div className="flex gap-3">
                    <img
                      src={b.coverImage || products[0]?.coverImage}
                      alt=""
                      className="w-16 h-24 object-cover rounded-xl border border-gray-200 shadow-xs shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">
                          {b.badge}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold">
                          {b.productIds?.length || 0} PDFs Included
                        </span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-gray-900 mt-1 line-clamp-1">
                        {b.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">
                        {b.subtitle}
                      </p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-base font-black text-gray-900">₹{b.price}</span>
                        <span className="text-xs text-gray-400 line-through">₹{b.oldPrice}</span>
                      </div>
                    </div>
                  </div>

                  {/* Included PDFs Cover Photos Shelf */}
                  {(() => {
                    const incProds = (b.productIds || [])
                      .map((id) => products.find((p) => p.id === id))
                      .filter(Boolean) as Product[];

                    if (incProds.length === 0) return null;

                    return (
                      <div className="mt-3 pt-2.5 border-t border-gray-200">
                        <div className="text-[10px] font-extrabold text-gray-600 mb-1.5 flex items-center justify-between">
                          <span>Included Books ({incProds.length} PDFs):</span>
                          <span className="text-orange-600 font-bold">Total Value: ₹{incProds.reduce((s, p) => s + (p.price || 99), 0)}</span>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {incProds.map((p, idx) => (
                            <div key={p.id} className="shrink-0 flex flex-col items-center w-12 text-center" title={p.title}>
                              <div className="w-12 h-16 rounded-md overflow-hidden border border-gray-200 shadow-2xs bg-white relative">
                                <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
                                <span className="absolute top-0.5 left-0.5 bg-black/80 text-white text-[7px] font-bold px-1 rounded">
                                  #{idx + 1}
                                </span>
                              </div>
                              <span className="text-[8px] text-gray-700 font-bold truncate w-full mt-0.5">
                                {p.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        const base = window.location.origin;
                        setAdLinkModalData({
                          title: `Combo: ${b.title}`,
                          landingUrl: `${base}/#bundle-${b.id}`,
                          checkoutUrl: `${base}/checkout/${b.id}`,
                          type: 'bundle'
                        });
                      }}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-black flex items-center gap-1.5 border border-emerald-300 transition-colors shadow-2xs cursor-pointer"
                      title="Copy Direct Checkout Link for Meta / Facebook Ads"
                    >
                      <Link2 size={13} className="text-emerald-700" /> 🔗 Copy Meta Ad Link
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditBundleModal(b)}
                        className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <Edit size={12} /> Edit Bundle
                      </button>
                      <button
                        onClick={() => setDeleteConfirmTarget({ id: b.id, title: b.title, type: 'bundle' })}
                        className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Delete Bundle
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS LIST */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <span>Customer Purchases &amp; Verified Payment Logs</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'}
                  </span>
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Filtered Revenue: <span className="font-bold text-gray-900">₹{filteredOrdersRevenue.toLocaleString()}</span>
                  {salesTimeFilter !== 'all' && (
                    <span className="ml-2 text-orange-600 font-semibold">
                      (Filter: {salesTimeFilter === 'today' ? 'Today' : salesTimeFilter === 'week' ? 'This Week' : salesTimeFilter === 'month' ? 'This Month' : customFilterDate})
                    </span>
                  )}
                </p>
              </div>

              {/* Time Period Filter Buttons on Orders Table */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setSalesTimeFilter('all');
                    setCustomFilterDate('');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    salesTimeFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All Time
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSalesTimeFilter('today');
                    setCustomFilterDate('');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    salesTimeFilter === 'today'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  Aaj (Today)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSalesTimeFilter('week');
                    setCustomFilterDate('');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    salesTimeFilter === 'week'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  Is Hafte (Week)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSalesTimeFilter('month');
                    setCustomFilterDate('');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    salesTimeFilter === 'month'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  Is Mahine (Month)
                </button>

                <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-0.5">
                  <Calendar size={12} className="text-gray-400 shrink-0" />
                  <input
                    type="date"
                    value={customFilterDate}
                    onChange={(e) => {
                      setCustomFilterDate(e.target.value);
                      if (e.target.value) {
                        setSalesTimeFilter('custom');
                      }
                    }}
                    className="bg-transparent text-xs text-gray-700 outline-none cursor-pointer"
                    title="Select specific date to search sales"
                  />
                  {customFilterDate && (
                    <button
                      onClick={() => {
                        setCustomFilterDate('');
                        setSalesTimeFilter('all');
                      }}
                      className="text-gray-400 hover:text-gray-600 p-0.5"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Product / Bundle</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Payment ID</th>
                    <th className="py-3 px-4">Date &amp; Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">{ord.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900">{ord.customerName}</div>
                        <div className="text-[10px] text-gray-400">{ord.customerEmail}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800 line-clamp-1">{ord.productTitle}</td>
                      <td className="py-3 px-4 font-bold text-gray-900">₹{ord.amount}</td>
                      <td className="py-3 px-4">
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-gray-500">
                        {ord.razorpayPaymentId || 'pay_verified'}
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-[11px] whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {new Date(ord.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {new Date(ord.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Calendar size={28} className="text-gray-300" />
                          <p className="font-semibold text-gray-600">No orders found for this selected date / filter.</p>
                          <p className="text-[11px] text-gray-400">Is date ya filter ke mutabiq koi order moujood nahi hai.</p>
                          <button
                            onClick={() => {
                              setSalesTimeFilter('all');
                              setCustomFilterDate('');
                            }}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-bold underline"
                          >
                            View All Orders
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: DOWNLOAD LOGS */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-sm text-gray-900">
                PDF File Download Activity (Anti-Piracy &amp; Verification)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Log ID</th>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Product Downloaded</th>
                    <th className="py-3 px-4">Customer Email</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {downloadLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/80">
                      <td className="py-3 px-4 font-mono text-gray-500">{log.id}</td>
                      <td className="py-3 px-4 font-mono text-blue-600 font-bold">{log.orderId}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{log.productTitle}</td>
                      <td className="py-3 px-4 text-gray-600">{log.customerEmail}</td>
                      <td className="py-3 px-4 text-gray-400 text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: DISCOUNT COUPONS & PROMO CODES */}
        {activeTab === 'coupons' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Toolbar Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shadow-2xs">
                    <Tag size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      🎟️ Discount Coupons &amp; Promo Codes Manager
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5 max-w-2xl leading-relaxed">
                      Percentage (% OFF) ya Flat Rupee (₹ OFF) discount coupon codes banayein jo seedha checkout aur payment page ke coupon box se connect hain.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleOpenAddCoupon}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black text-xs shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus size={16} /> Naya Coupon Banayein
                </button>
                <button
                  type="button"
                  onClick={() => setIsBulkCouponModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-black text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap size={15} /> ⚡ Ek Sath 5 Coupons Add Karein
                </button>
                <button
                  type="button"
                  onClick={handleResetCoupons}
                  className="px-3.5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Default 5 coupons restore karein"
                >
                  <RotateCcw size={14} /> Reset Defaults
                </button>
              </div>
            </div>

            {/* Quick Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Coupons</div>
                <div className="text-2xl font-black text-gray-900 mt-1">{coupons.length}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Website par registered</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
                <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                  <Check size={12} /> Active Coupons
                </div>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  {coupons.filter(c => c.isActive !== false).length}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">Checkout par chal rahe hain</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
                <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1">
                  <Percent size={12} /> Percentage (%) Deals
                </div>
                <div className="text-2xl font-black text-purple-700 mt-1">
                  {coupons.filter(c => (c.discountType || 'percentage') === 'percentage').length}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">10%, 20%, 50% jaise offers</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
                <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                  <Coins size={12} /> Flat (₹) Discounts
                </div>
                <div className="text-2xl font-black text-amber-700 mt-1">
                  {coupons.filter(c => c.discountType === 'flat').length}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">Flat ₹50, ₹100 direct chhut</div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={couponSearch}
                  onChange={(e) => setCouponSearch(e.target.value)}
                  placeholder="Coupon code ya description search karein (e.g. MASTER10, FLAT50)..."
                  className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-200"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Type Filter */}
                <select
                  value={couponFilterType}
                  onChange={(e) => setCouponFilterType(e.target.value as any)}
                  className="px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 font-bold text-gray-700 outline-none cursor-pointer"
                >
                  <option value="all">Sabhi Types (% &amp; ₹)</option>
                  <option value="percentage">Sirf Percentage (%) Offers</option>
                  <option value="flat">Sirf Flat Cash (₹) Offers</option>
                </select>

                {/* Status Filter */}
                <select
                  value={couponFilterStatus}
                  onChange={(e) => setCouponFilterStatus(e.target.value as any)}
                  className="px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 font-bold text-gray-700 outline-none cursor-pointer"
                >
                  <option value="all">Sabhi Status (Active &amp; Inactive)</option>
                  <option value="active">Sirf Active Coupons</option>
                  <option value="inactive">Sirf Inactive Coupons</option>
                </select>
              </div>
            </div>

            {/* Coupons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons
                .filter((c) => {
                  if (couponSearch) {
                    const q = couponSearch.toLowerCase();
                    const matchCode = c.code.toLowerCase().includes(q);
                    const matchDesc = c.description?.toLowerCase().includes(q);
                    if (!matchCode && !matchDesc) return false;
                  }
                  if (couponFilterType === 'percentage') {
                    if (c.discountType === 'flat') return false;
                  } else if (couponFilterType === 'flat') {
                    if (c.discountType !== 'flat') return false;
                  }
                  if (couponFilterStatus === 'active') {
                    if (c.isActive === false) return false;
                  } else if (couponFilterStatus === 'inactive') {
                    if (c.isActive !== false) return false;
                  }
                  return true;
                })
                .map((coupon) => {
                  const isFlat = coupon.discountType === 'flat';
                  const isActive = coupon.isActive !== false;
                  return (
                    <div
                      key={coupon.id || coupon.code}
                      className={`bg-white rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                        isActive
                          ? 'border-gray-200/90 shadow-xs hover:shadow-md'
                          : 'border-gray-200/60 opacity-60 bg-gray-50/50'
                      }`}
                    >
                      {/* Top decorative coupon ticket header */}
                      <div className={`p-4 border-b flex items-center justify-between ${
                        isFlat ? 'bg-amber-50/60 border-amber-100' : 'bg-purple-50/60 border-purple-100'
                      }`}>
                        <div className="flex items-center gap-2">
                          <div className={`font-mono text-base font-black px-3 py-1 rounded-xl tracking-wider select-all ${
                            isFlat
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'bg-purple-700 text-white shadow-2xs'
                          }`}>
                            {coupon.code}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyText(coupon.code, coupon.code, `Coupon Code "${coupon.code}"`)}
                            className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-gray-700 border border-gray-200 text-[11px] font-bold transition-all active:scale-95 cursor-pointer shadow-2xs flex items-center gap-1"
                            title="Code copy karein"
                          >
                            <Copy size={13} />
                          </button>
                        </div>

                        {/* Status Toggle Badge */}
                        <button
                          type="button"
                          onClick={() => handleToggleCouponActive(coupon)}
                          className={`text-[10px] font-black px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 cursor-pointer ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                              : 'bg-gray-200 text-gray-600 border-gray-300 hover:bg-gray-300'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-600 animate-pulse' : 'bg-gray-400'}`} />
                          {isActive ? 'ACTIVE' : 'INACTIVE'}
                        </button>
                      </div>

                      {/* Content Body */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Discount Badge */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs font-black px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                              isFlat
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-purple-100 text-purple-900 border border-purple-200'
                            }`}>
                              {isFlat ? (
                                <>
                                  <Coins size={13} className="text-amber-700" /> FLAT ₹{coupon.discountAmount || 50} OFF
                                </>
                              ) : (
                                <>
                                  <Percent size={13} className="text-purple-700" /> {coupon.discountPercent || 10}% DISCOUNT
                                </>
                              )}
                            </span>
                            {coupon.minOrderAmount && coupon.minOrderAmount > 0 ? (
                              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                Min Cart: ₹{coupon.minOrderAmount}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                Har Order Par Lagu
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-gray-700 font-medium leading-relaxed">
                            {coupon.description || 'Applicable on checkout for instant price deduction.'}
                          </p>
                        </div>

                        {/* Meta info tags */}
                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 flex-wrap gap-1">
                          <div className="flex items-center gap-1">
                            <Clock size={12} className="text-gray-400" />
                            <span>
                              {coupon.expiryDate ? `Exp: ${coupon.expiryDate}` : 'No Expiry (Lifetime)'}
                            </span>
                          </div>
                          <div className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                            Used: {coupon.timesUsed || 0} times
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditCoupon(coupon)}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Edit size={13} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setCouponDeleteConfirmTarget(coupon)}
                          className="py-1.5 px-3 rounded-xl bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 text-xs font-bold text-red-600 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          title="Delete Coupon"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* How It Connects to Checkout Info Note */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/80 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-2xs">
                ✓
              </div>
              <div className="space-y-1 text-xs text-purple-950">
                <div className="font-extrabold text-sm text-purple-900">
                  Checkout &amp; Payment Page Connection Status: Active &amp; Synced
                </div>
                <p className="text-purple-900/80 leading-relaxed">
                  Yahan set kiya gaya koi bhi coupon code customer ke <strong>Checkout Page (Payment Screen)</strong> ke coupon box se seedha juda hua hai. Jab bhi customer coupon code enter karke "Apply" dabayega ya "View Offers" tray me se coupon select karega, system automatically discount minus karega aur Razorpay payment total update kar dega!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: HERO BANNER & OVERLAPPING PDFS MANAGEMENT */}
        {activeTab === 'hero' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Toolbar Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <Palette size={18} />
                  </div>
                  <h2 className="text-lg font-black text-gray-900">
                    Hero Banner &amp; 3D Overlapping PDFs Customizer
                  </h2>
                </div>
                <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
                  Homepage ke main hero banner ka background photo change karein (gallery se upload ya URL), aur saamne dikhne wale 4 overlapping PDFs ke photos aur unke click links ko live customize karein.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <Link
                  to="/"
                  target="_blank"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-all"
                  title="Homepage ko naye tab me khol ke dekhein"
                >
                  <ExternalLink size={14} /> View Store
                </Link>
                <button
                  type="button"
                  onClick={() => setResetHeroConfirmOpen(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw size={14} /> Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={handleSaveHeroBanner}
                  disabled={isHeroSaving}
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 active:scale-95 text-white flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
                >
                  {isHeroSaving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Check size={14} /> Save Banner Changes
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* SECTION 1: HERO BANNER BACKGROUND PHOTO */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                    <ImageIcon size={16} className="text-blue-600" />
                    1. Hero Banner Ka Background Photo (Gallery Upload / URL)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Is pure section ke background ka photo gallery/files se upload karein ya direct URL paste karein.
                  </p>
                </div>
                {heroBgImage ? (
                  <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center gap-1">
                    <Check size={12} /> Custom Photo Active
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">
                    Default Gradient Active
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Controls */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Gallery Upload & URL Input */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <label className="block text-xs font-bold text-gray-700">
                      Background Photo Upload Ya Paste Karein:
                    </label>

                    {/* Hidden File Input */}
                    <input
                      type="file"
                      ref={heroBgFileInputRef}
                      onChange={handleHeroBgUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => heroBgFileInputRef.current?.click()}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                      >
                        <Upload size={14} />
                        Gallery / Device Se Upload Karein
                      </button>

                      {heroBgImage && (
                        <button
                          type="button"
                          onClick={() => setHeroBgImage('')}
                          className="px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold border border-red-200 transition-colors"
                        >
                          <Trash2 size={13} className="inline mr-1" />
                          Hatao (Remove Photo)
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <span className="text-[11px] text-gray-500 font-semibold block mb-1">
                        Ya Photo Ka Direct URL Paste Karein:
                      </span>
                      <input
                        type="text"
                        value={heroBgImage}
                        onChange={(e) => setHeroBgImage(e.target.value)}
                        placeholder="https://images.unsplash.com/... ya direct image URL"
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-mono outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>

                  {/* Darkness / Overlay Opacity Slider */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-bold text-gray-700">
                        Dark Overlay / Readability Layer:
                      </label>
                      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {Math.round(heroBgOpacity * 100)}% Darkness
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="0.85"
                      step="0.05"
                      value={heroBgOpacity}
                      onChange={(e) => setHeroBgOpacity(parseFloat(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <p className="text-[11px] text-gray-500">
                      Note: Background image ke upar dark layer se text (headings, buttons) hamesha saf aur padhne laayak dikhta hai.
                    </p>
                  </div>
                </div>

                {/* Right: Live Miniature Preview */}
                <div className="lg:col-span-5">
                  <div className="text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                    <span>Live Hero Preview (Homepage Look):</span>
                    <span className="text-[10px] text-gray-400">Real-time preview</span>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B1528] via-[#0F1E3D] to-[#1E3A8A] text-white p-4 shadow-lg border border-blue-950/40 min-h-[160px] flex flex-col justify-between">
                    {/* Background photo if set */}
                    {heroBgImage && (
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${heroBgImage})` }}
                      />
                    )}
                    {/* Overlay */}
                    {heroBgImage && (
                      <div
                        className="absolute inset-0 bg-[#0B1528]"
                        style={{ opacity: heroBgOpacity }}
                      />
                    )}
                    {/* Star dots */}
                    <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />

                    <div className="relative z-10 space-y-1">
                      <div className="inline-block bg-orange-500 text-[9px] font-black uppercase px-1.5 py-0.5 rounded text-white">
                        Special Offer 50% OFF
                      </div>
                      <div className="text-sm font-black leading-tight">
                        Learn More. Do More.<br />
                        <span className="text-amber-400">Grow Faster.</span>
                      </div>
                      <p className="text-[10px] text-gray-200 line-clamp-1">
                        Practical PDF Guides for Students, Teachers &amp; Professionals.
                      </p>
                    </div>

                    <div className="relative z-10 pt-2 flex items-center gap-1.5">
                      <div className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-900 font-extrabold text-[10px]">
                        Explore PDFs
                      </div>
                      <div className="text-[10px] text-gray-300">
                        {heroBgImage ? '✓ Custom Photo Loaded' : '• Default Gradient Background'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: 3D OVERLAPPING PDF CARDS CUSTOMIZER */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs space-y-5">
              <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                    <Layers size={16} className="text-blue-600" />
                    2. Overlapping 3D PDF Books Ke Photo Aur Links (4 Cards)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Homepage ke hero banner me ek ke upar ek 4 PDFs overlap ho rahe hain. Har PDF ka photo gallery se upload karein ya URL dalein, aur click hone par jo link khulna chahiye wo yahan paste karein.
                  </p>
                </div>
              </div>

              {/* 4 Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {heroStackedCards.map((card, idx) => {
                  const cardPositions = [
                    'Card 1 (Left / Backmost)',
                    'Card 2 (Center-Left)',
                    'Card 3 (Center-Right)',
                    'Card 4 (Right / Frontmost)'
                  ];
                  const currentPos = cardPositions[idx] || `Card ${idx + 1}`;

                  return (
                    <div
                      key={card.id || idx}
                      className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between space-y-3 relative group hover:border-blue-300 transition-all"
                    >
                      <div>
                        {/* Card Header & Badge */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-black uppercase text-slate-700 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                            {currentPos}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">
                            #{idx + 1}
                          </span>
                        </div>

                        {/* Image Preview & Upload */}
                        <div className="flex gap-3 items-start mb-3">
                          <div className="w-16 h-22 rounded-lg overflow-hidden border border-gray-300 shadow-sm shrink-0 bg-gray-200 relative group/thumb">
                            {card.image ? (
                              <img
                                src={card.image}
                                alt={card.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px] font-bold">
                                No Photo
                              </div>
                            )}
                          </div>

                          <div className="flex-1 space-y-1.5">
                            <input
                              type="file"
                              ref={(el) => {
                                cardFileInputRefs.current[card.id] = el;
                              }}
                              onChange={(e) => handleCardImageUpload(card.id, e)}
                              accept="image/*"
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => cardFileInputRefs.current[card.id]?.click()}
                              className="w-full text-center px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold shadow-xs flex items-center justify-center gap-1 transition-colors"
                            >
                              <Upload size={12} /> Gallery Se Photo
                            </button>
                            <p className="text-[9px] text-gray-500 leading-tight">
                              Mobile ya PC se photo chunein
                            </p>
                          </div>
                        </div>

                        {/* Photo URL Input */}
                        <div className="space-y-1 mb-2.5">
                          <label className="block text-[11px] font-bold text-gray-700">
                            Photo URL (Image Link):
                          </label>
                          <input
                            type="text"
                            value={card.image}
                            onChange={(e) => handleCardFieldChange(card.id, 'image', e.target.value)}
                            placeholder="https://... cover photo link"
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-[11px] font-mono outline-none focus:border-blue-500 bg-white"
                          />
                        </div>

                        {/* Card Title Input */}
                        <div className="space-y-1 mb-2.5">
                          <label className="block text-[11px] font-bold text-gray-700">
                            Book / PDF Title:
                          </label>
                          <input
                            type="text"
                            value={card.title}
                            onChange={(e) => handleCardFieldChange(card.id, 'title', e.target.value)}
                            placeholder="e.g. AI Prompts Guide"
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:border-blue-500 bg-white"
                          />
                        </div>

                        {/* Card Link Input (User Request: "jo bhi link agar Ham pest karna chahe") */}
                        <div className="space-y-1 mb-2.5">
                          <label className="block text-[11px] font-bold text-gray-700 flex items-center gap-1">
                            <Link2 size={12} className="text-blue-600" />
                            Click Link (Yahan Link Paste Karein):
                          </label>
                          <input
                            type="text"
                            value={card.link}
                            onChange={(e) => handleCardFieldChange(card.id, 'link', e.target.value)}
                            placeholder="/product/chatgpt-ai... ya https://..."
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-mono outline-none focus:border-blue-500 bg-white"
                          />
                        </div>

                        {/* Quick Autofill Dropdown from Existing Catalog */}
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-gray-500">
                            ⚡ Quick Select From Store:
                          </label>
                          <select
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAutofillCardFromProduct(card.id, e.target.value);
                                e.target.value = '';
                              }
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded-lg text-[11px] text-gray-700 outline-none focus:border-blue-500 bg-white"
                          >
                            <option value="">-- PDF Select Karein (Auto-fill) --</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.title} (₹{p.price})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SECTION 3: REAL TIME 3D STACK PREVIEW */}
              <div className="mt-6 pt-5 border-t border-gray-100 bg-slate-900 rounded-2xl p-6 text-white text-center">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Live Overlapping 3D Fan Stack Preview (Homepage Par Aisa Dikhai Dega)
                </div>

                <div className="py-6 flex items-center justify-center">
                  <div className="relative flex items-center">
                    {heroStackedCards.map((card, idx) => {
                      const rotationStyles = [
                        'transform -rotate-12 hover:-rotate-6 z-10',
                        '-ml-8 sm:-ml-10 transform -rotate-3 hover:rotate-0 z-20',
                        '-ml-8 sm:-ml-10 transform rotate-6 hover:rotate-2 z-30',
                        '-ml-8 sm:-ml-10 transform rotate-14 hover:rotate-10 z-40'
                      ];
                      const currentRotation = rotationStyles[idx % rotationStyles.length];

                      return (
                        <div
                          key={card.id || idx}
                          className={`w-20 sm:w-24 md:w-28 shadow-2xl rounded-lg overflow-hidden border border-white/20 transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer ${currentRotation}`}
                          title={`${card.title} -> ${card.link}`}
                        >
                          {card.image ? (
                            <img
                              src={card.image}
                              alt={card.title}
                              className="w-full aspect-[3/4] object-cover"
                            />
                          ) : (
                            <div className="w-full aspect-[3/4] bg-slate-800 flex items-center justify-center text-[10px] text-gray-400">
                              Book {idx + 1}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-50 bg-white rounded-xl shadow-xl px-3 py-1 border border-red-200 flex items-center gap-1.5 pointer-events-none">
                      <div className="w-4 h-4 bg-red-600 rounded flex items-center justify-center text-white text-[9px] font-black">
                        PDF
                      </div>
                      <span className="text-[10px] font-black text-gray-900">Instant Download</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveHeroBanner}
                    disabled={isHeroSaving}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg transition-all"
                  >
                    {isHeroSaving ? 'Saving...' : '✓ Save Hero Banner & PDFs'}
                  </button>
                  <Link
                    to="/"
                    target="_blank"
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 font-bold text-xs border border-slate-700 transition-all"
                  >
                    Open Live Homepage
                  </Link>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* TAB 6: API KEYS & PAYMENT GATEWAY (RAZORPAY) CONFIGURATION */}
        {activeTab === 'api-keys' && (
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-50/60 to-teal-50/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md">
                  <KeyRound size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-gray-900 leading-tight">
                      Payment Gateway &amp; API Keys Settings
                    </h3>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                      isKeysConfigured
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {isKeysConfigured ? `● Active (${keyEnvironment.toUpperCase()})` : '⚠️ Setup Required'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Apna Razorpay Payment Gateway connect karein taaki customers se UPI, Cards aur Netbanking ke direct payments aapke account mein aayein.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://dashboard.razorpay.com/app/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-gray-700 hover:text-emerald-700 border border-gray-300 shadow-2xs flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink size={13} />
                  <span>Open Razorpay Dashboard</span>
                </a>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Form Card */}
              <form onSubmit={handleSaveApiKeys} className="max-w-2xl space-y-4">
                {/* Razorpay Key ID */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-gray-800">
                    Razorpay Key ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={apiKeyId}
                      onChange={(e) => setApiKeyId(e.target.value)}
                      placeholder="e.g. rzp_live_xxxxxxxxxxxx ya rzp_test_xxxxxxxxxxxx"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs font-mono text-gray-900 outline-none transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Razorpay Dashboard &gt; Settings &gt; API Keys se 'Key Id' yahan paste karein.
                  </p>
                </div>

                {/* Razorpay Key Secret */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-gray-800">
                    Razorpay Key Secret <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showKeySecret ? 'text' : 'password'}
                      value={apiKeySecret}
                      onChange={(e) => setApiKeySecret(e.target.value)}
                      placeholder="Apna Razorpay Key Secret yahan paste karein"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs font-mono text-gray-900 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeySecret(!showKeySecret)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-700"
                    >
                      {showKeySecret ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Yeh secret server par surakshit (encrypted) save hota hai aur kisi public user ko nahi dikhta.
                  </p>
                </div>

                {/* Razorpay Webhook Secret */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-gray-800">
                    Razorpay Webhook Secret <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={apiWebhookSecret}
                    onChange={(e) => setApiWebhookSecret(e.target.value)}
                    placeholder="e.g. your_webhook_secret_here"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs font-mono text-gray-900 outline-none transition-all"
                  />
                  <p className="text-[11px] text-gray-500">
                    Automatic instant payment confirmation verify karne ke liye webhook secret.
                  </p>
                </div>

                {/* Save Button */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSavingKeys}
                    className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm tracking-wide shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Check size={16} className="stroke-[3]" />
                    <span>{isSavingKeys ? 'Saving API Keys...' : '✓ Save API Keys & Activate Gateway'}</span>
                  </button>

                  {isKeysConfigured && (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck size={16} /> Gateway Ready
                    </span>
                  )}
                </div>
              </form>

              {/* Step-by-Step Instructions Card */}
              <div className="bg-amber-50/70 rounded-2xl p-5 border border-amber-200/80 space-y-3 text-xs text-amber-950">
                <div className="font-extrabold flex items-center gap-2 text-amber-900 text-sm">
                  <Sparkles size={16} className="text-amber-600 fill-amber-600" />
                  <span>Razorpay API Keys Kahan Se Nikalein? (Simple Hindi Guide)</span>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-amber-900/90 leading-relaxed pl-1">
                  <li>
                    <strong>Razorpay Dashboard Login:</strong> Apne browser mein <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer" className="underline font-bold text-amber-950">dashboard.razorpay.com</a> kholein.
                  </li>
                  <li>
                    <strong>Settings Mein Jayein:</strong> Left menu mein sabse neeche <strong>Settings</strong> par click karein.
                  </li>
                  <li>
                    <strong>API Keys Tab:</strong> Upar tabs mein <strong>"API Keys"</strong> par click karein.
                  </li>
                  <li>
                    <strong>Generate Key:</strong> <strong>"Generate Key"</strong> ya <strong>"Regenerate Key"</strong> par click karein.
                  </li>
                  <li>
                    <strong>Copy &amp; Paste:</strong> Screen par <strong>Key ID</strong> aur <strong>Key Secret</strong> dikhayi denge. Unhe copy karke upar wale boxes mein paste karein aur <strong>"Save API Keys"</strong> dabayein!
                  </li>
                </ol>
                <div className="pt-2 text-[11px] text-amber-800 font-semibold bg-amber-100/60 p-2.5 rounded-xl border border-amber-200">
                  💡 Note: Testing ke liye aap <span className="font-mono">rzp_test_...</span> keys use kar sakte hain, aur real customer payments lene ke liye <span className="font-mono">rzp_live_...</span> keys dalein.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 1. IN-APP DELETE CONFIRMATION MODAL (NO native window.confirm) */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 animate-scale-in text-center space-y-4">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={28} />
            </div>

            <div>
              <h3 className="text-base font-black text-gray-900">
                Confirm Deletion
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to permanently delete:
              </p>
              <p className="text-sm font-bold text-gray-900 mt-1 bg-gray-50 p-2 rounded-lg border border-gray-200">
                "{deleteConfirmTarget.title}"
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAction}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                Yes, Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. RESET DEFAULTS CONFIRMATION MODAL */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center space-y-4">
            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto">
              <RotateCcw size={28} />
            </div>

            <div>
              <h3 className="text-base font-black text-gray-900">Restore All 18 Dummy Books?</h3>
              <p className="text-xs text-gray-500 mt-1">
                This will reset your catalog back to the complete initial 18 books and mega bundles from the reference screenshot.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await resetToDefaults();
                  setResetConfirmOpen(false);
                  showNotify('✓ All 18 default dummy products & bundles restored!');
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-md transition-colors"
              >
                Yes, Restore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ADD / EDIT PRODUCT MODAL (With Mobile & Computer File Pickers!) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-black text-gray-900">
                {editingProduct ? 'Edit PDF Product' : 'Upload & Add New PDF Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="pt-4 space-y-4 text-xs">
              {/* Product Title */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Product Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  placeholder="e.g. Masterclass on AI Prompts"
                  className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-blue-500"
                />
              </div>

              {/* Category & Badge */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-blue-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Badge (Optional)</label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="e.g. Bestseller, New, 50% OFF"
                    className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Pricing & Rating */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Sale Price (₹)</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={formOldPrice}
                    onChange={(e) => setFormOldPrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Rating (★)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formRating}
                    onChange={(e) => setFormRating(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* NATIVE DEVICE FILE PICKERS (MOBILE / COMPUTER) */}
              <div className="p-4 bg-orange-50/70 rounded-2xl border border-orange-200 space-y-4">
                <div className="font-black text-gray-900 text-xs flex items-center gap-1.5 border-b border-orange-200/80 pb-2">
                  <Upload size={16} className="text-orange-600" />
                  Select Files from Phone Gallery or Computer (موبائل یا کمپیوٹر سے فائلیں اور فوٹوز سلیکٹ کریں)
                </div>

                {/* 1. Cover Image Picker */}
                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    1. Book Cover Image (Gallery / Camera / PC):
                  </label>
                  <input
                    type="file"
                    ref={coverFileInputRef}
                    accept="image/*"
                    onChange={handleCoverFileChange}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold flex items-center gap-1.5 shadow-2xs text-xs"
                    >
                      <ImageIcon size={14} className="text-orange-600" />
                      {uploadedCoverName ? 'Change Cover Photo' : 'Select Photo from Device'}
                    </button>
                    {isUploadingCover ? (
                      <span className="text-[11px] text-amber-700 font-bold flex items-center gap-1 animate-pulse">
                        <RefreshCw size={12} className="animate-spin text-amber-600" />
                        Cover Uploading...
                      </span>
                    ) : uploadedCoverName ? (
                      <span className="text-[11px] text-emerald-700 font-bold truncate max-w-xs flex items-center gap-1">
                        <Check size={13} className="text-emerald-600 font-black" />
                        ✓ {uploadedCoverName}
                      </span>
                    ) : null}
                  </div>
                  {formCoverImage && (
                    <div className="mt-2 flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200 w-fit">
                      <img src={formCoverImage} alt="Preview" className="w-12 h-16 object-cover rounded shadow border" />
                      <div className="text-left">
                        <span className="text-[11px] font-bold text-gray-900 block">Cover Photo Ready</span>
                        <span className="text-[10px] text-gray-500">Visible on storefront</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. PDF Document File Picker */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold text-gray-800 text-xs">
                      2. PDF File Document (for Customer Download):
                    </label>
                    <div className="inline-flex rounded-lg p-0.5 bg-gray-200 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setPdfUploadSource('device')}
                        className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                          pdfUploadSource === 'device' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600'
                        }`}
                      >
                        📱 Device File
                      </button>
                      <button
                        type="button"
                        onClick={() => setPdfUploadSource('url')}
                        className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                          pdfUploadSource === 'url' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600'
                        }`}
                      >
                        🔗 Google Drive / Link
                      </button>
                    </div>
                  </div>

                  {pdfUploadSource === 'url' ? (
                    <div className="space-y-1.5">
                      <input
                        type="url"
                        value={uploadedPdfUrl || ''}
                        onChange={(e) => {
                          const val = e.target.value.trim();
                          const formatted = formatCloudPdfUrl(val);
                          setUploadedPdfUrl(formatted);
                          setUploadedPdfName(formatted ? 'Cloud PDF Link (Google Drive / Dropbox)' : null);
                        }}
                        placeholder="Paste Google Drive, Dropbox, or Direct PDF link here..."
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs outline-none focus:border-blue-500 font-mono"
                      />
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                        <Zap size={14} className="text-emerald-600 shrink-0" />
                        <span>
                          <strong>12MB - 100MB PDF ke liye best:</strong> Google Drive link paste karein, yeh bina kisi file size limit ke 1 second me upload &amp; save ho jayega!
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        ref={pdfFileInputRef}
                        accept=".pdf,application/pdf"
                        onChange={handlePdfFileChange}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => pdfFileInputRef.current?.click()}
                          className="px-3.5 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold flex items-center gap-1.5 shadow-2xs text-xs cursor-pointer active:scale-95"
                        >
                          <FileCheck size={14} className="text-red-600" />
                          {uploadedPdfName ? 'Change PDF File' : 'Select .PDF File from Device'}
                        </button>

                        {uploadedPdfName && !isUploadingPdf && (
                          <span className="text-[11px] text-emerald-700 font-bold truncate max-w-xs flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                            <Check size={13} className="text-emerald-600 font-black" />
                            ✓ {uploadedPdfName}
                          </span>
                        )}
                      </div>

                      {/* Real-time upload progress bar */}
                      {isUploadingPdf && (
                        <div className="w-full mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5 shadow-2xs">
                          <div className="flex justify-between items-center text-xs font-bold text-amber-900">
                            <span className="flex items-center gap-1.5">
                              <RefreshCw size={13} className="animate-spin text-amber-600" />
                              {uploadStatusText || 'Uploading PDF to server...'}
                            </span>
                            <span className="font-mono text-amber-700">{uploadProgressPercent}%</span>
                          </div>
                          <div className="w-full bg-amber-200/80 h-2.5 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-amber-500 via-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-150"
                              style={{ width: `${Math.max(uploadProgressPercent, 5)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {uploadedPdfUrl && (
                    <div className="mt-2.5 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          ✓
                        </div>
                        <div>
                          <p className="text-xs font-black text-emerald-950">PDF File Uploaded Successfully!</p>
                          <p className="text-[11px] text-emerald-800">Website par turant live karne ke liye "Publish PDF Now" dabayein.</p>
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmittingProduct}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-lg shrink-0 shadow transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Check size={14} className="stroke-[3]" />
                        <span>Publish Now</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Inside Pages / Sample Screenshots for Horizontal Carousel */}
                <div className="pt-3 border-t border-orange-200/90">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <div>
                      <label className="block font-black text-gray-900 text-xs">
                        3. PDF Inside Pages &amp; Sample Material (کرسل کیلئے پی ڈی ایف کے اندرونی صفحات کی تصاویر):
                      </label>
                      <p className="text-[11px] text-gray-600">
                        یہ فوٹوز خریداروں کو ہر پی ڈی ایف پر ٹیپ کرنے کے بعد نیچے ہوریزونٹل کرسل میں دکھائی دیں گی تاکہ وہ خریدنے سے پہلے اندر کا مٹیریل دیکھ سکیں۔
                      </p>
                    </div>
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200 self-start sm:self-auto shrink-0">
                      {formSamplePages.length} Pages Attached
                    </span>
                  </div>

                  <input
                    type="file"
                    ref={samplePagesFileInputRef}
                    multiple
                    accept="image/*"
                    onChange={handleSamplePagesFilesChange}
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => samplePagesFileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Upload size={14} />
                      Select Multiple Photos from Gallery / PC (ایک سے زیادہ فوٹوز سلیکٹ کریں)
                    </button>

                    <button
                      type="button"
                      onClick={handleAddTemplateSamplePage}
                      className="px-3 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all"
                    >
                      <Plus size={14} className="text-orange-600" />
                      + Add Generated Sample Page
                    </button>

                    {formSamplePages.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormSamplePages([]);
                          showNotify('Cleared all sample pages');
                        }}
                        className="px-2.5 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold transition-all"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Live Thumbnails of Attached Inside Pages */}
                  {formSamplePages.length > 0 ? (
                    <div className="bg-white p-3 rounded-2xl border border-gray-200">
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>Preview of Attached Inside Pages (Tap X on any thumbnail to delete):</span>
                        <span className="text-emerald-700 font-black">✓ Ready for Customer Carousel</span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto p-1">
                        {formSamplePages.map((pageImg, idx) => (
                          <div
                            key={idx}
                            className="group relative rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shadow-2xs flex flex-col"
                          >
                            <div className="relative aspect-[3/4] bg-white">
                              <img
                                src={pageImg}
                                alt={`Sample ${idx + 1}`}
                                className="w-full h-full object-contain"
                              />
                              <span className="absolute top-1 left-1 bg-black/80 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                                #{idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSamplePage(idx)}
                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-md transition-transform active:scale-90"
                                title="Delete this page"
                              >
                                <X size={12} strokeWidth={3} />
                              </button>
                            </div>
                            <div className="p-1 text-center bg-gray-50 border-t border-gray-100">
                              <span className="text-[9px] font-bold text-gray-700">Page {idx + 1}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-white/80 rounded-xl border border-dashed border-gray-300 text-center text-xs text-gray-500">
                      No sample inside pages selected yet. Click above to select multiple photos from your device.
                    </div>
                  )}
                </div>
              </div>

              {/* Pages & Language */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">PDF Total Pages</label>
                  <input
                    type="number"
                    value={formPagesCount}
                    onChange={(e) => setFormPagesCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Language</label>
                  <input
                    type="text"
                    value={formLanguage}
                    onChange={(e) => setFormLanguage(e.target.value)}
                    placeholder="e.g. Hindi + English"
                    className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Short Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Highlights &amp; Bullet Points (1 per line)
                </label>
                <textarea
                  value={formHighlights}
                  onChange={(e) => setFormHighlights(e.target.value)}
                  rows={3}
                  placeholder="Step by step practical guide&#10;100+ useful prompts&#10;Real life examples"
                  className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-blue-500"
                />
              </div>

              {/* Upload Status Banner */}
              {isSubmittingProduct && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-3 text-xs text-emerald-900 font-bold shadow-xs animate-pulse">
                  <RefreshCw size={18} className="animate-spin text-emerald-600 shrink-0" />
                  <div className="flex-1">
                    <span className="block">{uploadStatusText || 'Uploading files to server & publishing...'}</span>
                    <span className="text-[10px] text-emerald-700 font-normal">Kripya thoda intezar karein, window band na karein.</span>
                  </div>
                </div>
              )}

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-2.5 border-t border-gray-200">
                <button
                  type="button"
                  disabled={isSubmittingProduct}
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs border border-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel (کینسل کریں)
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  className={`w-full sm:w-auto px-7 py-3 rounded-xl text-white font-black text-xs sm:text-sm tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isSubmittingProduct
                      ? 'bg-emerald-700 opacity-80 cursor-wait'
                      : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 border border-emerald-500'
                  }`}
                >
                  {isSubmittingProduct ? (
                    <>
                      <RefreshCw size={18} className="animate-spin text-white" />
                      <span>Publishing PDF...</span>
                    </>
                  ) : (
                    <>
                      <Check size={18} className="text-white stroke-[3]" />
                      <span>
                        {editingProduct ? '✓ Save Changes (تبدیلیاں محفوظ کریں)' : '✓ Upload & Publish PDF (پی ڈی ایف محفوظ کریں)'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. ADD / EDIT BUNDLE MODAL */}
      {isBundleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-black text-gray-900">
                {editingBundle ? 'Edit Mega PDF Bundle' : 'Create New Mega PDF Bundle'}
              </h3>
              <button
                onClick={() => setIsBundleModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBundle} className="pt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Bundle Title</label>
                <input
                  type="text"
                  value={bundleTitle}
                  onChange={(e) => setBundleTitle(e.target.value)}
                  required
                  placeholder="e.g. Solopreneur Mega Combo (4 in 1)"
                  className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Subtitle / Summary</label>
                <input
                  type="text"
                  value={bundleSubtitle}
                  onChange={(e) => setBundleSubtitle(e.target.value)}
                  placeholder="e.g. AI + Marketing + Canva + Freelancing"
                  className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Bundle Deal Price (₹)</label>
                  <input
                    type="number"
                    value={bundlePrice}
                    onChange={(e) => setBundlePrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={bundleOldPrice}
                    onChange={(e) => setBundleOldPrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Badge</label>
                  <input
                    type="text"
                    value={bundleBadge}
                    onChange={(e) => setBundleBadge(e.target.value)}
                    placeholder="e.g. SAVE 70%"
                    className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Custom Bundle Cover Image */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Combo Main Cover Photo (Optional - Gallery se upload karein ya URL dalein)
                </label>
                <div className="flex items-center gap-3">
                  {bundleCoverImage ? (
                    <div className="relative w-14 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-xs shrink-0 bg-white">
                      <img src={bundleCoverImage} alt="Bundle cover" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setBundleCoverImage('')}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700"
                        title="Remove cover"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-14 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-400 text-center shrink-0 p-1">
                      Auto Cover
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => bundleFileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg font-bold text-xs flex items-center gap-1 border border-orange-200 transition-colors"
                      >
                        <UploadCloud size={13} /> Gallery / Device se Photo Upload
                      </button>
                      <input
                        ref={bundleFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBundleCoverUpload}
                      />
                    </div>
                    <input
                      type="url"
                      value={bundleCoverImage}
                      onChange={(e) => setBundleCoverImage(e.target.value)}
                      placeholder="Ya phir Image URL paste karein..."
                      className="w-full px-3 py-1.5 border rounded-lg text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* LIVE PREVIEW OF SELECTED PDFS IN THIS COMBO */}
              {(() => {
                const selectedProductsList = bundleSelectedProducts
                  .map((id) => products.find((p) => p.id === id))
                  .filter(Boolean) as Product[];

                const calculatedSum = selectedProductsList.reduce((sum, p) => sum + (p.price || 99), 0);

                return (
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-3.5 border border-orange-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-gray-900 text-xs flex items-center gap-1.5">
                        <Sparkles size={14} className="text-orange-500 fill-orange-500" />
                        Selected PDFs in this Combo ({bundleSelectedProducts.length}):
                      </span>
                      {calculatedSum > 0 && (
                        <button
                          type="button"
                          onClick={() => setBundleOldPrice(calculatedSum)}
                          className="text-[10px] bg-orange-600 hover:bg-orange-700 text-white font-bold px-2.5 py-1 rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Zap size={11} className="text-amber-300" /> Set ₹{calculatedSum} as Original Price
                        </button>
                      )}
                    </div>

                    {selectedProductsList.length > 0 ? (
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
                        {selectedProductsList.map((p, idx) => (
                          <div key={p.id} className="relative group shrink-0 text-center w-16">
                            <div className="w-16 h-22 rounded-lg overflow-hidden border-2 border-white shadow-xs relative bg-white">
                              <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
                              <span className="absolute top-0.5 left-0.5 bg-black/80 text-white text-[8px] font-bold px-1 rounded">
                                #{idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => setBundleSelectedProducts((prev) => prev.filter((id) => id !== p.id))}
                                className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-80 hover:opacity-100"
                                title="Remove from combo"
                              >
                                ×
                              </button>
                            </div>
                            <p className="text-[9px] font-bold text-gray-800 truncate mt-0.5">{p.title}</p>
                            <span className="text-[9px] text-gray-500">₹{p.price}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-500 italic">
                        Neeche ki list mein se 2 ya usse zyada PDFs select karein.
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Select which PDFs belong to this Bundle */}
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">
                  Select PDFs from Store ({bundleSelectedProducts.length} selected):
                </label>
                <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-1.5 bg-gray-50">
                  {products.map((p) => {
                    const isChecked = bundleSelectedProducts.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors border ${
                          isChecked ? 'bg-orange-100/80 border-orange-300 font-bold' : 'hover:bg-white border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBundleSelectedProducts((prev) => [...prev, p.id]);
                            } else {
                              setBundleSelectedProducts((prev) => prev.filter((id) => id !== p.id));
                            }
                          }}
                          className="rounded text-orange-600 focus:ring-orange-500 shrink-0"
                        />
                        <img
                          src={p.coverImage}
                          alt=""
                          className="w-8 h-11 object-cover rounded shadow-2xs border border-gray-200 shrink-0 bg-white"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-900 truncate leading-snug">{p.title}</p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                            <span className="bg-gray-100 px-1.5 py-0.2 rounded">{p.category}</span>
                            <span className="font-bold text-emerald-700">Individually ₹{p.price}</span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  value={bundleDescription}
                  onChange={(e) => setBundleDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-2.5 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsBundleModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs border border-gray-300 transition-colors"
                >
                  Cancel (کینسل کریں)
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-black text-xs sm:text-sm tracking-wide shadow-lg border border-orange-500 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check size={18} className="text-white stroke-[3]" />
                  <span className="text-white font-black">
                    {editingBundle ? '✓ Save Bundle Changes' : '✓ Create Mega Bundle Pack'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. RESET HERO BANNER CONFIRMATION MODAL */}
      {resetHeroConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center space-y-4 animate-scale-in">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <RotateCcw size={28} />
            </div>

            <div>
              <h3 className="text-base font-black text-gray-900">Hero Banner Reset Karein?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Isse hero banner ka background photo aur 4 overlapping PDFs ke photos/links default set par restore ho jayenge.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setResetHeroConfirmOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetHeroBanner}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                Yes, Reset Default
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. META ADS / ADVERTISING LINK GENERATOR MODAL */}
      {adLinkModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 text-left space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Link2 size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
                    Meta Ads Link Center
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Facebook, Instagram &amp; WhatsApp Ads Destination URLs
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAdLinkModalData(null)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Target Item Name */}
            <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200">
              <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
                {adLinkModalData.type === 'bundle' ? 'Selected Combo Bundle' : 'Selected PDF Product'}
              </span>
              <h4 className="text-sm font-black text-gray-900 mt-0.5 line-clamp-2">
                {adLinkModalData.title}
              </h4>
            </div>

            {/* Link 1: Direct Instant Checkout (Highest Conversion for Ads) */}
            <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/40 rounded-2xl p-4 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                    ⭐ Highest Conversion
                  </span>
                  <span className="text-xs font-black text-gray-900">
                    Direct Buy / Checkout Link
                  </span>
                </div>
                <span className="text-[10px] text-emerald-800 font-bold">Recommended for Ads</span>
              </div>

              <p className="text-[11px] text-gray-600 leading-tight">
                Customer ad par click karte hi direct payment / QR code aur order details screen par jayega.
              </p>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  readOnly
                  value={adLinkModalData.checkoutUrl}
                  className="flex-1 px-3 py-2 bg-white rounded-xl border border-emerald-300 text-[11px] font-mono text-gray-800 select-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleCopyText(adLinkModalData.checkoutUrl, 'checkout', 'Direct Checkout Link')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copiedKey === 'checkout' ? (
                    <>
                      <CheckCheck size={14} className="stroke-[3]" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Link 2: Product Landing Page (If Product) */}
            {adLinkModalData.type === 'product' && (
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-900">
                    Product Details / Landing Page Link
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold">With Sample Pages Preview</span>
                </div>

                <p className="text-[11px] text-gray-600 leading-tight">
                  Customer pehle guide ke samples aur reviews dekhega, fir buy button par click karega.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    readOnly
                    value={adLinkModalData.landingUrl}
                    className="flex-1 px-3 py-2 bg-white rounded-xl border border-gray-300 text-[11px] font-mono text-gray-800 select-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyText(adLinkModalData.landingUrl, 'landing', 'Product Landing Page Link')}
                    className="px-3.5 py-2 bg-gray-800 hover:bg-gray-900 active:scale-95 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {copiedKey === 'landing' ? (
                      <>
                        <CheckCheck size={14} className="stroke-[3]" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copy Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step-by-Step Meta Ads Guide */}
            <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200/80 text-[11px] space-y-2 text-amber-950">
              <div className="font-extrabold flex items-center gap-1.5 text-xs text-amber-900">
                <Sparkles size={14} className="text-amber-600 fill-amber-600" />
                <span>Meta Ads (Facebook &amp; Instagram) mein kahan paste karein?</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-amber-900/90 pl-1">
                <li>Facebook Ads Manager (<span className="font-mono text-[10px]">adsmanager.facebook.com</span>) kholein.</li>
                <li>Apne Campaign aur Ad Set ke baad <strong>Ad Level</strong> par jayein.</li>
                <li>Neeche scroll karke <strong>Destination</strong> section mein <strong>"Website URL"</strong> dhoondhein.</li>
                <li>Upar se copy kiya hua link wahan paste kar dein.</li>
                <li>Call to Action (CTA) button ko <strong>"Shop Now"</strong> ya <strong>"Order Now"</strong> set karein.</li>
              </ol>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setAdLinkModalData(null)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-black text-xs transition-colors cursor-pointer"
              >
                Close (Band Karein)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. ADD / EDIT COUPON MODAL */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 text-left space-y-5 animate-scale-in my-8 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Tag size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
                    {editingCoupon ? 'Coupon Edit Karein' : 'Naya Coupon Banayein'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Website &amp; Checkout page ke liye discount offer set karein
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCouponModalOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Live Coupon Preview Ticket */}
            <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 p-4 rounded-2xl border-2 border-dashed border-purple-200">
              <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider mb-1">
                Customer Ko Kaisa Dikhega (Live Preview):
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-base font-black text-purple-900 tracking-wider">
                    {formCouponCode.trim() ? formCouponCode.trim().toUpperCase() : 'COUPON_CODE'}
                  </div>
                  <div className="text-xs text-purple-800 font-semibold mt-0.5">
                    {formCouponType === 'flat' ? `Flat ₹${formCouponValue || 0} OFF` : `${formCouponValue || 0}% OFF`}
                    {formCouponMinOrder > 0 ? ` • Min Order: ₹${formCouponMinOrder}` : ' • No Min Cart'}
                  </div>
                </div>
                <div className="px-3 py-1 rounded-xl bg-purple-600 text-white font-black text-xs shadow-xs">
                  {formCouponType === 'flat' ? `₹${formCouponValue || 0} OFF` : `${formCouponValue || 0}% OFF`}
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCoupon} className="space-y-4">
              {/* Coupon Code Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Coupon Code (e.g. MASTER10, FIRST50, FLAT100) *
                </label>
                <input
                  type="text"
                  required
                  value={formCouponCode}
                  onChange={(e) => setFormCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SPECIAL30"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-mono text-sm uppercase tracking-wider font-bold focus:border-purple-600 focus:ring-1 focus:ring-purple-200 outline-none"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  Customer isi code ko checkout payment page par enter karega.
                </span>
              </div>

              {/* Coupon Discount Type Toggle */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Discount Type Chuniye *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormCouponType('percentage')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      formCouponType === 'percentage'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Percent size={14} /> Percentage (% Chhut)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormCouponType('flat')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      formCouponType === 'flat'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Coins size={14} /> Flat Rupee (₹ Cash Chhut)
                  </button>
                </div>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {formCouponType === 'flat' ? 'Flat Discount Amount (₹ Rupees) *' : 'Discount Percentage (% Percent) *'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={1}
                    max={formCouponType === 'flat' ? 5000 : 100}
                    value={formCouponValue}
                    onChange={(e) => setFormCouponValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-bold text-sm focus:border-purple-600 focus:ring-1 focus:ring-purple-200 outline-none"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-black text-xs text-gray-500">
                    {formCouponType === 'flat' ? '₹ Rupees' : '% Percent'}
                  </span>
                </div>
              </div>

              {/* Minimum Order Value & Expiry Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Minimum Order Limit (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formCouponMinOrder}
                    onChange={(e) => setFormCouponMinOrder(Number(e.target.value))}
                    placeholder="0 = Har cart par lagu"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-bold focus:border-purple-600 focus:ring-1 focus:ring-purple-200 outline-none"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">0 rakhenge to bina kisi limit ke chalega</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formCouponExpiry}
                    onChange={(e) => setFormCouponExpiry(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-bold focus:border-purple-600 focus:ring-1 focus:ring-purple-200 outline-none"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Khali chhodne par lifetime valid rahega</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Coupon Description / Offer Note
                </label>
                <input
                  type="text"
                  value={formCouponDesc}
                  onChange={(e) => setFormCouponDesc(e.target.value)}
                  placeholder="e.g. Special welcome discount on all guides"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-purple-600 focus:ring-1 focus:ring-purple-200 outline-none"
                />
              </div>

              {/* Active Toggle */}
              <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                <div>
                  <div className="text-xs font-bold text-gray-800">Coupon Status (Active/Inactive)</div>
                  <div className="text-[11px] text-gray-500">Active rakhne par customer ise use kar payenge</div>
                </div>
                <input
                  type="checkbox"
                  checked={formCouponActive}
                  onChange={(e) => setFormCouponActive(e.target.checked)}
                  className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md transition-colors cursor-pointer"
                >
                  {editingCoupon ? '✓ Save Changes' : '✓ Create & Connect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. BULK ADD 5 COUPONS MODAL */}
      {isBulkCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-gray-100 text-left space-y-5 animate-scale-in my-8 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
                    ⚡ Ek Sath 5 Alag-Alag Coupons Add Karein
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Aap ek click mein 5 popular coupons (Percentage aur Flat Cash deals) add aur customize kar sakte hain:
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkCouponModalOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Editable 5 Coupons List */}
            <div className="space-y-3">
              {bulkCouponsList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/90 hover:border-amber-400 transition-colors space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={item.code}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setBulkCouponsList((prev) =>
                            prev.map((c, i) => (i === idx ? { ...c, code: val } : c))
                          );
                        }}
                        placeholder="COUPON_CODE"
                        className="px-2.5 py-1.5 rounded-lg border border-gray-300 font-mono text-xs font-black uppercase tracking-wider bg-white outline-none w-32 focus:border-amber-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Type toggle */}
                      <select
                        value={item.discountType}
                        onChange={(e) => {
                          const val = e.target.value as 'percentage' | 'flat';
                          setBulkCouponsList((prev) =>
                            prev.map((c, i) => (i === idx ? { ...c, discountType: val } : c))
                          );
                        }}
                        className="px-2 py-1.5 rounded-lg border border-gray-300 text-xs font-bold bg-white outline-none cursor-pointer"
                      >
                        <option value="percentage">% Percentage</option>
                        <option value="flat">₹ Flat Rupee</option>
                      </select>

                      {/* Value */}
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-bold text-gray-500">Value:</span>
                        <input
                          type="number"
                          value={item.value}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setBulkCouponsList((prev) =>
                              prev.map((c, i) => (i === idx ? { ...c, value: val } : c))
                            );
                          }}
                          className="w-16 px-2 py-1.5 rounded-lg border border-gray-300 text-xs font-bold bg-white outline-none"
                        />
                        <span className="text-xs font-bold text-gray-600">
                          {item.discountType === 'flat' ? '₹' : '%'}
                        </span>
                      </div>

                      {/* Min Order */}
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-bold text-gray-500">Min Cart:</span>
                        <input
                          type="number"
                          value={item.minOrder}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setBulkCouponsList((prev) =>
                              prev.map((c, i) => (i === idx ? { ...c, minOrder: val } : c))
                            );
                          }}
                          className="w-16 px-2 py-1.5 rounded-lg border border-gray-300 text-xs font-bold bg-white outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBulkCouponsList((prev) =>
                        prev.map((c, i) => (i === idx ? { ...c, description: val } : c))
                      );
                    }}
                    placeholder="Coupon description..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 bg-white outline-none"
                  />
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsBulkCouponModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkAdd5Coupons}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Zap size={15} /> Save &amp; Add All 5 Coupons
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. DELETE COUPON CONFIRMATION MODAL */}
      {couponDeleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center space-y-4 animate-scale-in">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-sm">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">Coupon Delete Karein?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Kya aap waqai coupon code <strong className="text-gray-900 font-mono font-black">{couponDeleteConfirmTarget.code}</strong> ko delete karna chahte hain? Delete karne ke baad customer iska use nahi kar payenge.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCouponDeleteConfirmTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCoupon}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
