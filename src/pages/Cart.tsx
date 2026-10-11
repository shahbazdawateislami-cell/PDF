import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useProducts } from '../context/ProductContext';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, clearCart } = useProducts();

  const totalAmount = cart.reduce((sum, item) => sum + item.product.price, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-gray-900">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <ShoppingCart size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                Shopping Cart ({cart.length})
              </h1>
              <p className="text-xs text-gray-500">
                Digital PDF guides ready for instant download.
              </p>
            </div>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-bold text-red-600 hover:underline"
            >
              Clear Cart
            </button>
          )}
        </div>

        {cart.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-8 space-y-3">
              {cart.map(({ product }) => (
                <div
                  key={product.id}
                  className="bg-white p-4 rounded-2xl border border-gray-200/80 flex items-center justify-between gap-4"
                >
                  <img
                    src={product.coverImage}
                    alt=""
                    className="w-14 h-20 object-cover rounded-xl border border-gray-200 shadow-xs shrink-0"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-1">
                      {product.title}
                    </h3>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {product.category} • Instant PDF
                    </div>
                    <div className="text-sm font-black text-gray-900 mt-1">
                      ₹{product.price}{' '}
                      <span className="text-xs text-gray-400 line-through">₹{product.oldPrice}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="md:col-span-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-gray-900 pb-2 border-b">
                Order Summary
              </h3>

              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Items ({cart.length}):</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Instant Delivery:</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-red-600">₹{totalAmount}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (cart.length > 0) {
                    navigate(`/checkout/${cart[0].product.id}`);
                  }
                }}
                className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 active:scale-[0.98] text-white font-black py-4 px-6 rounded-2xl text-sm sm:text-base tracking-wide shadow-xl shadow-red-500/25 ring-2 ring-red-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Instant Checkout</span> <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-4">
            <ShoppingCart size={36} className="text-gray-300 mx-auto" />
            <h3 className="font-bold text-gray-800">Your cart is empty</h3>
            <p className="text-xs text-gray-500">Add any PDF guide to your cart to check out.</p>
            <Link
              to="/"
              className="inline-block bg-orange-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl"
            >
              Explore Products
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
