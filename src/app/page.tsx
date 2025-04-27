"use client";

import BlockSelection from '@/components/BlockSelection';
import FoodCourtList from '@/components/FoodCourtList';
import Hero from '@/components/Hero'; // Import the new Hero component
import { useState } from 'react';

export default function Home() {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  // Removed selectedFoodCourt state as menu opens on a new page

  return (
    <div className="container mx-auto p-4">
      <Hero /> {/* Add the Hero section here */}
      <h1 className="text-3xl font-bold mb-6 text-center md:text-left text-primary">Order Food on Campus</h1>
      <BlockSelection
        selectedBlock={selectedBlock} // Pass selected block state
        onBlockSelect={(block) => {
          setSelectedBlock(block);
          // No need to reset food court state here anymore
        }}
      />
      {selectedBlock && (
        // FoodCourtList will now handle navigation internally
        <FoodCourtList block={selectedBlock} />
      )}
      {/* Removed Menu component rendering from here */}
    </div>
  );
}
