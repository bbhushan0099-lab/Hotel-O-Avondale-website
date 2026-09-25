import { Room, Booking, BlockedDate, Customer } from '../types';
import { hotelImages } from '../assets/images';

export const INITIAL_ROOMS: Room[] = [
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
    images: [
      hotelImages.deluxeRoom,
      hotelImages.heroFacade,
      hotelImages.diningLounge,
    ],
    description: 'A thoughtfully appointed haven for discerning business travelers and couples. Features contemporary Italian marble accents, bespoke ambient backlighting, soundproof windows, and an ergonomic workstation designed for productivity.',
    shortHighlights: [
      'Fast 150 Mbps Wi-Fi',
      'Rain Shower with Forest Essentials Toiletries',
      '10-min to Jaipur Airport',
      'Soundproof Glazing'
    ],
    amenities: [
      'High-Speed 5G Wi-Fi',
      '43" 4K Smart TV with Netflix/Prime',
      'Ergonomic Work Desk & Chair',
      'Rain Shower & Premium Toiletries',
      'Artisan Tea & Coffee Station',
      'Silent Inverter AC with Climate Dial',
      '24/7 Room Dining Service',
      'Complimentary Bottled Spring Water',
      'Electronic Digital Safe'
    ],
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
    images: [
      hotelImages.executiveSuite,
      hotelImages.deluxeRoom,
      hotelImages.diningLounge
    ],
    description: 'Designed specifically for corporate leaders and extended Jaipur stays. Includes an integrated living lounge, high-end espresso machine, executive work desk, and express laundry service.',
    shortHighlights: [
      'Dedicated Living Lounge Area',
      'Complimentary Gourmet Buffet Breakfast',
      'Airport Pick-up Assistance',
      '55" Ultra HD Entertainment'
    ],
    amenities: [
      'Dedicated Living & Meeting Lounge',
      'Complimentary Artisan Buffet Breakfast',
      'Nespresso Coffee Machine',
      '55" 4K OLED Smart TV',
      'Marble Bath with Deep Soak Tub',
      'High-Speed 250 Mbps Wi-Fi',
      'Plush Bathrobes & Woven Slippers',
      'Priority Airport Transfer Dispatch',
      'Ironing Station & Steamer'
    ],
    isAvailable: true,
    inventoryCount: 6
  },
  {
    id: 'room-club-03',
    name: 'Avondale Royal Club Suite',
    type: 'club',
    basePrice: 6999,
    discountedPrice: 5499,
    capacity: { adults: 3, children: 2 },
    bedType: 'Super King Bed & Private Sitout',
    size: '560 sq.ft (52 m²)',
    rating: 4.95,
    reviewCount: 64,
    images: [
      hotelImages.diningLounge,
      hotelImages.executiveSuite,
      hotelImages.heroFacade
    ],
    description: 'Our premier hospitality offering. Combines royal Rajasthani design elegance with contemporary minimalism, offering a private skyline balcony, complimentary evening high-tea, and bespoke concierge care.',
    shortHighlights: [
      'Private Skyline Balcony',
      'Evening High Tea & Appetizers',
      'Dedicated 24/7 Butler Service',
      'Complimentary Airport Pick & Drop'
    ],
    amenities: [
      'Private Skyline Balcony with Lounge Seating',
      'Complimentary Airport Pickup & Drop',
      'Full Breakfast & Evening High Tea',
      'Dedicated Personal Butler Assist',
      'Freestanding Soaking Tub & Dual Vanities',
      'Premium Sound System by Bose',
      'Pillow Menu (Silk, Memory Foam, Down)',
      'Mini Bar with Curated Beverages'
    ],
    isAvailable: true,
    inventoryCount: 4
  },
  {
    id: 'room-transit-04',
    name: 'Airport Transit Express Studio',
    type: 'transit',
    basePrice: 2699,
    discountedPrice: 2099,
    capacity: { adults: 2, children: 0 },
    bedType: 'Queen Plush Comfort Bed',
    size: '260 sq.ft (24 m²)',
    rating: 4.78,
    reviewCount: 220,
    images: [
      hotelImages.deluxeRoom,
      hotelImages.heroFacade
    ],
    description: 'Tailored for flight layovers, late night arrivals, and early departures from Jaipur International Airport. Features swift 2-minute keyless mobile check-in and 24-hr airport taxi coordination.',
    shortHighlights: [
      '6-min Quick Airport Commute',
      'Flexible 24-Hour Check-in',
      'Grab & Go Breakfast Box',
      'Sleep-Assisted Blackout Curtains'
    ],
    amenities: [
      'Ultra Soundproof Acoustic Windows',
      '100% Blackout Privacy Drapery',
      'Quick Jet-Lag Rain Shower',
      'Early Morning Grab-and-Go Breakfast',
      'Guaranteed Airport Taxi Dispatch',
      'Fast 100 Mbps Wi-Fi',
      'Compact Luggage Staging Racks'
    ],
    isAvailable: true,
    inventoryCount: 8
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
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
    createdAt: '2026-09-21T10:14:00Z',
    paymentMode: 'pay_at_hotel',
    paymentStatus: 'pending',
    whatsappNotified: true,
    emailNotified: true
  },
  {
    id: 'HOA-8504',
    roomId: 'room-exec-02',
    roomName: 'Avondale Executive Business Suite',
    customerName: 'Ananya Sharma',
    customerEmail: 'ananya.sharma@deloitte.com',
    customerPhone: '+91 97110 45892',
    checkInDate: '2026-09-25',
    checkOutDate: '2026-09-28',
    checkInSlot: 'Evening Express (06:00 PM)',
    nights: 3,
    guests: { adults: 1, children: 0 },
    totalPrice: 12597,
    status: 'confirmed',
    specialRequests: 'Attending JECC Sitapura Renewable Energy Summit. Quiet room for video conferences.',
    createdAt: '2026-09-22T08:30:00Z',
    paymentMode: 'instant_upi_card',
    paymentStatus: 'paid',
    whatsappNotified: true,
    emailNotified: true
  },
  {
    id: 'HOA-8511',
    roomId: 'room-transit-04',
    roomName: 'Airport Transit Express Studio',
    customerName: 'Marcus Vance',
    customerEmail: 'm.vance@globalair.co.uk',
    customerPhone: '+44 7911 123456',
    checkInDate: '2026-09-23',
    checkOutDate: '2026-09-24',
    checkInSlot: 'Late Night Transit (11:00 PM)',
    nights: 1,
    guests: { adults: 1, children: 0 },
    totalPrice: 2099,
    status: 'confirmed',
    specialRequests: 'Flight 6E-204 arriving at 10:45 PM. Please arrange cab from Jaipur airport.',
    createdAt: '2026-09-22T19:05:00Z',
    paymentMode: 'instant_upi_card',
    paymentStatus: 'paid',
    whatsappNotified: true,
    emailNotified: true
  },
  {
    id: 'HOA-8518',
    roomId: 'room-club-03',
    roomName: 'Avondale Royal Club Suite',
    customerName: 'Dr. Sameer & Neha Singhal',
    customerEmail: 'singhal.sameer@apollo.org',
    customerPhone: '+91 98100 88776',
    checkInDate: '2026-09-27',
    checkOutDate: '2026-09-30',
    checkInSlot: 'Regular Check-in (12:00 PM)',
    nights: 3,
    guests: { adults: 2, children: 1 },
    totalPrice: 16497,
    status: 'pending',
    specialRequests: 'Celebrating 10th anniversary in Jaipur. Flower bouquet setup requested.',
    createdAt: '2026-09-23T05:22:00Z',
    paymentMode: 'pay_at_hotel',
    paymentStatus: 'pending',
    whatsappNotified: false,
    emailNotified: true
  }
];

