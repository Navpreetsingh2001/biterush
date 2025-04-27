
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header'; // Import Header
import Footer from '@/components/Footer.jsx'; // Corrected import path by adding .jsx extension
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import { CartProvider } from '@/context/CartContext'; // Import CartProvider

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Removed TypeScript Metadata type
export const metadata = {
  title: 'Campus Grub',
  description: 'Order food at your campus!',
};

// Removed TypeScript type annotation for props
export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
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
