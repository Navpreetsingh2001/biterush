"use client";

import BlockSelection from '@/components/BlockSelection';
import FoodCourtList from '@/components/FoodCourtList';
import Hero from '@/components/Hero'; // Import the new Hero component
import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const foodCourtListRef = useRef<HTMLDivElement>(null); // Ref for the food court list section

  // Scroll to the food court list when a block is selected
  useEffect(() => {
    if (selectedBlock && foodCourtListRef.current) {
      foodCourtListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedBlock]); // Dependency array ensures this runs when selectedBlock changes

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
      {/* Wrap FoodCourtList in a div and attach the ref */}
      <div ref={foodCourtListRef}>
        {selectedBlock && (
          // FoodCourtList will now handle navigation internally
          <FoodCourtList block={selectedBlock} />
        )}
      </div>
      {/* Removed Menu component rendering from here */}
    </div>
  );
}
