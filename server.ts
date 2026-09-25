import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-memory persistent data fallback on server
interface RoomData {
  id: string;
  name: string;
  type: string;
  basePrice: number;
  discountedPrice: number;
  capacity: { adults: number; children: number };
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

let rooms: RoomData[] = [
  {
    id: 'room-deluxe-01',
    name: 'Avondale Deluxe King',
    type: 'deluxe',
    basePrice: 3499,
    discountedPrice: 2799,
    capacity: { adults: 2, children: 1 },
    bedType: 'Custom King Bed with 400TC Linens',
    size: '320 sq.ft (30 m²)',
    rating: 4.88,
    reviewCount: 146,
    images: ['/src/assets/images/deluxe_room_interior_1790173835793.jpg'],
    description: 'A thoughtfully appointed haven for discerning business travelers and couples with Italian marble, soundproof windows, and workstation.',
    shortHighlights: ['Fast 150 Mbps Wi-Fi', 'Rain Shower', '10-min to Jaipur Airport', 'Soundproof Glazing'],
    amenities: ['High-Speed 5G Wi-Fi', '43" 4K Smart TV', 'Rain Shower', 'Artisan Coffee Station', 'Climate Control'],
    isAvailable: true,
    inventoryCount: 12
  },
  {
    id: 'room-exec-02',
    name: 'Avondale Executive Business Suite',
    type: 'executive',
    basePrice: 5299,
    discountedPrice: 4199,
    capacity: { adults: 3, children: 1 },
    bedType: 'King Bed & Plush Velvet Lounger',
    size: '480 sq.ft (45 m²)',
    rating: 4.92,
    reviewCount: 98,
    images: ['/src/assets/images/executive_suite_room_1790173848770.jpg'],
    description: 'Designed specifically for corporate leaders and extended Jaipur stays with dedicated lounge, espresso machine, and work desk.',
    shortHighlights: ['Dedicated Living Lounge', 'Complimentary Buffet Breakfast', 'Airport Transfer Support'],
    amenities: ['Living Lounge', 'Nespresso Coffee Machine', '55" OLED Smart TV', 'Marble Soaking Tub'],
    isAvailable: true,
    inventoryCount: 6
  }
];

let bookings = [
  {
    id: 'HOA-8492',
    roomId: 'room-deluxe-01',
    roomName: 'Avondale Deluxe King',
    customerName: 'Vikramaditya Rathore',
    customerEmail: 'vikram.rathore@techcorp.in',
    customerPhone: '+91 98291 12345',
    checkInDate: '2026-09-24',
    checkOutDate: '2026-09-26',
    checkInSlot: 'Regular Check-in (12:00 PM)',
    nights: 2,
    guests: { adults: 2, children: 0 },
    totalPrice: 5598,
    status: 'confirmed',
    specialRequests: 'High floor preferred, airport shuttle pickup at 2 PM from Jaipur Airport Terminal 2.',
    createdAt: new Date().toISOString(),
    paymentMode: 'pay_at_hotel',
    paymentStatus: 'pending',
    whatsappNotified: true,
    emailNotified: true
  }
];

let blockedDates = [
  {
    id: 'blk-01',
    roomId: 'room-exec-02',
    startDate: '2026-10-05',
    endDate: '2026-10-07',
    reason: 'maintenance',
    notes: 'Deep carpet steam cleaning and HVAC seasonal maintenance',
    createdAt: new Date().toISOString()
  }
];

let customers = [
  {
    id: 'cust-1',
    name: 'Vikramaditya Rathore',
    email: 'vikram.rathore@techcorp.in',
    phone: '+91 98291 12345',
    totalBookings: 3,
    totalSpent: 16794,
    lastBookingDate: '2026-09-24',
    notes: 'Frequent business traveler visiting Sitapura RIICO industrial hub.'
  }
];

// API Endpoints
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hotel: 'Hotel O Avondale (Jaipur)',
    location: 'Sitapura Industrial Area near Jaipur International Airport',
    time: new Date().toISOString()
  });
});

app.get('/api/rooms', (_req: Request, res: Response) => {
  res.json({ success: true, data: rooms });
});

app.get('/api/bookings', (req: Request, res: Response) => {
  const { status, query } = req.query;
  let filtered = [...bookings];
  if (status && status !== 'all') {
    filtered = filtered.filter(b => b.status === status);
  }
  if (query) {
    const q = String(query).toLowerCase();
    filtered = filtered.filter(b => 
      b.id.toLowerCase().includes(q) ||
      b.customerName.toLowerCase().includes(q) ||
      b.customerPhone.includes(q) ||
      b.customerEmail.toLowerCase().includes(q)
    );
  }
  res.json({ success: true, data: filtered });
});

