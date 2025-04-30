
import type { Metadata } from 'next';
// import { GeistSans } from 'geist/font/sans'; // Removed GeistSans import
// import { GeistMono } from 'geist/font/mono'; // Removed GeistMono import
import './globals.css';
import Header from '@/components/Header'; // Import Header
import Footer from '@/components/Footer'; // Corrected import path
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import { CartProvider } from '@/context/CartContext'; // Import CartProvider
import { AuthProvider } from '@/context/AuthContext'; // Import AuthProvider
import { ThemeProvider } from "@/components/ThemeProvider"; // Import ThemeProvider

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
    <html lang="en" className="h-full" suppressHydrationWarning> {/* suppressHydrationWarning for next-themes */}
       <head>
         {/* Preconnect to external domains used for critical resources */}
         <link rel="preconnect" href="https://picsum.photos" />
         <link rel="preconnect" href="https://api.qrserver.com" />
         {/* Add preconnect for font providers if used (e.g., Google Fonts) */}
         {/* <link rel="preconnect" href="https://fonts.googleapis.com" /> */}
         {/* <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /> */}
       </head>
      <body className="antialiased flex flex-col min-h-screen bg-background text-foreground"> {/* Ensure base styles are applied */}
         <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider> {/* Wrap with AuthProvider */}
              <CartProvider> {/* Wrap everything with CartProvider */}
                <Header /> {/* Add Header */}
                <main className="flex-grow container mx-auto px-4 py-8"> {/* Add padding to main content */}
                  {children}
                </main>
                <Toaster /> {/* Add Toaster for notifications */}
                <Footer /> {/* Add Footer */}
              </CartProvider>
            </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
