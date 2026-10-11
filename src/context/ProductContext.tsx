import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Order, DownloadLog, Bundle, HeroBannerConfig, HeroStackedCard, Coupon } from '../types';
import { INITIAL_PRODUCTS, CATEGORIES_LIST, INITIAL_BUNDLES } from '../data/initialProducts';
import { db } from '../firebase';
import { collection, getDocs, setDoc, doc, deleteDoc, getDoc } from 'firebase/firestore';

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
  { id: 'cpn-1', code: 'MASTER10', discountPercent: 10, description: '10% OFF on all PDF Guides & Bundles', isActive: true, createdAt: new Date().toISOString() },
  { id: 'cpn-2', code: 'FIRST50', discountPercent: 50, description: 'Special 50% Welcome Discount', isActive: true, createdAt: new Date().toISOString() },
  { id: 'cpn-3', code: 'WELCOME20', discountPercent: 20, description: '20% OFF Special Promo Code', isActive: true, createdAt: new Date().toISOString() }
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
  updateCoupon: (id: string, updated: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
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
const BUNDLES_STORAGE_KEY = 'pdf_master_bundles_v1';
const COUPONS_STORAGE_KEY = 'pdf_master_coupons_v1';
const CART_STORAGE_KEY = 'pdf_master_cart';
const WISHLIST_STORAGE_KEY = 'pdf_master_wishlist';
const ORDERS_STORAGE_KEY = 'pdf_master_orders';
const LOGS_STORAGE_KEY = 'pdf_master_logs';
const PDF_FILES_STORAGE_KEY = 'pdf_master_uploaded_files';
const HERO_CONFIG_STORAGE_KEY = 'pdf_master_hero_banner_v2';

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse cached products', e);
    }
    return INITIAL_PRODUCTS;
  });

  const [bundles, setBundles] = useState<Bundle[]>(() => {
    try {
      const saved = localStorage.getItem(BUNDLES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
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

  // Persistent storage effects
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(BUNDLES_STORAGE_KEY, JSON.stringify(bundles));
  }, [bundles]);

  useEffect(() => {
    try {
      localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(coupons));
    } catch (e) {}
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(downloadLogs));
  }, [downloadLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(HERO_CONFIG_STORAGE_KEY, JSON.stringify(heroConfig));
    } catch (e) {
      console.warn('Could not save hero config to localStorage', e);
    }
  }, [heroConfig]);

  // Sync with Firestore in background if available
  useEffect(() => {
    async function syncFirestore() {
      try {
        const snap = await getDocs(collection(db, 'products'));
        if (!snap.empty) {
          const dbProducts: Product[] = [];
          snap.forEach((d) => dbProducts.push(d.data() as Product));
          if (dbProducts.length > 0) {
            setProducts(dbProducts);
          }
        }

        const heroDoc = await getDoc(doc(db, 'settings', 'hero_banner'));
        if (heroDoc.exists()) {
          const remoteHero = heroDoc.data() as HeroBannerConfig;
          if (remoteHero && Array.isArray(remoteHero.stackedCards)) {
            setHeroConfig((prev) => ({ ...prev, ...remoteHero }));
          }
        }
      } catch (err) {
        // Fallback to local
      }
    }
    syncFirestore();
  }, []);

  const addProduct = async (data: Omit<Product, 'id'>): Promise<string> => {
    const newId = `pdf-${Date.now()}`;
    const newProduct: Product = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString()
    };
    setProducts((prev) => [newProduct, ...prev]);

    try {
      await setDoc(doc(db, 'products', newId), newProduct);
    } catch (e) {
      console.warn('Firestore write failed, saved to local state only:', e);
    }
    return newId;
  };

  const updateProduct = async (id: string, updated: Partial<Product>): Promise<void> => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );

    try {
      await setDoc(doc(db, 'products', id), updated, { merge: true });
    } catch (e) {
      console.warn('Firestore update failed, saved to local state only:', e);
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) {
      console.warn('Firestore delete failed, saved to local state only:', e);
    }
  };

  const resetToDefaults = async (): Promise<void> => {
    setProducts(INITIAL_PRODUCTS);
    setBundles(INITIAL_BUNDLES);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(BUNDLES_STORAGE_KEY, JSON.stringify(INITIAL_BUNDLES));
  };

  // Bundle operations
  const addBundle = async (bundleData: Omit<Bundle, 'id'>): Promise<string> => {
    const newId = `bundle-${Date.now()}`;
    const newBundle: Bundle = { ...bundleData, id: newId };
    setBundles((prev) => [newBundle, ...prev]);
    return newId;
  };

  const updateBundle = async (id: string, updated: Partial<Bundle>): Promise<void> => {
    setBundles((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
  };

  const deleteBundle = async (id: string): Promise<void> => {
    setBundles((prev) => prev.filter((b) => b.id !== id));
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

  // Custom PDF File Storage
  const saveCustomPdfFile = (productId: string, fileData: string, fileName: string) => {
    try {
      const existing = JSON.parse(localStorage.getItem(PDF_FILES_STORAGE_KEY) || '{}');
      existing[productId] = { data: fileData, name: fileName };
      localStorage.setItem(PDF_FILES_STORAGE_KEY, JSON.stringify(existing));
    } catch (e) {
      console.warn('Could not cache file data', e);
    }
  };

  const getCustomPdfFile = (productId: string): string | null => {
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
        updateCoupon,
        deleteCoupon,
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
