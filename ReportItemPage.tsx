import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, CATEGORIES, type Category, type ItemType } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { PageContainer, PageHeader } from '@/layouts/MainLayout';
import { ImageUpload } from '@/components/ImageUpload';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function ReportItemPage({ type }: { type: ItemType }) {
  const navigate = useNavigate();
  const { session } = useAuth();
  const isLost = type === 'lost';

  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [itemDate, setItemDate] = useState(new Date().toISOString().slice(0, 10));
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!itemName.trim()) return setError('Item name is required.');
    if (!category) return setError('Please select a category.');
    if (!location.trim()) return setError(`Location ${isLost ? 'lost' : 'found'} is required.`);
    if (!itemDate) return setError(`Date ${isLost ? 'lost' : 'found'} is required.`);

    setSubmitting(true);
    try {
      const { error: err } = await supabase.from('items').insert({
        user_id: session?.user.id,
        type,
        item_name: itemName.trim(),
        category,
        description: description.trim(),
        location: location.trim(),
        item_date: itemDate,
        image_url: imageUrl,
        status: 'active',
      });

      if (err) throw err;

      setSuccess(true);
      setTimeout(() => navigate('/items'), 1200);
    } catch {
      setError('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <PageContainer>
        <div className="max-w-md mx-auto mt-16">
          <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-900">
              {isLost ? 'Lost item reported!' : 'Found item reported!'}
            </h2>
            <p className="text-sm text-gray-600 mt-1.5">
              Your report has been submitted successfully. Redirecting to browse items...
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title={isLost ? 'Report Lost Item' : 'Report Found Item'}
          subtitle={isLost ? 'Post details about an item you lost on campus.' : 'Post details about an item you found on campus.'}
        />

        <form onSubmit={submit} className="space-y-5 bg-white rounded-xl border border-gray-200 p-6">
          <Field label="Item Name" required>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Black Wallet"
              className={inputClass}
            />
          </Field>

          <Field label="Category" required>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass + ' cursor-pointer'}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the item — color, brand, distinguishing features..."
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label={`Location ${isLost ? 'Lost' : 'Found'}`} required>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. College Library"
                className={inputClass}
              />
            </Field>

            <Field label={`Date ${isLost ? 'Lost' : 'Found'}`} required>
              <input
                type="date"
                value={itemDate}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setItemDate(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <ImageUpload onUpload={setImageUrl} currentUrl={imageUrl} />

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`w-full px-4 py-2.5 rounded-lg font-medium text-sm text-white disabled:opacity-60 flex items-center justify-center gap-2 ${
              isLost ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {submitting ? (
              <><LoadingSpinner size="sm" /> Submitting...</>
            ) : (
              `Submit ${isLost ? 'Lost' : 'Found'} Item`
            )}
          </button>
        </form>
      </div>
    </PageContainer>
  );
}

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
