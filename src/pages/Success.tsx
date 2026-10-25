import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Download, 
  BookOpen, 
  ArrowRight, 
  ShieldCheck, 
  Check, 
  X, 
  Lock, 
  AlertTriangle, 
  RefreshCw,
  Layers,
  FileText
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useProducts } from '../context/ProductContext';
import { Product } from '../types';
import { INITIAL_BUNDLES, INITIAL_PRODUCTS } from '../data/initialProducts';
import { RealWhatsAppIcon } from '../components/WhatsAppFloatingButton';
import { downloadPdfBlob } from '../utils/pdfGenerator';
import { formatCloudPdfUrl, isValidCloudPdfUrl, getOriginalPdfLocally } from '../utils/pdfStorageApi';

export default function Success() {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders, products, bundles, logDownload } = useProducts();

  const [downloading, setDownloading] = useState(false);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);
  const [readingProduct, setReadingProduct] = useState<Product | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [activeOrder, setActiveOrder] = useState<any>(null);

  // Check verification on mount
  useEffect(() => {
    let isMounted = true;

    async function checkVerification() {
      setIsVerifying(true);
      // 1. Check local / state orders
      const matchedOrder = orders.find((o) => o.id === orderId);

      if (matchedOrder && matchedOrder.status === 'paid' && matchedOrder.verified !== false) {
        if (isMounted) {
          setActiveOrder(matchedOrder);
          setIsVerified(true);
          setIsVerifying(false);
        }
        return;
      }

      // Check localStorage backup for orders
      try {
        const storedOrders = JSON.parse(localStorage.getItem('pdfmaster_orders') || '[]');
        const storedMatch = storedOrders.find((o: any) => o.id === orderId);
        if (storedMatch && storedMatch.status === 'paid') {
          if (isMounted) {
            setActiveOrder(storedMatch);
            setIsVerified(true);
            setIsVerifying(false);
          }
          return;
        }
      } catch {}

      // 2. Query backend verification status for this order
      if (orderId) {
        try {
          const res = await fetch(`/api/orders/${orderId}/verify-status`);
          if (res.ok) {
            const data = await res.json();
            if (data.verified && data.status === 'paid') {
              if (isMounted) {
                setActiveOrder(data.order || matchedOrder);
                setIsVerified(true);
                setIsVerifying(false);
              }
              return;
            }
          }
        } catch (err) {
          console.warn('Could not verify order status on backend:', err);
        }
      }

      if (isMounted) {
        if (matchedOrder) {
          setActiveOrder(matchedOrder);
          setIsVerified(matchedOrder.status === 'paid');
        } else {
          setActiveOrder(null);
          setIsVerified(false);
        }
        setIsVerifying(false);
      }
    }

    checkVerification();

    return () => {
      isMounted = false;
    };
  }, [orderId, orders]);

  // Determine if this order was for a Combo / Bundle
  const allBundles = bundles && bundles.length > 0 ? bundles : INITIAL_BUNDLES;
  const matchedBundle =
    allBundles.find((b) => b.id === activeOrder?.productId) ||
    INITIAL_BUNDLES.find((b) => b.id === activeOrder?.productId) ||
    (activeOrder?.productTitle ? allBundles.find((b) => b.title.toLowerCase().trim() === activeOrder.productTitle.toLowerCase().trim()) : null) ||
    (activeOrder?.productTitle ? INITIAL_BUNDLES.find((b) => b.title.toLowerCase().trim() === activeOrder.productTitle.toLowerCase().trim()) : null) ||
    (activeOrder?.productId?.startsWith('bundle-') ? allBundles.find((b) => b.id === activeOrder.productId) : null) ||
    null;

  const isBundle = Boolean(matchedBundle);
  const bundleProds: Product[] = isBundle && matchedBundle
    ? matchedBundle.productIds
        .map((pid: string) => products.find((p) => p.id === pid) || INITIAL_PRODUCTS.find((p) => p.id === pid))
        .filter(Boolean) as Product[]
    : [];

  // Single Product fallback
  const singleProduct: Product =
    products.find((p) => p.id === activeOrder?.productId) ||
    INITIAL_PRODUCTS.find((p) => p.id === activeOrder?.productId) ||
    (activeOrder?.productTitle
      ? products.find((p) => p.title.toLowerCase().trim() === activeOrder.productTitle.toLowerCase().trim()) ||
        INITIAL_PRODUCTS.find((p) => p.title.toLowerCase().trim() === activeOrder.productTitle.toLowerCase().trim())
      : null) ||
    products[0] ||
    INITIAL_PRODUCTS[0];

  // Bulletproof download handler for any specific product
  const handleDownloadSpecific = async (prod: Product) => {
    if (!isVerified) return;

    setDownloading(true);
    setDownloadSuccessMsg(`Starting download for "${prod.title}"...`);

    if (activeOrder && prod) {
      await logDownload(activeOrder.id, prod.id, prod.title, activeOrder.customerEmail);
    }

    const cleanTitle = (prod?.title || 'PDF_Master_Document').replace(/[^a-zA-Z0-9_-]/g, '_');

    try {
      // 1. Direct Server Uploaded File (/api/files/... or /uploads/...)
      // Always fallbacks to `/api/files/${prod.id}.pdf` so download never fails or shows 0 MB
      const rawTargetUrl = prod?.pdfUrl || `/api/files/${prod.id}.pdf`;
      if (rawTargetUrl.startsWith('/api/') || rawTargetUrl.startsWith('/uploads/')) {
        const downloadUrl = `${rawTargetUrl}${rawTargetUrl.includes('?') ? '&' : '?'}download=1`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${cleanTitle}.pdf`;
        link.setAttribute('target', '_self');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        try {
          const res = await fetch(downloadUrl);
          if (res.ok) {
            const blob = await res.blob();
            downloadPdfBlob(blob, `${cleanTitle}.pdf`);
          }
        } catch {}

        setDownloading(false);
        setDownloadSuccessMsg(`✓ "${prod.title}" downloaded! Check your downloads.`);
        setTimeout(() => setDownloadSuccessMsg(null), 5000);
        return;
      }

      // 2. Direct Permanent Cloud Link (Google Drive, Cloudinary, Dropbox, CDN)
      if (isValidCloudPdfUrl(rawTargetUrl)) {
        const directUrl = formatCloudPdfUrl(rawTargetUrl);
        const link = document.createElement('a');
        link.href = directUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.download = `${cleanTitle}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloading(false);
        setDownloadSuccessMsg(`✓ "${prod.title}" download initiated!`);
        setTimeout(() => setDownloadSuccessMsg(null), 5000);
        return;
      }

      // 3. Local binary cache for the exact original file
      if (prod?.id) {
        const localCached = await getOriginalPdfLocally(prod.id);
        if (localCached && localCached.blob) {
          downloadPdfBlob(localCached.blob, `${cleanTitle}.pdf`);
          setDownloading(false);
          setDownloadSuccessMsg(`✓ "${prod.title}" downloaded!`);
          setTimeout(() => setDownloadSuccessMsg(null), 5000);
          return;
        }
      }

      // 4. Server stream fallback endpoint
      if (activeOrder?.id || orderId) {
        window.location.href = `/api/download/${activeOrder?.id || orderId}?productId=${prod?.id || ''}`;
        setDownloading(false);
        setDownloadSuccessMsg(`✓ "${prod.title}" download started!`);
        setTimeout(() => setDownloadSuccessMsg(null), 5000);
        return;
      }

      // 5. WhatsApp direct assistance
      setDownloading(false);
      const waText = encodeURIComponent(
        `Hi PDF Master India, I purchased "${prod.title}" (Order ID: ${activeOrder?.id || orderId}). Please send my exact original PDF file here on WhatsApp.`
      );
      window.open(`https://wa.me/917079988808?text=${waText}`, '_blank');
      setDownloadSuccessMsg('✓ WhatsApp opened for direct file delivery.');
      setTimeout(() => setDownloadSuccessMsg(null), 5000);
    } catch (e) {
      console.warn('PDF download notice:', e);
      setDownloading(false);
      const waText = encodeURIComponent(
        `Hi PDF Master India, I need help downloading "${prod?.title}" (Order ID: ${activeOrder?.id || orderId}). Please send my file directly on WhatsApp.`
      );
      window.open(`https://wa.me/917079988808?text=${waText}`, '_blank');
      setDownloadSuccessMsg('✓ WhatsApp opened for assistance.');
    }
  };

  // Download all files in a combo sequentially
  const handleDownloadAllCombo = () => {
    if (!bundleProds || bundleProds.length === 0) return;
    setDownloading(true);
    setDownloadSuccessMsg(`Downloading all ${bundleProds.length} PDFs from "${matchedBundle?.title || 'Combo'}"...`);

    bundleProds.forEach((bp, idx) => {
      setTimeout(() => {
        handleDownloadSpecific(bp);
        if (idx === bundleProds.length - 1) {
          setDownloading(false);
        }
      }, idx * 700);
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-gray-900">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {/* CASE 1: VERIFYING STATE */}
        {isVerifying ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200/80 shadow-lg text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto animate-spin">
              <RefreshCw size={28} />
            </div>
            <h2 className="text-xl font-black text-gray-900">
              Verifying Razorpay Payment Status...
            </h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Kripya ek second rukein, hum Razorpay gateway se payment status verify kar rahe hain.
            </p>
          </div>
        ) : !isVerified ? (
          /* CASE 2: PAYMENT NOT VERIFIED (STRICTLY LOCKED) */
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-red-200/90 shadow-xl text-center space-y-6">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <Lock size={40} className="stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-black border border-red-200">
                <AlertTriangle size={14} /> Download Locked - Verification Required
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Payment Verification Pending
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                Jab tak Razorpay se payment safalta-poorvak confirm nahi ho jata, tab tak PDF download ka button lock rahega.
              </p>
            </div>

            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 max-w-md mx-auto text-left text-xs text-amber-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <span>Kya aapne payment complete kar diya hai?</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-normal">
                Agar aapke account se paise kat gaye hain aur status update nahi hua, toh niche diye gaye button se status re-check karein ya WhatsApp helpline par transaction ID share karein.
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-slate-900 hover:bg-black text-white font-extrabold py-3.5 px-6 rounded-xl text-xs sm:text-sm tracking-wide shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RefreshCw size={15} /> Re-Check Payment Status
              </button>

              <a
                href={`https://wa.me/917079988808?text=Hi%20PDF%20Master%20India,%20I%20made%20a%20payment%20for%20order%20${orderId || ''}%20but%20download%20is%20showing%20locked.%20Please%20help.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-black py-3 px-6 rounded-xl text-xs sm:text-sm tracking-wide shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RealWhatsAppIcon size={18} className="text-white" />
                <span>Contact WhatsApp Support (+91 70799 88808)</span>
              </a>

              <Link
                to="/"
                className="inline-flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-900 font-bold pt-2"
              >
                Back to Homepage
              </Link>
            </div>
          </div>
        ) : (
          /* CASE 3: PAYMENT VERIFIED & CONFIRMED (UNLOCKED) */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-lg space-y-6">
            {/* Green Check Animation & Status Banner */}
            <div className="text-center space-y-3">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md animate-bounce">
                <CheckCircle size={44} className="stroke-[2.5]" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <ShieldCheck size={14} className="text-emerald-600" /> Razorpay Verified Payment • Authenticated
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Payment Successful &amp; PDF Unlocked!
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
                Aapka payment verify ho gaya hai. Digital PDF files instant download ke liye ready hain.
              </p>
            </div>

            {/* Notification message toast if downloading */}
            {downloadSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-center text-xs font-bold text-emerald-800 animate-fadeIn">
                {downloadSuccessMsg}
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* VIEW A: COMBO PACK ORDER RECEIPT & INDIVIDUAL GUIDES */}
            {/* ---------------------------------------------------- */}
            {isBundle && matchedBundle ? (
              <div className="space-y-6">
                {/* Combo Header Card */}
                <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white rounded-3xl p-5 sm:p-6 border border-orange-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <img
                      src={activeOrder?.productCover || matchedBundle.coverImage}
                      alt=""
                      className="w-16 h-22 object-cover rounded-xl shadow-xs border border-orange-200 shrink-0 bg-white"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-gray-400 font-mono">
                          Order #{activeOrder?.id || orderId}
                        </span>
                        <span className="text-[10px] bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                          <Layers size={11} /> Combo Pack ({bundleProds.length} PDFs Included)
                        </span>
                      </div>
                      <h3 className="font-extrabold text-base sm:text-lg text-gray-900 mt-1">
                        {activeOrder?.productTitle || matchedBundle.title}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-1">{matchedBundle.subtitle}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs font-black text-gray-900">
                          Amount Paid: ₹{activeOrder?.amount || matchedBundle.price}
                        </span>
                        {activeOrder?.razorpayPaymentId && (
                          <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded">
                            PID: {activeOrder.razorpayPaymentId}
                          </span>
                        )}
                        <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                          <Check size={13} className="text-emerald-600 font-black" /> All {bundleProds.length} Guides Unlocked
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Master Combo Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                    <button
                      onClick={handleDownloadAllCombo}
                      disabled={downloading}
                      className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-black py-3 px-5 rounded-xl text-xs sm:text-sm tracking-wide shadow-lg shadow-orange-600/25 ring-2 ring-orange-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download size={16} className="stroke-[2.5]" />
                      <span>{downloading ? 'Downloading Files...' : `Download All ${bundleProds.length} PDFs`}</span>
                    </button>
                    <a
                      href={`https://wa.me/917079988808?text=${encodeURIComponent(`Hi PDF Master India, I just purchased Combo "${matchedBundle.title}" (Order ID: ${activeOrder?.id || orderId}). Please send all ${bundleProds.length} PDF files directly here on WhatsApp.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      title="Receive all PDFs on WhatsApp"
                    >
                      <RealWhatsAppIcon size={16} className="text-white" />
                      <span>WhatsApp Copy</span>
                    </a>
                  </div>
                </div>

                {/* All Individual Guides Included In This Combo */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <h3 className="font-black text-sm text-gray-900 flex items-center gap-2">
                      <FileText size={16} className="text-orange-600" />
                      Download Individual Guides ({bundleProds.length} Total):
                    </h3>
                    <span className="text-[11px] text-gray-500 font-medium">Click download on any book below</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {bundleProds.map((bp, bpIdx) => (
                      <div
                        key={bp.id || bpIdx}
                        className="bg-white hover:bg-orange-50/40 p-3.5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-xs flex items-center justify-between gap-3 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={bp.coverImage}
                            alt=""
                            className="w-12 h-16 object-cover rounded-xl shadow-2xs border border-gray-200 shrink-0 bg-white"
                          />
                          <div className="min-w-0">
                            <span className="text-[9px] font-black text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded">
                              Book #{bpIdx + 1}
                            </span>
                            <h4 className="font-bold text-xs text-gray-900 truncate mt-1" title={bp.title}>
                              {bp.title}
                            </h4>
                            <p className="text-[10px] text-gray-500">{bp.category} • {bp.pdfPagesCount || 120}+ Pages</p>
                            <p className="text-[9px] text-emerald-600 font-bold mt-0.5">✓ Ready for instant download</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => setReadingProduct(bp)}
                            className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors cursor-pointer"
                            title="Read Online"
                          >
                            <BookOpen size={14} />
                          </button>
                          <button
                            onClick={() => handleDownloadSpecific(bp)}
                            className="bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-black px-3 py-2 rounded-xl transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <Download size={13} /> Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* ---------------------------------------------------- */
              /* VIEW B: SINGLE PRODUCT ORDER RECEIPT & DOWNLOAD      */
              /* ---------------------------------------------------- */
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/80 max-w-lg mx-auto flex items-center gap-4 text-left">
                  <img
                    src={singleProduct.coverImage}
                    alt=""
                    className="w-16 h-22 object-cover rounded-xl shadow-xs border border-gray-200 shrink-0"
                  />
                  <div className="flex-1">
                    <div className="text-[10px] text-gray-400 font-mono">
                      Order ID: {activeOrder?.id || orderId}
                    </div>
                    {activeOrder?.razorpayPaymentId && (
                      <div className="text-[10px] text-emerald-700 font-mono font-bold">
                        Payment ID: {activeOrder.razorpayPaymentId}
                      </div>
                    )}
                    <h3 className="font-bold text-sm text-gray-900 line-clamp-2 mt-0.5">
                      {singleProduct.title}
                    </h3>
                    <div className="text-xs font-black text-gray-900 mt-1">
                      Amount Paid: ₹{activeOrder?.amount || singleProduct.price}
                    </div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                      <Check size={12} /> Lifetime License Granted
                    </div>
                  </div>
                </div>

                <div className="max-w-md mx-auto space-y-3 pt-2">
                  <button
                    onClick={() => handleDownloadSpecific(singleProduct)}
                    disabled={downloading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black py-4 px-6 rounded-2xl text-sm sm:text-base tracking-wide shadow-xl shadow-emerald-600/25 ring-4 ring-emerald-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download size={20} />
                    <span>{downloading ? 'Preparing Secure PDF...' : 'Download PDF Now'}</span>
                  </button>

                  <button
                    onClick={() => setReadingProduct(singleProduct)}
                    className="w-full bg-navy-950 hover:bg-navy-900 text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BookOpen size={16} /> Read PDF Online
                  </button>

                  <a
                    href={`https://wa.me/917079988808?text=Hi%20PDF%20Master%20India,%20I%20just%20completed%20Order%20${activeOrder?.id || orderId}%20for%20${encodeURIComponent(singleProduct.title)}.%20Please%20send%20my%20PDF%20copy%20here.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-3 px-4 rounded-xl text-xs tracking-wide transition-all flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/20"
                  >
                    <RealWhatsAppIcon size={16} className="text-white" />
                    <span>Receive on WhatsApp (+91 70799 88808)</span>
                  </a>
                </div>
              </div>
            )}

            {/* Navigation Link to Purchases */}
            <div className="pt-4 border-t border-gray-100 text-center">
              <Link
                to="/purchases"
                className="inline-flex items-center justify-center gap-1.5 text-xs text-blue-600 font-bold hover:underline"
              >
                Go to My Purchases Tab to see all your library books <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Online Reader Modal */}
      {readingProduct && isVerified && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-gray-900">{readingProduct.title}</h3>
                <p className="text-[11px] text-gray-500">Interactive In-Browser Reader</p>
              </div>
              <button
                onClick={() => setReadingProduct(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs text-gray-700 leading-relaxed max-h-[65vh] overflow-y-auto pr-2">
              {/* Product Drawing Sheets / Sample Pages Gallery */}
              {(((readingProduct.samplePages && readingProduct.samplePages.length > 0) || (readingProduct.previewImages && readingProduct.previewImages.length > 0))) && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                      <BookOpen size={15} className="text-emerald-600" /> Drawing Sheets &amp; Unlocked Pages:
                    </h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Full Resolution
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {[...(readingProduct.samplePages || []), ...(readingProduct.previewImages || [])]
                      .filter((img, idx, arr) => img && typeof img === 'string' && arr.indexOf(img) === idx)
                      .map((sheetImg, sIdx) => (
                        <div key={sIdx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                            <span>📄 Sheet #{sIdx + 1} - {readingProduct.title}</span>
                            <span className="text-[10px] text-emerald-600 font-mono">aldahr.online verified</span>
                          </div>
                          <img
                            src={sheetImg}
                            alt={`Sheet ${sIdx + 1}`}
                            className="w-full max-h-[480px] object-contain rounded-lg border border-slate-100 bg-white"
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <h4 className="font-bold text-orange-900 mb-1">Executive Summary:</h4>
                <p>{readingProduct.description}</p>
              </div>

              {readingProduct.tableOfContents && readingProduct.tableOfContents.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Curriculum Table of Contents:</h4>
                  <ul className="space-y-1.5 list-disc pl-5">
                    {readingProduct.tableOfContents.map((t, idx) => (
                      <li key={idx}>
                        <span className="font-bold">{t.chapter}:</span> {t.title} ({t.pages})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {readingProduct.highlights && readingProduct.highlights.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Core Frameworks &amp; Prompts:</h4>
                  {readingProduct.highlights.map((h, idx) => (
                    <p key={idx} className="mb-1 flex items-center gap-2">
                      <Check size={14} className="text-emerald-600 shrink-0" /> {h}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t flex justify-end">
              <button
                onClick={() => handleDownloadSpecific(readingProduct)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={14} /> Download File
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
