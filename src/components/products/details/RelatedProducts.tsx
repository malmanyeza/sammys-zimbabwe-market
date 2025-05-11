
import React, { useEffect, useState } from 'react';
import ProductCard from '@/components/home/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface RelatedProductsProps {
  currentProductId: string | number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
}

const RelatedProducts = ({ currentProductId }: RelatedProductsProps) => {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        // Fetch up to 4 other products
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .neq('id', currentProductId)
          .limit(4);
          
        if (error) {
          console.error('Error fetching related products:', error);
        } else {
          setRelatedProducts(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [currentProductId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
        <p className="text-muted-foreground">No related products found.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            image={product.image_url || '/placeholder.svg'}
            name={product.name}
            description={product.description || ''}
            price={product.price}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
