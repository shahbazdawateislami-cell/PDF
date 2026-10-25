import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Download, 
  BookOpen, 
  ArrowRight, 
  ShieldCheck, 
  Check, 
  Search, 
  X, 
  MessageCircle,
  Layers,
  Sparkles,
  FileText
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useProducts } from '../context/ProductContext';
import { Product } from '../types';
import { INITIAL_BUNDLES, INITIAL_PRODUCTS } from '../data/initialProducts';
import { generateProductPdf, downloadPdfBlob } from '../utils/pdfGenerator';
import { formatCloudPdfUrl, isValidCloudPdfUrl, getOriginalPdfLocally } from '../utils/pdfStorageApi';

export default function Purchases() {
  const { orders, products, bundles, logDownload, getCustomPdfFile } = useProducts();
  const [readingProduct, setReadingProduct] = useState<Product | null>(null);
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  const handleDownload = async (orderId: string, productId: string, title: string) => {
    await logDownload(orderId, productId, title);

    setDownloadMsg(`Downloading original PDF for "${title}"...`);
    const cleanName = (title || 'PDF_Master_Guide').replace(/[^a-zA-Z0-9_-]/g, '_');
    const matchedOrder = orders.find((o) => o.id === orderId);
    const prod =
      products.find((p) => p.id === productId) ||
      INITIAL_PRODUCTS.find((p) => p.id === productId) ||
      products.find((p) => p.title.toLowerCase().trim() === title.toLowerCase().trim()) ||
      INITIAL_PRODUCTS.find((p) => p.title.toLowerCase().trim() === title.toLowerCase().trim()) ||
      null;

    try {
      // 1. Direct Server Uploaded File (/api/files/... or /uploads/...)
      // Defaults to `/api/files/${productId}.pdf` which is guaranteed to exist on server
      const downloadTarget = prod?.pdfUrl || `/api/files/${productId}.pdf`;
      if (downloadTarget.startsWith('/api/') || downloadTarget.startsWith('/uploads/')) {
        const downloadUrl = `${downloadTarget}${downloadTarget.includes('?') ? '&' : '?'}download=1`;
        
        // Method A: Native direct browser download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${cleanName}.pdf`;
        link.setAttribute('target', '_self');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Method B: Resilient blob stream download for Android / mobile browsers
        try {
          const res = await fetch(downloadUrl);
          if (res.ok) {
            const blob = await res.blob();
            downloadPdfBlob(blob, `${cleanName}.pdf`);
          }
        } catch {}

        setDownloadMsg(`✓ "${title}" downloaded successfully! Check your downloads.`);
        setTimeout(() => setDownloadMsg(null), 4000);
        return;
      }

      // 2. Direct Permanent Cloud URL (Google Drive, Cloudinary, Dropbox, CDN)
      if (isValidCloudPdfUrl(downloadTarget)) {
        const directUrl = formatCloudPdfUrl(downloadTarget);
        const link = document.createElement('a');
        link.href = directUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.download = `${cleanName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloadMsg(`✓ "${title}" download initiated!`);
        setTimeout(() => setDownloadMsg(null), 4000);
        return;
      }

      // 3. Local binary cache for the exact original file
      if (productId) {
        const localCached = await getOriginalPdfLocally(productId);
        if (localCached && localCached.blob) {
          downloadPdfBlob(localCached.blob, `${cleanName}.pdf`);
          setDownloadMsg(`✓ "${title}" downloaded successfully!`);
          setTimeout(() => setDownloadMsg(null), 4000);
          return;
        }
      }

      // 4. Server stream fallback endpoint
      if (orderId) {
        const serverDownloadUrl = `/api/download/${orderId}?productId=${productId || ''}`;
        window.location.href = serverDownloadUrl;
        setDownloadMsg(`✓ "${title}" download initiated!`);
        setTimeout(() => setDownloadMsg(null), 4000);
        return;
      }

      // 5. If no file link was set yet, open WhatsApp for direct delivery of original file
      const waText = encodeURIComponent(
        `Hi PDF Master India, I purchased "${title}" (Order ID: ${orderId}). Please send my exact original PDF copy directly here on WhatsApp.`
      );
      window.open(`https://wa.me/917079988808?text=${waText}`, '_blank');
      setDownloadMsg(`✓ WhatsApp opened for instant original PDF delivery!`);
      setTimeout(() => setDownloadMsg(null), 5000);
    } catch (e) {
      console.warn('Purchases PDF download error:', e);
      const waText = encodeURIComponent(
        `Hi PDF Master India, I need help downloading "${title}" (Order ID: ${orderId}). Please send my original file directly on WhatsApp.`
      );
      window.open(`https://wa.me/917079988808?text=${waText}`, '_blank');
      setDownloadMsg('✓ WhatsApp opened for assistance.');
    }
  };

  const handleDownloadAllCombo = (orderId: string, comboTitle: string, bundleProds: Product[]) => {
    setDownloadMsg(`Downloading all ${bundleProds.length} PDFs from "${comboTitle}"...`);
    bundleProds.forEach((bp, idx) => {
      setTimeout(() => {
        handleDownload(orderId, bp.id, bp.title);
      }, idx * 700);
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-gray-900">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold mb-1">
              <ShieldCheck size={16} /> Verified Customer Library
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              My Purchased PDFs
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Access your digital books and download anytime with lifetime validity.
            </p>
          </div>

          <Link
            to="/all"
            className="bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shrink-0"
          >
            Browse More PDFs
          </Link>
        </div>

        {downloadMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
            <Check size={16} /> {downloadMsg}
          </div>
        )}

        {orders.length > 0 ? (
          <div className="space-y-5">
            {orders.map((ord) => {
              const isBundle =
                ord.productId.startsWith('bundle-') ||
                (bundles && bundles.some((b) => b.id === ord.productId)) ||
                (INITIAL_BUNDLES && INITIAL_BUNDLES.some((b) => b.id === ord.productId));

              const matchedBundle = isBundle
                ? (bundles && bundles.find((b) => b.id === ord.productId)) ||
                  INITIAL_BUNDLES.find((b) => b.id === ord.productId)
                : null;

              const bundleProds = matchedBundle
                ? (matchedBundle.productIds
                    .map((id) => products.find((p) => p.id === id) || INITIAL_PRODUCTS.find((p) => p.id === id))
                    .filter(Boolean) as Product[])
                : [];

              const prod = !isBundle
                ? products.find((p) => p.id === ord.productId) ||
                  INITIAL_PRODUCTS.find((p) => p.id === ord.productId) ||
                  products[0]
                : null;

              // COMBO / BUNDLE PURCHASE CARD
              if (isBundle && matchedBundle) {
                return (
                  <div
                    key={ord.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-orange-200/90 shadow-xs space-y-4 hover:shadow-md transition-shadow"
                  >
                    {/* Combo Card Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={ord.productCover || matchedBundle.coverImage}
                          alt=""
                          className="w-16 h-22 object-cover rounded-xl shadow-xs border border-orange-200 shrink-0 bg-white"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] text-gray-400 font-mono">
                              Order #{ord.id} • {new Date(ord.date).toLocaleDateString()}
                            </span>
                            <span className="text-[10px] bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                              <Layers size={11} /> Combo Pack ({bundleProds.length} PDFs Included)
                            </span>
                          </div>
                          <h3 className="font-extrabold text-base sm:text-lg text-gray-900 mt-1">
                            {ord.productTitle || matchedBundle.title}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-1">{matchedBundle.subtitle}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-black text-gray-900">₹{ord.amount}</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase">
                              {ord.status}
                            </span>
                            <span className="text-[10px] text-emerald-700 font-bold">
                              ✓ All {bundleProds.length} Guides Unlocked
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                        <button
                          onClick={() => handleDownloadAllCombo(ord.id, ord.productTitle, bundleProds)}
                          className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-700 active:scale-98 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/20 cursor-pointer"
                        >
                          <Download size={15} className="stroke-[2.5]" /> Download All {bundleProds.length} PDFs
                        </button>
                        <a
                          href={`https://wa.me/917079988808?text=${encodeURIComponent(`Hi PDF Master India, I purchased Combo "${ord.productTitle}" (Order ID: ${ord.id}). Please send all ${bundleProds.length} PDF files directly here on WhatsApp.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                          title="Get full combo on WhatsApp"
                        >
                          <MessageCircle size={14} className="fill-white text-white" /> WhatsApp
                        </a>
                      </div>
                    </div>

                    {/* All Individual Guides inside this combo */}
                    <div className="space-y-2 pt-1">
                      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                        <span>All {bundleProds.length} Guides Included In This Combo (Download Each Below):</span>
                        <span className="text-emerald-700 font-bold">Tap download on any book</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {bundleProds.map((bp, bpIdx) => (
                          <div
                            key={bp.id || bpIdx}
                            className="bg-gray-50 hover:bg-orange-50/50 p-3 rounded-2xl border border-gray-200/90 flex items-center justify-between gap-3 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={bp.coverImage}
                                alt=""
                                className="w-10 h-14 object-cover rounded-lg shadow-2xs border border-gray-200 shrink-0 bg-white"
                              />
                              <div className="min-w-0">
                                <span className="text-[9px] font-black text-orange-700 bg-orange-100 px-1.5 py-0.2 rounded">
                                  Guide #{bpIdx + 1}
                                </span>
                                <h4 className="font-bold text-xs text-gray-900 truncate mt-0.5" title={bp.title}>
                                  {bp.title}
                                </h4>
                                <p className="text-[10px] text-gray-500">{bp.category} • {bp.pdfPagesCount || 120} Pages</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => setReadingProduct(bp)}
                                className="p-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors cursor-pointer"
                                title="Read Online"
                              >
                                <BookOpen size={13} />
                              </button>
                              <button
                                onClick={() => handleDownload(ord.id, bp.id, bp.title)}
                                className="bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                              >
                                <Download size={13} /> Download
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              // Standard Single Product Card
              return (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={ord.productCover || prod?.coverImage}
                      alt=""
                      className="w-16 h-22 object-cover rounded-xl shadow-xs border border-gray-200 shrink-0 bg-white"
                    />
                    <div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        Order #{ord.id} • {new Date(ord.date).toLocaleDateString()}
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-gray-900 mt-0.5 line-clamp-1">
                        {ord.productTitle}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-black text-gray-900">₹{ord.amount}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase">
                          {ord.status}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          Downloaded: {ord.downloadCount || 0} times
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setReadingProduct(prod)}
                      className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <BookOpen size={14} /> Read Online
                    </button>
                    <button
                      onClick={() => handleDownload(ord.id, ord.productId, ord.productTitle)}
                      className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Download size={14} /> Download PDF
                    </button>
                    <a
                      href={`https://wa.me/917079988808?text=${encodeURIComponent(`Hi PDF Master India, I purchased "${ord.productTitle}" (Order ID: ${ord.id}). Please send my original PDF copy directly here on WhatsApp.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                      title="Get original PDF directly on WhatsApp"
                    >
                      <MessageCircle size={14} className="fill-white text-white" /> WhatsApp Copy
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <ShoppingBag size={28} />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">No Purchases Yet</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                When you buy any guide via Razorpay, it will permanently appear here for instant download.
              </p>
            </div>
            <Link
              to="/"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl"
            >
              Explore Trending PDFs
            </Link>
          </div>
        )}

        {/* WhatsApp Download Assistance Banner */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-5 sm:p-6 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <MessageCircle size={18} className="fill-emerald-600 text-emerald-600" />
              <span>Need Help with Download or Want PDF Directly on WhatsApp?</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              If you experience any issue downloading your PDF or prefer direct delivery on WhatsApp:
            </p>
          </div>
          <a
            href="https://wa.me/917079988808?text=Hi%20PDF%20Master%20India,%20I%20need%20help%20with%20my%20purchased%20PDF"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-2xs transition-colors shrink-0"
          >
            <span>💬 WhatsApp: +91 70799 88808</span>
          </a>
        </div>
      </main>

      {/* Online Reader Modal */}
      {readingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-gray-900">{readingProduct.title}</h3>
                <p className="text-[11px] text-gray-500">Authorized Digital Reader</p>
              </div>
              <button
                onClick={() => setReadingProduct(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs text-gray-700 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <h4 className="font-bold text-orange-900 mb-1">About this Guide:</h4>
                <p>{readingProduct.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-2">Curriculum Chapters:</h4>
                <ul className="space-y-1.5 list-disc pl-5">
                  {readingProduct.tableOfContents?.map((t, idx) => (
                    <li key={idx}>
                      <span className="font-bold">{t.chapter}:</span> {t.title} ({t.pages})
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-2 border-t flex justify-end">
              <button
                onClick={() => setReadingProduct(null)}
                className="bg-gray-900 text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                Close Reader
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
