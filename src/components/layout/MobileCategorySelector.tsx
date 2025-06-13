
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Grid3X3, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface MobileCategorySelectorProps {
  trigger?: React.ReactNode;
}

const MobileCategorySelector = ({ trigger }: MobileCategorySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        throw new Error('Failed to fetch categories');
      }
      
      return data as Category[];
    },
  });

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/products?category=${categoryId}`);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Categories
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Browse Categories</DialogTitle>
          <DialogDescription>
            Choose a category to explore products
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            categories.map((category) => (
              <Button
                key={category.id}
                variant="ghost"
                className="w-full justify-start text-left h-auto p-4"
                onClick={() => handleCategoryClick(category.id)}
              >
                <div>
                  <p className="font-medium">{category.name}</p>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  )}
                </div>
              </Button>
            ))
          )}
        </div>
        
        {categories.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No categories available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MobileCategorySelector;
