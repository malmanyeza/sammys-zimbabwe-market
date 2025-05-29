
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Package, Clock, Truck, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReviewForm from '@/components/reviews/ReviewForm';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  } | null;
}

interface PurchaseItemProps {
  orderItem: OrderItem;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'processing':
      return <Package className="h-4 w-4" />;
    case 'shipped':
      return <Truck className="h-4 w-4" />;
    case 'delivered':
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-gray-100 text-gray-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'shipped':
      return 'bg-green-100 text-green-800';
    case 'delivered':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const PurchaseItem: React.FC<PurchaseItemProps> = ({ orderItem }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Check if user has already reviewed this product for this order
  const { data: existingReview } = useQuery({
    queryKey: ['productReview', orderItem.order_id, orderItem.product_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('id')
        .eq('order_id', orderItem.order_id)
        .eq('product_id', orderItem.product_id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking existing review:', error);
      }

      return data;
    },
  });

  const canReview = orderItem.status === 'shipped' && !existingReview;
  const showShippedNotification = orderItem.status === 'shipped' && orderItem.shipped_at;

  // Safe access to order creation date
  const orderCreatedAt = orderItem.orders?.created_at;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-shrink-0">
            <img
              src={orderItem.products.image_url || '/placeholder.svg'}
              alt={orderItem.products.name}
              className="w-24 h-24 object-cover rounded-md"
            />
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{orderItem.products.name}</h3>
                {orderCreatedAt && (
                  <p className="text-sm text-muted-foreground">
                    Ordered {formatDistanceToNow(new Date(orderCreatedAt))} ago
                  </p>
                )}
                <p className="text-sm">
                  Quantity: {orderItem.quantity} × ${orderItem.price.toFixed(2)}
                </p>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-lg">
                  ${(orderItem.quantity * orderItem.price).toFixed(2)}
                </p>
                <Badge className={`${getStatusColor(orderItem.status)} flex items-center gap-1 mt-2`}>
                  {getStatusIcon(orderItem.status)}
                  {orderItem.status.charAt(0).toUpperCase() + orderItem.status.slice(1)}
                </Badge>
              </div>
            </div>

            {showShippedNotification && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-800">
                    Great news! Your item has been shipped {formatDistanceToNow(new Date(orderItem.shipped_at!))} ago.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {canReview && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReviewForm(true)}
                  className="flex items-center gap-2"
                >
                  <Star className="h-4 w-4" />
                  Write Review
                </Button>
              )}
              
              {existingReview && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Review Submitted
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {showReviewForm && (
        <ReviewForm
          orderId={orderItem.order_id}
          productId={orderItem.product_id}
          productName={orderItem.products.name}
          sellerId={orderItem.products.seller_id}
          onReviewSubmitted={() => setShowReviewForm(false)}
        />
      )}
    </Card>
  );
};

export default PurchaseItem;
