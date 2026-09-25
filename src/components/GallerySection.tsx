import React, { useState } from 'react';
import { hotelImages } from '../assets/images';
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryItem {
  id: string;
  src: string;
  category: 'rooms' | 'dining' | 'facade' | 'locale';
  title: string;
  caption: string;
}

export const GallerySection: React.FC<{ onBookNow: () => void }> = ({ onBookNow }) => {
  const [filter, setFilter] = useState<string>('all');
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const galleryItems: GalleryItem[] = [
    {
      id: 'gal-1',
      src: hotelImages.heroFacade,
      category: 'facade',
      title: 'Grand Entrance & Portico',
      caption: 'Evening architectural lighting showcasing modern elegance in Sitapura Industrial Area'
    },
    {
      id: 'gal-2',
      src: hotelImages.deluxeRoom,
      category: 'rooms',
      title: 'Avondale Deluxe Bedroom',
      caption: 'Plush orthopedic bedding, warm ambient headboard backlight, and bespoke hardwood floors'
    },
    {
      id: 'gal-3',
      src: hotelImages.executiveSuite,
      category: 'rooms',
      title: 'Executive Business Suite',
      caption: 'Integrated meeting lounge and dedicated ergonomic work desk for business leaders'
    },
    {
      id: 'gal-4',
      src: hotelImages.diningLounge,
      category: 'dining',
      title: 'The Avondale Dining & Cafe Lounge',
      caption: 'Handcrafted breakfast buffet and artisan espresso bar with contemporary timber finishes'
    },
    {
      id: 'gal-5',
      src: hotelImages.jaipurLocale,
      category: 'locale',
      title: 'Sitapura Corridor & Jaipur Skyline',
      caption: 'Golden hour twilight over the southern corridor connecting Jaipur Airport to JECC'
    }
  ];

  const filteredItems = galleryItems.filter((item) => {
    if (filter === 'all') return true;
    return item.category === filter;
  });

  return (
    <section id="gallery" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#1e2430]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-[#d4af37] mb-2">
            Visual Tour
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
            The Avondale Visual Experience
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#a2a9ba] max-w-xl">
            Take a visual tour through our boutique suites, private lounges, and warm architectural elements.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mt-6 md:mt-0 flex flex-wrap gap-1.5 p-1 bg-[#121620] border border-[#242a38] rounded-lg">
          {[
            { id: 'all', label: 'All Photos' },
            { id: 'rooms', label: 'Suites & Rooms' },
            { id: 'dining', label: 'Dining Lounge' },
            { id: 'facade', label: 'Facade & Exterior' },
            { id: 'locale', label: 'Jaipur & Airport' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filter === tab.id
                  ? 'bg-[#d4af37] text-[#0c0e12] font-semibold shadow-sm'
                  : 'text-[#8e95a5] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, idx) => (
          <div
            key={item.id}
            onClick={() => setActiveImageIndex(idx)}
            className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-[#161a24] border border-[#252c3c] cursor-pointer shadow-lg hover:border-[#d4af37]/60 transition-all duration-300"
          >
            <img
              src={item.src}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Scrim overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

            {/* Hover Expand Icon */}
            <div className="absolute top-4 right-4 p-2 bg-[#0c0e12]/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-4 h-4" />
            </div>

            {/* Caption & Title */}
            <div className="absolute bottom-4 left-4 right-4 text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#d4af37]">
                {item.category.toUpperCase()}
              </span>
              <h3 className="font-serif text-lg font-bold text-white mt-0.5">
                {item.title}
              </h3>
              <p className="text-xs text-[#b8bfce] mt-1 line-clamp-1">
                {item.caption}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {activeImageIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
          <button
            onClick={() => setActiveImageIndex(null)}
            className="absolute top-6 right-6 p-3 text-white/80 hover:text-white bg-[#1a1f2c] rounded-full z-50 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-5xl w-full text-center relative">
            <div className="relative aspect-[16/10] max-h-[75vh] mx-auto rounded-xl overflow-hidden border border-[#2b3344] bg-black">
              <img
                src={filteredItems[activeImageIndex].src}
                alt={filteredItems[activeImageIndex].title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-left px-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#d4af37]">
                  {filteredItems[activeImageIndex].category}
                </span>
                <h3 className="font-serif text-2xl font-bold text-white">
                  {filteredItems[activeImageIndex].title}
                </h3>
                <p className="text-xs text-[#a0a7b8] mt-1">
                  {filteredItems[activeImageIndex].caption}
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveImageIndex(null);
                  onBookNow();
                }}
                className="px-6 py-2.5 bg-[#d4af37] hover:bg-[#e2c153] text-[#0c0e12] font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap"
              >
                Book This Stay
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
