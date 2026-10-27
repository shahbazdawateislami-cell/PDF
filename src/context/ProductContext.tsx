import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product, Order, DownloadLog, Bundle, HeroBannerConfig, HeroStackedCard, Coupon } from '../types';
import { INITIAL_PRODUCTS, CATEGORIES_LIST, INITIAL_BUNDLES } from '../data/initialProducts';
import { db, auth } from '../firebase';
import { collection, getDocs, setDoc, doc, deleteDoc, getDoc, onSnapshot } from 'firebase/firestore';

/**
 * Deep cleans an object recursively, removing any undefined properties which
 * Firestore rejects with 'Function setDoc() called with invalid data. Unsupported field value: undefined'.
 */
export const cleanForFirestore = (obj: any): any => {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(cleanForFirestore).filter((v) => v !== undefined);
  }
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = cleanForFirestore(value);
    }
  }
  return cleaned;
};

/**
 * Protects Firestore and LocalStorage from massive payloads (e.g. 12MB - 20MB base64 strings).
 * Firestore strictly limits document size to 1,048,576 bytes.
 */
export const sanitizeForFirestore = (prod: any): any => {
  const cleaned = cleanForFirestore(prod);
  const sanitized = { ...cleaned };

  // Never put raw base64 data URLs exceeding 150KB into a Firestore document for PDFs
  if (typeof sanitized.pdfUrl === 'string' && sanitized.pdfUrl.startsWith('data:') && sanitized.pdfUrl.length > 150000) {
    sanitized.pdfUrl = '';
  }
  // Never put transient session-only blob: URLs into Firestore as they break across devices
  if (typeof sanitized.pdfUrl === 'string' && sanitized.pdfUrl.startsWith('blob:')) {
    sanitized.pdfUrl = '';
  }
  // Allow optimized Web JPEG covers up to 600KB (typically ~35KB - 50KB)
  if (typeof sanitized.coverImage === 'string' && sanitized.coverImage.startsWith('data:') && sanitized.coverImage.length > 600000) {
    sanitized.coverImage = '';
  }
  if (typeof sanitized.coverImage === 'string' && sanitized.coverImage.startsWith('blob:')) {
    sanitized.coverImage = '';
  }
  if (Array.isArray(sanitized.samplePages)) {
    sanitized.samplePages = sanitized.samplePages.filter(
      (p: string) => typeof p === 'string' && !p.startsWith('blob:') && (!p.startsWith('data:') || p.length < 350000)
    );
  }
  if (Array.isArray(sanitized.previewImages)) {
    sanitized.previewImages = sanitized.previewImages.filter(
      (p: string) => typeof p === 'string' && !p.startsWith('blob:') && (!p.startsWith('data:') || p.length < 350000)
    );
  }
  return sanitized;
};

export const DEFAULT_HERO_CONFIG: HeroBannerConfig = {
  backgroundImage: '',
  backgroundOverlayOpacity: 0.55,
  stackedCards: [
    {
      id: 'card-1',
      title: 'ChatGPT & AI Tools Master Guide',
      image: INITIAL_PRODUCTS[0]?.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      link: `/product/${INITIAL_PRODUCTS[0]?.id || 'chatgpt-ai-tools-master-guide'}`
    },
    {
      id: 'card-2',
      title: 'Canva Pro Design Mastery',
      image: INITIAL_PRODUCTS[1]?.coverImage || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&auto=format&fit=crop&q=80',
      link: `/product/${INITIAL_PRODUCTS[1]?.id || 'canva-design-mastery-guide'}`
    },
    {
      id: 'card-3',
      title: 'Instagram Reels Viral Growth',
      image: INITIAL_PRODUCTS[2]?.coverImage || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80',
      link: `/product/${INITIAL_PRODUCTS[2]?.id || 'instagram-reels-viral-growth-playbook'}`
    },
    {
      id: 'card-4',
      title: 'Affiliate Marketing Zero to Hero',
      image: INITIAL_PRODUCTS[3]?.coverImage || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
      link: `/product/${INITIAL_PRODUCTS[3]?.id || 'affiliate-marketing-zero-to-hero'}`
    }
  ]
};

