
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CreditCard, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Form validation schema
const formSchema = z.object({
  paymentMethod: z.enum(['card', 'paypal']),
  cardNumber: z.string().optional().refine(
    (val) => !val || /^\d{16}$/.test(val), 
    { message: "Card number must be 16 digits" }
  ),
  expiryDate: z.string().optional().refine(
    (val) => !val || /^\d{2}\/\d{2}$/.test(val), 
    { message: "Expiry date must be in MM/YY format" }
  ),
  cvv: z.string().optional().refine(
    (val) => !val || /^\d{3}$/.test(val), 
    { message: "CVV must be 3 digits" }
  ),
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  address: z.string().min(5, { message: "Address is required" }),
  city: z.string().min(2, { message: "City is required" }),
  zipCode: z.string().min(5, { message: "Zip code is required" }),
  staffAssistance: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof formSchema>;

const Checkout = () => {
  const { items, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const tax = getCartTotal() * 0.15; // 15% tax rate
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Initialize form with validation
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentMethod: "card",
      firstName: "",
      lastName: "",
      email: user?.email || "",
      address: "",
      city: "",
      zipCode: "",
      staffAssistance: "",
    },
  });
  
  // Watch the selected payment method to conditionally render fields
  const paymentMethod = form.watch("paymentMethod");

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to complete your purchase",
        variant: "destructive"
      });
      navigate('/signin');
      return;
    }
    
    if (items.length === 0) {
      toast({
        title: "No items in cart",
        description: "Your cart is empty",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // 1. Create shipping address
      const { data: shippingAddress, error: shippingError } = await supabase
        .from('shipping_addresses')
        .insert({
          user_id: user.id,
          name: `${data.firstName} ${data.lastName}`,
          address_line1: data.address,
          city: data.city,
          state: "Not Specified", // Using fixed value as we don't collect state
          postal_code: data.zipCode,
          country: "Zimbabwe", // Default country
        })
        .select()
        .single();
        
      if (shippingError) {
        throw new Error("Failed to create shipping address");
      }
      
      // 2. Create order
      const totalAmount = getCartTotal() + tax;
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: totalAmount,
          status: 'pending',
          shipping_address_id: shippingAddress.id
        })
        .select()
        .single();
        
      if (orderError) {
        throw new Error("Failed to create order");
      }
      
      // 3. Create order items - Converting product_id from number to string
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id, // Convert to string to match expected type
        quantity: item.quantity,
        price: item.price
      }));

      console.log("Here are the ordered Items",orderItems)
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
        
      if (itemsError) {
        throw new Error("Failed to create order items");
      }
      
      // Store order data in session storage for the success page
      const orderData = {
        orderId: order.id,
        items,
        total: totalAmount,
        date: new Date().toISOString(),
        shippingDetails: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          address: data.address,
          city: data.city,
          zipCode: data.zipCode,
        },
        paymentMethod: data.paymentMethod
      };
      
      sessionStorage.setItem('orderData', JSON.stringify(orderData));
      
      // Clear the cart
      clearCart();
      
      // Navigate to success page
      navigate('/order-success');
      
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout failed",
        description: error instanceof Error ? error.message : "Something went wrong during checkout",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Redirect to products if cart is empty
  React.useEffect(() => {
    if (items.length === 0) {
      navigate('/products');
    }
  }, [items, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>
                      Choose your preferred payment method
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-3"
                            >
                              <div className="flex items-center space-x-2 rounded-md border p-4">
                                <RadioGroupItem value="card" id="card" />
                                <Label htmlFor="card" className="flex items-center gap-2">
                                  <CreditCard className="h-5 w-5" />
                                  Credit / Debit Card
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2 rounded-md border p-4">
                                <RadioGroupItem value="paypal" id="paypal" />
                                <Label htmlFor="paypal">PayPal</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {paymentMethod === "card" && (
                      <div className="mt-6 space-y-4">
                        <FormField
                          control={form.control}
                          name="cardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Card Number</FormLabel>
                              <FormControl>
                                <Input placeholder="1234 5678 9012 3456" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="expiryDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expiry Date</FormLabel>
                                <FormControl>
                                  <Input placeholder="MM/YY" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="cvv"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CVV</FormLabel>
                                <FormControl>
                                  <Input placeholder="123" type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Billing Information</CardTitle>
                    <CardDescription>
                      Enter your billing details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john.doe@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="New York" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zip Code</FormLabel>
                            <FormControl>
                              <Input placeholder="10001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Staff Assistance</CardTitle>
                    <CardDescription>
                      Select a staff member to assist with your order (optional)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="staffAssistance"
                      render={({ field }) => (
                        <FormItem>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a staff member" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="john">John (Sales)</SelectItem>
                              <SelectItem value="sarah">Sarah (Customer Support)</SelectItem>
                              <SelectItem value="mike">Mike (Technical Expert)</SelectItem>
                              <SelectItem value="lisa">Lisa (Account Manager)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="ml-auto" 
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Place Order'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </Form>
          </div>
          
          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                
                <div className="border-t pt-4 mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (15%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${(getCartTotal() + tax).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
