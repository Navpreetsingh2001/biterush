import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header'; // Import Header
import Footer from '@/components/Footer'; // Import Footer
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Campus Grub',
  description: 'Order food at your campus!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Header /> {/* Add Header */}
        <main className="flex-grow container mx-auto px-4 py-8"> {/* Add padding to main content */}
          {children}
        </main>
        <Toaster /> {/* Add Toaster for notifications */}
        <Footer /> {/* Add Footer */}
      </body>
    </html>
  );
}