export const INITIAL_COUPONS: Coupon[] = [
  { 
    id: 'cpn-1', 
    code: 'MASTER10', 
    discountType: 'percentage',
    discountPercent: 10, 
    minOrderAmount: 0,
    description: '10% OFF on all PDF Guides & Combos', 
    isActive: true, 
    timesUsed: 142,
    createdAt: new Date().toISOString() 
  },
  { 
    id: 'cpn-2', 
    code: 'FIRST50', 
    discountType: 'percentage',
    discountPercent: 50, 
    minOrderAmount: 99,
    description: 'Special 50% Welcome Discount (Min ₹99)', 
    isActive: true, 
    timesUsed: 89,
    createdAt: new Date().toISOString() 
  },
  { 
    id: 'cpn-3', 
    code: 'WELCOME20', 
    discountType: 'percentage',
    discountPercent: 20, 
    minOrderAmount: 0,
    description: '20% OFF Special Promo Code', 
    isActive: true, 
    timesUsed: 64,
    createdAt: new Date().toISOString() 
  },
  { 
    id: 'cpn-4', 
    code: 'FLAT50', 
    discountType: 'flat',
    discountPercent: 0,
    discountAmount: 50, 
    minOrderAmount: 99,
    description: 'Flat ₹50 Instant Savings (Min ₹99)', 
    isActive: true, 
    timesUsed: 31,
    createdAt: new Date().toISOString() 
  },
  { 
    id: 'cpn-5', 
    code: 'MEGA100', 
    discountType: 'flat',
    discountPercent: 0,
    discountAmount: 100, 
    minOrderAmount: 199,
    description: 'Flat ₹100 Mega Discount on Orders ₹199+', 
    isActive: true, 
    timesUsed: 19,
    createdAt: new Date().toISOString() 
  }
];

