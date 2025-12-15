import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/vendor/dashboard
 * BUZZ: Get vendor dashboard data (stats, products, recent transactions)
 *
 * Query params:
 * - vendorId: string (vendor UUID)
 *
 * Returns:
 * - profile: Vendor profile data
 * - stats: Sales stats (today, week, month, all)
 * - recentProducts: Last 5 products
 * - recentTransactions: Last 10 transactions
 * - totalEarnings: Cumulative earnings
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const vendorId = searchParams.get('vendorId');

    if (!vendorId) {
      return NextResponse.json(
        { error: 'vendorId query parameter is required' },
        { status: 400 }
      );
    }

    // Get vendor profile
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Get vendor stats from dashboard view
    const { data: dashboard, error: dashboardError } = await supabase
      .from('vendor_dashboard')
      .select('*')
      .eq('vendor_id', vendorId)
      .single();

    if (dashboardError) {
      console.error('Dashboard error:', dashboardError);
      return NextResponse.json(
        { error: 'Failed to fetch dashboard data' },
        { status: 500 }
      );
    }

    // Get recent products
    const { data: recentProducts, error: productsError } = await supabase
      .from('products')
      .select('id, title, price, quantity, status, created_at')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (productsError) {
      console.error('Products error:', productsError);
    }

    // Get recent transactions
    const { data: recentTransactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('id, gross_amount, commission_amount, net_amount, payment_status, created_at')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (transactionsError) {
      console.error('Transactions error:', transactionsError);
    }

    // Get unread messages count
    const { count: unreadCount, error: messagesError } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('vendor_id', vendorId)
      .eq('read', false);

    return NextResponse.json({
      success: true,
      profile: {
        id: vendor.id,
        phone: vendor.phone,
        name: vendor.name,
        category: vendor.category,
        status: vendor.status,
        rating: vendor.rating,
        reviewCount: vendor.review_count,
        whatsappConnected: vendor.whatsapp_connected,
        verifiedAt: vendor.verified_at,
        createdAt: vendor.created_at,
      },
      stats: {
        walletBalance: vendor.wallet_balance,
        totalEarned: vendor.total_earned,
        pendingPayout: vendor.pending_payout,
        commissionRate: vendor.commission_rate,
        responseTime: vendor.response_time_hours,
      },
      dashboard: dashboard ? {
        totalProducts: dashboard.total_products,
        activeProducts: dashboard.active_products,
        totalTransactions: dashboard.total_transactions,
        totalRevenue: dashboard.total_revenue,
        totalCommission: dashboard.total_commission,
        averageOrderValue: dashboard.average_order_value,
      } : null,
      recentProducts: recentProducts || [],
      recentTransactions: recentTransactions || [],
      unreadMessages: unreadCount || 0,
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
