'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaUsers, FaWhatsapp, FaMoneyBillWave, FaChartLine, FaSync, FaLightbulb } from 'react-icons/fa';
import BeelineLogo from '../components/BeelineLogo';
import { MdDashboard, MdPeople, MdSettings } from 'react-icons/md';

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
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <BeelineLogo size="lg" />
          <p className="text-dark-text-secondary mt-4">Loading Super Admin Dashboard...</p>
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
          <NavItem icon={<MdPeople />} label="Vendors" />
          <NavItem icon={<MdSettings />} label="Settings" />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-glass-bg backdrop-blur-xl border-b border-dark-border">
          <div className="px-8 py-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-light tracking-tight">Super Admin</h1>
              <p className="text-dark-text-secondary mt-1">Platform-wide metrics at a glance.</p>
            </div>
            <button onClick={fetchMetrics} className="p-3 rounded-xl bg-dark-bg-tertiary/50 hover:bg-dark-bg-tertiary transition-colors">
              <FaSync className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard title="Total Vendors" value={metrics?.totalVendors} icon={<FaUsers />} />
            <MetricCard title="Live Connections" value={metrics?.liveConnections} icon={<FaWhatsapp />} />
            <MetricCard title="Conversations Today" value={metrics?.todayConversations} icon={<FaChartLine />} />
            <MetricCard title="Revenue Today" value={`GHS ${metrics?.paymentsDetected * 150 || 0}`} icon={<FaMoneyBillWave />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-glass-bg border border-glass-border rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">Recent Vendors</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-dark-border">
                        <th className="p-3">Vendor</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics?.recentVendors?.map(v => (
                        <tr key={v.vendor_id} className="border-b border-dark-border hover:bg-dark-bg-tertiary/30">
                          <td className="p-3">{v.name}</td>
                          <td className="p-3"><StatusPill status={v.subscription_status} /></td>
                          <td className="p-3"><TypePill type={v.account_type} /></td>
                          <td className="p-3 text-sm text-dark-text-tertiary">{new Date(v.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-glass-bg border border-glass-border rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">Subscription Status</h3>
                <BreakdownChart data={metrics?.bySubscriptionStatus} />
              </div>
              <div className="bg-glass-bg border border-glass-border rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">Account Types</h3>
                <BreakdownChart data={metrics?.byAccountType} />
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

function MetricCard({ title, value, icon }: { title: string; value?: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-glass-bg border border-glass-border rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <span className="text-dark-text-secondary">{title}</span>
        <div className="text-beeline-yellow">{icon}</div>
      </div>
      <p className="text-4xl font-bold mt-2">{value ?? '...'}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles = {
    active: 'bg-green-500/20 text-green-400',
    trial: 'bg-yellow-500/20 text-yellow-400',
    expired: 'bg-red-500/20 text-red-400',
  }[status] || 'bg-gray-500/20 text-gray-400';
  return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles}`}>{status}</span>;
}

function TypePill({ type }: { type: string }) {
    const styles = {
    personal: 'bg-blue-500/20 text-blue-400',
    business: 'bg-purple-500/20 text-purple-400',
    enterprise: 'bg-pink-500/20 text-pink-400',
  }[type] || 'bg-gray-500/20 text-gray-400';
  return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles}`}>{type}</span>;
}

function BreakdownChart({ data }: { data?: { [key: string]: number } }) {
  if (!data) return <p className="text-dark-text-secondary">No data available.</p>;

  const total = Object.values(data).reduce((sum, val) => sum + val, 0);

  return (
    <div className="space-y-3">
      {Object.entries(data).map(([key, value]) => (
        <div key={key}>
          <div className="flex justify-between text-sm mb-1">
            <span className="capitalize text-dark-text-secondary">{key}</span>
            <span>{value}</span>
          </div>
          <div className="w-full bg-dark-bg-tertiary rounded-full h-2">
            <div
              className="bg-gradient-beeline h-2 rounded-full"
              style={{ width: `${(value / total) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}
