import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ConfirmProvider } from '@/hooks/useConfirm';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Axioma Core',
  description: 'Sistema de autenticación y autorización multi-tenant con permisos granulares',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <ConfirmProvider>{children}</ConfirmProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
