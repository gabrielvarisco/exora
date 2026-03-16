import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WalletProvider from "@/components/WalletProvider";

export const metadata: Metadata = {
  title: "Exora",
  description: "DEX Execution Optimizer"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <div className="app-bg" />
          <Header />
          {children}
          <Footer />
        </WalletProvider>
      </body>
    </html>
  );
}
