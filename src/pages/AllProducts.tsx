import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, ArrowLeft } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { PdfInsidePreviewModal } from '../components/PdfInsidePreviewModal';
import { useProducts } from '../context/ProductContext';
import { Product } from '../types';

export default function AllProducts() {
  const [searchParams] = useSearchParams();
  const { products, categories } = useProducts();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'priceLow' | 'priceHigh'>('popular');
  const [previewModalProduct, setPreviewModalProduct] = useState<Product | null>(null);

  // Sync category or query from URL query params
  useEffect(() => {
    const cat = searchParams.get('cat');
    if (cat) setSelectedCategory(cat);

    const q = searchParams.get('q');
    if (q) setSearchQuery(q);

    const filter = searchParams.get('filter');
    if (filter === 'trending') setSelectedCategory('trending');
    if (filter === 'bestselling') setSelectedCategory('bestselling');
    if (filter === 'new') setSelectedCategory('new');
  }, [searchParams]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'trending') return p.isTrending;
    if (selectedCategory === 'bestselling') return p.isBestseller;
    if (selectedCategory === 'new') return p.isNewArrival;

    return p.category === selectedCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'priceLow') return a.price - b.price;
    if (sortBy === 'priceHigh') return b.price - a.price;
    return b.rating - a.rating;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-gray-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header Title & Breadcrumb */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <span>/</span>
              <span className="font-semibold text-gray-900">All PDF Guides &amp; Books</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Browse All Digital PDFs
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Showing {sortedProducts.length} curated PDF guides for immediate download
            </p>
          </div>

          {/* Sort & Quick Search */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by keyword..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 outline-none font-medium text-gray-700"
            >
              <option value="popular">Top Rated</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" id="categories">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-navy-950 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All Categories ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                selectedCategory === cat.name
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {sortedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onQuickPreview={(prod) => setPreviewModalProduct(prod)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
            <p className="text-gray-400 text-sm">No products found matching your search or category.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="bg-navy-900 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* QUICK INSIDE PAGES PREVIEW MODAL */}
      <PdfInsidePreviewModal
        product={previewModalProduct}
        isOpen={!!previewModalProduct}
        onClose={() => setPreviewModalProduct(null)}
      />

      <Footer />
    </div>
  );
}
