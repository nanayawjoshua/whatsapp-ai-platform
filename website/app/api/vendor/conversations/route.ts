import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/vendor/conversations
 * BUZZ: Get recent conversations for a vendor
 *
 * Query params:
 * - vendorId: string (vendor UUID)
 * - limit: number (default 5)
 *
 * Returns:
 * - conversations: array of conversation objects
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const vendorId = searchParams.get('vendorId');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!vendorId) {
      return NextResponse.json(
        { error: 'vendorId query parameter is required' },
        { status: 400 }
      );
    }

    // Get recent messages grouped by conversation
    // For simplicity, return recent messages as conversations
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false })
      .limit(limit * 2); // Get more messages to group into conversations

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      );
    }

    // Group messages by sender (simple conversation grouping)
    const conversationsMap = new Map();

    messages?.forEach(message => {
      const senderKey = message.sender_phone || message.sender_name || 'unknown';
      if (!conversationsMap.has(senderKey)) {
        conversationsMap.set(senderKey, {
          conversation_id: senderKey,
          customer_id: senderKey,
          customer_name: message.sender_name,
          last_message_at: message.created_at,
          message_count: 0,
          order_completed: false,
          payment_detected: false,
          recentMessages: []
        });
      }

      const conv = conversationsMap.get(senderKey);
      conv.message_count++;
      conv.last_message_at = message.created_at > conv.last_message_at ? message.created_at : conv.last_message_at;

      // Check for payment/order keywords
      if (message.message_text.toLowerCase().includes('payment') ||
          message.message_text.toLowerCase().includes('pay')) {
        conv.payment_detected = true;
      }
      if (message.message_text.toLowerCase().includes('order') ||
          message.message_text.toLowerCase().includes('buy')) {
        conv.order_completed = true;
      }

      // Add recent message
      if (conv.recentMessages.length < 1) {
        conv.recentMessages.push({
          role: message.sender_type === 'vendor' ? 'assistant' : 'user',
          content: message.message_text,
          sent_at: message.created_at
        });
      }
    });

    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
      .slice(0, limit);

    return NextResponse.json({
      conversations
    });
  } catch (error) {
    console.error('Error in GET /api/vendor/conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
