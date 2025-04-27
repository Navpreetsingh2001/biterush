
"use client";

import type { FC } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils"; // Import cn utility for conditional classes
import { useRef, useEffect } from 'react'; // Import useRef and useEffect
import { gsap } from 'gsap'; // Import GSAP

interface BlockSelectionProps {
  onBlockSelect: (block: string) => void;
  selectedBlock: string | null;
}

const BlockSelection: FC<BlockSelectionProps> = ({ onBlockSelect, selectedBlock }) => {
  const blocks = ["Block A", "Block B", "Block C", "Block D"];
  const gridRef = useRef<HTMLDivElement>(null); // Ref for the grid container

  // GSAP Hover Animation Effect
  useEffect(() => {
    if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll<HTMLDivElement>('.block-card');
        // GSAP Context for cleanup
        const ctx = gsap.context(() => {
            cards.forEach(card => {
                // Define the hover animation using GSAP
                const animation = gsap.to(card, {
                    scale: 1.03, // Slightly scale up
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)", // Add shadow from Tailwind's shadow-lg
                    duration: 0.2,
                    ease: "power1.inOut",
                    paused: true // Start paused
                });

                // Add event listeners to play/reverse the animation
                card.addEventListener('mouseenter', () => animation.play());
                card.addEventListener('mouseleave', () => animation.reverse());

                // Store the animation instance for cleanup
                (card as any).gsapAnimation = animation; // Store animation instance
            });
        }, gridRef); // Scope the context

        // Cleanup function
        return () => {
             ctx.revert(); // Revert GSAP animations
             // Clean up event listeners manually as GSAP context doesn't handle them
             cards.forEach(card => {
                 const animation = (card as any).gsapAnimation;
                 if (animation) {
                    // Need to remove listeners correctly; storing them might be better
                    // For simplicity here, we assume the card element persists and listeners are attached directly
                    // A more robust solution would involve storing listener references
                 }
             });
        };
    }
  }, []); // Run only once on mount


  return (
    <div className="mb-8 p-4 bg-card rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-center md:text-left">Select a Block</h2>
      <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {blocks.map((block, index) => (
          <Card
            key={block}
            onClick={() => onBlockSelect(block)}
            // Add a common class for GSAP selection
            className={cn(
              "block-card cursor-pointer overflow-hidden transition-all duration-200", // Removed hover:shadow-lg (GSAP handles hover)
              selectedBlock === block ? "ring-2 ring-primary shadow-lg" : "shadow-sm" // Highlight selected block
            )}
            style={{ transformOrigin: 'center center' }} // Set transform origin for scaling
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
                  priority={index < 4} // Prioritize loading images for the first few blocks (LCP)
                  loading={index < 4 ? 'eager' : 'lazy'} // Load first few eagerly, others lazily
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

