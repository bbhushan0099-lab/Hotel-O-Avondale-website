import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface MobileStickyBarProps {
  onBookNow: () => void;
}

export const MobileStickyBar: React.FC<MobileStickyBarProps> = ({ onBookNow }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0e1117]/95 border-t border-[#252c3c] backdrop-blur-md px-4 py-2.5 flex items-center justify-between shadow-2xl">
      <div>
        <div className="text-[10px] text-[#8e95a5] uppercase tracking-wider">
          Direct Booking Rates
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-bold text-[#d4af37] tabular-nums">
            From ₹2,099
          </span>
          <span className="text-[10px] text-[#717887]">/ night</span>
        </div>
      </div>

      <button
        onClick={onBookNow}
        className="px-5 py-2 bg-[#d4af37] hover:bg-[#e2c153] text-[#0c0e12] font-bold text-xs uppercase tracking-wider rounded-lg shadow-md shadow-[#d4af37]/20 flex items-center gap-1.5 cursor-pointer transform active:scale-95"
      >
        <span>Reserve Stay</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
