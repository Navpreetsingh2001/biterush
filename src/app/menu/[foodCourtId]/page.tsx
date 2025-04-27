
"use client";

import type { FC } from 'react';
import Menu from '@/components/Menu';
import { useParams } from 'next/navigation'; // Hook to get route parameters
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const MenuPage: FC = () => {
  const params = useParams(); // Get the dynamic route parameters
  const foodCourtId = params.foodCourtId as string; // Extract foodCourtId

  return (
    <> {/* Use Fragment instead of div */}
      {/* Update href to scroll to the block selection section */}
      <Link href="/#block-selection" passHref>
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
    </>
  );
}

export default MenuPage;