export const INITIAL_BLOCKED_DATES: BlockedDate[] = [
  {
    id: 'blk-01',
    roomId: 'room-exec-02',
    startDate: '2026-10-05',
    endDate: '2026-10-07',
    reason: 'maintenance',
    notes: 'Deep carpet steam cleaning and HVAC seasonal maintenance',
    createdAt: '2026-09-18T12:00:00Z'
  },
  {
    id: 'blk-02',
    roomId: 'all',
    startDate: '2026-11-12',
    endDate: '2026-11-14',
    reason: 'private_event',
    notes: 'Annual Corporate Conclave at Sitapura Industrial Area JECC',
    createdAt: '2026-09-20T14:30:00Z'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Vikramaditya Rathore',
    email: 'vikram.rathore@techcorp.in',
    phone: '+91 98291 12345',
    totalBookings: 3,
    totalSpent: 16794,
    lastBookingDate: '2026-09-24',
    notes: 'Frequent business traveler visiting Sitapura RIICO industrial hub.'
  },
  {
    id: 'cust-2',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@deloitte.com',
    phone: '+91 97110 45892',
    totalBookings: 2,
    totalSpent: 21594,
    lastBookingDate: '2026-09-25',
    notes: 'Prefers high floor executive suites with quiet desk setup.'
  },
  {
    id: 'cust-3',
    name: 'Marcus Vance',
    email: 'm.vance@globalair.co.uk',
    phone: '+44 7911 123456',
    totalBookings: 1,
    totalSpent: 2099,
    lastBookingDate: '2026-09-23',
    notes: 'International transit guest via Jaipur Airport.'
  },
  {
    id: 'cust-4',
    name: 'Dr. Sameer Singhal',
    email: 'singhal.sameer@apollo.org',
    phone: '+91 98100 88776',
    totalBookings: 1,
    totalSpent: 16497,
    lastBookingDate: '2026-09-27',
    notes: 'Anniversary celebration trip.'
  }
];
