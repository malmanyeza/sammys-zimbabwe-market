
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, DollarSign, ShoppingBag } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Product schema for form validation
const productSchema = z.object({
  name: z.string().min(3, { message: "Product name must be at least 3 characters" }),
  price: z.coerce.number().positive({ message: "Price must be positive" }),
  stock: z.coerce.number().int().positive({ message: "Stock must be a positive integer" }),
  image: z.string().url({ message: "Please enter a valid image URL" }).optional().or(z.literal(''))
});

type ProductFormValues = z.infer<typeof productSchema>;

const SellerDashboard = () => {
  const { user } = useAuth();
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  
  // Mock seller data
  const [mockProducts, setMockProducts] = useState([
    { id: 1, name: "Organic Avocado", price: 4.99, stock: 78, sales: 24 },
    { id: 2, name: "Fresh Strawberries", price: 3.49, stock: 45, sales: 36 },
    { id: 3, name: "Free-Range Eggs", price: 5.99, stock: 120, sales: 18 },
  ]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: 0,
      stock: 0,
      image: ''
    }
  });

  const handleAddProduct = (data: ProductFormValues) => {
    const newProduct = {
      id: mockProducts.length + 1,
      name: data.name,
      price: data.price,
      stock: data.stock,
      sales: 0,
      image: data.image || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9'
    };
    
    setMockProducts([...mockProducts, newProduct]);
    setIsAddProductOpen(false);
    form.reset();
    
    // Fix: Use the correct toast function syntax
    toast(`${data.name} has been added to your products.`, {
      description: "Your product was successfully added to inventory."
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Seller Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name}
            </p>
          </div>
          <Button className="mt-4 md:mt-0" onClick={() => setIsAddProductOpen(true)}>
            <Package className="mr-2 h-4 w-4" />
            Add New Product
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-bold">$1,245.89</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-xs text-green-600 mt-2">+12% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{mockProducts.length}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Package className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{mockProducts.length} active products</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Orders</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-xs text-green-600 mt-2">+25% from last month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products">
          <TabsList className="mb-4">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Your Products</CardTitle>
                <CardDescription>Manage your product inventory and listings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 bg-muted p-4 font-medium">
                    <div>Product</div>
                    <div>Price</div>
                    <div>Stock</div>
                    <div>Sales</div>
                    <div>Actions</div>
                  </div>
                  {mockProducts.map((product) => (
                    <div key={product.id} className="grid grid-cols-5 p-4 border-t items-center">
                      <div>{product.name}</div>
                      <div>${product.price.toFixed(2)}</div>
                      <div>{product.stock} units</div>
                      <div>{product.sales} units</div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Load More</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Manage customer orders and fulfillment</CardDescription>
              </CardHeader>
              <CardContent>
                <p>No recent orders available.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Sales Analytics</CardTitle>
                <CardDescription>View insights about your store performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border rounded-md">
                  <p className="text-muted-foreground">Analytics data will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
      
      {/* Add Product Dialog */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Add product details to create a new listing in your inventory.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddProduct)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        placeholder="0.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        placeholder="0"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/image.jpg" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddProductOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Product</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerDashboard;
