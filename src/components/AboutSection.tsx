import React from 'react';
import { hotelImages } from '../assets/images';
import { Plane, Building, Compass, Sparkles, Coffee, ShieldCheck } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#1e2430]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Visual Column */}
        <div className="lg:col-span-6 relative">
          <div className="relative rounded-2xl overflow-hidden border border-[#272e3d] shadow-2xl aspect-[4/3]">
            <img
              src={hotelImages.jaipurLocale}
              alt="Jaipur Airport and Sitapura Skyline"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e12]/80 via-transparent to-transparent" />
          </div>

          {/* Floating Proximity Stat Card */}
          <div className="absolute -bottom-6 -right-2 sm:right-6 bg-[#131720]/95 border border-[#2c3344] backdrop-blur-md rounded-xl p-4 shadow-xl max-w-xs text-left">
            <div className="flex items-center gap-2 text-[#d4af37] text-xs font-bold uppercase tracking-wider mb-1">
              <Plane className="w-4 h-4" />
              <span>Jaipur International Airport</span>
            </div>
            <div className="text-xl font-serif font-bold text-white">6.5 km · 10 Minutes</div>
            <div className="text-xs text-[#9aa1b0] mt-0.5">
              Direct highway connectivity via Tonk Road / Sitapura Flyover
            </div>
          </div>
        </div>

        {/* Story Column */}
        <div className="lg:col-span-6 text-left">
          <div className="text-xs font-semibold uppercase tracking-widest text-[#d4af37] mb-2">
            The Avondale Narrative
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            Elevated Direct Hospitality at Sitapura, Jaipur
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#adb4c5] leading-relaxed">
            Born from a vision to redefine business and airport transit hospitality in Rajasthan's capital, <strong>Hotel O Avondale</strong> combines the warmth of authentic royal Rajasthani hospitality with contemporary corporate efficiency.
          </p>
          <p className="mt-3 text-xs sm:text-sm text-[#8f96a7] leading-relaxed">
            Situated strategically in the vibrant <strong>Sitapura Industrial Area</strong>, our property is the preferred address for delegates attending exhibitions at the Jaipur Exhibition & Convention Centre (JECC), corporate executives visiting RIICO industrial hubs, and transit guests requiring restful layovers near Jaipur Airport (JAI).
          </p>

          {/* Strategic Distances Grid */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-[#141822] border border-[#232936] rounded-xl flex items-start gap-3">
              <div className="p-2 bg-[#1d2330] rounded-lg text-[#d4af37] shrink-0">
                <Plane className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white">Jaipur Airport (JAI)</div>
                <div className="text-[#8f96a7] text-[11px] mt-0.5">10 Mins (Terminal 1 & 2)</div>
              </div>
            </div>

            <div className="p-3.5 bg-[#141822] border border-[#232936] rounded-xl flex items-start gap-3">
              <div className="p-2 bg-[#1d2330] rounded-lg text-[#d4af37] shrink-0">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white">JECC Exhibition Centre</div>
                <div className="text-[#8f96a7] text-[11px] mt-0.5">4 Mins (Opposite RIICO gate)</div>
              </div>
            </div>

            <div className="p-3.5 bg-[#141822] border border-[#232936] rounded-xl flex items-start gap-3">
              <div className="p-2 bg-[#1d2330] rounded-lg text-[#d4af37] shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white">Chokhi Dhani Heritage Village</div>
                <div className="text-[#8f96a7] text-[11px] mt-0.5">8 Mins via Tonk Road</div>
              </div>
            </div>

            <div className="p-3.5 bg-[#141822] border border-[#232936] rounded-xl flex items-start gap-3">
              <div className="p-2 bg-[#1d2330] rounded-lg text-[#d4af37] shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white">Pink City & Hawa Mahal</div>
                <div className="text-[#8f96a7] text-[11px] mt-0.5">25 Mins direct expressway</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
