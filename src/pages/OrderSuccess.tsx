
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Package } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const OrderSuccess = () => {
  const location = useLocation();
  const orderId = location.state?.orderId || 'ORD-' + Math.random().toString(36).substr(2, 9);
  const orderItems = location.state?.items || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-24">
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Thank You for Your Order!</h1>
            <p className="text-muted-foreground">Your order has been received and is being processed.</p>
            
            <div className="my-6">
              <p className="text-sm text-muted-foreground mb-2">Order ID</p>
              <p className="text-lg font-semibold">{orderId}</p>
            </div>

            {orderItems.length > 0 && (
              <div className="w-full border rounded-lg p-4 mb-6">
                <h2 className="font-semibold mb-4">Order Summary</h2>
                {orderItems.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm py-2">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link to="/">
                <Button variant="default" className="w-full sm:w-auto">
                  Return to Home
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="outline" className="w-full sm:w-auto">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default OrderSuccess;
