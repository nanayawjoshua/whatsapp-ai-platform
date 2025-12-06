'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Message {
  message_id: number;
  role: string;
  content: string;
  sent_at: string;
}

interface Conversation {
  conversation_id: string;
  customer_id: string;
  customer_name?: string;
  started_at: string;
  last_message_at: string;
  message_count: number;
  order_completed: boolean;
  payment_detected: boolean;
  messages: Message[];
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
}

export default function ConversationDetailPage({
  params
}: {
  params: { id: string }
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    loadConversation();
  }, [params.id]);

  const loadConversation = async () => {
    try {
      const response = await fetch(`/api/vendor/conversations/${params.id}`);

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to load conversation');
      }

      const data = await response.json();
      setConversation(data.conversation);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      router.push('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-gray-600">Conversation not found</p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-yellow-600 hover:text-yellow-700 font-semibold"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const customerName = conversation.customer_name ||
                       conversation.customer_id.split('@')[0] ||
                       'Unknown Customer';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-all"
              >
                ← Back
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {customerName}
                </h1>
                <p className="text-sm text-gray-500">
                  {conversation.message_count} messages • {conversation.tokenUsage.total.toLocaleString()} tokens
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              {conversation.order_completed && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                  ✅ Order
                </span>
              )}
              {conversation.payment_detected && (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                  💰 Payment
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversation ID</p>
                <p className="font-mono text-xs text-gray-400">{conversation.conversation_id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Started</p>
                <p className="text-sm text-gray-900">
                  {new Date(conversation.started_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
            {conversation.messages.map((message) => (
              <MessageBubble key={message.message_id} message={message} />
            ))}
          </div>

          {/* Token Usage Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-600">Input tokens:</span>{' '}
                <span className="font-semibold">{conversation.tokenUsage.input.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Output tokens:</span>{' '}
                <span className="font-semibold">{conversation.tokenUsage.output.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Total:</span>{' '}
                <span className="font-semibold">{conversation.tokenUsage.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const time = new Date(message.sent_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className={`flex items-center space-x-2 mt-1 px-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-400">{isUser ? '👤 Customer' : '🤖 AI'}</span>
          <span className="text-xs text-gray-400">{time}</span>
        </div>
      </div>
    </div>
  );
}
