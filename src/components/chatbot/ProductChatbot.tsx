
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Bot, User, Loader2, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  products?: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
  }>;
  timestamp: Date;
}

const ProductChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm here to help you find the perfect products at Sammy's Market. Describe what you're looking for and I'll search our inventory for you!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = (product: any) => {
    addItem({ 
      id: product.id, 
      name: product.name, 
      price: product.price, 
      image: product.image_url || "https://images.unsplash.com/photo-1619637236033-8a97c1ee0c88" 
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('product-search-ai', {
        body: { query: inputValue }
      });

      if (error) {
        throw error;
      }

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.explanation || 'Here are the products I found for you:',
        products: data.products || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error calling chatbot:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Sorry, I encountered an error while searching for products. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Product Search Assistant
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                <div
                  className={`p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                
                {/* Display products in compact grid */}
                {message.products && message.products.length > 0 && (
                  <div className="mt-3 grid gap-3 grid-cols-1 sm:grid-cols-2">
                    {message.products.map((product) => (
                      <div key={product.id} className="border rounded-lg p-3 bg-white">
                        <div className="flex gap-3">
                          <img
                            src={product.image_url || "https://images.unsplash.com/photo-1619637236033-8a97c1ee0c88"}
                            alt={product.name}
                            className="w-16 h-16 rounded object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-1">{product.name}</h4>
                            <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                              {product.description || "No description available"}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="font-semibold text-primary text-sm">
                                ${product.price}
                              </span>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleAddToCart(product)}
                                className="h-7 px-2 text-xs hover:bg-primary hover:text-white"
                              >
                                <ShoppingCart className="h-3 w-3 mr-1" />
                                Add
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {message.products && message.products.length === 0 && message.type === 'bot' && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    No products found matching your request. Try describing what you're looking for differently.
                  </div>
                )}
              </div>
              
              {message.type === 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Searching for products...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Input area */}
        <div className="flex gap-2 pt-4 border-t">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe what product you're looking for..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductChatbot;
