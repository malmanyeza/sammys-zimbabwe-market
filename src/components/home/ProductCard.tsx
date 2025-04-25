import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { Link } from 'react-router-dom';

interface ProductCardProps {
  id?: number;
  image: string;
  name: string;
  description: string;
  price: number;
}

const ProductCard = ({ id = 1, image, name, description, price }: ProductCardProps) => {
  return (
    <Card className="overflow-hidden group">
      <Link to={`/products/${id}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={image}
            alt={name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
          >
            <Heart className="h-5 w-5 text-primary" />
          </Button>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1">{name}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">${price}</span>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Add to Cart
            </Button>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default ProductCard;
