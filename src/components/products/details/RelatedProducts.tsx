
import React from 'react';
import ProductCard from '@/components/home/ProductCard';
import { products } from '@/data/products';

interface RelatedProductsProps {
  currentProductId: number;
}

const RelatedProducts = ({ currentProductId }: RelatedProductsProps) => {
  const relatedProducts = products
    .filter(product => product.id !== currentProductId)
    .slice(0, 4);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            image={product.image}
            name={product.name}
            description={product.description}
            price={product.price}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
