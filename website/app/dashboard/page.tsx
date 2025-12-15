'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  MessageSquare,
  ShoppingBag,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  LayoutDashboard,
  MessageCircle,
  Package,
  Bot,
  BarChart3,
  CreditCard,
  Settings,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import BeelineLogo from '../components/BeelineLogo';
import WhatsAppConnection from '../components/WhatsAppConnection';

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      // If user signed up with Google but hasn't completed phone setup, redirect to signup
      if (!session?.user?.phone) {
        router.push('/signup');
        return;
      }
      loadDashboardData();
    }
  }, [status, session]);

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
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <BeelineLogo size="lg" />
          <p className="text-text-secondary mt-4">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar - Stripe Style */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } bg-surface border-r border-cream-border flex flex-col transition-all duration-300`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-cream-border">
          {!sidebarCollapsed && <BeelineLogo size="sm" />}
          {sidebarCollapsed && <BeelineLogo size="sm" showText={false} />}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active
            collapsed={sidebarCollapsed}
          />
          <NavItem
            icon={<MessageCircle size={20} />}
            label="Conversations"
            href="/dashboard/conversations"
            collapsed={sidebarCollapsed}
          />
          <NavItem
            icon={<Package size={20} />}
            label="Orders"
            collapsed={sidebarCollapsed}
          />
          <NavItem
            icon={<Bot size={20} />}
            label="AI Assistant"
            collapsed={sidebarCollapsed}
          />
          <NavItem
            icon={<BarChart3 size={20} />}
            label="Analytics"
            collapsed={sidebarCollapsed}
          />
          <NavItem
            icon={<CreditCard size={20} />}
            label="Billing"
            collapsed={sidebarCollapsed}
          />

          <div className="pt-4 border-t border-cream-border" />

          <NavItem
            icon={<Settings size={20} />}
            label="Settings"
            collapsed={sidebarCollapsed}
          />
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-cream-border space-y-1">
          <NavItem
            icon={<Bell size={20} />}
            label="Notifications"
            collapsed={sidebarCollapsed}
          />
          <NavItem
            icon={<LogOut size={20} />}
            label="Log out"
            onClick={handleLogout}
            collapsed={sidebarCollapsed}
          />
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute bottom-6 -right-3 w-6 h-6 bg-surface border border-cream-border rounded-full flex items-center justify-center hover:shadow-soft transition-all"
        >
          {sidebarCollapsed ? (
            <ChevronRight size={14} className="text-text-secondary" />
          ) : (
            <ChevronLeft size={14} className="text-text-secondary" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-surface border-b border-cream-border px-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">
              Good morning, {session?.user?.name?.split(' ')[0]}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* WhatsApp Connection */}
          {session?.user?.vendorId && (
            <div className="mb-8">
              <WhatsAppConnection vendorId={session.user.vendorId} />
            </div>
          )}

          {/* KPI Cards Grid - Stripe Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="Total Conversations"
              value={stats?.totalConversations || 0}
              change={12.5}
              trend="up"
              icon={<MessageSquare size={20} className="text-beeline-orange" />}
            />
            <KPICard
              title="Active Orders"
              value={stats?.completedOrders || 0}
              change={8.2}
              trend="up"
              icon={<ShoppingBag size={20} className="text-beeline-orange" />}
            />
            <KPICard
              title="Avg Response Time"
              value="1.2s"
              change={15.3}
              trend="down"
              icon={<Clock size={20} className="text-beeline-orange" />}
            />
            <KPICard
              title="Revenue Today"
              value={`₵${((stats?.paymentsDetected || 0) * 150).toFixed(0)}`}
              change={22.4}
              trend="up"
              icon={<DollarSign size={20} className="text-beeline-orange" />}
            />
          </div>

          {/* Hero Section */}
          <div className="bg-gradient-warm rounded-3xl p-8 mb-8 border border-cream-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-beeline-orange mb-2">
                  While you were away
                </p>
                <h2 className="text-3xl font-light text-text-primary mb-3">
                  Your AI handled everything.
                </h2>
                <p className="text-text-secondary max-w-2xl">
                  Your AI closed <span className="font-semibold text-text-primary">{stats?.completedOrders || 0} sales</span> and
                  responded to <span className="font-semibold text-text-primary">{stats?.userMessages || 0} customer messages</span> in
                  under 2 seconds each.
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="w-16 h-16 bg-gradient-beeline rounded-2xl flex items-center justify-center shadow-glow">
                  <Bot size={32} className="text-white" />
                </div>
              </div>
            </div>

            {/* Mini Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-surface/60 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 text-success mb-1">
                  <CheckCircle2 size={16} />
                  <span className="text-xs font-semibold">Success Rate</span>
                </div>
                <p className="text-2xl font-bold text-text-primary">
                  {stats?.aiResponseRate ? (stats.aiResponseRate * 100).toFixed(0) : 0}%
                </p>
              </div>
              <div className="bg-surface/60 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 text-text-secondary mb-1">
                  <MessageCircle size={16} />
                  <span className="text-xs font-semibold">AI Messages</span>
                </div>
                <p className="text-2xl font-bold text-text-primary">
                  {stats?.aiMessages || 0}
                </p>
              </div>
              <div className="bg-surface/60 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 text-warning mb-1">
                  <AlertCircle size={16} />
                  <span className="text-xs font-semibold">Payments Detected</span>
                </div>
                <p className="text-2xl font-bold text-text-primary">
                  {stats?.paymentsDetected || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column - Conversations */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-text-primary">
                  Recent Conversations
                </h2>
                <Link
                  href="/dashboard/conversations"
                  className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  View all →
                </Link>
              </div>

              {conversations.length > 0 ? (
                <div className="space-y-3">
                  {conversations.map((c) => (
                    <ConversationCard key={c.conversation_id} conversation={c} />
                  ))}
                </div>
              ) : (
                <div className="bg-surface rounded-2xl border border-cream-border p-12 text-center">
                  <div className="w-16 h-16 bg-cream-dark rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle size={32} className="text-text-tertiary" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    All caught up
                  </h3>
                  <p className="text-text-secondary text-sm">
                    Your AI has everything under control. No conversations need your attention right now.
                  </p>
                </div>
              )}
            </div>

            {/* Side Column - Quick Actions & Stats */}
            <div className="space-y-6">
              {/* Quick Win */}
              <div className="bg-gradient-to-br from-beeline-yellow/10 to-beeline-orange/5 border border-beeline-yellow/20 rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-beeline-yellow/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot size={18} className="text-beeline-orange" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary mb-1">Quick Win</h3>
                    <p className="text-sm text-text-secondary">
                      Add your top 5 products to the AI's knowledge base. It'll start recommending them automatically.
                    </p>
                  </div>
                </div>
                <button className="w-full mt-4 px-4 py-2 bg-gradient-beeline text-white text-sm font-semibold rounded-xl hover:shadow-hover transition-all">
                  Add Products →
                </button>
              </div>

              {/* Full Analytics */}
              <div className="bg-surface rounded-2xl border border-cream-border p-6">
                <h3 className="font-semibold text-text-primary mb-4">Analytics</h3>
                <div className="space-y-4">
                  <StatRow label="Total Messages" value={stats?.totalMessages || 0} />
                  <StatRow label="AI Messages" value={stats?.aiMessages || 0} />
                  <StatRow label="Customer Messages" value={stats?.userMessages || 0} />
                  <div className="pt-4 border-t border-cream-border">
                    <StatRow
                      label="Response Rate"
                      value={`${stats?.aiResponseRate ? (stats.aiResponseRate * 100).toFixed(0) : 0}%`}
                      highlight
                    />
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

function NavItem({
  icon,
  label,
  active = false,
  href,
  onClick,
  collapsed,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
  collapsed: boolean;
}) {
  const baseClasses = `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
    active
      ? 'bg-gradient-to-r from-beeline-yellow/10 to-beeline-orange/10 text-beeline-orange border border-beeline-yellow/20'
      : 'text-text-secondary hover:bg-cream-dark hover:text-text-primary'
  }`;

  const content = (
    <>
      <div className={collapsed ? 'mx-auto' : ''}>{icon}</div>
      {!collapsed && <span className="text-sm font-medium">{label}</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses} title={collapsed ? label : undefined}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={`${baseClasses} w-full`} title={collapsed ? label : undefined}>
      {content}
    </button>
  );
}

function KPICard({
  title,
  value,
  change,
  trend,
  icon,
}: {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down';
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-surface rounded-2xl p-6 border border-cream-border hover:shadow-soft transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-beeline-yellow/10 to-beeline-orange/10">
          {icon}
        </div>
        {change && (
          <div
            className={`flex items-center gap-1 text-sm font-semibold ${
              trend === 'up' ? 'text-success' : 'text-error'
            }`}
          >
            {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {change}%
          </div>
        )}
      </div>
      <div className="text-text-tertiary text-sm font-medium mb-1">{title}</div>
      <div className="text-text-primary text-3xl font-bold">{value}</div>
    </div>
  );
}

function ConversationCard({ conversation }: { conversation: Conversation }) {
  const lastMessage = conversation.recentMessages?.[0];
  const customerName = conversation.customer_name || conversation.customer_id.split('@')[0];

  return (
    <Link
      href={`/dashboard/conversations/${conversation.conversation_id}`}
      className="block bg-surface rounded-2xl border border-cream-border p-5 hover:border-beeline-yellow/30 hover:shadow-soft transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-text-primary group-hover:text-beeline-orange transition-colors">
            {customerName}
          </h3>
          <p className="text-sm text-text-tertiary mt-0.5">
            {conversation.message_count} messages •{' '}
            {new Date(conversation.last_message_at).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {conversation.payment_detected && (
            <span className="text-xs font-semibold bg-success/10 text-success px-2.5 py-1 rounded-full border border-success/20">
              Payment
            </span>
          )}
          {conversation.order_completed && (
            <span className="text-xs font-semibold bg-beeline-yellow/10 text-beeline-orange px-2.5 py-1 rounded-full border border-beeline-yellow/20">
              Completed
            </span>
          )}
        </div>
      </div>
      {lastMessage && (
        <div className="bg-cream-dark rounded-xl p-3 text-sm text-text-secondary">
          <span className="font-medium text-text-primary">{lastMessage.role === 'user' ? 'Customer' : 'AI'}:</span>{' '}
          {lastMessage.content}
        </div>
      )}
    </Link>
  );
}

function StatRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text-secondary">{label}</span>
      <span
        className={`text-sm font-semibold ${
          highlight ? 'text-beeline-orange' : 'text-text-primary'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
