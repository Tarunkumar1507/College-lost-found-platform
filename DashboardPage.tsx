import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, type Item, type Claim } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { PageContainer, PageHeader } from '@/layouts/MainLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { Trash2, Eye, PackageSearch, HandHelping } from 'lucide-react';

type Tab = 'lost' | 'found' | 'claims';

export function DashboardPage() {
  const { session, profile } = useAuth();
  const [tab, setTab] = useState<Tab>('lost');
  const [lostItems, setLostItems] = useState<Item[]>([]);
  const [foundItems, setFoundItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!session) return;
      const userId = session.user.id;

      const [lost, found, cl] = await Promise.all([
        supabase
          .from('items')
          .select('*')
          .eq('user_id', userId)
          .eq('type', 'lost')
          .order('created_at', { ascending: false }),
        supabase
          .from('items')
          .select('*')
          .eq('user_id', userId)
          .eq('type', 'found')
          .order('created_at', { ascending: false }),
        supabase
          .from('claims')
          .select('*, items(*)')
          .eq('claimant_id', userId)
          .order('created_at', { ascending: false }),
      ]);

      setLostItems((lost.data as Item[]) ?? []);
      setFoundItems((found.data as Item[]) ?? []);
      setClaims((cl.data as Claim[]) ?? []);
      setLoading(false);
    }
    load();
  }, [session]);

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this report? This cannot be undone.')) return;
    const { error } = await supabase.from('items').delete().eq('id', itemId);
    if (error) {
      alert('Failed to delete report. Please try again.');
      return;
    }
    setLostItems((prev) => prev.filter((i) => i.id !== itemId));
    setFoundItems((prev) => prev.filter((i) => i.id !== itemId));
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <PageHeader title="My Dashboard" subtitle={`Welcome back, ${profile?.full_name ?? 'Student'}.`} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        <TabButton active={tab === 'lost'} onClick={() => setTab('lost')} label="My Lost Reports" count={lostItems.length} />
        <TabButton active={tab === 'found'} onClick={() => setTab('found')} label="My Found Reports" count={foundItems.length} />
        <TabButton active={tab === 'claims'} onClick={() => setTab('claims')} label="My Claims" count={claims.length} />
      </div>

      {tab === 'lost' && (
        <ReportList
          items={lostItems}
          onDelete={handleDelete}
          emptyTitle="You haven't reported any lost items yet."
          emptyMessage="Lost something? Report it so others can help you find it."
          emptyAction={<Link to="/report-lost" className="px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium text-sm hover:bg-red-700">Report Lost Item</Link>}
        />
      )}

      {tab === 'found' && (
        <ReportList
          items={foundItems}
          onDelete={handleDelete}
          emptyTitle="You haven't reported any found items yet."
          emptyMessage="Found something? Report it so the owner can claim it."
          emptyAction={<Link to="/report-found" className="px-4 py-2.5 rounded-lg bg-green-600 text-white font-medium text-sm hover:bg-green-700">Report Found Item</Link>}
        />
      )}

      {tab === 'claims' && (
        <ClaimList claims={claims} />
      )}
    </PageContainer>
  );
}

function TabButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
        active
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {label} <span className="ml-1 text-xs text-gray-400">({count})</span>
    </button>
  );
}

function ReportList({ items, onDelete, emptyTitle, emptyMessage, emptyAction }: {
  items: Item[];
  onDelete: (id: string) => void;
  emptyTitle: string;
  emptyMessage: string;
  emptyAction?: React.ReactNode;
}) {
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} action={emptyAction} />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
          <tr>
            <th className="text-left px-4 py-3 font-medium">Item</th>
            <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Location</th>
            <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Date</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
            <th className="text-right px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">{item.item_name}</div>
                <div className="text-xs text-gray-500 sm:hidden">{item.location} · {new Date(item.item_date).toLocaleDateString()}</div>
              </td>
              <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{item.location}</td>
              <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{new Date(item.item_date).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {item.status === 'active' ? 'Active' : 'Returned'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    to={`/items/${item.id}`}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  {item.status === 'active' && (
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ClaimList({ claims }: { claims: Claim[] }) {
  if (claims.length === 0) {
    return (
      <EmptyState
        title="You haven't submitted any claims yet."
        message="Found an item that might be yours? Browse items and submit a claim."
        action={<Link to="/items" className="px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700">Browse Items</Link>}
      />
    );
  }

  const statusStyles: Record<string, { dot: string; text: string; label: string }> = {
    pending: { dot: 'bg-amber-400', text: 'text-amber-700', label: 'Pending' },
    approved: { dot: 'bg-green-500', text: 'text-green-700', label: 'Approved' },
    rejected: { dot: 'bg-red-500', text: 'text-red-700', label: 'Rejected' },
  };

  return (
    <div className="space-y-3">
      {claims.map((claim) => {
        const s = statusStyles[claim.status] ?? statusStyles.pending;
        return (
          <div key={claim.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <Link
                  to={`/items/${claim.item_id}`}
                  className="font-semibold text-gray-900 hover:text-blue-600"
                >
                  {claim.items?.item_name ?? 'Item'}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                  <span className={`text-sm font-medium ${s.text}`}>{s.label}</span>
                  <span className="text-xs text-gray-400">
                    · Claimed on {new Date(claim.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Link
                to={`/items/${claim.item_id}`}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <Eye className="w-4 h-4" /> View Item
              </Link>
            </div>
            {claim.status === 'approved' && (
              <p className="mt-3 text-sm text-green-700 bg-green-50 rounded-lg p-3">
                The administrator has approved your claim. Please coordinate with the admin to collect your item.
              </p>
            )}
            {claim.status === 'rejected' && (
              <p className="mt-3 text-sm text-red-700 bg-red-50 rounded-lg p-3">
                Your claim was not approved. If you believe this is an error, please contact the administrator.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
