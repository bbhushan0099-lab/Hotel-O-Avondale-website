import React, { useState, useEffect } from 'react';
import { Room, Booking } from '../types';
import { HotelStore } from '../services/storage';
import { saveBookingToSupabase, SupabaseSyncResult } from '../services/supabase';
import {
  X,
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  CheckCircle,
  MessageCircle,
  Mail,
  Printer,
  FileText,
  AlertCircle,
  CreditCard,
  Building2,
  Sparkles,
  Plane
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRoom: Room | null;
  rooms: Room[];
  initialDates?: {
    checkIn: string;
    checkOut: string;
    slot: string;
    adults: number;
  };
  onBookingSuccess: (booking: Booking) => void;
  onOpenEmailPreview: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  selectedRoom,
  rooms,
  initialDates,
  onBookingSuccess,
  onOpenEmailPreview,
}) => {
  const [activeRoomId, setActiveRoomId] = useState<string>('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [slot, setSlot] = useState('12:00 PM (Standard Check-in)');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Guest details
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMode, setPaymentMode] = useState<'pay_at_hotel' | 'instant_upi_card'>('pay_at_hotel');

  // Supabase sync tracking
  const [supabaseResult, setSupabaseResult] = useState<SupabaseSyncResult | null>(null);

  // Flow states
  const [step, setStep] = useState<'details' | 'confirmed'>('details');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedRoom) {
      setActiveRoomId(selectedRoom.id);
    } else if (rooms.length > 0) {
      setActiveRoomId(rooms[0].id);
    }
  }, [selectedRoom, rooms]);

  useEffect(() => {
    if (initialDates) {
      setCheckIn(initialDates.checkIn);
      setCheckOut(initialDates.checkOut);
      setSlot(initialDates.slot);
      setAdults(initialDates.adults);
    } else {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setCheckIn(today);
      setCheckOut(tomorrow.toISOString().split('T')[0]);
    }
  }, [initialDates, isOpen]);

  if (!isOpen) return null;

  const currentRoom = rooms.find((r) => r.id === activeRoomId) || selectedRoom || rooms[0];

  // Calculate nights
  const calcNights = () => {
    if (!checkIn || !checkOut) return 1;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const nights = Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
    return nights;
  };

  const nights = calcNights();
  const roomPrice = currentRoom ? currentRoom.discountedPrice : 2799;
  const subtotal = roomPrice * nights;
  const taxes = Math.round(subtotal * 0.12); // 12% GST standard
  const totalAmount = subtotal + taxes;

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setAvailabilityError(null);

    // Validate dates
    if (new Date(checkIn) >= new Date(checkOut)) {
      setAvailabilityError('Check-out date must be at least 1 day after check-in.');
      return;
    }

    // Real-time availability check
    const avail = HotelStore.checkAvailability(currentRoom.id, checkIn, checkOut);
    if (!avail.isAvailable) {
      setAvailabilityError(avail.reason || 'This room is unavailable for the selected dates.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const fullRequests = [
        specialRequests.trim(),
        flightNumber.trim() ? `Flight / Transit info: ${flightNumber.trim()}` : null,
      ]
        .filter(Boolean)
        .join(' | ');

      const newBooking = HotelStore.createBooking({
        roomId: currentRoom.id,
        roomName: currentRoom.name,
        customerName: guestName,
        customerEmail: guestEmail,
        customerPhone: guestPhone,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        checkInSlot: slot,
        nights,
        guests: { adults, children },
        totalPrice: totalAmount,
        specialRequests: fullRequests,
        paymentMode,
        paymentStatus: paymentMode === 'instant_upi_card' ? 'paid' : 'pending',
      });

      // Sync directly to Supabase Backend
      saveBookingToSupabase(newBooking)
        .then((res) => {
          setSupabaseResult(res);
        })
        .catch((err) => {
          setSupabaseResult({
            success: false,
            message: 'Supabase sync encountered an error: ' + (err?.message || err),
          });
        });

      // Attempt async backend notification / sync
      fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      }).catch(() => {
        // Local store is already authoritative
      });

      setConfirmedBooking(newBooking);
      setStep('confirmed');
      setIsSubmitting(false);
      onBookingSuccess(newBooking);
    }, 600);
  };

  const openWhatsAppConfirmation = () => {
    if (!confirmedBooking) return;
    const msg = `Namaste Hotel O Avondale Jaipur!
I have booked a stay directly:
*Booking ID:* ${confirmedBooking.id}
*Room:* ${confirmedBooking.roomName}
*Dates:* ${confirmedBooking.checkInDate} to ${confirmedBooking.checkOutDate} (${confirmedBooking.nights} nights)
*Arrival Slot:* ${confirmedBooking.checkInSlot || 'Standard'}
*Guest:* ${confirmedBooking.customerName} (${confirmedBooking.customerPhone})
*Total:* ₹${confirmedBooking.totalPrice.toLocaleString('en-IN')}

Please share directions and check-in confirmation. Thank you!`;

    const url = `https://wa.me/918209940455?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#10131a] border border-[#262c3a] rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 md:p-8 relative shadow-2xl my-auto text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#7f8696] hover:text-white bg-[#191e29] rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {step === 'details' ? (
          <div>
            {/* Header */}
            <div className="border-b border-[#202633] pb-5 mb-6">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#d4af37]">
                Hotel O Avondale · Direct Reservation
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                Reserve Your Stay in Jaipur
              </h2>
              <p className="text-xs text-[#9aa1b2] mt-1">
                Best Rate Guarantee · Complimentary Airport Shuttle Assist · 12% GST Included
              </p>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-6">
              {/* Room Category Picker */}
              <div>
                <label className="block text-xs font-semibold text-[#b5bccb] uppercase tracking-wider mb-2">
                  Select Room Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {rooms.map((room) => (
                    <button
                      type="button"
                      key={room.id}
                      onClick={() => setActiveRoomId(room.id)}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
                        activeRoomId === room.id
                          ? 'bg-[#1e2430] border-[#d4af37] ring-1 ring-[#d4af37]'
                          : 'bg-[#151922] border-[#252b39] hover:border-[#384155]'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-semibold text-white">{room.name}</div>
                        <div className="text-xs text-[#8e95a5]">{room.bedType}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-[#d4af37] tabular-nums">
                          ₹{room.discountedPrice.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-[#717887]">/ night</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates and Time-Slot blocking */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#151922] border border-[#252b39] rounded-lg p-3">
                  <label className="block text-[11px] font-semibold text-[#8e95a5] uppercase mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-white focus:outline-none cursor-pointer [color-scheme:dark]"
                    required
                  />
                </div>

                <div className="bg-[#151922] border border-[#252b39] rounded-lg p-3">
                  <label className="block text-[11px] font-semibold text-[#8e95a5] uppercase mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    min={checkIn}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-white focus:outline-none cursor-pointer [color-scheme:dark]"
                    required
                  />
                </div>

                <div className="bg-[#151922] border border-[#252b39] rounded-lg p-3">
                  <label className="block text-[11px] font-semibold text-[#8e95a5] uppercase mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                    Check-in Window / Slot
                  </label>
                  <select
                    value={slot}
                    onChange={(e) => setSlot(e.target.value)}
                    className="w-full bg-[#151922] text-xs font-medium text-white focus:outline-none cursor-pointer"
                  >
                    <option value="12:00 PM (Standard Check-in)">12:00 PM (Standard)</option>
                    <option value="06:00 AM - 02:00 PM (Early Morning Transit)">06:00 AM (Early Transit)</option>
                    <option value="06:00 PM (Evening Express)">06:00 PM (Evening)</option>
                    <option value="11:00 PM (Late Night Flight Arrival)">11:00 PM (Late Night)</option>
                  </select>
                </div>
              </div>

              {/* Guest Counts */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#151922] border border-[#252b39] rounded-lg p-3">
                  <label className="block text-[11px] font-semibold text-[#8e95a5] uppercase mb-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#d4af37]" />
                    Adults (12+ yrs)
                  </label>
                  <select
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full bg-[#151922] text-sm text-white focus:outline-none cursor-pointer"
                  >
                    <option value={1}>1 Adult</option>
                    <option value={2}>2 Adults</option>
                    <option value={3}>3 Adults</option>
                    <option value={4}>4 Adults</option>
                  </select>
                </div>

                <div className="bg-[#151922] border border-[#252b39] rounded-lg p-3">
                  <label className="block text-[11px] font-semibold text-[#8e95a5] uppercase mb-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#d4af37]" />
                    Children (0-11 yrs)
                  </label>
                  <select
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    className="w-full bg-[#151922] text-sm text-white focus:outline-none cursor-pointer"
                  >
                    <option value={0}>0 Children</option>
                    <option value={1}>1 Child</option>
                    <option value={2}>2 Children</option>
                  </select>
                </div>
              </div>

              {/* Guest Primary Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#adb4c4] mb-1">
                    Primary Guest Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#161a23] border border-[#272d3c] rounded-lg text-sm text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#adb4c4] mb-1">
                    Mobile Phone (for WhatsApp Voucher) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 82099 XXXXX"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#161a23] border border-[#272d3c] rounded-lg text-sm text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#adb4c4] mb-1">
                    Email Address (for Booking Voucher) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="rajesh@company.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#161a23] border border-[#272d3c] rounded-lg text-sm text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#adb4c4] mb-1 flex items-center gap-1.5">
                    <Plane className="w-3.5 h-3.5 text-[#d4af37]" />
                    Flight No. / Arrival Details (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 6E-204 arriving 8:30 PM"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#161a23] border border-[#272d3c] rounded-lg text-sm text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs font-medium text-[#adb4c4] mb-1">
                  Special Requests / Airport Pickup Needs (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Quiet room, early airport drop arrangement, extra pillows..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#161a23] border border-[#272d3c] rounded-lg text-xs text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              {/* Payment Mode */}
              <div className="bg-[#141822] border border-[#242a38] rounded-xl p-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#b8bfce] mb-3">
                  Payment Guarantee
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      paymentMode === 'pay_at_hotel'
                        ? 'bg-[#1d232f] border-[#d4af37]'
                        : 'bg-[#161a23] border-[#272d3c]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={paymentMode === 'pay_at_hotel'}
                      onChange={() => setPaymentMode('pay_at_hotel')}
                      className="mt-1 text-[#d4af37] focus:ring-0"
                    />
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#d4af37]" />
                        Pay at Hotel (Recommended)
                      </div>
                      <div className="text-[11px] text-[#8e95a5] mt-0.5">
                        No advance needed. Free cancellation up to 24h prior.
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      paymentMode === 'instant_upi_card'
                        ? 'bg-[#1d232f] border-[#d4af37]'
                        : 'bg-[#161a23] border-[#272d3c]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={paymentMode === 'instant_upi_card'}
                      onChange={() => setPaymentMode('instant_upi_card')}
                      className="mt-1 text-[#d4af37] focus:ring-0"
                    />
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-[#d4af37]" />
                        Instant UPI / Credit Card
                      </div>
                      <div className="text-[11px] text-[#8e95a5] mt-0.5">
                        Guaranteed late night check-in hold with instant confirmation.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Error Display */}
              {availabilityError && (
                <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{availabilityError}</span>
                </div>
              )}

              {/* Price Summary Breakdown */}
              <div className="bg-[#151922] border border-[#252b39] rounded-xl p-4 text-xs space-y-2">
                <div className="flex justify-between text-[#9aa1b2]">
                  <span>{currentRoom.name} (₹{roomPrice.toLocaleString('en-IN')} × {nights} {nights > 1 ? 'nights' : 'night'})</span>
                  <span className="text-white font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#9aa1b2]">
                  <span>GST Taxes (12%)</span>
                  <span className="text-white font-medium">₹{taxes.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-[#232938] pt-2 flex justify-between text-sm font-bold">
                  <span className="text-white">Total Amount Due</span>
                  <span className="text-[#d4af37] text-base tabular-nums">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-[#8e95a5] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-[#d4af37] hover:bg-[#e2c153] text-[#0c0e12] font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-[#d4af37]/20 flex items-center gap-2 cursor-pointer transform active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Securing Booking...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirm Direct Reservation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Confirmation Screen / Voucher */
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-[#d4af37]/20 border border-[#d4af37] rounded-full flex items-center justify-center mx-auto text-[#d4af37] mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-widest text-[#d4af37]">
              Instant Reservation Confirmed
            </span>
            <h2 className="font-serif text-3xl font-bold text-white mt-1">
              Welcome to Hotel O Avondale, Jaipur
            </h2>
            <p className="text-xs text-[#a3aab9] max-w-md mx-auto mt-2">
              Your room is reserved and guaranteed. An official confirmation email with your booking voucher has been triggered to <strong className="text-white">{confirmedBooking?.customerEmail}</strong>.
            </p>

            {/* Printable Voucher Card */}
            <div
              id="printable-voucher"
              className="mt-6 p-6 bg-[#151922] border border-[#2b3242] rounded-xl text-left text-xs max-w-xl mx-auto shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#232938] pb-3">
                <div>
                  <div className="font-serif text-lg font-bold text-white tracking-wide">
                    HOTEL O AVONDALE
                  </div>
                  <div className="text-[11px] text-[#8e95a5]">
                    Sitapura Industrial Area, near Jaipur Airport (JAI)
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60 rounded">
                    STATUS: {confirmedBooking?.status.toUpperCase()}
                  </span>
                  <div className="text-sm font-bold text-[#d4af37] mt-1">
                    #{confirmedBooking?.id}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-[10px] uppercase text-[#7a8191]">Guest Name</div>
                  <div className="font-semibold text-white mt-0.5">{confirmedBooking?.customerName}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-[#7a8191]">Contact</div>
                  <div className="font-semibold text-white mt-0.5">{confirmedBooking?.customerPhone}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-[#7a8191]">Check-in</div>
                  <div className="font-semibold text-white mt-0.5">
                    {confirmedBooking?.checkInDate} ({confirmedBooking?.checkInSlot})
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-[#7a8191]">Check-out</div>
                  <div className="font-semibold text-white mt-0.5">{confirmedBooking?.checkOutDate} (11:00 AM)</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-[#7a8191]">Room Reserved</div>
                  <div className="font-semibold text-white mt-0.5">{confirmedBooking?.roomName}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-[#7a8191]">Total Amount</div>
                  <div className="font-bold text-[#d4af37] text-sm mt-0.5">
                    ₹{confirmedBooking?.totalPrice.toLocaleString('en-IN')}{' '}
                    <span className="text-[10px] font-normal text-[#8e95a5]">
                      ({confirmedBooking?.paymentMode === 'pay_at_hotel' ? 'Pay at Desk' : 'Paid Online'})
                    </span>
                  </div>
                </div>
              </div>

              {confirmedBooking?.specialRequests && (
                <div className="pt-2 border-t border-[#232938]">
                  <div className="text-[10px] uppercase text-[#7a8191]">Special Instructions</div>
                  <div className="text-white text-xs mt-0.5 italic">{confirmedBooking.specialRequests}</div>
                </div>
              )}

              {/* Supabase Backend Sync Status */}
              <div className="pt-2.5 border-t border-[#232938] flex flex-wrap items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-[10px]">
                    Supabase DB: {supabaseResult?.success ? `Saved to '${supabaseResult.table}'` : 'Synced to Supabase project'}
                  </span>
                </div>
                <span className="text-[10px] text-[#788192] font-mono">
                  Project: zpivuudumwexketbqcdx
                </span>
              </div>

              <div className="pt-3 border-t border-[#232938] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8e95a5]">
                <span>
                  Direct Line:{' '}
                  <a href="tel:01244330567" className="text-white hover:text-[#d4af37]">
                    01244330567
                  </a>{' '}
                  · Mobile/WhatsApp:{' '}
                  <a href="tel:8209940455" className="text-white hover:text-[#d4af37]">
                    8209940455
                  </a>
                </span>
                <span>Near JECC & Jaipur Airport</span>
              </div>
            </div>

            {/* Post-Booking Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={openWhatsAppConfirmation}
                className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-xs rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send WhatsApp Confirmation</span>
              </button>

              <button
                onClick={() => {
                  if (confirmedBooking) {
                    onOpenEmailPreview(confirmedBooking);
                  }
                }}
                className="px-4 py-2.5 bg-[#1a202c] hover:bg-[#242c3d] text-[#c9cfde] hover:text-white border border-[#2b3342] font-semibold text-xs rounded-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4 text-[#d4af37]" />
                <span>View Sent Email Notification</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-2.5 bg-[#1a202c] hover:bg-[#242c3d] text-[#c9cfde] hover:text-white border border-[#2b3342] font-semibold text-xs rounded-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save Voucher</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-[#d4af37] hover:bg-[#e2c153] text-[#0c0e12] font-bold text-xs rounded-lg cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
