import React, { useState } from 'react';
import { Room } from '../types';
import { HotelStore } from '../services/storage';
import {
  Users,
  Maximize2,
  Bed,
  CheckCircle2,
  Calendar,
  MessageCircle,
  Sparkles,
  ArrowUpRight,
  Info,
  X,
  ShieldAlert
} from 'lucide-react';

interface RoomsSectionProps {
  rooms: Room[];
  searchCriteria: {
    checkIn: string;
    checkOut: string;
    slot: string;
    adults: number;
    roomType?: string;
  };
  onSelectRoomForBooking: (room: Room) => void;
}

export const RoomsSection: React.FC<RoomsSectionProps> = ({
  rooms,
  searchCriteria,
  onSelectRoomForBooking,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [detailsRoom, setDetailsRoom] = useState<Room | null>(null);

  const filteredRooms = rooms.filter((r) => {
    if (selectedFilter !== 'all' && r.type !== selectedFilter) return false;
    return true;
  });

  const getAvailabilityInfo = (roomId: string) => {
    return HotelStore.checkAvailability(roomId, searchCriteria.checkIn, searchCriteria.checkOut);
  };

  const createWhatsAppInquiry = (room: Room) => {
    const text = `Hello Hotel O Avondale Jaipur! I'm interested in booking the "${room.name}" from ${searchCriteria.checkIn} to ${searchCriteria.checkOut} for ${searchCriteria.adults} guest(s). Could you share details?`;
    const url = `https://wa.me/918209940455?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <section id="rooms" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-[#d4af37] mb-2">
            Accommodations & Suites
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
            Curated Rooms for Rest & Productivity
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#a8afbe] max-w-2xl">
            Each space at Hotel O Avondale is engineered with acoustic soundproofing, plush posture-support beds, high-speed connectivity, and warm Rajasthani touches.
          </p>
        </div>

        {/* Interactive Filter Controls */}
        <div className="mt-6 md:mt-0 flex flex-wrap items-center gap-1.5 p-1 bg-[#12161f] border border-[#232936] rounded-lg">
          {[
            { id: 'all', label: 'All Rooms' },
            { id: 'deluxe', label: 'Deluxe' },
            { id: 'executive', label: 'Executive' },
            { id: 'club', label: 'Royal Club' },
            { id: 'transit', label: 'Airport Transit' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                selectedFilter === tab.id
                  ? 'bg-[#d4af37] text-[#0c0e12] font-semibold shadow-sm'
                  : 'text-[#8e95a5] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Dates Context Bar */}
      <div className="mb-8 p-3.5 bg-[#141822] border border-[#242b38] rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs text-[#a0a7b8]">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#d4af37]" />
          <span>
            Selected Dates: <strong className="text-white">{searchCriteria.checkIn}</strong> to{' '}
            <strong className="text-white">{searchCriteria.checkOut}</strong>
          </span>
          <span className="hidden sm:inline" aria-hidden="true">·</span>
          <span className="hidden sm:inline">Slot: <strong className="text-white">{searchCriteria.slot}</strong></span>
          <span aria-hidden="true">·</span>
          <span><strong className="text-white">{searchCriteria.adults}</strong> Adult(s)</span>
        </div>
        <div className="text-[11px] text-[#d4af37] font-medium">
          Direct Booking Perks Applied (Save 20% + Breakfast Included)
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredRooms.map((room) => {
          const avail = getAvailabilityInfo(room.id);
          const isAvailable = avail.isAvailable && room.isAvailable;

          return (
            <div
              key={room.id}
              className="bg-[#12161f] border border-[#232936] rounded-xl overflow-hidden hover:border-[#d4af37]/40 transition-all duration-300 flex flex-col justify-between group shadow-lg"
            >
              <div>
                {/* Room Image Container with Scrim & Tag */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#181d27]">
                  <img
                    src={room.images[0]}
                    alt={room.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12161f] via-transparent to-black/30" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-[#0c0e12]/80 backdrop-blur-md text-[#d4af37] border border-[#d4af37]/30 rounded">
                      {room.type.toUpperCase()}
                    </span>
                    {room.inventoryCount <= 4 && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-700/50 rounded">
                        Only {room.inventoryCount} left
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setDetailsRoom(room)}
                    className="absolute top-4 right-4 p-2 bg-[#0c0e12]/70 hover:bg-[#0c0e12] text-white rounded-full backdrop-blur-sm transition-colors cursor-pointer"
                    title="View Full Room Specifications"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>

                  {/* Room Key Specs Bar */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-[#e1dec9]">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#d4af37]" />
                        Up to {room.capacity.adults} Adults
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Maximize2 className="w-3.5 h-3.5 text-[#d4af37]" />
                        {room.size}
                      </span>
                    </div>
                    <div className="font-semibold text-white">
                      ★ {room.rating} <span className="text-[#888f9f] font-normal">({room.reviewCount})</span>
                    </div>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-white group-hover:text-[#d4af37] transition-colors">
                        {room.name}
                      </h3>
                      <p className="mt-1 text-xs text-[#959caa] flex items-center gap-1.5">
                        <Bed className="w-3.5 h-3.5 text-[#d4af37]" />
                        {room.bedType}
                      </p>
                    </div>

                    {/* Price Block */}
                    <div className="text-right shrink-0">
                      <div className="text-xs text-[#7f8695] line-through">
                        ₹{room.basePrice.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-[#d4af37] tabular-nums">
                        ₹{room.discountedPrice.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-[#8e95a5] uppercase tracking-wider">
                        Per Night + Taxes
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-xs sm:text-sm text-[#b8bdcb] line-clamp-2 leading-relaxed">
                    {room.description}
                  </p>

                  {/* Key Highlights */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[#a0a7b7]">
                    {room.shortHighlights.map((hl, i) => (
                      <div key={i} className="flex items-center gap-1.5 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                        <span className="truncate">{hl}</span>
                      </div>
                    ))}
                  </div>

                  {/* Real-time Availability Flag */}
                  {!isAvailable && (
                    <div className="mt-4 p-2.5 bg-rose-950/40 border border-rose-800/40 rounded text-xs text-rose-300 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>{avail.reason || 'Not available for selected dates.'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-6 pt-0 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => createWhatsAppInquiry(room)}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-[#c7ccda] hover:text-white border border-[#2b3342] hover:border-[#25D366] hover:bg-[#25D366]/10 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  title="Inquire on WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>WhatsApp Inquiry</span>
                </button>

                <button
                  disabled={!isAvailable}
                  onClick={() => onSelectRoomForBooking(room)}
                  className={`w-full sm:flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isAvailable
                      ? 'bg-[#d4af37] hover:bg-[#e2c153] text-[#0c0e12] shadow-md shadow-[#d4af37]/20 transform active:scale-95'
                      : 'bg-[#1b1f28] text-[#5e6473] cursor-not-allowed'
                  }`}
                >
                  <span>{isAvailable ? 'Instant Reserve' : 'Unavailable'}</span>
                  {isAvailable && <ArrowUpRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Room Details Modal */}
      {detailsRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#12161f] border border-[#2d3444] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative text-left">
            <button
              onClick={() => setDetailsRoom(null)}
              className="absolute top-4 right-4 p-2 text-[#888f9e] hover:text-white bg-[#1a1f2c] rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="aspect-[16/9] rounded-lg overflow-hidden mb-4 bg-black">
              <img
                src={detailsRoom.images[0]}
                alt={detailsRoom.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#d4af37]">
                  {detailsRoom.type} Suite
                </span>
                <h3 className="font-serif text-2xl font-bold text-white mt-1">
                  {detailsRoom.name}
                </h3>
                <p className="text-xs text-[#959caa] mt-1">{detailsRoom.bedType} · {detailsRoom.size}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#d4af37] tabular-nums">
                  ₹{detailsRoom.discountedPrice.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-[#7f8695]">Per night + tax</div>
              </div>
            </div>

            <p className="mt-4 text-sm text-[#c0c5d2] leading-relaxed">
              {detailsRoom.description}
            </p>

            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                Room Features & Amenities
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#a3aab9]">
                {detailsRoom.amenities.map((am, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-[#181d27] rounded border border-[#242a38]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                    <span>{am}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#232936] flex items-center justify-end gap-3">
              <button
                onClick={() => setDetailsRoom(null)}
                className="px-4 py-2 text-xs font-semibold text-[#8f96a7] hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const r = detailsRoom;
                  setDetailsRoom(null);
                  onSelectRoomForBooking(r);
                }}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0c0e12] bg-[#d4af37] hover:bg-[#e2c153] rounded-lg cursor-pointer"
              >
                Proceed to Book
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
