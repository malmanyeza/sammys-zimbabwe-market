
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroBanner = () => {
  return (
    <div className="relative bg-[url('/lovable-uploads/110b3326-af15-417c-923b-24fca309d626.png')] bg-cover bg-center h-[600px] mt-16">
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
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
