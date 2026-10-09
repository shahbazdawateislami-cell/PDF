import React, { useState, useEffect, useRef, TouchEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  items: React.ReactNode[];
  itemsToShow?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  } | number;
  autoScroll?: boolean;
  autoScrollInterval?: number; // ms
  showDots?: boolean;
  showArrows?: boolean;
  gap?: number;
  className?: string;
}

export const Carousel: React.FC<CarouselProps> = ({
  items,
  itemsToShow = { mobile: 1, tablet: 2, desktop: 4 },
  autoScroll = false,
  autoScrollInterval = 3500,
  showDots = true,
  showArrows = true,
  gap = 16,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Responsive items count calculation
  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      if (typeof itemsToShow === 'number') {
        setVisibleCount(itemsToShow);
        return;
      }
      if (width < 640) {
        setVisibleCount(itemsToShow.mobile || 1);
      } else if (width < 1024) {
        setVisibleCount(itemsToShow.tablet || 2);
      } else {
        setVisibleCount(itemsToShow.desktop || 4);
      }
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, [itemsToShow]);

  const maxIndex = Math.max(0, items.length - visibleCount);

  // Auto-scroll logic (right to left, pause on hover)
  useEffect(() => {
    if (!autoScroll || isPaused || items.length <= visibleCount) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, autoScrollInterval);

    return () => clearInterval(timer);
  }, [autoScroll, isPaused, maxIndex, autoScrollInterval, items.length, visibleCount]);

  const next = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Touch gesture support for mobile
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!touchStartX.current) return;
    const diff = touchStartX.current - e.touches[0].clientX;
    if (diff > 50) {
      next();
      touchStartX.current = null;
    } else if (diff < -50) {
      prev();
      touchStartX.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartX.current = null;
  };

  if (!items || items.length === 0) return null;

  return (
    <div
      className={`relative group ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel Track */}
      <div
        ref={containerRef}
        className="overflow-hidden py-2"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                flex: `0 0 ${100 / visibleCount}%`,
                paddingRight: `${gap}px`
              }}
              className="box-border"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && items.length > visibleCount && (
        <>
          <button
            onClick={prev}
            aria-label="Previous Slide"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 md:-translate-x-5 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:text-navy-900 hover:bg-gray-50 hover:scale-105 transition-all z-10 focus:outline-none"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={next}
            aria-label="Next Slide"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 md:translate-x-5 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:text-navy-900 hover:bg-gray-50 hover:scale-105 transition-all z-10 focus:outline-none"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {showDots && maxIndex > 0 && (
        <div className="flex justify-center items-center gap-1.5 mt-4">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === idx
                  ? 'w-6 bg-navy-900 dark:bg-orange-500'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
