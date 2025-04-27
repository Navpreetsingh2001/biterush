"use client";

import { Button } from "@/components/ui/button";

interface BlockSelectionProps {
  onBlockSelect: (block: string) => void;
}

const BlockSelection: React.FC<BlockSelectionProps> = ({ onBlockSelect }) => {
  const blocks = ["Block A", "Block B", "Block C", "Block D"];

  return (
    <div className="mb-8 p-4 bg-card rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-center md:text-left">Select a Block</h2>
      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
        {blocks.map((block) => (
          <Button
            key={block}
            onClick={() => onBlockSelect(block)}
            variant="outline"
            size="lg"
            className="shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            {block}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default BlockSelection;