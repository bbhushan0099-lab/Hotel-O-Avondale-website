import React, { useState } from 'react';
import { hotelImages } from '../assets/images';
import { Calendar, Users, Clock, ArrowRight, ShieldCheck, MapPin, Sparkles } from 'lucide-react';

interface HeroProps {
  onSearch: (criteria: {
    checkIn: string;
    checkOut: string;
    slot: string;
    adults: number;
    roomType?: string;
  }) => void;
  onOpenBooking: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch, onOpenBooking }) => {
  // Default check-in: today, check-out: tomorrow
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(tomorrowStr);
  const [slot, setSlot] = useState('12:00 PM (Standard Check-in)');
  const [adults, setAdults] = useState(2);
  const [roomType, setRoomType] = useState('all');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      checkIn,
      checkOut,
      slot,
      adults,
      roomType: roomType === 'all' ? undefined : roomType,
    });
    const roomsEl = document.getElementById('rooms');
    if (roomsEl) {
      roomsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Image with Cinematic Contrast Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={hotelImages.heroFacade}
          alt="Hotel O Avondale Jaipur Facade and Portico"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
        />
        {/* Layered dark luxury scrims */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0d10]/95 via-[#0b0d10]/80 to-[#0b0d10]/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d10] via-transparent to-[#0b0d10]/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.12),transparent_60%)]" />
      </div>

      <div className="relative z-10 max-w-6xl w-full mx-auto text-center mt-6">
        {/* Trust Location Kicker */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#161a22]/80 border border-[#2c3240] backdrop-blur-sm text-xs text-[#d4af37] font-medium tracking-wide mb-6">
          <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Sitapura Industrial Area, Jaipur · 10 Mins to International Airport (JAI)</span>
        </div>

        {/* Primary Headline */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.15] text-balance">
          Bespoke Comfort & Quiet Elegance in Jaipur
        </h1>

        {/* Editorial Subheading */}
        <p className="mt-5 text-base sm:text-lg text-[#c4c0b5] max-w-2xl mx-auto font-normal leading-relaxed text-balance">
          Experience an elevated hospitality standard near Jaipur International Airport & JECC. Designed for business leaders, airport transit travelers, and luxury holiday seekers.
        </p>

        {/* Direct Booking Widget Box */}
        <div className="mt-10 bg-[#12151c]/95 border border-[#2b3140] rounded-xl p-4 sm:p-5 md:p-6 backdrop-blur-xl shadow-2xl max-w-4xl mx-auto text-left">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Check-in */}
              <div className="bg-[#191e27] border border-[#29303e] rounded-lg p-3 hover:border-[#d4af37]/50 transition-colors">
                <label className="block text-[11px] font-semibold tracking-wider text-[#9ba1b0] uppercase mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                  Check-in Date
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer [color-scheme:dark]"
                  required
                />
              </div>

              {/* Check-out */}
              <div className="bg-[#191e27] border border-[#29303e] rounded-lg p-3 hover:border-[#d4af37]/50 transition-colors">
                <label className="block text-[11px] font-semibold tracking-wider text-[#9ba1b0] uppercase mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                  Check-out Date
                </label>
                <input
                  type="date"
                  min={checkIn || todayStr}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer [color-scheme:dark]"
                  required
                />
              </div>

              {/* Time-Slot Blocking / Selection */}
              <div className="bg-[#191e27] border border-[#29303e] rounded-lg p-3 hover:border-[#d4af37]/50 transition-colors">
                <label className="block text-[11px] font-semibold tracking-wider text-[#9ba1b0] uppercase mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                  Arrival Slot
                </label>
                <select
                  value={slot}
                  onChange={(e) => setSlot(e.target.value)}
                  className="w-full bg-[#191e27] text-sm font-medium text-white focus:outline-none cursor-pointer"
                >
                  <option value="12:00 PM (Standard Check-in)">12:00 PM (Standard)</option>
                  <option value="06:00 AM - 02:00 PM (Morning Transit)">06:00 AM (Early Transit)</option>
                  <option value="06:00 PM (Evening Express)">06:00 PM (Evening Arrival)</option>
                  <option value="11:00 PM (Late Night Flight Arrival)">11:00 PM (Late Flight)</option>
                </select>
              </div>

              {/* Guests & Room Preference */}
              <div className="bg-[#191e27] border border-[#29303e] rounded-lg p-3 hover:border-[#d4af37]/50 transition-colors">
                <label className="block text-[11px] font-semibold tracking-wider text-[#9ba1b0] uppercase mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#d4af37]" />
                  Guests & Room
                </label>
                <select
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full bg-[#191e27] text-sm font-medium text-white focus:outline-none cursor-pointer"
                >
                  <option value={1}>1 Adult (Solo/Business)</option>
                  <option value={2}>2 Adults (Deluxe King)</option>
                  <option value={3}>3 Adults (Executive/Club)</option>
                  <option value={4}>4 Adults (Family Suite)</option>
                </select>
              </div>
            </div>

            {/* Action Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-[#a5abb8]">
                <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                <span>Direct Booking Guarantee · Best Price Online · Zero Convenience Fees</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-[#d4af37] hover:bg-[#e2c050] text-[#0b0d10] font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-[#d4af37]/20 flex items-center justify-center gap-2 cursor-pointer transform active:scale-95 whitespace-nowrap"
                >
                  <span>Check Availability</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Proximity Pill Highlights */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="p-3 bg-[#13171f]/80 border border-[#222733] rounded-lg">
            <div className="text-xs text-[#a0a6b5]">Airport Commute</div>
            <div className="text-sm font-bold text-white mt-0.5">10 Mins (6.5 km) to JAI</div>
          </div>
          <div className="p-3 bg-[#13171f]/80 border border-[#222733] rounded-lg">
            <div className="text-xs text-[#a0a6b5]">Conventions & RIICO</div>
            <div className="text-sm font-bold text-white mt-0.5">4 Mins to JECC Sitapura</div>
          </div>
          <div className="p-3 bg-[#13171f]/80 border border-[#222733] rounded-lg">
            <div className="text-xs text-[#a0a6b5]">Direct Booking Perk</div>
            <div className="text-sm font-bold text-white mt-0.5">Complimentary Breakfast</div>
          </div>
          <div className="p-3 bg-[#13171f]/80 border border-[#222733] rounded-lg">
            <div className="text-xs text-[#a0a6b5]">Flexibility</div>
            <div className="text-sm font-bold text-white mt-0.5">24/7 Check-in & Transit Taxi</div>
          </div>
        </div>
      </div>
    </section>
  );
};
