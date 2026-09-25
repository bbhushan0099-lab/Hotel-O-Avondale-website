import React, { useState } from 'react';
import { Booking } from '../types';
import { X, Mail, Check, Copy, Printer, MapPin, Phone, ShieldCheck, Sparkles } from 'lucide-react';

interface EmailVoucherModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EmailVoucherModal: React.FC<EmailVoucherModalProps> = ({
  booking,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !booking) return null;

  const handleCopyText = () => {
    const text = `HOTEL O AVONDALE (JAIPUR) - OFFICIAL BOOKING CONFIRMATION
Booking Reference: ${booking.id}
Status: ${booking.status.toUpperCase()}
Guest Name: ${booking.customerName}
Room: ${booking.roomName}
Dates: ${booking.checkInDate} to ${booking.checkOutDate} (${booking.nights} nights)
Check-in Slot: ${booking.checkInSlot || 'Standard 12:00 PM'}
Total Price: ₹${booking.totalPrice.toLocaleString('en-IN')} (GST Included)
Payment: ${booking.paymentMode === 'pay_at_hotel' ? 'Pay at Desk on Arrival' : 'Prepaid Online'}

Address: Sitapura Industrial Area, Near Jaipur International Airport (JAI), Tonk Road, Jaipur, Rajasthan 302022
Direct Line: 01244330567 | Mobile/WhatsApp: 8209940455`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#11141c] border border-[#272e3d] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 relative shadow-2xl text-left">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#7f8696] hover:text-white bg-[#191e29] rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] rounded-lg">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Triggered Automated Email Notification</div>
            <div className="text-[11px] text-[#8e95a5]">
              Delivered to: <span className="text-white font-medium">{booking.customerEmail}</span>
            </div>
          </div>
        </div>

        {/* Email Client Preview Container */}
        <div className="border border-[#262c3a] rounded-xl overflow-hidden bg-white text-[#1a1e26] shadow-xl">
          {/* Email Header Bar */}
          <div className="bg-[#0e1117] text-white px-6 py-5 border-b border-[#242b38] flex items-center justify-between">
            <div>
              <div className="font-serif text-lg font-bold tracking-widest text-[#d4af37]">
                HOTEL O AVONDALE
              </div>
              <div className="text-[10px] text-[#9098a8] tracking-wider uppercase">
                Sitapura Industrial Area · Jaipur International Airport (JAI)
              </div>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
                CONFIRMED
              </span>
              <div className="text-xs font-mono text-[#d4af37] mt-1 font-bold">
                #{booking.id}
              </div>
            </div>
          </div>

          {/* Email Body */}
          <div className="p-6 space-y-5 text-xs text-[#2d3748]">
            <div>
              <div className="text-sm font-bold text-[#1a202c]">
                Dear {booking.customerName},
              </div>
              <p className="mt-1 leading-relaxed text-[#4a5568]">
                Thank you for choosing <strong>Hotel O Avondale, Jaipur</strong>. Your reservation is confirmed. We are delighted to host your stay moments from Jaipur International Airport.
              </p>
            </div>

            {/* Summary Box */}
            <div className="bg-[#f7fafc] border border-[#e2e8f0] rounded-lg p-4 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#718096] border-b border-[#edf2f7] pb-1.5">
                Stay Itinerary & Charges
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#718096] block text-[10px] uppercase">Reserved Room</span>
                  <span className="font-bold text-[#1a202c]">{booking.roomName}</span>
                </div>
                <div>
                  <span className="text-[#718096] block text-[10px] uppercase">Check-in Window</span>
                  <span className="font-bold text-[#1a202c]">
                    {booking.checkInDate} ({booking.checkInSlot || '12:00 PM'})
                  </span>
                </div>
                <div>
                  <span className="text-[#718096] block text-[10px] uppercase">Check-out</span>
                  <span className="font-bold text-[#1a202c]">{booking.checkOutDate} (11:00 AM)</span>
                </div>
                <div>
                  <span className="text-[#718096] block text-[10px] uppercase">Total Price (GST Included)</span>
                  <span className="font-bold text-[#b7791f] text-sm">
                    ₹{booking.totalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {booking.specialRequests && (
                <div className="pt-2 border-t border-[#e2e8f0] text-[11px] text-[#4a5568]">
                  <strong className="text-[#2d3748]">Guest Notes:</strong> {booking.specialRequests}
                </div>
              )}
            </div>

            {/* Airport & Location Directions */}
            <div className="p-3.5 bg-[#fffaf0] border border-[#feebc8] rounded-lg text-[11px] text-[#744210] space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#b7791f]" />
                Airport Shuttle & Directions
              </div>
              <p>
                Hotel O Avondale is located on Tonk Road, Sitapura Industrial Area (opposite JECC Exhibition Centre), just 10 minutes (6.5 km) from Jaipur International Airport. For 24/7 airport cab dispatch or arrival pickup, please ping our desk on WhatsApp or call us.
              </p>
            </div>

            {/* Verification QR simulation */}
            <div className="border-t border-[#edf2f7] pt-4 flex items-center justify-between text-[11px] text-[#718096]">
              <div>
                <div>Direct Line: 01244330567</div>
                <div>Mobile / WhatsApp: 8209940455</div>
              </div>
              <div className="text-right font-mono text-[10px] text-[#a0aec0]">
                E-TICKET SECURED · HOA-SYS-2026
              </div>
            </div>
          </div>
        </div>

        {/* Modal Controls */}
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            onClick={handleCopyText}
            className="px-4 py-2 bg-[#1a202c] hover:bg-[#252c3c] text-white text-xs font-semibold rounded-lg border border-[#2b3342] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Email Summary'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-[#1a202c] hover:bg-[#252c3c] text-white text-xs font-semibold rounded-lg border border-[#2b3342] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Email</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#d4af37] hover:bg-[#e2c153] text-[#0c0e12] font-bold text-xs rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
