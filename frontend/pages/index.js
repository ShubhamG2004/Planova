import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="p-4">
      {user ? (
        <>
          <p>Welcome, {user.email}</p>
          <button onClick={logout} className="bg-black text-white px-4 py-2 rounded">Logout</button>
        </>
      ) : (
        <p>Please login</p>
      )}
    </div>
  );
}
