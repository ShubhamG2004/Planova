// components/layouts/DashboardLayout.js
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiHome, FiFolder, FiBell, FiLogOut, FiChevronDown, FiUser } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { label: 'Home', href: '/dashboard', icon: <FiHome className="text-lg" /> },
  { label: 'Projects', href: '/projects', icon: <FiFolder className="text-lg" /> },
  { label: 'Invites', href: '/invites', icon: <FiBell className="text-lg" /> },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm hidden md:flex flex-col">
        <div className="p-6 pb-2">
          <h2 className="text-2xl font-bold text-indigo-600 mb-8">Planova</h2>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  router.pathname === item.href 
                    ? 'bg-indigo-50 text-indigo-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}>
                  <span className={`${
                    router.pathname === item.href ? 'text-indigo-500' : 'text-gray-500'
                  }`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-4 border-t border-gray-200">
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <FiUser />
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <FiChevronDown className="text-gray-500" />
          </div>
          
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 text-gray-600 hover:text-red-600 px-4 py-3 mt-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
          >
            <FiLogOut className="text-lg" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800 capitalize">
            {router.pathname.split('/').filter(Boolean).join(' / ') || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button className="p-2 rounded-full hover:bg-gray-100 relative">
                <FiBell className="text-lg text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
            <div className="hidden md:flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <FiUser />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}