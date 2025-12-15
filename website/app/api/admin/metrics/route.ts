import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
// Using client-side Supabase for demo (server-side would need SUPABASE_SERVICE_KEY)
import { supabase } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Super Admin Metrics API
 * Returns platform-wide statistics and analytics
 *
 * NOTE: This endpoint is a placeholder for Phase 3
 * Full admin dashboard will be implemented in Phase 7
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 401 }
      );
    }

    // Get vendor count
    const { count: vendorCount, error: vendorError } = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true });

    const { count: productCount, error: productError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    const { count: transactionCount, error: transactionError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });

    // Get recent vendors
    const { data: recentVendors } = await supabase
      .from('vendors')
      .select('id, name, phone, category, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      stats: {
        totalVendors: vendorCount || 0,
        totalProducts: productCount || 0,
        totalTransactions: transactionCount || 0,
      },
      recentVendors: recentVendors || [],
      lastUpdated: new Date().toISOString(),
      note: 'Full metrics dashboard coming in Phase 7',
    });
  } catch (error: any) {
    console.error('Admin metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
