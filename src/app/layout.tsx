
import type { Metadata } from 'next';
// import { GeistSans } from 'geist/font/sans'; // Removed GeistSans import
// import { GeistMono } from 'geist/font/mono'; // Removed GeistMono import
import './globals.css';
import Header from '@/components/Header'; // Import Header
import Footer from '@/components/Footer'; // Corrected import path
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import { CartProvider } from '@/context/CartContext'; // Import CartProvider

export const metadata: Metadata = {
  title: 'Biterush', // Updated title
  description: 'Order food at your campus!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Removed GeistSans.variable and GeistMono.variable from className
    <html lang="en" className="h-full">
      <body className="antialiased flex flex-col min-h-screen">
        <CartProvider> {/* Wrap everything with CartProvider */}
          <Header /> {/* Add Header */}
          <main className="flex-grow container mx-auto px-4 py-8"> {/* Add padding to main content */}
            {children}
          </main>
          <Toaster /> {/* Add Toaster for notifications */}
          <Footer /> {/* Add Footer */}
        </CartProvider>
      </body>
    </html>
  );
}
