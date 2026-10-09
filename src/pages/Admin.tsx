import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Sparkles
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { Product, Bundle } from '../types';
import { createBookCoverSvg, createSamplePageSvg } from '../data/coverImages';

export default function Admin() {
  const navigate = useNavigate();
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
    saveCustomPdfFile
  } = useProducts();
  const { toggleAdminMode } = useAuth();

  const [activeTab, setActiveTab] = useState<'products' | 'bundles' | 'orders' | 'logs'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

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
  const [uploadedPdfName, setUploadedPdfName] = useState<string | null>(null);
  const [uploadedPdfData, setUploadedPdfData] = useState<string | null>(null);

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

  // Handle Cover Image File Selection from Mobile Gallery / PC
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showNotify('File size too large. Please select an image under 8MB.');
        return;
      }
      setUploadedCoverName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setFormCoverImage(reader.result as string);
        showNotify(`Cover image "${file.name}" selected!`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle PDF File Selection from Mobile / PC Storage
  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedPdfName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedPdfData(reader.result as string);
        showNotify(`PDF Document "${file.name}" ready for upload!`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Multiple Inside Pages File Selection from Mobile Gallery / PC
  const handleSamplePagesFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    let loadedCount = 0;
    const newPages: string[] = [];

    fileList.forEach((file) => {
      if (file.size > 8 * 1024 * 1024) {
        showNotify(`"${file.name}" is over 8MB, skipped.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        newPages.push(reader.result as string);
        loadedCount++;
        if (loadedCount === fileList.length) {
          setFormSamplePages((prev) => [...prev, ...newPages]);
          showNotify(`✓ Added ${newPages.length} inside page(s) to carousel preview!`);
        }
      };
      reader.readAsDataURL(file);
    });

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
    setUploadedPdfName(null);
    setUploadedPdfData(null);
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
    setFormTitle(p.title);
    setFormCategory(p.category);
    setFormPrice(p.price);
    setFormOldPrice(p.oldPrice);
    setFormRating(p.rating);
    setFormDescription(p.description);
    setFormHighlights(p.highlights?.join('\n') || '');
    setFormBadge(p.badge || '');
    setFormCoverImage(p.coverImage);
    setUploadedCoverName(null);
    setUploadedPdfName(null);
    setUploadedPdfData(null);
    setFormPagesCount(p.pdfPagesCount || 120);
    setFormLanguage(p.language || 'Hindi + English');
    const existingPages = (p.previewImages && p.previewImages.length > 0)
      ? p.previewImages
      : (p.samplePages && p.samplePages.length > 0)
      ? p.samplePages
      : [p.coverImage];
    setFormSamplePages(existingPages);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const highlightsArr = formHighlights.split('\n').filter((l) => l.trim().length > 0);

    const cover = formCoverImage || createBookCoverSvg(
      formTitle.slice(0, 24),
      'Practical Edition',
      ['#0F172A', '#1E3A8A'],
      '#F59E0B',
      formBadge || 'PRO',
      'book'
    );

    const pagesToSave = formSamplePages.length > 0
      ? formSamplePages
      : [cover, createSamplePageSvg(1, formTitle || 'Inside Guide')];

    let savedProductId = '';

    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        title: formTitle,
        category: formCategory,
        price: Number(formPrice),
        oldPrice: Number(formOldPrice),
        rating: Number(formRating),
        description: formDescription,
        highlights: highlightsArr,
        badge: formBadge,
        coverImage: cover,
        pdfPagesCount: Number(formPagesCount),
        language: formLanguage,
        previewImages: pagesToSave,
        samplePages: pagesToSave
      });
      savedProductId = editingProduct.id;
      showNotify(`✓ Updated "${formTitle}" successfully!`);
    } else {
      savedProductId = await addProduct({
        title: formTitle,
        category: formCategory,
        price: Number(formPrice),
        oldPrice: Number(formOldPrice),
        rating: Number(formRating),
        reviewsCount: 15,
        description: formDescription,
        highlights: highlightsArr,
        features: highlightsArr,
        badge: formBadge,
        coverImage: cover,
        pdfPagesCount: Number(formPagesCount),
        fileSize: uploadedPdfName ? 'Uploaded PDF' : '18.4 MB',
        language: formLanguage,
        tableOfContents: [
          { chapter: 'Chapter 1', title: 'Introduction & Foundations', pages: '01 - 30' },
          { chapter: 'Chapter 2', title: 'Actionable Frameworks', pages: '31 - 70' }
        ],
        previewImages: pagesToSave,
        samplePages: pagesToSave,
        videos: [],
        reviews: [],
        faqs: [{ question: 'How is it delivered?', answer: 'Instant PDF download link upon verified payment.' }]
      });
      showNotify(`✓ Added "${formTitle}" successfully!`);
    }

    // If PDF file was selected, save it for downloads
    if (uploadedPdfData && uploadedPdfName && savedProductId) {
      saveCustomPdfFile(savedProductId, uploadedPdfData, uploadedPdfName);
    }

    setIsModalOpen(false);
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
    setBundleOldPrice(496);
    setBundleBadge('SAVE 70%');
    setBundleSelectedProducts(products.slice(0, 4).map((p) => p.id));
    setBundleDescription('Get this discounted combo pack with instant access to all included PDF guides.');
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
    setIsBundleModalOpen(true);
  };

  const handleSaveBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bundleSelectedProducts.length === 0) {
      showNotify('Please select at least one PDF for this bundle!');
      return;
    }

    const cover = createBookCoverSvg(
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
    const matchesQuery = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesQuery && matchesCategory;
  });

  const totalRevenue = orders.filter((o) => o.status === 'paid').reduce((sum, o) => sum + o.amount, 0);

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
        {/* STATS OVERVIEW CARDS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Total Revenue
            </div>
            <div className="text-xl md:text-2xl font-black text-gray-900">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <TrendingUp size={12} /> Verified Razorpay Payments
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
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

          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
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

          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
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

                  <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-gray-200">
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
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS LIST */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-sm text-gray-900">
                Customer Purchases &amp; Verified Payment Logs
              </h3>
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
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50/80">
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
                      <td className="py-3 px-4 text-gray-400 text-[11px]">
                        {new Date(ord.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
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

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-2.5 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs border border-gray-300 transition-colors"
                >
                  Cancel (کینسل کریں)
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm tracking-wide shadow-lg border border-emerald-500 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check size={18} className="text-white stroke-[3]" />
                  <span className="text-white font-black">
                    {editingProduct ? '✓ Save Changes (تبدیلیاں محفوظ کریں)' : '✓ Upload & Publish PDF (پی ڈی ایف محفوظ کریں)'}
                  </span>
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

              {/* Select which PDFs belong to this Bundle */}
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">
                  Select PDFs to include in this Combo ({bundleSelectedProducts.length} selected):
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-1.5 bg-gray-50">
                  {products.map((p) => {
                    const isChecked = bundleSelectedProducts.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                          isChecked ? 'bg-orange-100/70 border border-orange-300 font-bold' : 'hover:bg-white'
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
                          className="rounded text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-xs text-gray-900 truncate flex-1">
                          {p.title} (₹{p.price})
                        </span>
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
    </div>
  );
}
