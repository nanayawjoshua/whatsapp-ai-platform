'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  FaWhatsapp,
  FaSignOutAlt,
  FaCog,
  FaBell,
  FaComments,
  FaLightbulb
} from 'react-icons/fa';
import { MdDashboard, MdMessage } from 'react-icons/md';
import BeelineLogo from '../components/BeelineLogo';
import WhatsAppConnection from '@/components/WhatsAppConnection';

// ... (interface definitions for Vendor, Stats, Conversation remain the same)
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      loadDashboardData();
    }
  }, [status]);

  const loadDashboardData = async () => {
    try {
      const [statsRes, convosRes] = await Promise.all([
        fetch('/api/vendor/stats?period=today'),
        fetch('/api/vendor/conversations?limit=5'),
      ]);
      const statsData = await statsRes.json();
      const convosData = await convosRes.json();
      setStats(statsData.stats);
      setConversations(convosData.conversations);
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
          <BeelineLogo size="lg" />
          <p className="text-dark-text-secondary mt-4">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex text-dark-text">
      {/* Sidebar */}
      <aside className="w-20 bg-glass-bg backdrop-blur-xl border-r border-dark-border flex flex-col items-center py-6 space-y-6">
        <BeelineLogo size="md" showText={false} />
        <nav className="flex flex-col items-center space-y-4">
          <NavItem icon={<MdDashboard />} label="Dashboard" active />
          <NavItem icon={<FaComments />} label="Conversations" href="/dashboard/conversations" />
          <NavItem icon={<FaCog />} label="Settings" />
        </nav>
        <div className="flex-grow" />
        <div className="flex flex-col items-center space-y-4">
          <button className="p-3 rounded-full hover:bg-dark-bg-tertiary/50 transition-colors">
            <FaBell className="w-5 h-5 text-dark-text-secondary" />
          </button>
          <button onClick={handleLogout} className="p-3 rounded-full hover:bg-dark-bg-tertiary/50 transition-colors">
            <FaSignOutAlt className="w-5 h-5 text-dark-text-secondary" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-glass-bg backdrop-blur-xl border-b border-dark-border">
          <div className="px-8 py-6">
            <h1 className="text-3xl font-light tracking-tight">
              Good morning, {session?.user?.name}.
            </h1>
            <p className="text-dark-text-secondary mt-1">
              Here’s what your AI is doing for you right now.
            </p>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Emotional Hero Section */}
          <div className="mb-12">
            <div className="bg-gradient-to-r from-beeline-yellow/10 via-transparent to-transparent border border-beeline-yellow/20 rounded-2xl p-8">
              <p className="text-sm text-beeline-yellow font-semibold mb-2">✨ While you were away</p>
              <h2 className="text-4xl font-light text-dark-text mb-2">
                Welcome back, {session?.user?.name?.split(' ')[0]}.
              </h2>
              <p className="text-dark-text-secondary">
                Your AI closed <span className="font-semibold text-beeline-yellow">{stats?.completedOrders || 0} sales</span> and 
                handled <span className="font-semibold text-beeline-yellow">{stats?.totalConversations || 0} conversations</span> while you lived your life.
              </p>
            </div>
          </div>

          {/* WhatsApp Connection */}
          {session?.user?.vendorId && (
            <div className="mb-8">
              <WhatsAppConnection vendorId={session.user.vendorId} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2">
              {/* 3 Key KPIs - Simplified Focus */}
              <div className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl shadow-glass p-8 mb-8">
                <h2 className="text-xl font-semibold text-dark-text mb-6">
                  Your Key Metrics
                </h2>
                <div className="grid grid-cols-3 gap-6">
                  <KPICard 
                    value={stats?.completedOrders || 0} 
                    label="Orders" 
                    icon="📦"
                  />
                  <KPICard 
                    value={stats?.totalConversations || 0} 
                    label="Conversations" 
                    icon="💬"
                  />
                  <KPICard 
                    value={`GHS ${(stats?.paymentsDetected || 0) * 150}`} 
                    label="Revenue" 
                    icon="💰"
                  />
                </div>
              </div>

              {/* Story Section - What AI Accomplished */}
              <div className="bg-gradient-to-b from-dark-bg-secondary/50 to-transparent border border-dark-border rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-dark-text mb-4">🎯 What Your AI Did For You</h3>
                <ul className="space-y-3 text-dark-text-secondary">
                  <li className="flex items-start gap-3">
                    <span className="text-beeline-yellow">✓</span>
                    <span>Responded to <strong>{stats?.userMessages || 0} customer messages</strong> in under 2 seconds</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-beeline-yellow">✓</span>
                    <span>Maintained <strong>{stats?.aiResponseRate ? (stats.aiResponseRate * 100).toFixed(0) : 0}% response accuracy</strong> across all conversations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-beeline-yellow">✓</span>
                    <span>Detected <strong>{stats?.paymentsDetected || 0} payments</strong> and logged them automatically</span>
                  </li>
                </ul>
              </div>

              {/* Conversations That Need Attention */}
              <div>
                <h2 className="text-xl font-semibold text-dark-text mb-4">
                  Conversations That Need You
                </h2>
                {conversations.length > 0 ? (
                  <div className="space-y-4">
                    {conversations.map(c => <ConversationCard key={c.conversation_id} conversation={c} />)}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-glass-bg border border-glass-border rounded-2xl">
                    <FaWhatsapp className="w-12 h-12 text-beeline-yellow/30 mx-auto mb-4" />
                    <p className="text-dark-text-secondary">Your AI has everything under control.</p>
                    <p className="text-sm text-dark-text-tertiary">No conversations need your attention right now.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Side Column - Tips & Insights */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-beeline-yellow/10 to-transparent border border-beeline-yellow/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <FaLightbulb className="w-5 h-5 text-beeline-yellow" />
                  <h3 className="font-semibold text-beeline-yellow">Quick Win</h3>
                </div>
                <p className="text-dark-text-secondary text-sm">
                  Add your top 5 products to the AI's knowledge base. It'll start recommending them in conversations.
                </p>
              </div>
              
              {/* Expanded Stats */}
              <div className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl p-6">
                <h3 className="font-semibold text-dark-text mb-4 text-sm">Full Analytics</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-dark-text-secondary">Total Messages</span>
                    <span className="text-dark-text">{stats?.totalMessages || 0}</span>
                  </div>
                  <div className="flex justify-between border-t border-dark-border pt-3 mt-3">
                    <span className="text-dark-text-secondary">AI Messages</span>
                    <span className="text-dark-text">{stats?.aiMessages || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-text-secondary">Customer Messages</span>
                    <span className="text-dark-text">{stats?.userMessages || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false, href }: { icon: React.ReactNode; label: string; active?: boolean; href?: string }) {
  const content = (
    <div className={`p-3 rounded-xl transition-colors ${active ? 'bg-beeline-yellow/10 text-beeline-yellow' : 'text-dark-text-secondary hover:bg-dark-bg-tertiary/50'}`}>
      {icon}
    </div>
  );
  return href ? <Link href={href} title={label}>{content}</Link> : <button title={label}>{content}</button>;
}

function KPICard({ value, label, icon }: { value: string | number; label: string; icon: string }) {
  return (
    <div className="bg-dark-bg-secondary/50 p-6 rounded-xl border border-dark-border hover:border-beeline-yellow/30 transition-colors">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-3xl font-bold text-beeline-yellow">{value}</p>
      <p className="text-dark-text-secondary text-sm mt-2">{label}</p>
    </div>
  );
}

function BigStat({ value, label }: { value: string | number, label: string }) {
  return (
    <div className="bg-dark-bg-secondary/50 p-6 rounded-xl border border-dark-border">
      <p className="text-5xl font-bold bg-gradient-beeline bg-clip-text text-transparent">{value}</p>
      <p className="text-dark-text-secondary mt-2">{label}</p>
    </div>
  );
}

function ConversationCard({ conversation }: { conversation: Conversation }) {
  const lastMessage = conversation.recentMessages?.[0];
  const customerName = conversation.customer_name || conversation.customer_id.split('@')[0];

  return (
    <Link href={`/dashboard/conversations/${conversation.conversation_id}`} className="block bg-glass-bg border border-glass-border rounded-2xl p-6 hover:border-beeline-yellow/30 transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-dark-text group-hover:text-beeline-yellow">{customerName}</h3>
          <p className="text-sm text-dark-text-secondary">
            {conversation.message_count} messages • {new Date(conversation.last_message_at).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {conversation.payment_detected && (
            <span className="text-xs font-medium bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
              Payment
            </span>
          )}
          <span className="text-xs text-dark-text-tertiary">→</span>
        </div>
      </div>
      {lastMessage && (
        <div className="mt-4 bg-dark-bg-secondary/50 p-4 rounded-lg text-sm text-dark-text-secondary">
          <MdMessage className="inline w-4 h-4 mr-2 text-blue-400" />
          <span>{lastMessage.content}</span>
        </div>
      )}
    </Link>
  );
}
