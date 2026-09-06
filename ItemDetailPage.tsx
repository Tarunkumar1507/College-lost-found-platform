import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase, type Item } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { PageContainer } from '@/layouts/MainLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { ClaimForm } from '@/components/ClaimForm';
import { MapPin, Calendar, Tag, User, Clock, ArrowLeft, HandHelping } from 'lucide-react';

export function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [showClaim, setShowClaim] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select('*, profiles!items_user_id_fkey(*)')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        setItem(null);
      } else {
        setItem(data as Item);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <PageContainer>
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  if (!item) {
    return (
      <PageContainer>
        <EmptyState
          title="Item not found"
          message="This item may have been removed or the link is invalid."
          action={
            <button
              onClick={() => navigate('/items')}
              className="px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700"
            >
              Browse Items
            </button>
          }
        />
      </PageContainer>
    );
  }

  const isLost = item.type === 'lost';
  const isOwner = session?.user.id === item.user_id;

  return (
    <PageContainer>
      <Link
        to="/items"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Browse
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="rounded-xl border border-gray-200 bg-gray-100 overflow-hidden aspect-[4/3] flex items-center justify-center">
          {item.image_url ? (
            <img src={item.image_url} alt={item.item_name} className="w-full h-full object-cover" />
          ) : (
            <MapPin className="w-20 h-20 text-gray-300" />
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isLost ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}
            >
              {isLost ? 'Lost' : 'Found'}
            </span>
            {item.status === 'returned' && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                Returned
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{item.item_name}</h1>

          <div className="mt-4 space-y-2.5 text-sm">
            <DetailRow icon={Tag} label="Category" value={item.category} />
            <DetailRow icon={MapPin} label="Location" value={item.location} />
            <DetailRow
              icon={Calendar}
              label={isLost ? 'Date Lost' : 'Date Found'}
              value={new Date(item.item_date).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            />
            <DetailRow
              icon={User}
              label="Posted By"
              value={item.profiles?.full_name ?? 'Unknown'}
            />
            <DetailRow
              icon={Clock}
              label="Posted On"
              value={new Date(item.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            />
          </div>

          {item.description && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-1.5">Description</h2>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          )}

          {/* Claim section */}
          {!isLost && item.status === 'active' && !isOwner && (
            <div className="mt-8">
              {!showClaim ? (
                <button
                  onClick={() => setShowClaim(true)}
                  className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <HandHelping className="w-5 h-5" /> This is my item
                </button>
              ) : (
                <div className="rounded-xl border border-gray-200 p-5 bg-gray-50">
                  <h2 className="font-semibold text-gray-900 mb-4">Submit a Claim</h2>
                  <ClaimForm item={item} />
                </div>
              )}
            </div>
          )}

          {isOwner && (
            <div className="mt-8 rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
              This is your report. You can manage it from your Dashboard.
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <div>
        <div className="text-xs text-gray-400">{label}</div>
        <div className="text-gray-900 font-medium">{value}</div>
      </div>
    </div>
  );
}
