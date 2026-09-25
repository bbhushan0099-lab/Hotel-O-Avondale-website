import React, { useState, useEffect } from 'react';
import { Room, Booking } from './types';
import { HotelStore } from './services/storage';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { RoomsSection } from './components/RoomsSection';
import { AboutSection } from './components/AboutSection';
import { AmenitiesSection } from './components/AmenitiesSection';
import { GallerySection } from './components/GallerySection';
import { ReviewsSection } from './components/ReviewsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { MobileStickyBar } from './components/MobileStickyBar';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { BookingModal } from './components/BookingModal';
import { BookingLookupModal } from './components/BookingLookupModal';
import { AdminDashboard } from './components/AdminDashboard';
import { EmailVoucherModal } from './components/EmailVoucherModal';

export default function App() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);

  // Search parameters
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  interface SearchCriteria {
    checkIn: string;
    checkOut: string;
    slot: string;
    adults: number;
    roomType?: string;
  }

  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    checkIn: today,
    checkOut: tomorrowStr,
    slot: '12:00 PM (Standard Check-in)',
    adults: 2,
    roomType: undefined,
  });

  // Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [emailPreviewBooking, setEmailPreviewBooking] = useState<Booking | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadRooms = () => {
    const current = HotelStore.getRooms();
    setRooms(current);
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleHeroSearch = (criteria: {
    checkIn: string;
    checkOut: string;
    slot: string;
    adults: number;
    roomType?: string;
  }) => {
    setSearchCriteria(criteria);
    showToast(`Updated availability for ${criteria.checkIn} to ${criteria.checkOut}`);
  };

  const handleOpenBookingModal = (room?: Room) => {
    setSelectedRoomForBooking(room || null);
    setIsBookingModalOpen(true);
  };

  const handleOpenEmailPreview = (booking: Booking) => {
    setEmailPreviewBooking(booking);
    setIsEmailModalOpen(true);
  };

  const handleBookingSuccess = (booking: Booking) => {
    showToast(`Reservation #${booking.id} confirmed! Confirmation email dispatched.`);
  };

  return (
    <div className="min-h-screen bg-[#0c0e12] text-[#eae7e1] selection:bg-[#d4af37]/30 selection:text-white font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#161b24] border border-[#d4af37] text-white px-4 py-3 rounded-lg shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        onOpenBooking={() => handleOpenBookingModal()}
        onOpenLookup={() => setIsLookupModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        activeSection=""
      />

      {/* Hero with Interactive Search */}
      <Hero
        onSearch={handleHeroSearch}
        onOpenBooking={() => handleOpenBookingModal()}
      />

      {/* Accommodations & Real-time Room Availability */}
      <RoomsSection
        rooms={rooms}
        searchCriteria={searchCriteria}
        onSelectRoomForBooking={(room) => handleOpenBookingModal(room)}
      />

      {/* About & Airport Proximity */}
      <AboutSection />

      {/* Amenities & Dining Lounge */}
      <AmenitiesSection />

      {/* Image Gallery with Lightbox */}
      <GallerySection onBookNow={() => handleOpenBookingModal()} />

      {/* Attributable Reviews & Direct Booking Advantage */}
      <ReviewsSection />

      {/* Location, Driving Directions & Contact Desk */}
      <ContactSection />

      {/* Quiet Luxury Footer */}
      <Footer
        onOpenBooking={() => handleOpenBookingModal()}
        onOpenLookup={() => setIsLookupModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
      />

      {/* Mobile Sticky Booking Bar */}
      <MobileStickyBar onBookNow={() => handleOpenBookingModal()} />

      {/* WhatsApp Floating Action Button */}
      <FloatingWhatsApp />

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        selectedRoom={selectedRoomForBooking}
        rooms={rooms}
        initialDates={searchCriteria}
        onBookingSuccess={handleBookingSuccess}
        onOpenEmailPreview={handleOpenEmailPreview}
      />

      {/* Booking Lookup Modal */}
      <BookingLookupModal
        isOpen={isLookupModalOpen}
        onClose={() => setIsLookupModalOpen(false)}
        onOpenEmailPreview={handleOpenEmailPreview}
      />

      {/* Admin Dashboard */}
      <AdminDashboard
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onRoomsUpdated={loadRooms}
        onOpenEmailPreview={handleOpenEmailPreview}
      />

      {/* Email Notification Preview Modal */}
      <EmailVoucherModal
        booking={emailPreviewBooking}
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
      />
    </div>
  );
}
