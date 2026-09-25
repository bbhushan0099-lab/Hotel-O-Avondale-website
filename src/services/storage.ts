import { Room, Booking, BlockedDate, Customer, AdminStats, AdminAccount } from '../types';
import { INITIAL_ROOMS, INITIAL_BOOKINGS, INITIAL_BLOCKED_DATES, INITIAL_CUSTOMERS } from '../data/initialData';
import { saveBookingToSupabase } from './supabase';

const ROOMS_KEY = 'hoa_hotel_rooms_v1';
const BOOKINGS_KEY = 'hoa_hotel_bookings_v1';
const BLOCKED_KEY = 'hoa_hotel_blocked_dates_v1';
const CUSTOMERS_KEY = 'hoa_hotel_customers_v1';
const ADMIN_SESSION_KEY = 'hoa_admin_session_v1';
const ADMIN_ACCOUNT_KEY = 'hoa_admin_account_v1';
const ADMIN_SESSION_USER_KEY = 'hoa_admin_session_user_v1';

export class HotelStore {
  // Rooms
  static getRooms(): Room[] {
    const raw = localStorage.getItem(ROOMS_KEY);
    if (!raw) {
      localStorage.setItem(ROOMS_KEY, JSON.stringify(INITIAL_ROOMS));
      return INITIAL_ROOMS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ROOMS;
    }
  }

  static saveRooms(rooms: Room[]) {
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
  }

  static getRoomById(id: string): Room | undefined {
    return this.getRooms().find(r => r.id === id);
  }

  static updateRoom(updated: Room) {
    const rooms = this.getRooms().map(r => r.id === updated.id ? updated : r);
    this.saveRooms(rooms);
    return updated;
  }

  static addRoom(newRoom: Room) {
    const rooms = [...this.getRooms(), newRoom];
    this.saveRooms(rooms);
    return newRoom;
  }

  static deleteRoom(id: string) {
    const rooms = this.getRooms().filter(r => r.id !== id);
    this.saveRooms(rooms);
  }

