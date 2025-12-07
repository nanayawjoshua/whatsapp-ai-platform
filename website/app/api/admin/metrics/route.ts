import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

/**
 * Super Admin Metrics API
 * Returns platform-wide statistics and analytics
 */
export async function GET() {
  try {
    // Total vendors
    const totalVendorsResult = await query('SELECT COUNT(*) as count FROM vendors');
    const totalVendors = parseInt(totalVendorsResult.rows[0].count);

    // Active vendors (last active within 7 days)
    const activeVendorsResult = await query(
      `SELECT COUNT(*) as count FROM vendors
       WHERE last_active > NOW() - INTERVAL '7 days'`
    );
    const activeVendors = parseInt(activeVendorsResult.rows[0].count);

    // Inactive vendors
    const inactiveVendors = totalVendors - activeVendors;

    // Total conversations
    const totalConversationsResult = await query('SELECT COUNT(*) as count FROM conversations');
    const totalConversations = parseInt(totalConversationsResult.rows[0].count);

    // Today's conversations
    const todayConversationsResult = await query(
      `SELECT COUNT(*) as count FROM conversations
       WHERE started_at::date = CURRENT_DATE`
    );
    const todayConversations = parseInt(todayConversationsResult.rows[0].count);

    // Total messages
    const totalMessagesResult = await query(
      'SELECT SUM(message_count) as total FROM conversations'
    );
    const totalMessages = parseInt(totalMessagesResult.rows[0].total || 0);

    // Completed orders
    const completedOrdersResult = await query(
      'SELECT COUNT(*) as count FROM conversations WHERE order_completed = true'
    );
    const completedOrders = parseInt(completedOrdersResult.rows[0].count);

    // Payments detected
    const paymentsDetectedResult = await query(
      'SELECT COUNT(*) as count FROM conversations WHERE payment_detected = true'
    );
    const paymentsDetected = parseInt(paymentsDetectedResult.rows[0].count);

    // Referrals triggered
    const referralsTriggeredResult = await query(
      'SELECT COUNT(*) as count FROM conversations WHERE referral_triggered = true'
    );
    const referralsTriggered = parseInt(referralsTriggeredResult.rows[0].count);

    // By account type
    const byAccountTypeResult = await query(`
      SELECT
        account_type,
        COUNT(*) as count
      FROM vendors
      GROUP BY account_type
    `);

    const byAccountType = {
      personal: 0,
      business: 0,
      enterprise: 0,
    };

    byAccountTypeResult.rows.forEach((row) => {
      const type = row.account_type?.toLowerCase() || 'personal';
      if (type in byAccountType) {
        byAccountType[type as keyof typeof byAccountType] = parseInt(row.count);
      }
    });

    // By subscription status
    const bySubscriptionStatusResult = await query(`
      SELECT
        subscription_status,
        COUNT(*) as count
      FROM vendors
      GROUP BY subscription_status
    `);

    const bySubscriptionStatus = {
      active: 0,
      expired: 0,
      trial: 0,
    };

    bySubscriptionStatusResult.rows.forEach((row) => {
      const status = row.subscription_status?.toLowerCase() || 'trial';
      if (status in bySubscriptionStatus) {
        bySubscriptionStatus[status as keyof typeof bySubscriptionStatus] = parseInt(row.count);
      }
    });

    // Recent vendors (last 10)
    const recentVendorsResult = await query(`
      SELECT
        vendor_id,
        name,
        phone,
        account_type,
        subscription_status,
        created_at,
        last_active
      FROM vendors
      ORDER BY created_at DESC
      LIMIT 10
    `);

    // Get live connections from cloud bridge
    let liveConnections = 0;
    try {
      const cloudBridgeUrl = process.env.CLOUD_BRIDGE_URL || 'https://beeline-bridge.onrender.com';
      const healthResponse = await fetch(`${cloudBridgeUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        liveConnections = healthData.vendors || 0;
      }
    } catch (error) {
      console.error('Failed to fetch live connections:', error);
      // Continue with liveConnections = 0
    }

    return NextResponse.json({
      totalVendors,
      activeVendors,
      inactiveVendors,
      totalConversations,
      todayConversations,
      totalMessages,
      completedOrders,
      paymentsDetected,
      referralsTriggered,
      byAccountType,
      bySubscriptionStatus,
      recentVendors: recentVendorsResult.rows,
      liveConnections,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Admin metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
