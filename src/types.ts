export interface ProductVideo {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  videoUrl?: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  oldPrice: number;
  rating: number;
  reviewsCount: number;
  coverImage: string;
  badge?: string; // e.g. "Bestseller", "New", "Trending"
  description: string;
  highlights: string[];
  features: string[];
  tableOfContents: { chapter: string; title: string; pages: string }[];
  previewImages: string[];
  samplePages: string[];
  videos: ProductVideo[];
  reviews: Review[];
  faqs: { question: string; answer: string }[];
  pdfPagesCount: number;
  fileSize: string;
  language: string;
  pdfUrl?: string;
  pdfFileName?: string;
  samplePdfText?: string;
  isTrending?: boolean;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  series?: string;
  createdAt?: string;
}

export interface Order {
  id: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  productId: string;
  productTitle: string;
  productCover: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  status: 'pending' | 'paid' | 'failed';
  verified?: boolean;
  date: string;
  downloadCount: number;
}

export interface DownloadLog {
  id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  customerEmail: string;
  timestamp: string;
  ipAddress?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface Bundle {
  id: string;
  title: string;
  subtitle: string;
  productIds: string[];
  price: number;
  oldPrice: number;
  badge: string;
  coverImage?: string;
  description: string;
  isPopular?: boolean;
}

export interface Coupon {
  id?: string;
  code: string;
  discountPercent?: number; // percentage value e.g. 10 for 10%
  discountType?: 'percentage' | 'flat'; // percentage or flat INR discount
  discountAmount?: number; // flat discount amount in INR e.g. 50
  minOrderAmount?: number; // minimum order requirement in INR
  expiryDate?: string; // ISO date string or YYYY-MM-DD
  timesUsed?: number;
  description: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface HeroStackedCard {
  id: string;
  title: string;
  image: string;
  link: string;
}

export interface HeroBannerConfig {
  backgroundImage?: string;
  backgroundOverlayOpacity?: number;
  stackedCards: HeroStackedCard[];
}
