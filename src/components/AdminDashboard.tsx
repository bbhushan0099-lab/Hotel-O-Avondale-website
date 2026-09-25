import React, { useState, useEffect } from 'react';
import { Room, Booking, BlockedDate, Customer, AdminStats, AdminAccount } from '../types';
import { HotelStore } from '../services/storage';
import {
  ShieldCheck,
  LogOut,
  Calendar,
  Users,
  DollarSign,
  Bed,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Plus,
  Trash2,
  Lock,
  BarChart3,
  Building,
  AlertTriangle,
  Eye,
  RefreshCw,
  X,
  FileSpreadsheet,
  Database,
  Check,
  Copy,
  UserCheck,
  UserPlus,
  Key,
  Download,
  MessageSquare,
  ExternalLink,
  FileText,
  Phone,
  Mail,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SCHEMA_SQL,
  testSupabaseConnection,
  saveBookingToSupabase
} from '../services/supabase';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomsUpdated: () => void;
  onOpenEmailPreview: (booking: Booking) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  onRoomsUpdated,
  onOpenEmailPreview,
}) => {
  // Authentication & Slot Management State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasSlotClaimed, setHasSlotClaimed] = useState<boolean>(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'recovery'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Registration Form Inputs (Single Slot)
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRecoveryPin, setRegRecoveryPin] = useState('');

  // Login Form Inputs
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Recovery Form Inputs
  const [recoveryPin, setRecoveryPin] = useState('');
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');

  // Status & Error Messages
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);

  // Active Tab: Default to 'bookings' to immediately display all bookings
  const [currentTab, setCurrentTab] = useState<'bookings' | 'overview' | 'rooms' | 'blocked' | 'customers' | 'supabase' | 'profile'>('bookings');

  // Supabase test and sync state
  const [supabaseTestState, setSupabaseTestState] = useState<{
    status: 'idle' | 'testing' | 'connected' | 'error';
    message?: string;
    tables?: string[];
  }>({ status: 'idle' });
  const [sqlCopied, setSqlCopied] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncSummary, setSyncSummary] = useState<string | null>(null);

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Selected Booking Drawer/Modal for Full Details
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Bookings filter & search
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Date block form
  const [blockRoomId, setBlockRoomId] = useState('all');
  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');
  const [blockReason, setBlockReason] = useState<'maintenance' | 'fully_booked' | 'private_event'>('maintenance');
  const [blockNotes, setBlockNotes] = useState('');

  // Edit Room Modal state
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const loadAllData = () => {
    setStats(HotelStore.getAdminStats());
    setBookings(HotelStore.getBookings());
    setRooms(HotelStore.getRooms());
    setBlockedDates(HotelStore.getBlockedDates());
    setCustomers(HotelStore.getCustomers());
    setCurrentAdmin(HotelStore.getCurrentAdminUser());
  };

  useEffect(() => {
    if (isOpen) {
      const claimed = HotelStore.hasAdminSlotBeenClaimed();
      const logged = HotelStore.isAdminLoggedIn();
      setHasSlotClaimed(claimed);
      setIsAuthenticated(logged);

      // If slot is not claimed, direct owner to the single registration slot
      if (!claimed) {
        setAuthMode('register');
      } else {
        setAuthMode('login');
      }

      if (logged) {
        loadAllData();
      }
      setAuthError(null);
      setAuthSuccessMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Single Admin Slot Registration
  const handleClaimAdminSlot = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMessage(null);

    if (HotelStore.hasAdminSlotBeenClaimed()) {
      setAuthError('The single administrator slot has already been claimed. No additional admin accounts can be created.');
      setAuthMode('login');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setAuthError('Passwords do not match. Please verify your password entries.');
      return;
    }

    if (regPassword.length < 5) {
      setAuthError('Password must be at least 5 characters long.');
      return;
    }

    const res = HotelStore.claimAdminSlot({
      fullName: regFullName,
      username: regUsername,
      email: regEmail || regUsername,
      phone: regPhone,
      password: regPassword,
      recoveryPin: regRecoveryPin || '123456',
    });

    if (res.success) {
      setIsAuthenticated(true);
      setHasSlotClaimed(true);
      setCurrentAdmin(res.account || null);
      setCurrentTab('bookings'); // Land directly on all bookings
      loadAllData();
    } else {
      setAuthError(res.message);
    }
  };

  // Admin Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMessage(null);

    const res = HotelStore.loginAdminAccount(loginIdentifier, loginPassword);
    if (res.success) {
      setIsAuthenticated(true);
      setCurrentAdmin(HotelStore.getCurrentAdminUser());
      setCurrentTab('bookings');
      loadAllData();
    } else {
      setAuthError(res.message);
    }
  };

  // Password Recovery via PIN
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMessage(null);

    const res = HotelStore.resetAdminPassword(recoveryPin, recoveryNewPassword);
    if (res.success) {
      setAuthSuccessMessage('Password reset successfully! Please sign in with your new password.');
      setAuthMode('login');
      setLoginPassword(recoveryNewPassword);
    } else {
      setAuthError(res.message);
    }
  };

  const handleLogout = () => {
    HotelStore.logoutAdmin();
    setIsAuthenticated(false);
    setLoginPassword('');
    setAuthError(null);
    setAuthSuccessMessage(null);
  };

  // Export All Bookings to CSV
  const handleExportCSV = () => {
    if (bookings.length === 0) return;
    const headers = [
      'Booking ID',
      'Status',
      'Guest Name',
      'Guest Phone',
      'Guest Email',
      'Room Category',
      'Check-in Date',
      'Check-out Date',
      'Nights',
      'Adults',
      'Children',
      'Arrival Slot',
      'Total Amount (INR)',
      'Payment Mode',
      'Payment Status',
      'Special Requests',
      'Created At'
    ];

    const rows = bookings.map((b) => [
      `"${b.id}"`,
      `"${b.status.toUpperCase()}"`,
      `"${(b.customerName || '').replace(/"/g, '""')}"`,
      `"${b.customerPhone || ''}"`,
      `"${b.customerEmail || ''}"`,
      `"${(b.roomName || '').replace(/"/g, '""')}"`,
      `"${b.checkInDate}"`,
      `"${b.checkOutDate}"`,
      b.nights,
      b.guests.adults,
      b.guests.children,
      `"${(b.checkInSlot || '').replace(/"/g, '""')}"`,
      b.totalPrice,
      `"${b.paymentMode}"`,
      `"${b.paymentStatus}"`,
      `"${(b.specialRequests || '').replace(/"/g, '""')}"`,
      `"${b.createdAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hotel_O_Avondale_All_Bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chat with Guest on WhatsApp
  const handleWhatsAppGuest = (booking: Booking) => {
    const cleanPhone = booking.customerPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const text = encodeURIComponent(
      `Namaste ${booking.customerName},\n\nGreetings from Hotel O Avondale, Jaipur! We are pleased to connect regarding your reservation #${booking.id} (${booking.roomName}) from ${booking.checkInDate} to ${booking.checkOutDate}.\n\nArrival Slot: ${booking.checkInSlot || 'Standard 12:00 PM'}\n\nPlease let us know if you require airport pick-up or have any special requests. We look forward to hosting you!`
    );
    window.open(`https://wa.me/${phoneWithCountry}?text=${text}`, '_blank');
  };

  // Status changes
  const handleUpdateStatus = (bookingId: string, newStatus: 'pending' | 'confirmed' | 'cancelled') => {
    HotelStore.updateBookingStatus(bookingId, newStatus);
    loadAllData();
    if (selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking({ ...selectedBooking, status: newStatus });
    }
  };

  // Room price/availability updates
  const handleSaveRoomEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;
    HotelStore.updateRoom(editingRoom);
    setEditingRoom(null);
    loadAllData();
    onRoomsUpdated();
  };

  const handleToggleRoomAvailability = (roomId: string) => {
    const target = rooms.find((r) => r.id === roomId);
    if (target) {
      const updated = { ...target, isAvailable: !target.isAvailable };
      HotelStore.updateRoom(updated);
      loadAllData();
      onRoomsUpdated();
    }
  };

  // Block dates
  const handleAddBlockedDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockStart || !blockEnd) return;
    HotelStore.addBlockedDate({
      roomId: blockRoomId,
      startDate: blockStart,
      endDate: blockEnd,
      reason: blockReason,
      notes: blockNotes,
    });
    setBlockStart('');
    setBlockEnd('');
    setBlockNotes('');
    loadAllData();
  };

  const handleRemoveBlockedDate = (id: string) => {
    HotelStore.removeBlockedDate(id);
    loadAllData();
  };

  // Supabase Handlers
  const handleTestSupabaseConnection = async () => {
    setSupabaseTestState({ status: 'testing' });
    try {
      const res = await testSupabaseConnection();
      if (res.connected) {
        setSupabaseTestState({
          status: 'connected',
          message:
            res.tablesFound.length > 0
              ? `Connected successfully! Detected table(s): ${res.tablesFound.join(', ')}`
              : 'Connected to Supabase project (zpivuudumwexketbqcdx). Ready for inserts.',
          tables: res.tablesFound,
        });
      } else {
        setSupabaseTestState({
          status: 'error',
          message: res.error || 'Could not verify tables on Supabase.',
        });
      }
    } catch (err: any) {
      setSupabaseTestState({
        status: 'error',
        message: err?.message || 'Error connecting to Supabase.',
      });
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2500);
  };

  const handleSyncAllToSupabase = async () => {
    setSyncingAll(true);
    setSyncSummary(null);
    let successCount = 0;
    let failCount = 0;

    for (const b of bookings) {
      const res = await saveBookingToSupabase(b);
      if (res.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    setSyncingAll(false);
    setSyncSummary(
      `Sync Complete: ${successCount} booking(s) saved to Supabase table. ${failCount > 0 ? `(${failCount} skipped/failed)` : ''}`
    );
  };

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter !== 'all' && b.status !== bookingFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.id.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.customerPhone.includes(q) ||
        b.customerEmail.toLowerCase().includes(q) ||
        b.roomName.toLowerCase().includes(q) ||
        (b.checkInSlot || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0f1218] border border-[#252c3b] rounded-2xl max-w-6xl w-full max-h-[94vh] overflow-y-auto p-5 sm:p-8 relative shadow-2xl text-left my-auto">
        {/* Close Modal */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#7f8696] hover:text-white bg-[#191e29] rounded-full transition-colors cursor-pointer"
          title="Close Admin Panel"
        >
          <X className="w-4 h-4" />
        </button>

        {!isAuthenticated ? (
          /* ========================================================================= */
          /* UNAUTHENTICATED STATE: SINGLE-SLOT REGISTRATION OR SECURE ADMIN LOGIN    */
          /* ========================================================================= */
          <div className="max-w-md mx-auto py-8">
            {/* Slot 1/1 Available (Unclaimed) -> Register Form */}
            {!hasSlotClaimed && authMode === 'register' && (
              <div className="text-center">
                <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/40 rounded-full flex items-center justify-center text-amber-400 mx-auto mb-3">
                  <UserPlus className="w-7 h-7" />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950/70 border border-amber-700/60 rounded-full text-[10px] font-bold uppercase tracking-wider text-amber-300 mb-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Single Admin Slot Available (1/1 Open)</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                  Create Master Admin Account
                </h2>
                <p className="text-xs text-[#9aa1b2] mt-2 mb-6 leading-relaxed">
                  Provide your administrator credentials to claim this property's single admin slot. Once registered, <strong>no other admin accounts can ever be created</strong>.
                </p>

                <form onSubmit={handleClaimAdminSlot} className="space-y-3.5 text-left">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9aa1b2] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bhanwar Singh (Hotel Owner)"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#161a24] border border-[#272e3f] rounded-lg text-xs text-white focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9aa1b2] mb-1">
                        Admin Username *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. admin or avondale_owner"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        className="w-full px-3.5 py-2 bg-[#161a24] border border-[#272e3f] rounded-lg text-xs text-white focus:border-[#d4af37] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9aa1b2] mb-1">
                        Official Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="owner@hotelavondale.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full px-3.5 py-2 bg-[#161a24] border border-[#272e3f] rounded-lg text-xs text-white focus:border-[#d4af37] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9aa1b2] mb-1">
                      Phone Number (WhatsApp Alerts)
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 82099 40455"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#161a24] border border-[#272e3f] rounded-lg text-xs text-white focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9aa1b2] mb-1">
                        Password *
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={5}
                        placeholder="Minimum 5 characters"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full px-3.5 py-2 bg-[#161a24] border border-[#272e3f] rounded-lg text-xs text-white focus:border-[#d4af37] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9aa1b2] mb-1">
                        Confirm Password *
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={5}
                        placeholder="Re-enter password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full px-3.5 py-2 bg-[#161a24] border border-[#272e3f] rounded-lg text-xs text-white focus:border-[#d4af37] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9aa1b2] mb-1">
                      Emergency Recovery PIN (6 Digits)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 849201"
                      value={regRecoveryPin}
                      onChange={(e) => setRegRecoveryPin(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#161a24] border border-[#272e3f] rounded-lg text-xs text-white font-mono focus:border-[#d4af37] focus:outline-none"
                    />
                    <p className="text-[10px] text-[#717887] mt-1">
                      Used to reset password if ever locked out.
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#8e95a5] pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showPassword}
                        onChange={(e) => setShowPassword(e.target.checked)}
                        className="rounded bg-[#161a24] border-[#272e3f] text-[#d4af37] focus:ring-0"
                      />
                      <span>Show password</span>
                    </label>
                  </div>

                  {authError && (
                    <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-lg text-xs text-rose-300">
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#d4af37] hover:bg-[#e2c153] text-[#0c0e12] font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md shadow-[#d4af37]/20 cursor-pointer flex items-center justify-center gap-2 mt-4"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Claim Slot & Create Admin Account</span>
                  </button>
                </form>
              </div>
            )}

            {/* Slot Claimed (0/1 Available) -> Normal Secure Admin Sign-In */}
            {(hasSlotClaimed || authMode === 'login') && (
              <div className="text-center">
                <div className="w-14 h-14 bg-[#d4af37]/10 border border-[#d4af37]/40 rounded-full flex items-center justify-center text-[#d4af37] mx-auto mb-3">
                  <Lock className="w-7 h-7" />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/70 border border-emerald-700/60 rounded-full text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Single Admin Slot Claimed · Registration Locked (0/1 Slots)</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                  Administrator Login
                </h2>
                <p className="text-xs text-[#8e95a5] mt-1.5 mb-6">
                  Sign in to view all guest bookings, modify inventory, and manage hotel reservations.
                </p>

                {authSuccessMessage && (
                  <div className="p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-lg text-xs text-emerald-300 mb-4 text-left">
                    {authSuccessMessage}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#9aa1b2] mb-1">
                      Admin Username or Email
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter username or email"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#161a24] border border-[#272e3f] rounded-lg text-sm text-white focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#9aa1b2]">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthError(null);
                          setAuthMode('recovery');
                        }}
                        className="text-[11px] text-[#d4af37] hover:underline cursor-pointer"
                      >
                        Forgot / Reset via PIN?
                      </button>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter admin password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#161a24] border border-[#272e3f] rounded-lg text-sm text-white focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#8e95a5]">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showPassword}
                        onChange={(e) => setShowPassword(e.target.checked)}
                        className="rounded bg-[#161a24] border-[#272e3f] text-[#d4af37] focus:ring-0"
                      />
                      <span>Show password</span>
                    </label>
                  </div>

                  {authError && (
                    <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-lg text-xs text-rose-300">
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#d4af37] hover:bg-[#e2c153] text-[#0c0e12] font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md shadow-[#d4af37]/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Sign In to Admin Panel</span>
                  </button>

                  <div className="p-3 bg-[#131720] border border-[#222938] rounded-lg text-[11px] text-[#717887] text-center mt-3">
                    <span className="font-semibold text-[#8e95a5]">Strict Single-Slot Policy:</span> No other users can register an admin account on this website.
                  </div>
                </form>
              </div>
            )}

            {/* Emergency PIN Password Reset */}
            {authMode === 'recovery' && (
              <div className="text-center">
                <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/40 rounded-full flex items-center justify-center text-amber-400 mx-auto mb-3">
                  <Key className="w-7 h-7" />
                </div>

                <h2 className="font-serif text-2xl font-bold text-white mt-1">
                  Reset Password with Recovery PIN
                </h2>
                <p className="text-xs text-[#9aa1b2] mt-1.5 mb-6">
                  Enter the 6-digit Emergency PIN configured during your admin slot registration.
                </p>

                <form onSubmit={handleResetPassword} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#9aa1b2] mb-1">
                      Emergency Recovery PIN
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 6-digit PIN"
                      value={recoveryPin}
                      onChange={(e) => setRecoveryPin(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#161a24] border border-[#272e3f] rounded-lg text-sm text-white font-mono focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#9aa1b2] mb-1">
                      New Admin Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={5}
                      placeholder="Minimum 5 characters"
                      value={recoveryNewPassword}
                      onChange={(e) => setRecoveryNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#161a24] border border-[#272e3f] rounded-lg text-sm text-white focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>

                  {authError && (
                    <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-lg text-xs text-rose-300">
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#d4af37] hover:bg-[#e2c153] text-[#0c0e12] font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  >
                    Confirm & Update Password
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthError(null);
                      setAuthMode('login');
                    }}
                    className="w-full py-2 text-xs text-[#8e95a5] hover:text-white transition-colors cursor-pointer text-center"
                  >
                    &larr; Back to Login
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* AUTHENTICATED ADMIN CONSOLE: VIEW ALL BOOKINGS, INVENTORY & OPERATIONS    */
          /* ========================================================================= */
          <div>
            {/* Top Bar with Admin Profile & Single-Slot Status */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#212735] pb-5 mb-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800/60 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    SINGLE ADMIN SLOT: LOCKED (1/1)
                  </span>
                  <span className="text-xs text-[#8e95a5]">· Hotel O Avondale (Jaipur)</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                  Administrator Console
                </h2>
                <div className="text-xs text-[#9aa1b2] mt-0.5">
                  Logged in as <strong className="text-white">{currentAdmin?.fullName || 'Property Owner'}</strong> ({currentAdmin?.username || currentAdmin?.email || 'admin'})
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 bg-[#1b2230] hover:bg-[#252f44] text-[#d4af37] border border-[#2e374c] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Download All Bookings Spreadsheet"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV ({bookings.length})</span>
                </button>

                <button
                  onClick={loadAllData}
                  className="p-2 bg-[#161a24] border border-[#272e3f] text-[#8e95a5] hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Refresh metrics & bookings"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  onClick={handleLogout}
                  className="px-3.5 py-2 bg-[#161a24] border border-[#272e3f] hover:border-rose-800 text-xs font-semibold text-[#b8bfce] hover:text-rose-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-[#212735] pb-3 mb-6">
              {[
                { id: 'bookings', label: `All Bookings (${bookings.length})`, icon: Calendar },
                { id: 'overview', label: 'Analytics & Revenue', icon: BarChart3 },
                { id: 'rooms', label: `Rooms & Rates (${rooms.length})`, icon: Bed },
                { id: 'blocked', label: `Blocked Dates (${blockedDates.length})`, icon: AlertTriangle },
                { id: 'customers', label: `Customer Directory (${customers.length})`, icon: Users },
                { id: 'supabase', label: 'Supabase Backend', icon: Database },
                { id: 'profile', label: 'Admin Security', icon: Key },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id as any)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                      currentTab === tab.id
                        ? 'bg-[#d4af37] text-[#0c0e12] shadow-sm font-bold'
                        : 'bg-[#151922] text-[#8e95a5] hover:text-white hover:bg-[#1a202c]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ========================================================================= */}
            {/* TAB 1: ALL WEBSITE BOOKINGS (THE PRIMARY FOCUS)                            */}
            {/* ========================================================================= */}
            {currentTab === 'bookings' && (
              <div className="space-y-4">
                {/* Bookings Header & Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-[#141822] border border-[#232936] rounded-xl">
                    <div className="text-[10px] uppercase font-bold text-[#8e95a5]">Total Website Bookings</div>
                    <div className="text-2xl font-serif font-bold text-white mt-0.5 tabular-nums">
                      {bookings.length}
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#141822] border border-[#232936] rounded-xl">
                    <div className="text-[10px] uppercase font-bold text-emerald-400">Confirmed Bookings</div>
                    <div className="text-2xl font-serif font-bold text-emerald-300 mt-0.5 tabular-nums">
                      {bookings.filter((b) => b.status === 'confirmed').length}
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#141822] border border-[#232936] rounded-xl">
                    <div className="text-[10px] uppercase font-bold text-amber-400">Pending Review</div>
                    <div className="text-2xl font-serif font-bold text-amber-300 mt-0.5 tabular-nums">
                      {bookings.filter((b) => b.status === 'pending').length}
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#141822] border border-[#232936] rounded-xl">
                    <div className="text-[10px] uppercase font-bold text-[#d4af37]">Direct Revenue</div>
                    <div className="text-2xl font-serif font-bold text-white mt-0.5 tabular-nums">
                      ₹{bookings
                        .filter((b) => b.status === 'confirmed')
                        .reduce((sum, b) => sum + b.totalPrice, 0)
                        .toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-1.5 p-1 bg-[#141822] border border-[#232936] rounded-lg w-full sm:w-auto">
                    {(['all', 'confirmed', 'pending', 'cancelled'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setBookingFilter(st)}
                        className={`px-3 py-1 text-xs font-medium rounded-md capitalize cursor-pointer transition-colors ${
                          bookingFilter === st
                            ? 'bg-[#d4af37] text-[#0c0e12] font-bold'
                            : 'text-[#8e95a5] hover:text-white'
                        }`}
                      >
                        {st} ({st === 'all' ? bookings.length : bookings.filter((b) => b.status === st).length})
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 text-[#7f8696] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search name, phone, ref ID, room..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-[#141822] border border-[#232936] rounded-lg text-xs text-white focus:border-[#d4af37] focus:outline-none placeholder:text-[#5e6678]"
                    />
                  </div>
                </div>

                {/* All Bookings Table */}
                <div className="bg-[#141822] border border-[#232936] rounded-xl overflow-hidden overflow-x-auto shadow-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#181d27] text-[11px] uppercase tracking-wider text-[#8e95a5] border-b border-[#232936]">
                      <tr>
                        <th className="p-3 font-semibold">Ref ID</th>
                        <th className="p-3 font-semibold">Guest Contact</th>
                        <th className="p-3 font-semibold">Room & Duration</th>
                        <th className="p-3 font-semibold">Stay Dates & Slot</th>
                        <th className="p-3 font-semibold">Total Price</th>
                        <th className="p-3 font-semibold">Status</th>
                        <th className="p-3 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#202633] text-[#b8bfce]">
                      {filteredBookings.length > 0 ? (
                        filteredBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-[#191f2b] transition-colors">
                            <td className="p-3">
                              <span className="font-mono font-bold text-white bg-[#0e1117] px-2 py-0.5 rounded border border-[#252d3d]">
                                {b.id}
                              </span>
                              <div className="text-[10px] text-[#717887] mt-1 font-mono">
                                {new Date(b.createdAt).toLocaleDateString()}
                              </div>
                            </td>

                            <td className="p-3">
                              <div className="font-semibold text-white">{b.customerName}</div>
                              <div className="text-[11px] text-[#8e95a5] flex items-center gap-1 font-mono">
                                <Phone className="w-2.5 h-2.5 text-[#d4af37]" />
                                <span>{b.customerPhone}</span>
                              </div>
                              <div className="text-[10px] text-[#717887] truncate max-w-[160px]">
                                {b.customerEmail}
                              </div>
                            </td>

                            <td className="p-3">
                              <div className="font-medium text-white">{b.roomName}</div>
                              <div className="text-[10px] text-[#8e95a5]">
                                {b.nights} Night(s) · {b.guests.adults} Adult(s) {b.guests.children > 0 ? `+ ${b.guests.children} Child` : ''}
                              </div>
                            </td>

                            <td className="p-3 font-mono text-[11px]">
                              <div className="text-white">In: {b.checkInDate}</div>
                              <div className="text-[#8e95a5]">Out: {b.checkOutDate}</div>
                              <div className="text-[10px] text-amber-300/80 font-sans mt-0.5">
                                {b.checkInSlot || 'Standard 12:00 PM'}
                              </div>
                            </td>

                            <td className="p-3">
                              <div className="font-bold text-[#d4af37] text-sm tabular-nums">
                                ₹{b.totalPrice.toLocaleString('en-IN')}
                              </div>
                              <div className="text-[10px] text-[#788090] capitalize">
                                {b.paymentMode === 'instant_upi_card' ? 'Online UPI/Card' : 'Pay at Hotel Desk'}
                              </div>
                              <span
                                className={`inline-block px-1.5 py-0.2 text-[9px] rounded uppercase font-semibold mt-0.5 ${
                                  b.paymentStatus === 'paid'
                                    ? 'bg-emerald-950/80 text-emerald-300'
                                    : 'bg-[#212735] text-[#9ba1b0]'
                                }`}
                              >
                                {b.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                              </span>
                            </td>

                            <td className="p-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                                  b.status === 'confirmed'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                                    : b.status === 'pending'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                                    : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                                }`}
                              >
                                {b.status === 'confirmed' && <CheckCircle2 className="w-3 h-3" />}
                                {b.status === 'pending' && <Clock className="w-3 h-3" />}
                                {b.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                                <span>{b.status}</span>
                              </span>
                            </td>

                            <td className="p-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Quick Confirm */}
                                {b.status !== 'confirmed' && (
                                  <button
                                    onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                                    className="p-1.5 text-emerald-400 hover:bg-emerald-950/60 rounded border border-emerald-900/40 transition-colors cursor-pointer"
                                    title="Approve & Confirm Reservation"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {/* Quick Cancel */}
                                {b.status !== 'cancelled' && (
                                  <button
                                    onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                                    className="p-1.5 text-rose-400 hover:bg-rose-950/60 rounded border border-rose-900/40 transition-colors cursor-pointer"
                                    title="Cancel Reservation"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {/* WhatsApp Message */}
                                <button
                                  onClick={() => handleWhatsAppGuest(b)}
                                  className="p-1.5 text-emerald-400 hover:bg-emerald-950/60 rounded border border-emerald-900/40 transition-colors cursor-pointer"
                                  title="Chat with Guest on WhatsApp"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>

                                {/* Automated Voucher Preview */}
                                <button
                                  onClick={() => onOpenEmailPreview(b)}
                                  className="p-1.5 text-[#d4af37] hover:bg-[#d4af37]/10 rounded border border-[#d4af37]/30 transition-colors cursor-pointer"
                                  title="View Automated Voucher"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {/* Full Booking Drawer Details */}
                                <button
                                  onClick={() => setSelectedBooking(b)}
                                  className="px-2 py-1 bg-[#1a212e] hover:bg-[#232c3d] text-white rounded text-[11px] font-semibold border border-[#2b3548] transition-colors cursor-pointer"
                                  title="View Full Booking Details"
                                >
                                  Details
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-[#8e95a5]">
                            No bookings found matching your search criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: OVERVIEW & ANALYTICS                                               */}
            {/* ========================================================================= */}
            {currentTab === 'overview' && stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 bg-[#141822] border border-[#232936] rounded-xl">
                    <div className="text-xs text-[#8e95a5] uppercase tracking-wider">Total Bookings</div>
                    <div className="text-3xl font-serif font-bold text-white mt-1 tabular-nums">
                      {stats.totalBookings}
                    </div>
                    <div className="text-[11px] text-emerald-400 mt-1">
                      {stats.confirmedBookings} Confirmed · {stats.pendingReviewCount} Pending
                    </div>
                  </div>

                  <div className="p-5 bg-[#141822] border border-[#232936] rounded-xl">
                    <div className="text-xs text-[#8e95a5] uppercase tracking-wider">Occupancy Rate</div>
                    <div className="text-3xl font-serif font-bold text-[#d4af37] mt-1 tabular-nums">
                      {stats.occupancyRate}%
                    </div>
                    <div className="text-[11px] text-[#8e95a5] mt-1">
                      Sitapura Airport corridor demand index
                    </div>
                  </div>

                  <div className="p-5 bg-[#141822] border border-[#232936] rounded-xl">
                    <div className="text-xs text-[#8e95a5] uppercase tracking-wider">Today's Check-ins</div>
                    <div className="text-3xl font-serif font-bold text-white mt-1 tabular-nums">
                      {stats.todayCheckIns}
                    </div>
                    <div className="text-[11px] text-[#8e95a5] mt-1">
                      {stats.todayCheckOuts} Scheduled Check-outs
                    </div>
                  </div>

                  <div className="p-5 bg-[#141822] border border-[#232936] rounded-xl">
                    <div className="text-xs text-[#8e95a5] uppercase tracking-wider">Total Revenue (Direct)</div>
                    <div className="text-3xl font-serif font-bold text-white mt-1 tabular-nums">
                      ₹{stats.totalRevenue.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-[#d4af37] mt-1 font-medium">
                      Direct Website Booking Inflows
                    </div>
                  </div>
                </div>

                {/* Quick Switch to Bookings */}
                <div className="p-5 bg-[#141822] border border-[#232936] rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-base font-bold text-white">
                      Looking for the complete reservations roster?
                    </h4>
                    <p className="text-xs text-[#8e95a5] mt-0.5">
                      View all guest contact records, payment receipts, and stay durations.
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentTab('bookings')}
                    className="px-4 py-2 bg-[#d4af37] hover:bg-[#e2c153] text-[#0c0e12] font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Open All Bookings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: ROOMS & RATES MANAGEMENT                                           */}
            {/* ========================================================================= */}
            {currentTab === 'rooms' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-white">
                    Inventory & Dynamic Pricing Management
                  </h3>
                  <span className="text-xs text-[#8e95a5]">
                    Changes reflect immediately on the guest booking engine
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className="p-5 bg-[#141822] border border-[#232936] rounded-xl flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">
                              {room.type}
                            </span>
                            <h4 className="font-serif text-lg font-bold text-white">
                              {room.name}
                            </h4>
                            <div className="text-xs text-[#8e95a5] mt-0.5">
                              Inventory Units: <strong className="text-white">{room.inventoryCount}</strong>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-bold text-[#d4af37] tabular-nums">
                              ₹{room.discountedPrice.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-[#717887]">
                              Rack Rate: ₹{room.basePrice.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-[#9aa1b2] mt-3 line-clamp-2">
                          {room.description}
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-[#232936] flex items-center justify-between">
                        <button
                          onClick={() => handleToggleRoomAvailability(room.id)}
                          className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                            room.isAvailable
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {room.isAvailable ? 'Status: Active Online' : 'Status: Offline'}
                        </button>

                        <button
                          onClick={() => setEditingRoom(room)}
                          className="px-3 py-1 bg-[#1c222e] hover:bg-[#252d3d] text-xs font-semibold text-[#c8cee0] rounded border border-[#2e3648] transition-colors cursor-pointer"
                        >
                          Adjust Price / Inventory
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 4: BLOCKED DATES & MAINTENANCE                                        */}
            {/* ========================================================================= */}
            {currentTab === 'blocked' && (
              <div className="space-y-6">
                <div className="p-5 bg-[#141822] border border-[#232936] rounded-xl">
                  <h3 className="font-serif text-lg font-bold text-white mb-2">
                    Block Dates for Maintenance or Exclusive Events
                  </h3>
                  <p className="text-xs text-[#9aa1b2] mb-4">
                    Rooms blocked here will automatically show as unavailable on the public booking calendar.
                  </p>

                  <form onSubmit={handleAddBlockedDate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#8e95a5] uppercase mb-1">Target Room</label>
                      <select
                        value={blockRoomId}
                        onChange={(e) => setBlockRoomId(e.target.value)}
                        className="w-full bg-[#181d27] border border-[#252b39] text-xs text-white p-2 rounded focus:outline-none cursor-pointer"
                      >
                        <option value="all">All Property Rooms</option>
                        {rooms.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#8e95a5] uppercase mb-1">Start Date</label>
                      <input
                        type="date"
                        required
                        value={blockStart}
                        onChange={(e) => setBlockStart(e.target.value)}
                        className="w-full bg-[#181d27] border border-[#252b39] text-xs text-white p-2 rounded focus:outline-none [color-scheme:dark]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#8e95a5] uppercase mb-1">End Date</label>
                      <input
                        type="date"
                        required
                        value={blockEnd}
                        onChange={(e) => setBlockEnd(e.target.value)}
                        className="w-full bg-[#181d27] border border-[#252b39] text-xs text-white p-2 rounded focus:outline-none [color-scheme:dark]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#8e95a5] uppercase mb-1">Reason</label>
                      <select
                        value={blockReason}
                        onChange={(e) => setBlockReason(e.target.value as any)}
                        className="w-full bg-[#181d27] border border-[#252b39] text-xs text-white p-2 rounded focus:outline-none cursor-pointer"
                      >
                        <option value="maintenance">Maintenance / Renovation</option>
                        <option value="fully_booked">Sold Out via Desk/JECC</option>
                        <option value="private_event">Private Corporate Event</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full py-2 bg-[#d4af37] hover:bg-[#e2c153] text-[#0c0e12] font-bold text-xs uppercase tracking-wider rounded cursor-pointer transition-all"
                      >
                        Add Block Rule
                      </button>
                    </div>
                  </form>
                </div>

                {/* List of active blocked dates */}
                <div className="bg-[#141822] border border-[#232936] rounded-xl p-5">
                  <h4 className="font-serif text-base font-bold text-white mb-3">
                    Active Blackout & Maintenance Schedules
                  </h4>
                  {blockedDates.length > 0 ? (
                    <div className="divide-y divide-[#202633] text-xs">
                      {blockedDates.map((b) => (
                        <div key={b.id} className="py-3 flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-white flex items-center gap-2">
                              <span>
                                {b.roomId === 'all'
                                  ? 'Entire Hotel Block'
                                  : rooms.find((r) => r.id === b.roomId)?.name || b.roomId}
                              </span>
                              <span className="px-2 py-0.5 text-[10px] bg-amber-950 text-amber-300 border border-amber-800 rounded uppercase">
                                {b.reason.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="text-[#8e95a5] text-[11px] mt-0.5">
                              Dates: <strong className="text-white">{b.startDate}</strong> to{' '}
                              <strong className="text-white">{b.endDate}</strong>
                              {b.notes && <span> · Note: {b.notes}</span>}
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemoveBlockedDate(b.id)}
                            className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                            title="Remove Block"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-[#8e95a5] py-4 text-center">
                      No active date blocks. All inventory is open for booking.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 5: CUSTOMER DIRECTORY                                                 */}
            {/* ========================================================================= */}
            {currentTab === 'customers' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-white">
                    Guest Directory & Loyalty History
                  </h3>
                  <div className="text-xs text-[#8e95a5]">
                    Total Registered Guests: <strong className="text-white">{customers.length}</strong>
                  </div>
                </div>

                <div className="bg-[#141822] border border-[#232936] rounded-xl overflow-hidden overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#181d27] text-[11px] uppercase tracking-wider text-[#8e95a5] border-b border-[#232936]">
                      <tr>
                        <th className="p-3">Guest Name</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Bookings Count</th>
                        <th className="p-3">Total Spend</th>
                        <th className="p-3">Last Stay</th>
                        <th className="p-3">Guest Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#202633] text-[#b8bfce]">
                      {customers.map((c) => (
                        <tr key={c.id} className="hover:bg-[#191f2b]">
                          <td className="p-3 font-semibold text-white">{c.name}</td>
                          <td className="p-3 font-mono">{c.phone}</td>
                          <td className="p-3">{c.email}</td>
                          <td className="p-3 tabular-nums font-bold text-white">{c.totalBookings}</td>
                          <td className="p-3 tabular-nums font-bold text-[#d4af37]">
                            ₹{c.totalSpent.toLocaleString('en-IN')}
                          </td>
                          <td className="p-3 font-mono text-[11px]">{c.lastBookingDate}</td>
                          <td className="p-3 text-[11px] text-[#9aa1b2] italic">{c.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 6: SUPABASE BACKEND INTEGRATION                                       */}
            {/* ========================================================================= */}
            {currentTab === 'supabase' && (
              <div className="space-y-6 text-xs text-[#b8bfce]">
                <div className="p-6 bg-[#141822] border border-[#232936] rounded-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#212735] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-serif text-lg font-bold text-white">
                          Supabase Project Connected
                        </span>
                      </div>
                      <p className="text-xs text-[#8e95a5] mt-1">
                        All guest appointment bookings and inquiries are automatically synced to your Supabase project tables.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleTestSupabaseConnection}
                        disabled={supabaseTestState.status === 'testing'}
                        className="px-4 py-2 bg-[#1c222e] hover:bg-[#262f40] text-white border border-[#2e374a] font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${supabaseTestState.status === 'testing' ? 'animate-spin text-[#d4af37]' : 'text-[#d4af37]'}`} />
                        <span>{supabaseTestState.status === 'testing' ? 'Testing...' : 'Test Connection'}</span>
                      </button>

                      <button
                        onClick={handleSyncAllToSupabase}
                        disabled={syncingAll}
                        className="px-4 py-2 bg-[#d4af37] hover:bg-[#e2c153] text-[#0c0e12] font-bold text-xs rounded-lg transition-all shadow-md shadow-[#d4af37]/20 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                      >
                        <Database className="w-3.5 h-3.5" />
                        <span>{syncingAll ? 'Syncing...' : `Sync All Bookings (${bookings.length})`}</span>
                      </button>
                    </div>
                  </div>

                  {supabaseTestState.status !== 'idle' && (
                    <div
                      className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                        supabaseTestState.status === 'connected'
                          ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                          : supabaseTestState.status === 'testing'
                          ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                          : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {supabaseTestState.status === 'connected'
                            ? 'Connection Status:'
                            : supabaseTestState.status === 'testing'
                            ? 'Testing Connection...'
                            : 'Connection Warning:'}
                        </span>
                        <span>{supabaseTestState.message}</span>
                      </div>
                    </div>
                  )}

                  {syncSummary && (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-emerald-300 text-xs font-medium">
                      {syncSummary}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-3.5 bg-[#181d27] border border-[#262c3b] rounded-lg">
                      <div className="text-[10px] uppercase font-bold text-[#8e95a5]">Project ID</div>
                      <div className="font-mono text-sm font-semibold text-white mt-1">
                        zpivuudumwexketbqcdx
                      </div>
                      <div className="text-[10px] text-[#717887] mt-0.5">
                        Region: supabase.co (Cloud Hosted)
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#181d27] border border-[#262c3b] rounded-lg">
                      <div className="text-[10px] uppercase font-bold text-[#8e95a5]">Supabase REST API Endpoint</div>
                      <div className="font-mono text-xs font-semibold text-white mt-1 truncate">
                        {SUPABASE_URL}
                      </div>
                      <div className="text-[10px] text-[#717887] mt-0.5">
                        Public Client API
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-[#141822] border border-[#232936] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-serif text-base font-bold text-white">
                        Supabase SQL Table Schema (`bookings` & `inquiries`)
                      </h4>
                      <p className="text-[11px] text-[#8e95a5] mt-0.5">
                        If you have not created the <code className="text-[#d4af37]">bookings</code> table in your Supabase project yet, run this in your Supabase SQL Editor:
                      </p>
                    </div>

                    <button
                      onClick={handleCopySql}
                      className="px-3.5 py-1.5 bg-[#1f2533] hover:bg-[#283042] text-white border border-[#2f374a] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {sqlCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{sqlCopied ? 'Copied SQL!' : 'Copy SQL Script'}</span>
                    </button>
                  </div>

                  <div className="relative">
                    <pre className="p-4 bg-[#0a0c10] border border-[#212735] rounded-lg text-[11px] font-mono text-[#a6adc0] overflow-x-auto max-h-60 selection:bg-[#d4af37]/30">
                      {SUPABASE_SCHEMA_SQL}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 7: ADMIN SECURITY & SINGLE-SLOT PROFILE                               */}
            {/* ========================================================================= */}
            {currentTab === 'profile' && (
              <div className="space-y-6 text-xs text-[#b8bfce]">
                <div className="p-6 bg-[#141822] border border-[#232936] rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-[#222938] pb-4">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-white">
                        Single Administrator Slot Status
                      </h3>
                      <p className="text-xs text-[#8e95a5] mt-0.5">
                        Security details and access enforcement rules for Hotel O Avondale.
                      </p>
                    </div>
                    <div className="px-3 py-1 bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold text-xs rounded-full">
                      Slot Claimed & Locked (1/1)
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#181d28] border border-[#262d3c] rounded-lg space-y-2">
                      <div className="text-[10px] uppercase font-bold text-[#8e95a5]">Administrator Full Name</div>
                      <div className="text-sm font-semibold text-white">{currentAdmin?.fullName || 'Property Owner'}</div>
                    </div>

                    <div className="p-4 bg-[#181d28] border border-[#262d3c] rounded-lg space-y-2">
                      <div className="text-[10px] uppercase font-bold text-[#8e95a5]">Admin Username</div>
                      <div className="text-sm font-mono font-semibold text-white">{currentAdmin?.username || 'admin'}</div>
                    </div>

                    <div className="p-4 bg-[#181d28] border border-[#262d3c] rounded-lg space-y-2">
                      <div className="text-[10px] uppercase font-bold text-[#8e95a5]">Official Contact Email</div>
                      <div className="text-sm text-white">{currentAdmin?.email || 'owner@hotelavondale.com'}</div>
                    </div>

                    <div className="p-4 bg-[#181d28] border border-[#262d3c] rounded-lg space-y-2">
                      <div className="text-[10px] uppercase font-bold text-[#8e95a5]">Emergency Recovery PIN</div>
                      <div className="text-sm font-mono text-emerald-400">
                        {currentAdmin?.recoveryPin || 'Configured (Active)'}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-lg flex items-start gap-3 mt-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Strict Single-Account Policy Active</div>
                      <div className="text-[11px] text-[#9aa1b2] mt-0.5">
                        New admin registrations are permanently locked out. Only the account owner above can log in and view booking reports, customer contacts, or update inventory.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: FULL BOOKING DETAILS DRAWER                                        */}
        {/* ========================================================================= */}
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-[#141822] border border-[#2b3344] rounded-2xl max-w-xl w-full p-6 text-left relative shadow-2xl space-y-4">
              <button
                onClick={() => setSelectedBooking(null)}
                className="absolute top-4 right-4 p-1.5 text-[#8e95a5] hover:text-white bg-[#1a202c] rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="border-b border-[#212735] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#d4af37]">
                    #{selectedBooking.id}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                      selectedBooking.status === 'confirmed'
                        ? 'bg-emerald-950 text-emerald-300'
                        : selectedBooking.status === 'pending'
                        ? 'bg-amber-950 text-amber-300'
                        : 'bg-rose-950 text-rose-300'
                    }`}
                  >
                    {selectedBooking.status}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-white mt-1">
                  Reservation Itinerary & Guest Info
                </h3>
              </div>

              {/* Guest & Room Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#181d28] rounded-lg">
                  <div className="text-[10px] uppercase font-bold text-[#8e95a5]">Guest Name</div>
                  <div className="font-bold text-white text-sm mt-0.5">{selectedBooking.customerName}</div>
                </div>

                <div className="p-3 bg-[#181d28] rounded-lg">
                  <div className="text-[10px] uppercase font-bold text-[#8e95a5]">Phone Number</div>
                  <div className="font-mono text-white text-sm mt-0.5">{selectedBooking.customerPhone}</div>
                </div>

                <div className="p-3 bg-[#181d28] rounded-lg">
                  <div className="text-[10px] uppercase font-bold text-[#8e95a5]">Email Address</div>
                  <div className="text-white text-xs mt-0.5 truncate">{selectedBooking.customerEmail}</div>
                </div>

                <div className="p-3 bg-[#181d28] rounded-lg">
                  <div className="text-[10px] uppercase font-bold text-[#8e95a5]">Room Category</div>
                  <div className="font-bold text-[#d4af37] text-xs mt-0.5">{selectedBooking.roomName}</div>
                </div>

                <div className="p-3 bg-[#181d28] rounded-lg">
                  <div className="text-[10px] uppercase font-bold text-[#8e95a5]">Dates of Stay</div>
                  <div className="text-white text-xs font-mono mt-0.5">
                    {selectedBooking.checkInDate} &rarr; {selectedBooking.checkOutDate}
                  </div>
                  <div className="text-[10px] text-[#8e95a5]">{selectedBooking.nights} Night(s)</div>
                </div>

                <div className="p-3 bg-[#181d28] rounded-lg">
                  <div className="text-[10px] uppercase font-bold text-[#8e95a5]">Arrival Slot</div>
                  <div className="text-white text-xs mt-0.5">
                    {selectedBooking.checkInSlot || 'Standard 12:00 PM'}
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.specialRequests && (
                <div className="p-3 bg-[#181d28] rounded-lg text-xs">
                  <div className="text-[10px] uppercase font-bold text-[#8e95a5]">Special Requests / Flight Details</div>
                  <div className="text-white mt-1 italic">{selectedBooking.specialRequests}</div>
                </div>
              )}

              {/* Price & Billing */}
              <div className="p-3.5 bg-[#181d28] border border-[#262d3c] rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#8e95a5]">Total Amount</div>
                  <div className="text-xl font-serif font-bold text-[#d4af37]">
                    ₹{selectedBooking.totalPrice.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-right text-xs">
                  <div className="font-medium text-white capitalize">{selectedBooking.paymentMode.replace('_', ' ')}</div>
                  <div className={`text-[10px] font-bold uppercase ${selectedBooking.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    Payment: {selectedBooking.paymentStatus}
                  </div>
                </div>
              </div>

              {/* Actions Strip */}
              <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-[#212735]">
                <button
                  onClick={() => handleWhatsAppGuest(selectedBooking)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Guest</span>
                </button>

                <button
                  onClick={() => {
                    onOpenEmailPreview(selectedBooking);
                    setSelectedBooking(null);
                  }}
                  className="px-3 py-1.5 bg-[#1f2533] hover:bg-[#283042] text-white rounded text-xs font-semibold flex items-center gap-1.5 border border-[#2f374a] transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Voucher</span>
                </button>

                {selectedBooking.status !== 'confirmed' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'confirmed')}
                    className="px-3 py-1.5 bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-700/60 rounded text-xs font-bold transition-colors cursor-pointer"
                  >
                    Confirm Booking
                  </button>
                )}

                {selectedBooking.status !== 'cancelled' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'cancelled')}
                    className="px-3 py-1.5 bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-700/60 rounded text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: EDIT ROOM INVENTORY & PRICE                                        */}
        {/* ========================================================================= */}
        {editingRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <div className="bg-[#141822] border border-[#2b3344] rounded-xl max-w-md w-full p-6 text-left relative shadow-2xl">
              <button
                onClick={() => setEditingRoom(null)}
                className="absolute top-4 right-4 p-1.5 text-[#8e95a5] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-serif text-xl font-bold text-white mb-4">
                Edit {editingRoom.name}
              </h3>

              <form onSubmit={handleSaveRoomEdits} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#8e95a5] uppercase mb-1">Direct Price Per Night (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingRoom.discountedPrice}
                    onChange={(e) =>
                      setEditingRoom({ ...editingRoom, discountedPrice: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-[#191f2b] border border-[#283040] rounded text-white"
                  />
                </div>

                <div>
                  <label className="block text-[#8e95a5] uppercase mb-1">Rack Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingRoom.basePrice}
                    onChange={(e) =>
                      setEditingRoom({ ...editingRoom, basePrice: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-[#191f2b] border border-[#283040] rounded text-white"
                  />
                </div>

                <div>
                  <label className="block text-[#8e95a5] uppercase mb-1">Inventory Units</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingRoom.inventoryCount}
                    onChange={(e) =>
                      setEditingRoom({ ...editingRoom, inventoryCount: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-[#191f2b] border border-[#283040] rounded text-white"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingRoom(null)}
                    className="px-4 py-2 text-[#8e95a5] hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#d4af37] text-[#0c0e12] font-bold rounded cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
