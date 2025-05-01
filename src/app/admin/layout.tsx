
"use client";

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface AdminLayoutProps {
  children: ReactNode;
}

// This layout now specifically protects routes under /admin for the SUPER_ADMIN role.
// Regular 'admin' or 'vendor' roles might have different dashboards elsewhere.
export default function AdminLayout({ children }: AdminLayoutProps) {
  // Get isSuperAdmin flag specifically
  const { user, isSuperAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect non-superAdmins or logged-out users away from the main admin pages
    if (!loading && !isSuperAdmin) {
      console.warn("Access denied: User does not have Super Admin privileges. Redirecting...");
      // Redirect to homepage or a specific access denied page
      // Consider redirecting non-superadmin logged-in users (like vendors) to their own dashboard if they land here.
      router.push('/');
    }
  }, [user, isSuperAdmin, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Verifying Super Admin access...</p>
      </div>
    );
  }

  // If loading is done and user is not Super Admin
  if (!isSuperAdmin) {
    // Show an access denied message
    return (
       <div className="flex flex-col justify-center items-center min-h-screen text-center p-4">
            <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
            <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-6">You do not have permission to access the Super Admin dashboard.</p>
            <Link href="/" passHref>
                <Button variant="outline">Go to Homepage</Button>
            </Link>
        </div>
    );
  }

  // If loading is complete and user IS Super Admin, render the children
  return <>{children}</>;
}
