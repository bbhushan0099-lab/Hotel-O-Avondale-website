import React, { useState } from 'react';
import { Booking } from '../types';
import { HotelStore } from '../services/storage';
import {
  X,
  Search,
  Calendar,
  Phone,
  Mail,
  AlertCircle,
  MessageCircle,
  FileText,
  Ban,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface BookingLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEmailPreview: (booking: Booking) => void;
}

export const BookingLookupModal: React.FC<BookingLookupModalProps> = ({
  isOpen,
  onClose,
  onOpenEmailPreview,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Booking[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!query.trim()) return;

    const matched = HotelStore.getBookingsByPhoneOrEmail(query);
    setResults(matched);
    setHasSearched(true);
  };

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm('Are you sure you wish to cancel this reservation?')) {
      const updated = HotelStore.updateBookingStatus(bookingId, 'cancelled');
      if (updated) {
        setMessage(`Booking #${bookingId} has been successfully cancelled.`);
        // Refresh local list
        setResults((prev) =>
          prev ? prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b)) : null
        );
      }
    }
  };

  const openWhatsAppHelp = (b: Booking) => {
    const text = `Hello Hotel O Avondale Front Desk! I have a question regarding my reservation #${b.id} (${b.customerName}, ${b.checkInDate}).`;
    const url = `https://wa.me/918209940455?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#11141c] border border-[#262c3b] rounded-2xl max-w-2xl w-full max-h-[88vh] overflow-y-auto p-5 sm:p-7 relative shadow-2xl text-left">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#7f8696] hover:text-white bg-[#191e29] rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="border-b border-[#212735] pb-4 mb-6">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#d4af37]">
            Guest Self-Service
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
            Find & Manage Your Reservation
          </h2>
          <p className="text-xs text-[#98a0b0] mt-1">
            Enter your Booking ID (e.g. HOA-8492), phone number, or email address to view status and voucher.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#888f9f] absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              placeholder="Booking ID (HOA-XXXX), Phone, or Email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#161a24] border border-[#272e3f] rounded-lg text-sm text-white focus:border-[#d4af37] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#d4af37] hover:bg-[#e2c153] text-[#0c0e12] font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap"
          >
            Lookup
          </button>
        </form>

        {message && (
          <div className="p-3 mb-4 bg-emerald-950/60 border border-emerald-800/60 rounded-lg text-xs text-emerald-300">
            {message}
          </div>
        )}

        {hasSearched && (
          <div className="space-y-4">
            {results && results.length > 0 ? (
              results.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 sm:p-5 bg-[#161a24] border border-[#272e3f] rounded-xl hover:border-[#353d52] transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#232938] pb-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-base font-bold text-white">
                          #{booking.id}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                            booking.status === 'confirmed'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                              : booking.status === 'pending'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                              : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <div className="text-xs text-[#a0a7b8] mt-0.5">{booking.roomName}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-[#d4af37] tabular-nums">
                        ₹{booking.totalPrice.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-[#788090]">
                        {booking.paymentStatus === 'paid' ? 'Paid Online' : 'Pay at Hotel Desk'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-[#9ca3b3] mb-4">
                    <div>
                      <span className="text-[10px] uppercase text-[#6f7686] block">Guest</span>
                      <span className="text-white font-medium">{booking.customerName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-[#6f7686] block">Dates</span>
                      <span className="text-white font-medium">
                        {booking.checkInDate} to {booking.checkOutDate} ({booking.nights}N)
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-[#6f7686] block">Check-in Slot</span>
                      <span className="text-white font-medium">{booking.checkInSlot || 'Standard'}</span>
                    </div>
                  </div>

                  {booking.specialRequests && (
                    <div className="text-xs text-[#8f96a7] bg-[#1a1f2c] p-2.5 rounded mb-4 italic">
                      Note: "{booking.specialRequests}"
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#232938]">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openWhatsAppHelp(booking)}
                        className="px-3 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Front Desk Chat</span>
                      </button>

                      <button
                        onClick={() => onOpenEmailPreview(booking)}
                        className="px-3 py-1.5 bg-[#1f2533] hover:bg-[#283042] text-[#c0c6d5] text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>View Email Voucher</span>
                      </button>
                    </div>

                    {booking.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Cancel Booking</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-[#161a24] rounded-xl border border-[#272e3f]">
                <AlertCircle className="w-8 h-8 text-[#8e95a5] mx-auto mb-2" />
                <div className="text-sm font-semibold text-white">No Reservations Found</div>
                <p className="text-xs text-[#8e95a5] max-w-sm mx-auto mt-1">
                  We couldn't locate a booking matching "{query}". Please double-check your booking reference or phone number.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
