import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  ZoomIn, 
  ShoppingBag, 
  BookOpen, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  ExternalLink 
} from 'lucide-react';
import { Product } from '../types';
import { Carousel } from './Carousel';
import { ImageLightboxModal } from './ImageLightboxModal';

interface PdfInsidePreviewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PdfInsidePreviewModal: React.FC<PdfInsidePreviewModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);

  if (!isOpen || !product) return null;

  const previewPages = (product.previewImages && product.previewImages.length > 0)
    ? product.previewImages
    : (product.samplePages && product.samplePages.length > 0)
    ? product.samplePages
    : [product.coverImage];

  const handleOpenZoom = (index: number) => {
    setSelectedPageIndex(index);
    setLightboxOpen(true);
  };

  const handleBuyNow = () => {
    onClose();
    navigate(`/checkout/${product.id}`);
  };

  const handleViewFullDetails = () => {
    onClose();
    navigate(`/product/${product.id}`);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-5 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-scale-in">
          {/* Top Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-400/30 text-orange-400 flex items-center justify-center shrink-0">
                <BookOpen size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black bg-orange-500 text-white px-2 py-0.5 rounded">
                    Inside Pages Preview
                  </span>
                  <span className="text-xs text-blue-200 font-medium">
                    {previewPages.length} Sample Pages Available
                  </span>
                </div>
                <h3 className="font-black text-sm sm:text-base text-white line-clamp-1 mt-0.5">
                  {product.title}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
              aria-label="Close Preview"
            >
              <X size={18} />
            </button>
          </div>

          {/* Subheader / Info Bar */}
          <div className="bg-orange-50/80 px-4 sm:px-6 py-2.5 border-b border-orange-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-4 text-gray-700">
              <span className="font-bold text-gray-900 flex items-center gap-1.5">
                <FileText size={14} className="text-orange-600" />
                {product.pdfPagesCount || 120} Pages Full Book
              </span>
              <span className="text-gray-500 hidden sm:inline">•</span>
              <span className="text-gray-600 hidden sm:inline">
                Language: <strong className="text-gray-900">{product.language || 'Hindi + English'}</strong>
              </span>
              <span className="text-gray-500 hidden md:inline">•</span>
              <span className="text-emerald-700 font-bold hidden md:inline flex items-center gap-1">
                <ShieldCheck size={14} /> Instant PDF Download after Payment
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-red-600">₹{product.price}</span>
                <span className="text-xs text-gray-400 line-through">₹{product.oldPrice}</span>
              </div>
              <button
                onClick={handleBuyNow}
                className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-red-500/25 ring-2 ring-red-200 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag size={14} /> Buy Now
              </button>
            </div>
          </div>

          {/* Centerpiece: Horizontal Carousel of Inside Pages */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-blue-50/60 p-3 rounded-2xl border border-blue-200/60">
              <div className="flex items-center gap-2 text-xs text-blue-950 font-bold">
                <Sparkles size={16} className="text-blue-600 shrink-0" />
                <span>
                  Check inside material before purchasing (Scroll horizontally to inspect pages)
                </span>
              </div>
              <span className="text-[11px] text-blue-600 font-bold flex items-center gap-1 self-end sm:self-auto">
                <ZoomIn size={13} /> Tap any page to zoom in
              </span>
            </div>

            {/* Horizontal Carousel */}
            <div className="py-2">
              <Carousel
                items={previewPages.map((pageImg, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleOpenZoom(idx)}
                    className="group relative cursor-pointer rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-orange-500 bg-gray-50 shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    {/* Page Image */}
                    <img
                      src={pageImg}
                      alt={`Page ${idx + 1}`}
                      className="w-full aspect-[3/4] object-contain group-hover:scale-[1.03] transition-transform duration-300 bg-white"
                      loading="lazy"
                    />

                    {/* Page Number Badge */}
                    <div className="absolute top-2.5 left-2.5 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1">
                      <span>Page {idx + 1}</span>
                      <span className="text-gray-400 text-[9px]">/ {previewPages.length}</span>
                    </div>

                    {/* Hover Zoom Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                      <div className="bg-white/95 text-gray-900 text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all flex items-center gap-1.5">
                        <ZoomIn size={14} className="text-orange-600" /> Click to Zoom
                      </div>
                    </div>
                  </div>
                ))}
                itemsToShow={{ mobile: 1.3 as any, tablet: 2.5 as any, desktop: 3.5 as any }}
                autoScroll={true}
                autoScrollInterval={4000}
                showArrows={true}
                showDots={true}
                gap={14}
              />
            </div>

            {/* Highlights of this PDF */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <h4 className="font-black text-xs text-gray-900 mb-2">
                  Key Topics &amp; What You'll Learn:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                  {product.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                      <span className="line-clamp-1">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={handleViewFullDetails}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline order-2 sm:order-1"
            >
              View Full Table of Contents &amp; Reviews <ChevronRight size={14} />
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto order-1 sm:order-2">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold text-xs transition-colors"
              >
                Close Preview
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 sm:flex-none px-7 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 active:scale-95 text-white font-black text-xs sm:text-sm shadow-xl shadow-red-500/30 ring-2 ring-red-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag size={16} /> Buy This PDF (₹{product.price})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Lightbox Zoom Modal */}
      <ImageLightboxModal
        images={previewPages}
        currentIndex={selectedPageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onSelectIndex={(newIdx) => setSelectedPageIndex(newIdx)}
        title={product.title}
      />
    </>
  );
};
