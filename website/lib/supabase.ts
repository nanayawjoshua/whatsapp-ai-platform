/**
 * BUZZ: Supabase Client (Browser/Client-side)
 * ============================================================================
 * Client-side Supabase instance with public anon key
 * Respects RLS policies - vendors can only see their own data
 *
 * Usage:
 *   import { supabase } from '@/lib/supabase';
 *
 *   // In React components
 *   const { data, error } = await supabase
 *     .from('vendors')
 *     .select('*');
 *
 *   // With auth
 *   const session = await supabase.auth.getSession();
 */

import { createClient } from '@supabase/supabase-js';

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_KEY environment variable');
}

/**
 * Public Supabase client for browser
 * Uses anon key and respects RLS policies
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);

/**
 * Type definitions for Supabase tables
 */

export interface Vendor {
  id: string;
  phone: string;
  name: string;
  email?: string;
  category?: string;
  commission_rate: number;
  wallet_balance: number;
  pending_payout: number;
  total_earned: number;
  rating: number;
  review_count: number;
  response_time_hours?: number;
  status: 'active' | 'suspended' | 'deleted';
  verified_at?: string;
  whatsapp_connected: boolean;
  last_activity_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  vendor_id: string;
  title: string;
  description?: string;
  price: number;
  category: string;
  image_urls?: string[];
  thumbnail_url?: string;
  quantity: number;
  status: 'active' | 'sold' | 'removed';
  listed_at: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  vendor_id: string;
  product_id?: string;
  buyer_phone: string;
  buyer_name: string;
  gross_amount: number;
  commission_amount: number;
  net_amount: number;
  payment_method?: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  pawapay_transaction_id?: string;
  notes?: string;
  created_at: string;
  completed_at?: string;
}

export interface Message {
  id: string;
  vendor_id: string;
  sender_type: 'vendor' | 'buyer' | 'system';
  sender_phone?: string;
  sender_name?: string;
  message_text: string;
  message_type?: string;
  classified_category?: string;
  classified_confidence?: number;
  ai_suggested_response?: string;
  read: boolean;
  created_at: string;
}

export interface JijiLead {
  id: string;
  jiji_vendor_id?: string;
  jiji_vendor_name?: string;
  jiji_vendor_url?: string;
  phone: string;
  name: string;
  category?: string;
  product_count: number;
  monthly_sales: number;
  average_response_time?: number;
  rating?: number;
  quality_score: number;
  fit_score: number;
  status: 'pending' | 'contacted' | 'interested' | 'onboarded' | 'declined' | 'no_response';
  contacted_count: number;
  last_contacted_at?: string;
  last_response_at?: string;
  converted_to_vendor_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OutreachCampaign {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'completed';
  target_category?: string;
  min_quality_score: number;
  message_template: string;
  subject?: string;
  leads_sent: number;
  responses_received: number;
  vendors_onboarded: number;
  started_at: string;
  ended_at?: string;
  created_at: string;
}

export interface DailyAnalytics {
  id: string;
  date: string;
  transactions_count: number;
  unique_vendors: number;
  gmv: number;
  revenue: number;
  new_vendors: number;
  new_transactions: number;
  messages_sent: number;
  avg_response_time?: number;
  created_at: string;
}

/**
 * Helper: Get vendor profile
 */
export async function getVendorProfile(vendorId: string) {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', vendorId)
    .single();

  return { data, error };
}

/**
 * Helper: Get vendor products
 */
export async function getVendorProducts(vendorId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('vendor_id', vendorId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  return { data, error };
}

/**
 * Helper: Get vendor transactions
 */
export async function getVendorTransactions(vendorId: string, limit = 20) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data, error };
}

/**
 * Helper: Get vendor messages
 */
export async function getVendorMessages(vendorId: string, limit = 50) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data, error };
}

/**
 * Helper: Create product listing
 */
export async function createProduct(vendorId: string, productData: {
  title: string;
  description?: string;
  price: number;
  category: string;
  quantity?: number;
}) {
  const { data, error } = await supabase
    .from('products')
    .insert([
      {
        vendor_id: vendorId,
        title: productData.title,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        quantity: productData.quantity || 1,
        status: 'active',
      },
    ])
    .select()
    .single();

  return { data, error };
}

export default supabase;
