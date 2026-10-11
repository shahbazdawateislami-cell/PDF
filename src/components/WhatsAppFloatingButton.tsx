import React, { useState } from 'react';
import { Phone, X } from 'lucide-react';

// Official, Realistic WhatsApp Brand Vector Icon
export const RealWhatsAppIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 28, 
  className = "text-white" 
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    className={`drop-shadow-xs shrink-0 ${className}`}
    aria-hidden="true"
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

export const WhatsAppFloatingButton: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const phoneNumber = '7079988808';
  const formattedPhone = '+91 70799 88808';
  const whatsappUrl = `https://wa.me/91${phoneNumber}?text=Hi%20PDF%20Master%20India,%20I%20have%20a%20question%20about%20a%20PDF%20guide`;

  return (
    <aside 
      aria-label="WhatsApp Support Floating Widget"
      className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2.5 select-none"
    >
      {/* Quick Info Tooltip / Popup */}
      {showTooltip && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200/90 p-4 max-w-xs text-xs text-gray-800 space-y-2.5 animate-scale-in mr-1">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse"></span>
              <span className="font-extrabold text-gray-900 flex items-center gap-1.5">
                <RealWhatsAppIcon size={16} className="text-[#25D366]" />
                <span>WhatsApp Support</span>
              </span>
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
            Kisi bhi PDF book, download link ya payment ke related foran madad ke liye WhatsApp karein:
          </p>

          <div className="bg-emerald-50/80 rounded-xl p-2.5 border border-emerald-200 font-bold text-emerald-950 flex items-center justify-between">
            <span className="text-xs">📞 {formattedPhone}</span>
            <span className="text-[10px] bg-[#25D366] text-white px-2 py-0.5 rounded-full font-black shadow-xs">
              Online 24/7
            </span>
          </div>

          <div className="flex gap-2 pt-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-extrabold py-2 px-3 rounded-xl text-center flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#25D366]/25"
            >
              <RealWhatsAppIcon size={16} className="text-white" />
              <span>Open Chat</span>
            </a>
            <a
              href={`tel:+91${phoneNumber}`}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-3 rounded-xl text-center flex items-center justify-center gap-1 transition-colors"
              title="Call Helpline"
            >
              <Phone size={14} />
              <span>Call</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <div className="flex items-center gap-2.5">
        {/* Number badge on hover / desktop */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-2 bg-white/95 hover:bg-white text-gray-800 px-3.5 py-2 rounded-full shadow-xl border border-gray-200/90 text-xs font-black transition-all hover:scale-105 group"
        >
          <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping"></span>
          <span>WhatsApp: <span className="text-[#25D366] font-mono group-hover:underline">{formattedPhone}</span></span>
        </a>

        {/* Real 3D-styled Realistic WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setShowTooltip(true)}
          aria-label={`Chat on WhatsApp with +91 ${phoneNumber}`}
          title="Chat with official PDF Master Support on WhatsApp"
          className="group relative bg-gradient-to-tr from-[#20ba59] via-[#25D366] to-[#2ee272] active:scale-95 text-white w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-[0_12px_28px_rgba(37,211,102,0.45),0_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-center transition-all duration-300 hover:scale-110 ring-4 ring-[#25D366]/30 hover:ring-[#25D366]/60 cursor-pointer"
        >
          {/* Subtle glossy top highlight reflection */}
          <span className="absolute top-1 inset-x-3 h-3 bg-white/20 rounded-full blur-[1px] pointer-events-none" />

          {/* Real Official WhatsApp Brand Vector Icon */}
          <RealWhatsAppIcon size={32} className="text-white group-hover:scale-110 transition-transform duration-300" />

          {/* Green active status indicator dot */}
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full flex items-center justify-center shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
          </span>
        </a>
      </div>
    </aside>
  );
};
