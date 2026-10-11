import React, { useState } from 'react';
import { MessageCircle, Phone, X } from 'lucide-react';

export const WhatsAppFloatingButton: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const phoneNumber = '7079988808';
  const formattedPhone = '+91 70799 88808';
  const whatsappUrl = `https://wa.me/91${phoneNumber}?text=Hi%20PDF%20Master%20India,%20I%20have%20a%20question%20about%20a%20PDF%20guide`;

  return (
    <aside 
      aria-label="WhatsApp Support Floating Widget"
      className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2"
    >
      {/* Quick Info Tooltip / Popup */}
      {showTooltip && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200/90 p-4 max-w-xs text-xs text-gray-800 space-y-2.5 animate-scale-in mr-1">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-gray-900">WhatsApp Support Active</span>
            </div>
            <button 
              onClick={() => setShowTooltip(false)}
              className="text-gray-400 hover:text-gray-600 p-0.5"
              aria-label="Close tooltip"
            >
              <X size={14} />
            </button>
          </div>
          
          <p className="text-[11px] text-gray-600 leading-snug">
            کسی بھی پی ڈی ایف، ڈاؤن لوڈ یا آرڈر کے متعلق فوری مدد کے لیے واٹس ایپ کریں:
          </p>

          <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-200 font-bold text-emerald-900 flex items-center justify-between">
            <span className="text-xs">📞 {formattedPhone}</span>
            <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-semibold">24/7 Helpline</span>
          </div>

          <div className="flex gap-2 pt-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <MessageCircle size={14} className="fill-white" /> Open Chat
            </a>
            <a
              href={`tel:+91${phoneNumber}`}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-3 rounded-xl text-center flex items-center justify-center gap-1 transition-colors"
              title="Call Helpline"
            >
              <Phone size={14} /> Call
            </a>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <div className="flex items-center gap-2">
        {/* Number badge on hover / desktop */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-2 bg-white/95 hover:bg-white text-emerald-800 px-3 py-2 rounded-full shadow-lg border border-emerald-200 text-xs font-black transition-all hover:scale-105"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>WhatsApp: <span className="text-emerald-700">{formattedPhone}</span></span>
        </a>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setShowTooltip(true)}
          aria-label={`Chat on WhatsApp with +91 ${phoneNumber}`}
          className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white p-3.5 sm:p-4 rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 ring-4 ring-emerald-300/40"
        >
          <MessageCircle size={26} className="fill-white" />
        </a>
      </div>
    </aside>
  );
};
