import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Get Vendor Conversations
 * GET /api/vendor/conversations
 *
 * Query params:
 * - limit: number of conversations (default: 20)
 * - offset: pagination offset (default: 0)
 * - includeMessages: include recent messages (default: true)
 */
export async function GET(request: NextRequest) {
  try {
    const vendor = await requireAuth(request);

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeMessages = searchParams.get('includeMessages') !== 'false';

    // Get conversations for this vendor
    const conversationsResult = await query(
      `SELECT
         c.conversation_id,
         c.customer_id,
         c.customer_name,
         c.customer_location,
         c.started_at,
         c.last_message_at,
         c.message_count,
         c.order_completed,
         c.payment_detected
       FROM conversations c
       WHERE c.vendor_id = $1
       ORDER BY c.last_message_at DESC
       LIMIT $2 OFFSET $3`,
      [vendor.vendorId, limit, offset]
    );

    const conversations = conversationsResult.rows;

    // If includeMessages, fetch recent messages for each conversation
    if (includeMessages && conversations.length > 0) {
      for (const conversation of conversations) {
        const messagesResult = await query(
          `SELECT role, content, sent_at
           FROM messages
           WHERE conversation_id = $1
           ORDER BY sent_at DESC
           LIMIT 5`,
          [conversation.conversation_id]
        );

        // Reverse to show oldest first
        conversation.recentMessages = messagesResult.rows.reverse();
      }
    }

    // Get total count for pagination
    const countResult = await query(
      `SELECT COUNT(*) as total
       FROM conversations
       WHERE vendor_id = $1`,
      [vendor.vendorId]
    );

    const total = parseInt(countResult.rows[0].total);

    return NextResponse.json({
      conversations,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('Get conversations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
