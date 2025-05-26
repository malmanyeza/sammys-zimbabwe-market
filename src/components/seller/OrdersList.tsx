import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Package, Truck } from "lucide-react";
import { formatRelative } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  product_name: string;
  product_image: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  buyer_name: string;
  buyer_address: string;
  buyer_city: string;
  buyer_state: string;
  buyer_zip: string;
  buyer_country: string;
  order_items: OrderItem[];
}

interface OrdersListProps {
  orders: Order[];
  isLoading: boolean;
}

const OrdersList = ({ orders, isLoading }: OrdersListProps) => {
  const queryClient = useQueryClient();

  const shipOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'shipped' })
        .eq('id', orderId);
        
      if (error) {
        console.error('Error updating order status:', error);
        throw new Error('Failed to ship order');
      }
      
      return orderId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerOrders'] });
      toast.success('Order marked as shipped');
    },
    onError: (error) => {
      toast.error('Failed to ship order', {
        description: error.message
      });
    }
  });

  const handleShipOrder = (orderId: string) => {
    shipOrderMutation.mutate(orderId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
        <p className="text-lg font-semibold">No orders yet</p>
        <p className="text-muted-foreground">Orders will appear here when customers make purchases</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Shipping Address</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  #{order.id.substring(0, 8)}
                </TableCell>
                <TableCell>
                  {formatRelative(new Date(order.created_at), new Date())}
                </TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-sm truncate max-w-[200px]">
                      {order.buyer_address && order.buyer_city && order.buyer_state 
                        ? `${order.buyer_address}, ${order.buyer_city}, ${order.buyer_state}` 
                        : 'Address not available'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm">View</Button>
                    </SheetTrigger>
                    <SheetContent className="overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Order Details</SheetTitle>
                      </SheetHeader>
                      
                      <div className="space-y-6 mt-6">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Order #{order.id.substring(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            Placed on {new Date(order.created_at).toLocaleDateString()}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                            {order.status === 'pending' && (
                              <Button 
                                size="sm" 
                                onClick={() => handleShipOrder(order.id)}
                                disabled={shipOrderMutation.isPending}
                                className="ml-2"
                              >
                                {shipOrderMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                    Shipping...
                                  </>
                                ) : (
                                  <>
                                    <Truck className="mr-1 h-3 w-3" />
                                    Mark as Shipped
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-2">Items</h4>
                          <div className="space-y-3">
                            {order.order_items.map((item) => (
                              <div key={item.id} className="flex gap-3">
                                <div className="h-16 w-16 rounded overflow-hidden bg-muted flex-shrink-0">
                                  <img 
                                    src={item.product_image || '/placeholder.svg'} 
                                    alt={item.product_name} 
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{item.product_name}</p>
                                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                                    <p>Qty: {item.quantity}</p>
                                    <p>${item.price.toFixed(2)} each</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="border-t mt-3 pt-3 flex justify-between font-medium">
                            <p>Total</p>
                            <p>${order.total.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-2">Shipping Address</h4>
                          <div className="bg-muted/50 p-3 rounded-md text-sm">
                            <p className="font-medium">{order.buyer_name}</p>
                            <p>{order.buyer_address}</p>
                            <p>{order.buyer_city}, {order.buyer_state} {order.buyer_zip}</p>
                            <p>{order.buyer_country}</p>
                          </div>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4 p-4">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-medium">#{order.id.substring(0, 8)}</h3>
                <p className="text-sm text-gray-500">
                  {formatRelative(new Date(order.created_at), new Date())}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total:</span>
                <span className="font-medium">${order.total.toFixed(2)}</span>
              </div>
              
              {/* Show product names on mobile */}
              {order.order_items && order.order_items.length > 0 && (
                <div>
                  <span className="text-sm text-gray-600">Products:</span>
                  <div className="mt-1">
                    {order.order_items.map((item, index) => (
                      <div key={item.id} className="text-sm">
                        {item.product_name} (x{item.quantity})
                        {index < order.order_items.length - 1 && ', '}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="truncate">
                  {order.buyer_city || 'Address not available'}
                </span>
              </div>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">View Details</Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Order Details</SheetTitle>
                  </SheetHeader>
                  
                  <div className="space-y-6 mt-6">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Order #{order.id.substring(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        {order.status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleShipOrder(order.id)}
                            disabled={shipOrderMutation.isPending}
                            className="ml-2"
                          >
                            {shipOrderMutation.isPending ? (
                              <>
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                Shipping...
                              </>
                            ) : (
                              <>
                                <Truck className="mr-1 h-3 w-3" />
                                Mark as Shipped
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Items</h4>
                      <div className="space-y-3">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex gap-3">
                            <div className="h-16 w-16 rounded overflow-hidden bg-muted flex-shrink-0">
                              <img 
                                src={item.product_image || '/placeholder.svg'} 
                                alt={item.product_name} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{item.product_name}</p>
                              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                                <p>Qty: {item.quantity}</p>
                                <p>${item.price.toFixed(2)} each</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t mt-3 pt-3 flex justify-between font-medium">
                        <p>Total</p>
                        <p>${order.total.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Shipping Address</h4>
                      <div className="bg-muted/50 p-3 rounded-md text-sm">
                        <p className="font-medium">{order.buyer_name}</p>
                        <p>{order.buyer_address}</p>
                        <p>{order.buyer_city}, {order.buyer_state} {order.buyer_zip}</p>
                        <p>{order.buyer_country}</p>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersList;
