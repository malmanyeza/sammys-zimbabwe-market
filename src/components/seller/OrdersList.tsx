
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
import { Loader2, MapPin, Package } from "lucide-react";
import { formatRelative } from 'date-fns';

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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="hidden sm:table-cell">Status</TableHead>
            <TableHead className="hidden lg:table-cell">Shipping Address</TableHead>
            <TableHead className="text-right">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                #{order.id.substring(0, 8)}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {formatRelative(new Date(order.created_at), new Date())}
              </TableCell>
              <TableCell>${order.total.toFixed(2)}</TableCell>
              <TableCell className="hidden sm:table-cell">
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
              <TableCell className="hidden lg:table-cell">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm truncate max-w-[200px]">
                    {order.buyer_city}, {order.buyer_state}
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
                        <div className="mt-2">
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
  );
};

export default OrdersList;
