
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowLeft } from "lucide-react";
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface OrderData {
  orderId: string;
  date: string;
  items: Array<{
    id: number;
    name: string;
    price: number;
    image: string;
    quantity: number;
  }>;
  total: number;
  shippingDetails: {
    name: string;
    email: string;
    address: string;
    city: string;
    zipCode: string;
  };
  paymentMethod: string;
}

const OrderSuccess = () => {
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve order data from sessionStorage
    const storedOrderData = sessionStorage.getItem('orderData');
    
    if (storedOrderData) {
      setOrderData(JSON.parse(storedOrderData));
    } else {
      // If no order data is found, redirect to products page
      navigate('/products');
    }
  }, [navigate]);

  if (!orderData) {
    return null; // or a loading spinner
  }

  // Format the order date
  const formattedDate = new Date(orderData.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold">Order Successful!</h1>
          <p className="text-muted-foreground mt-2">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Order Number</h3>
                <p className="text-base font-semibold">{orderData.orderId}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
                <p className="text-base">{formattedDate}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Total Amount</h3>
                <p className="text-base font-semibold">${orderData.total.toFixed(2)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Payment Method</h3>
                <p className="text-base capitalize">{orderData.paymentMethod}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Order Details</h2>
            <div className="space-y-4">
              {orderData.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-16 h-16 rounded object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
            <div className="space-y-1">
              <p className="font-medium">{orderData.shippingDetails.name}</p>
              <p>{orderData.shippingDetails.address}</p>
              <p>{orderData.shippingDetails.city}, {orderData.shippingDetails.zipCode}</p>
              <p>{orderData.shippingDetails.email}</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link to="/">
            <Button className="w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="outline" className="w-full sm:w-auto">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderSuccess;
