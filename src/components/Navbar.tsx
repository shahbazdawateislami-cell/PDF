import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Home as HomeIcon, 
  BookOpen, 
  Grid, 
  ShoppingBag, 
  Heart, 
  ShoppingCart, 
  User as UserIcon, 
  ShieldCheck, 
  Menu, 
  X,
  Lock
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const navigate = useNavigate();
  const { cart, wishlist } = useProducts();
  const { user, isAdmin, isAdminMode, toggleAdminMode, adminPinLogin, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/all?q=${encodeURIComponent(searchQuery.trim())}`);
      if (onSearch) onSearch(searchQuery.trim());
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPinLogin(pinInput)) {
      setShowAdminPinModal(false);
      setPinInput('');
      setPinError(false);
      navigate('/admin');
    } else {
      setPinError(true);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
        {/* Top Header */}
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <BookOpen size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-none">
                PDF Master <span className="text-orange-500">India</span>
              </div>
              <div className="text-[10px] text-gray-500 font-medium tracking-wide">
                Learn More. Do More. Grow Faster.
              </div>
            </div>
          </Link>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xl items-center relative"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PDFs, books, courses..."
              className="w-full pl-4 pr-12 py-2 text-sm bg-gray-50 hover:bg-white focus:bg-white border border-gray-300 focus:border-blue-500 rounded-full outline-none transition-all"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors shadow-sm"
            >
              <Search size={15} />
            </button>
          </form>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center gap-5 text-gray-700 font-medium text-xs">
            <Link to="/" className="flex flex-col items-center gap-0.5 hover:text-blue-600 transition-colors">
              <HomeIcon size={18} className="text-blue-600" />
              <span>Home</span>
            </Link>

            <Link to="/all" className="flex flex-col items-center gap-0.5 hover:text-blue-600 transition-colors">
              <BookOpen size={18} />
              <span>All PDFs</span>
            </Link>

            <Link to="/all#categories" className="flex flex-col items-center gap-0.5 hover:text-blue-600 transition-colors">
              <Grid size={18} />
              <span>Categories</span>
            </Link>

            <Link to="/purchases" className="flex flex-col items-center gap-0.5 hover:text-blue-600 transition-colors">
              <ShoppingBag size={18} />
              <span>My Purchases</span>
            </Link>

            <Link to="/wishlist" className="flex flex-col items-center gap-0.5 relative hover:text-blue-600 transition-colors">
              <Heart size={18} className={wishlist.length > 0 ? 'text-red-500 fill-red-500' : ''} />
              <span>Wishlist</span>
              {wishlist.length > 0 && (
                <span className="absolute -top-1 right-2 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className="flex flex-col items-center gap-0.5 relative hover:text-blue-600 transition-colors">
              <ShoppingCart size={18} />
              <span>Cart</span>
              {cart.length > 0 && (
                <span className="absolute -top-1 right-1 bg-orange-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Link>

            {/* Admin or Login Button */}
            {isAdmin ? (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold hover:bg-emerald-100 transition-colors"
              >
                <ShieldCheck size={16} />
                <span>Admin Panel</span>
              </Link>
            ) : (
              <button
                onClick={() => setShowAdminPinModal(true)}
                className="flex flex-col items-center gap-0.5 hover:text-blue-600 transition-colors"
                title="Admin or User Login"
              >
                <UserIcon size={18} />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Mobile Right Icons */}
          <div className="flex lg:hidden items-center gap-3">
            <Link to="/purchases" className="p-1.5 text-gray-700">
              <ShoppingBag size={20} />
            </Link>
            <Link to="/cart" className="p-1.5 text-gray-700 relative">
              <ShoppingCart size={20} />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-orange-600 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-gray-700 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="p-2.5 pt-0 md:hidden max-w-7xl mx-auto px-4">
          <form onSubmit={handleSearchSubmit} className="flex items-center relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PDFs, books, courses..."
              className="w-full pl-3 pr-10 py-2 text-xs bg-gray-50 border border-gray-300 rounded-full outline-none"
            />
            <button
              type="submit"
              className="absolute right-1 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center"
            >
              <Search size={13} />
            </button>
          </form>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 space-y-3 shadow-lg">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 text-sm font-semibold text-gray-800 py-1.5"
            >
              <HomeIcon size={18} className="text-blue-600" /> Home
            </Link>
            <Link
              to="/all"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 text-sm font-semibold text-gray-800 py-1.5"
            >
              <BookOpen size={18} /> All PDFs
            </Link>
            <Link
              to="/purchases"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 text-sm font-semibold text-gray-800 py-1.5"
            >
              <ShoppingBag size={18} /> My Purchases
            </Link>
            <Link
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 text-sm font-semibold text-gray-800 py-1.5"
            >
              <Heart size={18} className="text-red-500" /> Wishlist ({wishlist.length})
            </Link>
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              {isAdmin ? (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-bold text-emerald-600"
                >
                  <ShieldCheck size={18} /> Admin Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowAdminPinModal(true);
                  }}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                >
                  <Lock size={16} /> Admin Login
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Admin PIN Login Modal */}
      {showAdminPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Lock size={18} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Admin Login</h3>
              </div>
              <button
                onClick={() => setShowAdminPinModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Enter Admin PIN to manage, edit, add or delete PDF products. (Default demo PIN: <span className="font-mono font-bold text-gray-800">1234</span>)
            </p>

            <form onSubmit={handlePinSubmit} className="space-y-3">
              <div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="Enter 4-digit PIN"
                  className={`w-full px-4 py-2.5 rounded-xl border text-center font-mono text-lg tracking-widest ${
                    pinError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  autoFocus
                />
                {pinError && (
                  <p className="text-[11px] text-red-500 mt-1 text-center">Invalid PIN. Try 1234.</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
              >
                Unlock Admin Mode
              </button>

              <button
                type="button"
                onClick={() => {
                  toggleAdminMode(true);
                  setShowAdminPinModal(false);
                  navigate('/admin');
                }}
                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold py-2 rounded-xl text-xs transition-colors"
              >
                ⚡ 1-Click Quick Admin Access
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
