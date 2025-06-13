
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy, Medal, Award, Crown } from 'lucide-react';

interface SellerRanking {
  seller_id: string;
  seller_name: string;
  total_orders: number;
  total_revenue: number;
  total_items_sold: number;
}

interface BuyerRanking {
  buyer_id: string;
  buyer_name: string;
  total_orders: number;
  total_spent: number;
  total_items_bought: number;
}

interface ProductRanking {
  product_id: string;
  product_name: string;
  category_name: string;
  times_sold: number;
  total_quantity_sold: number;
  total_revenue: number;
}

interface CategoryRanking {
  category_id: string;
  category_name: string;
  total_products: number;
  times_sold: number;
  total_quantity_sold: number;
  total_revenue: number;
}

interface RankingsDisplayProps {
  sellerRankings: SellerRanking[];
  buyerRankings: BuyerRanking[];
  productRankings: ProductRanking[];
  categoryRankings: CategoryRanking[];
  isLoading: boolean;
}

const RankingsDisplay = ({ 
  sellerRankings, 
  buyerRankings, 
  productRankings, 
  categoryRankings, 
  isLoading 
}: RankingsDisplayProps) => {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <Award className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRankBadgeVariant = (index: number) => {
    switch (index) {
      case 0:
        return 'default';
      case 1:
        return 'secondary';
      case 2:
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Sellers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Top Sellers by Revenue
          </CardTitle>
          <CardDescription>Highest earning sellers on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sellerRankings.slice(0, 5).map((seller, index) => (
              <div key={seller.seller_id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Badge variant={getRankBadgeVariant(index)} className="flex items-center gap-1">
                    {getRankIcon(index)}
                    #{index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">{seller.seller_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {seller.total_orders} orders • {seller.total_items_sold} items sold
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">${seller.total_revenue?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Buyers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Medal className="h-5 w-5 text-primary" />
            Top Buyers by Spending
          </CardTitle>
          <CardDescription>Customers with highest total spending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {buyerRankings.slice(0, 5).map((buyer, index) => (
              <div key={buyer.buyer_id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Badge variant={getRankBadgeVariant(index)} className="flex items-center gap-1">
                    {getRankIcon(index)}
                    #{index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">{buyer.buyer_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {buyer.total_orders} orders • {buyer.total_items_bought} items
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">${buyer.total_spent?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Best Selling Products
          </CardTitle>
          <CardDescription>Products with highest sales revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {productRankings.slice(0, 5).map((product, index) => (
              <div key={product.product_id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Badge variant={getRankBadgeVariant(index)} className="flex items-center gap-1">
                    {getRankIcon(index)}
                    #{index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">{product.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.category_name} • {product.total_quantity_sold || 0} sold
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-purple-600">${product.total_revenue?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Top Categories by Sales
          </CardTitle>
          <CardDescription>Most popular product categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryRankings.slice(0, 5).map((category, index) => (
              <div key={category.category_id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Badge variant={getRankBadgeVariant(index)} className="flex items-center gap-1">
                    {getRankIcon(index)}
                    #{index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">{category.category_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {category.total_products || 0} products • {category.total_quantity_sold || 0} sold
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-orange-600">${category.total_revenue?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RankingsDisplay;
