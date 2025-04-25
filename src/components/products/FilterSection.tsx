
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FilterSection = () => {
  const categories = [
    'All Products',
    'Crafts',
    'Jewelry',
    'Clothing',
    'Art',
    'Home Decor'
  ];

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
                className="w-full justify-start hover:text-primary hover:bg-primary/5"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold text-lg mb-4">Price Range</h3>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start hover:text-primary hover:bg-primary/5"
            >
              Under $50
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:text-primary hover:bg-primary/5"
            >
              $50 - $100
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:text-primary hover:bg-primary/5"
            >
              $100 - $200
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:text-primary hover:bg-primary/5"
            >
              Over $200
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FilterSection;
