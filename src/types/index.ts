export type RoomType = 'deluxe' | 'executive' | 'club' | 'transit';

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  basePrice: number; // in INR
  discountedPrice: number;
  capacity: {
    adults: number;
    children: number;
  };
  bedType: string;
  size: string;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  shortHighlights: string[];
  amenities: string[];
  isAvailable: boolean;
  inventoryCount: number;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Booking {
  id: string; // e.g. HOA-8921
  roomId: string;
  roomName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  checkInSlot?: string;
  nights: number;
  guests: {
    adults: number;
    children: number;
  };
  totalPrice: number;
  status: BookingStatus;
  specialRequests?: string;
  createdAt: string;
  paymentMode: 'pay_at_hotel' | 'instant_upi_card';
  paymentStatus: 'paid' | 'pending';
  whatsappNotified: boolean;
  emailNotified: boolean;
}

export interface BlockedDate {
  id: string;
  roomId: string; // 'all' or room ID
  startDate: string;
  endDate: string;
  reason: 'maintenance' | 'fully_booked' | 'private_event' | 'airport_transit_block';
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  totalSpent: number;
  lastBookingDate: string;
  notes?: string;
}

export interface AdminStats {
  totalBookings: number;
  confirmedBookings: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  occupancyRate: number;
  totalRevenue: number;
  activeRooms: number;
  pendingReviewCount: number;
}

export interface AdminAccount {
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  passwordHash: string;
  recoveryPin?: string;
  createdAt: string;
  slotClaimed: boolean;
}

export interface AvailabilityCheckResult {
  isAvailable: boolean;
  conflictingDates?: string[];
  message?: string;
}
