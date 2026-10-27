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
  Lock,
  Phone,
  MessageCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { RealWhatsAppIcon } from './WhatsAppFloatingButton';

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const navigate = useNavigate();
  const { cart, wishlist } = useProducts();
  const { user, isAdmin, adminLogin, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [adminIdInput, setAdminIdInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/all?q=${encodeURIComponent(searchQuery.trim())}`);
      if (onSearch) onSearch(searchQuery.trim());
    }
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin(adminIdInput, adminPasswordInput)) {
      setShowAdminPinModal(false);
      setAdminIdInput('');
      setAdminPasswordInput('');
      setLoginError('');
      navigate('/admin');
    } else {
      setLoginError('Galat Admin ID ya Password! Access denied.');
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
              value={searchQuery ?? ""}
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

            {/* Direct WhatsApp Contact Button */}
            <a
              href="https://wa.me/917079988808?text=Hi%20PDF%20Master%20India,%20I%20have%20a%20question%20about%20ordering%20a%20PDF"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors font-bold text-[11px]"
              title="Chat with official support on WhatsApp"
            >
              <RealWhatsAppIcon size={16} className="text-[#25D366]" />
              <span>7079988808</span>
            </a>

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
              value={searchQuery ?? ""}
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

            {/* Mobile WhatsApp Button */}
            <a
              href="https://wa.me/917079988808?text=Hi%20PDF%20Master%20India,%20I%20have%20a%20question%20about%20ordering%20a%20PDF"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between text-sm font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              <span className="flex items-center gap-2">
                <RealWhatsAppIcon size={20} className="text-[#25D366]" />
                <span>WhatsApp Support</span>
              </span>
              <span className="text-xs bg-emerald-600 text-white font-mono px-2 py-0.5 rounded-full font-bold">
                7079988808
              </span>
            </a>

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

      {/* Secure Admin ID & Password Login Modal */}
      {showAdminPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-sm">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base leading-tight">Admin Login</h3>
                  <p className="text-[11px] text-gray-500 font-medium">PDF Master India Management</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAdminPinModal(false);
                  setLoginError('');
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-600 mb-4 bg-amber-50 border border-amber-200/60 p-2.5 rounded-xl">
              🔒 <strong>Restricted Area:</strong> Is panel ko access karne ke liye apna authorized Admin ID aur Password enter karein.
            </p>

            <form onSubmit={handleAdminLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Admin ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={adminIdInput ?? ""}
                    onChange={(e) => {
                      setAdminIdInput(e.target.value);
                      setLoginError('');
                    }}
                    placeholder="Enter Admin ID"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPasswordInput ?? ""}
                    onChange={(e) => {
                      setAdminPasswordInput(e.target.value);
                      setLoginError('');
                    }}
                    placeholder="Enter Password"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-2.5 font-medium text-center animate-shake">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 mt-2"
              >
                <Lock size={15} /> Login to Admin Panel
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
