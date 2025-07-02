import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/router';

export default function Logout() {
  const { setUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      try {
        await api.post('/auth/logout');
        setUser(null);
        router.push('/auth/login');
      } catch (err) {
        console.error('Logout failed:', err);
      }
    };

    logout();
  }, []);

  return <p className="p-6">Logging out...</p>;
}
