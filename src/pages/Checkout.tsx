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

  const PAYMENT_METHODS: { id: PaymentMethodType; name: string; tag: string; icon: string; subtitle: string }[] = [
    { id: 'phonepe', name: 'PhonePe', tag: 'Fastest UPI', icon: '🟣', subtitle: 'PhonePe App / QR' },
    { id: 'gpay', name: 'Google Pay', tag: '1-Tap UPI', icon: '🔵', subtitle: 'GPay App / UPI ID' },
    { id: 'paytm', name: 'Paytm', tag: 'UPI & Wallet', icon: '🔷', subtitle: 'Paytm UPI / Wallet' },
    { id: 'bhim', name: 'BHIM UPI', tag: 'Any Bank', icon: '🟢', subtitle: 'Any UPI App / ID' },
    { id: 'card', name: 'Debit / Card', tag: 'Instant', icon: '💳', subtitle: 'Visa, Master, RuPay' },
    { id: 'netbanking', name: 'Net Banking', tag: 'All Banks', icon: '🏦', subtitle: 'SBI, HDFC, ICICI, etc.' },
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

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    const generatedOrderId = `order_${Date.now()}`;

    try {
      // 1. Create server-side Razorpay order
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: checkoutItem?.id,
          price: finalPrice,
          customerId: customerEmail || 'guest'
        })
      });

      const orderData = await res.json().catch(() => null);

      if (!res.ok || !orderData) {
        throw new Error(orderData?.details || orderData?.error || 'Failed to initialize order on server');
      }

      const rzpOrderId = orderData.id;

      if (!rzpOrderId) {
        throw new Error('No order ID received from Razorpay');
      }

      // 2. Fetch active Razorpay Key
      let activeRazorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
      try {
        const keysRes = await fetch('/api/settings/keys');
        if (keysRes.ok) {
          const keysData = await keysRes.json();
          if (keysData?.keyId) {
            activeRazorpayKey = keysData.keyId;
          }
        }
      } catch (e) {}

      if (!activeRazorpayKey) {
        setErrorMessage('⚠️ Razorpay Key ID configure nahi hai! Kripya Admin Panel me API Key daalein.');
        setIsProcessing(false);
        return;
      }

      // 3. Launch Razorpay Checkout Modal
        let preferredMethod: string | undefined = undefined;
        if (['phonepe', 'gpay', 'paytm', 'bhim'].includes(selectedPaymentMethod)) {
          preferredMethod = 'upi';
        } else if (selectedPaymentMethod === 'card') {
          preferredMethod = 'card';
        } else if (selectedPaymentMethod === 'netbanking') {
          preferredMethod = 'netbanking';
        }

      if (typeof (window as any).Razorpay !== 'undefined') {
        const options: any = {
          key: activeRazorpayKey,
          amount: finalPrice * 100,
          currency: 'INR',
          name: 'PDF Master India',
          description: itemTitle,
          order_id: rzpOrderId,
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone,
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

            // 4. STRICT Cryptographic Signature Verification on Backend
            try {
              const verifyRes = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: rzpOrderId,
                  productId: checkoutItem?.id,
                  amount: finalPrice,
                  customerEmail: customerEmail || 'customer@pdfmaster.in',
                  customerName: customerName || 'Valued Reader',
                  customerPhone: customerPhone || ''
                })
              });

              const verifyData = await verifyRes.json();

              if (verifyRes.ok && verifyData.verified) {
                // Payment verified cryptographically! Safe to unlock download.
                await handleCompleteOrder(response.razorpay_payment_id, rzpOrderId);
              } else {
                setErrorMessage(
                  verifyData.error ||
                  '❌ Payment verification fail ho gaya! Jab tak payment verify nahi hota, download button lock rahega.'
                );
                setIsProcessing(false);
              }
            } catch (err: any) {
              console.error('Payment verification failed:', err);
              setErrorMessage('❌ Payment verify karne me error aaya. Download lock hai.');
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              setErrorMessage('Payment poora nahi hua ya cancel kar diya gaya. Download unlock karne ke liye verified payment zaroori hai.');
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          const reason = resp?.error?.description || 'Payment failed or declined by bank';
          setErrorMessage(`❌ Payment fail ho gaya: ${reason}. Download lock hai.`);
          setIsProcessing(false);
        });

        rzp.open();
        return;
      } else {
        throw new Error('Razorpay payment library load nahi ho saki. Kripya page refresh karein.');
      }
    } catch (err: any) {
      console.error('Razorpay payment flow error:', err);
      setErrorMessage(
        err.message || 'Payment start nahi ho saka. Kripya Admin Panel me apni Razorpay API Keys check karein.'
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

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left: Customer Info Form */}
          <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-black text-sm">
                  ⚡
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900">
                    Express 1-Click Checkout
                  </h2>
                  <p className="text-[11px] text-gray-500">
                    فوری اور آسان خریداری • No complicated forms required
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <ShieldCheck size={14} /> 100% Safe &amp; Verified
              </span>
            </div>

            <form onSubmit={handlePay} className="space-y-5 text-xs">
              {/* Optional Quick Info (Simple & Fast) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1 text-[11px]">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs outline-none focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1 text-[11px] flex items-center justify-between">
                    <span>Phone / WhatsApp (Optional)</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">For WhatsApp PDF Link</span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 7079988808"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs outline-none focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
                  />
                </div>
              </div>

              {/* Supported Indian payment methods chips (Fully Functional Selector) */}
              <div className="p-4 bg-gradient-to-br from-amber-50/90 via-orange-50/70 to-red-50/30 rounded-2xl border border-orange-200/90 space-y-3">
                <div className="font-extrabold text-gray-900 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-gray-900">
                    <CreditCard size={15} className="text-orange-600" />
                    <span>Choose Payment Method / UPI App:</span>
                  </span>
                  <span className="text-emerald-700 font-black text-[10px] bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    Instant 1-Tap UPI
                  </span>
                </div>

                {/* Fully Functional Interactive Payment Method Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = selectedPaymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedPaymentMethod(isSelected ? 'all' : method.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300 scale-[1.02]'
                            : 'bg-white hover:bg-orange-50/80 border-orange-200/80 text-gray-800 shadow-2xs hover:border-orange-300 active:scale-[0.99]'
                        }`}
                        title={`Select ${method.name} for instant payment`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base shrink-0">{method.icon}</span>
                          <div className="min-w-0">
                            <div className={`font-black text-xs truncate leading-tight ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                              {method.name}
                            </div>
                            <div className={`text-[10px] truncate leading-tight ${isSelected ? 'text-emerald-100 font-medium' : 'text-gray-500'}`}>
                              {method.subtitle}
                            </div>
                          </div>
                        </div>

                        {isSelected ? (
                          <span className="shrink-0 w-4 h-4 rounded-full bg-white text-emerald-700 flex items-center justify-center text-[10px] font-black shadow-2xs">
                            ✓
                          </span>
                        ) : (
                          <span className="shrink-0 text-[9px] bg-orange-100/80 text-orange-800 font-bold px-1.5 py-0.5 rounded">
                            {method.tag}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Active Selection Live Feedback */}
                {selectedPaymentMethod !== 'all' ? (
                  <div className="flex items-center justify-between bg-emerald-100/80 border border-emerald-300/80 text-emerald-950 rounded-xl p-2.5 px-3 text-[11px] font-bold animate-fade-in shadow-2xs">
                    <span className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping shrink-0"></span>
                      <span className="truncate">
                        Selected: <strong>{PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.name}</strong> • Direct app launch enabled
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('all')}
                      className="text-[10px] underline font-extrabold text-emerald-900 hover:text-emerald-950 shrink-0 ml-2 cursor-pointer"
                    >
                      Reset (Show All)
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1.5 pt-0.5">
                    <span>💡 Upar diye gaye kisi bhi app (PhonePe, GPay, Paytm ya Card) par click karein, ya direct neeche button dabayein.</span>
                  </p>
                )}
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" /> {errorMessage}
                </div>
              )}

              {/* BIG, HIGHLIGHTED, HIGH-CONVERSION PURCHASE BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 active:scale-[0.98] text-white font-black py-4.5 sm:py-5 px-6 rounded-2xl text-base sm:text-lg tracking-wide shadow-xl shadow-red-500/30 ring-4 ring-red-100 hover:ring-red-200 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <Lock size={18} className="text-amber-300" />
                    <span>
                      {isProcessing
                        ? 'Connecting to Razorpay...'
                        : selectedPaymentMethod !== 'all'
                        ? `PAY ₹${finalPrice} VIA ${PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.name?.toUpperCase()}`
                        : `PAY ₹${finalPrice} & UNLOCK INSTANT DOWNLOAD`}
                    </span>
                    <Sparkles size={18} className="text-amber-300 group-hover:rotate-12 transition-transform" />
                  </div>
                  <span className="text-[11px] font-bold text-red-100 tracking-normal">
                    🔒 100% Safe Razorpay Gateway • Direct Instant PDF Download Unlocked
                  </span>
                </button>

                <p className="text-center text-[11px] text-gray-500 font-medium mt-3 flex items-center justify-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  No sign-up or lengthy forms needed • 100% money safe Razorpay gateway
                </p>
              </div>
            </form>
          </div>

          {/* Right: Order Summary & Coupon Code */}
          <div className="md:col-span-5 bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-5">
            <h3 className="font-black text-sm text-gray-900 pb-2 border-b border-gray-100">
              Order Summary
            </h3>

            <div className="flex gap-3">
              <img
                src={itemCover}
                alt=""
                className="w-16 h-22 object-cover rounded-xl shadow-xs border border-gray-200 shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  {isBundle ? (
                    <span className="bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                      MEGA BUNDLE
                    </span>
                  ) : (
                    <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                      DIGITAL PDF
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-xs text-gray-900 line-clamp-2 leading-snug">
                  {itemTitle}
                </h4>
                <div className="text-[10px] text-emerald-600 font-bold mt-1">
                  ✓ Lifetime Access &amp; Free Updates
                </div>
              </div>
            </div>

            {/* If Bundle, show all included book covers */}
            {isBundle && bundleItem && (
              <div className="mt-2.5 pt-2.5 border-t border-gray-100">
                <div className="text-[11px] font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>Is Combo Mein Shaamil Kitabein ({bundleItem.productIds?.length || 4} PDFs):</span>
                  <span className="text-[10px] text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Sabhi Ka Access ✓
                  </span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {(bundleItem.productIds || []).map((pId, idx) => {
                    const prod = products.find((p) => p.id === pId);
                    if (!prod) return null;
                    return (
                      <div key={prod.id} className="shrink-0 flex flex-col items-center w-12 text-center" title={prod.title}>
                        <div className="w-12 h-16 rounded-md overflow-hidden border border-gray-200 shadow-2xs relative bg-white">
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

            {/* Coupon Code Section */}
            <div className="pt-2 border-t border-gray-100">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon code (e.g. MASTER10)"
                  className="flex-1 px-3 py-1.5 text-xs uppercase border border-gray-300 rounded-lg outline-none font-mono"
                />
                <button
                  type="submit"
                  className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-black transition-colors"
                >
                  Apply
                </button>
              </form>
              {appliedCoupon && (
                <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                  <Check size={12} /> Coupon {appliedCoupon.code} applied ({appliedCoupon.discountPercent}% OFF)!
                </div>
              )}
              {couponError && (
                <div className="text-[11px] text-red-600 mt-1">
                  {couponError}
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 text-xs pt-3 border-t border-gray-100 text-gray-600">
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
