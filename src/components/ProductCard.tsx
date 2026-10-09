import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Heart, Eye } from 'lucide-react';
import { Product } from '../types';
import { useProducts } from '../context/ProductContext';

interface ProductCardProps {
  product: Product;
  onPreviewImage?: (image: string) => void;
  onQuickPreview?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPreviewImage, onQuickPreview }) => {
  const navigate = useNavigate();
  const { isWishlisted, toggleWishlist } = useProducts();
  const wishlisted = isWishlisted(product.id);

  const discountPercent = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/checkout/${product.id}`);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onQuickPreview) {
      onQuickPreview(product);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  return (
    <div className="group relative bg-white border border-gray-200 hover:border-orange-300 rounded-2xl p-3 md:p-3.5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full">
      {/* Top badges & Wishlist */}
      <div className="relative mb-2.5 overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center">
        <Link to={`/product/${product.id}`} className="block w-full">
          <img
            src={product.coverImage}
            alt={product.title}
            className="w-full aspect-[3/4] object-contain rounded-xl group-hover:scale-[1.03] transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-xs">
            {discountPercent}% OFF
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          aria-label="Add to Wishlist"
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 hover:bg-white shadow-xs flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
        >
          <Heart size={14} className={wishlisted ? 'fill-red-500 text-red-500' : ''} />
        </button>

        {/* Quick Preview Badge Overlay */}
        <button
          onClick={handlePreview}
          className="absolute bottom-2 inset-x-2 bg-slate-900/85 hover:bg-slate-950 text-white text-[10px] font-bold py-1 px-2 rounded-lg opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 shadow-sm"
        >
          <Eye size={12} className="text-orange-400" />
          <span>Inside Preview (صفحات دیکھیں)</span>
        </button>
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-gray-900 text-xs md:text-sm leading-tight hover:text-orange-600 transition-colors line-clamp-2 min-h-[2.5rem] mb-1">
            {product.title}
          </h3>
        </Link>

        {/* Ratings & Pages */}
        <div className="flex items-center justify-between mb-2 text-xs">
          <div className="flex items-center text-amber-500">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            <span className="font-bold ml-1 text-gray-800 text-[12px]">{product.rating}</span>
            <span className="text-gray-400 text-[11px] ml-1">
              ({product.reviewsCount > 999 ? `${(product.reviewsCount / 1000).toFixed(1)}K` : product.reviewsCount})
            </span>
          </div>
          <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
            {product.pdfPagesCount || 120} pgs
          </span>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mb-2.5 mt-auto">
          <span className="text-base md:text-lg font-black text-gray-900">
            ₹{product.price}
          </span>
          <span className="text-xs text-gray-400 line-through">
            ₹{product.oldPrice}
          </span>
        </div>

        {/* Action Buttons: Preview Pages & Buy Now */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <button
            onClick={handlePreview}
            className="w-full bg-blue-50 hover:bg-blue-100 active:scale-[0.98] text-blue-700 py-2 rounded-xl font-bold text-[11px] transition-all flex items-center justify-center gap-1 border border-blue-200"
            title="Inspect inside pages before purchase"
          >
            <Eye size={13} className="text-blue-600" />
            Preview
          </button>
          <button
            onClick={handleBuyNow}
            className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white py-2 rounded-xl font-black text-xs tracking-wide shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};
