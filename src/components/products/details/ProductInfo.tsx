
import React from 'react';
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useCart } from '@/contexts/CartContext';

interface ProductInfoProps {
  product: {
    id: string | number; // Updated to accept both string and number
    name: string;
    description: string;
    price: number;
    image: string;
    category?: string; // Added as optional
    stock?: number; // Added as optional
    sellerId?: string; // Added as optional
  };
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
        <div className="flex items-center gap-2 text-primary mb-4">
          <div className="flex items-center">
            <Star className="h-5 w-5 fill-primary" />
            <Star className="h-5 w-5 fill-primary" />
            <Star className="h-5 w-5 fill-primary" />
            <Star className="h-5 w-5 fill-primary" />
            <Star className="h-5 w-5 fill-primary/30" />
          </div>
          <span className="text-sm text-muted-foreground">(24 reviews)</span>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-2xl font-bold text-primary">${product.price}</p>
        <p className="text-muted-foreground">{product.description}</p>
        <div className="pt-6 space-y-4">
          <p className="text-foreground">
            This authentic piece represents the rich cultural heritage of Zimbabwe, handcrafted by skilled artisans using traditional techniques passed down through generations.
          </p>
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <Button size="lg" className="flex-1" onClick={handleAddToCart}>
          <ShoppingCart className="mr-2" />
          Add to Cart
        </Button>
        <Button size="lg" variant="outline">
          <Heart className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ProductInfo;
