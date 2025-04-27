"use client";

import BlockSelection from '@/components/BlockSelection';
import FoodCourtList from '@/components/FoodCourtList';
import Menu from '@/components/Menu';
import Hero from '@/components/Hero'; // Import the new Hero component
import { useState } from 'react';

export default function Home() {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [selectedFoodCourt, setSelectedFoodCourt] = useState<string | null>(null);

  return (
    <div className="container mx-auto p-4">
      <Hero /> {/* Add the Hero section here */}
      <h1 className="text-3xl font-bold mb-6 text-center md:text-left text-primary">Order Food on Campus</h1>
      <BlockSelection
        selectedBlock={selectedBlock} // Pass selected block state
        onBlockSelect={(block) => {
          setSelectedBlock(block);
          setSelectedFoodCourt(null); // Reset food court when block changes
        }}
      />
      {selectedBlock && (
        <FoodCourtList block={selectedBlock} onFoodCourtSelect={(foodCourt) => setSelectedFoodCourt(foodCourt)} />
      )}
      {selectedFoodCourt && (
        <Menu foodCourt={selectedFoodCourt} />
      )}
    </div>
  );
}
