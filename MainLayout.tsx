import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="mt-1.5 text-gray-500">{subtitle}</p>}
    </div>
  );
}

export function ButtonLink({ to, children, variant = 'primary' }: { to: string; children: ReactNode; variant?: 'primary' | 'secondary' }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
        variant === 'primary'
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
      }`}
    >
      {children}
    </Link>
  );
}
