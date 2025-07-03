import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

export default function Login() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  const getFriendlyErrorMessage = (err) => {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      '';

    const lowerMsg = msg.toLowerCase();

    if (lowerMsg.includes('invalid')) return 'Invalid email or password.';
    if (lowerMsg.includes('email')) return 'Email not found.';
    if (lowerMsg.includes('password')) return 'Incorrect password.';
    if (lowerMsg.includes('required')) return 'All fields are required.';
    return 'Login failed. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      router.push('/dashboard');
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider) => {
    sessionStorage.setItem('redirectUrl', '/dashboard');
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Login to Planova</h2>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 mb-4 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mt-1"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="my-4 text-center text-sm text-gray-500">or login with</div>

        <div className="flex gap-4">
          <button
            onClick={() => handleOAuth('google')}
            className="flex-1 border py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Google
          </button>
          <button
            onClick={() => handleOAuth('github')}
            className="flex-1 border py-2 rounded-lg hover:bg-gray-100 transition"
          >
            GitHub
          </button>
        </div>

        <p className="mt-6 text-sm text-center">
          Don&apos;t have an account?{' '}
          <a href="/auth/register" className="text-indigo-600 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
