import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../context/ProductContext';

export default function Wishlist() {
  const { wishlist, products } = useProducts();
  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-gray-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <Heart size={20} className="fill-red-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                My Wishlist ({wishlistedProducts.length})
              </h1>
              <p className="text-xs text-gray-500">
                PDF guides you've saved for later study.
              </p>
            </div>
          </div>

          <Link
            to="/all"
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            <ArrowLeft size={14} /> Back to Catalog
          </Link>
        </div>

        {wishlistedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {wishlistedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-4">
            <Heart size={36} className="text-gray-300 mx-auto" />
            <h3 className="font-bold text-gray-800">Your wishlist is empty</h3>
            <p className="text-xs text-gray-500">Click the heart icon on any product to save it here.</p>
            <Link
              to="/"
              className="inline-block bg-orange-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl"
            >
              Explore Books
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