interface ProductContextType {
  products: Product[];
  bundles: Bundle[];
  coupons: Coupon[];
  categories: typeof CATEGORIES_LIST;
  cart: { product: Product; quantity: number }[];
  wishlist: string[];
  orders: Order[];
  downloadLogs: DownloadLog[];
  heroConfig: HeroBannerConfig;
  addProduct: (product: Omit<Product, 'id'>) => Promise<string>;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  addBundle: (bundle: Omit<Bundle, 'id'>) => Promise<string>;
  updateBundle: (id: string, updated: Partial<Bundle>) => Promise<void>;
  deleteBundle: (id: string) => Promise<void>;
  addCoupon: (coupon: Omit<Coupon, 'id'>) => Promise<string>;
  bulkAddCoupons: (coupons: Omit<Coupon, 'id'>[]) => Promise<void>;
  updateCoupon: (id: string, updated: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  resetCouponsToDefaults: () => Promise<void>;
  validateCoupon: (code: string) => Coupon | null;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  addOrder: (order: Order) => Promise<void>;
  logDownload: (orderId: string, productId: string, productTitle: string, customerEmail?: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  getCustomPdfFile: (productId: string) => string | null;
  saveCustomPdfFile: (productId: string, fileData: string, fileName: string) => void;
  updateHeroConfig: (updated: Partial<HeroBannerConfig>) => Promise<void>;
  resetHeroConfig: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'pdf_master_products_v3';
const DELETED_IDS_STORAGE_KEY = 'pdf_master_deleted_ids_v1';
const BUNDLES_STORAGE_KEY = 'pdf_master_bundles_v1';
const DELETED_BUNDLE_IDS_STORAGE_KEY = 'pdf_master_deleted_bundle_ids_v1';
const BUNDLES_INITIALIZED_KEY = 'pdf_master_bundles_initialized_v1';
const PRODUCTS_INITIALIZED_KEY = 'pdf_master_products_initialized_v1';
const COUPONS_STORAGE_KEY = 'pdf_master_coupons_v1';
const CART_STORAGE_KEY = 'pdf_master_cart';
const WISHLIST_STORAGE_KEY = 'pdf_master_wishlist';
const ORDERS_STORAGE_KEY = 'pdf_master_orders';
const LOGS_STORAGE_KEY = 'pdf_master_logs';
const PDF_FILES_STORAGE_KEY = 'pdf_master_uploaded_files';
const HERO_CONFIG_STORAGE_KEY = 'pdf_master_hero_banner_v2';

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deletedProductIds, setDeletedProductIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(DELETED_IDS_STORAGE_KEY);
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) return new Set(arr);
      }
    } catch {}
    return new Set();
  });
  const deletedProductIdsRef = useRef<Set<string>>(deletedProductIds);
  deletedProductIdsRef.current = deletedProductIds;

  const [deletedBundleIds, setDeletedBundleIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(DELETED_BUNDLE_IDS_STORAGE_KEY);
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) return new Set(arr);
      }
    } catch {}
    return new Set();
  });
  const deletedBundleIdsRef = useRef<Set<string>>(deletedBundleIds);
  deletedBundleIdsRef.current = deletedBundleIds;

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const isInit = localStorage.getItem(PRODUCTS_INITIALIZED_KEY);
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        if (Array.isArray(parsed) && isInit) return parsed;
      }
      if (!isInit) {
        localStorage.setItem(PRODUCTS_INITIALIZED_KEY, 'true');
        return INITIAL_PRODUCTS;
      }
    } catch (e) {
      console.warn('Failed to parse cached products', e);
    }
    return INITIAL_PRODUCTS;
  });

  const [bundles, setBundles] = useState<Bundle[]>(() => {
    try {
      const isInit = localStorage.getItem(BUNDLES_INITIALIZED_KEY);
      const saved = localStorage.getItem(BUNDLES_STORAGE_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        // If user deleted bundles and length is 0, respect empty array!
        if (Array.isArray(parsed) && (parsed.length > 0 || isInit)) {
          return parsed;
        }
      }
      if (!isInit) {
        localStorage.setItem(BUNDLES_INITIALIZED_KEY, 'true');
        return INITIAL_BUNDLES;
      }
      return [];
    } catch {}
    return INITIAL_BUNDLES;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem(COUPONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_COUPONS;
  });

  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    const now = Date.now();
    const oneDay = 86400000;
    return [
      {
        id: 'ord_sample_9821',
        razorpayOrderId: 'order_Nx8Yp912A',
        razorpayPaymentId: 'pay_Nx8Zk3981B',
        productId: 'chatgpt-ai-tools-master-guide',
        productTitle: 'ChatGPT & AI Tools Master Guide',
        productCover: INITIAL_PRODUCTS[0]?.coverImage || '',
        amount: 99,
        customerEmail: 'customer@gmail.com',
        customerName: 'Aarav Sharma',
        customerPhone: '+91 70799 88808',
        status: 'paid',
        date: new Date(now - 3600000 * 2).toISOString(), // Today (2 hours ago)
        downloadCount: 1
      },
      {
        id: 'ord_sample_9822',
        razorpayOrderId: 'order_Kx7Am102C',
        razorpayPaymentId: 'pay_Kx7Bn5521D',
        productId: 'bundle-ai-mega-pack',
        productTitle: 'AI & Digital Solopreneur Mega Combo (4 in 1)',
        productCover: INITIAL_BUNDLES[0]?.coverImage || '',
        amount: 149,
        customerEmail: 'shahbaz@example.com',
        customerName: 'Shahbaz Dawateislami',
        customerPhone: '+91 98234 11223',
        status: 'paid',
        date: new Date(now - 3600000 * 6).toISOString(), // Today (6 hours ago)
        downloadCount: 2
      },
      {
        id: 'ord_sample_9823',
        razorpayOrderId: 'order_Jx9Bp301E',
        razorpayPaymentId: 'pay_Jx9Cp7711F',
        productId: 'canva-design-mastery-guide',
        productTitle: 'Canva Pro Design & Social Media Blueprint',
        productCover: INITIAL_PRODUCTS[1]?.coverImage || '',
        amount: 89,
        customerEmail: 'priya.k@gmail.com',
        customerName: 'Priya Kapoor',
        customerPhone: '+91 97112 33445',
        status: 'paid',
        date: new Date(now - oneDay * 2).toISOString(), // This week (2 days ago)
        downloadCount: 1
      },
      {
        id: 'ord_sample_9824',
        razorpayOrderId: 'order_Lx2Fk891G',
        razorpayPaymentId: 'pay_Lx2Gk9922H',
        productId: 'instagram-reels-viral-growth-playbook',
        productTitle: 'Instagram Reels & Viral Growth Playbook',
        productCover: INITIAL_PRODUCTS[2]?.coverImage || '',
        amount: 99,
        customerEmail: 'rohit.v@gmail.com',
        customerName: 'Rohit Verma',
        customerPhone: '+91 98101 22334',
        status: 'paid',
        date: new Date(now - oneDay * 4).toISOString(), // This week (4 days ago)
        downloadCount: 1
      },
      {
        id: 'ord_sample_9825',
        razorpayOrderId: 'order_Mx5Qz441J',
        razorpayPaymentId: 'pay_Mx5Rz5533K',
        productId: 'affiliate-marketing-zero-to-hero',
        productTitle: 'Affiliate Marketing & Passive Income Handbook',
        productCover: INITIAL_PRODUCTS[3]?.coverImage || '',
        amount: 129,
        customerEmail: 'tanveer.a@gmail.com',
        customerName: 'Tanveer Ahmed',
        customerPhone: '+91 98991 44556',
        status: 'paid',
        date: new Date(now - oneDay * 12).toISOString(), // This month (12 days ago)
        downloadCount: 1
      }
    ];
  });

  const [downloadLogs, setDownloadLogs] = useState<DownloadLog[]>(() => {
    try {
      const saved = localStorage.getItem(LOGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'log_01',
        orderId: 'ord_sample_9821',
        productId: 'chatgpt-ai-tools-master-guide',
        productTitle: 'ChatGPT & AI Tools Master Guide',
        customerEmail: 'customer@gmail.com',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ];
  });

  const [heroConfig, setHeroConfig] = useState<HeroBannerConfig>(() => {
    try {
      const saved = localStorage.getItem(HERO_CONFIG_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.stackedCards) && parsed.stackedCards.length > 0) {
          return {
            ...DEFAULT_HERO_CONFIG,
            ...parsed
          };
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached heroConfig', e);
    }
    return DEFAULT_HERO_CONFIG;
  });

  // Helper to safely cache products in localStorage without quota crashes
  const saveProductsToLocalCache = (prods: Product[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prods));
    } catch {
      try {
        const lightweight = prods.map((p) => {
          const item = { ...p };
          if (item.coverImage && item.coverImage.length > 100000) item.coverImage = '';
          if (item.pdfUrl && item.pdfUrl.length > 100000) item.pdfUrl = '';
          if (Array.isArray(item.samplePages)) {
            item.samplePages = item.samplePages.filter((s) => typeof s === 'string' && s.length < 100000);
          }
          if (Array.isArray(item.previewImages)) {
            item.previewImages = item.previewImages.filter((s) => typeof s === 'string' && s.length < 100000);
          }
          return item;
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lightweight));
      } catch (e2) {
        console.warn('LocalStorage quota notice (safe on fullstack):', e2);
      }
    }
  };

  // Persistent storage effects with QuotaExceededError guards
  useEffect(() => {
    saveProductsToLocalCache(products);
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(BUNDLES_STORAGE_KEY, JSON.stringify(bundles));
    } catch (e) {}
  }, [bundles]);

  useEffect(() => {
    try {
      localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(coupons));
    } catch (e) {}
  }, [coupons]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(downloadLogs));
    } catch (e) {}
  }, [downloadLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(HERO_CONFIG_STORAGE_KEY, JSON.stringify(heroConfig));
    } catch (e) {
      console.warn('Could not save hero config to localStorage', e);
    }
  }, [heroConfig]);

  // Real-time Bidirectional Sync with Firestore & Server
  useEffect(() => {
    let unsubProducts: (() => void) | null = null;
    let unsubBundles: (() => void) | null = null;
    let unsubCoupons: (() => void) | null = null;

    async function initRealtimeSync() {
      // 1. First fetch server deleted product IDs
      try {
        const delRes = await fetch('/api/deleted-ids');
        if (delRes.ok) {
          const serverDeleted: string[] = await delRes.json();
          if (Array.isArray(serverDeleted) && serverDeleted.length > 0) {
            setDeletedProductIds((prev) => {
              const combined = new Set([...Array.from(prev), ...serverDeleted]);
              try {
                localStorage.setItem(DELETED_IDS_STORAGE_KEY, JSON.stringify(Array.from(combined)));
              } catch {}
              deletedProductIdsRef.current = combined;
              return combined;
            });
          }
        }
      } catch (err) {}

      // 1b. Fetch server deleted bundle IDs so deleted bundles stay permanently deleted
      try {
        const delBundleRes = await fetch('/api/deleted-bundle-ids');
        if (delBundleRes.ok) {
          const serverDeletedBundles: string[] = await delBundleRes.json();
          if (Array.isArray(serverDeletedBundles) && serverDeletedBundles.length > 0) {
            setDeletedBundleIds((prev) => {
              const combined = new Set([...Array.from(prev), ...serverDeletedBundles]);
              try {
                localStorage.setItem(DELETED_BUNDLE_IDS_STORAGE_KEY, JSON.stringify(Array.from(combined)));
              } catch {}
              deletedBundleIdsRef.current = combined;
              return combined;
            });
          }
        }
      } catch (err) {}

      // 2. Initial server sync to load all persistent server products
      let serverProducts: Product[] = [];
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const list: Product[] = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            serverProducts = list;
            setProducts((prev) => {
              const activeDeleted = deletedProductIdsRef.current;
              const catalogMap = new Map<string, Product>();

              // Base initial products (only if not deleted)
              INITIAL_PRODUCTS.forEach((ip) => {
                if (!activeDeleted.has(ip.id)) catalogMap.set(ip.id, { ...ip });
              });

              // Overlay server products (has user additions/edits)
              serverProducts.forEach((p) => {
                if (p && p.id && !activeDeleted.has(p.id)) {
                  catalogMap.set(p.id, { ...(catalogMap.get(p.id) || {}), ...p });
                }
              });

              // Keep local state additions/edits (crucial so user edits are not lost!)
              prev.forEach((cp) => {
                if (cp && cp.id && !activeDeleted.has(cp.id)) {
                  const existing = catalogMap.get(cp.id);
                  catalogMap.set(cp.id, existing ? { ...existing, ...cp } : cp);
                }
              });

              const merged = Array.from(catalogMap.values());
              saveProductsToLocalCache(merged);
              return merged;
            });
          }
        }
      } catch (err) {
        console.warn('Initial server products fetch notice:', err);
      }

      // 2b. Initial server sync to load all persistent server bundles
      let serverBundles: Bundle[] = [];
      try {
        const bRes = await fetch('/api/bundles');
        if (bRes.ok) {
          const list: Bundle[] = await bRes.json();
          if (Array.isArray(list)) {
            serverBundles = list;
            setBundles((prev) => {
              const activeDeletedBundles = deletedBundleIdsRef.current;
              const bundleMap = new Map<string, Bundle>();

              // Base initial bundles (only if not deleted)
              INITIAL_BUNDLES.forEach((ib) => {
                if (!activeDeletedBundles.has(ib.id)) {
                  bundleMap.set(ib.id, { ...ib });
                }
              });

              // Overlay server bundles (has user additions/edits)
              serverBundles.forEach((b) => {
                if (b && b.id && !activeDeletedBundles.has(b.id)) {
                  bundleMap.set(b.id, { ...(bundleMap.get(b.id) || {}), ...b });
                }
              });

              // Keep local state additions/edits (crucial so user edits are not lost!)
              prev.forEach((cb) => {
                if (cb && cb.id && !activeDeletedBundles.has(cb.id)) {
                  const existing = bundleMap.get(cb.id);
                  bundleMap.set(cb.id, existing ? { ...existing, ...cb } : cb);
                }
              });

              const mergedBundles = Array.from(bundleMap.values());
              try {
                localStorage.setItem(BUNDLES_STORAGE_KEY, JSON.stringify(mergedBundles));
                localStorage.setItem(BUNDLES_INITIALIZED_KEY, 'true');
              } catch {}
              return mergedBundles;
            });
          }
        }
      } catch (err) {
        console.warn('Initial server bundles fetch notice:', err);
      }

      // 3. REAL-TIME FIRESTORE LISTENER FOR PRODUCTS
      try {
        unsubProducts = onSnapshot(
          collection(db, 'products'),
          (snapshot) => {
            const firestoreProducts: Product[] = [];
            snapshot.forEach((d) => {
              const data = d.data();
              if (data) {
                const docId = (typeof data.id === 'string' && data.id.trim()) ? data.id : d.id;
                firestoreProducts.push({
                  ...data,
                  id: docId
                } as Product);
              }
            });

            const activeDeleted = deletedProductIdsRef.current;
            const catalogMap = new Map<string, Product>();

            INITIAL_PRODUCTS.forEach((ip) => {
              if (!activeDeleted.has(ip.id)) {
                catalogMap.set(ip.id, { ...ip });
              }
            });

            serverProducts.forEach((p) => {
              if (p && typeof p.id === 'string' && p.id.trim() && !activeDeleted.has(p.id)) {
                catalogMap.set(p.id, { ...(catalogMap.get(p.id) || {}), ...p });
              }
            });

            firestoreProducts.forEach((p) => {
              if (p && typeof p.id === 'string' && p.id.trim() && !activeDeleted.has(p.id)) {
                catalogMap.set(p.id, { ...(catalogMap.get(p.id) || {}), ...p });
              }
            });

            setProducts((currentProds) => {
              // Preserve user modifications and edits from current state
              currentProds.forEach((cp) => {
                if (cp && cp.id && !activeDeleted.has(cp.id)) {
                  const existing = catalogMap.get(cp.id);
                  catalogMap.set(cp.id, existing ? { ...existing, ...cp } : cp);
                }
              });

              const allProductsList = Array.from(catalogMap.values());
              allProductsList.sort((a, b) => {
                const aIsPdf = a.id.startsWith('pdf-');
                const bIsPdf = b.id.startsWith('pdf-');
                if (aIsPdf && !bIsPdf) return -1;
                if (!aIsPdf && bIsPdf) return 1;
                const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return timeB - timeA;
              });

              saveProductsToLocalCache(allProductsList);
              return allProductsList;
            });
          },
          (error) => {
            console.warn('Firestore real-time listener notice (relying on server DB):', error.message);
          }
        );
      } catch (err) {
        console.warn('Could not attach firestore products onSnapshot:', err);
      }

      // 3b. REAL-TIME FIRESTORE LISTENER FOR BUNDLES
      try {
        unsubBundles = onSnapshot(
          collection(db, 'bundles'),
          (snapshot) => {
            if (!snapshot.empty) {
              const firestoreBundles: Bundle[] = [];
              snapshot.forEach((d) => {
                const data = d.data();
                if (data) {
                  const docId = (typeof data.id === 'string' && data.id.trim()) ? data.id : d.id;
                  firestoreBundles.push({
                    ...data,
                    id: docId
                  } as Bundle);
                }
              });

              const activeDeletedBundles = deletedBundleIdsRef.current;
              const bundleMap = new Map<string, Bundle>();

              INITIAL_BUNDLES.forEach((ib) => {
                if (!activeDeletedBundles.has(ib.id)) {
                  bundleMap.set(ib.id, { ...ib });
                }
              });

              serverBundles.forEach((b) => {
                if (b && typeof b.id === 'string' && b.id.trim() && !activeDeletedBundles.has(b.id)) {
                  bundleMap.set(b.id, { ...(bundleMap.get(b.id) || {}), ...b });
                }
              });

              firestoreBundles.forEach((b) => {
                if (b && typeof b.id === 'string' && b.id.trim() && !activeDeletedBundles.has(b.id)) {
                  bundleMap.set(b.id, { ...(bundleMap.get(b.id) || {}), ...b });
                }
              });

              setBundles((currentBundles) => {
                currentBundles.forEach((cb) => {
                  if (cb && cb.id && !activeDeletedBundles.has(cb.id)) {
                    const existing = bundleMap.get(cb.id);
                    bundleMap.set(cb.id, existing ? { ...existing, ...cb } : cb);
                  }
                });

                const allBundlesList = Array.from(bundleMap.values());
                try {
                  localStorage.setItem(BUNDLES_STORAGE_KEY, JSON.stringify(allBundlesList));
                } catch {}
                return allBundlesList;
              });
            }
          },
          (err) => console.warn('Bundles onSnapshot notice:', err)
        );
      } catch (e) {}

      // Sync hero banner config from Firestore
      try {
        const heroDoc = await getDoc(doc(db, 'settings', 'hero_banner'));
        if (heroDoc.exists()) {
          const remoteHero = heroDoc.data() as HeroBannerConfig;
          if (remoteHero && Array.isArray(remoteHero.stackedCards)) {
            setHeroConfig((prev) => ({ ...prev, ...remoteHero }));
          }
        }
      } catch (err) {}

      // REAL-TIME COUPONS LISTENER
      try {
        unsubCoupons = onSnapshot(
          collection(db, 'coupons'),
          (snapshot) => {
            if (!snapshot.empty) {
              const dbCoupons: Coupon[] = [];
              snapshot.forEach((d) => {
                const data = d.data();
                if (data) {
                  const docId = (typeof data.id === 'string' && data.id.trim()) ? data.id : d.id;
                  dbCoupons.push({
                    ...data,
                    id: docId
                  } as Coupon);
                }
              });
              if (dbCoupons.length > 0) {
                setCoupons(dbCoupons);
                try {
                  localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(dbCoupons));
                } catch {}
              }
            }
          },
          (err) => console.warn('Coupons onSnapshot notice:', err)
        );
      } catch (e) {}
    }

    initRealtimeSync();

    return () => {
      if (unsubProducts) unsubProducts();
      if (unsubBundles) unsubBundles();
      if (unsubCoupons) unsubCoupons();
    };
  }, []);

  const addProduct = async (data: Omit<Product, 'id'>): Promise<string> => {
    const newId = `pdf-${Date.now()}`;
    const newProduct: Product = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString()
    };

    // 1. Instantly update UI state so product immediately shows on website
    setProducts((prev) => {
      const nextList = [newProduct, ...prev.filter((p) => p.id !== newId)];
      saveProductsToLocalCache(nextList);
      return nextList;
    });

    // 2. High-priority persistent save to server database
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      console.log('✓ Product saved to server DB:', newId);
    } catch (e) {
      console.warn('Server product save notice:', e);
    }

    // 3. Sync to Firestore cloud database
    try {
      const sanitized = sanitizeForFirestore(newProduct);
      await setDoc(doc(db, 'products', newId), sanitized);
      console.log('✓ Product published to Firestore:', newId);
    } catch (e) {
      console.warn('Firestore write notice (non-fatal):', e);
    }

    return newId;
  };

  const updateProduct = async (id: string, updated: Partial<Product>): Promise<void> => {
    let fullUpdatedProduct: Product | undefined;
    setProducts((prev) => {
      const nextList = prev.map((p) => {
        if (p.id === id) {
          fullUpdatedProduct = { ...p, ...updated, id };
          return fullUpdatedProduct;
        }
        return p;
      });

      // If not found in active products, find in INITIAL_PRODUCTS
      if (!fullUpdatedProduct) {
        const match = INITIAL_PRODUCTS.find((ip) => ip.id === id);
        if (match) {
          fullUpdatedProduct = { ...match, ...updated, id };
          nextList.unshift(fullUpdatedProduct);
        }
      }

      saveProductsToLocalCache(nextList);
      return nextList;
    });

    if (fullUpdatedProduct) {
      try {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullUpdatedProduct)
        });
      } catch {}

      try {
        const sanitized = sanitizeForFirestore(fullUpdatedProduct);
        await setDoc(doc(db, 'products', id), sanitized, { merge: true });
        console.log('✓ Product updated in Firestore:', id);
      } catch (e) {
        console.warn('Firestore update notice (non-fatal):', e);
      }
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    setDeletedProductIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      deletedProductIdsRef.current = next;
      try {
        localStorage.setItem(DELETED_IDS_STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });

    setProducts((prev) => {
      const nextList = prev.filter((p) => p.id !== id);
      saveProductsToLocalCache(nextList);
      return nextList;
    });

    // Also remove this product from any bundles that contain it
    setBundles((prevBundles) =>
      prevBundles.map((b) => ({
        ...b,
        productIds: (b.productIds || []).filter((pId) => pId !== id)
      }))
    );

    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
    } catch {}

    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) {
      console.warn('Firestore delete notice (non-fatal):', e);
    }
  };

  const resetToDefaults = async (): Promise<void> => {
    setDeletedProductIds(new Set());
    setDeletedBundleIds(new Set());
    try {
      localStorage.removeItem(DELETED_IDS_STORAGE_KEY);
      localStorage.removeItem(DELETED_BUNDLE_IDS_STORAGE_KEY);
      localStorage.removeItem(PRODUCTS_INITIALIZED_KEY);
      localStorage.removeItem(BUNDLES_INITIALIZED_KEY);
      await fetch('/api/products/reset', { method: 'POST' });
      await fetch('/api/bundles/reset', { method: 'POST' });
    } catch {}
    setProducts(INITIAL_PRODUCTS);
    setBundles(INITIAL_BUNDLES);
    saveProductsToLocalCache(INITIAL_PRODUCTS);
    localStorage.setItem(BUNDLES_STORAGE_KEY, JSON.stringify(INITIAL_BUNDLES));
  };

  // Bundle operations with Server & Firestore Persistence
  const addBundle = async (bundleData: Omit<Bundle, 'id'>): Promise<string> => {
    const newId = `bundle-${Date.now()}`;
    const newBundle: Bundle = { ...bundleData, id: newId };

    // 1. Immediately update UI state & local cache
    setBundles((prev) => {
      const next = [newBundle, ...prev.filter((b) => b.id !== newId)];
      try {
        localStorage.setItem(BUNDLES_STORAGE_KEY, JSON.stringify(next));
        localStorage.setItem(BUNDLES_INITIALIZED_KEY, 'true');
      } catch {}
      return next;
    });

    // 2. High-priority persistent save to server database
    try {
      await fetch('/api/bundles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBundle)
      });
      console.log('✓ Bundle saved to server DB:', newId);
    } catch (e) {
      console.warn('Server bundle save notice:', e);
    }

    // 3. Sync to Firestore cloud database
    try {
      const sanitized = sanitizeForFirestore(newBundle);
      await setDoc(doc(db, 'bundles', newId), sanitized);
      console.log('✓ Bundle published to Firestore:', newId);
    } catch (e) {
      console.warn('Firestore bundle write notice:', e);
    }

    return newId;
  };

  const updateBundle = async (id: string, updated: Partial<Bundle>): Promise<void> => {
    let fullUpdatedBundle: Bundle | undefined;

    setBundles((prev) => {
      const next = prev.map((b) => {
        if (b.id === id) {
          fullUpdatedBundle = { ...b, ...updated, id };
          return fullUpdatedBundle;
        }
        return b;
      });

      if (!fullUpdatedBundle) {
        const match = INITIAL_BUNDLES.find((ib) => ib.id === id);
        if (match) {
          fullUpdatedBundle = { ...match, ...updated, id };
          next.unshift(fullUpdatedBundle);
        }
      }

      try {
        localStorage.setItem(BUNDLES_STORAGE_KEY, JSON.stringify(next));
        localStorage.setItem(BUNDLES_INITIALIZED_KEY, 'true');
      } catch {}
      return next;
    });

    if (fullUpdatedBundle) {
      try {
        await fetch('/api/bundles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullUpdatedBundle)
        });
      } catch {}

      try {
        const sanitized = sanitizeForFirestore(fullUpdatedBundle);
        await setDoc(doc(db, 'bundles', id), sanitized, { merge: true });
        console.log('✓ Bundle updated in Firestore:', id);
      } catch (e) {
        console.warn('Firestore bundle update notice:', e);
      }
    }
  };

  const deleteBundle = async (id: string): Promise<void> => {
    // 1. Mark ID as permanently deleted in state & localStorage
    setDeletedBundleIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      deletedBundleIdsRef.current = next;
      try {
        localStorage.setItem(DELETED_BUNDLE_IDS_STORAGE_KEY, JSON.stringify(Array.from(next)));
        localStorage.setItem(BUNDLES_INITIALIZED_KEY, 'true');
      } catch {}
      return next;
    });

    // 2. Remove from active state & local cache
    setBundles((prev) => {
      const next = prev.filter((b) => b.id !== id);
      try {
        localStorage.setItem(BUNDLES_STORAGE_KEY, JSON.stringify(next));
        localStorage.setItem(BUNDLES_INITIALIZED_KEY, 'true');
      } catch {}
      return next;
    });

    // 3. Remove permanently from server database
    try {
      await fetch(`/api/bundles/${id}`, { method: 'DELETE' });
      console.log('✓ Bundle deleted from server DB:', id);
    } catch (e) {
      console.warn('Server bundle delete notice:', e);
    }

    // 4. Remove from Firestore
    try {
      await deleteDoc(doc(db, 'bundles', id));
      console.log('✓ Bundle deleted from Firestore:', id);
    } catch (e) {
      console.warn('Firestore bundle delete notice:', e);
    }
  };

  // Coupon operations
  const addCoupon = async (couponData: Omit<Coupon, 'id'>): Promise<string> => {
    const newId = `cpn-${Date.now()}`;
    const newCoupon: Coupon = {
      ...couponData,
      id: newId,
      code: couponData.code.trim().toUpperCase(),
      createdAt: new Date().toISOString()
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    try {
      await setDoc(doc(db, 'coupons', newId), newCoupon);
    } catch (e) {
      console.warn('Firestore write coupon failed, saved to local state:', e);
    }
    return newId;
  };

  const updateCoupon = async (id: string, updated: Partial<Coupon>): Promise<void> => {
    setCoupons((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              ...updated,
              code: updated.code ? updated.code.trim().toUpperCase() : c.code
            }
          : c
      )
    );
    try {
      await setDoc(doc(db, 'coupons', id), updated, { merge: true });
    } catch (e) {
      console.warn('Firestore update coupon failed, saved to local state:', e);
    }
  };

  const deleteCoupon = async (id: string): Promise<void> => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteDoc(doc(db, 'coupons', id));
    } catch (e) {
      console.warn('Firestore delete coupon failed, saved to local state:', e);
    }
  };

  const bulkAddCoupons = async (newCouponsData: Omit<Coupon, 'id'>[]): Promise<void> => {
    const createdList: Coupon[] = newCouponsData.map((c, idx) => ({
      ...c,
      id: `cpn-${Date.now()}-${idx}`,
      code: c.code.trim().toUpperCase(),
      createdAt: new Date().toISOString(),
      timesUsed: c.timesUsed || 0,
      isActive: c.isActive !== false
    }));
    setCoupons((prev) => [...createdList, ...prev]);
    for (const c of createdList) {
      try {
        await setDoc(doc(db, 'coupons', c.id!), c);
      } catch (e) {
        console.warn('Firestore bulk coupon failed, saved locally:', e);
      }
    }
  };

  const resetCouponsToDefaults = async (): Promise<void> => {
    setCoupons(INITIAL_COUPONS);
    try {
      localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(INITIAL_COUPONS));
    } catch {}
  };

  const validateCoupon = (code: string): Coupon | null => {
    const clean = code.trim().toUpperCase();
    const matched = coupons.find((c) => c.code === clean && c.isActive);
    return matched || null;
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.product.id === product.id);
      if (exists) return prev;
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const addOrder = async (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    try {
      await setDoc(doc(db, 'orders', order.id), order);
    } catch (e) {}
  };

  const logDownload = async (orderId: string, productId: string, productTitle: string, customerEmail?: string) => {
    const log: DownloadLog = {
      id: `log_${Date.now()}`,
      orderId,
      productId,
      productTitle,
      customerEmail: customerEmail || 'guest@pdfmaster.in',
      timestamp: new Date().toISOString()
    };
    setDownloadLogs((prev) => [log, ...prev]);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, downloadCount: (o.downloadCount || 0) + 1 } : o))
    );
    try {
      await setDoc(doc(db, 'download_logs', log.id), log);
    } catch (e) {}
  };

  // In-memory cache for custom uploaded PDF files
  const [customPdfMap] = useState<Map<string, { data: string; name: string }>>(() => new Map());

  const saveCustomPdfFile = (productId: string, fileData: string, fileName: string) => {
    customPdfMap.set(productId, { data: fileData, name: fileName });
    try {
      if (fileData && fileData.length < 500000) {
        const existing = JSON.parse(localStorage.getItem(PDF_FILES_STORAGE_KEY) || '{}');
        existing[productId] = { data: fileData, name: fileName };
        localStorage.setItem(PDF_FILES_STORAGE_KEY, JSON.stringify(existing));
      }
    } catch (e) {
      console.warn('LocalStorage limit reached for PDF storage, kept safely in memory & server:', e);
    }
  };

  const getCustomPdfFile = (productId: string): string | null => {
    if (customPdfMap.has(productId)) {
      return customPdfMap.get(productId)?.data || null;
    }
    try {
      const existing = JSON.parse(localStorage.getItem(PDF_FILES_STORAGE_KEY) || '{}');
      return existing[productId]?.data || null;
    } catch {
      return null;
    }
  };

  const updateHeroConfig = async (updated: Partial<HeroBannerConfig>): Promise<void> => {
    setHeroConfig((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem(HERO_CONFIG_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      await setDoc(doc(db, 'settings', 'hero_banner'), updated, { merge: true });
    } catch (e) {
      console.warn('Firestore hero config update failed:', e);
    }
  };

  const resetHeroConfig = async (): Promise<void> => {
    setHeroConfig(DEFAULT_HERO_CONFIG);
    try {
      localStorage.setItem(HERO_CONFIG_STORAGE_KEY, JSON.stringify(DEFAULT_HERO_CONFIG));
    } catch {}
    try {
      await setDoc(doc(db, 'settings', 'hero_banner'), DEFAULT_HERO_CONFIG);
    } catch (e) {
      console.warn('Firestore hero config reset failed:', e);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        bundles,
        coupons,
        categories: CATEGORIES_LIST,
        cart,
        wishlist,
        orders,
        downloadLogs,
        heroConfig,
        addProduct,
        updateProduct,
        deleteProduct,
        resetToDefaults,
        addBundle,
        updateBundle,
        deleteBundle,
        addCoupon,
        bulkAddCoupons,
        updateCoupon,
        deleteCoupon,
        resetCouponsToDefaults,
        validateCoupon,
        addToCart,
        removeFromCart,
        clearCart,
        toggleWishlist,
        addOrder,
        logDownload,
        isWishlisted,
        getCustomPdfFile,
        saveCustomPdfFile,
        updateHeroConfig,
        resetHeroConfig
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProducts must be used within ProductProvider');
  return ctx;
};
