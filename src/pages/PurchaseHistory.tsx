
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PurchaseItem from '@/components/purchases/PurchaseItem';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  status: string;
  shipped_at: string | null;
  products: {
    id: string;
    name: string;
    image_url: string | null;
    seller_id: string;
  };
  orders: {
    created_at: string;
  };
}

const PurchaseHistory = () => {
  const { user } = useAuth();

  const { data: orderItems = [], isLoading } = useQuery({
    queryKey: ['userOrderItems', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          order_id,
          product_id,
          quantity,
          price,
          status,
          shipped_at,
          products (
            id,
            name,
            image_url,
            seller_id
          ),
          orders (
            created_at
          )
        `)
        .order('shipped_at', { ascending: false, nullsFirst: false });

      if (error) {
        console.error('Error fetching order items:', error);
        throw new Error('Failed to fetch purchase history');
      }

      return data as OrderItem[];
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Purchase History</h1>
          <p className="text-muted-foreground mt-2">
            View your orders and leave reviews for shipped items
          </p>
        </div>

        {orderItems.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-lg font-semibold mb-2">No purchases yet</p>
            <p className="text-muted-foreground">
              When you make your first purchase, it will appear here.
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {orderItems.map((item) => (
              <PurchaseItem key={item.id} orderItem={item} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PurchaseHistory;
