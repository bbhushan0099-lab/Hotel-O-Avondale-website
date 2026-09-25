import React from 'react';
import { Star, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ReviewsSection: React.FC = () => {
  const reviews = [
    {
      author: 'Rohit Khandelwal',
      role: 'VP Procurement, Rajasthan Solar Solutions',
      context: 'Stayed for 4 nights during JECC Sitapura Renewable Energy Expo 2026',
      rating: 5,
      content:
        'Outstanding location for anyone with business in Sitapura. Literally 4 minutes to JECC. The room was pin-drop quiet despite being in the industrial area, and the 200 Mbps Wi-Fi allowed me to take US client calls without a single drop.',
    },
    {
      author: 'Dr. Meenakshi Sundaram',
      role: 'Consultant Surgeon, Apollo Hospitals Group',
      context: 'Transit layover connecting to London via Jaipur International Airport',
      rating: 5,
      content:
        'My flight arrived past 11:30 PM. The front desk had a taxi waiting at Terminal 2, and check-in took under 2 minutes. The bed linens and orthopedic mattress gave me 7 hours of undisturbed sleep before my early morning conference.',
    },
    {
      author: 'Kunal & Devika Malhotra',
      role: 'Architectural Designers, Studio Jaipur',
      context: 'Weekend leisure stay & Chokhi Dhani excursion',
      rating: 5,
      content:
        'We booked the Royal Club Suite directly on the site and saved over ₹3,000 compared to third-party travel platforms. Complimentary breakfast buffet with hot kachoris and the private balcony view made it special.',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#1e2430]">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="text-xs font-semibold uppercase tracking-widest text-[#d4af37] mb-2">
          Guest Experiences
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
          Trusted by Business Leaders & Transit Travelers
        </h2>
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#a3aab9]">
          <span className="flex text-[#d4af37]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-[#d4af37]" />
            ))}
          </span>
          <span className="font-bold text-white">4.88 / 5.0 Rating</span>
          <span aria-hidden="true">·</span>
          <span>520+ Direct Guest Stays Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        {reviews.map((r, i) => (
          <div
            key={i}
            className="p-6 bg-[#121620] border border-[#232938] rounded-xl flex flex-col justify-between hover:border-[#d4af37]/30 transition-colors shadow-lg"
          >
            <div>
              <div className="flex items-center gap-1 text-[#d4af37] mb-3">
                {[...Array(r.rating)].map((_, idx) => (
                  <Star key={idx} className="w-3.5 h-3.5 fill-[#d4af37]" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#b5bccb] leading-relaxed italic">
                "{r.content}"
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1f2533]">
              <div className="font-serif font-bold text-sm text-white">{r.author}</div>
              <div className="text-[11px] text-[#d4af37]">{r.role}</div>
              <div className="text-[10px] text-[#717887] mt-1">{r.context}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Direct Booking Guarantee Banner */}
      <div className="mt-14 p-6 sm:p-8 bg-[#151924] border border-[#283042] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-left">
        <div className="space-y-1 max-w-xl">
          <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Direct Website Booking Guarantee</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
            Why Book Directly with Hotel O Avondale?
          </h3>
          <p className="text-xs text-[#9aa1b2] leading-relaxed">
            Eliminate intermediary markups and enjoy perks reserved exclusively for our direct guests.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#c6ccd9] shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0" />
            <span>Lowest Rate Guarantee (20% Off)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0" />
            <span>Complimentary Daily Breakfast</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0" />
            <span>Priority Early Check-in Hold</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0" />
            <span>Free Airport Shuttle Assist</span>
          </div>
        </div>
      </div>
    </section>
  );
};
