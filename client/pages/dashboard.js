import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import api from '@/lib/api'; // Assuming you have an API client set up

export default function Dashboard() {
  const { user, logout } = useAuth(); // Assuming your AuthContext provides logout
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user === null) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      setLoading(true);
      setError(null);
      await logout(); // Using AuthContext's logout instead of direct API call
      router.push('/auth/login');
    } catch (err) {
      setError(err.message || 'Logout failed');
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (user === null) return <RedirectMessage message="🔐 Redirecting to login..." />;
  if (!user) return <RedirectMessage message="🔄 Loading dashboard..." />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user.name}!</h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your account today.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <DashboardCard 
            title="Your Profile" 
            icon="👤"
            action={() => router.push('/profile')}
          >
            View and edit your profile information
          </DashboardCard>
          
          <DashboardCard 
            title="Settings" 
            icon="⚙️"
            action={() => router.push('/settings')}
          >
            Configure your account preferences
          </DashboardCard>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-500">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          disabled={loading}
          className={`px-6 py-3 rounded-md font-medium ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
          } transition-colors duration-200 flex items-center`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging out...
            </>
          ) : (
            'Logout'
          )}
        </button>
      </div>
    </div>
  );
}

function DashboardCard({ title, icon, children, action }) {
  return (
    <div 
      onClick={action}
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center mb-3">
        <span className="text-2xl mr-3">{icon}</span>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-gray-600">{children}</p>
    </div>
  );
}

function RedirectMessage({ message }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <p className="text-lg">{message}</p>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}