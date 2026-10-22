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
  RefreshCw 
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useProducts } from '../context/ProductContext';
import { RealWhatsAppIcon } from '../components/WhatsAppFloatingButton';

export default function Success() {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders, products, logDownload } = useProducts();

  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isReadingOnline, setIsReadingOnline] = useState(false);
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
        setActiveOrder(matchedOrder || null);
        setIsVerified(false);
        setIsVerifying(false);
      }
    }

    checkVerification();

    return () => {
      isMounted = false;
    };
  }, [orderId, orders]);

  // Product for this order
  const product = products.find((p) => p.id === activeOrder?.productId) || products[0];

  const handleDownload = async () => {
    if (!isVerified) return; // STRICT GUARD: Never download if not verified!

    setDownloading(true);

    if (activeOrder && product) {
      await logDownload(activeOrder.id, product.id, product.title, activeOrder.customerEmail);
    }

    try {
      const targetUrl = product?.pdfUrl || `/api/download/${activeOrder?.id || orderId}`;
      const cleanTitle = (product?.title || 'PDF_Master_Guide').replace(/[^a-zA-Z0-9_-]/g, '_');

      // CASE A: Base64 Data URL (Stored in Firestore/Client)
      if (targetUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = targetUrl;
        link.download = `${cleanTitle}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloading(false);
        setDownloadSuccess(true);
        return;
      }

      // CASE B: Direct External Cloud Link (Google Drive, Dropbox, Cloud URL)
      if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
        const link = document.createElement('a');
        link.href = targetUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.download = `${cleanTitle}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloading(false);
        setDownloadSuccess(true);
        return;
      }

      // CASE C: Server File Stream
      const res = await fetch(targetUrl);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${cleanTitle}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setDownloading(false);
        setDownloadSuccess(true);
        return;
      }
    } catch (e) {
      console.warn('Direct stream fetch notice:', e);
    }

    // CASE D: Direct browser navigation fallback
    const fallbackLink = document.createElement('a');
    fallbackLink.href = `/api/download/${activeOrder?.id || orderId}`;
    fallbackLink.download = `${(product?.title || 'PDF_Guide').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    document.body.appendChild(fallbackLink);
    fallbackLink.click();
    document.body.removeChild(fallbackLink);

    setDownloading(false);
    setDownloadSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-gray-900">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
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
              Kripya ek second rukein, hum Razorpay gateway se payment signature verify kar rahe hain.
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
                Jab tak Razorpay se payment safalta-poorvak confirm aur verify nahi ho jata, tab tak PDF download ka button lock rahega.
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
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-lg text-center space-y-6">
            {/* Green Check Animation */}
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md animate-bounce">
              <CheckCircle size={44} className="stroke-[2.5]" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2 border border-emerald-200">
                <ShieldCheck size={14} className="text-emerald-600" /> Razorpay Verified Payment • Authenticated
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Payment Successful &amp; PDF Unlocked!
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mt-1">
                Aapka Razorpay payment verify ho gaya hai. Digital PDF guide instant download ke liye ready hai.
              </p>
            </div>

            {/* Product Receipt Card */}
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200/80 max-w-lg mx-auto flex items-center gap-4 text-left">
              <img
                src={product.coverImage}
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
                  {product.title}
                </h3>
                <div className="text-xs font-black text-gray-900 mt-1">
                  Amount Paid: ₹{activeOrder?.amount || product.price}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                  <Check size={12} /> Lifetime License Granted
                </div>
              </div>
            </div>

            {/* UNLOCKED Action Buttons */}
            <div className="max-w-md mx-auto space-y-3 pt-2">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black py-4 px-6 rounded-2xl text-sm sm:text-base tracking-wide shadow-xl shadow-emerald-600/25 ring-4 ring-emerald-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download size={20} />
                <span>{downloading ? 'Preparing Secure PDF...' : 'Download PDF Now'}</span>
              </button>

              {downloadSuccess && (
                <p className="text-xs text-emerald-600 font-bold">
                  ✓ Download started! Check your downloads folder.
                </p>
              )}

              <button
                onClick={() => setIsReadingOnline(true)}
                className="w-full bg-navy-950 hover:bg-navy-900 text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2"
              >
                <BookOpen size={16} /> Read PDF Online
              </button>

              {/* Direct WhatsApp Copy Assistance */}
              <a
                href={`https://wa.me/917079988808?text=Hi%20PDF%20Master%20India,%20I%20just%20completed%20Order%20${activeOrder?.id || orderId}%20for%20${encodeURIComponent(product.title)}.%20Please%20send%20my%20PDF%20copy%20here.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-3 px-4 rounded-xl text-xs tracking-wide transition-all flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/20"
              >
                <RealWhatsAppIcon size={16} className="text-white" />
                <span>Receive on WhatsApp (+91 70799 88808)</span>
              </a>

              <Link
                to="/purchases"
                className="inline-flex items-center justify-center gap-1.5 text-xs text-blue-600 font-bold hover:underline pt-2"
              >
                Go to My Purchases Tab <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Online Reader Modal */}
      {isReadingOnline && isVerified && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-gray-900">{product.title}</h3>
                <p className="text-[11px] text-gray-500">Interactive In-Browser Reader</p>
              </div>
              <button
                onClick={() => setIsReadingOnline(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs text-gray-700 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <h4 className="font-bold text-orange-900 mb-1">Executive Summary:</h4>
                <p>{product.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-2">Curriculum Table of Contents:</h4>
                <ul className="space-y-1.5 list-disc pl-5">
                  {(product.tableOfContents || []).map((t, idx) => (
                    <li key={idx}>
                      <span className="font-bold">{t.chapter}:</span> {t.title} ({t.pages})
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-2">Core Frameworks &amp; Prompts:</h4>
                {(product.highlights || []).map((h, idx) => (
                  <p key={idx} className="mb-1 flex items-center gap-2">
                    <Check size={14} className="text-emerald-600 shrink-0" /> {h}
                  </p>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t flex justify-end">
              <button
                onClick={handleDownload}
                className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
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
