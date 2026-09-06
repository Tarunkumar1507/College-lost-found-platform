import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag } from 'lucide-react';
import type { Item } from '@/lib/supabase';

export function ItemCard({ item }: { item: Item }) {
  const isLost = item.type === 'lost';

  return (
    <Link
      to={`/items/${item.id}`}
      className="group block rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md hover:border-gray-300 transition-all"
    >
      <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.item_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-12 h-12 text-gray-300" />
          </div>
        )}
        <span
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
            isLost
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {isLost ? 'Lost' : 'Found'}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
          {item.item_name}
        </h3>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" /> {item.category}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {item.location}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />{' '}
            {new Date(item.item_date).toLocaleDateString()}
          </span>
        </div>
        {item.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{item.description}</p>
        )}
        <span className="mt-3 inline-block text-sm font-medium text-blue-600 group-hover:text-blue-700">
          View Details →
        </span>
      </div>
    </Link>
  );
}
