
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroBanner = () => {
  return (
    <div className="relative bg-[url('/lovable-uploads/28a8ed11-c3c8-46f1-921b-f5d1922af8f6.png')] bg-cover bg-center h-[600px] mt-16">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Discover Authentic Zimbabwean Treasures
          </h1>
          <p className="text-lg text-white/90 mb-8">
            Explore our curated collection of traditional crafts, jewelry, and art pieces that tell stories of rich cultural heritage.
          </p>
          <Link to="/products">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
              Explore Collection
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
