
"use client"; // Add this directive

import type { FC } from 'react';
import Link from 'next/link';
import { Utensils, ShoppingCart, Info, LogIn, UserPlus, LogOut, ShieldCheck, UserCog, Truck } from 'lucide-react'; // Added auth icons, ShieldCheck/UserCog for admin/superAdmin, Truck for vendor
import { useCart } from '@/context/CartContext'; // Import useCart
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { Badge } from "@/components/ui/badge"; // Import Badge
import { Button } from "@/components/ui/button"; // Import Button
import { useMemo } from 'react'; // Import useMemo
import { logoutUser } from '@/actions/auth'; // Import logout action
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { ThemeToggle } from '@/components/ThemeToggle'; // Import ThemeToggle

const Header: FC = () => {
  const { totalItems: rawTotalItems } = useCart(); // Get totalItems from CartContext
  // Get additional role flags
  const { user, loading, isAdmin, isSuperAdmin, isVendor, logout } = useAuth();
  const { toast } = useToast();

  // Memoize totalItems to avoid recalculating unless it actually changes
  const totalItems = useMemo(() => rawTotalItems, [rawTotalItems]);

  // Determine if user has any kind of admin access
  const hasAdminAccess = isAdmin || isSuperAdmin;

  const handleLogout = async () => {
      try {
          await logoutUser(); // Call server action
          logout(); // Update context state
          toast({ title: "Logged Out", description: "You have been successfully logged out." });
          // Optionally clear cart on logout
          // clearCart();
      } catch (error) {
           console.error("Logout failed:", error);
           toast({ title: "Logout Failed", description: "Could not log out. Please try again.", variant: "destructive" });
      }
    };

    // Memoize the display name based on the user object
    const displayName = useMemo(() => {
        if (!user) return "";
        // Use actual username if available. If username is "New user" or empty, show default "user".
        // Add check for specific roles to show role name if username is generic
        if (user.username && user.username !== "New user") {
             return user.username;
        }
        if(isSuperAdmin) return "Super Admin";
        if(isAdmin) return "Admin";
        if(isVendor) return "Vendor";
        return "User";
    }, [user, isAdmin, isSuperAdmin, isVendor]);


  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50"> {/* Make header sticky */}
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Utensils className="h-6 w-6" />
          <span>Biterush</span> {/* Updated text */}
        </Link>
        <nav className="flex items-center gap-1 md:gap-2"> {/* Use flex and gap for nav items */}
           {/* Always visible links */}
           <Link href="/" className="hidden sm:flex items-center gap-1 transition-colors p-2 rounded-md hover:bg-primary/80 hover:text-primary-foreground">
                <Utensils className="h-5 w-5" />
                <span className="hidden sm:inline">Order</span>
           </Link>
           <Link href="/about" className="flex items-center gap-1 transition-colors p-2 rounded-md hover:bg-primary/80 hover:text-primary-foreground">
              <Info className="h-5 w-5" />
              <span className="hidden sm:inline">About</span> {/* Hide text on small screens */}
           </Link>

            {/* Cart Link - visible to all logged-in users */}
            {user && (
                <Link href="/cart" className="relative flex items-center gap-1 transition-colors p-2 rounded-md hover:bg-primary/80 hover:text-primary-foreground">
                    <ShoppingCart className="h-6 w-6" />
                    <span className="hidden sm:inline">Cart</span> {/* Hide text on small screens */}
                    {totalItems > 0 && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 px-2 py-0.5 text-xs">
                        {totalItems}
                    </Badge>
                    )}
                </Link>
            )}

           {/* Admin Panel Link - visible only to admin or superAdmin */}
           {hasAdminAccess && (
               <Link href="/admin" className="flex items-center gap-1 transition-colors p-2 rounded-md hover:bg-primary/80 hover:text-primary-foreground">
                  {/* Use different icon for superAdmin? */}
                  {isSuperAdmin ? <UserCog className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                  <span className="hidden sm:inline">Admin</span>
               </Link>
           )}

           {/* Vendor Panel Link (Example) - visible only to vendors */}
            {isVendor && (
                <Link href="/vendor" className="flex items-center gap-1 transition-colors p-2 rounded-md hover:bg-primary/80 hover:text-primary-foreground">
                    <Truck className="h-5 w-5" /> {/* Example icon */}
                    <span className="hidden sm:inline">Vendor</span>
                </Link>
            )}


          {/* Auth Buttons */}
          {loading ? (
             <div className="h-6 w-20 animate-pulse bg-primary/70 rounded-md"></div> // Skeleton loader
          ) : user ? (
             <div className="flex items-center gap-1 md:gap-2">
                 {/* Use the calculated displayName here */}
                <span className="text-sm hidden md:inline">Hi, {displayName}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:bg-primary/80 hover:text-primary-foreground p-2">
                     <LogOut className="h-5 w-5 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Logout</span>
                 </Button>
             </div>
          ) : (
            <div className="flex items-center gap-1 md:gap-2">
               <Link href="/login" passHref>
                  <Button variant="ghost" size="sm" className="hover:bg-primary/80 hover:text-primary-foreground p-2">
                     <LogIn className="h-5 w-5 mr-1 md:mr-2" />
                     <span className="hidden sm:inline">Login</span>
                  </Button>
               </Link>
                <Link href="/register" passHref>
                   <Button variant="ghost" size="sm" className="hover:bg-primary/80 hover:text-primary-foreground p-2">
                       <UserPlus className="h-5 w-5 mr-1 md:mr-2"/>
                      <span className="hidden sm:inline">Register</span>
                   </Button>
                 </Link>
             </div>
          )}
           {/* Add Theme Toggle */}
           <ThemeToggle />
        </nav>
      </div>
    </header>
  );
};

export default Header;

