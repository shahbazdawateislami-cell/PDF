import React, { useState } from 'react';
import { ShieldCheck, Download, RefreshCw, Headphones, Mail, Phone, MapPin, X } from 'lucide-react';

export const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'contact' | 'faq' | 'refund' | 'privacy' | 'terms' | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      {/* 4 Trust Badges Section */}
      <div className="border-b border-gray-100 bg-gray-50/70">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="font-bold text-xs md:text-sm text-gray-900">Secure Payments</h4>
              <p className="text-[11px] text-gray-500">Razorpay Integrated (UPI & Cards)</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
              <Download size={20} />
            </div>
            <div>
              <h4 className="font-bold text-xs md:text-sm text-gray-900">Instant Digital Delivery</h4>
              <p className="text-[11px] text-gray-500">Get PDFs Immediately</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <RefreshCw size={20} />
            </div>
            <div>
              <h4 className="font-bold text-xs md:text-sm text-gray-900">Money Back Guarantee</h4>
              <p className="text-[11px] text-gray-500">7 Days Refund Policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Headphones size={20} />
            </div>
            <div>
              <h4 className="font-bold text-xs md:text-sm text-gray-900">24/7 Support</h4>
              <p className="text-[11px] text-gray-500">We Are Here to Help</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="text-xl font-black text-gray-900 tracking-tight leading-none mb-2">
            PDF Master <span className="text-orange-500">India</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed mb-4">
            India's #1 digital marketplace for high-yield, curated PDF notes, study materials, and practical business guides.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p className="flex items-center gap-2">
              <Mail size={14} className="text-gray-400" /> support@pdfmaster.in
            </p>
            <p className="flex items-center gap-2">
              <Phone size={14} className="text-gray-400" /> +91 98765 43210 (WhatsApp)
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 mb-3">Popular Categories</h4>
          <ul className="text-xs text-gray-600 space-y-2">
            <li><a href="/all?cat=AI+Tools" className="hover:text-orange-600">AI Tools & Prompts</a></li>
            <li><a href="/all?cat=Study+Material" className="hover:text-orange-600">Student Study Notes</a></li>
            <li><a href="/all?cat=Business" className="hover:text-orange-600">Small Business Ideas</a></li>
            <li><a href="/all?cat=English+Learning" className="hover:text-orange-600">English Speaking Courses</a></li>
            <li><a href="/all?cat=Islamic+Books" className="hover:text-orange-600">Islamic Knowledge Books</a></li>
          </ul>
        </div>

        {/* Support & Policies */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 mb-3">Customer Care</h4>
          <ul className="text-xs text-gray-600 space-y-2">
            <li>
              <button onClick={() => setActiveModal('contact')} className="hover:text-orange-600">
                Contact Us
              </button>
            </li>
            <li>
              <button onClick={() => setActiveModal('faq')} className="hover:text-orange-600">
                Frequently Asked Questions
              </button>
            </li>
            <li>
              <button onClick={() => setActiveModal('refund')} className="hover:text-orange-600">
                Refund & Cancellation Policy
              </button>
            </li>
            <li>
              <button onClick={() => setActiveModal('privacy')} className="hover:text-orange-600">
                Privacy Policy
              </button>
            </li>
            <li>
              <button onClick={() => setActiveModal('terms')} className="hover:text-orange-600">
                Terms & Conditions
              </button>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 mb-3">Stay Updated</h4>
          <p className="text-xs text-gray-500 mb-3">
            Subscribe to receive new PDF releases, exclusive discounts, and free study worksheets.
          </p>
          <form onSubmit={handleSubscribe} className="space-y-2">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold py-2 rounded-lg text-xs transition-colors"
            >
              {subscribed ? 'Subscribed Successfully! 🎉' : 'Subscribe Now'}
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-gray-100 py-4 text-center text-xs text-gray-500">
        © 2026 PDF Master India. All rights reserved. 100% Secure Razorpay Checkout.
      </div>

      {/* Policy Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="font-bold text-base text-gray-900">
                {activeModal === 'contact' && 'Contact Us - PDF Master India'}
                {activeModal === 'faq' && 'Frequently Asked Questions'}
                {activeModal === 'refund' && 'Refund & Cancellation Policy'}
                {activeModal === 'privacy' && 'Privacy Policy'}
                {activeModal === 'terms' && 'Terms & Conditions'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="text-xs text-gray-600 space-y-3 leading-relaxed">
              {activeModal === 'contact' && (
                <>
                  <p>Have questions about your order or need assistance downloading your PDF? Our support team is here to assist you.</p>
                  <div className="bg-gray-50 p-4 rounded-xl space-y-2 font-medium">
                    <p>📧 Email: support@pdfmaster.in</p>
                    <p>💬 WhatsApp Support: +91 98765 43210 (10:00 AM - 8:00 PM IST)</p>
                    <p>📍 Location: New Delhi, India</p>
                  </div>
                </>
              )}

              {activeModal === 'faq' && (
                <div className="space-y-3">
                  <div>
                    <h5 className="font-bold text-gray-900">1. How do I get my PDF after payment?</h5>
                    <p>Immediately after successful Razorpay payment, you will see a green "Download PDF" button on screen, and the book is permanently added to your "My Purchases" tab.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900">2. Which payment methods are accepted?</h5>
                    <p>We support all Indian payment options including Google Pay, PhonePe, Paytm, BHIM UPI, Netbanking, Credit/Debit cards, and Wallets.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900">3. Can I read the PDF on multiple devices?</h5>
                    <p>Yes! You can download and read the file on your mobile, tablet, iPad, or laptop.</p>
                  </div>
                </div>
              )}

              {activeModal === 'refund' && (
                <>
                  <p>We offer a hassle-free 7-day money-back guarantee. If the PDF guide did not meet the description or you experienced technical delivery issues, email support@pdfmaster.in with your Order ID for a full refund processed back to your original payment method within 3-5 business days.</p>
                </>
              )}

              {activeModal === 'privacy' && (
                <>
                  <p>Your privacy is important to us. We only collect the name, email, and phone number necessary to process your Razorpay order and deliver your digital PDF files. We never sell or share your information with third-party advertisers.</p>
                </>
              )}

              {activeModal === 'terms' && (
                <>
                  <p>All digital products sold on PDF Master India are for personal study and professional reference. Unauthorized re-selling, re-distribution, or illegal file sharing is prohibited under Indian Copyright laws.</p>
                </>
              )}
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="mt-6 w-full bg-gray-900 text-white font-bold py-2 rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};