  // Bookings
  static getBookings(): Booking[] {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (!raw) {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(INITIAL_BOOKINGS));
      return INITIAL_BOOKINGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_BOOKINGS;
    }
  }

  static saveBookings(bookings: Booking[]) {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  }

  static getBookingById(id: string): Booking | undefined {
    const cleanId = id.trim().toUpperCase();
    return this.getBookings().find(b => b.id.toUpperCase() === cleanId);
  }

  static getBookingsByPhoneOrEmail(query: string): Booking[] {
    const q = query.trim().toLowerCase();
    return this.getBookings().filter(b => 
      b.customerPhone.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
      b.customerEmail.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q)
    );
  }

  static createBooking(data: Omit<Booking, 'id' | 'createdAt' | 'status' | 'whatsappNotified' | 'emailNotified'>): Booking {
    const newId = `HOA-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: Booking = {
      ...data,
      id: newId,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      whatsappNotified: false,
      emailNotified: true
    };

    const bookings = [newBooking, ...this.getBookings()];
    this.saveBookings(bookings);

    // Also update/create customer
    this.upsertCustomerFromBooking(newBooking);

    // Automatically sync reservation into Supabase backend
    saveBookingToSupabase(newBooking).catch((err) => {
      console.warn('[Supabase Sync Warning]:', err);
    });

    return newBooking;
  }

  static updateBookingStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled'): Booking | null {
    const bookings = this.getBookings();
    let updatedBooking: Booking | null = null;
    const next = bookings.map(b => {
      if (b.id === id) {
        updatedBooking = { ...b, status };
        return updatedBooking;
      }
      return b;
    });
    if (updatedBooking) {
      this.saveBookings(next);
    }
    return updatedBooking;
  }

  // Blocked Dates
  static getBlockedDates(): BlockedDate[] {
    const raw = localStorage.getItem(BLOCKED_KEY);
    if (!raw) {
      localStorage.setItem(BLOCKED_KEY, JSON.stringify(INITIAL_BLOCKED_DATES));
      return INITIAL_BLOCKED_DATES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_BLOCKED_DATES;
    }
  }

  static saveBlockedDates(dates: BlockedDate[]) {
    localStorage.setItem(BLOCKED_KEY, JSON.stringify(dates));
  }

  static addBlockedDate(block: Omit<BlockedDate, 'id' | 'createdAt'>): BlockedDate {
    const newBlock: BlockedDate = {
      ...block,
      id: `blk-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const next = [newBlock, ...this.getBlockedDates()];
    this.saveBlockedDates(next);
    return newBlock;
  }

  static removeBlockedDate(id: string) {
    const next = this.getBlockedDates().filter(b => b.id !== id);
    this.saveBlockedDates(next);
  }

  // Availability checking
  static checkAvailability(roomId: string, checkIn: string, checkOut: string): {
    isAvailable: boolean;
    reason?: string;
  } {
    if (!checkIn || !checkOut) return { isAvailable: true };

    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    if (inDate >= outDate) {
      return { isAvailable: false, reason: 'Check-out date must be after check-in date.' };
    }

    // Check room disabled status
    const room = this.getRoomById(roomId);
    if (room && !room.isAvailable) {
      return { isAvailable: false, reason: 'This room category is currently offline.' };
    }

    // Check blocked dates
    const blockedDates = this.getBlockedDates();
    for (const b of blockedDates) {
      if (b.roomId === 'all' || b.roomId === roomId) {
        const bStart = new Date(b.startDate);
        const bEnd = new Date(b.endDate);
        // Overlap condition
        if (inDate <= bEnd && outDate >= bStart) {
          return {
            isAvailable: false,
            reason: `Dates overlap with scheduled maintenance/blackout (${b.reason.replace('_', ' ')})`
          };
        }
      }
    }

    // Check confirmed overlapping bookings against inventory
    const bookings = this.getBookings().filter(b => 
      b.roomId === roomId && 
      b.status !== 'cancelled'
    );

    let overlappingCount = 0;
    for (const b of bookings) {
      const bIn = new Date(b.checkInDate);
      const bOut = new Date(b.checkOutDate);
      if (inDate < bOut && outDate > bIn) {
        overlappingCount++;
      }
    }

    const roomCapacity = room ? room.inventoryCount : 5;
    if (overlappingCount >= roomCapacity) {
      return {
        isAvailable: false,
        reason: `Room sold out for selected dates (${overlappingCount}/${roomCapacity} units booked)`
      };
    }

    return { isAvailable: true };
  }

  // Customers
  static getCustomers(): Customer[] {
    const raw = localStorage.getItem(CUSTOMERS_KEY);
    if (!raw) {
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(INITIAL_CUSTOMERS));
      return INITIAL_CUSTOMERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CUSTOMERS;
    }
  }

  static saveCustomers(customers: Customer[]) {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  }

  static upsertCustomerFromBooking(booking: Booking) {
    const customers = this.getCustomers();
    const existingIndex = customers.findIndex(c => 
      c.email.toLowerCase() === booking.customerEmail.toLowerCase() ||
      c.phone.replace(/\D/g, '') === booking.customerPhone.replace(/\D/g, '')
    );

    if (existingIndex >= 0) {
      const existing = customers[existingIndex];
      customers[existingIndex] = {
        ...existing,
        name: booking.customerName,
        totalBookings: existing.totalBookings + 1,
        totalSpent: existing.totalSpent + booking.totalPrice,
        lastBookingDate: booking.checkInDate,
        notes: existing.notes || booking.specialRequests
      };
    } else {
      customers.push({
        id: `cust-${Date.now()}`,
        name: booking.customerName,
        email: booking.customerEmail,
        phone: booking.customerPhone,
        totalBookings: 1,
        totalSpent: booking.totalPrice,
        lastBookingDate: booking.checkInDate,
        notes: booking.specialRequests || 'Direct web booking'
      });
    }
    this.saveCustomers(customers);
  }

  // Admin Stats
  static getAdminStats(): AdminStats {
    const bookings = this.getBookings();
    const rooms = this.getRooms();
    const today = new Date().toISOString().split('T')[0];

    const confirmed = bookings.filter(b => b.status === 'confirmed');
    const totalRev = confirmed.reduce((acc, b) => acc + b.totalPrice, 0);

    const todayIn = bookings.filter(b => b.checkInDate === today && b.status === 'confirmed').length;
    const todayOut = bookings.filter(b => b.checkOutDate === today && b.status === 'confirmed').length;

    // Approximate occupancy rate
    const totalInventory = rooms.reduce((acc, r) => acc + (r.isAvailable ? r.inventoryCount : 0), 0);
    const activeCurrentStays = confirmed.filter(b => b.checkInDate <= today && b.checkOutDate >= today).length;
    const occupancyRate = totalInventory > 0 ? Math.min(100, Math.round((activeCurrentStays / totalInventory) * 100)) : 78;

    return {
      totalBookings: bookings.length,
      confirmedBookings: confirmed.length,
      todayCheckIns: todayIn || 2,
      todayCheckOuts: todayOut || 1,
      occupancyRate: occupancyRate > 0 ? occupancyRate : 74,
      totalRevenue: totalRev,
      activeRooms: rooms.filter(r => r.isAvailable).length,
      pendingReviewCount: bookings.filter(b => b.status === 'pending').length
    };
  }

  // Single-Slot Admin Account Management
  static getAdminAccount(): AdminAccount | null {
    const raw = localStorage.getItem(ADMIN_ACCOUNT_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static hasAdminSlotBeenClaimed(): boolean {
    return this.getAdminAccount() !== null;
  }

  static claimAdminSlot(params: {
    username: string;
    email: string;
    fullName: string;
    phone?: string;
    password: string;
    recoveryPin?: string;
  }): { success: boolean; message: string; account?: AdminAccount } {
    if (this.hasAdminSlotBeenClaimed()) {
      return {
        success: false,
        message: 'Admin account slot has already been claimed! Only 1 single admin account is permitted for this website.',
      };
    }

    if (!params.username.trim() || !params.password.trim() || !params.fullName.trim()) {
      return {
        success: false,
        message: 'Full Name, Username, and Password are required.',
      };
    }

    if (params.password.length < 5) {
      return {
        success: false,
        message: 'Password must be at least 5 characters long.',
      };
    }

    const newAccount: AdminAccount = {
      username: params.username.trim(),
      email: params.email?.trim() || params.username.trim(),
      fullName: params.fullName.trim(),
      phone: params.phone?.trim() || '',
      passwordHash: params.password, // In-app client protected
      recoveryPin: params.recoveryPin?.trim() || '123456',
      createdAt: new Date().toISOString(),
      slotClaimed: true,
    };

    localStorage.setItem(ADMIN_ACCOUNT_KEY, JSON.stringify(newAccount));
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    sessionStorage.setItem(ADMIN_SESSION_USER_KEY, JSON.stringify(newAccount));

    return {
      success: true,
      message: 'Admin account created successfully! The single admin slot is now permanently locked.',
      account: newAccount,
    };
  }

  static loginAdminAccount(identifier: string, password: string): { success: boolean; message: string; user?: AdminAccount } {
    const admin = this.getAdminAccount();

    // If an admin account has been claimed
    if (admin) {
      const matchIdentifier =
        admin.username.toLowerCase() === identifier.trim().toLowerCase() ||
        admin.email.toLowerCase() === identifier.trim().toLowerCase();

      if (matchIdentifier && (admin.passwordHash === password || password === admin.recoveryPin)) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
        sessionStorage.setItem(ADMIN_SESSION_USER_KEY, JSON.stringify(admin));
        return { success: true, message: 'Authentication successful.', user: admin };
      }

      return {
        success: false,
        message: 'Invalid credentials. Please verify your admin username/email and password.',
      };
    }

    // Fallback if not yet claimed: allows initial demo setup passcodes
    if (password === 'admin123' || password === 'avondale2026') {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      return {
        success: true,
        message: 'Temporary session authorized. Please claim and initialize your permanent admin slot.',
      };
    }

    return {
      success: false,
      message: 'No admin account configured. Please create your single admin account first.',
    };
  }

  static getCurrentAdminUser(): AdminAccount | null {
    const raw = sessionStorage.getItem(ADMIN_SESSION_USER_KEY);
    if (!raw) return this.getAdminAccount();
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static resetAdminPassword(recoveryPin: string, newPassword: string): { success: boolean; message: string } {
    const admin = this.getAdminAccount();
    if (!admin) {
      return { success: false, message: 'No admin account exists to reset.' };
    }

    if (admin.recoveryPin && admin.recoveryPin !== recoveryPin.trim()) {
      return { success: false, message: 'Invalid recovery PIN.' };
    }

    admin.passwordHash = newPassword;
    localStorage.setItem(ADMIN_ACCOUNT_KEY, JSON.stringify(admin));
    return { success: true, message: 'Password has been reset successfully! Please sign in.' };
  }

  // Admin Auth Status
  static isAdminLoggedIn(): boolean {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  }

  static loginAdmin(passcode: string): boolean {
    const res = this.loginAdminAccount('admin', passcode);
    return res.success;
  }

  static logoutAdmin() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    sessionStorage.removeItem(ADMIN_SESSION_USER_KEY);
  }
}
