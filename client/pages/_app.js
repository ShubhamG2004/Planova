// pages/_app.js
import '@/styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useRouter } from 'next/router';

const publicRoutes = ['/', '/login', '/register'];

export default function App({ Component, pageProps }) {
  const router = useRouter();

  const isPublic = publicRoutes.includes(router.pathname);
  const getLayout = Component.getLayout || ((page) =>
    isPublic ? page : <DashboardLayout>{page}</DashboardLayout>
  );

  return (
    <AuthProvider>
      {getLayout(<Component {...pageProps} />)}
    </AuthProvider>
  );
}
