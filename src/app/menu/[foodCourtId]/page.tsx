"use client";

import Menu from '@/components/Menu';
import { useParams } from 'next/navigation'; // Hook to get route parameters
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MenuPage() {
  const params = useParams(); // Get the dynamic route parameters
  const foodCourtId = params.foodCourtId as string; // Extract foodCourtId

  return (
    <div className="container mx-auto p-4">
      <Link href="/" passHref>
         <Button variant="outline" className="mb-4">
           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blocks
         </Button>
      </Link>
      {/* Render the Menu component, passing the foodCourtId */}
      {foodCourtId ? (
          <Menu foodCourtId={foodCourtId} />
      ) : (
          <p className="text-center text-destructive">Error: Food court ID not found.</p>
      )}
    </div>
  );
}
