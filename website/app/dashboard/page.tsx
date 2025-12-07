'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import WhatsAppConnection from '@/components/WhatsAppConnection';

interface Vendor {
  vendorId: string;
  name: string;
  email?: string;
  phone?: string;
  businessType?: string;
  subscriptionStatus: string;
}

interface Stats {
  totalMessages: number;
  userMessages: number;
  aiMessages: number;
  aiResponseRate: number;
  totalConversations: number;
  completedOrders: number;
  paymentsDetected: number;
}

interface Conversation {
  conversation_id: string;
  customer_id: string;
  customer_name?: string;
  last_message_at: string;
  message_count: number;
  order_completed: boolean;
  payment_detected: boolean;
  recentMessages?: Array<{
    role: string;
    content: string;
    sent_at: string;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [period, setPeriod] = useState('today');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      loadDashboardData();
    }
  }, [status, period]);

  const loadDashboardData = async () => {
    try {

      // Load stats
      const statsResponse = await fetch(`/api/vendor/stats?period=${period}`);
      const statsData = await statsResponse.json();
      setStats(statsData.stats);

      // Load conversations
      const conversationsResponse = await fetch('/api/vendor/conversations?limit=10');
      const conversationsData = await conversationsResponse.json();
      setConversations(conversationsData.conversations);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      router.push('/login');
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐝</div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-3xl">🐝</Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {session?.user?.name || 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-500">
                  {session?.user?.businessType || 'Business'} • {session?.user?.subscriptionStatus}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Period Selector */}
        <div className="mb-6 flex space-x-2">
          {['today', 'week', 'month', 'all'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                period === p
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* WhatsApp Connection Status */}
        {session?.user?.vendorId && (
          <div className="mb-6">
            <WhatsAppConnection vendorId={session.user.vendorId} />
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Messages"
              value={stats.totalMessages}
              icon="💬"
            />
            <StatCard
              title="AI Response Rate"
              value={`${stats.aiResponseRate}%`}
              icon="🤖"
            />
            <StatCard
              title="Conversations"
              value={stats.totalConversations}
              icon="👥"
            />
            <StatCard
              title="Payments Detected"
              value={stats.paymentsDetected}
              icon="💰"
            />
          </div>
        )}

        {/* Recent Conversations */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Conversations</h2>
          </div>

          {conversations.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <div className="text-5xl mb-4">💭</div>
              <p>No conversations yet</p>
              <p className="text-sm mt-2">
                Share your WhatsApp number with customers to start chatting!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {conversations.map((conv) => (
                <ConversationCard key={conv.conversation_id} conversation={conv} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}

function ConversationCard({ conversation }: { conversation: Conversation }) {
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const customerName = conversation.customer_name ||
                       conversation.customer_id.split('@')[0] ||
                       'Unknown Customer';

  const lastMessage = conversation.recentMessages?.[conversation.recentMessages.length - 1];

  return (
    <Link
      href={`/dashboard/conversations/${encodeURIComponent(conversation.conversation_id)}`}
      className="block px-6 py-4 hover:bg-gray-50 transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-xl">
              👤
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{customerName}</h3>
              <p className="text-sm text-gray-500">
                {conversation.message_count} messages
              </p>
            </div>
          </div>
          {lastMessage && (
            <p className="text-sm text-gray-600 ml-13 truncate">
              {lastMessage.role === 'user' ? '👤' : '🤖'} {lastMessage.content}
            </p>
          )}
        </div>
        <div className="text-right ml-4">
          <p className="text-sm text-gray-500 mb-2">
            {formatTime(conversation.last_message_at)}
          </p>
          {conversation.payment_detected && (
            <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
              💰 Payment
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
