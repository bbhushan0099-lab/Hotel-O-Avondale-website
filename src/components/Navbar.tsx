import React, { useState, useEffect } from 'react';
import { Phone, Calendar, ShieldCheck, Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenLookup: () => void;
  onOpenAdmin?: () => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBooking,
  onOpenLookup,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0c0e12]/95 backdrop-blur-md border-b border-[#242933] py-3.5 shadow-xl'
          : 'bg-gradient-to-b from-[#0c0e12]/90 via-[#0c0e12]/60 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="group flex items-center gap-2 text-left"
        >
          <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-white group-hover:text-[#d4af37] transition-colors">
            HOTEL O AVONDALE
          </span>
        </a>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-medium tracking-widest uppercase text-[#c4c0b5]">
          <button
            onClick={() => scrollTo('rooms')}
            className="hover:text-[#d4af37] transition-colors cursor-pointer py-1"
          >
            Rooms & Suites
          </button>
          <button
            onClick={() => scrollTo('about')}
            className="hover:text-[#d4af37] transition-colors cursor-pointer py-1"
          >
            About & Airport
          </button>
          <button
            onClick={() => scrollTo('amenities')}
            className="hover:text-[#d4af37] transition-colors cursor-pointer py-1"
          >
            Amenities
          </button>
          <button
            onClick={() => scrollTo('gallery')}
            className="hover:text-[#d4af37] transition-colors cursor-pointer py-1"
          >
            Gallery
          </button>
          <button
            onClick={() => scrollTo('contact')}
            className="hover:text-[#d4af37] transition-colors cursor-pointer py-1"
          >
            Location & Contact
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onOpenLookup}
            className="px-3.5 py-2 text-xs font-medium text-[#c4c0b5] hover:text-white border border-[#2b313e] hover:border-[#d4af37]/60 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            title="Search your existing booking"
          >
            <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>My Booking</span>
          </button>

          <button
            onClick={onOpenBooking}
            className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#0c0e12] bg-[#d4af37] hover:bg-[#e0be49] rounded-md transition-all shadow-md shadow-[#d4af37]/20 whitespace-nowrap cursor-pointer transform active:scale-95"
          >
            Book A Stay
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onOpenBooking}
            className="px-3 py-1.5 text-xs font-semibold text-[#0c0e12] bg-[#d4af37] rounded-md"
          >
            Book
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#0c0e12]/98 border-b border-[#242933] px-6 py-6 space-y-4 text-sm font-medium tracking-wider uppercase text-[#c4c0b5] animate-in fade-in slide-in-from-top-4 duration-200">
          <button
            onClick={() => scrollTo('rooms')}
            className="block w-full text-left py-2 hover:text-[#d4af37]"
          >
            Rooms & Suites
          </button>
          <button
            onClick={() => scrollTo('about')}
            className="block w-full text-left py-2 hover:text-[#d4af37]"
          >
            About & Airport Proximity
          </button>
          <button
            onClick={() => scrollTo('amenities')}
            className="block w-full text-left py-2 hover:text-[#d4af37]"
          >
            Amenities & Dining
          </button>
          <button
            onClick={() => scrollTo('gallery')}
            className="block w-full text-left py-2 hover:text-[#d4af37]"
          >
            Photo Gallery
          </button>
          <button
            onClick={() => scrollTo('contact')}
            className="block w-full text-left py-2 hover:text-[#d4af37]"
          >
            Contact & Directions
          </button>
          <div className="pt-4 border-t border-[#1f242e] flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLookup();
              }}
              className="w-full py-2.5 px-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-200 bg-[#161a22] border border-[#2b313e] rounded-md"
            >
              Lookup Reservation
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
