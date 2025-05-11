
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductGallery from '@/components/products/details/ProductGallery';
import ProductInfo from '@/components/products/details/ProductInfo';
import ProductReviews from '@/components/products/details/ProductReviews';
import SellerInfo from '@/components/products/details/SellerInfo';
import RelatedProducts from '@/components/products/details/RelatedProducts';
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  seller_id: string;
  category_id: string;
}

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error('Error fetching product:', error);
        throw new Error('Product not found');
      }
      
      return data as Product;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button 
            onClick={() => navigate('/products')}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
          >
            Back to Products
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Transform the data to match the expected format for the components
  const adaptedProduct = {
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: product.price,
    image: product.image_url || '/placeholder.svg',
    category: product.category_id,
    stock: product.stock,
    sellerId: product.seller_id
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <ProductGallery images={[adaptedProduct.image]} />
          <ProductInfo product={adaptedProduct} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <ProductReviews />
          </div>
          <div>
            <SellerInfo sellerId={product.seller_id} />
          </div>
        </div>

        <RelatedProducts currentProductId={product.id} />
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetails;
