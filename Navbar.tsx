import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Search, PackageSearch, PlusCircle, LayoutDashboard, Shield, LogOut, LogIn, UserPlus, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-blue-50 text-blue-700'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
  }`;

export function Navbar() {
  const { session, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    setOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg hidden sm:block">
              Campus Lost &amp; Found
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" className={navLinkClass} end>
              Home
            </NavLink>
            <NavLink to="/items" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <PackageSearch className="w-4 h-4" /> Browse Items
              </span>
            </NavLink>
            <NavLink to="/report-lost" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4" /> Report Lost
              </span>
            </NavLink>
            <NavLink to="/report-found" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4" /> Report Found
              </span>
            </NavLink>

            {session && (
              <NavLink to="/dashboard" className={navLinkClass}>
                <span className="flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </span>
              </NavLink>
            )}

            {profile?.is_admin && (
              <NavLink to="/admin" className={navLinkClass}>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> Admin
                </span>
              </NavLink>
            )}

            <div className="w-px h-6 bg-gray-200 mx-2" />

            {session ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass}>
                  <span className="flex items-center gap-1.5">
                    <LogIn className="w-4 h-4" /> Login
                  </span>
                </NavLink>
                <Link
                  to="/register"
                  className="ml-1 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            <MobileLink to="/" onClick={() => setOpen(false)}>Home</MobileLink>
            <MobileLink to="/items" onClick={() => setOpen(false)}>
              <span className="flex items-center gap-2"><Search className="w-4 h-4" /> Browse Items</span>
            </MobileLink>
            <MobileLink to="/report-lost" onClick={() => setOpen(false)}>Report Lost</MobileLink>
            <MobileLink to="/report-found" onClick={() => setOpen(false)}>Report Found</MobileLink>
            {session && <MobileLink to="/dashboard" onClick={() => setOpen(false)}>Dashboard</MobileLink>}
            {profile?.is_admin && <MobileLink to="/admin" onClick={() => setOpen(false)}>Admin Panel</MobileLink>}
            <div className="pt-2 border-t border-gray-100">
              {session ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              ) : (
                <div className="flex gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center px-3 py-2.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-4 h-4" /> Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center px-3 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" /> Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function MobileLink({ to, children, onClick }: { to: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
        }`
      }
    >
      {children}
    </NavLink>
  );
}
