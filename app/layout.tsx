import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Exora — DEX Execution Optimizer',
  description: 'Compare DEX swap routes and make better execution decisions with real public data.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
