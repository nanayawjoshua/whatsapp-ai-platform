'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaUsers, FaWhatsapp, FaMoneyBillWave, FaChartLine, FaSync } from 'react-icons/fa';

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

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/metrics');
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beeline-cream to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-beeline-yellow mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beeline-cream to-white flex items-center justify-center">
        <div className="card p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700">{error}</p>
          <button onClick={fetchMetrics} className="btn-primary mt-4 w-full">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-beeline-cream to-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-beeline-black mb-2">
              Beeline Super Admin
            </h1>
            <p className="text-gray-600">Real-time platform metrics and analytics</p>
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                autoRefresh
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 text-gray-700'
              }`}
            >
              {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
            </button>
            <button
              onClick={fetchMetrics}
              className="btn-secondary flex items-center gap-2"
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Vendors */}
          <div className="card p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex justify-between items-start mb-4">
              <FaUsers className="text-4xl opacity-80" />
              <div className="text-right">
                <p className="text-sm opacity-90">Total Vendors</p>
                <h3 className="text-3xl font-bold">{metrics.totalVendors}</h3>
              </div>
            </div>
            <div className="flex justify-between text-sm opacity-90">
              <span>Active: {metrics.activeVendors}</span>
              <span>Inactive: {metrics.inactiveVendors}</span>
            </div>
          </div>

          {/* Live Connections */}
          <div className="card p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex justify-between items-start mb-4">
              <FaWhatsapp className="text-4xl opacity-80" />
              <div className="text-right">
                <p className="text-sm opacity-90">Live Connections</p>
                <h3 className="text-3xl font-bold">{metrics.liveConnections}</h3>
              </div>
            </div>
            <p className="text-sm opacity-90">WhatsApp sessions active now</p>
          </div>

          {/* Conversations */}
          <div className="card p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex justify-between items-start mb-4">
              <FaChartLine className="text-4xl opacity-80" />
              <div className="text-right">
                <p className="text-sm opacity-90">Total Conversations</p>
                <h3 className="text-3xl font-bold">{metrics.totalConversations}</h3>
              </div>
            </div>
            <div className="flex justify-between text-sm opacity-90">
              <span>Today: {metrics.todayConversations}</span>
              <span>Msgs: {metrics.totalMessages}</span>
            </div>
          </div>

          {/* Revenue Metrics */}
          <div className="card p-6 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <div className="flex justify-between items-start mb-4">
              <FaMoneyBillWave className="text-4xl opacity-80" />
              <div className="text-right">
                <p className="text-sm opacity-90">Completed Orders</p>
                <h3 className="text-3xl font-bold">{metrics.completedOrders}</h3>
              </div>
            </div>
            <div className="flex justify-between text-sm opacity-90">
              <span>Payments: {metrics.paymentsDetected}</span>
              <span>Referrals: {metrics.referralsTriggered}</span>
            </div>
          </div>
        </div>

        {/* Account Type & Subscription Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* By Account Type */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-beeline-black mb-4">By Account Type</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-blue-900">Personal</span>
                <span className="text-2xl font-bold text-blue-600">
                  {metrics.byAccountType.personal}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-900">Business</span>
                <span className="text-2xl font-bold text-green-600">
                  {metrics.byAccountType.business}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="font-medium text-purple-900">Enterprise</span>
                <span className="text-2xl font-bold text-purple-600">
                  {metrics.byAccountType.enterprise}
                </span>
              </div>
            </div>
          </div>

          {/* By Subscription Status */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-beeline-black mb-4">By Subscription Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-900">Active</span>
                <span className="text-2xl font-bold text-green-600">
                  {metrics.bySubscriptionStatus.active}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="font-medium text-red-900">Expired</span>
                <span className="text-2xl font-bold text-red-600">
                  {metrics.bySubscriptionStatus.expired}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="font-medium text-yellow-900">Trial</span>
                <span className="text-2xl font-bold text-yellow-600">
                  {metrics.bySubscriptionStatus.trial}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Vendors Table */}
        <div className="card p-6">
          <h3 className="text-xl font-bold text-beeline-black mb-4">Recent Vendors</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Phone</th>
                  <th className="text-left py-3 px-4">Account Type</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Created</th>
                  <th className="text-left py-3 px-4">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentVendors.map((vendor) => (
                  <tr key={vendor.vendor_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{vendor.name}</td>
                    <td className="py-3 px-4 text-gray-600">{vendor.phone}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        vendor.account_type === 'enterprise'
                          ? 'bg-purple-100 text-purple-800'
                          : vendor.account_type === 'business'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {vendor.account_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        vendor.subscription_status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : vendor.subscription_status === 'trial'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {vendor.subscription_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(vendor.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {vendor.last_active
                        ? new Date(vendor.last_active).toLocaleDateString()
                        : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
