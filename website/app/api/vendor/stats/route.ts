import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Get Vendor Analytics and Stats
 * GET /api/vendor/stats
 *
 * Query params:
 * - period: 'today' | 'week' | 'month' | 'all' (default: 'today')
 */
export async function GET(request: NextRequest) {
  try {
    const vendor = await requireAuth(request);

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'today';

    // Determine date filter based on period
    let dateFilter = '';
    switch (period) {
      case 'today':
        dateFilter = "AND sent_at >= CURRENT_DATE";
        break;
      case 'week':
        dateFilter = "AND sent_at >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "AND sent_at >= CURRENT_DATE - INTERVAL '30 days'";
        break;
      case 'all':
      default:
        dateFilter = '';
    }

    // Get total message count
    const messagesResult = await query(
      `SELECT COUNT(*) as total
       FROM messages m
       JOIN conversations c ON c.conversation_id = m.conversation_id
       WHERE c.vendor_id = $1 ${dateFilter}`,
      [vendor.vendorId]
    );

    const totalMessages = parseInt(messagesResult.rows[0].total);

    // Get message breakdown (user vs AI)
    const breakdownResult = await query(
      `SELECT
         m.role,
         COUNT(*) as count
       FROM messages m
       JOIN conversations c ON c.conversation_id = m.conversation_id
       WHERE c.vendor_id = $1 ${dateFilter}
       GROUP BY m.role`,
      [vendor.vendorId]
    );

    const userMessages = breakdownResult.rows.find(r => r.role === 'user')?.count || 0;
    const aiMessages = breakdownResult.rows.find(r => r.role === 'assistant')?.count || 0;

    // Get conversation count
    const conversationsResult = await query(
      `SELECT COUNT(*) as total
       FROM conversations
       WHERE vendor_id = $1
       ${period === 'today' ? "AND last_message_at >= CURRENT_DATE" :
         period === 'week' ? "AND last_message_at >= CURRENT_DATE - INTERVAL '7 days'" :
         period === 'month' ? "AND last_message_at >= CURRENT_DATE - INTERVAL '30 days'" : ''}`,
      [vendor.vendorId]
    );

    const totalConversations = parseInt(conversationsResult.rows[0].total);

    // Get orders and payments detected
    const ordersResult = await query(
      `SELECT
         COUNT(*) FILTER (WHERE order_completed = TRUE) as completed_orders,
         COUNT(*) FILTER (WHERE payment_detected = TRUE) as payments_detected
       FROM conversations
       WHERE vendor_id = $1`,
      [vendor.vendorId]
    );

    const orders = ordersResult.rows[0];

    // Calculate AI response rate
    const aiResponseRate = userMessages > 0
      ? Math.round((aiMessages / userMessages) * 100)
      : 0;

    // Get hourly activity (for today/week)
    let hourlyActivity = [];
    if (period === 'today' || period === 'week') {
      const activityResult = await query(
        `SELECT
           DATE_TRUNC('hour', sent_at) as hour,
           COUNT(*) as message_count
         FROM messages m
         JOIN conversations c ON c.conversation_id = m.conversation_id
         WHERE c.vendor_id = $1 ${dateFilter}
         GROUP BY hour
         ORDER BY hour ASC`,
        [vendor.vendorId]
      );

      hourlyActivity = activityResult.rows;
    }

    // Get top customers by message count
    const topCustomersResult = await query(
      `SELECT
         c.customer_id,
         c.customer_name,
         COUNT(m.message_id) as message_count,
         MAX(m.sent_at) as last_message_at
       FROM conversations c
       LEFT JOIN messages m ON m.conversation_id = c.conversation_id
       WHERE c.vendor_id = $1
       GROUP BY c.customer_id, c.customer_name
       ORDER BY message_count DESC
       LIMIT 10`,
      [vendor.vendorId]
    );

    // Get session status (WhatsApp connection)
    const sessionResult = await query(
      `SELECT status, whatsapp_number, last_active
       FROM vendor_sessions
       WHERE vendor_id = $1
       LIMIT 1`,
      [vendor.vendorId]
    );

    const session = sessionResult.rows[0] || null;

    return NextResponse.json({
      period,
      stats: {
        totalMessages,
        userMessages: parseInt(userMessages),
        aiMessages: parseInt(aiMessages),
        aiResponseRate,
        totalConversations,
        completedOrders: parseInt(orders.completed_orders),
        paymentsDetected: parseInt(orders.payments_detected)
      },
      hourlyActivity,
      topCustomers: topCustomersResult.rows,
      whatsappSession: session ? {
        status: session.status,
        number: session.whatsapp_number,
        lastActive: session.last_active
      } : null
    });

  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
