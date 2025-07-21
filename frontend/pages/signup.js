import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup } = useAuth();
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await signup(email, password);
      router.push('/');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <form onSubmit={handleSignup} className="flex flex-col gap-4 p-4 border rounded-md shadow-md">
        <h2 className="text-xl font-bold">Signup</h2>
        <input
          className="border p-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border p-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-green-600 text-white p-2 rounded" type="submit">
          Signup
        </button>
      </form>
    </div>
  );
}
