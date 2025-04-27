
"use client"; // Add this directive

import type { FC } from 'react';
import Link from 'next/link';
import { Utensils, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext'; // Import useCart
import { Badge } from "@/components/ui/badge"; // Import Badge

const Header: FC = () => {
  const { totalItems } = useCart(); // Get totalItems from CartContext

  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50"> {/* Make header sticky */}
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Utensils className="h-6 w-6" />
          <span>Biterush</span> {/* Updated text */}
        </Link>
        <nav>
          <Link href="/cart" className="relative flex items-center gap-2 hover:text-accent transition-colors p-2 rounded-md hover:bg-primary/90">
            <ShoppingCart className="h-6 w-6" />
            <span className="hidden sm:inline">Cart</span> {/* Hide text on small screens */}
            {totalItems > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 px-2 py-0.5 text-xs">
                {totalItems}
              </Badge>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
