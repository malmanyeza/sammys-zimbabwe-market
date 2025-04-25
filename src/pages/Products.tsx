
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SearchBar from '@/components/products/SearchBar';
import FilterSection from '@/components/products/FilterSection';
import ProductCard from '@/components/home/ProductCard';
import { Button } from '@/components/ui/button';
import { products } from '@/data/products';

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const loadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const displayedProducts = products.slice(0, currentPage * productsPerPage);
  const hasMore = displayedProducts.length < products.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Discover Traditional Treasures
          </h1>
          <p className="text-gray-600">
            Explore our collection of authentic Zimbabwean crafts and artworks
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-64 shrink-0">
            <FilterSection />
          </div>

          <div className="flex-1">
            <SearchBar onSearch={handleSearch} />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  image={product.image}
                  name={product.name}
                  description={product.description}
                  price={product.price}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-12 text-center">
                <Button
                  onClick={loadMore}
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                >
                  Load More Products
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
