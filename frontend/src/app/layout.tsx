import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../styles/globals.css';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';

export const metadata: Metadata = {
  title: 'FIP Core MVP',
  description: 'Fundacao do MVP de conciliacao financeira'
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <AppSidebar />
        <div className="min-h-screen lg:pl-64">
          <AppHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
