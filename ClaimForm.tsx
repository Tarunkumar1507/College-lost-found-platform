import { useState } from 'react';
import { supabase, type Item } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function ClaimForm({ item }: { item: Item }) {
  const { session } = useAuth();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session) {
    return (
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 flex items-start gap-2">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <span>Please log in to submit a claim for this item.</span>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800 flex items-start gap-2">
        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
        <span>Your claim has been submitted. The administrator will review it.</span>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please explain why you believe this is your item.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const { error: err } = await supabase.from('claims').insert({
        item_id: item.id,
        reason: reason.trim(),
        claimant_id: session.user.id,
      });

      if (err) {
        if (err.code === '23505') {
          setError('You have already submitted a claim for this item.');
        } else {
          setError('Failed to submit claim. Please try again.');
        }
        return;
      }
      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Why do you believe this is your item?
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="Describe identifying features, contents, or details only the owner would know..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <LoadingSpinner size="sm" /> Submitting...
          </>
        ) : (
          'Submit Claim'
        )}
      </button>
    </form>
  );
}
