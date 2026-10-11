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
  MessageCircle
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useProducts } from '../context/ProductContext';
import { Product } from '../types';

export default function Purchases() {
  const { orders, products, logDownload } = useProducts();
  const [readingProduct, setReadingProduct] = useState<Product | null>(null);
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  const handleDownload = async (orderId: string, productId: string, title: string) => {
    await logDownload(orderId, productId, title);

    setDownloadMsg(`Downloading "${title}"...`);
    setTimeout(() => {
      const content = `PDF MASTER INDIA - PURCHASED COPY\n` +
        `TITLE: ${title}\n` +
        `ORDER ID: ${orderId}\n` +
        `VERIFIED: 100% Genuine Digital Edition\n` +
        `DATE: ${new Date().toLocaleDateString()}\n\n` +
        `Thank you for trusting PDF Master India!`;

      const blob = new Blob([content], { type: 'application/pdf;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_PDF_Master_India.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDownloadMsg(`✓ "${title}" downloaded successfully!`);
      setTimeout(() => setDownloadMsg(null), 3500);
    }, 1000);
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
          <div className="space-y-4">
            {orders.map((ord) => {
              const prod = products.find((p) => p.id === ord.productId) || products[0];

              return (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={ord.productCover || prod?.coverImage}
                      alt=""
                      className="w-16 h-22 object-cover rounded-xl shadow-xs border border-gray-200 shrink-0"
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

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setReadingProduct(prod)}
                      className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <BookOpen size={14} /> Read Online
                    </button>
                    <button
                      onClick={() => handleDownload(ord.id, ord.productId, ord.productTitle)}
                      className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Download size={14} /> Download PDF
                    </button>
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
              اگر پی ڈی ایف ڈاؤن لوڈ کرنے میں کوئی دقت ہو یا واٹس ایپ پر فائل چاہیے تو میسج کریں:
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
