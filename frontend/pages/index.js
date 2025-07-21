import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="p-4">
        <h1 className="text-2xl font-bold">Welcome, {user?.email}</h1>
        <button onClick={logout} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
          Logout
        </button>
      </div>
    </ProtectedRoute>
  );
}
