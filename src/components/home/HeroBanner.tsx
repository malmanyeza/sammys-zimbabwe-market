
import React from 'react';
import { Button } from "@/components/ui/button";

const HeroBanner = () => {
  return (
    <div className="relative bg-[url('https://images.unsplash.com/photo-1580748141549-71748dbe0bdc')] bg-cover bg-center h-[600px] mt-16">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Discover Authentic Zimbabwean Treasures
          </h1>
          <p className="text-lg text-white/90 mb-8">
            Explore our curated collection of traditional crafts, jewelry, and art pieces that tell stories of rich cultural heritage.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
            Explore Collection
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
