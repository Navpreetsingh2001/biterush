"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed } from "lucide-react";

const Hero = () => {
  const fullText = "Welcome to Campus Grub";
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < fullText.length) {
      const timeoutId = setTimeout(() => {
        setDisplayedText((prev) => prev + fullText.charAt(index));
        setIndex((prev) => prev + 1);
      }, 100); // Adjust typing speed here (milliseconds)

      // Cleanup function to clear the timeout if the component unmounts
      // or if the index changes before the timeout completes
      return () => clearTimeout(timeoutId);
    }
  }, [index, fullText]); // Depend on index and fullText

  const handleGetStartedClick = () => {
    const blockSelection = document.getElementById('block-selection');
    if (blockSelection) {
      blockSelection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };


  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 mb-8 rounded-lg shadow-md">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
            <div className="space-y-2">
              {/* Display the dynamically changing text */}
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary min-h-[72px] sm:min-h-[90px] xl:min-h-[120px]"> {/* Added min-height to prevent layout shift */}
                {displayedText}
                {/* Blinking cursor effect */}
                <span className="inline-block w-1 h-8 sm:h-12 xl:h-16 bg-primary animate-pulse ml-1"></span>
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto lg:mx-0">
                Order your favorite meals from campus food courts easily and quickly. Skip the lines and enjoy delicious food delivered right where you are.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-start">
              {/* Update button to scroll */}
               <Button size="lg" onClick={handleGetStartedClick}>
                 Get Started
               </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <UtensilsCrossed className="h-32 w-32 md:h-48 md:w-48 lg:h-64 lg:w-64 text-accent opacity-70" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
