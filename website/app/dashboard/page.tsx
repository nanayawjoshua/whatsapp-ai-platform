'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  FaWhatsapp,
  FaChartLine,
  FaUsers,
  FaRobot,
  FaMoneyBillWave,
  FaSignOutAlt,
  FaCog,
  FaBell,
  FaHome,
  FaComments
} from 'react-icons/fa';
import { MdDashboard, MdMessage, MdPerson, MdTrendingUp } from 'react-icons/md';
import BeelineLogo from '../components/BeelineLogo';
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

export default function DashboardPageNew() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [period, setPeriod] = useState('today');
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4"><BeelineLogo size="lg" /></div>
          <p className="text-dark-text-secondary">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-glass-bg backdrop-blur-xl border-r border-dark-border transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-dark-border">
          {sidebarOpen ? (
            <BeelineLogo size="md" />
          ) : (
            <BeelineLogo size="md" showText={false} />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={<MdDashboard />} label="Dashboard" active={true} collapsed={!sidebarOpen} />
          <NavItem icon={<FaComments />} label="Conversations" href="/dashboard/conversations" collapsed={!sidebarOpen} />
          <NavItem icon={<MdMessage />} label="Messages" collapsed={!sidebarOpen} />
          <NavItem icon={<FaChartLine />} label="Analytics" collapsed={!sidebarOpen} />
          <NavItem icon={<FaCog />} label="Settings" collapsed={!sidebarOpen} />
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-dark-border">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-beeline flex items-center justify-center text-black font-bold">
                {session?.user?.name?.[0] || 'V'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-dark-text truncate">{session?.user?.name}</p>
                <p className="text-xs text-dark-text-tertiary truncate">{session?.user?.subscriptionStatus}</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-beeline flex items-center justify-center text-black font-bold mx-auto mb-4">
              {session?.user?.name?.[0] || 'V'}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-dark-bg-tertiary/50 hover:bg-dark-bg-tertiary border border-dark-border rounded-lg text-dark-text-secondary hover:text-dark-text transition-all flex items-center gap-2 justify-center"
          >
            <FaSignOutAlt className="w-4 h-4" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-glass-bg backdrop-blur-xl border-b border-dark-border">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light text-dark-text tracking-tight">
                Dashboard
              </h1>
              <p className="text-sm text-dark-text-secondary mt-1">
                Welcome back, {session?.user?.name}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Period Selector */}
              <div className="flex items-center gap-2">
                {['today', 'week', 'month', 'all'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      period === p
                        ? 'bg-gradient-beeline text-black shadow-glow'
                        : 'bg-glass-bg backdrop-blur-md border border-glass-border text-dark-text-secondary hover:bg-dark-bg-tertiary/80'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>

              {/* Notifications */}
              <button className="relative p-2 bg-glass-bg backdrop-blur-md border border-glass-border rounded-lg hover:bg-dark-bg-tertiary/80 transition-all">
                <FaBell className="w-5 h-5 text-dark-text-secondary" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-beeline-orange rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* WhatsApp Connection Status */}
          {session?.user?.vendorId && (
            <div className="mb-8">
              <WhatsAppConnection vendorId={session.user.vendorId} />
            </div>
          )}

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Messages"
                value={stats.totalMessages}
                icon={<FaComments className="w-6 h-6" />}
                trend="+12%"
                trendUp={true}
              />
              <StatsCard
                title="AI Response Rate"
                value={`${stats.aiResponseRate}%`}
                icon={<FaRobot className="w-6 h-6" />}
                trend="+5%"
                trendUp={true}
              />
              <StatsCard
                title="Active Conversations"
                value={stats.totalConversations}
                icon={<FaUsers className="w-6 h-6" />}
                trend="+8%"
                trendUp={true}
              />
              <StatsCard
                title="Payments Detected"
                value={stats.paymentsDetected}
                icon={<FaMoneyBillWave className="w-6 h-6" />}
                trend="+15%"
                trendUp={true}
              />
            </div>
          )}

          {/* Recent Conversations */}
          <div className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl shadow-glass overflow-hidden">
            <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between">
              <h2 className="text-xl font-semibold text-dark-text">Recent Conversations</h2>
              <Link
                href="/dashboard/conversations"
                className="text-sm text-beeline-yellow hover:text-beeline-orange transition-colors"
              >
                View All →
              </Link>
            </div>

            {conversations.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-dark-bg-tertiary/50 flex items-center justify-center">
                  <FaWhatsapp className="w-10 h-10 text-beeline-yellow/50" />
                </div>
                <p className="text-dark-text-secondary mb-2">No conversations yet</p>
                <p className="text-sm text-dark-text-tertiary">
                  Share your WhatsApp number with customers to start chatting!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-dark-border">
                {conversations.map((conv) => (
                  <ConversationRow key={conv.conversation_id} conversation={conv} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// NavItem Component
function NavItem({
  icon,
  label,
  active = false,
  collapsed = false,
  href
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  href?: string;
}) {
  const className = `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
    active
      ? 'bg-beeline-yellow/10 border border-beeline-yellow/20 text-beeline-yellow'
      : 'text-dark-text-secondary hover:bg-dark-bg-tertiary/50 hover:text-dark-text'
  } ${collapsed ? 'justify-center' : ''}`;

  const content = (
    <>
      <div className="w-5 h-5 flex items-center justify-center">{icon}</div>
      {!collapsed && <span className="font-medium">{label}</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button className={className}>
      {content}
    </button>
  );
}

// StatsCard Component
function StatsCard({
  title,
  value,
  icon,
  trend,
  trendUp
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <div className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl p-6 shadow-glass hover:border-beeline-yellow/30 hover:shadow-glow transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-beeline-yellow/20 border border-beeline-yellow/20 flex items-center justify-center text-beeline-yellow">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
            <MdTrendingUp className={`w-4 h-4 ${!trendUp && 'transform rotate-180'}`} />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <p className="text-sm text-dark-text-secondary mb-1">{title}</p>
      <p className="text-3xl font-bold text-dark-text">{value}</p>
    </div>
  );
}

// ConversationRow Component
function ConversationRow({ conversation }: { conversation: Conversation }) {
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
      className="block px-6 py-4 hover:bg-dark-bg-tertiary/30 transition-all group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 rounded-full bg-gradient-beeline flex items-center justify-center text-black font-bold text-lg flex-shrink-0">
            {customerName[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-dark-text group-hover:text-beeline-yellow transition-colors">
                {customerName}
              </h3>
              {conversation.payment_detected && (
                <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 text-green-400 text-xs rounded-full flex items-center gap-1">
                  <FaMoneyBillWave className="w-3 h-3" />
                  Payment
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-dark-text-tertiary">
                {conversation.message_count} messages
              </span>
              <span className="text-dark-text-tertiary">•</span>
              <span className="text-sm text-dark-text-tertiary">
                {formatTime(conversation.last_message_at)}
              </span>
            </div>
            {lastMessage && (
              <p className="text-sm text-dark-text-secondary mt-2 truncate">
                {lastMessage.role === 'user' ? (
                  <MdPerson className="inline w-4 h-4 mr-1 text-blue-400" />
                ) : (
                  <FaRobot className="inline w-4 h-4 mr-1 text-beeline-yellow" />
                )}
                {lastMessage.content}
              </p>
            )}
          </div>
        </div>
        <div className="text-dark-text-tertiary group-hover:text-beeline-yellow transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
