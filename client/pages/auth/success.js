import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';

export default function AuthSuccess() {
  const router = useRouter();
  const { token } = router.query;
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.replace('/auth/login');
      return;
    }

    const verifyToken = async () => {
      try {
        // Save token in localStorage
        localStorage.setItem('token', token);


        // Retry logic for verifying token
        let attempts = 3;
        let lastError;

        while (attempts > 0) {
          try {
            const { data } = await api.get('/auth/me');
            setUser(data.user);

            const redirectUrl = sessionStorage.getItem('redirectUrl') || '/dashboard';
            sessionStorage.removeItem('redirectUrl');
            router.replace(redirectUrl);
            return;
          } catch (err) {
            lastError = err;
            attempts--;
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        throw lastError;
      } catch (err) {
        console.error('Auth verification failed:', err);
        localStorage.removeItem('token');

        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          'Authentication failed. Please log in again.';

        router.replace(`/auth/login?error=${encodeURIComponent(errorMessage)}`);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, router, setUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center">
            <svg
              className="animate-spin h-8 w-8 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <h1 className="mt-4 text-xl font-semibold text-gray-800">
            Verifying your session...
          </h1>
        </div>
      </div>
    );
  }

  return null;
}
