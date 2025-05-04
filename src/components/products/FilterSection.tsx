
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterSectionProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories?: string[];
}

const FilterSection = ({ 
  selectedCategory, 
  onCategoryChange, 
  categories = ['All Products', 'Crafts', 'Jewelry', 'Clothing', 'Art', 'Home Decor'] 
}: FilterSectionProps) => {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-4">Categories</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  selectedCategory === category 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "hover:text-primary hover:bg-primary/5"
                )}
                onClick={() => onCategoryChange(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold text-lg mb-4">Price Range</h3>
          <div className="space-y-2">
            {['Under $50', '$50 - $100', '$100 - $200', 'Over $200'].map((priceRange) => (
              <Button
                key={priceRange}
                variant="ghost"
                className="w-full justify-start hover:text-primary hover:bg-primary/5"
              >
                {priceRange}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FilterSection;
