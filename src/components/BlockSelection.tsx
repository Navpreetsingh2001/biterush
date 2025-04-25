"use client";

import { Button } from "@/components/ui/button";

interface BlockSelectionProps {
  onBlockSelect: (block: string) => void;
}

const BlockSelection: React.FC<BlockSelectionProps> = ({ onBlockSelect }) => {
  const blocks = ["Block A", "Block B", "Block C", "Block D"];

  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold mb-2">Select a Block</h2>
      <div className="flex flex-wrap gap-2">
        {blocks.map((block) => (
          <Button key={block} onClick={() => onBlockSelect(block)}>
            {block}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default BlockSelection;
