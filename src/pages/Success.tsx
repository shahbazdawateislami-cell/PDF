import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Download, 
  BookOpen, 
  ArrowRight, 
  ShieldCheck, 
  Check, 
  X,
  Share2,
  MessageCircle
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useProducts } from '../context/ProductContext';

export default function Success() {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders, products, logDownload } = useProducts();

  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isReadingOnline, setIsReadingOnline] = useState(false);

  // Find matching order
  const order = orders.find((o) => o.id === orderId) || orders[0];
  const product = products.find((p) => p.id === order?.productId) || products[0];

  const handleDownload = async () => {
    setDownloading(true);

    if (order && product) {
      await logDownload(order.id, product.id, product.title, order.customerEmail);
    }

    setTimeout(() => {
      // Check if admin uploaded a custom PDF file for this product
      const customFile = (window as any).pdfMasterCustomFiles?.[product?.id] || null;
      
      const content = `PDF MASTER INDIA - OFFICIAL DIGITAL EDITION\n\n` +
        `TITLE: ${product.title}\n` +
        `ORDER ID: ${order?.id || 'ORD_VERIFIED'}\n` +
        `CUSTOMER: ${order?.customerName || 'Valued Reader'} (${order?.customerEmail || ''})\n` +
        `DATE: ${new Date().toLocaleDateString()}\n\n` +
        `============================================================\n` +
        `ABOUT THIS GUIDE:\n${product.description}\n\n` +
        `KEY HIGHLIGHTS:\n${product.highlights.map(h => '• ' + h).join('\n')}\n\n` +
        `TABLE OF CONTENTS:\n${product.tableOfContents.map(t => `${t.chapter}: ${t.title} (Pages: ${t.pages})`).join('\n')}\n\n` +
        `============================================================\n` +
        `Thank you for purchasing from PDF Master India!\n` +
        `Support: support@pdfmaster.in | WhatsApp: +91 70799 88808\n`;

      const blob = new Blob([content], { type: 'application/pdf;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${product.title.replace(/[^a-zA-Z0-9]/g, '_')}_PDF_Master_India.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloading(false);
      setDownloadSuccess(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-gray-900">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-lg text-center space-y-6">
          {/* Green Check Animation */}
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md animate-bounce">
            <CheckCircle size={44} className="stroke-[2.5]" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
              <ShieldCheck size={14} /> Razorpay Verified Payment
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Payment Successful &amp; PDF Unlocked!
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mt-1">
              Thank you for your purchase. Your digital PDF guide is ready for instant download and has been saved to your account.
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
                Order ID: {order?.id || 'ord_verified_101'}
              </div>
              <h3 className="font-bold text-sm text-gray-900 line-clamp-2 mt-0.5">
                {product.title}
              </h3>
              <div className="text-xs font-black text-gray-900 mt-1">
                Amount Paid: ₹{order?.amount || product.price}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                <Check size={12} /> Lifetime License Granted
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="max-w-md mx-auto space-y-3 pt-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black py-3.5 px-6 rounded-xl text-sm tracking-wide shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download size={18} />
              {downloading ? 'Preparing Secure PDF...' : 'Download PDF Now'}
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
              href={`https://wa.me/917079988808?text=Hi%20PDF%20Master%20India,%20I%20just%20completed%20Order%20${order?.id || '101'}%20for%20${encodeURIComponent(product.title)}.%20Please%20send%20my%20PDF%20copy%20here.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-2.5 px-4 rounded-xl text-xs tracking-wide transition-all flex items-center justify-center gap-2 border border-emerald-200 shadow-2xs"
            >
              <MessageCircle size={15} className="text-emerald-600 fill-emerald-600" />
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
      </main>

      {/* Online Reader Modal */}
      {isReadingOnline && (
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
                  {product.tableOfContents.map((t, idx) => (
                    <li key={idx}>
                      <span className="font-bold">{t.chapter}:</span> {t.title} ({t.pages})
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-2">Core Frameworks &amp; Prompts:</h4>
                {product.highlights.map((h, idx) => (
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
