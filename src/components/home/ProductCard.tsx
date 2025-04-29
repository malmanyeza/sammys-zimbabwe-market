
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  id: number;
  image: string;
  name: string;
  description: string;
  price: number;
}

const ProductCard = ({ id, image, name, description, price }: ProductCardProps) => {
  const { addItem } = useCart();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product details
    addItem({ id, name, price, image });
  };
  
  return (
    <Link to={`/products/${id}`}>
      <Card className="overflow-hidden h-full transition-all hover:shadow-lg">
        <div className="aspect-square relative overflow-hidden">
          <img
            src={image}
            alt={name}
            className="object-cover w-full h-full transition-transform hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-1 line-clamp-1">{name}</h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{description}</p>
          <div className="flex items-center justify-between">
            <p className="font-semibold text-primary">${price}</p>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleAddToCart}
              className="hover:bg-primary hover:text-white"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
