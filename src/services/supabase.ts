import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Booking } from '../types';

export const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://zpivuudumwexketbqcdx.supabase.co';

export const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_N6SsuvgE6LuclVP26lkzAQ_vG_1jCbY';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface SupabaseSyncResult {
  success: boolean;
  table?: string;
  message: string;
  error?: any;
  data?: any;
}

/**
 * Saves a new hotel room booking into Supabase.
 * Tries 'bookings', then fallback to 'appointments' or 'reservations'.
 */
export async function saveBookingToSupabase(booking: Booking): Promise<SupabaseSyncResult> {
  const payloadSnake = {
    id: booking.id,
    booking_id: booking.id,
    room_id: booking.roomId,
    room_name: booking.roomName,
    customer_name: booking.customerName,
    customer_email: booking.customerEmail,
    customer_phone: booking.customerPhone,
    check_in_date: booking.checkInDate,
    check_out_date: booking.checkOutDate,
    check_in_slot: booking.checkInSlot || '12:00 PM',
    nights: booking.nights,
    adults: booking.guests?.adults || 1,
    children: booking.guests?.children || 0,
    total_price: booking.totalPrice,
    special_requests: booking.specialRequests || '',
    payment_mode: booking.paymentMode || 'pay_at_hotel',
    payment_status: booking.paymentStatus || 'pending',
    status: booking.status || 'confirmed',
    created_at: booking.createdAt || new Date().toISOString()
  };

  const payloadCamel = {
    id: booking.id,
    bookingId: booking.id,
    roomId: booking.roomId,
    roomName: booking.roomName,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone,
    checkInDate: booking.checkInDate,
    checkOutDate: booking.checkOutDate,
    checkInSlot: booking.checkInSlot || '12:00 PM',
    nights: booking.nights,
    adults: booking.guests?.adults || 1,
    children: booking.guests?.children || 0,
    totalPrice: booking.totalPrice,
    specialRequests: booking.specialRequests || '',
    paymentMode: booking.paymentMode || 'pay_at_hotel',
    paymentStatus: booking.paymentStatus || 'pending',
    status: booking.status || 'confirmed',
    createdAt: booking.createdAt || new Date().toISOString()
  };

  // Try candidate tables in order
  const candidateTables = ['bookings', 'appointments', 'reservations', 'hotel_bookings'];

  for (const table of candidateTables) {
    try {
      // First try snake_case payload
      const { data, error } = await supabase.from(table).insert([payloadSnake]).select();
      if (!error) {
        console.log(`[Supabase] Booking saved successfully to table '${table}':`, data);
        return {
          success: true,
          table,
          message: `Saved successfully to Supabase table '${table}'`,
          data
        };
      }

      // If error is about column names, try camelCase payload
      if (error.message?.includes('column') || error.code === '42703') {
        const { data: dataCamel, error: errorCamel } = await supabase.from(table).insert([payloadCamel]).select();
        if (!errorCamel) {
          console.log(`[Supabase] Booking saved (camelCase) to table '${table}':`, dataCamel);
          return {
            success: true,
            table,
            message: `Saved successfully to Supabase table '${table}'`,
            data: dataCamel
          };
        }
      }

      // If table doesn't exist (e.g. 42P01), try the next candidate table
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        continue;
      } else {
        console.warn(`[Supabase] Insert attempt into '${table}' failed:`, error.message);
      }
    } catch (err: any) {
      console.warn(`[Supabase] Error writing to '${table}':`, err?.message || err);
    }
  }

  return {
    success: false,
    message: 'Could not write to Supabase. Check if the table "bookings" or "appointments" exists with public insert policy.',
    error: 'Table not found or RLS policy prevented insertion.'
  };
}

/**
 * Saves a contact/appointment inquiry into Supabase
 */
export async function saveInquiryToSupabase(inquiry: {
  name: string;
  phone: string;
  email?: string;
  message: string;
}): Promise<SupabaseSyncResult> {
  const payload = {
    name: inquiry.name,
    phone: inquiry.phone,
    email: inquiry.email || '',
    message: inquiry.message,
    created_at: new Date().toISOString()
  };

  const tables = ['inquiries', 'appointments', 'contact_messages', 'bookings'];

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).insert([payload]).select();
      if (!error) {
        return {
          success: true,
          table,
          message: `Inquiry saved to Supabase table '${table}'`,
          data
        };
      }
    } catch {
      // Continue to next table
    }
  }

  return {
    success: false,
    message: 'Inquiry could not be saved to Supabase.'
  };
}

/**
 * Tests connection to the Supabase instance
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  tablesFound: string[];
  error?: string;
}> {
  const tablesToCheck = ['bookings', 'appointments', 'reservations', 'inquiries'];
  const tablesFound: string[] = [];

  for (const table of tablesToCheck) {
    try {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (!error) {
        tablesFound.push(table);
      }
    } catch {
      // ignore
    }
  }

  return {
    connected: true,
    tablesFound,
    error: tablesFound.length === 0 ? 'Connected to Supabase project, but "bookings" or "appointments" table has not been created yet or has RLS enabled without read permissions.' : undefined
  };
}

export const SUPABASE_SCHEMA_SQL = `-- Run this SQL in your Supabase SQL Editor:
-- Project: zpivuudumwexketbqcdx

create table if not exists public.bookings (
  id text primary key,
  booking_id text,
  room_id text,
  room_name text,
  customer_name text,
  customer_email text,
  customer_phone text,
  check_in_date text,
  check_out_date text,
  check_in_slot text,
  nights integer,
  adults integer,
  children integer,
  total_price numeric,
  special_requests text,
  payment_mode text,
  payment_status text,
  status text default 'confirmed',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) and allow anon inserts & reads
alter table public.bookings enable row level security;

create policy "Allow anonymous inserts"
on public.bookings for insert
to anon, authenticated
with check (true);

create policy "Allow anonymous reads"
on public.bookings for select
to anon, authenticated
using (true);

create policy "Allow anonymous updates"
on public.bookings for update
to anon, authenticated
using (true);

-- Optional table for contact/appointment inquiries
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  email text,
  message text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.inquiries enable row level security;

create policy "Allow anonymous inquiry inserts"
on public.inquiries for insert
to anon, authenticated
with check (true);
`;
