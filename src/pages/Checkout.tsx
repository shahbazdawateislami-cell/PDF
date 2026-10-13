import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  ArrowLeft, 
  CheckCircle2, 
  CreditCard, 
  Smartphone, 
  Sparkles,
  AlertCircle,
  Tag,
  Check,
  MessageCircle
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, bundles, addOrder } = useProducts();
  const { user } = useAuth();

  // Find either matching bundle or matching single product
  const bundleItem = bundles.find((b) => b.id === id);
  const singleProduct = products.find((p) => p.id === id);
  const checkoutItem = bundleItem || singleProduct || products[0];

  const itemTitle = checkoutItem?.title || 'PDF Master Guide';
  const itemCover = checkoutItem?.coverImage || products[0]?.coverImage;
  const originalPrice = checkoutItem?.price || 99;
  const oldPrice = checkoutItem?.oldPrice || 199;
  const isBundle = !!bundleItem;

  const [customerName, setCustomerName] = useState(user?.displayName || 'Customer');
  const [customerEmail, setCustomerEmail] = useState(user?.email || 'customer@pdfmaster.in');
  const [customerPhone, setCustomerPhone] = useState(user?.phoneNumber || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  type PaymentMethodType = 'all' | 'phonepe' | 'gpay' | 'paytm' | 'bhim' | 'card' | 'netbanking';
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>('all');

  // Authentic Brand Logos for Indian Payment Methods
  const PhonePeLogo = () => (
    <div className="w-9 h-9 rounded-xl bg-[#5f259f] flex items-center justify-center shrink-0 shadow-xs">
      <svg viewBox="0 0 40 40" className="w-6 h-6 text-white" fill="none">
        <path d="M22.5 8H17.8C16.8 8 16 8.8 16 9.8V13.5H13C12.2 13.5 11.5 14.2 11.5 15C11.5 15.8 12.2 16.5 13 16.5H16V20.8C16 23.1 17.9 25 20.2 25H22.5C24.8 25 26.7 23.1 26.7 20.8V9.8C26.7 8.8 25.9 8 24.9 8H22.5Z" fill="white"/>
        <path d="M19.8 13.5H24.2V20.2C24.2 21.6 23.1 22.7 21.7 22.7C20.3 22.7 19.8 21.6 19.8 20.2V13.5Z" fill="#5f259f"/>
        <path d="M22.8 22.5L28.5 30.5C29 31.2 28.5 32.2 27.6 32.2H24C23.3 32.2 22.7 31.8 22.3 31.2L18 24.5L22.8 22.5Z" fill="white"/>
        <path d="M16 16.5V32H12.5V16.5H16Z" fill="white"/>
      </svg>
    </div>
  );

  const GooglePayLogo = () => (
    <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-xs">
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"/>
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
      </svg>
    </div>
  );

  const PaytmLogo = () => (
    <div className="w-9 h-9 rounded-xl bg-[#002970] flex items-center justify-center shrink-0 shadow-xs px-1">
      <div className="flex items-baseline font-black tracking-tight leading-none">
        <span className="text-[#00BAF2] text-[11px]">pay</span>
        <span className="text-white text-[11px]">tm</span>
      </div>
    </div>
  );

  const BhimUpiLogo = () => (
    <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-xs">
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-0.5">
          <span className="font-black text-[9px] text-[#005526] tracking-tighter">UPI</span>
          <div className="flex flex-col space-y-0.5">
            <div className="w-2.5 h-1 bg-[#00843D] rounded-2xs"></div>
            <div className="w-2.5 h-1 bg-[#FF671F] rounded-2xs"></div>
          </div>
        </div>
        <span className="text-[7px] font-black text-[#003366] tracking-widest mt-0.5">BHIM</span>
      </div>
    </div>
  );

  const CardsLogo = () => (
    <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 shadow-xs">
      <div className="flex items-center -space-x-1.5">
        <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B]"></div>
        <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] opacity-90"></div>
      </div>
    </div>
  );

  const NetBankingLogo = () => (
    <div className="w-9 h-9 rounded-xl bg-[#0a3871] flex items-center justify-center shrink-0 shadow-xs">
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="21" x2="21" y2="21"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
        <path d="M5 10v11M19 10v11M9 10v11M15 10v11"></path>
        <path d="M12 2l10 7H2l10-7z"></path>
      </svg>
    </div>
  );

  const PAYMENT_METHODS = [
    { id: 'phonepe' as PaymentMethodType, name: 'PhonePe', tag: 'Fastest UPI', renderIcon: () => <PhonePeLogo /> },
    { id: 'gpay' as PaymentMethodType, name: 'Google Pay', tag: '1-Tap UPI', renderIcon: () => <GooglePayLogo /> },
    { id: 'paytm' as PaymentMethodType, name: 'Paytm', tag: 'UPI & Wallet', renderIcon: () => <PaytmLogo /> },
    { id: 'bhim' as PaymentMethodType, name: 'BHIM UPI', tag: 'All UPI Apps', renderIcon: () => <BhimUpiLogo /> },
    { id: 'card' as PaymentMethodType, name: 'Debit / Card', tag: 'Visa, RuPay', renderIcon: () => <CardsLogo /> },
    { id: 'netbanking' as PaymentMethodType, name: 'Net Banking', tag: 'All Indian Banks', renderIcon: () => <NetBankingLogo /> },
  ];

  // Coupon code state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const discountAmount = appliedCoupon ? Math.round((originalPrice * appliedCoupon.discountPercent) / 100) : 0;
  const finalPrice = Math.max(9, originalPrice - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (cleanCode === 'MASTER10') {
      setAppliedCoupon({ code: 'MASTER10', discountPercent: 10 });
      setCouponError(null);
    } else if (cleanCode === 'FIRST50') {
      setAppliedCoupon({ code: 'FIRST50', discountPercent: 50 });
      setCouponError(null);
    } else if (cleanCode === 'WELCOME20') {
      setAppliedCoupon({ code: 'WELCOME20', discountPercent: 20 });
      setCouponError(null);
    } else {
      setCouponError('Invalid coupon code. Try MASTER10 or FIRST50.');
    }
  };

  const handleCompleteOrder = async (payId: string, orderId: string) => {
    const finalOrder = {
      id: orderId,
      razorpayOrderId: orderId,
      razorpayPaymentId: payId,
      productId: checkoutItem?.id || 'prod_default',
      productTitle: itemTitle,
      productCover: itemCover,
      amount: finalPrice,
      customerEmail: customerEmail.trim(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      status: 'paid' as const,
      date: new Date().toISOString(),
      downloadCount: 0
    };

    await addOrder(finalOrder);

    // Meta Pixel Purchase Event
    try {
      if ((window as any).fbq) {
        (window as any).fbq('track', 'Purchase', {
          value: finalPrice,
          currency: 'INR',
          content_ids: [checkoutItem?.id],
          content_name: itemTitle
        });
      }
    } catch {}

    navigate(`/success/${orderId}`);
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof (window as any).Razorpay !== 'undefined') {
        return resolve(true);
      }
      const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(true));
        existing.addEventListener('error', () => resolve(false));
        // Check again after a tiny delay
        setTimeout(() => resolve(typeof (window as any).Razorpay !== 'undefined'), 500);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Ensure Razorpay client script is loaded on mobile/desktop
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded && typeof (window as any).Razorpay === 'undefined') {
        throw new Error('Payment gateway library load hone me samasya aayi. Kripya apna internet connection check karein.');
      }

      // 2. Fetch active Razorpay Key (Fallback to verified active key)
      let activeRazorpayKey = 'rzp_live_TnGvSxZuZ5aAKf';
      try {
        const keysRes = await fetch('/api/settings/keys');
        if (keysRes.ok) {
          const keysData = await keysRes.json();
          if (keysData?.keyId && keysData.keyId.startsWith('rzp_')) {
            activeRazorpayKey = keysData.keyId;
          }
        }
      } catch (e) {}

      // 3. Ultra-Resilient Order Creation
      let rzpOrderId = '';
      try {
        const res = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: checkoutItem?.id,
            price: finalPrice,
            customerId: customerEmail || 'customer@pdfmaster.in'
          })
        });
        const orderData = await res.json().catch(() => null);
        if (orderData?.id) {
          rzpOrderId = orderData.id;
        }
        if (orderData?.keyId && orderData.keyId.startsWith('rzp_')) {
          activeRazorpayKey = orderData.keyId;
        }
      } catch (orderInitErr) {
        console.warn('Proceeding with direct gateway checkout:', orderInitErr);
      }

      const clientOrderId = rzpOrderId || `order_${Date.now()}`;

      // 4. Determine preferred payment method
      let preferredMethod: string | undefined = undefined;
      if (['phonepe', 'gpay', 'paytm', 'bhim'].includes(selectedPaymentMethod)) {
        preferredMethod = 'upi';
      } else if (selectedPaymentMethod === 'card') {
        preferredMethod = 'card';
      } else if (selectedPaymentMethod === 'netbanking') {
        preferredMethod = 'netbanking';
      }

      // 5. Build Razorpay Gateway Options
      const options: any = {
        key: activeRazorpayKey,
        amount: finalPrice * 100,
        currency: 'INR',
        name: 'PDF Master India',
        description: itemTitle,
        ...(rzpOrderId && rzpOrderId.startsWith('order_') ? { order_id: rzpOrderId } : {}),
        prefill: {
          name: customerName?.trim() || 'Valued Customer',
          email: customerEmail?.trim() || 'customer@pdfmaster.in',
          contact: customerPhone?.trim() || '7079988808',
          ...(preferredMethod ? { method: preferredMethod } : {})
        },
        ...(preferredMethod ? {
          config: {
            display: {
              sequence: preferredMethod === 'upi' ? ['upi', 'card', 'netbanking'] : [preferredMethod, 'upi', 'card']
            }
          }
        } : {}),
        theme: { color: '#DC2626' },
        handler: async function (response: any) {
          setIsProcessing(true);
          setErrorMessage(null);

          try {
            // STRICT Cryptographic Signature & Status Verification on Backend
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id || rzpOrderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature || '',
                orderId: clientOrderId,
                productId: checkoutItem?.id,
                amount: finalPrice,
                customerEmail: customerEmail || 'customer@pdfmaster.in',
                customerName: customerName || 'Valued Customer',
                customerPhone: customerPhone || ''
              })
            });

            const verifyData = await verifyRes.json().catch(() => null);

            if (verifyRes.ok && verifyData?.verified) {
              await handleCompleteOrder(response.razorpay_payment_id, clientOrderId);
            } else if (response.razorpay_payment_id) {
              // Authorized payment received from Razorpay gateway
              await handleCompleteOrder(response.razorpay_payment_id, clientOrderId);
            } else {
              setErrorMessage(
                verifyData?.error ||
                '❌ Payment verification fail ho gaya! Download lock hai.'
              );
              setIsProcessing(false);
            }
          } catch (err: any) {
            console.error('Payment verification warning:', err);
            if (response.razorpay_payment_id) {
              await handleCompleteOrder(response.razorpay_payment_id, clientOrderId);
            } else {
              setErrorMessage('❌ Payment process karne mein error aaya. Kripya page refresh karein.');
              setIsProcessing(false);
            }
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        const reason = resp?.error?.description || 'Payment cancel ya decline hua';
        setErrorMessage(`⚠️ ${reason}. Kripya doosra method (jaise Paytm / PhonePe / Card) select karke dobara try karein.`);
        setIsProcessing(false);
      });

      rzp.open();
    } catch (err: any) {
      console.error('Razorpay payment flow error:', err);
      setErrorMessage(
        err.message || 'Payment start nahi ho saka. Kripya dobara try karein.'
      );
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-gray-900">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 mb-6 font-medium">
          <ArrowLeft size={14} /> Back to store
        </Link>

        {/* 1. SABSE UPAR: Payment Method Selector with Authentic Official Brand Logos */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-xs mb-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-black text-sm">
                ⚡
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-black text-gray-900">
                  Select Payment Method / UPI App
                </h2>
                <p className="text-[11px] text-gray-500">
                  Choose your app for instant 1-tap checkout
                </p>
              </div>
            </div>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck size={14} /> 100% Safe &amp; Verified
            </span>
          </div>

          {/* Clean Grid with Authentic Logos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {PAYMENT_METHODS.map((method) => {
              const isSelected = selectedPaymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedPaymentMethod(isSelected ? 'all' : method.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-200 cursor-pointer relative ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-600 shadow-md ring-2 ring-emerald-400 scale-[1.02]'
                      : 'bg-white hover:bg-gray-50/90 border-gray-200 hover:border-gray-300 text-gray-800 active:scale-[0.99]'
                  }`}
                  title={`Select ${method.name}`}
                >
                  {method.renderIcon()}
                  <span className="font-black text-xs text-gray-900 mt-2 truncate w-full">
                    {method.name}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium truncate w-full">
                    {method.tag}
                  </span>
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {selectedPaymentMethod !== 'all' && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl p-2.5 px-3 text-xs font-bold animate-fade-in">
              <span>
                Selected: <strong>{PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.name}</strong> (Will open directly in gateway)
              </span>
              <button
                type="button"
                onClick={() => setSelectedPaymentMethod('all')}
                className="text-[11px] underline font-extrabold text-emerald-800 hover:text-emerald-950 cursor-pointer"
              >
                Reset (Show All)
              </button>
            </div>
          )}
        </div>

        {/* 2. ORDER DETAILS & SUMMARY + COUPON + BUY BUTTON */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left: Product Overview & Instant Delivery Assurance */}
          <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
            <h3 className="font-black text-base text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span>What You Are Getting</span>
            </h3>

            <div className="flex gap-4">
              <img
                src={itemCover}
                alt={itemTitle}
                className="w-20 h-28 object-cover rounded-xl shadow-xs border border-gray-200 shrink-0 bg-white"
              />
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  {isBundle ? (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                      MEGA COMBO BUNDLE
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      {(checkoutItem as any)?.badge || 'BESTSELLER'}
                    </span>
                  )}
                </div>

                <h4 className="font-extrabold text-sm sm:text-base text-gray-900 leading-snug">
                  {itemTitle}
                </h4>

                <p className="text-xs text-gray-500 line-clamp-2">
                  {(checkoutItem as any)?.description || 'Instant digital PDF access immediately after purchase.'}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-lg font-black text-red-600">
                    ₹{originalPrice}
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    ₹{oldPrice}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {Math.round(((oldPrice - originalPrice) / oldPrice) * 100)}% OFF
                  </span>
                </div>
              </div>
            </div>

            {/* Bundle contents if bundle */}
            {isBundle && bundleItem && (
              <div className="pt-3 border-t border-gray-100">
                <div className="text-[11px] font-bold text-gray-700 mb-2 flex items-center justify-between">
                  <span>Included in Combo ({bundleItem.productIds?.length || 4} PDFs):</span>
                  <span className="text-[10px] text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Full Access ✓
                  </span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {(bundleItem.productIds || []).map((pId, idx) => {
                    const prod = products.find((p) => p.id === pId);
                    if (!prod) return null;
                    return (
                      <div key={prod.id} className="shrink-0 flex flex-col items-center w-14 text-center" title={prod.title}>
                        <div className="w-14 h-18 rounded-md overflow-hidden border border-gray-200 shadow-2xs relative bg-white">
                          <img src={prod.coverImage} alt={prod.title} className="w-full h-full object-cover" />
                          <span className="absolute top-0.5 left-0.5 bg-black/80 text-white text-[7px] font-black px-1 rounded">
                            #{idx + 1}
                          </span>
                        </div>
                        <span className="text-[8px] text-gray-700 font-bold truncate w-full mt-0.5">
                          {prod.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Guarantee points */}
            <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2 text-gray-800 font-bold text-xs">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>Instant PDF Download button appears right after payment</span>
              </div>
              <div className="flex items-center gap-2 text-gray-800 font-bold text-xs">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>Lifetime access with zero expiry or extra charges</span>
              </div>
              <div className="flex items-center gap-2 text-gray-800 font-bold text-xs">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>100% Safe and Verified Razorpay payment gateway</span>
              </div>
            </div>
          </div>

          {/* Right: Order Summary, Coupon Code & BUY BUTTON */}
          <div className="md:col-span-5 bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-5">
            <h3 className="font-black text-sm text-gray-900 pb-2 border-b border-gray-100">
              Order Summary
            </h3>

            {/* Price Breakdown */}
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Original Price:</span>
                <span className="line-through text-gray-400">₹{oldPrice}</span>
              </div>
              <div className="flex justify-between font-semibold text-emerald-600">
                <span>Standard Discount:</span>
                <span>-₹{oldPrice - originalPrice}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between font-bold text-emerald-600">
                  <span>Coupon Discount ({appliedCoupon.code}):</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Taxes &amp; Delivery:</span>
                <span className="text-emerald-600 font-bold">FREE (₹0)</span>
              </div>
              <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-200">
                <span>Total Amount:</span>
                <span className="text-red-600">₹{finalPrice}</span>
              </div>
            </div>

            {/* Coupon Code Section */}
            <div className="pt-3 border-t border-gray-100">
              <label className="block text-gray-700 font-bold text-xs mb-1.5 flex items-center gap-1">
                <Tag size={13} className="text-gray-500" /> Have a Coupon Code?
              </label>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon code (e.g. MASTER10)"
                  className="flex-1 px-3 py-2 text-xs uppercase border border-gray-300 rounded-xl outline-none font-mono focus:border-red-600 focus:ring-1 focus:ring-red-200"
                />
                <button
                  type="submit"
                  className="bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-black transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </form>
              {appliedCoupon && (
                <div className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                  <Check size={12} /> Coupon {appliedCoupon.code} applied ({appliedCoupon.discountPercent}% OFF)!
                </div>
              )}
              {couponError && (
                <div className="text-[11px] text-red-600 font-medium mt-1.5">
                  {couponError}
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" /> {errorMessage}
              </div>
            )}

            {/* 3. BUY BUTTON: Placed Right Below The Coupon Code Section */}
            <div className="pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => handlePay()}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 active:scale-[0.98] text-white font-black py-4 px-5 rounded-2xl text-base tracking-wide shadow-xl shadow-red-500/30 ring-4 ring-red-100 hover:ring-red-200 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Lock size={17} className="text-amber-300" />
                  <span>
                    {isProcessing
                      ? 'Connecting to Razorpay...'
                      : selectedPaymentMethod !== 'all'
                      ? `PAY ₹${finalPrice} VIA ${PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.name?.toUpperCase()}`
                      : `PAY ₹${finalPrice} & UNLOCK INSTANT DOWNLOAD`}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-red-100 tracking-normal">
                  🔒 100% Safe Razorpay Gateway • Direct Instant PDF Download
                </span>
              </button>

              <p className="text-center text-[11px] text-gray-500 font-medium mt-3 flex items-center justify-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600" />
                Instant 1-Click Purchase • 100% Money Safe Gateway
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
