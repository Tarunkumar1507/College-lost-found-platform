import { useEffect, useMemo, useState } from 'react';
import { supabase, type Item } from '@/lib/supabase';
import { PageContainer, PageHeader } from '@/layouts/MainLayout';
import { ItemCard } from '@/components/ItemCard';
import { SearchBar } from '@/components/SearchBar';
import { FilterBar } from '@/components/FilterBar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { ButtonLink } from '@/layouts/MainLayout';

export function BrowseItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('all');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select('*, profiles!items_user_id_fkey(*)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setItems(data as Item[]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const locations = useMemo(
    () => [...new Set(items.map((i) => i.location))].sort(),
    [items]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (type !== 'all' && item.type !== type) return false;
      if (category !== 'all' && item.category !== category) return false;
      if (location !== 'all' && item.location !== location) return false;
      if (q) {
        const hay = (item.item_name + ' ' + item.description).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, search, type, category, location]);

  return (
    <PageContainer>
      <PageHeader title="Browse Items" subtitle="Search and filter lost and found reports across campus." />

      <div className="space-y-4 mb-6">
        <SearchBar value={search} onChange={setSearch} />
        <FilterBar
          type={type}
          onTypeChange={setType}
          category={category}
          onCategoryChange={setCategory}
          location={location}
          onLocationChange={setLocation}
          locations={locations}
        />
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={items.length === 0 ? 'No lost or found items yet.' : 'No items found. Try another search.'}
          message="Try adjusting your search or filters, or report a lost or found item."
          action={
            <div className="flex gap-2">
              <ButtonLink to="/report-lost">Report Lost</ButtonLink>
              <ButtonLink to="/report-found" variant="secondary">Report Found</ButtonLink>
            </div>
          }
        />
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Showing {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}
    </PageContainer>
  );
}
