import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Order, DownloadLog, Bundle } from '../types';
import { INITIAL_PRODUCTS, CATEGORIES_LIST, INITIAL_BUNDLES } from '../data/initialProducts';
import { db } from '../firebase';
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';

interface ProductContextType {
  products: Product[];
  bundles: Bundle[];
  categories: typeof CATEGORIES_LIST;
  cart: { product: Product; quantity: number }[];
  wishlist: string[];
  orders: Order[];
  downloadLogs: DownloadLog[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<string>;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  addBundle: (bundle: Omit<Bundle, 'id'>) => Promise<string>;
  updateBundle: (id: string, updated: Partial<Bundle>) => Promise<void>;
  deleteBundle: (id: string) => Promise<void>;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  addOrder: (order: Order) => Promise<void>;
  logDownload: (orderId: string, productId: string, productTitle: string, customerEmail?: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  getCustomPdfFile: (productId: string) => string | null;
  saveCustomPdfFile: (productId: string, fileData: string, fileName: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'pdf_master_products_v3';
const BUNDLES_STORAGE_KEY = 'pdf_master_bundles_v1';
const CART_STORAGE_KEY = 'pdf_master_cart';
const WISHLIST_STORAGE_KEY = 'pdf_master_wishlist';
const ORDERS_STORAGE_KEY = 'pdf_master_orders';
const LOGS_STORAGE_KEY = 'pdf_master_logs';
const PDF_FILES_STORAGE_KEY = 'pdf_master_uploaded_files';

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
        customerPhone: '+91 98765 43210',
        status: 'paid',
        date: new Date(Date.now() - 3600000 * 2).toISOString(),
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
        date: new Date(Date.now() - 3600000 * 18).toISOString(),
        downloadCount: 2
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

  // Persistent storage effects
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(BUNDLES_STORAGE_KEY, JSON.stringify(bundles));
  }, [bundles]);

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

  return (
    <ProductContext.Provider
      value={{
        products,
        bundles,
        categories: CATEGORIES_LIST,
        cart,
        wishlist,
        orders,
        downloadLogs,
        addProduct,
        updateProduct,
        deleteProduct,
        resetToDefaults,
        addBundle,
        updateBundle,
        deleteBundle,
        addToCart,
        removeFromCart,
        clearCart,
        toggleWishlist,
        addOrder,
        logDownload,
        isWishlisted,
        getCustomPdfFile,
        saveCustomPdfFile
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
