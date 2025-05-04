
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SearchBar from '@/components/products/SearchBar';
import FilterSection from '@/components/products/FilterSection';
import ProductCard from '@/components/home/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
}

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const productsPerPage = 9;

  // Fetch products and categories when component mounts
  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*');
        
        if (productsError) throw productsError;
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name');
        
        if (categoriesError) throw categoriesError;
        
        setProducts(productsData || []);
        setFilteredProducts(productsData || []);
        setCategories(categoriesData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndCategories();
  }, []);

  // Filter products whenever searchQuery or selectedCategory changes
  useEffect(() => {
    let results = products;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(product => 
        product.name.toLowerCase().includes(query) || 
        (product.description && product.description.toLowerCase().includes(query))
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'All Products') {
      const categoryObj = categories.find(cat => cat.name === selectedCategory);
      if (categoryObj) {
        results = results.filter(product => product.category_id === categoryObj.id);
      }
    }
    
    setFilteredProducts(results);
    setCurrentPage(1); // Reset pagination when filters change
  }, [searchQuery, selectedCategory, products, categories]);

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
              categories={['All Products', ...categories.map(cat => cat.name)]}
            />
          </div>

          <div className="flex-1">
            <SearchBar onSearch={handleSearch} initialQuery={searchQuery} />
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-[200px] w-full rounded-md" />
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-9 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="py-16 text-center">
                <h3 className="text-xl font-semibold mb-2">An error occurred</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
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
                      id={Number(product.id)}
                      image={product.image_url || "https://images.unsplash.com/photo-1619637236033-8a97c1ee0c88"}
                      name={product.name}
                      description={product.description || ""}
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
