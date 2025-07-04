// components/layouts/DashboardLayout.js
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiHome, FiFolder, FiBell, FiLogOut } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { label: 'Home', href: '/dashboard', icon: <FiHome /> },
  { label: 'Projects', href: '/projects', icon: <FiFolder /> },
  { label: 'Invites', href: '/invites', icon: <FiBell /> },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-4 hidden md:block">
        <h2 className="text-xl font-bold text-indigo-600 mb-6">Planova</h2>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-indigo-50 cursor-pointer ${
                router.pathname === item.href ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700'
              }`}>
                {item.icon}
                {item.label}
              </div>
            </Link>
          ))}
        </nav>
        <div className="mt-8">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 px-3 py-2"
          >
            <FiLogOut />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="w-full bg-white border-b p-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">
            {router.pathname.replace('/', '').toUpperCase() || 'DASHBOARD'}
          </h1>
          <div className="text-sm text-gray-600">
            {user?.name} ({user?.email})
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
