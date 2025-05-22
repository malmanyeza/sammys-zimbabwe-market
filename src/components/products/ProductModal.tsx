
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, X, Loader2 } from "lucide-react";
import { useCart } from '@/contexts/CartContext';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile {
  id: string;
  name: string;
  created_at: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string | number | null;
}

const ProductModal = ({ isOpen, onClose, productId }: ProductModalProps) => {
  const [product, setProduct] = useState<any>(null);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    console.log("Here is the productId":productId)
    const fetchProductDetails = async () => {
      if (!productId) return;
      
      setLoading(true);
      try {
        // Fetch product details - convert productId to string to handle both string and number types
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', String(productId))
          .single();
          
        if (productError) {
          console.error('Error fetching product:', productError);
          toast.error('Failed to load product details');
          return;
        }
        
        setProduct(productData);
        
        // Fetch seller info
        if (productData.seller_id) {
          const { data: sellerData, error: sellerError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', productData.seller_id)
            .single();
            
          if (!sellerError) {
            setSeller(sellerData);
          } else {
            console.error('Error fetching seller:', sellerError);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && productId) {
      fetchProductDetails();
    }
  }, [isOpen, productId]);

  const handleAddToCart = () => {
    if (product) {
      addItem({
        id: Number(product.id),
        name: product.name,
        price: product.price,
        image: product.image_url || '/placeholder.svg',
      });
      toast.success('Added to cart');
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !product ? (
          <div className="text-center p-8">
            <p className="text-lg font-medium">Product not found</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">{product.name}</DialogTitle>
              <button 
                onClick={onClose} 
                className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="aspect-square relative overflow-hidden rounded-md">
                <img
                  src={product.image_url || '/placeholder.svg'}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-xl">{product.name}</h3>
                  <p className="text-2xl font-bold text-primary mt-1">${product.price}</p>
                </div>
                
                <p className="text-muted-foreground">{product.description}</p>
                
                {product.stock > 0 ? (
                  <p className="text-sm text-green-600">In Stock ({product.stock} available)</p>
                ) : (
                  <p className="text-sm text-red-600">Out of Stock</p>
                )}
                
                <div className="flex gap-4 pt-4">
                  <Button 
                    className="flex-1" 
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button variant="outline">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                
                {seller && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold mb-2">Seller Information</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {seller.name ? seller.name[0].toUpperCase() : 'S'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{seller.name || "Zimbabwe Artisans Collective"}</p>
                        <p className="text-xs text-muted-foreground">
                          Member since {new Date(seller.created_at).getFullYear()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
