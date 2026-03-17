import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WalletProvider from "@/components/WalletProvider";

export const metadata: Metadata = {
  title: "Exora",
  description: "DEX Execution Optimizer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <WalletProvider>
          <div className="min-h-screen bg-slate-950 text-white">
            <Header />
            {children}
            <Footer />
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
