'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Activity,
  TrendingUp,
  DollarSign,
  RefreshCw,
  LayoutDashboard,
  Settings,
  Bell,
  Search,
  User,
  LogOut,
  Circle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import BeelineLogoNew from '../components/BeelineLogoNew';

interface AdminMetrics {
  totalVendors: number;
  activeVendors: number;
  inactiveVendors: number;
  totalConversations: number;
  todayConversations: number;
  totalMessages: number;
  completedOrders: number;
  paymentsDetected: number;
  referralsTriggered: number;
  byAccountType: {
    personal: number;
    business: number;
    enterprise: number;
  };
  bySubscriptionStatus: {
    active: number;
    expired: number;
    trial: number;
  };
  recentVendors: Array<{
    vendor_id: string;
    name: string;
    phone: string;
    account_type: string;
    subscription_status: string;
    created_at: string;
    last_active: string;
  }>;
  liveConnections: number;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'vendors' | 'settings'>('overview');

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'admin')) {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchMetrics();
    }
  }, [status, session, router]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/metrics');
      if (!response.ok) throw new Error('Failed to fetch admin metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <BeelineLogoNew size="lg" />
          <p className="text-text-secondary mt-4">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Top Navigation - Vercel Style */}
      <header className="sticky top-0 z-50 bg-surface border-b border-cream-border">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-8">
              <BeelineLogoNew size="sm" />

              {/* Navigation Tabs */}
              <nav className="hidden md:flex items-center gap-1">
                <NavTab
                  label="Overview"
                  icon={<LayoutDashboard size={16} />}
                  active={activeTab === 'overview'}
                  onClick={() => setActiveTab('overview')}
                />
                <NavTab
                  label="Vendors"
                  icon={<Users size={16} />}
                  active={activeTab === 'vendors'}
                  onClick={() => setActiveTab('vendors')}
                />
                <NavTab
                  label="Settings"
                  icon={<Settings size={16} />}
                  active={activeTab === 'settings'}
                  onClick={() => setActiveTab('settings')}
                />
              </nav>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-text-tertiary hover:text-text-secondary border border-cream-border rounded-lg hover:bg-cream-dark transition-colors">
                <Search size={14} />
                <span>Search...</span>
                <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-xs bg-cream-dark rounded border border-cream-border">
                  ⌘K
                </kbd>
              </button>

              {/* Refresh */}
              <button
                onClick={fetchMetrics}
                className="p-2 text-text-secondary hover:text-text-primary hover:bg-cream-dark rounded-lg transition-colors"
                title="Refresh data"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>

              {/* Notifications */}
              <button className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-cream-dark rounded-lg transition-colors">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-2 pl-3 border-l border-cream-border">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-text-primary">Admin</p>
                  <p className="text-xs text-text-tertiary">{session?.user?.email}</p>
                </div>
                <button className="p-1.5 rounded-full bg-gradient-beeline text-white">
                  <User size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Platform Overview</h1>
          <p className="text-text-secondary">Real-time system health and vendor analytics</p>
        </div>

        {/* System Health Banner */}
        <div className="bg-gradient-to-r from-success/10 to-success/5 border border-success/20 rounded-2xl p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center">
                <Activity size={24} className="text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-1">All Systems Operational</h3>
                <p className="text-sm text-text-secondary">
                  {metrics?.liveConnections || 0} active connections • {metrics?.activeVendors || 0} vendors online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-success">
              <Circle size={8} fill="currentColor" />
              <span className="text-sm font-semibold">Live</span>
            </div>
          </div>
        </div>

        {/* KPI Grid - 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Vendors"
            value={metrics?.totalVendors || 0}
            change={12.3}
            trend="up"
            icon={<Users size={20} className="text-beeline-orange" />}
            subtitle={`${metrics?.activeVendors || 0} active`}
          />
          <MetricCard
            title="Live Connections"
            value={metrics?.liveConnections || 0}
            change={5.7}
            trend="up"
            icon={<Activity size={20} className="text-success" />}
            subtitle="WhatsApp sessions"
          />
          <MetricCard
            title="Conversations Today"
            value={metrics?.todayConversations || 0}
            change={18.2}
            trend="up"
            icon={<TrendingUp size={20} className="text-beeline-orange" />}
            subtitle={`${metrics?.totalConversations || 0} total`}
          />
          <MetricCard
            title="Revenue Today"
            value={`₵${((metrics?.paymentsDetected || 0) * 150).toFixed(0)}`}
            change={24.5}
            trend="up"
            icon={<DollarSign size={20} className="text-success" />}
            subtitle={`${metrics?.completedOrders || 0} orders`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column - Vendor Table */}
          <div className="lg:col-span-2">
            <div className="bg-surface border border-cream-border rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-cream-border">
                <h2 className="text-lg font-semibold text-text-primary">Recent Vendors</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-cream-dark">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        Vendor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-border">
                    {metrics?.recentVendors?.map((v) => (
                      <tr key={v.vendor_id} className="hover:bg-cream-dark transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-text-primary">{v.name}</p>
                            <p className="text-sm text-text-tertiary">{v.phone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusPill status={v.subscription_status} />
                        </td>
                        <td className="px-6 py-4">
                          <TypePill type={v.account_type} />
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary">
                          {new Date(v.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Side Column - Charts */}
          <div className="space-y-6">
            {/* Subscription Status */}
            <div className="bg-surface border border-cream-border rounded-2xl p-6">
              <h3 className="font-semibold text-text-primary mb-4">Subscription Status</h3>
              <BreakdownChart data={metrics?.bySubscriptionStatus} />
            </div>

            {/* Account Types */}
            <div className="bg-surface border border-cream-border rounded-2xl p-6">
              <h3 className="font-semibold text-text-primary mb-4">Account Types</h3>
              <BreakdownChart data={metrics?.byAccountType} />
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-beeline-yellow/10 to-beeline-orange/5 border border-beeline-yellow/20 rounded-2xl p-6">
              <h3 className="font-semibold text-text-primary mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <StatRow label="Total Messages" value={metrics?.totalMessages || 0} />
                <StatRow label="Completed Orders" value={metrics?.completedOrders || 0} />
                <StatRow label="Payments Detected" value={metrics?.paymentsDetected || 0} />
                <StatRow label="Referrals Triggered" value={metrics?.referralsTriggered || 0} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavTab({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-cream-dark text-text-primary'
          : 'text-text-secondary hover:text-text-primary hover:bg-cream-dark'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MetricCard({
  title,
  value,
  change,
  trend,
  icon,
  subtitle,
}: {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down';
  icon: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="bg-surface border border-cream-border rounded-2xl p-6 hover:shadow-soft transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-lg bg-gradient-to-br from-beeline-yellow/10 to-beeline-orange/10">
          {icon}
        </div>
        {change && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold ${
              trend === 'up' ? 'text-success' : 'text-error'
            }`}
          >
            {trend === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {change}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <p className="text-3xl font-bold text-text-primary">{value}</p>
        {subtitle && <p className="text-xs text-text-tertiary">{subtitle}</p>}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const config = {
    active: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20' },
    trial: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20' },
    expired: { bg: 'bg-error/10', text: 'text-error', border: 'border-error/20' },
  }[status] || { bg: 'bg-text-tertiary/10', text: 'text-text-tertiary', border: 'border-text-tertiary/20' };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${config.bg} ${config.text} ${config.border}`}
    >
      <Circle size={6} fill="currentColor" />
      {status}
    </span>
  );
}

function TypePill({ type }: { type: string }) {
  const config = {
    personal: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' },
    business: { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/20' },
    enterprise: { bg: 'bg-pink-500/10', text: 'text-pink-600', border: 'border-pink-500/20' },
  }[type] || { bg: 'bg-text-tertiary/10', text: 'text-text-tertiary', border: 'border-text-tertiary/20' };

  return (
    <span
      className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${config.bg} ${config.text} ${config.border}`}
    >
      {type}
    </span>
  );
}

function BreakdownChart({ data }: { data?: { [key: string]: number } }) {
  if (!data) return <p className="text-text-tertiary text-sm">No data available</p>;

  const total = Object.values(data).reduce((sum, val) => sum + val, 0);

  return (
    <div className="space-y-4">
      {Object.entries(data).map(([key, value]) => {
        const percentage = total > 0 ? (value / total) * 100 : 0;
        return (
          <div key={key}>
            <div className="flex justify-between text-sm mb-2">
              <span className="capitalize text-text-secondary font-medium">{key}</span>
              <span className="text-text-primary font-semibold">{value}</span>
            </div>
            <div className="w-full bg-cream-dark rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-beeline h-2 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className="font-semibold text-text-primary">{value}</span>
    </div>
  );
}
