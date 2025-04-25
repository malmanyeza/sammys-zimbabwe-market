
import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductGallery from '@/components/products/details/ProductGallery';
import ProductInfo from '@/components/products/details/ProductInfo';
import ProductReviews from '@/components/products/details/ProductReviews';
import SellerInfo from '@/components/products/details/SellerInfo';
import RelatedProducts from '@/components/products/details/RelatedProducts';
import { products } from '@/data/products';

const ProductDetails = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === Number(id));

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <ProductGallery images={[product.image]} />
          <ProductInfo product={product} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <ProductReviews />
          </div>
          <div>
            <SellerInfo />
          </div>
        </div>

        <RelatedProducts currentProductId={product.id} />
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetails;
