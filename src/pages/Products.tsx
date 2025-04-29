
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SearchBar from '@/components/products/SearchBar';
import FilterSection from '@/components/products/FilterSection';
import ProductCard from '@/components/home/ProductCard';
import { Button } from '@/components/ui/button';
import { products } from '@/data/products';

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const productsPerPage = 9;

  // Filter products whenever searchQuery or selectedCategory changes
  useEffect(() => {
    let results = products;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.description.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'All Products') {
      // This is a mock implementation. In a real app, products would have category field
      // For now, we'll just do some hard-coded filtering based on product names
      const categoryMap: { [key: string]: string[] } = {
        'Crafts': ['sculpture', 'basket', 'drum'],
        'Jewelry': ['necklace', 'beaded'],
        'Clothing': ['dress', 'print'],
        'Art': ['sculpture', 'wall art', 'tribal'],
        'Home Decor': ['basket', 'wall art']
      };
      
      const keywords = categoryMap[selectedCategory] || [];
      if (keywords.length) {
        results = results.filter(product => 
          keywords.some(keyword => 
            product.name.toLowerCase().includes(keyword.toLowerCase()) || 
            product.description.toLowerCase().includes(keyword.toLowerCase())
          )
        );
      }
    }
    
    setFilteredProducts(results);
    setCurrentPage(1); // Reset pagination when filters change
  }, [searchQuery, selectedCategory]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const loadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const displayedProducts = filteredProducts.slice(0, currentPage * productsPerPage);
  const hasMore = displayedProducts.length < filteredProducts.length;

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
            <FilterSection 
              selectedCategory={selectedCategory} 
              onCategoryChange={handleCategoryChange} 
            />
          </div>

          <div className="flex-1">
            <SearchBar onSearch={handleSearch} initialQuery={searchQuery} />
            
            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center">
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Products');
                }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {displayedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
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
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
