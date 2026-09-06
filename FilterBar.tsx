import { CATEGORIES } from '@/lib/supabase';

export function FilterBar({
  type,
  onTypeChange,
  category,
  onCategoryChange,
  location,
  onLocationChange,
  locations,
}: {
  type: string;
  onTypeChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  location: string;
  onLocationChange: (v: string) => void;
  locations: string[];
}) {
  const selectClass =
    'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          className={selectClass + ' w-full'}
        >
          <option value="all">All</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className={selectClass + ' w-full'}
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
        <select
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          className={selectClass + ' w-full'}
        >
          <option value="all">All Locations</option>
          {locations.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
