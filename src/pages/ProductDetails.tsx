import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  Heart, 
  Check, 
  Play, 
  Clock, 
  FileText, 
  Download, 
  ShieldCheck, 
  HelpCircle, 
  MessageSquare, 
  ChevronRight,
  ZoomIn,
  Zap,
  Sparkles,
  MessageCircle,
  Phone,
  Share2,
  Link2
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Carousel } from '../components/Carousel';
import { ProductCard } from '../components/ProductCard';
import { ImageLightboxModal } from '../components/ImageLightboxModal';
import { useProducts } from '../context/ProductContext';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, isWishlisted, toggleWishlist } = useProducts();

  const [activeTab, setActiveTab] = useState<'desc' | 'toc' | 'reviews' | 'faq'>('desc');
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);

  // Find product or fallback to first one
  const product = products.find((p) => p.id === id) || products[0];

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <h2 className="text-xl font-bold mb-4">Product Not Found</h2>
          <Link to="/" className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold">
            Back to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const discountPercent = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);

  // Related products in the same category or series
  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.series === product.series))
    .slice(0, 6);

  // Safely guard preview and sample images
  const previewImagesList = (product.previewImages && product.previewImages.length > 0)
    ? product.previewImages
    : (product.samplePages && product.samplePages.length > 0)
    ? product.samplePages
    : [product.coverImage || ''].filter(Boolean);

  const openLightbox = (images: string[], index: number = 0) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-gray-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 py-1">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight size={13} className="text-gray-400" />
          <Link to={`/all?cat=${encodeURIComponent(product.category)}`} className="hover:text-blue-600">
            {product.category}
          </Link>
          <ChevronRight size={13} className="text-gray-400" />
          <span className="text-gray-900 font-semibold truncate max-w-xs">{product.title}</span>
        </nav>

        {/* TOP MAIN SECTION (Cover + Details) */}
        <section className="bg-white rounded-3xl p-5 sm:p-8 border border-gray-200/80 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left: Product Cover Image */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div 
                className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl bg-gray-50 border border-gray-100 group cursor-pointer"
                onClick={() => openLightbox(previewImagesList.length > 0 ? previewImagesList : [product.coverImage || ''], 0)}
              >
                <img
                  src={product.coverImage}
                  alt={product.title}
                  className="w-full aspect-[3/4] object-contain group-hover:scale-[1.02] transition-transform duration-300"
                />

                {/* Bestseller Badge */}
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-red-600 text-white font-black text-xs px-3 py-1 rounded-md shadow tracking-wider uppercase">
                    {product.badge}
                  </span>
                )}

                {/* Click to enlarge overlay icon */}
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white p-2 rounded-full opacity-80 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px] px-3">
                  <ZoomIn size={14} /> Tap to Preview
                </div>
              </div>

              {/* Quick File Specs */}
              <div className="grid grid-cols-3 gap-2 w-full max-w-sm mt-4 text-center">
                <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                  <div className="text-[10px] text-gray-500">Pages</div>
                  <div className="text-xs font-bold text-gray-900">{product.pdfPagesCount || 140} Pages</div>
                </div>
                <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                  <div className="text-[10px] text-gray-500">File Size</div>
                  <div className="text-xs font-bold text-gray-900">{product.fileSize || '18 MB'}</div>
                </div>
                <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                  <div className="text-[10px] text-gray-500">Language</div>
                  <div className="text-xs font-bold text-gray-900">{product.language || 'Hindi/Eng'}</div>
                </div>
              </div>
            </div>

            {/* Right: Product Details & CTAs */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                  {product.title}
                </h1>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="font-bold text-sm text-gray-900">{product.rating}</span>
                  <span className="text-xs text-gray-500">({product.reviewsCount.toLocaleString()} reviews)</span>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 mt-4">
                  <span className="text-3xl sm:text-4xl font-black text-red-600">
                    ₹{product.price}
                  </span>
                  <span className="text-lg text-gray-400 line-through">
                    ₹{product.oldPrice}
                  </span>
                  {discountPercent > 0 && (
                    <span className="bg-emerald-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-md shadow-xs">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                {/* Highlights List */}
                <ul className="mt-5 space-y-2 text-xs sm:text-sm text-gray-700">
                  {(product.highlights || []).map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-900 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-3">
                <button
                  onClick={() => navigate(`/checkout/${product.id}`)}
                  className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 active:scale-[0.98] text-white font-black py-4.5 sm:py-5 px-8 rounded-2xl text-base sm:text-lg tracking-wide shadow-xl shadow-red-500/30 ring-4 ring-red-100 hover:ring-red-200 transition-all flex flex-col items-center justify-center gap-1 group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Zap size={22} className="text-amber-300 fill-amber-300 group-hover:scale-110 transition-transform" />
                    <span>BUY NOW FOR ₹{product.price}</span>
                    <Sparkles size={18} className="text-amber-300" />
                  </div>
                  <span className="text-xs text-red-100 font-bold tracking-normal">
                    ⚡ Instant Download Link • Get File Immediately (One-Click Checkout)
                  </span>
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`w-full py-3 px-6 rounded-xl text-xs sm:text-sm font-bold border flex items-center justify-center gap-2 transition-all ${
                    wishlisted
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
                  }`}
                >
                  <Heart size={16} className={wishlisted ? 'fill-red-600 text-red-600' : ''} />
                  {wishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 1. PREVIEW IMAGES & INSIDE PAGES HORIZONTAL CAROUSEL */}
        {previewImagesList.length > 0 && (
          <section className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
                Inside Look &amp; Sample Pages Carousel
              </h2>
              <span className="text-xs text-gray-500 font-medium">
                {previewImagesList.length} Sample Pages
              </span>
            </div>

            <div className="py-2">
              <Carousel
                items={previewImagesList.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => openLightbox(previewImagesList, idx)}
                    className="cursor-pointer group relative rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-orange-500 bg-gray-50 shadow-xs hover:shadow-xl transition-all duration-300"
                  >
                    <img
                      src={img}
                      alt={`Preview Page ${idx + 1}`}
                      className="w-full aspect-[3/4] object-contain group-hover:scale-105 transition-transform duration-300 bg-white"
                    />
                    {/* Page Indicator Tag */}
                    <div className="absolute top-2.5 left-2.5 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded shadow-xs">
                      Page {idx + 1}
                    </div>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="bg-white text-gray-900 text-xs font-black px-3 py-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <ZoomIn size={14} className="text-orange-600" /> Zoom Page
                      </div>
                    </div>
                  </div>
                ))}
                itemsToShow={{ mobile: 1.5, tablet: 3.5, desktop: 4.5 }}
                autoScroll={true}
                autoScrollInterval={4000}
                showArrows={true}
                showDots={true}
                gap={14}
              />
            </div>
          </section>
        )}

        {/* 2. MORE BOOKS FROM THIS SERIES CAROUSEL */}
        {relatedProducts.length > 0 && (
          <section className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-200/80 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                More Books from this Series
              </h2>
              <Link to="/all" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                View All →
              </Link>
            </div>

            <Carousel
              items={relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
              itemsToShow={{ mobile: 1.5, tablet: 3, desktop: 4 }}
              autoScroll={false}
              showArrows={true}
              showDots={true}
            />
          </section>
        )}

        {/* 4. TABS SECTION (Description, Table of Contents, Reviews, FAQ) */}
        <section className="bg-white rounded-3xl p-5 sm:p-8 border border-gray-200/80 shadow-xs">
          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-200 gap-2 sm:gap-6 overflow-x-auto pb-px">
            <button
              onClick={() => setActiveTab('desc')}
              className={`py-3 px-2 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'desc'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('toc')}
              className={`py-3 px-2 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'toc'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              Table of Contents
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-3 px-2 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              Reviews ({product.reviews?.length || 3})
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`py-3 px-2 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'faq'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              FAQ
            </button>
          </div>

          {/* Tab 1: Description */}
          {activeTab === 'desc' && (
            <div className="pt-6 space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-black text-gray-900 mb-2">
                  About This PDF
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Checkmark Features list matching screenshot */}
              <div className="space-y-2.5">
                {product.features?.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-800 font-medium">
                    <Check size={18} className="text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Table of Contents */}
          {activeTab === 'toc' && (
            <div className="pt-6 space-y-3">
              <h3 className="text-base sm:text-lg font-black text-gray-900 mb-3">
                Complete Curriculum &amp; Chapters
              </h3>
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden">
                {product.tableOfContents?.map((item, idx) => (
                  <div key={idx} className="p-3.5 sm:p-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        {item.chapter}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-800">
                        {item.title}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                      {item.pages}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Reviews */}
          {activeTab === 'reviews' && (
            <div className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-black text-gray-900">
                  Customer Reviews
                </h3>
                <span className="text-xs text-gray-500 font-medium">
                  Verified Buyer Feedback
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.reviews?.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                          {rev.userName.charAt(0)}
                        </div>
                        <span className="font-bold text-xs text-gray-900">{rev.userName}</span>
                        {rev.verified && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">
                            Verified
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400">{rev.date}</span>
                    </div>

                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} className={i < rev.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
                      ))}
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: FAQ */}
          {activeTab === 'faq' && (
            <div className="pt-6 space-y-3">
              <h3 className="text-base sm:text-lg font-black text-gray-900 mb-3">
                Frequently Asked Questions
              </h3>
              <div className="space-y-2">
                {product.faqs?.map((f, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <h5 className="font-bold text-xs sm:text-sm text-gray-900 mb-1">
                      {f.question}
                    </h5>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {f.answer}
                    </p>
                  </div>
                ))}

                {/* WhatsApp Support Card in FAQ */}
                <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200">
                  <h5 className="font-bold text-xs sm:text-sm text-emerald-950 mb-1 flex items-center gap-1.5">
                    <MessageCircle size={15} className="fill-emerald-600 text-emerald-600" />
                    Can I get assistance or files directly on WhatsApp?
                  </h5>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Yes! You can contact our official helpline at <a href="https://wa.me/917079988808" target="_blank" rel="noopener noreferrer" className="font-bold underline text-emerald-900">+91 70799 88808</a> anytime via WhatsApp or Call for download links, sample pages, or instant assistance.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Lightbox Modal */}
      <ImageLightboxModal
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onSelectIndex={(idx) => setLightboxIndex(idx)}
        title={product.title}
      />


      {/* STICKY BOTTOM MOBILE CONVERSION BAR (Standard for High-Converting Ad Traffic) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <img
            src={product.coverImage}
            alt=""
            className="w-9 h-12 object-cover rounded shadow-xs border border-gray-200 shrink-0"
          />
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-red-600">₹{product.price}</span>
              <span className="text-[11px] text-gray-400 line-through">₹{product.oldPrice}</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-bold">
              ⚡ Instant Download
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate(`/checkout/${product.id}`)}
          className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 active:scale-95 text-white font-black px-8 py-3.5 rounded-2xl text-sm sm:text-base tracking-wide shadow-xl shadow-red-500/30 ring-2 ring-red-200 flex items-center gap-2 cursor-pointer"
        >
          <Zap size={16} className="text-amber-300 fill-amber-300" />
          <span>Buy Now →</span>
        </button>
      </div>

      <Footer />
    </div>
  );
}
