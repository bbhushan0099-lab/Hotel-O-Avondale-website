import React from 'react';
import { hotelImages } from '../assets/images';
import {
  Wifi,
  Coffee,
  Car,
  Utensils,
  Shield,
  Clock,
  Shirt,
  VolumeX,
  Zap,
  CheckCircle2
} from 'lucide-react';

export const AmenitiesSection: React.FC = () => {
  const perks = [
    {
      icon: <Car className="w-5 h-5 text-[#d4af37]" />,
      title: 'Airport Transit & Taxi Coordination',
      desc: 'Dedicated 24/7 dispatch desk for flights arriving at Jaipur Airport Terminal 1 & 2.'
    },
    {
      icon: <Utensils className="w-5 h-5 text-[#d4af37]" />,
      title: 'Artisan Dining & Buffet Lounge',
      desc: 'Freshly prepared Rajasthani delicacies, continental breakfast spreads, and 24/7 in-room culinary service.'
    },
    {
      icon: <VolumeX className="w-5 h-5 text-[#d4af37]" />,
      title: 'Acoustic Soundproofing',
      desc: 'Double-glazed vacuum insulation engineered for silent, restorative sleep despite transit proximity.'
    },
    {
      icon: <Wifi className="w-5 h-5 text-[#d4af37]" />,
      title: 'Enterprise 5G Fiber Wi-Fi',
      desc: 'Seamless 200+ Mbps connectivity across all rooms, executive suites, and lounge areas.'
    },
    {
      icon: <Zap className="w-5 h-5 text-[#d4af37]" />,
      title: '100% Uninterrupted Power Backup',
      desc: 'Dual generator backup guarantees non-stop climate control and high-voltage workstations.'
    },
    {
      icon: <Clock className="w-5 h-5 text-[#d4af37]" />,
      title: 'Express 24-Hour Check-in',
      desc: 'Flexible arrival slot options tailored for late night flight landings and early morning departures.'
    },
  ];

  return (
    <section id="amenities" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#1e2430]">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="text-xs font-semibold uppercase tracking-widest text-[#d4af37] mb-2">
          Hospitality & Facilities
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
          Thoughtful Comforts for Discerning Guests
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#a2a9ba]">
          Every amenity at Hotel O Avondale is curated to eliminate travel friction for business travelers, conference attendees, and families exploring Jaipur.
        </p>
      </div>

      {/* Featured Banner: The Avondale Dining Lounge */}
      <div className="bg-[#121620] border border-[#262c3b] rounded-2xl overflow-hidden shadow-2xl mb-16 grid grid-cols-1 lg:grid-cols-12 items-center">
        <div className="lg:col-span-7 aspect-[16/10] bg-[#181d28] overflow-hidden">
          <img
            src={hotelImages.diningLounge}
            alt="Avondale Dining & Breakfast Lounge"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
          />
        </div>
        <div className="lg:col-span-5 p-6 sm:p-10 text-left">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#d4af37]">
            Culinary Experience
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
            The Avondale Dining & Cafe Lounge
          </h3>
          <p className="mt-3 text-xs sm:text-sm text-[#a8afbe] leading-relaxed">
            Begin your morning with a complimentary breakfast spread featuring freshly brewed South Indian filter coffee, authentic Rajasthani poha & kachori, and continental eggs to order.
          </p>
          <div className="mt-6 space-y-2 text-xs text-[#c3cad8]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0" />
              <span>Complimentary Buffet Breakfast with every direct website booking</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0" />
              <span>24/7 Midnight Chef menu for late arrivals from Jaipur Airport</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0" />
              <span>Custom boxed meals for early morning transit departures</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Amenities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        {perks.map((perk, i) => (
          <div
            key={i}
            className="p-6 bg-[#121620] border border-[#242a38] rounded-xl hover:border-[#d4af37]/40 transition-colors group"
          >
            <div className="p-3 bg-[#191f2b] w-fit rounded-lg border border-[#2b3344] group-hover:border-[#d4af37]/50 transition-colors mb-4">
              {perk.icon}
            </div>
            <h3 className="font-serif text-lg font-bold text-white group-hover:text-[#d4af37] transition-colors">
              {perk.title}
            </h3>
            <p className="mt-2 text-xs text-[#9aa1b2] leading-relaxed">
              {perk.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
