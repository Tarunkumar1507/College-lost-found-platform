import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { PageContainer } from '@/layouts/MainLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Search, PackageSearch, PlusCircle, ArrowRight, PackageCheck, HandHelping, Send } from 'lucide-react';

interface Stats {
  lost: number;
  found: number;
  returned: number;
}

export function HomePage() {
  const [stats, setStats] = useState<Stats>({ lost: 0, found: 0, returned: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { count: lost } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'lost');
      const { count: found } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'found');
      const { count: returned } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'returned');
      setStats({
        lost: lost ?? 0,
        found: found ?? 0,
        returned: returned ?? 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  const steps = [
    { icon: PlusCircle, title: 'Report', text: 'Post details about a lost or found item.' },
    { icon: Search, title: 'Search', text: 'Browse reports and find matching belongings.' },
    { icon: HandHelping, title: 'Claim', text: 'Submit a claim if you believe a found item belongs to you.' },
    { icon: PackageCheck, title: 'Return', text: 'Admin verifies the claim and the item is returned.' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white border-b border-gray-100">
        <PageContainer>
          <div className="text-center max-w-2xl mx-auto py-12 sm:py-20">
            <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 tracking-tight">
              Campus Lost &amp; Found
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-600">
              Lost something? Found something? Help return it to its owner.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/report-lost"
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
              >
                Report Lost Item
              </Link>
              <Link
                to="/report-found"
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
              >
                Report Found Item
              </Link>
              <Link
                to="/items"
                className="w-full sm:w-auto px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <PackageSearch className="w-5 h-5" /> Browse Items
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <PageContainer>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <StatCard label="Lost Items" value={stats.lost} color="red" loading={loading} />
            <StatCard label="Found Items" value={stats.found} color="green" loading={loading} />
            <StatCard label="Returned Items" value={stats.returned} color="blue" loading={loading} />
          </div>
        </PageContainer>
      </section>

      {/* How it works */}
      <section>
        <PageContainer>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">How it works</h2>
          <p className="text-center text-gray-500 mb-10">Four simple steps to reunite belongings with owners.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="relative bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-1.5 text-sm text-gray-500">{step.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/items"
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700"
            >
              <Send className="w-4 h-4" />
              Browse all items
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}

function StatCard({ label, value, color, loading }: { label: string; value: number; color: 'red' | 'green' | 'blue'; loading: boolean }) {
  const colors = {
    red: 'border-red-200 bg-red-50 text-red-700',
    green: 'border-green-200 bg-green-50 text-green-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
  };
  return (
    <div className={`rounded-xl border p-6 text-center ${colors[color]}`}>
      <div className="text-3xl sm:text-4xl font-bold">
        {loading ? <LoadingSpinner size="sm" /> : value}
      </div>
      <div className="mt-1 text-sm font-medium">{label}</div>
    </div>
  );
}
