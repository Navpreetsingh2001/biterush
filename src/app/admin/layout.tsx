
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

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect non-admins or logged-out users away from admin pages
    if (!loading && !isAdmin) {
      console.warn("Access denied: User is not an admin or not logged in. Redirecting...");
      router.push('/'); // Redirect to homepage or login page
    }
  }, [user, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Verifying access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    // Show an access denied message briefly before redirect happens (or if redirect fails)
    return (
       <div className="flex flex-col justify-center items-center min-h-screen text-center p-4">
            <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
            <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-6">You do not have permission to access this page.</p>
            <Link href="/" passHref>
                <Button variant="outline">Go to Homepage</Button>
            </Link>
        </div>
    );
  }

  // If loading is complete and user is admin, render the children
  return <>{children}</>;
}
