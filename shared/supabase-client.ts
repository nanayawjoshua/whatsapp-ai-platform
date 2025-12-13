/**
 * BUZZ: Supabase Admin Client
 * ============================================================================
 * Server-side Supabase client with service role (admin) privileges
 *
 * Usage:
 *   import { supabaseAdmin } from '@/shared/supabase-client';
 *   const { data, error } = await supabaseAdmin
 *     .from('vendors')
 *     .select('*')
 *     .eq('id', vendorId);
 *
 * Use Cases:
 *   - Backend API routes
 *   - Admin operations
 *   - Bypass RLS policies (for legitimate admin use)
 */

import { createClient } from '@supabase/supabase-js';

// Validate environment variables
if (!process.env.SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_KEY environment variable');
}

/**
 * Admin Supabase client with service role privileges
 * Use this for server-side operations that need to bypass RLS
 */
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Helper: Get vendor by ID (admin access - bypasses RLS)
 */
export async function getVendor(vendorId: string) {
  const { data, error } = await supabaseAdmin
    .from('vendors')
    .select('*')
    .eq('id', vendorId)
    .single();

  if (error) throw new Error(`Failed to get vendor: ${error.message}`);
  return data;
}

/**
 * Helper: Get vendor by phone (admin access - bypasses RLS)
 */
export async function getVendorByPhone(phone: string) {
  const { data, error } = await supabaseAdmin
    .from('vendors')
    .select('*')
    .eq('phone', phone)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get vendor: ${error.message}`);
  }

  return data;
}

/**
 * Helper: Create vendor (admin access)
 */
export async function createVendor(vendorData: {
  phone: string;
  name: string;
  category?: string;
  email?: string;
}) {
  const { data, error } = await supabaseAdmin
    .from('vendors')
    .insert([
      {
        phone: vendorData.phone,
        name: vendorData.name,
        category: vendorData.category || 'uncategorized',
        email: vendorData.email,
        status: 'active',
      },
    ])
    .select()
    .single();

  if (error) throw new Error(`Failed to create vendor: ${error.message}`);
  return data;
}

/**
 * Helper: Update vendor wallet balance
 */
export async function updateVendorWallet(
  vendorId: string,
  amount: number,
  reason: string
) {
  // First get current balance
  const vendor = await getVendor(vendorId);

  // Update with new balance
  const { data, error } = await supabaseAdmin
    .from('vendors')
    .update({
      wallet_balance: (vendor.wallet_balance || 0) + amount,
      total_earned: (vendor.total_earned || 0) + Math.max(0, amount),
    })
    .eq('id', vendorId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update wallet: ${error.message}`);
  }

  return data;
}

/**
 * Helper: Create transaction
 */
export async function createTransaction(transactionData: {
  vendor_id: string;
  product_id?: string;
  buyer_phone: string;
  buyer_name: string;
  gross_amount: number;
  commission_rate?: number;
}) {
  const commissionRate = transactionData.commission_rate || 5;
  const commissionAmount = (transactionData.gross_amount * commissionRate) / 100;
  const netAmount = transactionData.gross_amount - commissionAmount;

  const { data, error } = await supabaseAdmin
    .from('transactions')
    .insert([
      {
        vendor_id: transactionData.vendor_id,
        product_id: transactionData.product_id,
        buyer_phone: transactionData.buyer_phone,
        buyer_name: transactionData.buyer_name,
        gross_amount: transactionData.gross_amount,
        commission_amount: commissionAmount,
        net_amount: netAmount,
        payment_status: 'pending',
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create transaction: ${error.message}`);
  }

  return data;
}

/**
 * Helper: Get vendor transactions
 */
export async function getVendorTransactions(vendorId: string, limit = 50) {
  const { data, error } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get transactions: ${error.message}`);
  }

  return data;
}

/**
 * Helper: Log message
 */
export async function logMessage(messageData: {
  vendor_id: string;
  sender_type: 'vendor' | 'buyer' | 'system';
  sender_phone?: string;
  sender_name?: string;
  message_text: string;
  message_type?: string;
  classified_category?: string;
  classified_confidence?: number;
}) {
  const { data, error } = await supabaseAdmin
    .from('messages')
    .insert([
      {
        vendor_id: messageData.vendor_id,
        sender_type: messageData.sender_type,
        sender_phone: messageData.sender_phone,
        sender_name: messageData.sender_name,
        message_text: messageData.message_text,
        message_type: messageData.message_type,
        classified_category: messageData.classified_category,
        classified_confidence: messageData.classified_confidence,
        read: false,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to log message: ${error.message}`);
  }

  return data;
}

export default supabaseAdmin;
