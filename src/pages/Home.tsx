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
  BookOpen,
  Clock,
  Flame,
  Layers,
  MessageCircle,
  X,
  CheckCircle2,
  Palette,
  Edit3,
  Sparkles,
  Zap,
  Plus,
  Check,
  Link2,
  Copy,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { Carousel } from '../components/Carousel';
import { PdfInsidePreviewModal } from '../components/PdfInsidePreviewModal';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';

export default function Home() {
  const navigate = useNavigate();
  const { products, bundles, categories, heroConfig } = useProducts();
  const { isAdmin } = useAuth();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [previewModalProduct, setPreviewModalProduct] = useState<Product | null>(null);
  const [catalogCategory, setCatalogCategory] = useState<string>('all');
  const categoriesContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesContainerRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      categoriesContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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

  // Group products by section (Feature newly uploaded PDFs prominently)
  const customUploadedProducts = products.filter((p) => p && typeof p.id === 'string' && p.id.startsWith('pdf-'));
  const trendingProducts = [
    ...customUploadedProducts,
    ...products.filter((p) => p && typeof p.id === 'string' && !p.id.startsWith('pdf-') && (p.isTrending || p.id.includes('chatgpt') || p.id.includes('english') || p.id.includes('business') || p.id.includes('students')))
  ].slice(0, 8);

  const bestsellingProducts = products.filter((p) => p && (p.isBestseller || (typeof p.id === 'string' && (p.id.includes('marketing') || p.id.includes('islamic') || p.id.includes('canva') || p.id.includes('prompt') || p.id.includes('excel') || p.id.includes('video'))))).slice(0, 8);

  const newArrivals = [
    ...customUploadedProducts,
    ...products.filter((p) => p && typeof p.id === 'string' && !p.id.startsWith('pdf-') && (p.isNewArrival || p.id.includes('youtube') || p.id.includes('ctet') || p.id.includes('science') || p.id.includes('hindi') || p.id.includes('kids') || p.id.includes('academic')))
  ].slice(0, 8);

  // Catalog for full 2-by-2 products showcase
  const displayedCatalogProducts = catalogCategory === 'all'
    ? products
    : products.filter((p) => p.category === catalogCategory);
  const availableCategories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

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
          {/* Custom Background Photo from Admin if uploaded */}
          {heroConfig?.backgroundImage ? (
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 pointer-events-none"
              style={{ backgroundImage: `url(${heroConfig.backgroundImage})` }}
            />
          ) : null}

          {/* Dark overlay for contrast and readability */}
          {heroConfig?.backgroundImage ? (
            <div
              className="absolute inset-0 bg-[#0B1528] transition-opacity duration-300 pointer-events-none"
              style={{ opacity: heroConfig.backgroundOverlayOpacity ?? 0.55 }}
            />
          ) : null}

          {/* Subtle star particles background */}
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />



          {/* Special Offer Pill Badge (Top Right on Tablet/Desktop, Hidden on narrow mobile to avoid overlap) */}
          <div className="hidden sm:block absolute top-4 right-4 md:top-6 md:right-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-2.5 md:p-3.5 text-center shadow-lg border border-white/20 transform rotate-1 z-10">
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

          <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6 sm:gap-8 pt-1 sm:pt-4 md:pt-0">
            {/* Left Content */}
            <div className="max-w-xl text-left space-y-3 sm:space-y-4 w-full">
              {/* Mobile-only compact offer pill: neatly placed above headline with zero overlap */}
              <div className="sm:hidden inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-1 rounded-full text-[11px] font-black shadow-md border border-white/20">
                <span className="uppercase text-[9px] tracking-wider text-orange-200">Special Offer</span>
                <span>•</span>
                <span>Up to 50% OFF on PDFs</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-snug sm:leading-[1.15] break-words">
                Learn More. Do More.<br />
                <span className="text-[#FBBF24]">Grow Faster.</span>
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-gray-200 font-normal leading-relaxed max-w-lg">
                Practical PDF Guides for Students, Teachers, Professionals &amp; Business Owners. Instant downloads with lifetime access.
              </p>

              <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
                <Link
                  to="/all"
                  className="inline-flex items-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-navy-950 font-extrabold text-xs sm:text-sm px-5 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-lg hover:shadow-orange-500/20 active:scale-95 transition-all"
                >
                  Explore PDFs <ArrowRight size={15} />
                </Link>
                <Link
                  to="/all?cat=AI+Tools"
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all"
                >
                  🔥 AI Guides (₹99)
                </Link>
              </div>
            </div>

            {/* Right Graphic: 3D Stack of Books matching the mockup with customizable photos & links */}
            <div className="relative flex items-center justify-center pt-4 lg:pt-0 pb-2">
              <div className="relative flex items-center">
                {(heroConfig?.stackedCards && heroConfig.stackedCards.length > 0
                  ? heroConfig.stackedCards
                  : [
                      { id: 'card-1', title: products[0]?.title || 'PDF 1', image: products[0]?.coverImage || '', link: `/product/${products[0]?.id || ''}` },
                      { id: 'card-2', title: products[1]?.title || 'PDF 2', image: products[1]?.coverImage || '', link: `/product/${products[1]?.id || ''}` },
                      { id: 'card-3', title: products[2]?.title || 'PDF 3', image: products[2]?.coverImage || '', link: `/product/${products[2]?.id || ''}` },
                      { id: 'card-4', title: products[3]?.title || 'PDF 4', image: products[3]?.coverImage || '', link: `/product/${products[3]?.id || ''}` }
                    ]
                ).map((card, idx) => {
                  const rotationStyles = [
                    'transform -rotate-12 hover:-rotate-6 z-10',
                    '-ml-8 sm:-ml-10 transform -rotate-3 hover:rotate-0 z-20',
                    '-ml-8 sm:-ml-10 transform rotate-6 hover:rotate-2 z-30',
                    '-ml-8 sm:-ml-10 transform rotate-14 hover:rotate-10 z-40'
                  ];
                  const currentRotation = rotationStyles[idx % rotationStyles.length];
                  const cardCover = card.image || products[idx]?.coverImage || '';
                  const cardLink = card.link || (products[idx] ? `/product/${products[idx].id}` : '');
                  const isExternal = cardLink.startsWith('http://') || cardLink.startsWith('https://');

                  const cardContent = (
                    <div
                      className={`w-24 sm:w-28 md:w-32 shadow-2xl rounded-lg overflow-hidden border border-white/20 transition-all duration-300 hover:scale-105 hover:-translate-y-2 group cursor-pointer ${currentRotation}`}
                      title={card.title ? `${card.title} (Click to open)` : 'Click to view PDF'}
                    >
                      <img
                        src={cardCover}
                        alt={card.title || `Book ${idx + 1}`}
                        className="w-full aspect-[3/4] object-cover group-hover:brightness-105 transition-all"
                      />
                    </div>
                  );

                  if (cardLink) {
                    if (isExternal) {
                      return (
                        <a
                          key={card.id || idx}
                          href={cardLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          {cardContent}
                        </a>
                      );
                    }
                    return (
                      <Link key={card.id || idx} to={cardLink} className="block">
                        {cardContent}
                      </Link>
                    );
                  }

                  return <div key={card.id || idx}>{cardContent}</div>;
                })}

                {/* PDF Stamp icon */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-50 bg-white rounded-xl shadow-xl px-3 py-1 border border-red-200 flex items-center gap-1.5 animate-bounce pointer-events-none">
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

        {/* POPULAR CATEGORIES (Compressed Surface Area & Horizontal Scroll) */}
        <section className="bg-white rounded-2xl p-3.5 sm:p-5 border border-gray-200/80 shadow-xs relative">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg md:text-xl font-black text-gray-900 tracking-tight">
                Popular Categories
              </h2>
              <span className="hidden sm:inline-flex text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full items-center gap-1">
                ← Scroll to explore →
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Left & Right Smooth Scroll Buttons */}
              <button
                type="button"
                onClick={() => scrollCategories('left')}
                aria-label="Scroll left"
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all active:scale-90 border border-gray-200/80 cursor-pointer"
                title="Scroll left"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                onClick={() => scrollCategories('right')}
                aria-label="Scroll right"
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all active:scale-90 border border-gray-200/80 cursor-pointer"
                title="Scroll right"
              >
                <ChevronRight size={15} />
              </button>

              <Link
                to="/all"
                className="text-xs md:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 group ml-1"
              >
                View All <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Horizontally scrollable row showing ~2.5 to 3 items per view */}
          <div
            ref={categoriesContainerRef}
            className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory py-1 pb-1.5 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => navigate(`/all?cat=${encodeURIComponent(cat.name)}`)}
                className="group flex flex-col items-center justify-center py-2.5 px-2 rounded-xl bg-gray-50/80 hover:bg-orange-50/70 border border-gray-200/70 hover:border-orange-300 transition-all text-center flex-shrink-0 snap-start w-[31%] min-w-[96px] max-w-[115px] sm:w-28 active:scale-95 cursor-pointer shadow-2xs hover:shadow-xs"
              >
                <span className="text-2xl sm:text-3xl mb-1.5 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </span>
                <span className="text-[11px] font-bold text-gray-800 group-hover:text-orange-600 transition-colors leading-tight line-clamp-1 w-full truncate px-1">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* MEGA BUNDLES & COMBO PACKS (HIGH-CONVERSION FEATURE) */}
        {bundles && bundles.length > 0 && (
          <section className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-red-500/10 rounded-3xl p-5 sm:p-8 border-2 border-orange-300 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Layers className="text-orange-600" size={26} /> Mega PDF Combos &amp; Pack Deals
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {bundles.map((bundle) => {
                // Resolve all included products with their real cover photos and prices
                const included = (bundle.productIds || [])
                  .map((pId) => products.find((p) => p.id === pId))
                  .filter(Boolean) as Product[];

                // If ids could not be resolved, fallback to top products
                const displayItems = included.length > 0 ? included : products.slice(0, 4);

                const totalCalculatedValue = displayItems.reduce((acc, p) => acc + (p.price || 99), 0);
                const originalValue = Math.max(bundle.oldPrice || 0, totalCalculatedValue);
                const discount = Math.round(((originalValue - bundle.price) / originalValue) * 100);
                const savings = originalValue - bundle.price;

                return (
                  <div
                    key={bundle.id}
                    className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-orange-200/90 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
                  >
                    {/* Top gradient stripe */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-orange-500" />

                    <div>
                      {/* Title and subtitle */}
                      <h3 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight leading-tight">
                        {bundle.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                        {bundle.subtitle || bundle.description}
                      </p>

                      {/* PHOTO SHOWCASE OF ALL INCLUDED PDF BOOKS */}
                      <div className="bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-yellow-50/40 rounded-2xl p-4 sm:p-5 border border-orange-200/90 my-4 shadow-xs">
                        {/* Visual grid showing all book cover photos side-by-side */}
                        <div className={`grid gap-3 sm:gap-4 items-start ${
                          displayItems.length <= 2 
                            ? 'grid-cols-2 max-w-sm mx-auto' 
                            : displayItems.length === 3 
                              ? 'grid-cols-3' 
                              : 'grid-cols-2 sm:grid-cols-4'
                        }`}>
                          {displayItems.map((p, idx) => (
                            <div
                              key={p.id}
                              onClick={() => setPreviewModalProduct(p)}
                              className="flex flex-col items-center text-center group/book cursor-pointer"
                              title={`${p.title} (Click to preview sample pages)`}
                            >
                              <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-md group-hover/book:shadow-xl group-hover/book:-translate-y-1.5 transition-all duration-300 border-2 border-white bg-white ring-1 ring-gray-200">
                                <img
                                  src={p.coverImage}
                                  alt={p.title}
                                  className="w-full h-full object-cover group-hover/book:scale-105 transition-transform"
                                />

                                {/* Book position index tag */}
                                <span className="absolute top-1.5 left-1.5 bg-black/85 backdrop-blur-xs text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                                  #{idx + 1}
                                </span>

                                {/* Hover preview pill */}
                                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/book:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1 p-1">
                                  <BookOpen size={12} /> Preview
                                </div>

                                {/* Complete check badge */}
                                <div className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                                  <Check size={8} className="stroke-[3]" /> PDF
                                </div>
                              </div>

                              <h4 className="text-xs font-black text-gray-900 line-clamp-2 mt-2 leading-tight group-hover/book:text-orange-600 transition-colors">
                                {p.title}
                              </h4>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px] text-gray-400 font-bold line-through">
                                  ₹{p.price}
                                </span>
                                <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  Included ✓
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price & Value Comparison Box */}
                      <div className="bg-gradient-to-r from-gray-50 via-orange-50/30 to-amber-50/40 rounded-2xl p-4 border border-orange-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-baseline gap-2.5">
                          <span className="text-2xl sm:text-3xl font-black text-red-600">
                            ₹{bundle.price}
                          </span>
                          <span className="text-sm sm:text-base text-gray-400 font-bold line-through">
                            ₹{originalValue}
                          </span>
                          <span className="bg-emerald-600 text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-2xs">
                            {discount}% OFF
                          </span>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <div className="text-xs font-black text-emerald-700 flex items-center sm:justify-end gap-1">
                            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                            <span>Instant Digital Download</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="pt-4">
                      <button
                        onClick={() => navigate(`/checkout/${bundle.id}`)}
                        className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 active:scale-[0.98] text-white font-black py-4 px-6 rounded-2xl text-base sm:text-lg tracking-wide shadow-xl shadow-red-500/30 ring-4 ring-red-100 hover:ring-red-200 transition-all flex items-center justify-center gap-2 cursor-pointer group"
                      >
                        <Zap size={20} className="text-amber-300 fill-amber-300 group-hover:scale-110 transition-transform" />
                        <span>GET ALL {displayItems.length} PDFs FOR ₹{bundle.price}</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
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

        {/* ALL PDF PRODUCTS FULL SHOWCASE (2-by-2 GRID FORMAT ON MOBILE, RESPONSIVE ON DESKTOP) */}
        <section className="bg-white rounded-3xl p-4 sm:p-7 border border-gray-200/90 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <h2 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span>All PDF Books &amp; Study Guides</span>
            </h2>

            <Link
              to="/all"
              className="self-start sm:self-auto text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl flex items-center gap-1 transition-colors border border-blue-200"
            >
              <span>Explore All ({products.length})</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Quick Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setCatalogCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                catalogCategory === 'all'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              All PDFs ({products.length})
            </button>
            {availableCategories.map((cat) => {
              const count = products.filter((p) => p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setCatalogCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    catalogCategory === cat
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Products Grid: 2-by-2 on mobile screens, clean responsive layout on larger displays */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {displayedCatalogProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickPreview={(p) => setPreviewModalProduct(p)}
              />
            ))}
          </div>

          {displayedCatalogProducts.length === 0 && (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-sm font-bold text-gray-500">Is category mein filhaal koi PDF nahi hai.</p>
              <button
                onClick={() => setCatalogCategory('all')}
                className="mt-2 text-xs font-bold text-blue-600 hover:underline"
              >
                View All PDFs
              </button>
            </div>
          )}
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

      <Footer />
    </div>
  );
}
