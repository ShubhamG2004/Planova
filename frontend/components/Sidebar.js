// components/Sidebar.js
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/projects', label: 'Projects' },
    { href: '/tasks', label: 'Tasks' },
    { href: '/settings', label: 'Settings' },
  ];

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col fixed">
      <div className="p-6 font-bold text-xl border-b border-gray-700">
        Planova
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-3 py-2 rounded hover:bg-gray-700 ${
              router.pathname === link.href ? 'bg-gray-800' : ''
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 px-3 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
