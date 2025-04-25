import BlockSelection from '@/components/BlockSelection';
import FoodCourtList from '@/components/FoodCourtList';
import Menu from '@/components/Menu';
import { useState } from 'react';

export default function Home() {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [selectedFoodCourt, setSelectedFoodCourt] = useState<string | null>(null);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Campus Grub</h1>
      <BlockSelection onBlockSelect={(block) => setSelectedBlock(block)} />
      {selectedBlock && (
        <FoodCourtList block={selectedBlock} onFoodCourtSelect={(foodCourt) => setSelectedFoodCourt(foodCourt)} />
      )}
      {selectedFoodCourt && (
        <Menu foodCourt={selectedFoodCourt} />
      )}
    </div>
  );
}
