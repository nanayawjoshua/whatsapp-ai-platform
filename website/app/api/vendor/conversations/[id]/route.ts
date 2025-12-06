import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Get Single Conversation with Full Message History
 * GET /api/vendor/conversations/[id]
 *
 * [id] is the conversation_id (format: vendorId:customerId)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendor = await requireAuth(request);
    const conversationId = params.id;

    // Verify conversation belongs to this vendor
    const conversationResult = await query(
      `SELECT
         c.conversation_id,
         c.vendor_id,
         c.customer_id,
         c.customer_name,
         c.customer_location,
         c.started_at,
         c.last_message_at,
         c.message_count,
         c.order_completed,
         c.payment_detected,
         c.referral_triggered
       FROM conversations c
       WHERE c.conversation_id = $1 AND c.vendor_id = $2
       LIMIT 1`,
      [conversationId, vendor.vendorId]
    );

    if (conversationResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const conversation = conversationResult.rows[0];

    // Get all messages for this conversation
    const messagesResult = await query(
      `SELECT
         message_id,
         role,
         content,
         sent_at,
         metadata,
         input_tokens,
         output_tokens
       FROM messages
       WHERE conversation_id = $1
       ORDER BY sent_at ASC`,
      [conversationId]
    );

    conversation.messages = messagesResult.rows;

    // Calculate total tokens used
    const totalInputTokens = messagesResult.rows.reduce(
      (sum, msg) => sum + (msg.input_tokens || 0), 0
    );
    const totalOutputTokens = messagesResult.rows.reduce(
      (sum, msg) => sum + (msg.output_tokens || 0), 0
    );

    conversation.tokenUsage = {
      input: totalInputTokens,
      output: totalOutputTokens,
      total: totalInputTokens + totalOutputTokens
    };

    return NextResponse.json({
      conversation
    });

  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('Get conversation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
