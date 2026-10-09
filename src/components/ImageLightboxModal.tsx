import React from 'react';
import { X, ZoomIn, Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
  title?: string;
}

export const ImageLightboxModal: React.FC<LightboxProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onSelectIndex,
  title = 'Sample Preview'
}) => {
  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const prev = () => {
    onSelectIndex((currentIndex - 1 + images.length) % images.length);
  };

  const next = () => {
    onSelectIndex((currentIndex + 1) % images.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
      <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
        <span className="text-white text-sm font-medium bg-black/40 px-3 py-1 rounded-full border border-white/10">
          {currentIndex + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center">
        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={prev}
            className="absolute left-2 md:left-4 z-10 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all"
          >
            <ChevronLeft size={28} />
          </button>
        )}

        {/* Current Image */}
        <div className="flex flex-col items-center">
          <img
            src={currentImage}
            alt={title}
            className="max-h-[75vh] max-w-full rounded-xl shadow-2xl object-contain border border-white/10"
          />
          <p className="text-gray-300 text-sm mt-3 font-medium tracking-wide">
            {title} - Page {currentIndex + 1} Preview
          </p>
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={next}
            className="absolute right-2 md:right-4 z-10 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all"
          >
            <ChevronRight size={28} />
          </button>
        )}
      </div>

      {/* Thumbnails row at bottom */}
      {images.length > 1 && (
        <div className="absolute bottom-4 flex items-center gap-2 max-w-full overflow-x-auto p-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => onSelectIndex(idx)}
              className={`w-12 h-16 rounded overflow-hidden border-2 transition-all shrink-0 ${
                currentIndex === idx ? 'border-orange-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
