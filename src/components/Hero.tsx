"use client";

import { Button } from "@/components/ui/button";
import { UtensilsCrossed } from "lucide-react";

const Hero = () => {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 mb-8 rounded-lg shadow-md">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                Welcome to Campus Grub
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto lg:mx-0">
                Order your favorite meals from campus food courts easily and quickly. Skip the lines and enjoy delicious food delivered right where you are.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-start">
              <Button size="lg">
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