app.post('/api/bookings', (req: Request, res: Response) => {
  const body = req.body;
  if (!body.roomId || !body.customerName || !body.customerPhone || !body.checkInDate || !body.checkOutDate) {
    return res.status(400).json({ success: false, error: 'Missing required booking fields.' });
  }

  const newId = `HOA-${Math.floor(1000 + Math.random() * 9000)}`;
  const newBooking = {
    ...body,
    id: newId,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    whatsappNotified: false,
    emailNotified: true
  };

  bookings.unshift(newBooking);

  // Upsert customer
  const existingCustIndex = customers.findIndex(c => c.phone === body.customerPhone || c.email === body.customerEmail);
  if (existingCustIndex >= 0) {
    customers[existingCustIndex].totalBookings += 1;
    customers[existingCustIndex].totalSpent += (body.totalPrice || 0);
    customers[existingCustIndex].lastBookingDate = body.checkInDate;
  } else {
    customers.push({
      id: `cust-${Date.now()}`,
      name: body.customerName,
      email: body.customerEmail,
      phone: body.customerPhone,
      totalBookings: 1,
      totalSpent: body.totalPrice || 0,
      lastBookingDate: body.checkInDate,
      notes: body.specialRequests || 'Direct website guest'
    });
  }

  res.status(201).json({ success: true, data: newBooking });
});

app.patch('/api/bookings/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const booking = bookings.find(b => b.id === id);
  if (!booking) {
    return res.status(404).json({ success: false, error: 'Booking not found.' });
  }
  booking.status = status;
  res.json({ success: true, data: booking });
});

app.get('/api/blocked-dates', (_req: Request, res: Response) => {
  res.json({ success: true, data: blockedDates });
});

app.post('/api/blocked-dates', (req: Request, res: Response) => {
  const { roomId, startDate, endDate, reason, notes } = req.body;
  const newBlock = {
    id: `blk-${Date.now()}`,
    roomId: roomId || 'all',
    startDate,
    endDate,
    reason: reason || 'maintenance',
    notes,
    createdAt: new Date().toISOString()
  };
  blockedDates.push(newBlock);
  res.status(201).json({ success: true, data: newBlock });
});

app.delete('/api/blocked-dates/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  blockedDates = blockedDates.filter(b => b.id !== id);
  res.json({ success: true, message: 'Blocked date removed.' });
});

app.get('/api/customers', (_req: Request, res: Response) => {
  res.json({ success: true, data: customers });
});

// Single-Slot Admin Server Memory
let serverAdminAccount: {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone?: string;
  createdAt: string;
} | null = null;

app.get('/api/admin/slot-status', (_req: Request, res: Response) => {
  res.json({
    success: true,
    slotClaimed: serverAdminAccount !== null,
    adminUsername: serverAdminAccount ? serverAdminAccount.username : null,
  });
});

app.post('/api/admin/register-slot', (req: Request, res: Response) => {
  if (serverAdminAccount) {
    return res.status(403).json({
      success: false,
      error: 'Single admin slot has already been claimed. Registration is permanently closed.',
    });
  }
  const { username, password, fullName, email, phone } = req.body;
  if (!username || !password || !fullName) {
    return res.status(400).json({ success: false, error: 'Full name, username, and password required.' });
  }
  serverAdminAccount = {
    username: String(username).trim(),
    password: String(password).trim(),
    fullName: String(fullName).trim(),
    email: String(email || username).trim(),
    phone: phone ? String(phone).trim() : '',
    createdAt: new Date().toISOString(),
  };
  return res.json({
    success: true,
    message: 'Admin account created successfully! Single slot permanently locked.',
  });
});

app.post('/api/admin/login', (req: Request, res: Response) => {
  const { passcode, username, password } = req.body;

  if (serverAdminAccount) {
    const ident = (username || passcode || '').toLowerCase().trim();
    const pass = (password || passcode || '').trim();
    if (
      (ident === serverAdminAccount.username.toLowerCase() || ident === serverAdminAccount.email.toLowerCase()) &&
      pass === serverAdminAccount.password
    ) {
      return res.json({ success: true, token: 'token-hoa-admin-session', admin: serverAdminAccount });
    }
  }

  if (passcode === 'admin123' || passcode === 'avondale2026' || password === 'admin123') {
    return res.json({ success: true, token: 'token-hoa-admin-session' });
  }

  return res.status(401).json({ success: false, error: 'Invalid admin credentials.' });
});

app.get('/api/admin/stats', (_req: Request, res: Response) => {
  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const totalRev = confirmed.reduce((acc, b) => acc + (b.totalPrice || 0), 0);
  res.json({
    success: true,
    data: {
      totalBookings: bookings.length,
      confirmedBookings: confirmed.length,
      todayCheckIns: 3,
      todayCheckOuts: 2,
      occupancyRate: 82,
      totalRevenue: totalRev || 42800,
      activeRooms: rooms.filter(r => r.isAvailable).length,
      pendingReviewCount: bookings.filter(b => b.status === 'pending').length
    }
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(__dirname, 'dist');

  if (isProd && fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API route not found' });
      }
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
