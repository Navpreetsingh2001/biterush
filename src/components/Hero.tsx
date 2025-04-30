
"use client";

import type { FC } from 'react'; // Restore FC type annotation
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed } from "lucide-react";
import { gsap } from "gsap"; // Import GSAP
import Image from 'next/image'; // Import Next.js Image component
import { cn } from '@/lib/utils'; // Import cn utility

const Hero: FC = () => { // Add : FC type annotation back
  const fullText = "Welcome to Biterush"; // Updated text
  const [displayedText, setDisplayedText] = useState<string>("");
  const [index, setIndex] = useState<number>(0);

  // Refs for animation targets
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null); // Ref for the content wrapper
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Typing effect for the title
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (index < fullText.length) {
      // Typing effect
      timeoutId = setTimeout(() => {
        setDisplayedText((prev) => prev + fullText.charAt(index));
        setIndex((prev) => prev + 1);
      }, 100); // Adjust typing speed here (milliseconds)
    } else {
      // Pause after typing is complete before restarting
      timeoutId = setTimeout(() => {
        setDisplayedText(""); // Reset text
        setIndex(0); // Reset index to start loop
      }, 2000); // Pause duration (2 seconds)
    }

    // Cleanup function to clear the timeout if the component unmounts
    // or if the index changes before the timeout completes
    return () => clearTimeout(timeoutId);
  }, [index, fullText]);


  // GSAP animation effect
  useEffect(() => {
    // Ensure contentRef and other elements exist
    if (heroRef.current && contentRef.current && titleRef.current && descriptionRef.current && buttonRef.current) {
       // Ensure GSAP context for proper cleanup
       const ctx = gsap.context(() => {
            // Initial state (hidden) - target content elements
            gsap.set([titleRef.current, descriptionRef.current, buttonRef.current], { autoAlpha: 0, y: 20 });

            // Animation timeline
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.to(titleRef.current, { autoAlpha: 1, y: 0, duration: 0.8 }, "+=0.3") // Add slight delay after component mount
              .to(descriptionRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.5") // Overlap animation slightly
              .to(buttonRef.current, { autoAlpha: 1, y: 0, duration: 0.5 }, "-=0.4");

       }, heroRef); // Scope the context to the heroRef

       return () => ctx.revert(); // Cleanup GSAP animations on unmount
    }
  }, []); // Run animation once on mount

  const handleGetStartedClick = () => {
    // Check window existence for SSR safety
    if (typeof document !== 'undefined') {
        const blockSelection = document.getElementById('block-selection');
        if (blockSelection) {
          blockSelection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
  };


  return (
    <section
      ref={heroRef} // Add ref for GSAP context
      // Use relative positioning, keep padding, rounded corners, shadow
      className="relative w-full py-20 md:py-32 lg:py-40 xl:py-56 mb-8 rounded-lg shadow-md overflow-hidden bg-secondary" // Use a fallback bg
    >
        {/* Background Image */}
        <Image
            src="https://picsum.photos/seed/foodcourt-bg/1920/1080" // Background image URL
            alt="University Food Court Background"
            fill // Fill the container
            className="object-cover z-0" // Ensure image covers, place behind content
            quality={80} // Adjust quality for performance
            priority // Prioritize loading this image
        />
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/50 z-1"></div> {/* Semi-transparent black overlay */}

        {/* Content Container */}
        <div
            ref={contentRef}
            className="relative z-10 container px-4 md:px-6 text-center" // Center content, ensure it's above overlay
        >
            <div className="flex flex-col items-center justify-center space-y-4"> {/* Center content vertically and horizontally */}
                <div className="space-y-2">
                    {/* Display the dynamically changing text */}
                    <h1
                        ref={titleRef} // Add ref for animation
                        // Use light text color for contrast
                        className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary-foreground min-h-[72px] sm:min-h-[90px] xl:min-h-[120px] invisible" // Use primary-foreground, start invisible
                    >
                        {displayedText}
                        {/* Blinking cursor effect - show only while typing */}
                        {index < fullText.length && (
                            // Use light color for cursor
                            <span className="inline-block w-1 h-8 sm:h-12 xl:h-16 bg-primary-foreground animate-pulse ml-1"></span>
                        )}
                    </h1>
                    <p
                        ref={descriptionRef} // Add ref for animation
                        // Use lighter muted foreground color
                        className="max-w-[600px] text-primary-foreground/80 md:text-xl mx-auto invisible" // Lighter muted text, start invisible
                    >
                        Order your favorite meals from campus food courts easily and quickly. Skip the lines and enjoy delicious food delivered right where you are.
                    </p>
                </div>
                <div
                    ref={buttonRef} // Add ref for animation
                    className="flex flex-col gap-2 min-[400px]:flex-row justify-center invisible" // Center button(s), start invisible
                >
                    {/* Update button to scroll */}
                    {/* Consider a visually distinct button variant for dark backgrounds */}
                    <Button size="lg" onClick={handleGetStartedClick} variant="secondary">
                        Get Started
                    </Button>
                </div>
            </div>
        </div>
    </section>
  );
};

export default Hero;
