
"use client";

import Image from 'next/image';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils"; // Import cn utility for conditional classes

interface BlockSelectionProps {
  onBlockSelect: (block: string) => void;
  selectedBlock: string | null; // Receive selectedBlock to apply styling
}

const BlockSelection: React.FC<BlockSelectionProps> = ({ onBlockSelect, selectedBlock }) => {
  const blocks = ["Block A", "Block B", "Block C", "Block D"];

  return (
    <div className="mb-8 p-4 bg-card rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-center md:text-left">Select a Block</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {blocks.map((block, index) => (
          <Card
            key={block}
            onClick={() => onBlockSelect(block)}
            className={cn(
              "cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg",
              selectedBlock === block ? "ring-2 ring-primary shadow-lg" : "shadow-sm" // Highlight selected block
            )}
          >
            <CardContent className="p-0">
              <div className="aspect-square relative w-full">
                <Image
                  // Use different placeholder images for each block
                  src={`https://picsum.photos/seed/${index + 10}/300/300`}
                  alt={`Image representing ${block}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw" // Responsive image sizes
                  className="object-cover"
                  priority={index < 4} // Prioritize loading images for the first few blocks
                />
              </div>
            </CardContent>
            <CardFooter className="p-3 bg-muted/50 justify-center">
              <p className="font-medium text-center text-sm text-foreground">{block}</p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BlockSelection;
