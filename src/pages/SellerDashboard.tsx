import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, DollarSign, ShoppingBag, Upload, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import OrdersList from '@/components/seller/OrdersList';

// Type for a product
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url?: string;
  category_id?: string;
}

// Type for a category
interface Category {
  id: string;
  name: string;
  description?: string;
}

// Type for order item
interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
}

// Product schema for form validation
const productSchema = z.object({
  name: z.string().min(3, { message: "Product name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  price: z.coerce.number().positive({ message: "Price must be positive" }),
  stock: z.coerce.number().int().positive({ message: "Stock must be a positive integer" }),
  category_id: z.string().uuid({ message: "Please select a category" }),
  image: z.instanceof(File, { message: "Please upload an image file" }).optional()
    .or(z.literal(''))
    .refine((file) => {
      if (!file) return true; // Optional field
      return file instanceof File && 
        ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
    }, "Please upload a valid image file (JPEG, PNG, GIF, WEBP)")
});

type ProductFormValues = z.infer<typeof productSchema>;

const SellerDashboard = () => {
  const { user } = useAuth();
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Fetch products from Supabase
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id);
      
      if (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to fetch products');
        return [];
      }
      
      return data as Product[];
    },
    enabled: !!user?.id,
  });

  // Fetch order items to calculate actual sales
  const { data: orderItems = [] } = useQuery({
    queryKey: ['orderItems', products],
    queryFn: async () => {
      if (!products || products.length === 0) return [];
      
      const productIds = products.map(product => product.id);
      
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .in('product_id', productIds);
      
      if (error) {
        console.error('Error fetching order items:', error);
        return [];
      }
      
      return data as OrderItem[];
    },
    enabled: products.length > 0,
  });

  // New query to fetch order data including shipping details
  const { data: sellerOrders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['sellerOrders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // First get product IDs for this seller
      const { data: sellerProducts, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('seller_id', user.id);
      
      if (productsError || !sellerProducts.length) {
        console.error('Error fetching seller products:', productsError);
        return [];
      }
      
      const productIds = sellerProducts.map(product => product.id);
      
      // Get order items for these products
      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select(`
          id,
          order_id,
          product_id,
          quantity,
          price,
          products:product_id (name, image_url)
        `)
        .in('product_id', productIds);
      
      if (orderItemsError) {
        console.error('Error fetching order items:', orderItemsError);
        return [];
      }
      
      if (!orderItems.length) return [];
      
      // Get unique order IDs
      const orderIds = [...new Set(orderItems.map(item => item.order_id))];
      
      // Fetch orders with user details
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          total,
          user_id,
          shipping_address:shipping_addresses!orders_shipping_address_id_fkey (
            id,
            name,
            address_line1,
            city,
            state,
            postal_code,
            country
          )
        `)
        .in('id', orderIds);
      
      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        return [];
      }
      
      // Format orders with their items
      return orders.map(order => ({
        id: order.id,
        created_at: order.created_at,
        status: order.status,
        total: order.total,
        buyer_name: order.shipping_address?.name || 'Customer',
        buyer_address: order.shipping_address?.address_line1 || 'Address not provided',
        buyer_city: order.shipping_address?.city || 'City not provided',
        buyer_state: order.shipping_address?.state || 'State not provided',
        buyer_zip: order.shipping_address?.postal_code || 'Zip not provided',
        buyer_country: order.shipping_address?.country || 'Country not provided',
        order_items: orderItems
          .filter(item => item.order_id === order.id)
          .map(item => ({
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            product_name: item.products?.name || 'Unknown Product',
            product_image: item.products?.image_url || null
          }))
      }));
    },
    enabled: !!user?.id && products.length > 0,
  });

  // Fetch categories from Supabase
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      
      if (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to fetch categories');
        return [];
      }
      
      return data as Category[];
    },
  });

  // Calculate actual sales based on order items
  const totalSales = orderItems.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  const totalProducts = products.length;
  
  // Calculate total sales and order counts
  const totalOrders = sellerOrders.length;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category_id: '',
      image: undefined
    }
  });

  const editForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category_id: '',
      image: undefined
    }
  });

  // Reset forms when dialogs close
  useEffect(() => {
    if (!isAddProductOpen) {
      form.reset();
      setImagePreview(null);
    }
  }, [isAddProductOpen, form]);

  useEffect(() => {
    if (!isEditProductOpen) {
      editForm.reset();
      setImagePreview(null);
      setSelectedProduct(null);
    }
  }, [isEditProductOpen, editForm]);

  // Prefill edit form when a product is selected
  useEffect(() => {
    if (selectedProduct && isEditProductOpen) {
      editForm.reset({
        name: selectedProduct.name,
        description: selectedProduct.description || '',
        price: selectedProduct.price,
        stock: selectedProduct.stock,
        category_id: selectedProduct.category_id || '',
      });
      
      if (selectedProduct.image_url) {
        setImagePreview(selectedProduct.image_url);
      }
    }
  }, [selectedProduct, isEditProductOpen, editForm]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, formType: 'add' | 'edit') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (formType === 'add') {
      form.setValue("image", file);
    } else {
      editForm.setValue("image", file);
    }
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Add product mutation
  const addProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      if (!user) throw new Error('You must be logged in to add a product');
      
      // Upload image if provided
      let imageUrl = null;
      if (data.image instanceof File) {
        const fileName = `${user.id}/${Date.now()}-${data.image.name}`;
        
        // Create path for the file
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product_images')
          .upload(fileName, data.image);
          
        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          throw new Error('Failed to upload image');
        }
        
        // Get the public URL of the uploaded image
        const { data: urlData } = supabase.storage.from('product_images').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
      
      // Insert product into database
      const { data: product, error } = await supabase
        .from('products')
        .insert([{
          name: data.name,
          description: data.description,
          price: data.price,
          stock: data.stock,
          category_id: data.category_id,
          seller_id: user.id,
          image_url: imageUrl
        }])
        .select()
        .single();
        
      if (error) {
        console.error('Error adding product:', error);
        throw new Error('Failed to add product');
      }
      
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsAddProductOpen(false);
      form.reset();
      setImagePreview(null);
      
      toast.success('Product added successfully', {
        description: "Your product has been added to your inventory."
      });
    },
    onError: (error) => {
      toast.error('Failed to add product', {
        description: error.message
      });
    }
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues & { id: string }) => {
      if (!user) throw new Error('You must be logged in to update a product');
      
      // Upload new image if provided
      let imageUrl = selectedProduct?.image_url;
      if (data.image instanceof File) {
        const fileName = `${user.id}/${Date.now()}-${data.image.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product_images')
          .upload(fileName, data.image);
          
        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          throw new Error('Failed to upload image');
        }
        
        // Get the public URL of the uploaded image
        const { data: urlData } = supabase.storage.from('product_images').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
      
      // Update product in database
      const { data: product, error } = await supabase
        .from('products')
        .update({
          name: data.name,
          description: data.description,
          price: data.price,
          stock: data.stock,
          category_id: data.category_id,
          image_url: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating product:', error);
        throw new Error('Failed to update product');
      }
      
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsEditProductOpen(false);
      editForm.reset();
      setImagePreview(null);
      setSelectedProduct(null);
      
      toast.success('Product updated successfully', {
        description: "Your product has been updated in your inventory."
      });
    },
    onError: (error) => {
      toast.error('Failed to update product', {
        description: error.message
      });
    }
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
        
      if (error) {
        console.error('Error deleting product:', error);
        throw new Error('Failed to delete product');
      }
      
      return productId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      toast.success('Product deleted successfully', {
        description: "Your product has been removed from your inventory."
      });
    },
    onError: (error) => {
      toast.error('Failed to delete product', {
        description: error.message
      });
    }
  });

  const handleAddProduct = (data: ProductFormValues) => {
    addProductMutation.mutate(data);
  };

  const handleUpdateProduct = (data: ProductFormValues) => {
    if (selectedProduct) {
      updateProductMutation.mutate({ ...data, id: selectedProduct.id });
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setIsEditProductOpen(true);
  };
  
  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-bold">${totalSales.toFixed(2)}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Based on actual orders</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{totalProducts}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Package className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{totalProducts} active products</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{totalOrders}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Customer orders received</p>
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
                {isLoadingProducts ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center p-8 border rounded-md">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-lg font-semibold">No products yet</p>
                    <p className="text-muted-foreground mb-4">Add your first product to start selling</p>
                    <Button onClick={() => setIsAddProductOpen(true)}>Add Product</Button>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[150px]">Product</TableHead>
                          <TableHead className="hidden sm:table-cell">Price</TableHead>
                          <TableHead className="hidden sm:table-cell">Stock</TableHead>
                          <TableHead className="hidden md:table-cell">Category</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id} className="cursor-pointer" onClick={() => handleProductClick(product.id)}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {product.image_url ? (
                                  <img 
                                    src={product.image_url} 
                                    alt={product.name} 
                                    className="w-10 h-10 object-cover rounded-md"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-muted flex items-center justify-center rounded-md">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                                <span className="line-clamp-2">{product.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">${product.price.toFixed(2)}</TableCell>
                            <TableCell className="hidden sm:table-cell">{product.stock} units</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {categories.find(c => c.id === product.category_id)?.name || 'Uncategorized'}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                <Button variant="outline" size="sm" onClick={() => handleEditClick(product)}>Edit</Button>
                                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700" 
                                  onClick={() => handleDeleteProduct(product.id)}>Delete</Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              {products.length > 0 && (
                <CardFooter>
                  <Button variant="outline" className="w-full">Load More</Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="orders">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Customer Orders</h3>
                <OrdersList orders={sellerOrders} isLoading={isLoadingOrders} />
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter product description" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
              
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="image"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Product Image</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <Input 
                          type="file" 
                          accept="image/*"
                          className="cursor-pointer"
                          onChange={(e) => handleImageChange(e, 'add')}
                          {...fieldProps} 
                        />
                        {imagePreview && (
                          <div className="mt-2 relative w-full h-40 rounded-md overflow-hidden">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {!imagePreview && (
                          <div className="mt-2 border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center text-gray-500">
                            <Upload className="h-8 w-8 mb-2" />
                            <p>No image selected</p>
                            <p className="text-xs">Upload a product image (JPEG, PNG, GIF)</p>
                          </div>
                        )}
                      </div>
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
                <Button 
                  type="submit"
                  disabled={addProductMutation.isPending}
                >
                  {addProductMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : 'Add Product'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update your product information.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateProduct)} className="space-y-4">
              <FormField
                control={editForm.control}
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
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter product description" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
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
                  control={editForm.control}
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
              </div>
              
              <FormField
                control={editForm.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="image"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Product Image</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <Input 
                          type="file" 
                          accept="image/*"
                          className="cursor-pointer"
                          onChange={(e) => handleImageChange(e, 'edit')}
                          {...fieldProps} 
                        />
                        {imagePreview && (
                          <div className="mt-2 relative w-full h-40 rounded-md overflow-hidden">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {!imagePreview && (
                          <div className="mt-2 border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center text-gray-500">
                            <Upload className="h-8 w-8 mb-2" />
                            <p>No image selected</p>
                            <p className="text-xs">Upload a product image (JPEG, PNG, GIF)</p>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditProductOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateProductMutation.isPending}
                >
                  {updateProductMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : 'Update Product'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerDashboard;
