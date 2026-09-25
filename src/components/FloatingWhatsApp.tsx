import React from 'react';
import { MessageCircle } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const handleClick = () => {
    const text = 'Hello Hotel O Avondale Jaipur! I am looking for accommodation near Jaipur Airport / Sitapura. Could you please share room rates and availability?';
    const url = `https://wa.me/918209940455?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-5 z-40">
      <button
        onClick={handleClick}
        className="group relative flex items-center gap-2 p-3 sm:px-4 sm:py-3 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Chat with Hotel O Avondale on WhatsApp"
        title="WhatsApp Front Desk Assistance"
      >
        <MessageCircle className="w-6 h-6 fill-white text-[#25D366]" />
        <span className="hidden sm:inline text-xs font-bold tracking-wide uppercase">
          WhatsApp Desk
        </span>

        {/* Pulse beacon */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white" />
        </span>
      </button>
    </div>
  );
};
