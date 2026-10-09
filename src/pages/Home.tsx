import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Download, 
  Star, 
  Headphones, 
  Gift, 
  Tag, 
  ArrowRight, 
  Sparkles,
  BookOpen,
  Clock,
  Flame,
  Layers,
  MessageCircle,
  X,
  CheckCircle2
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { Carousel } from '../components/Carousel';
import { PdfInsidePreviewModal } from '../components/PdfInsidePreviewModal';
import { useProducts } from '../context/ProductContext';
import { Product } from '../types';

export default function Home() {
  const navigate = useNavigate();
  const { products, bundles, categories } = useProducts();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [previewModalProduct, setPreviewModalProduct] = useState<Product | null>(null);

  // Marketing: Live Social Proof Toast
  const [showProof, setShowProof] = useState(false);
  const [currentProofIndex, setCurrentProofIndex] = useState(0);

  const proofList = [
    { name: 'Rahul S.', city: 'Delhi', item: 'ChatGPT & AI Tools Master Guide', time: '2 mins ago' },
    { name: 'Aakash M.', city: 'Mumbai', item: 'AI & Digital Mega Combo (4 in 1)', time: '4 mins ago' },
    { name: 'Pooja V.', city: 'Bengaluru', item: 'English Speaking Complete Course', time: 'Just now' },
    { name: 'Mohd Farhan', city: 'Hyderabad', item: 'Islamic Knowledge Book', time: '6 mins ago' },
    { name: 'Sunita D.', city: 'Jaipur', item: 'Student Exam Topper Super Pack', time: '8 mins ago' }
  ];

  // Rotate social proof every 12 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setShowProof(true);
      setCurrentProofIndex((prev) => (prev + 1) % proofList.length);
      setTimeout(() => setShowProof(false), 5500);
    }, 14000);

    // Initial show after 3 seconds
    const initialTimer = setTimeout(() => {
      setShowProof(true);
      setTimeout(() => setShowProof(false), 5500);
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(initialTimer);
    };
  }, []);

  // Marketing: Countdown Timer (Urgency)
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 42, seconds: 18 });
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Group products by section
  const trendingProducts = products.filter((p) => p.isTrending || p.id.includes('chatgpt') || p.id.includes('english') || p.id.includes('business') || p.id.includes('students')).slice(0, 6);
  const bestsellingProducts = products.filter((p) => p.isBestseller || p.id.includes('marketing') || p.id.includes('islamic') || p.id.includes('canva') || p.id.includes('prompt') || p.id.includes('excel') || p.id.includes('video')).slice(0, 6);
  const newArrivals = products.filter((p) => p.isNewArrival || p.id.includes('youtube') || p.id.includes('ctet') || p.id.includes('science') || p.id.includes('hindi') || p.id.includes('kids') || p.id.includes('academic')).slice(0, 6);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setTimeout(() => setNewsletterSubscribed(false), 4000);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-gray-900 selection:bg-orange-100 selection:text-orange-900 relative">
      <Navbar />

      {/* TOP SCARCITY & URGENCY FLASH SALE BANNER */}
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white text-[11px] sm:text-xs py-2 px-4 shadow-sm flex items-center justify-center gap-2 sm:gap-4 font-bold tracking-wide">
        <span className="flex items-center gap-1 text-yellow-300">
          <Flame size={14} className="fill-yellow-300 animate-pulse" /> FLASH SALE ENDS IN:
        </span>
        <span className="bg-black/30 px-2 py-0.5 rounded font-mono text-white text-xs">
          {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
        </span>
        <span className="hidden sm:inline text-white/90">
          • Use Code <span className="bg-white text-red-700 px-1.5 py-0.5 rounded text-[10px] font-black">MASTER10</span> for Extra 10% OFF!
        </span>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 space-y-8">
        {/* HERO BANNER */}
        <section className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-r from-[#0B1528] via-[#0F1E3D] to-[#1E3A8A] text-white p-5 sm:p-8 lg:p-10 shadow-xl border border-blue-950/40">
          {/* Subtle star particles background */}
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

          {/* Special Offer Pill Badge (Top Right) */}
          <div className="absolute top-4 right-4 md:top-6 md:right-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-2.5 md:p-3.5 text-center shadow-lg border border-white/20 transform rotate-1">
            <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-orange-100">
              Special Offer
            </div>
            <div className="text-xl md:text-2xl font-black text-white leading-none my-0.5">
              Up to 50% OFF
            </div>
            <div className="text-[9px] md:text-[11px] text-orange-100 font-medium">
              On Selected PDFs
            </div>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 pt-4 md:pt-0">
            {/* Left Content */}
            <div className="max-w-xl text-left space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-orange-400 text-xs font-semibold border border-white/10">
                <Sparkles size={14} /> 2026 Latest Editions &amp; Exam Notes
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
                Learn More. Do More.<br />
                <span className="text-[#FBBF24]">Grow Faster.</span>
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-gray-200 font-normal leading-relaxed max-w-lg">
                Practical PDF Guides for Students, Teachers, Professionals &amp; Business Owners. Instant downloads with lifetime access.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/all"
                  className="inline-flex items-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-navy-950 font-extrabold text-xs sm:text-sm px-6 py-3 rounded-full shadow-lg hover:shadow-orange-500/20 active:scale-95 transition-all"
                >
                  Explore PDFs <ArrowRight size={16} />
                </Link>
                <Link
                  to="/all?cat=AI+Tools"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all"
                >
                  🔥 AI Guides (₹99)
                </Link>
              </div>
            </div>

            {/* Right Graphic: 3D Stack of Books matching the mockup */}
            <div className="relative flex items-center justify-center pt-4 lg:pt-0 pb-2">
              <div className="relative flex items-center">
                {/* Book 1 */}
                <div className="w-24 sm:w-28 md:w-32 transform -rotate-12 hover:-rotate-6 transition-all duration-300 shadow-2xl rounded-lg overflow-hidden border border-white/20">
                  <img
                    src={products[0]?.coverImage}
                    alt="Book 1"
                    className="w-full aspect-[3/4] object-cover"
                  />
                </div>
                {/* Book 2 */}
                <div className="w-24 sm:w-28 md:w-32 -ml-8 sm:-ml-10 transform -rotate-3 hover:rotate-0 transition-all duration-300 shadow-2xl rounded-lg overflow-hidden border border-white/20 z-10">
                  <img
                    src={products[1]?.coverImage}
                    alt="Book 2"
                    className="w-full aspect-[3/4] object-cover"
                  />
                </div>
                {/* Book 3 */}
                <div className="w-24 sm:w-28 md:w-32 -ml-8 sm:-ml-10 transform rotate-6 hover:rotate-2 transition-all duration-300 shadow-2xl rounded-lg overflow-hidden border border-white/20 z-20">
                  <img
                    src={products[2]?.coverImage}
                    alt="Book 3"
                    className="w-full aspect-[3/4] object-cover"
                  />
                </div>
                {/* Book 4 */}
                <div className="w-24 sm:w-28 md:w-32 -ml-8 sm:-ml-10 transform rotate-14 hover:rotate-10 transition-all duration-300 shadow-2xl rounded-lg overflow-hidden border border-white/20 z-30">
                  <img
                    src={products[3]?.coverImage}
                    alt="Book 4"
                    className="w-full aspect-[3/4] object-cover"
                  />
                </div>

                {/* PDF Stamp icon */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-40 bg-white rounded-xl shadow-xl px-3 py-1 border border-red-200 flex items-center gap-1.5 animate-bounce">
                  <div className="w-5 h-5 bg-red-600 rounded flex items-center justify-center text-white text-[10px] font-black">
                    PDF
                  </div>
                  <span className="text-[11px] font-extrabold text-gray-900">Instant Download</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Trust Badges Chips inside Hero footer */}
          <div className="relative z-10 mt-8 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2 text-gray-200">
              <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center">
                <ShieldCheck size={16} />
              </div>
              <span className="font-semibold text-[11px] sm:text-xs">100% Secure Payments</span>
            </div>

            <div className="flex items-center gap-2 text-gray-200">
              <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center">
                <Download size={16} />
              </div>
              <span className="font-semibold text-[11px] sm:text-xs">Instant Digital Delivery</span>
            </div>

            <div className="flex items-center gap-2 text-gray-200">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <Star size={16} />
              </div>
              <span className="font-semibold text-[11px] sm:text-xs">Trusted by 10,000+</span>
            </div>

            <div className="flex items-center gap-2 text-gray-200">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <Headphones size={16} />
              </div>
              <span className="font-semibold text-[11px] sm:text-xs">24/7 Support</span>
            </div>
          </div>
        </section>

        {/* POPULAR CATEGORIES */}
        <section className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                Popular Categories
              </h2>
            </div>
            <Link
              to="/all"
              className="text-xs md:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
            >
              View All <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5 sm:gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/all?cat=${encodeURIComponent(cat.name)}`)}
                className="group flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50/70 hover:bg-orange-50/60 border border-gray-200/60 hover:border-orange-300 transition-all text-center"
              >
                <span className="text-2xl sm:text-3xl mb-1.5 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </span>
                <span className="text-[11px] font-bold text-gray-800 group-hover:text-orange-600 transition-colors leading-tight line-clamp-1">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* MEGA BUNDLES & COMBO PACKS (HIGH-CONVERSION FEATURE) */}
        {bundles && bundles.length > 0 && (
          <section className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-red-500/10 rounded-3xl p-5 sm:p-8 border-2 border-orange-300 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="inline-flex items-center gap-1 text-[11px] bg-red-600 text-white font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                  <Flame size={12} className="fill-white" /> High Value Combos
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                  <Layers className="text-orange-600" size={24} /> Mega PDF Bundles &amp; Packs
                </h2>
                <p className="text-xs text-gray-600">
                  Buy 3 to 4 guides together in an all-in-one pack and save up to 70%!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bundles.map((bundle) => {
                const discount = Math.round(((bundle.oldPrice - bundle.price) / bundle.oldPrice) * 100);

                return (
                  <div
                    key={bundle.id}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-orange-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div className="flex gap-4">
                      <img
                        src={bundle.coverImage || products[0]?.coverImage}
                        alt=""
                        className="w-20 h-28 object-cover rounded-xl border border-gray-200 shadow-xs shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded">
                            {bundle.badge || `${discount}% OFF`}
                          </span>
                          <span className="text-[11px] font-bold text-gray-500">
                            {bundle.productIds?.length || 4} PDFs Included
                          </span>
                        </div>
                        <h3 className="font-bold text-sm sm:text-base text-gray-900 mt-1 line-clamp-1">
                          {bundle.title}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                          {bundle.subtitle}
                        </p>
                        <div className="flex items-baseline gap-2.5 mt-3">
                          <span className="text-xl font-black text-red-600">
                            ₹{bundle.price}
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            ₹{bundle.oldPrice}
                          </span>
                          <span className="text-[10px] text-emerald-700 bg-emerald-100 font-extrabold px-1.5 py-0.5 rounded">
                            Save ₹{bundle.oldPrice - bundle.price}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/checkout/${bundle.id}`)}
                      className="mt-4 w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-extrabold py-2.5 rounded-xl text-xs sm:text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      Get Complete Bundle (₹{bundle.price}) <ArrowRight size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TRENDING PDFS SECTION WITH CAROUSEL */}
        <section className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                Trending PDFs
              </h2>
            </div>
            <Link
              to="/all?filter=trending"
              className="text-xs md:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
            >
              View All <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <Carousel
            items={trendingProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickPreview={(p) => setPreviewModalProduct(p)}
              />
            ))}
            itemsToShow={{ mobile: 1.5, tablet: 3, desktop: 6 }}
            autoScroll={true}
            autoScrollInterval={4000}
            showArrows={true}
            showDots={true}
          />
        </section>

        {/* BESTSELLING PDFS SECTION WITH CAROUSEL */}
        <section className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                Bestselling PDFs
              </h2>
            </div>
            <Link
              to="/all?filter=bestselling"
              className="text-xs md:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
            >
              View All <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <Carousel
            items={bestsellingProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickPreview={(p) => setPreviewModalProduct(p)}
              />
            ))}
            itemsToShow={{ mobile: 1.5, tablet: 3, desktop: 6 }}
            autoScroll={true}
            autoScrollInterval={4500}
            showArrows={true}
            showDots={true}
          />
        </section>

        {/* TWO MIDDLE PROMOTIONAL BANNERS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Newsletter Box */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5 shadow-lg border border-indigo-600/30">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 text-white">
              <Gift size={28} className="text-yellow-300" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-extrabold text-base sm:text-lg leading-tight mb-1">
                Get Special Offers &amp; New PDFs Updates
              </h3>
              <p className="text-xs text-indigo-100 mb-3">
                Subscribe to our newsletter and never miss a deal!
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-white text-gray-900 placeholder:text-gray-400 outline-none"
                />
                <button
                  type="submit"
                  className="bg-indigo-900 hover:bg-indigo-950 font-bold text-xs px-4 py-2 rounded-xl text-white transition-colors"
                >
                  {newsletterSubscribed ? 'Done! ✓' : 'Subscribe'}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Limited Time Offer Banner */}
          <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-red-600 text-white rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg border border-orange-400/30">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <Tag size={28} className="text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg leading-tight mb-1">
                  Limited Time Offer
                </h3>
                <p className="text-xs text-orange-100">
                  Get up to <span className="font-black text-white">70% OFF</span> on Mega Bundles
                </p>
              </div>
            </div>

            <Link
              to="/all"
              className="bg-white text-orange-600 hover:bg-orange-50 font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all shrink-0 flex items-center gap-1.5"
            >
              Shop Now <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* NEW ARRIVALS SECTION WITH CAROUSEL */}
        <section className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                New Arrivals
              </h2>
            </div>
            <Link
              to="/all?filter=new"
              className="text-xs md:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
            >
              View All <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <Carousel
            items={newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickPreview={(p) => setPreviewModalProduct(p)}
              />
            ))}
            itemsToShow={{ mobile: 1.5, tablet: 3, desktop: 6 }}
            autoScroll={true}
            autoScrollInterval={5000}
            showArrows={true}
            showDots={true}
          />
        </section>
      </main>

      {/* QUICK INSIDE PAGES PREVIEW MODAL */}
      <PdfInsidePreviewModal
        product={previewModalProduct}
        isOpen={!!previewModalProduct}
        onClose={() => setPreviewModalProduct(null)}
      />

      {/* SOCIAL PROOF LIVE SALES NOTIFICATION TOAST */}
      {showProof && (
        <div className="fixed bottom-4 left-4 z-40 bg-white border border-gray-200 rounded-2xl p-3 shadow-xl max-w-xs animate-slide-up flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[11px] font-bold text-gray-900 leading-tight">
              {proofList[currentProofIndex].name} from {proofList[currentProofIndex].city}
            </p>
            <p className="text-[10px] text-gray-500 truncate max-w-[170px]">
              purchased <span className="font-semibold text-gray-700">{proofList[currentProofIndex].item}</span>
            </p>
            <span className="text-[9px] text-emerald-600 font-medium">
              Verified • {proofList[currentProofIndex].time}
            </span>
          </div>
          <button
            onClick={() => setShowProof(false)}
            className="text-gray-300 hover:text-gray-500 p-0.5"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* FLOATING WHATSAPP CHAT BUTTON (INSTANT SALES ASSISTANCE) */}
      <a
        href="https://wa.me/919876543210?text=Hi%20PDF%20Master%20India,%20I%20have%20a%20question%20about%20ordering%20a%20PDF"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-5 right-5 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
      >
        <MessageCircle size={24} className="fill-white" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold pl-0 group-hover:pl-2">
          Chat on WhatsApp
        </span>
      </a>

      <Footer />
    </div>
  );
}
