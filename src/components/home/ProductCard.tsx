
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from '@/contexts/CartContext';
import ProductModal from '@/components/products/ProductModal';

interface ProductCardProps {
  id: string;
  image: string;
  name: string;
  description: string;
  price: number;
}

const ProductCard = ({ id, image, name, description, price }: ProductCardProps) => {
  const { addItem } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({ id, name, price, image });
    
    // Show visual feedback
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };
  
  return (
    <>
      <Card 
        className="overflow-hidden h-full transition-all hover:shadow-lg cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
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
              className={`transition-all duration-300 ${
                isAdded 
                  ? "bg-green-500 text-white hover:bg-green-600" 
                  : "hover:bg-primary hover:text-white"
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Add
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productId={id}
      />
    </>
  );
};

export default ProductCard;
