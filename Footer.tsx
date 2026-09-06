import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Campus Lost &amp; Found</span>
          </div>
          <p className="text-sm text-gray-500">
            A central place to reunite students with their belongings.
          </p>
        </div>
      </div>
    </footer>
  );
}
