
"use client"; // Add this directive

import type { FC } from 'react';
import Link from 'next/link';
import { Utensils, ShoppingCart, Info } from 'lucide-react'; // Added Info icon
import { useCart } from '@/context/CartContext'; // Import useCart
import { Badge } from "@/components/ui/badge"; // Import Badge
import { useMemo } from 'react'; // Import useMemo

const Header: FC = () => {
  const { totalItems: rawTotalItems } = useCart(); // Get totalItems from CartContext

  // Memoize totalItems to avoid recalculating unless it actually changes
  const totalItems = useMemo(() => rawTotalItems, [rawTotalItems]);

  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50"> {/* Make header sticky */}
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Utensils className="h-6 w-6" />
          <span>Biterush</span> {/* Updated text */}
        </Link>
        <nav className="flex items-center gap-4"> {/* Use flex and gap for nav items */}
           <Link href="/about" className="flex items-center gap-1 hover:text-accent transition-colors p-2 rounded-md hover:bg-primary/90">
              <Info className="h-5 w-5" />
              <span className="hidden sm:inline">About</span> {/* Hide text on small screens */}
           </Link>
          <Link href="/cart" className="relative flex items-center gap-1 hover:text-accent transition-colors p-2 rounded-md hover:bg-primary/90"> {/* Adjusted gap */}
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
