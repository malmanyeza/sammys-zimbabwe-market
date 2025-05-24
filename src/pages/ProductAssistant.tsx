
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductChatbot from '@/components/chatbot/ProductChatbot';

const ProductAssistant = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Product Search Assistant
          </h1>
          <p className="text-gray-600">
            Tell me what you're looking for and I'll help you find the perfect products from our collection
          </p>
        </div>

        <ProductChatbot />
      </main>

      <Footer />
    </div>
  );
};

export default ProductAssistant;
