import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, type Item, type Claim } from '@/lib/supabase';
import { PageContainer, PageHeader } from '@/layouts/MainLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { Trash2, Eye, CheckCircle2, XCircle, PackageCheck, Package, HandHelping, Clock } from 'lucide-react';

type Tab = 'overview' | 'reports' | 'claims';

export function AdminPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [items, setItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    const [itemsRes, claimsRes] = await Promise.all([
      supabase
        .from('items')
        .select('*, profiles!items_user_id_fkey(*)')
        .order('created_at', { ascending: false }),
      supabase
        .from('claims')
        .select('*, items(*), profiles!claims_claimant_id_fkey(*)')
        .order('created_at', { ascending: false }),
    ]);
    setItems((itemsRes.data as Item[]) ?? []);
    setClaims((claimsRes.data as Claim[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const stats = {
    lost: items.filter((i) => i.type === 'lost').length,
    found: items.filter((i) => i.type === 'found').length,
    returned: items.filter((i) => i.status === 'returned').length,
    pending: claims.filter((c) => c.status === 'pending').length,
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this report? This cannot be undone.')) return;
    setActionLoading(itemId);
    const { error } = await supabase.from('items').delete().eq('id', itemId);
    setActionLoading(null);
    if (error) {
      alert('Failed to delete report.');
      return;
    }
    await loadData();
  };

  const handleMarkReturned = async (itemId: string) => {
    if (!confirm('Mark this item as returned? It will be removed from the active browse page.')) return;
    setActionLoading(itemId);
    const { error } = await supabase.from('items').update({ status: 'returned' }).eq('id', itemId);
    setActionLoading(null);
    if (error) {
      alert('Failed to update item status.');
      return;
    }
    await loadData();
  };

  const handleClaim = async (claimId: string, status: 'approved' | 'rejected', itemId?: string) => {
    const action = status === 'approved' ? 'approve' : 'reject';
    if (!confirm(`Are you sure you want to ${action} this claim?`)) return;
    setActionLoading(claimId);
    const { error } = await supabase.from('claims').update({ status }).eq('id', claimId);
    if (error) {
      setActionLoading(null);
      alert(`Failed to ${action} claim.`);
      return;
    }
    if (status === 'approved' && itemId) {
      await supabase.from('items').update({ status: 'returned' }).eq('id', itemId);
    }
    setActionLoading(null);
    await loadData();
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Admin Panel" subtitle="Manage reports and claims across the platform." />

      <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
        <TabButton active={tab === 'overview'} onClick={() => setTab('overview')} label="Overview" />
        <TabButton active={tab === 'reports'} onClick={() => setTab('reports')} label="Reports" />
        <TabButton active={tab === 'claims'} onClick={() => setTab('claims')} label="Claims" />
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Package} label="Total Lost" value={stats.lost} color="red" />
          <StatCard icon={Package} label="Total Found" value={stats.found} color="green" />
          <StatCard icon={PackageCheck} label="Total Returned" value={stats.returned} color="blue" />
          <StatCard icon={Clock} label="Pending Claims" value={stats.pending} color="amber" />
        </div>
      )}

      {tab === 'reports' && (
        items.length === 0 ? (
          <EmptyState title="No reports yet." message="Item reports will appear here." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Item</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Location</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Posted By</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{item.item_name}</div>
                      <div className="text-xs text-gray-400 md:hidden">
                        <span className={item.type === 'lost' ? 'text-red-600' : 'text-green-600'}>
                          {item.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{item.category}</td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{item.location}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{item.profiles?.full_name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/items/${item.id}`}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {item.status === 'active' && (
                          <button
                            onClick={() => handleMarkReturned(item.id)}
                            disabled={actionLoading === item.id}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                            title="Mark Returned"
                          >
                            <PackageCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={actionLoading === item.id}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {tab === 'claims' && (
        claims.length === 0 ? (
          <EmptyState title="No claims yet." message="Item claims will appear here for review." />
        ) : (
          <div className="space-y-3">
            {claims.map((claim) => (
              <div key={claim.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/items/${claim.item_id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {claim.items?.item_name ?? 'Item'}
                      </Link>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        claim.items?.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {claim.items?.type ?? '—'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Claimant:</span> {claim.profiles?.full_name ?? 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Reason:</span> {claim.reason}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Submitted on {new Date(claim.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      claim.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      claim.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {claim.status}
                    </span>
                    {claim.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleClaim(claim.id, 'approved', claim.item_id)}
                          disabled={actionLoading === claim.id}
                          className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleClaim(claim.id, 'rejected')}
                          disabled={actionLoading === claim.id}
                          className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </PageContainer>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
        active
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Package; label: string; value: number; color: 'red' | 'green' | 'blue' | 'amber' }) {
  const colors = {
    red: 'bg-red-50 text-red-700 border-red-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <Icon className="w-6 h-6 mb-2" />
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm font-medium mt-0.5">{label}</div>
    </div>
  );
}
