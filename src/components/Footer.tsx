import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, ShieldCheck, Lock, UserPlus } from 'lucide-react';
import { HotelStore } from '../services/storage';

interface FooterProps {
  onOpenBooking: () => void;
  onOpenLookup: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenBooking,
  onOpenLookup,
  onOpenAdmin,
}) => {
  const [slotClaimed, setSlotClaimed] = useState<boolean>(false);

  useEffect(() => {
    setSlotClaimed(HotelStore.hasAdminSlotBeenClaimed());
  }, []);

  const scrollTo = (id: string) => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#090b0e] border-t border-[#1a1f28] text-xs text-[#8e95a5] pt-16 pb-24 md:pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 text-left">
        {/* Brand Column */}
        <div className="lg:col-span-4 space-y-3">
          <a href="#" className="font-serif text-2xl font-bold tracking-wider text-white">
            HOTEL O AVONDALE
          </a>
          <p className="text-xs text-[#9aa1b2] leading-relaxed max-w-sm">
            A boutique luxury hospitality destination in Sitapura Industrial Area, moments from Jaipur International Airport (JAI) and Jaipur Exhibition & Convention Centre (JECC).
          </p>
          <div className="text-[11px] text-[#717887]">
            GSTIN: 08AAACH1234F1Z8 · Direct Web Booking Portal
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="lg:col-span-3 space-y-2">
          <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37] mb-3">
            Hotel Spaces
          </div>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={() => scrollTo('rooms')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Deluxe King Rooms
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollTo('rooms')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Executive Business Suites
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollTo('rooms')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Royal Club Suites
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollTo('rooms')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Airport Transit Studios
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollTo('amenities')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                The Avondale Cafe Lounge
              </button>
            </li>
          </ul>
        </div>

        {/* Guest Services & Self-Service */}
        <div className="lg:col-span-2 space-y-2">
          <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37] mb-3">
            Guest Services
          </div>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={onOpenLookup}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Manage My Booking
              </button>
            </li>
            <li>
              <button
                onClick={onOpenBooking}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Direct Reservation
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollTo('about')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Airport Shuttle Info
              </button>
            </li>
            <li>
              <button
                onClick={onOpenAdmin}
                className="hover:text-[#d4af37] transition-colors cursor-pointer text-left flex items-center gap-1.5"
              >
                {slotClaimed ? (
                  <>
                    <Lock className="w-3 h-3 text-[#d4af37]" />
                    <span>Admin Login</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3 text-amber-400 animate-pulse" />
                    <span className="text-amber-300 font-semibold">Admin Sign-Up (1 Slot)</span>
                  </>
                )}
              </button>
            </li>
          </ul>
        </div>

        {/* Contact Strip */}
        <div className="lg:col-span-3 space-y-2">
          <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37] mb-3">
            Concierge Desk
          </div>
          <div className="space-y-2 text-xs text-[#a0a7b8]">
            <div>Plot 42-B, Sitapura Industrial Area</div>
            <div>Tonk Road, Jaipur 302022 (Near JECC)</div>
            <div className="pt-1 text-white font-medium">
              Direct Line:{' '}
              <a href="tel:01244330567" className="hover:text-[#d4af37] transition-colors">
                01244330567
              </a>
            </div>
            <div className="text-white font-medium">
              Mobile / WhatsApp:{' '}
              <a href="tel:8209940455" className="hover:text-[#d4af37] transition-colors">
                8209940455
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-[#181d26] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#6b7280]">
        <div>
          © {new Date().getFullYear()} Hotel O Avondale (Jaipur). All rights reserved.
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span>Sitapura Industrial Area</span>
          <span aria-hidden="true">·</span>
          <span>Near Jaipur International Airport</span>
          <span aria-hidden="true">·</span>
          <span>Best Rate Guarantee</span>
          <span aria-hidden="true">·</span>
          <button
            onClick={onOpenAdmin}
            className="text-[#7f8697] hover:text-[#d4af37] transition-colors cursor-pointer underline underline-offset-2"
          >
            {slotClaimed ? 'Admin Portal' : 'Admin Setup (1 Slot)'}
          </button>
        </div>
      </div>
    </footer>
  );
};
