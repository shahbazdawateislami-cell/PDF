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
  KeyRound
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { Product, Bundle, HeroStackedCard, HeroBannerConfig } from '../types';
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
  const [activeTab, setActiveTab] = useState<'products' | 'bundles' | 'orders' | 'logs' | 'hero' | 'api-keys'>(
    requestedTab === 'hero' ? 'hero' : requestedTab === 'api-keys' ? 'api-keys' : 'products'
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

  // Robust, native file upload helper (zero FileReader errors, supports any file size)
  const uploadFileToServer = async (file: File, productId: string, fileType: 'pdf' | 'image') => {
    // METHOD 1: Native multipart/form-data upload via FormData (Fastest, standard, zero memory buffer)
    try {
      const formData = new FormData();
      formData.append('file', file, file.name);
      formData.append('productId', productId);
      formData.append('fileType', fileType);

      const res = await fetch('/api/upload-file', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (data.fileUrl) return data;
      }
    } catch (formErr) {
      console.warn('FormData upload attempt notice, trying raw stream:', formErr);
    }

    // METHOD 2: Direct raw binary stream upload (streams File Blob directly to server disk)
    try {
      const query = `?fileName=${encodeURIComponent(file.name)}&productId=${encodeURIComponent(productId)}`;
      const res = await fetch(`/api/upload-raw${query}`, {
        method: 'POST',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file
      });

      if (res.ok) {
        const data = await res.json();
        if (data.fileUrl) return data;
      }
    } catch (rawErr) {
      console.warn('Raw stream upload attempt notice, trying arrayBuffer:', rawErr);
    }

    // METHOD 3: ArrayBuffer upload fallback
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      const chunk = 8192;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
      }
      const base64Data = window.btoa(binary);

      const res = await fetch('/api/upload-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: base64Data,
          fileName: file.name,
          fileType: file.type || (fileType === 'pdf' ? 'application/pdf' : 'image/jpeg'),
          productId
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.fileUrl) return data;
      }
    } catch (fallbackErr) {
      console.error('All upload pipelines failed:', fallbackErr);
    }

    throw new Error(`Device se "${file.name}" upload karne mein problem aayi. Kripya dobara file select karein.`);
  };

  // Handle Cover Image File Selection from Mobile Gallery / PC
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        showNotify('File size too large. Please select an image under 20MB.');
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
      showNotify(`✓ Cover photo "${file.name}" selected!`);
    }
  };

  // Handle PDF File Selection from Mobile / PC Storage
  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        showNotify('File size too large. Please select a PDF under 100MB.');
        return;
      }
      setUploadedPdfFile(file);
      setUploadedPdfName(file.name);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      showNotify(`✓ PDF Document "${file.name}" (${sizeMb} MB) ready for upload!`);
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

      // 1. Upload Cover Image if a local file was selected
      let finalCoverImage = formCoverImage;
      if (uploadedCoverFile) {
        setUploadStatusText('Book Cover image upload ho rahi hai...');
        const coverUploadRes = await uploadFileToServer(uploadedCoverFile, generatedOrExistingId, 'image');
        finalCoverImage = coverUploadRes.fileUrl;
      } else if (!finalCoverImage || finalCoverImage.startsWith('blob:')) {
        finalCoverImage = createBookCoverSvg(
          formTitle.slice(0, 24),
          'Practical Edition',
          ['#0F172A', '#1E3A8A'],
          '#F59E0B',
          formBadge || 'PRO',
          'book'
        );
      }

      // 2. Upload PDF Document if a local file was selected
      let finalPdfUrl = editingProduct?.pdfUrl || uploadedPdfUrl || '';
      let finalPdfFileName = uploadedPdfName || editingProduct?.pdfFileName || '';
      let finalFileSize = editingProduct?.fileSize || '18.4 MB';

      if (uploadedPdfFile) {
        setUploadStatusText(`PDF Document "${uploadedPdfFile.name}" upload ho raha hai...`);
        const pdfUploadRes = await uploadFileToServer(uploadedPdfFile, generatedOrExistingId, 'pdf');
        finalPdfUrl = pdfUploadRes.fileUrl;
        finalPdfFileName = pdfUploadRes.fileName;
        const mb = (uploadedPdfFile.size / (1024 * 1024)).toFixed(1);
        finalFileSize = `${mb} MB`;
      }

      // 3. Upload Inside Preview Pages if any selected
      let finalSamplePages: string[] = [];
      if (uploadedSampleFiles.length > 0) {
        setUploadStatusText('Inside preview pages process ho rahe hain...');
        for (let i = 0; i < uploadedSampleFiles.length; i++) {
          const sf = uploadedSampleFiles[i];
          const sRes = await uploadFileToServer(sf, `${generatedOrExistingId}_sample_${i + 1}`, 'image');
          finalSamplePages.push(sRes.fileUrl);
        }
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
                    {uploadedCoverName && (
                      <span className="text-[11px] text-emerald-700 font-bold truncate max-w-xs">
                        ✓ {uploadedCoverName}
                      </span>
                    )}
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
                  <label className="block font-bold text-gray-800 mb-1">
                    2. PDF File Document (for Customer Download):
                  </label>
                  <input
                    type="file"
                    ref={pdfFileInputRef}
                    accept=".pdf,application/pdf"
                    onChange={handlePdfFileChange}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => pdfFileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold flex items-center gap-1.5 shadow-2xs text-xs"
                    >
                      <FileCheck size={14} className="text-red-600" />
                      {uploadedPdfName ? 'Change PDF File' : 'Select .PDF File from Device'}
                    </button>
                    {uploadedPdfName ? (
                      <span className="text-[11px] text-emerald-700 font-bold truncate max-w-xs">
                        ✓ {uploadedPdfName} (Ready)
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-500">
                        (Optional: Auto-generated digital guide will be provided if left blank)
                      </span>
                    )}
                  </div>
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
    </div>
  );
}
