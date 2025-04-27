
"use client";

import type { FC } from 'react';
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed } from "lucide-react";
import { gsap } from "gsap"; // Import GSAP

const Hero: FC = () => {
  const fullText = "Welcome to Biterush"; // Updated text
  const [displayedText, setDisplayedText] = useState<string>("");
  const [index, setIndex] = useState<number>(0);

  // Refs for animation targets
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);


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
    if (heroRef.current && titleRef.current && descriptionRef.current && buttonRef.current && iconRef.current) {
       // Ensure GSAP context for proper cleanup
       const ctx = gsap.context(() => {
            // Initial state (hidden)
            gsap.set([titleRef.current, descriptionRef.current, buttonRef.current, iconRef.current], { autoAlpha: 0, y: 20 });

            // Animation timeline
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.to(titleRef.current, { autoAlpha: 1, y: 0, duration: 0.8 })
              .to(descriptionRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.5") // Overlap animation slightly
              .to(buttonRef.current, { autoAlpha: 1, y: 0, duration: 0.5 }, "-=0.4")
              .to(iconRef.current, { autoAlpha: 0.7, y: 0, duration: 0.8 }, "-=0.5"); // Animate icon

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
      className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 mb-8 rounded-lg shadow-md overflow-hidden" // Added overflow-hidden
    >
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
            <div className="space-y-2">
              {/* Display the dynamically changing text */}
              <h1
                ref={titleRef} // Add ref for animation
                className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary min-h-[72px] sm:min-h-[90px] xl:min-h-[120px] invisible" // Start invisible for GSAP
              >
                {displayedText}
                {/* Blinking cursor effect - show only while typing */}
                {index < fullText.length && (
                    <span className="inline-block w-1 h-8 sm:h-12 xl:h-16 bg-primary animate-pulse ml-1"></span>
                )}
              </h1>
              <p
                ref={descriptionRef} // Add ref for animation
                className="max-w-[600px] text-muted-foreground md:text-xl mx-auto lg:mx-0 invisible" // Start invisible for GSAP
              >
                Order your favorite meals from campus food courts easily and quickly. Skip the lines and enjoy delicious food delivered right where you are.
              </p>
            </div>
            <div
              ref={buttonRef} // Add ref for animation
              className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-start invisible" // Start invisible for GSAP
            >
              {/* Update button to scroll */}
               <Button size="lg" onClick={handleGetStartedClick}>
                 Get Started
               </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <UtensilsCrossed
              ref={iconRef} // Add ref for animation
              className="h-32 w-32 md:h-48 md:w-48 lg:h-64 lg:w-64 text-accent opacity-0 invisible" // Start invisible and opacity 0
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
